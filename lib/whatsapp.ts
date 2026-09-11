export function createWhatsAppLink(phone: string, message: string) {
  const normalizedPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

export function createFollowUpMessage(name: string) {
  return `Hi ${name} 👋\n\nTreatment kamu masih memiliki sesi yang tersisa. Yuk jadwalkan sesi berikutnya. Kapan kira-kira kamu tersedia?\n\nTerima kasih 🙏`;
}
