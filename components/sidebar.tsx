import Link from "next/link";

const links = [
  ["Dashboard", "/dashboard"],
  ["Customers", "/customers"],
  ["Appointments", "/appointments"],
  ["Follow-ups", "/follow-ups"],
  ["Services", "/services"],
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-60 border-r bg-white p-5">
      <div className="mb-8">
        <div className="text-lg font-bold">Beauty Clinic</div>
        <div className="text-xs text-slate-500">CRM MVP</div>
      </div>
      <nav className="space-y-1">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100">
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
