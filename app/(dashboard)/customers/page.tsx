import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { IconPlus, IconWhatsApp } from "@/components/icons";
import { Avatar, Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { createWhatsAppLink } from "@/lib/whatsapp";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({ orderBy: { name: "asc" }, take: 100, include: { appointments: { orderBy: { scheduledAt: "desc" }, take: 1 } } });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Directory"
        title="Customers"
        description="Your digital customer database."
        action={
          <Link
            href="/customers/new"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lift transition-all duration-200 hover:from-brand-600 hover:to-brand-700"
          >
            <IconPlus width={16} height={16} className="transition-transform duration-200 group-hover:rotate-90" />
            Add customer
          </Link>
        }
      />

      <Card className="overflow-hidden p-0">
        {customers.length === 0 ? (
          <EmptyState title="No customers yet" description="Add your first customer to get started." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-100 bg-mist-50/80 text-xs uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">WhatsApp</th>
                <th className="px-6 py-4 font-bold">Last appointment</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {customers.map((customer) => (
                <tr key={customer.id} className="group transition-colors hover:bg-brand-50/50">
                  <td className="px-6 py-4">
                    <Link href={`/customers/${customer.id}`} className="flex items-center gap-3">
                      <Avatar name={customer.name} size="sm" />
                      <span className="font-semibold text-slate-800 transition-colors group-hover:text-brand-700">
                        {customer.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{customer.phone}</td>
                  <td className="px-6 py-4">
                    {customer.appointments[0] ? (
                      <span className="text-slate-600">{formatDate(customer.appointments[0].scheduledAt)}</span>
                    ) : (
                      <Badge tone="amber">New</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <a
                        href={createWhatsAppLink(customer.phone, `Hi ${customer.name} 👋`)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 ring-1 ring-emerald-200 transition-colors hover:bg-emerald-100"
                      >
                        <IconWhatsApp width={13} height={13} />
                        Message
                      </a>
                      <Link
                        href={`/customers/${customer.id}`}
                        className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-slate-700"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
