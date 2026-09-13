import { prisma } from "@/lib/prisma";
import { IconMegaphone } from "@/components/icons";
import { BroadcastComposer } from "@/components/broadcast-composer";
import { PageHeader } from "@/components/ui";

export default async function BroadcastPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, phone: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Marketing"
        title="Broadcast"
        description="Compose a promo once, personalize it per customer, and send via WhatsApp."
        action={
          <div className="inline-flex items-center gap-2 rounded-xl bg-white/85 px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-brand-100 shadow-soft">
            <IconMegaphone width={16} height={16} className="text-brand-500" />
            {customers.length} customers
          </div>
        }
      />
      <BroadcastComposer customers={customers} />
    </div>
  );
}
