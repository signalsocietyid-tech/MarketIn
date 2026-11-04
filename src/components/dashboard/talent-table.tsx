"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Loader2, Trash2, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form-controls";
import { Avatar, Badge, type BadgeTone, Card, EmptyState, Table, Td, Th, THead, Tr } from "@/components/ui/primitives";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/overlays";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { SegmentedFilter } from "./segmented-filter";
import { removeTalent, setTalentStatus } from "@/lib/actions/account";
import { useAction } from "@/lib/use-action";
import type { Talent, TalentType } from "@/lib/types";
import { formatCompact, formatDate } from "@/lib/utils";

type TalentStatus = Talent["status"];

const TYPE_LABEL: Record<TalentType, string> = { creator: "Creator / KOL", affiliate: "Affiliate", sales: "Sales rep" };
const TYPE_TONE: Record<TalentType, BadgeTone> = { creator: "brand", affiliate: "blue", sales: "neutral" };

const STATUS_META: Record<TalentStatus, { label: string; tone: BadgeTone }> = {
  available: { label: "Available", tone: "success" },
  on_project: { label: "On project", tone: "warning" },
  inactive: { label: "Inactive", tone: "outline" },
};
const STATUSES: TalentStatus[] = ["available", "on_project", "inactive"];

export function TalentTable({ talents, proposals }: { talents: Talent[]; proposals: Record<string, number> }) {
  const [type, setType] = useState<"all" | TalentType>("all");
  const [status, setStatus] = useState<"all" | TalentStatus>("all");

  const filtered = useMemo(
    () => talents.filter((t) => (type === "all" || t.type === type) && (status === "all" || t.status === status)),
    [talents, type, status],
  );
  const countType = (v: TalentType) => talents.filter((t) => t.type === v).length;

  return (
    <Card>
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 md:flex-row md:items-center md:justify-between">
        <SegmentedFilter
          label="Filter by talent type"
          value={type}
          onChange={setType}
          options={[
            { value: "all", label: "All", count: talents.length },
            { value: "creator", label: "Creators", count: countType("creator") },
            { value: "affiliate", label: "Affiliates", count: countType("affiliate") },
            { value: "sales", label: "Sales reps", count: countType("sales") },
          ]}
        />
        <div className="w-full md:w-48">
          <Select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value as "all" | TalentStatus)}>
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="No talents match these filters"
          description="Try another type or status."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setType("all");
                setStatus("all");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <Table className="min-w-[1040px]">
          <THead>
            <tr>
              <Th>Talent</Th>
              <Th>Type</Th>
              <Th>Specialty</Th>
              <Th>Location</Th>
              <Th className="text-right">Followers</Th>
              <Th>Status</Th>
              <Th className="text-right">Proposals</Th>
              <Th>Added</Th>
              <Th className="w-12">
                <span className="sr-only">Actions</span>
              </Th>
            </tr>
          </THead>
          <tbody>
            {filtered.map((t) => (
              <TalentRow key={t.id} talent={t} proposals={proposals[t.id] ?? 0} />
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}

function TalentRow({ talent: t, proposals }: { talent: Talent; proposals: number }) {
  const router = useRouter();
  const status = useAction();
  const remove = useAction();
  const [confirm, setConfirm] = useState(false);
  const meta = STATUS_META[t.status];

  const changeStatus = (next: TalentStatus) => {
    if (next === t.status) return;
    status.run(() => setTalentStatus(t.id, next), { onSuccess: () => router.refresh() });
  };

  return (
    <Tr>
      <Td>
        <div className="flex items-center gap-3">
          <Avatar name={t.name} size={34} />
          <p className="truncate font-medium text-ink">{t.name}</p>
        </div>
      </Td>
      <Td className="max-w-56 truncate text-subtle" title={t.specialty}>
        {t.specialty}
      </Td>
      <Td>
        <Badge tone={TYPE_TONE[t.type]}>{TYPE_LABEL[t.type]}</Badge>
      </Td>
      <Td className="text-subtle">{t.location}</Td>
      <Td className="text-right tabular-nums">{t.followers ? formatCompact(t.followers) : <span className="text-muted">—</span>}</Td>
      <Td>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              disabled={status.pending}
              className="inline-flex items-center gap-1 rounded-md focus-visible:outline-2 focus-visible:outline-brand-400 disabled:opacity-60"
              aria-label={`Status: ${meta.label}. Change status`}
            >
              <Badge tone={meta.tone}>
                <span className="size-1.5 rounded-full bg-current opacity-70" />
                {meta.label}
              </Badge>
              {status.pending ? <Loader2 className="size-3.5 animate-spin text-muted" /> : <ChevronDown className="size-3.5 text-muted" />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-40">
            <DropdownMenuLabel>Set status</DropdownMenuLabel>
            {STATUSES.map((s) => (
              <DropdownMenuItem key={s} onSelect={() => changeStatus(s)}>
                <Check className={s === t.status ? "opacity-100" : "opacity-0"} />
                {STATUS_META[s].label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </Td>
      <Td className="text-right tabular-nums">{proposals}</Td>
      <Td className="whitespace-nowrap text-subtle">{formatDate(t.addedAt)}</Td>
      <Td>
        <Button variant="ghost" size="icon-sm" aria-label={`Remove ${t.name}`} onClick={() => setConfirm(true)}>
          <Trash2 />
        </Button>
        <ConfirmDialog
          open={confirm}
          onOpenChange={setConfirm}
          title={`Remove ${t.name}?`}
          description="They will be removed from your roster. Proposals already sent on their behalf stay visible to businesses."
          confirmLabel="Remove talent"
          pending={remove.pending}
          onConfirm={() =>
            remove.run(() => removeTalent(t.id), {
              onSuccess: () => {
                setConfirm(false);
                router.refresh();
              },
            })
          }
        />
      </Td>
    </Tr>
  );
}
