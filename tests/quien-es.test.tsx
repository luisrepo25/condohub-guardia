import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { eventoDeRostro } from '../src/app/eventos';
import { quienEs, type Identificacion } from '../src/features/rostros/domain/identificacion';
import { crearIdentificadorIa } from '../src/features/rostros/infrastructure/identificadorIa';
import { ResultadoRostro } from '../src/features/rostros/ui/ResultadoRostro';

afterEach(() => vi.unstubAllGlobals());

const UUID = '625479e8-cc07-4ffd-a5c6-7fe0263acdbe';
const ana: Identificacion = { resultado: 'RECONOCIDO', residenteId: UUID, confianza: 0.91, nombre: 'Ana Pérez', unidadCodigo: 'B-101' };

describe('A5: el guardia ve quién es, no un identificador interno', () => {
  it('A5_quienEs_une_nombre_y_unidad', () => {
    expect(quienEs(ana)).toBe('Ana Pérez · B-101');
    expect(quienEs({ ...ana, unidadCodigo: null })).toBe('Ana Pérez');
  });

  it('A5_sin_nombre_no_hay_quien_es_y_un_desconocido_nunca_lo_tiene', () => {
    expect(quienEs({ ...ana, nombre: null })).toBeNull();
    expect(quienEs({ resultado: 'DESCONOCIDO', residenteId: null, confianza: 0.2, nombre: 'Ana Pérez' })).toBeNull();
  });

  it('A5_la_pantalla_muestra_el_nombre_y_la_unidad_y_no_el_uuid', () => {
    const html = renderToStaticMarkup(<ResultadoRostro identificacion={ana} />);
    expect(html).toContain('Ana Pérez · B-101');
    expect(html).not.toContain('625479e8');
  });

  it('A5_un_dudoso_tambien_muestra_el_candidato_para_que_decida_el_guardia', () => {
    const html = renderToStaticMarkup(<ResultadoRostro identificacion={{ ...ana, resultado: 'DUDOSO' }} />);
    expect(html).toContain('Ana Pérez · B-101');
  });

  it('un_perfil_sin_nombre_registrado_sigue_mostrando_el_residente_abreviado_como_antes', () => {
    const html = renderToStaticMarkup(<ResultadoRostro identificacion={{ ...ana, nombre: null, unidadCodigo: null }} />);
    expect(html).toContain('Residente 625479e8…');
  });

  it('el_historial_de_la_jornada_anota_el_nombre', () => {
    expect(eventoDeRostro(ana)?.detalle).toBe('Ana Pérez · B-101 · similitud 0.91');
  });

  it('el_adaptador_lee_nombre_y_unidad_de_la_respuesta_de_la_IA', async () => {
    const cuerpo = { resultado: 'RECONOCIDO', residenteId: UUID, confianza: 0.91, nombre: 'Ana Pérez', unidadCodigo: 'B-101' };
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(cuerpo) })));

    const r = await crearIdentificadorIa(() => 't').identificar(new Blob(['x']));

    expect(r).toMatchObject({ nombre: 'Ana Pérez', unidadCodigo: 'B-101' });
  });
});
