import createDOMPurify from "dompurify";

const DANGEROUS_SVG_TAGS = [
  "script",
  "foreignObject",
  "iframe",
  "object",
  "embed",
  "audio",
  "video",
  "link",
  "meta",
  "base",
  "form",
  "input",
  "textarea",
  "button",
];

const DANGEROUS_URI_RE =
  /^\s*(?:javascript|vbscript|data\s*:\s*text\/html|file|https?):/i;

function createPurifier(customWindow?: unknown) {
  const win =
    customWindow ?? (typeof window !== "undefined" ? window : undefined);
  if (!win) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const purifier = createDOMPurify(win as any);
  purifier.addHook("uponSanitizeAttribute", (_node, data) => {
    const attrName = data.attrName.toLowerCase();
    if (attrName.startsWith("on")) {
      data.keepAttr = false;
      return;
    }

    if (
      attrName === "href" ||
      attrName === "xlink:href" ||
      attrName === "src" ||
      attrName === "action"
    ) {
      if (DANGEROUS_URI_RE.test(data.attrValue)) {
        data.keepAttr = false;
      }
    }

    if (
      attrName === "style" &&
      /url\s*\(\s*['"]?\s*(?:https?:|javascript:|data:text\/html)/i.test(
        data.attrValue,
      )
    ) {
      data.keepAttr = false;
    }
  });

  return purifier;
}

let cachedPurifier: ReturnType<typeof createDOMPurify> | null = null;

/**
 * Sanitiza markup SVG produzido pelo motor PlantUML antes de renderizá-lo no DOM
 * ou exportá-lo, mitigando vetores de XSS (scripts, foreignObject, event handlers, links javascript:).
 */
export function sanitizeSvgMarkup(
  rawSvg: string,
  customWindow?: unknown,
): string {
  if (!rawSvg || typeof rawSvg !== "string") {
    return "";
  }

  const purifier = customWindow
    ? createPurifier(customWindow)
    : (cachedPurifier ??= createPurifier());

  // Fail-closed quando não há ambiente DOM disponível
  if (!purifier) {
    return "";
  }

  return purifier.sanitize(rawSvg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: DANGEROUS_SVG_TAGS,
    ADD_TAGS: ["use", "defs", "clipPath", "mask", "pattern", "marker"],
    ADD_ATTR: ["target", "xlink:href", "viewBox", "preserveAspectRatio"],
  });
}

