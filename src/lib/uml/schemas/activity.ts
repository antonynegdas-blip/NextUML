import { z } from "zod";
import { DiagramThemeSchema } from "./common";

export const ActivityStepKindSchema = z.enum([
  "action",
  "decision",
  "fork",
  "note",
]);
export type ActivityStepKind = z.infer<typeof ActivityStepKindSchema>;

export const ActivityStepSchema = z.object({
  id: z.string(),
  kind: ActivityStepKindSchema.default("action"),
  label: z.string().min(1, "Descrição da etapa é obrigatória"),
  swimlane: z.string().optional().default(""),
  // Para kind === "decision"
  yesLabel: z.string().optional().default("Sim"),
  yesAction: z.string().optional().default(""),
  noLabel: z.string().optional().default("Não"),
  noAction: z.string().optional().default(""),
  // Para kind === "fork" (ações em paralelo separadas por ponto e vírgula ou array)
  parallelActions: z.array(z.string()).optional().default([]),
});
export type ActivityStep = z.infer<typeof ActivityStepSchema>;

export const ActivityDiagramDataSchema = z.object({
  type: z.literal("activity"),
  title: z.string().default("Diagrama de Atividades"),
  theme: DiagramThemeSchema.default("blueprint"),
  swimlanes: z.array(z.string()).default([]),
  steps: z.array(ActivityStepSchema).default([]),
});

export type ActivityDiagramData = z.infer<typeof ActivityDiagramDataSchema>;

