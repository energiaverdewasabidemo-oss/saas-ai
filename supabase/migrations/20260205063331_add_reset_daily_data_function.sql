/*
  # Agregar función para reiniciar datos diarios

  1. Nuevas Funciones
    - `reset_daily_data()` - Función para limpiar todas las llamadas y resetear métricas del día
      - Elimina todas las llamadas de la tabla `calls`
      - Resetea todos los contadores en `dashboard_metrics` a 0
      - Mantiene el registro de métricas pero con valores en 0

  2. Seguridad
    - La función es accesible públicamente para permitir el reseteo
*/

-- Función para resetear datos diarios
CREATE OR REPLACE FUNCTION reset_daily_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Eliminar todas las llamadas
  DELETE FROM calls;
  
  -- Resetear métricas a 0
  UPDATE dashboard_metrics
  SET 
    total_calls = 0,
    answered_calls = 0,
    total_duration_seconds = 0,
    total_filtered = 0,
    updated_at = now();
END;
$$;

-- Permitir que cualquiera ejecute la función
GRANT EXECUTE ON FUNCTION reset_daily_data() TO public;