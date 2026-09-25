# Combining the adult ADHD question responses

[adhd-questions.json](./adhd-questions.json) is the machine-readable source for the questions and rules. This guide describes the same result calculation. It is a **criteria-informed self-report summary**, not a clinical diagnosis or a percentage chance.

## 1. Validate the answers

Require one valid answer for each of q01–q19 and one valid answer for **each of the four rows** in q20: `duration`, `settings`, `impairment`, and `possible_other_explanations`. Do not calculate a result from missing or invalid responses; prompt for the missing answer. The questionnaire is intended for adults 18 or older.

## 2. Count reported symptoms

Each of the 18 symptom questions has **equal weight** within its domain:

| Answer to q01–q18 | Count for that item |
| --- | ---: |
| Never, Rarely, Sometimes | 0 |
| Often, Very often | 1 |

- **Inattention count:** add q01–q09; range 0–9.
- **Hyperactivity/impulsivity count:** add q10–q18; range 0–9.

The count threshold is **5 in either domain** for this adult-oriented summary. The mapping from `often` / `very_often` to a counted item is an operational rule for this questionnaire. It has not been validated as a substitute for a clinician's judgment that a symptom meets diagnostic criteria.

## 3. Describe the symptom pattern

Apply these conditions in order; exactly one pattern will match:

| Code | Inattention count | Hyperactivity/impulsivity count |
| --- | --- | --- |
| `combined_pattern` | 5–9 | 5–9 |
| `inattentive_pattern` | 5–9 | 0–4 |
| `hyperactive_impulsive_pattern` | 0–4 | 5–9 |
| `below_count_threshold` | 0–4 | 0–4 |

These are **reported symptom patterns**, not diagnostic presentations assigned by a clinician.

## 4. Combine the context answers

The four contextual features are reported when all these values are `yes`:

| Feature | Required answer |
| --- | --- |
| Several similar difficulties before age 12 | `q19 = yes` |
| Difficulties for at least six months | `q20.duration = yes` |
| Several difficulties in at least two settings | `q20.settings = yes` |
| Noticeable interference with functioning | `q20.impairment = yes` |

Then assign exactly one `combination_code`:

1. If the pattern is `below_count_threshold`, use `below_count_threshold`.
2. Otherwise, if **all four** context answers above are `yes`, use `reported_pattern_with_context`.
3. Otherwise, use `symptom_pattern_context_incomplete`.

Always display the actual context answers, including `no` and `unsure`. Separately flag `q20.possible_other_explanations = yes` for clinical review. A `no` or `unsure` answer to that row cannot rule out another explanation. A missing context feature or a count below five should not be presented as proof that ADHD is absent.

## 5. Display the result

Show the two counts out of nine, the symptom pattern, all five context responses (q19 plus four q20 rows), and the combination code in plain language. For example, if q01–q09 contain six `often` / `very_often` answers and q10–q18 contain three, the pattern is `inattentive_pattern`. If q19 and the duration and impairment rows are `yes`, but the settings row is `unsure`, the combined result is `symptom_pattern_context_incomplete`.

Use these descriptions:

- `reported_pattern_with_context`: “Your answers report a symptom-count pattern and the main contextual features. A clinical assessment is needed to interpret them.”
- `symptom_pattern_context_incomplete`: “Your answers report a symptom-count pattern, but some contextual features are uncertain or not reported.”
- `below_count_threshold`: “Your reported symptom counts are below this questionnaire's adult threshold. This does not rule out ADHD or other concerns.”

Do **not** turn counts into a weighted percentage, probability, or automated diagnosis. Clinicians also consider whether symptoms are developmentally inappropriate, corroborating history, severity, impairment, and other possible explanations. Self-report questions alone cannot establish these factors.

## Sources

- [CDC: DSM-5 criteria summary and clinical evaluation](https://www.cdc.gov/adhd/hcp/clinical-care/index.html)
- [NIMH: ADHD symptoms and diagnosis](https://www.nimh.nih.gov/health/publications/attention-deficit-hyperactivity-disorder-what-you-need-to-know)
