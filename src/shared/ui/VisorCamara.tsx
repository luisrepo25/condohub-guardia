import type { RefObject } from 'react';

interface Props {
  videoRef: RefObject<HTMLVideoElement>;
  activa: boolean;
  error: string | null;
  alIniciar: () => void;
  alDetener: () => void;
}

/** Vista de la cámara con un solo botón grande para iniciar o detener (pensado para tocar con guantes o desde lejos). */
export function VisorCamara({ videoRef, activa, error, alIniciar, alDetener }: Props) {
  return (
    <div className="ch-visor">
      <video ref={videoRef} autoPlay playsInline muted />
      <span className={activa ? 'ch-en-vivo ch-en-vivo--activa' : 'ch-en-vivo'}>{activa ? '● EN VIVO' : 'Cámara apagada'}</span>
      <button type="button" className={activa ? 'ch-boton ch-boton--suave' : 'ch-boton'} onClick={activa ? alDetener : alIniciar}>
        {activa ? 'Detener cámara' : 'Iniciar cámara'}
      </button>
      {error && <p className="ch-error" role="alert">{error}</p>}
    </div>
  );
}
