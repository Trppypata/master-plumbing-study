'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flashcard, FlashcardType, Topic, Choice, CalculationStep } from '@/types';
import { createFlashcard, updateFlashcard, getTopics } from '@/app/actions/flashcard-crud';
import { Loader2, Plus, X, Save, AlertCircle } from 'lucide-react';

interface FlashcardFormProps {
  initialData?: Flashcard | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FlashcardForm({ initialData, onSuccess, onCancel }: FlashcardFormProps) {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    topic_id: initialData?.topic_id || '',
    type: initialData?.type || 'recall' as FlashcardType,
    front_content: initialData?.front_content || '',
    back_content: initialData?.back_content || '',
    explanation: initialData?.explanation || '',
    formula: initialData?.formula || '',
    code_reference: initialData?.code_reference || '',
    difficulty: initialData?.difficulty || 1,
    choices: initialData?.choices || [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    steps: initialData?.steps || [{ step: '', explanation: '' }]
  });

  useEffect(() => {
    async function loadTopics() {
      try {
        const data = await getTopics();
        setTopics(data);
        if (!initialData && data.length > 0) {
          setFormData(prev => ({ ...prev, topic_id: data[0].id }));
        }
      } catch (err) {
        console.error('Failed to load topics', err);
        setError('Failed to load topics. Please try again.');
      }
    }
    loadTopics();
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.topic_id) throw new Error('Please select a topic');
      if (!formData.front_content) throw new Error('Question/Front content is required');
      if (!formData.back_content && formData.type !== 'calculation') throw new Error('Answer/Back content is required');

      // Prepare data based on type
      const submitData: any = {
        topic_id: formData.topic_id,
        type: formData.type,
        front_content: formData.front_content,
        back_content: formData.back_content,
        explanation: formData.explanation,
        code_reference: formData.code_reference,
        difficulty: formData.difficulty
      };

      if (formData.type === 'multiple_choice') {
        const validChoices = formData.choices.filter(c => c.text.trim() !== '');
        if (validChoices.length < 2) throw new Error('Multiple choice needs at least 2 options');
        if (!validChoices.some(c => c.isCorrect)) throw new Error('Select at least one correct answer');
        submitData.choices = validChoices;
        // Back content is usually the correct answer text for fallback
        submitData.back_content = validChoices.find(c => c.isCorrect)?.text || '';
      } else if (formData.type === 'calculation') {
        submitData.formula = formData.formula;
        submitData.steps = formData.steps.filter(s => s.step.trim() !== '');
      }

      if (initialData) {
        await updateFlashcard(initialData.id, submitData);
      } else {
        await createFlashcard(submitData);
      }
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save flashcard');
    } finally {
      setLoading(false);
    }
  };

  const updateChoice = (index: number, field: keyof Choice, value: any) => {
    const newChoices = [...formData.choices];
    newChoices[index] = { ...newChoices[index], [field]: value };
    
    // Ensure only one correct answer for basic MCQ (radio behavior)
    if (field === 'isCorrect' && value === true) {
      newChoices.forEach((c, i) => {
        if (i !== index) c.isCorrect = false;
      });
    }
    
    setFormData({ ...formData, choices: newChoices });
  };

  const updateStep = (index: number, field: keyof CalculationStep, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData({ ...formData, steps: newSteps });
  };

  const addStep = () => {
    setFormData({ ...formData, steps: [...formData.steps, { step: '', explanation: '' }] });
  };

  const removeStep = (index: number) => {
    setFormData({ ...formData, steps: formData.steps.filter((_, i) => i !== index) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm border border-red-100">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-gray-500">Topic Area</label>
            <select 
                className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                value={formData.topic_id} 
                onChange={e => setFormData({ ...formData, topic_id: e.target.value })}
            >
                {topics.map(t => (
                    <option key={t.id} value={t.id}>
                        {/* @ts-ignore - joined data */}
                        {t.subject?.name} - {t.name} 
                    </option>
                ))}
            </select>
        </div>

        <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-gray-500">Card Type</label>
            <select 
                className="w-full p-2 border border-gray-200 rounded-lg bg-white"
                value={formData.type} 
                onChange={e => setFormData({ ...formData, type: e.target.value as FlashcardType })}
            >
                <option value="recall">Recall (Flip Card)</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="calculation">Calculation</option>
                <option value="scenario">Scenario</option>
            </select>
        </div>
      </div>

      {/* Front Content */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase text-gray-500">
            {formData.type === 'calculation' ? 'Problem Statement' : 'Question / Front'}
        </label>
        <textarea 
            className="w-full p-3 border border-gray-200 rounded-lg min-h-[80px]"
            value={formData.front_content}
            onChange={e => setFormData({ ...formData, front_content: e.target.value })}
            placeholder="e.g. What is the minimum trap seal depth?"
            required
        />
      </div>

      {/* Back Content (Conditional) */}
      {formData.type !== 'multiple_choice' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-gray-500">
                {formData.type === 'calculation' ? 'Final Answer' : 'Answer / Back'}
            </label>
            <textarea 
                className="w-full p-3 border border-gray-200 rounded-lg min-h-[80px]"
                value={formData.back_content}
                onChange={e => setFormData({ ...formData, back_content: e.target.value })}
                placeholder="e.g. 2 inches (51mm)"
                required={formData.type !== 'calculation'}
            />
          </div>
      )}

      {/* Calculation Fields */}
      {formData.type === 'calculation' && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
             <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-gray-500">Formula Used</label>
                <input 
                    type="text" 
                    className="w-full p-2 border border-gray-200 rounded-lg font-mono text-sm"
                    value={formData.formula}
                    onChange={e => setFormData({ ...formData, formula: e.target.value })}
                    placeholder="e.g. V = L x W x D"
                />
             </div>
             
             <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-gray-500 flex justify-between">
                    <span>Solution Steps</span>
                    <button type="button" onClick={addStep} className="text-forest hover:underline text-[10px]">+ Add Step</button>
                </label>
                {formData.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-2">
                         <div className="flex-grow space-y-1">
                            <input 
                                type="text"
                                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                                value={step.step}
                                onChange={e => updateStep(idx, 'step', e.target.value)}
                                placeholder={`Step ${idx + 1}`}
                            />
                            <input 
                                type="text"
                                className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-gray-50"
                                value={step.explanation}
                                onChange={e => updateStep(idx, 'explanation', e.target.value)}
                                placeholder="Explanation (optional)"
                            />
                         </div>
                         <button type="button" onClick={() => removeStep(idx)} className="text-gray-400 hover:text-red-500">
                            <X className="w-4 h-4" />
                         </button>
                    </div>
                ))}
             </div>
          </div>
      )}

      {/* Multiple Choice Fields */}
      {formData.type === 'multiple_choice' && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
             <label className="text-xs font-semibold uppercase text-gray-500">Choices</label>
             {formData.choices.map((choice, idx) => (
                 <div key={idx} className="flex items-center gap-3">
                     <input 
                        type="radio" 
                        name="correctChoice"
                        checked={choice.isCorrect}
                        onChange={e => updateChoice(idx, 'isCorrect', e.target.checked)}
                        className="w-4 h-4 text-forest focus:ring-forest"
                     />
                     <input 
                        type="text"
                        className="flex-grow p-2 border border-gray-200 rounded-lg text-sm"
                        value={choice.text}
                        onChange={e => updateChoice(idx, 'text', e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                     />
                 </div>
             ))}
             <p className="text-[10px] text-gray-400">Select the radio button for the correct answer.</p>
          </div>
      )}

      {/* Shared Meta Fields */}
      <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
             <label className="text-xs font-semibold uppercase text-gray-500">Difficulty (1-5)</label>
             <input 
                type="number" 
                min="1" 
                max="5"
                className="w-full p-2 border border-gray-200 rounded-lg"
                value={formData.difficulty}
                onChange={e => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
             />
          </div>
          <div className="space-y-2">
             <label className="text-xs font-semibold uppercase text-gray-500">Code Reference</label>
             <input 
                type="text" 
                className="w-full p-2 border border-gray-200 rounded-lg"
                value={formData.code_reference}
                onChange={e => setFormData({ ...formData, code_reference: e.target.value })}
                placeholder="e.g. IPC 304.1"
             />
          </div>
      </div>

      <div className="space-y-2">
         <label className="text-xs font-semibold uppercase text-gray-500">Explanation (Shown after answer)</label>
         <textarea 
            className="w-full p-2 border border-gray-200 rounded-lg min-h-[60px]"
            value={formData.explanation}
            onChange={e => setFormData({ ...formData, explanation: e.target.value })}
            placeholder="Why is this the correct answer?"
         />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
         <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
         >
            Cancel
         </button>
         <button 
            type="submit" 
            disabled={loading}
            className="flex-[2] py-3 bg-forest text-white font-semibold rounded-lg hover:bg-forest/90 transition flex items-center justify-center gap-2 shadow-lg shadow-forest/20"
         >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {initialData ? 'Update Card' : 'Create Card'}
         </button>
      </div>
    </form>
  );
}
