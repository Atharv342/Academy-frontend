import { createContext } from "react";
import type { Exam } from "@/data/exams";
import type { Notice, Material, Registration, ExamResult } from "./portal-store";

export type Store = {
  notices: Notice[];
  addNotice: (n: Omit<Notice, "id" | "time">) => void;
  materials: Material[];
  addMaterial: (m: Omit<Material, "id">) => void;
  exams: Exam[];
  registrations: Registration[];
  addExam: (e: Exam) => void;
  register: (r: Omit<Registration, "id" | "hallTicket">) => Registration;
  results: ExamResult[];
  addResult: (r: ExamResult) => void;
};

export const PortalCtx = createContext<Store | null>(null);

