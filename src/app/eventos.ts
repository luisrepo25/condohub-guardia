// Traduce lo que muestran las funciones de portería a eventos del historial de la jornada.
// Vive en app/ porque es composición: una feature no importa de otra.
import type { Evento } from '../features/actividad';
import type { Decision } from '../features/placas';
import { candidato, presentar, type Identificacion } from '../features/rostros';

export type NuevoEvento = Omit<Evento, 'id' | 'hora'>;

/** SIN_ROSTRO no es un hecho de portería: no se anota. */
export function eventoDeRostro(i: Identificacion): NuevoEvento | null {
  if (i.resultado === 'SIN_ROSTRO') return null;
  const id = candidato(i);
  const similitud = `similitud ${i.confianza.toFixed(2)}`;
  const p = presentar(i);
  return { tipo: 'ROSTRO', titulo: p.titulo, detalle: id ? `Residente ${id.slice(0, 8)}… · ${similitud}` : similitud, nivel: p.nivel };
}

export function eventoDePlaca(d: Decision): NuevoEvento {
  return { tipo: 'PLACA', titulo: d.estado, detalle: `${d.placa} · confianza ${d.confianza.toFixed(2)}`, nivel: d.nivel };
}
