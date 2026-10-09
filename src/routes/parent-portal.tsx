import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Download,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { SiteNav } from "@/components/SiteNav";
import { Counter, Modal, Reveal } from "@/components/motion";
import student from "@/assets/topper-1.jpg";
import { celebrate } from "@/lib/celebrate";
import { usePortal } from "@/lib/use-portal";

export const Route = createFileRoute("/parent-portal")({
  head: () => ({
    meta: [
      { title: "Parent Progress Portal — Koyana Academy" },
      {
        name: "description",
        content:
          "Track attendance, test performance, homework, fees and faculty messages for your child at Koyana Academy.",
      },
      { property: "og:title", content: "Parent Progress Portal — Koyana Academy" },
      {
        property: "og:description",
        content: "Attendance, mock-test scores, homework and fee status in one dashboard.",
      },
    ],
  }),
  component: ParentPortal,
});

const tabs = [
  { id: "overview", label: "Executive Overview", icon: LayoutDashboard },
  { id: "attendance", label: "Attendance Tracker", icon: CalendarCheck },
  { id: "tests", label: "Test & Exam Performance", icon: TrendingUp },
  { id: "homework", label: "Homework & Material", icon: BookOpen },
  { id: "messages", label: "Teachers & Alerts", icon: MessageSquare },
  { id: "fees", label: "Fee Management", icon: CreditCard },
] as const;

type TabId = (typeof tabs)[number]["id"];

const metrics = [
  { label: "Attendance", value: 92, suffix: "%", note: "36 of 39 sessions" },
  { label: "Average Test Score", value: 78, suffix: "%", note: "Last 5 mocks" },
  { label: "Batch Rank", value: 15, prefix: "#", note: "out of 120 students" },
  { label: "Homework Completed", value: 85, suffix: "%", note: "34 of 40 tasks" },
];

const scoreTrend = [
  { test: "Mock 1", score: 62 },
  { test: "Mock 2", score: 68 },
  { test: "Mock 3", score: 74 },
  { test: "Mock 4", score: 81 },
  { test: "Mock 5", score: 86 },
];

const subjectAttendance = [
  { subject: "Physics", attended: 12, total: 13 },
  { subject: "Chemistry", attended: 13, total: 13 },
  { subject: "Mathematics", attended: 11, total: 13 },
];

const septemberLog = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const absent = [6, 13, 21].includes(day);
  const weekend = [6, 13, 20, 27].includes(day) && false;
  return { day, status: absent ? "Absent" : weekend ? "Holiday" : "Present" };
});

const testRows = [
  { name: "Weekly Test 1", subject: "Physics", marks: "82/100", pct: 82, rank: 12 },
  { name: "Weekly Test 2", subject: "Mathematics", marks: "74/100", pct: 74, rank: 22 },
  { name: "JEE Mock 1", subject: "PCM", marks: "212/300", pct: 71, rank: 18 },
  { name: "MHT-CET Prep 2", subject: "PCM", marks: "158/200", pct: 79, rank: 15 },
  { name: "JEE Mock 2", subject: "PCM", marks: "245/300", pct: 82, rank: 9 },
];

const subjectCompare = [
  { subject: "Mechanics", rahul: 70, batch: 66 },
  { subject: "Rotational", rahul: 48, batch: 61 },
  { subject: "Organic", rahul: 86, batch: 70 },
  { subject: "Physical Chem", rahul: 80, batch: 72 },
  { subject: "Calculus", rahul: 58, batch: 67 },
  { subject: "Algebra", rahul: 84, batch: 75 },
];
const assignments = [
  { title: "Rotational Dynamics DPP 7", subject: "Physics", due: "3 Oct", status: "Pending" },
  { title: "Organic Named Reactions Sheet", subject: "Chemistry", due: "30 Sep", status: "Completed" },
  { title: "Definite Integration Exercise 4B", subject: "Mathematics", due: "2 Oct", status: "Pending" },
  { title: "Electrostatics Revision Set", subject: "Physics", due: "27 Sep", status: "Completed" },
];

