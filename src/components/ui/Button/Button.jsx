import React from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-heritage-amber hover:bg-heritage-gold text-white shadow-lg shadow-heritage-amber/15 border-transparent focus:ring-heritage-amber/40',
  secondary: 'bg-gray-100/90 hover:bg-gray-200/90 text-gray-700 border-transparent focus:ring-gray-200/40',
  outline: 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200 focus:ring-gray-200/40',
  danger: 'bg-red-650 hover:bg-red-750 text-white shadow-lg shadow-red-500/10 border-transparent focus:ring-red-500/40',
  ghost: 'bg-transparent hover:bg-gray-50 text-gray-500 hover:text-gray-900 border-transparent focus:ring-gray-150/40',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg font-bold',
  md: 'px-5 py-2.5 rounded-xl text-sm font-bold',
  lg: 'px-6 py-3 rounded-2xl text-base font-extrabold',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  iconLeft: IconLeft,
  iconRight: IconRight,
  type = 'button',
  onClick,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center gap-1.5 border border-solid transition-all duration-300 cursor-pointer outline-none focus:ring-4 select-none active:scale-[0.98]';
  const variantClasses = VARIANTS[variant] || VARIANTS.primary;
  const sizeClasses = SIZES[size] || SIZES.md;
  const disabledClasses = (disabled || isLoading) ? 'opacity-50 cursor-not-allowed pointer-events-none active:scale-100 shadow-none' : '';

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${disabledClasses} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
      ) : IconLeft ? (
        <IconLeft className="w-3.5 h-3.5 text-current flex-shrink-0" />
      ) : null}
      
      <span>{children}</span>
      
      {!isLoading && IconRight && (
        <IconRight className="w-3.5 h-3.5 text-current flex-shrink-0" />
      )}
    </button>
  );
}
