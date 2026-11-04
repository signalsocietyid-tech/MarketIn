"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/validation";

/**
 * Runs a server action inside a transition and surfaces the result as a toast.
 * Redirects thrown by actions (NEXT_REDIRECT) propagate normally.
 */
export function useAction() {
  const [pending, startTransition] = useTransition();

  function run<T>(action: () => Promise<ActionResult<T>>, opts: { onSuccess?: (r: Extract<ActionResult<T>, { ok: true }>) => void; silent?: boolean } = {}) {
    startTransition(async () => {
      const result = await action();
      if (result?.ok) {
        if (!opts.silent && result.message) toast.success(result.message);
        opts.onSuccess?.(result);
      } else if (result) {
        toast.error(result.error);
      }
    });
  }

  return { pending, run };
}
