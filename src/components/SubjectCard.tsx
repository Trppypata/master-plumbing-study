'use client';

import { Subject, SubjectStats } from '@/types';
import ProgressRing from './ProgressRing';

interface SubjectCardProps {
  stats: SubjectStats;
  onClick?: () => void;
}

export default function SubjectCard({ stats, onClick }: SubjectCardProps) {
  const { subject, totalCards, mastered, needsReview, progressPercent } = stats;
  
  return (
    <div 
      className="card subject-card" 
      style={{ '--subject-color': subject.color } as React.CSSProperties}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <div className="flex justify-between items-start">
        <div>
          <span className="subject-icon">{subject.icon}</span>
          <h3 className="mt-md">{subject.name}</h3>
          <p className="text-secondary mt-sm" style={{ fontSize: '0.9rem' }}>
            {subject.description}
          </p>
        </div>
        
        <ProgressRing 
          progress={progressPercent} 
          size={80} 
          strokeWidth={6}
          color={subject.color}
          showLabel={false}
        />
      </div>
      
      <div className="flex gap-md mt-lg" style={{ flexWrap: 'wrap' }}>
        <span className="stat-badge">
          📚 {totalCards} cards
        </span>
        <span className="stat-badge" style={{ color: 'var(--color-success)' }}>
          ✓ {mastered} mastered
        </span>
        {needsReview > 0 && (
          <span className="stat-badge" style={{ color: 'var(--color-danger)' }}>
            ⟳ {needsReview} to review
          </span>
        )}
      </div>
      
      <div className="progress-bar mt-lg">
        <div 
          className="progress-bar-fill" 
          style={{ 
            width: `${progressPercent}%`,
            background: `linear-gradient(90deg, ${subject.color}, ${subject.color}88)`
          }} 
        />
      </div>
      
      {onClick && (
        <button 
          className="btn btn-primary mt-lg"
          style={{ width: '100%' }}
        >
          Start Studying →
        </button>
      )}
    </div>
  );
}
