import { NextResponse } from "next/server";
import { extractTakeoff, SUPPORTED_MEDIA_TYPES, type UploadedDocument } from "@/lib/extraction";
import type { AnalyzeApiResponse, AnalyzeApiError } from "@/types/analysis";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_FILES = 15;
const MAX_FILE_BYTES = 30 * 1024 * 1024; // 30MB, under Claude's per-document limit

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json<AnalyzeApiError>(
      { error: "Could not read the uploaded files." },
      { status: 400 }
    );
  }

  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json<AnalyzeApiError>(
      { error: "No files were uploaded. Drag in a spec (PDF) and/or drawings (PDF or image)." },
      { status: 400 }
    );
  }

  if (files.length > MAX_FILES) {
    return NextResponse.json<AnalyzeApiError>(
      { error: `Too many files. Upload at most ${MAX_FILES} at a time.` },
      { status: 400 }
    );
  }

  const docs: UploadedDocument[] = [];
  for (const file of files) {
    const mediaType = file.type;
    if (!SUPPORTED_MEDIA_TYPES.includes(mediaType as (typeof SUPPORTED_MEDIA_TYPES)[number])) {
      return NextResponse.json<AnalyzeApiError>(
        {
          error: `"${file.name}" is a ${mediaType || "unrecognized"} file. Only PDF, PNG, JPEG, WEBP, and GIF are supported.`,
        },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json<AnalyzeApiError>(
        { error: `"${file.name}" is larger than the ${MAX_FILE_BYTES / (1024 * 1024)}MB limit.` },
        { status: 400 }
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    docs.push({ name: file.name, mediaType, base64: buffer.toString("base64") });
  }

  try {
    const result = await extractTakeoff(docs);
    return NextResponse.json<AnalyzeApiResponse>({
      result,
      files_analyzed: docs.map((d) => d.name),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed unexpectedly.";
    return NextResponse.json<AnalyzeApiError>({ error: message }, { status: 500 });
  }
}
