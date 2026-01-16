'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { resolveMistake } from '@/app/actions/exam';
import { Brain, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Calendar, BookOpen } from 'lucide-react';

interface Mistake {
  id: string;
  question_data: {
    id: string;
    text: string;
    subject: string;
    choices: string[];
    correctIndex: number;
    explanation: string;
  };
  incorrect_count: number;
  last_missed_at: string;
}

export default function MistakesPage() {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMistakes() {
      const { data } = await supabase
        .from('mistakes_log')
        .select('*')
        .eq('is_resolved', false)
        .order('last_missed_at', { ascending: false });
      
      if (data) setMistakes(data);
      setLoading(false);
    }
    loadMistakes();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-[var(--color-text-secondary)]">
        <RotateCcw className="w-8 h-8 animate-spin mb-4 text-[var(--color-tan)]" />
        <p>Loading your learning log...</p>
    </div>
  );

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-[var(--color-sand)] pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                <Brain className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Smart Mistake Bank</h1>
          </div>
          <p className="text-[var(--color-text-secondary)] max-w-lg">
            Focus on your weak points. These are the questions you've missed recently.
            Master them to close your knowledge gaps.
          </p>
        </div>
        
        {mistakes.length > 0 && (
           <div className="flex items-center gap-4 bg-red-50 px-5 py-3 rounded-2xl border border-red-100">
             <div className="text-right">
                <span className="block text-2xl font-black text-red-600 leading-none">{mistakes.length}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-red-400">To Review</span>
             </div>
             <AlertTriangle className="w-8 h-8 text-red-300" />
           </div>
        )}
      </div>

      {mistakes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-b from-green-50/50 to-transparent rounded-3xl border-2 border-dashed border-green-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">Clean Record!</h2>
          <p className="text-green-700/80 mb-8 max-w-md text-center">
            You haven't missed any questions yet, or you've successfully mastered all your previous mistakes. Great work!
          </p>
          <Link href="/exam" className="btn btn-primary group">
            <span>Start New Exam</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {mistakes.map((m) => (
            <div key={m.id} className="card group hover:border-[var(--color-forest)] transition-all duration-300 hover:shadow-md bg-white overflow-hidden relative">
              
              {/* Left Stripe Indicator */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-400 to-orange-400"></div>

              <div className="flex flex-col md:flex-row gap-6 p-6 pl-8">
                <div className="flex-grow space-y-3">
                    {/* Meta Tags */}
                    <div className="flex items-center flex-wrap gap-3 text-xs">
                        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[var(--color-forest)] bg-[#F0FDF4] px-2.5 py-1 rounded-md border border-[var(--color-forest)]/20">
                            <BookOpen className="w-3 h-3" />
                            {m.question_data.subject}
                        </span>
                        <span className="flex items-center gap-1.5 text-red-500 font-medium bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
                            <AlertTriangle className="w-3 h-3" />
                            Missed {m.incorrect_count}x
                        </span>
                        <span className="flex items-center gap-1.5 text-[var(--color-text-muted)] pl-1">
                            <Calendar className="w-3 h-3" />
                            Last: {new Date(m.last_missed_at).toLocaleDateString()}
                        </span>
                    </div>

                    {/* Question Content */}
                    <div>
                        <h3 className="font-bold text-lg text-[var(--color-text)] leading-snug group-hover:text-[var(--color-forest)] transition-colors">
                            {m.question_data.text}
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-2 line-clamp-2 pl-3 border-l-2 border-gray-100 italic">
                            {m.question_data.explanation}
                        </p>
                    </div>
                </div>
                
                {/* Actions */}
                <div className="flex flex-col justify-center min-w-[140px] border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                    <Link href="/exam/session?mode=mistakes" className="btn btn-primary w-full justify-between group/btn text-sm py-2.5">
                        <span>Review</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                    <button 
                        onClick={async () => {
                            if (!confirm('Mark this mistake as resolved?')) return;
                            await resolveMistake(m.id);
                            window.location.reload(); // Simple reload to refresh list
                        }}
                        className="text-[10px] text-center text-gray-400 mt-3 hover:text-red-500 transition-colors"
                    >
                        Mark Resolved
                    </button>
                    {/* Add resolveMistake import */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
