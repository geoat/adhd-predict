# Implementation project plan

Status: proposed. Base branch: `develop`. Delivery target: the existing Cloudflare Worker deployment described in [architecture](./architecture.md) and [preview guide](./best-practices/enable-cloudfare-previews.md). Estimates below are relative working days for one experienced engineer plus clinical/content and accessibility review time; refine after a baseline spike.

## Outcome and release scope

A person aged 18+ can read the purpose and limits, answer the 20 questions, review/edit their responses, submit, and see a plain-language self-report summary of two symptom counts, the reported pattern, all context answers and suggested discussion with a clinician. The journey works on mobile, keyboard and screen reader, and runs through the deployed Cloudflare Worker. It does not diagnose, calculate a probability, store answers server-side or require an account.

Success means the same validated answers produce the same result across local and deployed previews, no incomplete submission can be scored, the full journey meets the accessibility and privacy gates below, and the deployment can be rolled back. Product owner and a qualified clinical reviewer approve outward-facing wording before public release.

## Milestones and dependencies

| Phase | Deliverables and implementation tasks | Exit criteria | Estimate |
| --- | --- | --- | ---: |
| 0. Baseline and decisions | Inspect Cloudflare dashboard/builds and existing preview; confirm `main` production, `develop` workflow, generated Wrangler config, runtime limits and access policy. Run `npm ci`, lint and Vinext build. Inventory present bank/rubric and reconcile any schema/scoring mismatch. Confirm audience, legal/privacy copy, draft policy and reviewer. | Recorded actual deployment settings, working preview action probe or documented blocker, agreed content ownership; no changes to production config without evidence. | 1–2 days |
| 1. Contracts and pure domain | Add answer/result Zod contracts with bank version; map bank to safe UI view model; implement pure validation/scoring and interpretation codes. Add reviewed fixtures at each threshold and context branch; test invalid/missing/extra responses and bank version changes. | Deterministic tests match `data/SCORING.md` and JSON rules; every output code and context answer is covered; no React or Cloudflare import in scoring. | 2–3 days |
| 2. Design system and shell | Replace starter page/metadata; define tokens, layout, typography and generic form primitives. Add intro, purpose/limits, privacy explanation and responsive navigation. Document component usage and states. | Responsive mobile/desktop review; accessible labels, focus and contrast for each primitive; no clinical logic in generic UI. | 2–3 days |
| 3. Assessment flow | Build question-type components, data-driven step grouping, client reducer/selectors, completion/error focus, back/next, review/edit and clear answers. Add versioned session-local draft only if phase 0 approves it. | All 20 questions and four matrix rows reachable; keyboard-only completion; refresh and stale-draft behavior tested; no answer in URL or logs. | 3–4 days |
| 4. Submission and results | Add thin Server Action with authoritative parsing and use-case call; handle loading, retries, validation errors and result DTO. Render both counts, pattern, all context responses, other-explanations review note, limits and next steps. | Incomplete/invalid values cannot produce a result; result language matches reviewed copy; live Cloudflare preview actually invokes the Worker action. | 2–3 days |
| 5. Hardening and release | Automate lint, typecheck, unit/component and end-to-end journey checks; run accessibility and mobile checks, preview smoke, performance and privacy review. Correct failures. Promote through existing branch process; verify production and rollback instructions. | All release gates pass; version/commit and known-good rollback are recorded; product and clinical reviewers sign off. | 2–4 days |

Estimated engineering effort: about 12–19 working days, excluding waiting for external review and any Cloudflare account fixes. Split work into small PRs aligned with phases; phase 0 and domain contracts precede the UI/result integration. Phases 2 and part of 3 may overlap after contracts stabilize.

## Proposed PR sequence

1. **Deployment baseline and contracts:** record verified Cloudflare settings, add contracts and scoring tests. Any mismatch with the bank gets resolved with a reviewed data/guide change.
2. **UI foundations:** replace starter shell, design tokens, primitives, intro and component guidance.
3. **Question flow:** data-driven steps, answer state, optional local draft and review/edit.
4. **Results and Worker integration:** action, result mapping, error handling and preview evidence.
5. **Release hardening:** CI, end-to-end checks, accessibility fixes, privacy/performance verification and operational runbook.

