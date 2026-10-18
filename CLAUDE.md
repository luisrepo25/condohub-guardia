# CLAUDE.md — condohub-guardia

**App de portería** de CondoHub: PWA React para el rol `GUARDIA`, pensada para el celular o tablet de la caseta. Funciona **sin señal**: lee placas con un modelo **local** y sincroniza de forma **idempotente**. Responsable: **Erick** (el modelo ONNX lo entrega Luis desde condohub-ia).

## Stack

React 18 · Vite · TypeScript · vite-plugin-pwa (Workbox) · onnxruntime-web (WASM/WebGL) · Dexie (IndexedDB) · html5-qrcode (lectura de QR) · Module Federation (remoto del shell) · Vitest · Playwright.

## Funciones

| Función | Backend | Reglas |
|---|---|---|
| Validar pase QR (online u offline con pases cacheados) | Acceso | A1, A2, O6 |
| Registrar ingreso/salida de visita y vehículo | Acceso `/api/accesos`, `/api/sync` | A3, O1–O4 |
| Leer placa con la cámara en el dispositivo | modelo ONNX local | A4 (≥ 0.85 permite; menos, decide el guardia) |
| Ver quién es según la cámara facial y alertas de visitantes recurrentes | Acceso / IA | A5, I4 |

## Offline e IA local

- El modelo de placas (`placas.onnx`, int8) se descarga de `GET /modelos/placas/actual` del Servicio IA y se guarda en Cache Storage con su versión; se actualiza solo con red.
- Pases vigentes del día se descargan al iniciar turno (`GET /api/pases/guardia`) y se refrescan cada vez que hay red.
- Cola IndexedDB igual que el portal del residente: `idempotencyKey` UUID v4 generado una vez, hora del dispositivo, Background Sync, backoff, `SINCRONIZADA` solo con 2xx. El lote se envía a `/api/sync`.
- Un pase usado offline se marca usado localmente para no aceptarlo dos veces en el mismo dispositivo.
- Indicador visible de estado: en línea / sin conexión / N operaciones pendientes.

- **Propuesta de Luis (18/10/2026, para revisión de Erick):** `ml/web/demo_webcam/` del repo `condohub-ia` es una demo funcional de la pantalla de placas (webcam → detector ONNX → CNN de TensorFlow en JavaScript → estado PERMITIDO / SUGERIDA / SIN COINCIDENCIA, con confirmación del guardia). La regla propuesta: lectura exacta de una placa registrada con confianza ≥ 0,85 en 2 cuadros coincidentes **o** la misma placa registrada en 3 de los últimos 8 cuadros del OCR (consenso, propuesta pendiente de confirmar) → permite; con menos evidencia o a 1 carácter de una registrada → la sugiere y decide el guardia; sin parecido → decide el guardia (A4). **Lector recomendado para la app: el modelo global `cct_xs_v2_global.onnx` (3,2 MB, 37/39 en nuestras placas reales; ver `ml/README.md`, sección 6g), mejor que EasyOCR (6/10) y que la CNN propia.** La decisión vive en `ml/web/demo_webcam/decision.mjs` (lógica pura con 11 pruebas en `probar_decision.mjs`). La CNN solo reconoce de forma fiable la placa de la demo: no sustituye a la decisión del guardia. Detalle y métricas: `ml/README.md` (6e y 6f) de `condohub-ia`.

## Estructura

```
src/
├── features/      # pases/, accesos/, placas/, alertas/
├── offline/       # db.ts, cola.ts, sync.ts, cachePases.ts
├── ml/            # carga del ONNX, preprocesado del frame, posprocesado (NMS + OCR)
└── sw.ts
```

## Comandos

```bash
npm install
npm run dev          # puerto 5175 (la cámara requiere https o localhost)
npm run test
npm run e2e          # Playwright: modo avión, reconexión, sin duplicados
npm run build && npm run preview
```

## Convenciones

- La inferencia corre en un Web Worker para no congelar la UI; medir y mostrar el tiempo por frame en modo dev.
- La app nunca abre la barrera por reconocimiento facial (A5).

## Estado (16/10/2026)

Esqueleto: módulo ES con `mount`/`unmount` que muestra la sesión y consulta `miPerfil` a Gestión (React + Vite, 3 tests, `Dockerfile` con nginx, CI en GitHub Actions). **Faltan todas las pantallas y funciones de este documento.** Cómo correrlo y su contrato con el shell: `README.md`.

## Código funcional protegido (obligatorio)

Código en `main` con tests en verde **no se reescribe, refactoriza, renombra ni reformatea** si la tarea no lo pide explícitamente. Lo nuevo se agrega extendiendo (clases, métodos o archivos nuevos). Si es inevitable tocar código funcional, **detente antes de editar**, explica qué archivo/líneas y por qué, y espera confirmación; luego haz el mínimo diff. Nunca edites tests existentes para que pase código nuevo. Corre los tests antes y después: todo lo que pasaba debe seguir pasando. En el resumen, lista cada archivo existente que modificaste.
