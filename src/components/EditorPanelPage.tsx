import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Clock, CheckCircle2, XCircle, Inbox, Pencil, Trash2,
  Search, X, Save, Plus, RefreshCw, AlertCircle, ChevronDown,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Animal, Suggestion, SuggestionStatus } from '@/types/database';
import {
  ANIMAL_FIELDS, CATEGORIES, SUGGESTION_TYPE_LABELS, SUGGESTION_TYPE_COLORS,
} from '@/types/database';

interface EditorPanelPageProps {
  animals: Animal[];
  onNavigate: (view: { name: 'home' } | { name: 'browse' }) => void;
  onAnimalsChanged: () => void;
}

type Tab = 'suggestions' | 'animals';

export function EditorPanelPage({ animals, onNavigate, onAnimalsChanged }: EditorPanelPageProps) {
  const [tab, setTab] = useState<Tab>('suggestions');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<SuggestionStatus | 'all'>('pending');
  const [search, setSearch] = useState('');
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('suggestions').select('*').order('created_at', { ascending: false });
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching suggestions:', error);
    } else {
      setSuggestions(data || []);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleApprove = async (suggestion: Suggestion) => {
    if (!suggestion.animal_id || !suggestion.field) return;
    const animal = animals.find((a) => a.id === suggestion.animal_id);
    if (!animal) return;

    const fieldKey = suggestion.field as keyof Animal;
    let updateValue: unknown = suggestion.proposed_value;

    if (fieldKey === 'discovery_year' && suggestion.proposed_value) {
      updateValue = parseInt(suggestion.proposed_value, 10);
    }
    if (fieldKey === 'fun_facts' && suggestion.proposed_value) {
      updateValue = suggestion.proposed_value.split('\n').map((f) => f.trim()).filter(Boolean);
    }

    const { error: updateError } = await supabase
      .from('animals')
      .update({ [fieldKey]: updateValue })
      .eq('id', suggestion.animal_id);

    if (updateError) {
      showToast('Failed to apply update to animal record.');
      return;
    }

    const { error: statusError } = await supabase
      .from('suggestions')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', suggestion.id);

    if (statusError) {
      showToast('Animal updated, but suggestion status failed to update.');
      return;
    }

    showToast(`Approved: ${suggestion.field.replace(/_/g, ' ')} updated for ${animal.name}`);
    fetchSuggestions();
    onAnimalsChanged();
  };

  const handleReject = async (suggestion: Suggestion, notes?: string) => {
    const { error } = await supabase
      .from('suggestions')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        editor_notes: notes || null,
      })
      .eq('id', suggestion.id);

    if (error) {
      showToast('Failed to reject suggestion.');
      return;
    }

    showToast('Suggestion rejected.');
    fetchSuggestions();
  };

  const handleDeleteAnimal = async (animal: Animal) => {
    if (!confirm(`Delete "${animal.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('animals').delete().eq('id', animal.id);
    if (error) {
      showToast('Failed to delete animal.');
      return;
    }
    showToast(`${animal.name} deleted.`);
    onAnimalsChanged();
  };

  const handleSaveAnimal = async (data: Partial<Animal>, id?: string) => {
    if (id) {
      const { error } = await supabase.from('animals').update(data).eq('id', id);
      if (error) {
        showToast('Failed to save changes.');
        return;
      }
      showToast('Animal updated successfully.');
    } else {
      const { error } = await supabase.from('animals').insert(data);
      if (error) {
        showToast('Failed to create animal.');
        return;
      }
      showToast('New animal created.');
    }
    setEditingAnimal(null);
    setCreatingNew(false);
    onAnimalsChanged();
  };

  const filteredSuggestions = suggestions.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const animalName = animals.find((a) => a.id === s.animal_id)?.name?.toLowerCase() || '';
    return (
      animalName.includes(q) ||
      (s.field?.toLowerCase().includes(q) ?? false) ||
      (s.comment?.toLowerCase().includes(q) ?? false) ||
      (s.proposed_value?.toLowerCase().includes(q) ?? false) ||
      s.contributor_name.toLowerCase().includes(q)
    );
  });

  const pendingCount = suggestions.filter((s) => s.status === 'pending').length;
  const approvedCount = suggestions.filter((s) => s.status === 'approved').length;
  const rejectedCount = suggestions.filter((s) => s.status === 'rejected').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/20">
          <ShieldCheck className="w-6 h-6 text-stone-50" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Editor Panel</h1>
          <p className="text-sm text-stone-500">
            Review community suggestions and manage animal entries
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-stone-200">
        <TabButton active={tab === 'suggestions'} onClick={() => setTab('suggestions')} icon={<Inbox className="w-4 h-4" />}>
          Suggestions
          {pendingCount > 0 && (
            <span className="ml-1.5 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-amber-500 text-white text-xs font-bold rounded-full">
              {pendingCount}
            </span>
          )}
        </TabButton>
        <TabButton active={tab === 'animals'} onClick={() => setTab('animals')} icon={<Pencil className="w-4 h-4" />}>
          Manage Animals
        </TabButton>
      </div>

      {tab === 'suggestions' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatPill icon={<Clock className="w-4 h-4" />} label="Pending" value={pendingCount} color="amber" />
            <StatPill icon={<CheckCircle2 className="w-4 h-4" />} label="Approved" value={approvedCount} color="emerald" />
            <StatPill icon={<XCircle className="w-4 h-4" />} label="Rejected" value={rejectedCount} color="red" />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search suggestions..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              />
            </div>
            <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
              {(['pending', 'approved', 'rejected', 'all'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                    statusFilter === s
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Suggestion list */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-stone-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredSuggestions.length === 0 ? (
            <div className="text-center py-20 bg-stone-50 rounded-2xl border border-stone-200">
              <Inbox className="w-10 h-10 text-stone-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-stone-700">No suggestions here</h3>
              <p className="text-stone-500 mt-1 text-sm">
                {statusFilter === 'pending'
                  ? 'All caught up! No pending suggestions to review.'
                  : 'No suggestions match the current filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSuggestions.map((s) => {
                const animal = animals.find((a) => a.id === s.animal_id);
                return (
                  <SuggestionReviewCard
                    key={s.id}
                    suggestion={s}
                    animalName={animal?.name || 'Unknown Animal'}
                    onApprove={() => handleApprove(s)}
                    onReject={(notes) => handleReject(s, notes)}
                    onViewAnimal={animal ? () => onNavigate({ name: 'browse' }) : undefined}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === 'animals' && (
        <AnimalManageTab
          animals={animals}
          onEdit={setEditingAnimal}
          onDelete={handleDeleteAnimal}
          onCreateNew={() => setCreatingNew(true)}
        />
      )}

      {/* Animal editor modal */}
      {(editingAnimal || creatingNew) && (
        <AnimalEditorModal
          animal={editingAnimal}
          onClose={() => { setEditingAnimal(null); setCreatingNew(false); }}
          onSave={handleSaveAnimal}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-stone-900 text-stone-50 text-sm font-medium shadow-xl animate-[fadeIn_0.2s_ease]">
          {toast}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active, onClick, icon, children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
        active
          ? 'border-amber-500 text-amber-600'
          : 'border-transparent text-stone-500 hover:text-stone-700'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function StatPill({
  icon, label, value, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'amber' | 'emerald' | 'red';
}) {
  const colors = {
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border ${colors[color]}`}>
      {icon}
      <div>
        <div className="text-xl font-bold leading-none">{value}</div>
        <div className="text-xs mt-0.5 opacity-80">{label}</div>
      </div>
    </div>
  );
}

