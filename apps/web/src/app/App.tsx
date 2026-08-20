import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import mehmoodPortrait from "../assets/mehmood.jpeg";
import "../App.css";
import "../components/ThemeToggle.css";
import { ThemeToggle } from "../components/ThemeToggle";
import { ProjectStory } from "../components/ProjectStory";
import { ApplicationForm } from "../features/applications/components/ApplicationForm";
import { ApplicationsWorkspace } from "../features/applications/components/ApplicationsWorkspace";
import { Journey } from "../features/applications/components/Journey";
import { AuthContext } from "../features/auth/AuthContext";
import { PasswordGateway } from "../features/auth/PasswordGateway";
import { enterDemo, getSession, login, logout, type Session } from "../features/auth/api/auth";

function App() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const sessionChangedDuringRestore = useRef(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    void getSession()
      .then((nextSession) => {
        if (!sessionChangedDuringRestore.current) setSession(nextSession);
      })
      .catch(() => {
        if (!sessionChangedDuringRestore.current) setSession(null);
      });
  }, []);

  useEffect(() => {
    if (!successMessage) return undefined;

    const timeout = window.setTimeout(() => setSuccessMessage(null), 5_000);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  async function establishSession(action: () => Promise<Session>): Promise<void> {
    sessionChangedDuringRestore.current = true;
    const nextSession = await action();
    await queryClient.removeQueries({ queryKey: ["applications"] });
    setSession(nextSession);
  }

  async function handleLogout(): Promise<void> {
    sessionChangedDuringRestore.current = true;
    await logout();
    setIsFormOpen(false);
    queryClient.removeQueries({ queryKey: ["applications"] });
    setSession(null);
  }

  function handleApplicationCreated(message: string): void {
    setSuccessMessage(message);
  }

  if (!session) {
    return (
      <>
        <ThemeToggle variant="gateway" />
        <PasswordGateway onLogin={(password) => establishSession(() => login(password))} onExploreDemo={() => establishSession(enterDemo)} />
      </>
    );
  }

  const isViewer = session.accessMode === "viewer";

  return (
    <AuthContext value={{ accessMode: session.accessMode, logout: handleLogout }}>
      <main className="app">
        <header className="hero">
          <ThemeToggle />
          <div className="hero-people-moment">
            <span className="hero-speech hero-speech-hello" aria-hidden="true">👋 Hey there</span>
            <span className="hero-speech hero-speech-help" aria-hidden="true">🤝 Happy to help</span>
            <span className="hero-speech hero-speech-coffee" aria-hidden="true">☕ Coffee chat?</span>
            <div className="hero-friends" aria-hidden="true">
              <span>🙂</span>
              <span>😄</span>
              <span>🙌</span>
            </div>
          </div>
          <div className="hero-content">
            <span className="hero-eyebrow">JOB SEARCH · STOCKHOLM</span>
            <h1>Finding the right next chapter.</h1>
            <p>Looking for good people, meaningful work, and a place where I can learn, contribute, and have a few laughs while building great things.</p>
            <a className="hero-inline-case-study" href="/case-study">How I built Job Scout Hub <span aria-hidden="true">→</span></a>
          </div>
          <div className="hero-actions">
            <div className="hero-account-actions">
              <div className="hero-profile">
                <div className="hero-portrait-card">
                  <img className="hero-portrait" src={mehmoodPortrait} alt="Mehmood Ul Haq" />
                  <span className="hero-portrait-copy">
                    <strong>Mehmood</strong>
                    <small>People-first engineer</small>
                  </span>
                </div>
                <div className="hero-contact-details" aria-label="Mehmood's contact details">
                  <a href="https://www.linkedin.com/in/mehmood-ul-haq/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
                  <a href="tel:+46764388438">+46 76 438 84 38</a>
                </div>
              </div>
              <div className="hero-account-footer">
                {isViewer && <span className="demo-indicator">Viewing sample data</span>}
                {!isViewer && <button type="button" className="new-application-button" onClick={() => setIsFormOpen(true)}>Add application</button>}
                <button type="button" className="logout-button" onClick={() => void handleLogout()}>Log out</button>
              </div>
            </div>
          </div>
        </header>
        <ProjectStory />
        {isFormOpen && !isViewer && <ApplicationForm onClose={() => setIsFormOpen(false)} onSuccess={handleApplicationCreated} />}
        <Journey />
        <ApplicationsWorkspace />
        {successMessage && (
          <div className="success-toast" role="status" aria-live="polite">
            <span aria-hidden="true">✓</span>
            <p>{successMessage}</p>
            <button type="button" onClick={() => setSuccessMessage(null)} aria-label="Dismiss success message">×</button>
          </div>
        )}
      </main>
    </AuthContext>
  );
}

export default App;
