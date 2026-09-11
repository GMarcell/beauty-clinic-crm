"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBell, IconCalendar, IconPackage, IconSparkles, IconUsers } from "./icons";
import { cn } from "./ui";

const links = [
  { label: "Dashboard", href: "/dashboard", Icon: IconSparkles },
  { label: "Customers", href: "/customers", Icon: IconUsers },
  { label: "Appointments", href: "/appointments", Icon: IconCalendar },
  { label: "Follow-ups", href: "/follow-ups", Icon: IconBell },
  { label: "Services", href: "/services", Icon: IconPackage },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 flex w-60 flex-col border-r border-brand-100/70 bg-white/80 p-5 backdrop-blur-xl">
      <div className="mb-9 flex items-center gap-3 px-1">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-lift">
          <IconSparkles width={22} height={22} />
        </span>
        <div>
          <div className="font-display text-lg font-semibold leading-tight text-slate-900">Beauty Clinic</div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-400">CRM MVP</div>
        </div>
      </div>

      <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Menu</p>
      <nav className="space-y-1">
        {links.map(({ label, href, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lift"
                  : "text-slate-600 hover:bg-brand-50 hover:text-brand-700",
              )}
            >
              <Icon
                width={18}
                height={18}
                className={cn(
                  "transition-transform duration-200 group-hover:scale-110",
                  active ? "text-white" : "text-brand-400",
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl bg-gradient-to-br from-brand-50 to-violet-50 p-4 ring-1 ring-brand-100">
        <p className="text-sm font-semibold text-slate-800">Grow your clinic ✨</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Keep every follow-up on time and turn sessions into loyal visits.
        </p>
      </div>
    </aside>
  );
}
