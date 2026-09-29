import { Compass, ArrowRight, Sparkles, Users, ShieldCheck, Search, Plus } from 'lucide-react';
import type { Animal } from '@/types/database';
import { AnimalCard } from '@/components/AnimalCard';

interface HomePageProps {
  animals: Animal[];
  loading: boolean;
  onNavigate: (view: { name: 'home' } | { name: 'browse' } | { name: 'detail'; animalId: string }) => void;
  onSuggestNew: () => void;
}

export function HomePage({ animals, loading, onNavigate, onSuggestNew }: HomePageProps) {
  const featured = animals.slice(0, 6);
  const categories = [...new Set(animals.map((a) => a.category))];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-stone-900">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(https://images.pexels.com/photos/9660900/pexels-photo-9660900.jpeg?auto=compress&cs=tinysrgb&h=650&w=940)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-stone-900/80 to-stone-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Community-driven prehistoric knowledge
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-50 leading-tight tracking-tight">
              The encyclopedia of{' '}
              <span className="text-amber-400">prehistoric life</span>
            </h1>
            <p className="mt-6 text-lg text-stone-300 leading-relaxed">
              Explore the creatures that ruled our planet for hundreds of millions
              of years. Every page is built and improved by a community of
              paleontology enthusiasts, with dedicated editors ensuring accuracy.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate({ name: 'browse' })}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-stone-900 font-semibold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-900/30"
              >
                <Search className="w-5 h-5" />
                Explore the Collection
              </button>
              <button
                onClick={onSuggestNew}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-900/30"
              >
                <Plus className="w-5 h-5" />
                Suggest a New Animal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Compass className="w-5 h-5" />}
            value={loading ? '—' : String(animals.length)}
            label="Species documented"
          />
          <StatCard
            icon={<Sparkles className="w-5 h-5" />}
            value={loading ? '—' : String(categories.length)}
            label="Categories covered"
          />
          <StatCard
            icon={<Users className="w-5 h-5" />}
            value="Open"
            label="Community contributions"
          />
          <StatCard
            icon={<ShieldCheck className="w-5 h-5" />}
            value="Reviewed"
            label="By dedicated editors"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-stone-900">How FossilForge Works</h2>
          <p className="mt-3 text-stone-600 max-w-xl mx-auto">
            A three-step process keeps our encyclopedia growing, accurate, and community-driven.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <StepCard
            number="01"
            icon={<Search className="w-6 h-6" />}
            title="Explore"
            description="Browse detailed pages for hundreds of prehistoric animals — from dinosaurs to marine reptiles to Ice Age mammals."
          />
          <StepCard
            number="02"
            icon={<Users className="w-6 h-6" />}
            title="Suggest"
            description="Found something missing or incorrect? Anyone can suggest new animals, updates, expansions, or corrections to the encyclopedia."
          />
          <StepCard
            number="03"
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Review"
            description="Dedicated editors review every suggestion and apply approved changes to keep the encyclopedia accurate."
          />
        </div>
      </section>

      {/* Featured animals */}
      {!loading && featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-stone-900">Featured Creatures</h2>
            <button
              onClick={() => onNavigate({ name: 'browse' })}
              className="inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 font-medium text-sm transition-colors"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((animal) => (
              <AnimalCard
                key={animal.id}
                animal={animal}
                onClick={() => onNavigate({ name: 'detail', animalId: animal.id })}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5">
      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-3">
        {icon}
      </div>
      <div className="text-2xl font-bold text-stone-900">{value}</div>
      <div className="text-sm text-stone-500 mt-0.5">{label}</div>
    </div>
  );
}

function StepCard({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-lg hover:border-amber-300 transition-all">
      <div className="absolute top-4 right-4 text-4xl font-bold text-stone-100">
        {number}
      </div>
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-50 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-stone-900 mb-2">{title}</h3>
      <p className="text-stone-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
