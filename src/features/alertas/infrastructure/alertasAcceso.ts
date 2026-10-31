import type { Alerta } from '../domain/alerta';

const GATEWAY = import.meta.env.VITE_GATEWAY_URL ?? 'http://localhost:8080';

interface VisitanteIa {
  clusterId: string;
  apariciones: number;
  diasDistintos: number;
  ultimaVez: string;
  alertadoEn?: string | null;
}

export function aAlerta(v: VisitanteIa): Alerta {
  return { id: v.clusterId, tipo: 'VISITANTE_RECURRENTE', clusterId: v.clusterId, apariciones: v.apariciones, diasDistintos: v.diasDistintos, creadaEn: v.alertadoEn ?? v.ultimaVez };
}

// I4: la fuente es Acceso (`GET /acceso/api/alertas`, capa anticorrupción: toma los clústeres de la IA y los traduce a su `Alerta`).
// `aAlerta` queda para quien lea el modelo crudo de la IA, como el móvil.
export async function listarAlertas(getToken: () => string): Promise<Alerta[]> {
  const r = await fetch(`${GATEWAY}/acceso/api/alertas`, { headers: { authorization: `Bearer ${getToken()}` } });
  if (!r.ok) throw new Error(`Acceso respondió ${r.status}`);
  const cuerpo: unknown = await r.json();
  if (!Array.isArray(cuerpo)) throw new Error('Respuesta inesperada de Acceso');
  return cuerpo as Alerta[];
}
