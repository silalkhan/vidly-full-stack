import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const baseStyle =
    "text-sm font-medium transition-colors duration-200 py-2 px-3 rounded-md";

  const getLinkStyle = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? `${baseStyle} text-indigo-400 bg-indigo-500/10 font-semibold`
      : `${baseStyle} text-slate-400 hover:text-slate-100 hover:bg-slate-800/40`;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-900 px-6 py-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-black tracking-wider text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text hover:opacity-90"
          >
            VIDLY
          </Link>

          <div className="hidden items-center space-x-4 md:flex">
            <NavLink to="/movies" className={getLinkStyle}>
              Movies
            </NavLink>
            <NavLink to="/customers" className={getLinkStyle}>
              Customers
            </NavLink>
            <NavLink to="/rentals" className={getLinkStyle}>
              Rentals
            </NavLink>
          </div>

          <div className="hidden items-center space-x-3 md:flex">
            <a
              href="#"
              className="px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-100"
            >
              Login
            </a>
            <a
              href="#"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition-all duration-150 hover:bg-indigo-500 active:bg-indigo-700"
            >
              Register
            </a>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-md p-2 text-slate-300 hover:bg-slate-800 hover:text-white md:hidden"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {isMenuOpen && (
          <div className="mt-4 border-t border-slate-800 pt-4 md:hidden">
            <div className="flex flex-col space-y-2">
              <NavLink
                to="/movies"
                className={getLinkStyle}
                onClick={() => setIsMenuOpen(false)}
              >
                Movies
              </NavLink>
              <NavLink
                to="/customers"
                className={getLinkStyle}
                onClick={() => setIsMenuOpen(false)}
              >
                Customers
              </NavLink>
              <NavLink
                to="/rentals"
                className={getLinkStyle}
                onClick={() => setIsMenuOpen(false)}
              >
                Rentals
              </NavLink>

              <div className="mt-2 flex flex-col gap-2 border-t border-slate-800 pt-3">
                <a
                  href="#"
                  className="text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 transition-colors duration-200 py-2 px-3 rounded-md"
                >
                  Login
                </a>
                <a
                  href="#"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  Register
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
