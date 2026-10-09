import { Download, FileText, KeyRound, Users, Trophy, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { usePortal } from "@/lib/use-portal";
import { downloadCsv, downloadPaper, isRegOpen, markingOf } from "@/lib/downloads";

const btn = "glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold hover:text-primary";
const input = "rounded-xl border border-input bg-secondary/50 px-3 py-1.5 text-xs outline-none focus:border-primary";

function toLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function ExamDownloads() {
  const { exams, registrations, results, updateExam } = usePortal();

  function regRows(examId?: string) {
    const list = examId ? registrations.filter((r) => r.examId === examId) : registrations;
    return [
      ["Exam", "Slot", "Name", "Academy ID", "College", "Class", "Email", "Hall ticket"],
      ...list.map((r) => {
        const e = exams.find((x) => x.id === r.examId);
        const s = e?.slots.find((x) => x.id === r.slotId);
        return [e?.name ?? r.examId, s ? `${s.date} ${s.time}` : r.slotId, r.name, r.studentId, r.college, r.cls, r.email, r.hallTicket];
      }),
    ];
  }

  function resultRows(examId: string) {
    return [
      ["Exam", "Name", "Academy ID", "Score", "Max", "Correct", "Wrong", "Skipped", "Violations"],
      ...results.filter((r) => r.examId === examId).map((r) => {
        const reg = registrations.find((x) => x.examId === r.examId);
        const e = exams.find((x) => x.id === r.examId);
        return [e?.name ?? r.examId, reg?.name ?? "—", reg?.studentId ?? "—", r.score, r.max, r.correct, r.wrong, r.skipped, r.violations];
      }),
    ];
  }

  function setDeadline(id: string, iso?: string) {
    updateExam(id, { regDeadline: iso });
    toast.success(iso ? "Registration deadline set" : "Deadline removed");
  }

  const tomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(23, 59, 0, 0); return d.toISOString(); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Download papers, answer keys, results and registrations. Set a registration deadline per exam.</p>
        <button className="neon-surface inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
          onClick={() => { downloadCsv("all_registrations.csv", regRows()); }}>
          <Download className="size-4" /> All registrations till date ({registrations.length})
        </button>
      </div>
      {exams.map((e) => {
        const regs = registrations.filter((r) => r.examId === e.id).length;
        const res = results.filter((r) => r.examId === e.id).length;
        const max = e.questions.reduce((s, _, i) => s + markingOf(e, i).correct, 0);
        const open = isRegOpen(e);
        return (
          <div key={e.id} className="rounded-2xl bg-secondary/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{e.name}</p>
                <p className="text-xs text-muted-foreground">{e.questions.length} Qs · Max {max} · {regs} registered · {res} results</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${open ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                {open ? "Registration open" : "Registration closed"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className={btn} onClick={() => downloadPaper(e, false)}><FileText className="size-3.5" /> Question paper</button>
              <button className={btn} onClick={() => downloadPaper(e, true)}><KeyRound className="size-3.5" /> Answer key + marking</button>
              <button className={btn} onClick={() => downloadCsv(`${e.id}_marking_scheme.csv`, [["Q", "Subject", "Question", "Correct option", "+Marks", "Wrong marks"], ...e.questions.map((q, i) => { const m = markingOf(e, i); return [i + 1, q.subject, q.text, "ABCDEF"[q.answer], m.correct, m.wrong]; })])}><Download className="size-3.5" /> Marking scheme (CSV)</button>
              <button className={btn} onClick={() => downloadCsv(`${e.id}_results.csv`, resultRows(e.id))}><Trophy className="size-3.5" /> Results sheet</button>
              <button className={btn} onClick={() => downloadCsv(`${e.id}_registrations.csv`, regRows(e.id))}><Users className="size-3.5" /> Registrations</button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <CalendarClock className="size-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Deadline:</span>
              <input type="datetime-local" className={input} value={toLocalInput(e.regDeadline)}
                onChange={(ev) => ev.target.value && setDeadline(e.id, new Date(ev.target.value).toISOString())} />
              <button className={btn} onClick={() => setDeadline(e.id, tomorrow())}>Tomorrow</button>
              <button className={btn} onClick={() => { const d = new Date(); d.setDate(d.getDate() + 7); d.setHours(23, 59, 0, 0); setDeadline(e.id, d.toISOString()); }}>In 7 days</button>
              <button className={btn} onClick={() => setDeadline(e.id, new Date().toISOString())}>Close now</button>
              {e.regDeadline && <button className={btn} onClick={() => setDeadline(e.id, undefined)}>Remove</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
