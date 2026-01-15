'use client';

import { useState } from 'react';
import { Flashcard as FlashcardType, Choice } from '@/types';
import SpeakButton from '@/components/ui/SpeakButton';

interface FlashcardProps {
  card: FlashcardType;
  onAnswer: (correct: boolean) => void;
  showKeyboardHints?: boolean;
}

export default function Flashcard({ card, onAnswer, showKeyboardHints = true }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleFlip = () => {
    if (card.type === 'recall' || card.type === 'scenario') {
      setIsFlipped(!isFlipped);
    }
  };

  const handleChoice = (index: number) => {
    if (showResult) return;
    setSelectedChoice(index);
    setShowResult(true);
  };

  const handleGotIt = () => {
    onAnswer(true);
    resetCard();
  };

  const handleNeedsReview = () => {
    onAnswer(false);
    resetCard();
  };

  const resetCard = () => {
    setIsFlipped(false);
    setSelectedChoice(null);
    setShowResult(false);
  };

  // Keyboard navigation
  if (typeof window !== 'undefined') {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === '1' && isFlipped) {
        handleGotIt();
      } else if (e.key === '2' && isFlipped) {
        handleNeedsReview();
      }
    };

    // This would be in useEffect, simplified for component example
  }

  if (card.type === 'multiple_choice' && card.choices) {
    return (
      <div className="flashcard-mcq animate-fade-in">
        <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="flex justify-between items-start mb-md">
            <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Multiple Choice</span>
            <SpeakButton text={card.front_content} />
          </div>
          <div className="flashcard-content mb-xl">
            <p>{card.front_content}</p>
          </div>
          
          <div className="flex flex-col gap-md">
            {card.choices.map((choice: Choice, index: number) => (
              <button
                key={index}
                className={`choice-option ${
                  selectedChoice === index ? 'selected' : ''
                } ${
                  showResult && choice.isCorrect ? 'correct' : ''
                } ${
                  showResult && selectedChoice === index && !choice.isCorrect ? 'incorrect' : ''
                }`}
                onClick={() => handleChoice(index)}
                disabled={showResult}
              >
                <span style={{ marginRight: '0.5rem', opacity: 0.5 }}>
                  {String.fromCharCode(65 + index)}.
                </span>
                {choice.text}
              </button>
            ))}
          </div>

          {showResult && (
            <div className="mt-xl animate-slide-up">
              {card.explanation && (
                <div className="card" style={{ background: 'var(--color-bg)' }}>
                  <h4 className="mb-sm">💡 Explanation</h4>
                  <p className="text-secondary">{card.explanation}</p>
                  {card.common_mistake && (
                    <p className="mt-md text-danger">
                      ⚠️ Common Mistake: {card.common_mistake}
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex justify-center gap-lg mt-lg">
                <button className="btn btn-success" onClick={handleGotIt}>
                  ✓ Got it
                </button>
                <button className="btn btn-danger" onClick={handleNeedsReview}>
                  ✗ Needs Review
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Calculation card
  if (card.type === 'calculation' && card.steps) {
    return (
      <div className="flashcard-calculation animate-fade-in">
        <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="flex justify-between items-start mb-md">
            <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Calculation</span>
            <SpeakButton text={`${card.front_content}. Formula: ${card.formula || ''}`} />
          </div>
          <div className="flashcard-content mb-xl">
            <p>{card.front_content}</p>
            {card.formula && (
              <div className="mt-lg" style={{ 
                background: 'var(--color-bg)', 
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'monospace'
              }}>
                📐 {card.formula}
              </div>
            )}
          </div>

          {!isFlipped ? (
            <button className="btn btn-primary btn-lg" onClick={handleFlip}>
              Show Solution
            </button>
          ) : (
            <div className="animate-slide-up">
              <h4 className="mb-lg">Step-by-step Solution:</h4>
              <div className="flex flex-col gap-md">
                {card.steps.map((step, index) => (
                  <div key={index} className="flex gap-md items-start">
                    <span className="stat-badge">{index + 1}</span>
                    <div>
                      <p style={{ fontWeight: 500 }}>{step.step}</p>
                      {step.explanation && (
                        <p className="text-secondary text-sm mt-sm">{step.explanation}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-lg" style={{ 
                background: 'rgba(16, 185, 129, 0.1)', 
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '4px solid var(--color-success)'
              }}>
                <strong>Answer:</strong> {card.back_content}
              </div>

              <div className="flex justify-center gap-lg mt-xl">
                <button className="btn btn-success" onClick={handleGotIt}>
                  ✓ Got it
                </button>
                <button className="btn btn-danger" onClick={handleNeedsReview}>
                  ✗ Needs Review
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default recall/scenario card with flip animation
  return (
    <div className="animate-fade-in">
      <div className="flashcard-container" onClick={handleFlip}>
        <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
          <div className="flashcard-face front">
            <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
              <SpeakButton text={card.front_content} label="" />
            </div>
            <div className="flashcard-content">
              {card.front_content}
            </div>
            <p className="text-muted mt-lg" style={{ fontSize: '0.875rem' }}>
              Click or press Space to flip
            </p>
          </div>
          
          <div className="flashcard-face back">
            <div className="flashcard-content">
              {card.back_content}
            </div>
            
            {card.explanation && (
              <div className="mt-lg text-secondary" style={{ fontSize: '0.9rem' }}>
                💡 {card.explanation}
              </div>
            )}
            
            {card.code_reference && (
              <div className="mt-md stat-badge">
                📜 {card.code_reference}
              </div>
            )}
          </div>
        </div>
      </div>

      {isFlipped && (
        <div className="flex justify-center gap-lg mt-xl animate-fade-in">
          <button className="btn btn-success btn-lg" onClick={handleGotIt}>
            ✓ Got it
          </button>
          <button className="btn btn-danger btn-lg" onClick={handleNeedsReview}>
            ✗ Needs Review
          </button>
        </div>
      )}

      {showKeyboardHints && (
        <div className="keyboard-hint">
          <span><kbd>Space</kbd> Flip</span>
          <span><kbd>1</kbd> Got it</span>
          <span><kbd>2</kbd> Review</span>
        </div>
      )}
    </div>
  );
}
