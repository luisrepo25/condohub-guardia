# CLAUDE.md — condohub-guardia

**Tablero de portería web** de CondoHub: remoto React para el rol `GUARDIA`, pensado para la tablet de la caseta, siempre en línea. Muestra quién es según la cámara facial, las alertas de visitantes recurrentes y la lectura de placas por el Servicio IA. Responsable: **Erick**. La lectura de placas **sin señal**, los pases QR y la cola offline viven en la **app móvil nativa** (`frontends/movil`, Flutter), requisito del docente; no se repiten aquí.

## Stack

React 18 · Vite · TypeScript · Vitest. Módulo ES con `mount`/`unmount` para el shell (contenedor de Module Federation que expone `./remote`, con su propio React).

## Funciones

| Función | Backend | Reglas |
|---|---|---|
| Leer placa con la cámara (en línea) y decidir | Servicio IA `POST /ia/placas/leer` | A4 (≥ 0.85 permite; menos, decide el guardia) |
| Ver quién es según la cámara facial | Servicio IA | A5, I2 |
| Alertas de visitantes recurrentes | Acceso / IA | I4 |

Fuera de este repo (ahora en `frontends/movil`): ONNX local, validar pase QR, registrar ingreso/salida y cola offline idempotente (A1–A3, O1–O6).

- **Propuesta de Luis (18/10/2026, para revisión de Erick):** `ml/web/demo_webcam/` del repo `condohub-ia` es una demo funcional de la pantalla de placas (webcam → detector ONNX → CNN de TensorFlow en JavaScript → estado PERMITIDO / SUGERIDA / SIN COINCIDENCIA, con confirmación del guardia). La regla propuesta: lectura exacta de una placa registrada con confianza ≥ 0,85 en 2 cuadros coincidentes **o** la misma placa registrada en 3 de los últimos 8 cuadros del OCR (consenso, decidido por Luis el 31/10/2026) → permite; con menos evidencia o a 1 carácter de una registrada → la sugiere y decide el guardia; sin parecido → decide el guardia (A4). **Lector recomendado para la app: el modelo global `cct_xs_v2_global.onnx` (3,2 MB, 37/39 en nuestras placas reales; ver `ml/README.md`, sección 6g), mejor que EasyOCR (6/10) y que la CNN propia.** La decisión vive en `ml/web/demo_webcam/decision.mjs` (lógica pura con 11 pruebas en `probar_decision.mjs`). La CNN solo reconoce de forma fiable la placa de la demo: no sustituye a la decisión del guardia. Detalle y métricas: `ml/README.md` (6e y 6f) de `condohub-ia`.

## Estructura

```
src/
├── app/           # Porteria.tsx (composición), barra de estado
├── features/      # actividad/, alertas/, placas/, rostros/
└── shared/        # cámara, UI y utilidades comunes
```

## Comandos

```bash
npm install
npm run dev          # puerto 5175 (la cámara requiere https o localhost)
npm run test
npm run build && npm run preview
```

## Convenciones

- La app nunca abre la barrera por reconocimiento facial (A5).

## Estado (16/10/2026)

Esqueleto: módulo ES con `mount`/`unmount` que muestra la sesión y consulta `miPerfil` a Gestión (React + Vite, 3 tests, `Dockerfile` con nginx, CI en GitHub Actions). **Tablero de portería (22/10/2026)** (`src/app/Porteria.tsx`, composición; capas de `docs/arquitectura/frontends.md`): una sola cámara compartida (`src/shared/camara/`), pestañas Rostros / Placas, resultado grande con colores por estado, historial de la jornada (`features/actividad`), alertas de visitantes recurrentes (`features/alertas`, `GET /acceso/api/alertas`: Acceso las toma de la IA y las traduce, capa anticorrupción; si no responde muestra un aviso discreto) y barra con el estado de la conexión. **Rostros** (`features/rostros`): modo manual (un cuadro por clic) o **automático con freno por cambio de escena** (`domain/freno.ts`: solo identifica cuando llega alguien nuevo, para no guardar decenas de desconocidos por visita, I3); zona I2 sin abrir nunca (A5); muestra el `residenteId` porque el servicio no devuelve nombre (`TODO(regla)`: la capa anticorrupción de Acceso debe traducirlo). **Placas** (`features/placas`): lectura por `POST /ia/placas/leer` (en línea) y decisión A4 en `decision.ts`; **provisional:** la lista de placas registradas se escribe en pantalla (localStorage) porque Acceso no la expone (`TODO(regla)`). La lectura local con ONNX (O6) se hace en `frontends/movil` (Flutter), no aquí. Los parámetros del freno (`PARAMETROS_FRENO`) están sin calibrar con una cámara real. Cómo correrlo y su contrato con el shell: `README.md`.

**Quién es (31/10/2026, A5):** `ResultadoRostro` y el historial de la jornada muestran «Nombre · unidad» (`quienEs` en `features/rostros/domain`) en lugar del UUID; si el perfil no trae nombre se mantiene «Residente xxxxxxxx…». `tests/quien-es.test.tsx` (42 pruebas en total).

**Reintento tras un cuadro sin rostro (31/10/2026, I3):** en modo automático, un `SIN_ROSTRO` o un error ya no da la escena por atendida: `pedirReintento` (en `freno.ts`) hace que se reintente cada 1 s sin exigir cambio ni quietud (un `SIN_ROSTRO` no se guarda); entre identificaciones normales la espera mínima bajó de 5 s a 2 s. Antes, tras un cuadro sin rostro había que apagar y encender la cámara. `tests/freno-reintento.test.ts` (47 pruebas en total).

**Rediseño (04/11/2026):** tablero a todo el ancho sobre la foto del condominio, con todo el texto en paneles con fondo propio; el resultado va con color de fondo y título grande. `sinCodigos` (`shared/lib`) quita los códigos de regla de lo que lee el guardia sin cambiar los textos del dominio. `.ch-barra` quedó acotada a `.ch-tablero` porque chocaba con la barra del shell.

## Código funcional protegido (obligatorio)

Código en `main` con tests en verde **no se reescribe, refactoriza, renombra ni reformatea** si la tarea no lo pide explícitamente. Lo nuevo se agrega extendiendo (clases, métodos o archivos nuevos). Si es inevitable tocar código funcional, **detente antes de editar**, explica qué archivo/líneas y por qué, y espera confirmación; luego haz el mínimo diff. Nunca edites tests existentes para que pase código nuevo. Corre los tests antes y después: todo lo que pasaba debe seguir pasando. En el resumen, lista cada archivo existente que modificaste.
