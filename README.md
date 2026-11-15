<div align="center">

# NextUML

**Estúdio híbrido para modelagem UML com Inteligência Artificial, formulários guiados e renderização PlantUML 100% no navegador.**

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-0f172a?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-0284c7?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-0f172a?style=flat-square&logo=tailwindcss&logoColor=38B2AC)
![PlantUML](https://img.shields.io/badge/Engine-PlantUML_%2B_WASM-0369a1?style=flat-square)
![Gemini](https://img.shields.io/badge/IA-Google_Gemini-1d4ed8?style=flat-square)

</div>

---

## Visão Geral

O **NextUML** combina geração assistida por IA em linguagem natural, edição estruturada por formulários e escrita direta em PlantUML dentro de uma única interface interativa.

Diferente de ferramentas que dependem de servidores Java externos ou APIs públicas para desenhar diagramas, toda a compilação PlantUML para SVG acontece **diretamente no navegador** via `@plantuml/core` e Graphviz WebAssembly — garantindo baixa latência e mantendo o código-fonte dos diagramas no lado do cliente.

---

## Diagramas Suportados (v1)

| Diagrama | Recursos Modelados |
| :--- | :--- |
| **Classes** | Pacotes, classes, interfaces, classes abstratas, enums, visibilidade (`+`, `-`, `#`, `~`), estereótipos, herança, implementação, composição, agregação, associação, dependência e multiplicidades |
| **Casos de Uso** | Atores, fronteira de sistema, casos de uso e relacionamentos de associação, `<<include>>`, `<<extend>>` e generalização |
| **Sequência** | Participantes (`actor`, `participant`, `boundary`, `control`, `entity`, `database`), mensagens síncronas, assíncronas e de retorno, blocos `alt`, `opt` e `loop` |
| **Atividades** | Raias (*swimlanes*), ações sequenciais, decisões condicionais (`if / else`) e laços (`while / repeat`) |
| **Máquina de Estados** | Estados simples e compostos, estado inicial/final e transições com evento, condição de guarda e efeito |

---

## Fluxo Híbrido de Criação

1. **Assistente de IA (Texto Livre)**: descreva o domínio ou fluxo do sistema em português. Quando faltam informações essenciais para gerar um diagrama consistente, a IA formula perguntas objetivas com sugestões clicáveis antes de atualizar o modelo.
2. **Editor Guiado**: manipule entidades, participantes, relacionamentos e fluxos em abas estruturadas, com sincronização instantânea para código PlantUML e diagrama.
3. **Painel PlantUML (`.puml`)**: inspecione, copie ou ajuste o código PlantUML diretamente em tempo real.
4. **Viewport Interativa & Exportação**:
   - Zoom progressivo com a **rodinha do mouse** ou controles de escala, movimentação (*pan*) e ajuste automático à tela.
   - Alternância imediata entre 3 temas visuais (`Blueprint`, `Clássico` e `Escuro`).
   - Exportação em **SVG**, **PNG** e **`.puml`**, além de salvamento local no navegador e portabilidade de projetos em `.json`.

---

## Arquitetura de Segurança

O projeto aplica controles em profundidade tanto na renderização client-side quanto na rota de IA:

- **Sanitização de SVG (anti-XSS)**: toda saída renderizada na viewport e exportada em SVG/PNG passa por `DOMPurify`, removendo `<script>`, `<foreignObject>`, manipuladores `on*` e URIs perigosos.
- **Sandbox PlantUML**: validação e neutralização de diretivas inseguras (`!include`, `!import`, `%getenv`, links `javascript:`), travamento de *loaders* externos e execução sem `new Function`.
- **Parsing JSON Seguro**: proteção contra *Prototype Pollution* (`__proto__`, `constructor`, `prototype`) na importação de projetos e nas requisições da API.
- **Hardening da API `/api/uml-assistant`**:
  - Checagem estrita de origem (`Origin` / `Referer` / `Sec-Fetch-Site`) contra CSRF e exigência de `Content-Type: application/json`.
  - *Rate limiting* por IP com resposta `429` e cabeçalho `Retry-After`, além de limite de tamanho de requisição (`64 KB`).
  - Validação rigorosa de entrada e saída estruturada com schemas **Zod** `.strict()`.
  - Camada de defesa contra *Prompt Injection* com isolamento de contexto não confiável e redação de segredos em logs.
- **Política de Headers HTTP & CSP**: `Content-Security-Policy` sem `'unsafe-eval'` em produção (mantendo `'wasm-unsafe-eval'` apenas para o Graphviz WebAssembly), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy` e `Strict-Transport-Security` em produção.

---

## Stack & Estrutura do Projeto

- **Core**: Next.js 16 (App Router + Turbopack), React 19, TypeScript
- **Interface & Estado**: Tailwind CSS v4, `lucide-react`, Zustand
- **IA & Validação**: Vercel AI SDK (`ai`), `@ai-sdk/google` (Google Gemini), Zod
- **Diagramação & Segurança**: `@plantuml/core` (Graphviz WASM), `dompurify`
- **Testes**: Vitest + jsdom

```text
src/
├── app/
│   ├── api/uml-assistant/   # Rota protegida do assistente de IA (Gemini + Zod + Guardrails)
│   ├── layout.tsx           # Metadados e configuração base da aplicação
│   └── page.tsx             # Entrada principal do estúdio
├── components/studio/
│   ├── forms/               # Formulários guiados para os 5 tipos de diagrama UML
│   ├── AiAssistantPanel.tsx # Interface conversacional e perguntas de esclarecimento
│   ├── DiagramViewport.tsx  # Canvas SVG com zoom por scroll, pan, temas e exportação
│   ├── PumlCodePanel.tsx    # Visualizador e editor direto de código PlantUML
│   └── StudioShell.tsx      # Layout principal e gerenciamento de projetos locais
├── lib/
│   ├── export/              # Exportação segura para SVG, PNG e .puml
│   ├── plantuml/            # Geradores determinísticos e engine client-side
│   ├── security/            # Sanitização SVG, guardas PlantUML/Prompt, Rate Limit e JSON seguro
│   └── uml/schemas/         # Contratos Zod para os 5 diagramas UML
└── store/
    └── useDiagramStore.ts   # Estado reativo e persistência local dos diagramas
```
