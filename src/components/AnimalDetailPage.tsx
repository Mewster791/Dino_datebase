import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Ruler, Weight, MapPin, Utensils, Calendar, User, Lightbulb,
  AlertTriangle, Pencil, ChevronLeft, ChevronRight, Clock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Animal, Suggestion } from '@/types/database';
import { categoryColors } from '@/components/AnimalCard';
import { SuggestionList } from '@/components/SuggestionList';

interface AnimalDetailPageProps {
  animalId: string;
  animals: Animal[];
  onNavigate: (view: { name: 'home' } | { name: 'browse' } | { name: 'detail'; animalId: string }) => void;
  onSuggest: (animal: Animal) => void;
  onAnimalUpdated: () => void;
}

export function AnimalDetailPage({
  animalId,
  animals,
  onNavigate,
  onSuggest,
  onAnimalUpdated,
}: AnimalDetailPageProps) {
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFactIndex, setActiveFactIndex] = useState(0);

  const fetchAnimal = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('id', animalId)
      .maybeSingle();
    if (error) {
      console.error('Error fetching animal:', error);
    } else {
      setAnimal(data);
    }
    setLoading(false);
  }, [animalId]);

  const fetchSuggestions = useCallback(async () => {
    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .eq('animal_id', animalId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching suggestions:', error);
    } else {
      setSuggestions(data || []);
    }
  }, [animalId]);

  useEffect(() => {
    fetchAnimal();
    fetchSuggestions();
  }, [fetchAnimal, fetchSuggestions]);

  const currentIndex = animals.findIndex((a) => a.id === animalId);
  const prevAnimal = currentIndex > 0 ? animals[currentIndex - 1] : null;
  const nextAnimal = currentIndex < animals.length - 1 ? animals[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-stone-200 rounded w-24" />
          <div className="h-80 bg-stone-200 rounded-2xl" />
          <div className="h-8 bg-stone-200 rounded w-1/2" />
          <div className="h-4 bg-stone-200 rounded w-full" />
          <div className="h-4 bg-stone-200 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-stone-900">Animal not found</h1>
        <p className="text-stone-500 mt-2">This page may have been removed.</p>
        <button
          onClick={() => onNavigate({ name: 'browse' })}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-900 font-semibold hover:bg-amber-400"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </button>
      </div>
    );
  }

  const catColor = categoryColors[animal.category] || 'bg-stone-100 text-stone-700 border-stone-200';

  return (
    <div>
      {/* Back bar */}
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button
            onClick={() => onNavigate({ name: 'browse' })}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Animals
          </button>
          <button
            onClick={() => onSuggest(animal)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Suggest an Edit
          </button>
        </div>
      </div>

      {/* Hero image */}
      <div className="relative h-72 sm:h-96 bg-stone-900 overflow-hidden">
        {animal.image_url ? (
          <img
            src={animal.image_url}
            alt={animal.name}
            className="w-full h-full object-cover opacity-70"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-800 to-stone-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${catColor}`}>
                {animal.category}
              </span>
              {animal.diet && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-stone-900/60 text-stone-100 backdrop-blur-sm">
                  <Utensils className="w-3 h-3" />
                  {animal.diet}
                </span>
              )}
              {animal.period && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-stone-900/60 text-stone-100 backdrop-blur-sm">
                  <Calendar className="w-3 h-3" />
                  {animal.period}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-stone-50 tracking-tight">
              {animal.name}
            </h1>
            {animal.scientific_name && (
              <p className="text-lg text-stone-300 italic mt-1">{animal.scientific_name}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {animal.length && (
            <StatBox icon={<Ruler className="w-5 h-5" />} label="Length" value={animal.length} />
          )}
          {animal.height && (
            <StatBox icon={<Ruler className="w-5 h-5" />} label="Height" value={animal.height} />
          )}
          {animal.weight && (
            <StatBox icon={<Weight className="w-5 h-5" />} label="Weight" value={animal.weight} />
          )}
          {animal.habitat && (
            <StatBox icon={<MapPin className="w-5 h-5" />} label="Habitat" value={animal.habitat} />
          )}
        </div>

        {/* Description */}
        {animal.description && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-stone-900 mb-3">About</h2>
            <p className="text-stone-700 leading-relaxed text-[15px]">
              {animal.description}
            </p>
          </section>
        )}

        {/* Discovery info */}
        {(animal.discovery_year || animal.discovered_by) && (
          <section className="mb-8 grid sm:grid-cols-2 gap-4">
            {animal.discovery_year && (
              <InfoCard icon={<Calendar className="w-5 h-5" />} label="Discovery Year" value={String(animal.discovery_year)} />
            )}
            {animal.discovered_by && (
              <InfoCard icon={<User className="w-5 h-5" />} label="Discovered By" value={animal.discovered_by} />
            )}
          </section>
        )}

        {/* Fun facts carousel */}
        {animal.fun_facts && animal.fun_facts.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-stone-900 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Fun Facts
            </h2>
            <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <p className="text-stone-800 text-lg leading-relaxed font-medium">
                  {animal.fun_facts[activeFactIndex]}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {animal.fun_facts.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveFactIndex(i)}
                        className={`h-2 rounded-full transition-all ${
                          i === activeFactIndex ? 'w-6 bg-amber-500' : 'w-2 bg-amber-300 hover:bg-amber-400'
                        }`}
                        aria-label={`Fact ${i + 1}`}
                      />
                    ))}
                  </div>
                  {animal.fun_facts.length > 1 && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => setActiveFactIndex((p) => (p - 1 + animal.fun_facts.length) % animal.fun_facts.length)}
                        className="w-8 h-8 rounded-full bg-white border border-amber-200 flex items-center justify-center text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setActiveFactIndex((p) => (p + 1) % animal.fun_facts.length)}
                        className="w-8 h-8 rounded-full bg-white border border-amber-200 flex items-center justify-center text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Extinction */}
        {animal.extinction_cause && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-stone-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Extinction
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <p className="text-stone-700 leading-relaxed">{animal.extinction_cause}</p>
            </div>
          </section>
        )}

        {/* Community suggestions */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-stone-500" />
              Community Suggestions
            </h2>
            <button
              onClick={() => onSuggest(animal)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 text-stone-900 font-semibold text-sm hover:bg-amber-400 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Suggest an Edit
            </button>
          </div>
          <SuggestionList suggestions={suggestions} compact />
        </section>

        {/* Prev / Next nav */}
        {(prevAnimal || nextAnimal) && (
          <div className="grid sm:grid-cols-2 gap-4 mt-12 pt-8 border-t border-stone-200">
            {prevAnimal ? (
              <button
                onClick={() => {
                  onNavigate({ name: 'detail', animalId: prevAnimal.id });
                  setActiveFactIndex(0);
                }}
                className="flex items-center gap-3 p-4 rounded-xl bg-white border border-stone-200 hover:border-amber-300 hover:shadow-md transition-all text-left group"
              >
                <ChevronLeft className="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition-colors" />
                <div>
                  <div className="text-xs text-stone-500">Previous</div>
                  <div className="font-semibold text-stone-900 group-hover:text-amber-600 transition-colors">
                    {prevAnimal.name}
                  </div>
                </div>
              </button>
            ) : (
              <div />
            )}
            {nextAnimal ? (
              <button
                onClick={() => {
                  onNavigate({ name: 'detail', animalId: nextAnimal.id });
                  setActiveFactIndex(0);
                }}
                className="flex items-center justify-end gap-3 p-4 rounded-xl bg-white border border-stone-200 hover:border-amber-300 hover:shadow-md transition-all text-right group"
              >
                <div>
                  <div className="text-xs text-stone-500">Next</div>
                  <div className="font-semibold text-stone-900 group-hover:text-amber-600 transition-colors">
                    {nextAnimal.name}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition-colors" />
              </button>
            ) : (
              <div />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <div className="flex items-center gap-2 text-stone-400 mb-1.5">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-sm font-semibold text-stone-900">{value}</div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600 shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</div>
        <div className="text-sm font-semibold text-stone-900 mt-0.5">{value}</div>
      </div>
    </div>
  );
}