const initialChat = [
  { from: "faculty" as const, name: "Prof. Deshpande (Physics)", text: "Rahul's numericals have improved, but rotational motion still needs drilling." },
  { from: "parent" as const, name: "You", text: "Thank you sir. Should we join the extra Saturday batch?" },
  { from: "faculty" as const, name: "Prof. Deshpande (Physics)", text: "Yes, that would help. I have added him to the 4 PM slot." },
];

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass rounded-3xl p-6 ${className}`}>{children}</div>;
}

function ParentPortal() {
  const [tab, setTab] = useState<TabId>("overview");
  const [homeworkTab, setHomeworkTab] = useState<"assignments" | "notes">("assignments");
  const [testFilter, setTestFilter] = useState("All");
  const [chat, setChat] = useState(initialChat);
  const [draft, setDraft] = useState("");
  const [paid, setPaid] = useState(false);
  const { notices, materials: notes } = usePortal();
  const [payModal, setPayModal] = useState(false);

  const filteredTests =
    testFilter === "All" ? testRows : testRows.filter((t) => t.subject === testFilter);

  function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    setChat((c) => [...c, { from: "parent", name: "You", text: draft.trim() }]);
    setDraft("");
  }

  function payNow() {
    setPaid(true);
    setPayModal(true);
    celebrate({ x: 0.5, y: 0.5 });
  }

  return (
    <div className="hero-aura min-h-screen">
      <SiteNav />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 pb-16 pt-28 lg:pt-32">
        {/* Side navigation */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="glass sticky top-28 rounded-3xl p-3">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium"
                >
                  {active && (
                    <motion.span
                      layoutId="side-pill"
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                      className="neon-surface absolute inset-0 rounded-2xl"
                    />
                  )}
                  <Icon
                    className={`relative size-4 ${active ? "text-primary-foreground" : "text-muted-foreground"}`}
                  />
                  <span className={active ? "relative text-primary-foreground" : "relative text-muted-foreground"}>
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {/* Mobile tabs */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2 lg:hidden">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${
                  tab === t.id ? "neon-surface" : "glass text-muted-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Student header */}
          <GlassCard className="mb-6 flex flex-wrap items-center gap-5">
            <img
              src={student}
              alt="Rahul Patil"
              loading="lazy"
              width={816}
              height={816}
              className="size-16 rounded-2xl object-cover object-top"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Parent view · Sanjay Patil
              </p>
              <h1 className="font-display text-2xl font-bold">Rahul Patil</h1>
              <p className="text-sm text-muted-foreground">
                Class 12 · JEE Main + Advanced · Batch A2 · ID KA-2026-0184
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-success/15 px-4 py-2 text-sm font-semibold text-success">
              <Sparkles className="size-4" /> On track
            </span>
          </GlassCard>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              {tab === "overview" && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {metrics.map((m, i) => (
                      <motion.div
                        key={m.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        whileHover={{ y: -6 }}
                      >
                        <GlassCard className="h-full">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            {m.label}
                          </p>
                          <p className="neon-text mt-2 font-display text-3xl font-bold">
                            <Counter value={m.value} prefix={m.prefix ?? ""} suffix={m.suffix ?? ""} />
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">{m.note}</p>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </div>

                  <GlassCard>
                    <h2 className="font-display text-lg font-semibold">
                      Weekly mock test progress
                    </h2>
                    <div className="mt-6 h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={scoreTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="test" stroke="var(--muted-foreground)" fontSize={12} />
                          <YAxis domain={[40, 100]} stroke="var(--muted-foreground)" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              background: "var(--popover)",
                              border: "1px solid var(--border)",
                              borderRadius: 12,
                              color: "var(--popover-foreground)",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke="var(--chart-1)"
                            strokeWidth={3}
                            dot={{ r: 5, fill: "var(--chart-1)" }}
                            activeDot={{ r: 7 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassCard>
                </>
              )}

              {tab === "attendance" && (
                <>
                  <div className="grid gap-6 lg:grid-cols-3">
                    <GlassCard className="flex flex-col items-center justify-center">
                      <div className="relative size-40">
                        <svg viewBox="0 0 120 120" className="size-40 -rotate-90">
                          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--secondary)" strokeWidth="12" />
                          <motion.circle
                            cx="60"
                            cy="60"
                            r="52"
                            fill="none"
                            stroke="var(--chart-1)"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 52}
                            initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - 0.92) }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="neon-text font-display text-3xl font-bold">
                            <Counter value={92} suffix="%" />
                          </span>
                          <span className="text-xs text-muted-foreground">Overall</span>
                        </div>
                      </div>
                    </GlassCard>

                    <GlassCard className="lg:col-span-2">
                      <h2 className="font-display text-lg font-semibold">Subject breakdown</h2>
                      <div className="mt-6 space-y-5">
                        {subjectAttendance.map((s, i) => (
                          <div key={s.subject}>
                            <div className="flex justify-between text-sm">
                              <span>{s.subject}</span>
                              <span className="text-muted-foreground">
                                {s.attended}/{s.total} lectures
                              </span>
                            </div>
                            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-secondary">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(s.attended / s.total) * 100}%` }}
                                transition={{ duration: 0.9, delay: i * 0.12 }}
                                className="neon-surface h-full rounded-full"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  </div>

                  <GlassCard>
                    <h2 className="font-display text-lg font-semibold">September 2026 log</h2>
                    <div className="mt-5 grid grid-cols-6 gap-2 sm:grid-cols-10">
                      {septemberLog.map((d, i) => (
                        <motion.div
                          key={d.day}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.015 }}
                          className={`rounded-xl border p-2 text-center text-xs ${
                            d.status === "Absent"
                              ? "border-destructive/40 bg-destructive/15 text-destructive"
                              : "border-success/30 bg-success/10 text-success"
                          }`}
                        >
                          <div className="font-semibold">{d.day}</div>
                          <div className="text-[10px] opacity-80">{d.status.slice(0, 3)}</div>
                        </motion.div>
                      ))}
                    </div>
                  </GlassCard>
                </>
              )}

              {tab === "tests" && (
                <>
                  <GlassCard>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="font-display text-lg font-semibold">Test history</h2>
                      <div className="flex flex-wrap gap-2">
                        {["All", "Physics", "Mathematics", "PCM"].map((f) => (
                          <button
                            key={f}
                            onClick={() => setTestFilter(f)}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                              testFilter === f ? "neon-surface" : "bg-secondary/60 text-muted-foreground"
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mt-5 overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                          <tr>
                            <th className="py-3">Test</th>
                            <th className="py-3">Subject</th>
                            <th className="py-3">Marks</th>
                            <th className="py-3">%</th>
                            <th className="py-3">Batch rank</th>
                          </tr>
                        </thead>
                        <tbody>
                          <AnimatePresence mode="popLayout">
                            {filteredTests.map((t) => (
                              <motion.tr
                                key={t.name}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="border-t border-border"
                              >
                                <td className="py-3 font-medium">{t.name}</td>
                                <td className="py-3 text-muted-foreground">{t.subject}</td>
                                <td className="py-3">{t.marks}</td>
                                <td className="py-3 text-primary">{t.pct}%</td>
                                <td className="py-3 text-muted-foreground">#{t.rank} / 120</td>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </div>
                  </GlassCard>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <GlassCard>
                      <h2 className="font-display text-lg font-semibold">Rahul vs batch average</h2>
                      <div className="mt-6 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={subjectCompare} outerRadius="75%">
                            <PolarGrid stroke="var(--border)" />
                            <PolarAngleAxis dataKey="subject" stroke="var(--muted-foreground)" fontSize={11} />
                            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                            <Tooltip
                              contentStyle={{
                                background: "var(--popover)",
                                border: "1px solid var(--border)",
                                borderRadius: 12,
                              }}
                            />
                            <Legend />
                            <Radar dataKey="batch" name="Batch avg" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.2} />
                            <Radar dataKey="rahul" name="Rahul" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.35} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </GlassCard>

                    <GlassCard>
                      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                        <AlertTriangle className="size-5 text-warning" /> Areas needing attention
                      </h2>
                      <ul className="mt-5 space-y-3 text-sm">
                        {[
                          "Physics — Rotational Motion (avg 48%)",
                          "Mathematics — Definite Integration (avg 54%)",
                          "Chemistry — Electrochemistry numericals (avg 58%)",
                        ].map((item) => (
                          <li
                            key={item}
                            className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-warning"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 text-sm text-muted-foreground">
                        Faculty has added Rahul to the Saturday 4 PM remedial slot for these topics.
                      </p>
                    </GlassCard>
                  </div>
                </>
              )}

              {tab === "homework" && (
                <GlassCard>
                  <div className="flex gap-2">
                    {(["assignments", "notes"] as const).map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setHomeworkTab(sub)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
                          homeworkTab === sub ? "neon-surface" : "bg-secondary/60 text-muted-foreground"
                        }`}
                      >
                        {sub === "assignments" ? "Assignments" : "Study notes"}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={homeworkTab}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="mt-6 space-y-3"
                    >
                      {homeworkTab === "assignments"
                        ? assignments.map((a) => (
                            <div
                              key={a.title}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary/40 px-4 py-3"
                            >
                              <div className="flex items-center gap-3">
                                <ClipboardList className="size-4 text-primary" />
                                <div>
                                  <p className="text-sm font-medium">{a.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {a.subject} · due {a.due}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  a.status === "Completed"
                                    ? "bg-success/15 text-success"
                                    : "bg-warning/15 text-warning"
                                }`}
                              >
                                {a.status}
                              </span>
                            </div>
                          ))
                        : notes.map((n) => (
                            <div
                              key={n.title}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary/40 px-4 py-3"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="size-4 text-accent" />
                                <div>
                                  <p className="text-sm font-medium">{n.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {n.subject} · PDF · {n.size}
                                  </p>
                                </div>
                              </div>
                              <button className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold">
                                <Download className="size-3.5" /> Download
                              </button>
                            </div>
                          ))}
                    </motion.div>
                  </AnimatePresence>
                </GlassCard>
              )}

              {tab === "messages" && (
                <div className="grid gap-6 lg:grid-cols-5">
                  <GlassCard className="lg:col-span-3">
                    <h2 className="font-display text-lg font-semibold">Faculty chat</h2>
                    <div className="mt-5 max-h-96 space-y-3 overflow-y-auto pr-1">
                      {chat.map((m, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                            m.from === "parent"
                              ? "ml-auto neon-surface"
                              : "bg-secondary/60 text-foreground"
                          }`}
                        >
                          <p className="text-[11px] opacity-75">{m.name}</p>
                          <p className="mt-1">{m.text}</p>
                        </motion.div>
                      ))}
                    </div>
                    <form onSubmit={sendMessage} className="mt-5 flex gap-2">
                      <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Message Physics / Maths faculty"
                        className="flex-1 rounded-full border border-input bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:border-primary"
                      />
                      <button type="submit" className="neon-surface rounded-full px-4 py-2.5">
                        <Send className="size-4" />
                      </button>
                    </form>
                  </GlassCard>

                  <GlassCard className="lg:col-span-2">
                    <h2 className="font-display text-lg font-semibold">Institute notices</h2>
                    <div className="mt-5 space-y-3">
                      {notices.map((n) => (
                        <div key={n.title} className="rounded-2xl bg-secondary/40 px-4 py-3">
                          <p className="text-sm font-semibold text-primary">{n.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{n.body}</p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              )}

              {tab === "fees" && (
                <GlassCard>
                  <h2 className="font-display text-lg font-semibold">Fee status — 2026 session</h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    {[
                      { label: "Total fees", value: "₹1,85,000" },
                      { label: "Paid", value: paid ? "₹1,85,000" : "₹1,40,000" },
                      { label: "Due", value: paid ? "₹0" : "₹45,000" },
                    ].map((f) => (
                      <div key={f.label} className="rounded-2xl bg-secondary/40 px-4 py-4">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          {f.label}
                        </p>
                        <p className="mt-1 font-display text-xl font-bold">{f.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 h-3 overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      animate={{ width: paid ? "100%" : "76%" }}
                      transition={{ duration: 0.8 }}
                      className="neon-surface h-full rounded-full"
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {paid ? "All instalments cleared" : "Instalment 3 due on 10 Oct 2026"}
                  </p>
                  <button
                    onClick={payNow}
                    disabled={paid}
                    className="neon-surface mt-6 rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:scale-[1.02] disabled:opacity-60"
                  >
                    {paid ? "Fees fully paid" : "Pay ₹45,000 online"}
                  </button>
                </GlassCard>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Modal open={payModal} onClose={() => setPayModal(false)}>
        <div className="py-4 text-center">
          <div className="neon-surface mx-auto flex size-16 items-center justify-center rounded-full">
            <CheckCircle2 className="size-8" />
          </div>
          <h3 className="mt-5 font-display text-2xl font-bold">Payment successful</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            ₹45,000 received for Rahul Patil · Receipt KA-RCPT-4471
          </p>
          <button
            onClick={() => setPayModal(false)}
            className="glass mt-6 rounded-full px-6 py-2.5 text-sm font-semibold"
          >
            Done
          </button>
        </div>
      </Modal>

      <Reveal className="sr-only">Parent portal demo data</Reveal>
    </div>
  );
}
