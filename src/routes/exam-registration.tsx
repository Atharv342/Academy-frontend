import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CalendarClock, CheckCircle2, Clock, Ticket, Users } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { SiteNav } from "@/components/SiteNav";
import { Modal } from "@/components/motion";
import { usePortal, type Registration } from "@/lib/portal-store";
import { celebrate } from "@/lib/celebrate";

export const Route = createFileRoute("/exam-registration")({
  head: () => ({
    meta: [
      { title: "Mock Exam Registration — Koyana Academy" },
      { name: "description", content: "Register for JEE Main, MHT-CET and NEET mock exams and book your exam slot at Koyana Academy." },
      { property: "og:title", content: "Mock Exam Registration — Koyana Academy" },
      { property: "og:description", content: "Students from any college can book a slot for online proctored JEE, CET and NEET mocks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ExamRegistration,
});

const input = "w-full rounded-xl border border-input bg-secondary/50 px-3 py-2.5 text-sm outline-none focus:border-primary";

function ExamRegistration() {
  const { exams, registrations, register } = usePortal();
  const [examId, setExamId] = useState<string | null>(null);
  const [slotId, setSlotId] = useState("");
  const [form, setForm] = useState({ name: "Rahul Patil", college: "", cls: "Class 12", email: "" });
  const [done, setDone] = useState<Registration | null>(null);
  const exam = exams.find((e) => e.id === examId);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!exam) return;
    if (!slotId) return toast.error("Pick a slot");
    if (!form.name.trim() || !form.college.trim() || !form.email.includes("@")) return toast.error("Fill name, college and a valid email");
    const reg = register({ examId: exam.id, slotId, ...form });
    setExamId(null);
    setDone(reg);
    celebrate();
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-28">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Registration open</p>
        <h1 className="mt-2 font-display text-4xl font-bold">Mock Exam Registration</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Open to students from any college or class. Pick an exam, book a slot, and take the online proctored test from your Student Portal.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {exams.map((e, i) => {
            const mine = registrations.find((r) => r.examId === e.id);
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass flex flex-col rounded-3xl p-6"
              >
                <span className="w-fit rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">{e.pattern}</span>
                <h2 className="mt-3 font-display text-lg font-semibold">{e.name}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{e.description}</p>
                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2"><Clock className="size-3.5" /> {e.durationMin} min · {e.questions.length} questions · +{e.marking.correct}/{e.marking.wrong}</p>
                  <p className="flex items-center gap-2"><CalendarClock className="size-3.5" /> Registration closes {e.regCloses}</p>
                  <p className="flex items-center gap-2"><Users className="size-3.5" /> {e.slots.length} slots available</p>
                </div>
                <div className="mt-auto pt-5">
                  {mine ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1.5 text-xs font-semibold text-success">
                      <CheckCircle2 className="size-3.5" /> Registered · {mine.hallTicket}
                    </span>
                  ) : (
                    <button
                      onClick={() => { setExamId(e.id); setSlotId(""); }}
                      className="neon-surface w-full rounded-full py-2.5 text-sm font-semibold"
                    >
                      Register & book slot
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      <Modal open={!!exam} onClose={() => setExamId(null)}>
        {exam && (
          <form onSubmit={submit}>
            <h2 className="font-display text-xl font-semibold">{exam.name}</h2>
            <p className="text-xs text-muted-foreground">Choose a slot and fill your details</p>
            <div className="mt-4 grid gap-2">
              {exam.slots.map((s) => {
                const full = s.booked >= s.capacity;
                return (
                  <button
                    type="button"
                    key={s.id}
                    disabled={full}
                    onClick={() => setSlotId(s.id)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition ${
                      slotId === s.id ? "neon-surface" : "bg-secondary/50"
                    } ${full ? "cursor-not-allowed opacity-40" : ""}`}
                  >
                    <span className="font-semibold">{s.date} · {s.time}</span>
                    <span className="text-xs">{full ? "Full" : `${s.capacity - s.booked} seats left`}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input className={input} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={input} placeholder="College / school" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
              <select className={input} value={form.cls} onChange={(e) => setForm({ ...form, cls: e.target.value })}>
                {["Class 11", "Class 12", "Repeater / Dropper", "Other"].map((c) => <option key={c}>{c}</option>)}
              </select>
              <input className={input} placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <button type="submit" className="neon-surface mt-5 w-full rounded-full py-2.5 text-sm font-semibold">Confirm registration</button>
          </form>
        )}
      </Modal>

      <Modal open={!!done} onClose={() => setDone(null)}>
        {done && (
          <div className="text-center">
            <Ticket className="mx-auto size-10 text-primary" />
            <h2 className="mt-3 font-display text-xl font-semibold">You're registered!</h2>
            <p className="mt-1 text-sm text-muted-foreground">Hall ticket</p>
            <p className="neon-text font-display text-2xl font-bold">{done.hallTicket}</p>
            <p className="mt-3 text-xs text-muted-foreground">Take the exam from the Mock Exams tab in your Student Portal.</p>
            <Link to="/student-portal" className="neon-surface mt-5 inline-block rounded-full px-6 py-2.5 text-sm font-semibold">
              Go to Student Portal
            </Link>
          </div>
        )}
      </Modal>
    </div>
  );
}
