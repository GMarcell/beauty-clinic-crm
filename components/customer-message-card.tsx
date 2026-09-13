"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconSend } from "./icons";
import { MessageComposer, type ComposerCustomer } from "./message-composer";
import { cn } from "./ui";
import { resolveMessageTemplate } from "@/lib/whatsapp";

export function CustomerMessageCard({
  customer,
  savedTemplate,
}: {
  customer: ComposerCustomer;
  savedTemplate: string;
}) {
  const router = useRouter();
  const [template, setTemplate] = useState(savedTemplate);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const dirty = template !== savedTemplate;

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customMessage: template }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  const preview = resolveMessageTemplate(template, { name: customer.name });

  return (
    <div className="rounded-xl bg-mist-50 p-4 ring-1 ring-brand-100">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Custom message</p>
        <span className="text-xs text-slate-400">
          Use <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-brand-600 ring-1 ring-brand-100">{"{name}"}</code> for the customer&apos;s name
        </span>
      </div>

      <textarea
        value={template}
        onChange={(e) => {
          setTemplate(e.target.value);
          setSaved(false);
        }}
        rows={4}
        placeholder="Hi {name} 👋"
        className="mt-2 w-full rounded-xl border border-brand-100 bg-white px-4 py-2.5 text-sm leading-relaxed text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
      />

      {preview.trim() && (
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          <span className="font-semibold text-slate-400">Preview:</span> {preview}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition-all active:scale-[0.98]",
            saving || !dirty ? "bg-slate-300" : "bg-gradient-to-r from-brand-500 to-brand-600 shadow-sm hover:shadow-md",
          )}
        >
          <IconSend width={14} height={14} />
          {saving ? "Saving…" : "Save message"}
        </button>
        {saved && <span className="text-xs font-semibold text-emerald-600">Saved ✓</span>}
      </div>

      <div className="mt-4 border-t border-brand-100 pt-4">
        <MessageComposer customer={customer} initialMessage={preview} />
      </div>
    </div>
  );
}
