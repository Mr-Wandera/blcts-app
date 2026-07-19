/*
# Add projects table and owner-scoped RLS for real auth

## Purpose
The app previously stored projects only in browser localStorage. This
migration creates a `projects` table in Supabase so projects persist across
devices and sessions, and tightens RLS across all user-data tables to enforce
real ownership based on the authenticated Supabase user (replacing the
permissive anon-key policies that existed only because auth was not wired up).

## New table
- `projects`
  - `id` uuid PK (default gen_random_uuid())
  - `user_id` uuid NOT NULL DEFAULT auth.uid() — owner of the project
  - `name` text NOT NULL
  - `location` text NOT NULL DEFAULT ''
  - `county` text NOT NULL DEFAULT 'Nairobi'
  - `building_type` text NOT NULL DEFAULT 'Residential'
  - `construction_standard` text NOT NULL DEFAULT 'Standard'
  - `floor_area_per_floor` numeric NOT NULL DEFAULT 0
  - `floors` integer NOT NULL DEFAULT 1
  - `blueprint_analysis` jsonb — nullable, stores the Gemini analysis result
  - `blueprint_file_name` text — nullable
  - `status` text NOT NULL DEFAULT 'Planning'
  - `created_at` timestamptz DEFAULT now()
  - `updated_at` timestamptz DEFAULT now()

## Security changes
- `projects`: RLS enabled, owner-scoped CRUD (auth.uid() = user_id) for
  authenticated users only.
- `boq_estimates`: replaced permissive anon policies with authenticated-only
  policies scoped to the project owner via a join to `projects`.
- `maintenance_tasks`: same pattern — scoped through the parent project's
  owner.
- `regional_pricing` and `construction_materials`: SELECT open to
  authenticated; writes restricted to authenticated.

## Notes
1. Policies are dropped first then recreated so the migration is idempotent.
2. `user_id` defaults to `auth.uid()` so client inserts that omit `user_id`
   still satisfy the INSERT WITH CHECK policy.
3. The boq_estimates and maintenance_tasks ownership checks use EXISTS
   subqueries against projects so we don't need a redundant user_id column.
4. Assumes Supabase email/password auth is wired in the frontend.
*/

-- ============================================================
-- TABLE: projects
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  location text NOT NULL DEFAULT '',
  county text NOT NULL DEFAULT 'Nairobi',
  building_type text NOT NULL DEFAULT 'Residential',
  construction_standard text NOT NULL DEFAULT 'Standard',
  floor_area_per_floor numeric NOT NULL DEFAULT 0,
  floors integer NOT NULL DEFAULT 1,
  blueprint_analysis jsonb,
  blueprint_file_name text,
  status text NOT NULL DEFAULT 'Planning',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

DROP POLICY IF EXISTS "select_own_projects" ON projects;
CREATE POLICY "select_own_projects" ON projects FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_projects" ON projects;
CREATE POLICY "insert_own_projects" ON projects FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_projects" ON projects;
CREATE POLICY "update_own_projects" ON projects FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_projects" ON projects;
CREATE POLICY "delete_own_projects" ON projects FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- TABLE: boq_estimates — tighten to authenticated, owner-scoped via projects
-- ============================================================
DROP POLICY IF EXISTS "anon_select_boq_estimates" ON boq_estimates;
DROP POLICY IF EXISTS "anon_insert_boq_estimates" ON boq_estimates;
DROP POLICY IF EXISTS "anon_update_boq_estimates" ON boq_estimates;
DROP POLICY IF EXISTS "anon_delete_boq_estimates" ON boq_estimates;

DROP POLICY IF EXISTS "select_own_boq_estimates" ON boq_estimates;
CREATE POLICY "select_own_boq_estimates" ON boq_estimates FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = boq_estimates.property_id::uuid AND projects.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_boq_estimates" ON boq_estimates;
CREATE POLICY "insert_own_boq_estimates" ON boq_estimates FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = boq_estimates.property_id::uuid AND projects.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_boq_estimates" ON boq_estimates;
CREATE POLICY "update_own_boq_estimates" ON boq_estimates FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = boq_estimates.property_id::uuid AND projects.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = boq_estimates.property_id::uuid AND projects.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_boq_estimates" ON boq_estimates;
CREATE POLICY "delete_own_boq_estimates" ON boq_estimates FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = boq_estimates.property_id::uuid AND projects.user_id = auth.uid())
  );

-- ============================================================
-- TABLE: maintenance_tasks — tighten to authenticated, owner-scoped via projects
-- ============================================================
DROP POLICY IF EXISTS "anon_select_maintenance_tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "anon_insert_maintenance_tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "anon_update_maintenance_tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "anon_delete_maintenance_tasks" ON maintenance_tasks;

DROP POLICY IF EXISTS "select_own_maintenance_tasks" ON maintenance_tasks;
CREATE POLICY "select_own_maintenance_tasks" ON maintenance_tasks FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = maintenance_tasks.property_id::uuid AND projects.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_maintenance_tasks" ON maintenance_tasks;
CREATE POLICY "insert_own_maintenance_tasks" ON maintenance_tasks FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = maintenance_tasks.property_id::uuid AND projects.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_maintenance_tasks" ON maintenance_tasks;
CREATE POLICY "update_own_maintenance_tasks" ON maintenance_tasks FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = maintenance_tasks.property_id::uuid AND projects.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = maintenance_tasks.property_id::uuid AND projects.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_maintenance_tasks" ON maintenance_tasks;
CREATE POLICY "delete_own_maintenance_tasks" ON maintenance_tasks FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = maintenance_tasks.property_id::uuid AND projects.user_id = auth.uid())
  );

-- ============================================================
-- TABLE: regional_pricing — tighten SELECT to authenticated
-- ============================================================
DROP POLICY IF EXISTS "anon_select_regional_pricing" ON regional_pricing;
DROP POLICY IF EXISTS "authenticated_select_regional_pricing" ON regional_pricing;
CREATE POLICY "authenticated_select_regional_pricing" ON regional_pricing FOR SELECT
  TO authenticated USING (true);

-- ============================================================
-- TABLE: construction_materials — tighten SELECT to authenticated
-- ============================================================
DROP POLICY IF EXISTS "anon_select_construction_materials" ON construction_materials;
DROP POLICY IF EXISTS "authenticated_select_construction_materials" ON construction_materials;
CREATE POLICY "authenticated_select_construction_materials" ON construction_materials FOR SELECT
  TO authenticated USING (true);
