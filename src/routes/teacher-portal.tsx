import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, Megaphone, Table2, Upload } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { SiteNav } from "@/components/SiteNav";
import { usePortal } from "@/lib/portal-store";

export const Route = createFileRoute("/teacher-portal")({
  head: () => ({
    meta: [
      { title: "Teacher & Admin Portal — Koyana Academy" },
      { name: "description", content: "Mark attendance, enter marks, upload study material and broadcast notices at Koyana Academy." },
      { property: "og:title", content: "Teacher & Admin Portal — Koyana Academy" },
      { property: "og:description", content: "Attendance, marks, uploads and notices for Koyana Academy faculty." },
    ],
  }),
  component: TeacherPortal,
});

const tabs = [
  { id: "attendance", label: "Attendance", icon: CalendarCheck },
  { id: "marks", label: "Marks Matrix", icon: Table2 },
  { id: "upload", label: "Upload Material", icon: Upload },
  { id: "notices", label: "Broadcast Notice", icon: Megaphone },
] as const;
type TabId = (typeof tabs)[number]["id"];

const students = ["Rahul Patil", "Sneha Kale", "Omkar Shinde", "Priya Joshi", "Aarav More", "Tanvi Gaikwad"];
const subjects = ["Physics", "Chemistry", "Maths"];

const input = "w-full rounded-xl border border-input bg-secondary/50 px-3 py-2 text-sm outline-none focus:border-primary";

function TeacherPortal() {
  const { addNotice, addMaterial, notices, materials } = usePortal();
  const [tab, setTab] = useState<TabId>("attendance");
  const [present, setPresent] = useState<Record<string, boolean>>(Object.fromEntries(students.map((s) => [s, true])));
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [mat, setMat] = useState({ title: "", subject: "Physics", track: "JEE", topic: "" });
  const [notice, setNotice] = useState({ title: "", body: "", audience: "All" });

  function saveMaterial(e: FormEvent) {
    e.preventDefault();
    if (!mat.title.trim()) { toast.error("Add a title"); return; }
    addMaterial({ ...mat, cls: "Class 12", size: "1.0 MB" });
    setMat({ ...mat, title: "", topic: "" });
    toast.success("Material published to students");
  }

  function sendNotice(e: FormEvent) {
    e.preventDefault();
    if (!notice.title.trim() || !notice.body.trim()) { toast.error("Fill in title and message"); return; }
    addNotice(notice);
    setNotice({ title: "", body: "", audience: "All" });
    toast.success("Notice sent to student and parent portals");
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-28">
        <h1 className="font-display text-3xl font-bold">Faculty desk — Prof. Deshpande</h1>
        <p className="text-sm text-muted-foreground">JEE Excel Batch A1 · 6 students shown (demo)</p>

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
            className="glass mt-6 rounded-3xl p-6"
          >
            {tab === "attendance" && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  {students.map((s) => (
                    <button
                      key={s}
                      onClick={() => setPresent((p) => ({ ...p, [s]: !p[s] }))}
                      className="flex items-center justify-between rounded-2xl bg-secondary/40 px-4 py-3 text-left"
                    >
                      <span className="text-sm font-medium">{s}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${present[s] ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                        {present[s] ? "Present" : "Absent"}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => toast.success(`Attendance saved: ${Object.values(present).filter(Boolean).length}/${students.length} present`)}
                  className="neon-surface mt-5 rounded-full px-5 py-2.5 text-sm font-semibold"
                >
                  Save attendance
                </button>
              </>
            )}

            {tab === "marks" && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground">
                        <th className="py-2 pr-3">Student</th>
                        {subjects.map((s) => <th key={s} className="px-2 py-2">{s} /100</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((st) => (
                        <tr key={st} className="border-t border-border">
                          <td className="py-2 pr-3 font-medium">{st}</td>
                          {subjects.map((sub) => (
                            <td key={sub} className="px-2 py-2">
                              <input
                                inputMode="numeric"
                                value={marks[`${st}-${sub}`] ?? ""}
                                onChange={(e) => setMarks((m) => ({ ...m, [`${st}-${sub}`]: e.target.value.replace(/\D/g, "").slice(0, 3) }))}
                                className={`${input} w-20`}
                                placeholder="—"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button onClick={() => toast.success("Marks published to parent portal")} className="neon-surface mt-5 rounded-full px-5 py-2.5 text-sm font-semibold">
                  Publish marks
                </button>
              </>
            )}

            {tab === "upload" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <form onSubmit={saveMaterial} className="space-y-3">
                  <input className={input} placeholder="Title, e.g. Thermodynamics Notes" value={mat.title} onChange={(e) => setMat({ ...mat, title: e.target.value })} />
                  <input className={input} placeholder="Topic" value={mat.topic} onChange={(e) => setMat({ ...mat, topic: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <select className={input} value={mat.subject} onChange={(e) => setMat({ ...mat, subject: e.target.value })}>
                      {subjects.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <select className={input} value={mat.track} onChange={(e) => setMat({ ...mat, track: e.target.value })}>
                      {["JEE", "MHT-CET", "NEET"].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <button className="neon-surface rounded-full px-5 py-2.5 text-sm font-semibold">Publish material</button>
                </form>
                <div className="space-y-2">
                  {materials.slice(0, 5).map((m) => (
                    <div key={m.id} className="rounded-2xl bg-secondary/40 px-4 py-2.5 text-sm">
                      {m.title} <span className="text-xs text-muted-foreground">· {m.subject}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "notices" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <form onSubmit={sendNotice} className="space-y-3">
                  <input className={input} placeholder="Notice title" value={notice.title} onChange={(e) => setNotice({ ...notice, title: e.target.value })} />
                  <textarea className={`${input} min-h-28`} placeholder="Message" value={notice.body} onChange={(e) => setNotice({ ...notice, body: e.target.value })} />
                  <select className={input} value={notice.audience} onChange={(e) => setNotice({ ...notice, audience: e.target.value })}>
                    {["All", "Students", "Parents"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <button className="neon-surface rounded-full px-5 py-2.5 text-sm font-semibold">Broadcast</button>
                </form>
                <div className="space-y-2">
                  {notices.map((n) => (
                    <div key={n.id} className="rounded-2xl bg-secondary/40 px-4 py-3">
                      <p className="text-sm font-semibold text-primary">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.audience} · {n.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
