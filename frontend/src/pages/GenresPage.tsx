import { useState, type FormEvent } from "react";
import axios from "axios";
import { useGenres } from "../hooks/useGenres";
import { useAddGenre } from "../hooks/useAddGenre";
import { useDeleteGenre } from "../hooks/useDeleteGenre";
import { TableSkeleton } from "../components/LoadingSkeletons";

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error) && typeof error.response?.data === "string") {
    return error.response.data;
  }
  return fallback;
}

function GenresPage() {
  const { data: genres = [], isLoading, error } = useGenres();
  const addGenre = useAddGenre();
  const deleteGenre = useDeleteGenre();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    try {
      await addGenre.mutateAsync(name.trim());
      setName("");
      setMessage("Genre added.");
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, "Could not add the genre."));
    }
  }

  async function handleDelete(id: string, genreName: string) {
    if (!window.confirm(`Delete the "${genreName}" genre?`)) return;

    setMessage("");
    setErrorMessage("");
    try {
      await deleteGenre.mutateAsync(id);
      setMessage(`"${genreName}" deleted.`);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, "Could not delete the genre."));
    }
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-950 p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <h1 className="bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
            Genre Management
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Add genres and remove unused entries from the catalog.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-5 sm:flex-row"
        >
          <label htmlFor="genre-name" className="sr-only">
            Genre name
          </label>
          <input
            id="genre-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={5}
            maxLength={50}
            required
            placeholder="New genre name"
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={addGenre.isPending}
            className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {addGenre.isPending ? "Adding..." : "Add Genre"}
          </button>
        </form>

        {message && (
          <p role="status" className="text-sm text-emerald-400">
            {message}
          </p>
        )}
        {errorMessage && (
          <p role="alert" className="text-sm text-rose-400">
            {errorMessage}
          </p>
        )}

        {isLoading ? (
          <TableSkeleton columns={2} rows={5} />
        ) : error ? (
          <p role="alert" className="rounded-xl bg-rose-500/10 p-5 text-rose-300">
            Could not load genres. Check your connection and try again.
          </p>
        ) : genres.length === 0 ? (
          <div role="status" className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            No genres found. Add the first genre above.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
            <table className="w-full min-w-125 text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-800/50 text-slate-300">
                <tr>
                  <th className="px-6 py-4 font-semibold">Genre</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {genres.map((genre) => (
                  <tr key={genre._id}>
                    <td className="px-6 py-4 text-slate-100">{genre.name}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => void handleDelete(genre._id, genre.name)}
                        disabled={deleteGenre.isPending}
                        className="rounded-lg px-3 py-2 font-medium text-rose-400 hover:bg-rose-500/10 disabled:opacity-50"
                      >
                        {deleteGenre.isPending ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default GenresPage;
