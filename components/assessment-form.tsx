"use client";

import { useMemo, useState, useTransition } from "react";
import { submitAssessment, type AssessmentActionState } from "@/app/actions";
import type { AssessmentQuestion } from "@/lib/assessment/types";

type QuestionView = {
  id: string;
  statement: string;
  kind: "frequency" | "context" | "matrix";
  options: { value: string; label: string }[];
  rows?: { id: string; statement: string }[];
};

type Props = { questions: QuestionView[]; schemaVersion: string };

const steps = [
  { title: "Focus and attention", ids: ["q01", "q02", "q03", "q04", "q05"] },
  { title: "Focus and attention", ids: ["q06", "q07", "q08", "q09", "q10"] },
  { title: "Activity and impulses", ids: ["q11", "q12", "q13", "q14", "q15"] },
  { title: "Context and review", ids: ["q16", "q17", "q18", "q19", "q20"] },
];

const initialContext = {
  childhood_onset: "",
  duration: "",
  settings: "",
  impairment: "",
  possible_other_explanations: "",
} as Record<string, string>;

export function AssessmentForm({ questions, schemaVersion }: Props) {
  const byId = useMemo(() => new Map(questions.map((question) => [question.id, question])), [questions]);
  const [step, setStep] = useState(0);
  const [symptoms, setSymptoms] = useState<Record<string, string>>({});
  const [context, setContext] = useState(initialContext);
  const [state, setState] = useState<AssessmentActionState | null>(null);
  const [pending, startTransition] = useTransition();
  const current = steps[step];
  const currentQuestions = current.ids.map((id) => byId.get(id)).filter(Boolean) as QuestionView[];
  const answeredCount =
    Object.keys(symptoms).length +
    Object.values(context).filter(Boolean).length;
  const totalAnswers = 18 + 5;
  const result = state?.ok ? state.result : null;

  function setSymptom(id: string, value: string) {
    setSymptoms((previous) => ({ ...previous, [id]: value }));
    setState(null);
  }

  function setContextValue(id: string, value: string) {
    setContext((previous) => ({ ...previous, [id]: value }));
    setState(null);
  }

  function next() {
    if (step < steps.length - 1) setStep((value) => value + 1);
  }

  function back() {
    if (step > 0) setStep((value) => value - 1);
  }

  function submit() {
    startTransition(async () => {
      setState(await submitAssessment({ schema_version: schemaVersion, symptoms, context }));
    });
  }

  if (result) {
    return (
      <section aria-labelledby="result-title" className="space-y-6">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Your summary</p>
          <h2 id="result-title" className="mt-2 text-2xl font-semibold text-slate-950">{result.summary}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Inattention", result.counts.inattention],
            ["Hyperactivity / impulsivity", result.counts.hyperactivity_impulsivity],
          ].map(([label, count]) => (
            <div key={label} className="rounded-xl border bg-white p-5">
              <p className="text-sm text-slate-600">{label}</p>
              <p className="mt-1 text-3xl font-semibold text-slate-950">{count} <span className="text-base font-normal text-slate-500">of 9</span></p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border bg-white p-5">
          <h3 className="font-semibold text-slate-950">Context responses</h3>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {Object.entries(result.context).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2">
                <dt className="text-sm text-slate-600">{key.replaceAll("_", " ")}</dt>
                <dd className="font-medium text-slate-950">{value}</dd>
              </div>
            ))}
          </dl>
          {result.possible_other_explanations && (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              You reported possible other explanations. Bring this up in a clinical assessment.
            </p>
          )}
        </div>
        <p className="text-sm leading-6 text-slate-600">
          This self-report summary is for discussion with a qualified clinician. It is not a diagnosis and a lower count does not rule out ADHD or another concern.
        </p>
        <button type="button" onClick={() => { setState(null); setStep(0); }} className="rounded-lg border px-4 py-2 font-medium text-slate-700 hover:bg-slate-50">
          Review answers
        </button>
      </section>
    );
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); step === steps.length - 1 ? submit() : next(); }} className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-700">Step {step + 1} of {steps.length}</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">{current.title}</h2>
        </div>
        <p className="text-sm text-slate-600" aria-live="polite">{answeredCount} of {totalAnswers} answered</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={step + 1}>
        <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>
      <div className="space-y-6">
        {currentQuestions.map((question) => question.kind === "matrix" ? (
          <fieldset key={question.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <legend className="px-1 text-base font-semibold text-slate-950">{question.statement}</legend>
            <div className="mt-4 space-y-4">
              {question.rows?.map((row) => (
                <div key={row.id}>
                  <p className="text-sm font-medium text-slate-800">{row.statement}</p>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {question.options.map((option) => (
                      <label key={`${row.id}-${option.value}`} className="cursor-pointer rounded-lg border p-3 text-center text-sm has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50">
                        <input className="sr-only" type="radio" name={`q20.${row.id}`} value={option.value} checked={context[row.id] === option.value} onChange={(event) => setContextValue(row.id, event.target.value)} />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
        ) : (
          <fieldset key={question.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <legend className="px-1 text-base font-semibold text-slate-950">{question.statement}</legend>
            <div className="mt-4 grid gap-2 sm:grid-cols-5">
              {question.options.map((option) => (
                <label key={option.value} className="cursor-pointer rounded-lg border p-3 text-center text-sm has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50">
                  <input className="sr-only" type="radio" name={question.id} value={option.value} checked={question.id === "q19" ? context.childhood_onset === option.value : symptoms[question.id] === option.value} onChange={(event) => question.id === "q19" ? setContextValue("childhood_onset", event.target.value) : setSymptom(question.id, event.target.value)} />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      {state && !state.ok && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{state.message}</p>}
      <div className="flex justify-between gap-3">
        <button type="button" onClick={back} disabled={step === 0 || pending} className="rounded-lg border px-4 py-2 font-medium text-slate-700 disabled:opacity-40">Back</button>
        <button type="submit" disabled={pending} className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
          {pending ? "Scoring…" : step === steps.length - 1 ? "See summary" : "Continue"}
        </button>
      </div>
    </form>
  );
}
