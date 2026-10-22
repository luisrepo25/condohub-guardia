import type { IdentificadorRostros } from '../application/puertos';
import type { Identificacion } from '../domain/identificacion';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL ?? 'http://localhost:8080';

/** Envía un cuadro al Servicio IA (`POST /rostros/identificar`, por el gateway) con el token del shell. No decide el ingreso (A5). */
export function crearIdentificadorIa(getToken: () => string): IdentificadorRostros {
  return {
    async identificar(imagen) {
      const formulario = new FormData();
      formulario.append('imagen', imagen, 'cuadro.jpg');
      const r = await fetch(`${GATEWAY}/ia/rostros/identificar`, {
        method: 'POST',
        headers: { authorization: `Bearer ${getToken()}` },
        body: formulario,
      });
      if (r.status === 503) throw new Error('El reconocimiento facial no está disponible');
      if (!r.ok) throw new Error(`El Servicio IA respondió ${r.status}`);
      const c = (await r.json()) as { resultado: Identificacion['resultado']; residenteId?: string | null; confianza?: number | null };
      return { resultado: c.resultado, residenteId: c.residenteId ?? null, confianza: c.confianza ?? 0 };
    },
  };
}
