# 📊 Impact Analytics Engine: The Social Reliability Oracle

**Estatus:** Zenith (OEDP-V16.0)  
**Rol:** Inteligencia Estadística, Agregación Bayesiana e Indicadores de Impacto Social.  
**Tags:** `scope:engines`, `type:logic`, `platform:isomorphic`

## 🎯 1. Misión Ontológica

El `@floripa-dignidade/impact-analytics-engine` es el centro de procesamiento cognitivo que
transforma los datos crudos del `reputation-engine` y el `interaction-engine` en indicadores de
valor público.

Su misión es proporcionar al ciudadano, a la ONG y a los medios de comunicación una visión objetiva
y técnica sobre la credibilidad de la información y el pulso real de la sociedad en Florianópolis,
blindando las estadísticas contra ataques de bots y manipulación mediática.

## 🧠 2. Metodología de Inteligencia Ponderada

Este motor no realiza conteos aritméticos simples. Aplica la **Metodología SRE (Social Reliability
Engineering)**:

- **Agregación Bayesiana:** Utiliza el Teorema de Bayes para calcular el
  `weightedTrustScoreNumeric`. El voto de un ciudadano verificado influye más que el de una masa de
  usuarios anónimos, evitando el "linchamiento digital" o la "inflación de prestigio" artificial.
- **Intervalo de Confianza Dinámico:** Cada indicador reporta un `statisticalConfidenceLevel`. Si la
  muestra es pequeña o contradictoria, el sistema advierte que el dato es "En Proceso de
  Validación".
- **Atenuación por Antigüedad:** Implementa algoritmos de degradación temporal. Una evaluación de
  hace 6 meses tiene menos peso que una de ayer, capturando el estado actual de la dignidad humana.

## 🏛️ 3. Arquitectura de Datos (Atomic Indicators)

El búnker se divide en unidades lógicas de alta precisión:

- `src/lib/schemas/`:
  - `PopularAcceptanceIndicator.schema.ts`: ADN del "Termómetro Popular".
  - `TerritorialImpactReport.schema.ts`: Estructura para el análisis por distritos/barrios.
- `src/lib/logic/`:
  - `AggregateBayesianImpactMetrics.ts`: Orquestador matemático de precisión.
- `src/lib/logic/atomic/`:
  - `CalculateWeightedBayesianScore.ts`: Átomo de cálculo puro y testable.
  - `DetermineStatisticalConfidence.ts`: Átomo de medición de fiabilidad de muestra.
- `src/lib/i18n/`: Diccionarios técnicos profesionales para la divulgación de resultados.

## 📂 4. Persistencia e Historización de Valor

Para garantizar que Floripa Dignidade pueda emitir reportes anuales de impacto, el motor aplica:

1.  **Snapshots Temporales:** Cada semana, el motor genera un "Estado de Verdad" inmutable de todas
    las entidades, guardándolo en la tabla `impact_historical_snapshots`.
2.  **Trazabilidad Forense:** Todos los indicadores están vinculados a un `indicatorIdentifier`
    único que puede ser auditado mediante el rastro telemétrico de los pulsos originales.
3.  **Exportación Ciudadana:** Genera objetos JSON optimizados para que el `social-media-kernel`
    cree infografías automáticas sobre la transparencia institucional.

## 🚀 5. Implementaciones Futuras (Roadmap)

- **Territorial Heatmap Engine:** Generación de mapas de calor sobre violaciones de derechos humanos
  por coordenadas.
- **Transparency Index (TI):** Calificación automática de instituciones basada en su velocidad de
  respuesta a las denuncias ciudadanas.
- **Predictive Opinion Trends:** IA que predice el descontento social basado en la aceleración de
  interacciones negativas.

## 🛡️ Estándares ISO y Calidad

- **ISO/IEC 25010:** Calidad del producto y precisión funcional.
- **ISO 20488:** Transparencia en sistemas de reputación.
- **ADR 0015:** Ejecución Isomórfica (Server/Client) según la carga de datos.

---

"Convertimos los datos en dignidad a través de la precisión estadística."

---
