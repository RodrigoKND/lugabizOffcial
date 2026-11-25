import { Star } from 'lucide-react';
import type { Review } from '@domain/entities';

interface PlaceReviewStripProps {
  reviews: Review[];
}

// Las últimas reseñas de un vistazo, antes de leerlas completas.
export default function PlaceReviewStrip({ reviews }: PlaceReviewStripProps) {
  if (reviews.length === 0) return null;

  return (
    <ul className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
      {reviews.slice(0, 5).map(review => (
        <li key={review.id} className="flex shrink-0 items-center gap-2 rounded-xl border-2 border-lg-surface-2 bg-lg-surface px-3 py-2">
          <img src={review.userAvatar || '/avatar.png'} alt="" className="h-9 w-9 rounded-full object-cover" />
          <div>
            <p className="text-xs font-bold text-lg-text">{review.userName}</p>
            <p className="flex items-center gap-1 text-xs font-semibold text-lg-dim">
              <Star className="h-3 w-3 fill-lg-maiz text-lg-maiz" /> {review.rating}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
