# Scripts SQL utilitaires Supabase

## Appliquer les migrations

Via Supabase CLI (recommandé) :

```bash
npx supabase link --project-ref VOTRE_PROJECT_REF
npx supabase db push
```

Via le Dashboard Supabase :
1. Allez dans **SQL Editor**
2. Exécutez dans l'ordre :
   - `supabase/migrations/20250629000001_initial_schema.sql`
   - `supabase/migrations/20250629000002_storage_and_rls.sql`

## Créer un compte administrateur

Après avoir activé Auth dans Supabase :

1. Dashboard Supabase → **Authentication** → **Users** → **Add user**
2. Créez un utilisateur avec email/mot de passe
3. Connectez-vous sur `/admin/login`

## Configuration Storage

Les buckets `product-images` et `store-assets` sont créés par la migration.
Vérifiez dans **Storage** que les buckets existent et sont publics.

## Variables d'environnement

Copiez `.env.local.example` vers `.env.local` et remplissez :

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Yalidine (optionnel)

```
YALIDINE_API_ID=
YALIDINE_API_TOKEN=
```

Configurez aussi l'adresse d'expédition dans **Admin → Paramètres → Yalidine**.
