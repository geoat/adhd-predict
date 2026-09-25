import { z } from "zod";

const nonEmpty = z.string().min(1);
const frequency = z.enum([
  "never",
  "rarely",
  "sometimes",
  "often",
  "very_often",
]);
const contextResponse = z.enum(["yes", "no", "unsure"]);
const domain = z.enum(["inattention", "hyperactivity_impulsivity"]);
const pattern = z.enum([
  "combined_pattern",
  "inattentive_pattern",
  "hyperactive_impulsive_pattern",
  "below_count_threshold",
]);
const combination = z.enum([
  "reported_pattern_with_context",
  "symptom_pattern_context_incomplete",
  "below_count_threshold",
]);
const contextRow = z.enum([
  "duration",
  "settings",
  "impairment",
  "possible_other_explanations",
]);

const frequencyOption = z.strictObject({
  value: frequency,
  label: nonEmpty,
  score: z.number().int().min(0).max(4),
});
const contextOption = z.strictObject({
  value: contextResponse,
  label: nonEmpty,
});

const symptomQuestion = z
  .strictObject({
    id: z.string().regex(/^q(0[1-9]|1[0-8])$/),
    domain,
    facet: nonEmpty,
    statement: nonEmpty,
    answer: z.strictObject({
      type: z.literal("single_select"),
      required: z.literal(true),
      options: z.array(frequencyOption).length(5),
    }),
    rubric: z.strictObject({
      kind: z.literal("symptom_count"),
      domain,
      present_values: z.array(frequency).min(1),
      present_points: z.number().int().nonnegative(),
      other_points: z.number().int().nonnegative(),
    }),
  })
  .superRefine((question, ctx) => {
    if (question.domain !== question.rubric.domain) {
      ctx.addIssue({
        code: "custom",
        path: ["rubric", "domain"],
        message: "Rubric domain must match the question domain.",
      });
    }
    const actual = question.answer.options.map((option) => option.value);
    if (
      actual.some((value, index) => value !== frequency.options[index]) ||
      question.answer.options.some((option, index) => option.score !== index)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["answer", "options"],
        message: "Frequency options must be ordered with scores 0–4.",
      });
    }
  });

const childhoodQuestion = z.strictObject({
  id: z.literal("q19"),
  domain: z.literal("context"),
  facet: nonEmpty,
  statement: nonEmpty,
  answer: z.strictObject({
    type: z.literal("single_select"),
    required: z.literal(true),
    options: z.array(contextOption).length(3),
  }),
  rubric: z.strictObject({
    kind: z.literal("context_check"),
    criterion: z.literal("childhood_onset"),
    reported_value: contextResponse,
    uncertain_value: contextResponse,
  }),
});

const matrixQuestion = z
  .strictObject({
    id: z.literal("q20"),
    domain: z.literal("context"),
    facet: nonEmpty,
    statement: nonEmpty,
    answer: z.strictObject({
      type: z.literal("matrix_single_select"),
      required: z.literal(true),
      options: z.array(contextOption).length(3),
      rows: z
        .array(z.strictObject({ id: contextRow, statement: nonEmpty }))
        .length(4),
    }),
    rubric: z.strictObject({
      kind: z.literal("context_checks"),
      checks: z
        .array(
          z.strictObject({
            row_id: contextRow,
            reported_value: contextResponse.optional(),
            review_value: contextResponse.optional(),
          }),
        )
        .length(4),
      uncertain_value: contextResponse,
    }),
  })
  .superRefine((question, ctx) => {
    const actual = question.answer.rows.map((row) => row.id);
    if (actual.some((id, index) => id !== contextRow.options[index])) {
      ctx.addIssue({
        code: "custom",
        path: ["answer", "rows"],
        message: "Context rows must be ordered and unique.",
      });
    }
  });

const symptomDomain = z.strictObject({
  question_ids: z.array(nonEmpty).length(9),
  present_values: z.array(frequency).min(1),
  points_per_present_item: z.number().int().positive(),
  threshold: z.number().int().min(1).max(9),
  max_count: z.number().int().positive(),
});

const patternRule = z.strictObject({
  code: pattern,
  inattention_min: z.number().int().nonnegative().optional(),
  inattention_max: z.number().int().nonnegative().optional(),
  hyperactivity_impulsivity_min: z.number().int().nonnegative().optional(),
  hyperactivity_impulsivity_max: z.number().int().nonnegative().optional(),
});

const combinationRule = z.strictObject({
  code: combination,
  presentation_pattern: pattern.optional(),
  presentation_pattern_not: pattern.optional(),
  all_required_context_reported: z.boolean().optional(),
});

export const adhdQuestionBankSchema = z
  .strictObject({
    schema_version: z.literal("2.0.0"),
    title: nonEmpty,
    audience: nonEmpty,
    language: z.literal("en"),
    purpose: nonEmpty,
    instructions: nonEmpty,
    response_format: z.strictObject({
      single_select: nonEmpty,
      matrix_single_select: nonEmpty,
    }),
    assessment: z.strictObject({
      method: z.literal("adult_symptom_count_and_context_review"),
      audience: nonEmpty,
      symptom_domains: z.strictObject({
        inattention: symptomDomain,
        hyperactivity_impulsivity: symptomDomain,
      }),
      presentation_pattern_rules: z.array(patternRule).length(4),
      context_checks: z.strictObject({
        childhood_onset: nonEmpty,
        duration: nonEmpty,
        settings: nonEmpty,
        impairment: nonEmpty,
        possible_other_explanations: nonEmpty,
      }),
      combination_rules: z.array(combinationRule).length(3),
      other_explanations_rule: nonEmpty,
      output_fields: z.array(nonEmpty).min(1),
      no_weighted_percentage: z.literal(true),
      interpretation: nonEmpty,
      required_context_for_reported_pattern: z.strictObject({
        q19: contextResponse,
        "q20.duration": contextResponse,
        "q20.settings": contextResponse,
        "q20.impairment": contextResponse,
      }),
      symptom_count_note: nonEmpty,
    }),
    questions: z
      .array(z.union([symptomQuestion, childhoodQuestion, matrixQuestion]))
      .length(20),
    sources: z.array(z.strictObject({ name: nonEmpty, url: z.url() })).min(1),
  })
  .superRefine((bank, ctx) => {
    const ids = bank.questions.map((question) => question.id);
    const expectedIds = Array.from(
      { length: 20 },
      (_, index) => `q${String(index + 1).padStart(2, "0")}`,
    );
    if (ids.some((id, index) => id !== expectedIds[index])) {
      ctx.addIssue({
        code: "custom",
        path: ["questions"],
        message:
          "Questions must be ordered q01–q20 without gaps or duplicates.",
      });
    }

    for (const [key, expected] of [
      ["inattention", expectedIds.slice(0, 9)],
      ["hyperactivity_impulsivity", expectedIds.slice(9, 18)],
    ] as const) {
      const actual = bank.assessment.symptom_domains[key].question_ids;
      if (actual.some((id, index) => id !== expected[index])) {
        ctx.addIssue({
          code: "custom",
          path: ["assessment", "symptom_domains", key, "question_ids"],
          message: "Domain question IDs must match the questions.",
        });
      }
    }
  });

export type AdhdQuestionBank = z.infer<typeof adhdQuestionBankSchema>;
