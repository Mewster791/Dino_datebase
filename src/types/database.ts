export interface Animal {
  id: string;
  name: string;
  scientific_name: string | null;
  category: string;
  era: string | null;
  period: string | null;
  diet: string | null;
  habitat: string | null;
  length: string | null;
  height: string | null;
  weight: string | null;
  description: string | null;
  discovery_year: number | null;
  discovered_by: string | null;
  image_url: string | null;
  fun_facts: string[];
  extinction_cause: string | null;
  created_at: string;
  updated_at: string;
}

export type SuggestionType = 'update' | 'expansion' | 'fix' | 'new_animal';
export type SuggestionStatus = 'pending' | 'approved' | 'rejected';

export interface Suggestion {
  id: string;
  animal_id: string | null;
  contributor_name: string;
  suggestion_type: SuggestionType;
  field: string | null;
  proposed_value: string | null;
  current_value: string | null;
  comment: string | null;
  status: SuggestionStatus;
  editor_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface SuggestionInput {
  animal_id?: string | null;
  contributor_name: string;
  suggestion_type: SuggestionType;
  field?: string | null;
  proposed_value?: string | null;
  current_value?: string | null;
  comment?: string | null;
}

export interface AnimalInput {
  name: string;
  scientific_name?: string | null;
  category: string;
  era?: string | null;
  period?: string | null;
  diet?: string | null;
  habitat?: string | null;
  length?: string | null;
  height?: string | null;
  weight?: string | null;
  description?: string | null;
  discovery_year?: number | null;
  discovered_by?: string | null;
  image_url?: string | null;
  fun_facts?: string[];
  extinction_cause?: string | null;
}

export const ANIMAL_FIELDS: { key: keyof Animal; label: string; type: 'text' | 'textarea' | 'number' | 'array' }[] = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'scientific_name', label: 'Scientific Name', type: 'text' },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'era', label: 'Era', type: 'text' },
  { key: 'period', label: 'Period', type: 'text' },
  { key: 'diet', label: 'Diet', type: 'text' },
  { key: 'habitat', label: 'Habitat', type: 'textarea' },
  { key: 'length', label: 'Length', type: 'text' },
  { key: 'height', label: 'Height', type: 'text' },
  { key: 'weight', label: 'Weight', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'discovery_year', label: 'Discovery Year', type: 'number' },
  { key: 'discovered_by', label: 'Discovered By', type: 'text' },
  { key: 'image_url', label: 'Image URL', type: 'text' },
  { key: 'extinction_cause', label: 'Extinction Cause', type: 'textarea' },
];

export const CATEGORIES = [
  'Dinosaur',
  'Marine Reptile',
  'Flying Reptile',
  'Mammal',
  'Cephalopod',
  'Arthropod',
  'Synapsid',
  'Amphibian',
  'Bird',
  'Fish',
] as const;

export const SUGGESTION_TYPE_LABELS: Record<SuggestionType, string> = {
  update: 'Update',
  expansion: 'Expansion',
  fix: 'Correction',
  new_animal: 'New Animal',
};

export const SUGGESTION_TYPE_COLORS: Record<SuggestionType, string> = {
  update: 'bg-blue-100 text-blue-700 border-blue-200',
  expansion: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  fix: 'bg-amber-100 text-amber-700 border-amber-200',
  new_animal: 'bg-purple-100 text-purple-700 border-purple-200',
};
