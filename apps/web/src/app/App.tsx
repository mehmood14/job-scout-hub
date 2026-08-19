import { useState } from "react";

import "../App.css";
import "../components/ThemeToggle.css";
import { ThemeToggle } from "../components/ThemeToggle";
import { ApplicationForm } from "../features/applications/components/ApplicationForm";
import { ApplicationsWorkspace } from "../features/applications/components/ApplicationsWorkspace";
import { Journey } from "../features/applications/components/Journey";

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <main className="app">
      <header className="hero">
        <ThemeToggle />

        <div className="hero-content">
          <span className="hero-eyebrow">
            JOB SEARCH · STOCKHOLM
          </span>

          <h1>Finding my next adventure.</h1>

          <p>
            Not looking for just another job.
            <br />
            Looking for the right people, product, and place to grow.
          </p>
        </div>

        <button
          type="button"
          className="new-application-button"
          onClick={() => setIsFormOpen((current) => !current)}
        >
          {isFormOpen ? "Close" : "New application"}
        </button>
      </header>

      {isFormOpen && <ApplicationForm />}

      <Journey />

      <ApplicationsWorkspace />
    </main>
  );
}

export default App;