import { useEffect, useMemo } from 'react';
import type { Camara } from '../../../shared/camara/puerto';
import { usePlacas } from '../application/usePlacas';
import type { Decision } from '../domain/decision';
import { crearLectorIa } from '../infrastructure/lectorIa';
import { listaLocal } from '../infrastructure/listaLocal';
import { ResultadoLectura } from './ResultadoLectura';

interface Props {
  getToken: () => string;
  camara: Camara;
  activa: boolean;
  /** Se llama cuando cambia el estado o la placa de la decisión (para el historial de la jornada). */
  alDecidir: (decision: Decision) => void;
}

/** Lectura de placas con la cámara. Nunca abre la barrera: decide el guardia (A4, A5). */
export function PanelPlacas({ getToken, camara, activa, alDecidir }: Props) {
  const puertos = useMemo(() => ({ lector: crearLectorIa(getToken), camara, lista: listaLocal }), [getToken, camara]);
  const { texto, cambiarLista, decision, error } = usePlacas(puertos, activa);
  const clave = decision ? `${decision.estado}|${decision.placa}` : '';

  useEffect(() => {
    if (decision && decision.nivel !== 'mal') alDecidir(decision);
    // Solo cuando cambia lo que se muestra: la confianza cambia en cada cuadro y no es un evento nuevo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  return (
    <div className="ch-panel">
      <p className="ch-etiqueta">Lee la placa mientras la cámara está activa. El sistema solo sugiere: decide el guardia (A4, A5).</p>
      <label className="ch-campo">
        Placas registradas (separadas por espacios o comas)
        <textarea value={texto} onChange={(e) => cambiarLista(e.target.value)} rows={2} placeholder="1234ABC 5678XYZ" />
      </label>
      {error && <p className="ch-error" role="alert">{error}</p>}
      {decision ? <ResultadoLectura decision={decision} /> : <p className="ch-vacio">{activa ? 'Buscando una placa…' : 'Activa la cámara para leer placas.'}</p>}
    </div>
  );
}
