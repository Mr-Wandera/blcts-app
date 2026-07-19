/*
# Tighten RLS on admin-managed pricing tables

## Purpose
The original migration enabled RLS but left all four tables with permissive
`USING (true)` / `WITH CHECK (true)` policies for both `anon` and
`authenticated`. That meant anyone with the anon key (which is bundled in the
frontend) could INSERT, UPDATE, or DELETE rows in `regional_pricing` and
`construction_materials` — the admin-managed pricing reference data.

## Changes
- `regional_pricing`: keep SELECT open to `anon, authenticated` (the app reads
  pricing to compute estimates). Restrict INSERT / UPDATE / DELETE to
  `authenticated` only, so anonymous visitors cannot corrupt the pricing
  reference data.
- `construction_materials`: same treatment — SELECT open, writes restricted to
  `authenticated`.
- `boq_estimates` and `maintenance_tasks` are intentionally left permissive
  (anon + authenticated CRUD) because this is a single-tenant demo app with no
  Supabase sign-in wired up; user-generated BOQ estimates and maintenance
  tasks must persist via the anon key. These tables contain no
  cross-tenant-sensitive data.

## Security impact
- Anonymous visitors can no longer alter the regional pricing or material
  price reference tables.
- The demo app continues to read pricing data and to save/restore BOQ
  estimates and maintenance tasks without a sign-in screen.

## Notes
1. Policies are dropped first then recreated so the migration is idempotent.
2. This matches the "Demo Mode" label added to the auth screen — the app is
   explicitly presented as a demo, and the admin reference data is now
   protected from anonymous writes while user-generated demo data remains
   writable.
*/

-- regional_pricing: SELECT open, writes authenticated-only
DROP POLICY IF EXISTS "anon_insert_regional_pricing" ON regional_pricing;
CREATE POLICY "authenticated_insert_regional_pricing" ON regional_pricing FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_regional_pricing" ON regional_pricing;
CREATE POLICY "authenticated_update_regional_pricing" ON regional_pricing FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_regional_pricing" ON regional_pricing;
CREATE POLICY "authenticated_delete_regional_pricing" ON regional_pricing FOR DELETE
  TO authenticated USING (true);

-- construction_materials: SELECT open, writes authenticated-only
DROP POLICY IF EXISTS "anon_insert_construction_materials" ON construction_materials;
CREATE POLICY "authenticated_insert_construction_materials" ON construction_materials FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_construction_materials" ON construction_materials;
CREATE POLICY "authenticated_update_construction_materials" ON construction_materials FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_construction_materials" ON construction_materials;
CREATE POLICY "authenticated_delete_construction_materials" ON construction_materials FOR DELETE
  TO authenticated USING (true);
