import { prisma } from "@/lib/prisma";
import { createFollowUpMessage, createWhatsAppLink } from "@/lib/whatsapp";

export default async function FollowUpsPage() {
  const customers = await prisma.customer.findMany({ include: { packages: { include: { service: true, treatments: true, appointments: true } } }, orderBy: { name: "asc" } });
  const followUps = customers.flatMap((customer) => customer.packages.filter((pkg) => pkg.totalSessions - pkg.treatments.length > 0 && !pkg.appointments.some((a) => a.scheduledAt > new Date() && a.status !== "CANCELLED")).map((pkg) => ({ customer, pkg, remaining: pkg.totalSessions - pkg.treatments.length })));
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Follow-ups</h1><p className="text-sm text-slate-500">Customers with remaining sessions but no next appointment.</p></div><div className="rounded-xl border bg-white"><div className="divide-y">{followUps.map(({ customer, pkg, remaining }) => <div key={`${customer.id}-${pkg.id}`} className="flex items-center justify-between gap-4 p-5"><div><p className="font-medium">{customer.name}</p><p className="text-sm text-slate-500">{pkg.service.name} · {remaining} sessions remaining</p></div><a href={createWhatsAppLink(customer.phone, createFollowUpMessage(customer.name))} target="_blank" rel="noreferrer" className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white">WhatsApp</a></div>)}{followUps.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No follow-ups.</p>}</div></div></div>;
}
