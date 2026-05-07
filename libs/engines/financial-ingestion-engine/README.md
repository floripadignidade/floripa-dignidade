# 💰 Financial Ingestion Engine: The Transparency Sentry
**Estatus:** Zenith (OEDP-V17.0)  
**Rol:** Extracción, Normalización y Auditoría de Matrices Presupuestarias.  
**Tags:** `scope:engines`, `type:logic`, `platform:node`

## 🎯 1. Misión Ontológica
Este motor es el encargado de transformar documentos administrativos (Excel/XLSX) en **Evidencia Financiera Inmutable**. Su misión es erradicar la opacidad en el gasto social, permitiendo que cada centavo de los convenios públicos (ej. Passarela da Cidadania) sea trazable y auditable por el ciudadano.

## 🧠 2. El Problema: Hemorragia de Formato
Las planillas gubernamentales y de ONGs presentan tres desafíos críticos:
1. **Dependencia de Contexto:** El nombre de un profesional no tiene sentido sin el monto declarado en la fila superior del cargo.
2. **Volatilidad de Columnas:** Si el gobierno añade una columna, los extractores tradicionales colapsan.
3. **Ruido Visual:** Uso de caracteres como "✓" o "R$" que ensucian la matemática del dato.

## 🏗️ 3. Arquitectura de Aparatos (Elite Logic)
El búnker opera bajo el patrón de **Contextual Row Ingestion**:

*   **`ExtractWorkbookData.ts`**: El cerebro del búnker. Implementa una máquina de estados que mantiene el contexto de la última categoría fiscal y monto detectado para vincularlo a las filas de personas (Checkmark Logic).
*   **`ProjectFinancialLedger.schema.ts`**: La Aduana de ADN. Purifica strings monetarios (`R$ 1.000,00` -> `1000.00`) y valida el cumplimiento ISO.
*   **`PersistFinancialLedgerToCloud.ts`**: Despachador Stateless hacia el Ledger Soberano en Supabase.

## 🤖 4. Auditoría por IA (Neural Sentinel Ready)
Este motor está diseñado para ser "auditado" por el Sentinel. Si el esquema del Excel cambia (ej. el cargo ya no está en la columna 1), el aparato emite una señal `CRITICAL` con un **Snapshot Forense**, permitiendo que la IA sugiera una nueva configuración de mapeo sin intervención manual.

## 🚀 5. Flujo de Ejecución Manual (CLI)
Para ingestas masivas de archivos físicos, el búnker es invocado por el disparador:
`pnpm nx run @floripa-dignidade/scripts:ingest-budget`

---
"La transparencia financiera es el cimiento de la dignidad ciudadana."
