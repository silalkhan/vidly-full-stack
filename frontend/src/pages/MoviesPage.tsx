// import { useState } from "react";
// import type { Movie } from "../types/Movie";
// import MovieList from "../components/MovieList";

// const tempMovies: Movie[] = [
//   {
//     _id: "m1",
//     title: "Inception",
//     genre: { _id: "g1", name: "Action" },
//     numberInStock: 6,
//     dailyRentalRate: 2.5,
//   },
//   {
//     _id: "m2",
//     title: "The Hangover",
//     genre: { _id: "g2", name: "Comedy" },
//     numberInStock: 4,
//     dailyRentalRate: 2.0,
//   },
//   {
//     _id: "m3",
//     title: "The Matrix",
//     genre: { _id: "g1", name: "Action" },
//     numberInStock: 3,
//     dailyRentalRate: 3.0,
//   },
//   {
//     _id: "m4",
//     title: "Interstellar",
//     genre: { _id: "g3", name: "Sci-Fi" },
//     numberInStock: 5,
//     dailyRentalRate: 3.5,
//   },
// ];

// const genres = ["All", "Action", "Comedy", "Sci-Fi"];

// function MoviesPage() {
//   const [search, setSearch] = useState("");
//   const [selectedGenre, setSelectedGenre] = useState("All");

//   const filteredMovies = tempMovies.filter((movie) => {
//     const matchesSearch = movie.title
//       .toLowerCase()
//       .includes(search.trim().toLowerCase());

//     const matchesGenre =
//       selectedGenre === "All" || movie.genre.name === selectedGenre;

//     return matchesSearch && matchesGenre;
//   });

//   return (
//     <main className="min-h-[calc(100vh-73px)] bg-slate-950 p-6 md:p-10">
//       <div className="mx-auto max-w-7xl space-y-8">
//         {/* Header */}
//         <div>
//           <h1 className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
//             Movies Catalog
//           </h1>
//           <p className="mt-2 text-sm text-slate-400 sm:text-base">
//             Browse our movie collection and find your next rental.{" "}
//           </p>
//         </div>

//         {/* Search and Genre Filter */}
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
//           <div className="max-w-md flex-1">
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search movies..."
//               aria-label="Search movies"
//               className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 transition-all duration-150 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
//             />
//           </div>

//           <div
//             className="flex flex-wrap gap-2"
//             aria-label="Filter movies by genre"
//           >
//             {genres.map((genre) => (
//               <button
//                 key={genre}
//                 type="button"
//                 aria-pressed={selectedGenre === genre}
//                 onClick={() => setSelectedGenre(genre)}
//                 className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-150 ${
//                   selectedGenre === genre
//                     ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
//                     : "border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
//                 }`}
//               >
//                 {genre}
//               </button>
//             ))}
//           </div>
//         </div>
//         {/* Results */}
//         {filteredMovies.length > 0 ? (
//           <MovieList movies={filteredMovies} />
//         ) : (
//           <div
//             className="rounded-xl border border-slate-800 bg-slate-900/50 px-6 py-12 text-center"
//             role="status"
//           >
//             <h2 className="text-xl font-semibold text-slate-200">
//               No movies found
//             </h2>
//             <p className="mt-2 text-sm text-slate-400">
//               Try a different search term or genre.
//             </p>
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }

// export default MoviesPage;
import { useState } from "react";
import { useMovies } from "../hooks/useMovies";
import { useGenres } from "../hooks/useGenres";
import MovieList from "../components/MovieList";

function MoviesPage() {
  const { data: movies = [], isLoading, error } = useMovies();
  const { data: genres = [] } = useGenres();

  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  const genreOptions = ["All", ...genres.map((g) => g.name)];

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const matchesGenre =
      selectedGenre === "All" || movie.genre.name === selectedGenre;

    return matchesSearch && matchesGenre;
  });

  if (isLoading) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-950">
        <p className="text-lg font-medium text-indigo-400">Loading movies...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-950">
        <div className="text-center">
          <p className="text-lg font-medium text-rose-400">
            Failed to load movies
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Make sure your backend is running on port 3001
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-950 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
            Movies Catalog
          </h1>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Browse our movie collection and find your next rental.
          </p>
        </div>

        {/* Search + Genre Filter */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="max-w-md flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movies..."
              aria-label="Search movies"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 transition-all duration-150 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div
            className="flex flex-wrap gap-2"
            aria-label="Filter movies by genre"
          >
            {genreOptions.map((genre) => (
              <button
                key={genre}
                type="button"
                aria-pressed={selectedGenre === genre}
                onClick={() => setSelectedGenre(genre)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-150 ${
                  selectedGenre === genre
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
                    : "border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {filteredMovies.length > 0 ? (
          <MovieList movies={filteredMovies} />
        ) : (
          <div
            className="rounded-xl border border-slate-800 bg-slate-900/50 px-6 py-12 text-center"
            role="status"
          >
            <h2 className="text-xl font-semibold text-slate-200">
              No movies found
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Try a different search term or genre.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default MoviesPage;
