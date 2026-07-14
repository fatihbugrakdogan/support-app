/* Data and API flow of the deployed decision layer, in the brand palette.
   Excalidraw source: docs/diagrams/ticket-flow.excalidraw (umbrella repo). */

const INK = "#141029";
const SOFT = "#4d4864";
const LINE = "#e3dccd";
const LIME = "#b7f33c";
const LIMED = "#93d418";
const VIOLET = "#7c3aed";
const PANEL = "#fdfbf6";
const AMBER_BG = "#fdf1da";
const RED_BG = "#fbe7e9";
const GREEN_BG = "#e2f3ec";
const VIOLET_BG = "#f1e9fe";

function Box({
  x, y, w, h, title, lines, bg = PANEL,
}: {
  x: number; y: number; w: number; h: number;
  title: string; lines: string[]; bg?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={bg} stroke={LINE} strokeWidth={1.5} />
      <text x={x + 12} y={y + 20} fontSize={11.5} fontWeight={700} fill={INK}>{title}</text>
      {lines.map((l, i) => (
        <text key={i} x={x + 12} y={y + 38 + i * 14} fontSize={10} fill={SOFT}>{l}</text>
      ))}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, label }: { x1: number; y1: number; x2: number; y2: number; label?: string }) {
  return (
    <g>
      <g stroke={SOFT} strokeWidth={1.5} fill={SOFT}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} />
        <polygon
          points={`${x2},${y2} ${x2 - 8},${y2 - 4} ${x2 - 8},${y2 + 4}`}
          transform={`rotate(${(Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI}, ${x2}, ${y2})`}
          stroke="none"
        />
      </g>
      {label && (
        <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} fontSize={9.5} fill={VIOLET} textAnchor="middle" fontWeight={600}>
          {label}
        </text>
      )}
    </g>
  );
}

export function TicketFlowDiagram() {
  return (
    <svg viewBox="0 0 760 400" className="w-full rounded-xl border border-line bg-canvas-deep/30 p-1">
      <Box x={20} y={30} w={170} h={62} title="POST /api/tickets"
        lines={["Pydantic validation", 'event "received"']} />
      <Arrow x1={190} y1={61} x2={240} y2={61} label="background" />
      <Box x={240} y={22} w={230} h={78} title="Extraction cascade" bg={VIOLET_BG}
        lines={["gemini-2.5-flash (~1 s)", "uncertain → claude-fable-5", 'analyses ⊕ "extraction_succeeded"']} />
      <Arrow x1={470} y1={61} x2={548} y2={61} label="append-only" />
      <Box x={548} y={30} w={192} h={62} title="MongoDB"
        lines={["tickets · analyses · drafts", "events (one per step)"]} />

      <Arrow x1={355} y1={100} x2={355} y2={140} />
      <Box x={240} y={140} w={230} h={58} title="Confidence routing" bg={AMBER_BG}
        lines={['min(conf) < 0.65 ?  ⊕ "routed"']} />

      <Arrow x1={240} y1={169} x2={150} y2={218} label="yes" />
      <Box x={20} y={218} w={210} h={62} title="Human review queue" bg={RED_BG}
        lines={["approve / correct labels", 'corrections ⊕ "reviewed"']} />
      <Arrow x1={470} y1={169} x2={580} y2={218} label="no" />
      <Box x={548} y={218} w={192} h={62} title="Auto-triaged" bg={GREEN_BG}
        lines={["labels stand", "zero human minutes"]} />

      <Arrow x1={355} y1={198} x2={355} y2={244} />
      <Box x={240} y={244} w={230} h={70} title="Draft reply" bg={VIOLET_BG}
        lines={["gpt-5.6-luna", "customer's language", 'NEVER auto-sent ⊕ "draft_created"']} />
      <Arrow x1={230} y1={264} x2={240} y2={264} />

      <rect x={20} y={344} width={720} height={32} rx={8} fill={INK} />
      <text x={380} y={364} fontSize={10.5} fontWeight={600} fill={LIME} textAnchor="middle">
        GET /api/tickets · GET /api/tickets/{"{id}"} · GET /api/stats · GET /health/deep
      </text>
      <text x={20} y={334} fontSize={9.5} fill={SOFT}>
        analyses and drafts are append-only; a failed extraction routes to review with the error on record
      </text>
      <circle cx={228} cy={264} r={0} fill={LIMED} />
    </svg>
  );
}
