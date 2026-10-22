import { useAlertas } from '../application/useAlertas';
import { describir } from '../domain/alerta';

/** Alertas para el guardia (I4). Sin Acceso disponible se muestra un aviso discreto, no un error. */
export function PanelAlertas({ getToken }: { getToken: () => string }) {
  const { alertas, estado } = useAlertas(getToken);

  return (
    <section className="ch-tarjeta" aria-label="Alertas">
      <h3>Alertas</h3>
      {estado === 'cargando' && <p className="ch-vacio">Consultando…</p>}
      {estado === 'no-disponible' && <p className="ch-vacio">No se pudieron consultar las alertas. Se reintentará en unos segundos.</p>}
      {estado === 'ok' && alertas.length === 0 && <p className="ch-vacio">Sin alertas.</p>}
      {alertas.length > 0 && (
        <ul className="ch-historial">
          {alertas.map((a) => (
            <li key={a.id} className="ch-evento ch-evento--aviso">
              <time>{new Date(a.creadaEn).toLocaleString('es-BO')}</time>
              <strong>{describir(a)}</strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
