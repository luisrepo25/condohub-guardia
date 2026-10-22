import type { ListaPlacas } from '../application/puertos';

const CLAVE = 'condohub.guardia.placasRegistradas';

// TODO(regla): la lista de placas registradas debe venir de Acceso (hoy no existe el endpoint); mientras tanto queda en este dispositivo.
export const listaLocal: ListaPlacas = {
  cargar() {
    try {
      return localStorage.getItem(CLAVE) ?? '';
    } catch {
      return '';
    }
  },
  guardar(texto) {
    try {
      localStorage.setItem(CLAVE, texto);
    } catch {
      /* sin almacenamiento: la lista vale solo en esta sesión */
    }
  },
};
