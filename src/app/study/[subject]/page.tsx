'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Flashcard as FlashcardType, Subject } from '@/types';

// Demo flashcards
const demoFlashcards: Record<string, FlashcardType[]> = {
  'plumbing-code': [
    {
      id: '1',
      topic_id: '1',
      type: 'recall',
      front_content: 'What is the minimum size of a trap arm for a 2-inch floor drain?',
      back_content: '2 inches',
      explanation: 'Trap arms cannot be smaller than the fixture drain they serve. For a 2-inch floor drain, the minimum trap arm is 2 inches.',
      code_reference: 'IPC Table 709.1',
      difficulty: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      topic_id: '1',
      type: 'multiple_choice',
      front_content: 'What is the maximum distance from trap to vent for a 1-1/2 inch fixture drain?',
      back_content: '6 feet',
      explanation: 'According to standard code tables, a 1.5-inch pipe with a 1/4 inch per foot slope has a max trap-to-vent distance of 6 feet.',
      code_reference: 'IPC Table 909.1',
      choices: [
        { text: '3 feet', isCorrect: false },
        { text: '5 feet', isCorrect: false },
        { text: '6 feet', isCorrect: true },
        { text: '8 feet', isCorrect: false },
      ],
      difficulty: 2,
      created_at: new Date().toISOString(),
    },
  ],
  'plumbing-arithmetic': [
    {
      id: '3',
      topic_id: '2',
      type: 'calculation',
      front_content: 'A 4-inch pipe is installed with a slope of 1/8 inch per foot. What is the total fall in inches for a 60-foot run?',
      back_content: '7.5 inches',
      formula: 'Total Fall = Run × Slope',
      explanation: '60 ft × 0.125 (1/8) = 7.5 inches.',
      steps: [
        { step: 'Identify values: Run = 60ft, Slope = 1/8"/ft', explanation: '' },
        { step: 'Apply formula: 60 × 0.125 = 7.5 inches', explanation: '' },
      ],
      difficulty: 1,
      created_at: new Date().toISOString(),
    },
  ],
  'sanitation-design': [
    {
      id: '4',
      topic_id: '3',
      type: 'scenario',
      front_content: 'Why is an air gap preferred over a backflow preventer for a food prep sink?',
      back_content: 'Absolute protection',
      explanation: 'An air gap provides a physical separation that cannot fail mechanically, unlike valves. It is the most secure method against back-siphonage.',
      code_reference: 'IPC 608.15.1',
      difficulty: 2,
      created_at: new Date().toISOString(),
    },
  ],
  'practical-problems': [
    {
      id: '5',
      topic_id: '4',
      type: 'scenario',
      front_content: 'A customer complains of sewer smell in a spare bathroom used rarely. What is the most likely simple cause?',
      back_content: 'Dry Trap Seal',
      explanation: 'Water in the P-trap evaporates over time if not replenished. The seal breaks, allowing sewer gas to enter. Solution: Pour water down the drain.',
      difficulty: 1,
      created_at: new Date().toISOString(),
    },
  ],
};

const subjectInfo: Record<string, Subject> = {
  'plumbing-code': {
    id: '1', name: 'Plumbing Code', slug: 'plumbing-code',
    description: 'Venting, drainage, traps & materials.',
    icon: '📜', color: '#5D866C', display_order: 1, created_at: ''
  },
  'plumbing-arithmetic': {
    id: '2', name: 'Plumbing Arithmetic', slug: 'plumbing-arithmetic',
    description: 'Pipe sizing, pressures, fixture units.',
    icon: '🔢', color: '#C2A68C', display_order: 2, created_at: ''
  },
  'sanitation-design': {
    id: '3', name: 'Sanitation & Design', slug: 'sanitation-design',
    description: 'System layout, flow, wastewater safety.',
    icon: '🏗️', color: '#5D866C', display_order: 3, created_at: ''
  },
  'practical-problems': {
    id: '4', name: 'Practical Problems', slug: 'practical-problems',
    description: 'Troubleshooting scenarios & job-site logic.',
    icon: '🔧', color: '#C2A68C', display_order: 4, created_at: ''
  },
};

