'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveExamResult, logMistakes } from '@/app/actions/exam';

// Mock Data Types
interface ExamQuestion {
  id: string;
  text: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  subject: string;
}

// Mock Questions Pool (In a real app, fetch from Supabase)
const QUESTION_POOL: ExamQuestion[] = [
  { id: '1', subject: 'Code', text: 'What is the minimum size of a trap arm for a 2-inch floor drain?', choices: ['1.5 inches', '2 inches', '3 inches', '4 inches'], correctIndex: 1, explanation: 'Trap arms cannot be smaller than the fixture drain.' },
  { id: '2', subject: 'Math', text: 'A 4-inch pipe with 1/8" slope runs 60ft. What is the total fall?', choices: ['5 inches', '6 inches', '7.5 inches', '8 inches'], correctIndex: 2, explanation: '60 * 0.125 = 7.5' },
  { id: '3', subject: 'Sanitation', text: 'What prevents sewer gas from entering via a fixture?', choices: ['Backwater valve', 'P-trap', 'Cleanout', 'Vacuum breaker'], correctIndex: 1, explanation: 'A P-trap holds a water seal.' },
  { id: '4', subject: 'Practical', text: "Water hammer is caused by?", choices: ["High pressure", "Quick-closing valves", "Undersized pipes", "Leaks"], correctIndex: 1, explanation: "Quick closing valves stop fast-moving water suddenly." },
  { id: '5', subject: 'Code', text: "Max distance from trap to vent for 2-inch pipe?", choices: ["5 ft", "6 ft", "8 ft", "10 ft"], correctIndex: 2, explanation: "IPC Table 909.1" },
];

export default function ExamSessionPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const count = parseInt(searchParams.get('count') || '50');

    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const [answers, setAnswers] = useState<Record<number, number>>({}); // index -> choiceIndex
    const [marked, setMarked] = useState<Record<number, boolean>>({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(count * 90); // 1.5 mins per question
    const [isFinished, setIsFinished] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Initialize Exam
    useEffect(() => {
        // Shuffle and slice pool
        const shuffled = [...QUESTION_POOL].sort(() => 0.5 - Math.random());
        // For demo, we just cycle the pool if count > pool size
        const examQuestions = [];
        for(let i=0; i<count; i++) {
             examQuestions.push(shuffled[i % shuffled.length]);
        }
        setQuestions(examQuestions);
    }, [count]);

    // Timer
    useEffect(() => {
        if(isFinished) return;
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
    }, [isFinished]);

    const finishExam = async () => {
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
                duration_seconds: (count * 90) - timeLeft,
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

    // Calculate Score
    const calculateScore = () => {
        let correct = 0;
        questions.forEach((q, idx) => {
            if(answers[idx] === q.correctIndex) correct++;
        });
        return Math.round((correct / questions.length) * 100);
    };

    if (questions.length === 0) return <div className="p-8 text-center">Loading Exam...</div>;

    if (isFinished) {
        const score = calculateScore();
        return (
            <div className="max-w-2xl mx-auto animate-fade-in text-center p-8">
                <h1 className="text-3xl font-bold mb-2">Exam Results</h1>
                <p className="text-gray-500 mb-8">Session Complete</p>
                {isSaving && <p className="text-blue-500 animate-pulse mb-4">Saving results...</p>}

                <div className="card p-8 mb-8 border-[var(--color-forest)] border-2">
                    <div className="text-6xl font-bold text-[var(--color-forest)] mb-2">{score}%</div>
                    <p className={`text-lg font-medium ${score >= 70 ? 'text-green-600' : 'text-red-500'}`}>
                        {score >= 70 ? 'PASSING SCORE' : 'NEEDS IMPROVEMENT'}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="card p-4 bg-[var(--color-cream)]">
                        <div className="text-gray-500 text-xs uppercase">Questions</div>
                        <div className="text-xl font-bold">{questions.length}</div>
                     </div>
                     <div className="card p-4 bg-[var(--color-cream)]">
                        <div className="text-gray-500 text-xs uppercase">Time Taken</div>
                        <div className="text-xl font-bold">{formatTime((count * 90) - timeLeft)}</div>
                     </div>
                </div>

                <div className="flex gap-4 justify-center">
                    <Link href="/exam" className="btn btn-secondary">Callback to Setup</Link>
                    <Link href="/" className="btn btn-primary">Return to Dashboard</Link>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentIndex];

    return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-6 bg-[var(--color-forest)] text-white p-4 rounded-xl shadow-lg">
                <div className="font-mono text-xl font-bold tracking-widest">
                    {formatTime(timeLeft)}
                </div>
                <div className="text-sm font-medium opacity-90">
                    Question {currentIndex + 1} of {questions.length}
                </div>
                <button 
                    onClick={finishExam}
                    className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition"
                >
                    Submit Exam
                </button>
            </div>

            <div className="flex gap-6 flex-grow overflow-hidden">
                {/* Main Question Area */}
                <div className="flex-grow flex flex-col min-w-0">
                    <div className="card flex-grow flex flex-col p-8 overflow-y-auto">
                         <div className="flex justify-between items-start mb-6">
                            <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                {currentQ.subject}
                            </span>
                            <button 
                                onClick={toggleMark}
                                className={`flex items-center gap-1 text-xs font-medium transition-colors ${marked[currentIndex] ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <span className="text-lg">{marked[currentIndex] ? '★' : '☆'}</span>
                                {marked[currentIndex] ? 'Marked for Review' : 'Mark Question'}
                            </button>
                         </div>

                         <h2 className="text-xl md:text-2xl font-medium leading-relaxed mb-8 flex-grow">
                             {currentQ.text}
                         </h2>

                         <div className="space-y-3">
                             {currentQ.choices.map((choice, idx) => (
                                 <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 group
                                        ${answers[currentIndex] === idx 
                                            ? 'border-[var(--color-forest)] bg-[#F0FDF4]' 
                                            : 'border-transparent bg-gray-50 hover:bg-gray-100 hover:border-gray-200'
                                        }`}
                                 >
                                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                                         ${answers[currentIndex] === idx
                                             ? 'bg-[var(--color-forest)] text-white border-[var(--color-forest)]'
                                             : 'bg-white text-gray-400 border-gray-200 group-hover:border-gray-300'
                                         }`}>
                                         {String.fromCharCode(65 + idx)}
                                     </div>
                                     <span className={answers[currentIndex] === idx ? 'font-medium text-[var(--color-text)]' : 'text-gray-600'}>
                                         {choice}
                                     </span>
                                 </button>
                             ))}
                         </div>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex justify-between mt-6">
                        <button 
                            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentIndex === 0}
                            className="btn btn-secondary w-32 disabled:opacity-50"
                        >
                            ← Previous
                        </button>
                        <button 
                            onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                            disabled={currentIndex === questions.length - 1}
                            className="btn btn-primary w-32 disabled:opacity-50"
                        >
                            Next →
                        </button>
                    </div>
                </div>

                {/* Sidebar Grid (Desktop) */}
                <div className="hidden md:block w-64 card p-4 overflow-y-auto">
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-gray-400">Question Map</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {questions.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`aspect-square rounded flex items-center justify-center text-xs font-medium transition-all relative
                                    ${currentIndex === idx 
                                        ? 'ring-2 ring-black ring-offset-1 z-10' 
                                        : 'hover:bg-gray-100'
                                    }
                                    ${answers[idx] !== undefined 
                                        ? 'bg-[var(--color-forest)] text-white' 
                                        : 'bg-gray-100 text-gray-500'
                                    }
                                `}
                            >
                                {idx + 1}
                                {marked[idx] && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
