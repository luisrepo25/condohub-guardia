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

// TODO(regla): la fuente prevista es `GET /acceso/api/alertas` (acceso.yaml, capa anticorrupción de Acceso); mientras Acceso no lo
// implemente se lee del Servicio IA (`GET /ia/rostros/visitantes-recurrentes`). Al cambiar de fuente solo cambia este adaptador.
export async function listarAlertas(getToken: () => string): Promise<Alerta[]> {
  const r = await fetch(`${GATEWAY}/ia/rostros/visitantes-recurrentes`, { headers: { authorization: `Bearer ${getToken()}` } });
  if (!r.ok) throw new Error(`El Servicio IA respondió ${r.status}`);
  const cuerpo: unknown = await r.json();
  if (!Array.isArray(cuerpo)) throw new Error('Respuesta inesperada del Servicio IA');
  return (cuerpo as VisitanteIa[]).map(aAlerta);
}
