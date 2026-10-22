import { useCallback, useEffect, useState, type RefObject } from 'react';
import type { Camara } from './puerto';

const MENSAJE = 'No se pudo abrir la cámara. Revisa el permiso del navegador (solo funciona en https o localhost).';

/** Ciclo de vida de la cámara: la abre sobre un <video>, la cierra al detener o al desmontar. */
export function useCamara(camara: Camara, video: RefObject<HTMLVideoElement>) {
  const [activa, setActiva] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detener = useCallback(() => {
    camara.cerrar();
    setActiva(false);
  }, [camara]);

  const iniciar = async () => {
    setError(null);
    try {
      if (video.current) await camara.abrir(video.current);
      setActiva(true);
    } catch {
      setError(MENSAJE);
    }
  };

  useEffect(() => detener, [detener]);

  return { activa, error, iniciar, detener };
}
