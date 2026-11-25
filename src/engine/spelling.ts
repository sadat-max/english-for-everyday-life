// Spelling rules for verb endings. Kept separate so the lessons can show the same rules the engine uses.
const VOWELS = 'aeiou';
const isV = (c: string) => VOWELS.includes(c);

export function sRuleOf(base: string): 's' | 'es' | 'ies' | 'special' {
  if (base === 'have' || base === 'be') return 'special';
  if (/[^aeiou]y$/.test(base)) return 'ies';
  if (/(s|sh|ch|x|z|o)$/.test(base)) return 'es';
  return 's';
}

export function thirdPerson(base: string): string {
  if (base === 'be') return 'is';
  if (base === 'have') return 'has';
  const r = sRuleOf(base);
  if (r === 'ies') return base.slice(0, -1) + 'ies';
  if (r === 'es') return base + 'es';
  return base + 's';
}

export function ingForm(base: string, dbl = false): string {
  if (base === 'be') return 'being';
  if (base.endsWith('ie')) return base.slice(0, -2) + 'ying';
  if (dbl) return base + base[base.length - 1] + 'ing';
  if (base.endsWith('e') && !/(ee|ye|oe)$/.test(base) && base.length > 2) return base.slice(0, -1) + 'ing';
  return base + 'ing';
}

export function edForm(base: string, dbl = false): string {
  if (base.endsWith('e')) return base + 'd';
  if (base.length > 1 && base.endsWith('y') && !isV(base[base.length - 2])) return base.slice(0, -1) + 'ied';
  if (dbl) return base + base[base.length - 1] + 'ed';
  return base + 'ed';
}
