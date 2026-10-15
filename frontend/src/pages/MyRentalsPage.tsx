import { useState } from "react";
import { useMyRentals } from "../hooks/useMyRentals";
import { useReturnRental } from "../hooks/useReturnRental";
import type { Rental } from "../types/Rental";
import { TableSkeleton } from "../components/LoadingSkeletons";

function formatDate(date?: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}

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

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function MyRentalsPage() {
  const {
    data: rentals,
    isPending,
    isFetching,
    error,
    refetch,
  } = useMyRentals();
  const returnRental = useReturnRental();
  const [returnSuccess, setReturnSuccess] = useState("");
  const [returnError, setReturnError] = useState("");

  const handleReturn = async (rental: Rental) => {
    if (returnRental.isPending || rental.dateReturned) return;

    const confirmed = window.confirm(
      `Return "${rental.movie.title}" and update your rental history?`,
    );
    if (!confirmed) return;

    setReturnSuccess("");
    setReturnError("");

    try {
      await returnRental.mutateAsync({ rentalId: rental._id });
      setReturnSuccess(`${rental.movie.title} was returned successfully.`);
    } catch (err: unknown) {
      setReturnError(getErrorMessage(err, "Failed to return the movie."));
    }
  };

  if (isPending) {
    return (
      <main className="min-h-[calc(100vh-73px)] bg-slate-950 p-6 md:p-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <header>
            <h1 className="bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
              My Rentals
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Loading your rental history…
            </p>
          </header>
          <TableSkeleton columns={6} rows={4} />
        </div>
      </main>
    );
  }

  if (error && !rentals) {
    return (
      <main className="min-h-[calc(100vh-73px)] bg-slate-950 p-6 md:p-10">
        <section
          role="alert"
          className="mx-auto max-w-3xl rounded-xl border border-rose-500/30 bg-rose-500/10 p-6"
        >
          <h1 className="text-xl font-bold text-rose-300">
            Could not load your rentals
          </h1>
          <p className="mt-2 text-sm text-rose-200/80">
            {getErrorMessage(
              error,
              "Your rental history could not be retrieved. Check your connection and try again.",
            )}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-60"
          >
            {isFetching ? "Retrying..." : "Retry"}
          </button>
        </section>
      </main>
    );
  }

  const rentalRecords = rentals ?? [];

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-950 p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
              My Rentals
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              View your active rentals and rental history.
            </p>
          </div>
          {isFetching && (
            <p role="status" className="text-sm text-indigo-300">
              Refreshing rental history…
            </p>
          )}
        </header>

        {error && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>
              Could not refresh your rental history. Showing the last loaded
              records.
            </span>
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="self-start rounded-md border border-amber-400/40 px-3 py-1.5 font-semibold hover:bg-amber-500/10 disabled:opacity-50 sm:self-auto"
            >
              Retry
            </button>
          </div>
        )}

        {returnSuccess && (
          <p
            role="status"
            aria-live="polite"
            className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300"
          >
            {returnSuccess}
          </p>
        )}
        {returnError && (
          <p
            role="alert"
            className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300"
          >
            {returnError}
          </p>
        )}

        {rentalRecords.length === 0 ? (
          <div
            role="status"
            className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center"
          >
            <h2 className="text-lg font-semibold text-slate-200">
              No rentals yet
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Browse the Movies page to rent an available movie.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Movie</th>
                  <th className="px-4 py-3 font-medium">Rental Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Return Date</th>
                  <th className="px-4 py-3 font-medium">Rental Fee</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {rentalRecords.map((rental) => {
                  const isReturned = Boolean(rental.dateReturned);

                  return (
                    <tr key={rental._id} className="align-middle text-slate-200">
                      <td className="px-4 py-4">
                        <div className="font-medium text-white">
                          {rental.movie.title}
                        </div>
                        <div className="text-xs text-slate-400">
                          {rental.customer.isGold
                            ? "Gold customer"
                            : "Standard customer"}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-300">
                        {formatDate(rental.dateOut)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            isReturned
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-amber-500/10 text-amber-300"
                          }`}
                        >
                          {isReturned ? "Returned" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-300">
                        {formatDate(rental.dateReturned)}
                      </td>
                      <td className="px-4 py-4 text-slate-300">
                        {rental.rentalFee != null
                          ? `$${rental.rentalFee.toFixed(2)}`
                          : "Calculated on return"}
                      </td>
                      <td className="px-4 py-4">
                        {!isReturned && (
                          <button
                            type="button"
                            onClick={() => void handleReturn(rental)}
                            disabled={returnRental.isPending}
                            className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {returnRental.isPending
                              ? "Returning..."
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
        )}
      </div>
    </main>
  );
}

export default MyRentalsPage;
