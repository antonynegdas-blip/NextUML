"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  DEFAULT_DIAGRAM_TEMPLATES,
  type DiagramType,
  type UmlDiagramData,
} from "@/lib/uml/schemas";
import { generatePlantUml } from "@/lib/plantuml/generators";

export type InputTabMode = "ai" | "form" | "code";

export interface ClarificationQuestion {
  question: string;
  whyNeeded: string;
  suggestedAnswer: string;
}

export interface AssistantChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  status?: "needs_more_info" | "complete";
  missingFieldsQuestions?: ClarificationQuestion[];
  summaryOfChanges?: string[];
}

export interface SavedUmlProject {
  id: string;
  name: string;
  updatedAt: number;
  diagramType: DiagramType;
  data: UmlDiagramData;
  customPuml: string | null;
}

interface DiagramStoreState {
  activeType: DiagramType;
  activeTab: InputTabMode;
  diagrams: Record<DiagramType, UmlDiagramData>;
  customPumlOverride: Record<DiagramType, string | null>;
  historyPast: Record<DiagramType, UmlDiagramData[]>;
  historyFuture: Record<DiagramType, UmlDiagramData[]>;
  chatHistory: Record<DiagramType, AssistantChatMessage[]>;
  savedProjects: SavedUmlProject[];

  // Actions
  setActiveType: (type: DiagramType) => void;
  setActiveTab: (tab: InputTabMode) => void;
  updateCurrentDiagram: (
    updater:
      | UmlDiagramData
      | ((prev: UmlDiagramData) => UmlDiagramData),
    recordHistory?: boolean,
  ) => void;
  setCustomPumlOverride: (code: string | null) => void;
  resetCurrentToTemplate: () => void;
  undo: () => void;
  redo: () => void;
  addChatMessage: (
    type: DiagramType,
    msg: Omit<AssistantChatMessage, "id" | "timestamp">,
  ) => void;
  clearChatHistory: (type: DiagramType) => void;
  saveCurrentAsProject: (name?: string) => void;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;
  getEffectivePumlCode: () => string;
}

