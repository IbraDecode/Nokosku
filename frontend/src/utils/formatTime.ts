export function formatDateTime(ts?: string | number | Date) {
  if (!ts) return '-';
  const date = new Date(ts);
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatRelativeMinutes(diffMs: number) {
  const minutes = Math.max(0, Math.ceil(diffMs / 60000));
  if (minutes <= 1) return 'kurang dari semenit';
  return `sekitar ${minutes} menit lagi`;
}
