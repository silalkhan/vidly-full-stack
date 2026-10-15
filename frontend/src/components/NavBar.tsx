import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { token, isAdmin, isLoading, user, logout } = useAuth();
  const isAuthenticated = Boolean(token);
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
    setIsProfileMenuOpen(false);
    navigate("/login", { replace: true });
  }

  function closeMenus() {
    closeMenu();
    setIsProfileMenuOpen(false);
  }

  const navLinks = (
    <>
      <NavLink to="/movies" className={getLinkStyle} onClick={closeMenus}>
        Movies
      </NavLink>
      {isAuthenticated && (
        <>
          <NavLink to="/customers" className={getLinkStyle} onClick={closeMenus}>
            Customers
          </NavLink>
          <NavLink to="/rentals" className={getLinkStyle} onClick={closeMenus}>
            Rentals
          </NavLink>
        </>
      )}
      {isAdmin && (
        <NavLink to="/admin" className={getLinkStyle} onClick={closeMenus}>
          Admin
        </NavLink>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-900 px-6 py-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            onClick={closeMenu}
            className="bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-2xl font-black tracking-wider text-transparent hover:opacity-90"
          >
            VIDLY
          </Link>

          <div className="hidden items-center space-x-2 md:flex">{navLinks}</div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((open) => !open)}
                  className="rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-indigo-500/60 hover:bg-slate-800"
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                >
                  {user?.name ?? (isLoading ? "Loading profile..." : "Account")}
                </button>
                {isProfileMenuOpen && (
                  <div
                    role="menu"
                    aria-label="Account menu"
                    className="absolute right-0 z-50 mt-2 w-44 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-xl"
                  >
                    <Link
                      to="/profile"
                      role="menuitem"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-400 hover:bg-rose-500/10"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `px-3 py-2 text-sm font-medium transition-colors ${
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
                  className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  Register
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="rounded-md p-2 text-slate-300 hover:bg-slate-800 hover:text-white md:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="mt-4 flex flex-col border-t border-slate-800 pt-4 md:hidden">
            {navLinks}
            {isAuthenticated && user && (
              <p className="mt-2 border-t border-slate-800 px-3 pt-3 text-xs text-slate-500">
                Signed in as {user.name}
              </p>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
