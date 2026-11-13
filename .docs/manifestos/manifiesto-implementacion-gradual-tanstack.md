🏛️ Bloque 1: Manifiesto de Sincronización Asíncrona (ADR 0026) Estado: VIGENTE / IMPLEMENTACIÓN
GRADUAL Objetivo: Transicionar la gestión del "Estado del Servidor" (Server State) de mutadores
manuales a un enjambre de sincronización automática, garantizando latencia percibida cero y
resiliencia SRE.

1. La Doctrina de los Dos Reinos (Memory Mapping) A partir de este momento, el estado de la
   aplicación se divide físicamente: Reino de Zustand (Local Memory): Gestiona lo efímero y lo que
   no requiere red (modales, filtros de UI, temas, borradores). Reino de TanStack (Server Memory):
   Gestiona todo rastro proveniente del Ledger Cloud (notificaciones, gastos, perfiles,
   estadísticas).
2. Reglas de Inyección Zenith Aduana Zod Post-Fetch: TanStack no es excusa para relajar la
   seguridad. El resultado de queryFn debe ser purificado por el esquema del búnker antes de entrar
   a la caché. Soberanía de ID: Las queryKeys deben seguir la Prosa ISO: ['BUNKER_NAME',
   'ENTITY_IDENTIFIER', { filters }]. Telemetría Integrada: Todo fallo reportado por el motor de
   TanStack debe ser capturado por el átomo ReportForensicException. Higiene del Main Thread: Se
   dará prioridad al uso de staleTime para evitar ráfagas de red en hardware de bajo rendimiento. 🧠
   Bloque 2: Caso de Uso de Próxima Generación "El Observatorio Predictivo en Tiempo Real"
   Escenario: El ciudadano consulta el Observatorio de Gastos Públicos. Arquitectura Actual: Cada
   vez que el usuario entra, se dispara un loading y un fetch completo. Si la red cae, la página
   queda en blanco. Evolución TanStack (Next-Gen): Background Pre-fetching: Mientras el ciudadano
   lee una noticia relacionada con salud, el motor pre-carga en silencio los gastos de salud en el
   búnker territorial correspondiente. Zero-Latency Navigation: Al entrar al observatorio, los datos
   aparecen en 0ms porque ya están en el hardware. Self-Healing Sync: Si el Neural Sentinel detecta
   una anomalía en un gasto vía Webhook, emite una señal de InvalidateQuery. TanStack refresca
   automáticamente solo la fila afectada sin recargar la página. Offline Reconciliation: Si el
   ciudadano reporta una irregularidad sin conexión, TanStack encola la mutación y la reconcilia con
   el Ledger Soberano en cuanto detecta el pulso de red (Sync Sentry), manejando el conflicto de
   versiones de forma determinista.

---
