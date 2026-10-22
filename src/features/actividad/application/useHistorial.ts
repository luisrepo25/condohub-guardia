import { useCallback, useRef, useState } from 'react';
import { agregar, type Evento } from '../domain/evento';

/** Historial de la jornada en memoria; `registrar` es estable para poder usarlo en efectos. */
export function useHistorial() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const siguiente = useRef(1);

  const registrar = useCallback((dato: Omit<Evento, 'id' | 'hora'>) => {
    const evento = { ...dato, id: siguiente.current++, hora: new Date() };
    setEventos((actuales) => agregar(actuales, evento));
  }, []);

  return { eventos, registrar };
}
