"use client";

import type { Analysis } from "@/lib/api";

/* Small shared primitives in the NativeMinds language. */

export function Panel({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`rounded-xl border border-line bg-panel p-5 ${className}`} style={style}>
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
      {children}
    </p>
  );
}

export function Chip({
  tone,
  children,
}: {
  tone: "green" | "amber" | "red" | "violet" | "gray" | "lime";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    green: "bg-green-soft text-green",
    amber: "bg-amber-soft text-amber",
    red: "bg-red-soft text-red",
    violet: "bg-violet-soft text-violet",
    lime: "bg-lime text-ink",
    gray: "bg-canvas-deep text-ink-soft",
  };
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function PriorityChip({ priority }: { priority: string }) {
  const tone = priority === "high" ? "red" : priority === "medium" ? "amber" : "gray";
  return <Chip tone={tone}>{priority}</Chip>;
}

export function RoutingChip({
  analysis,
  status,
  reviewState,
}: {
  analysis: Analysis | null;
  status: string;
  reviewState: string;
}) {
  if (status !== "processed")
    return (
      <span className="pulse-soft">
        <Chip tone="violet">processing…</Chip>
      </span>
    );
  if (reviewState === "approved") return <Chip tone="green">approved</Chip>;
  if (!analysis) return <Chip tone="red">extraction failed</Chip>;
  if (analysis.needs_review) return <Chip tone="amber">needs review</Chip>;
  return <Chip tone="lime">automated</Chip>;
}

export function ConfidenceBar({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined) return <span className="text-ink-faint">—</span>;
  const pct = Math.round(value * 100);
  const color = value >= 0.93 ? "bg-lime-deep" : value >= 0.8 ? "bg-amber" : "bg-red";
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-canvas-deep">
        <span className={`conf-fill block h-full ${color}`} style={{ width: `${pct}%` }} />
      </span>
      <span className="font-mono text-[11px] text-ink-soft">{value.toFixed(2)}</span>
    </span>
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const styles = {
    primary:
      "bg-lime text-ink hover:bg-lime-deep border border-transparent font-semibold",
    secondary:
      "bg-panel text-ink border border-line hover:border-ink-faint font-medium",
    ghost: "bg-transparent text-ink-soft hover:text-ink border border-transparent font-medium",
  }[variant];
  return (
    <button
      className={`rounded-lg px-3.5 py-2 text-[13px] transition-colors disabled:cursor-default disabled:opacity-40 ${styles} ${className}`}
      {...props}
    />
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-lg ${className}`} />;
}

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-14 text-center">
      <span className="text-2xl">✦</span>
      <p className="text-[14px] font-medium">{title}</p>
      <p className="max-w-sm text-[12px] text-ink-faint">{hint}</p>
    </div>
  );
}

export function timeAgo(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
