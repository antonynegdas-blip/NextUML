export const MAX_PUML_CHARS = 50_000;
export const MAX_PUML_LINES = 1_500;

const DANGEROUS_DIRECTIVE_PATTERNS: { pattern: RegExp; label: string }[] = [
  {
    pattern: /^\s*!\s*(include|include_many|include_once|includesub|import)\b/im,
    label: "!include / !import (inclusão de arquivos ou URLs externas)",
  },
  {
    pattern: /^\s*!\s*(log|dump_memory|exit)\b/im,
    label: "diretiva de sistema (!log / !dump_memory / !exit)",
  },
  {
    pattern: /%\s*(getenv|load_json|file_exists|invoke_procedure|call_user_func)\s*\(/i,
    label: "função de sistema (%getenv / %load_json / %invoke_procedure)",
  },
  {
    pattern: /\[\[\s*(javascript|vbscript|data\s*:\s*text\/html)\s*:/i,
    label: "hyperlink executável (javascript: / vbscript:)",
  },
];

export interface PumlValidationResult {
  safe: boolean;
  reason?: string;
}

/**
 * Valida código PlantUML contra diretivas de inclusão de arquivos, acesso a variáveis
 * de ambiente, links executáveis e payloads excessivos (DoS no browser).
 */
export function validatePumlSafety(code: string): PumlValidationResult {
  if (typeof code !== "string") {
    return { safe: false, reason: "Código PlantUML inválido." };
  }

  if (code.length > MAX_PUML_CHARS) {
    return {
      safe: false,
      reason: `Código PlantUML excede o limite máximo de ${MAX_PUML_CHARS.toLocaleString("pt-BR")} caracteres.`,
    };
  }

  const lineCount = code.split(/\r\n|\r|\n/).length;
  if (lineCount > MAX_PUML_LINES) {
    return {
      safe: false,
      reason: `Código PlantUML excede o limite máximo de ${MAX_PUML_LINES} linhas.`,
    };
  }

  for (const { pattern, label } of DANGEROUS_DIRECTIVE_PATTERNS) {
    if (pattern.test(code)) {
      return {
        safe: false,
        reason: `Diretiva bloqueada por política de segurança: ${label}.`,
      };
    }
  }

  return { safe: true };
}

/**
 * Neutraliza caracteres de controle, bidi overrides e tokens perigosos de PlantUML
 * dentro de textos vindos de formulários ou da IA antes de compilá-los.
 */
export function sanitizePumlFragment(value: string): string {
  return value
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "")
    .replace(/[\u200b-\u200f\u202a-\u202e\u2060\ufeff]/g, "")
    .replace(/\r?\n/g, " ")
    .replace(/"/g, "'")
    .replace(/\[\[\s*(javascript|vbscript|data\s*:)/gi, "[[blocked:")
    .replace(/%\s*(getenv|load_json|file_exists|invoke_procedure)/gi, "blocked_$1")
    .replace(/(^|[\s'"`])!\s*(include|include_many|include_once|includesub|import)\b/gi, "$1blocked_$2")
    .trim();
}
