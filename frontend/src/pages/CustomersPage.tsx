import { useCustomers } from "../hooks/useCustomers";

function CustomersPage() {
  const { data: customers = [], isLoading, error } = useCustomers();

  if (isLoading) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-950">
        <p className="text-lg font-medium text-indigo-400">
          Loading customers...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-950 p-6">
        <div className="text-center">
          <p className="text-lg font-medium text-rose-400">
            Failed to load customers.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Check that your backend is running on port 3000.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-950 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
            Customers
          </h1>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Manage your customers and view their membership details.
          </p>
        </div>

        {/* Customer Count */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Total Customers</p>
          <p className="mt-2 text-3xl font-bold text-slate-100">
            {customers.length}
          </p>
        </div>

        {/* Customer List */}
        {customers.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-800/50 text-slate-300">
                <tr>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Phone</th>
                  <th className="px-6 py-4 font-semibold">Membership</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {customers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="transition-colors hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4 font-medium text-slate-100">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {customer.phone}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          customer.isGold
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {customer.isGold ? "Gold Member" : "Regular Member"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            className="rounded-xl border border-slate-800 bg-slate-900/50 px-6 py-12 text-center"
            role="status"
          >
            <h2 className="text-xl font-semibold text-slate-200">
              No customers found
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Customers will appear here when they are available.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default CustomersPage;
