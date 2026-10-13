import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const baseStyle =
    "text-sm font-medium transition-colors duration-200 py-2 px-3 rounded-md";

  const getLinkStyle = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${baseStyle} text-indigo-400 bg-indigo-500/10 font-semibold`
      : `${baseStyle} text-slate-400 hover:text-slate-100 hover:bg-slate-800/40`;

  const closeMenu = () => setIsMenuOpen(false);

  function handleLogout() {
    logout();
    closeMenu();
    navigate("/login", { replace: true });
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-900 px-6 py-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            onClick={closeMenu}
            className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-2xl font-black tracking-wider text-transparent hover:opacity-90"
          >
            VIDLY
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center space-x-4 md:flex">
            {isAuthenticated && (
              <>
                <NavLink to="/movies" className={getLinkStyle}>
                  Movies
                </NavLink>

                <NavLink to="/customers" className={getLinkStyle}>
                  Customers
                </NavLink>

                <NavLink to="/rentals" className={getLinkStyle}>
                  Rentals
                </NavLink>
              </>
            )}
          </div>

          {/* Desktop authentication links */}
          <div className="hidden items-center space-x-3 md:flex">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400"
              >
                Logout
              </button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-indigo-400"
                        : "text-slate-400 hover:text-slate-100"
                    }`
                  }
                >
                  Login
                </NavLink>

                <Link
                  to="/register"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition-all duration-150 hover:bg-indigo-500 active:bg-indigo-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-md p-2 text-slate-300 hover:bg-slate-800 hover:text-white md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="mt-4 border-t border-slate-800 pt-4 md:hidden">
            <div className="flex flex-col space-y-2">
              {isAuthenticated && (
                <>
                  <NavLink
                    to="/movies"
                    className={getLinkStyle}
                    onClick={closeMenu}
                  >
                    Movies
                  </NavLink>

                  <NavLink
                    to="/customers"
                    className={getLinkStyle}
                    onClick={closeMenu}
                  >
                    Customers
                  </NavLink>

                  <NavLink
                    to="/rentals"
                    className={getLinkStyle}
                    onClick={closeMenu}
                  >
                    Rentals
                  </NavLink>
                </>
              )}

              <div className="mt-2 flex flex-col gap-2 border-t border-slate-800 pt-3">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl border border-slate-700 px-4 py-2 text-left text-sm font-semibold text-slate-300 transition hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <NavLink
                      to="/login"
                      className={getLinkStyle}
                      onClick={closeMenu}
                    >
                      Login
                    </NavLink>

                    <Link
                      to="/register"
                      onClick={closeMenu}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-500"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
