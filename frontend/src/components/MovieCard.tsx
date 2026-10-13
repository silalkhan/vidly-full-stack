import type { Movie } from "../types/Movie";

interface MovieCardProps {
  movie: Movie;
  onEdit?: (movie: Movie) => void;
  onDelete?: (movie: Movie) => void;
}

function MovieCard({ movie, onEdit, onDelete }: MovieCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg transition-all duration-200 hover:border-slate-700/80">
      <h3 className="mb-1 text-xl font-bold tracking-tight text-white">
        {movie.title}
      </h3>

      <div className="mb-4">
        <span className="inline-block rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400">
          {movie.genre.name}
        </span>
      </div>

      <div className="space-y-1.5 text-sm text-slate-400">
        <p>
          ⭐ Stock:{" "}
          <span className="font-medium text-slate-200">
            {movie.numberInStock}
          </span>
        </p>

        <p>
          💰 Rate:{" "}
          <span className="font-medium text-slate-200">
            ${movie.dailyRentalRate.toFixed(2)}
          </span>
        </p>
      </div>

      {(onEdit || onDelete) && (
        <div className="mt-5 space-y-2 border-t border-slate-800 pt-4">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(movie)}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Edit Movie
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(movie)}
              className="w-full rounded-lg bg-red-600/10 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-600 hover:text-white"
            >
              Delete Movie
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default MovieCard;
