'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveExamResult, logMistakes, getExamQuestions } from '@/app/actions/exam';

interface ExamQuestion {
  id: string;
  text: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  subject: string;
}

export default function ExamSessionPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const count = parseInt(searchParams.get('count') || '50');

    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const [answers, setAnswers] = useState<Record<number, number>>({}); // index -> choiceIndex
    const [marked, setMarked] = useState<Record<number, boolean>>({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // Initialize Exam
    useEffect(() => {
        async function loadQuestions() {
            try {
                const data = await getExamQuestions(count);
                setQuestions(data);
                setTimeLeft(data.length * 90); // 1.5 mins per question based on actual count
            } catch (error) {
                console.error('Error loading exam questions:', error);
            } finally {
                setLoading(false);
            }
        }
        loadQuestions();
    }, [count]);

    // Timer
    useEffect(() => {
        if(isFinished || loading) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if(prev <= 1) {
                    finishExam();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isFinished, loading]);

    const finishExam = async () => {
        if (isFinished) return;
        setIsFinished(true);
        setIsSaving(true);
        
        try {
            // Calculate stats for saving
            let correctCount = 0;
            const subjectStats: Record<string, { total: number; correct: number }> = {};
            
            questions.forEach((q, idx) => {
                const isCorrect = answers[idx] === q.correctIndex;
                if (isCorrect) correctCount++;
                
                if (!subjectStats[q.subject]) {
                    subjectStats[q.subject] = { total: 0, correct: 0 };
                }
                subjectStats[q.subject].total++;
                if (isCorrect) subjectStats[q.subject].correct++;
            });

            const userScore = Math.round((correctCount / questions.length) * 100);

            // Collect mistakes
            const mistakes = questions
                .filter((q, idx) => answers[idx] !== q.correctIndex)
                .map(q => ({
                    question_id: q.id,
                    question_data: q
                }));

            if (mistakes.length > 0) {
                await logMistakes(mistakes);
            }

            await saveExamResult({
                score: userScore,
                total_questions: questions.length,
                correct_answers: correctCount,
                duration_seconds: (questions.length * 90) - timeLeft,
                subjects_breakdown: subjectStats
            });
        } catch (err) {
            console.error('Failed to save exam:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAnswer = (choiceIndex: number) => {
        setAnswers(prev => ({ ...prev, [currentIndex]: choiceIndex }));
    };

    const toggleMark = () => {
        setMarked(prev => ({ ...prev, [currentIndex]: !prev[currentIndex] }));
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-forest font-medium">Randomizing Exam Questions...</div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="text-center py-20 animate-fade-in">
                <h1 className="text-2xl font-semibold mb-4 text-gray-900">No Questions Found</h1>
                <p className="text-gray-500 mb-8">Unable to generate an exam. Please ensure you have flashcards in your database.</p>
                <Link href="/exam" className="px-6 py-2 bg-forest text-white rounded-lg">← Back to Setup</Link>
            </div>
        );
    }

    if (isFinished) {
        let correctCount = 0;
        questions.forEach((q, idx) => {
            if(answers[idx] === q.correctIndex) correctCount++;
        });
        const score = Math.round((correctCount / questions.length) * 100);
        
        return (
            <div className="max-w-2xl mx-auto animate-fade-in text-center p-8 bg-white border border-sand rounded-2xl shadow-sm my-10">
                <h1 className="text-3xl font-black mb-2 text-gray-900">Exam Results</h1>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-8">Practice Simulation Complete</p>
                
                {isSaving && <div className="text-forest text-xs font-bold animate-pulse mb-6">SAVING RESULTS TO PROFILE...</div>}

                <div className="mb-10 p-10 bg-gradient-to-br from-forest/5 to-white border-2 border-forest rounded-2xl shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-forest opacity-5 rounded-full -mr-16 -mt-16"></div>
                    <div className="text-8xl font-black text-forest mb-4 tracking-tighter">{score}%</div>
                    <p className={`text-xl font-black tracking-tight ${score >= 70 ? 'text-forest' : 'text-red-600'}`}>
                        {score >= 70 ? 'PASSING SCORE' : 'NEEDS IMPROVEMENT'}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                     <div className="bg-cream border border-sand p-6 rounded-2xl">
                        <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Questions Answered</div>
                        <div className="text-2xl font-bold text-gray-900">{Object.keys(answers).length} / {questions.length}</div>
                     </div>
                     <div className="bg-cream border border-sand p-6 rounded-2xl">
                        <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Time Elapsed</div>
                        <div className="text-2xl font-bold text-gray-900">{formatTime((questions.length * 90) - timeLeft)}</div>
                     </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/exam" className="px-8 py-4 bg-white border border-sand text-gray-700 font-bold rounded-xl hover:bg-cream transition">New Exam</Link>
                    <Link href="/" className="px-8 py-4 bg-forest text-white font-bold rounded-xl shadow-lg hover:bg-forest/90 transition shadow-forest/20">Go to Dashboard</Link>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentIndex];

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-6 bg-gray-900 text-white p-5 rounded-2xl shadow-xl border border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="font-mono text-2xl font-black tracking-widest">
                        {formatTime(timeLeft)}
                    </div>
                </div>
                <div className="hidden sm:block text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                    MASTER PLUMBER EXAM SIMULATOR
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-xs font-bold opacity-60">
                        Q: {currentIndex + 1} / {questions.length}
                    </div>
                    <button 
                        onClick={finishExam}
                        className="text-[10px] font-black uppercase tracking-widest bg-forest/20 hover:bg-forest/40 text-forest border border-forest/30 px-4 py-2 rounded-lg transition"
                    >
                        Submit
                    </button>
                </div>
            </div>

            <div className="flex gap-6 flex-grow overflow-hidden">
                {/* Main Question Area */}
                <div className="flex-grow flex flex-col min-w-0">
                    <div className="bg-white border border-sand rounded-3xl flex-grow flex flex-col p-8 md:p-12 overflow-y-auto shadow-sm relative">
                         <div className="flex justify-between items-start mb-10">
                            <span className="text-[10px] font-black uppercase tracking-widest text-forest bg-forest/5 px-3 py-1.5 rounded-full border border-forest/10">
                                {currentQ.subject}
                            </span>
                            <button 
                                onClick={toggleMark}
                                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${marked[currentIndex] ? 'text-orange-500' : 'text-gray-300 hover:text-gray-500'}`}
                            >
                                <span className="text-xl leading-none">{marked[currentIndex] ? '★' : '☆'}</span>
                                {marked[currentIndex] ? 'Marked' : 'Mark'}
                            </button>
                         </div>

                         <h2 className="text-xl md:text-3xl font-bold tracking-tight text-gray-900 leading-[1.4] mb-12 flex-grow">
                             {currentQ.text}
                         </h2>

                         <div className="space-y-4 max-w-2xl">
                             {currentQ.choices.map((choice, idx) => (
                                 <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-5 group
                                        ${answers[currentIndex] === idx 
                                            ? 'border-forest bg-[#F0FDF4] shadow-md shadow-forest/5' 
                                            : 'border-transparent bg-gray-50 hover:bg-white hover:border-sand'
                                        }`}
                                 >
                                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border-2 transition-all
                                         ${answers[currentIndex] === idx
                                             ? 'bg-forest text-white border-forest rotate-6'
                                             : 'bg-white text-gray-400 border-sand group-hover:border-forest/30'
                                         }`}>
                                         {String.fromCharCode(65 + idx)}
                                     </div>
                                     <span className={`text-base font-medium transition-colors ${answers[currentIndex] === idx ? 'text-gray-900' : 'text-gray-600'}`}>
                                         {choice}
                                     </span>
                                 </button>
                             ))}
                         </div>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex justify-between items-center mt-6 px-2">
                        <button 
                            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentIndex === 0}
                            className="px-8 py-3 bg-white border border-sand text-gray-400 font-bold rounded-2xl hover:bg-cream hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-white transition flex items-center gap-2"
                        >
                            <span>←</span> PREVIOUS
                        </button>
                        
                        <div className="flex gap-2">
                            {questions.map((_, idx) => (
                                <div 
                                    key={idx} 
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${currentIndex === idx ? 'w-6 bg-forest' : 'bg-gray-200'}`}
                                />
                            )).slice(Math.max(0, currentIndex - 2), Math.min(questions.length, currentIndex + 3))}
                        </div>

                        <button 
                            onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                            disabled={currentIndex === questions.length - 1}
                            className="px-8 py-3 bg-white border border-sand text-gray-700 font-bold rounded-2xl hover:bg-cream disabled:opacity-30 transition flex items-center gap-2"
                        >
                            NEXT <span>→</span>
                        </button>
                    </div>
                </div>

                {/* Sidebar Grid (Desktop Only) */}
                <div className="hidden lg:block w-72 bg-white border border-sand rounded-3xl p-6 overflow-y-auto shadow-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-gray-400">Board Map</h3>
                    <div className="grid grid-cols-4 gap-3">
                        {questions.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`aspect-square rounded-xl flex items-center justify-center text-[11px] font-black transition-all relative border-2
                                    ${currentIndex === idx 
                                        ? 'border-gray-900 scale-110 z-10 shadow-lg' 
                                        : 'border-transparent'
                                    }
                                    ${answers[idx] !== undefined 
                                        ? 'bg-forest text-white' 
                                        : 'bg-gray-50 text-gray-400'
                                    }
                                `}
                            >
                                {idx + 1}
                                {marked[idx] && (
                                    <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
