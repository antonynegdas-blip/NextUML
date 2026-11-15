import type {
  SequenceArrowKind,
  SequenceDiagramData,
} from "@/lib/uml/schemas";
import { escapePumlText, getThemeSkinparams, sanitizeAlias } from "./escape";

const ARROW_MAP: Record<SequenceArrowKind, string> = {
  sync: "->",
  async: "->>",
  return: "-->",
  create: "->",
};

export function generateSequenceDiagramPuml(data: SequenceDiagramData): string {
  const lines: string[] = ["@startuml"];

  lines.push(...getThemeSkinparams(data.theme));

  if (data.title.trim()) {
    lines.push(`title "${escapePumlText(data.title)}"`);
  }

  if (data.autonumber) {
    lines.push("autonumber");
  }

  lines.push("");

  const participantAliases = new Map<string, string>();
  data.participants.forEach((p, idx) => {
    const alias = sanitizeAlias(p.id || `p_${idx}`, "p");
    participantAliases.set(p.id, alias);
    const kind = p.kind || "participant";
    lines.push(`${kind} "${escapePumlText(p.name)}" as ${alias}`);
  });

  lines.push("");

  for (const msg of data.messages) {
    const fromAlias = participantAliases.get(msg.fromId);
    const toAlias = participantAliases.get(msg.toId);
    if (!fromAlias || !toAlias) continue;

    const arrow = ARROW_MAP[msg.arrow] || "->";
    const label = escapePumlText(msg.label);

    const hasGroup =
      msg.groupKind && msg.groupKind !== "none" && msg.groupKind !== "else";

    if (hasGroup) {
      const cond = msg.groupCondition?.trim()
        ? ` ${escapePumlText(msg.groupCondition)}`
        : "";
      lines.push(`${msg.groupKind}${cond}`);
    }

    if (msg.arrow === "create") {
      lines.push(`create ${toAlias}`);
    }

    lines.push(`${fromAlias} ${arrow} ${toAlias} : ${label}`);

    if (msg.activateTarget) {
      lines.push(`activate ${toAlias}`);
    }
    if (msg.deactivateSource) {
      lines.push(`deactivate ${fromAlias}`);
    }

    if (msg.note?.trim()) {
      lines.push(`note right: ${escapePumlText(msg.note)}`);
    }

    if (hasGroup) {
      lines.push("end");
    }
  }

  lines.push("@enduml");
  return lines.join("\n");
}

