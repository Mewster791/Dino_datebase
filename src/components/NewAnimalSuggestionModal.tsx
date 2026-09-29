import { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CATEGORIES } from '@/types/database';

interface NewAnimalSuggestionModalProps {
  onClose: () => void;
  onSubmitted: () => void;
}

export function NewAnimalSuggestionModal({ onClose, onSubmitted }: NewAnimalSuggestionModalProps) {
  const [form, setForm] = useState({
    name: '',
    scientific_name: '',
    category: 'Dinosaur',
    era: '',
    period: '',
    diet: '',
    habitat: '',
    length: '',
    height: '',
    weight: '',
    description: '',
    discovery_year: '',
    discovered_by: '',
    image_url: '',
    fun_facts: '',
    extinction_cause: '',
  });
  const [contributorName, setContributorName] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Please provide a name for the animal.');
      return;
    }
    if (!form.description.trim()) {
      setError('Please provide at least a short description.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const proposedData: Record<string, string> = {};
    Object.entries(form).forEach(([key, val]) => {
      if (val.trim()) proposedData[key] = val.trim();
    });

    const { error: insertError } = await supabase.from('suggestions').insert({
      animal_id: null,
      contributor_name: contributorName.trim() || 'Anonymous',
      suggestion_type: 'new_animal',
      field: null,
      proposed_value: JSON.stringify(proposedData, null, 2),
      current_value: null,
      comment: comment.trim() || `New animal suggestion: ${form.name}`,
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
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Suggest a New Animal</h2>
              <p className="text-sm text-stone-500">Help grow the encyclopedia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <span>
              Fill in what you know — you don't need every field. An editor will
              review your submission and create the animal page if approved.
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name" required>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Allosaurus"
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              />
            </Field>
            <Field label="Scientific Name">
              <input
                type="text"
                value={form.scientific_name}
                onChange={(e) => handleChange('scientific_name', e.target.value)}
                placeholder="e.g. Allosaurus fragilis"
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              />
            </Field>
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Diet">
              <input
                type="text"
                value={form.diet}
                onChange={(e) => handleChange('diet', e.target.value)}
                placeholder="Carnivore, Herbivore, etc."
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              />
            </Field>
            <Field label="Era">
              <input
                type="text"
                value={form.era}
                onChange={(e) => handleChange('era', e.target.value)}
                placeholder="e.g. Mesozoic"
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              />
            </Field>
            <Field label="Period">
              <input
                type="text"
                value={form.period}
                onChange={(e) => handleChange('period', e.target.value)}
                placeholder="e.g. Late Jurassic"
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              />
            </Field>
            <Field label="Length">
              <input
                type="text"
                value={form.length}
                onChange={(e) => handleChange('length', e.target.value)}
                placeholder="e.g. 9 meters"
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              />
            </Field>
            <Field label="Weight">
              <input
                type="text"
                value={form.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                placeholder="e.g. 2,000 kg"
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              />
            </Field>
          </div>

          <Field label="Description" required>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              placeholder="Describe this animal — its appearance, behavior, and significance..."
              className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y text-sm"
            />
          </Field>

          <Field label="Habitat">
            <textarea
              value={form.habitat}
              onChange={(e) => handleChange('habitat', e.target.value)}
              rows={2}
              placeholder="Where did this animal live?"
              className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y text-sm"
            />
          </Field>

          <Field label="Fun Facts (one per line)">
            <textarea
              value={form.fun_facts}
              onChange={(e) => handleChange('fun_facts', e.target.value)}
              rows={3}
              placeholder="Interesting tidbits, one per line..."
              className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y text-sm"
            />
          </Field>

          <Field label="Extinction Cause">
            <textarea
              value={form.extinction_cause}
              onChange={(e) => handleChange('extinction_cause', e.target.value)}
              rows={2}
              placeholder="How or why did this animal go extinct?"
              className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y text-sm"
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Discovery Year">
              <input
                type="number"
                value={form.discovery_year}
                onChange={(e) => handleChange('discovery_year', e.target.value)}
                placeholder="e.g. 1877"
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              />
            </Field>
            <Field label="Discovered By">
              <input
                type="text"
                value={form.discovered_by}
                onChange={(e) => handleChange('discovered_by', e.target.value)}
                placeholder="e.g. Othniel Charles Marsh"
                className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              />
            </Field>
          </div>

          <Field label="Image URL (optional)">
            <input
              type="text"
              value={form.image_url}
              onChange={(e) => handleChange('image_url', e.target.value)}
              placeholder="Link to a photo or illustration"
              className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
            />
          </Field>

          <Field label="Additional notes for the editor (optional)">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              placeholder="Sources, references, or anything else the editor should know..."
              className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y text-sm"
            />
          </Field>

          <Field label="Your name (optional)">
            <input
              type="text"
              value={contributorName}
              onChange={(e) => setContributorName(e.target.value)}
              placeholder="Anonymous"
              className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
            />
          </Field>

          {error && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit New Animal
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500 pt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Your suggestion will be reviewed by an editor before the animal page is created.
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1.5">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}
