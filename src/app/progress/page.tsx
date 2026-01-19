'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Clock, Flame, Award, BookOpen, BarChart3, Calendar } from 'lucide-react';
import { triggerConfetti } from '@/lib/confetti';
import { getProgressSummary, getStudyStreak, getStreakCalendar, CalendarDay } from '@/app/actions/progress';
import { getChartData, getSubjectProgress, DailyChartData, SubjectProgress, getTotalStudyTime } from '@/app/actions/charts';
import { calculateExamReadiness } from '@/lib/spaced-repetition';

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, mastered: 0, learning: 0, needsReview: 0, new: 0 });
  const [streak, setStreak] = useState(0);
  const [chartData, setChartData] = useState<DailyChartData[]>([]);
  const [subjects, setSubjects] = useState<SubjectProgress[]>([]);
  const [studyTime, setStudyTime] = useState(0);
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [sum, str, chart, subj, time, cal] = await Promise.all([
      getProgressSummary(),
      getStudyStreak(),
      getChartData(14),
      getSubjectProgress(),
      getTotalStudyTime(),
      getStreakCalendar(),
    ]);
    setSummary(sum);
    setStreak(str);
    setChartData(chart);
    setSubjects(subj);
    setStudyTime(time);
    setCalendarData(cal);
    setLoading(false);

    // Trigger confetti if streak is good!
    if (str >= 3) {
        triggerConfetti();
    }
  };

  const readiness = calculateExamReadiness(summary.total, summary.mastered, summary.learning);
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
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

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div variants={itemVariants} className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-forest" />
              </div>
              <div>
                <p className="text-2xl font-bold">{readiness}%</p>
                <p className="text-xs text-gray-500">Exam Ready</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{streak}</p>
                <p className="text-xs text-gray-500">Day Streak</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.mastered}</p>
                <p className="text-xs text-gray-500">Mastered</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatTime(studyTime)}</p>
                <p className="text-xs text-gray-500">Study Time</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Streak Calendar */}
        <motion.div variants={itemVariants} className="card mb-8">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Study Streak
            {streak > 0 && (
              <span className="ml-auto text-xs font-normal text-orange-500 flex items-center gap-1">
                <Flame className="w-3 h-3" /> {streak} day streak!
              </span>
            )}
          </h3>
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-1 min-w-max">
              {/* Group days into weeks (columns) */}
              {Array.from({ length: 7 }).map((_, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {calendarData.slice(weekIdx * 7, weekIdx * 7 + 7).map((day, dayIdx) => {
                    const levelColors = [
                      'bg-gray-100',     // Level 0: no activity
                      'bg-emerald-200',  // Level 1: low
                      'bg-emerald-300',  // Level 2: medium-low
                      'bg-emerald-400',  // Level 3: medium-high
                      'bg-emerald-600',  // Level 4: high
                    ];
                    const dayDate = new Date(day.date);
                    const isToday = new Date().toISOString().split('T')[0] === day.date;
                    return (
                      <div
                        key={dayIdx}
                        className={`w-4 h-4 rounded-sm ${levelColors[day.level]} ${isToday ? 'ring-2 ring-orange-400 ring-offset-1' : ''} transition-all hover:scale-125`}
                        title={`${dayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}: ${day.cardsStudied} cards`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3 text-[10px] text-gray-400">
              <span>7 weeks ago</span>
              <div className="flex items-center gap-1">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-gray-100" />
                <div className="w-3 h-3 rounded-sm bg-emerald-200" />
                <div className="w-3 h-3 rounded-sm bg-emerald-300" />
                <div className="w-3 h-3 rounded-sm bg-emerald-400" />
                <div className="w-3 h-3 rounded-sm bg-emerald-600" />
                <span>More</span>
              </div>
              <span>Today</span>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Progress Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div variants={itemVariants} className="card">
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
            </motion.div>

            {/* Activity Chart */}
            <motion.div variants={itemVariants} className="card">
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
            </motion.div>
          </div>

          {/* Subject Progress */}
          <div className="space-y-6">
            <motion.div variants={itemVariants} className="card">
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
            </motion.div>


            {/* Badges Section */}
            <motion.div variants={itemVariants} className="card relative overflow-hidden">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Award className="w-4 h-4" /> Achievements
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {/* Streak Badge */}
                  <div className={`flex-shrink-0 w-24 h-32 rounded-xl flex flex-col items-center justify-center p-3 text-center border-2 transition-all ${streak >= 3 ? 'bg-orange-50 border-orange-200 opacity-100' : 'bg-gray-50 border-dashed border-gray-200 opacity-60'}`}>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm text-2xl">
                          🔥
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">On Fire</div>
                      <div className="text-xs font-bold text-gray-900">3 Day Streak</div>
                  </div>

                  {/* Master Badge */}
                  <div className={`flex-shrink-0 w-24 h-32 rounded-xl flex flex-col items-center justify-center p-3 text-center border-2 transition-all ${summary.mastered >= 10 ? 'bg-emerald-50 border-emerald-200 opacity-100' : 'bg-gray-50 border-dashed border-gray-200 opacity-60'}`}>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm text-2xl">
                          🧠
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Scholar</div>
                      <div className="text-xs font-bold text-gray-900">10 Mastered</div>
                  </div>

                  {/* Exam Ready Badge */}
                  <div className={`flex-shrink-0 w-24 h-32 rounded-xl flex flex-col items-center justify-center p-3 text-center border-2 transition-all ${readiness >= 80 ? 'bg-blue-50 border-blue-200 opacity-100' : 'bg-gray-50 border-dashed border-gray-200 opacity-60'}`}>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm text-2xl">
                          🎓
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Pro</div>
                      <div className="text-xs font-bold text-gray-900">80% Ready</div>
                  </div>
              </div>
            </motion.div>

            {/* Quick Tips */}
            <motion.div variants={itemVariants} className="card" style={{ background: '#111827', color: 'white' }}>
              <h4 className="text-sm font-semibold mb-3">💡 Study Tips</h4>
              <ul className="text-xs space-y-2 text-gray-300">
                <li>• Review cards marked "Needs Review" first</li>
                <li>• Aim for 70%+ accuracy before moving on</li>
                <li>• Use spaced repetition for long-term retention</li>
                <li>• Take practice exams when readiness hits 80%</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
