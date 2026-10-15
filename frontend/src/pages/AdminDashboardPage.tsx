import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useCustomers } from "../hooks/useCustomers";
import { useGenres } from "../hooks/useGenres";
import { useMovies } from "../hooks/useMovies";
import { useRentals } from "../hooks/useRentals";
import { DashboardStatsSkeleton } from "../components/LoadingSkeletons";

function AdminDashboardPage() {
  const movies = useMovies();
  const genres = useGenres();
  const customers = useCustomers();
  const rentals = useRentals();
  const queries = [movies, genres, customers, rentals];
  const isLoading = queries.some((query) => query.isLoading);
  const hasError = queries.some((query) => query.isError);

  const stats = useMemo(() => {
    const allRentals = rentals.data ?? [];
    const activeRentals = allRentals.filter((rental) => !rental.dateReturned).length;
    const returnedRentals = allRentals.filter((rental) => rental.dateReturned).length;

    return [
      { label: "Total movies", value: movies.data?.length ?? 0, href: "/movies" },
      { label: "Total genres", value: genres.data?.length ?? 0, href: "/genres" },
      {
        label: "Total customers",
        value: customers.data?.length ?? 0,
        href: "/customers",
      },
      { label: "Total rentals", value: allRentals.length, href: "/rentals" },
      { label: "Active rentals", value: activeRentals, href: "/rentals" },
      { label: "Returned rentals", value: returnedRentals, href: "/rentals" },
    ];
  }, [customers.data, genres.data, movies.data, rentals.data]);

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-950 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <h1 className="bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            A live summary of Vidly catalog and rental activity.
          </p>
        </header>

        {isLoading ? (
          <DashboardStatsSkeleton />
        ) : hasError ? (
          <section
            role="alert"
            className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-5 text-rose-300"
          >
            Dashboard data could not be loaded. Check the API connection and refresh the page.
          </section>
        ) : (
          <section
            aria-label="Dashboard statistics"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            {stats.map((stat) => (
              <Link
                key={stat.label}
                to={stat.href}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-indigo-500/50"
              >
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-100">{stat.value}</p>
              </Link>
            ))}
          </section>
        )}

        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-100">Quick actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Manage movies", href: "/movies" },
              { label: "Manage genres", href: "/genres" },
              { label: "Manage customers", href: "/customers" },
              { label: "Manage rentals", href: "/rentals" },
            ].map((action) => (
              <Link
                key={action.href}
                to={action.href}
                className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-4 font-semibold text-indigo-300 transition hover:border-indigo-500/50 hover:bg-slate-800"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-100">Recent rentals</h2>
            <Link
              to="/rentals"
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
            >
              View all
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3" aria-busy="true" role="status">
              <span className="sr-only">Loading recent rentals...</span>
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  aria-hidden="true"
                  className="h-10 rounded bg-slate-800 motion-safe:animate-pulse"
                />
              ))}
            </div>
          ) : hasError ? (
            <p className="text-sm text-slate-400">
              Recent rentals are unavailable until dashboard data loads.
            </p>
          ) : rentals.data?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-130 text-left text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Movie</th>
                    <th className="pb-3 font-medium">Date out</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {(rentals.data ?? []).slice(0, 5).map((rental) => (
                    <tr key={rental._id}>
                      <td className="py-3 text-slate-200">{rental.customer.name}</td>
                      <td className="py-3 text-slate-300">{rental.movie.title}</td>
                      <td className="py-3 text-slate-400">
                        {new Date(rental.dateOut).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-slate-300">
                        {rental.dateReturned ? "Returned" : "Active"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p role="status" className="text-sm text-slate-400">
              No rentals have been recorded yet.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminDashboardPage;
