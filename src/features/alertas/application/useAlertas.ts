import { useEffect, useState } from 'react';
import type { Alerta } from '../domain/alerta';
import { listarAlertas } from '../infrastructure/alertasAcceso';

export type EstadoAlertas = 'cargando' | 'ok' | 'no-disponible';
const REFRESCO_MS = 15_000;

/** Alertas, refrescadas cada 15 segundos. Si Acceso no responde, la pantalla sigue funcionando. */
export function useAlertas(getToken: () => string) {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [estado, setEstado] = useState<EstadoAlertas>('cargando');

  useEffect(() => {
    let vivo = true;
    const cargar = () =>
      listarAlertas(getToken)
        .then((lista) => vivo && (setAlertas(lista), setEstado('ok')))
        .catch(() => vivo && setEstado('no-disponible'));
    void cargar();
    const id = setInterval(cargar, REFRESCO_MS);
    return () => {
      vivo = false;
      clearInterval(id);
    };
  }, [getToken]);

  return { alertas, estado };
}
