import { getSubjects } from '@/lib/data-service';
import { supabase } from '@/lib/supabase';
import FlashcardGenerator from '@/components/FlashcardGenerator';
import { createFlashcardsBatch } from '@/app/actions/flashcard-crud';

export default async function GeneratePage() {
  const subjects = await getSubjects();
  
  // Fetch all topics for the generator
  // We need a way to get all topics. data-service doesn't expose getAllTopics easily, 
  // but we can fetch them directly or add a method. For now, let's just fetch directly here or iterate subjects.
  // Actually, getFlashcardsBySubject gets topics nested.
  // Let's just do a direct supbase call here for simplicity as this is a server component page
  
  const { data: topics } = await supabase
    .from('topics')
    .select('*')
    .order('name');
    
  async function handleSave(cards: any[], topicId: string) {
    'use server';
    await createFlashcardsBatch(cards, topicId);
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Flashcard Generator</h1>
          <p className="mt-2 text-slate-600">
            Use AI to instantly create flashcards from your study materials.
          </p>
        </div>
        
        <FlashcardGenerator 
          subjects={subjects} 
          topics={topics || []} 
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
