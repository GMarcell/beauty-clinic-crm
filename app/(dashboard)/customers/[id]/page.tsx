import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildCustomerMessage, createWhatsAppLink } from "@/lib/whatsapp";
import { IconCalendar, IconClock, IconPackage, IconPlus, IconWhatsApp } from "@/components/icons";
import { CustomerMessageCard } from "@/components/customer-message-card";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id }, include: { packages: { include: { service: true, treatments: { orderBy: { sessionNumber: "asc" } } } }, appointments: { orderBy: { scheduledAt: "desc" }, include: { package: { include: { service: true } } } } } });
  if (!customer) notFound();

  const nextAppointment = customer.appointments.find((a) => a.scheduledAt > new Date() && a.status !== "CANCELLED");
  const totalSessionsDone = customer.packages.reduce((sum, pkg) => sum + pkg.treatments.length, 0);
  const totalSessionsPlanned = customer.packages.reduce((sum, pkg) => sum + pkg.totalSessions, 0);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Customer profile" title={customer.name} description={customer.phone} />

      {/* Hero card */}
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-brand-500 via-brand-600 to-violet-600 px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold text-white ring-2 ring-white/40">
                {customer.name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?"}
              </span>
              <div>
                <p className="font-display text-2xl font-semibold text-white">{customer.name}</p>
                <p className="text-sm text-brand-100">{customer.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/10 px-4 py-2 text-center ring-1 ring-white/25">
                <p className="text-xl font-bold text-white">{totalSessionsDone}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-100">Sessions done</p>
              </div>
              <a
                href={createWhatsAppLink(customer.phone, buildCustomerMessage(customer))}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-600 shadow-md transition-all hover:bg-brand-50 active:scale-[0.98]"
              >
                <IconWhatsApp width={16} height={16} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 px-6 py-5 sm:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Packages</p>
            <p className="mt-1 text-lg font-bold text-slate-800">{customer.packages.length}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sessions planned</p>
            <p className="mt-1 text-lg font-bold text-slate-800">{totalSessionsPlanned || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Visits</p>
            <p className="mt-1 text-lg font-bold text-slate-800">{customer.appointments.length}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Since</p>
            <p className="mt-1 text-lg font-bold text-slate-800">{customer.createdAt.toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active packages */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
              <IconPackage width={18} height={18} />
            </span>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Active packages</h2>
            <Link
              href={`/packages/new?customer=${customer.id}`}
              className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-600 ring-1 ring-brand-100 transition-all hover:bg-brand-100 active:scale-[0.98]"
            >
              <IconPlus width={14} height={14} />
              Record purchase
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {customer.packages.map((pkg) => {
              const remaining = pkg.totalSessions - pkg.treatments.length;
              const pct = Math.min(100, (pkg.treatments.length / pkg.totalSessions) * 100);
              return (
                <div key={pkg.id} className="rounded-xl border border-brand-100 bg-white p-4 transition-shadow hover:shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-800">{pkg.service.name}</p>
                      <p className="mt-0.5 text-sm text-slate-500">Purchased {pkg.purchaseDate.toLocaleDateString()}</p>
                    </div>
                    <Badge tone={remaining === 0 ? "slate" : remaining <= 1 ? "amber" : "green"}>
                      {remaining === 0 ? "Completed" : `${remaining} left`}
                    </Badge>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-mist-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {pkg.treatments.length} of {pkg.totalSessions} sessions completed
                  </p>
                </div>
              );
            })}
            {customer.packages.length === 0 && <EmptyState title="No packages yet" />}
          </div>
        </Card>

        {/* Next appointment */}
        <Card className="h-fit p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-500">
              <IconCalendar width={18} height={18} />
            </span>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Next appointment</h2>
          </div>
          {nextAppointment ? (
            <div className="mt-5 rounded-xl bg-gradient-to-br from-brand-50 to-violet-50 p-4 ring-1 ring-brand-100">
              <div className="flex items-center gap-2 text-sm font-semibold text-brand-700">
                <IconClock width={16} height={16} />
                {nextAppointment.scheduledAt.toLocaleDateString("en-US", { dateStyle: "full" })}
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {nextAppointment.scheduledAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {nextAppointment.package?.service.name ?? "Treatment"} · <span className="capitalize">{nextAppointment.status.toLowerCase()}</span>
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
              <p className="text-sm font-semibold text-amber-700">No upcoming appointment</p>
              <p className="mt-1 text-xs text-amber-600">Send a WhatsApp follow-up to rebook.</p>
            </div>
          )}

          {customer.notes && (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Notes</p>
              <p className="mt-2 rounded-xl bg-mist-50 p-3 text-sm leading-relaxed text-slate-600">{customer.notes}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Custom message */}
      <Card className="p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
            <IconWhatsApp width={18} height={18} />
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">WhatsApp message</h2>
            <p className="text-sm text-slate-500">Saved template for this customer — edit, save, and send.</p>
          </div>
        </div>
        <div className="mt-5 max-w-2xl">
          <CustomerMessageCard
            customer={{ id: customer.id, name: customer.name, phone: customer.phone }}
            savedTemplate={customer.customMessage ?? "Hi {name} 👋"}
          />
        </div>
      </Card>

      {/* Treatment history */}
      <Card className="p-6">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">Treatment history</h2>
        <div className="mt-4 divide-y divide-brand-50">
          {customer.packages.flatMap((pkg) =>
            pkg.treatments.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-4 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600 ring-1 ring-emerald-200">
                    {t.sessionNumber}
                  </span>
                  <span className="text-sm font-medium text-slate-700">Session {t.sessionNumber} · {pkg.service.name}</span>
                </div>
                <span className="text-sm text-slate-500">{t.treatmentDate.toLocaleDateString()}</span>
              </div>
            )),
          )}
          {totalSessionsDone === 0 && <EmptyState title="No treatments recorded yet" />}
        </div>
      </Card>
    </div>
  );
}
