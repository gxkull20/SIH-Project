export type ModelStatus = "connected" | "simulated" | "unavailable";
export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
export type EvidenceCategory = "VOICE" | "CONVERSATION" | "IDENTITY" | "CONTEXT";
export type EvidenceSeverity = "info" | "low" | "medium" | "high" | "critical";
export type VerificationState =
  | "verified"
  | "unverified"
  | "inconsistent"
  | "unknown"
  | "requires_independent_verification";

export interface SegmentPrediction {
  model_name: string;
  model_version: string;
  status: ModelStatus;
  synthetic_likelihood: number | null;
  human_likelihood: number | null;
  uncertainty: number | null;
  processing_time_ms: number | null;
  is_simulated: boolean;
  message: string | null;
  evidence_ref: string | null;
}

export interface Segment {
  segment_id: string;
  index: number;
  start_s: number;
  end_s: number;
  transcript_text?: string | null;
  predictions: SegmentPrediction[];
}

export interface FusionResult {
  synthetic_likelihood: number | null;
  human_likelihood: number | null;
  model_agreement: number | null;
  uncertainty: number | null;
  contributing_models: string[];
  unavailable_models: string[];
  any_simulated: boolean;
  weights_used: Record<string, number>;
}

export interface VerificationEntry {
  state: VerificationState;
  reason?: string;
  matched_organization?: string;
  matched_city?: string;
  claimed_branch?: string;
  claimed_organization?: string;
  caller_id_known?: boolean;
  is_fictional_demo_data?: boolean;
}

export interface VerificationResult {
  organization: VerificationEntry;
  branch: VerificationEntry;
  caller: VerificationEntry;
}

export interface ConversationSignal {
  category: string;
  matched_phrase: string;
  segment_index: number;
  timestamp_s: number | null;
}

export interface OTPMatch {
  matched_phrase: string;
  pattern_category: string;
  segment_index: number;
  timestamp_s: number | null;
  reason: string;
}

export interface ConversationResult {
  signals: ConversationSignal[];
  signal_counts: Record<string, number>;
  conversation_risk_hint: "low" | "moderate" | "high";
  otp_detection: { detected: boolean; matches: OTPMatch[] };
}

export interface RiskResult {
  risk_score: number | null;
  risk_level: RiskLevel | null;
  risk_factors: string[];
  recommendation: string | null;
  thresholds_used: Record<string, [number, number]>;
  weights_used: Record<string, number>;
  is_scientifically_calibrated_probability?: boolean;
}

export interface EvidenceItem {
  id: string;
  category: EvidenceCategory;
  severity: EvidenceSeverity;
  title: string;
  description: string;
  source: string;
  segment_id: string | null;
  timestamp_s: number | null;
  model_name: string | null;
}

export interface AnalysisSession {
  session_id: string;
  status: "pending" | "processing" | "complete" | "failed";
  mode?: string;
  audio?: {
    filename?: string;
    duration_s: number;
    sample_rate: number;
    original_sample_rate?: number;
    channels?: number;
    format?: string;
  };
  segments?: Segment[];
  fusion?: FusionResult;
  conversation?: ConversationResult;
  verification?: VerificationResult;
  risk?: RiskResult;
  evidence?: EvidenceItem[];
  error_message?: string;
}

export interface ModelCard {
  model_name: string;
  version: string;
  architecture: string;
  training_data: string;
  input_format: string;
  sampling_rate: string;
  segment_length: string;
  output: string;
  training_configuration: string;
  evaluation_dataset: string;
  metrics: Record<string, number | null>;
  known_limitations: string[];
  known_failure_cases: string;
  language_considerations: string;
  noise_considerations: string;
  replay_limitations: string;
}

export interface DemoScenario {
  label: string;
  is_demo_data: boolean;
  fusion: FusionResult;
  conversation: ConversationResult;
  verification: VerificationResult;
  risk: RiskResult;
  evidence: EvidenceItem[];
}
