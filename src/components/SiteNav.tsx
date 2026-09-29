import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

const modes = [
  { to: "/", label: "Public Academy Portal", short: "Academy" },
  { to: "/parent-portal", label: "Parent Progress Portal", short: "Parent" },
] as const;

export function SiteNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className="glass-strong pointer-events-auto flex w-full max-w-4xl items-center justify-between gap-3 rounded-full px-3 py-2 sm:px-4">
        <Link to="/" className="flex items-center gap-2 pl-1">
          <span className="neon-surface flex size-8 items-center justify-center rounded-full">
            <GraduationCap className="size-4" />
          </span>
          <span className="hidden font-display text-sm font-semibold tracking-tight sm:block">
            Koyana Academy
          </span>
        </Link>

        <div className="flex items-center gap-1 rounded-full bg-secondary/60 p-1">
          <span className="hidden px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground md:block">
            Demo mode
          </span>
          {modes.map((mode) => {
            const active = pathname === mode.to;
            return (
              <Link
                key={mode.to}
                to={mode.to}
                className="relative rounded-full px-3 py-1.5 text-xs font-semibold sm:px-4 sm:text-sm"
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
      </nav>
    </div>
  );
}
