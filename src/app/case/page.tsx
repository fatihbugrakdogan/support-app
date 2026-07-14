import type { Metadata } from "next";
import Link from "next/link";
import { ArchitectureDiagram } from "@/components/ArchitectureDiagram";
import { TicketFlowDiagram } from "@/components/TicketFlowDiagram";

export const metadata: Metadata = {
  title: "Case Study Answers · NativeMinds AI Developer",
  description: "All seven sections, answered against a working, deployed system",
};

/* The full case-study response, rendered in the product it describes.
   Section 5 is not an essay; it is the app around this page. */

const REPO = "https://github.com/fatihbugrakdogan/support-backend";
const UMBRELLA = "https://github.com/fatihbugrakdogan/support-umbrella";

export default function CasePage() {
  return (
    <article className="mx-auto max-w-3xl">
      <header className="rise mb-10">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-violet">
          NativeMinds · AI Developer Case Study
        </p>
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
          Seven sections, answered against a working system
        </h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
          Section 5 asked for a deployed implementation. It is the application around
          this page. The other six sections are answered below, and wherever a claim can
          point at running code, committed evidence or a measured number, it does.
          Repositories:{" "}
          <a className="underline decoration-lime-deep underline-offset-2" href={UMBRELLA}>
            case-study umbrella
          </a>
          ,{" "}
          <a className="underline decoration-lime-deep underline-offset-2" href={REPO}>
            support-backend
          </a>
          ,{" "}
          <a
            className="underline decoration-lime-deep underline-offset-2"
            href="https://github.com/fatihbugrakdogan/support-app"
          >
            support-app
          </a>
          .
        </p>
      </header>

      <Section n={1} title="Current State Assessment and Problem Definition">
        <Q>Auditing the automation landscape in week one</Q>
        <P>
          Fragmented notes from five leads are symptoms. The audit turns them into an
          inventory with owners and runtime evidence, in three parallel passes:
        </P>
        <Ul
          items={[
            <>
              <B>Collect.</B> A 45-minute structured interview per lead: what runs, what
              it feeds, when it last broke, who gets called. Then automated discovery for
              what interviews miss: org-wide code search for schedulers and API clients,
              cloud consoles and workflow tools (cron, functions, n8n, Zapier),
              spreadsheet formulas that quietly became infrastructure, and the vendor
              dashboards that show which API keys are actually in use. Everything lands
              in one <B>automation registry</B> with a fixed row shape: name, owner,
              trigger, inputs, outputs, downstream consumers, last successful run,
              known failure modes, business criticality.
            </>,
            <>
              <B>Find dependencies, failures, redundancies.</B> Dependencies come from
              data lineage: for each automation, the tables and endpoints it reads and
              writes. Two jobs writing the same field is a conflict candidate; two teams
              pulling the same vendor API separately is duplication. Failures come from
              evidence rather than memory: thirty days of logs, HTTP error rates per
              vendor, and last-run timestamps. Anything with no logs at all is recorded
              as a finding in itself.
            </>,
            <>
              <B>Visualize.</B> A dependency graph generated from the registry
              (source, automation, destination; edges colored by 30-day failure rate) so
              the picture cannot drift from reality, plus one hand-drawn overview for the
              leadership conversation. This project keeps that habit: its diagrams are
              committed next to the code they describe.
            </>,
          ]}
        />
        <Q>Top five systemic issues I expect to find</Q>
        <Table
          head={["Issue", "Impact"]}
          rows={[
            ["Silent failures with no alerting, discovered by humans downstream", "Wrong numbers reach dashboards and decisions; trust in all reporting erodes"],
            ["Single-person ownership of scripts, sometimes a person who already left", "Unmaintainable black boxes; every change becomes a risk event"],
            ["Duplicated logic: the same vendor data pulled independently by several teams", "Teams argue over conflicting metrics; multiplied API cost and rate-limit pressure"],
            ["Unversioned production scripts edited in place", "No rollback, no changelog, no way to link a breakage to a change"],
            ["Vendor API contract drift that nobody owns", "Fields silently null out; gaps enter historical data and surface weeks late"],
          ]}
        />
        <Q>What to prioritize first, and why</Q>
        <P>
          <B>Observability on the revenue-touching flows, payment funnel first.</B> Not
          because it is the biggest problem but because it is the cheapest intervention
          with the highest trust yield. Adding run logging and alerting changes no
          business logic, so the risk is minimal; it immediately kills the
          silent-failure class where it costs real money; and it produces the failure
          data that turns every later prioritization from anecdote into evidence. The
          same instinct drove Section 5: make the system measurable before optimizing
          anything.
        </P>
      </Section>

      <Section n={2} title="Unified Automation Architecture">
        <Q>One hub connecting growth analytics, content ops and payment funnels</Q>
        <P>
          Point-to-point scripts are replaced by an event-driven hub: producers publish
          into a bus, typed workers consume, and every run reports to a registry.
        </P>
        <ArchitectureDiagram />
        <Ul
          items={[
            <>
              <B>Inputs, logic, outputs, hand-offs.</B> Growth: ad spend, store and
              product events joined into daily cohort tables; hand-off to marketing
              dashboards and budget alerts. Content ops: CMS item states plus engagement
              metrics; hand-off to the editorial queue and localization tasks. Payments:
              provider webhooks reconciled against store reports; hand-off to finance
              reconciliation and churn signals back into growth. Every cross-team
              hand-off is a versioned schema on the bus, never a shared spreadsheet, so
              a producer cannot break a consumer without a failing contract test telling
              them first.
            </>,
            <>
              <B>Authentication.</B> Machine-to-machine traffic uses OAuth2
              client-credentials with one service account per automation, so a leaked
              token has a one-job blast radius and an obvious owner. Inbound webhooks
              are verified by signature (store and payment providers all support this)
              and replay-protected with timestamps. Secrets live in a managed secret
              store with scheduled rotation, and access is logged per principal, which
              makes the quarterly audit a query instead of a hunt.
            </>,
            <>
              <B>Scheduling and monitoring at scale.</B> An orchestrator (Temporal or
              Airflow) owns every schedule so each job carries an owner, an SLA and a
              retry policy; nothing runs from a forgotten crontab. Monitoring alerts on
              absence as well as on errors: a job that silently did not run is treated
              exactly like a job that failed. Failed payloads park in dead-letter queues
              for replay instead of being lost.
            </>,
          ]}
        />
        <Q>Databases, storage, visualization, and why</Q>
        <Ul
          items={[
            <>
              <B>Columnar warehouse</B> (BigQuery or ClickHouse) for analytics: cheap
              scans over event history and SQL as the shared language between analysts
              and engineers.
            </>,
            <>
              <B>Document store</B> (MongoDB) for operational state. Section 5 runs on
              this pattern: tickets, analyses, drafts and events as append-only
              collections behind a repository interface, which let the project swap
              databases mid-build with zero service-layer changes.
            </>,
            <>
              <B>Object storage</B> for artifacts such as reports and model outputs;{" "}
              <B>Metabase</B> for business dashboards (SQL-first, self-hosted, no
              per-seat pricing trap) and <B>Grafana</B> for operational metrics.
            </>,
          ]}
        />
        <Q>Principles for versioning, documentation, reliability</Q>
        <P>
          Everything that changes behavior reaches production through version control
          and review, including prompts, model choices and thresholds: those are
          configuration with a changelog, not code edits made under pressure. Every
          automation ships with an owner, a runbook and a changelog. Consequential
          parameter changes require a short decision memo with evidence; this project
          froze three config versions and each carries a memo plus the committed
          evaluation runs behind it. Reliability is designed before launch: idempotent
          jobs, exponential-backoff retries, dead-letter queues, staged rollouts, and a
          degraded mode per system. In Section 5 an LLM outage loses no tickets; they
          queue for human review with the error on record.
        </P>
      </Section>

      <Section n={3} title="Intelligent Decision Layer">
        <Q>Chosen process: support ticket routing. Implemented, deployed, measured.</Q>
        <P>
          This section is not hypothetical; the decision layer is the application you
          are in. <B>Inputs</B>: raw ticket subject and body, any language.{" "}
          <B>Model purpose</B>: structured extraction of language, one of eight
          categories, priority, an agent-facing summary, and per-field confidence.{" "}
          <B>Output</B>: a typed JSON contract validated twice (provider-side schema and
          local Pydantic), plus a reply draft in the customer&apos;s language that is
          never sent automatically.
        </P>
        <Q>How predictions interact with automation logic</Q>
        <P>
          A single calibrated rule separates automation from human judgment:{" "}
          <Code>min(category_conf, priority_conf) &lt; threshold → manual review</Code>.
          The threshold comes from an automation-versus-accuracy sweep under a
          routed-cost objective that prices human review against graded error costs.
          The deployed extractor is a two-model cascade chosen from a 26-model benchmark
          and a 1,106-strategy simulation: a one-second budget model settles everything
          it is fully certain of and escalates the rest to the intelligence-index
          leader. Human corrections in the review UI write back as events, so the
          approval loop doubles as future evaluation data.
        </P>
        <Q>Validation, bias detection, fallback</Q>
        <Ul
          items={[
            <>
              <B>Accuracy.</B> Committed evaluation campaigns on a construction-labeled
              gold set with dev/selection/holdout discipline enforced in code. Final
              numbers come from a holdout spent exactly once: category 88.7%, priority
              86.7%, 92.7% automation at the frozen threshold. Every number traces to a
              run directory in the repository.
            </>,
            <>
              <B>Bias.</B> Accuracy is reported per language and per difficulty for
              every model, never as a single average; the gold set is Turkish-heavy on
              purpose because that is the primary market. An 80-ticket human-verified
              set of real complaints measured the synthetic-to-real transfer gap instead
              of assuming it away.
            </>,
            <>
              <B>Fallback.</B> A failed extraction routes the ticket to review with the
              error logged; nothing is dropped. A gateway outage flips the deep health
              check to degraded. Models are switchable per environment without a
              rebuild, while the committed config remains the decision record.
            </>,
            <>
              <B>Over time.</B> Reviewer corrections already land as events, which makes
              the continuous loop concrete: sample production tickets weekly, treat
              adjudicated corrections as labels, alert when the confidence distribution
              drifts from the calibration baseline (this system measured exactly that
              failure on real data), and promote any model or threshold change through
              a canary the same way the config versions were promoted here.
            </>,
          ]}
        />
        <Q>Data and API flow</Q>
        <TicketFlowDiagram />
      </Section>

      <Section n={4} title="One-Week Proof of Concept">
        <Q>Multilingual ticket triage, shipped inside this assignment</Q>
        <P>
          The vertical slice of Section 5 is the one-week proof of concept, and it took
          three days once the evaluation existed. <B>Problem</B>: a multilingual support
          queue where agents translate, guess priority and hand-write every first reply.{" "}
          <B>Who benefits</B>: agents get triage and a ready draft; customers get a
          faster first response in their own language; leadership gets a queue that
          reports its own accuracy and cost.
        </P>
        <Ul
          items={[
            <>
              <B>Data, APIs, logic.</B> A FastAPI intake endpoint, OpenRouter as the
              single LLM gateway (one client for any model family, with per-response
              cost accounting), MongoDB for state and the audit trail, and
              confidence-threshold routing between them.
            </>,
            <>
              <B>Measurable success.</B> Automation rate at a fixed safety bar (measured:
              92.7% on holdout, with under-prioritized tickets among the automated set
              tracked as the red-line metric), a draft ready in about a second on the
              easy path and half a minute when escalated, human minutes removed per
              auto-triaged ticket, and $2.25 extraction cost per thousand tickets,
              recorded per response rather than estimated.
            </>,
            <>
              <B>Fit with the larger architecture.</B> The PoC already speaks the target
              patterns: an event per pipeline step, append-only state, registry-style
              config with owners and changelogs, and a decision layer that any queue on
              the future bus can route into.
            </>,
          ]}
        />
      </Section>

      <Section n={5} title="Customer Support AI Flow: the working implementation">
        <P>
          Every requirement in the brief is live in this deployment: validated intake;
          AI extraction of category, priority and summary; automatic language detection
          with replies drafted in the customer&apos;s language (five languages in the
          demo data); confidence-based routing to manual review; structural logging
          (every step is an append-only record plus an event); and this dashboard with
          the ticket list, labels, review status and drafts.
        </P>
        <Ul
          items={[
            <>
              <B>Try it.</B>{" "}
              <Link href="/" className="underline decoration-lime-deep underline-offset-2">
                Open the inbox
              </Link>
              , submit the Turkish &quot;messy billing&quot; sample, and watch it
              extract, route and draft within seconds. Open a ticket marked{" "}
              <I>needs review</I> to see the correction loop and the event timeline.
            </>,
            <>
              <B>What makes it different.</B> Nothing in the pipeline is assumed. The
              gold dataset was built from scratch (and its own labeling flaw was caught
              and fixed), 26 models were benchmarked, 1,106 routing strategies were
              simulated, the threshold was measured, and the transfer gap to real
              complaints was quantified rather than hidden. The full story with figures
              lives in the{" "}
              <a className="underline decoration-lime-deep underline-offset-2" href={UMBRELLA}>
                case-study README
              </a>{" "}
              and the decision memos in{" "}
              <a className="underline decoration-lime-deep underline-offset-2" href={REPO}>
                support-backend
              </a>
              .
            </>,
          ]}
        />
      </Section>

      <SectionPlain title="Notes for a production rollout">
        <P>
          This deployment is a working demo with real measurements behind it, not a
          production system. Taking it to production, I would also add:
        </P>
        <Ul
          items={[
            <>PII redaction before any LLM call, a retention schedule, and a working right-to-erasure path (KVKK/GDPR).</>,
            <>Per-request tracing (Langfuse or OpenTelemetry): one span per cascade step with tokens, latency, cost and a correlation ID.</>,
            <>An online evaluation loop: reviewer corrections become labels, a weekly scored sample, drift alarms on the confidence distribution.</>,
            <>A broker-backed job queue with idempotency keys, replacing in-process background tasks.</>,
            <>Authenticated intake, role-gated review actions, per-client rate limits, and a hard daily LLM budget cap.</>,
            <>Prompt-injection hardening: instruction/data separation, an adversarial regression suite, output linting on drafts.</>,
            <>Model ops: pinned model versions, canary rollout with rollback, a tested provider-outage fallback chain.</>,
          ]}
        />
      </SectionPlain>

      <Section n={6} title="Documentation and Governance">
        <Q>Structure for every automation</Q>
        <P>
          One repository or folder per automation with a fixed skeleton:{" "}
          <Code>README</Code> stating purpose, owner, SLA and runbook,{" "}
          <Code>CHANGELOG</Code>, versioned configuration, and decision memos for
          consequential parameters. Naming follows <Code>team-domain-action</Code>, as
          in <Code>growth-appsflyer-daily-pull</Code>. Ownership is a required registry
          field, not tribal knowledge. This project models the standard on itself:
          versioned prompts with a changelog, three frozen config versions each carrying
          a memo, and run artifacts committed next to the conclusions they support.
        </P>
        <Q>How teams request automations or changes</Q>
        <P>
          A single intake path: issue templates for new automations, changes and
          incidents, with required fields for the problem, the data touched, urgency and
          an owner-elect. Requests are triaged weekly the way this app triages tickets:
          priority plus confidence, with a human deciding the ambiguous ones.
          Consequential proposals need a one-page RFC listing options considered and the
          evidence expected before rollout.
        </P>
        <Q>Weekly health, performance and uptime reporting</Q>
        <P>
          Generated, never hand-written. The run registry already knows success rates,
          latencies, retries and cost per automation, so a scheduled job renders the
          weekly digest to Slack with red and amber deltas against the previous week.
          The{" "}
          <Link href="/analytics" className="underline decoration-lime-deep underline-offset-2">
            analytics page
          </Link>{" "}
          in this app is the miniature: automation rate, latency percentiles and spend,
          aggregated from the same events that form the audit trail.
        </P>
        <Q>Enforcing consistency</Q>
        <P>
          A template repository with logging, retries, config and tests pre-wired, so
          the easy path is the correct path. CI gates make the standard mechanical; this
          project ships strict typing, linting and a no-live-calls test suite on every
          commit. Version control is the only road to production, and a quarterly
          registry audit schedules anything without an owner or a green health check for
          adoption or deletion.
        </P>
      </Section>

      <Section n={7} title="Research and Reflection">
        <Q>Two inspirations, and what I adapted</Q>
        <Ul
          items={[
            <>
              <B>Intercom Fin.</B> The discipline of one honest metric (resolutions, not
              deflections) and human handoff treated as a designed path rather than a
              failure state. Adapted here: automation only counts at a measured accuracy
              bar, drafts are never auto-sent, and the review queue is a first-class
              surface of the product.
            </>,
            <>
              <B>Andrej Karpathy&apos;s LLM Council.</B> Cross-family disagreement as
              signal. Adapted twice: a council of four model families planned this
              project&apos;s schedule, and their independent convergence became the
              plan; then a majority-vote council was implemented and benchmarked as a
              routing strategy, where agreement fraction gives a confidence signal that
              is structurally different from model self-confidence. Honorable mention to
              OpenRouter&apos;s gateway pattern, without which a 26-model matrix would
              not fit in one client and one invoice.
            </>,
          ]}
        />
        <Q>What makes a good automation developer in an AI-smart company</Q>
        <P>
          Someone who ships evidence, not vibes: prompts, models and thresholds treated
          as versioned artifacts chosen by measurement; the failure path designed before
          the happy path, because what happens when the API is down decides whether you
          lose data; and paper trails everywhere (events, changelogs, memos) so that
          ownership survives the person. The most senior skill is knowing where the
          automation must stop and hand the decision to a human, then making that
          handoff an observable, designed path.
        </P>
        <Q>What challenged me most, and what I learned</Q>
        <P>
          <B>Trusting evaluation data.</B> The obvious public benchmark turned out to be
          noise: two model families agreed with each other on 78% of tickets and with
          the dataset&apos;s labels on 29%. Building a construction-labeled set fixed
          that, until the first full run exposed a shortcut my own generator had baked
          in (priority reduced to a function of category), the exact flaw class I had
          rejected the benchmark for. The last lesson came from 80 real complaints:
          model self-confidence saturates out of distribution, so a threshold calibrated
          on synthetic data over-automates on real traffic. Compressed:{" "}
          <B>benchmarks are instruments, and instruments must themselves be audited.</B>{" "}
          The honest move is to measure your transfer gap and publish it, which this
          case study does.
        </P>
      </Section>

      <footer className="rise mb-6 mt-12 rounded-xl border border-line bg-panel p-5 text-[12px] leading-relaxed text-ink-soft">
        Submission map: <B>live app</B> is this deployment; <B>repos</B> are{" "}
        <a className="underline" href={UMBRELLA}>support-umbrella</a> (narrative,
        diagrams, figures), <a className="underline" href={REPO}>support-backend</a>{" "}
        (pipeline, API, eval harness with committed runs) and{" "}
        <a className="underline" href="https://github.com/fatihbugrakdogan/support-app">
          support-app
        </a>{" "}
        (this dashboard); <B>diagrams</B> are Mermaid in the READMEs plus Excalidraw
        sources (plan, decision flow, unified architecture) in the umbrella repo.
      </footer>
    </article>
  );
}

