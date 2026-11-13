# 📊 Requerimientos Técnicos para el Proyecto de Financiamiento

**Objetivo:** Desarrollar una plataforma de Auditoría Ciudadana Universal capaz de integrarse con
cualquier municipio de Brasil.

## 🛠️ Capacidades del Motor de Ingesta (Audit Engine)

1. **Multi-tenant Architecture:** Aislamiento total de datos por municipio
   (`organizationIdentifier`) compartiendo el mismo núcleo lógico.
2. **Hybrid Ingestion System:**
   - **Tier 1 (API-First):** Integración con portales de transparencia que posean endpoints
     REST/GraphQL.
   - **Tier 2 (Scraping Engine):** Motor de extracción de datos no estructurados para municipios sin
     APIs modernas.
3. **AI-Driven Accountability:** Uso de modelos SLM para detectar discrepancias entre el valor de
   mercado y el valor ejecutado en contratos públicos.

## 🎯 Hitos de Desarrollo (Roadmap)

1. **Fase A (Identity):** Integración total con gov.br (Niveles Plata/Oro).
2. **Fase B (Ingestion):** Automatización de captura de datos de la "E-Pública" y Portales de
   Transparencia estatales.
3. **Fase C (Social):** Despliegue del "Termómetro de Impacto" para validación comunitaria de las
   inversiones reportadas.

---
