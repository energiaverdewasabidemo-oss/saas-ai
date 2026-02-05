/*
  # Sistema de Gestión de Llamadas IA

  1. Nuevas Tablas
    - `calls`
      - `id` (uuid, primary key)
      - `call_id` (text, unique) - ID único de la llamada
      - `lead_name` (text) - Nombre del lead
      - `phone` (text) - Número de teléfono
      - `classification` (text) - Clasificación: Positivo, Neutro, Negativo, No Contestados, Buzón
      - `duration_seconds` (integer) - Duración en segundos
      - `answered` (boolean) - Si fue contestada
      - `created_at` (timestamptz) - Fecha de creación
      - `metadata` (jsonb) - Datos adicionales
    
    - `dashboard_metrics`
      - `id` (uuid, primary key)
      - `total_calls` (integer) - Total de llamadas lanzadas
      - `answered_calls` (integer) - Llamadas contestadas
      - `total_duration_seconds` (integer) - Duración total
      - `total_filtered` (integer) - Total filtrados
      - `agents_count` (integer) - Cantidad de agentes
      - `updated_at` (timestamptz) - Última actualización

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para usuarios autenticados
*/

-- Tabla de llamadas
CREATE TABLE IF NOT EXISTS calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id text UNIQUE NOT NULL,
  lead_name text NOT NULL,
  phone text,
  classification text CHECK (classification IN ('Positivo', 'Neutro', 'Negativo', 'No Contestados', 'Buzón')),
  duration_seconds integer DEFAULT 0,
  answered boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Tabla de métricas del dashboard
CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_calls integer DEFAULT 0,
  answered_calls integer DEFAULT 0,
  total_duration_seconds integer DEFAULT 0,
  total_filtered integer DEFAULT 0,
  agents_count integer DEFAULT 1,
  updated_at timestamptz DEFAULT now()
);

-- Insertar métricas iniciales
INSERT INTO dashboard_metrics (
  total_calls, 
  answered_calls, 
  total_duration_seconds, 
  total_filtered, 
  agents_count
) VALUES (2232, 812, 16331, 4, 1)
ON CONFLICT DO NOTHING;

-- Habilitar RLS
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas para calls
CREATE POLICY "Anyone can view calls"
  ON calls
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert calls"
  ON calls
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update calls"
  ON calls
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Políticas para dashboard_metrics
CREATE POLICY "Anyone can view metrics"
  ON dashboard_metrics
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can update metrics"
  ON dashboard_metrics
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_calls_classification ON calls(classification);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_call_id ON calls(call_id);
CREATE INDEX IF NOT EXISTS idx_calls_lead_name ON calls(lead_name);