import type { StateDiagramData } from "@/lib/uml/schemas";
import { escapePumlText, getThemeSkinparams, sanitizeAlias } from "./escape";

export function generateStateDiagramPuml(data: StateDiagramData): string {
  const lines: string[] = ["@startuml"];

  lines.push(...getThemeSkinparams(data.theme));

  if (data.direction === "LR") {
    lines.push("left to right direction");
  } else {
    lines.push("top to bottom direction");
  }

  const titleText = data.title.trim()
    ? `${escapePumlText(data.title)}${data.entityName.trim() ? ` (${escapePumlText(data.entityName)})` : ""}`
    : "";

  if (titleText) {
    lines.push(`title "${titleText}"`);
  }

  lines.push("");

  const stateAliases = new Map<string, string>();

  data.states.forEach((st, idx) => {
    const alias = sanitizeAlias(st.id || `st_${idx}`, "st");
    stateAliases.set(st.id, alias);

    if (st.kind === "choice") {
      lines.push(`state ${alias} <<choice>>`);
      return;
    }

    lines.push(`state "${escapePumlText(st.name)}" as ${alias}`);
    if (st.description?.trim()) {
      lines.push(`${alias} : ${escapePumlText(st.description)}`);
    }
    if (st.entryAction?.trim()) {
      lines.push(`${alias} : entry / ${escapePumlText(st.entryAction)}`);
    }
    if (st.exitAction?.trim()) {
      lines.push(`${alias} : exit / ${escapePumlText(st.exitAction)}`);
    }
  });

  lines.push("");

  // Ponteiros de início [*] --> estado inicial
  for (const st of data.states) {
    if (st.kind === "initial") {
      const alias = stateAliases.get(st.id);
      if (alias) {
        lines.push(`[*] --> ${alias}`);
      }
    }
  }

  for (const tr of data.transitions) {
    const fromAlias = stateAliases.get(tr.fromStateId);
    const toAlias = stateAliases.get(tr.toStateId);
    if (!fromAlias || !toAlias) continue;

    const parts: string[] = [];
    if (tr.trigger?.trim()) parts.push(escapePumlText(tr.trigger));
    if (tr.guard?.trim()) parts.push(`[${escapePumlText(tr.guard)}]`);
    if (tr.action?.trim()) parts.push(`/ ${escapePumlText(tr.action)}`);

    const labelSuffix = parts.length > 0 ? ` : ${parts.join(" ")}` : "";
    lines.push(`${fromAlias} --> ${toAlias}${labelSuffix}`);
  }

  // Ponteiros de fim estado final --> [*]
  for (const st of data.states) {
    if (st.kind === "final") {
      const alias = stateAliases.get(st.id);
      if (alias) {
        lines.push(`${alias} --> [*]`);
      }
    }
  }

  lines.push("@enduml");
  return lines.join("\n");
}

