'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Trash2, Sparkles, X } from 'lucide-react';
import { uploadDocument, getDocuments, deleteDocument, DocumentInfo } from '@/app/actions/upload-document';
import { createFlashcardsBatch } from '@/app/actions/flashcard-crud';
import { Subject, Topic } from '@/types';

interface DocumentUploaderProps {
  onUploadComplete?: () => void;
  subjects: Subject[];
  topics: Topic[];
}

export default function DocumentUploader({ onUploadComplete, subjects, topics }: DocumentUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-Generate State
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredTopics = topics.filter(t => t.subject_id === selectedSubject);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const generateFlashcards = async (documentId: string, topicId: string) => {
    try {
      setIsGenerating(true);
      const formData = new FormData();
      formData.append('documentId', documentId);

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      
      if (data.flashcards && data.flashcards.length > 0) {
        await createFlashcardsBatch(data.flashcards, topicId);
        return { success: true, count: data.flashcards.length };
      }
      return { success: false, count: 0 };
    } catch (error) {
      console.error('Auto-generation error:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFile = async (file: File) => {
    if (autoGenerate && !selectedTopic) {
      alert('Please select a topic for auto-generation');
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await uploadDocument(formData);
      
      if (result.success) {
        let message = result.message;
        
        // Handle Auto-Generation
        if (autoGenerate && result.documentId && selectedTopic) {
          setUploadStatus({ type: 'success', message: 'Document uploaded. Generating flashcards...' });
          try {
            const genResult = await generateFlashcards(result.documentId, selectedTopic);
            if (genResult.success) {
               message = `Uploaded and generated ${genResult.count} flashcards!`;
            }
          } catch (e) {
            message = 'Uploaded but failed to generate flashcards.';
          }
        }

        setUploadStatus({ type: 'success', message });
        onUploadComplete?.();
      } else {
        setUploadStatus({ type: 'error', message: result.message });
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Upload failed. Please try again.' });
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Auto-Generate Controls */}
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={autoGenerate}
            onChange={(e) => setAutoGenerate(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-slate-700">Auto-generate flashcards on upload</span>
        </label>

        {autoGenerate && (
          <div className="grid grid-cols-2 gap-3 pl-6 animate-in fade-in slide-in-from-top-2 duration-200">
             <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedTopic('');
                }}
                className="text-xs w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Subject</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                disabled={!selectedSubject}
                className="text-xs w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="">Select Topic</option>
                {filteredTopics.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
          </div>
        )}
      </div>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${dragActive 
            ? 'border-forest bg-forest/5' 
            : 'border-gray-200 hover:border-forest/50 hover:bg-gray-50'
          }
          ${isUploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt"
          onChange={handleChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-forest animate-spin" />
            <p className="text-sm text-gray-600">
               {isGenerating ? 'Generating flashcards...' : 'Processing document...'}
            </p>
            <p className="text-xs text-gray-400">This may take a moment</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-forest/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-forest" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Drop your document here or <span className="text-forest">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supports PDF and TXT files
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Status Message */}
      {uploadStatus && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          uploadStatus.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {uploadStatus.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          {uploadStatus.message}
        </div>
      )}
    </div>
  );
}

// Document List Component
export function DocumentList({ 
  documents, 
  onDelete,
  subjects,
  topics
}: { 
  documents: DocumentInfo[]; 
  onDelete?: (id: string) => void;
  subjects: Subject[];
  topics: Topic[];
}) {
  const [deleting, setDeleting] = useState<string | null>(null);
  
  // Generation Modal State
  const [generationDoc, setGenerationDoc] = useState<string | null>(null);
  const [genSubject, setGenSubject] = useState('');
  const [genTopic, setGenTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter topics for modal
  const filteredTopics = topics.filter(t => t.subject_id === genSubject);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const success = await deleteDocument(id);
    if (success) {
      onDelete?.(id);
    }
    setDeleting(null);
  };

  const handleMagicGenerate = async () => {
    if (!generationDoc || !genTopic) return;
    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append('documentId', generationDoc);

      // Call API
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Generation failed');
      const data = await response.json();
      
      // Save Cards
      if (data.flashcards && data.flashcards.length > 0) {
        await createFlashcardsBatch(data.flashcards, genTopic);
        alert(`Successfully generated ${data.flashcards.length} flashcards!`);
        // Close modal
        setGenerationDoc(null);
        setGenSubject('');
        setGenTopic('');
      } else {
        alert('AI generated no content. Try a different file.');
      }

    } catch (e) {
      console.error(e);
      alert('Failed to generate flashcards.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No documents uploaded yet. Upload a PDF or text file to get started.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg group"
          >
            <div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-forest" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
              <p className="text-xs text-gray-400">
                {doc.status === 'ready' && `${doc.totalChunks} chunks indexed`}
                {doc.status === 'processing' && 'Processing...'}
                {doc.status === 'error' && (doc.errorMessage || 'Error')}
                {doc.status === 'pending' && 'Pending...'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {doc.status === 'ready' && (
                 <button
                   onClick={() => setGenerationDoc(doc.id)}
                   className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                   title="Generate Flashcards"
                 >
                   <Sparkles className="w-4 h-4" />
                 </button>
              )}
              
              <button
                onClick={() => handleDelete(doc.id)}
                disabled={deleting === doc.id}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                {deleting === doc.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Generation Modal */}
      {generationDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
               <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-indigo-600" />
                 Generate Flashcards
               </h3>
               <button 
                 onClick={() => setGenerationDoc(null)}
                 className="text-slate-400 hover:text-slate-600"
               >
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="p-6 space-y-4">
               <p className="text-sm text-slate-600">
                 Select where you want to save the new flashcards generated from this document.
               </p>

               <div className="space-y-3">
                   <div>
                     <label className="block text-xs font-medium text-slate-700 mb-1">Subject</label>
                     <select
                        value={genSubject}
                        onChange={(e) => {
                          setGenSubject(e.target.value);
                          setGenTopic('');
                        }}
                        className="w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                   </div>
                   <div>
                     <label className="block text-xs font-medium text-slate-700 mb-1">Topic</label>
                     <select
                        value={genTopic}
                        onChange={(e) => setGenTopic(e.target.value)}
                        disabled={!genSubject}
                        className="w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        <option value="">Select Topic</option>
                        {filteredTopics.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                   </div>
               </div>

               <div className="pt-2 flex justify-end gap-3">
                 <button
                   onClick={() => setGenerationDoc(null)}
                   className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={handleMagicGenerate}
                   disabled={isGenerating || !genTopic}
                   className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                 >
                   {isGenerating && <Loader2 className="w-3 h-3 animate-spin" />}
                   Generate
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}
    </>
  );
}
