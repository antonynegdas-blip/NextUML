import { z } from "zod";
import { DiagramDirectionSchema, DiagramThemeSchema } from "./common";

export const StateNodeKindSchema = z.enum([
  "initial",
  "normal",
  "final",
  "choice",
]);
export type StateNodeKind = z.infer<typeof StateNodeKindSchema>;

export const StateNodeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome do estado é obrigatório"),
  kind: StateNodeKindSchema.default("normal"),
  description: z.string().optional().default(""),
  entryAction: z.string().optional().default(""),
  exitAction: z.string().optional().default(""),
});
export type StateNode = z.infer<typeof StateNodeSchema>;

export const StateTransitionSchema = z.object({
  id: z.string(),
  fromStateId: z.string().min(1),
  toStateId: z.string().min(1),
  trigger: z.string().optional().default(""),
  guard: z.string().optional().default(""),
  action: z.string().optional().default(""),
});
export type StateTransition = z.infer<typeof StateTransitionSchema>;

export const StateDiagramDataSchema = z.object({
  type: z.literal("state"),
  title: z.string().default("Diagrama de Máquina de Estados"),
  entityName: z.string().default("Entidade"),
  direction: DiagramDirectionSchema.default("TB"),
  theme: DiagramThemeSchema.default("blueprint"),
  states: z.array(StateNodeSchema).default([]),
  transitions: z.array(StateTransitionSchema).default([]),
});

export type StateDiagramData = z.infer<typeof StateDiagramDataSchema>;

