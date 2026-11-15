import { z } from "zod";
import { DiagramDirectionSchema, DiagramThemeSchema } from "./common";

export const UseCaseActorKindSchema = z.enum([
  "primary",
  "secondary",
  "external_system",
]);
export type UseCaseActorKind = z.infer<typeof UseCaseActorKindSchema>;

export const UseCaseActorSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome do ator é obrigatório"),
  kind: UseCaseActorKindSchema.default("primary"),
});
export type UseCaseActor = z.infer<typeof UseCaseActorSchema>;

export const UseCaseItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome do caso de uso é obrigatório"),
  description: z.string().optional().default(""),
});
export type UseCaseItem = z.infer<typeof UseCaseItemSchema>;

export const ActorUseCaseLinkSchema = z.object({
  id: z.string(),
  actorId: z.string().min(1),
  useCaseId: z.string().min(1),
});
export type ActorUseCaseLink = z.infer<typeof ActorUseCaseLinkSchema>;

export const UseCaseRelationTypeSchema = z.enum([
  "include",
  "extend",
  "generalization",
]);
export type UseCaseRelationType = z.infer<typeof UseCaseRelationTypeSchema>;

export const UseCaseRelationSchema = z.object({
  id: z.string(),
  fromUseCaseId: z.string().min(1),
  toUseCaseId: z.string().min(1),
  type: UseCaseRelationTypeSchema.default("include"),
});
export type UseCaseRelation = z.infer<typeof UseCaseRelationSchema>;

export const UseCaseDiagramDataSchema = z.object({
  type: z.literal("usecase"),
  title: z.string().default("Diagrama de Casos de Uso"),
  systemName: z.string().default("Sistema"),
  direction: DiagramDirectionSchema.default("LR"),
  theme: DiagramThemeSchema.default("blueprint"),
  actors: z.array(UseCaseActorSchema).default([]),
  useCases: z.array(UseCaseItemSchema).default([]),
  actorLinks: z.array(ActorUseCaseLinkSchema).default([]),
  useCaseRelations: z.array(UseCaseRelationSchema).default([]),
});

export type UseCaseDiagramData = z.infer<typeof UseCaseDiagramDataSchema>;

