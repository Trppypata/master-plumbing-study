'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, 
  MessageCircle, 
  Brain, 
  Home, 
  BookOpen, 
  GraduationCap,
  X,
  Play,
  Pause,
  RotateCcw,
  Send,
  Bot,
  User,
  Sparkles,
  Coffee,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { getAIResponse } from '@/app/actions/ai-chat';

// ============================================
// FLOATING DOCK - Main Component
// ============================================

export default function FloatingDock() {
  const pathname = usePathname();
  const [activePanel, setActivePanel] = useState<'none' | 'pomodoro' | 'chat'>('none');
  const [pomodoroRunning, setPomodoroRunning] = useState(false);

  const handlePomodoroClick = () => {
    // If timer is running, don't close the panel - just open it if closed
    if (pomodoroRunning && activePanel === 'pomodoro') {
      return; // Do nothing - keep panel open
    }
    setActivePanel(prev => prev === 'pomodoro' ? 'none' : 'pomodoro');
  };

  const togglePanel = (panel: 'pomodoro' | 'chat') => {
    if (panel === 'pomodoro') {
      handlePomodoroClick();
    } else {
      setActivePanel(prev => prev === panel ? 'none' : panel);
    }
  };

  // Don't show dock on login page
  if (pathname === '/login') {
    return null;
  }

  return (
    <>
      {/* Panels */}
      <div style={{
        position: 'fixed',
        bottom: '96px',
        right: '24px',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '16px',
        pointerEvents: 'none'
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <AnimatePresence mode="wait">
            {activePanel === 'pomodoro' && (
              <PomodoroPanel 
                key="pomodoro"
                onClose={() => setActivePanel('none')} 
                onRunningChange={setPomodoroRunning}
                isRunning={pomodoroRunning}
              />
            )}
            {activePanel === 'chat' && (
              <ChatPanel key="chat" onClose={() => setActivePanel('none')} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Dock Bar - Pill Style, Sticky */}
      <motion.div 
        initial={{ y: 100, opacity: 0, x: '-50%' }}
        animate={{ y: 0, opacity: 1, x: '-50%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.2 }}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          zIndex: 50,
        }}
      >
        <div style={{
          background: 'rgba(2, 44, 34, 0.95)',
          backdropFilter: 'blur(16px)',
          borderRadius: '9999px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          
          {/* Navigation Links */}
          <Link href="/" className="dock-item group" title="Dashboard">
            <Home style={{ width: 22, height: 22, color: '#ffffff', stroke: '#ffffff', strokeWidth: 2 }} className="group-hover:scale-110 transition-all" />
          </Link>
          
          <Link href="/study/plumbing-code" className="dock-item group" title="Study">
            <BookOpen style={{ width: 22, height: 22, color: '#ffffff', stroke: '#ffffff', strokeWidth: 2 }} className="group-hover:scale-110 transition-all" />
          </Link>
          
          <Link href="/exam" className="dock-item group" title="Exam Mode">
            <GraduationCap style={{ width: 24, height: 24, color: '#ffffff', stroke: '#ffffff', strokeWidth: 2 }} className="group-hover:scale-110 transition-all" />
          </Link>

          <Link href="/mistakes" className="dock-item group" title="Mistake Bank">
            <Brain style={{ width: 22, height: 22, color: '#ffffff', stroke: '#ffffff', strokeWidth: 2 }} className="group-hover:scale-110 transition-all" />
          </Link>

          <Link href="/flashcards/generate" className="dock-item group" title="AI Generator">
            <Sparkles style={{ width: 22, height: 22, color: '#ffffff', stroke: '#ffffff', strokeWidth: 2 }} className="group-hover:scale-110 transition-all" />
          </Link>

          {/* Divider */}
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.3)', margin: '0 6px' }}></div>

          {/* Pomodoro Button - with running indicator */}
          <button 
            onClick={() => togglePanel('pomodoro')} 
            className={`dock-item group relative ${activePanel === 'pomodoro' ? 'bg-[#22c55e]' : ''}`}
            title="Pomodoro Timer"
          >
            <Timer 
              style={{ width: 22, height: 22, color: '#ffffff', stroke: '#ffffff', strokeWidth: 2 }} 
              className={`transition-all group-hover:scale-110 ${pomodoroRunning ? 'animate-pulse' : ''}`} 
            />
            {/* Running indicator dot */}
            {pomodoroRunning && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                style={{ 
                  position: 'absolute', 
                  top: '2px', 
                  right: '2px', 
                  width: '10px', 
                  height: '10px', 
                  background: '#ef4444', 
                  borderRadius: '50%',
                  border: '2px solid rgba(2, 44, 34, 0.95)'
                }}
              />
            )}
          </button>

          {/* Chat Button */}
          <button 
            onClick={() => togglePanel('chat')} 
            className={`dock-item group relative ${activePanel === 'chat' ? 'bg-[#22c55e]' : ''}`}
            title="AI Tutor"
          >
            <MessageCircle style={{ width: 22, height: 22, color: '#ffffff', stroke: '#ffffff', strokeWidth: 2 }} className="transition-all group-hover:scale-110" />
            <span style={{ 
              position: 'absolute', 
              top: '4px', 
              right: '4px', 
              width: '8px', 
              height: '8px', 
              background: '#f97316', 
              borderRadius: '50%',
              border: '1px solid #1a1a1a'
            }}></span>
          </button>
        </div>
      </motion.div>

      {/* Dock Item Styles */}
      <style jsx global>{`
        .dock-item {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .dock-item:hover {
          background: rgba(255,255,255,0.15);
          transform: scale(1.1);
        }
        
        /* Mobile styles */
        @media (max-width: 480px) {
          .dock-item {
            width: 36px;
            height: 36px;
          }
          .dock-item svg {
            width: 18px !important;
            height: 18px !important;
          }
        }
      `}</style>
    </>
  );
}

// ============================================
// POMODORO PANEL
// ============================================

interface PanelProps {
  onClose: () => void;
  onRunningChange?: (running: boolean) => void;
  isRunning?: boolean;
}

function PomodoroPanel({ onClose, onRunningChange, isRunning: externalIsRunning }: PanelProps) {
  type Mode = 'focus' | 'short' | 'long';
  const DURATIONS: Record<Mode, number> = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
  
  const [mode, setMode] = useState<Mode>('focus');
  const [timeLeft, setTimeLeft] = useState(DURATIONS[mode]);
  const [isRunning, setIsRunning] = useState(externalIsRunning || false);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          onRunningChange?.(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, onRunningChange]);

  // Sync running state with parent
  useEffect(() => {
    onRunningChange?.(isRunning);
  }, [isRunning, onRunningChange]);

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(DURATIONS[newMode]);
    setIsRunning(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((DURATIONS[mode] - timeLeft) / DURATIONS[mode]) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
      }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="w-72 rounded-2xl border border-gray-100 overflow-hidden" 
      style={{ backgroundColor: 'white', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <motion.div
            animate={isRunning ? { rotate: [0, 10, -10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 0.5, repeatDelay: 2 }}
          >
            <Timer className="w-4 h-4 text-[var(--color-forest)]" />
          </motion.div>
          <span className="font-semibold text-sm">Pomodoro</span>
          {isRunning && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium"
            >
              Running
            </motion.span>
          )}
        </div>
        <button 
          onClick={onClose} 
          className={`text-gray-400 hover:text-gray-600 ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isRunning}
          title={isRunning ? "Timer is running" : "Close"}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 p-2 bg-gray-50">
        {(['focus', 'short', 'long'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            disabled={isRunning}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1
              ${mode === m ? 'bg-[var(--color-forest)] text-white' : 'text-gray-500 hover:bg-gray-100'}
              ${isRunning && mode !== m ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {m === 'focus' && <Zap className="w-3 h-3" />}
            {m === 'short' && <Coffee className="w-3 h-3" />}
            {m === 'long' && <Coffee className="w-3 h-3" />}
            {m === 'focus' ? 'Focus' : m === 'short' ? 'Short' : 'Long'}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="p-6 text-center">
        <motion.div 
          className="text-5xl font-mono font-bold tracking-tight text-[var(--color-text)]"
          animate={isRunning ? { scale: [1, 1.02, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          {formatTime(timeLeft)}
        </motion.div>
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-4 overflow-hidden">
          <motion.div 
            className="h-full bg-[var(--color-forest)] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3 pb-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsRunning(!isRunning)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all
            ${isRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[var(--color-forest)] hover:bg-[#4A6B52]'} text-white`}
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setTimeLeft(DURATIONS[mode]); setIsRunning(false); }}
          className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-600"
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ============================================
// CHAT PANEL
// ============================================

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = ['Explain venting', 'Calculate fall', 'What is DFU?', 'Backflow'];

function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! Ask me anything about plumbing.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text.trim() }]);
    setIsLoading(true);
    try {
      const { response } = await getAIResponse(text);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error. Try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="w-80 sm:w-96 rounded-2xl border border-gray-100 overflow-hidden" 
      style={{ backgroundColor: 'white', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--color-forest)] to-[#3D5A47] text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <span className="font-semibold text-sm">AI Tutor</span>
          <Sparkles className="w-3 h-3 text-white/60" />
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-56 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {messages.map((msg, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-[var(--color-forest)] text-white flex items-center justify-center flex-shrink-0">
                <Bot className="w-3 h-3" />
              </div>
            )}
            <div className={`max-w-[75%] px-3 py-2 rounded-xl text-xs ${
              msg.role === 'user' ? 'bg-[var(--color-forest)] text-white' : 'bg-white border border-gray-100 shadow-sm'
            }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3" />
              </div>
            )}
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-[var(--color-forest)] text-white flex items-center justify-center">
              <Bot className="w-3 h-3" />
            </div>
            <div className="bg-white border px-3 py-2 rounded-xl shadow-sm flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-2 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto">
        {QUICK_PROMPTS.map((p, i) => (
          <motion.button 
            key={i} 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage(p)} 
            className="text-[10px] px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full whitespace-nowrap text-gray-600"
          >
            {p}
          </motion.button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="p-3 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--color-forest)]"
          />
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit" 
            disabled={!input.trim() || isLoading} 
            className="w-9 h-9 bg-[var(--color-forest)] text-white rounded-lg flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
