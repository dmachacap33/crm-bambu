# CRM Bambu

Aplicación CRM ligera.

## PWA

Esta versión incluye configuración básica como `manifest.json` y `service-worker.js` para usarlo como PWA y un servidor WebSocket con Baileys para conectar a WhatsApp.

### GitHub Pages

Las rutas de `service-worker.js` y `manifest.json` se manejan de forma relativa para que la aplicación pueda desplegarse en subcarpetas como GitHub Pages. La URL del WebSocket puede personalizarse asignando `window.ENV.WS_URL` antes de cargar la aplicación.

La aplicación incluye un `index.html` que carga los componentes con Babel y módulos ES desde CDN, por lo que basta con habilitar GitHub Pages en la rama principal para probarla.
