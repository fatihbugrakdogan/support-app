import { Panel, SectionTitle } from "@/components/ui";

/* Read-only view of the frozen pipeline configuration. The product consumes
   measured decisions; changing anything here requires a new eval campaign,
   which is exactly the point this page makes. */

const CONFIG = {
  extraction: {
    strategy: "cascade",
    primary: "google/gemini-2.5-flash",
    secondary: "anthropic/claude-fable-5",
    escalation: "primary confidence < 1.0 → secondary answers",
    prompt: "v4",
  },
  draft: { model: "openai/gpt-5.6-luna", prompt: "v1" },
  threshold: 0.65,
  decided: "2026-07-14",
  memo: "support-backend/docs/decision-memo-v2.md",
};

export default function SettingsPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-[19px] font-semibold tracking-tight">Pipeline config</h1>
        <p className="text-[12px] text-ink-faint">
          Frozen — every value below is the output of a committed evaluation campaign.
        </p>
      </div>

      <div className="grid max-w-3xl gap-4 md:grid-cols-2">
        <Panel>
          <SectionTitle>Extraction stage</SectionTitle>
          <ConfigRow k="strategy" v={CONFIG.extraction.strategy} />
          <ConfigRow k="primary" v={CONFIG.extraction.primary} />
          <ConfigRow k="secondary" v={CONFIG.extraction.secondary} />
          <ConfigRow k="escalation" v={CONFIG.extraction.escalation} />
          <ConfigRow k="prompt" v={`extract ${CONFIG.extraction.prompt} (frozen)`} />
        </Panel>
        <Panel>
          <SectionTitle>Draft stage</SectionTitle>
          <ConfigRow k="model" v={CONFIG.draft.model} />
          <ConfigRow k="selected by" v="blind LLM-judge eval, 5 candidates, n=60" />
          <ConfigRow k="prompt" v={`draft ${CONFIG.draft.prompt}`} />
          <ConfigRow k="auto-send" v="never — humans hold the send button" />
        </Panel>
        <Panel className="md:col-span-2">
          <SectionTitle>Confidence routing</SectionTitle>
          <p className="mb-3 font-mono text-[13px]">
            min(category_conf, priority_conf) &lt; {CONFIG.threshold} → needs_review
          </p>
          <p className="text-[12.5px] leading-relaxed text-ink-soft">
            The cascade won a 26-model campaign + 1,106-strategy simulation on the routed-cost
            objective: 82.7% automation at 90.7% joint accuracy, zero missed highs on selection
            (decided {CONFIG.decided}; models are env-mirrored at the platform, yaml stays the record). Rationale, alternatives and the full model
            matrix live in the decision memo:{" "}
            <span className="font-mono text-[12px]">{CONFIG.memo}</span> ↗
          </p>
          <hr className="dotted-rule my-4" />
          <p className="text-[11.5px] leading-relaxed text-ink-faint">
            Why read-only? Model choice, prompts and thresholds are outputs of the
            benchmark, never assumptions. Changing them is a new campaign + a new memo —
            not an environment variable edit on a Friday evening.
          </p>
        </Panel>
      </div>
    </>
  );
}

function ConfigRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line/60 py-2 text-[13px] last:border-0">
      <span className="text-[11px] uppercase tracking-wide text-ink-faint">{k}</span>
      <span className="text-right font-mono text-[12px]">{v}</span>
    </div>
  );
}
