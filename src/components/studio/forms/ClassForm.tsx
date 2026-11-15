"use client";

import React from "react";
import {
  Plus,
  Trash2,
  Box,
  GitCommitHorizontal,
  Layers,
} from "lucide-react";
import type {
  ClassDiagramData,
  ClassKind,
  ClassRelationType,
  Visibility,
} from "@/lib/uml/schemas";

interface ClassFormProps {
  data: ClassDiagramData;
  onChange: (next: ClassDiagramData) => void;
}

const RELATION_LABELS: Record<ClassRelationType, string> = {
  association: "Associação (-->)",
  inheritance: "Herança / Generalização (--|>)",
  implementation: "Implementação de Interface (..|>)",
  composition: "Composição Forte (*--)",
  aggregation: "Agregação Fraca (o--)",
  dependency: "Dependência (..>)",
};

export function ClassForm({ data, onChange }: ClassFormProps) {
  const addClass = () => {
    const newId = `cls-${Date.now()}`;
    onChange({
      ...data,
      classes: [
        ...data.classes,
        {
          id: newId,
          name: `NovaClasse${data.classes.length + 1}`,
          kind: "class",
          attributes: [
            {
              id: `attr-${Date.now()}`,
              visibility: "-",
              name: "id",
              type: "UUID",
              isStatic: false,
            },
          ],
          methods: [],
        },
      ],
    });
  };

  const removeClass = (id: string) => {
    onChange({
      ...data,
      classes: data.classes.filter((c) => c.id !== id),
      relationships: data.relationships.filter(
        (r) => r.fromClassId !== id && r.toClassId !== id,
      ),
    });
  };

  const addRelationship = () => {
    const firstId = data.classes[0]?.id || "";
    const secondId = data.classes[1]?.id || firstId;
    if (!firstId) return;

    onChange({
      ...data,
      relationships: [
        ...data.relationships,
        {
          id: `rel-${Date.now()}`,
          fromClassId: firstId,
          toClassId: secondId,
          type: "association",
          fromMultiplicity: "1",
          toMultiplicity: "0..*",
          label: "possui",
        },
      ],
    });
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Metadados gerais */}
      <section className="studio-card">
        <div className="studio-section-title mb-3">
          <Layers className="h-3.5 w-3.5 text-sky-400" />
          Configurações do Diagrama de Classes
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="studio-label" htmlFor="class-diagram-title">
              Título do Diagrama
            </label>
            <input
              id="class-diagram-title"
              type="text"
              value={data.title}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              placeholder="Ex.: Domínio de E-Commerce"
              className="studio-input w-full px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="studio-label" htmlFor="class-diagram-dir">
              Direção do Layout
            </label>
            <select
              id="class-diagram-dir"
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

      {/* Lista de Classes */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="studio-section-title">
            <Box className="h-4 w-4 text-sky-400" />
            Classes, Interfaces & Enums ({data.classes.length})
          </div>
          <button
            type="button"
            onClick={addClass}
            className="studio-btn-primary px-3 py-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Nova Classe
          </button>
        </div>

        {data.classes.map((cls) => (
          <div key={cls.id} className="studio-card">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <select
                aria-label="Tipo de entidade"
                value={cls.kind}
                onChange={(e) => {
                  const nextKind = e.target.value as ClassKind;
                  onChange({
                    ...data,
                    classes: data.classes.map((c) =>
                      c.id === cls.id ? { ...c, kind: nextKind } : c,
                    ),
                  });
                }}
                className="studio-select px-2.5 py-1.5 font-mono text-xs font-semibold text-sky-200"
              >
                <option value="class">class</option>
                <option value="interface">interface</option>
                <option value="abstract">abstract class</option>
                <option value="enum">enum</option>
              </select>

              <input
                type="text"
                aria-label="Nome da Classe"
                value={cls.name}
                onChange={(e) =>
                  onChange({
                    ...data,
                    classes: data.classes.map((c) =>
                      c.id === cls.id ? { ...c, name: e.target.value } : c,
                    ),
                  })
                }
                placeholder="Nome da Classe"
                className="studio-input min-w-[160px] flex-1 px-3 py-1.5 text-sm font-semibold"
              />

              <button
                type="button"
                aria-label={`Remover classe ${cls.name}`}
                onClick={() => removeClass(cls.id)}
                title="Remover classe"
                className="studio-btn-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Atributos */}
            <div className="studio-subcard mb-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Atributos ({cls.attributes.length})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...data,
                      classes: data.classes.map((c) =>
                        c.id === cls.id
                          ? {
                              ...c,
                              attributes: [
                                ...c.attributes,
                                {
                                  id: `attr-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                                  visibility: "-",
                                  name: "novoAtributo",
                                  type: "String",
                                  isStatic: false,
                                },
                              ],
                            }
                          : c,
                      ),
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/15"
                >
                  <Plus className="h-3 w-3" /> Atributo
                </button>
              </div>

              <div className="space-y-1.5">
                {cls.attributes.map((attr) => (
                  <div key={attr.id} className="flex items-center gap-1.5">
                    <select
                      value={attr.visibility}
                      aria-label="Visibilidade do atributo"
                      onChange={(e) => {
                        const vis = e.target.value as Visibility;
                        onChange({
                          ...data,
                          classes: data.classes.map((c) =>
                            c.id === cls.id
                              ? {
                                  ...c,
                                  attributes: c.attributes.map((a) =>
                                    a.id === attr.id
                                      ? { ...a, visibility: vis }
                                      : a,
                                  ),
                                }
                              : c,
                          ),
                        });
                      }}
                      title="Visibilidade"
                      className="studio-select px-1.5 py-1 font-mono text-xs text-sky-300"
                    >
                      <option value="-">- (priv)</option>
                      <option value="+">+ (pub)</option>
                      <option value="#"># (prot)</option>
                      <option value="~">~ (pkg)</option>
                    </select>
                    <input
                      type="text"
                      aria-label="Nome do atributo"
                      value={attr.name}
                      onChange={(e) =>
                        onChange({
                          ...data,
                          classes: data.classes.map((c) =>
                            c.id === cls.id
                              ? {
                                  ...c,
                                  attributes: c.attributes.map((a) =>
                                    a.id === attr.id
                                      ? { ...a, name: e.target.value }
                                      : a,
                                  ),
                                }
                              : c,
                          ),
                        })
                      }
                      placeholder="nome"
                      className="studio-input w-1/2 px-2.5 py-1 text-xs"
                    />
                    <span className="text-xs text-slate-500">:</span>
                    <input
                      type="text"
                      aria-label="Tipo do atributo"
                      value={attr.type}
                      onChange={(e) =>
                        onChange({
                          ...data,
                          classes: data.classes.map((c) =>
                            c.id === cls.id
                              ? {
                                  ...c,
                                  attributes: c.attributes.map((a) =>
                                    a.id === attr.id
                                      ? { ...a, type: e.target.value }
                                      : a,
                                  ),
                                }
                              : c,
                          ),
                        })
                      }
                      placeholder="Tipo (ex: String)"
                      className="studio-input w-1/2 px-2.5 py-1 font-mono text-xs text-sky-200"
                    />
                    <button
                      type="button"
                      aria-label={`Remover atributo ${attr.name}`}
                      onClick={() =>
                        onChange({
                          ...data,
                          classes: data.classes.map((c) =>
                            c.id === cls.id
                              ? {
                                  ...c,
                                  attributes: c.attributes.filter(
                                    (a) => a.id !== attr.id,
                                  ),
                                }
                              : c,
                          ),
                        })
                      }
                      className="studio-btn-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {cls.attributes.length === 0 && (
                  <p className="text-xs text-slate-500 italic">
                    Nenhum atributo adicionado.
                  </p>
                )}
              </div>
            </div>

            {/* Métodos */}
            <div className="studio-subcard">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Métodos ({cls.methods.length})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...data,
                      classes: data.classes.map((c) =>
                        c.id === cls.id
                          ? {
                              ...c,
                              methods: [
                                ...c.methods,
                                {
                                  id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                                  visibility: "+",
                                  name: "executarAcao",
                                  params: "",
                                  returnType: "void",
                                  isAbstract: false,
                                },
                              ],
                            }
                          : c,
                      ),
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/15"
                >
                  <Plus className="h-3 w-3" /> Método
                </button>
              </div>

              <div className="space-y-1.5">
                {cls.methods.map((m) => (
                  <div key={m.id} className="flex flex-wrap items-center gap-1.5">
                    <select
                      aria-label="Visibilidade do método"
                      value={m.visibility}
                      onChange={(e) => {
                        const vis = e.target.value as Visibility;
                        onChange({
                          ...data,
                          classes: data.classes.map((c) =>
                            c.id === cls.id
                              ? {
                                  ...c,
                                  methods: c.methods.map((item) =>
                                    item.id === m.id
                                      ? { ...item, visibility: vis }
                                      : item,
                                  ),
                                }
                              : c,
                          ),
                        });
                      }}
                      className="studio-select px-1.5 py-1 font-mono text-xs text-sky-300"
                    >
                      <option value="+">+ (pub)</option>
                      <option value="-">- (priv)</option>
                      <option value="#"># (prot)</option>
                    </select>
                    <input
                      type="text"
                      aria-label="Nome do método"
                      value={m.name}
                      onChange={(e) =>
                        onChange({
                          ...data,
                          classes: data.classes.map((c) =>
                            c.id === cls.id
                              ? {
                                  ...c,
                                  methods: c.methods.map((item) =>
                                    item.id === m.id
                                      ? { ...item, name: e.target.value }
                                      : item,
                                  ),
                                }
                              : c,
                          ),
                        })
                      }
                      placeholder="nomeMetodo"
                      className="studio-input min-w-[100px] flex-1 px-2.5 py-1 text-xs"
                    />
                    <input
                      type="text"
                      aria-label="Parâmetros do método"
                      value={m.params}
                      onChange={(e) =>
                        onChange({
                          ...data,
                          classes: data.classes.map((c) =>
                            c.id === cls.id
                              ? {
                                  ...c,
                                  methods: c.methods.map((item) =>
                                    item.id === m.id
                                      ? { ...item, params: e.target.value }
                                      : item,
                                  ),
                                }
                              : c,
                          ),
                        })
                      }
                      placeholder="parâmetros (ex: id: UUID)"
                      className="studio-input min-w-[110px] flex-1 px-2.5 py-1 font-mono text-xs text-slate-200"
                    />
                    <input
                      type="text"
                      aria-label="Tipo de retorno"
                      value={m.returnType}
                      onChange={(e) =>
                        onChange({
                          ...data,
                          classes: data.classes.map((c) =>
                            c.id === cls.id
                              ? {
                                  ...c,
                                  methods: c.methods.map((item) =>
                                    item.id === m.id
                                      ? { ...item, returnType: e.target.value }
                                      : item,
                                  ),
                                }
                              : c,
                          ),
                        })
                      }
                      placeholder="Retorno"
                      className="studio-input w-24 px-2.5 py-1 font-mono text-xs text-sky-200"
                    />
                    <button
                      type="button"
                      aria-label={`Remover método ${m.name}`}
                      onClick={() =>
                        onChange({
                          ...data,
                          classes: data.classes.map((c) =>
                            c.id === cls.id
                              ? {
                                  ...c,
                                  methods: c.methods.filter(
                                    (item) => item.id !== m.id,
                                  ),
                                }
                              : c,
                          ),
                        })
                      }
                      className="studio-btn-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {cls.methods.length === 0 && (
                  <p className="text-xs text-slate-500 italic">
                    Nenhum método adicionado.
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Relacionamentos */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="studio-section-title">
            <GitCommitHorizontal className="h-4 w-4 text-sky-400" />
            Relacionamentos entre Classes ({data.relationships.length})
          </div>
          <button
            type="button"
            onClick={addRelationship}
            disabled={data.classes.length === 0}
            className="studio-btn-secondary px-3 py-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Novo Relacionamento
          </button>
        </div>

        <div className="space-y-2.5">
          {data.relationships.map((rel) => (
            <div key={rel.id} className="studio-card p-3.5">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div>
                  <label className="studio-label">Origem</label>
                  <select
                    aria-label="Classe de origem"
                    value={rel.fromClassId}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        relationships: data.relationships.map((r) =>
                          r.id === rel.id
                            ? { ...r, fromClassId: e.target.value }
                            : r,
                        ),
                      })
                    }
                    className="studio-select w-full px-2 py-1.5 text-xs font-medium"
                  >
                    {data.classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="studio-label">Tipo de Relação</label>
                  <select
                    aria-label="Tipo de relação"
                    value={rel.type}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        relationships: data.relationships.map((r) =>
                          r.id === rel.id
                            ? {
                                ...r,
                                type: e.target.value as ClassRelationType,
                              }
                            : r,
                        ),
                      })
                    }
                    className="studio-select w-full px-2 py-1.5 text-xs font-medium text-sky-200"
                  >
                    {Object.entries(RELATION_LABELS).map(([k, lbl]) => (
                      <option key={k} value={k}>
                        {lbl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="studio-label">Destino</label>
                  <select
                    aria-label="Classe de destino"
                    value={rel.toClassId}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        relationships: data.relationships.map((r) =>
                          r.id === rel.id
                            ? { ...r, toClassId: e.target.value }
                            : r,
                        ),
                      })
                    }
                    className="studio-select w-full px-2 py-1.5 text-xs font-medium"
                  >
                    {data.classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  aria-label="Multiplicidade de origem"
                  value={rel.fromMultiplicity || ""}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      relationships: data.relationships.map((r) =>
                        r.id === rel.id
                          ? { ...r, fromMultiplicity: e.target.value }
                          : r,
                      ),
                    })
                  }
                  placeholder="Mult. Origem (ex: 1)"
                  className="studio-input w-28 px-2.5 py-1 text-xs"
                />
                <input
                  type="text"
                  aria-label="Multiplicidade de destino"
                  value={rel.toMultiplicity || ""}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      relationships: data.relationships.map((r) =>
                        r.id === rel.id
                          ? { ...r, toMultiplicity: e.target.value }
                          : r,
                      ),
                    })
                  }
                  placeholder="Mult. Destino (ex: 0..*)"
                  className="studio-input w-32 px-2.5 py-1 text-xs"
                />
                <input
                  type="text"
                  aria-label="Rótulo do relacionamento"
                  value={rel.label || ""}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      relationships: data.relationships.map((r) =>
                        r.id === rel.id ? { ...r, label: e.target.value } : r,
                      ),
                    })
                  }
                  placeholder="Rótulo / verbo (ex: realiza, contém)"
                  className="studio-input min-w-[140px] flex-1 px-2.5 py-1 text-xs"
                />
                <button
                  type="button"
                  aria-label="Remover relacionamento"
                  onClick={() =>
                    onChange({
                      ...data,
                      relationships: data.relationships.filter(
                        (r) => r.id !== rel.id,
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