export default function StudyPage() {
  const params = useParams();
  const subjectSlug = params.subject as string;
  const subject = subjectInfo[subjectSlug];
  const flashcards = demoFlashcards[subjectSlug] || [];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const currentCard = flashcards[currentIndex];

  const handleFlip = () => {
    if (currentCard?.type === 'multiple_choice' && !showResult) return;
    setIsFlipped(!isFlipped);
  };

  const handleChoice = (index: number) => {
    if (showResult) return;
    setSelectedChoice(index);
    setShowResult(true);
  };

  const handleAnswer = useCallback((correct: boolean) => {
    setSessionStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
    }));

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      setSelectedChoice(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, flashcards.length]);

  const resetSession = () => {
    setCurrentIndex(0);
    setSessionStats({ correct: 0, incorrect: 0 });
    setIsComplete(false);
    setIsFlipped(false);
    setSelectedChoice(null);
    setShowResult(false);
  };

  if (!subject) {
    return (
      <div className="text-center animate-fade-in">
        <h1 className="text-2xl font-semibold mb-4">Subject Not Found</h1>
        <Link href="/" className="btn btn-primary">← Back to Home</Link>
      </div>
    );
  }

  if (isComplete) {
    const accuracy = Math.round((sessionStats.correct / flashcards.length) * 100);
    return (
      <div className="text-center animate-fade-in">
        <h1 className="text-2xl font-semibold mb-2">🎉 Session Complete!</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          You&apos;ve reviewed all cards in this subject.
        </p>
        
        <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-forest)' }}>
            {accuracy}%
          </div>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>Accuracy</p>
          
          <div className="grid-2 mb-6">
            <div className="p-4 rounded-lg" style={{ background: 'var(--color-cream)' }}>
              <div className="text-2xl font-semibold" style={{ color: 'var(--color-forest)' }}>{sessionStats.correct}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Correct</div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'var(--color-cream)' }}>
              <div className="text-2xl font-semibold" style={{ color: 'var(--color-danger)' }}>{sessionStats.incorrect}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Need Review</div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="btn btn-primary flex-grow" onClick={resetSession}>
              Study Again
            </button>
            <Link href="/" className="btn btn-secondary">
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <Link href="/" className="text-xs flex items-center gap-1 mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            ← Back to Dashboard
          </Link>
          <h2 className="text-xl font-semibold tracking-tight">{subject.name}</h2>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <span className="stat-badge">
            Card {currentIndex + 1} / {flashcards.length}
          </span>
        </div>
      </div>

      {/* Flashcard */}
      {currentCard && (
        <>
          {currentCard.type === 'multiple_choice' && currentCard.choices ? (
            // Multiple Choice Card
            <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
              <span className="text-xs uppercase tracking-widest mb-4 block" style={{ color: 'var(--color-text-muted)' }}>
                Multiple Choice
              </span>
              
              <h3 className="text-lg font-medium mb-6">{currentCard.front_content}</h3>
              
              <div className="flex flex-col gap-3 mb-6">
                {currentCard.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleChoice(index)}
                    disabled={showResult}
                    className="w-full text-left px-4 py-3 rounded-lg border transition"
                    style={{
                      background: showResult 
                        ? choice.isCorrect 
                          ? 'rgba(93, 134, 108, 0.1)' 
                          : selectedChoice === index 
                            ? 'rgba(220, 38, 38, 0.1)' 
                            : 'white'
                        : selectedChoice === index 
                          ? 'var(--color-cream)' 
                          : 'white',
                      borderColor: showResult
                        ? choice.isCorrect
                          ? 'var(--color-forest)'
                          : selectedChoice === index
                            ? 'var(--color-danger)'
                            : 'var(--color-sand)'
                        : 'var(--color-sand)',
                      cursor: showResult ? 'default' : 'pointer',
                    }}
                  >
                    <span style={{ opacity: 0.5, marginRight: '0.5rem' }}>
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {choice.text}
                  </button>
                ))}
              </div>
              
              {showResult && (
                <div className="animate-fade-in">
                  <div className="p-4 rounded-lg mb-4" style={{ background: 'var(--color-cream)' }}>
                    <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                      Explanation
                    </div>
                    <p className="text-sm">{currentCard.explanation}</p>
                    {currentCard.code_reference && (
                      <p className="text-xs mt-2" style={{ color: 'var(--color-forest)' }}>
                        Ref: {currentCard.code_reference}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid-2 gap-3">
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => handleAnswer(false)}
                    >
                      Needs Review
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleAnswer(true)}
                    >
                      Got It ✓
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Flip Card (Recall / Scenario / Calculation)
            <div className="flashcard-container" onClick={handleFlip}>
              <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
                {/* Front */}
                <div className="flashcard-face flashcard-front">
                  <span className="text-xs uppercase tracking-widest absolute top-6 left-6" style={{ color: 'var(--color-text-muted)' }}>
                    {currentCard.type === 'calculation' ? 'Calculation' : currentCard.type}
                  </span>
                  
                  <h3 className="text-lg font-medium">{currentCard.front_content}</h3>
                  
                  {currentCard.formula && (
                    <div className="mt-4 px-4 py-2 rounded-lg font-mono text-sm" style={{ background: 'var(--color-cream)', border: '1px solid var(--color-sand)' }}>
                      {currentCard.formula}
                    </div>
                  )}
                  
                  <p className="text-xs absolute bottom-6" style={{ color: 'var(--color-text-muted)' }}>
                    Tap to reveal answer
                  </p>
                </div>
                
                {/* Back */}
                <div className="flashcard-face flashcard-back">
                  <span className="text-xs uppercase tracking-widest" style={{ color: '#9CA3AF' }}>
                    Answer
                  </span>
                  
                  <div className="flex-grow overflow-y-auto no-scrollbar mt-4">
                    <h4 className="text-lg font-semibold mb-3">{currentCard.back_content}</h4>
                    <p className="text-sm mb-4" style={{ color: '#D1D5DB' }}>{currentCard.explanation}</p>
                    
                    {currentCard.code_reference && (
                      <div className="p-3 rounded-lg" style={{ background: '#1F2937', border: '1px solid #374151' }}>
                        <span className="text-xs uppercase tracking-wider block mb-1" style={{ color: '#6B7280' }}>Reference</span>
                        <p className="text-xs font-mono" style={{ color: 'var(--color-sand)' }}>{currentCard.code_reference}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid-2 gap-3 mt-4 pt-4" style={{ borderTop: '1px solid #374151' }} onClick={e => e.stopPropagation()}>
                    <button 
                      className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition"
                      style={{ background: '#374151', border: '1px solid #4B5563' }}
                      onClick={() => handleAnswer(false)}
                    >
                      Needs Review
                    </button>
                    <button 
                      className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition"
                      style={{ background: 'white', color: 'black' }}
                      onClick={() => handleAnswer(true)}
                    >
                      Got It ✓
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      <p className="text-center text-xs mt-6" style={{ color: 'var(--color-text-muted)' }}>
        Keyboard: Space to flip, Left (Review), Right (Got it)
      </p>
    </div>
  );
}
