**Estado:** Aceptado (Prioridad Absoluta)  
**Referencia Normativa:** ISO/IEC 25010 (Acoplamiento y Cohesión)  
**Objetivo:** Establecer reglas estrictas de importación para evitar dependencias circulares,
garantizar el desacoplamiento de paquetes `@floripa-dignidade/*` y facilitar la auditoría por IA.

---

## 1. Sistema de Clasificación (Tags de Nx)

Cada proyecto en el monorepo debe estar etiquetado en su archivo `project.json` bajo tres
dimensiones obligatorias:

### 1.1. Dimensión de Ámbito (`scope`)

- `scope:core`: Infraestructura base (telemetry, exceptions, health-monitor).
- `scope:engines`: Motores de lógica e inteligencia (logic-audit, health-analysis).
- `scope:modules`: Dominios de negocio (newsletter, human-rights-reports).
- `scope:shared`: Utilidades genéricas y UI kit cross-proyecto.
- `scope:app`: Aplicaciones finales que ensamblan los módulos.

### 1.2. Dimensión de Tipo (`type`)

- `type:data`: Acceso a datos, APIs y persistencia.
- `type:ui`: Componentes visuales y lógica de presentación.
- `type:logic`: Algoritmos puros y motores de cálculo.
- `type:schema`: Definiciones de ADN estructural (Zod schemas).
- `type:tool`: Scripts de soporte al desarrollo.

---

## 2. Matriz de Restricciones de Dependencia

Se aplican las siguientes reglas de "Oro" para las importaciones:

| El proyecto con etiqueta... | SOLO puede importar de...                     | Razón Técnica                                        |
| :-------------------------- | :-------------------------------------------- | :--------------------------------------------------- |
| `scope:core`                | `scope:core`                                  | Los cimientos no deben conocer la lógica de negocio. |
| `scope:engines`             | `scope:core`, `scope:shared`                  | Los motores usan infraestructura, no módulos.        |
| `scope:modules`             | `scope:core`, `scope:shared`, `scope:engines` | Los dominios ensamblan inteligencia y bases.         |
| `scope:shared`              | `scope:core`                                  | Recursos comunes deben ser altamente ligeros.        |
| `scope:app`                 | `scope:*`                                     | Las apps son los orquestadores finales.              |

### 2.1. Restricciones por Tipo (Flujo Unidireccional)

- **`type:ui`** NUNCA puede importar de **`type:data`**. (Garantiza que la UI sea presentacional).
- **`type:data`** NUNCA puede importar de **`type:ui`**. (Evita fugas de renderizado en el
  servidor).
- **`type:schema`** NUNCA debe importar nada (Son nodos hoja).

---

## 3. Implementación Técnica (ESLint)

La aplicación de estas fronteras se delega al plugin `@nx/enforce-module-boundaries` en el archivo
`eslint.config.mjs`. Cualquier violación detendrá el pipeline de Integración Continua (CI).

````javascript
// Ejemplo de configuración de límites
depConstraints: [
  {
    sourceTag: 'scope:core',
    onlyDependOnLibsWithTags: ['scope:core']
  },
  {
    sourceTag: 'type:ui',
    onlyDependOnLibsWithTags: ['type:ui', 'type:schema', 'type:shared']
  }
]
4. Estricta Correlación Naming-Path
Para asegurar la compatibilidad con NPM, todo paquete debe seguir el estándar:
Project Name: @floripa-dignidade/{category}-{function}
Path: libs/{category}/{function}
Package.json Name: Debe ser idéntico al Project Name.
5. Auditoría por IA (Neural Auditor)
El logic-audit-engine tiene la responsabilidad de:
Validar Etiquetas: Asegurar que cada nuevo proyecto tenga las 3 dimensiones de tags.
Detectar "Entropía de Importación": Alertar si un módulo de negocio (scope:modules) está creciendo demasiado y sugiere su división en sub-paquetes data, ui y schema.
Bloqueo de PR: Rechazar automáticamente cualquier cambio que rompa la Matriz de Dependencias (Sección 2).
6. Excepciones
Cualquier excepción a estas reglas debe documentarse mediante un ADR hijo, justificando por qué el desacoplamiento no es posible en ese caso específico.
code
Code
---

### 🛠️ Configuración de tu `eslint.config.mjs` (Actualización de Elite)

Para que estas reglas sean reales en tu código ahora mismo, abre tu `eslint.config.mjs` y actualiza la sección de `depConstraints` con estos valores:

```javascript
// Dentro de la regla '@nx/enforce-module-boundaries'
depConstraints: [
  {
    sourceTag: 'scope:core',
    onlyDependOnLibsWithTags: ['scope:core']
  },
  {
    sourceTag: 'scope:engines',
    onlyDependOnLibsWithTags: ['scope:core', 'scope:shared']
  },
  {
    sourceTag: 'scope:modules',
    onlyDependOnLibsWithTags: ['scope:core', 'scope:shared', 'scope:engines', 'scope:modules']
  },
  {
    sourceTag: 'type:ui',
    notDependOnLibsWithTags: ['type:data']
  },
  {
    sourceTag: 'type:schema',
    onlyDependOnLibsWithTags: [] // Nodos hoja
  }
]
````
