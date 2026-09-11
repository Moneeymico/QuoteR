import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient, ANTHROPIC_MODEL } from "./anthropic";
import { TAXONOMY_PROMPT_LIST } from "./trades";
import type { AnalysisResult } from "@/types/analysis";

export interface UploadedDocument {
  name: string;
  mediaType: string;
  base64: string;
}

export const SUPPORTED_MEDIA_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

const TAKEOFF_TOOL_NAME = "submit_takeoff";

const SCOPE_ITEM_SCHEMA = {
  type: "object",
  properties: {
    description: { type: "string", description: "What needs to be done, as specific as the source allows." },
    location: { type: ["string", "null"], description: "Room, area, sheet, or grid reference, if identifiable." },
    quantity: { type: ["number", "null"], description: "Numeric quantity if stated or reasonably countable from the drawings." },
    unit: { type: ["string", "null"], description: "Unit for the quantity, e.g. LF, SF, EA, CY." },
    materials: { type: "array", items: { type: "string" }, description: "Specific materials, products, or model/spec numbers called out." },
    spec_reference: { type: ["string", "null"], description: "Spec section, drawing sheet number, or detail callout this came from." },
  },
  required: ["description", "location", "quantity", "unit", "materials", "spec_reference"],
} as const;

const TAKEOFF_INPUT_SCHEMA = {
  type: "object",
  properties: {
    project_summary: {
      type: "string",
      description: "2-4 sentence summary of the project scope, type, and size based on the documents provided.",
    },
    trades: {
      type: "array",
      description: "One entry per trade that has identifiable scope in the documents. Omit trades with no scope found.",
      items: {
        type: "object",
        properties: {
          trade_name: { type: "string" },
          csi_division: { type: "string", description: "CSI MasterFormat division number(s), e.g. '26' or '31-33'." },
          subcontractor_needed: { type: "boolean", description: "True if this scope would typically be performed by a specialty subcontractor rather than the GC's own crew." },
          scope_items: { type: "array", items: SCOPE_ITEM_SCHEMA },
          notes: { type: ["string", "null"], description: "Anything a bidder for this trade should know: access issues, phasing, unusual requirements." },
        },
        required: ["trade_name", "csi_division", "subcontractor_needed", "scope_items", "notes"],
      },
    },
    coordination: {
      type: "array",
      description: "For each trade with scope, note which other trades it depends on (must happen before it) and which trades depend on it, based on standard construction sequencing and anything explicit in the documents.",
      items: {
        type: "object",
        properties: {
          trade: { type: "string" },
          depends_on: { type: "array", items: { type: "string" }, description: "Trade names that must complete (or reach a milestone) before this trade can proceed." },
          provides_to: { type: "array", items: { type: "string" }, description: "Trade names that are waiting on this trade." },
          notes: { type: ["string", "null"], description: "e.g. 'rough-in must be inspected before drywall closes walls'." },
        },
        required: ["trade", "depends_on", "provides_to", "notes"],
      },
    },
    flags: {
      type: "array",
      description: "Ambiguities, missing information, conflicts between documents, or items that need clarification before an accurate quote can be produced.",
      items: {
        type: "object",
        properties: {
          severity: { type: "string", enum: ["info", "warning", "missing_info"] },
          message: { type: "string" },
          related_trade: { type: ["string", "null"] },
        },
        required: ["severity", "message", "related_trade"],
      },
    },
  },
  required: ["project_summary", "trades", "coordination", "flags"],
} as const;

const SYSTEM_PROMPT = `You are an experienced commercial construction estimator and project manager. You read specifications and drawings and turn them into a trade-by-trade scope breakdown suitable for soliciting subcontractor bids, plus a coordination plan showing how trades depend on each other.

Use this trade taxonomy as your primary guide for classification (you may add a trade not listed here if the documents clearly call for it):
${TAXONOMY_PROMPT_LIST}

Guidelines:
- Read every page of every document provided before answering. Cross-reference drawings against the specification narrative — quantities and materials called out in the spec should inform, and be reconciled with, what's shown on the drawings.
- Only report quantities you can actually support from the documents (an explicit count, schedule, or a clearly scaled/labeled dimension). If a quantity can't be determined, set it to null rather than guessing, and add a "missing_info" flag if it's something a subcontractor would need to bid accurately.
- Group scope items under the trade that would actually perform the work, not the trade that specifies it.
- The coordination section should reflect real sequencing logic (e.g. electrical/plumbing/mechanical rough-in must precede insulation and drywall; framing precedes rough-in; rough-in must be inspected before it's covered), not just a generic list.
- Flag conflicts between documents (e.g. spec says one fixture, drawing schedule says another), scope gaps, and anything unusually risky to price as-is.
- Call the submit_takeoff tool exactly once with your complete findings. Do not include any text outside the tool call.`;

function toContentBlocks(
  docs: UploadedDocument[]
): Anthropic.Messages.ContentBlockParam[] {
  const blocks: Anthropic.Messages.ContentBlockParam[] = [];
  for (const doc of docs) {
    if (doc.mediaType === "application/pdf") {
      blocks.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: doc.base64 },
        title: doc.name,
      });
    } else {
      blocks.push({
        type: "image",
        source: {
          type: "base64",
          media_type: doc.mediaType as "image/png" | "image/jpeg" | "image/webp" | "image/gif",
          data: doc.base64,
        },
      });
    }
  }
  blocks.push({
    type: "text",
    text: `Above are ${docs.length} project document(s): ${docs
      .map((d) => d.name)
      .join(", ")}. Analyze all of them together as one project and call submit_takeoff with the full breakdown.`,
  });
  return blocks;
}

export async function extractTakeoff(
  docs: UploadedDocument[]
): Promise<AnalysisResult> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    tools: [
      {
        name: TAKEOFF_TOOL_NAME,
        description: "Submit the complete trade-by-trade takeoff and coordination plan for this project.",
        input_schema: TAKEOFF_INPUT_SCHEMA as unknown as Anthropic.Messages.Tool.InputSchema,
      },
    ],
    tool_choice: { type: "tool", name: TAKEOFF_TOOL_NAME },
    messages: [
      {
        role: "user",
        content: toContentBlocks(docs),
      },
    ],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.Messages.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUse) {
    throw new Error("The model did not return a structured takeoff. Try again.");
  }

  return toolUse.input as AnalysisResult;
}
