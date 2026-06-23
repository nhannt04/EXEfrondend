import React from 'react';
import { DollarSign } from 'lucide-react';
import { formatPriceRange } from '../../utils/formatUtils';

const BudgetAnalysis = ({ costs, budget, language, t, isOverBudget }) => {
  return (
    <div className="bg-white border border-gray-200 p-5 rounded-2xl flex flex-col gap-6 h-fit shadow-sm shimmer-trigger animate-fade-in-up">
      <h3 className="font-outfit text-base font-bold text-gray-900 border-b border-gray-100 pb-2 relative z-10">
        {t('financialAnalysis')}
      </h3>

      {/* Progress Bars */}
      <div className="flex flex-col gap-4 relative z-10">
        {[
          { name: t('costsAccommodation'), min: costs.accommodationMin, max: costs.accommodationMax, color: 'bg-indigo-600' },
          { name: t('costsFood'), min: costs.foodMin, max: costs.foodMax, color: 'bg-heritage-amber' },
          { name: t('costsActivities'), min: costs.activitiesMin, max: costs.activitiesMax, color: 'bg-ricefield-green' },
          { name: t('costsTransport'), min: costs.transport, max: costs.transport, color: 'bg-gray-400' }
        ].map((cat) => {
          const pct = costs.totalMax > 0 ? (cat.max / costs.totalMax) * 100 : 0;
          return (
            <div key={cat.name} className="flex flex-col gap-1">
              <div className="flex justify-between text-[10.5px] font-bold text-gray-500">
                <span>{cat.name}</span>
                <span className="text-gray-900 font-extrabold">{pct.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                <div
                  className={`h-full ${cat.color} transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-400 text-right font-semibold">
                {formatPriceRange(cat.min, cat.max, language === 'vi' ? 'Miễn phí' : 'Free')}
              </span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-100 pt-4 flex flex-col gap-2 relative z-10">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{t('advisorTitle')}</span>
        <p className="text-xs text-gray-600 leading-relaxed italic bg-gray-50 border border-gray-200 p-3.5 rounded-xl">
          {isOverBudget
            ? t('advisorOver')
            : t('advisorUnder')
          }
        </p>
      </div>
    </div>
  );
};

export default BudgetAnalysis;
