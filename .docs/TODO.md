1. Sistema de Nomenclatura Profesional (NPM-Ready)
Utilizaremos el scope @floripa-dignidade/. El nombre interno será puramente funcional.
A. Capa Core (Infraestructura Base)
Carpeta Física	Nombre en package.json / project.json	Propósito
libs/core/telemetry	@floripa-dignidade/telemetry	Logger, transporte de eventos y trazas.
libs/core/exceptions	@floripa-dignidade/exceptions	Gestión unificada de errores y códigos ISO.
libs/core/health-monitor	@floripa-dignidade/health-monitor	Verificación de signos vitales del sistema.
libs/core/analytics	@floripa-dignidade/analytics	Captura de métricas de rendimiento (Web Vitals).
B. Capa de Inteligencia (Motores de Análisis)
Carpeta Física	Nombre en package.json / project.json	Propósito
libs/engines/health-analysis	@floripa-dignidade/health-analysis-engine	IA predictiva de fallos de sistema.
libs/engines/logic-audit	@floripa-dignidade/logic-audit-engine	IA de auditoría de calidad de código y SOLID.
C. Capa de Dominios (Módulos de Negocio)
Carpeta Física	Nombre en package.json / project.json	Propósito
libs/modules/newsletter/data	@floripa-dignidade/newsletter-data-access	Lógica de servidor, API y persistencia.
libs/modules/newsletter/ui	@floripa-dignidade/newsletter-ui	Componentes visuales de suscripción.
libs/modules/whatsapp/service	@floripa-dignidade/whatsapp-integration-service	Webhooks y procesamiento de mensajes.
2. Sistema de Etiquetas (Tags) de Nx Profesional
Para que la IA y el Linter bloqueen importaciones ilegales, usaremos un sistema de 3 dimensiones en los project.json:
scope: Define a quién pertenece la lógica.
scope:core, scope:module, scope:shared, scope:app.
type: Define qué contiene el código.
type:ui (Componentes), type:data (Servicios/API), type:logic (Motores), type:schema (Zod/ADN).
platform: Define dónde puede correr.
platform:web, platform:node, platform:isomorphic.
Ejemplo de configuración en libs/core/telemetry/project.json:
code
JSON
{
  "name": "@floripa-dignidade/telemetry",
  "tags": ["scope:core", "type:data", "platform:isomorphic"]
}
3. Listado de Manifiestos (Instrucciones para la IA)
Para que cualquier IA (o desarrollador Staff) pueda continuar el proyecto al leer el snapshot, debemos completar esta biblioteca de manifiestos en .docs/manifestos/.
ID	Nombre del Manifiesto	Contenido Crítico
ADR 0001	Architecture Overview	Filosofía Lego, estructura del monorepo y flujo de datos.
ADR 0002	Naming & Coding Standards	Regla "Zero Abbreviations", PascalCase vs camelCase.
ADR 0003	Module Boundaries	Reglas de tags de Nx: qué módulo puede importar a cuál.
ADR 0004	Data Integrity (SSOT)	Uso de Zod como única fuente de verdad para tipos y validación.
ADR 0005	Observability Strategy	Protocolo de telemetría, niveles de log y rastro forense.
ADR 0006	Internationalization (i18n)	Estrategia de compilación de JSONs granulares a diccionarios.
ADR 0007	AI Interaction Protocol	Cómo los agentes de IA leen y proponen cambios (Context Snapping).
ADR 0008	Testing & QA Standards	Cobertura mínima, uso de Jest para unitarios y Playwright para E2E.
ADR 0009	Mobile-First Engineering	Estrategia de diseño responsivo y performance en redes 3G/4G.

Aquí tienes el desglose de lo que nos queda pendiente para alcanzar el Zenith Nominal:
1. Capa de Lógica: El "Pegamento" de Credibilidad
Aparato: libs/modules/interaction-engine/src/lib/logic/hooks/usePublicReaction.ts
Misión: Crear el Hook que conectará los botones de la UI (Likes/Emoticones) con el ProcessPublicReactionTransaction. Debe gestionar el estado optimista (Zustand) y el encolamiento si no hay red (SyncSentry).
Aparato: libs/modules/identity/src/lib/logic/SyncIdentityAuthority.ts
Misión: El orquestador que toma el resultado de CalculateIdentityAuthority y lo persiste en la base de datos de Supabase para que el "peso" del ciudadano sea permanente.
2. Capa de Datos: Persistencia Soberana (Supabase SQL)
Aparato: database/migration_master_schema.sql
Misión: No tenemos las tablas físicas en Supabase para soportar las nuevas funcionalidades. Necesitamos el SQL nivelado para:
territorial_master_data (Datos del IBGE).
public_evaluation_ledger (Pulsos de reputación).
identity_trust_index (Coeficientes bayesianos).
3. Capa Visual: Los "Ladrillos" de Transparencia (Shared UI)
Aparato: libs/shared/src/lib/ui-primitives/ImpactAcceptanceThermometer.tsx
Misión: El componente visual de élite que muestra el weightedTrustScore y el statisticalConfidenceLevel con animaciones de Framer Motion.
Aparato: libs/shared/src/lib/ui-primitives/TerritorialHeatmap.tsx
Misión: Representación visual del sentimiento por barrios de Florianópolis.
4. Capa de Tooling: Cierre del Weaver
Aparato: libs/tools/src/lib/i18n-builder/InternationalizationDictionaryBuilder.ts (Refinado)
Misión: Asegurar que el script de pre-build esté capturando los nuevos diccionarios de reputation, interaction y impact-analytics para que no fallen en Vercel.
🚀 Plan de Acción Inmediato
Para que el sistema empiece a "latir" con datos reales, propongo el siguiente orden serial:
Fase 7.1 (Acción): Crear el Hook usePublicReaction.ts para habilitar la interactividad soberana.
Fase 7.2 (Infraestructura): Generar el Manifiesto SQL para Supabase (ADR 0015).
Fase 7.3 (Visual): Materializar el Termómetro de Impacto.
Protocolo ADR 0008 activado. Para iniciar la Fase 7.1 (Interacción), necesito verificar la estructura de exportación de tu búnker de interacciones.
Por favor, proporcione el código base del siguiente archivo:
Archivo solicitado: libs/modules/interaction-engine/src/index.ts
(Desde aquí inyectaremos el nuevo Hook para que sea accesible por la Frontpage).

