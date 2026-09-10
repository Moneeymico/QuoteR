"use client";

import type { Flag } from "@/types/analysis";

const SEVERITY_STYLES: Record<Flag["severity"], string> = {
  info: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  missing_info: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const SEVERITY_LABEL: Record<Flag["severity"], string> = {
  info: "Info",
  warning: "Warning",
  missing_info: "Missing info",
};

export function FlagsList({ flags }: { flags: Flag[] }) {
  if (flags.length === 0) {
    return <p className="text-sm text-zinc-400">No issues flagged.</p>;
  }

  const order: Flag["severity"][] = ["missing_info", "warning", "info"];
  const sorted = [...flags].sort(
    (a, b) => order.indexOf(a.severity) - order.indexOf(b.severity)
  );

  return (
    <ul className="flex flex-col gap-2">
      {sorted.map((flag, i) => (
        <li
          key={i}
          className="flex items-start gap-3 rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
        >
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_STYLES[flag.severity]}`}
          >
            {SEVERITY_LABEL[flag.severity]}
          </span>
          <span className="text-zinc-700 dark:text-zinc-300">
            {flag.message}
            {flag.related_trade && (
              <span className="text-zinc-400"> — {flag.related_trade}</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
