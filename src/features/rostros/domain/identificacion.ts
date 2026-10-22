// Presentación de la identificación facial (I2, A5). Lógica pura: sin DOM ni red.
// El servicio solo ASISTE al guardia: ninguna zona abre ni bloquea por sí sola.

export type Zona = 'RECONOCIDO' | 'DUDOSO' | 'DESCONOCIDO' | 'SIN_ROSTRO';

export interface Identificacion {
  resultado: Zona;
  residenteId: string | null;
  confianza: number;
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

/** Solo hay candidato en las zonas RECONOCIDO y DUDOSO. */
export function candidato(i: Identificacion): string | null {
  return i.resultado === 'RECONOCIDO' || i.resultado === 'DUDOSO' ? i.residenteId : null;
}
