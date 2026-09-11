import { prisma } from "@/lib/prisma";
import { createFollowUpMessage, createWhatsAppLink } from "@/lib/whatsapp";
import { IconBell, IconWhatsApp } from "@/components/icons";
import { Avatar, Card, EmptyState, PageHeader } from "@/components/ui";

export default async function FollowUpsPage() {
  const customers = await prisma.customer.findMany({ include: { packages: { include: { service: true, treatments: true, appointments: true } } }, orderBy: { name: "asc" } });
  const followUps = customers.flatMap((customer) => customer.packages.filter((pkg) => pkg.totalSessions - pkg.treatments.length > 0 && !pkg.appointments.some((a) => a.scheduledAt > new Date() && a.status !== "CANCELLED")).map((pkg) => ({ customer, pkg, remaining: pkg.totalSessions - pkg.treatments.length })));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Retention"
        title="Follow-ups"
        description="Customers with remaining sessions but no next appointment."
        action={
          followUps.length > 0 ? (
            <div className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lift">
              <IconBell width={16} height={16} />
              {followUps.length} to contact
            </div>
          ) : undefined
        }
      />

      {followUps.length === 0 ? (
        <Card>
          <EmptyState title="No follow-ups" description="Every customer with remaining sessions is booked. Great job!" />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {followUps.map(({ customer, pkg, remaining }) => (
            <Card key={`${customer.id}-${pkg.id}`} className="group p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar name={customer.name} size="md" />
                  <div>
                    <p className="font-bold text-slate-800">{customer.name}</p>
                    <p className="text-sm text-slate-500">{pkg.service.name}</p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                  {remaining} left
                </span>
              </div>

              <div className="mt-4 flex items-center gap-1.5">
                {Array.from({ length: pkg.totalSessions }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${i < pkg.treatments.length ? "bg-gradient-to-r from-brand-400 to-brand-500" : "bg-mist-200"}`}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500">
                {pkg.treatments.length} of {pkg.totalSessions} sessions done
              </p>

              <a
                href={createWhatsAppLink(customer.phone, createFollowUpMessage(customer.name))}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
              >
                <IconWhatsApp width={16} height={16} />
                Rebook via WhatsApp
              </a>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
