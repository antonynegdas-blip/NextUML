import type { UmlDiagramData } from "@/lib/uml/schemas";
import { generateClassDiagramPuml } from "./class";
import { generateUseCaseDiagramPuml } from "./usecase";
import { generateSequenceDiagramPuml } from "./sequence";
import { generateActivityDiagramPuml } from "./activity";
import { generateStateDiagramPuml } from "./state";

export * from "./escape";
export * from "./class";
export * from "./usecase";
export * from "./sequence";
export * from "./activity";
export * from "./state";

export function generatePlantUml(diagram: UmlDiagramData): string {
  switch (diagram.type) {
    case "class":
      return generateClassDiagramPuml(diagram);
    case "usecase":
      return generateUseCaseDiagramPuml(diagram);
    case "sequence":
      return generateSequenceDiagramPuml(diagram);
    case "activity":
      return generateActivityDiagramPuml(diagram);
    case "state":
      return generateStateDiagramPuml(diagram);
  }
}

