"use client";

import React from "react";
import {
  Plus,
  Trash2,
  Users,
  CircleDot,
  Link2,
  GitBranch,
  Layers,
} from "lucide-react";
import type {
  UseCaseActorKind,
  UseCaseDiagramData,
  UseCaseRelationType,
} from "@/lib/uml/schemas";

interface UseCaseFormProps {
  data: UseCaseDiagramData;
  onChange: (next: UseCaseDiagramData) => void;
}

export function UseCaseForm({ data, onChange }: UseCaseFormProps) {
  const addActor = () => {
    onChange({
      ...data,
      actors: [
        ...data.actors,
        {
          id: `act-${Date.now()}`,
          name: `Ator ${data.actors.length + 1}`,
          kind: "primary",
        },
      ],
    });
  };

  const addUseCase = () => {
    onChange({
      ...data,
      useCases: [
        ...data.useCases,
        {
          id: `uc-${Date.now()}`,
          name: `Executar Funcionalidade ${data.useCases.length + 1}`,
          description: "",
        },
      ],
    });
  };

  const addActorLink = () => {
    const actorId = data.actors[0]?.id;
    const useCaseId = data.useCases[0]?.id;
    if (!actorId || !useCaseId) return;
    onChange({
      ...data,
      actorLinks: [
        ...data.actorLinks,
        {
          id: `al-${Date.now()}`,
          actorId,
          useCaseId,
        },
      ],
    });
  };

  const addUseCaseRelation = () => {
    const firstId = data.useCases[0]?.id;
    const secondId = data.useCases[1]?.id || firstId;
    if (!firstId || !secondId) return;
    onChange({
      ...data,
      useCaseRelations: [
        ...data.useCaseRelations,
        {
          id: `ucr-${Date.now()}`,
          fromUseCaseId: firstId,
          toUseCaseId: secondId,
          type: "include",
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
          Limite do Sistema & Layout
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="studio-label" htmlFor="uc-title">
              Título do Diagrama
            </label>
            <input
              id="uc-title"
              type="text"
              value={data.title}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              className="studio-input w-full px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="studio-label" htmlFor="uc-system">
              Nome do Sistema (Fronteira)
            </label>
            <input
              id="uc-system"
              type="text"
              value={data.systemName}
              onChange={(e) =>
                onChange({ ...data, systemName: e.target.value })
              }
              placeholder="Ex.: Sistema Bancário"
              className="studio-input w-full px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="studio-label" htmlFor="uc-dir">
              Orientação
            </label>
            <select
              id="uc-dir"
              value={data.direction}
              onChange={(e) =>
                onChange({
                  ...data,
                  direction: e.target.value as "TB" | "LR",
                })
              }
              className="studio-select w-full px-2.5 py-1.5 text-sm"
            >
              <option value="LR">Horizontal (Esq → Dir)</option>
              <option value="TB">Vertical (Topo → Base)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Atores */}
      <section className="studio-card">
        <div className="mb-3 flex items-center justify-between">
          <div className="studio-section-title">
            <Users className="h-4 w-4 text-sky-400" />
            Atores ({data.actors.length})
          </div>
          <button
            type="button"
            onClick={addActor}
            className="studio-btn-primary px-2.5 py-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Novo Ator
          </button>
        </div>

        <div className="space-y-2">
          {data.actors.map((actor) => (
            <div key={actor.id} className="flex items-center gap-2">
              <input
                type="text"
                aria-label="Nome do ator"
                value={actor.name}
                onChange={(e) =>
                  onChange({
                    ...data,
                    actors: data.actors.map((a) =>
                      a.id === actor.id ? { ...a, name: e.target.value } : a,
                    ),
                  })
                }
                placeholder="Nome do Ator (ex: Cliente)"
                className="studio-input flex-1 px-3 py-1.5 text-xs font-medium"
              />
              <select
                aria-label="Tipo do ator"
                value={actor.kind}
                onChange={(e) =>
                  onChange({
                    ...data,
                    actors: data.actors.map((a) =>
                      a.id === actor.id
                        ? { ...a, kind: e.target.value as UseCaseActorKind }
                        : a,
                    ),
                  })
                }
                className="studio-select px-2.5 py-1.5 text-xs"
              >
                <option value="primary">Ator Primário</option>
                <option value="secondary">Ator Secundário</option>
                <option value="external_system">Sistema Externo</option>
              </select>
              <button
                type="button"
                aria-label={`Remover ator ${actor.name}`}
                onClick={() =>
                  onChange({
                    ...data,
                    actors: data.actors.filter((a) => a.id !== actor.id),
                    actorLinks: data.actorLinks.filter(
                      (l) => l.actorId !== actor.id,
                    ),
                  })
                }
                className="studio-btn-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Casos de Uso */}
      <section className="studio-card">
        <div className="mb-3 flex items-center justify-between">
          <div className="studio-section-title">
            <CircleDot className="h-4 w-4 text-sky-400" />
            Casos de Uso / Funcionalidades ({data.useCases.length})
          </div>
          <button
            type="button"
            onClick={addUseCase}
            className="studio-btn-primary px-2.5 py-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Caso de Uso
          </button>
        </div>

        <div className="space-y-2">
          {data.useCases.map((uc) => (
            <div key={uc.id} className="flex items-center gap-2">
              <input
                type="text"
                aria-label="Nome do caso de uso"
                value={uc.name}
                onChange={(e) =>
                  onChange({
                    ...data,
                    useCases: data.useCases.map((u) =>
                      u.id === uc.id ? { ...u, name: e.target.value } : u,
                    ),
                  })
                }
                placeholder="Verbo + Objeto (ex: Finalizar Compra)"
                className="studio-input flex-1 px-3 py-1.5 text-xs font-medium"
              />
              <button
                type="button"
                aria-label={`Remover caso de uso ${uc.name}`}
                onClick={() =>
                  onChange({
                    ...data,
                    useCases: data.useCases.filter((u) => u.id !== uc.id),
                    actorLinks: data.actorLinks.filter(
                      (l) => l.useCaseId !== uc.id,
                    ),
                    useCaseRelations: data.useCaseRelations.filter(
                      (r) =>
                        r.fromUseCaseId !== uc.id && r.toUseCaseId !== uc.id,
                    ),
                  })
                }
                className="studio-btn-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Interações Ator -> Caso de Uso */}
      <section className="studio-card">
        <div className="mb-3 flex items-center justify-between">
          <div className="studio-section-title">
            <Link2 className="h-4 w-4 text-sky-400" />
            Associações Ator → Caso de Uso ({data.actorLinks.length})
          </div>
          <button
            type="button"
            onClick={addActorLink}
            disabled={data.actors.length === 0 || data.useCases.length === 0}
            className="studio-btn-secondary px-2.5 py-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Associar
          </button>
        </div>

        <div className="space-y-2">
          {data.actorLinks.map((link) => (
            <div key={link.id} className="flex items-center gap-2">
              <select
                aria-label="Ator associado"
                value={link.actorId}
                onChange={(e) =>
                  onChange({
                    ...data,
                    actorLinks: data.actorLinks.map((l) =>
                      l.id === link.id ? { ...l, actorId: e.target.value } : l,
                    ),
                  })
                }
                className="studio-select w-1/2 px-2.5 py-1.5 text-xs"
              >
                {data.actors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <span className="text-xs font-bold text-slate-500">→</span>
              <select
                aria-label="Caso de uso associado"
                value={link.useCaseId}
                onChange={(e) =>
                  onChange({
                    ...data,
                    actorLinks: data.actorLinks.map((l) =>
                      l.id === link.id
                        ? { ...l, useCaseId: e.target.value }
                        : l,
                    ),
                  })
                }
                className="studio-select w-1/2 px-2.5 py-1.5 text-xs"
              >
                {data.useCases.map((uc) => (
                  <option key={uc.id} value={uc.id}>
                    {uc.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                aria-label="Remover associação"
                onClick={() =>
                  onChange({
                    ...data,
                    actorLinks: data.actorLinks.filter((l) => l.id !== link.id),
                  })
                }
                className="studio-btn-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Relações Include / Extend / Generalização */}
      <section className="studio-card">
        <div className="mb-3 flex items-center justify-between">
          <div className="studio-section-title">
            <GitBranch className="h-4 w-4 text-sky-400" />
            Relações entre Casos de Uso ({data.useCaseRelations.length})
          </div>
          <button
            type="button"
            onClick={addUseCaseRelation}
            disabled={data.useCases.length === 0}
            className="studio-btn-secondary px-2.5 py-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Relação Include / Extend
          </button>
        </div>

        <div className="space-y-2">
          {data.useCaseRelations.map((rel) => (
            <div key={rel.id} className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Caso de uso origem"
                value={rel.fromUseCaseId}
                onChange={(e) =>
                  onChange({
                    ...data,
                    useCaseRelations: data.useCaseRelations.map((r) =>
                      r.id === rel.id
                        ? { ...r, fromUseCaseId: e.target.value }
                        : r,
                    ),
                  })
                }
                className="studio-select min-w-[130px] flex-1 px-2 py-1.5 text-xs"
              >
                {data.useCases.map((uc) => (
                  <option key={uc.id} value={uc.id}>
                    {uc.name}
                  </option>
                ))}
              </select>

              <select
                aria-label="Tipo de relação entre casos de uso"
                value={rel.type}
                onChange={(e) =>
                  onChange({
                    ...data,
                    useCaseRelations: data.useCaseRelations.map((r) =>
                      r.id === rel.id
                        ? {
                            ...r,
                            type: e.target.value as UseCaseRelationType,
                          }
                        : r,
                    ),
                  })
                }
                className="studio-select px-2 py-1.5 font-mono text-xs font-semibold text-sky-300"
              >
                <option value="include">&lt;&lt;include&gt;&gt;</option>
                <option value="extend">&lt;&lt;extend&gt;&gt;</option>
                <option value="generalization">Generalização (--|&gt;)</option>
              </select>

              <select
                aria-label="Caso de uso destino"
                value={rel.toUseCaseId}
                onChange={(e) =>
                  onChange({
                    ...data,
                    useCaseRelations: data.useCaseRelations.map((r) =>
                      r.id === rel.id
                        ? { ...r, toUseCaseId: e.target.value }
                        : r,
                    ),
                  })
                }
                className="studio-select min-w-[130px] flex-1 px-2 py-1.5 text-xs"
              >
                {data.useCases.map((uc) => (
                  <option key={uc.id} value={uc.id}>
                    {uc.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                aria-label="Remover relação entre casos de uso"
                onClick={() =>
                  onChange({
                    ...data,
                    useCaseRelations: data.useCaseRelations.filter(
                      (r) => r.id !== rel.id,
                    ),
                  })
                }
                className="studio-btn-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
