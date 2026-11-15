import { renderToString } from "./plantuml.js";

globalThis.__PLANTUML_ENGINE__ = { renderToString };
globalThis.dispatchEvent(new CustomEvent("plantuml-engine-ready"));

