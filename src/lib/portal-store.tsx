import { createContext, useContext, useState, type ReactNode } from "react";

export type Notice = { id: string; title: string; body: string; audience: string; time: string };
export type Material = { id: string; title: string; subject: string; track: string; cls: string; topic: string; size: string };

const seedNotices: Notice[] = [
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

type Store = {
  notices: Notice[];
  addNotice: (n: Omit<Notice, "id" | "time">) => void;
  materials: Material[];
  addMaterial: (m: Omit<Material, "id">) => void;
};

const Ctx = createContext<Store | null>(null);

export function PortalProvider({ children }: { children: ReactNode }) {
  const [notices, setNotices] = useState(seedNotices);
  const [materials, setMaterials] = useState(seedMaterials);
  return (
    <Ctx.Provider
      value={{
        notices,
        addNotice: (n) => setNotices((l) => [{ ...n, id: crypto.randomUUID(), time: "Just now" }, ...l]),
        materials,
        addMaterial: (m) => setMaterials((l) => [{ ...m, id: crypto.randomUUID() }, ...l]),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function usePortal() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePortal outside PortalProvider");
  return c;
}
