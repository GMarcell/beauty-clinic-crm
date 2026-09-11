import { prisma } from "@/lib/prisma";
import { createFollowUpMessage, createWhatsAppLink } from "@/lib/whatsapp";
import { IconArrowRight, IconCalendar, IconBell, IconPackage, IconUsers, IconWhatsApp } from "@/components/icons";
import { Avatar, Badge, Card, EmptyState, PageHeader, SectionHeader } from "@/components/ui";
import Link from "next/link";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

const STAT_STYLES = [
  { Icon: IconUsers, accent: "from-brand-500 to-brand-600", chip: "bg-brand-50 text-brand-600" },
  { Icon: IconCalendar, accent: "from-violet-500 to-violet-600", chip: "bg-violet-50 text-violet-600" },
  { Icon: IconBell, accent: "from-amber-500 to-orange-500", chip: "bg-amber-50 text-amber-600" },
  { Icon: IconPackage, accent: "from-teal-500 to-emerald-500", chip: "bg-teal-50 text-teal-600" },
] as const;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
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

  const stats = [
    { label: "Customers", value: customers, href: "/customers" },
    { label: "Upcoming", value: appointments.length, href: "/appointments" },
    { label: "Follow-ups", value: needsFollowUp.length, href: "/follow-ups" },
    { label: "Packages ending", value: expiringPackages, href: "/customers" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title={`${greeting()} 👋`}
        description="Here's what needs your attention today."
      />

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {stats.map(({ label, value, href }, i) => {
          const { Icon, accent, chip } = STAT_STYLES[i];
          return (
            <Link key={label} href={href} className="group">
              <Card className="h-full p-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lift">
                <div className="flex items-start justify-between">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${chip}`}>
                    <Icon width={20} height={20} />
                  </span>
                  <span className={`h-1.5 w-8 rounded-full bg-gradient-to-r ${accent} opacity-70 transition-opacity group-hover:opacity-100`} />
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <SectionHeader
            title="Upcoming appointments"
            subtitle="Next sessions on the calendar"
            action={
              <Link href="/appointments" className="group inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
                View all
                <IconArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            }
          />
          <div className="mt-4 divide-y divide-brand-50">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between gap-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Avatar name={appointment.customer.name} size="sm" />
                  <div>
                    <p className="font-semibold text-slate-800">{appointment.customer.name}</p>
                    <p className="text-sm text-slate-500">{appointment.package?.service.name ?? "Treatment"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700">{formatDate(appointment.scheduledAt)}</p>
                  <Badge tone={appointment.status === "CONFIRMED" ? "green" : "slate"}>{appointment.status.toLowerCase()}</Badge>
                </div>
              </div>
            ))}
            {appointments.length === 0 && <EmptyState title="No upcoming appointments" description="New bookings will show up here." />}
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeader
            title="Follow-ups"
            subtitle="Sessions waiting to be rebooked"
            action={
              <Link href="/follow-ups" className="group inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
                View all
                <IconArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            }
          />
          <div className="mt-4 divide-y divide-brand-50">
            {needsFollowUp.map((customer) => {
              const pkg = customer.packages.find((p) => p.totalSessions - p.treatments.length > 0 && !p.appointments.some((a) => a.scheduledAt > new Date() && a.status !== "CANCELLED"));
              if (!pkg) return null;
              const link = createWhatsAppLink(customer.phone, createFollowUpMessage(customer.name));
              return (
                <div key={customer.id} className="flex items-center justify-between gap-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={customer.name} size="sm" />
                    <div>
                      <p className="font-semibold text-slate-800">{customer.name}</p>
                      <p className="text-sm text-slate-500">{pkg.service.name} · {pkg.totalSessions - pkg.treatments.length} sessions left</p>
                    </div>
                  </div>
                  <a
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md"
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <IconWhatsApp width={14} height={14} />
                    WhatsApp
                  </a>
                </div>
              );
            })}
            {needsFollowUp.length === 0 && <EmptyState title="No follow-ups right now" description="Everyone is booked in. Nice!" />}
          </div>
        </Card>
      </div>
    </div>
  );
}
