import type { UseCaseDiagramData } from "@/lib/uml/schemas";
import { escapePumlText, getThemeSkinparams, sanitizeAlias } from "./escape";

export function generateUseCaseDiagramPuml(data: UseCaseDiagramData): string {
  const lines: string[] = ["@startuml"];

  lines.push(...getThemeSkinparams(data.theme));

  if (data.direction === "LR") {
    lines.push("left to right direction");
  } else {
    lines.push("top to bottom direction");
  }

  if (data.title.trim()) {
    lines.push(`title "${escapePumlText(data.title)}"`);
  }

  lines.push("");

  const actorAliases = new Map<string, string>();
  data.actors.forEach((actor, idx) => {
    const alias = sanitizeAlias(actor.id || `act_${idx}`, "act");
    actorAliases.set(actor.id, alias);
    const stereotype =
      actor.kind === "external_system" ? " <<Sistema Externo>>" : "";
    lines.push(
      `actor "${escapePumlText(actor.name)}" as ${alias}${stereotype}`,
    );
  });

  lines.push("");

  const useCaseAliases = new Map<string, string>();
  const systemTitle = escapePumlText(data.systemName || "Sistema");

  lines.push(`rectangle "${systemTitle}" {`);
  data.useCases.forEach((uc, idx) => {
    const alias = sanitizeAlias(uc.id || `uc_${idx}`, "uc");
    useCaseAliases.set(uc.id, alias);
    lines.push(`  usecase "${escapePumlText(uc.name)}" as ${alias}`);
  });
  lines.push("}");
  lines.push("");

  for (const link of data.actorLinks) {
    const actorAlias = actorAliases.get(link.actorId);
    const ucAlias = useCaseAliases.get(link.useCaseId);
    if (!actorAlias || !ucAlias) continue;
    lines.push(`${actorAlias} --> ${ucAlias}`);
  }

  for (const rel of data.useCaseRelations) {
    const fromAlias = useCaseAliases.get(rel.fromUseCaseId);
    const toAlias = useCaseAliases.get(rel.toUseCaseId);
    if (!fromAlias || !toAlias) continue;

    if (rel.type === "generalization") {
      lines.push(`${fromAlias} --|> ${toAlias}`);
    } else if (rel.type === "include") {
      lines.push(`${fromAlias} ..> ${toAlias} : <<include>>`);
    } else if (rel.type === "extend") {
      lines.push(`${fromAlias} ..> ${toAlias} : <<extend>>`);
    }
  }

  lines.push("@enduml");
  return lines.join("\n");
}

