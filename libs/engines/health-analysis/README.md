# 🧠 Health Analysis Engine (The Neural Sentinel)

**Estatus:** God Tier / AI-Native Orquestador  
**Rol:** Cerebro cognitivo para la predicción de fallos, auditoría lógica y auto-sanación de
código.  
**Protocolo:** OEDP-V12.0 (Multi-Provider Cognitive Logic)

## 🎯 Visión Holística

El **Health Analysis Engine (HAE)** es el epicentro de inteligencia del ecosistema Floripa
Dignidade. A diferencia de un sistema de monitoreo tradicional, el HAE utiliza modelos de lenguaje
(LLMs) y modelos de lenguaje pequeños (SLMs) para transformar señales de telemetría en **Directivas
de Acción**.

## 🏗️ Arquitectura de Próxima Generación

### 1. Multi-Provider Gateway (`/providers`)

El motor es agnóstico al modelo. Implementa adaptadores para:

- **Cloud Tier:** OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet).
- **Edge/Private Tier:** Hugging Face (Phi-3, Llama-3-8B) para procesamiento de datos sensibles
  localmente en Spaces.
- **Failover:** Si un proveedor falla, el motor conmuta automáticamente al siguiente sin interrumpir
  la auditoría.

### 2. Prompt Engineering as Code - PEaC (`/prompts`)

Los prompts no son strings perdidos en el código. Son **Aparatos Atómicos** con:

- **Versionamiento:** Prompts inmutables para garantizar consistencia en el razonamiento.
- **i18n Nativo:** Capacidad de razonar y generar explicaciones en PT, ES y EN.
- **Context Injectors:** Diccionarios dinámicos que inyectan el estado actual del monorepo (NX
  Graph, Telemetry Snapshots).

### 3. Semantic Code Healing (`/logic`)

Este búnker posee la capacidad de:

- **Detectar Fricción de Intención:** Analiza si un usuario está fallando por un bug de UX o un
  error lógico.
- **Generar Parches Reales:** Capacidad de proponer correcciones de código basadas en las
  violaciones de los Manifiestos (.docs).
- **Sentinel Directives:** Genera contratos Zod que ordenan al sistema `RESTART`, `PURGE` o
  `REDIRECT`.

## 🧬 ADN Estructural (Aduana Zod)

Cada inferencia realizada por el cerebro debe ser validada por el `InferenceResponseSchema`. No
aceptamos "alucinaciones"; si la respuesta de la IA no cumple el contrato de datos, se descarta y se
reporta a Telemetry como `ADN_COGNITIVO_CORRUPTO`.

## 🚀 Uso Transversal

Este workspace está diseñado para ser importado por:

- `libs/core/telemetry`: Para análisis forense de errores en tiempo real.
- `apps/neural-sentinel`: Como motor lógico del dashboard del arquitecto.
- `tools/scripts`: Para auditoría automática de Pull Requests.
