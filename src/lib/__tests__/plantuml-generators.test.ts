import { describe, expect, it } from "vitest";
import {
  DEFAULT_DIAGRAM_TEMPLATES,
  UmlDiagramDataSchema,
} from "@/lib/uml/schemas";
import { generatePlantUml } from "@/lib/plantuml/generators";
import { POST } from "@/app/api/uml-assistant/route";

describe("UML Schemas & PlantUML Generators (5 Core Diagrams)", () => {
  it("valida todos os 5 templates padrão nos Schemas Zod sem erros", () => {
    for (const key of [
      "class",
      "usecase",
      "sequence",
      "activity",
      "state",
    ] as const) {
      const sample = DEFAULT_DIAGRAM_TEMPLATES[key];
      const result = UmlDiagramDataSchema.safeParse(sample);
      expect(result.success).toBe(true);
    }
  });

  it("gera sintaxe PlantUML válida para Diagrama de Classes (atributos, métodos, interface e multiplicidades)", () => {
    const puml = generatePlantUml(DEFAULT_DIAGRAM_TEMPLATES.class);
    expect(puml).toContain("@startuml");
    expect(puml).toContain('class "Cliente" as cls_cliente');
    expect(puml).toContain("- id : UUID");
    expect(puml).toContain("+ calcularTotal() : BigDecimal");
    expect(puml).toContain('interface "MetodoPagamento"');
    expect(puml).toContain('cls_pedido "1" *-- "1..*" cls_item : contém');
    expect(puml).toContain("cls_pix ..|> cls_pagamento");
    expect(puml).toContain("@enduml");
  });

  it("gera sintaxe PlantUML válida para Diagrama de Casos de Uso (atores, sistema, include e extend)", () => {
    const puml = generatePlantUml(DEFAULT_DIAGRAM_TEMPLATES.usecase);
    expect(puml).toContain("@startuml");
    expect(puml).toContain('actor "Aluno" as act_aluno');
    expect(puml).toContain('rectangle "Plataforma EAD"');
    expect(puml).toContain('usecase "Matricular-se em Curso" as uc_1');
    expect(puml).toContain("act_aluno --> uc_1");
    expect(puml).toContain("uc_1 ..> uc_5 : <<include>>");
    expect(puml).toContain("uc_6 ..> uc_1 : <<extend>>");
    expect(puml).toContain("@enduml");
  });

  it("gera sintaxe PlantUML válida para Diagrama de Sequência (lifelines, autonumber e blocos alt)", () => {
    const puml = generatePlantUml(DEFAULT_DIAGRAM_TEMPLATES.sequence);
    expect(puml).toContain("@startuml");
    expect(puml).toContain("autonumber");
    expect(puml).toContain('actor "Cliente" as p_user');
    expect(puml).toContain('database "EstoqueDB" as p_db');
    expect(puml).toContain("p_web -> p_api : POST /orders (itens, clienteId)");
    expect(puml).toContain("alt Estoque disponível");
    expect(puml).toContain("@enduml");
  });

  it("gera sintaxe PlantUML válida para Diagrama de Atividades (swimlanes, if/else e fork)", () => {
    const puml = generatePlantUml(DEFAULT_DIAGRAM_TEMPLATES.activity);
    expect(puml).toContain("@startuml");
    expect(puml).toContain("|Cliente|");
    expect(puml).toContain("start");
    expect(puml).toContain("if (Pedido está dentro da política automática?) then (Sim)");
    expect(puml).toContain("fork");
    expect(puml).toContain("fork again");
    expect(puml).toContain("end fork");
    expect(puml).toContain("stop");
    expect(puml).toContain("@enduml");
  });

  it("gera sintaxe PlantUML válida para Diagrama de Máquina de Estados (estados iniciais, finais, guardas e ações)", () => {
    const puml = generatePlantUml(DEFAULT_DIAGRAM_TEMPLATES.state);
    expect(puml).toContain("@startuml");
    expect(puml).toContain("[*] --> s_criado");
    expect(puml).toContain(
      "s_criado --> s_pago : pagamentoConfirmado [valor == total] / registrarTransacao()",
    );
    expect(puml).toContain("s_entregue --> [*]");
    expect(puml).toContain("@enduml");
  });

  it("valida o endpoint /api/uml-assistant exigindo GOOGLE_GENERATIVE_AI_API_KEY no .env", async () => {
    const prevKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    const req = new Request("http://localhost:3000/api/uml-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Sistema de clínica médica com Médico e Paciente",
        diagramType: "class",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.missingApiKey).toBe(true);

    if (prevKey !== undefined) {
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = prevKey;
    }
  });
});
