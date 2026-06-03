export const WHATSAPP_NUMBER = "255795908230"; // +255 795 908 230

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
