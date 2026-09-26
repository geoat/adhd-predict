import type { AssessmentAnswers, AssessmentResult } from "@/lib/assessment/types";

const symptomIds = {
  inattention: Array.from({ length: 9 }, (_, index) => `q${String(index + 1).padStart(2, "0")}`),
  hyperactivity_impulsivity: Array.from({ length: 9 }, (_, index) => `q${String(index + 10).padStart(2, "0")}`),
} as const;

const present = new Set(["often", "very_often"]);

function count(ids: readonly string[], symptoms: Record<string, string>) {
  return ids.reduce((total, id) => total + (present.has(symptoms[id]) ? 1 : 0), 0);
}

function hasRequiredContext(context: AssessmentAnswers["context"]) {
  return (
    context.childhood_onset === "yes" &&
    context.duration === "yes" &&
    context.settings === "yes" &&
    context.impairment === "yes"
  );
}

export function scoreAssessment(answers: AssessmentAnswers): AssessmentResult {
  const inattention = count(symptomIds.inattention, answers.symptoms);
  const hyperactivityImpulsivity = count(symptomIds.hyperactivity_impulsivity, answers.symptoms);
  const pattern =
    inattention >= 5 && hyperactivityImpulsivity >= 5
      ? "combined_pattern"
      : inattention >= 5
        ? "inattentive_pattern"
        : hyperactivityImpulsivity >= 5
          ? "hyperactive_impulsive_pattern"
          : "below_count_threshold";

  const combination =
    pattern === "below_count_threshold"
      ? "below_count_threshold"
      : hasRequiredContext(answers.context)
        ? "reported_pattern_with_context"
        : "symptom_pattern_context_incomplete";

  const summaries = {
    reported_pattern_with_context:
      "Your answers report a symptom-count pattern and the main contextual features. A clinical assessment is needed to interpret them.",
    symptom_pattern_context_incomplete:
      "Your answers report a symptom-count pattern, but some contextual features are uncertain or not reported.",
    below_count_threshold:
      "Your reported symptom counts are below this questionnaire's adult threshold. This does not rule out ADHD or other concerns.",
  } as const;

  const possibleOtherExplanations = answers.context.possible_other_explanations === "yes";

  return {
    schema_version: answers.schema_version,
    counts: { inattention, hyperactivity_impulsivity: hyperactivityImpulsivity },
    pattern,
    combination,
    context: answers.context,
    possible_other_explanations: possibleOtherExplanations,
    summary: summaries[combination],
  };
}

