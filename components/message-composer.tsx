"use client";

import { useMemo, useState } from "react";
import { IconWhatsApp } from "./icons";
import { cn } from "./ui";
import { normalizeIndonesianPhone } from "@/lib/whatsapp";

export type ComposerCustomer = {
  id: string;
  name: string;
  phone: string;
};

export function MessageComposer({
  customer,
  initialMessage,
}: {
  customer: ComposerCustomer;
  initialMessage?: string;
}) {
  const [message, setMessage] = useState(initialMessage ?? `Hi ${customer.name} 👋`);

  const waLink = useMemo(() => {
    const digits = normalizeIndonesianPhone(customer.phone);
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  }, [customer.phone, message]);

  return (
    <div className="rounded-xl bg-mist-50 p-4 ring-1 ring-brand-100">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Message</p>
        <span className={cn("text-xs font-medium", message.length > 1024 ? "text-rose-500" : "text-slate-400")}>
          {message.length} chars
        </span>
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        placeholder={`Hi ${customer.name} 👋`}
        className="mt-2 w-full rounded-xl border border-brand-100 bg-white px-4 py-2.5 text-sm leading-relaxed text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
      />
      <a
        href={waLink}
        target="_blank"
        rel="noreferrer"
        aria-disabled={message.trim().length === 0}
        className={cn(
          "mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all active:scale-[0.98]",
          message.trim().length === 0
            ? "pointer-events-none bg-slate-300"
            : "bg-gradient-to-r from-emerald-500 to-green-600 shadow-sm hover:shadow-md",
        )}
      >
        <IconWhatsApp width={16} height={16} />
        Send via WhatsApp
      </a>
    </div>
  );
}
