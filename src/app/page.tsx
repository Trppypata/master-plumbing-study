'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Subject, DashboardStats } from '@/types';
import DailyQuote from '@/components/DailyQuote';
import { supabase } from '@/lib/supabase';
import { getDashboardStats } from '@/lib/data-service';
import { useAuth } from '@/components/AuthProvider';
import { motion } from 'framer-motion';
import { 
  Flame, 
  CheckCircle2, 
  Timer, 
  AlertTriangle, 
  BookOpen, 
  Scroll, 
  Calculator, 
  Wrench, 
  ArrowRight,
  Brain,
  Library,
  User
} from 'lucide-react';
import ReviewButton from '@/components/ReviewButton';

// Map slug to Lucide icon
const getSubjectIcon = (slug: string) => {
  switch(slug) {
    case 'plumbing-code': return <Scroll className="w-6 h-6" />;
    case 'plumbing-arithmetic': return <Calculator className="w-6 h-6" />;
    case 'sanitation-design': return <Wrench className="w-6 h-6" />;
    case 'practical-problems': return <AlertTriangle className="w-6 h-6" />;
    default: return <BookOpen className="w-6 h-6" />;
  }
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

export default function HomePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const greeting = new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening';
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Get display name from user metadata or email
  const displayName = user?.user_metadata?.full_name 
    || user?.user_metadata?.name 
    || user?.email?.split('@')[0] 
    || 'Plumber';

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [dashboardStats, { count }] = await Promise.all([
          getDashboardStats(),
          supabase
            .from('mistakes_log')
            .select('*', { count: 'exact', head: true })
            .eq('is_resolved', false)
        ]);
        
        setStats(dashboardStats);
        if (count !== null) setMistakeCount(count);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-forest font-medium">Preparing your workspace...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-900">Unable to load dashboard</h2>
        <p className="text-gray-500 mt-2">Please check your connection and try again.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-forest text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="pb-20 container mx-auto px-4">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 mt-2"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-forest mb-1">
          {dateStr}
        </p>
        <div className="flex items-center gap-3">
          {user && (
            <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center text-forest flex-shrink-0">
              <User className="w-5 h-5" />
            </div>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Good {greeting}, {displayName}
            </h1>
            <p className="text-gray-500 text-sm">
              Ready to master the code today?
            </p>
          </div>
        </div>
      </motion.div>

      {/* ===== BENTO GRID ===== */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[140px]"
      >

        {/* Readiness - Large 2x2 - Links to Progress */}
        <motion.div variants={itemVariants} className="col-span-1 sm:col-span-2 row-span-2">
          <Link href="/progress" className="h-full relative overflow-hidden rounded-xl bg-gradient-to-br from-[#F0FDF4] to-white border border-forest/20 p-6 flex flex-col justify-between group cursor-pointer hover:border-forest/40 transition-colors shadow-sm hover:shadow-md">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-forest rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-forest">
                Exam Readiness
              </span>
              <span className="text-[10px] text-gray-400 group-hover:text-forest transition-colors">View Progress →</span>
            </div>
            <div>
              <div className="text-[4rem] font-black tracking-tighter leading-none text-gray-900">
                {stats.examReadiness}%
              </div>
              <div className="w-full h-2 bg-sand/40 rounded-full mt-4 overflow-hidden">
                <div 
                  className="h-full bg-forest rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${stats.examReadiness}%` }}
                />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Daily Quote - 2x2 */}
        <motion.div variants={itemVariants} className="col-span-1 sm:col-span-2 row-span-2">
          <DailyQuote />
        </motion.div>

        {/* Daily Review Call to Action - 1x1 */}
        <motion.div variants={itemVariants} className="col-span-1 row-span-1 flex flex-col gap-2">
           <Link href="/daily-review" className="h-full w-full">
              <ReviewButton />
           </Link>
        </motion.div>

        {/* Mistake Bank - 1x1 */}
        <motion.div variants={itemVariants} className="col-span-1 row-span-1">
          <Link href="/mistakes" className="h-full w-full card group hover:border-red-200 transition-colors bg-gradient-to-br from-red-50 to-white border-red-200/50 flex flex-col justify-between p-4 cursor-pointer shadow-sm hover:shadow-md">
            <Brain className="w-8 h-8 text-red-500 group-hover:rotate-12 transition-transform" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{mistakeCount}</div>
              <span className="text-[10px] uppercase tracking-wider text-red-600 font-semibold">Mistakes</span>
            </div>
          </Link>
        </motion.div>
        
        {/* Exam Mode - Wide 2x1 */}
        <motion.div variants={itemVariants} className="col-span-1 sm:col-span-2 row-span-1">
          <Link href="/exam" className="h-full w-full card group bg-gray-900 text-white p-5 flex items-center justify-between overflow-hidden relative border-none shadow-md hover:shadow-xl transition-all">
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex flex-col justify-center h-full">
              <div className="text-lg font-bold">Exam Mode</div>
              <p className="text-xs text-gray-400">Simulate the real test</p>
            </div>
            <Timer className="w-8 h-8 relative z-10 text-white/80 group-hover:text-white transition-colors" />
          </Link>
        </motion.div>

        {/* Study Modules Header */}
        <motion.div variants={itemVariants} className="col-span-1 sm:col-span-2 lg:col-span-4 flex items-center gap-3 py-2 mt-2">
          <h2 className="text-lg font-bold text-gray-900 whitespace-nowrap">Study Modules</h2>
          <div className="h-px bg-gray-200 flex-grow"></div>
        </motion.div>

        {/* Subject Cards */}
        {stats.subjectStats.map((stat) => (
          <motion.div variants={itemVariants} key={stat.subject.id} className="col-span-1 sm:col-span-1 row-span-1 h-[140px]">
            <Link
              href={`/study/${stat.subject.slug}`}
              className="card card-interactive group p-4 flex flex-col justify-between h-full shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{stat.subject.name}</h3>
                  <p className="text-[10px] text-gray-500 leading-tight mt-0.5 line-clamp-2">{stat.subject.description}</p>
                </div>
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center bg-cream group-hover:scale-110 transition-transform duration-300 text-gray-500">
                  {getSubjectIcon(stat.subject.slug)}
                </div>
              </div>
              <div className="mt-auto pt-2">
                <div className="flex justify-between text-[10px] font-medium mb-1">
                  <span style={{ color: stat.subject.color }}>{stat.progressPercent}%</span>
                  <span className="text-gray-400">{stat.needsReview} due</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${stat.progressPercent}%`, backgroundColor: stat.subject.color }}
                  />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}

        {/* Focus Area - 2x1 */}
        {stats.weakestSubject && (
          <motion.div variants={itemVariants} className="col-span-1 sm:col-span-2 row-span-1">
            <Link 
              href={`/study/${stats.weakestSubject.slug}`} 
              className="h-full w-full card group bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center border border-orange-100 group-hover:scale-105 transition-transform text-orange-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-grow">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block">Needs Focus</span>
                <div className="font-bold text-gray-900">{stats.weakestSubject.name}</div>
              </div>
              <ArrowRight className="w-5 h-5 text-orange-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}

        {/* Resources - 2x1 */}
        <motion.div variants={itemVariants} className="col-span-1 sm:col-span-2 row-span-1">
          <Link href="/resources" className="h-full w-full card group p-4 flex items-center gap-4 bg-white shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-cream flex items-center justify-center border border-sand group-hover:scale-105 transition-transform text-tan">
              <Library className="w-6 h-6" />
            </div>
            <div className="flex-grow">
              <div className="font-bold text-gray-900">Resources</div>
              <span className="text-xs text-gray-500">Formulas & reference</span>
            </div>
            <ArrowRight className="w-5 h-5 text-tan group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

      </motion.div>
    </div>
  );
}
