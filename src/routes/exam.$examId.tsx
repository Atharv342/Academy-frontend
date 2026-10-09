import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { maxMarks, qMarks } from "@/data/exams";
import { AlertTriangle, Camera, Flag, Maximize, ShieldCheck, Timer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/motion";
import { usePortal } from "@/lib/portal-store";
import { celebrate } from "@/lib/celebrate";

export const Route = createFileRoute("/exam/$examId")({
  head: () => ({
    meta: [
      { title: "Online Proctored Exam — Koyana Academy" },
      { name: "description", content: "Take your JEE, MHT-CET or NEET mock exam in a proctored, timed exam window." },
      { property: "og:title", content: "Online Proctored Exam — Koyana Academy" },
      { property: "og:description", content: "Timed, proctored mock exam with question palette and instant results." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ExamPage,
});

const MAX_VIOLATIONS = 3;

function ExamPage() {
  const { examId } = Route.useParams();
  const { exams, registrations, addResult, results } = usePortal();
  const navigate = useNavigate();
  const exam = exams.find((e) => e.id === examId);
  const reg = registrations.find((r) => r.examId === examId);
  const [started, setStarted] = useState(false);
  const [agree, setAgree] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [review, setReview] = useState<Record<string, boolean>>({});
  const [visited, setVisited] = useState<Record<string, boolean>>({});
  const [left, setLeft] = useState(0);
  const [violations, setViolations] = useState(0);
  const [warn, setWarn] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [cam, setCam] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const submittedRef = useRef(false);

  const result = results.find((r) => r.examId === examId);

  async function start() {
    if (!exam) return;
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = s;
      setCam(true);
    } catch {
      toast.warning("Camera unavailable — continuing in demo proctoring mode");
    }
    try { await document.documentElement.requestFullscreen(); } catch { /* ignore */ }
    setLeft(exam.durationMin * 60);
    setStarted(true);
  }

  useEffect(() => {
    if (cam && videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current;
  }, [cam, started]);

  function finish(auto = false) {
    if (!exam || submittedRef.current) return;
    submittedRef.current = true;
    let correct = 0, wrong = 0, score = 0;
    exam.questions.forEach((q) => {
      const a = answers[q.id];
      if (a === undefined) return;
      const m = qMarks(exam, q);
      if (a === q.answer) { correct++; score += m.correct; } else { wrong++; score += m.wrong; }
    });
    addResult({ examId: exam.id, score, max: maxMarks(exam), correct, wrong, skipped: exam.questions.length - correct - wrong, violations });
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setStarted(false);
    setConfirm(false);
    if (auto) toast.error("Exam auto-submitted"); else celebrate();
  }

  useEffect(() => {
    if (!started) return;
    const t = setInterval(() => setLeft((l) => {
      if (l <= 1) { finish(true); return 0; }
      return l - 1;
    }), 1000);
    return () => clearInterval(t);
  });

  useEffect(() => {
    if (!started) return;
    const flag = (msg: string) => {
      setViolations((v) => {
        const n = v + 1;
        if (n >= MAX_VIOLATIONS) setTimeout(() => finish(true), 0);
        else setWarn(`${msg} Warning ${n} of ${MAX_VIOLATIONS - 1}. One more and your exam is auto-submitted.`);
        return n;
      });
    };
    const onVis = () => document.hidden && flag("You left the exam tab.");
    const onFs = () => !document.fullscreenElement && flag("You exited full screen.");
    const block = (e: Event) => e.preventDefault();
    document.addEventListener("visibilitychange", onVis);
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("copy", block);
    document.addEventListener("contextmenu", block);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("copy", block);
      document.removeEventListener("contextmenu", block);
    };
  });

  if (!exam) return <Center><p>Exam not found.</p><Link to="/exam-registration" className="text-primary underline">View exams</Link></Center>;
  if (!reg) return (
    <Center>
      <p className="font-display text-xl font-semibold">You haven't registered for {exam.name}</p>
      <Link to="/exam-registration" className="neon-surface mt-4 inline-block rounded-full px-6 py-2.5 text-sm font-semibold">Register now</Link>
    </Center>
  );

  if (result && !started) return (
    <Center>
      <ShieldCheck className="mx-auto size-10 text-success" />
      <h1 className="mt-3 font-display text-2xl font-bold">{exam.name} — submitted</h1>
      <p className="neon-text mt-4 font-display text-5xl font-bold">{result.score}<span className="text-xl text-muted-foreground"> / {result.max}</span></p>
      <div className="mt-6 grid grid-cols-4 gap-3 text-sm">
        <Stat l="Correct" v={result.correct} /><Stat l="Wrong" v={result.wrong} /><Stat l="Skipped" v={result.skipped} /><Stat l="Warnings" v={result.violations} />
      </div>
      <button onClick={() => navigate({ to: "/student-portal" })} className="neon-surface mt-6 rounded-full px-6 py-2.5 text-sm font-semibold">Back to Student Portal</button>
    </Center>
  );

  if (!started) {
    const slot = exam.slots.find((s) => s.id === reg.slotId);
    return (
      <Center>
        <h1 className="font-display text-2xl font-bold">{exam.name}</h1>
        <p className="text-sm text-muted-foreground">Hall ticket {reg.hallTicket} · Slot {slot?.date} {slot?.time}</p>
        <ul className="mt-5 space-y-2 text-left text-sm text-muted-foreground">
          <li>• {exam.questions.length} questions · {exam.durationMin} minutes · marking varies per question (shown on each question)</li>
          <li className="flex gap-2"><Camera className="size-4 shrink-0" /> Your camera stays on during the test</li>
          <li className="flex gap-2"><Maximize className="size-4 shrink-0" /> The exam runs in full screen — leaving it or switching tabs is a warning</li>
          <li className="flex gap-2"><AlertTriangle className="size-4 shrink-0" /> {MAX_VIOLATIONS} warnings auto-submit the exam</li>
        </ul>
        <label className="mt-5 flex items-center justify-center gap-2 text-sm">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> I have read the instructions
        </label>
        <button disabled={!agree} onClick={start} className="neon-surface mt-4 rounded-full px-8 py-3 text-sm font-semibold disabled:opacity-40">Start exam</button>
      </Center>
    );
  }

  const q = exam.questions[idx]!;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const go = (i: number) => { setVisited((v) => ({ ...v, [q.id]: true })); setIdx(i); };

  return (
    <div className="min-h-screen select-none bg-background">
      <header className="glass-strong sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="font-display text-sm font-semibold">{exam.name}</p>
          <p className="text-xs text-muted-foreground">{reg.name} · {reg.hallTicket}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-sm font-bold ${left < 120 ? "bg-destructive/20 text-destructive" : "bg-primary/15 text-primary"}`}>
            <Timer className="size-4" /> {mm}:{ss}
          </span>
          <span className="text-xs text-muted-foreground">Warnings {violations}/{MAX_VIOLATIONS}</span>
          {cam ? (
            <video ref={videoRef} autoPlay muted playsInline className="h-12 w-16 rounded-lg object-cover ring-2 ring-success" />
          ) : (
            <span className="flex h-12 w-16 items-center justify-center rounded-lg bg-secondary text-[10px] text-muted-foreground">Proctor</span>
          )}
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-5 p-4 md:grid-cols-[1fr_260px]">
        <section className="glass rounded-3xl p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{q.subject} · Question {idx + 1} · +{qMarks(exam, q).correct} / {qMarks(exam, q).wrong}</p>
          <p className="mt-3 text-lg font-medium">{q.text}</p>
          <div className="mt-5 space-y-2">
            {q.options.map((o, i) => (
              <button
                key={o}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm ${answers[q.id] === i ? "neon-surface" : "bg-secondary/50"}`}
              >
                <span className="font-bold">{String.fromCharCode(65 + i)}.</span> {o}
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <button onClick={() => setAnswers((a) => { const n = { ...a }; delete n[q.id]; return n; })} className="glass rounded-full px-4 py-2 text-xs font-semibold">Clear</button>
            <button onClick={() => setReview((r) => ({ ...r, [q.id]: !r[q.id] }))} className="glass inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold">
              <Flag className="size-3.5" /> {review[q.id] ? "Unmark review" : "Mark for review"}
            </button>
            <div className="ml-auto flex gap-2">
              <button disabled={idx === 0} onClick={() => go(idx - 1)} className="glass rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-40">Previous</button>
              {idx < exam.questions.length - 1 ? (
                <button onClick={() => go(idx + 1)} className="neon-surface rounded-full px-4 py-2 text-xs font-semibold">Save & next</button>
              ) : (
                <button onClick={() => setConfirm(true)} className="neon-surface rounded-full px-4 py-2 text-xs font-semibold">Submit</button>
              )}
            </div>
          </div>
        </section>

        <aside className="glass rounded-3xl p-5">
          <p className="text-sm font-semibold">Question palette</p>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {exam.questions.map((x, i) => {
              const cls = review[x.id]
                ? "bg-accent text-accent-foreground"
                : answers[x.id] !== undefined
                  ? "bg-success text-primary-foreground"
                  : visited[x.id]
                    ? "bg-destructive/70 text-primary-foreground"
                    : "bg-secondary text-muted-foreground";
              return (
                <button key={x.id} onClick={() => go(i)} className={`aspect-square rounded-lg text-xs font-bold ${cls} ${i === idx ? "ring-2 ring-primary" : ""}`}>
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-1 text-[11px] text-muted-foreground">
            <p><span className="mr-2 inline-block size-2.5 rounded bg-success" />Answered</p>
            <p><span className="mr-2 inline-block size-2.5 rounded bg-destructive/70" />Not answered</p>
            <p><span className="mr-2 inline-block size-2.5 rounded bg-accent" />Marked for review</p>
          </div>
          <button onClick={() => setConfirm(true)} className="neon-surface mt-5 w-full rounded-full py-2.5 text-sm font-semibold">Submit exam</button>
        </aside>
      </div>

      <Modal open={!!warn} onClose={() => setWarn("")}>
        <AlertTriangle className="size-8 text-destructive" />
        <h2 className="mt-2 font-display text-lg font-semibold">Proctoring warning</h2>
        <p className="mt-1 text-sm text-muted-foreground">{warn}</p>
        <button onClick={() => { setWarn(""); document.documentElement.requestFullscreen().catch(() => {}); }} className="neon-surface mt-4 rounded-full px-5 py-2 text-sm font-semibold">Return to exam</button>
      </Modal>
      <Modal open={confirm} onClose={() => setConfirm(false)}>
        <h2 className="font-display text-lg font-semibold">Submit exam?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Answered {Object.keys(answers).length} of {exam.questions.length}. You can't change answers after submitting.
        </p>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setConfirm(false)} className="glass rounded-full px-5 py-2 text-sm font-semibold">Keep going</button>
          <button onClick={() => finish()} className="neon-surface rounded-full px-5 py-2 text-sm font-semibold">Submit</button>
        </div>
      </Modal>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center p-4"><div className="glass w-full max-w-lg rounded-3xl p-8 text-center">{children}</div></div>;
}
function Stat({ l, v }: { l: string; v: number }) {
  return <div className="rounded-2xl bg-secondary/50 p-3"><p className="font-display text-xl font-bold">{v}</p><p className="text-[11px] text-muted-foreground">{l}</p></div>;
}
