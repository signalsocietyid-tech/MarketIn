"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/form-controls";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/overlays";
import { leaveReview } from "@/lib/actions/marketplace";
import { reviewSchema } from "@/lib/validation";
import { useAction } from "@/lib/use-action";
import { cn } from "@/lib/utils";

const RATING_LABEL = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

/** Controlled "Leave review" dialog for a partnership (1–5 stars + comment). */
export function ReviewDialog({
  open,
  onOpenChange,
  partnershipId,
  counterpartName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnershipId: string;
  counterpartName: string;
}) {
  const router = useRouter();
  const { pending, run } = useAction();
  const [hover, setHover] = useState(0);
  const { register, handleSubmit, reset, setValue, control, formState } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { partnershipId, rating: 0, comment: "" },
  });
  const rating = useWatch({ control, name: "rating" }) ?? 0;
  const comment = useWatch({ control, name: "comment" }) ?? "";
  const shown = hover || Number(rating);

  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      reset();
      setHover(0);
    }
  };

  const onSubmit = handleSubmit((values) =>
    run(() => leaveReview(values), {
      onSuccess: () => {
        close(false);
        router.refresh();
      },
    }),
  );

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent title={`Review ${counterpartName}`} description="Your review appears on their public profile and helps others choose partners.">
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <input type="hidden" {...register("partnershipId")} />
          <Field label="Rating" error={formState.errors.rating ? "Select a rating from 1 to 5 stars" : undefined}>
            <div className="flex items-center gap-3">
              <div role="radiogroup" aria-label="Rating" className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={Number(rating) === n}
                    aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
                    onMouseEnter={() => setHover(n)}
                    onFocus={() => setHover(n)}
                    onBlur={() => setHover(0)}
                    onClick={() => setValue("rating", n, { shouldValidate: true })}
                    className="rounded p-0.5 focus-visible:outline-2 focus-visible:outline-brand-400"
                  >
                    <Star className={cn("size-7 transition-colors", n <= shown ? "fill-amber-400 text-amber-400" : "text-navy-100")} />
                  </button>
                ))}
              </div>
              <span className="text-sm font-medium text-subtle">{RATING_LABEL[shown] ?? ""}</span>
            </div>
          </Field>
          <Field label="Comment" htmlFor={`review-comment-${partnershipId}`} error={formState.errors.comment?.message}>
            <Textarea
              id={`review-comment-${partnershipId}`}
              rows={5}
              maxLength={800}
              aria-invalid={!!formState.errors.comment}
              placeholder="How was communication, delivery and the results?"
              {...register("comment")}
            />
          </Field>
          <p className="-mt-2 text-right text-xs text-muted">{comment.length} / 800</p>
          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" loading={pending}>
              Publish review
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
