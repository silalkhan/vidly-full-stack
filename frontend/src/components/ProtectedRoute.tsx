import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type ProtectedRouteProps = {
  adminOnly?: boolean;
};

function ProtectedRoute({ adminOnly = false }: ProtectedRouteProps) {
  const { token, isAdmin, isLoading, profileError, retryProfile, logout } =
    useAuth();
  const location = useLocation();

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (isLoading) {
    return (
      <main
        className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-950"
        aria-busy="true"
      >
        <p role="status" className="text-indigo-400">
          Verifying your session...
        </p>
      </main>
    );
  }

  if (profileError) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-950 p-6">
        <section className="max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 text-center">
          <h1 className="text-lg font-semibold text-rose-400">
            Could not load your profile
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Check your connection and try again. Your session has not been
            treated as verified.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={retryProfile}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
            >
              Log out
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (adminOnly && !isAdmin) {
    // A regular customer landing on a saved admin URL should reach a useful
    // customer page; the API still enforces admin permissions independently.
    return <Navigate to="/my-rentals" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
