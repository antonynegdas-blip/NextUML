"use client";

import { sanitizeSvgMarkup, validatePumlSafety } from "@/lib/security";

export interface PlantUmlRenderOptions {
  dark?: boolean;
  maxSvgSize?: number;
}

export interface PlantUmlRenderResult {
  svg: string;
  durationMs: number;
}

type RenderToStringFn = (
  lines: string[],
  onSuccess: (svg: string) => void,
  onError: (err: string) => void,
  options?: { dark?: boolean; maxSvgSize?: number },
) => void;

interface PlantUmlModule {
  renderToString: RenderToStringFn;
}

let enginePromise: Promise<PlantUmlModule> | null = null;

function loadScript(src: string, isModule = false): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("PlantUML renderer requires a browser environment."));
      return;
    }

    const existing = document.querySelector(`script[data-plantuml-src="${src}"]`);
    if (existing) {
      if (existing.getAttribute("data-loaded") === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error(`Falha ao carregar script ${src}`)),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    if (isModule) {
      script.type = "module";
    }
    script.async = true;
    script.setAttribute("data-plantuml-src", src);
    script.onload = () => {
      script.setAttribute("data-loaded", "true");
      resolve();
    };
    script.onerror = () =>
      reject(new Error(`Falha ao carregar motor de layout (${src})`));
    document.head.appendChild(script);
  });
}

function lockDownPlantUmlEnvironment() {
  const g = globalThis as Record<string, unknown>;
  // Bloqueia leituras de arquivos locais ou inclusões remotas não autorizadas no motor
  g.PLANTUML_FILE_LOADER = () => null;
  g.PLANTUML_STDLIB_LOADER = () => null;
  g.PLANTUML_STDLIB_BASE = "";
}

export async function ensurePlantUmlEngine(): Promise<PlantUmlModule> {
  if (typeof window === "undefined") {
    throw new Error("O motor PlantUML roda apenas no navegador (client-side).");
  }

  if (!enginePromise) {
    enginePromise = (async () => {
      lockDownPlantUmlEnvironment();

      // 1. Carrega o Graphviz (Viz.js) global exigido para diagramas de Classes, Estados e Casos de Uso
      await loadScript("/plantuml/viz-global.js", false);
      const g = globalThis as Record<string, unknown>;
      if (g.Viz && !g.PLANTUML_VIZ) {
        g.PLANTUML_VIZ = g.Viz;
      }

      // 2. Carrega o módulo bridge ES sem usar eval/new Function (compatível com CSP estrito)
      if (!g.__PLANTUML_ENGINE__) {
        await loadScript("/plantuml/bridge.js", true);
      }

      const mod = g.__PLANTUML_ENGINE__ as PlantUmlModule | undefined;
      if (!mod || typeof mod.renderToString !== "function") {
        throw new Error(
          "Módulo @plantuml/core inválido: renderToString não encontrado.",
        );
      }
      return mod;
    })().catch((err) => {
      enginePromise = null;
      throw err;
    });
  }

  return enginePromise;
}

export async function renderPlantUmlToSvg(
  pumlCode: string,
  options: PlantUmlRenderOptions = {},
): Promise<PlantUmlRenderResult> {
  const safety = validatePumlSafety(pumlCode);
  if (!safety.safe) {
    throw new Error(safety.reason || "Código PlantUML bloqueado por segurança.");
  }

  const startTime = performance.now();
  const engine = await ensurePlantUmlEngine();
  const lines = pumlCode.split(/\r\n|\r|\n/);

  return new Promise<PlantUmlRenderResult>((resolve, reject) => {
    engine.renderToString(
      lines,
      (rawSvg: string) => {
        const cleanSvg = sanitizeSvgMarkup(rawSvg);
        if (!cleanSvg) {
          reject(new Error("O SVG gerado foi rejeitado pela sanitização."));
          return;
        }
        const durationMs = Math.round(performance.now() - startTime);
        resolve({ svg: cleanSvg, durationMs });
      },
      (errorMessage: string) => {
        reject(new Error(errorMessage || "Erro ao renderizar diagrama PlantUML."));
      },
      {
        dark: Boolean(options.dark),
        maxSvgSize: options.maxSvgSize ?? 8192,
      },
    );
  });
}
