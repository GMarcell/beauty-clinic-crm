import { prisma } from "@/lib/prisma";

export default async function AppointmentsPage() {
  const appointments = await prisma.appointment.findMany({ where: { scheduledAt: { gte: new Date() }, status: { not: "CANCELLED" } }, include: { customer: true, package: { include: { service: true } } }, orderBy: { scheduledAt: "asc" } });
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Appointments</h1><p className="text-sm text-slate-500">Upcoming treatment schedule.</p></div><div className="rounded-xl border bg-white"><div className="divide-y">{appointments.map((a) => <div key={a.id} className="flex items-center justify-between p-5"><div><p className="font-medium">{a.customer.name}</p><p className="text-sm text-slate-500">{a.package?.service.name ?? "Treatment"} · {a.status}</p></div><p className="text-sm">{a.scheduledAt.toLocaleString()}</p></div>)}{appointments.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No upcoming appointments.</p>}</div></div></div>;
}
