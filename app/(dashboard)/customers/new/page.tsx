import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function createCustomer(formData: FormData) {
  "use server";
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) throw new Error("No clinic configured");
  const customer = await prisma.customer.create({ data: { clinicId: clinic.id, name: String(formData.get("name")), phone: String(formData.get("phone")), notes: String(formData.get("notes") || "") } });
  redirect(`/customers/${customer.id}`);
}

export default function NewCustomerPage() { return <div className="max-w-2xl space-y-6"><div><h1 className="text-2xl font-bold">Add customer</h1><p className="text-sm text-slate-500">Create a digital customer record.</p></div><form action={createCustomer} className="space-y-5 rounded-xl border bg-white p-6"><label className="block text-sm font-medium">Full name *<input name="name" required className="mt-2 w-full rounded-lg border px-3 py-2" /></label><label className="block text-sm font-medium">WhatsApp number *<input name="phone" required className="mt-2 w-full rounded-lg border px-3 py-2" placeholder="628..." /></label><label className="block text-sm font-medium">Notes<textarea name="notes" className="mt-2 min-h-28 w-full rounded-lg border px-3 py-2" /></label><button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Save customer</button></form></div>; }
