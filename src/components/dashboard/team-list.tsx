"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, Badge, type BadgeTone, Table, Td, Th, THead, Tr } from "@/components/ui/primitives";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { removeTeamMember } from "@/lib/actions/account";
import { useAction } from "@/lib/use-action";
import type { TeamMember } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const ROLE_META: Record<TeamMember["role"], { label: string; tone: BadgeTone }> = {
  owner: { label: "Owner", tone: "navy" },
  manager: { label: "Manager", tone: "brand" },
  member: { label: "Member", tone: "neutral" },
};

/** `currentEmail` marks the signed-in person's row. Rows with id "self" are display-only. */
export function TeamList({ members, currentEmail }: { members: TeamMember[]; currentEmail: string }) {
  return (
    <Table>
      <THead>
        <tr>
          <Th>Member</Th>
          <Th>Role</Th>
          <Th>Status</Th>
          <Th>Since</Th>
          <Th className="w-12">
            <span className="sr-only">Actions</span>
          </Th>
        </tr>
      </THead>
      <tbody>
        {members.map((m) => (
          <MemberRow key={m.id} member={m} isYou={m.email.toLowerCase() === currentEmail.toLowerCase()} />
        ))}
      </tbody>
    </Table>
  );
}

function MemberRow({ member: m, isYou }: { member: TeamMember; isYou: boolean }) {
  const router = useRouter();
  const { pending, run } = useAction();
  const [confirm, setConfirm] = useState(false);
  const role = ROLE_META[m.role];
  const removable = m.role !== "owner" && m.id !== "self";

  return (
    <Tr>
      <Td>
        <div className="flex items-center gap-3">
          <Avatar name={m.name} size={34} />
          <div className="min-w-0">
            <p className="flex items-center gap-2 truncate font-medium text-ink">
              {m.name}
              {isYou && <span className="text-xs font-normal text-muted">(you)</span>}
            </p>
            <p className="truncate text-xs text-subtle">{m.email}</p>
          </div>
        </div>
      </Td>
      <Td>
        <Badge tone={role.tone}>{role.label}</Badge>
      </Td>
      <Td>
        {m.status === "active" ? (
          <Badge tone="success">
            <span className="size-1.5 rounded-full bg-current opacity-70" />
            Active
          </Badge>
        ) : (
          <Badge tone="warning">
            <span className="size-1.5 rounded-full bg-current opacity-70" />
            Invited
          </Badge>
        )}
      </Td>
      <Td className="whitespace-nowrap text-subtle">
        {m.status === "invited" ? `Invited ${formatDate(m.invitedAt)}` : formatDate(m.invitedAt)}
      </Td>
      <Td>
        {removable && (
          <>
            <Button variant="ghost" size="icon-sm" aria-label={`Remove ${m.name}`} onClick={() => setConfirm(true)}>
              <Trash2 />
            </Button>
            <ConfirmDialog
              open={confirm}
              onOpenChange={setConfirm}
              title={m.status === "invited" ? `Revoke invite for ${m.name}?` : `Remove ${m.name}?`}
              description={
                m.status === "invited"
                  ? "Their pending invitation will be cancelled and the seat freed."
                  : "They will lose access to your agency workspace. You can invite them again later."
              }
              confirmLabel={m.status === "invited" ? "Revoke invite" : "Remove member"}
              pending={pending}
              onConfirm={() =>
                run(() => removeTeamMember(m.id), {
                  onSuccess: () => {
                    setConfirm(false);
                    router.refresh();
                  },
                })
              }
            />
          </>
        )}
      </Td>
    </Tr>
  );
}
