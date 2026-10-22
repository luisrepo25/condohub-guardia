import { useCallback, useEffect, useRef, useState } from 'react';
import { evaluar, normalizarPlaca, PARAMETROS, type Decision, type Lectura } from '../domain/decision';
import type { Puertos } from './puertos';

const INTERVALO_MS = 800;

function aLista(texto: string): string[] {
  return [...new Set(texto.split(/[\s,;]+/).map(normalizarPlaca).filter((p) => p.length >= 4))];
}

/** Estado y casos de uso de la lectura de placas: mientras la cámara está activa lee un cuadro cada tanto y decide (A4). */
export function usePlacas({ lector, camara, lista }: Puertos, activa: boolean) {
  const [texto, setTexto] = useState(lista.cargar);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reciente = useRef<Lectura[]>([]);
  const ocupado = useRef(false);
  const registradas = useRef<string[]>([]);
  registradas.current = aLista(texto);

  const cambiarLista = (valor: string) => {
    setTexto(valor);
    lista.guardar(valor);
  };

  const leerCuadro = useCallback(async () => {
    if (ocupado.current) return;
    ocupado.current = true;
    try {
      const imagen = await camara.capturar();
      if (!imagen) return;
      const lectura = await lector.leer(imagen);
      reciente.current = [...reciente.current, lectura].slice(-PARAMETROS.ventanaConsenso);
      setDecision(evaluar(reciente.current, registradas.current));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo leer la placa');
    } finally {
      ocupado.current = false;
    }
  }, [camara, lector]);

  useEffect(() => {
    reciente.current = [];
    setDecision(null);
    if (!activa) return;
    const id = setInterval(leerCuadro, INTERVALO_MS);
    return () => clearInterval(id);
  }, [activa, leerCuadro]);

  return { texto, cambiarLista, decision, error };
}
