// Shared types for the document analysis / takeoff pipeline.

export type FlagSeverity = "info" | "warning" | "missing_info";

export interface ScopeItem {
  description: string;
  location: string | null;
  quantity: number | null;
  unit: string | null;
  materials: string[];
  spec_reference: string | null;
}

export interface TradeResult {
  trade_name: string;
  csi_division: string;
  subcontractor_needed: boolean;
  scope_items: ScopeItem[];
  notes: string | null;
}

export interface CoordinationEntry {
  trade: string;
  depends_on: string[];
  provides_to: string[];
  notes: string | null;
}

export interface Flag {
  severity: FlagSeverity;
  message: string;
  related_trade: string | null;
}

export interface AnalysisResult {
  project_summary: string;
  trades: TradeResult[];
  coordination: CoordinationEntry[];
  flags: Flag[];
}

export interface AnalyzeApiResponse {
  result: AnalysisResult;
  files_analyzed: string[];
}

export interface AnalyzeApiError {
  error: string;
}
