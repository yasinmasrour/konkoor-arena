import { Star } from "lucide-react";

interface StarRatingProps {
  value: number | null;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: number;
}

const StarRating = ({
  value,
  onChange,
  readonly = false,
  size = 16,
}: StarRatingProps) => {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value !== null && star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            className={`
              transition-all duration-150
              ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}
            `}
            aria-label={`${star} ستاره`}
          >
            <Star
              size={size}
              className={
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300 dark:text-gray-600"
              }
              strokeWidth={2}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;