import { z } from "zod";

export const DiagramTypeSchema = z.enum([
  "class",
  "usecase",
  "sequence",
  "activity",
  "state",
]);

export type DiagramType = z.infer<typeof DiagramTypeSchema>;

export const DiagramDirectionSchema = z.enum(["TB", "LR"]);
export type DiagramDirection = z.infer<typeof DiagramDirectionSchema>;

export const DiagramThemeSchema = z.enum(["blueprint", "classic", "dark"]);
export type DiagramTheme = z.infer<typeof DiagramThemeSchema>;

export const DIAGRAM_TYPE_META: Record<
  DiagramType,
  {
    label: string;
    shortLabel: string;
    description: string;
    requiredInfoSummary: string[];
  }
> = {
  class: {
    label: "Diagrama de Classes",
    shortLabel: "Classes",
    description:
      "Estrutura estática do sistema: classes, interfaces, atributos, métodos e relacionamentos.",
    requiredInfoSummary: [
      "Classes/Interfaces/Enums principais do domínio",
      "Atributos de cada classe (nome, tipo e visibilidade)",
      "Métodos/operações principais",
      "Relacionamentos (herança, composição, agregação, associação) e multiplicidades (1, 0..*, etc.)",
    ],
  },
  usecase: {
    label: "Diagrama de Casos de Uso",
    shortLabel: "Casos de Uso",
    description:
      "Interações entre atores externos e as funcionalidades (casos de uso) do sistema.",
    requiredInfoSummary: [
      "Nome do sistema ou módulo",
      "Atores (usuários humanos ou sistemas externos)",
      "Funcionalidades / Casos de Uso (ações no infinitivo)",
      "Quais atores acessam quais casos de uso e relações <<include>> ou <<extend>>",
    ],
  },
  sequence: {
    label: "Diagrama de Sequência",
    shortLabel: "Sequência",
    description:
      "Ordem cronológica das mensagens trocadas entre atores, componentes, serviços e banco.",
    requiredInfoSummary: [
      "Participantes na ordem da esquerda para a direita (Ator, UI, API, Banco, etc.)",
      "Passo a passo das mensagens em ordem cronológica (quem chama quem e o que retorna)",
      "Blocos opcionais de decisão (alt/opt) ou repetição (loop)",
    ],
  },
  activity: {
    label: "Diagrama de Atividades",
    shortLabel: "Atividades",
    description:
      "Fluxo de trabalho, processos de negócio, decisões (if/else) e raias de responsabilidade.",
    requiredInfoSummary: [
      "Raias / responsáveis (opcional, ex.: Cliente, Sistema, Financeiro)",
      "Sequência de etapas / ações do início ao fim",
      "Condições de decisão (Sim / Não) ou tarefas em paralelo",
    ],
  },
  state: {
    label: "Diagrama de Máquina de Estados",
    shortLabel: "Estados",
    description:
      "Ciclo de vida de uma entidade/objeto, seus estados possíveis e os eventos que causam transições.",
    requiredInfoSummary: [
      "Nome da entidade analisada (ex.: Pedido, Assinatura, Ticket)",
      "Estados possíveis (incluindo qual é o primeiro e quais encerram o ciclo)",
      "Transições entre estados (evento gatilho, condição de guarda e ação)",
    ],
  },
};

