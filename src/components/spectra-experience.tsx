"use client";

import { motion } from "framer-motion";
import { BrainCircuit, CircleDot, Sparkles } from "lucide-react";
import { SpectraField } from "@/components/spectra-field";
import { useSpectraEvents } from "@/lib/events/use-spectra-events";

const modeCopy = {
  agent_thinking: "Cognition field",
  tool_call: "Tool resonance",
  file_written: "Matter imprint",
  task_completed: "Completion bloom",
  git_commit: "Repository imprint",
  build_started: "Build ignition",
  build_completed: "Build resonance",
  error_state: "Fault bloom"
} as const;

export function SpectraExperience() {
  const { latestEvent, eventLog } = useSpectraEvents();
  const mode = latestEvent ? modeCopy[latestEvent.type] : "Ambient standby";

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-void text-white">
      <SpectraField latestEvent={latestEvent} />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(57,255,215,0.09),transparent_28%),radial-gradient(circle_at_15%_70%,rgba(255,107,61,0.1),transparent_24%),radial-gradient(circle_at_78%_20%,rgba(143,92,255,0.13),transparent_22%),linear-gradient(180deg,rgba(3,3,7,0.02),rgba(3,3,7,0.88))]" />
      <div className="pointer-events-none absolute inset-0 spectra-vignette" />
      <div className="pointer-events-none absolute inset-0 scanline opacity-[0.11]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-white/[0.055] to-transparent" />

      <section className="relative z-10 flex h-full min-h-[680px] flex-col justify-between px-6 py-6 sm:px-10 lg:px-14">
        <nav className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-plasma/35 bg-plasma/10 shadow-glow">
              <Sparkles className="h-4 w-4 text-plasma" />
              <span className="absolute inset-0 rounded-full border border-plasma/20 blur-sm" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.34em] text-white/84">
                Spectra
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/38">
                Agent visual cortex
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.7, ease: "easeOut" }}
            className="hidden items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-plasma/75 sm:flex"
          >
            <span className="h-2 w-2 rounded-full bg-plasma shadow-[0_0_18px_rgba(57,255,215,0.9)]" />
            Live mock stream
          </motion.div>
        </nav>

        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.45fr)]">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.9, ease: "easeOut" }}
            className="max-w-4xl pt-16 sm:pt-24 lg:pt-8"
          >
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.48em] text-ember/90">
              Terminal activity to luminous intelligence
            </p>
            <h1 className="max-w-4xl text-6xl font-black leading-[0.86] text-white sm:text-8xl lg:text-[9.5rem]">
              Spectra
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/68 sm:text-xl">
              A cinematic second-monitor field for autonomous coding agents,
              terminal workflows, and background LLM execution.
            </p>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28, duration: 0.8, ease: "easeOut" }}
            className="ml-auto w-full max-w-sm pl-6"
          >
            <div className="mb-8 flex items-center gap-4 border-l border-plasma/25 pl-5">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-plasma/20 bg-plasma/[0.035] shadow-[0_0_56px_rgba(57,255,215,0.2)]">
                <BrainCircuit className="h-6 w-6 text-plasma" />
                <span className="absolute inset-[-10px] rounded-full border border-plasma/[0.07]" />
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-white/42">
                  Current state
                </p>
                <p className="mt-1 text-xl font-semibold text-white">{mode}</p>
              </div>
            </div>

            <div className="space-y-5 border-l border-white/[0.07] pl-5">
              {eventLog.length === 0 ? (
                <EventRow
                  icon={<CircleDot className="h-4 w-4" />}
                  label="Awaiting signal"
                  detail="Bootstrapping ambient stream"
                />
              ) : (
                eventLog.slice(0, 3).map((event) => (
                  <EventRow
                    key={event.id}
                    icon={<CircleDot className="h-4 w-4" />}
                    label={event.label}
                    detail={event.detail}
                  />
                ))
              )}
            </div>
          </motion.aside>
        </div>

        <motion.footer
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.8, ease: "easeOut" }}
          className="grid gap-4 pb-1 font-mono text-[10px] uppercase tracking-[0.24em] text-white/40 sm:grid-cols-3"
        >
          <span>Ambient event field active</span>
          <span className="sm:text-center">Neural lattice breathing</span>
          <span className="sm:text-right">Terminal signal layer prepared</span>
        </motion.footer>
      </section>
    </main>
  );
}

function EventRow({
  icon,
  label,
  detail
}: {
  icon: React.ReactNode;
  label: string;
  detail: string;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-plasma/[0.045] text-plasma/70 shadow-[0_0_22px_rgba(57,255,215,0.12)]">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-white/84">
          {label}
        </span>
        <span className="mt-1 block truncate font-mono text-[10px] uppercase tracking-[0.16em] text-white/36">
          {detail}
        </span>
      </span>
    </motion.div>
  );
}
