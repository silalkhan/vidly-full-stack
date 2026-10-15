import { useAuth } from "../hooks/useAuth";

function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-950 p-6 md:p-10">
      <section className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
            Your Profile
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Account information associated with your Vidly login.
          </p>
        </header>

        <dl className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900 px-6">
          <div className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr] sm:gap-4">
            <dt className="text-sm font-medium text-slate-400">Name</dt>
            <dd className="text-sm text-slate-100">{user.name}</dd>
          </div>
          <div className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr] sm:gap-4">
            <dt className="text-sm font-medium text-slate-400">Email</dt>
            <dd className="break-all text-sm text-slate-100">{user.email}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}

export default ProfilePage;
