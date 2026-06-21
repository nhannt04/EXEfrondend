import React from 'react';

export default function Switch({
  checked = false,
  onChange,
  label,
  id,
  disabled = false,
  className = '',
  ...props
}) {
  const handleClick = (e) => {
    if (disabled || !onChange) return;
    onChange(!checked);
  };

  return (
    <div className={`flex items-center gap-2.5 font-outfit select-none ${className}`}>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={`w-9 h-5 rounded-full transition-colors duration-300 relative cursor-pointer outline-none border-none p-0 flex items-center ${
          checked ? 'bg-heritage-amber' : 'bg-gray-200'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-heritage-amber/40'
        }`}
        {...props}
      >
        <span
          className={`w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform duration-300 shadow-sm ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
      {label && (
        <label
          htmlFor={id}
          onClick={handleClick}
          className={`text-xs font-bold text-gray-700 cursor-pointer ${
            disabled ? 'cursor-not-allowed text-gray-400' : ''
          }`}
        >
          {label}
        </label>
      )}
    </div>
  );
}
