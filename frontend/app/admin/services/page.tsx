import { requireAdmin } from "@/lib/authorization";
import { getGsmServiceCategory } from "@/lib/gsm-services";
import { prisma } from "@/lib/prisma";
import { updateGsmService } from "./actions";

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-slate-100 text-slate-600",
};

export default async function AdminGsmServicesPage() {
  await requireAdmin();

  const services = await prisma.gsmService.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">GSM services</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage the customer price, estimated processing time, and availability of each offer.
      </p>

      {services.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          No GSM services have been added yet.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[70rem] text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Input</th>
                <th className="px-4 py-3">Current status</th>
                <th className="px-4 py-3">Offer settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((service) => {
                const category = getGsmServiceCategory(service.category);

                return (
                  <tr key={service.id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900">{service.name}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {service.provider || "RepairCore"} · #{service.id}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {category?.shortLabel || service.category}
                    </td>
                    <td className="px-4 py-4 text-gray-700">{service.inputType}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          statusStyles[service.status] || statusStyles.INACTIVE
                        }`}
                      >
                        {service.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <form action={updateGsmService} className="flex flex-wrap items-end gap-2">
                        <input type="hidden" name="serviceId" value={service.id} />
                        <label className="grid gap-1 text-xs font-medium text-gray-600">
                          Price (USD)
                          <input
                            name="price"
                            type="number"
                            min="0.01"
                            max="100000"
                            step="0.01"
                            defaultValue={service.price.toString()}
                            required
                            className="w-28 rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900"
                          />
                        </label>
                        <label className="grid gap-1 text-xs font-medium text-gray-600">
                          Processing time
                          <input
                            name="estimatedTime"
                            defaultValue={service.estimatedTime}
                            minLength={2}
                            maxLength={80}
                            required
                            className="w-44 rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900"
                          />
                        </label>
                        <label className="grid gap-1 text-xs font-medium text-gray-600">
                          Status
                          <select
                            name="status"
                            defaultValue={service.status === "ACTIVE" ? "ACTIVE" : "INACTIVE"}
                            className="rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900"
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                          </select>
                        </label>
                        <button
                          type="submit"
                          className="rounded-lg bg-blue-600 px-3.5 py-2 font-semibold text-white hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
