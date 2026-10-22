import { useCallback, useMemo, useRef, useState } from 'react';
import { Historial, useHistorial } from '../features/actividad';
import { PanelAlertas } from '../features/alertas';
import { PanelPlacas, type Decision } from '../features/placas';
import { PanelRostros, type Identificacion } from '../features/rostros';
import { crearCamara } from '../shared/camara/camaraWeb';
import { useCamara } from '../shared/camara/useCamara';
import { Pestanas } from '../shared/ui/Pestanas';
import { VisorCamara } from '../shared/ui/VisorCamara';
import { BarraEstado } from './BarraEstado';
import { eventoDePlaca, eventoDeRostro } from './eventos';
import estiloTablero from './tablero.css?inline';
import estiloTarjetas from './tarjetas.css?inline';

type Funcion = 'rostros' | 'placas';
const FUNCIONES = [
  { id: 'rostros' as const, etiqueta: 'Rostros' },
  { id: 'placas' as const, etiqueta: 'Placas' },
];

interface Props {
  getToken: () => string;
  nombre: string;
}

/** Tablero del guardia: una cámara, una función a la vez (persona o vehículo), y al lado lo que pasó y lo pendiente. */
export function Porteria({ getToken, nombre }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const camara = useMemo(() => crearCamara(), []);
  const { activa, error, iniciar, detener } = useCamara(camara, video);
  const [funcion, setFuncion] = useState<Funcion>('rostros');
  const { eventos, registrar } = useHistorial();

  const alIdentificar = useCallback(
    (i: Identificacion) => {
      const evento = eventoDeRostro(i);
      if (evento) registrar(evento);
    },
    [registrar],
  );
  const alDecidir = useCallback((d: Decision) => registrar(eventoDePlaca(d)), [registrar]);

  return (
    <div className="ch-tablero">
      <style>{estiloTablero}</style>
      <style>{estiloTarjetas}</style>
      <BarraEstado nombre={nombre} />
      <div className="ch-columnas">
        <section className="ch-columna" aria-label="Cámara">
          <Pestanas opciones={FUNCIONES} activa={funcion} alCambiar={setFuncion} />
          <VisorCamara videoRef={video} activa={activa} error={error} alIniciar={iniciar} alDetener={detener} />
        </section>
        <section className="ch-columna" aria-label="Resultado">
          {funcion === 'rostros' ? (
            <PanelRostros getToken={getToken} camara={camara} activa={activa} alIdentificar={alIdentificar} />
          ) : (
            <PanelPlacas getToken={getToken} camara={camara} activa={activa} alDecidir={alDecidir} />
          )}
          <Historial eventos={eventos} />
          <PanelAlertas getToken={getToken} />
        </section>
      </div>
    </div>
  );
}
