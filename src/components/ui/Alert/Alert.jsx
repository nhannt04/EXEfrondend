import React from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

const VARIANTS = {
  info: {
    container: 'bg-blue-50/80 text-blue-800 border-blue-200/60',
    icon: Info,
  },
  warning: {
    container: 'bg-amber-50/80 text-amber-800 border-amber-200/60',
    icon: AlertTriangle,
  },
  success: {
    container: 'bg-emerald-50/80 text-emerald-800 border-emerald-200/60',
    icon: CheckCircle,
  },
  danger: {
    container: 'bg-rose-50/80 text-rose-800 border-rose-200/60',
    icon: XCircle,
  },
};

export default function Alert({
  children,
  variant = 'info',
  title,
  icon: CustomIcon,
  onClose,
  className = '',
  ...props
}) {
  const config = VARIANTS[variant] || VARIANTS.info;
  const Icon = CustomIcon || config.icon;

  return (
    <div
      className={`p-5 rounded-2xl border border-solid flex gap-3.5 shadow-sm transition-all duration-300 relative ${config.container} ${className}`}
      role="alert"
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />}
      
      <div className="flex-grow flex flex-col gap-1 text-xs sm:text-sm font-medium leading-relaxed">
        {title && <h5 className="font-extrabold tracking-wide uppercase">{title}</h5>}
        <div>{children}</div>
      </div>
      
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-black/5 rounded-lg text-current transition-colors cursor-pointer border-none bg-transparent self-start -mt-0.5"
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
