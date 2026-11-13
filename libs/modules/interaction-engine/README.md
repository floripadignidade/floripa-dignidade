# 🤝 Interaction Engine: The Social Sentiment Sensor

**Estatus:** Zenith (OEDP-V16.0)  
**Rol:** Gestión de Apoyos Populares, Reacciones Semánticas e Interacciones Sociales.  
**Tags:** `scope:modules`, `type:logic`, `platform:isomorphic`

## 🎯 1. Misión Ontológica

El `@floripa-dignidade/interaction-engine` actúa como el sistema sensorial periférico del
ecosistema. Su responsabilidad es capturar, validar y procesar las interacciones rápidas de los
ciudadanos (Likes, Unlikes, Emoticones) sobre las entidades de la red (Noticias, Denuncias,
Organizaciones).

Aísla el "Ruido Social" de la "Reputación Profunda", permitiendo una respuesta instantánea en la
interfaz sin comprometer la integridad de la auditoría civil.

## 🧠 2. Metodología de Ponderación Responsable

Para garantizar la **No Discriminación** y la **Objetividad Popular**, el motor implementa una
jerarquía de impacto basada en la soberanía de la identidad:

- **Nivel Cero (Interacción Anónima):** Apoyo visual mediante emoticones. Proporciona alivio y
  expresión al ciudadano en riesgo.
  - _Peso Estadístico:_ 0.1 (No afecta la credibilidad institucional, solo el termómetro de
    sentimiento).
- **Nivel Uno (Respaldo Identificado):** Usuarios logueados vía OAuth2 (Google, Apple, X).
  - _Peso Estadístico:_ 1.0 (Validado como humano por un tercero confiable).
- **Nivel Dos (Respaldo Soberano):** Ciudadanos con identidad verificada por la ONG.
  - _Peso Estadístico:_ 5.0 (Voto decisivo en indicadores de transparencia).

## 🏛️ 3. Estructura Estructural (Atomic Swarm)

El búnker sigue el patrón de **Funcionalidad Atómica** para garantizar que cada pieza de Lego sea
reutilizable:

- `src/lib/schemas/`:
  - `PublicReaction.schema.ts`: ADN de la interacción (Polaridad, Emoticón, Metadatos).
- `src/lib/logic/`:
  - `ProcessPublicReactionTransaction.ts`: Orquestador de ingesta que calcula el impacto inmediato.
- `src/lib/logic/atomic/`:
  - `MapEmoticonToSentiment.ts`: Átomo que traduce iconos en valores numéricos para analítica.
- `src/lib/i18n/`: Silos lingüísticos para que el feedback de interacción sea 100% localizado.

## 📂 4. Estrategia de Persistencia e Historización (SRE)

Este búnker implementa una **Persistencia Dual** para maximizar la velocidad y la capacidad de
estudio futuro:

1.  **Persistencia Volátil (Zustand):** Gestión del estado en el cliente para feedback instantáneo
    (Optimistic UI). El ciudadano ve su reacción reflejada en < 16ms.
2.  **Persistencia Transaccional (Supabase):** Cada interacción se registra como un evento único en
    la tabla `social_interaction_ledger`.
3.  **Capa de Historización:** No se usan contadores incrementales simples en la DB. Guardamos el
    rastro forense completo para que el `impact-analytics-engine` pueda realizar estudios de
    evolución del sentimiento popular a través de los meses (Series Temporales).

## 🚀 5. Implementaciones Futuras

- **Cross-Platform Injection:** Capacidad de compartir automáticamente hitos de apoyo popular en
  Instagram/Threads mediante el `social-media-kernel`.
- **Territorial Heatmaps:** Agregación de reacciones por geolocalización anonimizada para detectar
  crisis en barrios específicos.
- **Spam Pattern Recognition:** Algoritmo SRE que detecta ráfagas de clics inhumanas antes de que
  lleguen a la capa de persistencia.

## 🛡️ Pilares de Calidad y Normas

- **ISO/IEC 11179:** Nomenclatura descriptiva (ej: `interactionPolarityNumeric` en lugar de
  `isLike`).
- **ADR 0015 (Cloud-Sovereign):** El búnker es 100% stateless; toda la verdad reside en el
  S3-Compatible Gateway y Postgres.
- **Neural Sentinel Ready:** Cada señal emitida incluye metadatos de contexto para auditoría por IA.

---

"Convertimos la interacción ciudadana en una herramienta de transparencia inalterable."

---
