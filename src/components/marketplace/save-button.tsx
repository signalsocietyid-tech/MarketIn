"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleSaved } from "@/lib/actions/marketplace";
import { useAction } from "@/lib/use-action";
import { cn } from "@/lib/utils";

export function SaveButton({
  targetType,
  targetId,
  initialSaved,
  signedIn,
  variant = "icon",
}: {
  targetType: "opportunity" | "profile";
  targetId: string;
  initialSaved: boolean;
  signedIn: boolean;
  variant?: "icon" | "full";
}) {
  const [saved, setSaved] = useState(initialSaved);
  const { pending, run } = useAction();
  const router = useRouter();

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!signedIn) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    run(() => toggleSaved(targetType, targetId), { onSuccess: (r) => setSaved(!!r.data?.saved) });
  };

  if (variant === "full") {
    return (
      <Button variant="secondary" onClick={onClick} loading={pending} aria-pressed={saved}>
        <Bookmark className={cn(saved && "fill-brand-500 text-brand-500")} />
        {saved ? "Saved" : "Save"}
      </Button>
    );
  }
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save"}
      className="relative z-10"
    >
      <Bookmark className={cn(saved && "fill-brand-500 text-brand-500")} />
    </Button>
  );
}
