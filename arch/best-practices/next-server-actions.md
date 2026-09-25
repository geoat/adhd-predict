# Next.js Server Actions

Use a small, explicit pair: a server-only action module and a client component that invokes it.

## Server action

Place actions in a server-marked module:

```ts
"use server";

export async function testServerAction(): Promise<string> {
  return "Hello world";
}
```

Best practices:

- Keep `"use server"` at the top of the module.
- Return serializable values only.
- Validate all client-provided input on the server.
- Keep secrets, database access, and authorization checks inside the action.
- Return structured success/error results for real actions.

## Frontend caller

Call the action from a client component:

```tsx
"use client";

import { useState, useTransition } from "react";
import { testServerAction } from "./actions";

export function ActionButton() {
  const [result, setResult] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      setResult(await testServerAction());
    });
  }

  return (
    <>
      <button type="button" onClick={handleClick} disabled={pending}>
        {pending ? "Calling…" : "Call action"}
      </button>
      <output aria-live="polite">{result ?? "No response yet."}</output>
    </>
  );
}
```

Best practices:

- Put `"use client"` only on the interactive component.
- Disable the control while the action is pending.
- Show a success/error result with `aria-live`.
- Do not put secrets or authorization decisions in the client component.

## Cloudflare Worker deployment

Server Actions require a Worker runtime; do not use `output: "export"` for this application.

Use Vinext:

- Build: `npm run build:vinext`
- Deploy: `wrangler deploy --config dist/server/wrangler.json`
- Preview: `wrangler preview --config dist/server/wrangler.json`

The generated `dist/server/index.js` is the Worker entrypoint. A route-classification warning during Vinext builds is non-fatal; verify behavior by clicking the action in the deployed preview.

## Verification checklist

1. Run `npm ci`.
2. Run `npm run build:vinext`.
3. Deploy a preview.
4. Click the frontend button.
5. Confirm the response came from the action, not hard-coded client state.
