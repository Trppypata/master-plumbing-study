'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Target, Clock, Flame, Award, BookOpen, BarChart3 } from 'lucide-react';
import { getProgressSummary, getStudyStreak } from '@/app/actions/progress';
import { getChartData, getSubjectProgress, DailyChartData, SubjectProgress, getTotalStudyTime } from '@/app/actions/charts';
import { calculateExamReadiness } from '@/lib/spaced-repetition';

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, mastered: 0, learning: 0, needsReview: 0, new: 0 });
  const [streak, setStreak] = useState(0);
  const [chartData, setChartData] = useState<DailyChartData[]>([]);
  const [subjects, setSubjects] = useState<SubjectProgress[]>([]);
  const [studyTime, setStudyTime] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [sum, str, chart, subj, time] = await Promise.all([
      getProgressSummary(),
      getStudyStreak(),
      getChartData(14),
      getSubjectProgress(),
      getTotalStudyTime(),
    ]);
    setSummary(sum);
    setStreak(str);
    setChartData(chart);
    setSubjects(subj);
    setStudyTime(time);
    setLoading(false);
  };

  const readiness = calculateExamReadiness(summary.total, summary.mastered, summary.learning);
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading progress...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <Link href="/" className="text-xs flex items-center gap-1 mb-2 text-gray-500 hover:text-gray-700">
             ← Back to Dashboard
           </Link>
           <h1 className="text-2xl font-semibold tracking-tight mb-2">Progress Dashboard</h1>
           <p className="text-sm text-gray-500">Track your study progress and exam readiness.</p>
        </div>
        <Link href="/history" className="btn btn-secondary flex items-center gap-2 text-sm">
           <Clock className="w-4 h-4" /> Exam History
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-forest" />
            </div>
            <div>
              <p className="text-2xl font-bold">{readiness}%</p>
              <p className="text-xs text-gray-500">Exam Ready</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{streak}</p>
              <p className="text-xs text-gray-500">Day Streak</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.mastered}</p>
              <p className="text-xs text-gray-500">Mastered</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatTime(studyTime)}</p>
              <p className="text-xs text-gray-500">Study Time</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Progress Breakdown */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Card Progress
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Mastered', count: summary.mastered, color: 'bg-emerald-500' },
                { label: 'Learning', count: summary.learning, color: 'bg-blue-500' },
                { label: 'Needs Review', count: summary.needsReview, color: 'bg-amber-500' },
                { label: 'New', count: summary.new, color: 'bg-gray-300' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.label}</span>
                    <span className="font-medium">{item.count} / {summary.total}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} transition-all`}
                      style={{ width: `${summary.total > 0 ? (item.count / summary.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Chart */}
          <div className="card mt-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Daily Activity (Last 14 days)
            </h3>
            {chartData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No study data yet. Start reviewing flashcards to see your progress!
              </p>
            ) : (
              <div className="flex items-end gap-1 h-32">
                {chartData.map((day, i) => {
                  const maxCards = Math.max(...chartData.map(d => d.cardsStudied), 1);
                  const height = (day.cardsStudied / maxCards) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-forest/80 rounded-t transition-all hover:bg-forest"
                        style={{ height: `${height}%`, minHeight: day.cardsStudied > 0 ? '4px' : '0' }}
                        title={`${day.date}: ${day.cardsStudied} cards, ${day.accuracy}% accuracy`}
                      />
                      <span className="text-[10px] text-gray-400">
                        {new Date(day.date).getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Subject Progress */}
        <div>
          <div className="card">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> By Subject
            </h3>
            {subjects.length === 0 ? (
              <p className="text-sm text-gray-400">No subjects found.</p>
            ) : (
              <div className="space-y-4">
                {subjects.map((subj) => {
                  const progress = subj.total > 0 
                    ? Math.round(((subj.mastered + subj.learning * 0.5) / subj.total) * 100)
                    : 0;
                  return (
                    <div key={subj.subject}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="truncate">{subj.subject}</span>
                        <span className="font-medium text-forest">{progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-forest transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {subj.mastered} mastered · {subj.learning} learning · {subj.total} total
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Tips */}
          <div className="card mt-6" style={{ background: '#111827', color: 'white' }}>
            <h4 className="text-sm font-semibold mb-3">💡 Study Tips</h4>
            <ul className="text-xs space-y-2 text-gray-300">
              <li>• Review cards marked "Needs Review" first</li>
              <li>• Aim for 70%+ accuracy before moving on</li>
              <li>• Use spaced repetition for long-term retention</li>
              <li>• Take practice exams when readiness hits 80%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
