/*
  # Création de la table pour les types de séances personnalisés

  1. Nouvelle table
    - `custom_workout_types`
      - `id` (uuid, primary key, auto-généré)
      - `created_at` (timestamp with time zone, par défaut now())
      - `coach_id` (uuid, référence vers profiles)
      - `name` (text, nom du type de séance)
      - `color` (text, couleur hexadécimale)

  2. Sécurité
    - Enable RLS sur `custom_workout_types`
    - Les coachs peuvent voir leurs propres types personnalisés (SELECT)
    - Les coachs peuvent créer leurs propres types personnalisés (INSERT)
    - Les coachs peuvent mettre à jour leurs propres types personnalisés (UPDATE)
    - Les coachs peuvent supprimer leurs propres types personnalisés (DELETE)

  3. Relations
    - Clé étrangère vers `profiles` avec suppression en cascade
*/

-- Création de la table pour les types de séances personnalisés
CREATE TABLE IF NOT EXISTS "public"."custom_workout_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "coach_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "color" "text" NOT NULL
);

-- Ajout de la clé primaire
ALTER TABLE "public"."custom_workout_types" OWNER TO "postgres";
ALTER TABLE ONLY "public"."custom_workout_types" ADD CONSTRAINT "custom_workout_types_pkey" PRIMARY KEY (id);

-- Ajout de la clé étrangère vers la table des profiles
ALTER TABLE "public"."custom_workout_types" ADD CONSTRAINT "custom_workout_types_coach_id_fkey" FOREIGN KEY (coach_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Activation de la sécurité au niveau de la ligne (RLS)
ALTER TABLE "public"."custom_workout_types" ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
-- Les coachs peuvent voir leurs propres types personnalisés
CREATE POLICY "Enable read access for own custom workout types"
ON "public"."custom_workout_types"
FOR SELECT
TO "authenticated"
USING ("auth"."uid"() = "coach_id");

-- Les coachs peuvent créer leurs propres types personnalisés
CREATE POLICY "Enable insert for own custom workout types"
ON "public"."custom_workout_types"
FOR INSERT
TO "authenticated"
WITH CHECK ("auth"."uid"() = "coach_id");

-- Les coachs peuvent mettre à jour leurs propres types personnalisés
CREATE POLICY "Enable update for own custom workout types"
ON "public"."custom_workout_types"
FOR UPDATE
TO "authenticated"
USING ("auth"."uid"() = "coach_id")
WITH CHECK ("auth"."uid"() = "coach_id");

-- Les coachs peuvent supprimer leurs propres types personnalisés
CREATE POLICY "Enable delete for own custom workout types"
ON "public"."custom_workout_types"
FOR DELETE
TO "authenticated"
USING ("auth"."uid"() = "coach_id");