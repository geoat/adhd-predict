import type { AdhdQuestionBank } from "@/lib/schemas/adhd-questions";

export type AssessmentQuestion = AdhdQuestionBank["questions"][number];
export type Frequency = "never" | "rarely" | "sometimes" | "often" | "very_often";
export type ContextResponse = "yes" | "no" | "unsure";
export type SymptomAnswers = Record<string, Frequency>;
export type ContextAnswers = {
  childhood_onset: ContextResponse;
  duration: ContextResponse;
  settings: ContextResponse;
  impairment: ContextResponse;
  possible_other_explanations: ContextResponse;
};
export type AssessmentAnswers = {
  schema_version: string;
  symptoms: SymptomAnswers;
  context: ContextAnswers;
};

export type AssessmentResult = {
  schema_version: string;
  counts: {
    inattention: number;
    hyperactivity_impulsivity: number;
  };
  pattern:
    | "combined_pattern"
    | "inattentive_pattern"
    | "hyperactive_impulsive_pattern"
    | "below_count_threshold";
  combination:
    | "reported_pattern_with_context"
    | "symptom_pattern_context_incomplete"
    | "below_count_threshold";
  context: ContextAnswers;
  possible_other_explanations: boolean;
  summary: string;
};
