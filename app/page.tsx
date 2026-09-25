import { TestActionPanel } from "./test-action";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
            ADHD Prediction
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Backend action test
          </h1>
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
            Verify that the deployed frontend can call a Next.js Server Action.
          </p>
        </div>
        <TestActionPanel />
      </div>
    </main>
  );
}
