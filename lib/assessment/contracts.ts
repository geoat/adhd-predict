import { z } from "zod";

const frequency = z.enum(["never", "rarely", "sometimes", "often", "very_often"]);
const contextResponse = z.enum(["yes", "no", "unsure"]);

export const assessmentAnswersSchema = z.strictObject({
  schema_version: z.string().min(1),
  symptoms: z.record(z.string(), frequency),
  context: z.strictObject({
    childhood_onset: contextResponse,
    duration: contextResponse,
    settings: contextResponse,
    impairment: contextResponse,
    possible_other_explanations: contextResponse,
  }),
});

export type AssessmentAnswersInput = z.infer<typeof assessmentAnswersSchema>;
