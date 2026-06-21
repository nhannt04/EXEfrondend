import React from 'react';

export default function Select({
  label,
  error,
  options = [],
  children,
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
      <select
        id={id}
        disabled={disabled}
        className={`bg-white border border-gray-200 text-gray-800 px-3 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:border-heritage-amber focus:ring-4 focus:ring-heritage-amber/10 cursor-pointer hover:bg-gray-50 transition-all shadow-sm ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''
        } ${
          disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed shadow-none' : ''
        } ${className}`}
        {...props}
      >
        {children
          ? children
          : options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
      </select>
      {error && (
        <span className="text-[10.5px] font-bold text-red-500 mt-0.5">{error}</span>
      )}
    </div>
  );
}
