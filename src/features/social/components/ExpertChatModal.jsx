import React from 'react';
import { X, CheckCircle } from 'lucide-react';

export default function ExpertChatModal({
  showChatModal,
  setShowChatModal,
  activeExpert,
  language,
  expertMessageText,
  setExpertMessageText,
  messageSuccess,
  handleSendExpertMessage,
}) {
  if (!showChatModal || !activeExpert) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white border border-gray-200 p-5 rounded-3xl max-w-md w-full flex flex-col gap-4 shadow-2xl animate-scale-up">
        <div className="flex justify-between items-center border-b border-gray-150 pb-3">
          <div className="flex gap-2.5 items-center">
            <img
              src={activeExpert.avatar}
              alt={activeExpert.name}
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
            <div>
              <h4 className="text-xs font-extrabold text-gray-800 leading-tight">{activeExpert.name}</h4>
              <span className="text-[9px] text-green-500 font-bold tracking-wide uppercase flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse" />
                Online
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowChatModal(false)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-none bg-transparent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {messageSuccess ? (
          <div className="flex flex-col items-center text-center p-6 gap-3 animate-fade-in">
            <CheckCircle className="w-10 h-10 text-ricefield-green" />
            <div>
              <h4 className="text-xs font-extrabold text-gray-800">
                {language === 'vi' ? 'Đã gửi câu hỏi!' : 'Question Sent!'}
              </h4>
              <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                {language === 'vi'
                  ? 'Chuyên gia bản địa sẽ phản hồi tin nhắn của bạn trong vòng ít phút thông qua hộp thư đến.'
                  : 'The local guide will respond to your query shortly via your inbox.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] text-gray-500 leading-relaxed italic bg-gray-50 p-3 rounded-xl border border-gray-150">
              {language === 'vi'
                ? `Chào bạn! Mình có thể tư vấn tất cả kinh nghiệm local về các dịch vụ di chuyển, ẩm thực hay nghề thủ công truyền thống ở Hội An. Hãy để lại câu hỏi bên dưới nhé!`
                : `Hello! I can advise on all local guides regarding dining, transport, or traditional craft workshops in Hoi An. Leave your question below!`
              }
            </p>
            <textarea
              value={expertMessageText}
              onChange={(e) => setExpertMessageText(e.target.value)}
              placeholder={language === 'vi' ? 'Nhập câu hỏi của bạn tại đây...' : 'Type your question here...'}
              className="bg-white border border-gray-200 text-xs text-gray-800 rounded-xl p-3 h-24 resize-none focus:outline-none focus:border-heritage-amber placeholder-gray-450 shadow-inner"
            />
            <button
              onClick={handleSendExpertMessage}
              className="w-full py-2.5 bg-heritage-amber hover:bg-heritage-gold text-white font-extrabold text-xs rounded-xl cursor-pointer border-none shadow-md shadow-heritage-amber/10 transition-colors"
            >
              {language === 'vi' ? 'Gửi Câu Hỏi' : 'Submit Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
