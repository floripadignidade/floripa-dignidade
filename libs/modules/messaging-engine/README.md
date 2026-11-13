# 📬 Messaging & Notification Engine (The Communication Hub)

**Estatus:** Zenith (OEDP-V16.0)  
**Rol:** Núcleo de Comunicación Institucional, Mensajería P2P y Presencia Cognitiva.  
**Tags:** `scope:modules`, `type:logic`, `platform:isomorphic`

## 🎯 1. Misión Ontológica

El `@floripa-dignidade/messaging-engine` es el orquestador del flujo sanguíneo informativo entre la
ONG y la ciudadanía. Su responsabilidad es garantizar que ningún mensaje se pierda y que la entrega
sea inteligente: si el usuario está en la web, recibe un aviso instantáneo; si está en la calle,
recibe una alerta Push en su móvil (PWA).

## 🧠 2. Arquitectura de Élite (Distributed Intelligence)

Para superar el rendimiento de plataformas propietarias, este búnker implementa:

- **Matriz de Presencia Cognitiva:** Realiza un seguimiento del hardware activo (`DESKTOP`,
  `MOBILE_ANDROID`, `MOBILE_IOS`) para decidir el canal de entrega más eficiente.
- **Unified Inbox Matrix:** Utiliza mappers polimórficos para unificar notificaciones del sistema y
  mensajes directos en una única interfaz cronológica, reduciendo la complejidad del frontend.
- **Edge-Ready Persistence:** Comunicación pura vía Fetch nativo hacia el Ledger de Supabase,
  optimizado para latencias menores a 50ms en el Edge Runtime de Vercel.
- **Web Push Integration:** Implementación del protocolo estándar de notificaciones para PWA,
  garantizando soberanía sin dependencia de aplicaciones nativas.

## 🏗️ 3. Estructura del Búnker (Atomic Lego Hierarchy)

### 🧬 Capa 1: Aduanas de ADN (`/schemas`)

- `PushPayload.schema.ts`: Contrato para alertas físicas en el sistema operativo.
- `UserPresence.schema.ts`: ADN del estado de disponibilidad (Online/Away).
- `DirectMessage.schema.ts`: Contrato para comunicación privada cifrada.

### ⚙️ Capa 2: Motores de Transmisión (`/logic/dispatchers`)

- `DispatchPushNotification.ts`: Orquestador de alertas PWA.
- `DispatchSystemNotification.ts`: Emisor de avisos institucionales masivos.

### 🔄 Capa 3: Motores de Mutación (`/logic/mutators`)

- `UpdateUserPresence.ts`: Gestiona el Heartbeat de vida del ciudadano.
- `MarkNotificationAsRead.ts`: Transiciona el estado de la "Campanita".

### 📊 Capa 4: Motores de Descubrimiento (`/logic/queries`)

- `GetUnifiedCitizenInbox.ts`: Recuperación paralela de la bandeja de entrada.
- `GetUnreadNotificationsCount.ts`: Sensor ligero para el contador de alertas.

## 🌍 4. Soberanía Lingüística (i18n)

Cada estado de presencia (`ONLINE`, `AWAY`, `DO_NOT_DISTURB`) y cada error técnico posee un silo
lingüístico validado por Zod, asegurando que la IA y el usuario hablen el mismo lenguaje en PT, ES y
EN.

## 🛡️ 5. Estándares de Seguridad (SRE)

- **IDOR Protection:** Todas las mutaciones validan físicamente la propiedad de la identidad contra
  el `recipient_id` en la nube.
- **PII Masking:** Los dispatchers de Push enmascaran automáticamente datos sensibles antes de
  enviarlos a través de gateways públicos.

---

"La comunicación efectiva es la infraestructura de la dignidad."