Each PR includes its scope, screenshots or interaction evidence for UI work, tests appropriate to changed behavior, and documentation updates. Avoid combining deployment migration with the scoring implementation.

## Acceptance criteria by concern

| Concern | Required evidence |
| --- | --- |
| Correctness | Tests cover 0/4/5/9 boundaries in each domain, all four pattern codes, all three combination codes, `yes/no/unsure` context permutations, possible-other-explanations flag, incomplete/invalid/extra values and mismatched `schema_version`. Review examples against `data/SCORING.md`. |
| Usability | Intro → all questions → review/edit → result can be completed on a small phone and desktop; progress is understandable; answers survive back navigation; clear and restart are explicit; submission failure is recoverable without losing work. |
| Accessibility | Target WCAG 2.2 AA. Keyboard-only path, screen-reader announcements, semantic fieldsets, error focus, visible focus, contrast, 200% zoom/reflow and reduced-motion behavior are checked manually alongside automated scans. |
| Privacy and safety | No server-side answer persistence, answers in URL, sensitive telemetry or raw answer logging. Content clearly describes the self-report limits, adult audience and data handling. Clinical reviewer approves question and result language. |
| Deployment | `npm ci`, lint, typecheck, tests, `npm run build`, Wrangler dry-run and real Cloudflare preview smoke pass. Preview tests full submission and asset serving. Production deploy and rollback use the established `main` path. |
| Performance | Establish mobile baseline and compare release preview; inspect client bundle and web vitals. Fix material regression before release. Record measured p95 action latency and Worker limits instead of claiming an unmeasured capacity. |

## Verification strategy

- **Unit:** test scoring with fixtures independent of UI and network. Property/boundary tests should ensure counts stay 0–9 and exactly one pattern/combination is emitted for any valid complete answer set.
- **Component:** test radio and matrix semantics, progress, back/edit, error state and result mapping with representative bank data. Avoid snapshots that merely mirror markup.
- **Integration:** submit malformed and valid payloads through the action boundary; assert field errors and version rejection. Exercise the Worker preview, since a local Next.js run alone cannot prove Vinext behavior.
- **End to end:** automate the happy path and a correction path at mobile and desktop sizes. Manually run keyboard and assistive-technology checks. Record the preview URL and commit in the PR.
- **Release:** smoke test production after promotion, monitor privacy-safe errors and latency, and keep the previous successful build/commit available for rollback.

Add a `typecheck` script and test tooling in the implementation PR, with versions verified against this repository's Next.js/Vinext setup. The existing `AGENTS.md` requires reading installed Next.js docs before changing code.

## Risks, decisions and mitigations

| Risk or open decision | Owner / action before dependent phase |
| --- | --- |
| Repository describes Cloudflare settings but live account state may differ | Engineer verifies dashboard, route, preview, secrets and branch mapping in phase 0. Do not change production settings based only on docs. |
| Clinical interpretation may be overclaimed | Product and qualified clinical reviewer approve copy and any rule change; preserve count/context separation and the existing no-diagnosis guidance. |
| Question-bank version changes during an in-progress draft | Engineer pins payload/draft to `schema_version`; reject or explicitly migrate stale drafts, with clear restart messaging. |
| Draft persistence and sensitive information | Product/privacy owner chooses in-memory or session-local draft and user-facing explanation in phase 0. No remote persistence in this release. |
| Vinext beta and framework compatibility | Engineer builds with locked dependencies and runs a real Worker preview before relying on Server Actions; isolate action and keep a rollback commit. |
| Traffic or latency beyond Worker limits | Engineer measures bundle, latency and limits in preview/production. Add controls or storage only against observed requirements. |

## Definition of done

The documented flow, rules and deployed behavior agree; the agreed tests and release gates pass; user-facing content has clinical and accessibility review; a preview is demonstrated from the exact commit; the production rollout has a recorded owner, monitoring check and rollback path. Update this plan and [architecture](./architecture.md) whenever scope or deployment decisions change.
