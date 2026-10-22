/** Un hecho de la jornada de portería (lo que el sistema mostró al guardia). Solo vive en la pantalla: el registro oficial es de Acceso (A3). */
export interface Evento {
  id: number;
  hora: Date;
  tipo: 'ROSTRO' | 'PLACA';
  titulo: string;
  detalle: string;
  nivel: 'ok' | 'aviso' | 'mal';
}

export const MAXIMO_EVENTOS = 20;

/** El más reciente primero; se conservan solo los últimos MAXIMO_EVENTOS. */
export function agregar(eventos: Evento[], nuevo: Evento): Evento[] {
  return [nuevo, ...eventos].slice(0, MAXIMO_EVENTOS);
}
