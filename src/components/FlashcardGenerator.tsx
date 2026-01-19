'use client';

import { useState, useEffect } from 'react';
import { FileText, Upload, Sparkles, Loader2, Save, Database } from 'lucide-react';
import { Subject, Topic } from '@/types';
import { getDocuments, DocumentInfo } from '@/app/actions/upload-document';

interface GeneratedFlashcard {
  front: string;
  back: string;
  explanation?: string;
}

interface FlashcardGeneratorProps {
  subjects: Subject[];
  topics: Topic[];
  onSave: (cards: GeneratedFlashcard[], topicId: string) => Promise<void>;
}

export default function FlashcardGenerator({ subjects, topics, onSave }: FlashcardGeneratorProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'file' | 'resources'>('text');
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<GeneratedFlashcard[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const filteredTopics = topics.filter(t => t.subject_id === selectedSubject);

  useEffect(() => {
    if (activeTab === 'resources' && documents.length === 0) {
      getDocuments().then(setDocuments).catch(console.error);
    }
  }, [activeTab]);

  const handleGenerate = async () => {
    if (!textInput && !file && !selectedDocumentId) return;
    setIsGenerating(true);

    try {
      const formData = new FormData();
      if (activeTab === 'text') {
        formData.append('text', textInput);
      } else if (activeTab === 'file' && file) {
        formData.append('file', file);
      } else if (activeTab === 'resources' && selectedDocumentId) {
        formData.append('documentId', selectedDocumentId);
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      setGeneratedCards(data.flashcards);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert('Failed to generate flashcards. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedTopic || generatedCards.length === 0) return;
    setIsSaving(true);
    try {
      await onSave(generatedCards, selectedTopic);
      setGeneratedCards([]);
      setTextInput('');
      setFile(null);
      setSelectedDocumentId('');
      alert('Flashcards saved successfully!');
    } catch (error) {
      console.error('Error saving cards:', error);
      alert('Failed to save cards.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          AI Flashcard Generator
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Generate flashcards automatically from your notes, PDFs, or Knowledge Base.
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Input Method Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('text')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'text'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Text Input
            </div>
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'file'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              PDF Upload
            </div>
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'resources'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Resources (RAG)
            </div>
          </button>
        </div>

        {/* Input Area */}
        <div className="space-y-4">
          {activeTab === 'text' && (
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your notes or text content here..."
              className="w-full h-48 p-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          )}

          {activeTab === 'file' && (
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors relative">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-medium text-slate-900">
                  {file ? file.name : 'Click or drop PDF here'}
                </p>
                <p className="text-xs text-slate-500">Supported format: .pdf</p>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
             <div className="space-y-3">
               <label className="block text-sm font-medium text-slate-700">Select a Document from Knowledge Base</label>
               {documents.length > 0 ? (
                 <div className="grid gap-2 max-h-60 overflow-y-auto">
                   {documents.map((doc) => (
                     <div 
                       key={doc.id}
                       onClick={() => setSelectedDocumentId(doc.id)}
                       className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between hover:border-indigo-500 transition-colors ${
                         selectedDocumentId === doc.id ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-200'
                       }`}
                     >
                       <div className="flex items-center gap-3">
                         <div className="bg-white p-2 rounded border border-slate-200 text-red-500">
                           <FileText className="w-5 h-5" />
                         </div>
                         <div>
                           <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                           <p className="text-xs text-slate-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
                         </div>
                       </div>
                       {selectedDocumentId === doc.id && (
                         <div className="text-indigo-600">
                           <Sparkles className="w-4 h-4" />
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center p-8 bg-slate-50 rounded-lg text-slate-500">
                   No documents found in your Knowledge Base.
                 </div>
               )}
             </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || (
                (activeTab === 'text' && !textInput) ||
                (activeTab === 'file' && !file) ||
                (activeTab === 'resources' && !selectedDocumentId)
              )}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Flashcards
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Cards Preview */}
        {generatedCards.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-slate-200">
            <h3 className="font-medium text-slate-900">Generated Flashcards ({generatedCards.length})</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {generatedCards.map((card, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Front</span>
                    <p className="mt-1 text-sm text-slate-900">{card.front}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-200">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Back</span>
                    <p className="mt-1 text-sm text-slate-900">{card.back}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Save Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-end bg-slate-50 p-4 rounded-lg">
              <div className="flex-1 w-full space-y-4 sm:space-y-0 sm:flex sm:gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value);
                      setSelectedTopic('');
                    }}
                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    disabled={!selectedSubject}
                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <option value="">Select Topic</option>
                    {filteredTopics.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving || !selectedTopic}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save to Deck
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