/* --- typography helpers ---------------------------------------------------- */

function Section({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rise mb-10" style={{ animationDelay: `${n * 40}ms` }}>
      <div className="mb-4 flex items-baseline gap-3 border-b border-line pb-3">
        <span className="font-mono text-[13px] font-semibold text-violet">0{n}</span>
        <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function SectionPlain({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rise mb-10">
      <div className="mb-4 flex items-baseline gap-3 border-b border-line pb-3">
        <span className="font-mono text-[13px] font-semibold text-lime-deep">+</span>
        <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Q({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="pt-1 text-[13px] font-semibold uppercase tracking-[0.05em] text-ink-soft">
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[13.5px] leading-relaxed text-ink">{children}</p>;
}

function B({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold">{children}</strong>;
}

function I({ children }: { children: React.ReactNode }) {
  return <em>{children}</em>;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-canvas-deep px-1.5 py-0.5 font-mono text-[12px]">
      {children}
    </code>
  );
}


function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="border-b border-line bg-canvas-deep/50 text-left">
            {head.map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line/60 align-top last:border-0">
              {r.map((c, j) => (
                <td
                  key={j}
                  className={`px-4 py-2.5 leading-relaxed ${j === 0 ? "font-medium" : "text-ink-soft"}`}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Ul({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed">
          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-lime-deep" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
