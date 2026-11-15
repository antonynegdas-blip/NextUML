import type { ActivityDiagramData } from "@/lib/uml/schemas";
import { escapePumlText, getThemeSkinparams } from "./escape";

export function generateActivityDiagramPuml(data: ActivityDiagramData): string {
  const lines: string[] = ["@startuml"];

  lines.push(...getThemeSkinparams(data.theme));

  if (data.title.trim()) {
    lines.push(`title "${escapePumlText(data.title)}"`);
  }

  lines.push("");

  let currentSwimlane = "";
  const firstLane = data.steps.find((s) => s.swimlane?.trim())?.swimlane?.trim();
  if (firstLane) {
    currentSwimlane = firstLane;
    lines.push(`|${escapePumlText(currentSwimlane)}|`);
  }

  lines.push("start");

  for (const step of data.steps) {
    const lane = step.swimlane?.trim();
    if (lane && lane !== currentSwimlane) {
      currentSwimlane = lane;
      lines.push(`|${escapePumlText(currentSwimlane)}|`);
    }

    const label = escapePumlText(step.label || "Etapa");

    if (step.kind === "action") {
      lines.push(`:${label};`);
    } else if (step.kind === "note") {
      lines.push(`floating note left: ${label}`);
    } else if (step.kind === "decision") {
      const yesLbl = escapePumlText(step.yesLabel || "Sim");
      const noLbl = escapePumlText(step.noLabel || "Não");
      lines.push(`if (${label}) then (${yesLbl})`);
      if (step.yesAction?.trim()) {
        lines.push(`  :${escapePumlText(step.yesAction)};`);
      }
      lines.push(`else (${noLbl})`);
      if (step.noAction?.trim()) {
        lines.push(`  :${escapePumlText(step.noAction)};`);
      }
      lines.push("endif");
    } else if (step.kind === "fork") {
      const actions = (step.parallelActions || [])
        .map((a) => escapePumlText(a))
        .filter(Boolean);

      if (actions.length === 0) {
        lines.push(`:${label};`);
      } else {
        lines.push("fork");
        actions.forEach((act, idx) => {
          if (idx > 0) {
            lines.push("fork again");
          }
          lines.push(`  :${act};`);
        });
        lines.push("end fork");
      }
    }
  }

  lines.push("stop");
  lines.push("@enduml");
  return lines.join("\n");
}

