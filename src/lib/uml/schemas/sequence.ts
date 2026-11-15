import { z } from "zod";
import { DiagramThemeSchema } from "./common";

export const SequenceParticipantKindSchema = z.enum([
  "actor",
  "participant",
  "boundary",
  "control",
  "entity",
  "database",
]);
export type SequenceParticipantKind = z.infer<
  typeof SequenceParticipantKindSchema
>;

export const SequenceParticipantSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome do participante é obrigatório"),
  kind: SequenceParticipantKindSchema.default("participant"),
});
export type SequenceParticipant = z.infer<typeof SequenceParticipantSchema>;

export const SequenceArrowKindSchema = z.enum([
  "sync",
  "async",
  "return",
  "create",
]);
export type SequenceArrowKind = z.infer<typeof SequenceArrowKindSchema>;

export const SequenceGroupKindSchema = z.enum([
  "none",
  "alt",
  "else",
  "opt",
  "loop",
]);
export type SequenceGroupKind = z.infer<typeof SequenceGroupKindSchema>;

export const SequenceMessageSchema = z.object({
  id: z.string(),
  fromId: z.string().min(1),
  toId: z.string().min(1),
  label: z.string().min(1, "Mensagem é obrigatória"),
  arrow: SequenceArrowKindSchema.default("sync"),
  activateTarget: z.boolean().optional().default(false),
  deactivateSource: z.boolean().optional().default(false),
  groupKind: SequenceGroupKindSchema.optional().default("none"),
  groupCondition: z.string().optional().default(""),
  note: z.string().optional().default(""),
});
export type SequenceMessage = z.infer<typeof SequenceMessageSchema>;

export const SequenceDiagramDataSchema = z.object({
  type: z.literal("sequence"),
  title: z.string().default("Diagrama de Sequência"),
  theme: DiagramThemeSchema.default("blueprint"),
  autonumber: z.boolean().default(true),
  participants: z.array(SequenceParticipantSchema).default([]),
  messages: z.array(SequenceMessageSchema).default([]),
});

export type SequenceDiagramData = z.infer<typeof SequenceDiagramDataSchema>;

