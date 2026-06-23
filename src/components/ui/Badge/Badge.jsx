import React from 'react';

const VARIANTS = {
  primary: 'bg-heritage-amber/10 text-heritage-amber border-heritage-amber/20',
  success: 'bg-emerald-50 text-emerald-750 border-emerald-200/60',
  warning: 'bg-amber-50 text-amber-800 border-amber-200/60',
  danger: 'bg-rose-50 text-rose-800 border-rose-200/60',
  neutral: 'bg-gray-100 text-gray-600 border-gray-200/80',
};

export default function Badge({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  const badgeStyle = VARIANTS[variant] || VARIANTS.primary;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider border border-solid leading-none select-none ${badgeStyle} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
