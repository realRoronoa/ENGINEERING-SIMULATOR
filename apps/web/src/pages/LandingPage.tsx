import React from 'react';
import { Navbar } from '../components/layout/Navbar.js';
import { Footer } from '../components/layout/Footer.js';
import { Container } from '../components/ui/Container.js';
import { Button } from '../components/ui/Button.js';
import { SectionHeading } from '../components/ui/SectionHeading.js';
import { MissionDemo } from '../features/mission-demo/MissionDemo.js';
import { EvidenceTimeline } from '../features/evidence/EvidenceTimeline.js';
import { ReviewerTable } from '../features/evidence/ReviewerTable.js';

export const LandingPage: React.FC = () => {
  return (
    <>
      <Navbar />

      <header className="hero" id="top">
        <Container>
          <div className="tl">MISSION 4412 · PAYMENTS-SERVICE · LIVE SESSION</div>
          <h1>
            The AI era made code cheap.
            <br />
            <span style={{ color: 'var(--muted)' }}>Engineering still isn't.</span>
          </h1>
          <p className="lead">
            Evaluate engineering judgment where it actually matters: investigation, debugging,
            verification, and ownership inside realistic codebases.
          </p>
          <div className="cta">
            <Button variant="primary" href="#pilot">
              REQUEST PILOT
            </Button>
            <Button href="#mission">EXPLORE THE MISSION</Button>
          </div>

          <MissionDemo />
        </Container>
      </header>

      {/* Section 01: Problem */}
      <section id="problem">
        <Container>
          <SectionHeading
            number="01"
            tag="The problem"
            title={
              <>
                AI can write the patch.
                <br />
                Can the engineer verify it?
              </>
            }
            lead="The final code is only one piece of evidence. Real engineering happens inside imperfect systems."
          />

          <div className="cols">
            <div>
              <div className="tl">The old signal</div>
              <ul>
                <li>Algorithm recall</li>
                <li>Isolated implementation</li>
                <li>Final output only</li>
                <li>Greenfield, no context</li>
              </ul>
            </div>
            <div>
              <div className="tl" style={{ color: 'var(--ok)' }}>
                The signal that remains
              </div>
              <ul>
                <li>Unfamiliar systems</li>
                <li>Debugging under ambiguity</li>
                <li>AI assistance, challenged</li>
                <li>Verification and ownership</li>
              </ul>
            </div>
          </div>

          <div className="noise" aria-hidden="true">
            [ERR] retry.ts:6 attempt counter reset · 14:02:11 POST /charge 500
            <br />
            [WARN] pool exhausted 18/20 · ai-suggest: raise maxAttempts → 10
            <br />
            [ERR] ECONNRESET db-primary · 14:02:12 POST /charge 500 · UnhandledPromiseRejection
            <br />
            [WARN] retry storm detected · 213 req/s · idempotency-key reused
          </div>
        </Container>
      </section>

      {/* Section 02: Evidence */}
      <section id="evidence">
        <Container>
          <SectionHeading
            number="02"
            tag="Evidence"
            title="Test the investigation, not just the answer."
            lead="Select an event. Each one is meaningful evidence of judgment, not a keystroke log."
          />

          <EvidenceTimeline />
        </Container>
      </section>

      {/* Section 03: Reviewer View */}
      <section id="manager">
        <Container>
          <SectionHeading
            number="03"
            tag="Reviewer view"
            title="Forensic evidence, not HR analytics."
          />

          <ReviewerTable />
        </Container>
      </section>

      {/* Section 04: Method */}
      <section id="how">
        <Container>
          <SectionHeading
            number="04"
            tag="Method"
            title="Noise → investigation → evidence → signal."
          />

          <div className="steps">
            <div className="step">
              <h3>
                <i>01</i>INVESTIGATE
              </h3>
              <p>Read the system. Understand the failure.</p>
            </div>
            <div className="step">
              <h3>
                <i>02</i>QUESTION
              </h3>
              <p>Use AI. Form hypotheses.</p>
            </div>
            <div className="step">
              <h3>
                <i>03</i>TEST
              </h3>
              <p>Challenge assumptions. Write tests.</p>
            </div>
            <div className="step">
              <h3>
                <i>04</i>DEBUG
              </h3>
              <p>Trace the real failure.</p>
            </div>
            <div className="step">
              <h3>
                <i>05</i>VERIFY
              </h3>
              <p>Run deterministic validation.</p>
            </div>
            <div className="step">
              <h3>
                <i>06</i>OWN
              </h3>
              <p>Explain the root cause. Stand behind the result.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Section 05: Trust Architecture */}
      <section id="trust">
        <Container>
          <SectionHeading
            number="05"
            tag="Trust architecture"
            title="Measure judgment where code meets reality."
          />

          <div className="arch">
            <div>
              <b>MISSION</b>versioned scenario
            </div>
            <div>
              <b>ISOLATED ENV</b>Firecracker microVM
            </div>
            <div>
              <b>REPOSITORY</b>real multi-file codebase
            </div>
            <div>
              <b>CONTROLLED AI</b>logged, scoped context
            </div>
            <div>
              <b>TESTS</b>deterministic validation
            </div>
            <div>
              <b>EVIDENCE</b>immutable event log
            </div>
            <div>
              <b>RESULT</b>verified signal
            </div>
          </div>

          <div className="spec">
            <p>
              <b>Isolated execution</b>Each session runs in its own container or microVM, destroyed
              on submit.
            </p>
            <p>
              <b>Network isolation</b>Egress denied by default. Only the AI gateway is reachable.
            </p>
            <p>
              <b>Immutable evidence</b>Append-only, hash-chained session events. Reviewers see what
              happened, unedited.
            </p>
          </div>
        </Container>
      </section>

      {/* Section 06: Pilot */}
      <section id="pilot">
        <Container>
          <div className="tl">Next</div>
          <h2>See an engineer solve a real incident.</h2>
          <p className="lead">Run a pilot with one mission and your own reviewers.</p>
          <div className="cta">
            <Button variant="primary" href="mailto:pilot@example.com">
              REQUEST PILOT
            </Button>
            <Button href="#evidence">VIEW EVIDENCE</Button>
          </div>
        </Container>
      </section>

      <Footer />
    </>
  );
};
