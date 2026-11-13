📝 NOTA TÉCNICA: Implementación del Motor de Texto de Alta Fidelidad Estatus: Pendiente
(Post-Finalización de Funcionalidad Base) Referencia: OEDP-V17.0 / High-Performance UI Responsable:
Neural Sentinel (IA) & Senior UI Engineer 🎯 Objetivo Sustituir el renderizado de texto estándar de
CSS en módulos de alto impacto visual (Infografías de Transparencia, Reportes de Impacto) por el
motor de TypeScript/Canvas para garantizar 120 FPS y control sub-píxel en el flujo de contenido
dinámico. 🛠️ Listado de Implementación (Backlog de Élite)

1. Creación del Búnker Especializado

Aparato: libs/engines/visual-text-engine

Misión: Encapsular la lógica de Shinn Lowe (Canvas Measurement) bajo nuestra arquitectura de átomos.

Aduana de ADN: Crear TextLayoutConstraints.schema.ts para validar anchos, interlineados y kerning
mediante Zod antes del dibujo en el Canvas. 2. Implementación de la "Capa Espejo" (A11y & SEO Guard)

Hybrid Rendering: Desarrollar un componente de React que inyecte un bloque <div> oculto
(visually-hidden) con el texto real en el DOM semántico.

Sincronización: Garantizar que el lector de pantalla (VoiceOver/TalkBack) lea el DOM mientras el
ciudadano ve el Canvas de alto rendimiento.

SEO Meta-Tags: Asegurar que los motores de búsqueda indexen el contenido antes de que el motor de JS
realice el cálculo matemático. 3. Optimización para Redes Limitadas (3G/4G)

Lazy Loading del Motor: La lógica de cálculo de layout no debe cargarse en la Frontpage inicial.
Solo se activa mediante dynamic import cuando el ciudadano entra al "Observatorio de Datos" o "Mapas
de Calor".

Font-Preloading: Implementar el precargado de glifos críticos para evitar el parpadeo de texto
(FOUT) durante la medición en Canvas. 4. Telemetría de Rendimiento Forense

FPS Tracker: Integrar EmitTelemetrySignal para reportar caídas de frames durante animaciones de
texto complejas.

Reflow Savings Audit: Medir el ahorro de tiempo en el Main Thread comparando el motor nativo de CSS
vs el Visual Text Engine en dispositivos móviles de gama baja. 5. Componentes de Impacto (Casos de
Uso)

ImpactNarrativeCard.tsx: Texto que fluye alrededor de gráficos circulares de presupuesto.

ForensicInfographic.tsx: Visualización de denuncias donde el texto se anima físicamente al hacer
scroll.

SovereignReportGenerator.tsx: Exportación de PDFs con precisión tipográfica perfecta basada en los
cálculos del motor. ⚖️ Criterios de Aceptación (Definitivos) Complejidad Ciclomática: Ninguna
función de cálculo de layout debe superar el nivel 10. Accesibilidad ISO: El 100% del texto
renderizado en Canvas debe tener un equivalente textual accesible y seleccionable. Latencia de
Medición: 500 bloques de texto procesados en < 0.1ms en un iPhone 12 o superior. Zero Dependency: El
motor no debe importar librerías externas pesadas; debe ser TypeScript puro interactuando con la Web
API de Canvas. Instrucción para el Neural Sentinel Futuro: "No inicies esta tarea hasta que el
migration_master_schema.sql esté ejecutado y los flujos de datos ciudadanos sean estables. La
belleza visual nunca debe preceder a la integridad del dato."

---
