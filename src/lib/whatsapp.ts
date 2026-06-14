export const WHATSAPP_NUMBER = "255697858009"; // +255 697 858 009

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
