import { useState, type ReactNode } from "react";
import { PortalCtx as Ctx, type Store } from "./portal-context";
import { seedExams } from "@/data/exams";

export type Notice = { id: string; title: string; body: string; audience: string; time: string };
export type Material = { id: string; title: string; subject: string; track: string; cls: string; topic: string; size: string };
export type Registration = {
  id: string;
  examId: string;
  slotId: string;
  name: string;
  college: string;
  cls: string;
  email: string;
  hallTicket: string;
  studentId: string;
};
export type ExamResult = { examId: string; score: number; max: number; correct: number; wrong: number; skipped: number; violations: number };

const seedNotices: Notice[] = [
  { id: "n0", title: "Mock exam registration is open", body: "JEE Main Mock 4, MHT-CET Mock 2 and NEET Mock 3 — book your slot on the Exams page.", audience: "Students", time: "Today" },
  { id: "n1", title: "Parent–Teacher Meeting", body: "Saturday 4 Oct, 10:00 AM at the main campus hall.", audience: "Parents", time: "Today" },
  { id: "n2", title: "JEE Mock 3 scheduled", body: "Sunday 5 Oct, 9:00 AM. Reporting time 8:30 AM.", audience: "All", time: "Yesterday" },
  { id: "n3", title: "Diwali break", body: "Classes pause 18–22 Oct. Self-study packets will be shared.", audience: "All", time: "2 days ago" },
];

const seedMaterials: Material[] = [
  { id: "m1", title: "Electromagnetic Induction — Master Notes", subject: "Physics", track: "JEE", cls: "Class 12", topic: "Electromagnetism", size: "2.4 MB" },
  { id: "m2", title: "Rotational Dynamics Problem Bank", subject: "Physics", track: "JEE", cls: "Class 12", topic: "Mechanics", size: "1.9 MB" },
  { id: "m3", title: "Chemical Kinetics Summary", subject: "Chemistry", track: "MHT-CET", cls: "Class 12", topic: "Physical Chemistry", size: "1.1 MB" },
  { id: "m4", title: "Named Reactions Chart", subject: "Chemistry", track: "JEE", cls: "Class 12", topic: "Organic Chemistry", size: "780 KB" },
  { id: "m5", title: "Definite Integration Formula Bank", subject: "Maths", track: "JEE", cls: "Class 12", topic: "Calculus", size: "820 KB" },
  { id: "m6", title: "3D Geometry Practice Set", subject: "Maths", track: "MHT-CET", cls: "Class 12", topic: "Vectors & 3D", size: "1.3 MB" },
];

export function PortalProvider({ children }: { children: ReactNode }) {
  const [notices, setNotices] = useState(seedNotices);
  const [materials, setMaterials] = useState(seedMaterials);
  const [exams, setExams] = useState(seedExams);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);

  function register(r: Omit<Registration, "id" | "hallTicket">) {
    const reg: Registration = {
      ...r,
      id: crypto.randomUUID(),
      hallTicket: `KA-${r.examId.slice(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 89999)}`,
    };
    setRegistrations((l) => [...l.filter((x) => x.examId !== r.examId), reg]);
    setExams((l) =>
      l.map((e) =>
        e.id === r.examId
          ? { ...e, slots: e.slots.map((s) => (s.id === r.slotId ? { ...s, booked: s.booked + 1 } : s)) }
          : e,
      ),
    );
    return reg;
  }

  return (
    <Ctx.Provider
      value={{
        notices,
        addNotice: (n) => setNotices((l) => [{ ...n, id: crypto.randomUUID(), time: "Just now" }, ...l]),
        materials,
        addMaterial: (m) => setMaterials((l) => [{ ...m, id: crypto.randomUUID() }, ...l]),
        exams,
        registrations,
        register,
        addExam: (e) => setExams((l) => [e, ...l.filter((x) => x.id !== e.id)]),
        results,
        addResult: (r) => setResults((l) => [...l.filter((x) => x.examId !== r.examId), r]),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

