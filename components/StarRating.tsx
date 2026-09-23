const STAR = 'M12 2.5l2.95 6.28 6.83.77-5.1 4.72 1.4 6.79L12 17.9l-6.08 3.16 1.4-6.79-5.1-4.72 6.83-.77L12 2.5z';

/** Read-only 5-star display, filled clay against unfilled outline. */
export default function StarRating({ rating }: { rating: number }) {
  return (
    <div className="star-rating" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill={i < rating ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d={STAR} />
        </svg>
      ))}
    </div>
  );
}
