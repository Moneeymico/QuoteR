"use client";

import { useState } from "react";
import type { TradeResult } from "@/types/analysis";
import { sequenceForTrade } from "@/lib/trades";

function TradeCard({ trade }: { trade: TradeResult }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="shrink-0 rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            Div {trade.csi_division}
          </span>
          <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">
            {trade.trade_name}
          </span>
          {trade.subcontractor_needed && (
            <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              Subcontractor
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2 text-sm text-zinc-500">
          <span>{trade.scope_items.length} item{trade.scope_items.length === 1 ? "" : "s"}</span>
          <span className={`transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
          {trade.notes && (
            <p className="mb-3 rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
              {trade.notes}
            </p>
          )}
          {trade.scope_items.length === 0 ? (
            <p className="text-sm text-zinc-400">No specific scope items extracted.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-zinc-400">
                    <th className="pb-2 pr-3 font-medium">Description</th>
                    <th className="pb-2 pr-3 font-medium">Location</th>
                    <th className="pb-2 pr-3 font-medium">Qty</th>
                    <th className="pb-2 pr-3 font-medium">Materials</th>
                    <th className="pb-2 font-medium">Ref</th>
                  </tr>
                </thead>
                <tbody>
                  {trade.scope_items.map((item, i) => (
                    <tr key={i} className="border-t border-zinc-100 align-top dark:border-zinc-800">
                      <td className="py-2 pr-3 text-zinc-800 dark:text-zinc-200">{item.description}</td>
                      <td className="py-2 pr-3 text-zinc-500">{item.location ?? "—"}</td>
                      <td className="py-2 pr-3 whitespace-nowrap text-zinc-500">
                        {item.quantity !== null ? `${item.quantity} ${item.unit ?? ""}`.trim() : "—"}
                      </td>
                      <td className="py-2 pr-3 text-zinc-500">
                        {item.materials.length > 0 ? item.materials.join(", ") : "—"}
                      </td>
                      <td className="py-2 text-zinc-400">{item.spec_reference ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TradeResults({ trades }: { trades: TradeResult[] }) {
  const sorted = [...trades].sort(
    (a, b) => sequenceForTrade(a.trade_name) - sequenceForTrade(b.trade_name)
  );

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((trade, i) => (
        <TradeCard key={`${trade.trade_name}-${i}`} trade={trade} />
      ))}
    </div>
  );
}
