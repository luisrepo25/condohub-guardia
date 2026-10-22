import type { Decision } from '../domain/decision';

/** Estado que corresponde a lo leído (A4). Solo presenta: la decisión ya viene calculada. */
export function ResultadoLectura({ decision }: { decision: Decision }) {
  return (
    <div className={`ch-decision ch-decision--${decision.nivel}`} data-estado={decision.estado} role="status">
      <strong>{decision.estado}</strong>
      <span className="ch-placa">{decision.placa}</span>
      <span className="ch-etiqueta">Confianza {decision.confianza.toFixed(2)}</span>
      <p>{decision.detalle}</p>
    </div>
  );
}
