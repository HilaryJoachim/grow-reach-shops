export const WHATSAPP_NUMBER = "255750892900"; // +255 750 892 900

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
