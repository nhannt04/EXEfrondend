export const formatPriceRange = (min, max, freeLabel = 'Free') => {
  const hasAnyPrice = min > 0 || max > 0;
  if (!hasAnyPrice) return freeLabel;
  if (min === max) return `${min.toLocaleString()}đ`;
  return `${min.toLocaleString()}đ - ${max.toLocaleString()}đ`;
};
