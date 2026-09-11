"use client";

import type { CoordinationEntry } from "@/types/analysis";
import { sequenceForTrade } from "@/lib/trades";

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
      {label}
    </span>
  );
}

export function SubcontractorMap({ coordination }: { coordination: CoordinationEntry[] }) {
  const sorted = [...coordination].sort(
    (a, b) => sequenceForTrade(a.trade) - sequenceForTrade(b.trade)
  );

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-zinc-400">
        No coordination dependencies were identified between trades.
      </p>
    );
  }

  return (
    <div className="relative flex flex-col gap-0">
      {sorted.map((entry, i) => (
        <div key={entry.trade} className="relative flex gap-4 pb-6 last:pb-0">
          <div className="flex flex-col items-center">
            <div className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              {i + 1}
            </div>
            {i < sorted.length - 1 && (
              <div className="w-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
            )}
          </div>

          <div className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{entry.trade}</p>

            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Waits on
                </p>
                {entry.depends_on.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {entry.depends_on.map((t) => (
                      <Chip key={t} label={t} />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400">Nothing — can start early</p>
                )}
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Blocks
                </p>
                {entry.provides_to.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {entry.provides_to.map((t) => (
                      <Chip key={t} label={t} />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400">No downstream dependents</p>
                )}
              </div>
            </div>

            {entry.notes && (
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{entry.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
