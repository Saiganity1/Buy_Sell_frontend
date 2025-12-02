const hasRTF = typeof Intl !== 'undefined' && typeof Intl.RelativeTimeFormat !== 'undefined';
const rtf = hasRTF ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' }) : null;

export function relativeTimeFromNow(date) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const sec = Math.round(diffMs / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);

  if (rtf) {
    if (Math.abs(sec) < 60) return rtf.format(sec, 'second');
    if (Math.abs(min) < 60) return rtf.format(min, 'minute');
    if (Math.abs(hr) < 24) return rtf.format(hr, 'hour');
    return rtf.format(day, 'day');
  }
  const absMin = Math.abs(min);
  if (absMin < 1) return 'just now';
  if (absMin < 60) return `${absMin}m ago`;
  const absHr = Math.abs(hr);
  if (absHr < 24) return `${absHr}h ago`;
  const absDay = Math.abs(day);
  return `${absDay}d ago`;
}
