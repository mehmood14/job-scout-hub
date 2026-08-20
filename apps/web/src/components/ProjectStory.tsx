export function ProjectStory() {
  return (
    <section className="project-story" aria-labelledby="project-story-title">
      <div className="story-intro">
        <span className="hero-eyebrow">THE STORY</span>
        <h2 id="project-story-title">This job search is different.</h2>
        <p>
          I’m already employed, so this isn’t about applying everywhere. It’s about stepping outside my comfort bubble and finding a place that genuinely feels worth building with.
        </p>
        <p>
          When applications, recruiter conversations, follow-ups, salary expectations, and browser tabs started piling up, I thought: <q>Okay… I need a dashboard for this.</q>
        </p>
      </div>

      <div className="story-principle">
        <p className="story-label">Core product principle</p>
        <blockquote>
          I’m not tracking how many jobs I can apply to. I’m figuring out where I actually want to go next.
        </blockquote>
        <p>
          The company, product, and engineering problems matter—but so do the people, culture, growth opportunities, and how the team works together.
        </p>
      </div>

      <div className="story-values" aria-label="What matters in the next chapter">
        <div><strong>People</strong><span>Colleagues to collaborate with, learn from, and enjoy building alongside.</span></div>
        <div><strong>Craft</strong><span>Products and engineering problems that are genuinely interesting.</span></div>
        <div><strong>Growth</strong><span>A new chapter with the right challenge, culture, and room to grow.</span></div>
      </div>
    </section>
  );
}