function createInitialDiagrams(): Record<DiagramType, UmlDiagramData> {
  return {
    class: structuredClone(DEFAULT_DIAGRAM_TEMPLATES.class),
    usecase: structuredClone(DEFAULT_DIAGRAM_TEMPLATES.usecase),
    sequence: structuredClone(DEFAULT_DIAGRAM_TEMPLATES.sequence),
    activity: structuredClone(DEFAULT_DIAGRAM_TEMPLATES.activity),
    state: structuredClone(DEFAULT_DIAGRAM_TEMPLATES.state),
  };
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useDiagramStore = create<DiagramStoreState>()(
  persist(
    (set, get) => ({
      activeType: "class",
      activeTab: "ai",
      diagrams: createInitialDiagrams(),
      customPumlOverride: {
        class: null,
        usecase: null,
        sequence: null,
        activity: null,
        state: null,
      },
      historyPast: {
        class: [],
        usecase: [],
        sequence: [],
        activity: [],
        state: [],
      },
      historyFuture: {
        class: [],
        usecase: [],
        sequence: [],
        activity: [],
        state: [],
      },
      chatHistory: {
        class: [],
        usecase: [],
        sequence: [],
        activity: [],
        state: [],
      },
      savedProjects: [],

      setActiveType: (type) => set({ activeType: type }),
      setActiveTab: (tab) => set({ activeTab: tab }),

      updateCurrentDiagram: (updater, recordHistory = true) =>
        set((state) => {
          const type = state.activeType;
          const current = state.diagrams[type];
          const next =
            typeof updater === "function" ? updater(current) : updater;

          const nextPast = recordHistory
            ? [...state.historyPast[type].slice(-24), structuredClone(current)]
            : state.historyPast[type];

          return {
            diagrams: {
              ...state.diagrams,
              [type]: next,
            },
            customPumlOverride: {
              ...state.customPumlOverride,
              [type]: null,
            },
            historyPast: {
              ...state.historyPast,
              [type]: nextPast,
            },
            historyFuture: {
              ...state.historyFuture,
              [type]: [],
            },
          };
        }),

      setCustomPumlOverride: (code) =>
        set((state) => ({
          customPumlOverride: {
            ...state.customPumlOverride,
            [state.activeType]: code,
          },
        })),

      resetCurrentToTemplate: () =>
        set((state) => {
          const type = state.activeType;
          const current = state.diagrams[type];
          const template = structuredClone(DEFAULT_DIAGRAM_TEMPLATES[type]);
          return {
            diagrams: {
              ...state.diagrams,
              [type]: template,
            },
            customPumlOverride: {
              ...state.customPumlOverride,
              [type]: null,
            },
            historyPast: {
              ...state.historyPast,
              [type]: [
                ...state.historyPast[type].slice(-24),
                structuredClone(current),
              ],
            },
            historyFuture: {
              ...state.historyFuture,
              [type]: [],
            },
          };
        }),

      undo: () =>
        set((state) => {
          const type = state.activeType;
          const past = state.historyPast[type];
          if (past.length === 0) return state;

          const previous = past[past.length - 1];
          const newPast = past.slice(0, -1);
          const current = state.diagrams[type];

          return {
            diagrams: {
              ...state.diagrams,
              [type]: previous,
            },
            customPumlOverride: {
              ...state.customPumlOverride,
              [type]: null,
            },
            historyPast: {
              ...state.historyPast,
              [type]: newPast,
            },
            historyFuture: {
              ...state.historyFuture,
              [type]: [structuredClone(current), ...state.historyFuture[type]],
            },
          };
        }),

      redo: () =>
        set((state) => {
          const type = state.activeType;
          const future = state.historyFuture[type];
          if (future.length === 0) return state;

          const [next, ...restFuture] = future;
          const current = state.diagrams[type];

          return {
            diagrams: {
              ...state.diagrams,
              [type]: next,
            },
            customPumlOverride: {
              ...state.customPumlOverride,
              [type]: null,
            },
            historyPast: {
              ...state.historyPast,
              [type]: [
                ...state.historyPast[type],
                structuredClone(current),
              ],
            },
            historyFuture: {
              ...state.historyFuture,
              [type]: restFuture,
            },
          };
        }),

      addChatMessage: (type, msg) =>
        set((state) => ({
          chatHistory: {
            ...state.chatHistory,
            [type]: [
              ...state.chatHistory[type],
              {
                ...msg,
                id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                timestamp: Date.now(),
              },
            ],
          },
        })),

      clearChatHistory: (type) =>
        set((state) => ({
          chatHistory: {
            ...state.chatHistory,
            [type]: [],
          },
        })),

      saveCurrentAsProject: (name) =>
        set((state) => {
          const type = state.activeType;
          const current = state.diagrams[type];
          const projectTitle =
            name?.trim() || current.title || `Projeto ${type.toUpperCase()}`;
          const newProj: SavedUmlProject = {
            id: `proj-${Date.now()}`,
            name: projectTitle,
            updatedAt: Date.now(),
            diagramType: type,
            data: structuredClone(current),
            customPuml: state.customPumlOverride[type],
          };
          return {
            savedProjects: [newProj, ...state.savedProjects.slice(0, 29)],
          };
        }),

      loadProject: (id) =>
        set((state) => {
          const found = state.savedProjects.find((p) => p.id === id);
          if (!found) return state;
          const type = found.diagramType;
          return {
            activeType: type,
            diagrams: {
              ...state.diagrams,
              [type]: structuredClone(found.data),
            },
            customPumlOverride: {
              ...state.customPumlOverride,
              [type]: found.customPuml,
            },
          };
        }),

      deleteProject: (id) =>
        set((state) => ({
          savedProjects: state.savedProjects.filter((p) => p.id !== id),
        })),

      getEffectivePumlCode: () => {
        const state = get();
        const type = state.activeType;
        const override = state.customPumlOverride[type];
        if (override !== null && override !== undefined) {
          return override;
        }
        return generatePlantUml(state.diagrams[type]);
      },
    }),
    {
      name: "uml-studio-storage-v1",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : noopStorage,
      ),
      partialize: (state) => ({
        activeType: state.activeType,
        activeTab: state.activeTab,
        diagrams: state.diagrams,
        customPumlOverride: state.customPumlOverride,
        chatHistory: state.chatHistory,
        savedProjects: state.savedProjects,
      }),
    },
  ),
);
