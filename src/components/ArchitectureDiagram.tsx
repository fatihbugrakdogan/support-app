/* Unified automation architecture, drawn in the NativeMinds palette.
   The same diagram ships as Excalidraw source in the umbrella repo. */

const INK = "#141029";
const SOFT = "#4d4864";
const LINE = "#e3dccd";
const LIME = "#b7f33c";
const VIOLET = "#7c3aed";
const GREEN = "#0b6e4f";
const PANEL = "#fdfbf6";

function Box({
  x, y, w, h, title, lines, accent = LINE,
}: {
  x: number; y: number; w: number; h: number;
  title: string; lines: string[]; accent?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={PANEL} stroke={LINE} strokeWidth={1.5} />
      <rect x={x} y={y} width={4} height={h} rx={2} fill={accent} />
      <text x={x + 14} y={y + 21} fontSize={11.5} fontWeight={700} fill={INK}>{title}</text>
      {lines.map((l, i) => (
        <text key={i} x={x + 14} y={y + 40 + i * 15} fontSize={10.5} fill={SOFT}>{l}</text>
      ))}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <g stroke={SOFT} strokeWidth={1.5} fill={SOFT}>
      <line x1={x1} y1={y1} x2={x2 - 7} y2={y2} />
      <polygon points={`${x2},${y2} ${x2 - 8},${y2 - 4} ${x2 - 8},${y2 + 4}`} stroke="none" />
    </g>
  );
}

export function ArchitectureDiagram() {
  return (
    <svg viewBox="0 0 760 360" className="w-full rounded-xl border border-line bg-canvas-deep/30 p-1">
      <text x={20} y={26} fontSize={10} fontWeight={700} fill={SOFT} letterSpacing={1.2}>SOURCES</text>
      <Box x={20} y={38} w={150} h={100} title="Product & stores" accent={VIOLET}
        lines={["app events", "App Store / Play", "webhooks"]} />
      <Box x={20} y={148} w={150} h={84} title="Revenue & growth" accent={GREEN}
        lines={["payment provider", "ad platforms"]} />
      <Box x={20} y={242} w={150} h={70} title="Content ops" accent={LIME}
        lines={["CMS states", "engagement"]} />

      <Arrow x1={170} y1={100} x2={216} y2={130} />
      <Arrow x1={170} y1={190} x2={216} y2={165} />
      <Arrow x1={170} y1={277} x2={216} y2={190} />

      <text x={216} y={26} fontSize={10} fontWeight={700} fill={SOFT} letterSpacing={1.2}>INGESTION</text>
      <Box x={216} y={110} w={150} h={110} title="Event bus" accent={VIOLET}
        lines={["webhooks (signed)", "scheduled pulls", "versioned schemas", "contract tests"]} />

      <Arrow x1={366} y1={165} x2={412} y2={165} />

      <text x={412} y={26} fontSize={10} fontWeight={700} fill={SOFT} letterSpacing={1.2}>PROCESSING</text>
      <Box x={412} y={62} w={150} h={96} title="Typed workers" accent={LIME}
        lines={["idempotent jobs", "retry + DLQ", "orchestrated SLAs"]} />
      <Box x={412} y={170} w={150} h={96} title="Decision layer (AI)" accent={VIOLET}
        lines={["extraction cascade", "confidence routing", "human review loop"]} />

      <Arrow x1={562} y1={110} x2={598} y2={82} />
      <Arrow x1={562} y1={218} x2={598} y2={196} />
      <Arrow x1={562} y1={230} x2={598} y2={286} />

      <text x={598} y={26} fontSize={10} fontWeight={700} fill={SOFT} letterSpacing={1.2}>DESTINATIONS</text>
      <Box x={598} y={44} w={142} h={76} title="Warehouse + BI" accent={GREEN}
        lines={["columnar store", "dashboards"]} />
      <Box x={598} y={158} w={142} h={76} title="Operational DB" accent={VIOLET}
        lines={["state + audit trail", "review queues"]} />
      <Box x={598} y={248} w={142} h={76} title="Hand-offs" accent={LIME}
        lines={["Slack alerts", "CRM / finance"]} />

      <rect x={216} y={318} width={524} height={30} rx={8} fill={INK} />
      <text x={478} y={337} fontSize={10.5} fontWeight={600} fill={LIME} textAnchor="middle">
        run registry: owner · SLA · last run · failure rate · cost · every job reports here
      </text>
    </svg>
  );
}
