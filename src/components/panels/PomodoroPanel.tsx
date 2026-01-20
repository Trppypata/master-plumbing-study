import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, X, Zap, Coffee, Play, Pause, RotateCcw, Minus } from 'lucide-react';

interface PanelProps {
  onClose: () => void;
  onRunningChange?: (running: boolean) => void;
  isRunning?: boolean;
}

export default function PomodoroPanel({ onClose, onRunningChange, isRunning: externalIsRunning }: PanelProps) {
  type Mode = 'focus' | 'short' | 'long';
  const DURATIONS: Record<Mode, number> = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
  
  const [mode, setMode] = useState<Mode>('focus');
  const [timeLeft, setTimeLeft] = useState(DURATIONS[mode]);
  const [isRunning, setIsRunning] = useState(externalIsRunning || false);
  const [isMinimized, setIsMinimized] = useState(false);

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
        height: isMinimized ? 'auto' : 'auto'
      }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="w-72 rounded-2xl border border-gray-100 overflow-hidden" 
      style={{ backgroundColor: 'white', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
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
              {formatTime(timeLeft)}
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 rounded"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={onClose} 
            className={`text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 rounded ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isRunning}
            title={isRunning ? "Timer is running" : "Close"}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content - Hidden when minimized */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
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
        )}
      </AnimatePresence>
    </motion.div>
  );
}
