import { Link } from "react-router-dom";

type LoginRequiredNoticeProps = {
  onClose: () => void;
};

function LoginRequiredNotice({ onClose }: LoginRequiredNoticeProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-notice-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="login-notice-title" className="text-xl font-bold text-white">
            Login required
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close notification"
            className="rounded-lg px-3 py-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <p className="mb-6 text-sm leading-6 text-slate-300">
          You need to log in or register before you can perform this action.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/login"
            onClick={onClose}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-indigo-500"
          >
            Log in
          </Link>

          <Link
            to="/register"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-slate-800"
          >
            Register
          </Link>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full text-sm text-slate-400 hover:text-white"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

export default LoginRequiredNotice;
