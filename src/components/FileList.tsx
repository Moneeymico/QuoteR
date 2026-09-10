"use client";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileListProps {
  files: File[];
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export function FileList({ files, onRemove, disabled }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <ul className="flex flex-col gap-2">
      {files.map((file, i) => (
        <li
          key={`${file.name}-${i}`}
          className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium uppercase text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              {file.type === "application/pdf" ? "pdf" : "img"}
            </span>
            <span className="truncate text-zinc-800 dark:text-zinc-200">{file.name}</span>
            <span className="shrink-0 text-zinc-400">{formatBytes(file.size)}</span>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onRemove(i)}
            className="shrink-0 text-zinc-400 hover:text-red-500 disabled:opacity-40"
            aria-label={`Remove ${file.name}`}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
