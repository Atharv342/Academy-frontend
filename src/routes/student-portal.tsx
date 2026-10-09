import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, CalendarDays, CheckCircle2, ClipboardList, Download, LayoutDashboard, ShieldCheck, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { SiteNav } from "@/components/SiteNav";
import { Counter } from "@/components/motion";
import { usePortal } from "@/lib/use-portal";
import { celebrate } from "@/lib/celebrate";

export const Route = createFileRoute("/student-portal")({
  head: () => ({
    meta: [
      { title: "Student Portal — Koyana Academy" },
      { name: "description", content: "Study materials, assignments, test results and timetable for Koyana Academy students." },
      { property: "og:title", content: "Student Portal — Koyana Academy" },
      { property: "og:description", content: "Your notes, homework, mock scores and weekly timetable in one place." },
    ],
  }),
  component: StudentPortal,
});

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "materials", label: "Study Material", icon: BookOpen },
  { id: "assignments", label: "Assignments", icon: ClipboardList },
  { id: "tests", label: "Tests", icon: TrendingUp },
  { id: "exams", label: "Mock Exams", icon: ShieldCheck },
  { id: "timetable", label: "Timetable", icon: CalendarDays },
] as const;
type TabId = (typeof tabs)[number]["id"];

const initialAssignments = [
  { id: "a1", title: "Rotational Dynamics DPP 7", subject: "Physics", due: "3 Oct", done: false },
  { id: "a2", title: "Definite Integration Ex 4B", subject: "Maths", due: "2 Oct", done: false },
  { id: "a3", title: "Organic Named Reactions Sheet", subject: "Chemistry", due: "30 Sep", done: true },
];

