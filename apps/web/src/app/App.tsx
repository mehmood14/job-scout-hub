import { useEffect, useState } from "react";
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
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [loadingProgress, setLoadingProgress] = useState(8);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const progressInterval = window.setInterval(() => {
      setLoadingProgress((current) => {
        if (current >= 90) return current;
        return current < 68 ? current + 8 : current + 2;
      });
    }, 280);

    function completeSessionCheck(nextSession: Session | null): void {
      window.clearInterval(progressInterval);
      setLoadingProgress(100);
      window.setTimeout(() => {
        if (isActive) setSession(nextSession);
      }, 180);
    }

    void getSession()
      .then(completeSessionCheck)
      .catch(() => completeSessionCheck(null));

    return () => {
      isActive = false;
      window.clearInterval(progressInterval);
    };
  }, []);

  useEffect(() => {
    if (!successMessage) return undefined;

    const timeout = window.setTimeout(() => setSuccessMessage(null), 5_000);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  async function establishSession(action: () => Promise<Session>): Promise<void> {
    const nextSession = await action();
    await queryClient.removeQueries({ queryKey: ["applications"] });
    setSession(nextSession);
  }

  async function handleLogout(): Promise<void> {
    await logout();
    setIsFormOpen(false);
    queryClient.removeQueries({ queryKey: ["applications"] });
    setSession(null);
  }

  function handleApplicationCreated(message: string): void {
    setSuccessMessage(message);
  }

  if (session === undefined) {
    return (
      <main className="gateway-page gateway-page-loading">
        <ThemeToggle variant="gateway" />
        <div className="loading-float loading-float-one" aria-hidden="true">
          <span>✨</span>
          <small>Almost there</small>
        </div>
        <div className="loading-float loading-float-two" aria-hidden="true">
          <span>☕</span>
          <small>Fresh ideas brewing</small>
        </div>
        <div className="loading-float loading-float-three" aria-hidden="true">
          <span>🙌</span>
          <small>Good things loading</small>
        </div>
        <section className="loading-state" role="status" aria-live="polite" aria-label="Preparing Job Scout Hub">
          <span className="loading-state-mark" aria-hidden="true">JS</span>
          <span className="loading-state-spinner" aria-hidden="true" />
          <h1>Waking up the demo crew…</h1>
          <p>While they grab coffee, pick a theme from the Appearance panel.</p>
          <div className="loading-state-progress" role="progressbar" aria-label="Preparing workspace" aria-valuemin={0} aria-valuemax={100} aria-valuenow={loadingProgress}>
            <span style={{ width: `${loadingProgress}%` }} />
          </div>
          <p className="loading-state-duration">Preparing workspace · {loadingProgress}%</p>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <>
        <ThemeToggle variant="gateway" />
        <PasswordGateway onLogin={(password) => establishSession(() => login(password))} onExploreDemo={() => establishSession(enterDemo)} />
      </>
    );
  }

  const authenticatedSession = session as Session;
  const isViewer = authenticatedSession.accessMode === "viewer";

  return (
    <AuthContext value={{ accessMode: authenticatedSession.accessMode, logout: handleLogout }}>
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
