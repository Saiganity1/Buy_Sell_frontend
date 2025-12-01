const hasRTF = typeof Intl !== 'undefined' && (Intl as any).RelativeTimeFormat;
const rtf = hasRTF ? new (Intl as any).RelativeTimeFormat('en', { numeric: 'auto' }) : null;

export function relativeTimeFromNow(date: string | number | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const sec = Math.round(diffMs / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);

  if (rtf) {
    if (Math.abs(sec) < 60) return (rtf as any).format(sec, 'second');
    if (Math.abs(min) < 60) return (rtf as any).format(min, 'minute');
    if (Math.abs(hr) < 24) return (rtf as any).format(hr, 'hour');
    return (rtf as any).format(day, 'day');
  }
  // Fallback
  const absMin = Math.abs(min);
  if (absMin < 1) return 'just now';
  if (absMin < 60) return `${absMin}m ago`;
  const absHr = Math.abs(hr);
  if (absHr < 24) return `${absHr}h ago`;
  const absDay = Math.abs(day);
  return `${absDay}d ago`;
}
