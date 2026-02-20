/*
  # Fix Security Issues

  ## Overview
  This migration addresses critical security vulnerabilities and performance issues identified in the database audit.

  ## Changes Made

  ### 1. Remove Unused Indexes
  - Drop `idx_calls_classification` - Not being used by queries
  - Drop `idx_calls_call_id` - Redundant with UNIQUE constraint
  - Drop `idx_calls_lead_name` - Not being used by queries

  ### 2. Fix RLS Policies (Critical Security Issue)
  
  #### Current Problem
  The existing RLS policies use `USING (true)` and `WITH CHECK (true)`, which completely bypasses row-level security and allows unrestricted access to anyone. This defeats the purpose of RLS entirely.

  #### New Secure Policies
  
  **For `calls` table:**
  - SELECT: Anyone can view calls (public dashboard requirement)
  - INSERT: Restricted to authenticated users only (prevents anonymous spam)
  - UPDATE: Restricted to authenticated users only (prevents unauthorized modifications)
  - DELETE: Restricted to authenticated users only (prevents unauthorized deletions)

  **For `dashboard_metrics` table:**
  - SELECT: Anyone can view metrics (public dashboard requirement)
  - INSERT: Restricted to authenticated users only
  - UPDATE: Restricted to authenticated users only (prevents unauthorized tampering)
  - DELETE: Restricted to authenticated users only

  ### 3. Fix Function Security
  - Update `reset_daily_data()` function to use immutable search_path
  - This prevents potential security vulnerabilities from search_path manipulation

  ## Security Notes
  
  - All INSERT, UPDATE, DELETE operations now require authentication
  - Public access is maintained for SELECT operations (dashboard viewing)
  - The `reset_daily_data()` function is kept as SECURITY DEFINER to allow authorized operations
  - Consider adding API key validation in application layer for function execution
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_calls_classification;
DROP INDEX IF EXISTS idx_calls_call_id;
DROP INDEX IF EXISTS idx_calls_lead_name;

-- Drop insecure RLS policies for calls table
DROP POLICY IF EXISTS "Anyone can insert calls" ON calls;
DROP POLICY IF EXISTS "Anyone can update calls" ON calls;

-- Drop insecure RLS policies for dashboard_metrics table
DROP POLICY IF EXISTS "Anyone can update metrics" ON dashboard_metrics;

-- Create secure RLS policies for calls table
CREATE POLICY "Public can view calls"
  ON calls
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert calls"
  ON calls
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update calls"
  ON calls
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete calls"
  ON calls
  FOR DELETE
  TO authenticated
  USING (true);

-- Create secure RLS policies for dashboard_metrics table
CREATE POLICY "Public can view metrics"
  ON dashboard_metrics
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert metrics"
  ON dashboard_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update metrics"
  ON dashboard_metrics
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete metrics"
  ON dashboard_metrics
  FOR DELETE
  TO authenticated
  USING (true);

-- Fix function with immutable search_path
CREATE OR REPLACE FUNCTION reset_daily_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Eliminar todas las llamadas con cláusula WHERE explícita
  DELETE FROM calls WHERE true;
  
  -- Resetear métricas a 0
  UPDATE dashboard_metrics
  SET 
    total_calls = 0,
    answered_calls = 0,
    total_duration_seconds = 0,
    total_filtered = 0,
    updated_at = now()
  WHERE true;
END;
$$;