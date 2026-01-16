'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flashcard, Topic } from '@/types';
import { getFlashcardsAdmin, deleteFlashcard, getTopics } from '@/app/actions/flashcard-crud';
import FlashcardForm from '@/components/FlashcardForm';
import { Plus, Search, Edit2, Trash2, Filter, X, Check, Loader2 } from 'lucide-react';

export default function CardManagerPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  
  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  useEffect(() => {
    loadData();
    loadTopics();
  }, []); // Initial load

  // Debounced search effect would go here in a larger app
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, filterTopic]);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getFlashcardsAdmin(search, filterTopic);
      // @ts-ignore - Supabase types join mismatch
      setCards(data || []);
    } catch (error) {
      console.error('Failed to load cards:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadTopics() {
    const data = await getTopics();
    setTopics(data);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this card?')) return;
    try {
      await deleteFlashcard(id);
      setCards(cards.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete card.');
    }
  }

  const handleEdit = (card: Flashcard) => {
    setEditingCard(card);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingCard(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingCard(null);
    loadData(); // Reload list
  };

  return (
    <div className="animate-fade-in pb-20">
      {/* Header */}
      <div className="mb-8">
        <Link href="/resources" className="text-xs flex items-center gap-1 mb-2 text-gray-500 hover:text-gray-700">
          ← Back to Resources
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
             <h1 className="text-2xl font-semibold tracking-tight">Flashcard Manager</h1>
             <p className="text-sm text-gray-500">Create, edit, and organize your study deck.</p>
          </div>
          <button 
             onClick={handleCreate}
             className="btn btn-primary flex items-center gap-2 shadow-lg shadow-forest/20"
          >
             <Plus className="w-4 h-4" /> New Card
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search card content..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-forest/20"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
        </div>
        <div>
            <select 
                className="w-full p-2 bg-white border border-gray-200 rounded-lg"
                value={filterTopic}
                onChange={e => setFilterTopic(e.target.value)}
            >
                <option value="">All Topics</option>
                {topics.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Card List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[300px]">
         {loading ? (
             <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
             </div>
         ) : cards.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Filter className="w-8 h-8 text-gray-300" />
                </div>
                <p>No cards found.</p>
             </div>
         ) : (
             <div className="divide-y divide-gray-100">
                {cards.map(card => (
                    <div key={card.id} className="p-4 hover:bg-gray-50 transition flex gap-4 group">
                        <div className="flex-shrink-0 pt-1">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border
                                ${card.type === 'calculation' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                  card.type === 'multiple_choice' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                  'bg-green-50 text-green-600 border-green-100'
                                }`}>
                                {card.type === 'multiple_choice' ? 'MCQ' : card.type}
                            </span>
                        </div>
                        <div className="flex-grow min-w-0">
                            <div className="text-sm font-medium text-gray-900 line-clamp-2 md:line-clamp-1 mb-1">
                                {card.front_content}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-3">
                                {/* @ts-ignore - joined data */}
                                <span className="font-medium text-gray-600">{card.topic?.name}</span>
                                <span>•</span>
                                <span className="truncate max-w-[200px]">{card.back_content || 'Check formula/choices'}</span>
                                {card.code_reference && (
                                    <>
                                        <span>•</span>
                                        <span className="font-mono text-[10px] bg-gray-100 px-1 rounded text-gray-700">{card.code_reference}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleEdit(card)}
                                className="p-2 text-gray-400 hover:text-forest hover:bg-forest/5 rounded-lg transition"
                                title="Edit"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => handleDelete(card.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
             </div>
         )}
      </div>

      {/* Edit/Create Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">
                        {editingCard ? 'Edit Flashcard' : 'Create New Flashcard'}
                    </h2>
                    <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6">
                    <FlashcardForm 
                        initialData={editingCard}
                        onSuccess={handleFormSuccess}
                        onCancel={() => setIsFormOpen(false)}
                    />
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
