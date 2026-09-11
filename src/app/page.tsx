"use client";

import { useState } from "react";
import { Dropzone } from "@/components/Dropzone";
import { FileList } from "@/components/FileList";
import { TradeResults } from "@/components/TradeResults";
import { SubcontractorMap } from "@/components/SubcontractorMap";
import { FlagsList } from "@/components/FlagsList";
import { DEMO_RESULT } from "@/lib/demoData";
import type { AnalysisResult, AnalyzeApiError, AnalyzeApiResponse } from "@/types/analysis";

type Tab = "trades" | "coordination" | "flags";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [tab, setTab] = useState<Tab>("trades");

  function addFiles(newFiles: File[]) {
    setError(null);
    setFiles((prev) => [...prev, ...newFiles]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function analyze() {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      for (const file of files) formData.append("files", file);

      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = (await res.json()) as AnalyzeApiResponse | AnalyzeApiError;

      if (!res.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Analysis failed.");
      }

      setResult(data.result);
      setTab("trades");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setFiles([]);
    setResult(null);
    setError(null);
  }

  function loadDemo() {
    setError(null);
    setResult(DEMO_RESULT);
    setTab("trades");
  }

  const missingInfoCount = result?.flags.filter((f) => f.severity === "missing_info").length ?? 0;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white px-6 py-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">QuoteR</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Drop in a specification and drawings — get a trade-by-trade scope breakdown and a
            subcontractor coordination plan.
          </p>
          <button
            type="button"
            onClick={loadDemo}
            disabled={loading}
            className="mt-2 text-sm font-medium text-blue-600 hover:underline disabled:opacity-60"
          >
            View sample results (no API call, no cost)
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-8">
        <section className="flex flex-col gap-3">
          <Dropzone onFilesAdded={addFiles} disabled={loading} />
          <FileList files={files} onRemove={removeFile} disabled={loading} />

          {files.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={analyze}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Analyzing…" : `Analyze ${files.length} file${files.length === 1 ? "" : "s"}`}
              </button>
              <button
                type="button"
                onClick={reset}
                disabled={loading}
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-700 disabled:opacity-60 dark:hover:text-zinc-300"
              >
                Clear
              </button>
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}
        </section>

        {result && (
          <section className="flex flex-col gap-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-1 text-sm font-medium uppercase tracking-wide text-zinc-400">
                Project summary
              </h2>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{result.project_summary}</p>
            </div>

            <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
              {(
                [
                  ["trades", `Trades (${result.trades.length})`],
                  ["coordination", `Coordination (${result.coordination.length})`],
                  ["flags", `Flags${missingInfoCount > 0 ? ` (${missingInfoCount})` : ""}`],
                ] as [Tab, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
                    tab === key
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "trades" && <TradeResults trades={result.trades} />}
            {tab === "coordination" && <SubcontractorMap coordination={result.coordination} />}
            {tab === "flags" && <FlagsList flags={result.flags} />}
          </section>
        )}
      </main>

      <footer className="border-t border-zinc-200 px-6 py-4 text-center text-xs text-zinc-400 dark:border-zinc-800">
        AI-generated takeoff — verify quantities and scope against the source documents before bidding.
      </footer>
    </div>
  );
}
