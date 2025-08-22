/*
  # Schéma EcoRun - Tables pour activités et utilisateurs

  1. Nouvelles Tables
    - `profiles`
      - `id` (uuid, clé primaire, référence auth.users)
      - `name` (text)
      - `email` (text)
      - `age` (integer)
      - `weight` (integer, en kg)
      - `height` (integer, en cm)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `activities`
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, référence profiles)
      - `activity_type` (enum: running, biking)
      - `duration` (integer, en secondes)
      - `distance` (numeric, en km)
      - `pace` (numeric, minutes par km)
      - `co2_saved` (numeric, en kg)
      - `life_gained` (numeric, en heures)
      - `positions` (jsonb, array des positions GPS)
      - `created_at` (timestamp)

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Politiques pour que les utilisateurs ne voient que leurs propres données
    - Politique pour permettre l'insertion de nouvelles activités

  3. Index
    - Index sur user_id pour les requêtes rapides
    - Index sur created_at pour le tri chronologique
*/

-- Créer le type enum pour les activités
CREATE TYPE activity_type AS ENUM ('running', 'biking');

-- Table des profils utilisateur
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  age integer DEFAULT NULL,
  weight integer DEFAULT NULL,
  height integer DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des activités
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  duration integer NOT NULL DEFAULT 0,
  distance numeric(8,3) NOT NULL DEFAULT 0,
  pace numeric(6,3) NOT NULL DEFAULT 0,
  co2_saved numeric(8,3) NOT NULL DEFAULT 0,
  life_gained numeric(8,3) NOT NULL DEFAULT 0,
  positions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Politiques pour profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Politiques pour activities
CREATE POLICY "Users can read own activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON activities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON activities
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS activities_user_id_idx ON activities(user_id);
CREATE INDEX IF NOT EXISTS activities_created_at_idx ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS activities_activity_type_idx ON activities(activity_type);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();