"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Send,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Wand2,
  Trash2,
  Loader2,
  Info,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import {
  DIAGRAM_TYPE_META,
  type DiagramType,
  type UmlDiagramData,
} from "@/lib/uml/schemas";
import {
  useDiagramStore,
  type ClarificationQuestion,
} from "@/store/useDiagramStore";

const QUICK_PROMPTS: Record<DiagramType, string[]> = {
  class: [
    "Sistema de clínica médica com Médico, Paciente, Consulta e Prontuário",
    "E-commerce com Produto, Categoria, Carrinho, Pedido e Pagamento (Pix e Cartão) — quero definir os atributos depois",
  ],
  usecase: [
    "Aplicativo de delivery onde Cliente faz pedido, Restaurante aceita/prepara e Entregador realiza a entrega",
    "Sistema de biblioteca universitária para empréstimo, renovação e reserva de livros",
  ],
  sequence: [
    "Fluxo de login com autenticação 2FA (Usuário, App Mobile, AuthAPI, Banco de Dados e Serviço SMS)",
    "Transferência Pix entre contas validando saldo, chave no DICT do Banco Central e enviando comprovante",
  ],
  activity: [
    "Processo de recrutamento e seleção de candidatos entre RH, Gestor Técnico e Candidato",
    "Fluxo de abertura e resolução de chamado de suporte técnico com triagem de prioridade",
  ],
  state: [
    "Ciclo de vida de uma Assinatura SaaS (Trial, Ativa, EmAtraso, Suspensa, Cancelada)",
    "Estados de uma Reserva de Hotel desde a pré-reserva até check-in, check-out ou no-show",
  ],
};

