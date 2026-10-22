import { useEffect, useState } from 'react';

/** Estado de la conexión del dispositivo (el guardia debe verlo siempre: la app está pensada para trabajar sin señal). */
export function useEnLinea(): boolean {
  const [enLinea, setEnLinea] = useState(() => navigator.onLine);

  useEffect(() => {
    const cambiar = () => setEnLinea(navigator.onLine);
    window.addEventListener('online', cambiar);
    window.addEventListener('offline', cambiar);
    return () => {
      window.removeEventListener('online', cambiar);
      window.removeEventListener('offline', cambiar);
    };
  }, []);

  return enLinea;
}
