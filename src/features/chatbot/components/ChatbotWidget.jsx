import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Compass, MapPin, Sparkles, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { getChatReply } from '../../../services/chatService';

export default function ChatbotWidget() {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Dragging states initialized to default bottom-right area
  const [position, setPosition] = useState({
    x: window.innerWidth - 80,
    y: window.innerHeight - 88
  });
  const [isDragging, setIsDragging] = useState(false);
  const [preOpenPosition, setPreOpenPosition] = useState(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const elementStartRef = useRef({ x: 0, y: 0 });

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

  // Keep chatbot widget inside screen viewport on resize or toggle open/close
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const isMobile = window.innerWidth < 640;
        const chatWidth = window.innerWidth < 400 ? window.innerWidth - 32 : 360;
        const width = isOpen ? (isMobile ? chatWidth : 400) : 56;
        const height = isOpen ? 520 : 56;
        const maxX = window.innerWidth - width - 10;
        const maxY = window.innerHeight - height - 10;
        return {
          x: Math.max(10, Math.min(prev.x, maxX)),
          y: Math.max(10, Math.min(prev.y, maxY))
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Adjust positioning when opening chat to prevent it from going offscreen
  useEffect(() => {
    if (isOpen) {
      // Save current button position before centering/adjusting
      setPreOpenPosition({ x: position.x, y: position.y });

      setPosition((prev) => {
        const isMobile = window.innerWidth < 640;
        const chatWidth = window.innerWidth < 400 ? window.innerWidth - 32 : 360;
        const width = isMobile ? chatWidth : 400;
        const height = 520;
        
        let targetX = prev.x;
        let targetY = prev.y;

        if (isMobile) {
          // Center horizontally on mobile viewport
          targetX = (window.innerWidth - width) / 2;
          // Position vertically above the mobile bottom navigation bar
          targetY = window.innerHeight - height - 80;
        } else {
          // Keep it within desktop right edge viewport bounds
          if (prev.x + width > window.innerWidth) {
            targetX = window.innerWidth - width - 24;
          }
        }
        
        const maxX = window.innerWidth - width - 10;
        const maxY = window.innerHeight - height - 10;
        
        return {
          x: Math.max(10, Math.min(targetX, maxX)),
          y: Math.max(10, Math.min(targetY, maxY))
        };
      });
    } else {
      // Restore cached position when closing the window
      if (preOpenPosition) {
        setPosition(preOpenPosition);
      }
    }
  }, [isOpen]);

  const handleDragStart = (e) => {
    if (e.button !== undefined && e.button !== 0) return; // Left click only
    
    setIsDragging(true);
    const clientX = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
    const clientY = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;
    
    dragStartRef.current = { x: clientX, y: clientY };
    
    const rect = e.currentTarget.closest('.fixed-widget-container').getBoundingClientRect();
    elementStartRef.current = { x: rect.left, y: rect.top };
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    
    const clientX = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
    const clientY = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;
    
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;
    
    let newX = elementStartRef.current.x + dx;
    let newY = elementStartRef.current.y + dy;
    
    // Bounds boundaries
    const width = isOpen ? (window.innerWidth < 400 ? window.innerWidth - 20 : 400) : 56;
    const height = isOpen ? 520 : 56;
    const maxX = window.innerWidth - width - 10;
    const maxY = window.innerHeight - height - 10;
    
    newX = Math.max(10, Math.min(newX, maxX));
    newY = Math.max(10, Math.min(newY, maxY));
    
    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const clientX = e.clientX !== undefined ? e.clientX : (e.changedTouches ? e.changedTouches[0].clientX : 0);
    const clientY = e.clientY !== undefined ? e.clientY : (e.changedTouches ? e.changedTouches[0].clientY : 0);
    
    const dist = Math.sqrt(Math.pow(clientX - dragStartRef.current.x, 2) + Math.pow(clientY - dragStartRef.current.y, 2));
    // If click (little movement), open chat window
    if (dist < 6) {
      if (e.currentTarget.tagName === 'BUTTON') {
        setIsOpen(true);
      }
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

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
    <div 
      className="fixed-widget-container fixed z-[100] flex flex-col items-end"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          className="w-14 h-14 rounded-full bg-heritage-amber hover:bg-heritage-gold text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 animate-pulse-gold cursor-move border-none select-none touch-none"
        >
          <Bot className="w-7 h-7 text-white pointer-events-none" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-32px)] sm:w-[400px] max-w-[360px] sm:max-w-none h-[520px] rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden border border-gray-200/80 animate-fade-in select-text">
          {/* Header - Drag handler */}
          <div 
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            className="bg-heritage-amber text-white p-4 flex items-center justify-between shadow-sm cursor-move select-none touch-none"
          >
            <div className="flex items-center gap-2.5 pointer-events-none">
              <div className="bg-white/20 p-2 rounded-xl text-white">
                <Bot className="w-5 h-5 text-white" />
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
                  <div className="w-7 h-7 rounded-full bg-heritage-amber/10 border border-heritage-amber/20 text-heritage-amber flex items-center justify-center flex-shrink-0">
                    <Compass className="w-4 h-4 text-heritage-amber" />
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
                <div className="w-7 h-7 rounded-full bg-heritage-amber/10 border border-heritage-amber/20 text-heritage-amber flex items-center justify-center flex-shrink-0">
                  <Compass className="w-4 h-4 animate-spin-slow text-heritage-amber" />
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
