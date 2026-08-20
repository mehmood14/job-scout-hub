import { useState, type FormEvent } from "react";

type PasswordGatewayProps = {
  onLogin: (password: string) => Promise<void>;
  onExploreDemo: () => Promise<void>;
};

export function PasswordGateway({ onLogin, onExploreDemo }: PasswordGatewayProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onLogin(password);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to unlock Job Scout Hub.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDemo(): Promise<void> {
    setError(null);
    setIsSubmitting(true);

    try {
      await onExploreDemo();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to start demo mode.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="gateway-page">
      <div className="gateway-glow gateway-glow-one" aria-hidden="true" />
      <div className="gateway-glow gateway-glow-two" aria-hidden="true" />
      <div className="gateway-float gateway-float-interview" aria-hidden="true">
        <span className="gateway-float-icon">👋</span>
        <div>
          <strong>Always happy to help</strong>
          <span>Good people make work better.</span>
        </div>
      </div>
      <div className="gateway-float gateway-float-follow-up" aria-hidden="true">
        <span className="gateway-float-icon">☕</span>
        <div>
          <strong>Coffee &amp; good ideas</strong>
          <span>The best work starts with a chat.</span>
        </div>
      </div>
      <div className="gateway-float gateway-float-match" aria-hidden="true">
        <span className="gateway-float-icon">🙌</span>
        <div>
          <strong>Team win!</strong>
          <span>Better together, always.</span>
        </div>
      </div>
      <section className="gateway-card" aria-labelledby="gateway-title">
        <div className="gateway-brand" aria-label="Job Scout Hub">
          <span className="gateway-mark" aria-hidden="true">JS</span>
          <span>Job Scout Hub</span>
        </div>
        <span className="hero-eyebrow">JOB SEARCH · STOCKHOLM</span>
        <h1 id="gateway-title">A thoughtful search deserves a thoughtful workspace.</h1>
        <p className="gateway-intro">
          Keep your search intentional, your conversations organised, and your next chapter in focus.
        </p>

        <form className="gateway-form" onSubmit={handleSubmit}>
          <label htmlFor="owner-password">Private owner access</label>
          <div className="gateway-password-field">
            <input
              id="owner-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
            <span aria-hidden="true">✦</span>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? "Opening..." : "Enter workspace"}
          </button>
        </form>

        <div className="gateway-divider"><span>or explore</span></div>
        <div className="gateway-demo">
          <div>
            <strong>Portfolio demo</strong>
            <p>Browse realistic sample data, timelines, themes, and filters.</p>
          </div>
          <button className="secondary-button" type="button" onClick={handleDemo} disabled={isSubmitting}>
            Explore demo <span aria-hidden="true">→</span>
          </button>
        </div>
        <p className="gateway-note"><span aria-hidden="true">●</span> Demo mode is read-only. Private applications stay private.</p>
      </section>
    </main>
  );
}
