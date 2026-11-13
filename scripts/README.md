# 🛠️ Infrastructure Triggers Bunker (Scripts)

**Rol:** Centro de Orquestación CLI y Disparadores de Infraestructura Técnica.  
**Estatus:** Zenith (OEDP-V13.0)  
**Nomenclatura:** ISO/IEC 11179 (Objeto + Propiedad + Representación).

## 🎯 Misión Ontológica

Este búnker existe para actuar como la capa de interfaz entre el sistema operativo (CLI/Shell) y la
inteligencia de herramientas del monorepo. Su misión es nivelar, auditar y preparar el entorno antes
de que cualquier búnker de aplicación inicie su ejecución.

## 🏗️ Arquitectura de Disparo (The Trigger Pattern)

Para mantener el desacoplamiento absoluto y permitir el Tree-Shaking, aplicamos la **Doctrina del
Gatillo**:

1.  **Localización del ADN:** La lógica compleja y pesada NUNCA vive en `scripts/`. Vive en
    `libs/tools`.
2.  **Responsabilidad del Gatillo:** El archivo en `scripts/src/` solo debe:
    - Importar el aparato atómico de `libs/tools`.
    - Ejecutar la promesa.
    - Gestionar el `process.exit(0)` en éxito o `process.exit(1)` con rastro forense en fallo.

## 📋 Clasificación de Scripts (Visión Holística)

Cualquier script futuro debe nacer bajo una de estas cuatro categorías técnicas:

### 1. Internationalization (Linguistic Weaver)

- **Propósito:** Compilar silos JSON distribuidos en diccionarios unificados.
- **Script Actual:** `run-weaver.ts` -> Invoca `BuildInternationalizationDictionaries`.

### 2. Forensic Audit (Integrity Sentinel) - _Futuro_

- **Propósito:** Escanear el monorepo buscando violaciones de "Module Boundaries" o inconsistencias
  en esquemas Zod antes de un Commit.
- **Identificador Sugerido:** `audit-structural-integrity.ts`.

### 3. SRE & Cloud Orchestration - _Futuro_

- **Propósito:** Tareas de pre-calentamiento de caché (Cache Warming) para Vercel Edge o
  sincronización de secretos de infraestructura.
- **Identificador Sugerido:** `synchronize-infrastructure-secrets.ts`.

### 4. Data Migration & Seeding - _Futuro_

- **Propósito:** Población de datos iniciales en el CMS o migraciones de esquemas de base de datos
  Postgres.
- **Identificador Sugerido:** `execute-database-migration.ts`.

## 🛡️ Estándares de Oro (Mandatorios)

- **Zero Abbreviations:** Prohibido `intl`, `err`, `init`, `sync`. Usar `internationalization`,
  `error`, `initialization`, `synchronization`.
- **Atomic Functional:** Cada script debe exportar o ejecutar una única función nombrada en
  `PascalCase`.
- **Forensic Logging:** Todo fallo debe ser reportado con el prefijo
  `[CRITICAL_INFRASTRUCTURE_FAILURE]` para que el **Neural Sentinel** pueda indexarlo.
- **ESM-Only:** No se permite el uso de `require`. Todo el búnker opera bajo el estándar ECMAScript
  Modules.

## 🚀 Comandos de Ejecución Soberana

Los scripts se ejecutan exclusivamente a través del orquestador de Nx para aprovechar la caché
distribuida:

# Construcción de la red de transparencia lingüística

nx run @floripa-dignidade/scripts:internationalization-build
