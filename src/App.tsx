import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Animal, Suggestion } from '@/types/database';
import { Header } from '@/components/Header';
import { HomePage } from '@/components/HomePage';
import { BrowsePage } from '@/components/BrowsePage';
import { AnimalDetailPage } from '@/components/AnimalDetailPage';
import { EditorPanelPage } from '@/components/EditorPanelPage';
import { SuggestionModal } from '@/components/SuggestionModal';
import { NewAnimalSuggestionModal } from '@/components/NewAnimalSuggestionModal';
import { EditorGate } from '@/components/EditorGate';
import { Footer } from '@/components/Footer';

type View =
  | { name: 'home' }
  | { name: 'browse' }
  | { name: 'detail'; animalId: string }
  | { name: 'editor' };

export default function App() {
  const [view, setView] = useState<View>({ name: 'home' });
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestionTarget, setSuggestionTarget] = useState<Animal | null>(null);
  const [showNewAnimalModal, setShowNewAnimalModal] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [editorUnlocked, setEditorUnlocked] = useState(false);
  const [showEditorGate, setShowEditorGate] = useState(false);

  const fetchAnimals = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .order('name');
    if (error) {
      console.error('Error fetching animals:', error);
    } else {
      setAnimals(data || []);
    }
    setLoading(false);
  }, []);

  const fetchPendingCount = useCallback(async () => {
    const { count } = await supabase
      .from('suggestions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    setPendingCount(count || 0);
  }, []);

  useEffect(() => {
    fetchAnimals();
    fetchPendingCount();
  }, [fetchAnimals, fetchPendingCount]);

  const navigate = (v: View) => {
    if (v.name === 'editor' && !editorUnlocked) {
      setShowEditorGate(true);
      return;
    }
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSuggestionSubmitted = () => {
    fetchPendingCount();
  };

  const handleAnimalUpdated = () => {
    fetchAnimals();
    fetchPendingCount();
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header
        view={view.name}
        pendingCount={pendingCount}
        onNavigate={navigate}
      />

      <main className="flex-1">
        {view.name === 'home' && (
          <HomePage
            animals={animals}
            loading={loading}
            onNavigate={navigate}
            onSuggestNew={() => setShowNewAnimalModal(true)}
          />
        )}
        {view.name === 'browse' && (
          <BrowsePage
            animals={animals}
            loading={loading}
            onNavigate={navigate}
            onSuggest={setSuggestionTarget}
            onSuggestNew={() => setShowNewAnimalModal(true)}
          />
        )}
        {view.name === 'detail' && (
          <AnimalDetailPage
            animalId={view.animalId}
            animals={animals}
            onNavigate={navigate}
            onSuggest={setSuggestionTarget}
            onAnimalUpdated={handleAnimalUpdated}
          />
        )}
        {view.name === 'editor' && editorUnlocked && (
          <EditorPanelPage
            animals={animals}
            onNavigate={navigate}
            onAnimalsChanged={handleAnimalUpdated}
          />
        )}
      </main>

      <Footer onNavigate={navigate} />

      {suggestionTarget && (
        <SuggestionModal
          animal={suggestionTarget}
          onClose={() => setSuggestionTarget(null)}
          onSubmitted={() => {
            setSuggestionTarget(null);
            handleSuggestionSubmitted();
          }}
        />
      )}

      {showNewAnimalModal && (
        <NewAnimalSuggestionModal
          onClose={() => setShowNewAnimalModal(false)}
          onSubmitted={() => {
            setShowNewAnimalModal(false);
            handleSuggestionSubmitted();
          }}
        />
      )}

      {showEditorGate && (
        <EditorGate
          onUnlock={() => {
            setEditorUnlocked(true);
            setShowEditorGate(false);
            setView({ name: 'editor' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onClose={() => setShowEditorGate(false)}
        />
      )}
    </div>
  );
}
