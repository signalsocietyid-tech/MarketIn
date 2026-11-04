"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetDemoData } from "@/lib/actions/admin";
import { useAction } from "@/lib/use-action";
import { ConfirmDialog } from "./confirm-dialog";

export function ResetDemoButton() {
  const { run, pending } = useAction();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        <RotateCcw /> Reset demo data
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Reset all demo data?"
        description="Restores the original seed data for every collection."
        confirmLabel="Reset demo data"
        pending={pending}
        onConfirm={() => run(() => resetDemoData(), { onSuccess: () => setOpen(false) })}
      >
        <p>
          All registrations, opportunities, applications, subscriptions, plan edits and categories created since the last reset are
          discarded. This cannot be undone. Demo accounts keep their original passwords.
        </p>
      </ConfirmDialog>
    </>
  );
}
