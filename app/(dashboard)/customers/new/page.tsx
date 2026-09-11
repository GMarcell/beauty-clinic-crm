import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { IconUser } from "@/components/icons";
import { PageHeader } from "@/components/ui";

async function createCustomer(formData: FormData) {
  "use server";
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) throw new Error("No clinic configured");
  const customer = await prisma.customer.create({ data: { clinicId: clinic.id, name: String(formData.get("name")), phone: String(formData.get("phone")), notes: String(formData.get("notes") || "") } });
  redirect(`/customers/${customer.id}`);
}

const inputClass =
  "mt-2 w-full rounded-xl border border-brand-100 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100";

export default function NewCustomerPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="New record"
        title="Add customer"
        description="Create a digital customer record."
      />

      <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/85 shadow-soft backdrop-blur-sm">
        <div className="bg-gradient-to-r from-brand-500 to-violet-500 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/30">
              <IconUser width={22} height={22} />
            </span>
            <div>
              <p className="font-display text-lg font-semibold text-white">Customer details</p>
              <p className="text-sm text-brand-100">Only name and WhatsApp are required.</p>
            </div>
          </div>
        </div>

        <form action={createCustomer} className="space-y-5 p-6">
          <div>
            <label htmlFor="name" className="text-sm font-semibold text-slate-700">
              Full name <span className="text-brand-500">*</span>
            </label>
            <input id="name" name="name" required placeholder="e.g. Putri Ayu" className={inputClass} />
          </div>

          <div>
            <label htmlFor="phone" className="text-sm font-semibold text-slate-700">
              WhatsApp number <span className="text-brand-500">*</span>
            </label>
            <input id="phone" name="phone" required placeholder="628…" className={inputClass} />
            <p className="mt-1.5 text-xs text-slate-400">Include the country code, e.g. 6281234567890.</p>
          </div>

          <div>
            <label htmlFor="notes" className="text-sm font-semibold text-slate-700">
              Notes
            </label>
            <textarea id="notes" name="notes" placeholder="Skin type, allergies, preferences…" className={`${inputClass} min-h-28 resize-y`} />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-brand-50 pt-5">
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lift transition-all duration-200 hover:from-brand-600 hover:to-brand-700 active:scale-[0.98]"
            >
              Save customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
