import { maxMarks, qMarks, type Exam } from "@/data/exams";
import { academyInfo as A } from "@/lib/academy-info";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const L = "ABCD";

function shell(title: string, body: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>body{font-family:Georgia,serif;max-width:800px;margin:24px auto;padding:0 16px;color:#111}
h1{margin:0;font-size:22px}header{text-align:center;border-bottom:2px solid #111;padding-bottom:10px;margin-bottom:16px}
small{color:#444}table{width:100%;border-collapse:collapse;font-size:14px}td,th{border:1px solid #999;padding:6px;text-align:left}
.q{margin:14px 0;page-break-inside:avoid}.m{float:right;font-size:12px;border:1px solid #111;padding:1px 6px}
@media print{button{display:none}}</style></head><body>
<button onclick="print()">Print / Save as PDF</button>
<header><h1>${esc(A.name)}</h1><small>${esc(A.college)} · ${esc(A.address)}<br>Contact: ${esc(A.contactName)} · ${esc(A.phone)}</small>
<h2 style="margin:10px 0 0;font-size:18px">${esc(title)}</h2></header>${body}</body></html>`;
}

function download(name: string, html: string) {
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const slug = (e: Exam) => e.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export function downloadQuestionPaper(exam: Exam) {
  const qs = exam.questions
    .map((q, i) => {
      const m = qMarks(exam, q);
      return `<div class="q"><span class="m">+${m.correct} / ${m.wrong}</span><b>Q${i + 1}.</b> ${esc(q.text)} <small>(${esc(q.subject)})</small>
<ol type="A">${q.options.map((o) => `<li>${esc(o)}</li>`).join("")}</ol></div>`;
    })
    .join("");
  const body = `<p>Duration: ${exam.durationMin} min · Questions: ${exam.questions.length} · Maximum marks: ${maxMarks(exam)}</p>
<p><b>Instructions:</b> Marks for each question are shown in the box beside it (correct / wrong). Unanswered questions get 0.</p>${qs}`;
  download(`${slug(exam)}-question-paper.html`, shell(`${exam.name} — Question Paper`, body));
}

export function downloadAnswerKey(exam: Exam) {
  const rows = exam.questions
    .map((q, i) => {
      const m = qMarks(exam, q);
      return `<tr><td>${i + 1}</td><td>${esc(q.subject)}</td><td><b>${L[q.answer]}</b> — ${esc(q.options[q.answer] ?? "")}</td><td>+${m.correct}</td><td>${m.wrong}</td><td>${q.difficulty ?? "-"}</td></tr>`;
    })
    .join("");
  const body = `<p>Maximum marks: ${maxMarks(exam)} · Used to check student answers and publish results.</p>
<table><tr><th>Q</th><th>Subject</th><th>Correct answer</th><th>Correct</th><th>Wrong</th><th>Difficulty</th></tr>${rows}</table>`;
  download(`${slug(exam)}-answer-key.html`, shell(`${exam.name} — Answer Key & Marking Scheme`, body));
}
