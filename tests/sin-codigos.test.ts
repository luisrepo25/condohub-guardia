import { describe, expect, it } from 'vitest';
import { presentar } from '../src/features/rostros/domain/identificacion';
import { sinCodigos } from '../src/shared/lib/sinCodigos';

describe('textos para el guardia sin códigos de regla', () => {
  it('quita uno o varios códigos y conserva la frase', () => {
    expect(sinCodigos('El sistema no abre por reconocimiento facial (A5).')).toBe('El sistema no abre por reconocimiento facial.');
    expect(sinCodigos('Decide el guardia (A4, A5).')).toBe('Decide el guardia.');
    expect(sinCodigos('En 3 cuadros (propuesta de A4, pendiente de confirmar con el equipo).')).toBe('En 3 cuadros.');
  });

  it('no toca lo que no es un código', () => {
    expect(sinCodigos('Placa 1234ABC (registrada) con confianza 0.90')).toBe('Placa 1234ABC (registrada) con confianza 0.90');
  });

  it('A5_I2_ningun_mensaje_de_rostro_muestra_codigos', () => {
    for (const resultado of ['RECONOCIDO', 'DUDOSO', 'DESCONOCIDO', 'SIN_ROSTRO'] as const) {
      const { mensaje } = presentar({ resultado, residenteId: 'r-1', confianza: 0.9 });
      expect(sinCodigos(mensaje)).not.toMatch(/\([A-Z]\d+\)/);
    }
  });
});
