# ADHD symptom indication score

[adhd-questions.json](./adhd-questions.json) contains the 20 questions, answer options, and machine-readable scoring rules. This page explains the same rules for implementers. The result is a **0–100 indication score**, not a percentage chance or a diagnosis. Higher scores mean more frequently reported symptoms and/or impact. The questions and weights are not clinically validated.

## Inputs

- q01–q18: one answer per question. Use the selected option's `score`: Never = 0, Rarely = 1, Sometimes = 2, Often = 3, Very often = 4.
- q19: one of Yes, No, or Not sure. Record this childhood-history answer alongside the score; it has **0% weight**.
- q20: an array of unique selections. Count `home`, `work`, `education`, `relationships`, and `other` as impact areas. `none` and `unsure` must each be selected alone.

Reject missing, duplicate, incompatible, or unknown answers. Require all 20 answers. If q20 is `unsure`, show the two symptom component scores but mark the overall score **unavailable**; do not treat uncertainty as zero.

## Calculation

| Component | Questions | Normalized score (0–100) | Weight |
| --- | --- | --- | ---: |
| Inattention, `I` | q01–q09 | `100 × sum(option.score) / 36` | 40% |
| Hyperactivity/impulsivity, `H` | q10–q18 | `100 × sum(option.score) / 36` | 40% |
| Everyday impact, `C` | q20 | `100 × min(impact area count, 2) / 2` | 20% |
| Childhood history | q19 | Shown separately; no points | 0% |

For impact, `none` gives `C = 0`; one area gives `C = 50`; two or more areas give `C = 100`. `other` counts as one area. This count reflects where a person reports problems; it does not independently establish that symptoms occur across settings.

```text
score = 0.40 × I + 0.40 × H + 0.20 × C
```

Keep full precision through the calculation. Round only the final score to the nearest integer, with 0.5 rounded up. Display it as **"ADHD symptom indication score: N/100"**. Also display `I`, `H`, the selected q20 areas, and the q19 response. Do not display `N%` as a chance of having ADHD or assign diagnostic labels to score ranges.

### Worked example

Suppose q01–q09 sum to 18, q10–q18 sum to 9, q20 selects `home` and `work`, and q19 is `unsure`:

```text
I = 100 × 18 / 36 = 50
H = 100 × 9 / 36 = 25
C = 100 × min(2, 2) / 2 = 100
score = 0.40 × 50 + 0.40 × 25 + 0.20 × 100 = 50/100
```

The q19 response is displayed separately and does not change the 50/100 result.

## Interpretation

This score is a simple weighted summary of self-reported experiences, with equal weight for the two nine-question symptom groups and 20% for impact. The weights are design choices, not measured probabilities. A low score does not rule out ADHD; a high score does not establish it. If the person is concerned or their difficulties affect daily life, suggest discussing the answers with a healthcare professional, regardless of score. Clinical evaluation considers duration, childhood history, settings, impairment, and other possible causes.

Sources: [CDC diagnostic criteria and evaluation](https://www.cdc.gov/adhd/hcp/clinical-care/index.html); [NIMH ADHD symptoms and diagnosis](https://www.nimh.nih.gov/health/publications/attention-deficit-hyperactivity-disorder-what-you-need-to-know).
