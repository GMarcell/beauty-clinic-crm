import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { IconPackage } from "@/components/icons";
import { PageHeader } from "@/components/ui";

async function createPackage(formData: FormData) {
  "use server";

  const customerId = String(formData.get("customerId"));
  const serviceId = String(formData.get("serviceId"));
  const totalSessions = Number(formData.get("totalSessions"));
  const price = Number(formData.get("price"));
  const purchaseDate = formData.get("purchaseDate") ? new Date(String(formData.get("purchaseDate"))) : new Date();

  if (!customerId || !serviceId || !Number.isFinite(totalSessions) || totalSessions < 1 || !Number.isFinite(price) || price < 0) {
    throw new Error("Invalid package data");
  }

  await prisma.package.create({
    data: {
      customerId,
      serviceId,
      totalSessions: Math.trunc(totalSessions),
      price,
      purchaseDate,
    },
  });

  redirect(`/customers/${customerId}`);
}

const inputClass =
  "mt-2 w-full rounded-xl border border-brand-100 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100";

export default async function NewPackagePage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  const { customer: customerParam } = await searchParams;
  const [customers, services] = await Promise.all([
    prisma.customer.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, phone: true } }),
    prisma.service.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="New purchase"
        title="Record package purchase"
        description="Sell a treatment package to a customer."
      />

      <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/85 shadow-soft backdrop-blur-sm">
        <div className="bg-gradient-to-r from-brand-500 to-violet-500 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/30">
              <IconPackage width={22} height={22} />
            </span>
            <div>
              <p className="font-display text-lg font-semibold text-white">Package details</p>
              <p className="text-sm text-brand-100">Customer, service, sessions, and price.</p>
            </div>
          </div>
        </div>

        <form action={createPackage} className="space-y-5 p-6">
          <div>
            <label htmlFor="customerId" className="text-sm font-semibold text-slate-700">
              Customer <span className="text-brand-500">*</span>
            </label>
            <select
              id="customerId"
              name="customerId"
              required
              defaultValue={customerParam ?? ""}
              className={inputClass}
            >
              <option value="" disabled>
                Select customer…
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="serviceId" className="text-sm font-semibold text-slate-700">
              Service <span className="text-brand-500">*</span>
            </label>
            <select id="serviceId" name="serviceId" required className={inputClass}>
              <option value="" disabled>
                Select service…
              </option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="totalSessions" className="text-sm font-semibold text-slate-700">
                Total sessions <span className="text-brand-500">*</span>
              </label>
              <input
                id="totalSessions"
                name="totalSessions"
                type="number"
                min={1}
                step={1}
                required
                placeholder="e.g. 5"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="price" className="text-sm font-semibold text-slate-700">
                Price (Rp) <span className="text-brand-500">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min={0}
                step={1000}
                required
                placeholder="e.g. 1500000"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="purchaseDate" className="text-sm font-semibold text-slate-700">
              Purchase date
            </label>
            <input id="purchaseDate" name="purchaseDate" type="date" className={inputClass} />
            <p className="mt-1.5 text-xs text-slate-400">Leave blank to use today.</p>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-brand-50 pt-5">
            <Link
              href={customerParam ? `/customers/${customerParam}` : "/customers"}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lift transition-all duration-200 hover:from-brand-600 hover:to-brand-700 active:scale-[0.98]"
            >
              Save package
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
