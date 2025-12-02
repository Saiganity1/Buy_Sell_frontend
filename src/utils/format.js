export const formatPeso = (value) => {
  const num = typeof value === 'string' ? Number(value) : value;
  try {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(num || 0);
  } catch {
    return `₱${Number(num || 0).toFixed(2)}`;
  }
};