export function AiAssistantPanel() {
  const activeType = useDiagramStore((s) => s.activeType);
  const currentDiagram = useDiagramStore((s) => s.diagrams[s.activeType]);
  const chatMessages = useDiagramStore((s) => s.chatHistory[s.activeType]);
  const updateCurrentDiagram = useDiagramStore((s) => s.updateCurrentDiagram);
  const addChatMessage = useDiagramStore((s) => s.addChatMessage);
  const clearChatHistory = useDiagramStore((s) => s.clearChatHistory);

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(true);

  const meta = DIAGRAM_TYPE_META[activeType];

  const handleSend = async (customPrompt?: string, forceGenerate = false) => {
    const textToSend = (customPrompt ?? inputText).trim();
    if (!textToSend || isLoading) return;

    setErrorMsg(null);
    if (!customPrompt) {
      setInputText("");
    }

    addChatMessage(activeType, {
      role: "user",
      content: textToSend,
    });

    setIsLoading(true);
    try {
      const response = await fetch("/api/uml-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          diagramType: activeType,
          currentDiagram,
          forceGenerate,
          conversationHistory: chatMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMsg(result?.error || "Falha ao processar descrição com a IA.");
        return;
      }

      if (result.diagram) {
        updateCurrentDiagram(result.diagram as UmlDiagramData);
      }

      addChatMessage(activeType, {
        role: "assistant",
        content:
          result.assistantMessage ||
          "Diagrama atualizado com base nas informações enviadas.",
        status: result.status,
        missingFieldsQuestions: result.missingFieldsQuestions || [],
        summaryOfChanges: result.summaryOfChanges || [],
      });
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Erro de conexão ao chamar o assistente de IA.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const appendSuggestedAnswer = (q: ClarificationQuestion) => {
    setInputText((prev) => {
      const prefix = prev.trim() ? `${prev.trim()}\n- ` : "- ";
      return `${prefix}${q.question} R: ${q.suggestedAnswer}`;
    });
  };

  return (
    <div className="animate-studio-in flex h-full flex-col">
      {/* Guia compacto e recolhível */}
      <div className="mb-3.5 rounded-2xl border border-sky-400/20 bg-gradient-to-br from-sky-500/10 via-[#0d1424] to-[#0b1120] p-3.5 shadow-inner">
        <button
          type="button"
          onClick={() => setShowGuide((v) => !v)}
          aria-expanded={showGuide}
          className="flex w-full items-center justify-between gap-2 text-left"
        >
          <span className="flex items-center gap-2 text-xs font-bold text-sky-200">
            <Info className="h-3.5 w-3.5 text-sky-400" />
            O que informar para o {meta.label}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              showGuide ? "rotate-180" : ""
            }`}
          />
        </button>

        {showGuide && (
          <ul className="mt-2.5 space-y-1.5 border-t border-white/8 pt-2.5 text-xs text-slate-300">
            {meta.requiredInfoSummary.map((req, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-0.5 rounded bg-sky-500/15 px-1.5 py-0.2 font-mono text-[10px] font-bold text-sky-300">
                  0{idx + 1}
                </span>
                <span className="leading-relaxed">{req}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Histórico de Conversa e Perguntas da IA */}
      <div className="studio-scrollbar flex-1 space-y-3 overflow-y-auto pr-1">
        {chatMessages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/12 bg-[#070b14]/60 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-indigo-200 uppercase">
                <Sparkles className="h-3 w-3 text-indigo-300" /> Arquiteto UML
              </span>
            </div>
            <p className="font-display mb-1.5 text-sm font-bold text-slate-100">
              Descreva seu sistema em linguagem natural
            </p>
            <p className="mb-4 text-xs leading-relaxed text-slate-400">
              Explique entidades, atores ou etapas com suas palavras. Se faltar
              algum detalhe essencial para o{" "}
              <strong className="text-slate-200">{meta.shortLabel}</strong>, a
              IA monta um rascunho inicial e faz perguntas pontuais para você
              completar.
            </p>
            <div className="space-y-2">
              <span className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Exemplos prontos para testar
              </span>
              {QUICK_PROMPTS[activeType].map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInputText(sample)}
                  className="group flex w-full items-start justify-between gap-2 rounded-xl border border-white/10 bg-[#0d1424]/90 p-3 text-left text-xs leading-relaxed text-slate-200 transition-all duration-200 hover:border-sky-400/40 hover:bg-[#111a2e]"
                >
                  <span>&ldquo;{sample}&rdquo;</span>
                  <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-sky-300" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-2xl p-3.5 text-xs ${
                msg.role === "user"
                  ? "ml-6 border border-sky-400/30 bg-gradient-to-br from-sky-500/20 to-indigo-500/15 text-slate-50 shadow-sm"
                  : "mr-2 border border-white/10 bg-[#0f172a]/90 text-slate-200 shadow-md"
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-100">
                  {msg.role === "user" ? "Você" : "Arquiteto UML (IA)"}
                </span>
                {msg.status === "needs_more_info" && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                    <HelpCircle className="h-3 w-3 text-amber-300" /> Aguardando
                    detalhes
                  </span>
                )}
                {msg.status === "complete" && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                    <CheckCircle2 className="h-3 w-3 text-emerald-300" />{" "}
                    Diagrama completo
                  </span>
                )}
              </div>

              <p className="leading-relaxed whitespace-pre-wrap text-slate-200">
                {msg.content}
              </p>

              {/* Resumo do que foi aplicado */}
              {msg.summaryOfChanges && msg.summaryOfChanges.length > 0 && (
                <div className="mt-3 rounded-xl border border-white/8 bg-[#070b14]/70 p-2.5">
                  <span className="mb-1 block text-[10px] font-bold tracking-wider text-sky-300 uppercase">
                    Aplicado ao Diagrama & Formulário
                  </span>
                  <ul className="list-disc space-y-0.5 pl-4 text-[11px] text-slate-300">
                    {msg.summaryOfChanges.map((change, idx) => (
                      <li key={idx}>{change}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Perguntas de esclarecimento */}
              {msg.missingFieldsQuestions &&
                msg.missingFieldsQuestions.length > 0 && (
                  <div className="mt-3 space-y-2 rounded-xl border border-amber-400/25 bg-amber-500/8 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-200">
                      <HelpCircle className="h-4 w-4 text-amber-300" />
                      Informações recomendadas para completar:
                    </div>
                    {msg.missingFieldsQuestions.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className="rounded-xl border border-white/10 bg-[#070b14]/85 p-2.5"
                      >
                        <p className="font-semibold text-slate-100">
                          {qIdx + 1}. {q.question}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {q.whyNeeded}
                        </p>
                        {q.suggestedAnswer && (
                          <button
                            type="button"
                            onClick={() => appendSuggestedAnswer(q)}
                            className="mt-2 inline-flex items-center gap-1 rounded-lg border border-sky-400/30 bg-sky-500/12 px-2.5 py-1 text-[11px] font-semibold text-sky-200 transition hover:bg-sky-500/22"
                          >
                            + Usar sugestão: &ldquo;{q.suggestedAnswer}&rdquo;
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() =>
                        handleSend(
                          "Complete todas as informações faltantes automaticamente seguindo as melhores práticas para este domínio.",
                          true,
                        )
                      }
                      className="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50"
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      Preencher lacunas automaticamente com boas práticas
                    </button>
                  </div>
                )}
            </div>
          ))
        )}
      </div>

      {/* Erro se houver */}
      {errorMsg && (
        <div
          role="alert"
          className="mt-2.5 flex items-start gap-2 rounded-xl border border-rose-500/35 bg-rose-500/10 p-2.5 text-xs text-rose-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
          <div className="flex-1">{errorMsg}</div>
        </div>
      )}

      {/* Caixa de envio de texto livre */}
      <div className="mt-3 shrink-0 border-t border-white/8 pt-3">
        <div className="rounded-2xl border border-white/12 bg-[#070b14] p-2.5 transition focus-within:border-sky-400/55 focus-within:ring-2 focus-within:ring-sky-400/15">
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSend();
              }
            }}
            aria-label="Descreva seu diagrama em texto livre"
            placeholder={`Descreva seu ${meta.label.toLowerCase()} em texto livre ou responda às perguntas...`}
            className="studio-scrollbar w-full resize-none bg-transparent px-1 py-0.5 text-xs leading-relaxed text-slate-100 placeholder:text-slate-500 focus:outline-hidden"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-2">
            {chatMessages.length > 0 ? (
              <button
                type="button"
                onClick={() => clearChatHistory(activeType)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-rose-500/12 hover:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" /> Limpar conversa
              </button>
            ) : (
              <span className="text-[11px] text-slate-400">
                Atalho: <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">Ctrl+Enter</kbd>
              </span>
            )}

            <button
              type="button"
              disabled={isLoading || !inputText.trim()}
              onClick={() => handleSend()}
              className="studio-btn-primary px-4 py-2 text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Analisando UML...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Analisar & Gerar
                  <Send className="h-3 w-3" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
