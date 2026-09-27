/*
# Prehistoric Animal Encyclopedia - Database Schema

## Overview
Creates a community-driven prehistoric animal encyclopedia where:
- Each animal has a dedicated page with detailed information
- Community members can suggest updates, expansions, and fixes
- A dedicated editor can review suggestions and apply them

## New Tables

### 1. animals
Stores all prehistoric animal entries. Each row represents one animal page.
- `id` (uuid, PK)
- `name` (text) - common name, e.g. "Tyrannosaurus Rex"
- `scientific_name` (text) - binomial nomenclature
- `category` (text) - dinosaur, marine reptile, flying reptile, synapsid, mammal, amphibian, etc.
- `era` (text) - geological era, e.g. "Mesozoic"
- `period` (text) - specific period, e.g. "Late Cretaceous"
- `diet` (text) - carnivore, herbivore, omnivore
- `habitat` (text) - environment description
- `length` (text) - body length
- `height` (text) - body height
- `weight` (text) - body weight
- `description` (text) - main article body
- `discovery_year` (int) - year first described
- `discovered_by` (text) - paleontologist or team
- `image_url` (text) - representative image URL
- `fun_facts` (text[]) - array of interesting facts
- `extinction_cause` (text) - how/why it went extinct
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 2. suggestions
Stores community-submitted suggestions for animal page improvements.
- `id` (uuid, PK)
- `animal_id` (uuid, FK -> animals, nullable for "new animal" suggestions)
- `contributor_name` (text) - name of the community member
- `suggestion_type` (text) - 'update', 'expansion', 'fix', 'new_animal'
- `field` (text) - which field the suggestion concerns
- `proposed_value` (text) - the suggested new content
- `current_value` (text) - existing content being challenged
- `comment` (text) - explanation from contributor
- `status` (text) - 'pending', 'approved', 'rejected' (default: 'pending')
- `editor_notes` (text) - notes from editor during review
- `created_at` (timestamptz)
- `reviewed_at` (timestamptz)

## Security
- RLS enabled on both tables.
- This is a no-auth (single-tenant) app: all policies use `TO anon, authenticated`
  because the data is intentionally public/shared — anyone can browse and contribute.
- All CRUD is open to anon + authenticated since this is a community wiki model.
*/

-- ===================== ANIMALS TABLE =====================
CREATE TABLE IF NOT EXISTS animals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  scientific_name text,
  category text NOT NULL DEFAULT 'Dinosaur',
  era text,
  period text,
  diet text,
  habitat text,
  length text,
  height text,
  weight text,
  description text,
  discovery_year int,
  discovered_by text,
  image_url text,
  fun_facts text[] DEFAULT '{}',
  extinction_cause text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE animals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_animals" ON animals;
CREATE POLICY "anon_select_animals" ON animals FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_animals" ON animals;
CREATE POLICY "anon_insert_animals" ON animals FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_animals" ON animals;
CREATE POLICY "anon_update_animals" ON animals FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_animals" ON animals;
CREATE POLICY "anon_delete_animals" ON animals FOR DELETE
  TO anon, authenticated USING (true);

-- ===================== SUGGESTIONS TABLE =====================
CREATE TABLE IF NOT EXISTS suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid REFERENCES animals(id) ON DELETE CASCADE,
  contributor_name text NOT NULL DEFAULT 'Anonymous',
  suggestion_type text NOT NULL DEFAULT 'update',
  field text,
  proposed_value text,
  current_value text,
  comment text,
  status text NOT NULL DEFAULT 'pending',
  editor_notes text,
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_suggestions" ON suggestions;
CREATE POLICY "anon_select_suggestions" ON suggestions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_suggestions" ON suggestions;
CREATE POLICY "anon_insert_suggestions" ON suggestions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_suggestions" ON suggestions;
CREATE POLICY "anon_update_suggestions" ON suggestions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_suggestions" ON suggestions;
CREATE POLICY "anon_delete_suggestions" ON suggestions FOR DELETE
  TO anon, authenticated USING (true);

-- ===================== INDEXES =====================
CREATE INDEX IF NOT EXISTS idx_animals_category ON animals(category);
CREATE INDEX IF NOT EXISTS idx_animals_era ON animals(era);
CREATE INDEX IF NOT EXISTS idx_animals_name ON animals(name);
CREATE INDEX IF NOT EXISTS idx_suggestions_animal_id ON suggestions(animal_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);

-- ===================== UPDATED_AT TRIGGER =====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS animals_updated_at ON animals;
CREATE TRIGGER animals_updated_at
  BEFORE UPDATE ON animals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();