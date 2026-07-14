"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button, SectionTitle } from "@/components/ui";

const SAMPLES: { label: string; subject: string; body: string }[] = [
  {
    label: "🇹🇷 messy billing",
    subject: "iptal ettim ama para cekilmis yine",
    body: "mrb gecen ay uyeligimi iptal ettim diye biliyorum ama dun karta baktim 149tl cekilmis yine :( app store dan mi almistim webden mi onu da hatirlamiyorum. iki keredir oluyor bu, cozulmezse bankaya itiraz acacagim artik. tesekkurler",
  },
  {
    label: "🇩🇪 GDPR deletion",
    subject: "Antrag auf Löschung meiner Daten gemäß Art. 17 DSGVO",
    body: "Sehr geehrte Damen und Herren, hiermit fordere ich Sie förmlich auf, mein Konto sowie sämtliche personenbezogenen Daten innerhalb der gesetzlichen Frist von einem Monat zu löschen. Bitte bestätigen Sie die Löschung schriftlich.",
  },
  {
    label: "🇬🇧 crash on launch",
    subject: "App crashes on launch since the update",
    body: "Hi, since the latest update the app crashes the second I open it, every single time. I am a Premium Annual subscriber (order AS-99182, iPhone 15) and I cannot use anything I paid for. Please fix this urgently.",
  },
];

export function NewTicketModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.createTicket({ subject, body });
      setSubject("");
      setBody("");
      await onCreated();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="modal-panel w-full max-w-xl rounded-2xl border border-line bg-panel p-6 shadow-xl"
      >
        <SectionTitle>Submit a ticket — any language</SectionTitle>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {SAMPLES.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => {
                setSubject(s.subject);
                setBody(s.body);
              }}
              className="rounded-full border border-line bg-canvas px-2.5 py-1 text-[11px] text-ink-soft hover:border-ink-faint"
            >
              {s.label}
            </button>
          ))}
        </div>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          required
          maxLength={500}
          className="mb-2.5 w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-[13px] outline-none placeholder:text-ink-faint focus:border-ink-faint"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Describe the issue…"
          required
          maxLength={20000}
          rows={5}
          className="mb-4 w-full resize-y rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-[13px] outline-none placeholder:text-ink-faint focus:border-ink-faint"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] leading-snug text-ink-faint">
            The pipeline extracts language, category and priority with per-field
            confidence, then drafts a reply in the customer&apos;s language.
          </p>
          <div className="flex shrink-0 gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={busy || !subject || !body}>
              {busy ? "Submitting…" : "Submit"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
