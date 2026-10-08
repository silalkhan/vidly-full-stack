function CustomersPage() {
  return (
    <main className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center bg-slate-950 p-6 text-center">
      <div className="space-y-4">
        <h1 className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
          Customers
        </h1>
        <p className="text-base text-slate-400 sm:text-lg">
          Manage your customers
        </p>
      </div>
    </main>
  );
}

export default CustomersPage;
