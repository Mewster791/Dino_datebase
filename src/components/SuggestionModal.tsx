import { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Animal, SuggestionType } from '@/types/database';
import { ANIMAL_FIELDS, SUGGESTION_TYPE_LABELS } from '@/types/database';

interface SuggestionModalProps {
  animal: Animal;
  onClose: () => void;
  onSubmitted: () => void;
}

export function SuggestionModal({ animal, onClose, onSubmitted }: SuggestionModalProps) {
  const [suggestionType, setSuggestionType] = useState<SuggestionType>('update');
  const [field, setField] = useState<string>('description');
  const [proposedValue, setProposedValue] = useState('');
  const [comment, setComment] = useState('');
  const [contributorName, setContributorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editableFields = ANIMAL_FIELDS.filter((f) => f.key !== 'image_url' || true);

  const currentValue = field ? String(animal[field as keyof Animal] ?? '') : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposedValue.trim() && suggestionType !== 'new_animal') {
      setError('Please provide the proposed new value.');
      return;
    }
    if (!comment.trim()) {
      setError('Please add a brief explanation of your suggestion.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from('suggestions').insert({
      animal_id: animal.id,
      contributor_name: contributorName.trim() || 'Anonymous',
      suggestion_type: suggestionType,
      field: field,
      proposed_value: proposedValue.trim() || null,
      current_value: currentValue || null,
      comment: comment.trim(),
      status: 'pending',
    });

    setSubmitting(false);

    if (insertError) {
      setError('Something went wrong submitting your suggestion. Please try again.');
      return;
    }

    onSubmitted();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease]">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Suggest an Edit</h2>
            <p className="text-sm text-stone-500">
              for <span className="font-medium text-stone-700">{animal.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Suggestion type */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              What kind of suggestion is this?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(SUGGESTION_TYPE_LABELS) as SuggestionType[])
                .filter((t) => t !== 'new_animal')
                .map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSuggestionType(type)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      suggestionType === type
                        ? 'bg-amber-50 border-amber-400 text-amber-700 ring-1 ring-amber-400'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {SUGGESTION_TYPE_LABELS[type]}
                  </button>
                ))}
            </div>
          </div>

          {/* Field selector */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Which field needs updating?
            </label>
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {editableFields.map((f) => (
                <option key={f.key} value={f.key}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Current value */}
          {currentValue && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Current value
              </label>
              <div className="px-3 py-2.5 rounded-lg bg-stone-50 border border-stone-200 text-sm text-stone-600 max-h-32 overflow-y-auto">
                {currentValue}
              </div>
            </div>
          )}

          {/* Proposed value */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Proposed new value <span className="text-red-500">*</span>
            </label>
            {editableFields.find((f) => f.key === field)?.type === 'textarea' ? (
              <textarea
                value={proposedValue}
                onChange={(e) => setProposedValue(e.target.value)}
                rows={4}
                placeholder="Enter the corrected or expanded content..."
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y"
              />
            ) : (
              <input
                type="text"
                value={proposedValue}
                onChange={(e) => setProposedValue(e.target.value)}
                placeholder="Enter the new value..."
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Explanation <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Why should this change be made? Cite sources if possible..."
              className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y"
            />
          </div>

          {/* Contributor name */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Your name (optional)
            </label>
            <input
              type="text"
              value={contributorName}
              onChange={(e) => setContributorName(e.target.value)}
              placeholder="Anonymous"
              className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-stone-600 font-medium hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-stone-900 font-semibold hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Suggestion
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500 pt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Your suggestion will be reviewed by an editor before being applied.
          </div>
        </form>
      </div>
    </div>
  );
}
