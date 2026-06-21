import React from 'react';

export default function Skeleton({
  variant = 'rect',
  className = '',
  ...props
}) {
  const shapeClass =
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'text'
      ? 'rounded h-3 w-3/4'
      : 'rounded-xl';

  return (
    <div
      className={`animate-pulse bg-gray-200/80 ${shapeClass} ${className}`}
      {...props}
    />
  );
}