function SuggestionReviewCard({
  suggestion, animalName, onApprove, onReject, onViewAnimal,
}: {
  suggestion: Suggestion;
  animalName: string;
  onApprove: () => void;
  onReject: (notes?: string) => void;
  onViewAnimal?: () => void;
}) {
  const [showReject, setShowReject] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const typeColor = SUGGESTION_TYPE_COLORS[suggestion.suggestion_type] || 'bg-stone-100 text-stone-700 border-stone-200';

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${typeColor}`}>
          {SUGGESTION_TYPE_LABELS[suggestion.suggestion_type]}
        </span>
        {suggestion.field && (
          <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-1 rounded-full">
            {suggestion.field.replace(/_/g, ' ')}
          </span>
        )}
        <span className="text-xs text-stone-400">
          by {suggestion.contributor_name}
        </span>
        <span className="text-xs text-stone-400">
          · {new Date(suggestion.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      <div className="text-sm font-semibold text-stone-900 mb-2">
        {animalName}
      </div>

      {suggestion.current_value && (
        <div className="mb-2">
          <div className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">Current</div>
          <div className="text-sm text-stone-600 bg-stone-50 rounded-lg p-2.5 border border-stone-100 line-clamp-3">
            {suggestion.current_value}
          </div>
        </div>
      )}

      {suggestion.proposed_value && (
        <div className="mb-2">
          <div className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">Proposed</div>
          <div className="text-sm text-stone-700 bg-amber-50 rounded-lg p-2.5 border border-amber-100 line-clamp-3">
            {suggestion.proposed_value}
          </div>
        </div>
      )}

      {suggestion.comment && (
        <p className="text-sm text-stone-600 leading-relaxed mt-2">
          <span className="font-medium text-stone-700">Comment: </span>
          {suggestion.comment}
        </p>
      )}

      {suggestion.editor_notes && (
        <div className="mt-2 px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-sm text-stone-600">
          <span className="font-medium">Editor notes: </span>
          {suggestion.editor_notes}
        </div>
      )}

      {suggestion.status === 'pending' && (
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={onApprove}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium text-sm hover:bg-emerald-600 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve & Apply
          </button>
          <button
            onClick={() => setShowReject(!showReject)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-red-600 font-medium text-sm border border-red-200 hover:bg-red-50 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
          {onViewAnimal && (
            <button
              onClick={onViewAnimal}
              className="ml-auto text-sm text-stone-500 hover:text-stone-700 font-medium"
            >
              View Animal →
            </button>
          )}
        </div>
      )}

      {showReject && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200">
          <textarea
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            rows={2}
            placeholder="Reason for rejection (optional)..."
            className="w-full px-3 py-2 rounded-lg border border-red-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm resize-y"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setShowReject(false)}
              className="px-3 py-1.5 rounded-lg text-sm text-stone-600 hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { onReject(rejectNotes.trim() || undefined); setShowReject(false); }}
              className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AnimalManageTab({
  animals, onEdit, onDelete, onCreateNew,
}: {
  animals: Animal[];
  onEdit: (animal: Animal) => void;
  onDelete: (animal: Animal) => void;
  onCreateNew: () => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = animals.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.scientific_name?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search animals..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
          />
        </div>
        <button
          onClick={onCreateNew}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-900 font-semibold text-sm hover:bg-amber-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Animal
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-500">No animals found.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filtered.map((animal) => (
              <div key={animal.id} className="flex items-center gap-4 p-4 hover:bg-stone-50 transition-colors">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                  {animal.image_url ? (
                    <img src={animal.image_url} alt={animal.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 font-bold">
                      {animal.name[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-stone-900 truncate">{animal.name}</div>
                  <div className="text-sm text-stone-500 truncate">
                    {animal.scientific_name || '—'} · {animal.category}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEdit(animal)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-500 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(animal)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-500 hover:bg-red-50 hover:text-red-600 transition-colors"
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
    </div>
  );
}

function AnimalEditorModal({
  animal, onClose, onSave,
}: {
  animal: Animal | null;
  onClose: () => void;
  onSave: (data: Partial<Animal>, id?: string) => void;
}) {
  const [form, setForm] = useState<Record<string, unknown>>({
    name: animal?.name || '',
    scientific_name: animal?.scientific_name || '',
    category: animal?.category || 'Dinosaur',
    era: animal?.era || '',
    period: animal?.period || '',
    diet: animal?.diet || '',
    habitat: animal?.habitat || '',
    length: animal?.length || '',
    height: animal?.height || '',
    weight: animal?.weight || '',
    description: animal?.description || '',
    discovery_year: animal?.discovery_year || '',
    discovered_by: animal?.discovered_by || '',
    image_url: animal?.image_url || '',
    fun_facts: (animal?.fun_facts || []).join('\n'),
    extinction_cause: animal?.extinction_cause || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!form.name || !String(form.name).trim()) {
      setError('Name is required.');
      return;
    }
    setSaving(true);
    setError(null);

    const data: Record<string, unknown> = {};
    ANIMAL_FIELDS.forEach((f) => {
      let val = form[f.key];
      if (f.type === 'number') {
        val = val ? parseInt(String(val), 10) : null;
      }
      if (f.type === 'array') {
        val = String(val || '').split('\n').map((s) => s.trim()).filter(Boolean);
      }
      if (val === '' || val === null) val = null;
      data[f.key] = val;
    });
    data.name = String(form.name).trim();
    data.category = String(form.category || 'Dinosaur');

    onSave(data as Partial<Animal>, animal?.id);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease]">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-stone-900">
            {animal ? 'Edit Animal' : 'Add New Animal'}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-400 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {ANIMAL_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                {f.label}
                {f.key === 'name' && <span className="text-red-500"> *</span>}
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  value={String(form[f.key] || '')}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  rows={f.key === 'description' ? 5 : 3}
                  className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y text-sm"
                />
              ) : f.type === 'number' ? (
                <input
                  type="number"
                  value={String(form[f.key] || '')}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                />
              ) : f.key === 'category' ? (
                <select
                  value={String(form[f.key] || 'Dinosaur')}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : f.key === 'fun_facts' ? (
                <textarea
                  value={String(form[f.key] || '')}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  rows={4}
                  placeholder="One fact per line..."
                  className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y text-sm"
                />
              ) : (
                <input
                  type="text"
                  value={String(form[f.key] || '')}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                />
              )}
            </div>
          ))}

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-stone-100">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-stone-600 font-medium hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-stone-900 font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {animal ? 'Save Changes' : 'Create Animal'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
