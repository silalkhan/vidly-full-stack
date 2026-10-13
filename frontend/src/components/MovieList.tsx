import type { Movie } from "../types/Movie";
import MovieCard from "./MovieCard";

interface MovieListProps {
  movies: Movie[];
  onEdit?: (movie: Movie) => void;
  onDelete?: (movie: Movie) => void;
}

function MovieList({ movies, onEdit, onDelete }: MovieListProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {movies.map((movie) => (
        <MovieCard
          key={movie._id}
          movie={movie}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default MovieList;
