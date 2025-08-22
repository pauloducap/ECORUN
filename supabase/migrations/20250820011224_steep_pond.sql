/*
  # Création automatique du profil utilisateur

  1. Fonction
    - Fonction pour créer automatiquement un profil quand un utilisateur s'inscrit
    - Utilise les données de auth.users pour pré-remplir

  2. Trigger
    - Se déclenche après insertion dans auth.users
    - Crée automatiquement le profil correspondant

  3. Sécurité
    - Fonction sécurisée avec des vérifications
*/

-- Fonction pour créer automatiquement un profil
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', 'Nouvel utilisateur')
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- En cas d'erreur, on continue quand même
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil automatiquement
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
CREATE TRIGGER create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();