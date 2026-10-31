// Presentación de la identificación facial (I2, A5). Lógica pura: sin DOM ni red.
// El servicio solo ASISTE al guardia: ninguna zona abre ni bloquea por sí sola.

export type Zona = 'RECONOCIDO' | 'DUDOSO' | 'DESCONOCIDO' | 'SIN_ROSTRO';

export interface Identificacion {
  resultado: Zona;
  residenteId: string | null;
  confianza: number;
  /** Del perfil del candidato; faltan en perfiles registrados antes de que la IA los guardara. */
  nombre?: string | null;
  unidadCodigo?: string | null;
}

export interface Presentacion {
  nivel: 'ok' | 'aviso' | 'mal';
  titulo: string;
  mensaje: string;
}

export function presentar(i: Identificacion): Presentacion {
  switch (i.resultado) {
    case 'RECONOCIDO':
      return { nivel: 'ok', titulo: 'RECONOCIDO', mensaje: 'Coincide con un residente. Confírmalo tú: el sistema no abre por reconocimiento facial (A5).' };
    case 'DUDOSO':
      return { nivel: 'aviso', titulo: 'DUDOSO: DECIDE EL GUARDIA', mensaje: 'Se parece a un residente, pero no lo bastante para darlo por seguro (I2). Verifica en persona.' };
    case 'DESCONOCIDO':
      return { nivel: 'mal', titulo: 'DESCONOCIDO', mensaje: 'No coincide con ningún residente. Registra la visita manualmente indicando la unidad que autoriza (A2).' };
    case 'SIN_ROSTRO':
      return { nivel: 'aviso', titulo: 'SIN ROSTRO', mensaje: 'No se detectó un rostro. Acércalo a la cámara, de frente y con buena luz.' };
  }
}

/** Quién es el candidato, listo para mostrar («Ana Pérez · B-101»). Solo en RECONOCIDO y DUDOSO y si se conoce el nombre. */
export function quienEs(i: Identificacion): string | null {
  if (!candidato(i) || !i.nombre) return null;
  return i.unidadCodigo ? `${i.nombre} · ${i.unidadCodigo}` : i.nombre;
}

/** Solo hay candidato en las zonas RECONOCIDO y DUDOSO. */
export function candidato(i: Identificacion): string | null {
  return i.resultado === 'RECONOCIDO' || i.resultado === 'DUDOSO' ? i.residenteId : null;
}
