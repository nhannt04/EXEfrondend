import React from 'react';

export default function Input({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  disabled = false,
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full font-outfit">
      {label && (
        <label htmlFor={id} className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider select-none">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <Icon className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
        )}
        <input
          id={id}
          disabled={disabled}
          className={`w-full bg-white border border-gray-200 text-sm font-semibold text-gray-800 rounded-xl px-4 py-2.5 outline-none transition-all duration-300 shadow-sm focus:border-heritage-amber focus:ring-4 focus:ring-heritage-amber/10 ${
            Icon ? 'pl-10' : ''
          } ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''
          } ${
            disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed shadow-none' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-[10.5px] font-bold text-red-500 mt-0.5">{error}</span>
      )}
    </div>
  );
}
