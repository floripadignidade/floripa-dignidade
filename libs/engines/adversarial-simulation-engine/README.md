# 🛡️ Adversarial Simulation Engine: The Proactive Defense Sentinel

**Estatus:** Zenith (OEDP-V17.0)  
**Rol:** Motor de Seguridad Ofensiva (Red Team Automatizado), Simulación de Vulnerabilidades y
Generación de Reportes Forenses.  
**Tags:** `scope:engines`, `type:tool`, `platform:node`

## 🎯 1. Misión Ontológica

El `@floripa-dignidade/adversarial-simulation-engine` representa la evolución de la seguridad en el
ecosistema. Transforma nuestra postura de **Seguridad Reactiva** (esperar a que ocurra un error) a
**Seguridad Defensiva Proactiva**.

Su misión es atacar intencionalmente las "Aduanas de ADN" (Esquemas Zod) de los demás búnkeres (Ej:
`interaction-engine`, `whatsapp-communication-service`) inyectando vectores de ataque mutados
(Fuzzing) para garantizar que las excepciones sean manejadas correctamente y no existan fugas de
información de identificación personal (PII) o brechas de inyección.

## 🧠 2. Metodología de Simulación Limitada (Rules of Engagement)

Para cumplir con el **ADR 0015 (Cloud Sovereign)** y evitar agotar las cuotas de red del Tier
Gratuito de Supabase o Resend, este motor opera bajo una estricta doctrina de **Contención Offline
(Mirror Testing)**:

- **Cero Red Real:** El simulador NUNCA ataca endpoints en producción.
- **Aislamiento Isomórfico:** Importa la lógica atómica de los búnkeres locales e inyecta los
  _payloads_ corruptos directamente en memoria.
- **Captura Forense:** Atrapa las instancias de `ValidationException` e `InternalSystemException`
  disparadas por los búnkeres defendidos, validando que el `RuntimeContextSnapshot` sea íntegro y no
  exponga secretos de entorno.

## 🔌 3. Arquitectura Conectable (Pluggable Adapter Pattern)

El motor de simulación es **100% agnóstico al consumidor final**. No está acoplado a ninguna
herramienta de terceros, garantizando la Soberanía Tecnológica del proyecto.

Todo fallo detectado se estandariza primero en un ADN interno
(`AdversarialVulnerability.schema.ts`). Luego, el sistema utiliza **Adaptadores de Salida (Output
Adapters)** para traducir este ADN a formatos que otras IAs o herramientas CI/CD puedan interpretar:

1. **`SarifFormatAdapter.ts`:** Traduce las vulnerabilidades al estándar industrial SARIF. Permite
   que **GitHub Advanced Security (CodeQL)** o **SonarQube** consuman los resultados nativamente.
2. **`ShannonAiAdapter.ts`:** Traduce el contexto de la memoria a un JSON enriquecido semánticamente
   para que la **App Shannon (GitHub)** deje comentarios precisos con sugerencias de refactorización
   en las Pull Requests.
3. **`NeuralSentinelAdapter.ts`:** Envía los datos directamente a nuestro propio
   `health-analysis-engine` para auto-sanación interna.

## 🏗️ 4. Estructura Estructural (Atomic Swarm)

El búnker está dividido en responsabilidades atómicas puras:

- `src/lib/schemas/`
  - Contratos inmutables. Define qué es un `AdversarialVulnerabilityPayload` y un
    `ForensicAuditReport`.
- `src/lib/generators/` (Las Armas)
  - Átomos que generan ruido: `GenerateSqlInjectionPayload.ts`,
    `GenerateCrossSiteScriptingPayload.ts`, `GenerateTimingAttackPayload.ts`.
- `src/lib/simulators/` (Los Ejecutores)
  - Orquestan el impacto del payload contra un esquema Zod o una función específica.
- `src/lib/adapters/` (Los Traductores)
  - Transforman el resultado de la simulación al formato de la herramienta externa (SARIF/Shannon).
- `src/lib/orchestrators/` (El Gatillo)
  - `ExecuteSecurityAuditPipeline.ts`: El punto de entrada CLI.

## 🛡️ 5. Estándares ISO y Cumplimiento

- **ISO/IEC 27001:** Cumplimiento de pruebas de seguridad automatizadas en el ciclo de vida del
  desarrollo.
- **ISO/IEC 11179:** Nomenclatura descriptiva estricta. Prohibido el uso de términos como `hack`,
  `exploit` o `test`. Se utilizará nomenclatura de ingeniería: `adversarialSimulation`,
  `vulnerabilityPayload`, `forensicReport`.
- **Module Boundaries:** Este motor (`type:tool`) solo es invocado por la capa de automatización
  (`libs/tools` o `scripts/`) durante el Pipeline de Integración Continua (CI). **Jamás** se
  incluirá en el bundle de producción de Next.js.

## 🚀 6. Comandos de Ejecución Soberana

La ejecución de este motor se delega al orquestador de Nx para asegurar el uso de caché distribuida:

```bash
# Ejecutar auditoría adversaria y generar reporte SARIF/Shannon
pnpm nx run adversarial-simulation-engine:audit
```
