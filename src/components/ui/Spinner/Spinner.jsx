import React from 'react';
import { Loader2 } from 'lucide-react';

const SIZES = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export default function Spinner({
  size = 'md',
  className = '',
  ...props
}) {
  const sizeClass = SIZES[size] || SIZES.md;
  return (
    <Loader2
      className={`animate-spin text-heritage-amber ${sizeClass} ${className}`}
      {...props}
    />
  );
}
