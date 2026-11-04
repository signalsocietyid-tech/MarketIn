"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, MoreHorizontal, Pause, Pencil, Play, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/overlays";
import { setOpportunityStatus } from "@/lib/actions/marketplace";
import { useAction } from "@/lib/use-action";
import type { OpportunityStatus } from "@/lib/types";

export function OpportunityActions({ id, status }: { id: string; status: OpportunityStatus }) {
  const { run, pending } = useAction();
  const router = useRouter();
  const set = (s: OpportunityStatus) => run(() => setOpportunityStatus(id, s), { onSuccess: () => router.refresh() });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Opportunity actions" disabled={pending}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link href={`/opportunities/${id}`}>
            <Eye /> View public listing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/opportunities/${id}/edit`}>
            <Pencil /> Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {status === "open" ? (
          <DropdownMenuItem onSelect={() => set("paused")}>
            <Pause /> Pause applications
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={() => set("open")}>
            <Play /> Reopen
          </DropdownMenuItem>
        )}
        {status !== "closed" && (
          <DropdownMenuItem destructive onSelect={() => set("closed")}>
            <XCircle /> Close opportunity
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
