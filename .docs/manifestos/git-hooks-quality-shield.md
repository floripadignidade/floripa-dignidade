<!-- .docs/manifestos/git-hooks-quality-shield.md -->

# 🛡️ MANIFIESTO DE GOBERNANZA: ESCUDO DE CALIDAD GIT (OEDP-V18.1)

**Estado:** VIGENTE / LEY ABSOLUTA  
**Referencia:** ADR 0027  
**Protocolo:** OEDP-V18.1 (Local Quality Gate & Hermetic Commits)  
**Normas de Referencia:** ISO/IEC 25010 (Mantenibilidad y Robustez), ISO/IEC 11179 (Nomenclatura
Prosa), Conventional Commits v1.0.0.  
**Objetivo:** Establecer el blindaje perimetral automático e inquebrantable en el entorno local del
desarrollador mediante la tríada Husky + lint-staged + Commitlint, impidiendo que código con errores
de sintaxis, violaciones de tipos o mensajes informales contamine el árbol de Git o rompa los
despliegues en Vercel.

---

## 🏛️ 1. Filosofía: "Zero-Defect Staging" (El Filtro de Frontera)

En un monorepo masivo (33 proyectos y más de 690 archivos), la disciplina manual no escala. La
confianza técnica se deposita en aduanas mecánicas e inmutables:

- **Ningún bit sin auditar:** Ningún archivo TypeScript o JSON puede consolidarse en un commit si
  viola las reglas de ESLint, Prettier o los tipos base.
- **Fail-Fast en Local (< 2 segundos):** Los fallos deben atraparse en la máquina del desarrollador
  antes de alcanzar GitHub o Vercel.
- **Hermetismo 100% pnpm:** Se prohíbe el uso de `npx` en la cadena de scripts y hooks. Todo comando
  se ejecuta a través de `pnpm exec` para proteger la integridad del _store_ determinista.

---

## ⚙️ 2. La Tríada del Escudo de Calidad

El sistema se apoya en tres aparatos de inspección y disciplina automatizada:

### A. Husky (v9) — El Orquestador de Ciclo de Vida

- **Misión:** Interceptar los eventos nativos de Git (`pre-commit`, `commit-msg`) antes de que se
  grabe la firma criptográfica en el árbol local.
- **Comportamiento en CI/Vercel:** No interfiere en entornos de despliegue donde no se requiere
  inicializar hooks, gracias al script de ciclo de vida seguro `"prepare": "husky"`.

### B. lint-staged (v17) — El Filtro de Alto Rendimiento

- **Misión:** Auditar y formatear **exclusivamente** los archivos que se encuentran en el _Staging
  Area_ de Git (`git add`), evitando analizar el monorepo entero en cada commit.
- **Reglas:**
  - Archivos `**/*.{ts,tsx}`: Ejecutan `eslint --fix --no-warn-ignored` y
    `prettier --write --ignore-unknown`.
  - Archivos `**/*.{json,md,css,html,yml,yaml}`: Ejecutan `prettier --write --ignore-unknown`.

### C. Commitlint (v21) — El Guardián del Historial Forense

- **Misión:** Validar que cada mensaje de confirmación cumpla con la especificación internacional
  **Conventional Commits v1.0.0**.
- **Estructura Obligatoria:** `<tipo>(<ámbito-opcional>): <descripción-en-minúsculas>`
- **Tipos Autorizados:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`,
  `chore`, `revert`.
- **Ámbitos Oficiales (Monorepo Scopes):** `portal`, `cms`, `contracts`, `core`, `telemetry`,
  `exceptions`, `environment`, `routing`, `analytics`, `engines`, `identity`, `interaction`,
  `messaging`, `newsletter`, `reputation`, `territorial`, `whatsapp`, `design-system`, `ui-foundry`,
  `state-store`, `utility`, `tools`, `scripts`, `database`, `deps`, `release`, `infra`.

---

## 🚫 3. Prohibiciones Absolutas (Leyes de Oro)

1. **Prohibición de Bypass (`--no-verify`):** Queda estrictamente prohibido el uso de
   `git commit --no-verify` o `git commit -n`. Eludir los hooks de calidad se considera una
   infracción grave contra la estabilidad del sistema.
2. **Prohibición de `npx`:** Ningún script de hook o herramienta del monorepo invocará `npx`. La
   invocación mandatoria es `pnpm exec`.
3. **Punto Final en Mensajes:** Se prohíbe terminar el título del commit con un punto (`.`).
4. **Mayúsculas en el Asunto:** El asunto del commit debe escribirse en minúsculas.

---

## 📁 4. Artefactos Físicos de Configuración

El escudo se materializa físicamente a través de los siguientes archivos en la raíz del monorepo:

1. `package.json` ➔ `"scripts": { "prepare": "husky" }`
2. `.lintstagedrc.json` ➔ Aduana de formateo y linting sobre archivos en escena.
3. `commitlint.config.mjs` ➔ Especificación taxonómica de Conventional Commits.
4. `.husky/pre-commit` ➔ Archivo ejecutable Shell que dispara `pnpm exec lint-staged`.
5. `.husky/commit-msg` ➔ Archivo ejecutable Shell que dispara `pnpm exec commitlint --edit "$1"`.

---

## 🤖 5. INSTRUCCIÓN PARA LA IA (GATILLO DE ACTIVACIÓN Y MEMORIA)

```markdown
<!-- INSTRUCCIÓN OBLIGATORIA PARA EL NEURAL SENTINEL -->

"Como Neural Sentinel, he asimilado el Manifiesto ADR 0027 (Git Hooks & Quality Shield Governance).

A partir de este momento:

1. Jamás sugeriré comandos de bypass de Git como 'git commit --no-verify' o 'git commit -n'.
2. Todas mis propuestas de comandos para terminal utilizarán estrictamente 'pnpm exec' o 'pnpm'
   (prohibido 'npx').
3. Al sugerir mensajes de commit para el desarrollador, formularé exclusivamente mensajes que
   cumplan al 100% con la aduana de Commitlint ('commitlint.config.mjs'), utilizando tipos válidos
   ('feat', 'fix', 'refactor', 'chore', etc.) y scopes oficiales del monorepo en minúsculas sin
   punto final.
4. Antes de autorizar un cierre de ciclo, verificaré que los artefactos '.lintstagedrc.json',
   'commitlint.config.mjs', '.husky/pre-commit' y '.husky/commit-msg' se encuentren intactos y en
   perfecta sinfonía."

---
```
