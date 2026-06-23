import React from 'react';

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pill',
  className = '',
  ...props
}) {
  const isPill = variant === 'pill';

  return (
    <div
      className={`${
        isPill
          ? 'flex bg-gray-100 p-1 rounded-xl shadow-inner border border-gray-200 relative'
          : 'flex border-b border-gray-200'
      } font-outfit ${className}`}
      {...props}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange && onChange(tab.id)}
            className={`flex-grow sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer border-none ${
              isPill
                ? isActive
                  ? 'bg-white text-heritage-amber shadow-sm scale-102 font-extrabold'
                  : 'bg-transparent text-gray-500 hover:text-gray-900'
                : isActive
                ? 'border-b-2 border-heritage-amber text-heritage-amber font-extrabold rounded-none bg-transparent'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-900 rounded-none bg-transparent'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
