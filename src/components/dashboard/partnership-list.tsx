"use client";

import { useState } from "react";
import { Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/primitives";
import { SegmentedFilter } from "./segmented-filter";
import { PartnershipCard, type PartnershipItem } from "./partnership-card";

type Filter = "all" | PartnershipItem["status"];

export function PartnershipList({ partnerships }: { partnerships: PartnershipItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const count = (s: PartnershipItem["status"]) => partnerships.filter((p) => p.status === s).length;
  const shown = filter === "all" ? partnerships : partnerships.filter((p) => p.status === filter);

  return (
    <div>
      <SegmentedFilter
        className="mb-4"
        label="Filter partnerships by status"
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: "All", count: partnerships.length },
          { value: "active", label: "Active", count: count("active") },
          { value: "paused", label: "Paused", count: count("paused") },
          { value: "completed", label: "Completed", count: count("completed") },
        ]}
      />
      {shown.length === 0 ? (
        <Card>
          <EmptyState
            icon={Handshake}
            title={`No ${filter} partnerships`}
            description="Partnerships move between these states as you pause, resume or complete them."
            action={
              <Button variant="secondary" size="sm" onClick={() => setFilter("all")}>
                Show all
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {shown.map((p) => (
            <PartnershipCard key={p.id} partnership={p} />
          ))}
        </div>
      )}
    </div>
  );
}
