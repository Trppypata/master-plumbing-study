'use client';

import React from 'react';

export default function ReviewButton({ onClick }: { onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="inline-flex overflow-hidden group text-sm font-medium text-white rounded-2xl pt-3 pr-5 pb-3 pl-5 relative gap-x-2 gap-y-2 items-center w-full justify-center shadow-lg transform transition-all active:scale-95"
      style={{
        background: 'linear-gradient(135deg, rgb(26, 26, 26) 0%, rgb(10, 10, 10) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        // Keeping original boxShadow and height from nm.html
        boxShadow: 'rgba(0, 0, 0, 0.4) 0px 8px 32px, rgba(255, 255, 255, 0.1) 0px 1px 0px inset, rgba(0, 0, 0, 0.5) 0px -1px 0px inset',
        height: '60px',
      }}
    >
      {/* Background Animation Container */}
      <div 
        className="absolute inset-0 z-[1] bg-transparent opacity-100 pointer-events-none"
        style={{
          mask: 'repeating-linear-gradient(90deg, transparent 0, transparent 6px, black 7px, black 8px)',
          WebkitMask: 'repeating-linear-gradient(90deg, transparent 0, transparent 6px, black 7px, black 8px)'
        }}
      >
        <div 
          className="absolute inset-0 w-full h-full animate-[opacity-animation_4s_infinite_alternate]"
          style={{
             backgroundImage: `
                radial-gradient(circle at 50% 50%, #f43f5e 0%, transparent 50%), 
                radial-gradient(circle at 45% 45%, #ef4444 0%, transparent 45%), 
                radial-gradient(circle at 55% 55%, #fb7185 0%, transparent 45%), 
                radial-gradient(circle at 45% 55%, #f87171 0%, transparent 45%), 
                radial-gradient(circle at 55% 45%, #dc2626 0%, transparent 45%)
             `,
             mask: 'radial-gradient(circle at 50% 50%, transparent 0%, transparent 10%, black 25%)',
             WebkitMask: 'radial-gradient(circle at 50% 50%, transparent 0%, transparent 10%, black 25%)',
             animation: 'transform-animation 2s infinite alternate, opacity-animation 4s infinite',
             filter: 'drop-shadow(0 0 8px rgba(244, 63, 94, 0.6))'
          }}
        ></div>
      </div>

      {/* Text Content */}
      <span className="relative z-[2] font-semibold text-white flex gap-1 tracking-wide items-center">
        {/* Animated Letters */}
        {['S','t','a','r','t', ' ', 'D','a','i','l','y', ' ', 'R','e','v','i','e','w'].map((char, i) => (
             char === ' ' ? <span key={i} className="w-1"></span> : 
             <span key={i} className="animate-[letter-anim_4s_infinite_linear]" style={{ animationDelay: `${0.1 * i}s` }}>{char}</span>
        ))}
      </span>
      
      <style jsx>{`
        @keyframes transform-animation {
          0% { transform: translate(-55%); }
          100% { transform: translate(55%); }
        }
        @keyframes opacity-animation {
          0%, 100% { opacity: 0; }
          15% { opacity: 1; }
          65% { opacity: 0; }
        }
        @keyframes letter-anim {
          0% { opacity: 0.9; } 
          5% { opacity: 1; text-shadow: 0 0 8px #f43f5e; transform: scale(1.1) translateY(-2px); color: #fff; }
          20% { opacity: 0.7; color: #ccc; transform: none; }
          100% { opacity: 0.9; }
        }
      `}</style>
    </button>
  );
}
