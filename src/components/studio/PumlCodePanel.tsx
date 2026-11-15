"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Download,
  RotateCcw,
  Code2,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { useDiagramStore } from "@/store/useDiagramStore";
import { generatePlantUml } from "@/lib/plantuml/generators";
import { exportAsPuml } from "@/lib/export";
import { MAX_PUML_CHARS, validatePumlSafety } from "@/lib/security";

export function PumlCodePanel() {
  const activeType = useDiagramStore((s) => s.activeType);
  const currentDiagram = useDiagramStore((s) => s.diagrams[s.activeType]);
  const customOverride = useDiagramStore(
    (s) => s.customPumlOverride[s.activeType],
  );
  const setCustomPumlOverride = useDiagramStore((s) => s.setCustomPumlOverride);

  const [copied, setCopied] = useState(false);

  const generatedCode = generatePlantUml(currentDiagram);
  const effectiveCode = customOverride ?? generatedCode;
  const isOverridden = customOverride !== null && customOverride !== undefined;
  const safetyCheck = validatePumlSafety(effectiveCode);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(effectiveCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="animate-studio-in flex h-full flex-col space-y-3">
      <div className="studio-card flex flex-wrap items-center justify-between gap-2 p-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/12 ring-1 ring-sky-400/30">
            <Code2 className="h-4 w-4 text-sky-300" />
          </div>
          <div>
            <h3 className="font-display text-xs font-bold text-slate-100">
              Código-Fonte PlantUML (.puml)
            </h3>
            <p className="text-[11px] text-slate-400">
              Sincronizado com o modelo ou editável diretamente abaixo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-[#070b14] px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/8"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" /> Copiado!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" /> Copiar
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => exportAsPuml(effectiveCode, currentDiagram.title)}
            className="studio-btn-primary px-3 py-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" /> Baixar .puml
          </button>
        </div>
      </div>

      {!safetyCheck.safe && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-rose-500/35 bg-rose-500/12 px-3 py-2 text-xs text-rose-200"
        >
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{safetyCheck.reason}</span>
        </div>
      )}

      {isOverridden && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-400/30 bg-amber-500/12 px-3 py-2 text-xs text-amber-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-300" />
            <span>
              Edição manual ativa. Alterações no formulário ou IA substituirão o
              código customizado.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCustomPumlOverride(null)}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-slate-950 transition hover:bg-amber-400"
          >
            <RotateCcw className="h-3 w-3" /> Ressincronizar
          </button>
        </div>
      )}

      <div className="relative flex-1 overflow-hidden rounded-2xl border border-white/12 bg-[#060913] shadow-inner focus-within:border-sky-400/50 focus-within:ring-2 focus-within:ring-sky-400/15">
        <div className="flex items-center justify-between border-b border-white/8 bg-[#0b1120] px-3.5 py-2 font-mono text-[11px] text-slate-400">
          <span className="flex items-center gap-2 text-slate-300">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            {activeType}.puml
          </span>
          <span>
            {effectiveCode.split("\n").length} linhas • {effectiveCode.length}/
            {MAX_PUML_CHARS.toLocaleString("pt-BR")} chars
          </span>
        </div>
        <textarea
          value={effectiveCode}
          maxLength={MAX_PUML_CHARS}
          aria-label="Editor de código PlantUML"
          onChange={(e) => setCustomPumlOverride(e.target.value)}
          spellCheck={false}
          className="studio-scrollbar h-[calc(100%-36px)] w-full resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-sky-100 focus:outline-hidden"
        />
      </div>
    </div>
  );
}
