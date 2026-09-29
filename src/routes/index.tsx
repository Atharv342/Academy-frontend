import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Download,
  Mail,
  MapPin,
  Phone,
  Share2,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { SiteNav } from "@/components/SiteNav";
import { Counter, Modal, Reveal, Stagger, StaggerItem, TiltCard } from "@/components/motion";
import {
  batchCategories,
  batchPhotos,
  courses,
  examFilters,
  heroStats,
  toppers,
  type BatchCategory,
  type BatchPhoto,
  type ExamName,
  type Topper,
} from "@/data/academy";
import { celebrate } from "@/lib/celebrate";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Koyana Academy — Transforming Ambition into Top AIR Ranks" },
      {
        name: "description",
        content:
          "JEE, MHT-CET and NEET results from Koyana Academy: individual toppers, batch victories and programme details.",
      },
      { property: "og:title", content: "Koyana Academy — Top AIR Ranks, Year After Year" },
      {
        property: "og:description",
        content: "Explore the 2026 topper spotlight, batch victory gallery and coaching programmes.",
      },
    ],
  }),
  component: PublicPortal,
});

function PublicPortal() {
  const [examFilter, setExamFilter] = useState<"All" | ExamName>("All");
  const [activeTopper, setActiveTopper] = useState<Topper | null>(null);
  const [batchFilter, setBatchFilter] = useState<BatchCategory>("Batch 2026 Highlights");
  const [lightbox, setLightbox] = useState<BatchPhoto | null>(null);
  const [inquirySent, setInquirySent] = useState(false);

  const visibleToppers = useMemo(
    () => (examFilter === "All" ? toppers : toppers.filter((t) => t.exam === examFilter)),
    [examFilter],
  );
  const visibleBatches = useMemo(
    () => batchPhotos.filter((b) => b.category === batchFilter),
    [batchFilter],
  );

  function openTopper(topper: Topper) {
    setActiveTopper(topper);
    celebrate();
  }

  function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInquirySent(true);
  }

  return (
    <div className="min-h-screen">
      <SiteNav />

      {/* Hero */}
      <header className="hero-aura relative overflow-hidden px-4 pb-20 pt-32 sm:pt-40">
        <div className="mx-auto max-w-6xl text-center">
          <Reveal>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" /> Results Season 2026
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl">
              Transforming Ambition into <span className="neon-text">Top AIR Ranks</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Koyana Academy coaches Class 11 and 12 students for JEE, MHT-CET and NEET with
              mentor-led batches, weekly mock analysis and a parent portal that never leaves
              families guessing.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#toppers"
                className="neon-surface glow-ring inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:scale-[1.03]"
              >
                Explore 2026 Results <ArrowRight className="size-4" />
              </a>
              <Link
                to="/parent-portal"
                className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary/70"
              >
                Parent Portal Login
              </Link>
            </div>
          </Reveal>

          <Stagger className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {heroStats.map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="glass rounded-2xl p-5 text-left">
                  <p className="neon-text font-display text-3xl font-bold">
                    <Counter
                      value={stat.value}
                      decimals={stat.decimals}
                      prefix={stat.prefix ?? ""}
                      suffix={stat.suffix ?? ""}
                    />
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </header>

      {/* Topper spotlight */}
      <section id="toppers" className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Compartment A
          </p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Individual Topper Spotlight</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Tap any card for the full scorecard breakdown — and a small celebration.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-wrap gap-2">
            {examFilters.map((filter) => {
              const active = filter === examFilter;
              return (
                <button
                  key={filter}
                  onClick={() => setExamFilter(filter)}
                  className="relative rounded-full px-4 py-2 text-sm font-semibold"
                >
                  {active && (
                    <motion.span
                      layoutId="exam-pill"
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                      className="neon-surface absolute inset-0 rounded-full"
                    />
                  )}
                  <span className={active ? "relative text-primary-foreground" : "relative glass rounded-full text-muted-foreground"}>
                    {filter}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <motion.div layout className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {visibleToppers.map((topper) => (
              <motion.div
                key={topper.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <TiltCard
                  onClick={() => openTopper(topper)}
                  className="glass group h-full overflow-hidden rounded-3xl transition-shadow hover:glow-ring"
                >
                  <div className="relative">
                    <img
                      src={topper.photo}
                      alt={topper.name}
                      loading="lazy"
                      width={816}
                      height={816}
                      className="h-56 w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="glass-strong absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold">
                      {topper.exam}
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="neon-text font-display text-2xl font-bold">{topper.headline}</p>
                    <h3 className="mt-1 text-base font-semibold">{topper.name}</h3>
                    <p className="text-xs text-muted-foreground">{topper.subline}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {topper.subjects.map((s) => (
                        <span
                          key={s.label}
                          className="rounded-full bg-secondary/70 px-2.5 py-1 text-[11px] text-muted-foreground"
                        >
                          {s.label} {s.score}/{s.outOf}
                        </span>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Batch gallery */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Compartment B
          </p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Batch &amp; Group Victory Gallery</h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-wrap gap-2">
            {batchCategories.map((cat) => {
              const active = cat === batchFilter;
              return (
                <button
                  key={cat}
                  onClick={() => setBatchFilter(cat)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "border-transparent neon-surface"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </Reveal>

        <motion.div layout className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visibleBatches.map((batch) => (
              <motion.button
                key={batch.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setLightbox(batch)}
                className="glass group overflow-hidden rounded-3xl text-left"
              >
                <div className="relative">
                  <img
                    src={batch.image}
                    alt={batch.title}
                    loading="lazy"
                    width={1280}
                    height={832}
                    className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="glass-strong absolute bottom-3 left-3 rounded-full px-3 py-1 text-[11px] font-semibold text-primary">
                    {batch.stat}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold">{batch.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{batch.caption}</p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Courses */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <h2 className="text-3xl font-bold sm:text-4xl">Courses &amp; Programmes</h2>
        </Reveal>
        <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => (
            <StaggerItem key={course.name}>
              <motion.div
                whileHover={{ y: -8 }}
                className="glass flex h-full flex-col rounded-3xl p-6 transition-shadow hover:glow-ring"
              >
                <span className="w-fit rounded-full bg-secondary/70 px-3 py-1 text-[11px] uppercase tracking-wider text-accent">
                  {course.tag}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{course.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{course.blurb}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {course.points.map((point) => (
                    <li key={point} className="flex gap-2 text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* CTA + footer */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <div className="glass-strong grid gap-10 rounded-4xl p-8 lg:grid-cols-2 lg:p-12">
            <div>
              <h2 className="text-3xl font-bold">Book a counselling seat</h2>
              <p className="mt-3 text-muted-foreground">
                Tell us the class and target exam. Our academic head calls back within a day.
              </p>
              <div className="mt-8 space-y-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-3">
                  <Phone className="size-4 text-primary" /> +91 98765 43210
                </p>
                <p className="flex items-center gap-3">
                  <Mail className="size-4 text-primary" /> admissions@koyanaacademy.in
                </p>
                <p className="flex items-center gap-3">
                  <MapPin className="size-4 text-primary" /> Shivaji Chowk, Karad, Maharashtra
                </p>
              </div>
              <div className="mt-6 flex h-40 items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/40 text-xs uppercase tracking-widest text-muted-foreground">
                Campus map
              </div>
            </div>

            <form onSubmit={submitInquiry} className="space-y-4">
              <input
                required
                placeholder="Parent / student name"
                className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <input
                required
                type="tel"
                placeholder="Phone number"
                className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <select
                className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm outline-none focus:border-primary"
                defaultValue="JEE Main / Advanced Target"
              >
                {courses.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </select>
              <textarea
                rows={4}
                placeholder="Anything we should know?"
                className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="neon-surface w-full rounded-xl py-3 text-sm font-semibold transition-transform hover:scale-[1.01]"
              >
                Request a call back
              </button>
              <AnimatePresence>
                {inquirySent && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-sm text-success"
                  >
                    <CheckCircle2 className="size-4" /> Thanks! We will call you shortly.
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border px-4 py-10 text-center text-sm text-muted-foreground">
        <p className="font-display font-semibold text-foreground">Koyana Academy</p>
        <p className="mt-2">JEE · MHT-CET · NEET coaching since 2008</p>
        <div className="mt-4 flex justify-center gap-4 text-xs uppercase tracking-widest">
          <span>Instagram</span>
          <span>YouTube</span>
          <span>WhatsApp</span>
        </div>
      </footer>

      {/* Topper modal */}
      <Modal open={!!activeTopper} onClose={() => setActiveTopper(null)}>
        {activeTopper && (
          <div>
            <div className="flex items-center gap-4">
              <img
                src={activeTopper.photo}
                alt={activeTopper.name}
                loading="lazy"
                width={816}
                height={816}
                className="size-20 rounded-2xl object-cover object-top"
              />
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {activeTopper.exam} {activeTopper.year}
                </p>
                <h3 className="font-display text-2xl font-bold">{activeTopper.name}</h3>
                <p className="neon-text font-display text-xl font-bold">{activeTopper.headline}</p>
              </div>
            </div>
            <p className="mt-5 rounded-2xl bg-secondary/50 p-4 text-sm italic text-muted-foreground">
              “{activeTopper.quote}”
            </p>
            <div className="mt-5 space-y-4">
              {activeTopper.subjects.map((s, i) => (
                <div key={s.label}>
                  <div className="flex justify-between text-sm">
                    <span>{s.label}</span>
                    <span className="text-muted-foreground">
                      {s.score} / {s.outOf}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.score / s.outOf) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.1 * i, ease: "easeOut" }}
                      className="neon-surface h-full rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="size-4 text-accent" /> {activeTopper.subline}
            </div>
          </div>
        )}
      </Modal>

      {/* Batch lightbox */}
      <Modal open={!!lightbox} onClose={() => setLightbox(null)} wide>
        {lightbox && (
          <div>
            <img
              src={lightbox.image}
              alt={lightbox.title}
              width={1280}
              height={832}
              className="w-full rounded-2xl object-cover"
            />
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-xl font-bold">{lightbox.title}</h3>
                <p className="text-sm text-muted-foreground">{lightbox.caption}</p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm text-primary">
                  <Award className="size-4" /> {lightbox.stat}
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={lightbox.image}
                  download
                  className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                >
                  <Download className="size-4" /> Download
                </a>
                <button
                  onClick={() => celebrate({ x: 0.5, y: 0.6 })}
                  className="neon-surface inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                >
                  <Share2 className="size-4" /> Share
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
