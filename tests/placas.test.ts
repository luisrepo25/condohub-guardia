import { afterEach, describe, expect, it, vi } from 'vitest';
import { distanciaEdicion, evaluar, normalizarPlaca, type Lectura } from '../src/features/placas/domain/decision';
import { leerPlaca } from '../src/features/placas/infrastructure/lectorIa';

const REGISTRADAS = ['2602SIT', '1234ABC'];
const l = (placa: string | null, confianza = 0.95): Lectura => ({ placa, confianza });

describe('A4 decisión de placas', () => {
  it('A4_placa_registrada_con_confianza_alta_en_dos_cuadros_permite', () => {
    const d = evaluar([l('2602SIT'), l('2602SIT')], REGISTRADAS);
    expect(d?.estado).toBe('PERMITIDO');
    expect(d?.placa).toBe('2602SIT');
  });

  it('A4_una_sola_lectura_segura_no_permite_solo_sugiere', () => {
    expect(evaluar([l('2602SIT')], REGISTRADAS)?.estado).toBe('SUGERIDA: DECIDE EL GUARDIA');
  });

  it('A4_consenso_de_tres_cuadros_con_baja_confianza_permite', () => {
    const d = evaluar([l('2602SIT', 0.5), l(null, 0), l('2602SIT', 0.55), l('2602SIT', 0.52)], REGISTRADAS);
    expect(d?.estado).toBe('PERMITIDO');
  });

  it('A4_placa_no_registrada_nunca_se_permite', () => {
    const d = evaluar([l('9999ZZZ', 1), l('9999ZZZ', 1), l('9999ZZZ', 1), l('9999ZZZ', 1)], REGISTRADAS);
    expect(d?.estado).toBe('NO REGISTRADA');
  });

  it('A4_lectura_a_un_caracter_de_una_registrada_solo_sugiere', () => {
    const d = evaluar([l('2602S1T', 0.99), l('2602S1T', 0.99), l('2602S1T', 0.99)], REGISTRADAS);
    expect(d?.estado).toBe('SUGERIDA: DECIDE EL GUARDIA');
    expect(d?.placa).toBe('2602SIT');
  });

  it('A4_sin_placa_leida_no_hay_coincidencia', () => {
    expect(evaluar([l(null, 0), l(null, 0)], REGISTRADAS)?.estado).toBe('SIN COINCIDENCIA');
  });

  it('sin_cuadros_no_hay_decision', () => {
    expect(evaluar([], REGISTRADAS)).toBeNull();
  });

  it('A4_la_placa_se_normaliza_a_mayusculas_sin_separadores', () => {
    expect(normalizarPlaca('1234-abc ')).toBe('1234ABC');
    expect(distanciaEdicion('2602SIT', '2602S1T')).toBe(1);
  });
});

describe('lector de placas (Servicio IA)', () => {
  afterEach(() => vi.unstubAllGlobals());

  const imagen = new Blob(['x'], { type: 'image/jpeg' });

  it('envía el cuadro con el token y normaliza la placa', async () => {
    const fetchFalso = vi.fn(() =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ resultado: 'PLACA_LEIDA', placa: '2602-sit', confianza: 0.91 }) }),
    );
    vi.stubGlobal('fetch', fetchFalso);

    const lectura = await leerPlaca(imagen, () => 'tok');

    expect(lectura).toEqual({ placa: '2602SIT', confianza: 0.91 });
    const [url, opciones] = fetchFalso.mock.calls[0] as unknown as [string, { headers: Record<string, string> }];
    expect(url).toContain('/ia/placas/leer');
    expect(opciones.headers.authorization).toBe('Bearer tok');
  });

  it('SIN_PLACA y lecturas de menos de 4 caracteres no cuentan como placa', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ resultado: 'SIN_PLACA' }) })));
    expect(await leerPlaca(imagen, () => 't')).toEqual({ placa: null, confianza: 0 });
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ resultado: 'PLACA_LEIDA', placa: 'AB1', confianza: 1 }) })));
    expect(await leerPlaca(imagen, () => 't')).toEqual({ placa: null, confianza: 0 });
  });

  it('503 del servicio se informa sin romper', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 503, json: () => Promise.resolve({}) })));
    await expect(leerPlaca(imagen, () => 't')).rejects.toThrow('no está disponible');
  });
});
