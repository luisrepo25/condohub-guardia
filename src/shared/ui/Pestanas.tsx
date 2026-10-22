interface Props<T extends string> {
  opciones: { id: T; etiqueta: string }[];
  activa: T;
  alCambiar: (id: T) => void;
}

/** Pestañas grandes y accesibles para cambiar de función sin salir de la pantalla. */
export function Pestanas<T extends string>({ opciones, activa, alCambiar }: Props<T>) {
  return (
    <div className="ch-pestanas" role="tablist">
      {opciones.map((o) => (
        <button key={o.id} type="button" role="tab" aria-selected={o.id === activa} onClick={() => alCambiar(o.id)}>
          {o.etiqueta}
        </button>
      ))}
    </div>
  );
}
