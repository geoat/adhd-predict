# Scoring the ADHD discussion questions

This document describes an **illustrative symptom index**, not a percentage chance of ADHD. The 20 questions in [adhd-questions.json](./adhd-questions.json) were written for this project and have not been clinically validated. No choice of hand-picked weights can turn their answers into a calibrated probability or a diagnosis.

## Inputs and validation

Use the question IDs and option `value` fields from the JSON file. Questions q01–q18 each require exactly one of `never`, `rarely`, `sometimes`, `often`, or `very_often`. Their `score` values are 0, 1, 2, 3, and 4 respectively. q19 requires one of `yes`, `no`, or `unsure`. q20 requires a nonempty array of unique option values; `none` and `unsure` must each be selected alone. Reject unknown IDs, unknown values, duplicate values, and incompatible q20 selections.

Calculate the index only when all 20 responses are valid and q20 is not `unsure`. If q20 is `unsure`, show the two symptom-domain scores and report that the overall index is unavailable. Do not treat skipped or uncertain answers as zero.

## Weights and calculation

| Component | Questions | Calculation | Weight |
| --- | --- | --- | ---: |
| Inattention, `I` | q01–q09 | `100 × sum(scores) / 36` | 40% |
| Hyperactivity/impulsivity, `H` | q10–q18 | `100 × sum(scores) / 36` | 40% |
| Reported impact, `C` | q20 | `100 × min(number of selected impact areas, 2) / 2` | 20% |
| Childhood history | q19 | Record the selected value; do not assign points | 0% |

For `C`, count only `home`, `work`, `education`, `relationships`, and `other`. `none` gives `C = 0`. One selected area gives `C = 50`, and two or more give `C = 100`. These areas describe **reported impact**, not proof that symptoms occurred in multiple settings. `other` is one area even if it describes several experiences.

```text
index = 0.40 × I + 0.40 × H + 0.20 × C
```

Keep full precision during calculation and round the final index to the nearest integer for display. The result ranges from 0 to 100. These weights give equal emphasis to the two sets of nine symptom questions and some emphasis to reported impact. They are design choices, **not empirically estimated coefficients**. q19 stays visible alongside the index because a person's recollection of childhood is relevant to an assessment but an uncertain or negative recollection should not mechanically determine a numeric result.

### Example

If q01–q09 sum to 18, q10–q18 sum to 9, and q20 selects two impact areas:

```text
I = 100 × 18 / 36 = 50
H = 100 × 9 / 36 = 25
C = 100
index = 0.40 × 50 + 0.40 × 25 + 0.20 × 100 = 50
```

Display **"Symptom discussion index: 50/100"**, never **"50% chance of ADHD."** Also display the two domain scores, selected impact areas, and q19 response so the user can see what contributed to the result. Do not add low/medium/high risk bands or use this index to recommend against seeking care. If someone is concerned or these difficulties affect their life, invite them to discuss the responses with a qualified healthcare professional regardless of the index.

## Why this is not a probability

A probability such as `P(ADHD diagnosis | answers) = 0.50` requires outcome data from people assessed with an appropriate clinical reference standard. The current questions, option thresholds, impact weight, and population have not been validated. Even a high index could reflect other causes of similar difficulties, and a low index does not rule out ADHD. Clinical assessment considers persistence, childhood onset, symptoms across settings, functional impairment, and alternative explanations.

To provide a defensible probability in a later version, first define the intended population and outcome; collect consented questionnaire responses paired with independent clinician assessments; fit and calibrate a model on development data; measure calibration and discrimination on held-out and external samples; examine performance across relevant groups; and publish uncertainty, limitations, and a plan to monitor drift. Do not label the index as a probability until those steps demonstrate acceptable calibration for the intended population.

## Sources

- [CDC: ADHD diagnostic criteria and evaluation](https://www.cdc.gov/adhd/hcp/clinical-care/index.html)
- [NIMH: ADHD symptoms and diagnosis](https://www.nimh.nih.gov/health/publications/attention-deficit-hyperactivity-disorder-what-you-need-to-know)
