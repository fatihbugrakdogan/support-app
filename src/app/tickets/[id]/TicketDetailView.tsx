"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, CATEGORIES, PRIORITIES, type TicketDetail } from "@/lib/api";
import {
  Button,
  Chip,
  ConfidenceBar,
  Panel,
  PriorityChip,
  RoutingChip,
  SectionTitle,
  Skeleton,
  timeAgo,
} from "@/components/ui";

const EVENT_ICONS: Record<string, string> = {
  received: "✉",
  extraction_succeeded: "❋",
  extraction_failed: "✕",
  routed: "⇄",
  draft_created: "✎",
  draft_failed: "✕",
  reviewed: "✓",
};

export function TicketDetailView({ id }: { id: string }) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setTicket(await api.getTicket(id));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed to load");
    }
  }, [id]);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 4000);
    return () => clearInterval(timer);
  }, [refresh]);

  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  if (error) return <Panel className="text-[13px] text-red">API error: {error}</Panel>;
  if (!ticket)
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );

  const a = ticket.analysis;
  const latestDraft = ticket.drafts.at(-1);

  return (
    <>
      <div className="mb-5">
        <Link href="/" className="text-[12px] text-ink-faint hover:text-ink">
          ← Inbox
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="max-w-2xl text-[18px] font-semibold leading-snug tracking-tight">
            {ticket.subject}
          </h1>
          <RoutingChip analysis={a} status={ticket.status} reviewState={ticket.review_state} />
        </div>
        <p className="mt-1 text-[12px] text-ink-faint">
          received {timeAgo(ticket.created_at)}
          {ticket.customer_email ? ` · ${ticket.customer_email}` : ""}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* Left: conversation + drafts */}
        <div className="space-y-5">
          <Panel className="rise">
            <SectionTitle>Customer message</SectionTitle>
            <p className="whitespace-pre-wrap rounded-lg bg-canvas px-4 py-3 text-[13.5px] leading-relaxed">
              {ticket.body}
            </p>
          </Panel>

          <Panel className="rise" style={{ animationDelay: "90ms" }}>
            <div className="mb-3 flex items-center justify-between">
              <SectionTitle>Reply drafts — never auto-sent</SectionTitle>
              {a && (
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() => act(() => api.regenerateDraft(id))}
                >
                  ↻ Regenerate
                </Button>
              )}
            </div>
            {ticket.drafts.length === 0 || !latestDraft ? (
              <p className="text-[12px] text-ink-faint">
                No draft — extraction must succeed first.
              </p>
            ) : (
              <>
                <div className="mb-2 flex items-center gap-2 text-[11px] text-ink-faint">
                  <Chip tone="violet">AI draft</Chip>
                  <span>
                    {latestDraft.language} · {latestDraft.served_model} ·{" "}
                    {latestDraft.latency_ms} ms
                  </span>
                </div>
                <p className="whitespace-pre-wrap rounded-lg border border-violet-soft bg-violet-soft/40 px-4 py-3 text-[13.5px] leading-relaxed">
                  {latestDraft.body}
                </p>
                {ticket.drafts.length > 1 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-[12px] text-ink-faint">
                      {ticket.drafts.length - 1} earlier draft
                      {ticket.drafts.length > 2 ? "s" : ""} (kept — drafts are append-only)
                    </summary>
                    {ticket.drafts.slice(0, -1).map((d) => (
                      <p
                        key={d.id}
                        className="mt-2 whitespace-pre-wrap rounded-lg bg-canvas px-4 py-3 text-[12.5px] text-ink-soft"
                      >
                        {d.body}
                      </p>
                    ))}
                  </details>
                )}
              </>
            )}
          </Panel>
        </div>

        {/* Right: AI analysis, review, timeline */}
        <div className="space-y-5">
          <Panel className="rise" style={{ animationDelay: "60ms" }}>
            <SectionTitle>AI analysis</SectionTitle>
            {a ? (
              <dl className="space-y-3 text-[13px]">
                <Row label="Category">
                  <span className="font-medium">{a.category}</span>
                  <ConfidenceBar value={a.category_confidence} />
                </Row>
                <Row label="Priority">
                  <PriorityChip priority={a.priority} />
                  <ConfidenceBar value={a.priority_confidence} />
                </Row>
                <Row label="Language">
                  <Chip tone="gray">{a.language}</Chip>
                </Row>
                <div>
                  <dt className="mb-1 text-[11px] uppercase tracking-wide text-ink-faint">
                    Summary for the agent
                  </dt>
                  <dd className="leading-relaxed text-ink-soft">{a.summary}</dd>
                </div>
                <div>
                  <dt className="mb-1 text-[11px] uppercase tracking-wide text-ink-faint">
                    Routing
                  </dt>
                  <dd className="text-ink-soft">{a.routing_reason}</dd>
                </div>
                <hr className="dotted-rule" />
                <p className="font-mono text-[11px] leading-relaxed text-ink-faint">
                  {a.served_model} · prompt {a.prompt_version} · {a.latency_ms} ms
                </p>
              </dl>
            ) : (
              <p className="text-[12.5px] leading-relaxed text-ink-soft">
                Extraction failed — the error is in the event log below, and the ticket
                is routed to a human. Nothing is lost.
              </p>
            )}
          </Panel>

          {ticket.review_state !== "approved" && ticket.status === "processed" && (
            <ReviewPanel
              id={id}
              busy={busy}
              currentCategory={a?.category}
              currentPriority={a?.priority}
              onAction={act}
            />
          )}

          <Panel className="rise" style={{ animationDelay: "150ms" }}>
            <SectionTitle>Event log</SectionTitle>
            <ol className="space-y-2.5">
              {ticket.events.map((e, i) => (
                <li key={i} className="flex gap-2.5 text-[12px]">
                  <span className="mt-px w-4 shrink-0 text-center text-ink-faint">
                    {EVENT_ICONS[e.type] ?? "·"}
                  </span>
                  <div className="min-w-0">
                    <span className="font-medium">{e.type}</span>{" "}
                    <span className="text-ink-faint">{timeAgo(e.created_at)}</span>
                    {Object.keys(e.payload).length > 0 && (
                      <p className="break-words font-mono text-[10.5px] leading-relaxed text-ink-faint">
                        {JSON.stringify(e.payload)}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[11px] uppercase tracking-wide text-ink-faint">{label}</dt>
      <dd className="flex items-center gap-2.5">{children}</dd>
    </div>
  );
}

function ReviewPanel({
  id,
  busy,
  currentCategory,
  currentPriority,
  onAction,
}: {
  id: string;
  busy: boolean;
  currentCategory?: string;
  currentPriority?: string;
  onAction: (fn: () => Promise<unknown>) => Promise<void>;
}) {
  const [category, setCategory] = useState(currentCategory ?? CATEGORIES[0]);
  const [priority, setPriority] = useState(currentPriority ?? "medium");

  useEffect(() => {
    if (currentCategory) setCategory(currentCategory);
    if (currentPriority) setPriority(currentPriority);
  }, [currentCategory, currentPriority]);

  const changed = category !== currentCategory || priority !== currentPriority;

  return (
    <Panel className="border-lime-deep/50">
      <SectionTitle>Human review</SectionTitle>
      <div className="mb-3 grid grid-cols-1 gap-2.5">
        <label className="text-[11px] uppercase tracking-wide text-ink-faint">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-[13px] normal-case tracking-normal text-ink"
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="text-[11px] uppercase tracking-wide text-ink-faint">
          Priority
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-[13px] normal-case tracking-normal text-ink"
          >
            {PRIORITIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>
      <Button
        className="w-full"
        disabled={busy}
        onClick={() =>
          void onAction(() =>
            api.review(id, {
              corrected_category: changed ? category : undefined,
              corrected_priority: changed ? priority : undefined,
            }),
          )
        }
      >
        {changed ? "Approve with corrections" : "Approve as-is"}
      </Button>
      <p className="mt-2 text-[11px] leading-snug text-ink-faint">
        Corrections land in the event log — the AI&apos;s original answer stays on record.
      </p>
    </Panel>
  );
}