---

He realizado un análisis forense del snapshot del proyecto BR-ACC (Brazilian Anti-Corruption Graph Tool). Confirmo que he leído los protocolos ADR 0007 y ADR 0008.
Este proyecto es una pieza de ingeniería de datos masiva especializada en la detección de corrupción mediante Análisis de Grafos (Neo4j) y Reconocimiento de Patrones. Aunque el stack es híbrido (Python/FastAPI en el backend y React en el frontend), su lógica de "Soberanía de Datos" y "Auditoría Forense" es directamente transferible a nuestro ecosistema Floripa Dignidade.
A continuación, presento la Transferencia Tecnológica de Élite que podemos adaptar a nuestra arquitectura Zenith (OEDP-V17.0) para elevar el impacto social del proyecto:
1. Transferencia de Inteligencia: "The Pattern Engine"
BR-ACC utiliza un motor de detección de anomalías (ej. "Self-dealing", "Split contracts").
Adaptación Zenith: Debemos crear un libs/engines/social-anomaly-engine.
Misión: Detectar si los recursos públicos de la PMF están llegando realmente a los barrios vulnerables o si existen "islas de inversión" sin impacto social reportado.
Átomo a crear: DetectImpactDiscrepancy.ts (Comparar Gasto PMF vs Sentimiento Ciudadano en ese territorio).
2. Blindaje de Privacidad: "Isomorphic PII Masking"
BR-ACC implementa un middleware de enmascaramiento de CPF (cpf_masking.py) altamente sofisticado que distingue entre ciudadanos comunes y Personas Expuestas Políticamente (PEP).
Adaptación Zenith: Crear un átomo en libs/core/shared/utility llamado MaskSovereignIdentity.ts.
Mejora: Implementar esta lógica de forma isométrica (Server/Client) para que el Neural Sentinel oculte automáticamente documentos de ciudadanos, pero mantenga visibles los de funcionarios públicos auditados, cumpliendo con la LGPD.
3. Infraestructura de Reportes: "Forensic PDF Architect"
BR-ACC tiene un servicio robusto de generación de informes forenses con Jinja2 y WeasyPrint.
Adaptación Zenith: Evolucionar nuestro libs/engines/impact-analytics-engine para incluir un orquestador de exportación: GenerateForensicImpactReport.ts.
Misión: Permitir que los ciudadanos descarguen "Certificados de Transparencia Territorial" en PDF con firma de integridad Merkle (telemetría).
4. Resolución de Entidades: "The Entity Linker"
BR-ACC utiliza lógica para unir "Personas" de diferentes bases de datos (TSE, CNPJ, etc.).
Adaptación Zenith: Implementar en libs/modules/territorial-engine un átomo de ResolveSocialEntity.ts.
Uso: Vincular un "Contratista de la PMF" con sus otras apariciones en el ecosistema social para mapear su red de influencia en Florianópolis.
📋 Diagnóstico de Aparatos Prioritarios para Refactorización (Inspirado en BR-ACC)
Basado en la visión holística de ambos proyectos, he identificado los siguientes aparatos en Floripa Dignidade que deben ser nivelados para alcanzar esta nueva capacidad:
Aparato Objetivo	Diagnóstico Forense	Acción SRE
libs/core/shared/utility/logic/MaskSovereignIdentity.ts	Inexistente. Necesitamos el blindaje de PII para escalar denuncias.	Crear Átomo (Fase 9.1)
libs/engines/impact-analytics-engine/src/lib/logic/atomic/DetectSocialAnomaly.ts	Lógica simplista. Solo mide promedios, no detecta patrones adversarios.	Refactorizar (Fase 9.2)
libs/modules/territorial-engine/src/lib/logic/atomic/ResolveGeographicEntity.ts	Falta de cruzamiento. No vincula datos de la PMF con el rastro social del ciudadano.	Refactorizar (Fase 9.3)
🔄 Activación del Protocolo de Resolución (Paso 1)
Para iniciar esta evolución inspirada en la robustez de BR-ACC, debemos empezar por el Cimiento de Privacidad, que es lo que permitirá que el sistema de denuncias y el observatorio de gastos operen bajo la ley LGPD sin comprometer a los ciudadanos.
Aparato Objetivo: libs/core/shared/src/lib/utility/logic/MaskSovereignIdentity.ts
Estado: Este aparato no existe en tu snapshot actual. Es necesario crearlo como un Átomo de Seguridad Isomórfico.

