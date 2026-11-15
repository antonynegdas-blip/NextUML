import { z } from "zod";
import { DiagramDirectionSchema, DiagramThemeSchema } from "./common";

export const VisibilitySchema = z.enum(["+", "-", "#", "~"]);
export type Visibility = z.infer<typeof VisibilitySchema>;

export const ClassKindSchema = z.enum([
  "class",
  "abstract",
  "interface",
  "enum",
]);
export type ClassKind = z.infer<typeof ClassKindSchema>;

export const ClassAttributeSchema = z.object({
  id: z.string(),
  visibility: VisibilitySchema,
  name: z.string().min(1, "Nome do atributo é obrigatório"),
  type: z.string().default("string"),
  isStatic: z.boolean().optional().default(false),
});
export type ClassAttribute = z.infer<typeof ClassAttributeSchema>;

export const ClassMethodSchema = z.object({
  id: z.string(),
  visibility: VisibilitySchema,
  name: z.string().min(1, "Nome do método é obrigatório"),
  params: z.string().default(""),
  returnType: z.string().default("void"),
  isAbstract: z.boolean().optional().default(false),
});
export type ClassMethod = z.infer<typeof ClassMethodSchema>;

export const UmlClassItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome da classe é obrigatório"),
  kind: ClassKindSchema.default("class"),
  attributes: z.array(ClassAttributeSchema).default([]),
  methods: z.array(ClassMethodSchema).default([]),
});
export type UmlClassItem = z.infer<typeof UmlClassItemSchema>;

export const ClassRelationTypeSchema = z.enum([
  "association",
  "inheritance",
  "implementation",
  "aggregation",
  "composition",
  "dependency",
]);
export type ClassRelationType = z.infer<typeof ClassRelationTypeSchema>;

export const ClassRelationshipSchema = z.object({
  id: z.string(),
  fromClassId: z.string().min(1),
  toClassId: z.string().min(1),
  type: ClassRelationTypeSchema.default("association"),
  fromMultiplicity: z.string().optional().default(""),
  toMultiplicity: z.string().optional().default(""),
  label: z.string().optional().default(""),
});
export type ClassRelationship = z.infer<typeof ClassRelationshipSchema>;

export const ClassDiagramDataSchema = z.object({
  type: z.literal("class"),
  title: z.string().default("Diagrama de Classes"),
  direction: DiagramDirectionSchema.default("TB"),
  theme: DiagramThemeSchema.default("blueprint"),
  classes: z.array(UmlClassItemSchema).default([]),
  relationships: z.array(ClassRelationshipSchema).default([]),
});

export type ClassDiagramData = z.infer<typeof ClassDiagramDataSchema>;

