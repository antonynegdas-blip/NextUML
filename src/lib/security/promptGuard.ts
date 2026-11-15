const CONTROL_CHARS_RE = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g;
const INVISIBLE_UNICODE_RE = /[\u200b-\u200f\u202a-\u202e\u2060\ufeff]/g;

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|rules?)/i,
  /disregard\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|rules?)/i,
  /ignore\s+(todas\s+as\s+)?instru[cç][oõ]es\s+(anteriores|acima)/i,
  /esque[cç]a\s+(tudo|todas\s+as\s+instru[cç][oõ]es|suas\s+regras)/i,
  /(reveal|show|print|output|repeat|mostre|revele|imprima)\s+(your\s+|seu\s+|suas\s+)?(system\s+prompt|prompt\s+de\s+sistema|initial\s+instructions|regras\s+internas)/i,
  /you\s+are\s+now\s+(DAN|evil|unrestricted|jailbroken)/i,
  /system\s*:\s*override/i,
  /SYSTEM\s+OVERRIDE/,
  /<\/?\s*system\s*>/i,
  /\[INST\]|\[\/INST\]/i,
  /<\|im_start\|>\s*system/i,
  /---\s*BEGIN\s+(TRUSTED|SYSTEM|ADMIN)\s+(CONTEXT|PROMPT|OVERRIDE)/i,
];

/**
 * Remove bytes nulos, caracteres de controle e homógrafos/controles invisíveis Unicode
 * antes de enviar texto do usuário ao LLM.
 */
export function sanitizeUserPrompt(text: string, maxLength = 4000): string {
  return text
    .slice(0, maxLength)
    .replace(CONTROL_CHARS_RE, "")
    .replace(INVISIBLE_UNICODE_RE, "")
    .replace(/\u00a0/g, " ")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

/**
 * Detecta sinais comuns de tentativa de Prompt Injection ou extração de System Prompt.
 */
export function detectPromptInjection(text: string): {
  detected: boolean;
  pattern?: string;
} {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return { detected: true, pattern: pattern.source };
    }
  }
  return { detected: false };
}

/**
 * Isola conteúdo não confiável com delimitadores explícitos para preservar
 * a hierarquia de instruções (System > User Data).
 */
export function wrapUntrustedContext(label: string, content: string): string {
  return `--- BEGIN UNTRUSTED ${label} ---\n${content}\n--- END UNTRUSTED ${label} ---`;
}

/**
 * Mascara possíveis vazamentos de chaves de API em mensagens de erro ou logs.
 */
export function redactSecrets(text: string): string {
  return text
    .replace(/AIza[0-9A-Za-z_-]{20,}/g, "[REDACTED_API_KEY]")
    .replace(/sk-[0-9A-Za-z_-]{16,}/g, "[REDACTED_API_KEY]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED_TOKEN]");
}

