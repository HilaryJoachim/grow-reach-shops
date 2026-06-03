export function formatTsh(value: number): string {
  return `TSh ${Math.round(value).toLocaleString("en-US")}`;
}
