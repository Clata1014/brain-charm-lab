// Anti-cheat: detect repeated characters (e.g. "aaaaa")
const SPAM_REGEX = /(.)\1{4,}/;

export function detectSpam(text: string): boolean {
  return SPAM_REGEX.test(text);
}

export const SPAM_PENALTY = '❌ INTENTO DE FRAUDE DETECTADO: El sistema identificó texto de relleno o letras repetidas sin sentido. ¡Se te sumó un error disciplinario, redacta una justificación seria!';

interface KeywordRule {
  groups: string[][];           // each sub-array requires at least 1 match
  penaltyMessage: string;
}

export const PRODUCT_KEYWORDS: Record<number, KeywordRule> = {
  0: { // Papel Higiénico
    groups: [
      ['volumen', 'aire', 'bulto', 'espacio'],
      ['flete', 'costo', 'transporte', 'fraccionar', 'mayorista', 'diluir'],
    ],
    penaltyMessage: '❌ REPORTE GERENCIAL RECHAZADO: Tu justificación carece de rigor técnico. Olvidaste mencionar que el papel ocupa mucho VOLUMEN (transportas aire) lo que encarece el FLETE. Es obligatorio usar un MAYORISTA porque las tiendas pequeñas no tienen 50 millones para comprar una tractomula entera ni una megabodega para guardarla. El mayorista absorbe el costo y FRACCIONA la carga. ¡Se ha sumado un error a tu nota final, redacta usando lenguaje logístico!',
  },
  1: { // Celulares
    groups: [
      ['valor', 'robo', 'seguridad', 'riesgo', 'corto', 'exclusivo'],
    ],
    penaltyMessage: '❌ REPORTE RECHAZADO: Un gerente evalúa riesgos. El altísimo VALOR del producto exige canal corto para mitigar el RIESGO de ROBO en bodegas masivas. ¡Tu nota bajó, corrige el texto!',
  },
};

export function validateKeywords(text: string, productIndex: number): string | null {
  const lower = text.toLowerCase();

  // Anti-spam first
  if (detectSpam(lower)) return SPAM_PENALTY;

  const rule = PRODUCT_KEYWORDS[productIndex];
  if (!rule) return null; // no keyword rule for this product

  for (const group of rule.groups) {
    const found = group.some(kw => lower.includes(kw));
    if (!found) return rule.penaltyMessage;
  }

  return null; // passed
}
