"use client";

import { useState, useTransition } from "react";
import { testServerAction } from "./actions";

export function TestActionPanel() {
  const [result, setResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function callAction() {
    startTransition(async () => {
      const response = await testServerAction();
      setResult(response);
    });
  }

  return (
    <section className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
            Backend connectivity check
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
            Test a Next.js Server Action
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Click the button to call the backend and display its response.
          </p>
        </div>

        <button
          type="button"
          onClick={callAction}
          disabled={isPending}
          className="w-fit rounded-full bg-zinc-950 px-5 py-3 font-medium text-white transition hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {isPending ? "Calling backend…" : "Call test action"}
        </button>

        <output
          aria-live="polite"
          className="min-h-12 rounded-xl bg-zinc-100 px-4 py-3 font-mono text-sm text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
        >
          {result ?? "The backend response will appear here."}
        </output>
      </div>
    </section>
  );
}
