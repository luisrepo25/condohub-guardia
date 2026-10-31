import { describe, expect, it } from 'vitest';
import { decidir, ESTADO_INICIAL, pedirReintento } from '../src/features/rostros/domain/freno';

const escena = (valor: number) => new Uint8Array(64).fill(valor);

describe('I3 freno: un cuadro sin rostro no debe dar por atendida la escena', () => {
  it('sin_reintento_una_escena_quieta_igual_a_la_identificada_no_vuelve_a_identificarse', () => {
    let estado = decidir(ESTADO_INICIAL, escena(100), 0).estado; // se identificó (sin rostro) con la persona a medio acomodar
    estado = decidir(estado, escena(104), 6000).estado;
    expect(decidir(estado, escena(104), 12000).identificar).toBe(false);
  });

  it('tras_SIN_ROSTRO_se_reintenta_pasada_la_espera_aunque_la_escena_se_mueva', () => {
    const estado = pedirReintento(decidir(ESTADO_INICIAL, escena(100), 0).estado);
    expect(decidir(estado, escena(180), 6000).identificar).toBe(true); // una persona con la cámara en la mano nunca está quieta
  });

  it('el_reintento_respeta_la_espera_minima_entre_identificaciones', () => {
    const estado = pedirReintento(decidir(ESTADO_INICIAL, escena(100), 0).estado);
    expect(decidir(estado, escena(100), 500).identificar).toBe(false); // 0,5 s < 1 s
    expect(decidir(estado, escena(100), 1000).identificar).toBe(true);
  });

  it('una_escena_nueva_y_quieta_se_identifica_a_los_2_s_y_no_antes', () => {
    const base = decidir(ESTADO_INICIAL, escena(100), 0).estado;
    const llega = decidir(base, escena(140), 500).estado;
    expect(decidir(llega, escena(141), 1500).identificar).toBe(false);
    expect(decidir(llega, escena(141), 2000).identificar).toBe(true);
  });

  it('el_reintento_se_consume_al_identificar_y_no_provoca_un_bucle', () => {
    const estado = pedirReintento(decidir(ESTADO_INICIAL, escena(100), 0).estado);
    const paso = decidir(estado, escena(100), 6000);
    expect(paso.identificar).toBe(true);
    expect(decidir(paso.estado, escena(100), 12000).identificar).toBe(false); // ya no insiste sobre la misma escena
  });

  it('pedirReintento_no_cambia_el_estado_original', () => {
    const estado = decidir(ESTADO_INICIAL, escena(100), 0).estado;
    pedirReintento(estado);
    expect(estado.reintentar).toBeUndefined();
  });
});
