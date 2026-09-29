import { useState } from 'react';
import { ShieldCheck, Lock, X, AlertCircle } from 'lucide-react';

const EDITOR_PASSCODE = 'fossil-editor';

interface EditorGateProps {
  onUnlock: () => void;
  onClose: () => void;
}

export function EditorGate({ onUnlock, onClose }: EditorGateProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === EDITOR_PASSCODE) {
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease]">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/20">
              <ShieldCheck className="w-6 h-6 text-stone-50" />
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-lg font-bold text-stone-900">Editor Access</h2>
          <p className="text-sm text-stone-500 mt-1 mb-4">
            Enter the editor passcode to access the review panel.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError(false);
                }}
                placeholder="Passcode"
                autoFocus
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Incorrect passcode. Please try again.
              </div>
            )}

            <button
              type="submit"
              className="w-full px-5 py-3 rounded-xl bg-amber-500 text-stone-900 font-semibold hover:bg-amber-400 transition-colors"
            >
              Unlock
            </button>
          </form>

          <p className="text-xs text-stone-400 mt-4 text-center">
            The editor panel is restricted to approved reviewers.
          </p>
        </div>
      </div>
    </div>
  );
}
