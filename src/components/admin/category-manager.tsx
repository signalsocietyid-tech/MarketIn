"use client";

import { useState } from "react";
import { Plus, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-controls";
import { Switch } from "@/components/ui/overlays";
import { Badge, Card, CardHeader, EmptyState } from "@/components/ui/primitives";
import { addCategory, toggleCategory } from "@/lib/actions/admin";
import { useAction } from "@/lib/use-action";
import type { CategoryKind } from "@/lib/types";

export function AddCategoryForm({ kind, kindLabel }: { kind: CategoryKind; kindLabel: string }) {
  const { run, pending } = useAction();
  const [name, setName] = useState("");
  return (
    <form
      className="flex flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        run(() => addCategory(kind, name), { onSuccess: () => setName("") });
      }}
    >
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={`New ${kindLabel.toLowerCase()} name`}
        aria-label={`New ${kindLabel.toLowerCase()} name`}
        maxLength={60}
        className="h-9 sm:w-72"
      />
      <Button type="submit" size="sm" className="h-9" loading={pending} disabled={!name.trim()}>
        {!pending && <Plus />} Add {kindLabel.toLowerCase()}
      </Button>
    </form>
  );
}

function CategoryToggle({ id, name, active }: { id: string; name: string; active: boolean }) {
  const { run, pending } = useAction();
  return (
    <Switch
      checked={active}
      disabled={pending}
      aria-label={`${active ? "Disable" : "Enable"} ${name}`}
      onCheckedChange={() => run(() => toggleCategory(id))}
    />
  );
}

export function CategoryList({
  kind,
  kindLabel,
  rows,
}: {
  kind: CategoryKind;
  kindLabel: string;
  rows: { id: string; name: string; active: boolean; usage: number }[];
}) {
  const active = rows.filter((r) => r.active).length;
  return (
    <Card>
      <CardHeader
        title={`${kindLabel} values`}
        description={`${active} active · ${rows.length - active} disabled. Disabled values disappear from filters and forms; existing records keep them.`}
      />
      <div className="border-b border-line px-5 py-4">
        <AddCategoryForm kind={kind} kindLabel={kindLabel} />
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={Tags} title={`No ${kindLabel.toLowerCase()} values yet`} description="Add the first one above." />
      ) : (
        <ul className="divide-y divide-line">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-4 px-5 py-3">
              <div className="min-w-0">
                <p className={r.active ? "text-sm font-medium text-ink" : "text-sm font-medium text-muted line-through"}>{r.name}</p>
                <p className="text-xs text-subtle">
                  Referenced by {r.usage} {r.usage === 1 ? "record" : "records"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge tone={r.active ? "success" : "outline"}>{r.active ? "Active" : "Disabled"}</Badge>
                <CategoryToggle id={r.id} name={r.name} active={r.active} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