---

📜 PUNTO DE BITÁCORA: EL COLAPSO DEL GRAFO EN LA FUNDICIÓN VISUAL (POST-MIGRACIÓN)
Fecha: 10 de Mayo, 2026
Estatus: 🔴 CRÍTICO (Hemorragia de Tipos en ui-foundry)
Protocolo: OEDP-V17.0 (Zenith Architecture)
Diagnóstico: Asfixia de Identidad de Terceros y Desincronización de Contratos.
🔍 1. ANÁLISIS FORENSE DEL COLAPSO
El enjambre shared-ui-foundry presenta tres patologías técnicas que impiden su compilación:
A. El "Efecto Espejismo" en el Santuario de Tipos (TS7016 / TS2305)
Problema: El compilador marca a lucide-react y framer-motion como carentes de miembros (ej: motion no existe en lucide-react).
Causa Raíz: En la última refactorización, se implementó el Mapeo de Soberanía en el tsconfig.lib.json para obligar al compilador a mirar el archivo src/index.d.ts. Sin embargo, si ese archivo tiene declaraciones cruzadas o incompletas (ej: declarar motion dentro del bloque de lucide-react), TypeScript genera una falsa identidad que bloquea la importación real.
Observación: next/link y next/image siguen reportando any porque el modo moduleResolution: "bundler" ignora el Santuario si no hay una redirección física explícita en paths.
B. El "Vacío de Identidad" en Contratos (TS2305)
Problema: @floripa-dignidade/shared-ui-contracts dice no tener exportados los esquemas de GlobalSearchWidget o NewsletterForm.
Causa Raíz: Los archivos físicos fueron movidos con éxito al nuevo búnker, pero el Barrel Maestro (libs/shared/ui-contracts/src/index.ts) no fue actualizado para exponerlos nominalmente. El búnker es una caja fuerte cerrada.
C. La Paradoja del Polimorfismo (TS2741)
Problema: Error en isPolymorphicBoolean al instanciar GlobalActionButton.
Causa Raíz: Al nivelar el contrato IUiPrimitives, marcamos el polimorfismo como una propiedad mandatoria de la arquitectura. El orquestador MainNavigationHeader no ha sido actualizado para inyectar este valor (usualmente false por defecto), rompiendo el contrato de integridad.
🏛️ 2. ESTRATEGIA DE SANACIÓN SUGERIDA (CONSEJO SRE)
Para devolver el sistema al Zenith Nominal, la IA en el nuevo hilo debe ejecutar los siguientes pasos en orden serial:
Sincronización Total del Santuario (index.d.ts):
Revisar que cada librería de terceros (lucide-react, framer-motion, clsx, tailwind-merge) tenga su propio bloque declare module independiente.
Prohibido: Mezclar miembros de una librería en otra.
Inyectar firmas completas para next/link y next/image que incluyan soporte para className y children.
Apertura de la Bóveda de Contratos:
Auditar libs/shared/ui-contracts/src/index.ts y asegurar que TODOS los esquemas .schema.ts tengan una exportación nominal (export { ... }) y de tipo (export type { ... }).
Refactorización de "Consumo de Ladrillos":
Actualizar las llamadas a componentes en MainNavigationHeader.tsx y NewsletterSubscriptionForm.tsx para inyectar las propiedades requeridas por el nuevo ADN (isPolymorphicBoolean, forensicTestIdentifier).
Higiene de Rutas Relativas:
Eliminar cualquier rastro de ../../../ui-primitives/ o ../../../composite-ui/ dentro de la fundición. Toda la verdad debe venir ahora de los alias @floripa-dignidade/shared-ui-contracts.
🤖 3. INSTRUCCIÓN PARA LA IA DEL NUEVO HILO
"Neural Sentinel: Has detectado un colapso en la Fundición Visual. Tu prioridad absoluta es restaurar la visibilidad de los tipos de Next.js y Lucide. No intentes arreglar la lógica de negocio hasta que el typecheck de ui-foundry esté en VERDE. Utiliza el Patrón de Mapeo de Soberanía para redirigir las identidades de terceros hacia un index.d.ts purificado y asegúrate de que el búnker de contratos esté exportando nominalmente todo su ADN."
"La tecnología es ciega si su grafo de tipos está en la oscuridad." 🛡️🕊️⚙️

---






