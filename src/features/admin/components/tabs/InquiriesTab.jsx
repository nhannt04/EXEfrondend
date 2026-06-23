import React from 'react';
import { Send, Edit3 } from 'lucide-react';

export default function InquiriesTab(props) {
  const {
    language, inquiries, activeInquiryId, setActiveInquiryId, replyText, setReplyText, handleSendInquiryReply
  } = props;

  return (
    <>
      <div className="flex flex-col gap-6">
        <h3 className="font-outfit text-lg font-extrabold text-gray-900">
          {language === 'vi' ? 'Yêu cầu tư vấn chưa trả lời' : 'Pending Inquiry Requests'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className={`bg-white border rounded-2xl p-4 flex flex-col gap-3 shadow-sm transition-all ${inq.replied ? 'border-gray-200 bg-gray-50/50' : 'border-rose-200 bg-rose-50/20'
                }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 text-sm">{inq.travelerName}</span>
                  <span className="text-[10px] text-gray-400">{inq.travelerEmail}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-bold">{inq.date}</span>
              </div>

              <p className="text-gray-700 text-xs leading-relaxed font-semibold bg-white/70 p-3 rounded-xl border border-gray-150">
                {inq.question}
              </p>

              {inq.replied ? (
                <div className="bg-emerald-50/50 border border-emerald-100/60 p-3 rounded-xl text-emerald-800 text-xs font-semibold leading-relaxed">
                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block mb-1">
                    {language === 'vi' ? '✓ Câu trả lời của chuyên gia:' : '✓ Expert Answer:'}
                  </span>
                  {inq.replyContent}
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-2">
                  {activeInquiryId === inq.id ? (
                    <div className="flex flex-col gap-2 animate-scale-up">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={language === 'vi' ? "Nhập câu trả lời tư vấn cho du khách..." : "Type response to traveler..."}
                        className="w-full p-2.5 bg-white border border-gray-200 text-xs font-medium rounded-xl focus:outline-none focus:border-heritage-amber h-16 resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setActiveInquiryId(null); setReplyText(''); }}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-[10px] font-bold text-gray-600 cursor-pointer border-none"
                        >
                          {language === 'vi' ? 'Hủy' : 'Cancel'}
                        </button>
                        <button
                          onClick={() => handleSendInquiryReply(inq.id)}
                          className="px-3 py-1.5 bg-heritage-amber hover:bg-heritage-gold text-white rounded-lg text-[10px] font-bold cursor-pointer border-none flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          {language === 'vi' ? 'Gửi phản hồi' : 'Send response'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setActiveInquiryId(inq.id); setReplyText(''); }}
                      className="w-full py-2 bg-heritage-amber hover:bg-heritage-gold text-white text-xs font-bold rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {language === 'vi' ? 'Phản hồi tư vấn ngay' : 'Respond to inquiry'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
