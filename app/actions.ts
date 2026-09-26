"use server";

import { adhdQuestionBank } from "@/lib/server/adhd-questions";
import { assessmentAnswersSchema } from "@/lib/assessment/contracts";
import { scoreAssessment } from "@/lib/assessment/score";
import type { AssessmentResult } from "@/lib/assessment/types";

export type AssessmentActionState =
  | { ok: true; result: AssessmentResult }
  | { ok: false; message: string };

export async function submitAssessment(input: unknown): Promise<AssessmentActionState> {
  const parsed = assessmentAnswersSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Please complete every question before submitting." };
  }

  if (parsed.data.schema_version !== adhdQuestionBank.schema_version) {
    return { ok: false, message: "This questionnaire has changed. Please reload and try again." };
  }

  const expectedSymptoms = adhdQuestionBank.questions
    .filter((question) => question.id !== "q19" && question.id !== "q20")
    .map((question) => question.id);

  if (
    expectedSymptoms.some((id) => !(id in parsed.data.symptoms)) ||
    Object.keys(parsed.data.symptoms).some((id) => !expectedSymptoms.includes(id))
  ) {
    return { ok: false, message: "Please complete every symptom question before submitting." };
  }

  return { ok: true, result: scoreAssessment(parsed.data) };
}
