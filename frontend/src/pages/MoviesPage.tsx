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
//           <h1 className="bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
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
//updated code without mock data
import { useEffect, useRef, useState } from "react";
import { useMovies } from "../hooks/useMovies";
import { useGenres } from "../hooks/useGenres";
import { useAddMovie } from "../hooks/useAddMovie";
import { useUpdateMovie } from "../hooks/useUpdateMovie";
import { useDeleteMovie } from "../hooks/useDeleteMovie";
import { useRentMovie } from "../hooks/useRentMovie";
import { useAuth } from "../hooks/useAuth";
import MovieList from "../components/MovieList";
import LoginRequiredNotice from "../components/LoginRequiredNotice";
import type { Movie } from "../types/Movie";
import { MovieListSkeleton } from "../components/LoadingSkeletons";

function MoviesPage() {
  const { data: movies = [], isLoading, error } = useMovies();
  const { data: genres = [] } = useGenres();

  const addMovie = useAddMovie();
  const updateMovie = useUpdateMovie();
  const deleteMovie = useDeleteMovie();
  const rentMovie = useRentMovie();

  // Check authentication and administrator permissions.
  const { isAuthenticated, isAdmin } = useAuth();

  // Control the login-required notification.
  const [showLoginNotice, setShowLoginNotice] = useState(false);
  const [movieToRent, setMovieToRent] = useState<Movie | null>(null);
  const [rentFeedback, setRentFeedback] = useState("");
  const [rentError, setRentError] = useState("");
  const confirmRentRef = useRef<HTMLButtonElement>(null);

  // Search and genre filter state.
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  // Add/Edit form state.
  const [showForm, setShowForm] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [title, setTitle] = useState("");
  const [genreId, setGenreId] = useState("");
  const [numberInStock, setNumberInStock] = useState(0);
  const [dailyRentalRate, setDailyRentalRate] = useState(0);

  const genreOptions = ["All", ...genres.map((genre) => genre.name)];

  // Clear form fields.
  const clearFormFields = () => {
    setTitle("");
    setGenreId("");
    setNumberInStock(0);
    setDailyRentalRate(0);
    setSelectedMovie(null);
  };

  // Reset and close the form.
  const resetForm = () => {
    clearFormFields();
    setShowForm(false);
    addMovie.reset();
    updateMovie.reset();
  };

  // Open the Add Movie form.
  const handleAddClick = () => {
    if (!isAuthenticated) {
      setShowLoginNotice(true);
      return;
    }

    if (!isAdmin) return;

    clearFormFields();
    addMovie.reset();
    updateMovie.reset();
    setShowForm(true);
  };

  // Open the Edit Movie form.
  const handleEditMovie = (movie: Movie) => {
    if (!isAuthenticated) {
      setShowLoginNotice(true);
      return;
    }

    if (!isAdmin) return;

    addMovie.reset();
    updateMovie.reset();

    setSelectedMovie(movie);
    setTitle(movie.title);
    setGenreId(movie.genre._id);
    setNumberInStock(movie.numberInStock);
    setDailyRentalRate(movie.dailyRentalRate);
    setShowForm(true);
  };

  // Delete a movie after checking permissions and confirmation.
  const handleDeleteMovie = (movie: Movie) => {
    if (!isAuthenticated) {
      setShowLoginNotice(true);
      return;
    }

    if (!isAdmin) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${movie.title}"?`,
    );

    if (!confirmed) return;

    deleteMovie.mutate(movie._id);
  };

  const handleRentMovie = (movie: Movie) => {
    if (!isAuthenticated) {
      setShowLoginNotice(true);
      return;
    }

    if (isAdmin) {
      return;
    }

    if (movie.numberInStock <= 0) {
      setRentError("This movie is currently unavailable.");
      setRentFeedback("");
      return;
    }

    setRentError("");
    setRentFeedback("");
    rentMovie.reset();
    setMovieToRent(movie);
  };

  const handleConfirmRent = async () => {
    if (!movieToRent || rentMovie.isPending) return;
    setRentError("");
    try {
      await rentMovie.mutateAsync(movieToRent._id);
      setRentFeedback(`${movieToRent.title} was rented successfully.`);
      setMovieToRent(null);
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "response" in error
          ? (() => {
              const response = error.response;
              return typeof response === "object" &&
                response !== null &&
                "data" in response &&
                typeof response.data === "string"
                ? response.data
                : "Rental failed. Please try again.";
            })()
          : "Rental failed. Please try again.";
      setRentError(message);
    }
  };

  useEffect(() => {
    if (!movieToRent) return;

    confirmRentRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !rentMovie.isPending) {
        setMovieToRent(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movieToRent, rentMovie.isPending]);

  // Close the form after a successful add or update.
  const handleSuccess = () => {
    setSearch("");
    setSelectedGenre("All");
    clearFormFields();
    setShowForm(false);
  };

  // Submit the form to add or update a movie.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Protect the form against unauthorized submissions.
    if (!isAuthenticated) {
      setShowForm(false);
      setShowLoginNotice(true);
      return;
    }

    if (!isAdmin) {
      setShowForm(false);
      return;
    }

    const movieData = {
      title: title.trim(),
      genreId,
      numberInStock,
      dailyRentalRate,
    };

    if (!movieData.title || !movieData.genreId) return;

    if (selectedMovie) {
      updateMovie.mutate(
        {
          id: selectedMovie._id,
          ...movieData,
        },
        {
          onSuccess: handleSuccess,
        },
      );
    } else {
      addMovie.mutate(movieData, {
        onSuccess: handleSuccess,
      });
    }
  };

  // Filter movies by title and selected genre.
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const matchesGenre =
      selectedGenre === "All" || movie.genre.name === selectedGenre;

    return matchesSearch && matchesGenre;
  });

  const isSaving = addMovie.isPending || updateMovie.isPending;

  const mutationError = selectedMovie ? updateMovie.error : addMovie.error;

  const deleteError = deleteMovie.error;

  // Loading state.
  if (isLoading) {
    return (
      <main className="min-h-[calc(100vh-73px)] bg-slate-950 p-6 md:p-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div aria-hidden="true">
            <div className="mb-3 h-9 w-64 rounded bg-slate-800 motion-safe:animate-pulse" />
            <div className="h-4 w-80 max-w-full rounded bg-slate-800 motion-safe:animate-pulse" />
          </div>
          <MovieListSkeleton />
        </div>
      </main>
    );
  }

  // Error state.
  if (error) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-950 p-6">
        {" "}
        <div className="text-center">
          {" "}
          <p className="text-lg font-medium text-rose-400">
            Failed to load movies.{" "}
          </p>{" "}
          <p className="mt-2 text-sm text-slate-400">
            Check that your backend is running and the API URL is correct.{" "}
          </p>{" "}
        </div>{" "}
      </main>
    );
  }

  return (
    <>
      {" "}
      <main className="min-h-[calc(100vh-73px)] bg-slate-950 p-6 md:p-10">
        {" "}
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}{" "}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {" "}
            <div>
              {" "}
              <h1 className="bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
                Movies Catalog{" "}
              </h1>{" "}
              <p className="mt-2 text-sm text-slate-400 sm:text-base">
                Browse our movie collection and find your next rental.{" "}
              </p>{" "}
            </div>
            {/* Only administrators can see Add Movie. */}
            {isAdmin && (
              <button
                type="button"
                onClick={handleAddClick}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:bg-indigo-500 active:bg-indigo-700"
              >
                <span className="text-lg leading-none" aria-hidden="true">
                  +
                </span>
                Add Movie
              </button>
            )}
          </div>
          {/* Add/Edit Movie Form: administrators only. */}
          {isAdmin && showForm && (
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">
                    {selectedMovie ? "Edit Movie" : "Add a Movie"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {selectedMovie
                      ? "Update the movie details below."
                      : "Enter the movie details below."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSaving}
                  aria-label="Close form"
                  className="rounded-lg px-3 py-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                >
                  ✕
                </button>
              </div>

              {/* Movie Title */}
              <div className="space-y-2">
                <label
                  htmlFor="movie-title"
                  className="block text-sm font-medium text-slate-300"
                >
                  Movie Title
                </label>
                <input
                  id="movie-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Interstellar"
                  minLength={1}
                  maxLength={255}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Genre */}
              <div className="space-y-2">
                <label
                  htmlFor="movie-genre"
                  className="block text-sm font-medium text-slate-300"
                >
                  Genre
                </label>
                <select
                  id="movie-genre"
                  value={genreId}
                  onChange={(e) => setGenreId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="" disabled>
                    Select a genre
                  </option>
                  {genres.map((genre) => (
                    <option key={genre._id} value={genre._id}>
                      {genre.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock and Rental Rate */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="movie-stock"
                    className="block text-sm font-medium text-slate-300"
                  >
                    Number in Stock
                  </label>
                  <input
                    id="movie-stock"
                    type="number"
                    min="0"
                    step="1"
                    value={numberInStock}
                    onChange={(e) => setNumberInStock(Number(e.target.value))}
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="movie-rate"
                    className="block text-sm font-medium text-slate-300"
                  >
                    Daily Rental Rate ($)
                  </label>
                  <input
                    id="movie-rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={dailyRentalRate}
                    onChange={(e) => setDailyRentalRate(Number(e.target.value))}
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* API Error */}
              {mutationError && (
                <p
                  role="alert"
                  className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400"
                >
                  {mutationError.message ||
                    "The movie could not be saved. Please try again."}
                </p>
              )}

              {/* Form Actions */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSaving}
                  className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving || !genreId || !title.trim()}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving
                    ? "Saving..."
                    : selectedMovie
                      ? "Update Movie"
                      : "Save Movie"}
                </button>
              </div>
            </form>
          )}
          {/* Search and Genre Filter */}
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
          {rentFeedback && (
            <p
              role="status"
              aria-live="polite"
              className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
            >
              {rentFeedback}
            </p>
          )}
          {rentError && !movieToRent && (
            <p
              role="alert"
              className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
            >
              {rentError}
            </p>
          )}
          {/* Delete Error */}
          {deleteError && (
            <p
              role="alert"
              className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400"
            >
              {deleteError.message ||
                "Failed to delete the movie. Please try again."}
            </p>
          )}
          {/* Movie Results */}
          {filteredMovies.length > 0 ? (
            <MovieList
              movies={filteredMovies}
              onEdit={isAdmin ? handleEditMovie : undefined}
              onDelete={isAdmin ? handleDeleteMovie : undefined}
              onRent={!isAdmin ? handleRentMovie : undefined}
            />
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
      {movieToRent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="rent-confirmation-title"
            aria-describedby="rent-confirmation-description"
            className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
          >
            <h2
              id="rent-confirmation-title"
              className="text-xl font-bold text-slate-100"
            >
              Confirm rental
            </h2>
            <p
              id="rent-confirmation-description"
              className="mt-3 text-sm leading-6 text-slate-300"
            >
              Rent “{movieToRent.title}” for your account at $
              {movieToRent.dailyRentalRate.toFixed(2)} per day? The available
              stock will decrease after the rental is confirmed.
            </p>
            {rentError && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300"
              >
                {rentError}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setMovieToRent(null)}
                disabled={rentMovie.isPending}
                className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                ref={confirmRentRef}
                type="button"
                onClick={() => void handleConfirmRent()}
                disabled={rentMovie.isPending}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {rentMovie.isPending ? "Renting movie..." : "Confirm Rental"}
              </button>
            </div>
          </section>
        </div>
      )}
      {/* Show the login/register notice when a guest attempts a restricted action. */}
      {showLoginNotice && (
        <LoginRequiredNotice onClose={() => setShowLoginNotice(false)} />
      )}
    </>
  );
}

export default MoviesPage;
