import { MessageSquare, Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { Suggestion } from '@/types/database';
import { SUGGESTION_TYPE_LABELS, SUGGESTION_TYPE_COLORS } from '@/types/database';

interface SuggestionListProps {
  suggestions: Suggestion[];
  compact?: boolean;
}

export function SuggestionList({ suggestions, compact }: SuggestionListProps) {
  if (suggestions.length === 0) {
    return (
      <div className="text-center py-10 bg-stone-50 rounded-2xl border border-stone-200">
        <MessageSquare className="w-8 h-8 text-stone-400 mx-auto mb-2" />
        <p className="text-stone-500 text-sm">
          No community suggestions yet. Be the first to suggest an improvement!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {suggestions.map((s) => {
        const typeColor = SUGGESTION_TYPE_COLORS[s.suggestion_type] || 'bg-stone-100 text-stone-700 border-stone-200';
        return (
          <div
            key={s.id}
            className={`bg-white rounded-xl border p-4 ${
              s.status === 'pending'
                ? 'border-stone-200'
                : s.status === 'approved'
                ? 'border-emerald-200 bg-emerald-50/30'
                : 'border-red-200 bg-red-50/30'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${typeColor}`}>
                  {SUGGESTION_TYPE_LABELS[s.suggestion_type]}
                </span>
                {s.field && (
                  <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                    {s.field.replace(/_/g, ' ')}
                  </span>
                )}
                <span className="text-xs text-stone-400">
                  by {s.contributor_name}
                </span>
              </div>
              <StatusBadge status={s.status} />
            </div>

            {!compact && s.proposed_value && (
              <div className="mb-2">
                <div className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">
                  Proposed value
                </div>
                <div className="text-sm text-stone-700 bg-stone-50 rounded-lg p-3 border border-stone-100">
                  {s.proposed_value}
                </div>
              </div>
            )}

            {s.comment && (
              <p className="text-sm text-stone-600 leading-relaxed">{s.comment}</p>
            )}

            <div className="mt-2 flex items-center gap-1 text-xs text-stone-400">
              <Clock className="w-3 h-3" />
              {new Date(s.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>

            {s.editor_notes && (
              <div className="mt-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-sm text-stone-700">
                <span className="font-medium text-amber-700">Editor notes: </span>
                {s.editor_notes}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  }
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="w-3 h-3" />
        Approved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
      <XCircle className="w-3 h-3" />
      Rejected
    </span>
  );
}
