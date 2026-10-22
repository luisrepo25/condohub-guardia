import type { LectorPlacas } from '../application/puertos';
import { normalizarPlaca, type Lectura } from '../domain/decision';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL ?? 'http://localhost:8080';

/** Una placa de menos de 4 caracteres no es una lectura útil (mismo criterio que el servicio). */
const LARGO_MINIMO = 4;

/** Envía un cuadro al Servicio IA (`POST /placas/leer`, por el gateway) con el token del shell. No decide el ingreso. */
export async function leerPlaca(imagen: Blob, getToken: () => string): Promise<Lectura> {
  const formulario = new FormData();
  formulario.append('imagen', imagen, 'cuadro.jpg');
  const r = await fetch(`${GATEWAY}/ia/placas/leer`, {
    method: 'POST',
    headers: { authorization: `Bearer ${getToken()}` },
    body: formulario,
  });
  if (r.status === 503) throw new Error('El lector de placas no está disponible');
  if (!r.ok) throw new Error(`El Servicio IA respondió ${r.status}`);
  const cuerpo = (await r.json()) as { resultado: 'PLACA_LEIDA' | 'SIN_PLACA'; placa?: string | null; confianza?: number | null };
  const placa = cuerpo.resultado === 'PLACA_LEIDA' && cuerpo.placa ? normalizarPlaca(cuerpo.placa) : '';
  return placa.length >= LARGO_MINIMO ? { placa, confianza: cuerpo.confianza ?? 0 } : { placa: null, confianza: 0 };
}

export function crearLectorIa(getToken: () => string): LectorPlacas {
  return { leer: (imagen) => leerPlaca(imagen, getToken) };
}
