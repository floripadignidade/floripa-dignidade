**Estado:** VIGENTE / LEY ABSOLUTA  
**Referencia:** ADR 0008  
**Objetivo:** Establecer la doctrina de refactorización progresiva y visión hiper-holística para
garantizar la evolución del código hacia estándares de próxima generación (Next-Gen) sin comprometer
la estabilidad del Sistema Lego.

---

## 👁️ 1. Visión Hiper-Holística (The Hyper-Holistic Axiom)

La IA y el Arquitecto Humano operan bajo la premisa de que "Un cambio local tiene un impacto
global". Ningún aparato se refactoriza de forma aislada sin evaluar su onda expansiva en:

- El árbol de dependencias (`Module Boundaries`).
- La latencia en el Edge (Cold Starts en Vercel).
- El grafo de tipos de TypeScript (Compilación concurrente).

---

## 🔄 2. Ciclo de Interacción Estricto (Protocolo "Uno a Uno")

El proceso de refactorización queda bloqueado en una ejecución serial. Queda prohibida la
modificación paralela de múltiples aparatos.

**Fase A: Solicitud de Enfoque**

1. La IA listará los aparatos detectados en el sistema y solicitará explícitamente al Arquitecto
   Humano que seleccione **un único aparato objetivo**.
2. La IA exigirá el código base actual de dicho aparato antes de proceder.

**Fase B: Auditoría y Atomización (The Split)**

1. La IA analizará el código recibido aplicando el Principio de Responsabilidad Única Estricto.
2. Si existen puntos de atomización (Ej: lógica de negocio mezclada con llamadas de red o
   manipulación de diccionarios), la IA pulverizará el archivo original en "Átomos" separados,
   respetando los Workspaces.

**Fase C: Optimización Next-Gen** La IA inyectará pasivamente las mejores prácticas de la industria
actual:

- Extracción de utilidades de React a Hooks puros.
- Uso de `requestIdleCallback` o APIs de Web Workers para tareas no bloqueantes.
- Evaluación de complejidad ciclomática para reducir la anidación de condiciones (Return Early
  Pattern).

---

## 🛠️ 3. Estándar de Entrega Soberano (The Lost Artifact)

Toda refactorización entregada por la IA debe ser un **Aparato Completo (Gold Standard)**. La
entrega está sujeta a las siguientes reglas de completitud:

1. **Zero Omissions:** Prohibido el uso de fragmentos colapsados como `// ... código anterior ...`.
   El archivo se entrega íntegro.
2. **TSDocs Nivel Enterprise:** Documentación formal del contrato de la función, propósito,
   parámetros y tipos de retorno (OEDP-V13.0).
3. **Internacionalización (i18n):** Todo string legible por humanos debe ser extraído, esquematizado
   en Zod y entregado con sus contrapartes JSON (`es-ES`, `pt-BR`, `en-US`).
4. **Resiliencia Operativa:** Integración obligatoria de `EmitTelemetrySignal` y envoltorios de
   excepciones `GlobalBaseException`.

---

## 🤖 4. Instrucción de Arranque para la IA (Trigger)

Al detectar este manifiesto en un Snapshot futuro, la IA deberá responder únicamente listando los
aparatos disponibles y emitiendo la instrucción exacta: _"Protocolo ADR 0008 activado. Por favor,
indique el nombre de un único aparato y proporcione su código base para iniciar la refactorización
atómica."_

---
