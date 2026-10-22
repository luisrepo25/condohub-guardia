import { useCallback, useEffect, useRef, useState } from 'react';
import { decidir, ESTADO_INICIAL } from '../domain/freno';
import type { Identificacion } from '../domain/identificacion';
import type { Puertos } from './puertos';

export type Modo = 'manual' | 'automatico';
const REVISION_MS = 500;

/**
 * Estado de la identificación facial. Manual: un cuadro por acción del guardia. Automático: identifica solo cuando llega
 * alguien nuevo frente a la cámara (freno por cambio de escena), para no guardar decenas de desconocidos por visita (I3).
 */
export function useRostro({ identificador, camara }: Puertos, activa: boolean) {
  const [modo, setModo] = useState<Modo>('manual');
  const [trabajando, setTrabajando] = useState(false);
  const [resultado, setResultado] = useState<Identificacion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ocupado = useRef(false);
  const freno = useRef(ESTADO_INICIAL);

  const identificar = useCallback(async () => {
    if (ocupado.current) return;
    ocupado.current = true;
    setTrabajando(true);
    setError(null);
    try {
      const imagen = await camara.capturar();
      if (!imagen) throw new Error('La cámara aún no entrega imagen');
      setResultado(await identificador.identificar(imagen));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo identificar el rostro');
    } finally {
      ocupado.current = false;
      setTrabajando(false);
    }
  }, [camara, identificador]);

  // La escena de referencia se reinicia solo al activar la cámara o cambiar de modo, no cuando cambian las dependencias del intervalo.
  useEffect(() => {
    freno.current = ESTADO_INICIAL;
  }, [activa, modo]);

  useEffect(() => {
    if (!activa || modo !== 'automatico') return;
    const id = setInterval(() => {
      const miniatura = camara.miniatura();
      if (!miniatura || ocupado.current) return;
      const paso = decidir(freno.current, miniatura, Date.now());
      freno.current = paso.estado;
      if (paso.identificar) void identificar();
    }, REVISION_MS);
    return () => clearInterval(id);
  }, [activa, modo, camara, identificar]);

  return { modo, setModo, trabajando, resultado, error, identificar };
}
