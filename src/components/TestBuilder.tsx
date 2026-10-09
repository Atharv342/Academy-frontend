import { Download, FileKey2, Plus, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { maxMarks, qMarks, type Exam, type Question } from "@/data/exams";
import { usePortal } from "@/lib/portal-store";
import { downloadAnswerKey, downloadQuestionPaper } from "@/lib/paper-export";

const input = "w-full rounded-xl border border-input bg-secondary/50 px-3 py-2 text-sm outline-none focus:border-primary";
const presets = [
  { label: "+4 / −1", correct: 4, wrong: -1 },
  { label: "+2 / 0", correct: 2, wrong: 0 },
  { label: "+2 / −0.5", correct: 2, wrong: -0.5 },
  { label: "+1 / −0.5", correct: 1, wrong: -0.5 },
];

const blankQ = (): Question => ({
  id: crypto.randomUUID(),
  subject: "Physics",
  text: "",
  options: ["", "", "", ""],
  answer: 0,
  marks: { correct: 4, wrong: -1 },
  difficulty: "Moderate",
});

export function TestBuilder() {
  const { exams, addExam } = usePortal();
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(30);
  const [qs, setQs] = useState<Question[]>([blankQ()]);

  const draft: Exam = {
    id: `t-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "draft"}`,
    name: name || "Untitled test",
    pattern: "Custom",
    description: "Teacher-created · variable marking",
    durationMin: duration,
    marking: { correct: 4, wrong: -1 },
    regCloses: "Open",
    slots: [{ id: "s1", date: "Any day", time: "Anytime", capacity: 200, booked: 0 }],
    questions: qs,
  };

  const upd = (id: string, p: Partial<Question>) => setQs((l) => l.map((q) => (q.id === id ? { ...q, ...p } : q)));

  function valid() {
    if (!name.trim()) { toast.error("Give the test a name"); return false; }
    const bad = qs.findIndex((q) => !q.text.trim() || q.options.some((o) => !o.trim()));
    if (bad >= 0) { toast.error(`Question ${bad + 1}: fill the question and all 4 options`); return false; }
    return true;
  }

  const teacherTests = exams.filter((e) => e.questions.some((q) => q.marks));

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-display text-lg font-semibold">Ready tests</h3>
        <p className="text-xs text-muted-foreground">Download the question paper or the answer key with marks for each question.</p>
        <div className="mt-3 space-y-2">
          {teacherTests.map((e) => (
            <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary/40 px-4 py-3">
              <div>
                <p className="text-sm font-semibold">{e.name}</p>
                <p className="text-xs text-muted-foreground">
                  {e.questions.length} questions · {maxMarks(e)} marks · schemes:{" "}
                  {[...new Set(e.questions.map((q) => `+${qMarks(e, q).correct}/${qMarks(e, q).wrong}`))].join(", ")}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => downloadQuestionPaper(e)} className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold">
                  <Download className="size-3.5" /> Question paper
                </button>
                <button onClick={() => downloadAnswerKey(e)} className="neon-surface inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold">
                  <FileKey2 className="size-3.5" /> Answer key
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold">Create a new test</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_160px]">
          <input className={input} placeholder="Test name, e.g. NYT Physics Weekly Test 5" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={input} type="number" min={5} max={240} value={duration} onChange={(e) => setDuration(Number(e.target.value) || 30)} aria-label="Duration in minutes" />
        </div>

        <div className="mt-4 space-y-4">
          {qs.map((q, i) => (
            <div key={q.id} className="rounded-2xl border border-border bg-secondary/30 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-primary">Q{i + 1}</span>
                <select className={`${input} w-auto`} value={q.subject} onChange={(e) => upd(q.id, { subject: e.target.value })}>
                  {["Physics", "Chemistry", "Maths", "Biology"].map((s) => <option key={s}>{s}</option>)}
                </select>
                <select className={`${input} w-auto`} value={q.difficulty} onChange={(e) => upd(q.id, { difficulty: e.target.value as "Easy" | "Moderate" | "Hard" })}>
                  {["Easy", "Moderate", "Hard"].map((s) => <option key={s}>{s}</option>)}
                </select>
                <div className="flex flex-wrap gap-1">
                  {presets.map((p) => {
                    const on = q.marks?.correct === p.correct && q.marks?.wrong === p.wrong;
                    return (
                      <button key={p.label} type="button" onClick={() => upd(q.id, { marks: { correct: p.correct, wrong: p.wrong } })}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${on ? "neon-surface" : "glass text-muted-foreground"}`}>
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <label className="flex items-center gap-1 text-xs text-muted-foreground">
                  Correct +<input type="number" step={0.25} className={`${input} w-16`} value={q.marks?.correct ?? 0} onChange={(e) => upd(q.id, { marks: { correct: Number(e.target.value), wrong: q.marks?.wrong ?? 0 } })} />
                </label>
                <label className="flex items-center gap-1 text-xs text-muted-foreground">
                  Wrong <input type="number" step={0.25} max={0} className={`${input} w-16`} value={q.marks?.wrong ?? 0} onChange={(e) => upd(q.id, { marks: { correct: q.marks?.correct ?? 0, wrong: -Math.abs(Number(e.target.value)) } })} />
                </label>
                {qs.length > 1 && (
                  <button type="button" aria-label="Remove question" onClick={() => setQs((l) => l.filter((x) => x.id !== q.id))} className="ml-auto text-destructive">
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
              <textarea className={`${input} mt-3 min-h-16`} placeholder="Question text" value={q.text} onChange={(e) => upd(q.id, { text: e.target.value })} />
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {q.options.map((o, oi) => (
                  <label key={oi} className={`flex items-center gap-2 rounded-xl px-2 py-1 ${q.answer === oi ? "bg-success/15" : ""}`}>
                    <input type="radio" name={`ans-${q.id}`} checked={q.answer === oi} onChange={() => upd(q.id, { answer: oi })} aria-label={`Mark option ${"ABCD"[oi]} correct`} />
                    <span className="text-xs font-semibold">{"ABCD"[oi]}</span>
                    <input className={input} placeholder={`Option ${"ABCD"[oi]}`} value={o}
                      onChange={(e) => upd(q.id, { options: q.options.map((x, xi) => (xi === oi ? e.target.value : x)) })} />
                  </label>
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Tick the circle next to the right answer — it goes into the answer key.</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => setQs((l) => [...l, blankQ()])} className="glass inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold">
            <Plus className="size-4" /> Add question
          </button>
          <button onClick={() => valid() && downloadQuestionPaper(draft)} className="glass inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold">
            <Download className="size-4" /> Question paper
          </button>
          <button onClick={() => valid() && downloadAnswerKey(draft)} className="glass inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold">
            <FileKey2 className="size-4" /> Answer key
          </button>
          <button
            onClick={() => {
              if (!valid()) return;
              addExam(draft);
              toast.success(`"${draft.name}" published — ${maxMarks(draft)} marks total`);
              setName(""); setQs([blankQ()]);
            }}
            className="neon-surface inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
          >
            <Send className="size-4" /> Publish to students
          </button>
          <span className="self-center text-xs text-muted-foreground">Total: {maxMarks(draft)} marks</span>
        </div>
      </div>
    </div>
  );
}
