import topper1 from "@/assets/topper-1.jpg";
import topper2 from "@/assets/topper-2.jpg";
import topper3 from "@/assets/topper-3.jpg";
import topper4 from "@/assets/topper-4.jpg";
import batch1 from "@/assets/batch-1.jpg";
import batch2 from "@/assets/batch-2.jpg";
import batch3 from "@/assets/batch-3.jpg";
import batch4 from "@/assets/batch-4.jpg";

export type ExamName = "JEE Advanced" | "JEE Main" | "MHT-CET" | "NEET";

export type Topper = {
  id: string;
  name: string;
  photo: string;
  exam: ExamName;
  headline: string;
  subline: string;
  year: string;
  quote: string;
  subjects: { label: string; score: number; outOf: number }[];
};

export const toppers: Topper[] = [
  {
    id: "t1",
    name: "Aditya Kulkarni",
    photo: topper1,
    exam: "JEE Advanced",
    headline: "AIR 14",
    subline: "IIT Bombay — Computer Science",
    year: "2026",
    quote: "Daily problem sets and doubt sessions at 9 pm changed everything for me.",
    subjects: [
      { label: "Physics", score: 108, outOf: 120 },
      { label: "Chemistry", score: 96, outOf: 120 },
      { label: "Mathematics", score: 114, outOf: 120 },
    ],
  },
  {
    id: "t2",
    name: "Sanika Deshmukh",
    photo: topper2,
    exam: "MHT-CET",
    headline: "99.98 %ile",
    subline: "State Rank 6 — PCM Group",
    year: "2026",
    quote: "The weekly mock-test analysis reports told me exactly what to repair.",
    subjects: [
      { label: "Physics", score: 49, outOf: 50 },
      { label: "Chemistry", score: 50, outOf: 50 },
      { label: "Mathematics", score: 98, outOf: 100 },
    ],
  },
  {
    id: "t3",
    name: "Rohan Jadhav",
    photo: topper3,
    exam: "JEE Main",
    headline: "99.89 %ile",
    subline: "AIR 1,120 — Session 2",
    year: "2026",
    quote: "Two years in the Excel batch, zero missed lectures. That is the whole secret.",
    subjects: [
      { label: "Physics", score: 95, outOf: 100 },
      { label: "Chemistry", score: 88, outOf: 100 },
      { label: "Mathematics", score: 99, outOf: 100 },
    ],
  },
  {
    id: "t4",
    name: "Isha Pawar",
    photo: topper4,
    exam: "NEET",
    headline: "687 / 720",
    subline: "AIR 412 — Govt. Medical College",
    year: "2026",
    quote: "Biology revision wheels and NCERT drills made recall automatic.",
    subjects: [
      { label: "Physics", score: 168, outOf: 180 },
      { label: "Chemistry", score: 172, outOf: 180 },
      { label: "Biology", score: 347, outOf: 360 },
    ],
  },
];

export const examFilters: ("All" | ExamName)[] = [
  "All",
  "JEE Advanced",
  "JEE Main",
  "MHT-CET",
  "NEET",
];

export type BatchCategory =
  | "Batch 2026 Highlights"
  | "JEE Toppers Batch"
  | "MHT-CET Super 30"
  | "Classroom Champions";

export type BatchPhoto = {
  id: string;
  title: string;
  caption: string;
  stat: string;
  category: BatchCategory;
  image: string;
};

export const batchCategories: BatchCategory[] = [
  "Batch 2026 Highlights",
  "JEE Toppers Batch",
  "MHT-CET Super 30",
  "Classroom Champions",
];

export const batchPhotos: BatchPhoto[] = [
  {
    id: "b1",
    title: "Excel Batch A1",
    caption: "Result day 2026 — every certificate earned in-house",
    stat: "100% JEE Main qualification",
    category: "Batch 2026 Highlights",
    image: batch1,
  },
  {
    id: "b2",
    title: "JEE Toppers Batch 2026",
    caption: "Felicitation night at the annual academy awards",
    stat: "18 students under AIR 5,000",
    category: "JEE Toppers Batch",
    image: batch2,
  },
  {
    id: "b3",
    title: "MHT-CET Super 30",
    caption: "The Super 30 cohort outside the Koyana campus",
    stat: "Average 98.4 percentile",
    category: "MHT-CET Super 30",
    image: batch3,
  },
  {
    id: "b4",
    title: "Classroom Champions",
    caption: "Physics masterclass with Prof. Deshpande",
    stat: "13 hours of live doubt-solving weekly",
    category: "Classroom Champions",
    image: batch4,
  },
  {
    id: "b5",
    title: "Droppers Batch D2",
    caption: "Second attempt, first-rate results",
    stat: "92% improvement over last attempt",
    category: "Batch 2026 Highlights",
    image: batch2,
  },
  {
    id: "b6",
    title: "Foundation Stars",
    caption: "Class 11 integrated batch orientation",
    stat: "240+ students enrolled",
    category: "Classroom Champions",
    image: batch1,
  },
];

export const heroStats = [
  { label: "Highest MHT-CET", value: 99.98, suffix: " %ile", decimals: 2 },
  { label: "Best JEE Advanced Rank", value: 14, prefix: "AIR ", decimals: 0 },
  { label: "Selection Rate", value: 98, suffix: "%", decimals: 0 },
  { label: "Selections since 2018", value: 1240, suffix: "+", decimals: 0 },
];

export const courses = [
  {
    name: "11th + 12th Integrated",
    tag: "2-year programme",
    blurb: "Board syllabus and entrance prep taught in one aligned timetable.",
    points: ["Dual board + entrance coverage", "Weekly parent report", "Mentor per 15 students"],
  },
  {
    name: "JEE Main / Advanced Target",
    tag: "Flagship",
    blurb: "Advanced problem labs, rank-predictor mocks and IITian faculty.",
    points: ["400+ live lectures", "Weekly Advanced-pattern mocks", "Personal rank roadmap"],
  },
  {
    name: "MHT-CET Crash Course",
    tag: "100 days",
    blurb: "Speed-first revision engine built around the state pattern.",
    points: ["60 full-length CET mocks", "Formula sprint sheets", "Percentile tracker"],
  },
  {
    name: "NEET Droppers Batch",
    tag: "Repeaters",
    blurb: "Full-day structured campus routine for one focused attempt.",
    points: ["NCERT line-by-line drills", "Biology recall wheels", "Daily test discipline"],
  },
];
