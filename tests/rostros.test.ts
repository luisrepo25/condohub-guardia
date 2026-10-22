import { afterEach, describe, expect, it, vi } from 'vitest';
import { candidato, presentar, type Identificacion } from '../src/features/rostros/domain/identificacion';
import { crearIdentificadorIa } from '../src/features/rostros/infrastructure/identificadorIa';

const id = (resultado: Identificacion['resultado'], residenteId: string | null = null): Identificacion => ({ resultado, residenteId, confianza: 0.8 });

describe('I2 zonas del reconocimiento facial', () => {
  it('A5_ninguna_zona_abre_por_si_sola_el_reconocido_pide_confirmar', () => {
    const p = presentar(id('RECONOCIDO', 'r-1'));
    expect(p.nivel).toBe('ok');
    expect(p.mensaje).toContain('A5');
  });

  it('I2_dudoso_lo_decide_el_guardia', () => {
    expect(presentar(id('DUDOSO', 'r-1')).titulo).toContain('DECIDE EL GUARDIA');
  });

  it('A2_desconocido_se_registra_manualmente', () => {
    const p = presentar(id('DESCONOCIDO'));
    expect(p.nivel).toBe('mal');
    expect(p.mensaje).toContain('manualmente');
  });

  it('sin_rostro_pide_acercarlo', () => {
    expect(presentar(id('SIN_ROSTRO')).titulo).toBe('SIN ROSTRO');
  });

  it('solo_reconocido_y_dudoso_traen_candidato', () => {
    expect(candidato(id('RECONOCIDO', 'r-1'))).toBe('r-1');
    expect(candidato(id('DUDOSO', 'r-2'))).toBe('r-2');
    expect(candidato(id('DESCONOCIDO', 'r-3'))).toBeNull();
  });
});

describe('identificador de rostros (Servicio IA)', () => {
  afterEach(() => vi.unstubAllGlobals());
  const imagen = new Blob(['x'], { type: 'image/jpeg' });

  it('envía el cuadro con el token y traduce la respuesta', async () => {
    const fetchFalso = vi.fn(() =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ resultado: 'DUDOSO', residenteId: 'r-9', confianza: 0.61 }) }),
    );
    vi.stubGlobal('fetch', fetchFalso);

    const r = await crearIdentificadorIa(() => 'tok').identificar(imagen);

    expect(r).toEqual({ resultado: 'DUDOSO', residenteId: 'r-9', confianza: 0.61 });
    const [url, opciones] = fetchFalso.mock.calls[0] as unknown as [string, { headers: Record<string, string> }];
    expect(url).toContain('/ia/rostros/identificar');
    expect(opciones.headers.authorization).toBe('Bearer tok');
  });

  it('503 del servicio se informa sin romper', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 503, json: () => Promise.resolve({}) })));
    await expect(crearIdentificadorIa(() => 't').identificar(imagen)).rejects.toThrow('no está disponible');
  });
});
