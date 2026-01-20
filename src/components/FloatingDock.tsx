'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, 
  MessageCircle, 
  Brain, 
  Home, 
  BookOpen, 
  GraduationCap,
  Sparkles,
  Music
} from 'lucide-react';
import Link from 'next/link';

// Import Panels
import PomodoroPanel from './panels/PomodoroPanel';
import ChatPanel from './panels/ChatPanel';
import SpotifyPanel from './panels/SpotifyPanel';

// ============================================
// FLOATING DOCK - Main Component
// ============================================

type PanelType = 'pomodoro' | 'chat' | 'music';

export default function FloatingDock() {
  const pathname = usePathname();
  const [activePanels, setActivePanels] = useState<PanelType[]>([]);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);

  const togglePanel = (panel: PanelType) => {
    setActivePanels(prev => {
      // If panel is already open, close it
      if (prev.includes(panel)) {
        // Exception: If pomodoro is running, don't close it easily (though user can still click X on panel)
        // Let's go with: if running, clicking icon brings to front (or does nothing if already visible), doesn't close.
        if (panel === 'pomodoro' && pomodoroRunning) {
          return prev; // Don't close via dock click if running
        }
        return prev.filter(p => p !== panel);
      }
      // If panel is not open, add it
      return [...prev, panel];
    });
  };

  const closePanel = (panel: PanelType) => {
    setActivePanels(prev => prev.filter(p => p !== panel));
  };

  // Don't show dock on login page
  if (pathname === '/login') {
    return null;
  }

  return (
    <>
      {/* Panels Stack - Rendered vertically */}
      <div style={{
        position: 'fixed',
        bottom: '96px',
        right: '24px',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column-reverse', // Stack upwards
        alignItems: 'flex-end',
        gap: '16px',
        pointerEvents: 'none'
      }}>
        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column-reverse', gap: '16px' }}>
          <AnimatePresence>
            {activePanels.includes('pomodoro') && (
              <PomodoroPanel 
                key="pomodoro"
                onClose={() => closePanel('pomodoro')} 
                onRunningChange={setPomodoroRunning}
                isRunning={pomodoroRunning}
              />
            )}
            {activePanels.includes('chat') && (
              <ChatPanel key="chat" onClose={() => closePanel('chat')} />
            )}
            {activePanels.includes('music') && (
              <SpotifyPanel key="music" onClose={() => closePanel('music')} />
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
            className={`dock-item group relative ${activePanels.includes('pomodoro') ? 'bg-[#22c55e]' : ''}`}
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
            className={`dock-item group relative ${activePanels.includes('chat') ? 'bg-[#22c55e]' : ''}`}
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

          {/* Music Button */}
          <button 
            onClick={() => togglePanel('music')} 
            className={`dock-item group relative ${activePanels.includes('music') ? 'bg-[#22c55e]' : ''}`}
            title="Study Music"
          >
            <Music style={{ width: 22, height: 22, color: '#ffffff', stroke: '#ffffff', strokeWidth: 2 }} className="transition-all group-hover:scale-110" />
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
