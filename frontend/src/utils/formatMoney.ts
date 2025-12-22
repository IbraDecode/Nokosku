export function formatMoney(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return 'Rp 0';
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num);
}