const tests = [
  { test: "Mock 1", score: 62 },
  { test: "Mock 2", score: 68 },
  { test: "Mock 3", score: 74 },
  { test: "Mock 4", score: 81 },
  { test: "Mock 5", score: 86 },
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const timetable: Record<string, { time: string; subject: string; room: string }[]> = {
  Mon: [{ time: "7:30", subject: "Physics", room: "A1" }, { time: "9:30", subject: "Maths", room: "A1" }],
  Tue: [{ time: "7:30", subject: "Chemistry", room: "B2" }, { time: "9:30", subject: "Physics", room: "A1" }],
  Wed: [{ time: "7:30", subject: "Maths", room: "A1" }, { time: "9:30", subject: "Chemistry", room: "B2" }],
  Thu: [{ time: "7:30", subject: "Physics", room: "A1" }, { time: "9:30", subject: "Doubt Session", room: "Lab" }],
  Fri: [{ time: "7:30", subject: "Chemistry", room: "B2" }, { time: "9:30", subject: "Maths", room: "A1" }],
  Sat: [{ time: "9:00", subject: "Weekly Test", room: "Hall" }],
};

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass rounded-3xl p-6 ${className}`}>{children}</div>;
}

function StudentPortal() {
  const { materials, notices, exams, registrations, results } = usePortal();
  const [tab, setTab] = useState<TabId>("overview");
  const [subject, setSubject] = useState("All");
  const [assignments, setAssignments] = useState(initialAssignments);
  const [day, setDay] = useState("Mon");

  const shown = useMemo(
    () => (subject === "All" ? materials : materials.filter((m) => m.subject === subject)),
    [materials, subject],
  );

  function submit(id: string) {
    setAssignments((l) => l.map((a) => (a.id === id ? { ...a, done: true } : a)));
    toast.success("Assignment submitted");
    if (assignments.filter((a) => !a.done).length === 1) celebrate();
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-28">
        <h1 className="font-display text-3xl font-bold">Welcome back, Rahul</h1>
        <p className="text-sm text-muted-foreground">Class 12 · JEE Excel Batch A1 · ID KA-2026-0415</p>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                tab === t.id ? "neon-surface" : "glass text-muted-foreground"
              }`}
            >
              <t.icon className="size-4" /> {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mt-6"
          >
            {tab === "overview" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { l: "Attendance", v: 92, s: "%" },
                    { l: "Last mock", v: 86, s: "%" },
                    { l: "Pending tasks", v: assignments.filter((a) => !a.done).length, s: "" },
                    { l: "Batch rank", v: 15, p: "#", s: "" },
                  ].map((m) => (
                    <Card key={m.l}>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">{m.l}</p>
                      <p className="neon-text mt-2 font-display text-3xl font-bold">
                        <Counter value={m.v} prefix={m.p ?? ""} suffix={m.s} />
                      </p>
                    </Card>
                  ))}
                </div>
                <Card>
                  <h2 className="font-display text-lg font-semibold">Latest notices</h2>
                  <div className="mt-4 space-y-3">
                    {notices.slice(0, 4).map((n) => (
                      <div key={n.id} className="rounded-2xl bg-secondary/40 px-4 py-3">
                        <p className="text-sm font-semibold text-primary">{n.title}</p>
                        <p className="text-xs text-muted-foreground">{n.body} · {n.time}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {tab === "materials" && (
              <Card>
                <div className="flex flex-wrap gap-2">
                  {["All", "Physics", "Chemistry", "Maths"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSubject(s)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${subject === s ? "neon-surface" : "bg-secondary/60 text-muted-foreground"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="mt-5 space-y-3">
                  {shown.map((m) => (
                    <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary/40 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{m.title}</p>
                        <p className="text-xs text-muted-foreground">{m.subject} · {m.track} · {m.topic} · {m.size}</p>
                      </div>
                      <button
                        onClick={() => toast.success(`Downloading ${m.title}`)}
                        className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
                      >
                        <Download className="size-3.5" /> Download
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {tab === "assignments" && (
              <Card className="space-y-3">
                {assignments.map((a) => (
                  <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary/40 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.subject} · due {a.due}</p>
                    </div>
                    {a.done ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                        <CheckCircle2 className="size-3.5" /> Submitted
                      </span>
                    ) : (
                      <button onClick={() => submit(a.id)} className="neon-surface rounded-full px-4 py-1.5 text-xs font-semibold">
                        Mark submitted
                      </button>
                    )}
                  </div>
                ))}
              </Card>
            )}

            {tab === "tests" && (
              <Card>
                <h2 className="font-display text-lg font-semibold">Mock test trend</h2>
                <div className="mt-4 h-72">
                  <ResponsiveContainer>
                    <LineChart data={tests}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="test" stroke="var(--muted-foreground)" fontSize={12} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                      <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {tab === "timetable" && (
              <Card>
                <div className="flex flex-wrap gap-2">
                  {days.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDay(d)}
                      className={`rounded-full px-4 py-1.5 text-sm font-semibold ${day === d ? "neon-surface" : "bg-secondary/60 text-muted-foreground"}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <div className="mt-5 space-y-3">
                  {(timetable[day] ?? []).map((s) => (
                    <div key={s.time} className="flex items-center gap-4 rounded-2xl bg-secondary/40 px-4 py-3">
                      <span className="font-display text-lg font-bold text-primary">{s.time}</span>
                      <span className="text-sm font-medium">{s.subject}</span>
                      <span className="ml-auto text-xs text-muted-foreground">Room {s.room}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {tab === "exams" && (
              <div className="space-y-4">
                <Card className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold">Online proctored mock exams</h2>
                    <p className="text-xs text-muted-foreground">Register and book a slot, then take the exam here.</p>
                  </div>
                  <Link to="/exam-registration" className="neon-surface rounded-full px-4 py-2 text-sm font-semibold">Register for exams</Link>
                </Card>
                {exams.map((e) => {
                  const reg = registrations.find((r) => r.examId === e.id);
                  const res = results.find((r) => r.examId === e.id);
                  const slot = e.slots.find((s) => s.id === reg?.slotId);
                  return (
                    <Card key={e.id} className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{e.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {e.pattern} · {e.durationMin} min · {reg ? `Hall ticket ${reg.hallTicket} · ${slot?.date} ${slot?.time}` : `Registration closes ${e.regCloses}`}
                        </p>
                      </div>
                      {res ? (
                        <span className="rounded-full bg-success/15 px-3 py-1.5 text-xs font-semibold text-success">Score {res.score}/{res.max}</span>
                      ) : reg ? (
                        <Link to="/exam/$examId" params={{ examId: e.id }} className="neon-surface rounded-full px-4 py-1.5 text-xs font-semibold">Start exam</Link>
                      ) : (
                        <Link to="/exam-registration" className="glass rounded-full px-4 py-1.5 text-xs font-semibold">Book slot</Link>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
