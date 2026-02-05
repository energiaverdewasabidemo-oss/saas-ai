/*
  # Corregir función de reseteo de datos diarios

  1. Cambios
    - Actualizar la función `reset_daily_data()` para usar DELETE con cláusula WHERE
    - Agregar WHERE true para permitir eliminación masiva de forma segura
*/

-- Reemplazar función para resetear datos diarios
CREATE OR REPLACE FUNCTION reset_daily_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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