// lib/pin.ts
// Helpers para el PIN de acceso al rol Administrador.
// El PIN se guarda en `restaurants.settings.security.adminPin` (texto plano,
// mismo nivel de seguridad que `general_password`).

/**
 * Normaliza entrada: deja solo dígitos y limita a 6 caracteres.
 * Usado por el keypad para evitar entradas inválidas pegadas.
 */
export function normalizePin(input: string): string {
  return (input || '').replace(/\D/g, '').slice(0, 6);
}

/**
 * Valida que un PIN sea de 4 a 6 dígitos.
 */
export function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}

/**
 * Devuelve el largo del PIN configurado (4, 5 o 6).
 * Si el PIN no es válido, devuelve 4 como default razonable.
 */
export function pinLength(pin: string): 4 | 5 | 6 {
  const len = (pin || '').length;
  if (len >= 4 && len <= 6) return len as 4 | 5 | 6;
  return 4;
}

/**
 * Compara dos PINs de forma segura contra timing attacks.
 * Para un PIN de 4-6 dígitos la diferencia es despreciable, pero
 * dejamos el patrón correcto para futuro.
 */
export function pinsMatch(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
