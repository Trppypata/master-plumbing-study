'use client';

import { useState, useEffect } from 'react';
import { Quote, Sparkles, HandHeart } from 'lucide-react';

interface QuoteData {
  text: string;
  reference: string;
}

const FALLBACK_QUOTES: QuoteData[] = [
  { text: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13" },
  { text: "For I know the plans I have for you, plans to prosper you and not to harm you, plans to give you hope and a future.", reference: "Jeremiah 29:11" },
  { text: "Commit to the Lord whatever you do, and he will establish your plans.", reference: "Proverbs 16:3" },
  { text: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.", reference: "Colossians 3:23" },
  { text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.", reference: "Isaiah 40:31" },
];

export default function DailyQuote() {
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuote() {
      try {
        // Try multiple APIs or use fallback
        try {
            const res = await fetch('https://bible-api.com/?random=verse');
            if (res.ok) {
                const data = await res.json();
                setQuote({
                    text: data.text.trim(),
                    reference: `${data.reference}`,
                });
                return;
            }
        } catch (e) {
            console.warn('Failed to fetch from bible-api.com', e);
        }

        // Fallback to local
        const randomQuote = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
        setQuote(randomQuote);

      } catch (error) {
        console.error('Error in quote fetching:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuote();
  }, []);

  if (loading) {
    return (
      <div className="card h-full flex flex-col justify-center items-center p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="card h-full bg-gradient-to-br from-white to-[#FEFDF5] border-[var(--color-sand)] relative overflow-hidden group hover:shadow-md transition-all p-6">
       {/* Decorative Background Icon */}
       <div className="absolute right-4 top-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
            <Sparkles className="w-24 h-24 text-[var(--color-forest)]" />
       </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
           {/* Header */}
           <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-forest)]/10 flex items-center justify-center text-[var(--color-forest)]">
                <Quote className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Daily Inspiration</h3>
           </div>
           
           {/* Quote Text */}
           <p className="text-lg font-medium text-gray-800 italic leading-relaxed">
             &quot;{quote?.text}&quot;
           </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-[var(--color-sand)]/50">
           <span className="text-sm font-semibold text-[var(--color-forest)]">
             {quote?.reference}
           </span>
           <button className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-forest)] transition-colors group/btn">
             <HandHeart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
             <span>Amen</span>
           </button>
        </div>
      </div>
    </div>
  );
}

