import { prisma } from "@/lib/prisma";
import { IconCalendar, IconClock } from "@/components/icons";
import { Avatar, Badge, Card, EmptyState, PageHeader } from "@/components/ui";

const STATUS_TONES = {
  PENDING: "amber",
  CONFIRMED: "green",
  COMPLETED: "slate",
  NO_SHOW: "violet",
  CANCELLED: "slate",
} as const;

export default async function AppointmentsPage() {
  const appointments = await prisma.appointment.findMany({ where: { scheduledAt: { gte: new Date() }, status: { not: "CANCELLED" } }, include: { customer: true, package: { include: { service: true } } }, orderBy: { scheduledAt: "asc" } });

  const byDay = new Map<string, typeof appointments>();
  for (const appointment of appointments) {
    const key = appointment.scheduledAt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    const list = byDay.get(key) ?? [];
    list.push(appointment);
    byDay.set(key, list);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Schedule"
        title="Appointments"
        description="Upcoming treatment schedule."
        action={
          <div className="inline-flex items-center gap-2 rounded-xl bg-white/85 px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-brand-100 shadow-soft">
            <IconCalendar width={16} height={16} className="text-brand-500" />
            {appointments.length} upcoming
          </div>
        }
      />

      {appointments.length === 0 ? (
        <Card>
          <EmptyState title="No upcoming appointments" description="New bookings will appear here." />
        </Card>
      ) : (
        <div className="space-y-5">
          {[...byDay.entries()].map(([day, dayAppointments]) => (
            <div key={day}>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{day}</p>
              <Card className="p-2">
                <div className="divide-y divide-brand-50">
                  {dayAppointments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-4 px-4 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-sm">
                          <span className="text-sm font-bold leading-none">{a.scheduledAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                          <span className="mt-0.5 text-[10px] uppercase tracking-wide text-brand-100">booked</span>
                        </div>
                        <Avatar name={a.customer.name} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-800">{a.customer.name}</p>
                          <p className="text-sm text-slate-500">{a.package?.service.name ?? "Treatment"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="hidden items-center gap-1 text-sm text-slate-400 sm:inline-flex">
                          <IconClock width={14} height={14} />
                          {a.scheduledAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </span>
                        <Badge tone={STATUS_TONES[a.status]}>{a.status.toLowerCase()}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
