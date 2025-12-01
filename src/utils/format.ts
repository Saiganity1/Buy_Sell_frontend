export const formatPeso = (value: number | string) => {
  const num = typeof value === 'string' ? Number(value) : value;
  try {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(num || 0);
  } catch {
    // Fallback
    return `₱${Number(num || 0).toFixed(2)}`;
  }
};
