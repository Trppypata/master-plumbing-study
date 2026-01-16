'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getExamHistory } from '@/app/actions/exam';
import { RotateCcw, Calendar, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await getExamHistory();
        setHistory(data || []);
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-[var(--color-text-secondary)]">
        <RotateCcw className="w-8 h-8 animate-spin mb-4 text-[var(--color-tan)]" />
        <p>Loading exam history...</p>
    </div>
  );

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 border-b border-[var(--color-sand)] pb-6">
        <Link href="/progress" className="text-xs flex items-center gap-1 mb-2 text-gray-500 hover:text-gray-700">
          ← Back to Progress
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Exam History</h1>
            <p className="text-sm text-gray-500">
              A log of all your completed practice sessions.
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-2xl font-bold text-[var(--color-forest)]">{history.length}</div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Sessions Completed</div>
          </div>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
           <p className="text-gray-500 mb-4">No exam history found.</p>
           <Link href="/exam" className="btn btn-primary">Take your first exam</Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4 text-center">Result</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{formatDate(exam.created_at || exam.completed_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <span className={`text-lg font-bold ${exam.score >= 70 ? 'text-[var(--color-forest)]' : 'text-red-500'}`}>
                           {exam.score}%
                         </span>
                         <span className="text-gray-400 text-xs">
                           ({exam.correct_answers}/{exam.total_questions})
                         </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        {exam.score >= 70 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#F0FDF4] text-[var(--color-forest)]">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-500">
                                <XCircle className="w-3.5 h-3.5" /> Fail
                            </span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                       {formatDuration(exam.duration_seconds)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                        {exam.subjects_breakdown && (
                           <div className="flex gap-2">
                              {Object.entries(exam.subjects_breakdown).slice(0, 2).map(([subject, stats]: [string, any]) => (
                                 <span key={subject} className="bg-gray-100 px-2 py-0.5 rounded text-[10px]">
                                    {subject}: {Math.round((stats.correct/stats.total)*100)}%
                                 </span>
                              ))}
                              {Object.keys(exam.subjects_breakdown).length > 2 && (
                                 <span className="text-[10px] text-gray-400">+{Object.keys(exam.subjects_breakdown).length - 2} more</span>
                              )}
                           </div>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
