"use client";

import React from "react";
import {
  Plus,
  Trash2,
  CircleDot,
  ArrowRightLeft,
  Layers,
} from "lucide-react";
import type { StateDiagramData, StateNodeKind } from "@/lib/uml/schemas";

interface StateFormProps {
  data: StateDiagramData;
  onChange: (next: StateDiagramData) => void;
}

export function StateForm({ data, onChange }: StateFormProps) {
  const addState = () => {
    onChange({
      ...data,
      states: [
        ...data.states,
        {
          id: `st-${Date.now()}`,
          name: `Estado${data.states.length + 1}`,
          kind: "normal",
          description: "",
          entryAction: "",
          exitAction: "",
        },
      ],
    });
  };

  const addTransition = () => {
    const firstId = data.states[0]?.id;
    const secondId = data.states[1]?.id || firstId;
    if (!firstId || !secondId) return;

    onChange({
      ...data,
      transitions: [
        ...data.transitions,
        {
          id: `tr-${Date.now()}`,
          fromStateId: firstId,
          toStateId: secondId,
          trigger: "evento",
          guard: "",
          action: "",
        },
      ],
    });
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Metadados */}
      <section className="studio-card">
        <div className="studio-section-title mb-3">
          <Layers className="h-3.5 w-3.5 text-sky-400" />
          Objeto Analisado & Layout
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="studio-label" htmlFor="state-title">
              Título do Diagrama
            </label>
            <input
              id="state-title"
              type="text"
              value={data.title}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              className="studio-input w-full px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="studio-label" htmlFor="state-entity">
              Entidade / Objeto
            </label>
            <input
              id="state-entity"
              type="text"
              value={data.entityName}
              onChange={(e) =>
                onChange({ ...data, entityName: e.target.value })
              }
              placeholder="Ex.: Pedido, Assinatura"
              className="studio-input w-full px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="studio-label" htmlFor="state-dir">
              Direção
            </label>
            <select
              id="state-dir"
              value={data.direction}
              onChange={(e) =>
                onChange({
                  ...data,
                  direction: e.target.value as "TB" | "LR",
                })
              }
              className="studio-select w-full px-2.5 py-1.5 text-sm"
            >
              <option value="TB">Vertical (Topo → Base)</option>
              <option value="LR">Horizontal (Esq → Dir)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Estados */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="studio-section-title">
            <CircleDot className="h-4 w-4 text-sky-400" />
            Estados da Entidade ({data.states.length})
          </div>
          <button
            type="button"
            onClick={addState}
            className="studio-btn-primary px-3 py-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Novo Estado
          </button>
        </div>

        <div className="space-y-2.5">
          {data.states.map((st) => (
            <div key={st.id} className="studio-card p-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Tipo do estado"
                  value={st.kind}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      states: data.states.map((item) =>
                        item.id === st.id
                          ? { ...item, kind: e.target.value as StateNodeKind }
                          : item,
                      ),
                    })
                  }
                  className="studio-select px-2.5 py-1.5 text-xs font-semibold text-sky-200"
                >
                  <option value="initial">Inicial ([*] → Estado)</option>
                  <option value="normal">Intermediário (Normal)</option>
                  <option value="final">Final (Estado → [*])</option>
                  <option value="choice">Decisão (&lt;&lt;choice&gt;&gt;)</option>
                </select>

                <input
                  type="text"
                  aria-label="Nome do estado"
                  value={st.name}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      states: data.states.map((item) =>
                        item.id === st.id
                          ? { ...item, name: e.target.value }
                          : item,
                      ),
                    })
                  }
                  placeholder="Nome do Estado (ex: AguardandoPagamento)"
                  className="studio-input min-w-[160px] flex-1 px-3 py-1.5 text-xs font-semibold"
                />

                <button
                  type="button"
                  aria-label={`Remover estado ${st.name}`}
                  onClick={() =>
                    onChange({
                      ...data,
                      states: data.states.filter((item) => item.id !== st.id),
                      transitions: data.transitions.filter(
                        (tr) =>
                          tr.fromStateId !== st.id && tr.toStateId !== st.id,
                      ),
                    })
                  }
                  className="studio-btn-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {st.kind !== "choice" && (
                <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    type="text"
                    aria-label="Descrição interna do estado"
                    value={st.description || ""}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        states: data.states.map((item) =>
                          item.id === st.id
                            ? { ...item, description: e.target.value }
                            : item,
                        ),
                      })
                    }
                    placeholder="Descrição interna (opcional)"
                    className="studio-input px-2.5 py-1 text-xs"
                  />
                  <input
                    type="text"
                    aria-label="Ação de entrada (entry)"
                    value={st.entryAction || ""}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        states: data.states.map((item) =>
                          item.id === st.id
                            ? { ...item, entryAction: e.target.value }
                            : item,
                        ),
                      })
                    }
                    placeholder="Ação entry / (ex: bloquearItens())"
                    className="studio-input px-2.5 py-1 font-mono text-xs text-sky-200"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Transições */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="studio-section-title">
            <ArrowRightLeft className="h-4 w-4 text-sky-400" />
            Transições de Estado ({data.transitions.length})
          </div>
          <button
            type="button"
            onClick={addTransition}
            disabled={data.states.length === 0}
            className="studio-btn-secondary px-3 py-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Nova Transição
          </button>
        </div>

        <div className="space-y-2.5">
          {data.transitions.map((tr) => (
            <div key={tr.id} className="studio-card p-3.5">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label className="studio-label">Estado Origem</label>
                  <select
                    aria-label="Estado de origem"
                    value={tr.fromStateId}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        transitions: data.transitions.map((item) =>
                          item.id === tr.id
                            ? { ...item, fromStateId: e.target.value }
                            : item,
                        ),
                      })
                    }
                    className="studio-select w-full px-2.5 py-1.5 text-xs font-medium"
                  >
                    {data.states.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="studio-label">Estado Destino</label>
                  <select
                    aria-label="Estado de destino"
                    value={tr.toStateId}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        transitions: data.transitions.map((item) =>
                          item.id === tr.id
                            ? { ...item, toStateId: e.target.value }
                            : item,
                        ),
                      })
                    }
                    className="studio-select w-full px-2.5 py-1.5 text-xs font-medium"
                  >
                    {data.states.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  aria-label="Evento ou gatilho"
                  value={tr.trigger || ""}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      transitions: data.transitions.map((item) =>
                        item.id === tr.id
                          ? { ...item, trigger: e.target.value }
                          : item,
                      ),
                    })
                  }
                  placeholder="Evento / Gatilho (ex: confirmarPagamento)"
                  className="studio-input min-w-[140px] flex-1 px-2.5 py-1 text-xs"
                />
                <input
                  type="text"
                  aria-label="Condição de guarda"
                  value={tr.guard || ""}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      transitions: data.transitions.map((item) =>
                        item.id === tr.id
                          ? { ...item, guard: e.target.value }
                          : item,
                      ),
                    })
                  }
                  placeholder="[Condição de Guarda] (opcional)"
                  className="studio-input min-w-[130px] flex-1 px-2.5 py-1 font-mono text-xs text-sky-200"
                />
                <input
                  type="text"
                  aria-label="Ação executada na transição"
                  value={tr.action || ""}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      transitions: data.transitions.map((item) =>
                        item.id === tr.id
                          ? { ...item, action: e.target.value }
                          : item,
                      ),
                    })
                  }
                  placeholder="/ Ação executada (opcional)"
                  className="studio-input min-w-[130px] flex-1 px-2.5 py-1 font-mono text-xs text-sky-200"
                />
                <button
                  type="button"
                  aria-label="Remover transição"
                  onClick={() =>
                    onChange({
                      ...data,
                      transitions: data.transitions.filter(
                        (item) => item.id !== tr.id,
                      ),
                    })
                  }
                  className="studio-btn-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
