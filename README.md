# CRM Agua Bambú (Kommo‑style) + WhatsApp (Baileys QR) + IA por etapa

Mini‑CRM inspirado en **Kommo** con embudos de ventas, tarjetas arrastrables, chat interno por tarjeta, chat con el cliente vía WhatsApp y una IA distinta por etapa del embudo. Incluye conexión **WhatsApp Web con Baileys** por QR y canaliza los leads entrantes al embudo “Leads”.

## Demo rápida

```bash
npm install
cp .env.example .env  # completa valores si usarás IA
npm run start
# abre http://localhost:8080
```

En el header, toca **“Conectar WhatsApp”** → escanea el **QR** con tu app de WhatsApp (Dispositivos vinculados).

> **Nota:** Baileys mantiene la sesión en `tmp/baileys_auth`. Si cambias de número o reinstalas, borra esa carpeta.

## Flujo de trabajo

- **Leads entrantes**: cuando alguien escribe al WhatsApp vinculado, se crea/actualiza una tarjeta en el embudo **Leads** con su nombre (pushName) y número.
- **Kanban**: arrastra tarjetas entre etapas: *Leads → Contactado → Cotización → Cierre*.
- **Campos clave** por tarjeta: **recarga**, **ubicación**, **fecha de entrega**, **nombre**, **celular**, **tipo de distribuidor** y **asignación**.
- **Chat interno** (no visible para el cliente) y **Chat con cliente** (vía WhatsApp). Puedes conmutar pestañas por tarjeta.
- **IA por etapa**: botón **💡 IA** usa un *assistant* distinto según la etapa.
- **QR**: el QR aparece en un modal (y se actualiza en tiempo real).

## Integración con BuilderBot (repo `builderbot-openai-assistants`)

Este proyecto **puede** delegar las respuestas de IA a un microservicio del repo público de Leifer Méndez:
- Repo: https://github.com/leifermendez/builderbot-openai-assistants
- Pasos (según su README):
  1) `pnpm install`
  2) añadir `.env` con `PORT=3008` y `ASSISTANT_ID=...`
  3) `pnpm run dev`  → corre en `http://localhost:3008`
- En **este CRM**, define `BUILDERBOT_URL=http://localhost:3008` en tu `.env`.  
  El servidor llamará `POST /api/assistant` (se asume un endpoint de orquestación). Si no lo expones, el sistema hace **fallback a OpenAI** con `OPENAI_API_KEY`.

> Alternativamente, puedes usar de forma directa los paquetes del ecosistema BuilderBot (provider Baileys / plugins de OpenAI) dentro de este servidor.

## Variables de entorno

- `PORT` Puerto HTTP del CRM (default `8080`).
- `BUILDERBOT_URL` URL del microservicio BuilderBot (opcional).
- `OPENAI_API_KEY` Clave si quieres usar el *fallback* OpenAI Responses API.
- `ASST_LEADS`, `ASST_CONTACTADO`, `ASST_COTIZACION`, `ASST_CIERRE`: IDs de asistentes por etapa.

## Script/Comandos

- `npm start` → Inicia el servidor y arranca la conexión WhatsApp.
- `npm run dev` → Inicia con autoreload (Node `--watch`).

## Estructura

- `server/index.js`  → API REST + Socket.IO + orquestación.
- `server/whatsapp.js` → Conexión Baileys + emisión de eventos (`qr`, `ready`, `disconnected`, `message`).
- `server/ai.js` → Cliente BuilderBot o OpenAI (fallback).
- `server/db.js` → Persistencia simple en `data/db.json`.
- `public/*` → SPA sin build (Tailwind CDN).

## Consideraciones importantes

- **Baileys QR / multi‑dispositivo:** la sesión se autentica escaneando un **QR** desde tu WhatsApp y queda persistida (ver carpeta `tmp/baileys_auth`).  
- **Privacidad del chat interno:** todo lo que escribas en la pestaña *Chat interno* **no** se envía al cliente; queda en DB local para el equipo.
- **Chat con cliente:** envía por WhatsApp al `whatsappJid` de la tarjeta. Si creaste la tarjeta manualmente, escribe solo el número (sin + ni espacios) para autocompletar el JID.
- **Distribuidores:** el campo “Tipo de distribuidor” y “Asignar distribuidor” hoy son informativos; puedes ampliar lógica de reparto/envío según tu operación.

## Roadmap corto (puedes extender)

- Autorización/roles (admin, comerciales, distribuidores).
- Subida de archivos (foto de entrega) y estado de pedido.
- Geolocalización (mapa de ruta para el distribuidor).
- Métricas (conversiones por etapa, tasa de respuesta).

---

**Marca:** Agua Bambú. **Objetivo:** un CRM práctico, minimalista y extensible para operar ventas por WhatsApp con pipelines al estilo Kommo.
