"use client";

import { useMemo, useRef, useState } from "react";
import { cn } from "./ui";

export type PickerCustomer = {
  id: string;
  name: string;
  phone: string;
};

/** Fuzzy-ish filter: every whitespace-separated token must appear in the haystack. */
function matches(query: string, customer: PickerCustomer) {
  const haystack = `${customer.name} ${customer.phone}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token));
}

export function CustomerPicker({
  customers,
  name = "customerId",
  defaultValue,
}: {
  customers: PickerCustomer[];
  name?: string;
  defaultValue?: string;
}) {
  const initial = defaultValue ? (customers.find((c) => c.id === defaultValue) ?? null) : null;
  const [selected, setSelected] = useState<PickerCustomer | null>(initial);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const results = useMemo(
    () => (query.trim() ? customers.filter((c) => matches(query, c)) : customers),
    [customers, query],
  );

  function pick(customer: PickerCustomer) {
    setSelected(customer);
    setQuery("");
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && results[activeIndex]) {
        e.preventDefault();
        pick(results[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function handleFocus() {
    if (blurTimer.current) {
      clearTimeout(blurTimer.current);
      blurTimer.current = null;
    }
    setActiveIndex(0);
    setOpen(true);
  }

  function handleBlur() {
    // Delay so click on an option fires before the list closes.
    blurTimer.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={selected?.id ?? ""} />

      {selected ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{selected.name}</p>
            <p className="text-xs text-slate-500">{selected.phone}</p>
          </div>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-brand-600 transition-colors hover:bg-brand-100"
          >
            Change
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls="customer-picker-list"
            autoComplete="off"
            placeholder="Search name or phone…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActiveIndex(0);
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:ring-4",
              open ? "border-brand-400 ring-brand-100" : "border-brand-100",
            )}
          />
          {open && (
            <ul
              id="customer-picker-list"
              role="listbox"
              className="absolute z-20 mt-1.5 max-h-60 w-full overflow-y-auto rounded-xl border border-brand-100 bg-white py-1 shadow-lift"
            >
              {results.length === 0 && (
                <li className="px-4 py-3 text-sm text-slate-400">No customers match “{query}”.</li>
              )}
              {results.map((c, i) => (
                <li key={c.id} role="option" aria-selected={i === activeIndex}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(c)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors",
                      i === activeIndex ? "bg-brand-50" : "bg-white",
                    )}
                  >
                    <span className="truncate text-sm font-semibold text-slate-800">{c.name}</span>
                    <span className="shrink-0 text-xs text-slate-400">{c.phone}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
