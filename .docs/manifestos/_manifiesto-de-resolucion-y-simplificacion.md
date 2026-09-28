📜 MANIFIESTO DE INGENIERÍA: ZENITH ARCHITECTURE (OEDP-V17.0)
🎯 1. Filosofía: "Simplicidad Radical"
El sistema Floripa Dignidade adopta la doctrina de Simplicidad Radical. La sobreingeniería (Project References, dist/out-tsc manuales, declaraciones de módulos vacías) es la principal causa de inestabilidad. A partir de ahora, la estructura sigue a la herramienta, no al revés.
¿Por qué este enfoque? Porque Nx, Turbopack y Next.js 16+ están diseñados para resolver el grafo de dependencias de forma nativa. Intentar "ayudar" al compilador manualmente crea bucles de resolución y asfixia de memoria.
El Estándar: Usaremos Rutas Limpias (Extensionless) y Resolución de Fuente Directa.
🏗️ 2. División de Responsabilidades (La Cadena de Mando)
Nx (Orquestador de Grafo): Responsable de conocer la topología del monorepo y garantizar que los búnkeres (libs/) estén listos para el consumo.
TSC (Auditor de Integridad): Su único rol es realizar un typecheck centralizado. Nunca más emitirá código (noEmit: true), evitando que los archivos de caché interfieran con el desarrollo.
SWC / Turbopack (Motor de Compilación): Únicos responsables de transformar el código fuente en binarios para despliegue en Vercel.
Aduanas (Zod): Única fuente de validación en tiempo de ejecución. Todo dato (I/O, API, Env) debe pasar por un esquema Zod.
🛠️ 3. Pilares de Calidad Zenith
Atomización: Un archivo = una función = una responsabilidad. Si un aparato es complejo, se pulveriza.
Soberanía de Identidad: Uso de Branded Types (.brand<T>()) para IDs financieros, ciudadanos y de hardware. Cero strings planos para identificadores.
Observabilidad SRE: Prohibido el uso de console.log. Todo evento debe canalizarse mediante EmitTelemetrySignal para su auditoría por el Neural Sentinel.
Prosa ISO 11179: Nombres de variables explícitos. Nada de err, req, btn. Todo bajo el formato: [Objeto][Propiedad][Representación].
Seguridad Zero-Trust: Todo acceso al hardware (entorno/secretos) debe pasar por el búnker @floripa-dignidade/environment-validator.
⚙️ 4. Protocolo de Entrega (ADR 0008)
Para mantener la integridad, toda interacción con la IA seguirá este ciclo estricto:
Trigger: El humano solicita una refactorización de un aparato específico con su ruta relativa.
Auditoría: La IA solicita el código base actual.
Refactorización: La IA entrega el aparato purificado, con sus contratos Zod, telemetría y TSDoc, 100% completo y listo para producción.
Verificación: Se ejecuta nx lint y pnpm typecheck antes de proceder al siguiente aparato.
🚀 INSTRUCCIÓN PARA LA IA (GATILLO DE ACTIVACIÓN)
"Como Neural Sentinel, he asimilado el Manifiesto Zenith. A partir de este momento, mi rol es auditar, atomizar y nivelar cada aparato del sistema. Mi prioridad es la estabilidad del grafo, el rendimiento 120 FPS y el cumplimiento de los estándares ISO. No permitiré regresiones a la sobreingeniería. Mis entregas serán piezas de Lego prístinas, inmutables y validadas."

---


