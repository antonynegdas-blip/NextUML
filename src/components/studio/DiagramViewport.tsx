"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  FileImage,
  FileCode2,
  Cpu,
  AlertTriangle,
  Loader2,
  Palette,
} from "lucide-react";
import { useDiagramStore } from "@/store/useDiagramStore";
import { renderPlantUmlToSvg } from "@/lib/plantuml/renderer";
import { exportAsPng, exportAsPuml, exportAsSvg } from "@/lib/export";
import { sanitizeSvgMarkup } from "@/lib/security";
import type { DiagramTheme } from "@/lib/uml/schemas";

export function DiagramViewport() {
  const activeType = useDiagramStore((s) => s.activeType);
  const currentDiagram = useDiagramStore((s) => s.diagrams[s.activeType]);
  const customOverride = useDiagramStore(
    (s) => s.customPumlOverride[s.activeType],
  );
  const updateCurrentDiagram = useDiagramStore((s) => s.updateCurrentDiagram);
  const getEffectivePumlCode = useDiagramStore((s) => s.getEffectivePumlCode);

  const [svgMarkup, setSvgMarkup] = useState<string>("");
  const [renderTimeMs, setRenderTimeMs] = useState<number | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(true);
  const [renderError, setRenderError] = useState<string | null>(null);

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const pumlCode = getEffectivePumlCode();

  useEffect(() => {
    let cancelled = false;
    setIsRendering(true);

    const timer = setTimeout(async () => {
      try {
        const res = await renderPlantUmlToSvg(pumlCode, {
          dark: currentDiagram.theme === "dark",
        });
        if (!cancelled) {
          setSvgMarkup(res.svg);
          setRenderTimeMs(res.durationMs);
          setRenderError(null);
          setIsRendering(false);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setRenderError(
            err instanceof Error
              ? err.message
              : "Erro ao compilar diagrama PlantUML no navegador.",
          );
          setIsRendering(false);
        }
      }
    }, 220);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pumlCode, currentDiagram.theme, activeType, customOverride]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      const direction = e.deltaY > 0 ? -1 : 1;
      const step = Math.min(0.15, Math.max(0.05, Math.abs(e.deltaY) * 0.0012));
      setZoom((z) =>
        Math.min(3.5, Math.max(0.25, Number((z + direction * step).toFixed(2)))),
      );
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const isDarkTheme = currentDiagram.theme === "dark";
  const isClassicTheme = currentDiagram.theme === "classic";

  const canvasBgClass = isDarkTheme
    ? "bg-[#050811]"
    : isClassicTheme
      ? "bg-[#f4f4f2]"
      : "bg-[#ebf2fc]";

  const gridDotColor = isDarkTheme
    ? "rgba(56, 189, 248, 0.16)"
    : isClassicTheme
      ? "rgba(100, 116, 139, 0.25)"
      : "rgba(14, 165, 233, 0.22)";

  return (
    <div className="studio-bezel flex h-full flex-col">
      <div className="studio-core flex h-full flex-col overflow-hidden">
        {/* Barra Superior do Palco */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 bg-[#070b14]/85 px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
              <span
                className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"
                aria-hidden="true"
              />
              <Cpu className="h-3 w-3 text-emerald-400" />
              Motor Local (Browser)
            </span>
            {isRendering ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-300">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Compilando SVG...
              </span>
            ) : (
              renderTimeMs !== null && (
                <span className="rounded-md border border-white/8 bg-white/4 px-2 py-0.5 font-mono text-[11px] text-slate-400">
                  {renderTimeMs}ms
                </span>
              )
            )}
          </div>

          {/* Controles de Tema, Zoom e Exportação */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0d1424] px-2.5 py-1">
              <Palette className="h-3.5 w-3.5 text-sky-400" />
              <select
                value={currentDiagram.theme}
                onChange={(e) =>
                  updateCurrentDiagram(
                    (prev) => ({
                      ...prev,
                      theme: e.target.value as DiagramTheme,
                    }),
                    false,
                  )
                }
                aria-label="Tema do Diagrama"
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-hidden"
              >
                <option value="blueprint" className="bg-[#0d1424] text-slate-100">
                  Tema Blueprint
                </option>
                <option value="classic" className="bg-[#0d1424] text-slate-100">
                  Tema Clássico
                </option>
                <option value="dark" className="bg-[#0d1424] text-slate-100">
                  Tema Escuro
                </option>
              </select>
            </div>

            <div className="flex items-center rounded-xl border border-white/10 bg-[#0d1424] p-0.5">
              <button
                type="button"
                aria-label="Diminuir zoom"
                onClick={() =>
                  setZoom((z) => Math.max(0.25, Number((z - 0.15).toFixed(2))))
                }
                title="Diminuir Zoom"
                className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/8 hover:text-white"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={resetView}
                title="Clique para restaurar 100%"
                className="min-w-[48px] rounded-md px-1 py-0.5 text-center font-mono text-xs font-semibold text-slate-200 transition hover:bg-white/6"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                aria-label="Aumentar zoom"
                onClick={() =>
                  setZoom((z) => Math.min(3.5, Number((z + 0.15).toFixed(2))))
                }
                title="Aumentar Zoom"
                className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/8 hover:text-white"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <span className="mx-0.5 h-3.5 w-px bg-white/10" aria-hidden="true" />
              <button
                type="button"
                aria-label="Centralizar e resetar visualização"
                onClick={resetView}
                title="Centralizar e Resetar Zoom"
                className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/8 hover:text-white"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Exportações */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={!svgMarkup}
                onClick={() => exportAsSvg(svgMarkup, currentDiagram.title)}
                className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-[#0d1424] px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-sky-400/35 hover:bg-white/8 disabled:opacity-40"
              >
                <Download className="h-3.5 w-3.5 text-sky-400" />
                SVG
              </button>
              <button
                type="button"
                disabled={!svgMarkup}
                onClick={() =>
                  exportAsPng(
                    svgMarkup,
                    currentDiagram.title,
                    isDarkTheme ? "#050811" : "#ffffff",
                  )
                }
                className="studio-btn-primary px-3 py-1.5 text-xs"
              >
                <FileImage className="h-3.5 w-3.5" />
                PNG
              </button>
              <button
                type="button"
                onClick={() => exportAsPuml(pumlCode, currentDiagram.title)}
                className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-[#0d1424] px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-white/25 hover:bg-white/8"
              >
                <FileCode2 className="h-3.5 w-3.5 text-indigo-300" />
                .puml
              </button>
            </div>
          </div>
        </div>

        {/* Área do Canvas Interativo */}
        <div
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            backgroundImage: `radial-gradient(${gridDotColor} 1.2px, transparent 1.2px)`,
            backgroundSize: "22px 22px",
          }}
          className={`relative flex-1 overflow-hidden select-none transition-colors duration-300 ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          } ${canvasBgClass}`}
        >
          {renderError ? (
            <div className="flex h-full items-center justify-center p-8">
              <div className="max-w-md rounded-2xl border border-rose-500/35 bg-[#0b1120]/95 p-6 text-center shadow-2xl">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 ring-1 ring-rose-400/30">
                  <AlertTriangle className="h-5 w-5 text-rose-400" />
                </div>
                <h4 className="font-display mb-1.5 text-sm font-bold text-slate-100">
                  Erro de Sintaxe ou Renderização PlantUML
                </h4>
                <p className="font-mono text-xs whitespace-pre-wrap text-rose-300">
                  {renderError}
                </p>
              </div>
            </div>
          ) : !svgMarkup && isRendering ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/30 bg-[#0b1120]/90 shadow-lg">
                <Loader2 className="h-7 w-7 animate-spin text-sky-400" />
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0b1120]/90 px-5 py-3 text-center shadow-xl">
                <p className="font-display text-sm font-semibold text-slate-100">
                  Inicializando motor PlantUML no navegador...
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  100% Client-Side (WebAssembly + Viz.js)
                </p>
              </div>
            </div>
          ) : (
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
              }}
              className="flex min-h-full min-w-full items-center justify-center p-8 transition-transform duration-75 ease-out"
            >
              <div
                className={`rounded-2xl p-6 transition-shadow ${
                  isDarkTheme
                    ? "border border-white/12 bg-[#0b1120] shadow-[0_28px_70px_-20px_rgba(0,0,0,0.9)]"
                    : "border border-slate-900/10 bg-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.22)]"
                }`}
                dangerouslySetInnerHTML={{
                  __html: sanitizeSvgMarkup(svgMarkup),
                }}
              />
            </div>
          )}

          <div className="pointer-events-none absolute right-3 bottom-3 rounded-full border border-white/12 bg-[#0b1120]/85 px-3 py-1 text-[11px] font-medium text-slate-300 shadow-lg backdrop-blur-md">
            Arraste para mover • Roda do mouse para zoom • 100% no navegador
          </div>
        </div>
      </div>
    </div>
  );
}
