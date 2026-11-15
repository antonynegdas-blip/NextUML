"use client";

import { sanitizeSvgMarkup } from "@/lib/security";

function slugifyFileName(title: string, fallback = "diagrama-uml"): string {
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function exportAsSvg(svgContent: string, title: string) {
  const safeSvg = sanitizeSvgMarkup(svgContent);
  if (!safeSvg) {
    throw new Error("SVG inválido ou bloqueado para exportação.");
  }
  const filename = `${slugifyFileName(title)}.svg`;
  const blob = new Blob([safeSvg], { type: "image/svg+xml;charset=utf-8" });
  triggerDownload(blob, filename);
}

export function exportAsPuml(pumlCode: string, title: string) {
  const filename = `${slugifyFileName(title)}.puml`;
  const blob = new Blob([pumlCode], { type: "text/plain;charset=utf-8" });
  triggerDownload(blob, filename);
}

export function exportAsJson(data: unknown, title: string) {
  const filename = `${slugifyFileName(title)}.uml.json`;
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  triggerDownload(blob, filename);
}

export async function exportAsPng(
  svgContent: string,
  title: string,
  backgroundColor = "#ffffff",
): Promise<void> {
  const safeSvg = sanitizeSvgMarkup(svgContent);
  if (!safeSvg) {
    throw new Error("SVG inválido para exportação em PNG.");
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(safeSvg, "image/svg+xml");
  const svgEl = doc.querySelector("svg");
  if (!svgEl) {
    throw new Error("SVG inválido para exportação em PNG.");
  }

  let width = parseFloat(svgEl.getAttribute("width") || "0");
  let height = parseFloat(svgEl.getAttribute("height") || "0");
  const viewBox = svgEl.getAttribute("viewBox");

  if ((!width || !height) && viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(Number);
    if (parts.length === 4) {
      width = parts[2] || 800;
      height = parts[3] || 600;
    }
  }

  // Limita dimensões máximas de rasterização para evitar exaustão de memória no canvas
  width = Math.min(4096, Math.max(width || 800, 200));
  height = Math.min(4096, Math.max(height || 600, 150));

  svgEl.setAttribute("width", `${width}`);
  svgEl.setAttribute("height", `${height}`);
  if (!svgEl.getAttribute("xmlns")) {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }

  const serialized = new XMLSerializer().serializeToString(svgEl);
  const svgBlob = new Blob([serialized], {
    type: "image/svg+xml;charset=utf-8",
  });
  const svgObjectUrl = URL.createObjectURL(svgBlob);

  return new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const scale = 2; // Alta definição (Retina 2x)
        const padding = 32;
        const canvas = document.createElement("canvas");
        canvas.width = (width + padding * 2) * scale;
        canvas.height = (height + padding * 2) * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(
            new Error("Não foi possível inicializar o contexto 2D do Canvas."),
          );
          return;
        }

        ctx.scale(scale, scale);
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width + padding * 2, height + padding * 2);
        ctx.drawImage(img, padding, padding, width, height);

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(svgObjectUrl);
          if (!blob) {
            reject(new Error("Falha ao converter o diagrama em PNG."));
            return;
          }
          triggerDownload(blob, `${slugifyFileName(title)}.png`);
          resolve();
        }, "image/png");
      } catch (err) {
        URL.revokeObjectURL(svgObjectUrl);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(svgObjectUrl);
      reject(new Error("Erro ao carregar imagem SVG para conversão PNG."));
    };
    img.src = svgObjectUrl;
  });
}
