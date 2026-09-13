"use client";

import { useMemo, useState } from "react";
import { IconWhatsApp } from "./icons";
import { cn } from "./ui";
import { normalizeIndonesianPhone, resolveMessageTemplate } from "@/lib/whatsapp";

export type BroadcastCustomer = {
  id: string;
  name: string;
  phone: string;
};

const DEFAULT_PROMO = `Hi {name} 👋

Promo spesial dari Glow Beauty Clinic! ✨
Nikmati diskon 20% untuk semua perawatan mulai hari ini hingga akhir bulan.

Balas pesan ini untuk booking. Sampai jumpa! 🌸`;

export function BroadcastComposer({ customers }: { customers: BroadcastCustomer[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(customers.map((c) => c.id)));
  const [template, setTemplate] = useState(DEFAULT_PROMO);
  const [copied, setCopied] = useState(false);

  const resolvedCount = template.includes("{name}") ? selected.size : 0;
  const targets = useMemo(
    () =>
      customers
        .filter((c) => selected.has(c.id))
        .map((c) => ({ ...c, message: resolveMessageTemplate(template, { name: c.name }) })),
    [customers, selected, template],
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll(on: boolean) {
    setSelected(on ? new Set(customers.map((c) => c.id)) : new Set());
  }

  const links = targets.map(
    (t) => `https://wa.me/${normalizeIndonesianPhone(t.phone)}?text=${encodeURIComponent(t.message)}`,
  );

  async function copyLinks() {
    await navigator.clipboard.writeText(links.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Composer */}
      <div className="space-y-4 lg:col-span-3">
        <div className="rounded-2xl border border-white/80 bg-white/85 p-6 shadow-soft backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Promo message</p>
            <span className="text-xs text-slate-400">
              Use <code className="rounded bg-mist-50 px-1.5 py-0.5 font-mono text-[11px] text-brand-600 ring-1 ring-brand-100">{"{name}"}</code> to personalize
            </span>
          </div>
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            rows={9}
            placeholder="Hi {name} 👋 ..."
            className="mt-2 w-full rounded-xl border border-brand-100 bg-white px-4 py-2.5 text-sm leading-relaxed text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
          <p className="mt-2 text-xs text-slate-400">
            {template.length} chars · {resolvedCount > 0 ? `personalized for ${resolvedCount} recipients` : "same text for everyone"}
          </p>
        </div>

        {/* Live preview */}
        <div className="rounded-2xl border border-white/80 bg-white/85 p-6 shadow-soft backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Preview</p>
          <div className="mt-3 space-y-3">
            {targets.slice(0, 3).map((t) => (
              <div key={t.id} className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                <p className="text-xs font-bold text-emerald-700">{t.name} · {t.phone}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{t.message}</p>
              </div>
            ))}
            {targets.length === 0 && <p className="text-sm text-slate-500">Select at least one customer.</p>}
            {targets.length > 3 && (
              <p className="text-xs text-slate-400">…and {targets.length - 3} more recipients</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={copyLinks}
            disabled={targets.length === 0}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all active:scale-[0.98]",
              targets.length === 0 ? "bg-slate-300" : "bg-gradient-to-r from-emerald-500 to-green-600 shadow-sm hover:shadow-md",
            )}
          >
            <IconWhatsApp width={16} height={16} />
            {copied ? "Copied ✓" : `Copy ${targets.length} WhatsApp links`}
          </button>
          <p className="text-xs leading-relaxed text-slate-500">
            Each link is personalized, then opens WhatsApp with the message pre-filled — one tap per customer.
          </p>
        </div>
      </div>

      {/* Recipient list */}
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-white/80 bg-white/85 p-5 shadow-soft backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-slate-800">
              Recipients <span className="text-slate-400">({selected.size}/{customers.length})</span>
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <button type="button" onClick={() => selectAll(true)} className="text-brand-600 hover:text-brand-700">
                All
              </button>
              <span className="text-slate-300">/</span>
              <button type="button" onClick={() => selectAll(false)} className="text-slate-500 hover:text-slate-700">
                None
              </button>
            </div>
          </div>
          <div className="mt-3 max-h-[28rem] space-y-1 overflow-y-auto pr-1">
            {customers.map((c) => {
              const on = selected.has(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    on ? "bg-brand-50 ring-1 ring-brand-200" : "hover:bg-mist-50",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] font-bold transition-all",
                      on ? "border-brand-500 bg-brand-500 text-white" : "border-slate-300 bg-white text-transparent",
                    )}
                  >
                    ✓
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-800">{c.name}</span>
                    <span className="block text-xs text-slate-500">{c.phone}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
