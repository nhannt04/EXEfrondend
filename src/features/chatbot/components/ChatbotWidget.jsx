import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Compass, MapPin, Sparkles, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { getChatReply } from '../../../services/chatService';
import mascotImg from '../../../assets/mascot.png';

const GREETINGS = [
  "Đi đâu hôm nay nhỉ?",
  "Khám phá Hội An nhé!",
  "Đi cà phê không?",
  "Thử món ngon địa phương!",
  "Xem lịch trình gợi ý!",
  "Đi chơi thôi nào!",
  "Trải nghiệm Hội An thôi!",
  "Cùng đi trốn nhé!",
  "Đi vi vu thôi!",
  "Cùng khám phá nhé!"
];

export default function ChatbotWidget() {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [bubbleText, setBubbleText] = useState("Xin chào!");

  // Cycle through random messages in the bubble
  useEffect(() => {
    if (isOpen) return;

    // Reset to initial message first
    setBubbleText("Xin chào!");

    let intervalId = null;

    const initialTimeout = setTimeout(() => {
      const getRandomGreeting = () => {
        const randomIndex = Math.floor(Math.random() * GREETINGS.length);
        return GREETINGS[randomIndex];
      };
      setBubbleText(getRandomGreeting());

      intervalId = setInterval(() => {
        setBubbleText(getRandomGreeting());
      }, 7000);
    }, 6000);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen]);

  // Initialize welcome message based on language
  useEffect(() => {
    setMessages([
      {
        id: 'm1',
        sender: 'bot',
        text: t('botIntro'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [language]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = {
      id: `m_user_${Date.now()}`,
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const responseData = await getChatReply(text);
      const reply = responseData.reply;

      const botMsg = {
        id: `m_bot_${Date.now()}`,
        sender: 'bot',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('Error fetching chat reply:', error);
      const botMsg = {
        id: `m_bot_${Date.now()}`,
        sender: 'bot',
        text: 'Hiện tại tôi đang gặp khó khăn khi kết nối. Hãy thử lại sau nhé!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessageText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={lineIdx} className="h-1.5" />;

      let isBullet = false;
      let indentClass = "";
      if (line.startsWith('    *') || line.startsWith('    -') || line.startsWith('\t*') || line.startsWith('\t-')) {
        isBullet = true;
        indentClass = "ml-6 my-0.5 text-xs text-gray-600";
        trimmed = trimmed.replace(/^[\s*-]+/, '').trim();
      } else if (line.startsWith('*') || line.startsWith('-')) {
        isBullet = true;
        indentClass = "ml-3 my-1 text-xs text-gray-700";
        trimmed = trimmed.replace(/^[\s*-]+/, '').trim();
      }

      const boldParts = trimmed.split('**');
      const parsedElements = boldParts.map((bPart, bIdx) => {
        const isBold = bIdx % 2 === 1;
        const italicParts = bPart.split('*');
        const subElements = italicParts.map((iPart, iIdx) => {
          const isItalic = iIdx % 2 === 1;
          if (isItalic) {
            return <em key={iIdx} className="italic">{iPart}</em>;
          }
          return iPart;
        });

        if (isBold) {
          return <strong key={bIdx} className="font-bold text-gray-900">{subElements}</strong>;
        }
        return <span key={bIdx}>{subElements}</span>;
      });

      if (isBullet) {
        return (
          <div key={lineIdx} className={`flex items-start gap-1.5 ${indentClass}`}>
            <span className="text-heritage-amber mt-1 select-none">•</span>
            <div className="flex-1">{parsedElements}</div>
          </div>
        );
      }

      return (
        <p key={lineIdx} className="my-1 leading-relaxed">
          {parsedElements}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-14 right-[-8px] sm:right-2 sm:bottom-6 z-[100] flex flex-col items-end">
      {/* Floating Action Button */}
      {!isOpen && (
        <div className="relative flex flex-col items-center mr-2">
          {/* Greeting Bubble */}
          <div className="absolute bottom-[135px] right-2 bg-white text-gray-800 text-sm font-extrabold px-4 py-1.5 rounded-full shadow-md border border-gray-200/80 whitespace-nowrap animate-bounce" style={{ animationDuration: '3s' }}>
            {bubbleText}
            <div className="absolute -bottom-1 right-12 w-2 h-2 bg-white rotate-45 border-r border-b border-gray-200/80"></div>
          </div>

          <div
            onClick={() => setIsOpen(true)}
            className="mascot-character select-none cursor-pointer transition-transform hover:scale-105 active:scale-95"
            style={{ cursor: 'pointer' }}
          >
            <img
              src={mascotImg}
              alt="Chatbot Mascot"
              className="w-full h-full object-contain pointer-events-none"
              draggable="false"
            />
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-32px)] sm:w-[400px] max-w-[360px] sm:max-w-none h-[520px] rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden border border-gray-200/80 animate-fade-in select-text">
          {/* Header */}
          <div className="bg-heritage-amber text-white p-4 flex items-center justify-between shadow-sm select-none">
            <div className="flex items-center gap-2.5 pointer-events-none">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/20 flex-shrink-0">
                <img src={mascotImg} alt="Mascot" className="w-full h-full object-contain" />
              </div>
              <div>
                <h4 className="font-outfit text-sm font-extrabold tracking-tight">{t('botTitle')}</h4>
                <span className="block text-[9px] font-bold text-white/80 uppercase tracking-wider leading-none">
                  {t('botSubtitle')}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer border-none bg-transparent text-white"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3.5 bg-gray-50/50">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                }`}
              >
                {/* Bot Icon */}
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-heritage-amber/10 border border-heritage-amber/20 flex-shrink-0">
                    <img src={mascotImg} alt="Mascot" className="w-full h-full object-contain" />
                  </div>
                )}
                
                {/* Message Bubble */}
                <div className="flex flex-col gap-0.5">
                  <div 
                    className={`p-3 rounded-2xl text-xs leading-relaxed font-medium shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-heritage-amber text-white rounded-tr-none' 
                        : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none'
                    }`}
                  >
                    {renderMessageText(msg.text)}
                  </div>
                  <span className={`text-[8.5px] text-gray-400 font-semibold ${msg.sender === 'user' ? 'text-right' : ''}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 self-start max-w-[80%] items-center">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-heritage-amber/10 border border-heritage-amber/20 flex-shrink-0">
                  <img src={mascotImg} alt="Mascot" className="w-full h-full object-contain animate-pulse" />
                </div>
                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none flex items-center gap-1 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <div className="p-3 border-t border-gray-150 flex gap-2 items-center bg-white">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
              placeholder={t('botInputPlaceholder')}
              className="flex-grow bg-gray-50 border border-gray-200 text-base text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-heritage-amber placeholder-gray-400"
              style={{ fontSize: '16px' }}
            />
            <button
              onClick={() => handleSendMessage(inputText)}
              className="p-2.5 bg-heritage-amber hover:bg-heritage-gold text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors border-none shadow-sm"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

