# ⚖️ Reputation Engine: The Social Truth Oracle

**Estatus:** Zenith (OEDP-V16.0)  
**Rol:** Cerebro de Credibilidad, Reputación Bayesiana y Auditoría de Veracidad.  
**Tags:** `scope:modules`, `type:logic`, `platform:isomorphic`

## 🎯 1. Misión Ontológica

El `@floripa-dignidade/reputation-engine` es el encargado de transformar la subjetividad de la
opinión pública en **Métricas de Confianza Objetiva**. Su objetivo fundamental es garantizar que la
red de Floripa Dignidade sea resistente a la desinformación, eliminando el impacto de bots y
coordinando la validación civil de instituciones y noticias.

## 🧠 2. Metodología de Inteligencia (Bayesian Authority)

A diferencia de los sistemas tradicionales de votación (donde todos los votos valen 1), este búnker
implementa la **Ponderación de Autoridad Responsable**:

- **Algoritmo Bayesiano:** El cálculo de reputación utiliza una base de incertidumbre inicial. Una
  entidad nueva nace con "Baja Confianza" hasta que una muestra estadísticamente significativa de
  ciudadanos verificados la respalde.
- **Atenuación Temporal:** La credibilidad se degrada si no hay una conducta ética sostenida en el
  tiempo, forzando a las instituciones a mantener una transparencia constante.
- **Filtro Cognitivo:** Integración nativa con el `health-analysis-engine` para auditar la semántica
  de los comentarios y detectar discursos de odio o intentos de fraude.

## 🏗️ 3. Estructura del Búnker (Atomic Hierarchy)

Siguiendo la arquitectura Lego, el búnker se organiza en:

- `src/lib/schemas/`: Define los contratos de ADN de los pulsos de evaluación y análisis de
  veracidad.
- `src/lib/logic/`: Contiene los orquestadores de ingesta que coordinan la validación y el despacho
  telemétrico.
- `src/lib/logic/atomic/`: Átomos de cálculo puro (ej: Cálculo de veracidad semántica).
- `src/lib/i18n/`: Silos lingüísticos para reportes técnicos y humanos.

## 📂 4. Persistencia y Reutilización Histórica

Para permitir la **Historización Sociológica**, este búnker no sobreescribe datos. Cada acción
genera un **Pulso de Evaluación Inmutable**:

1.  **Ingesta:** Se captura el pulso cuali-cuantitativo.
2.  **Identidad:** Se vincula al `identityTrustWeightScore` del ciudadano.
3.  **Persistencia Cloud:** Se almacena en el Tier de Supabase bajo una estructura de serie temporal
    (Time-series).
4.  **Exportación:** El `impact-analytics-engine` consume estos eventos para generar indicadores de
    aceptación que pueden ser compartidos en redes sociales mediante el `social-media-kernel`.

## 🚀 5. Implementaciones Futuras (Roadmap)

- **Merkle Trust Proofs:** Generación de recibos criptográficos de votos para que el ciudadano pueda
  verificar que su auditoría fue contada.
- **Peer-Review Identity:** Los ciudadanos podrán elevar la reputación de otros ciudadanos basándose
  en la utilidad de sus denuncias.
- **Predictive Anomaly Detection:** IA entrenada para detectar "Ataques de Prestigio" (brigading) en
  milisegundos.

## 🛡️ Estándares de Calidad Aplicados

- **ISO 20488:** Integridad y transparencia en revisiones online.
- **ISO/IEC 11179:** Nomenclatura técnica basada en Objeto + Propiedad + Representación.
- **ADR 0007/0008:** Protocolo estricto de interacción IA y refactorización atómica.

---

"La tecnología de Floripa Dignidade no solo mide datos, construye la infraestructura de la confianza
humana."
