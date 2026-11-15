"use client";

import React, { useEffect, useState } from "react";
import {
  Sparkles,
  FormInput,
  Code2,
  Undo2,
  Redo2,
  RotateCcw,
  FolderKanban,
  Boxes,
  Users,
  ArrowLeftRight,
  Workflow,
  GitCommitVertical,
  X,
  Save,
  Trash2,
  Upload,
  FileJson,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  DIAGRAM_TYPE_META,
  UmlDiagramDataSchema,
  type DiagramType,
} from "@/lib/uml/schemas";
import { useDiagramStore, type InputTabMode } from "@/store/useDiagramStore";
import { AiAssistantPanel } from "./AiAssistantPanel";
import { PumlCodePanel } from "./PumlCodePanel";
import { DiagramViewport } from "./DiagramViewport";
import { NextUmlLogo } from "./NextUmlLogo";
import { ClassForm } from "./forms/ClassForm";
import { UseCaseForm } from "./forms/UseCaseForm";
import { SequenceForm } from "./forms/SequenceForm";
import { ActivityForm } from "./forms/ActivityForm";
import { StateForm } from "./forms/StateForm";
import { exportAsJson } from "@/lib/export";
import { safeJsonParse } from "@/lib/security";

const MAX_IMPORT_FILE_BYTES = 512 * 1024; // 512 KB

const DIAGRAM_ICONS: Record<DiagramType, React.ReactNode> = {
  class: <Boxes className="h-3.5 w-3.5" />,
  usecase: <Users className="h-3.5 w-3.5" />,
  sequence: <ArrowLeftRight className="h-3.5 w-3.5" />,
  activity: <Workflow className="h-3.5 w-3.5" />,
  state: <GitCommitVertical className="h-3.5 w-3.5" />,
};

const DIAGRAM_TYPES: DiagramType[] = [
  "class",
  "usecase",
  "sequence",
  "activity",
  "state",
];

