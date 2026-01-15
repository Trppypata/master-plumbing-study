'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ExamSetupPage() {
  const router = useRouter();
  const [questionCount, setQuestionCount] = useState(50);
  const [loading, setLoading] = useState(false);

  const startExam = () => {
    setLoading(true);
    // In a real app, we might pre-fetch or set up state here
    router.push(`/exam/session?count=${questionCount}`);
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
       {/* Header */}
       <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-3 text-[var(--color-text)]">Exam Simulation</h1>
        <p className="text-[var(--color-text-secondary)]">
          Timed practice mode. Simulates the real Master Plumbing exam environment.
        </p>
      </div>

      <div className="card p-8 bg-white border border-[var(--color-sand)] shadow-sm">
         <div className="mb-8">
            <label className="block text-sm font-semibold mb-4 text-[var(--color-text)]">
                Select Number of Questions
            </label>
            <div className="grid grid-cols-3 gap-4">
                {[25, 50, 100].map((count) => (
                    <button
                        key={count}
                        onClick={() => setQuestionCount(count)}
                        className={`py-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1
                            ${questionCount === count 
                                ? 'border-[var(--color-forest)] bg-[#F0FDF4] text-[var(--color-forest)]' 
                                : 'border-gray-200 hover:border-[var(--color-forest)]/50 text-gray-600 bg-gray-50 hover:bg-gray-100'
                            }`}
                    >
                        <span className="text-2xl font-bold">{count}</span>
                        <span className="text-xs uppercase tracking-wider">Questions</span>
                    </button>
                ))}
            </div>
         </div>

         <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-cream)]">
                <span className="text-xl">⏱</span>
                <div>
                    <div className="text-sm font-semibold">Timed Session</div>
                    <div className="text-xs text-[var(--color-text-secondary)]">
                        ~{Math.round(questionCount * 1.5)} minutes recommended
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-cream)]">
                <span className="text-xl">📊</span>
                <div>
                     <div className="text-sm font-semibold">Comprehensive Report</div>
                     <div className="text-xs text-[var(--color-text-secondary)]">
                        Breakdown by subject and topic
                     </div>
                </div>
            </div>
         </div>

         <button 
            onClick={startExam}
            disabled={loading}
            className="w-full btn btn-primary py-4 text-lg shadow-lg hover:shadow-xl transform transition-all active:scale-[0.98]"
         >
            {loading ? 'Preparing Exam...' : 'Start Exam Now'}
         </button>
      </div>
    </div>
  );
}
