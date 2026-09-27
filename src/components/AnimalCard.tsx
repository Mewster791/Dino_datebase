import { Ruler, Weight, MapPin, Utensils, Calendar, User, Lightbulb, AlertTriangle, ChevronRight } from 'lucide-react';
import type { Animal } from '@/types/database';

interface AnimalCardProps {
  animal: Animal;
  onClick: () => void;
}

const categoryColors: Record<string, string> = {
  Dinosaur: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Marine Reptile': 'bg-blue-100 text-blue-700 border-blue-200',
  'Flying Reptile': 'bg-sky-100 text-sky-700 border-sky-200',
  Mammal: 'bg-orange-100 text-orange-700 border-orange-200',
  Cephalopod: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  Arthropod: 'bg-teal-100 text-teal-700 border-teal-200',
  Synapsid: 'bg-rose-100 text-rose-700 border-rose-200',
  Amphibian: 'bg-lime-100 text-lime-700 border-lime-200',
  Bird: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Fish: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

export function AnimalCard({ animal, onClick }: AnimalCardProps) {
  const catColor = categoryColors[animal.category] || 'bg-stone-100 text-stone-700 border-stone-200';

  return (
    <button
      onClick={onClick}
      className="group text-left bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl hover:border-amber-300 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative h-48 overflow-hidden bg-stone-100">
        {animal.image_url ? (
          <img
            src={animal.image_url}
            alt={animal.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-200 to-stone-300">
            <span className="text-4xl font-bold text-stone-400">{animal.name[0]}</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${catColor}`}>
            {animal.category}
          </span>
        </div>
        {animal.diet && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-900/70 text-stone-50 backdrop-blur-sm">
              <Utensils className="w-3 h-3" />
              {animal.diet}
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-600 transition-colors">
          {animal.name}
        </h3>
        {animal.scientific_name && (
          <p className="text-sm text-stone-500 italic mt-0.5">{animal.scientific_name}</p>
        )}
        <p className="text-sm text-stone-600 mt-3 line-clamp-2 leading-relaxed">
          {animal.description || 'No description available yet.'}
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-stone-500">
          {animal.period && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {animal.period}
            </span>
          )}
          {animal.length && (
            <span className="inline-flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5" />
              {animal.length}
            </span>
          )}
          {animal.weight && (
            <span className="inline-flex items-center gap-1">
              <Weight className="w-3.5 h-3.5" />
              {animal.weight}
            </span>
          )}
        </div>
        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-amber-600 group-hover:text-amber-700">
          Read more
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </button>
  );
}

export { categoryColors };
