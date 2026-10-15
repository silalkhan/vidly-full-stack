import { Link } from "react-router-dom";

function HomePage() {
  return (
    // Centering layout container taking up remaining viewport height
    <main className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center bg-slate-950 p-6 text-center">
      <div className="space-y-4">
        {/* Brand Main Hero Title */}
        <h1 className="bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
          Welcome to Vidly
        </h1>

        {/* Subtitle Description */}
        <p className="text-base text-slate-400 sm:text-lg">
          Manage your movie collection
        </p>

        {/* Interactive Action Button Elements Group */}
        <div className="pt-4">
          <Link
            to="movies"
            className="inline-block rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition-all duration-150 hover:bg-indigo-500 active:bg-indigo-700"
          >
            Browse Movies
          </Link>
        </div>
      </div>
    </main>
  );
}

export default HomePage;
