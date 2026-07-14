"use client";

import { useEffect, useState } from "react";
import { getStats, type Stats } from "@/lib/api";
import { Panel, SectionTitle, Skeleton } from "@/components/ui";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PRIORITY_COLORS: Record<string, string> = {
  high: "#b02a37",
  medium: "#92600a",
  low: "#8b869e",
};
const LANG_COLORS = ["#141029", "#7c3aed", "#0b6e4f", "#93d418", "#92600a"];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = () =>
      getStats()
        .then((s) => {
          setStats(s);
          setError(null);
        })
        .catch((e) => setError(e instanceof Error ? e.message : "failed"));
    load();
    const timer = setInterval(load, 8000);
    return () => clearInterval(timer);
  }, []);

  if (error) return <Panel className="text-[13px] text-red">API error: {error}</Panel>;
  if (!stats)
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );

  const automationRate =
    stats.automated + stats.needs_review > 0
      ? stats.automated / (stats.automated + stats.needs_review)
      : 0;

  const priorityData = Object.entries(stats.by_priority).map(([name, value]) => ({
    name,
    value,
  }));
  const categoryData = Object.entries(stats.by_category)
    .map(([name, value]) => ({ name: name.replace(" & ", " · "), value }))
    .sort((a, b) => b.value - a.value);
  const langData = Object.entries(stats.by_language).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <>
      <div className="mb-6">
        <h1 className="text-[19px] font-semibold tracking-tight">Analytics</h1>
        <p className="text-[12px] text-ink-faint">
          Live operations — the offline evaluation story lives in the repo&apos;s decision
          memo and campaign figures.
        </p>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Tickets" value={String(stats.total_tickets)} />
        <Kpi
          delay={60}
          label="Automation rate"
          value={`${Math.round(automationRate * 100)}%`}
          hint={`threshold ${stats.threshold} — measured, not assumed`}
        />
        <Kpi
          delay={120}
          label="Latency p50 / p95"
          value={
            stats.latency_ms_p50
              ? `${(stats.latency_ms_p50 / 1000).toFixed(1)}s / ${((stats.latency_ms_p95 ?? 0) / 1000).toFixed(1)}s`
              : "—"
          }
          hint="extraction stage"
        />
        <Kpi
          delay={180}
          label="LLM spend"
          value={`$${stats.total_llm_cost_usd.toFixed(4)}`}
          hint="recorded per response, not estimated"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="rise" style={{ animationDelay: "120ms" }}>
          <SectionTitle>Priority mix</SectionTitle>
          <Donut
            data={priorityData}
            colors={priorityData.map((d) => PRIORITY_COLORS[d.name] ?? "#8b869e")}
            centerLabel="tickets"
          />
          <Legend
            items={priorityData.map((d) => [
              `${d.name} · ${d.value}`,
              PRIORITY_COLORS[d.name] ?? "#8b869e",
            ])}
          />
        </Panel>

        <Panel className="rise" style={{ animationDelay: "180ms" }}>
          <SectionTitle>Language mix</SectionTitle>
          <Donut
            data={langData}
            colors={langData.map((_, i) => LANG_COLORS[i % LANG_COLORS.length])}
            centerLabel="tickets"
          />
          <Legend
            items={langData.map((d, i) => [
              `${d.name} · ${d.value}`,
              LANG_COLORS[i % LANG_COLORS.length],
            ])}
          />
        </Panel>

        <Panel className="rise" style={{ animationDelay: "240ms" }}>
          <SectionTitle>Queue outcomes</SectionTitle>
          <div className="space-y-3 pt-2 text-[13px]">
            <Outcome label="Automated" value={stats.automated} total={stats.processed} color="#93d418" />
            <Outcome label="Needs review" value={stats.needs_review} total={stats.processed} color="#92600a" />
            <Outcome label="Approved by a human" value={stats.approved} total={stats.total_tickets} color="#0b6e4f" />
          </div>
          <hr className="dotted-rule my-4" />
          <p className="text-[11px] leading-relaxed text-ink-faint">
            Avg min-confidence:{" "}
            <span className="font-mono">
              {stats.avg_min_confidence?.toFixed(2) ?? "—"}
            </span>
            . Failed extractions always route to review — no ticket is dropped.
          </p>
        </Panel>
      </div>

      <Panel className="rise mt-4" style={{ animationDelay: "300ms" }}>
        <SectionTitle>Category volume</SectionTitle>
        <ResponsiveContainer width="100%" height={Math.max(180, categoryData.length * 36)}>
          <BarChart data={categoryData} layout="vertical" margin={{ left: 40 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={170}
              tick={{ fontSize: 11, fill: "#4d4864" }}
            />
            <Tooltip />
            <Bar dataKey="value" fill="#7c3aed" radius={[0, 6, 6, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </>
  );
}

function Kpi({
  label,
  value,
  hint,
  delay = 0,
}: {
  label: string;
  value: string;
  hint?: string;
  delay?: number;
}) {
  return (
    <Panel className="rise" style={{ animationDelay: `${delay}ms` }}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
        {label}
      </p>
      <p className="mt-1.5 font-mono text-[26px] font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-ink-faint">{hint}</p>}
    </Panel>
  );
}

function Donut({
  data,
  colors,
  centerLabel,
}: {
  data: { name: string; value: number }[];
  colors: string[];
  centerLabel: string;
}) {
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={190}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={52}
            outerRadius={76}
            paddingAngle={2}
            strokeWidth={0}
            isAnimationActive
            animationDuration={700}
          >
            {data.map((d, i) => (
              <Cell key={d.name} fill={colors[i]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-[24px] font-semibold leading-none">{total}</span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.08em] text-ink-faint">
          {centerLabel}
        </span>
      </div>
    </div>
  );
}

function Legend({ items }: { items: [string, string][] }) {
  return (
    <div className="mt-1 flex flex-wrap gap-3">
      {items.map(([name, color]) => (
        <span key={name} className="flex items-center gap-1.5 text-[11px] text-ink-soft">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
          {name}
        </span>
      ))}
    </div>
  );
}

function Outcome({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-[12px]">
        <span>{label}</span>
        <span className="font-mono text-ink-soft">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-canvas-deep">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
