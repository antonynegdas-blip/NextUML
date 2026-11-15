const FORBIDDEN_PROTO_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/**
 * Faz parsing seguro de JSON removendo chaves de prototype pollution
 * (__proto__, constructor, prototype).
 */
export function safeJsonParse(rawText: string): unknown {
  return JSON.parse(rawText, (key, value) => {
    if (FORBIDDEN_PROTO_KEYS.has(key)) {
      return undefined;
    }
    return value;
  });
}

