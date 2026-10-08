import type { Movie } from "../types/Movie";

interface MovieCardProps {
  movie: Movie;
}

function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg transition-all duration-200 hover:border-slate-700/80">
      <h3 className="text-xl font-bold tracking-tight text-white mb-1">
        {movie.title}
      </h3>

      <div className="mb-4">
        <span className="inline-block rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400">
          {movie.genre.name}
        </span>
      </div>

      <div className="space-y-1.5 text-sm text-slate-400">
        <p className="flex items-center gap-1.5">
          <span>⭐</span> Stock:{" "}
          <span className="font-medium text-slate-200">
            {movie.numberInStock}
          </span>
        </p>
        <p className="flex items-center gap-1.5">
          <span>💰</span> Rate:{" "}
          <span className="font-medium text-slate-200">
            ${movie.dailyRentalRate.toFixed(2)}
          </span>
        </p>
      </div>
    </div>
  );
}

export default MovieCard;
