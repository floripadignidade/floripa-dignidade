**Estado:** VIGENTE / LEY ABSOLUTA  
**Referencia:** ADR 0007  
**Objetivo:** Establecer el protocolo estricto de interacción, refactorización y entrega de código
entre el Arquitecto Humano y el Neural Sentinel (IA) para garantizar la integridad estructural del
Sistema Lego.

---

## 🤖 1. Directiva Principal de Inicio (Trigger de Memoria IA)

**INSTRUCCIÓN PARA LA IA QUE LEE ESTE SNAPSHOT:** Al iniciar un nuevo hilo procesando este proyecto,
debes confirmar que has leído el "Protocolo de Interacción IA (ADR 0007)" y comprometerte a replicar
estrictamente los 6 pasos definidos a continuación en cada interacción.

---

## 🔄 2. El Flujo de Trabajo Obligatorio (The 6-Step Pipeline)

La IA está obligada a operar bajo este flujo cíclico e inmutable. Queda prohibido asumir código o
generar aparatos masivos sin seguir estos pasos:

### PASO 1: Procesamiento "Uno a Uno" (Pacing)

Nunca trabajaremos múltiples archivos en paralelo. La IA siempre preguntará al Arquitecto Humano qué
archivo específico se va a refactorizar o construir. **Regla:** La IA _siempre_ debe pedir que se le
proporcione el código base del archivo a tratar antes de proponer ninguna refactorización.

### PASO 2: Auditoría Forense (Structural & Logical Audit)

Una vez recibido el código base, la IA realizará una auditoría silenciosa antes de codificar:

- ¿Cumple con el Principio de Responsabilidad Única (SRP)?
- ¿Viola los límites modulares (Module Boundaries) de su Workspace?
- ¿Cumple con la norma ISO de nomenclatura (Cero Abreviaturas)?

### PASO 3: Atomización Implacable (Relentless Atomization)

Si en el paso 2 la IA detecta que el archivo hace más de una cosa (Ej: define un tipo, formatea
datos y además ejecuta lógica), **debe dividirlo**. La IA propondrá y generará los "Átomos"
separados, garantizando "Un Archivo = Una Verdad".

### PASO 4: Optimización Soberana

La IA reescribirá el código inyectando las siguientes capas de infraestructura sin que el Arquitecto
tenga que pedirlo explícitamente:

- **Aduana Zod:** Validación estricta de entradas.
- **Telemetría Forense:** Emisión de señales (`EmitTelemetrySignal`) y medición de latencia
  (`TraceExecutionTime`).
- **Manejo de Errores:** Uso de excepciones estandarizadas (`GlobalBaseException`).

### PASO 5: Internacionalización (i18n)

La IA no dejará ningún texto en duro (Hardcoded). Si el aparato interactúa con humanos (UI, emails,
logs semánticos), la IA generará las interfaces Zod de i18n y los diccionarios (`es`, `pt`, `en`)
correspondientes para ese aparato.

### PASO 6: Entrega "Ready for Production" (The Lost Standard)

El código entregado por la IA no debe contener bloques como `// ... resto del código ...`. Debe ser
entregado 100% completo, con TSDocs de grado Enterprise, listo para que el Arquitecto haga Copy &
Paste directo a producción.

---

## ⚖️ 3. Acuerdo de Límites Modulares

La IA nunca sugerirá importar un recurso de un workspace superior a uno inferior (Ej: un archivo de
`libs/core` no puede importar de `libs/modules`). La jerarquía de Nx es ley absoluta.

---
