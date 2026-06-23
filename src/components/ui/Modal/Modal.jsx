import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-[calc(100vw-32px)] sm:max-w-[calc(100vw-64px)]',
};

export default function Modal({
  isOpen = false,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  className = '',
  ...props
}) {
  // Listen for ESC key press to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock scroll when open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = SIZES[size] || SIZES.md;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && onClose && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in font-outfit"
      onClick={handleOverlayClick}
      {...props}
    >
      <div
        className={`bg-white border border-gray-200 w-full ${sizeClass} rounded-3xl p-6 flex flex-col gap-5 shadow-2xl animate-scale-up overflow-hidden max-h-[90vh] ${className}`}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="flex justify-between items-center border-b border-gray-100 pb-3 flex-shrink-0">
            {title ? (
              <h4 className="font-outfit text-base font-extrabold text-gray-900 flex items-center gap-2">
                {title}
              </h4>
            ) : (
              <div />
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg border-none bg-transparent cursor-pointer text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-grow overflow-y-auto pr-1 text-sm text-gray-600 leading-relaxed font-semibold">
          {children}
        </div>
      </div>
    </div>
  );
}
