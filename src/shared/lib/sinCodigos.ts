/** Quita los códigos de regla, como « (A5)» o « (I2)», de un texto que va a leer el guardia. */
export function sinCodigos(texto: string): string {
  return texto.replace(/\s*\((?:[A-Z]\d+(?:,\s*[A-Z]\d+)*|propuesta de [A-Z]\d+[^)]*)\)/g, '');
}
