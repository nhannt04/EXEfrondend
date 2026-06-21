import React from 'react';

export default function TextArea({
  label,
  error,
  rows = 4,
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
      <textarea
        id={id}
        rows={rows}
        disabled={disabled}
        className={`w-full bg-white border border-gray-200 text-gray-800 p-4 rounded-2xl text-xs font-semibold focus:outline-none focus:border-heritage-amber focus:ring-4 focus:ring-heritage-amber/10 resize-none transition-all shadow-sm ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''
        } ${
          disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed shadow-none' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-[10.5px] font-bold text-red-500 mt-0.5">{error}</span>
      )}
    </div>
  );
}
