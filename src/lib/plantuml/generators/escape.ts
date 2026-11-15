import type { DiagramTheme } from "@/lib/uml/schemas";
import { sanitizePumlFragment } from "@/lib/security/pumlGuard";

export function escapePumlText(value: string): string {
  return sanitizePumlFragment(value);
}

export function sanitizeAlias(id: string, fallbackPrefix = "node"): string {
  const cleaned = id.replace(/[^a-zA-Z0-9_]/g, "_");
  if (!cleaned || /^[0-9]/.test(cleaned)) {
    return `${fallbackPrefix}_${cleaned || "1"}`;
  }
  return cleaned;
}

export function getThemeSkinparams(theme: DiagramTheme): string[] {
  if (theme === "dark") {
    return [
      "skinparam backgroundColor #0f172a",
      "skinparam defaultFontName 'Inter, Segoe UI, sans-serif'",
      "skinparam defaultFontSize 13",
      "skinparam defaultFontColor #e2e8f0",
      "skinparam shadowing false",
      "skinparam roundcorner 8",
      "skinparam ArrowColor #38bdf8",
      "skinparam ArrowFontColor #cbd5e1",
      "skinparam ClassBackgroundColor #1e293b",
      "skinparam ClassBorderColor #38bdf8",
      "skinparam ClassHeaderBackgroundColor #0f172a",
      "skinparam StateBackgroundColor #1e293b",
      "skinparam StateBorderColor #38bdf8",
      "skinparam ActivityBackgroundColor #1e293b",
      "skinparam ActivityBorderColor #38bdf8",
      "skinparam ActivityDiamondBackgroundColor #0f172a",
      "skinparam ActivityDiamondBorderColor #38bdf8",
      "skinparam UsecaseBackgroundColor #1e293b",
      "skinparam UsecaseBorderColor #38bdf8",
      "skinparam ActorBorderColor #38bdf8",
      "skinparam ActorBackgroundColor #1e293b",
      "skinparam ParticipantBackgroundColor #1e293b",
      "skinparam ParticipantBorderColor #38bdf8",
      "skinparam SequenceLifeLineBorderColor #475569",
      "skinparam SequenceGroupBorderColor #38bdf8",
      "skinparam SequenceGroupBodyBackgroundColor #0f172a",
      "skinparam PackageBorderColor #475569",
      "skinparam PackageFontColor #e2e8f0",
    ];
  }

  if (theme === "classic") {
    return [
      "skinparam backgroundColor #ffffff",
      "skinparam defaultFontName 'Inter, Segoe UI, sans-serif'",
      "skinparam defaultFontSize 13",
      "skinparam shadowing false",
      "skinparam roundcorner 4",
    ];
  }

  // Default: "blueprint" (Technical Precision Studio)
  return [
    "skinparam backgroundColor transparent",
    "skinparam defaultFontName 'Inter, Segoe UI, sans-serif'",
    "skinparam defaultFontSize 13",
    "skinparam defaultFontColor #0f172a",
    "skinparam shadowing false",
    "skinparam roundcorner 8",
    "skinparam ArrowColor #0284c7",
    "skinparam ArrowFontColor #334155",
    "skinparam ClassBackgroundColor #f8fafc",
    "skinparam ClassBorderColor #0284c7",
    "skinparam ClassHeaderBackgroundColor #e0f2fe",
    "skinparam StateBackgroundColor #f8fafc",
    "skinparam StateBorderColor #0284c7",
    "skinparam ActivityBackgroundColor #f8fafc",
    "skinparam ActivityBorderColor #0284c7",
    "skinparam ActivityDiamondBackgroundColor #e0f2fe",
    "skinparam ActivityDiamondBorderColor #0284c7",
    "skinparam UsecaseBackgroundColor #f0f9ff",
    "skinparam UsecaseBorderColor #0284c7",
    "skinparam ActorBorderColor #0284c7",
    "skinparam ActorBackgroundColor #e0f2fe",
    "skinparam ParticipantBackgroundColor #f0f9ff",
    "skinparam ParticipantBorderColor #0284c7",
    "skinparam DatabaseBackgroundColor #e0f2fe",
    "skinparam DatabaseBorderColor #0284c7",
    "skinparam SequenceLifeLineBorderColor #64748b",
    "skinparam SequenceLifeLineBackgroundColor #e0f2fe",
    "skinparam PackageBorderColor #94a3b8",
    "skinparam PackageBackgroundColor #f8fafc",
  ];
}

