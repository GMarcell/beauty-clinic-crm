import { prisma } from "@/lib/prisma";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { name: "asc" } });
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Services</h1><p className="text-sm text-slate-500">Clinic treatment catalogue.</p></div><div className="grid gap-4 md:grid-cols-3">{services.map((service) => <div key={service.id} className="rounded-xl border bg-white p-5"><p className="font-semibold">{service.name}</p><p className="mt-2 text-sm text-slate-500">{service.description}</p><p className="mt-4 font-medium">Rp {Number(service.defaultPrice).toLocaleString("id-ID")}</p></div>)}</div></div>;
}
