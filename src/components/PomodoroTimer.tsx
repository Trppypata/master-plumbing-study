'use client';

import { useState, useEffect, useRef } from 'react';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const MODES: Record<TimerMode, { label: string; minutes: number; color: string }> = {
  focus: { label: 'Focus', minutes: 25, color: '#ef4444' },
  shortBreak: { label: 'Short Break', minutes: 5, color: '#22c55e' },
  longBreak: { label: 'Long Break', minutes: 15, color: '#3b82f6' },
};

export default function PomodoroTimer() {
  const [isMinimized, setIsMinimized] = useState(true);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.minutes * 60);
  const [isActive, setIsActive] = useState(false);
  
  // Drag State
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Relative to bottom-right
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  // Initialize Position on Client
  useEffect(() => {
    // Start at bottom right with some margin
    setPosition({ x: 24, y: 24 });
  }, []);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Handle Dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      e.preventDefault();
      
      const deltaX = dragRef.current.startX - e.clientX;
      const deltaY = dragRef.current.startY - e.clientY;
      
      setPosition({
        x: dragRef.current.initialX + deltaX,
        y: dragRef.current.initialY + deltaY
      });
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    if (dragRef.current) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
       document.removeEventListener('mousemove', handleMouseMove);
       document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        initialX: position.x,
        initialY: position.y
    };
    
    // Add listeners immediately
    const handleMouseMove = (e: MouseEvent) => {
        if (!dragRef.current) return;
        
        const deltaX = dragRef.current.startX - e.clientX;
        const deltaY = dragRef.current.startY - e.clientY;
        
        setPosition({
          x: dragRef.current.initialX + deltaX,
          y: dragRef.current.initialY + deltaY
        });
      };
  
      const handleMouseUp = () => {
        dragRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(MODES[newMode].minutes * 60);
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode].minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const commonStyles: React.CSSProperties = {
    position: 'fixed',
    bottom: `${position.y}px`,
    right: `${position.x}px`,
    zIndex: 9999, // Super high z-index
    cursor: 'move',
    transition: dragRef.current ? 'none' : 'transform 0.1s ease', // Only animate when not dragging
    touchAction: 'none'
  };

  // Minimized View - Cute Pill Card
  if (isMinimized) {
    return (
      <div
        onMouseDown={startDrag}
        style={commonStyles}
        className="flex items-center gap-3 pl-3 pr-5 py-3 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[var(--color-sand)] group"
      >
        <button 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}
            className="flex items-center gap-3 w-full h-full cursor-pointer"
        >
            <div className="relative">
            <span className="text-3xl block pb-1">🍅</span>
            {isActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--color-forest)] rounded-full border-2 border-white animate-bounce"></div>
            )}
            </div>
            <div className="flex flex-col items-start whitespace-nowrap">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] group-hover:text-[var(--color-forest)] transition-colors">
                Focus
            </span>
            <span className="font-bold text-sm bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500 tabular-nums">
                {isActive ? formatTime(timeLeft) : 'Start'}
            </span>
            </div>
        </button>
      </div>
    );
  }

  // Expanded View - Cute Soft Card
  return (
    <div 
        style={{ ...commonStyles, width: '320px', cursor: 'default' }}
        className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-[var(--color-sand)] overflow-hidden"
    >
      
      {/* Draggable Header */}
      <div 
        onMouseDown={startDrag}
        className="px-6 py-4 flex justify-between items-center text-white transition-colors duration-500 cursor-move"
        style={{ backgroundColor: MODES[mode].color }}
      >
        <div className="flex items-center gap-2 pointer-events-none">
            <span className="text-2xl animate-spin-slow">✨</span>
            <span className="font-bold text-base tracking-wide text-white/95">Focus Time</span>
        </div>
        <button 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setIsMinimized(true)}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-sm cursor-pointer"
        >
            ✕
        </button>
      </div>

      {/* Body */}
      <div className="p-6 text-center relative">
        <div className="absolute top-10 left-10 w-20 h-20 bg-[var(--color-cream)] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 bg-[var(--color-sand)] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="relative flex justify-center gap-1.5 mb-8 p-1.5 bg-gray-100 rounded-full mx-auto w-fit z-10">
            {(Object.keys(MODES) as TimerMode[]).map((m) => (
                <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all relative z-10 ${
                        mode === m 
                        ? `text-white shadow-sm scale-105` 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={{ backgroundColor: mode === m ? MODES[mode].color : 'transparent' }}
                >
                    {MODES[m].label.split(' ')[0]}
                </button>
            ))}
        </div>

        <div className="relative mb-8 select-none">
            <div 
                className="text-7xl font-black tracking-tighter tabular-nums transition-colors duration-500"
                style={{ color: MODES[mode].color }}
            >
                {formatTime(timeLeft)}
            </div>
        </div>

        <div className="flex items-center justify-center gap-4 relative z-10">
            <button
                onClick={resetTimer}
                className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 flex items-center justify-center hover:rotate-180 transition-all duration-500"
            >
                ↺
            </button>

            <button
                onClick={toggleTimer}
                className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl transition-all hover:scale-105 active:scale-95 shadow-lg text-white`}
                style={{ 
                    backgroundColor: MODES[mode].color, 
                    boxShadow: `0 10px 25px -5px ${MODES[mode].color}80` 
                }}
            >
                {isActive ? '⏸' : '▶'}
            </button>
        </div>
      </div>
    </div>
  );
}
