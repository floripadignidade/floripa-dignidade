# 📘 MANUAL DE NOMENCLATURA TÉCNICA (OEDP-V18.1)

**Estado:** VIGENTE / LEY ABSOLUTA  
**Referencia Normativa:** ISO/IEC 11179 (Metadata Naming), ISO 21090 (Data Types).  
**Objetivo:** Garantizar la claridad, profesionalismo y mantenibilidad del ecosistema mediante el
uso de lenguaje técnico de grado industrial, eliminando metáforas y términos informales.

---

## 1. Doctrina de Prosa Técnica (Object + Property + Representation)

Toda variable, función, clase o constante debe seguir el estándar de nomenclatura explícita. Queda
prohibida la ambigüedad y la abreviación.

- **Mala Práctica:** `const userSov = true;`
- **Buena Práctica:** `const isUserIdentityVerifiedBoolean = true;`

## 2. Tabla de Transición Semántica (Purga de Metáforas)

Queda estrictamente prohibido el uso de términos coloquiales. La siguiente tabla establece los
reemplazos obligatorios:

| Término Prohibido   | Término Técnico Obligatorio          | Ámbito de Aplicación              |
| :------------------ | :----------------------------------- | :-------------------------------- |
| **Sovereign**       | **Core / Primary / Enterprise**      | Identidad, Infraestructura, Datos |
| **Zenith**          | **Reference / Standard**             | Arquitectura, Estándares          |
| **Bunker**          | **Module / Library / Component**     | Estructura de carpetas y lógica   |
| **Aduana**          | **Validator / Guard / Contract**     | Validaciones Zod y esquemas       |
| **Lego**            | **Modular / Atomic**                 | Arquitectura de componentes       |
| **Neural Sentinel** | **Health Monitor / Analysis Engine** | Inteligencia Artificial y SRE     |
| **Blood Flow**      | **Event Stream / Data Flow**         | Flujos de telemetría y datos      |
| **Swarm**           | **Orchestrated / Concurrent**        | Lógica de ejecución múltiple      |
| **God Tier**        | **Global / Root**                    | Jerarquía de importancia          |
| **Handshake**       | **Verification / Synchronization**   | Protocolos de comunicación        |

## 3. Reglas de Estilo para Identificadores

### 3.1 Variables Booleanas

Deben comenzar con un verbo de estado y terminar con el sufijo `Boolean`.

- `isNetworkOnlineBoolean`
- `hasPrivacyConsentBoolean`

### 3.2 Cantidades y Magnitudes

Deben incluir el sufijo que represente su unidad de medida.

- `executionLatencyInMillisecondsQuantity`
- `totalRecordsCountQuantity`

### 3.3 Literales y Snapshots

- `errorMessageLiteral`: Para cadenas de texto legibles.
- `identityStateSnapshot`: Para representaciones inmutables de un estado en un momento dado.

## 4. Estructura de Rutas y Workspaces

Los nombres de las carpetas deben ser funcionales.

- `libs/contracts` (ADN/Esquemas)
- `libs/core` (Infraestructura base)
- `libs/engines` (Lógica agnóstica de procesamiento)
- `libs/modules` (Lógica de dominio de negocio)

---

"La precisión del lenguaje es la base de la integridad del software."
