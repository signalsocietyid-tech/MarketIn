import { MessageSquareText, Star } from "lucide-react";
import { Avatar, Card, CardHeader, EmptyState } from "@/components/ui/primitives";
import type { Review, User } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export function StarRating({ value, className }: { value: number; className?: string }) {
  const rounded = Math.round(value);
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value.toFixed(1)} out of 5 stars`} role="img">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("size-4", i <= rounded ? "fill-amber-400 text-amber-400" : "fill-navy-50 text-navy-100")} />
      ))}
    </span>
  );
}

type ReviewWithReviewer = Review & { reviewer?: User };

export function ProfileReviews({ reviews, name }: { reviews: ReviewWithReviewer[]; name: string }) {
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  return (
    <Card id="reviews">
      <CardHeader
        title="Reviews"
        description={reviews.length ? `From partners who have worked with ${name}` : undefined}
        action={
          reviews.length > 0 ? (
            <span className="flex items-center gap-2 text-sm">
              <StarRating value={average} />
              <span className="font-semibold text-ink">{average.toFixed(1)}</span>
              <span className="text-subtle">({reviews.length})</span>
            </span>
          ) : undefined
        }
      />
      {reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquareText}
          title="No reviews yet"
          description="Reviews appear here after a completed partnership on MarketIn."
          className="py-10"
        />
      ) : (
        <ul className="divide-y divide-line">
          {reviews.map((r) => {
            const reviewerName = r.reviewer?.name ?? "MarketIn member";
            return (
              <li key={r.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={reviewerName} size={36} />
                    <div>
                      <p className="text-sm font-semibold text-ink">{reviewerName}</p>
                      <p className="text-xs text-muted">{formatDate(r.createdAt)}</p>
                    </div>
                  </div>
                  <StarRating value={r.rating} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink">{r.comment}</p>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
