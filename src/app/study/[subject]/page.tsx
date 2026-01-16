'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Flashcard as FlashcardType, Subject, FlashcardWithProgress } from '@/types';
import { getSubjectBySlug, getFlashcardsBySubject, updateProgress } from '@/lib/data-service';
import Flashcard from '@/components/Flashcard';

export default function StudyPage() {
  const params = useParams();
  const subjectSlug = params.subject as string;
  
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardWithProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });

  useEffect(() => {
    async function loadStudyData() {
      try {
        const [subjData, cardsData] = await Promise.all([
          getSubjectBySlug(subjectSlug),
          getFlashcardsBySubject(subjectSlug)
        ]);
        
        setSubject(subjData);
        setFlashcards(cardsData);
      } catch (error) {
        console.error('Error loading study data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadStudyData();
  }, [subjectSlug]);

  const handleAnswer = useCallback(async (correct: boolean) => {
    const currentCard = flashcards[currentIndex];
    if (!currentCard) return;

    // Record progress in background
    updateProgress(currentCard.id, correct).catch(err => {
      console.error('Error updating progress:', err);
    });

    setSessionStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
    }));

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, flashcards]);

  const resetSession = () => {
    setCurrentIndex(0);
    setSessionStats({ correct: 0, incorrect: 0 });
    setIsComplete(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-forest font-medium">Loading cards...</div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h1 className="text-2xl font-semibold mb-4 text-gray-900">Subject Not Found</h1>
        <p className="text-gray-500 mb-8">The subject you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/" className="px-6 py-2 bg-forest text-white rounded-lg">← Back to Home</Link>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h1 className="text-2xl font-semibold mb-4 text-gray-900">No Cards Yet</h1>
        <p className="text-gray-500 mb-8">This module doesn&apos;t have any flashcards yet. Check back soon!</p>
        <Link href="/" className="px-6 py-2 bg-forest text-white rounded-lg">← Back to Home</Link>
      </div>
    );
  }

  if (isComplete) {
    const accuracy = Math.round((sessionStats.correct / flashcards.length) * 100);
    return (
      <div className="text-center animate-fade-in max-w-md mx-auto py-10">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Session Complete! 🎉</h1>
        <p className="text-sm mb-10 text-gray-500">
          You&apos;ve reviewed all {flashcards.length} cards in {subject.name}.
        </p>
        
        <div className="bg-white border border-sand rounded-2xl p-8 shadow-sm">
          <div className="text-6xl font-black mb-2 text-forest">
            {accuracy}%
          </div>
          <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-8">Accuracy Score</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-[#F0FDF4] border border-forest/10">
              <div className="text-2xl font-bold text-forest">{sessionStats.correct}</div>
              <div className="text-[10px] uppercase font-bold text-forest/70">Correct</div>
            </div>
            <div className="p-4 rounded-xl bg-red-50 border border-red-100">
              <div className="text-2xl font-bold text-red-600">{sessionStats.incorrect}</div>
              <div className="text-[10px] uppercase font-bold text-red-400">Review</div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <button 
              className="w-full py-3 bg-forest text-white font-bold rounded-xl shadow-md hover:bg-forest/90 transition"
              onClick={resetSession}
            >
              Study Again
            </button>
            <Link 
              href="/" 
              className="w-full py-3 bg-white border border-sand text-gray-600 font-bold rounded-xl hover:bg-cream transition"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Link href="/" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-forest transition flex items-center gap-1 mb-2">
            ← Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 bg-cream rounded-xl border border-sand">{subject.icon}</span>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">{subject.name}</h2>
          </div>
        </div>
        
        <div className="bg-white border border-sand px-4 py-2 rounded-full shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          <div className="w-32 h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="h-full bg-forest rounded-full transition-all duration-300" 
              style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Flashcard Component */}
      <div className="max-w-2xl mx-auto">
        {currentCard && (
          <Flashcard 
            card={currentCard} 
            onAnswer={handleAnswer} 
          />
        )}
        
        <div className="mt-12 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">
            Study Session • Single User Mode
          </p>
        </div>
      </div>
    </div>
  );
}
