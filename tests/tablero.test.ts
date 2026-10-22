import { describe, expect, it } from 'vitest';
import { eventoDePlaca, eventoDeRostro } from '../src/app/eventos';
import { agregar, MAXIMO_EVENTOS, type Evento } from '../src/features/actividad/domain/evento';
import { describir } from '../src/features/alertas/domain/alerta';
import { aAlerta } from '../src/features/alertas/infrastructure/alertasAcceso';
import { decidir, diferencia, ESTADO_INICIAL } from '../src/features/rostros/domain/freno';

const escena = (valor: number) => new Uint8Array(768).fill(valor);

describe('I3 freno de la identificación automática', () => {
  it('I3_la_primera_escena_se_identifica', () => {
    const paso = decidir(ESTADO_INICIAL, escena(100), 0);
    expect(paso.identificar).toBe(true);
    expect(paso.estado.base).not.toBeNull();
  });

  it('I3_la_misma_persona_quieta_no_se_vuelve_a_identificar', () => {
    let estado = decidir(ESTADO_INICIAL, escena(100), 0).estado;
    for (let i = 0; i < 5; i++) {
      const paso = decidir(estado, escena(100), 6000 * (i + 1));
      expect(paso.identificar).toBe(false);
      estado = paso.estado;
    }
  });

  it('I3_alguien_nuevo_se_identifica_cuando_la_escena_se_estabiliza', () => {
    let estado = decidir(ESTADO_INICIAL, escena(100), 0).estado;
    const moviendose = decidir(estado, escena(140), 6000); // llega alguien: la escena cambia pero aún se mueve
    expect(moviendose.identificar).toBe(false);
    const quieta = decidir(moviendose.estado, escena(141), 12000); // ya quieta y distinta de la identificada
    expect(quieta.identificar).toBe(true);
    estado = quieta.estado;
    expect(decidir(estado, escena(141), 18000).identificar).toBe(false);
  });

  it('I3_aunque_la_escena_cambie_no_se_identifica_antes_de_la_espera', () => {
    const estado = decidir(ESTADO_INICIAL, escena(100), 0).estado;
    const cambiando = decidir(estado, escena(140), 500);
    expect(decidir(cambiando.estado, escena(141), 1000).identificar).toBe(false); // nueva y quieta, pero muy pronto
    expect(decidir(cambiando.estado, escena(141), 6000).identificar).toBe(true);
  });

  it('un cambio pequeño de luz no cuenta como persona nueva', () => {
    const estado = decidir(ESTADO_INICIAL, escena(100), 0).estado;
    const paso = decidir(decidir(estado, escena(104), 6000).estado, escena(104), 12000);
    expect(paso.identificar).toBe(false);
  });

  it('la diferencia es el promedio de cambios por píxel', () => {
    expect(diferencia(escena(10), escena(30))).toBe(20);
  });
});

describe('historial de la jornada', () => {
  const evento = (id: number): Evento => ({ id, hora: new Date(), tipo: 'ROSTRO', titulo: 't', detalle: 'd', nivel: 'ok' });

  it('el más reciente va primero y solo se conservan los últimos', () => {
    let lista: Evento[] = [];
    for (let i = 1; i <= MAXIMO_EVENTOS + 5; i++) lista = agregar(lista, evento(i));
    expect(lista).toHaveLength(MAXIMO_EVENTOS);
    expect(lista[0]!.id).toBe(MAXIMO_EVENTOS + 5);
  });

  it('SIN_ROSTRO no se anota; un reconocido muestra el id corto y la similitud', () => {
    expect(eventoDeRostro({ resultado: 'SIN_ROSTRO', residenteId: null, confianza: 0 })).toBeNull();
    const e = eventoDeRostro({ resultado: 'RECONOCIDO', residenteId: 'cbd94678-0f04', confianza: 0.75 });
    expect(e?.detalle).toBe('Residente cbd94678… · similitud 0.75');
    expect(e?.nivel).toBe('ok');
  });

  it('A4_la_placa_se_anota_con_su_estado_y_confianza', () => {
    const e = eventoDePlaca({ nivel: 'aviso', estado: 'NO REGISTRADA', placa: '9999ZZZ', confianza: 0.97, detalle: '' });
    expect(e).toMatchObject({ tipo: 'PLACA', titulo: 'NO REGISTRADA', detalle: '9999ZZZ · confianza 0.97' });
  });
});

describe('I4 alertas', () => {
  it('I4_un_visitante_del_servicio_ia_se_muestra_como_alerta', () => {
    const a = aAlerta({ clusterId: 'v-1', apariciones: 10, diasDistintos: 1, ultimaVez: '2026-10-22T01:00:00Z', alertadoEn: '2026-10-22T01:50:00Z' });
    expect(a).toMatchObject({ id: 'v-1', tipo: 'VISITANTE_RECURRENTE', apariciones: 10, creadaEn: '2026-10-22T01:50:00Z' });
    expect(describir(a)).toBe('Visitante recurrente no registrado (10 apariciones en 1 día)');
  });


  it('describe al visitante recurrente con sus apariciones', () => {
    expect(describir({ id: 'a', tipo: 'VISITANTE_RECURRENTE', apariciones: 4, diasDistintos: 3, creadaEn: '2026-10-22T00:00:00Z' })).toContain('4 apariciones en 3 días distintos');
  });
});
