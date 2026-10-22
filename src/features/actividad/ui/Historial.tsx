import type { Evento } from '../domain/evento';

const hora = (d: Date) => d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

/** Lo último que mostró el sistema en esta jornada, para que el guardia no pierda el hilo. */
export function Historial({ eventos }: { eventos: Evento[] }) {
  return (
    <section className="ch-tarjeta" aria-label="Actividad reciente">
      <h3>Actividad reciente</h3>
      {eventos.length === 0 ? (
        <p className="ch-vacio">Todavía no hay actividad.</p>
      ) : (
        <ul className="ch-historial">
          {eventos.map((e) => (
            <li key={e.id} className={`ch-evento ch-evento--${e.nivel}`}>
              <time>{hora(e.hora)}</time>
              <strong>{e.titulo}</strong>
              <span>{e.detalle}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
