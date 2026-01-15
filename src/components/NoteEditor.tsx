'use client';

import { useState, useEffect } from 'react';
import { FileText, Save, Trash2, Loader2, Edit3 } from 'lucide-react';
import { getNote, saveNote, deleteNote } from '@/app/actions/notes';

interface NoteEditorProps {
  flashcardId: string;
  compact?: boolean;
}

export default function NoteEditor({ flashcardId, compact = false }: NoteEditorProps) {
  const [note, setNote] = useState('');
  const [originalNote, setOriginalNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNote();
  }, [flashcardId]);

  const loadNote = async () => {
    setLoading(true);
    const existingNote = await getNote(flashcardId);
    if (existingNote) {
      setNote(existingNote.content);
      setOriginalNote(existingNote.content);
    } else {
      setNote('');
      setOriginalNote('');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!note.trim()) return;
    setSaving(true);
    const result = await saveNote(flashcardId, note.trim());
    if (result.success) {
      setOriginalNote(note.trim());
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    const success = await deleteNote(flashcardId);
    if (success) {
      setNote('');
      setOriginalNote('');
      setIsEditing(false);
    }
    setSaving(false);
  };

  const hasChanges = note !== originalNote;
  const hasNote = originalNote.trim().length > 0;

  if (loading) {
    return (
      <div className="text-xs text-gray-400 flex items-center gap-1">
        <Loader2 className="w-3 h-3 animate-spin" />
        Loading notes...
      </div>
    );
  }

  // Compact mode - just a button that expands
  if (compact && !isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
          ${hasNote 
            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' 
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
      >
        <FileText className="w-3.5 h-3.5" />
        {hasNote ? 'View Note' : 'Add Note'}
      </button>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-amber-700">
          <FileText className="w-4 h-4" />
          <span className="text-xs font-medium">Your Note</span>
        </div>
        {compact && (
          <button
            onClick={() => setIsEditing(false)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Close
          </button>
        )}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add your personal notes here..."
        className="w-full p-2 text-sm border border-amber-200 rounded bg-white resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
        rows={3}
      />

      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges || !note.trim()}
            className="flex items-center gap-1 px-3 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Save className="w-3 h-3" />
            )}
            Save
          </button>
          {hasNote && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex items-center gap-1 px-3 py-1 text-red-600 text-xs hover:bg-red-50 rounded disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          )}
        </div>
        {hasChanges && (
          <span className="text-xs text-amber-600">Unsaved changes</span>
        )}
      </div>
    </div>
  );
}
