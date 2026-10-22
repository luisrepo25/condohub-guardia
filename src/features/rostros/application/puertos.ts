import type { Camara } from '../../../shared/camara/puerto';
import type { Identificacion } from '../domain/identificacion';

/** Puertos que la aplicación necesita del mundo exterior; los implementa `infrastructure/`. */
export interface IdentificadorRostros {
  identificar(imagen: Blob): Promise<Identificacion>;
}

export interface Puertos {
  identificador: IdentificadorRostros;
  camara: Camara;
}
