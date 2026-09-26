import { AssessmentForm } from "@/components/assessment-form";
import { adhdQuestionBank } from "@/lib/server/adhd-questions";

function projectQuestions() {
  return adhdQuestionBank.questions.map((question) => {
    if (question.id === "q19") {
      return { id: question.id, statement: question.statement, kind: "context" as const, options: question.answer.options.map((option) => ({ value: option.value, label: option.label })) };
    }
    if (question.id === "q20") {
      return { id: question.id, statement: question.statement, kind: "matrix" as const, options: question.answer.options.map((option) => ({ value: option.value, label: option.label })), rows: question.answer.rows };
    }
    return { id: question.id, statement: question.statement, kind: "frequency" as const, options: question.answer.options.map((option) => ({ value: option.value, label: option.label })) };
  });
}

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:py-16">
      <header className="mb-10 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-700">ADHD self-report</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">A clearer starting point for a clinical conversation.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">Answer questions about attention, activity and context. This takes a few minutes and gives you a structured summary to discuss with a qualified clinician.</p>
        <p className="mt-3 text-sm leading-6 text-slate-500">For adults aged 18 and over. Your answers stay in this page while you work and are sent to the Cloudflare Worker only when you request a summary. Refreshing this page clears your progress.</p>
      </header>
      <AssessmentForm questions={projectQuestions()} schemaVersion={adhdQuestionBank.schema_version} />
    </main>
  );
}
