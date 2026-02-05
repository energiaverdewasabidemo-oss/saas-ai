# Configuración de Netlify

## Variables de Entorno Requeridas

Para que tu aplicación funcione correctamente en Netlify, necesitas configurar las siguientes variables de entorno:

### Pasos para configurar:

1. Ve a tu sitio en [Netlify Dashboard](https://app.netlify.com)
2. Selecciona tu sitio
3. Ve a **Site settings** → **Environment variables**
4. Haz clic en **Add a variable** y agrega las siguientes:

#### Variable 1:
- **Key:** `VITE_SUPABASE_URL`
- **Value:** `https://smswwqlxexhvhtkgblgh.supabase.co`

#### Variable 2:
- **Key:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtc3d3cWx4ZXhodmh0a2dibGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNjU2NzAsImV4cCI6MjA4NTg0MTY3MH0.oX5vAl8EozoiyJRDqadBoN5xh_LvK_5KCsE_7Hta0N4`

5. Guarda los cambios
6. Ve a **Deploys**
7. Haz clic en **Trigger deploy** → **Clear cache and deploy site**

## Verificación

Una vez configuradas las variables de entorno y desplegado el sitio:

1. Abre tu sitio en el navegador
2. Abre la consola del navegador (F12)
3. Si ves errores relacionados con Supabase, verifica que las variables de entorno estén correctamente configuradas
4. Si todo está bien, deberías ver tu aplicación funcionando sin la pantalla blanca

## Solución de Problemas

Si sigues viendo una pantalla blanca:

1. Verifica que las variables de entorno estén escritas correctamente (sin espacios extras)
2. Asegúrate de haber hecho un nuevo deploy después de agregar las variables
3. Limpia la caché del navegador (Ctrl + Shift + R o Cmd + Shift + R)
4. Revisa la consola del navegador para ver mensajes de error específicos
