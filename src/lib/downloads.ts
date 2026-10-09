import type { Exam } from "@/data/exams";

function save(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export function downloadCsv(name: string, rows: (string | number)[][]) {
  save(name, "\uFEFF" + rows.map((r) => r.map(esc).join(",")).join("\n"), "text/csv;charset=utf-8");
}

const html = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const L = ["A", "B", "C", "D", "E", "F"];

export function markingOf(exam: Exam, i: number) {
  return exam.questions[i]?.marks ?? exam.marking;
}

export function downloadPaper(exam: Exam, withKey: boolean) {
  const total = exam.questions.reduce((s, _, i) => s + markingOf(exam, i).correct, 0);
  const body = exam.questions
    .map((q, i) => {
      const m = markingOf(exam, i);
      const opts = q.options
        .map((o, j) => `<li${withKey && j === q.answer ? ' class="ok"' : ""}>(${L[j]}) ${html(o)}</li>`)
        .join("");
      return `<div class="q"><p><b>Q${i + 1}.</b> ${html(q.text)} <span class="m">[${q.subject} · +${m.correct} / ${m.wrong}]</span></p><ul>${opts}</ul>${withKey ? `<p class="ans">Answer: (${L[q.answer]}) ${html(q.options[q.answer] ?? "")}</p>` : ""}</div>`;
    })
    .join("");
  const doc = `<!doctype html><html><head><meta charset="utf-8"><title>${html(exam.name)}${withKey ? " — Answer Key" : ""}</title><style>body{font-family:Georgia,serif;max-width:800px;margin:30px auto;padding:0 20px}h1{margin:0}.meta{color:#555;font-size:13px;border-bottom:1px solid #999;padding-bottom:10px}.q{margin:16px 0;page-break-inside:avoid}ul{list-style:none;padding-left:18px;margin:6px 0}.m{color:#666;font-size:12px}.ok{font-weight:bold;color:#0a7a2f}.ans{color:#0a7a2f;font-size:13px;margin:4px 0 0 18px}</style></head><body><h1>Koyana Academy — ${html(exam.name)}${withKey ? " (Answer Key)" : ""}</h1><p class="meta">${exam.pattern} · ${exam.durationMin} min · ${exam.questions.length} questions · Max marks ${total} · Marking shown per question as +correct / wrong</p>${body}<script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`;
  save(`${exam.name.replace(/\W+/g, "_")}_${withKey ? "answer_key" : "question_paper"}.html`, doc, "text/html");
}

/** Registration is open when there is no deadline or the deadline is in the future. */
export function isRegOpen(exam: Pick<Exam, "regDeadline">, now = Date.now()) {
  return !exam.regDeadline || new Date(exam.regDeadline).getTime() > now;
}

export function deadlineLabel(exam: Exam) {
  if (!exam.regDeadline) return `Registration closes ${exam.regCloses}`;
  const d = new Date(exam.regDeadline);
  if (!isRegOpen(exam)) return "Registration closed";
  return `Registration closes ${d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`;
}
