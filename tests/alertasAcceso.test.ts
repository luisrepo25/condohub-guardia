import { afterEach, describe, expect, it, vi } from 'vitest';
import { listarAlertas } from '../src/features/alertas/infrastructure/alertasAcceso';

afterEach(() => vi.unstubAllGlobals());

const alerta = { id: 'v-1', tipo: 'VISITANTE_RECURRENTE', clusterId: 'v-1', apariciones: 10, diasDistintos: 2, creadaEn: '2026-10-22T01:50:00Z' };

describe('alertas de portería: la fuente es Acceso (capa anticorrupción)', () => {
  it('I4_pide_las_alertas_a_Acceso_con_el_token_del_shell_y_ya_vienen_traducidas', async () => {
    const http = vi.fn(async () => new Response(JSON.stringify([alerta])));
    vi.stubGlobal('fetch', http);

    const r = await listarAlertas(() => 'tok');

    const [url, init] = http.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/\/acceso\/api\/alertas$/);
    expect(url).not.toContain('/ia/');
    expect((init.headers as Record<string, string>).authorization).toBe('Bearer tok');
    expect(r).toEqual([alerta]);
  });

  it('si_Acceso_no_responde_el_error_nombra_a_Acceso', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 503 })));

    await expect(listarAlertas(() => 't')).rejects.toThrow(/Acceso respondió 503/);
  });

  it('una_respuesta_que_no_es_una_lista_se_rechaza', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ alertas: [] }))));

    await expect(listarAlertas(() => 't')).rejects.toThrow(/inesperada/);
  });
});