export function StudioShell() {
  const activeType = useDiagramStore((s) => s.activeType);
  const activeTab = useDiagramStore((s) => s.activeTab);
  const currentDiagram = useDiagramStore((s) => s.diagrams[s.activeType]);
  const pastCount = useDiagramStore((s) => s.historyPast[s.activeType].length);
  const futureCount = useDiagramStore(
    (s) => s.historyFuture[s.activeType].length,
  );
  const savedProjects = useDiagramStore((s) => s.savedProjects);

  const setActiveType = useDiagramStore((s) => s.setActiveType);
  const setActiveTab = useDiagramStore((s) => s.setActiveTab);
  const updateCurrentDiagram = useDiagramStore((s) => s.updateCurrentDiagram);
  const resetCurrentToTemplate = useDiagramStore(
    (s) => s.resetCurrentToTemplate,
  );
  const undo = useDiagramStore((s) => s.undo);
  const redo = useDiagramStore((s) => s.redo);
  const saveCurrentAsProject = useDiagramStore((s) => s.saveCurrentAsProject);
  const loadProject = useDiagramStore((s) => s.loadProject);
  const deleteProject = useDiagramStore((s) => s.deleteProject);

  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (!showProjectsModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowProjectsModal(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showProjectsModal]);

  const handleQuickSave = () => {
    saveCurrentAsProject();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1800);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".json")) {
      setImportError("Selecione apenas arquivos com extensão .json.");
      return;
    }

    if (file.size > MAX_IMPORT_FILE_BYTES) {
      setImportError("Arquivo muito grande (limite máximo de 512 KB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsedJson = safeJsonParse(String(reader.result));
        const validated = UmlDiagramDataSchema.safeParse(parsedJson);
        if (!validated.success) {
          setImportError(
            "O arquivo JSON não corresponde a um schema UML válido.",
          );
          return;
        }
        setActiveType(validated.data.type);
        updateCurrentDiagram(validated.data);
        setImportError(null);
        setShowProjectsModal(false);
      } catch {
        setImportError("Erro ao processar o conteúdo do arquivo JSON.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex min-h-dvh w-screen flex-col overflow-x-hidden lg:h-dvh lg:overflow-hidden">
      {/* Command Bar Flutuante */}
      <header className="mx-3 mt-3 shrink-0 rounded-2xl border border-white/10 bg-[#0b1120]/90 px-3.5 py-2.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Marca */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 p-0.5 ring-1 ring-sky-400/30 shadow-[0_0_24px_-6px_rgba(56,189,248,0.45)]">
              <NextUmlLogo className="h-full w-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-base font-bold tracking-tight text-slate-50">
                  NextUML
                </h1>
                <span className="rounded-full border border-sky-400/25 bg-sky-400/10 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-sky-300">
                  v1 · WASM
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Arquitetura Híbrida • IA + Formulário Guiado
              </p>
            </div>
          </div>

          {/* Seletor Segmentado dos 5 Diagramas UML */}
          <nav
            aria-label="Tipos de Diagrama UML"
            className="flex flex-wrap items-center gap-1 rounded-xl border border-white/8 bg-[#060913]/90 p-1 shadow-inner"
          >
            {DIAGRAM_TYPES.map((type) => {
              const isSelected = activeType === type;
              const meta = DIAGRAM_TYPE_META[type];
              return (
                <button
                  key={type}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setActiveType(type)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-hidden ${
                    isSelected
                      ? "bg-gradient-to-b from-sky-400/20 to-sky-500/10 text-sky-200 ring-1 ring-sky-400/40 shadow-[0_4px_18px_-6px_rgba(56,189,248,0.7)]"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                  }`}
                >
                  <span
                    className={isSelected ? "text-sky-300" : "text-slate-500"}
                  >
                    {DIAGRAM_ICONS[type]}
                  </span>
                  <span>{meta.shortLabel}</span>
                </button>
              );
            })}
          </nav>

          {/* Grupo de Ações Globais */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center rounded-xl border border-white/10 bg-[#070b14] p-0.5">
              <button
                type="button"
                onClick={undo}
                disabled={pastCount === 0}
                aria-label="Desfazer última alteração"
                title="Desfazer (Undo)"
                className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/8 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-hidden disabled:opacity-30"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <span className="h-4 w-px bg-white/10" aria-hidden="true" />
              <button
                type="button"
                onClick={redo}
                disabled={futureCount === 0}
                aria-label="Refazer alteração"
                title="Refazer (Redo)"
                className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/8 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-hidden disabled:opacity-30"
              >
                <Redo2 className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={resetCurrentToTemplate}
              title="Restaurar template de exemplo deste diagrama"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0d1424] px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/8 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-hidden"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden md:inline">Exemplo</span>
            </button>

            <button
              type="button"
              onClick={handleQuickSave}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-hidden ${
                savedNotice
                  ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                  : "border-sky-400/30 bg-sky-500/12 text-sky-200 hover:border-sky-400/50 hover:bg-sky-500/20"
              }`}
            >
              {savedNotice ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-300" />
                  <span>Salvo!</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 text-sky-300" />
                  <span className="hidden sm:inline">Salvar</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowProjectsModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0d1424] px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/8 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-hidden"
            >
              <FolderKanban className="h-3.5 w-3.5 text-indigo-300" />
              <span className="hidden sm:inline">Projetos</span>
              <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-200">
                {savedProjects.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Workspace Split-Pane (Double-Bezel) */}
      <main className="grid flex-1 grid-cols-1 gap-3 p-3 lg:grid-cols-12 lg:overflow-hidden">
        {/* Coluna Esquerda: Inspetor & Modos de Entrada */}
        <section
          aria-label="Painel de Modelagem"
          className="studio-bezel flex min-h-[540px] flex-col lg:col-span-5 lg:h-full lg:min-h-0"
        >
          <div className="studio-core flex h-full flex-col overflow-hidden">
            {/* Abas Segmented Control */}
            <div
              role="tablist"
              aria-label="Modo de criação do diagrama"
              className="grid shrink-0 grid-cols-3 gap-1.5 border-b border-white/8 bg-[#070b14]/70 p-2"
            >
              {(
                [
                  {
                    id: "ai",
                    label: "Texto Livre (IA)",
                    icon: <Sparkles className="h-3.5 w-3.5" />,
                  },
                  {
                    id: "form",
                    label: "Espaços Guiados",
                    icon: <FormInput className="h-3.5 w-3.5" />,
                  },
                  {
                    id: "code",
                    label: "Código .puml",
                    icon: <Code2 className="h-3.5 w-3.5" />,
                  },
                ] as { id: InputTabMode; label: string; icon: React.ReactNode }[]
              ).map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-hidden ${
                      active
                        ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-[0_6px_20px_-6px_rgba(56,189,248,0.65)]"
                        : "text-slate-400 hover:bg-white/6 hover:text-slate-100"
                    }`}
                  >
                    {tab.icon}
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Conteúdo da Aba Selecionada */}
            <div className="studio-scrollbar flex-1 overflow-y-auto p-4">
              {activeTab === "ai" && <AiAssistantPanel />}

              {activeTab === "form" && (
                <div className="animate-studio-in">
                  {currentDiagram.type === "class" && (
                    <ClassForm
                      data={currentDiagram}
                      onChange={(next) => updateCurrentDiagram(next)}
                    />
                  )}
                  {currentDiagram.type === "usecase" && (
                    <UseCaseForm
                      data={currentDiagram}
                      onChange={(next) => updateCurrentDiagram(next)}
                    />
                  )}
                  {currentDiagram.type === "sequence" && (
                    <SequenceForm
                      data={currentDiagram}
                      onChange={(next) => updateCurrentDiagram(next)}
                    />
                  )}
                  {currentDiagram.type === "activity" && (
                    <ActivityForm
                      data={currentDiagram}
                      onChange={(next) => updateCurrentDiagram(next)}
                    />
                  )}
                  {currentDiagram.type === "state" && (
                    <StateForm
                      data={currentDiagram}
                      onChange={(next) => updateCurrentDiagram(next)}
                    />
                  )}
                </div>
              )}

              {activeTab === "code" && <PumlCodePanel />}
            </div>
          </div>
        </section>

        {/* Coluna Direita: Stage PlantUML 100% Browser */}
        <section
          aria-label="Visualização do Diagrama"
          className="h-[580px] overflow-hidden lg:col-span-7 lg:h-full"
        >
          <DiagramViewport />
        </section>
      </main>

      {/* Modal: Projetos Salvos no Navegador + Import/Export JSON */}
      {showProjectsModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="projects-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#03060c]/75 p-4 backdrop-blur-md"
        >
          <div className="studio-bezel animate-studio-in w-full max-w-lg">
            <div className="studio-core p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/15 ring-1 ring-sky-400/30">
                    <FolderKanban className="h-4 w-4 text-sky-300" />
                  </div>
                  <div>
                    <h2
                      id="projects-modal-title"
                      className="font-display text-base font-bold text-slate-50"
                    >
                      Projetos Salvos no Navegador
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Armazenamento local e backup portável em JSON
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Fechar janela de projetos"
                  onClick={() => setShowProjectsModal(false)}
                  className="studio-btn-icon"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="studio-subcard mb-4 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    exportAsJson(currentDiagram, currentDiagram.title)
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0d1424] px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/8"
                >
                  <FileJson className="h-3.5 w-3.5 text-sky-400" />
                  Exportar Backup (.uml.json)
                </button>

                <label className="studio-btn-primary cursor-pointer px-3 py-1.5 text-xs">
                  <Upload className="h-3.5 w-3.5" />
                  Importar .uml.json
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJson}
                    className="hidden"
                  />
                </label>
              </div>

              {importError && (
                <div
                  role="alert"
                  className="mb-3 flex items-center gap-2 rounded-xl border border-rose-500/35 bg-rose-500/10 px-3 py-2 text-xs text-rose-200"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{importError}</span>
                </div>
              )}

              <div className="studio-scrollbar max-h-72 space-y-2 overflow-y-auto pr-1">
                {savedProjects.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 bg-[#070b14]/60 px-4 py-8 text-center">
                    <p className="text-xs text-slate-400">
                      Nenhum snapshot salvo ainda. Clique no botão{" "}
                      <strong className="text-slate-200">Salvar</strong> no topo
                      para guardar versões dos seus diagramas.
                    </p>
                  </div>
                ) : (
                  savedProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0d1424]/80 p-3 transition hover:border-sky-400/35 hover:bg-[#111a2e]"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="shrink-0 rounded-md border border-sky-400/30 bg-sky-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-sky-300 uppercase">
                            {DIAGRAM_TYPE_META[proj.diagramType].shortLabel}
                          </span>
                          <span className="truncate text-xs font-bold text-slate-100">
                            {proj.name}
                          </span>
                        </div>
                        <span className="mt-0.5 block text-[11px] text-slate-400">
                          Salvo em{" "}
                          {new Date(proj.updatedAt).toLocaleString("pt-BR")}
                        </span>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            loadProject(proj.id);
                            setShowProjectsModal(false);
                          }}
                          className="studio-btn-primary px-3 py-1 text-xs"
                        >
                          Abrir
                        </button>
                        <button
                          type="button"
                          aria-label={`Excluir projeto ${proj.name}`}
                          onClick={() => deleteProject(proj.id)}
                          className="studio-btn-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
