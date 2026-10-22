import { MINIATURA_ALTO, MINIATURA_ANCHO, type Camara } from './puerto';

/** Cámara trasera del dispositivo; cada cuadro se saca a un lienzo y se devuelve como JPEG. */
export function crearCamara(): Camara {
  const lienzo = document.createElement('canvas');
  const diminuto = document.createElement('canvas');
  diminuto.width = MINIATURA_ANCHO;
  diminuto.height = MINIATURA_ALTO;
  let flujo: MediaStream | null = null;
  let video: HTMLVideoElement | null = null;

  const hayImagen = () => video !== null && video.videoWidth > 0;

  return {
    async abrir(elemento) {
      flujo = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      elemento.srcObject = flujo;
      video = elemento;
    },
    cerrar() {
      flujo?.getTracks().forEach((t) => t.stop());
      flujo = null;
      video = null;
    },
    capturar() {
      if (!video || !hayImagen()) return Promise.resolve(null);
      lienzo.width = video.videoWidth;
      lienzo.height = video.videoHeight;
      lienzo.getContext('2d')?.drawImage(video, 0, 0);
      return new Promise((resolver) => lienzo.toBlob(resolver, 'image/jpeg', 0.85));
    },
    miniatura() {
      const contexto = diminuto.getContext('2d', { willReadFrequently: true });
      if (!video || !hayImagen() || !contexto) return null;
      contexto.drawImage(video, 0, 0, MINIATURA_ANCHO, MINIATURA_ALTO);
      const { data } = contexto.getImageData(0, 0, MINIATURA_ANCHO, MINIATURA_ALTO);
      return Uint8Array.from({ length: MINIATURA_ANCHO * MINIATURA_ALTO }, (_, i) => (data[i * 4]! + data[i * 4 + 1]! + data[i * 4 + 2]!) / 3);
    },
  };
}
