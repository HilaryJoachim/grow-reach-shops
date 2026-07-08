export const WHATSAPP_NUMBER = "916909298493"; // +91 690 929 8493

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
