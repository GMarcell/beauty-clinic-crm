import { prisma } from "@/lib/prisma";
import { IconScissors } from "@/components/icons";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";

const SERVICE_ACCENTS = [
  { gradient: "from-rose-400 to-brand-500", chip: "bg-rose-50 text-rose-500" },
  { gradient: "from-violet-400 to-violet-600", chip: "bg-violet-50 text-violet-500" },
  { gradient: "from-amber-400 to-orange-500", chip: "bg-amber-50 text-amber-500" },
  { gradient: "from-teal-400 to-emerald-500", chip: "bg-teal-50 text-teal-500" },
  { gradient: "from-sky-400 to-blue-500", chip: "bg-sky-50 text-sky-500" },
  { gradient: "from-fuchsia-400 to-pink-600", chip: "bg-fuchsia-50 text-fuchsia-500" },
] as const;

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalogue"
        title="Services"
        description="Every treatment your clinic offers, at a glance."
      />

      {services.length === 0 ? (
        <Card>
          <EmptyState title="No services yet" description="Add your first treatment to build the catalogue." />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {services.map((service, i) => {
            const { gradient, chip } = SERVICE_ACCENTS[i % SERVICE_ACCENTS.length];
            return (
              <Card key={service.id} className="group overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${chip} transition-transform duration-300 group-hover:scale-110`}>
                      <IconScissors width={20} height={20} />
                    </span>
                    <Badge tone={service.active ? "green" : "slate"}>
                      {service.active ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </>
                      ) : (
                        "Inactive"
                      )}
                    </Badge>
                  </div>
                  <p className="mt-4 text-base font-bold text-slate-900">{service.name}</p>
                  <p className="mt-1.5 line-clamp-2 min-h-10 text-sm leading-relaxed text-slate-500">{service.description}</p>
                  <div className="mt-4 flex items-baseline justify-between border-t border-brand-50 pt-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">From</span>
                    <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-lg font-extrabold text-transparent">
                      Rp {Number(service.defaultPrice).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
