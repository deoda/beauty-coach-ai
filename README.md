# Beauty Coach AI — MVP v0.2

Coach personnel de beauté et de style (PWA).

## Nouveautés v0.2
- Interface améliorée (cartes, badges, modal, navigation)
- Authentification Supabase (inscription / connexion) + mode démo
- Garde-robe avec aperçu d’image et préparation upload Storage
- Styliste IA (mode démo fonctionnel)
- Edge Function Gemini prête
- Bilingue FR/EN

## Installation

```bash
cd beauty-coach-ai
npm install
npm run dev
```

Ouvrir http://localhost:5173 — mode démo opérationnel immédiatement.

## Activer Supabase

1. Créer un projet sur supabase.com
2. Exécuter `supabase/migrations/001_initial_schema.sql` dans le SQL Editor
3. Créer un bucket Storage nommé `wardrobe` (privé)
4. Copier `.env.example` → `.env.local` et remplir les deux variables
5. Redémarrer le serveur

## Activer Gemini

1. Déployer la fonction : `supabase functions deploy analyze-outfit`
2. `supabase secrets set GEMINI_API_KEY=votre-cle`
3. Dans le code, remplacer les appels démo par `supabase.functions.invoke('analyze-outfit', ...)`

## Structure

- `src/pages/` — pages principales + Auth
- `src/lib/ai.ts` — abstraction IA + démo
- `src/lib/supabase.ts` — client
- `supabase/` — migration + Edge Function

Mode démo clair. Aucune clé exposée côté client. 
