/** Cámara del dispositivo; la comparten las funciones de portería (placas, rostros). */
export interface Camara {
  abrir(video: HTMLVideoElement): Promise<void>;
  cerrar(): void;
  /** Un cuadro en JPEG, o null si la cámara aún no entrega imagen. */
  capturar(): Promise<Blob | null>;
  /** Imagen diminuta en grises (ANCHO × ALTO) para detectar cambios de escena sin red; null si no hay imagen. */
  miniatura(): Uint8Array | null;
}

export const MINIATURA_ANCHO = 32;
export const MINIATURA_ALTO = 24;
