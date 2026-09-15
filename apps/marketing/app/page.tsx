import { ScreenshotGallery } from "./screenshot-gallery";

const basePath = process.env.PAGES_BASE_PATH ?? "";

export default function MarketingHomePage() {
  return (
    <>
      <header className="site-shell site-header">
        <a className="brand" href="#top" aria-label="SlotSyncro home">
          <svg
            className="brand-mark"
            viewBox="0 0 64 64"
            aria-hidden="true"
            focusable="false"
          >
            <rect width="64" height="64" rx="18" fill="#1E6646" />
            <rect x="13" y="17" width="31" height="12" rx="6" fill="white" />
            <rect x="20" y="35" width="31" height="12" rx="6" fill="white" />
            <circle
              cx="46"
              cy="19"
              r="7"
              fill="#E97855"
              stroke="#1E6646"
              strokeWidth="4"
            />
          </svg>
          SlotSyncro
        </a>
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#product">Product</a>
          <a href="#roadmap">Roadmap</a>
          <a
            className="nav-github"
            href="https://github.com/TechAaroorian/slotsyncro"
          >
            GitHub ↗
          </a>
        </nav>
      </header>

      <main id="top" className="site-shell">
        <section className="hero" aria-labelledby="hero-title">
          <div>
            <div className="hero-labels">
              <p className="eyebrow">Public portfolio project</p>
              <span className="project-status">In progress</span>
            </div>
            <h1 id="hero-title">Find the time that works.</h1>
            <p className="hero-copy">
              SlotSyncro brings direct bookings and group availability polls into
              one thoughtful, timezone-aware scheduling experience.
            </p>
            <div className="actions">
              <a
                className="button button-primary"
                href="https://github.com/TechAaroorian/slotsyncro"
              >
                Explore the project
              </a>
              <a
                className="button"
                href="https://github.com/TechAaroorian/slotsyncro/blob/main/docs/roadmap.md"
              >
                Read the roadmap
              </a>
            </div>
          </div>

          <div className="schedule-card" aria-label="Example availability poll">
            <span className="card-label">Team planning poll</span>
            <h2>When should we meet?</h2>
            <div className="time-options">
              <div className="time-option selected">
                <span>Tuesday · 10:30</span>
                <span className="dot-group" aria-label="3 people available">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </span>
              </div>
              <div className="time-option">
                <span>Wednesday · 14:00</span>
                <span>2 available</span>
              </div>
              <div className="time-option">
                <span>Friday · 09:00</span>
                <span>1 available</span>
              </div>
            </div>
          </div>
        </section>

        <section id="product" className="section" aria-labelledby="product-title">
          <div className="section-heading">
            <p className="eyebrow">What it does</p>
            <h2 id="product-title">Two ways to get time on the calendar.</h2>
          </div>
          <div className="feature-grid">
            <article className="feature-card">
              <span className="feature-number">01</span>
              <h3>Share availability</h3>
              <p>
                Hosts define when they are available and offer booking links
                without the usual back-and-forth.
              </p>
            </article>
            <article className="feature-card">
              <span className="feature-number">02</span>
              <h3>Ask the group</h3>
              <p>
                Create a poll with practical time options and collect clear,
                identifiable responses from participants.
              </p>
            </article>
            <article className="feature-card">
              <span className="feature-number">03</span>
              <h3>Keep everyone oriented</h3>
              <p>
                Locale-safe navigation, timezone context, confirmation states,
                and email invitations make the journey easier to follow.
              </p>
            </article>
          </div>
        </section>

        <section className="section" aria-labelledby="preview-title">
          <div className="section-heading">
            <p className="eyebrow">Product preview</p>
            <h2 id="preview-title">From setup to a shared decision.</h2>
          </div>
          <ScreenshotGallery basePath={basePath} />
        </section>

        <section id="roadmap" className="section" aria-labelledby="roadmap-title">
          <div className="section-heading">
            <p className="eyebrow">Developed in public</p>
            <h2 id="roadmap-title">A working product with an honest roadmap.</h2>
          </div>
          <div className="roadmap-panel">
            <article className="status-card current">
              <span className="status">Current foundation</span>
              <h3>Booking, polling, authentication, and invitations.</h3>
              <p>
                The connected product shell is in place, backed by documented
                architecture, accessibility checks, and a Prisma migration baseline.
              </p>
            </article>
            <article className="status-card next">
              <span className="status">Now building · M2</span>
              <h3>Turn group agreement into one confirmed meeting.</h3>
              <p className="roadmap-copy">
                The next vertical slice adds poll lifecycle, participants,
                preferences, finalization, and a shared meeting model—with
                database integrity and concurrency tested from the start.
              </p>
            </article>
          </div>
        </section>

        <section className="section" aria-labelledby="principles-title">
          <div className="section-heading">
            <p className="eyebrow">How it is built</p>
            <h2 id="principles-title">Product learning and engineering discipline.</h2>
          </div>
          <ul className="principles">
            <li>Next.js and React in a Turborepo monorepo</li>
            <li>PostgreSQL modeled and migrated with Prisma</li>
            <li>Modular-monolith boundaries before microservices</li>
            <li>Accessibility and failure paths treated as product work</li>
          </ul>
        </section>
      </main>

      <footer className="site-shell site-footer">
        <div>
          <p className="footer-title">SlotSyncro</p>
          <p>Scheduling that finds common ground.</p>
        </div>
        <div>
          <p>Designed and developed in public by Janarthanan Soundhararajan.</p>
          <p>Source-visible portfolio project · All Rights Reserved · Not open source.</p>
        </div>
      </footer>
    </>
  );
}
