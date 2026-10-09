import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { GraduationCap, LogIn } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/motion";

const modes = [
  { to: "/", label: "Academy", short: "Home" },
  { to: "/admissions", label: "Admissions", short: "Admit" },
  { to: "/exam-registration", label: "Exams", short: "Exams" },
  { to: "/student-portal", label: "Student", short: "Student" },
  { to: "/parent-portal", label: "Parent", short: "Parent" },
  { to: "/teacher-portal", label: "Teacher", short: "Teacher" },
] as const;

const demoLogins = [
  { role: "Student", id: "KA-2026-0415", to: "/student-portal" },
  { role: "Parent", id: "parent.rahul@koyana.in", to: "/parent-portal" },
  { role: "Teacher", id: "deshpande@koyana.in", to: "/teacher-portal" },
] as const;

export function SiteNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  function go(to: (typeof demoLogins)[number]["to"], role: string) {
    setOpen(false);
    toast.success(`Signed in as ${role} (demo)`);
    navigate({ to });
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const match = demoLogins.find((d) => d.id === userId.trim());
    if (!match || !password) {
      toast.error("Use one of the demo shortcuts below");
      return;
    }
    go(match.to, match.role);
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className="glass-strong pointer-events-auto flex w-full max-w-5xl items-center justify-between gap-2 rounded-full px-3 py-2">
        <Link to="/" className="flex items-center gap-2 pl-1">
          <span className="neon-surface flex size-8 items-center justify-center rounded-full">
            <GraduationCap className="size-4" />
          </span>
          <span className="hidden font-display text-sm font-semibold tracking-tight lg:block">
            Koyana Academy
          </span>
        </Link>

        <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-secondary/60 p-1">
          {modes.map((mode) => {
            const active = pathname === mode.to;
            return (
              <Link
                key={mode.to}
                to={mode.to}
                className="relative shrink-0 rounded-full px-2.5 py-1.5 text-xs font-semibold sm:px-4 sm:text-sm"
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    className="neon-surface absolute inset-0 rounded-full"
                  />
                )}
                <span
                  className={
                    active
                      ? "relative text-primary-foreground"
                      : "relative text-muted-foreground transition-colors hover:text-foreground"
                  }
                >
                  <span className="sm:hidden">{mode.short}</span>
                  <span className="hidden sm:inline">{mode.label}</span>
                </span>
              </Link>
            );
          })}
        </div>

        <button
          onClick={() => setOpen(true)}
          className="glass inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold sm:text-sm"
        >
          <LogIn className="size-4" /> <span className="hidden sm:inline">Login</span>
        </button>
      </nav>

      <div className="pointer-events-auto">
        <Modal open={open} onClose={() => setOpen(false)}>
          <h2 className="font-display text-xl font-semibold">Sign in to Koyana Academy</h2>
          <p className="mt-1 text-sm text-muted-foreground">Demo mode — any password works with a demo ID.</p>
          <form onSubmit={submit} className="mt-5 space-y-3">
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Student ID or email"
              className="w-full rounded-full border border-input bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-full border border-input bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button type="submit" className="neon-surface w-full rounded-full py-2.5 text-sm font-semibold">
              Sign in
            </button>
          </form>
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Demo shortcuts
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {demoLogins.map((d) => (
              <button
                key={d.role}
                onClick={() => go(d.to, d.role)}
                className="glass rounded-2xl px-3 py-3 text-left transition-transform hover:scale-[1.03]"
              >
                <p className="text-sm font-semibold">{d.role}</p>
                <p className="truncate text-[11px] text-muted-foreground">{d.id}</p>
              </button>
            ))}
          </div>
        </Modal>
      </div>
    </div>
  );
}
