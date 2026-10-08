import type { Movie } from "../types/Movie";
import MovieCard from "./MovieCard";

interface MovieListProps {
  movies: Movie[];
}

function MovieList({ movies }: MovieListProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {movies.map((movie) => (
        <MovieCard key={movie._id} movie={movie} />
      ))}
    </div>
  );
}

export default MovieList;
