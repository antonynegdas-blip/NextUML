"use client";

import React from "react";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Users,
  MessageSquareCode,
  Layers,
} from "lucide-react";
import type {
  SequenceArrowKind,
  SequenceDiagramData,
  SequenceGroupKind,
  SequenceParticipantKind,
} from "@/lib/uml/schemas";

interface SequenceFormProps {
  data: SequenceDiagramData;
  onChange: (next: SequenceDiagramData) => void;
}

const PARTICIPANT_KIND_LABELS: Record<SequenceParticipantKind, string> = {
  actor: "Ator (Actor)",
  boundary: "Interface / Tela (Boundary)",
  control: "Controller / Service (Control)",
  entity: "Entidade / Domínio (Entity)",
  database: "Banco de Dados (Database)",
  participant: "Componente Geral (Participant)",
};

export function SequenceForm({ data, onChange }: SequenceFormProps) {
  const addParticipant = () => {
    onChange({
      ...data,
      participants: [
        ...data.participants,
        {
          id: `p-${Date.now()}`,
          name: `Participante ${data.participants.length + 1}`,
          kind: "participant",
        },
      ],
    });
  };

  const addMessage = () => {
    const firstId = data.participants[0]?.id;
    const secondId = data.participants[1]?.id || firstId;
    if (!firstId || !secondId) return;

    onChange({
      ...data,
      messages: [
        ...data.messages,
        {
          id: `msg-${Date.now()}`,
          fromId: firstId,
          toId: secondId,
          label: "executarChamada()",
          arrow: "sync",
          activateTarget: false,
          deactivateSource: false,
          groupKind: "none",
          groupCondition: "",
          note: "",
        },
      ],
    });
  };

  const moveMessage = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= data.messages.length) return;
    const next = [...data.messages];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);
    onChange({ ...data, messages: next });
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Metadados */}
      <section className="studio-card">
        <div className="studio-section-title mb-3">
          <Layers className="h-3.5 w-3.5 text-sky-400" />
          Configurações do Diagrama de Sequência
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[200px] flex-1">
            <label className="studio-label" htmlFor="seq-title">
              Título do Fluxo
            </label>
            <input
              id="seq-title"
              type="text"
              value={data.title}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              className="studio-input w-full px-3 py-1.5 text-sm"
            />
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-300">
            <input
              type="checkbox"
              checked={data.autonumber}
              onChange={(e) =>
                onChange({ ...data, autonumber: e.target.checked })
              }
              className="h-4 w-4 rounded border-white/20 bg-[#070b14] accent-sky-400"
            />
            Numerar mensagens automaticamente (1, 2, 3...)
          </label>
        </div>
      </section>

      {/* Participantes / Lifelines */}
      <section className="studio-card">
        <div className="mb-3 flex items-center justify-between">
          <div className="studio-section-title">
            <Users className="h-4 w-4 text-sky-400" />
            Participantes / Lifelines ({data.participants.length})
          </div>
          <button
            type="button"
            onClick={addParticipant}
            className="studio-btn-primary px-2.5 py-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Participante
          </button>
        </div>

        <div className="space-y-2">
          {data.participants.map((p, idx) => (
            <div key={p.id} className="flex items-center gap-2">
              <span className="w-6 text-center font-mono text-xs text-slate-500">
                #{idx + 1}
              </span>
              <input
                type="text"
                aria-label="Nome do participante"
                value={p.name}
                onChange={(e) =>
                  onChange({
                    ...data,
                    participants: data.participants.map((item) =>
                      item.id === p.id
                        ? { ...item, name: e.target.value }
                        : item,
                    ),
                  })
                }
                placeholder="Nome (ex: AuthService)"
                className="studio-input flex-1 px-3 py-1.5 text-xs font-medium"
              />
              <select
                aria-label="Tipo do participante"
                value={p.kind}
                onChange={(e) =>
                  onChange({
                    ...data,
                    participants: data.participants.map((item) =>
                      item.id === p.id
                        ? {
                            ...item,
                            kind: e.target.value as SequenceParticipantKind,
                          }
                        : item,
                    ),
                  })
                }
                className="studio-select px-2 py-1.5 text-xs"
              >
                {Object.entries(PARTICIPANT_KIND_LABELS).map(([k, lbl]) => (
                  <option key={k} value={k}>
                    {lbl}
                  </option>
                ))}
              </select>
              <button
                type="button"
                aria-label={`Remover participante ${p.name}`}
                onClick={() =>
                  onChange({
                    ...data,
                    participants: data.participants.filter(
                      (item) => item.id !== p.id,
                    ),
                    messages: data.messages.filter(
                      (m) => m.fromId !== p.id && m.toId !== p.id,
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

      {/* Mensagens Cronológicas */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="studio-section-title">
            <MessageSquareCode className="h-4 w-4 text-sky-400" />
            Mensagens em Ordem Cronológica ({data.messages.length})
          </div>
          <button
            type="button"
            onClick={addMessage}
            disabled={data.participants.length === 0}
            className="studio-btn-primary px-3 py-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Nova Mensagem
          </button>
        </div>

        <div className="space-y-2.5">
          {data.messages.map((msg, idx) => (
            <div key={msg.id} className="studio-card p-3.5">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="rounded-md border border-sky-400/30 bg-sky-500/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-sky-300">
                  Passo #{idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Mover mensagem para cima"
                    onClick={() => moveMessage(idx, -1)}
                    disabled={idx === 0}
                    title="Subir passo"
                    className="studio-btn-icon"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Mover mensagem para baixo"
                    onClick={() => moveMessage(idx, 1)}
                    disabled={idx === data.messages.length - 1}
                    title="Descer passo"
                    className="studio-btn-icon"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remover mensagem ${msg.label}`}
                    onClick={() =>
                      onChange({
                        ...data,
                        messages: data.messages.filter((m) => m.id !== msg.id),
                      })
                    }
                    className="studio-btn-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div>
                  <label className="studio-label">De (Remetente)</label>
                  <select
                    aria-label="Remetente"
                    value={msg.fromId}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        messages: data.messages.map((m) =>
                          m.id === msg.id
                            ? { ...m, fromId: e.target.value }
                            : m,
                        ),
                      })
                    }
                    className="studio-select w-full px-2 py-1.5 text-xs"
                  >
                    {data.participants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="studio-label">Tipo de Seta</label>
                  <select
                    aria-label="Tipo de seta"
                    value={msg.arrow}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        messages: data.messages.map((m) =>
                          m.id === msg.id
                            ? {
                                ...m,
                                arrow: e.target.value as SequenceArrowKind,
                              }
                            : m,
                        ),
                      })
                    }
                    className="studio-select w-full px-2 py-1.5 text-xs text-sky-200"
                  >
                    <option value="sync">Síncrona (-&gt;)</option>
                    <option value="async">Assíncrona (-&gt;&gt;)</option>
                    <option value="return">Retorno / Resposta (--&gt;)</option>
                    <option value="create">Criar Instância (create)</option>
                  </select>
                </div>

                <div>
                  <label className="studio-label">Para (Destinatário)</label>
                  <select
                    aria-label="Destinatário"
                    value={msg.toId}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        messages: data.messages.map((m) =>
                          m.id === msg.id ? { ...m, toId: e.target.value } : m,
                        ),
                      })
                    }
                    className="studio-select w-full px-2 py-1.5 text-xs"
                  >
                    {data.participants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-2">
                <input
                  type="text"
                  aria-label="Descrição da chamada ou mensagem"
                  value={msg.label}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      messages: data.messages.map((m) =>
                        m.id === msg.id ? { ...m, label: e.target.value } : m,
                      ),
                    })
                  }
                  placeholder="Descrição da mensagem / chamada (ex: POST /login)"
                  className="studio-input w-full px-3 py-1.5 text-xs font-medium"
                />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <select
                  aria-label="Bloco condicional"
                  value={msg.groupKind || "none"}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      messages: data.messages.map((m) =>
                        m.id === msg.id
                          ? {
                              ...m,
                              groupKind: e.target.value as SequenceGroupKind,
                            }
                          : m,
                      ),
                    })
                  }
                  className="studio-select px-2.5 py-1 text-xs"
                >
                  <option value="none">Sem bloco condicional</option>
                  <option value="alt">Bloco alt (Se...)</option>
                  <option value="opt">Bloco opt (Opcional)</option>
                  <option value="loop">Bloco loop (Repetição)</option>
                </select>

                {msg.groupKind && msg.groupKind !== "none" && (
                  <input
                    type="text"
                    aria-label="Condição do bloco"
                    value={msg.groupCondition || ""}
                    onChange={(e) =>
                      onChange({
                        ...data,
                        messages: data.messages.map((m) =>
                          m.id === msg.id
                            ? { ...m, groupCondition: e.target.value }
                            : m,
                        ),
                      })
                    }
                    placeholder="Condição do bloco (ex: token válido)"
                    className="studio-input flex-1 border-sky-400/35 px-2.5 py-1 text-xs text-sky-100"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
