"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/overlays";
import { withdrawApplication } from "@/lib/actions/marketplace";
import { useAction } from "@/lib/use-action";

export function WithdrawButton({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false);
  const { run, pending } = useAction();
  const router = useRouter();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-danger-600 hover:bg-danger-50 hover:text-danger-700">
          Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent title="Withdraw application?" description={`Your application to “${title}” will be removed. You can apply again while the listing is open.`} size="sm">
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="secondary">Keep application</Button>
          </DialogClose>
          <Button
            variant="danger"
            loading={pending}
            onClick={() =>
              run(() => withdrawApplication(id), {
                onSuccess: () => {
                  setOpen(false);
                  router.refresh();
                },
              })
            }
          >
            Withdraw
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
