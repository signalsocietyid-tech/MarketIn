"use client";

import Link from "next/link";
import { Building2, ExternalLink, Flag, FlagOff, Lock, MoreHorizontal, RotateCcw, Star, StarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlays";
import { moderateOpportunity } from "@/lib/actions/admin";
import { useAction } from "@/lib/use-action";
import type { OpportunityStatus } from "@/lib/types";

export function OpportunityActions({
  opportunity: o,
}: {
  opportunity: { id: string; title: string; businessId: string; status: OpportunityStatus; featured: boolean; flagged: boolean };
}) {
  const { run, pending } = useAction();
  const act = (a: Parameters<typeof moderateOpportunity>[1]) => run(() => moderateOpportunity(o.id, a));

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${o.title}`} loading={pending}>
          {!pending && <MoreHorizontal />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link href={`/opportunities/${o.id}`}>
            <ExternalLink /> View listing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/profiles/${o.businessId}`}>
            <Building2 /> View company profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {o.featured ? (
          <DropdownMenuItem onSelect={() => act("unfeature")}>
            <StarOff /> Remove from featured
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={() => act("feature")}>
            <Star /> Feature listing
          </DropdownMenuItem>
        )}
        {o.flagged ? (
          <DropdownMenuItem onSelect={() => act("unflag")}>
            <FlagOff /> Clear flag
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem destructive onSelect={() => act("flag")}>
            <Flag /> Flag and hide from search
          </DropdownMenuItem>
        )}
        {o.status === "closed" ? (
          <DropdownMenuItem onSelect={() => act("reopen")}>
            <RotateCcw /> Reopen
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem destructive onSelect={() => act("close")}>
            <Lock /> Close listing
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
