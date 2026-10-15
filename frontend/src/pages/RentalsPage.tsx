import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRentals } from "../hooks/useRentals";
import { useAddRental } from "../hooks/useAddRental";
import { useReturnRental } from "../hooks/useReturnRental";
import { useCustomers } from "../hooks/useCustomers";
import { useMovies } from "../hooks/useMovies";
import { useArchiveReturnedRentals } from "../hooks/useArchiveReturnedRentals";
import type { Rental } from "../types/Rental";
import { TableSkeleton } from "../components/LoadingSkeletons";

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error.response;

    if (
      typeof response === "object" &&
      response !== null &&
      "data" in response
    ) {
      if (typeof response.data === "string") return response.data;
      if (
        typeof response.data === "object" &&
        response.data !== null &&
        "message" in response.data &&
        typeof response.data.message === "string"
      ) {
        return response.data.message;
      }
    }
  }

  return fallback;
}

function RentalsPage() {
  const { isAdmin } = useAuth();
  const [showArchived, setShowArchived] = useState(false);
  const [selectedRentalIds, setSelectedRentalIds] = useState<Set<string>>(
    new Set(),
  );
  const [archiveFeedback, setArchiveFeedback] = useState("");
  const [archiveError, setArchiveError] = useState("");
  const selectAllRef = useRef<HTMLInputElement>(null);

  const {
    data: rentals = [],
    isLoading: rentalsLoading,
    error: rentalsError,
  } = useRentals(showArchived);

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
  const archiveRentalRecords = useArchiveReturnedRentals();

  const [customerId, setCustomerId] = useState("");
  const [movieId, setMovieId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "returned">(
    "all",
  );
  const [formError, setFormError] = useState("");
  const [returnError, setReturnError] = useState("");

  const isLoading = rentalsLoading || customersLoading || moviesLoading;
  const hasError = rentalsError || customersError || moviesError;

  const filteredRentals = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return rentals.filter((rental) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !rental.dateReturned) ||
        (statusFilter === "returned" && Boolean(rental.dateReturned));

      const matchesSearch =
        !term ||
        rental.customer.name.toLowerCase().includes(term) ||
        rental.movie.title.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [rentals, searchTerm, statusFilter]);

  const eligibleFilteredRentals = filteredRentals.filter(
    (rental) => Boolean(rental.dateReturned) && !rental.isArchived,
  );
  const selectedIds = [...selectedRentalIds];
  const selectedCount = selectedIds.length;
  const allEligibleSelected =
    eligibleFilteredRentals.length > 0 &&
    eligibleFilteredRentals.every((rental) =>
      selectedRentalIds.has(rental._id),
    );
  const someEligibleSelected = selectedCount > 0;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        someEligibleSelected && !allEligibleSelected;
    }
  }, [allEligibleSelected, someEligibleSelected]);

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

  function reportArchiveResult(
    archivedCount: number,
    skippedCount: number,
  ) {
    const archivedMessage = `Archived ${archivedCount} returned rental record${archivedCount === 1 ? "" : "s"}.`;
    setArchiveFeedback(
      skippedCount > 0
        ? `${archivedMessage} Skipped ${skippedCount} record${skippedCount === 1 ? "" : "s"} because they were no longer eligible.`
        : archivedMessage,
    );
    setSelectedRentalIds(new Set());
  }

  async function handleArchiveSelected() {
    setArchiveError("");
    setArchiveFeedback("");

    try {
      const preview =
        await archiveRentalRecords.selectedPreviewMutation.mutateAsync(
          selectedIds,
        );

      if (preview.eligibleCount === 0) {
        setArchiveError(
          preview.skippedCount > 0
            ? "The selected rentals are no longer eligible to archive."
            : "Select at least one returned rental to archive.",
        );
        setSelectedRentalIds(new Set());
        return;
      }

      const confirmed = window.confirm(
        `Archive ${preview.eligibleCount} selected returned rental record${preview.eligibleCount === 1 ? "" : "s"}? This keeps the records available for audit. Active rentals will remain untouched, and stock, return dates, and fees will not change.`,
      );

      if (!confirmed) return;

      const archiveResult =
        await archiveRentalRecords.archiveMutation.mutateAsync(
          preview.eligibleIds,
        );
      reportArchiveResult(
        archiveResult.archivedCount,
        preview.skippedCount + archiveResult.skippedCount,
      );
    } catch (error: unknown) {
      setArchiveError(
        getErrorMessage(error, "Failed to archive the selected rentals."),
      );
    }
  }

  async function handleArchiveAllReturned() {
    setArchiveError("");
    setArchiveFeedback("");

    try {
      const result = await archiveRentalRecords.previewQuery.refetch();
      if (result.isError) throw result.error;

      const eligibleIds = result.data?.eligibleIds ?? [];
      if (eligibleIds.length === 0) {
        setArchiveError("There are no returned rentals eligible to archive.");
        return;
      }

      setSelectedRentalIds(new Set(eligibleIds));
      const confirmed = window.confirm(
        `Archive all ${eligibleIds.length} currently eligible returned rental record${eligibleIds.length === 1 ? "" : "s"}? The records will remain available for audit. Active rentals will remain untouched, and stock, return dates, and fees will not change.`,
      );

      if (!confirmed) return;

      const archiveResult =
        await archiveRentalRecords.archiveMutation.mutateAsync(eligibleIds);
      reportArchiveResult(
        archiveResult.archivedCount,
        archiveResult.skippedCount,
      );
    } catch (error: unknown) {
      setArchiveError(
        getErrorMessage(error, "Failed to archive returned rental records."),
      );
    }
  }

  function handleSelectAllVisible(checked: boolean) {
    setSelectedRentalIds((current) => {
      const next = new Set(current);
      for (const rental of eligibleFilteredRentals) {
        if (checked) next.add(rental._id);
        else next.delete(rental._id);
      }
      return next;
    });
  }

  function handleSelectRental(rentalId: string, checked: boolean) {
    setSelectedRentalIds((current) => {
      const next = new Set(current);
      if (checked) next.add(rentalId);
      else next.delete(rentalId);
      return next;
    });
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
  const activeRentals = rentals.filter(
    (rental) => !rental.dateReturned && !rental.isArchived,
  ).length;

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString();
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-950 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page Header */}
        <header className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/10 sm:p-8">
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-indigo-400">
                  Administration
                </p>
                <h1 className="bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
                  Rentals
                </h1>
                <p className="mt-2 text-sm text-slate-400 sm:text-base">
                  Manage movie rentals, returns, and rental history.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="min-w-32 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3">
                  <p className="text-xs font-medium text-slate-400">
                    {showArchived ? "Archived records" : "Rental records"}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-100">
                    {rentals.length}
                  </p>
                </div>
                <div className="min-w-32 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3">
                  <p className="text-xs font-medium text-indigo-300">
                    Active rentals
                  </p>
                  <p className="mt-1 text-2xl font-bold text-indigo-200">
                    {activeRentals}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {isAdmin && (
            <section
              aria-label="Returned rental archive actions"
              className="mt-6 rounded-xl border border-slate-800 bg-slate-950/40 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <h2 className="font-semibold text-slate-100">
                    Returned rental records
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Archive records for a cleaner active list. Archived history
                    remains available to inspect.
                  </p>
                  <p
                    className="mt-2 text-sm font-medium text-amber-300"
                    aria-live="polite"
                  >
                    {archiveRentalRecords.previewQuery.isLoading ||
                    archiveRentalRecords.previewQuery.isFetching
                      ? "Checking returned records..."
                      : archiveRentalRecords.previewQuery.isError
                        ? "Could not load eligible record count."
                        : `${archiveRentalRecords.previewQuery.data?.count ?? 0} returned record(s) eligible to archive`}
                  </p>
                  {archiveRentalRecords.previewQuery.isError && (
                    <button
                      type="button"
                      onClick={() =>
                        void archiveRentalRecords.previewQuery.refetch()
                      }
                      disabled={archiveRentalRecords.previewQuery.isFetching}
                      className="mt-1 text-xs font-medium text-indigo-300 underline hover:text-indigo-200 disabled:opacity-50"
                    >
                      Retry count
                    </button>
                  )}
                </div>
                <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto xl:min-w-[420px]">
                  <button
                    type="button"
                    onClick={() => void handleArchiveSelected()}
                    disabled={
                      selectedCount === 0 ||
                      archiveRentalRecords.selectedPreviewMutation.isPending ||
                      archiveRentalRecords.archiveMutation.isPending
                    }
                    className="rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-200 transition hover:border-indigo-400 hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {archiveRentalRecords.selectedPreviewMutation.isPending
                      ? "Checking selection..."
                      : `Archive Selected (${selectedCount})`}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleArchiveAllReturned()}
                    disabled={
                      archiveRentalRecords.previewQuery.isLoading ||
                      archiveRentalRecords.previewQuery.isFetching ||
                      archiveRentalRecords.previewQuery.isError ||
                      (archiveRentalRecords.previewQuery.data?.count ?? 0) ===
                        0 ||
                      archiveRentalRecords.archiveMutation.isPending
                    }
                    className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:border-amber-400 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {archiveRentalRecords.archiveMutation.isPending
                      ? "Archiving returned records..."
                      : "Clear Returned Records"}
                  </button>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Only returned rentals are eligible. Active rentals, stock, fees,
                and return dates are never changed by archiving.
              </p>
            </section>
          )}
        </header>

        {archiveFeedback && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            {archiveFeedback}
          </div>
        )}

        {archiveError && (
          <div
            role="alert"
            className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300"
          >
            {archiveError}
          </div>
        )}

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

        {/* Rental List */}
        {returnError && (
          <div
            role="alert"
            className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400"
          >
            {returnError}
          </div>
        )}

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Rental records</h2>
              <p className="mt-1 text-sm text-slate-400">
                {filteredRentals.length} matching rentals
              </p>
              {isAdmin && (
                <p className="mt-1 text-sm text-indigo-300" aria-live="polite">
                  {selectedCount} returned rental{selectedCount === 1 ? "" : "s"}{" "}
                  selected.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setSelectedRentalIds(new Set());
                }}
                placeholder="Search customer or movie"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none sm:w-64"
              />
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(
                    event.target.value as "all" | "active" | "returned",
                  );
                  setSelectedRentalIds(new Set());
                }}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-indigo-400 focus:outline-none"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="returned">Returned</option>
              </select>
              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={() => {
                    setShowArchived((current) => !current);
                    setSelectedRentalIds(new Set());
                  }}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                />
                Archived
              </label>
            </div>
          </div>

          {filteredRentals.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
              <table className="w-full min-w-250 text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-800/50 text-slate-300">
                  <tr>
                    <th className="px-4 py-4 font-semibold">
                      <label className="inline-flex items-center gap-2">
                        <input
                          ref={selectAllRef}
                          type="checkbox"
                          checked={allEligibleSelected}
                          disabled={
                            eligibleFilteredRentals.length === 0 ||
                            archiveRentalRecords.archiveMutation.isPending
                          }
                          onChange={(event) =>
                            handleSelectAllVisible(event.target.checked)
                          }
                          aria-label="Select All eligible returned rentals in the current results"
                          className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
                        />
                        <span>Select All</span>
                      </label>
                    </th>
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
                  {filteredRentals.map((rental) => {
                    const isReturned = Boolean(rental.dateReturned);
                    const isArchived = Boolean(rental.isArchived);

                    return (
                      <tr
                        key={rental._id}
                        className="transition-colors hover:bg-slate-800/40"
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedRentalIds.has(rental._id)}
                            disabled={
                              !isReturned ||
                              isArchived ||
                              archiveRentalRecords.archiveMutation.isPending
                            }
                            onChange={(event) =>
                              handleSelectRental(
                                rental._id,
                                event.target.checked,
                              )
                            }
                            aria-label={`Select returned rental for ${rental.customer.name} - ${rental.movie.title}`}
                            className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500 disabled:opacity-40"
                          />
                        </td>
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
                          {rental.dateReturned ? formatDate(rental.dateReturned) : "—"}
                        </td>

                        <td className="px-6 py-4 text-slate-300">
                          {rental.rentalFee != null
                            ? `$${rental.rentalFee.toFixed(2)}`
                            : "—"}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              isArchived
                                ? "bg-slate-500/10 text-slate-300"
                                : isReturned
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-indigo-500/10 text-indigo-400"
                            }`}
                          >
                            {isArchived ? "Archived" : isReturned ? "Returned" : "Active"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {isArchived ? (
                            <span className="text-sm text-slate-500">Archived</span>
                          ) : isReturned ? (
                            <span className="text-sm text-slate-500">Completed</span>
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
              className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-6 py-12 text-center"
            >
              <h2 className="text-xl font-semibold text-slate-200">
                No rental records match this filter
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Try a different search or reset the status filter.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default RentalsPage;
