/*
  # Habilitar Realtime para las tablas del sistema de llamadas

  1. Configuración
    - Habilitar Realtime en la tabla `calls`
    - Habilitar Realtime en la tabla `dashboard_metrics`
  
  2. Propósito
    - Permite que los cambios en las tablas se transmitan en tiempo real a los clientes conectados
    - Las inserciones, actualizaciones y eliminaciones se notificarán automáticamente
*/

-- Habilitar Realtime para la tabla calls
ALTER PUBLICATION supabase_realtime ADD TABLE calls;

-- Habilitar Realtime para la tabla dashboard_metrics
ALTER PUBLICATION supabase_realtime ADD TABLE dashboard_metrics;