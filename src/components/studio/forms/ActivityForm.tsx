"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Workflow,
  Columns3,
  Layers,
} from "lucide-react";
import type { ActivityDiagramData, ActivityStepKind } from "@/lib/uml/schemas";

interface ActivityFormProps {
  data: ActivityDiagramData;
  onChange: (next: ActivityDiagramData) => void;
}

export function ActivityForm({ data, onChange }: ActivityFormProps) {
  const [newLane, setNewLane] = useState("");

  const addSwimlane = () => {
    const trimmed = newLane.trim();
    if (!trimmed || data.swimlanes.includes(trimmed)) return;
    onChange({
      ...data,
      swimlanes: [...data.swimlanes, trimmed],
    });
    setNewLane("");
  };

  const addStep = (kind: ActivityStepKind = "action") => {
    onChange({
      ...data,
      steps: [
        ...data.steps,
        {
          id: `st-${Date.now()}`,
          kind,
          label:
            kind === "decision"
              ? "Condição atendida?"
              : kind === "fork"
                ? "Processamento paralelo"
                : `Nova etapa ${data.steps.length + 1}`,
          swimlane: data.swimlanes[0] || "",
          yesLabel: "Sim",
          yesAction: "Seguir fluxo principal",
          noLabel: "Não",
          noAction: "Tratar exceção",
          parallelActions:
            kind === "fork" ? ["Tarefa paralela A", "Tarefa paralela B"] : [],
        },
      ],
    });
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= data.steps.length) return;
    const next = [...data.steps];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);
    onChange({ ...data, steps: next });
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Título */}
      <section className="studio-card">
        <div className="studio-section-title mb-3">
          <Layers className="h-3.5 w-3.5 text-sky-400" />
          Configurações do Diagrama de Atividades
        </div>
        <div>
          <label className="studio-label" htmlFor="act-title">
            Título do Processo
          </label>
          <input
            id="act-title"
            type="text"
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            className="studio-input w-full px-3 py-1.5 text-sm"
          />
        </div>
      </section>

      {/* Raias / Swimlanes */}
      <section className="studio-card">
        <div className="studio-section-title mb-2.5">
          <Columns3 className="h-4 w-4 text-sky-400" />
          Raias de Responsabilidade / Swimlanes ({data.swimlanes.length})
        </div>
        <div className="mb-3 flex gap-2">
          <input
            type="text"
            aria-label="Nome da nova raia"
            value={newLane}
            onChange={(e) => setNewLane(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSwimlane()}
            placeholder="Adicionar raia (ex.: Cliente, Sistema, Financeiro)"
            className="studio-input flex-1 px-3 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={addSwimlane}
            className="studio-btn-secondary px-3 py-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Raia
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {data.swimlanes.map((lane) => (
            <span
              key={lane}
              className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/12 px-3 py-1 text-xs font-semibold text-sky-200"
            >
              {lane}
              <button
                type="button"
                aria-label={`Remover raia ${lane}`}
                onClick={() =>
                  onChange({
                    ...data,
                    swimlanes: data.swimlanes.filter((l) => l !== lane),
                  })
                }
                className="text-sky-300 transition hover:text-rose-300"
              >
                ×
              </button>
            </span>
          ))}
          {data.swimlanes.length === 0 && (
            <span className="text-xs text-slate-500 italic">
              Opcional: adicione raias para dividir quem executa cada etapa.
            </span>
          )}
        </div>
      </section>

      {/* Etapas do Fluxo */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="studio-section-title">
            <Workflow className="h-4 w-4 text-sky-400" />
            Etapas do Fluxo ({data.steps.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => addStep("action")}
              className="studio-btn-primary px-2.5 py-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Ação
            </button>
            <button
              type="button"
              onClick={() => addStep("decision")}
              className="inline-flex items-center gap-1 rounded-xl border border-amber-400/30 bg-amber-500/12 px-2.5 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/20"
            >
              <Plus className="h-3.5 w-3.5" /> Decisão (If/Else)
            </button>
            <button
              type="button"
              onClick={() => addStep("fork")}
              className="inline-flex items-center gap-1 rounded-xl border border-indigo-400/30 bg-indigo-500/12 px-2.5 py-1.5 text-xs font-semibold text-indigo-200 transition hover:bg-indigo-500/20"
            >
              <Plus className="h-3.5 w-3.5" /> Paralelo (Fork)
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {data.steps.map((step, idx) => (
            <div key={step.id} className="studio-card p-3.5">
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-white/10 bg-[#070b14] px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-300">
                    #{idx + 1}
                  </span>
                  <select
                    aria-label="Tipo da etapa"
                    value={step.kind}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        steps: data.steps.map((s) =>
                          s.id === step.id
                            ? {
                                ...s,
                                kind: e.target.value as ActivityStepKind,
                              }
                            : s,
                        ),
                      })
                    }
                    className="studio-select px-2 py-1 text-xs font-semibold"
                  >
                    <option value="action">Ação / Etapa</option>
                    <option value="decision">Decisão (If / Else)</option>
                    <option value="fork">Paralelo (Fork / Join)</option>
                    <option value="note">Nota Explicativa</option>
                  </select>

                  {data.swimlanes.length > 0 && (
                    <select
                      aria-label="Raia da etapa"
                      value={step.swimlane || ""}
                      onChange={(e) =>
                        onChange({
                          ...data,
                          steps: data.steps.map((s) =>
                            s.id === step.id
                              ? { ...s, swimlane: e.target.value }
                              : s,
                          ),
                        })
                      }
                      className="studio-select border-sky-400/30 px-2 py-1 text-xs text-sky-200"
                    >
                      <option value="">(Mesma raia anterior)</option>
                      {data.swimlanes.map((lane) => (
                        <option key={lane} value={lane}>
                          Raia: {lane}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Mover etapa para cima"
                    onClick={() => moveStep(idx, -1)}
                    disabled={idx === 0}
                    className="studio-btn-icon"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Mover etapa para baixo"
                    onClick={() => moveStep(idx, 1)}
                    disabled={idx === data.steps.length - 1}
                    className="studio-btn-icon"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remover etapa ${step.label}`}
                    onClick={() =>
                      onChange({
                        ...data,
                        steps: data.steps.filter((s) => s.id !== step.id),
                      })
                    }
                    className="studio-btn-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <input
                type="text"
                aria-label="Descrição da etapa"
                value={step.label}
                onChange={(e) =>
                  onChange({
                    ...data,
                    steps: data.steps.map((s) =>
                      s.id === step.id ? { ...s, label: e.target.value } : s,
                    ),
                  })
                }
                placeholder={
                  step.kind === "decision"
                    ? "Pergunta de decisão (ex: Pagamento aprovado?)"
                    : "Descrição da ação"
                }
                className="studio-input w-full px-3 py-1.5 text-xs font-medium"
              />

              {step.kind === "decision" && (
                <div className="mt-2.5 grid grid-cols-1 gap-2 rounded-xl border border-amber-400/20 bg-amber-500/8 p-2.5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-emerald-300">
                      Caminho Positivo ({step.yesLabel || "Sim"})
                    </label>
                    <input
                      type="text"
                      aria-label="Ação caso sim"
                      value={step.yesAction || ""}
                      onChange={(e) =>
                        onChange({
                          ...data,
                          steps: data.steps.map((s) =>
                            s.id === step.id
                              ? { ...s, yesAction: e.target.value }
                              : s,
                          ),
                        })
                      }
                      placeholder="Ação se Sim"
                      className="studio-input w-full border-emerald-400/30 px-2.5 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-rose-300">
                      Caminho Alternativo ({step.noLabel || "Não"})
                    </label>
                    <input
                      type="text"
                      aria-label="Ação caso não"
                      value={step.noAction || ""}
                      onChange={(e) =>
                        onChange({
                          ...data,
                          steps: data.steps.map((s) =>
                            s.id === step.id
                              ? { ...s, noAction: e.target.value }
                              : s,
                          ),
                        })
                      }
                      placeholder="Ação se Não"
                      className="studio-input w-full border-rose-400/30 px-2.5 py-1 text-xs"
                    />
                  </div>
                </div>
              )}

              {step.kind === "fork" && (
                <div className="mt-2.5 rounded-xl border border-indigo-400/20 bg-indigo-500/8 p-2.5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-indigo-200">
                      Ações Executadas em Paralelo
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...data,
                          steps: data.steps.map((s) =>
                            s.id === step.id
                              ? {
                                  ...s,
                                  parallelActions: [
                                    ...(s.parallelActions || []),
                                    "Nova tarefa paralela",
                                  ],
                                }
                              : s,
                          ),
                        })
                      }
                      className="text-xs font-semibold text-indigo-300 hover:underline"
                    >
                      + Adicionar ramo paralelo
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {(step.parallelActions || []).map((pAct, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          aria-label={`Tarefa paralela ${pIdx + 1}`}
                          value={pAct}
                          onChange={(e) => {
                            const updated = [...(step.parallelActions || [])];
                            updated[pIdx] = e.target.value;
                            onChange({
                              ...data,
                              steps: data.steps.map((s) =>
                                s.id === step.id
                                  ? { ...s, parallelActions: updated }
                                  : s,
                              ),
                            });
                          }}
                          className="studio-input flex-1 border-indigo-400/30 px-2.5 py-1 text-xs"
                        />
                        <button
                          type="button"
                          aria-label={`Remover tarefa paralela ${pAct}`}
                          onClick={() => {
                            const updated = (
                              step.parallelActions || []
                            ).filter((_, i) => i !== pIdx);
                            onChange({
                              ...data,
                              steps: data.steps.map((s) =>
                                s.id === step.id
                                  ? { ...s, parallelActions: updated }
                                  : s,
                              ),
                            });
                          }}
                          className="studio-btn-danger"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
