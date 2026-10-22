// Decisión de portería para placas (A4) a partir de las lecturas recientes. Lógica pura: sin DOM ni red.
// Port a TypeScript de ml/web/demo_webcam/decision.mjs (repo condohub-ia), solo con el lector global: la CNN propia memoriza una sola placa.
// La confianza del lector NO distingue aciertos de errores de un carácter: la seguridad sale de comparar con la lista de
// placas REGISTRADAS y de exigir varios cuadros. La decisión final siempre es del guardia (A4, A5).

/** Un cuadro leído: placa = texto o null si no se detectó placa. */
export interface Lectura {
  placa: string | null;
  confianza: number;
}

export interface Decision {
  nivel: 'ok' | 'aviso' | 'mal';
  estado: 'PERMITIDO' | 'SUGERIDA: DECIDE EL GUARDIA' | 'NO REGISTRADA' | 'SIN COINCIDENCIA';
  placa: string;
  confianza: number;
  detalle: string;
}

export const PARAMETROS = {
  umbral: 0.85, // A4: confianza de un cuadro para permitir
  cuadrosMinimos: 2, // cuadros coincidentes (misma placa registrada) con confianza ≥ umbral
  ventanaConsenso: 8, // últimos cuadros que se miran para el consenso
  cuadrosConsenso: 3, // propuesta A4 (18/10/2026): la misma placa registrada en al menos 3 de los últimos 8 cuadros
};

/** Mayúsculas y sin separadores (A4). */
export function normalizarPlaca(texto: string): string {
  return texto.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function distanciaEdicion(a: string, b: string): number {
  const fila = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let previo = fila[0]!;
    fila[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const actual = fila[j]!;
      fila[j] = Math.min(fila[j]! + 1, fila[j - 1]! + 1, previo + (a[i - 1] === b[j - 1] ? 0 : 1));
      previo = actual;
    }
  }
  return fila[b.length]!;
}

function contar(placas: string[]): Map<string, number> {
  return placas.reduce((m, t) => m.set(t, (m.get(t) ?? 0) + 1), new Map<string, number>());
}

export function evaluar(reciente: Lectura[], registradas: string[], p = PARAMETROS): Decision | null {
  const leidas = reciente.filter((r): r is Lectura & { placa: string } => r.placa !== null);
  const todas = contar(leidas.map((r) => r.placa));
  const seguras = contar(leidas.filter((r) => r.confianza >= p.umbral).map((r) => r.placa));
  const ventana = contar(
    reciente
      .slice(-p.ventanaConsenso)
      .filter((r) => r.placa)
      .map((r) => r.placa as string),
  );
  const mejorConfianza = (placa: string) => Math.max(...leidas.filter((r) => r.placa === placa).map((r) => r.confianza));

  for (const placa of registradas) {
    if ((seguras.get(placa) ?? 0) >= p.cuadrosMinimos) {
      return { nivel: 'ok', estado: 'PERMITIDO', placa, confianza: mejorConfianza(placa), detalle: `Placa registrada leída con confianza ≥ ${p.umbral} en ${p.cuadrosMinimos} cuadros (A4).` };
    }
  }
  for (const placa of registradas) {
    const n = ventana.get(placa) ?? 0;
    if (n >= p.cuadrosConsenso) {
      return { nivel: 'ok', estado: 'PERMITIDO', placa, confianza: mejorConfianza(placa), detalle: `Consenso: la misma placa registrada en ${n} de los últimos ${p.ventanaConsenso} cuadros (propuesta de A4, pendiente de confirmar con el equipo).` };
    }
  }
  for (const placa of registradas) {
    if ((todas.get(placa) ?? 0) >= 1) {
      return { nivel: 'aviso', estado: 'SUGERIDA: DECIDE EL GUARDIA', placa, confianza: mejorConfianza(placa), detalle: `Se leyó exactamente una placa registrada, pero con poca evidencia (menos de ${p.cuadrosMinimos} cuadros coincidentes): decide el guardia.` };
    }
  }
  let cerca: { placa: string; leida: string; confianza: number } | null = null;
  for (const r of leidas) {
    for (const placa of registradas) {
      if (distanciaEdicion(r.placa, placa) === 1 && (!cerca || r.confianza > cerca.confianza)) cerca = { placa, leida: r.placa, confianza: r.confianza };
    }
  }
  if (cerca) {
    return { nivel: 'aviso', estado: 'SUGERIDA: DECIDE EL GUARDIA', placa: cerca.placa, confianza: cerca.confianza, detalle: `Se leyó ${cerca.leida}, a 1 carácter de una placa registrada: decide el guardia.` };
  }
  for (const [placa, n] of todas) {
    if (!registradas.includes(placa) && n >= p.cuadrosMinimos) {
      return { nivel: 'aviso', estado: 'NO REGISTRADA', placa, confianza: mejorConfianza(placa), detalle: 'Placa leída que no está en la lista de registradas: decide el guardia.' };
    }
  }
  const ultimo = reciente[reciente.length - 1];
  if (!ultimo) return null;
  const conLectura = reciente.slice(-p.ventanaConsenso).filter((r) => r.placa).length;
  return {
    nivel: 'mal',
    estado: 'SIN COINCIDENCIA',
    placa: ultimo.placa ?? '—',
    confianza: ultimo.confianza,
    detalle: `Ninguna lectura segura de una placa registrada: decide el guardia. Cuadros con lectura: ${conLectura} de los últimos ${Math.min(reciente.length, p.ventanaConsenso)}. Mantén la placa quieta y de frente unos segundos.`,
  };
}
