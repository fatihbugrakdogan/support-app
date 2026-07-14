"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type TicketSummary } from "@/lib/api";
import {
  Button,
  Chip,
  ConfidenceBar,
  EmptyState,
  Panel,
  PriorityChip,
  RoutingChip,
  Skeleton,
  timeAgo,
} from "@/components/ui";
import { NewTicketModal } from "@/components/NewTicketModal";

type View = "all" | "review" | "automated" | "approved";

const VIEWS: { key: View; label: string }[] = [
  { key: "all", label: "All tickets" },
  { key: "review", label: "Needs review" },
  { key: "automated", label: "Automated" },
  { key: "approved", label: "Approved" },
];

function inView(t: TicketSummary, view: View): boolean {
  switch (view) {
    case "all":
      return true;
    case "review":
      return (
        t.review_state !== "approved" &&
        (t.analysis === null ? t.status === "processed" : t.analysis.needs_review)
      );
    case "automated":
      return t.analysis !== null && !t.analysis.needs_review;
    case "approved":
      return t.review_state === "approved";
  }
}

export default function InboxPage() {
  const [tickets, setTickets] = useState<TicketSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("all");
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      setTickets(await api.listTickets());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed to load tickets");
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 4000);
    return () => clearInterval(timer);
  }, [refresh]);

  const counts = useMemo(() => {
    const c: Record<View, number> = { all: 0, review: 0, automated: 0, approved: 0 };
    for (const t of tickets ?? []) for (const v of VIEWS) if (inView(t, v.key)) c[v.key]++;
    return c;
  }, [tickets]);

  const visible = useMemo(
    () =>
      (tickets ?? []).filter(
        (t) =>
          inView(t, view) &&
          (!priority || t.analysis?.priority === priority) &&
          (!query || t.subject.toLowerCase().includes(query.toLowerCase())),
      ),
    [tickets, view, priority, query],
  );

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[19px] font-semibold tracking-tight">Inbox</h1>
          <p className="text-[12px] text-ink-faint">
            Tickets below the confidence threshold wait here for a human.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ New ticket</Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
              view === v.key
                ? "bg-ink text-lime"
                : "bg-panel text-ink-soft border border-line hover:text-ink"
            }`}
          >
            {v.label}
            <span className="ml-1.5 font-mono text-[11px] opacity-70">{counts[v.key]}</span>
          </button>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-full border border-line bg-panel px-3 py-1.5 text-[12px] text-ink-soft"
        >
          <option value="">any priority</option>
          <option value="high">high</option>
          <option value="medium">medium</option>
          <option value="low">low</option>
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search subjects…"
          className="min-w-44 flex-1 rounded-full border border-line bg-panel px-3.5 py-1.5 text-[12px] outline-none placeholder:text-ink-faint focus:border-ink-faint sm:max-w-64"
        />
      </div>

      {error && (
        <Panel className="mb-4 border-red bg-red-soft/60 text-[13px] text-red">
          API unreachable: {error}
        </Panel>
      )}

      <Panel className="overflow-x-auto !p-0">
        {tickets === null ? (
          <div className="space-y-2 p-5">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            title="Nothing here"
            hint="Submit a ticket in any language — the pipeline extracts labels, drafts a reply, and routes low-confidence predictions to this queue."
          />
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-[0.06em] text-ink-faint">
                <th className="px-5 py-3 font-semibold">Subject</th>
                <th className="px-3 py-3 font-semibold">Category</th>
                <th className="px-3 py-3 font-semibold">Priority</th>
                <th className="px-3 py-3 font-semibold">Lang</th>
                <th className="px-3 py-3 font-semibold">Confidence</th>
                <th className="px-3 py-3 font-semibold">Routing</th>
                <th className="px-5 py-3 text-right font-semibold">Age</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((t, i) => (
                <tr
                  key={t.id}
                  onClick={() => router.push(`/tickets/${t.id}`)}
                  className="rise cursor-pointer border-b border-line/60 last:border-0 hover:bg-canvas/70"
                  style={{ animationDelay: `${Math.min(i, 10) * 35}ms` }}
                >
                  <td className="max-w-90 truncate px-5 py-3 font-medium">{t.subject}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-ink-soft">
                    {t.analysis?.category ?? "—"}
                  </td>
                  <td className="px-3 py-3">
                    {t.analysis ? <PriorityChip priority={t.analysis.priority} /> : "—"}
                  </td>
                  <td className="px-3 py-3">
                    {t.analysis ? <Chip tone="gray">{t.analysis.language}</Chip> : "—"}
                  </td>
                  <td className="px-3 py-3">
                    <ConfidenceBar value={t.analysis?.min_confidence} />
                  </td>
                  <td className="px-3 py-3">
                    <RoutingChip
                      analysis={t.analysis}
                      status={t.status}
                      reviewState={t.review_state}
                    />
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-[12px] text-ink-faint">
                    {timeAgo(t.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <NewTicketModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={refresh}
      />
    </>
  );
}
