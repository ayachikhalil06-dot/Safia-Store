import { Star } from "lucide-react";
import type { Review } from "@/types";
import { formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";

interface ReviewsListProps {
  reviews: Review[];
  average: number;
  count: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-neutral-200 text-neutral-200"
          )}
        />
      ))}
    </div>
  );
}

export function ReviewsList({ reviews, average, count }: ReviewsListProps) {
  if (count === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-neutral-500">Aucun avis pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="text-3xl font-semibold text-neutral-900">{average}</div>
        <div>
          <StarRating rating={Math.round(average)} />
          <p className="mt-1 text-sm text-neutral-500">
            {count} avis
          </p>
        </div>
      </div>

      <div className="divide-y divide-neutral-200">
        {reviews.map((review) => (
          <div key={review.id} className="py-6 first:pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {review.customer_name}
                </p>
                <StarRating rating={review.rating} />
              </div>
              <div className="flex items-center gap-2">
                {review.is_verified && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    Achat vérifié
                  </span>
                )}
                <span className="text-xs text-neutral-400">
                  {formatDate(review.created_at)}
                </span>
              </div>
            </div>
            {review.title && (
              <p className="mt-2 text-sm font-medium text-neutral-800">
                {review.title}
              </p>
            )}
            <p className="mt-1 text-sm text-neutral-600 leading-relaxed">
              {review.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
