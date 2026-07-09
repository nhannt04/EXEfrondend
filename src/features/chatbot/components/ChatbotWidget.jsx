import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Compass, MapPin, Sparkles, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { getChatReply } from '../../../services/chatService';
import mascotImg from '../../../assets/mascot.png';
import mascotWalkImg from '../../../assets/mascot_walk.png';
import mascotWalk2Img from '../../../assets/mascot_walk2.png';
import mascotWalk3Img from '../../../assets/mascot_walk3.png';
import mascotWalk4Img from '../../../assets/mascot_walk4.png';
import mascotWalk5Img from '../../../assets/mascot_walk5.png';
import mascotWalk6Img from '../../../assets/mascot_walk6.png';
import mascotJumpImg from '../../../assets/mascot_jump.png';





export default function ChatbotWidget() {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Mascot Refs and States
  const mascotRef = useRef(null);
  const containerRef = useRef(null);
  const [isMascotIdle, setIsMascotIdle] = useState(true);
  const [mascotTilt, setMascotTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isLanding, setIsLanding] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [walkFrame, setWalkFrame] = useState(0);
  const [isAutonomousWalking, setIsAutonomousWalking] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = right, -1 = left
  const [mascotAnimTransform, setMascotAnimTransform] = useState('');


  // Coordinate references for physics loop (to avoid constant dependency updates)
  const posRef = useRef({
    x: window.innerWidth - 120,
    y: window.innerHeight - 130
  });
  const targetPosRef = useRef({
    x: window.innerWidth - 120,
    y: window.innerHeight - 130
  });

  const walkAccumulator = useRef(0);
  const lastDragPosRef = useRef(null);



  // Dragging states initialized to default bottom-right area
  const [position, setPosition] = useState({
    x: window.innerWidth - 120, // offset slightly to fit mascot nicely
    y: window.innerHeight - 130
  });
  const [isDragging, setIsDragging] = useState(false);
  const [preOpenPosition, setPreOpenPosition] = useState(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const elementStartRef = useRef({ x: 0, y: 0 });




  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (!isJumping) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 1000);
    }
  };


  // 1. Inactivity & Look-At rotation effect
  useEffect(() => {
    if (isOpen || isDragging || isAutonomousWalking) {
      setMascotTilt({ rotateX: 0, rotateY: 0 });
      return;
    }

    let idleTimer;

    const handleMouseMove = (e) => {
      setIsMascotIdle(false);
      
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsMascotIdle(true);
      }, 3000);

      if (mascotRef.current) {
        const rect = mascotRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const angle = Math.atan2(dy, dx);
        
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 600;
        const intensity = Math.min(distance / maxDist, 1) * 20; // max 20 degrees
        
        const tiltX = -Math.sin(angle) * intensity;
        const tiltY = Math.cos(angle) * intensity;
        
        setMascotTilt({ rotateX: tiltX, rotateY: tiltY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    idleTimer = setTimeout(() => {
      setIsMascotIdle(true);
    }, 3000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(idleTimer);
    };
  }, [isOpen, isDragging, isAutonomousWalking]);

  // 1.5. Autonomous Wandering Destination Planner
  useEffect(() => {
    if (isOpen || isDragging) return;

    const planNextWander = () => {
      const padding = 120;
      const targetX = padding + Math.random() * (window.innerWidth - padding * 2);
      const targetY = padding + Math.random() * (window.innerHeight - padding * 2 - 80);
      
      targetPosRef.current = { x: targetX, y: targetY };
      
      // Randomly wander every 8 to 16 seconds
      const nextDelay = 8000 + Math.random() * 8000;
      wanderTimeout = setTimeout(planNextWander, nextDelay);
    };

    let wanderTimeout = setTimeout(planNextWander, 5000);

    return () => clearTimeout(wanderTimeout);
  }, [isOpen, isDragging]);

  // 1.6. Continuous requestAnimationFrame Physics & Movement loop
  useEffect(() => {
    if (isOpen) return;

    let animFrame;
    let time = 0;

    const loop = () => {
      time += 1;
      let animStr = '';
      
      if (!isDragging) {
        const dx = targetPosRef.current.x - posRef.current.x;
        const dy = targetPosRef.current.y - posRef.current.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist > 2) {
          setIsAutonomousWalking(true);
          const currentDir = dx >= 0 ? 1 : -1;
          setDirection(currentDir);
          
          // Constant walking speed (px per frame), not lerp
          const WALK_SPEED = 1.8;
          const step = Math.min(WALK_SPEED, dist);
          posRef.current.x += (dx / dist) * step;
          posRef.current.y += (dy / dist) * step;

          // Frame increment linked to speed (constant rhythm)
          walkAccumulator.current += 0.04;
          setWalkFrame(Math.floor(walkAccumulator.current) % 10);

          // Cartoon math
          const angle = walkAccumulator.current * Math.PI;
          const waddleRotate = Math.sin(angle) * 8;
          const waddleY = -Math.abs(Math.sin(angle)) * 6;
          const stretchY = 1 + Math.sin(angle * 2) * 0.05;
          const stretchX = 1 - Math.sin(angle * 2) * 0.05; // pure squash, no dir flip here
          animStr = `translateY(${waddleY}px) rotate(${waddleRotate}deg) scale(${stretchX}, ${stretchY})`;
        } else {
          setIsAutonomousWalking(false);
          walkAccumulator.current = 0;
          setWalkFrame(0);
          
          // Hover wave floating at current destination anchor
          const waveX = Math.sin(time * 0.02) * 5;
          const waveY = Math.cos(time * 0.02) * 5;
          posRef.current.x += (targetPosRef.current.x + waveX - posRef.current.x) * 0.05;
          posRef.current.y += (targetPosRef.current.y + waveY - posRef.current.y) * 0.05;

          // Idle breathing wave
          const breatheAngle = time * 0.03;
          const breatheScaleY = 1 + Math.sin(breatheAngle) * 0.03;
          const breatheScaleX = 1 - Math.sin(breatheAngle) * 0.02; // pure breathe, no dir flip here
          animStr = `scale(${breatheScaleX}, ${breatheScaleY})`;

          // 2% chance to jump randomly when standing still
          if (time % 300 === 0 && Math.random() < 0.2 && !isJumping) {
            setIsJumping(true);
            setTimeout(() => setIsJumping(false), 1000);
          }
        }
        
        if (containerRef.current) {
          containerRef.current.style.left = `${posRef.current.x}px`;
          containerRef.current.style.top = `${posRef.current.y}px`;
        }
      } else {
        // During dragging: posRef is already updated by handleDragMove directly
        // DO NOT overwrite posRef.current with stale React position state!
        // Just compute the walk animation based on how much posRef moved since last frame
        const dragDx = posRef.current.x - (lastDragPosRef.current?.x ?? posRef.current.x);
        const dragDy = posRef.current.y - (lastDragPosRef.current?.y ?? posRef.current.y);
        lastDragPosRef.current = { x: posRef.current.x, y: posRef.current.y };
        const dragDist = Math.sqrt(dragDx*dragDx + dragDy*dragDy);
        
        if (dragDist > 0.5) {
          const currentDir = dragDx >= 0 ? 1 : -1;
          setDirection(currentDir);
          walkAccumulator.current += Math.min(0.18, dragDist * 0.015);
          setWalkFrame(Math.floor(walkAccumulator.current) % 10);

          const angle = walkAccumulator.current * Math.PI;
          const waddleRotate = Math.sin(angle) * 8;
          const waddleY = -Math.abs(Math.sin(angle)) * 6;
          const stretchY = 1 + Math.sin(angle * 2) * 0.05;
          const stretchX = 1 - Math.sin(angle * 2) * 0.05;
          animStr = `translateY(${waddleY}px) rotate(${waddleRotate}deg) scale(${stretchX}, ${stretchY})`;
        } else {
          setWalkFrame(0);
          const breatheAngle = time * 0.03;
          const breatheScaleY = 1 + Math.sin(breatheAngle) * 0.03;
          animStr = `scale(1, ${breatheScaleY})`;
        }
      }
      
      setMascotAnimTransform(animStr);
      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [isOpen, isDragging, direction, isJumping]);


  // 2. Soft landing effect on close/load
  useEffect(() => {
    if (!isOpen) {
      setIsLanding(true);
      const timer = setTimeout(() => setIsLanding(false), 800);
      return () => clearTimeout(timer);
    }
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
    lastDragPosRef.current = null; // reset drag velocity tracker
    
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
    
    posRef.current = { x: newX, y: newY };
    targetPosRef.current = { x: newX, y: newY };
    if (containerRef.current) {
      containerRef.current.style.left = `${newX}px`;
      containerRef.current.style.top = `${newY}px`;
    }
  };

  const handleDragEnd = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const clientX = e.clientX !== undefined ? e.clientX : (e.changedTouches ? e.changedTouches[0].clientX : 0);
    const clientY = e.clientY !== undefined ? e.clientY : (e.changedTouches ? e.changedTouches[0].clientY : 0);
    
    // Sync React state once at the end of dragging
    setPosition({ x: posRef.current.x, y: posRef.current.y });
    
    // Calculate total movement to distinguish click from drag
    const dist = Math.sqrt(
      Math.pow(clientX - dragStartRef.current.x, 2) +
      Math.pow(clientY - dragStartRef.current.y, 2)
    );
    
    // If click (little movement), open chat window
    if (dist < 6) {
      setIsOpen(true);
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
      ref={containerRef}
      className={`fixed-widget-container fixed z-[100] flex flex-col items-end ${
        !isOpen && !isDragging && !isAutonomousWalking ? 'animate-mascot-float' : ''
      }`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      {/* Floating Action Button */}
      {!isOpen && (
        <div
          ref={mascotRef}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          onDoubleClick={handleDoubleClick}
          className={`mascot-character select-none touch-none ${
            isJumping ? 'mascot-jump' : ''
          } ${isLanding ? 'mascot-landing' : ''}`}
          style={{
            transform: `rotateX(${mascotTilt.rotateX}deg) rotateY(${mascotTilt.rotateY}deg) ${mascotAnimTransform}`,
            perspective: '1000px',
            transformStyle: 'preserve-3d'
          }}
        >
        {/* Walk cycle frames lookup - 8 frames for smooth cycle */}
          {(() => {
            const FRAMES = [
              mascotImg,       // 0: idle / contact (both feet down)
              mascotWalk5Img,  // 1: push-off (weight shifting, back toes lifting)
              mascotWalkImg,   // 2: right leg high stride
              mascotWalk4Img,  // 3: weight transfer / body dipping
              mascotWalk3Img,  // 4: legs crossing / lowest point
              mascotWalk6Img,  // 5: heel strike (right foot landing forward)
              mascotWalk2Img,  // 6: left leg high stride
              mascotWalk4Img,  // 7: weight transfer / body dipping (mirror)
              mascotWalk3Img,  // 8: legs crossing / lowest (mirror)
              mascotWalk6Img,  // 9: heel strike (left foot landing)
            ];
            const isWalking = isDragging || isAutonomousWalking;
            const currentSrc = isJumping ? mascotJumpImg : (isWalking ? FRAMES[walkFrame] : mascotImg);
            const prevFrame = ((walkFrame - 1) + 10) % 10;
            const prevSrc = isJumping ? mascotJumpImg : (isWalking ? FRAMES[prevFrame] : mascotImg);
            return (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {/* Previous frame fading out */}
                <img
                  key={`prev-${prevSrc}`}
                  src={prevSrc}
                  alt=""
                  className="w-full h-full object-contain pointer-events-none"
                  draggable="false"
                  style={{
                    position: 'absolute', top: 0, left: 0,
                    transform: `scaleX(${-direction})`,
                    opacity: 0,
                    transition: 'opacity 0.08s ease'
                  }}
                />
                {/* Current frame fading in */}
                <img
                  key={`cur-${currentSrc}`}
                  src={currentSrc}
                  alt="Chatbot Mascot"
                  className="w-full h-full object-contain pointer-events-none"
                  draggable="false"
                  style={{
                    position: 'absolute', top: 0, left: 0,
                    transform: `scaleX(${-direction})`,
                    opacity: 1,
                    transition: 'opacity 0.08s ease'
                  }}
                />
              </div>
            );
          })()}
        </div>
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
