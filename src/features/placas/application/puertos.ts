import type { Camara } from '../../../shared/camara/puerto';
import type { Lectura } from '../domain/decision';

/** Puertos que la aplicación necesita del mundo exterior; los implementa `infrastructure/`. */
export interface LectorPlacas {
  leer(imagen: Blob): Promise<Lectura>;
}

export interface ListaPlacas {
  cargar(): string;
  guardar(texto: string): void;
}

export interface Puertos {
  lector: LectorPlacas;
  camara: Camara;
  lista: ListaPlacas;
}
