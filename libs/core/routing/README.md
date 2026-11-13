# 🚦 Routing & Interception Engine

**Estatus:** Zenith / Infraestructura Transversal  
**Rol:** Controlador de tráfico, orquestador de localización y guardián de fronteras.  
**Protocolo:** OEDP-V13.0 (Atomic Request Pipeline)

## 🎯 Visión Holística

El `@floripa-dignidade/routing` actúa como el sistema inmunitario y sensorial en la frontera del
servidor. Su responsabilidad es interceptar cada solicitud entrante (`Request`) y transformarla en
un contexto enriquecido (`RoutingContext`) antes de que llegue a la capa de renderizado.

## 🏗️ Arquitectura de Handlers (The Pipeline)

A diferencia de un middleware tradicional, este búnker utiliza un patrón de **Pipeline Atómico**.
Los manejadores se ejecutan de forma secuencial e inmutable:

1.  **Metadata Analyzer:** Captura IP, User-Agent y telemetría técnica inicial.
2.  **Locale Detector:** Determina el idioma óptimo comparando el dispositivo con el ADN
    institucional.
3.  **Security Guard (Futuro):** Validación de firmas, detección de bots y rate limiting.
4.  **Cognitive Identity (Futuro):** Generación de Fingerprinting de equipo para prevención de
    fraude en denuncias.

## 🧬 ADN Estructural (Aduana Zod)

Cada bit de información extraído de la solicitud es validado contra el `RoutingContextSchema`. Si el
ADN de la solicitud es malicioso o corrupto, el motor emite una señal de `CRITICAL` a
`@floripa-dignidade/telemetry`.

## 🚀 Impacto en el Ecosistema

Este búnker es consumido directamente por el `middleware.ts` de las aplicaciones finales,
permitiendo:

- Redirección automática por idioma.
- Bloqueo proactivo de acceso por roles (RBAC en frontera).
- Trazabilidad forense desde el milisegundo cero de la conexión.
