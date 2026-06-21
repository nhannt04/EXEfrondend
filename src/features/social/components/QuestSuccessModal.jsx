import React from 'react';
import { Trophy } from 'lucide-react';

export default function QuestSuccessModal({ showQuestSuccess, setShowQuestSuccess, language }) {
  if (!showQuestSuccess) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white border border-gray-200 p-6 rounded-3xl max-w-sm w-full flex flex-col items-center text-center gap-4 shadow-2xl animate-scale-up">
        <div className="p-3 bg-heritage-amber/10 border border-heritage-amber/30 text-heritage-amber rounded-full animate-float">
          <Trophy className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-outfit text-base font-extrabold text-gray-900">
            {language === 'vi' ? 'Quest Đã Nhận!' : 'Quest Accepted!'}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed mt-1.5 font-semibold">
            {language === 'vi'
              ? 'Hãy ghé thăm Chùa Cầu vào sáng sớm mai, chụp một bức ảnh đẹp và tải lên bài viết (chọn tag Góc chụp ảnh đẹp) để nhận Voucher Đèn Lồng 50k nhé!'
              : 'Visit the Covered Bridge tomorrow morning, take a beautiful photo, and publish a post (select Scenic tag) to claim your 50k Voucher!'}
          </p>
        </div>
        <button
          onClick={() => setShowQuestSuccess(false)}
          className="w-full py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white font-extrabold text-xs rounded-xl cursor-pointer border-none shadow-md shadow-heritage-amber/10 transition-colors"
        >
          {language === 'vi' ? 'Tôi đã hiểu!' : 'Got it!'}
        </button>
      </div>
    </div>
  );
}
