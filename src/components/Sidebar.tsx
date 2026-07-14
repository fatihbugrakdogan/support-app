"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function IconInbox() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 3v18h18" />
      <path d="M7 15v-4M12 15V7M17 15v-6" />
    </svg>
  );
}
function IconDoc() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M9 13h6M9 17h4" />
    </svg>
  );
}
function IconSliders() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
      <path d="M1 14h6M9 8h6M17 16h6" />
    </svg>
  );
}

const NAV = [
  { href: "/", label: "Inbox", icon: IconInbox },
  { href: "/analytics", label: "Analytics", icon: IconChart },
  { href: "/settings", label: "Pipeline config", icon: IconSliders },
  { href: "/case", label: "Case study", icon: IconDoc },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-line bg-canvas-deep/60 px-4 py-6">
      <Link href="/" className="mb-8 block px-2">
        <span className="text-[15px] font-semibold tracking-tight">Support Triage</span>
        <span className="mt-0.5 block text-[11px] text-ink-faint">
          NativeMinds · BookBite demo
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? path === "/" || path.startsWith("/tickets")
              : path.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium ${
                active
                  ? "bg-ink text-lime shadow-sm"
                  : "text-ink-soft hover:bg-panel hover:text-ink hover:translate-x-0.5"
              }`}
            >
              <Icon />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2">
        <hr className="dotted-rule" />
      </div>
    </aside>
  );
}
