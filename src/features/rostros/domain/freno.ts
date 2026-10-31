// Freno de la identificación automática: se identifica solo cuando LLEGA alguien nuevo, no en cada cuadro.
// Cada DESCONOCIDO identificado se guarda 30 días (I3); si se identificara a la misma persona una y otra vez se llenaría la base.
// Sin red ni modelos: se compara una miniatura en grises de la escena (lógica pura, probada en Node).

export const PARAMETROS_FRENO = {
  cambio: 12, // diferencia media (0-255) frente a la escena de la última identificación para considerar que algo cambió
  estable: 4, // diferencia máxima entre dos miniaturas seguidas para considerar la escena quieta
  esperaMs: 2000, // mínimo entre dos identificaciones, pase lo que pase con la escena (la cámara tiene ruido y cambios de exposición)
  esperaReintentoMs: 1000, // tras un cuadro sin rostro: no se guarda nada (I3), así que se puede insistir más rápido
};

export interface EstadoFreno {
  base: Uint8Array | null; // escena en la última identificación
  anterior: Uint8Array | null;
  ultimaEn: number | null; // marca de tiempo (ms) de la última identificación
  reintentar?: boolean; // la última identificación no vio rostro: se reintenta pasada la espera, sin exigir cambio ni quietud
}

export const ESTADO_INICIAL: EstadoFreno = { base: null, anterior: null, ultimaEn: null };

export function diferencia(a: Uint8Array, b: Uint8Array): number {
  let suma = 0;
  for (let i = 0; i < a.length; i++) suma += Math.abs(a[i]! - b[i]!);
  return suma / a.length;
}

/** Un cuadro sin rostro (o con error) no da por atendida la escena: se reintenta cada `esperaReintentoMs`, esté quieta o no. Un SIN_ROSTRO no se guarda (I3). */
export function pedirReintento(estado: EstadoFreno): EstadoFreno {
  return { ...estado, reintentar: true };
}

/** Decide si hay que identificar con esta miniatura y devuelve el estado siguiente. */
export function decidir(estado: EstadoFreno, actual: Uint8Array, ahora: number, p = PARAMETROS_FRENO): { identificar: boolean; estado: EstadoFreno } {
  if (!estado.base) return { identificar: true, estado: { base: actual, anterior: actual, ultimaEn: ahora } };
  const quieta = estado.anterior !== null && diferencia(estado.anterior, actual) < p.estable;
  const nueva = diferencia(estado.base, actual) >= p.cambio;
  const espera = estado.reintentar === true ? p.esperaReintentoMs : p.esperaMs;
  const descansado = estado.ultimaEn === null || ahora - estado.ultimaEn >= espera;
  const identificar = descansado && (estado.reintentar === true || (quieta && nueva));
  return { identificar, estado: { base: identificar ? actual : estado.base, anterior: actual, ultimaEn: identificar ? ahora : estado.ultimaEn, reintentar: identificar ? false : estado.reintentar } };
}
