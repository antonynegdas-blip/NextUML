import type { ClassDiagramData, ClassRelationType } from "@/lib/uml/schemas";
import { escapePumlText, getThemeSkinparams, sanitizeAlias } from "./escape";

const RELATION_ARROWS: Record<ClassRelationType, string> = {
  association: "-->",
  inheritance: "--|>",
  implementation: "..|>",
  aggregation: "o--",
  composition: "*--",
  dependency: "..>",
};

export function generateClassDiagramPuml(data: ClassDiagramData): string {
  const lines: string[] = ["@startuml"];

  lines.push(...getThemeSkinparams(data.theme));
  lines.push("skinparam classAttributeIconSize 0");

  if (data.direction === "LR") {
    lines.push("left to right direction");
  } else {
    lines.push("top to bottom direction");
  }

  if (data.title.trim()) {
    lines.push(`title "${escapePumlText(data.title)}"`);
  }

  lines.push("");

  const aliasMap = new Map<string, string>();
  data.classes.forEach((cls, idx) => {
    const alias = sanitizeAlias(cls.id || `cls_${idx}`, "cls");
    aliasMap.set(cls.id, alias);
  });

  for (const cls of data.classes) {
    const alias = aliasMap.get(cls.id) || sanitizeAlias(cls.name, "cls");
    const displayName = escapePumlText(cls.name || "ClasseSemNome");

    let keyword = "class";
    if (cls.kind === "abstract") keyword = "abstract class";
    else if (cls.kind === "interface") keyword = "interface";
    else if (cls.kind === "enum") keyword = "enum";

    lines.push(`${keyword} "${displayName}" as ${alias} {`);

    for (const attr of cls.attributes) {
      if (!attr.name.trim()) continue;
      const staticMod = attr.isStatic ? "{static} " : "";
      const typeSuffix = attr.type?.trim()
        ? ` : ${escapePumlText(attr.type)}`
        : "";
      lines.push(
        `  ${staticMod}${attr.visibility} ${escapePumlText(attr.name)}${typeSuffix}`,
      );
    }

    for (const method of cls.methods) {
      if (!method.name.trim()) continue;
      const abstractMod = method.isAbstract ? "{abstract} " : "";
      const params = escapePumlText(method.params || "");
      const returnSuffix = method.returnType?.trim()
        ? ` : ${escapePumlText(method.returnType)}`
        : "";
      lines.push(
        `  ${abstractMod}${method.visibility} ${escapePumlText(method.name)}(${params})${returnSuffix}`,
      );
    }

    lines.push("}");
    lines.push("");
  }

  for (const rel of data.relationships) {
    const fromAlias = aliasMap.get(rel.fromClassId);
    const toAlias = aliasMap.get(rel.toClassId);
    if (!fromAlias || !toAlias) continue;

    const arrow = RELATION_ARROWS[rel.type] || "-->";
    const fromMult = rel.fromMultiplicity?.trim()
      ? ` "${escapePumlText(rel.fromMultiplicity)}"`
      : "";
    const toMult = rel.toMultiplicity?.trim()
      ? ` "${escapePumlText(rel.toMultiplicity)}"`
      : "";
    const labelPart = rel.label?.trim()
      ? ` : ${escapePumlText(rel.label)}`
      : "";

    lines.push(
      `${fromAlias}${fromMult} ${arrow}${toMult} ${toAlias}${labelPart}`,
    );
  }

  lines.push("@enduml");
  return lines.join("\n");
}

