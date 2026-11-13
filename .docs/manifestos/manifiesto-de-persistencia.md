📜 Manifiesto de Persistencia Soberana y Resiliencia de Contexto Estado: VIGENTE / LEY DE
CONTINUIDAD Referencia: ADR 0025 Objetivo: Establecer la estrategia de almacenamiento multi-capa
para garantizar que el ciudadano nunca pierda su progreso (denuncias, borradores, preferencias) ante
fallos de energía o red, manteniendo la integridad del SEO y la privacidad ISO.

1. La Pirámide de Persistencia (Multi-Layer Storage) El sistema operará bajo cuatro capas de memoria
   desacopladas: A. Capa Volátil (In-Memory / Zustand) Propósito: Gestión del estado instantáneo de
   la interfaz (ej: ¿está el buscador abierto?, progreso de animación). Regla: No sobrevive a una
   recarga de página (F5). SRE: Latencia < 1ms. B. Capa de Resiliencia Local (Browser /
   LocalStorage) Propósito: Salvaguarda de borradores (Draft Recovery). Si el usuario escribe una
   denuncia y se corta la luz, al volver, el texto debe estar ahí. Regla: Se usa el patrón
   "Stale-While-Revalidate". El SEO no debe leer de aquí para evitar discrepancias de renderizado
   (Hydration Mismatch). Privacidad: Datos PII (teléfonos/nombres) deben estar cifrados en esta
   capa. C. Capa de Identidad Técnica (Cookies Granulares) Propósito: Persistencia de preferencias
   que afectan al Servidor (Locale, Tema, Sesión). Regla SEO: Solo se permiten cookies HttpOnly y
   Strict que no bloqueen el renderizado inicial. El bot de Google debe ver el contenido
   instantáneamente sin esperar a que se procesen las cookies de tracking. D. Capa Soberana (Cloud /
   Supabase) Propósito: La única fuente de verdad inmutable. Regla: Todo dato en LocalStorage debe
   ser sincronizado asíncronamente con Supabase mediante el LogTransportDriver.
2. Integración de Métricas y Analítica (Unified Analytics) Implementaremos un Enjambre de Señales
   Dual: Analítica Externa (Google Analytics 4 / Tag Manager): Misión: Métricas de marketing y
   comportamiento masivo anónimo. Implementación: Carga asíncrona mediante next/third-parties para
   garantizar LCP < 1.2s. Analítica Forense (Core Telemetry): Misión: Auditoría de veracidad y salud
   del algoritmo. Privacidad: Se sincroniza con el Impact Analytics Engine sin enviar datos a
   Google.
3. Protocolo de "Cero Pantalla en Blanco" (Hydration Strategy) Para evitar el parpadeo de contenido
   o el estado vacío: Skeleton-First: Todo componente que dependa de persistencia local debe nacer
   con un Skeleton CSS inyectado en el servidor. Hydration Marker: Zustand solo hidratará los datos
   del LocalStorage tras el montaje del cliente, evitando el error de "Text content does not match".
   🤖 4. Auditoría IA (Persistence Sentry) El Neural Sentinel rechazará cualquier componente que:
   Guarde secretos o contraseñas en LocalStorage sin cifrar. Utilice cookies de más de 4KB (afecta
   el rendimiento de las cabeceras HTTP). Bloquee el renderizado del servidor esperando por datos de
   analítica externa.

LA IMPLEMENTACION DE ESTE MANIFIESTO SERA INCREMENTAL, LA IA DEBE CONSIDERARLO Y ADAPTARLO CON
VISION HOLISTICA EN CADA REFACTORIZACION HASTA LA NIVELACION COMPLETA, RECORDANDO AL PROGRAMNMADOR
QUE LO ESTA LLEVANDO A CABO EN LA REFCATORIZACION.
