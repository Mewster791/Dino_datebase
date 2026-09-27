import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { Animal } from '@/types/database';
import { CATEGORIES } from '@/types/database';
import { AnimalCard } from '@/components/AnimalCard';

interface BrowsePageProps {
  animals: Animal[];
  loading: boolean;
  onNavigate: (view: { name: 'detail'; animalId: string }) => void;
  onSuggest: (animal: Animal) => void;
}

export function BrowsePage({ animals, loading, onNavigate }: BrowsePageProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [diet, setDiet] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'era' | 'category'>('name');
  const [showFilters, setShowFilters] = useState(false);

  const diets = useMemo(() => {
    const set = new Set<string>();
    animals.forEach((a) => { if (a.diet) set.add(a.diet); });
    return Array.from(set).sort();
  }, [animals]);

  const filtered = useMemo(() => {
    let result = animals;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.scientific_name?.toLowerCase().includes(q) ?? false) ||
          (a.description?.toLowerCase().includes(q) ?? false) ||
          (a.period?.toLowerCase().includes(q) ?? false) ||
          (a.era?.toLowerCase().includes(q) ?? false)
      );
    }
    if (category !== 'all') {
      result = result.filter((a) => a.category === category);
    }
    if (diet !== 'all') {
      result = result.filter((a) => a.diet === diet);
    }
    const sorted = [...result];
    sorted.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      if (sortBy === 'era') return (a.era || '').localeCompare(b.era || '');
      return 0;
    });
    return sorted;
  }, [animals, search, category, diet, sortBy]);

  const activeFilterCount =
    (category !== 'all' ? 1 : 0) + (diet !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setCategory('all');
    setDiet('all');
    setSortBy('name');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-stone-900">Explore Prehistoric Animals</h1>
        <p className="mt-2 text-stone-600">
          Browse our full collection of prehistoric creatures. Click any card to see its full page.
        </p>
      </div>

      {/* Search + filter toggle */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, period, era, or keyword..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition-all border ${
            showFilters || activeFilterCount > 0
              ? 'bg-amber-50 text-amber-700 border-amber-300'
              : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-amber-500 text-white text-xs font-bold rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-6 animate-[fadeIn_0.2s_ease]">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="all">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Diet</label>
              <select
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="all">All diets</option>
                {diets.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'era' | 'category')}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="name">Name (A–Z)</option>
                <option value="category">Category</option>
                <option value="era">Era</option>
              </select>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="mt-3 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200 overflow-hidden animate-pulse">
              <div className="h-48 bg-stone-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-stone-200 rounded w-3/4" />
                <div className="h-4 bg-stone-200 rounded w-1/2" />
                <div className="h-3 bg-stone-200 rounded w-full" />
                <div className="h-3 bg-stone-200 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-stone-400" />
          </div>
          <h3 className="text-lg font-semibold text-stone-700">No animals found</h3>
          <p className="text-stone-500 mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-stone-500 mb-4">
            Showing {filtered.length} of {animals.length} animals
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((animal) => (
              <AnimalCard
                key={animal.id}
                animal={animal}
                onClick={() => onNavigate({ name: 'detail', animalId: animal.id })}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
