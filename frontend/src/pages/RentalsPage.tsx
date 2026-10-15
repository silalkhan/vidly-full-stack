import { useState, type FormEvent } from "react";
import { useRentals } from "../hooks/useRentals";
import { useAddRental } from "../hooks/useAddRental";
import { useReturnRental } from "../hooks/useReturnRental";
import { useCustomers } from "../hooks/useCustomers";
import { useMovies } from "../hooks/useMovies";
import type { Rental } from "../types/Rental";
import { TableSkeleton } from "../components/LoadingSkeletons";

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error.response;

    if (
      typeof response === "object" &&
      response !== null &&
      "data" in response &&
      typeof response.data === "string"
    ) {
      return response.data;
    }
  }

  return fallback;
}

function RentalsPage() {
  const {
    data: rentals = [],
    isLoading: rentalsLoading,
    error: rentalsError,
  } = useRentals();

  const {
    data: customers = [],
    isLoading: customersLoading,
    error: customersError,
  } = useCustomers();

  const {
    data: movies = [],
    isLoading: moviesLoading,
    error: moviesError,
  } = useMovies();

  const addRental = useAddRental();
  const returnRental = useReturnRental();

  const [customerId, setCustomerId] = useState("");
  const [movieId, setMovieId] = useState("");
  const [formError, setFormError] = useState("");
  const [returnError, setReturnError] = useState("");

  const isLoading = rentalsLoading || customersLoading || moviesLoading;
  const hasError = rentalsError || customersError || moviesError;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!customerId || !movieId) {
      setFormError("Please select both a customer and a movie.");
      return;
    }

    try {
      await addRental.mutateAsync({ customerId, movieId });
      setCustomerId("");
      setMovieId("");
    } catch (error: unknown) {
      setFormError(
        getErrorMessage(error, "Failed to create rental. Please try again."),
      );
    }
  }

  async function handleReturn(rental: Rental) {
    const confirmed = window.confirm(
      `Return "${rental.movie.title}" for ${rental.customer.name}?`,
    );

    if (!confirmed) return;

    setReturnError("");

    try {
      await returnRental.mutateAsync({
        customerId: rental.customer._id,
        movieId: rental.movie._id,
      });
    } catch (error: unknown) {
      setReturnError(
        getErrorMessage(error, "Failed to return the movie. Please try again."),
      );
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-[calc(100vh-73px)] bg-slate-950 p-6 md:p-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div aria-hidden="true">
            <div className="mb-3 h-9 w-48 rounded bg-slate-800 motion-safe:animate-pulse" />
            <div className="h-4 w-80 max-w-full rounded bg-slate-800 motion-safe:animate-pulse" />
          </div>
          <div className="h-48 rounded-xl border border-slate-800 bg-slate-900 motion-safe:animate-pulse" />
          <TableSkeleton columns={7} rows={6} />
        </div>
      </main>
    );
  }

  if (hasError) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-950 p-6">
        <div className="text-center">
          <p className="text-lg font-medium text-rose-400">
            Failed to load rental data.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Check that your backend is running and the API routes are available.
          </p>
        </div>
      </main>
    );
  }

  const availableMovies = movies.filter((movie) => movie.numberInStock > 0);
  const activeRentals = rentals.filter((rental) => !rental.dateReturned).length;

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString();
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-950 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
            Rentals
          </h1>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Manage movie rentals and track their status.
          </p>
        </div>

        {/* Create Rental Form */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-xl font-bold text-slate-100">
            Create Rental
          </h2>

          {customers.length === 0 || availableMovies.length === 0 ? (
            <p className="mb-5 text-sm text-amber-400">
              {customers.length === 0
                ? "Add a customer before creating a rental."
                : "No movies are currently in stock."}
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              {/* Customer Select */}
              <div>
                <label
                  htmlFor="customer"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Customer
                </label>
                <select
                  id="customer"
                  required
                  value={customerId}
                  onChange={(event) => setCustomerId(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500"
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name}
                      {customer.isGold ? " (Gold)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Movie Select */}
              <div>
                <label
                  htmlFor="movie"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Movie
                </label>
                <select
                  id="movie"
                  required
                  value={movieId}
                  onChange={(event) => setMovieId(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-indigo-500"
                >
                  <option value="">Select a movie</option>
                  {availableMovies.map((movie) => (
                    <option key={movie._id} value={movie._id}>
                      {movie.title} — {movie.numberInStock} in stock
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formError && (
              <p
                role="alert"
                className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400"
              >
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={
                addRental.isPending ||
                customers.length === 0 ||
                availableMovies.length === 0
              }
              className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {addRental.isPending ? "Creating Rental..." : "Create Rental"}
            </button>
          </form>
        </section>

        {/* Rental Statistics */}
        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total Rentals</p>
            <p className="mt-2 text-3xl font-bold text-slate-100">
              {rentals.length}
            </p>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Active Rentals</p>
            <p className="mt-2 text-3xl font-bold text-indigo-400">
              {activeRentals}
            </p>
          </section>
        </div>

        {/* Rental List */}
        {returnError && (
          <div
            role="alert"
            className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400"
          >
            {returnError}
          </div>
        )}

        {rentals.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
            <table className="w-full min-w-250 text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-800/50 text-slate-300">
                <tr>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Movie</th>
                  <th className="px-6 py-4 font-semibold">Date Out</th>
                  <th className="px-6 py-4 font-semibold">Date Returned</th>
                  <th className="px-6 py-4 font-semibold">Rental Fee</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {rentals.map((rental) => {
                  const isReturned = Boolean(rental.dateReturned);

                  return (
                    <tr
                      key={rental._id}
                      className="transition-colors hover:bg-slate-800/40"
                    >
                      <td className="px-6 py-4 font-medium text-slate-100">
                        {rental.customer.name}
                        {rental.customer.isGold && (
                          <span className="ml-2 rounded-full bg-amber-500/10 px-2 py-1 text-xs text-amber-400">
                            Gold
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {rental.movie.title}
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {formatDate(rental.dateOut)}
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {rental.dateReturned
                          ? formatDate(rental.dateReturned)
                          : "—"}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {rental.rentalFee != null
                          ? `$${rental.rentalFee.toFixed(2)}`
                          : "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            isReturned
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-indigo-500/10 text-indigo-400"
                          }`}
                        >
                          {isReturned ? "Returned" : "Active"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {isReturned ? (
                          <span className="text-sm text-slate-500">
                            Completed
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleReturn(rental)}
                            disabled={returnRental.isPending}
                            className="whitespace-nowrap rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {returnRental.isPending
                              ? "Processing..."
                              : "Return Movie"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            role="status"
            className="rounded-xl border border-slate-800 bg-slate-900/50 px-6 py-12 text-center"
          >
            <h2 className="text-xl font-semibold text-slate-200">
              No rentals found
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Create your first rental using the form above.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default RentalsPage;
