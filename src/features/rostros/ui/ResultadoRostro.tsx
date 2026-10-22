import { candidato, presentar, type Identificacion } from '../domain/identificacion';

/** Zona que corresponde al rostro (I2). Solo presenta: la decisión es del guardia. */
export function ResultadoRostro({ identificacion }: { identificacion: Identificacion }) {
  const p = presentar(identificacion);
  const id = candidato(identificacion);
  return (
    <div className={`ch-decision ch-decision--${p.nivel}`} data-zona={identificacion.resultado} role="status">
      <strong>{p.titulo}</strong>
      {id && <span className="ch-etiqueta">Residente {id.slice(0, 8)}…</span>}
      {identificacion.resultado !== 'SIN_ROSTRO' && <span className="ch-etiqueta">Similitud {identificacion.confianza.toFixed(2)}</span>}
      <p>{p.mensaje}</p>
    </div>
  );
}
