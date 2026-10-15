import { useState, type FormEvent } from "react";
import { useCustomers } from "../hooks/useCustomers";
import { useAddCustomer } from "../hooks/useAddCustomer";
import { useUpdateCustomer } from "../hooks/useUpdateCustomer";
import { useDeleteCustomer } from "../hooks/useDeleteCustomer";
import type { Customer } from "../types/Customer";
import { TableSkeleton } from "../components/LoadingSkeletons";

type CustomerData = Omit<Customer, "_id">;

const initialFormData: CustomerData = {
  name: "",
  phone: "",
  isGold: false,
};

function CustomersPage() {
  const { data: customers = [], isLoading, error } = useCustomers();

  const addCustomer = useAddCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const [formData, setFormData] = useState<CustomerData>(initialFormData);

  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(
    null,
  );

  const [formError, setFormError] = useState("");

  const isSaving = addCustomer.isPending || updateCustomer.isPending;

  function resetForm() {
    setFormData(initialFormData);
    setEditingCustomerId(null);
    setFormError("");
  }

  function handleEdit(customer: Customer) {
    setEditingCustomerId(customer._id);

    setFormData({
      name: customer.name,
      phone: customer.phone,
      isGold: customer.isGold,
    });

    setFormError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    try {
      if (editingCustomerId) {
        await updateCustomer.mutateAsync({
          id: editingCustomerId,
          customer: formData,
        });
      } else {
        await addCustomer.mutateAsync(formData);
      }

      resetForm();
    } catch {
      setFormError(
        `Failed to ${editingCustomerId ? "update" : "add"} customer. Please check your input and try again.`,
      );
    }
  }

  async function handleDelete(customer: Customer) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer.name}?`,
    );

    if (!confirmed) return;

    setFormError("");

    try {
      await deleteCustomer.mutateAsync(customer._id);

      if (editingCustomerId === customer._id) {
        resetForm();
      }
    } catch {
      setFormError("Failed to delete customer. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-[calc(100vh-73px)] bg-slate-950 p-6 md:p-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div aria-hidden="true">
            <div className="mb-3 h-9 w-56 rounded bg-slate-800 motion-safe:animate-pulse" />
            <div className="h-4 w-80 max-w-full rounded bg-slate-800 motion-safe:animate-pulse" />
          </div>
          <div className="h-32 rounded-xl border border-slate-800 bg-slate-900 motion-safe:animate-pulse" />
          <TableSkeleton columns={4} />
        </div>
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
            Check that your backend is running on port 3003.
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
          <h1 className="bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
            Customers
          </h1>

          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Manage your customers and membership details.
          </p>
        </div>

        {/* Customer Form */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-xl font-bold text-slate-100">
            {editingCustomerId ? "Edit Customer" : "Add New Customer"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  minLength={5}
                  maxLength={50}
                  required
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      name: event.target.value,
                    })
                  }
                  placeholder="Enter customer name"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="tel"
                  minLength={5}
                  maxLength={50}
                  required
                  value={formData.phone}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      phone: event.target.value,
                    })
                  }
                  placeholder="Enter phone number"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Gold Membership */}
            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={formData.isGold}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    isGold: event.target.checked,
                  })
                }
                className="h-4 w-4 accent-amber-500"
              />
              Gold Member
            </label>

            {/* Form Error */}
            {formError && (
              <p
                role="alert"
                className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400"
              >
                {formError}
              </p>
            )}

            {/* Form Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : editingCustomerId
                    ? "Update Customer"
                    : "Add Customer"}
              </button>

              {editingCustomerId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-800"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Customer Count */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Total Customers</p>
          <p className="mt-2 text-3xl font-bold text-slate-100">
            {customers.length}
          </p>
        </section>

        {/* Customer List */}
        {customers.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
            <table className="w-full min-w-187.5 text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-800/50 text-slate-300">
                <tr>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Phone</th>
                  <th className="px-6 py-4 font-semibold">Membership</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Actions
                  </th>
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

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(customer)}
                          className="font-medium text-indigo-400 transition hover:text-indigo-300"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(customer)}
                          disabled={deleteCustomer.isPending}
                          className="font-medium text-rose-400 transition hover:text-rose-300 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
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
              Add your first customer using the form above.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default CustomersPage;
