import "./CaseStudyPage.css";
import "./ThemeToggle.css";

import { ThemeToggle } from "./ThemeToggle";

const liveDemoUrl = "https://job-scout-hub-web.vercel.app/";
const repositoryUrl = "https://github.com/mehmood14/job-scout-hub";
const linkedInUrl = "https://www.linkedin.com/in/mehmood-ul-haq/";
const email = "mehmoodulhaq14@gmail.com";

const productDecisions = [
  ["A journey, not a funnel", "Each company can have a different process, so the timeline is reorderable, editable, and lets steps be skipped or restored."],
  ["Safe to explore", "Demo mode seeds realistic sample data and stays read-only, while owner applications remain behind password-protected sessions."],
  ["Context over volume", "The dashboard centres the company, people, role, salary expectations, and next step—not just an application count."],
];

const buildLayers = [
  ["Experience", "React, TypeScript, Vite, TanStack Query, accessible modals, responsive CSS, and a five-theme design system."],
  ["Application API", "Express routes validate every write with Zod and enforce owner versus read-only demo access on the server."],
  ["Data", "PostgreSQL and Prisma model applications, per-company timeline order, skipped stages, and timestamped recruitment events."],
  ["Delivery", "pnpm workspace packages keep shared types aligned. Vercel hosts the web app; Render runs the API; Neon hosts Postgres."],
];

export function CaseStudyPage() {
  return (
    <main className="case-study">
      <ThemeToggle variant="gateway" />
      <header className="case-study-hero">
        <a className="case-study-back" href="/">← Back to Job Scout Hub</a>
        <p className="case-study-kicker">Full-stack software engineer · 5+ years · Stockholm</p>
        <h1>A job search should help you choose a better next chapter.</h1>
        <p className="case-study-lead">Job Scout Hub is a private, intentional workspace for turning scattered applications and interview conversations into a clearer decision.</p>
        <p className="case-study-credentials">Built by Mehmood Ul Haq—an engineer focused on frontend architecture, product delivery, and the API foundations that make polished experiences reliable.</p>
        <div className="case-study-actions" aria-label="Project links">
          <a className="case-study-primary" href={liveDemoUrl}>Explore the live demo <span aria-hidden="true">→</span></a>
          <a className="case-study-secondary" href={repositoryUrl} target="_blank" rel="noreferrer">View source <span aria-hidden="true">↗</span></a>
        </div>
      </header>

      <section className="case-study-section case-study-intro" aria-labelledby="case-study-story">
        <div>
          <p className="case-study-label">The problem</p>
          <h2 id="case-study-story">I was not trying to apply everywhere.</h2>
        </div>
        <div className="case-study-copy">
          <p>I built this while selectively exploring roles that genuinely interested me. Recruiter conversations, follow-ups, salary expectations, and browser tabs quickly became difficult to reason about.</p>
          <p>The product question became: <strong>where do I actually want to go next?</strong> The answer needs more than a status badge—it needs the company, the people, the work, and the full recruitment journey in one place.</p>
        </div>
      </section>

      <section className="case-study-section" aria-labelledby="case-study-decisions">
        <div className="case-study-section-heading">
          <p className="case-study-label">Product decisions</p>
          <h2 id="case-study-decisions">Designed for thoughtful decisions, not busywork.</h2>
        </div>
        <div className="case-study-card-grid">
          {productDecisions.map(([title, description], index) => (
            <article className="case-study-card" key={title}>
              <span className="case-study-card-number">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="case-study-section case-study-showcase" aria-labelledby="case-study-experience">
        <div className="case-study-section-heading">
          <p className="case-study-label">The experience</p>
          <h2 id="case-study-experience">Small details that make a complex process feel calm.</h2>
        </div>
        <div className="case-study-preview-grid">
          <article className="case-study-preview case-study-preview-wide">
            <div className="case-study-preview-header"><span>Applications in focus</span><span className="case-study-pill">12 applications</span></div>
            <div className="case-study-table-row"><strong>Backlight</strong><span>Technical Interview</span><span className="case-study-status">Finished — waiting for response</span></div>
            <div className="case-study-table-row"><strong>Quartr</strong><span>Live coding</span><span className="case-study-status upcoming">Upcoming · 24 Aug, 13:00</span></div>
            <p>Filters, recruiter context, application dates, status sorting, and pagination make the shortlist scannable.</p>
          </article>
          <article className="case-study-preview">
            <p className="case-study-preview-label">Recruitment timeline</p>
            <ol className="case-study-mini-timeline">
              <li className="complete"><strong>Applied</strong><span>16 Aug · 09:30</span></li>
              <li className="complete"><strong>Recruiter contacted</strong><span>17 Aug · 10:00</span></li>
              <li className="current"><strong>Technical interview <em>Current</em></strong><span>24 Aug · 13:00</span></li>
            </ol>
            <p>Every company can have a different process—timeline stages can be reordered, dated, skipped, or restored.</p>
          </article>
          <article className="case-study-preview">
            <p className="case-study-preview-label">Built for sharing</p>
            <div className="case-study-theme-swatch-row" aria-label="Five themes">
              <span>☀️</span><span>🌙</span><span>●</span><span>🌊</span><span>🔥</span>
            </div>
            <h3>Demo mode protects what is personal.</h3>
            <p>Visitors explore a realistic read-only workspace. Private application data is never returned to a demo session.</p>
          </article>
        </div>
      </section>

      <section className="case-study-section" aria-labelledby="case-study-architecture">
        <div className="case-study-section-heading">
          <p className="case-study-label">Engineering</p>
          <h2 id="case-study-architecture">A deliberately small full-stack system.</h2>
        </div>
        <div className="case-study-architecture" aria-label="Job Scout Hub architecture">
          {buildLayers.map(([layer, detail], index) => (
            <article className="case-study-architecture-layer" key={layer}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h3>{layer}</h3><p>{detail}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="case-study-section case-study-reflection" aria-labelledby="case-study-reflection">
        <div>
          <p className="case-study-label">What I would grow next</p>
          <h2 id="case-study-reflection">The useful next layer is insight, not more screens.</h2>
        </div>
        <ul>
          <li>Calendar-aware follow-up reminders and a clearer view of interview preparation.</li>
          <li>More decision support around company fit, team culture, and role priorities.</li>
          <li>Continued performance, accessibility, and test coverage improvements as the product grows.</li>
        </ul>
      </section>

      <footer className="case-study-footer">
        <div>
          <p className="case-study-label">Let’s build something useful</p>
          <h2>I’m a people-first full-stack engineer who enjoys turning complex work into a great experience.</h2>
        </div>
        <div className="case-study-contact-links">
          <a href={linkedInUrl} target="_blank" rel="noreferrer">LinkedIn ↗</a>
          <a href={`mailto:${email}`}>{email}</a>
        </div>
      </footer>
    </main>
  );
}
