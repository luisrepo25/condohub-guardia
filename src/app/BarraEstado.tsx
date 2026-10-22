import { useEffect, useState } from 'react';
import { useEnLinea } from '../shared/lib/useEnLinea';

const hora = (d: Date) => d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });

/** Barra superior de la caseta: conexión (siempre visible), turno y hora. */
export function BarraEstado({ nombre }: { nombre: string }) {
  const enLinea = useEnLinea();
  const [ahora, setAhora] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="ch-barra">
      <strong>Portería</strong>
      <span className={enLinea ? 'ch-conexion ch-conexion--ok' : 'ch-conexion ch-conexion--sin'} role="status">
        {enLinea ? '● En línea' : '● Sin conexión'}
      </span>
      <span className="ch-barra-der">
        {nombre} · {hora(ahora)}
      </span>
    </header>
  );
}
