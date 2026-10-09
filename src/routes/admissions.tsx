import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { SiteNav } from "@/components/SiteNav";
import { Modal } from "@/components/motion";
import { celebrate } from "@/lib/celebrate";
import { academyInfo as A } from "@/lib/academy-info";

export const Route = createFileRoute("/admissions")({
  head: () => ({
    meta: [
      { title: "NYT Entrance & Olympiad Registration — Koyana Academy" },
      { name: "description", content: "Register for the NYT Entrance Exam (Class 8–11) or the NYT Talent Olympiad (Class 8–10) at Koyana Academy, Patan." },
      { property: "og:title", content: "NYT Entrance & Olympiad Registration — Koyana Academy" },
      { property: "og:description", content: "Apply for NYT entrance or the Olympiad and win special seats at Koyana Academy, Patan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admissions,
});

const input = "w-full rounded-xl border border-input bg-secondary/50 px-3 py-2.5 text-sm outline-none focus:border-primary";
type Kind = "entrance" | "olympiad";
type Slip = { kind: Kind; roll: string; name: string; school: string; cls: string; phone: string; slot: string };

const classes: Record<Kind, string[]> = {
  entrance: ["Class 8", "Class 9", "Class 10", "Class 11"],
  olympiad: ["Class 8", "Class 9", "Class 10"],
};
const slots: Record<Kind, string[]> = {
  entrance: ["2 Nov · 10:00 AM", "9 Nov · 10:00 AM"],
  olympiad: ["16 Nov · 11:00 AM", "23 Nov · 11:00 AM"],
};

function Admissions() {
  const [kind, setKind] = useState<Kind>("entrance");
  const [f, setF] = useState({ name: "", school: "", cls: "Class 8", phone: "", slot: slots.entrance[0]! });
  const [slip, setSlip] = useState<Slip | null>(null);

  function pick(k: Kind) {
    setKind(k);
    setF((x) => ({ ...x, cls: classes[k][0]!, slot: slots[k][0]! }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (f.name.trim().length < 2 || f.school.trim().length < 2) { toast.error("Enter student name and school"); return; }
    if (!/^[6-9]\d{9}$/.test(f.phone.replace(/\D/g, "").slice(-10))) { toast.error("Enter a valid 10-digit mobile number"); return; }
    setSlip({ kind, ...f, roll: `NYT-${kind === "entrance" ? "EN" : "OL"}-${Math.floor(10000 + Math.random() * 89999)}` });
    celebrate();
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-28">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Admissions 2026–27</p>
        <h1 className="mt-2 font-display text-4xl font-bold">Join NYT Academy</h1>
        <p className="mt-2 text-sm text-muted-foreground">{A.college} · {A.address} · Contact {A.contactName}, {A.phone}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {([
            ["entrance", "NYT Entrance Exam", "Class 8, 9, 10 & 11 — get into our JEE / NEET / CET batches."],
            ["olympiad", "NYT Talent Olympiad", "Class 8–10, any school. Top ranks win special reserved seats."],
          ] as const).map(([k, t, d]) => (
            <button key={k} onClick={() => pick(k)} className={`rounded-3xl p-5 text-left ${kind === k ? "neon-surface" : "glass"}`}>
              <p className="font-display text-lg font-semibold">{t}</p>
              <p className="mt-1 text-xs opacity-80">{d}</p>
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="glass mt-6 space-y-3 rounded-3xl p-6">
          <input className={input} placeholder="Student full name" maxLength={80} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input className={input} placeholder="School name" maxLength={120} value={f.school} onChange={(e) => setF({ ...f, school: e.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <select className={input} value={f.cls} onChange={(e) => setF({ ...f, cls: e.target.value })}>
              {classes[kind].map((c) => <option key={c}>{c}</option>)}
            </select>
            <select className={input} value={f.slot} onChange={(e) => setF({ ...f, slot: e.target.value })}>
              {slots[kind].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <input className={input} type="tel" placeholder="Parent mobile number" maxLength={15} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          <button className="neon-surface w-full rounded-xl py-3 text-sm font-semibold">
            Register for {kind === "entrance" ? "Entrance Exam" : "Olympiad"}
          </button>
        </form>
      </main>

      <Modal open={!!slip} onClose={() => setSlip(null)}>
        {slip && (
          <div className="p-6 text-center">
            <p className="text-xs uppercase tracking-widest text-primary">{slip.kind === "entrance" ? "NYT Entrance Hall Ticket" : "NYT Olympiad Admit Card"}</p>
            <p className="neon-text mt-2 font-display text-3xl font-bold">{slip.roll}</p>
            <p className="mt-3 text-sm">{slip.name} · {slip.cls} · {slip.school}</p>
            <p className="text-sm text-muted-foreground">Exam: {slip.slot} at {A.college}</p>
            <p className="mt-2 text-xs text-muted-foreground">Questions? {A.contactName} · {A.phone}</p>
            <button onClick={() => window.print()} className="neon-surface mt-5 rounded-full px-5 py-2 text-sm font-semibold">Print slip</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
