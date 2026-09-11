import { prisma } from "@/lib/prisma";
import { createFollowUpMessage, createWhatsAppLink } from "@/lib/whatsapp";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default async function DashboardPage() {
  const [customers, appointments, packages, followUps] = await Promise.all([
    prisma.customer.count(),
    prisma.appointment.findMany({
      where: { scheduledAt: { gte: new Date() }, status: { not: "CANCELLED" } },
      include: { customer: true, package: { include: { service: true } } },
      orderBy: { scheduledAt: "asc" },
      take: 8,
    }),
    prisma.package.findMany({ include: { treatments: true, service: true, customer: true } }),
    prisma.customer.findMany({ include: { packages: { include: { treatments: true, appointments: true, service: true } } } }),
  ]);

  const needsFollowUp = followUps.filter((customer) => customer.packages.some((pkg) => pkg.totalSessions - pkg.treatments.length > 0 && !pkg.appointments.some((a) => a.scheduledAt > new Date() && a.status !== "CANCELLED"))).slice(0, 5);
  const expiringPackages = packages.filter((pkg) => pkg.totalSessions - pkg.treatments.length <= 1 && pkg.totalSessions - pkg.treatments.length > 0).length;

  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-bold">Good afternoon 👋</h1><p className="mt-1 text-sm text-slate-500">Here&apos;s what needs your attention.</p></div>
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Customers" value={customers} />
        <Stat label="Upcoming" value={appointments.length} />
        <Stat label="Follow-ups" value={needsFollowUp.length} />
        <Stat label="Packages ending" value={expiringPackages} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-white p-5"><h2 className="font-semibold">Upcoming appointments</h2><div className="mt-4 divide-y">{appointments.map((appointment) => <div key={appointment.id} className="flex items-center justify-between py-3"><div><p className="font-medium">{appointment.customer.name}</p><p className="text-sm text-slate-500">{appointment.package?.service.name ?? "Treatment"} · {appointment.status}</p></div><span className="text-sm">{formatDate(appointment.scheduledAt)}</span></div>)}{appointments.length === 0 && <p className="py-6 text-sm text-slate-500">No upcoming appointments.</p>}</div></section>
        <section className="rounded-xl border bg-white p-5"><h2 className="font-semibold">Follow-ups</h2><div className="mt-4 divide-y">{needsFollowUp.map((customer) => { const pkg = customer.packages.find((p) => p.totalSessions - p.treatments.length > 0 && !p.appointments.some((a) => a.scheduledAt > new Date() && a.status !== "CANCELLED")); if (!pkg) return null; const link = createWhatsAppLink(customer.phone, createFollowUpMessage(customer.name)); return <div key={customer.id} className="flex items-center justify-between gap-4 py-3"><div><p className="font-medium">{customer.name}</p><p className="text-sm text-slate-500">{pkg.service.name} · {pkg.totalSessions - pkg.treatments.length} sessions remaining</p></div><a className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white" href={link} target="_blank" rel="noreferrer">WhatsApp</a></div>})}{needsFollowUp.length === 0 && <p className="py-6 text-sm text-slate-500">No follow-ups right now.</p>}</div></section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-xl border bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>; }
