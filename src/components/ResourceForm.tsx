'use client';

import { useState } from 'react';
import { Plus, Link, FileText, Loader2, X } from 'lucide-react';
import { createResource } from '@/app/actions/resources';

interface ResourceFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ICONS = ['📚', '📄', '🔗', '📐', '🧮', '📋', '💡', '⚠️', '✅', '🔧'];
const CATEGORIES = ['general', 'formulas', 'codes', 'tips', 'links', 'practice'];

export default function ResourceForm({ onSuccess, onCancel }: ResourceFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('general');
  const [icon, setIcon] = useState('📚');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    setError('');

    const result = await createResource({
      title: title.trim(),
      description: description.trim() || undefined,
      url: url.trim() || undefined,
      category,
      icon,
    });

    if (result.success) {
      setTitle('');
      setDescription('');
      setUrl('');
      setCategory('general');
      setIcon('📚');
      setIsOpen(false);
      onSuccess?.();
    } else {
      setError(result.error || 'Failed to create resource');
    }
    setSaving(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-forest text-white rounded-lg hover:bg-forest/90 transition text-sm font-medium"
      >
        <Plus className="w-4 h-4" />
        Add Resource
      </button>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Add New Resource</h3>
        <button
          onClick={() => { setIsOpen(false); onCancel?.(); }}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Icon Picker */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Icon</label>
          <div className="flex gap-1 flex-wrap">
            {ICONS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={`w-8 h-8 rounded flex items-center justify-center text-lg transition
                  ${icon === i ? 'bg-forest/20 ring-2 ring-forest' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., DFU Calculation Table"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest resize-none"
            rows={2}
          />
        </div>

        {/* URL */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">URL (optional)</label>
          <div className="flex items-center gap-2">
            <Link className="w-4 h-4 text-gray-400" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-forest text-white rounded-lg hover:bg-forest/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Resource
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
