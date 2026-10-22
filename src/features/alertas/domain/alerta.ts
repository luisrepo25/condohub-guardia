/** Alerta que Acceso entrega al guardia; hoy solo existe «visitante recurrente no registrado» (I4). */
export interface Alerta {
  id: string;
  tipo: 'VISITANTE_RECURRENTE';
  clusterId?: string;
  apariciones?: number;
  diasDistintos?: number;
  creadaEn: string;
}

export function describir(a: Alerta): string {
  const dias = a.diasDistintos === 1 ? '1 día' : `${a.diasDistintos} días distintos`;
  const detalle = a.apariciones ? ` (${a.apariciones} apariciones${a.diasDistintos ? ` en ${dias}` : ''})` : "";
  return `Visitante recurrente no registrado${detalle}`;
}
