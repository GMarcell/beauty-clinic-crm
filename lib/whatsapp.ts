/**
 * Normalize an Indonesian phone number to international format for wa.me.
 *
 * Handles the common storage variants:
 *   "081234567801"  → "6281234567801"  (leading 0 → 62)
 *   "+62 812-3456-7801" → "6281234567801"  (already international)
 *   "81234567801"   → "6281234567801"  (local shorthand, missing 0)
 */
export function normalizeIndonesianPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

export function createWhatsAppLink(phone: string, message: string) {
  const normalizedPhone = normalizeIndonesianPhone(phone);
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

export function createFollowUpMessage(name: string) {
  return `Hi ${name} 👋\n\nTreatment kamu masih memiliki sesi yang tersisa. Yuk jadwalkan sesi berikutnya. Kapan kira-kira kamu tersedia?\n\nTerima kasih 🙏`;
}

/** Placeholder available in message templates. */
export const MESSAGE_PLACEHOLDERS = ["{name}"] as const;

/**
 * Resolve `{name}` (and other placeholders) in a template.
 *
 * Multiple spaces around the placeholder are collapsed so "Hi {name}!"
 * and "Hi  {name} !" both render cleanly.
 */
export function resolveMessageTemplate(template: string, vars: { name: string }) {
  return template
    .replaceAll(/\{\s*name\s*\}/gi, vars.name.trim())
    .replace(/ {2,}/g, " ");
}

/** Default used when a customer has no saved customMessage. */
export function defaultCustomerMessage() {
  return `Hi {name} 👋\n\nSemoga sehat selalu! Jangan lupa jadwalkan perawatan berikutnya ya.`;
}

/** Build the message to send for a customer: saved template or default. */
export function buildCustomerMessage(customer: { name: string; customMessage?: string | null }) {
  const template = customer.customMessage?.trim() || defaultCustomerMessage();
  return resolveMessageTemplate(template, { name: customer.name });
}
