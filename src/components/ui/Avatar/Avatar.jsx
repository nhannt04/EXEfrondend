import React from 'react';

const SIZES = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-lg',
};

export default function Avatar({
  src,
  alt = '',
  size = 'md',
  isOnline = false,
  className = '',
  ...props
}) {
  const sizeClass = SIZES[size] || SIZES.md;
  
  // Get initials for fallback
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className={`relative flex-shrink-0 select-none ${sizeClass} ${className}`} {...props}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full rounded-full object-cover border border-gray-200"
          onError={(e) => {
            // If image fails to load, clear src to trigger fallback initials
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      
      {/* Fallback Initials */}
      <div
        className="w-full h-full rounded-full bg-gradient-to-tr from-heritage-amber to-heritage-gold text-white font-extrabold flex items-center justify-center border border-white"
        style={{ display: src ? 'none' : 'flex' }}
      >
        {getInitials(alt)}
      </div>

      {/* Online indicator */}
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white animate-pulse" />
      )}
    </div>
  );
}
