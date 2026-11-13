# 🏛️ Manifiesto de Arquitectura Zenith (The Swiss-Watch Standard)

**Versión:** OEDP-V17.0 **Estado:** LEY ABSOLUTA (Reemplaza todos los manifiestos de configuración
anteriores) **Objetivo:** Erradicar la "Hemorragia de Tipos" (TS6059), los colapsos de grafo
(TS6305/TS6310) y optimizar el monorepo para Next.js 16+, SWC y Vercel Edge Runtime.

## 1. La Ley de la Doble Compilación (SWC + TSC)

En el ecosistema Floripa Dignidade, separamos la lógica del ADN:

- **SWC (`build`):** Empaqueta y transpila el código a altísima velocidad. Ignora los tipos.
- **TSC (`typecheck`):** Valida la integridad y **EMITE FIRMAS FÍSICAS (`.d.ts`)**.

## 2. El Patrón del "Doble Escudo" (TypeScript)

Todo búnker (`libs/*`) está obligado a poseer dos archivos de configuración.

### A. El Gatekeeper (`tsconfig.json`)

Su misión es proteger la frontera física y actuar como índice para el IDE. **PROHIBIDO COMPILAR**.

```json
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "composite": false,
    "noEmit": true,
    "ignoreDeprecations": "5.0"
  },
  "files":[],
  "include": [],
  "references":[
    { "path": "./tsconfig.lib.json" }
  ]
}
B. El Emitter (tsconfig.lib.json)
Su misión es emitir el ADN aplanado hacia la carpeta de caché.
Regla de Oro (Fix TS6310): Sobrescribe la herencia activando "noEmit": false y "composite": true.
code
JSON
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc/libs/[scope]/[module]",
    "tsBuildInfoFile": "../../../dist/out-tsc/libs/[scope]/[module]/tsconfig.lib.tsbuildinfo",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "rootDir": "src",
    "noEmit": false,

    "module": "Preserve",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "isolatedModules": true,

    "paths": {
      "@floripa-dignidade/dependencia":[
        "../../../dist/out-tsc/libs/[scope]/[module]/index.d.ts"
      ]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.json"],
  "exclude":["src/**/*.spec.ts", "dist", "out-tsc", "../../../dist", "../../../node_modules"],
  "references":[
    { "path": "../../[scope]/[module]/tsconfig.lib.json" }
  ]
}
CRÍTICO: Los paths apuntan a .d.ts (nunca a .ts). TSC aplana la estructura basándose en rootDir: "src", por lo que el archivo físico resulta en index.d.ts (sin el segmento /src/).
3. El Orquestador Físico (project.json)
El target typecheck no debe usar --noEmit. Debe ser un emisor activo.
code
JSON
"typecheck": {
  "executor": "nx:run-commands",
  "outputs":["{workspaceRoot}/dist/out-tsc/libs/[scope]/[module]"],
  "options": { "command": "tsc -p libs/[scope]/[module]/tsconfig.lib.json" },
  "cache": true
}
4. El Contrato de Empaquetado (package.json)
Para garantizar un Tree-Shaking agresivo (0 Cold Starts en Vercel), la exportación apunta al origen de código. Nx resolverá esto inteligentemente.
code
JSON
{
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./src/index.ts",
      "default": "./src/index.ts"
    }
  },
  "nx": {
    "tags": ["scope:[tipo]", "type:[tipo]", "platform:[tipo]"]
  }
}

---
```
