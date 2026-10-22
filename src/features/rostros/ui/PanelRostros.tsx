import { useEffect, useMemo } from 'react';
import type { Camara } from '../../../shared/camara/puerto';
import { useRostro } from '../application/useRostro';
import type { Identificacion } from '../domain/identificacion';
import { crearIdentificadorIa } from '../infrastructure/identificadorIa';
import { ResultadoRostro } from './ResultadoRostro';

interface Props {
  getToken: () => string;
  camara: Camara;
  activa: boolean;
  /** Se llama con cada identificación nueva (para el historial de la jornada). */
  alIdentificar: (identificacion: Identificacion) => void;
}

/** Reconocimiento facial en portería: asiste al guardia, nunca abre la barrera (A5). */
export function PanelRostros({ getToken, camara, activa, alIdentificar }: Props) {
  const puertos = useMemo(() => ({ identificador: crearIdentificadorIa(getToken), camara }), [getToken, camara]);
  const { modo, setModo, trabajando, resultado, error, identificar } = useRostro(puertos, activa);

  useEffect(() => {
    if (resultado) alIdentificar(resultado);
  }, [resultado, alIdentificar]);

  return (
    <div className="ch-panel">
      <div className="ch-conmutador" role="group" aria-label="Modo de identificación">
        <button type="button" aria-pressed={modo === 'manual'} onClick={() => setModo('manual')}>Manual</button>
        <button type="button" aria-pressed={modo === 'automatico'} onClick={() => setModo('automatico')}>Automático</button>
      </div>
      <p className="ch-etiqueta">
        {modo === 'manual' ? 'El guardia pulsa Identificar cuando alguien está frente a la cámara.' : 'Identifica solo cuando llega alguien nuevo frente a la cámara.'} Asiste al guardia: no abre ni bloquea (A5).
      </p>
      {modo === 'manual' && (
        <button type="button" className="ch-boton" onClick={identificar} disabled={!activa || trabajando}>
          {trabajando ? 'Identificando…' : 'Identificar rostro'}
        </button>
      )}
      {modo === 'automatico' && trabajando && <p className="ch-etiqueta" role="status">Identificando…</p>}
      {error && <p className="ch-error" role="alert">{error}</p>}
      {resultado ? <ResultadoRostro identificacion={resultado} /> : <p className="ch-vacio">Sin identificaciones todavía.</p>}
    </div>
  );
}
