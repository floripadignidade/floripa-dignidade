# 📱 WhatsApp AI Gateway (The Human Rights Sensor)

**Rol:** Receptor soberano de denuncias y puente conversacional con el ciudadano. **Estatus:** God
Tier / Security-First Implementation. **Tags:** `scope:modules`, `type:logic`, `platform:isomorphic`

## 🎯 Misión Ontológica

Actuar como el sistema sensorial de la ONG en el territorio digital. Este búnker procesa flujos de
datos no estructurados (mensajes de voz, texto, fotos) y los transforma en **Evidencia Forense**
mediante IA, garantizando la integridad criptográfica en cada paso.

## 🏗️ Arquitectura de Enjambre (Next-Gen)

1.  **Capa de Integridad (`/logic/atomic`):** Validación de firmas SHA256 HMAC para asegurar que la
    señal proviene exclusivamente de los servidores de Meta.
2.  **Capa Cognitiva (`/logic/processors`):** Motores que analizan la intención del mensaje para
    detectar si es una denuncia de Derechos Humanos o una consulta administrativa.
3.  **Capa de Persistencia Cloud (`/adapters`):** Registro stateless en Supabase siguiendo el
    protocolo **ADR 0015**.

## 🛡️ Estándares de Oro

- **Zero Privacy Leak:** Queda prohibido registrar el número telefónico del ciudadano en logs de
  nivel `INFO`. Solo se usará el `subscriberIdentifier` anonimizado.
- **Fail-Fast Security:** Si la firma `X-Hub-Signature-256` es inválida, el enjambre aborta el
  proceso en el milisegundo cero.
- **Linguistic Sovereignty:** Respuestas automatizadas entregadas según el idioma detectado en el
  perfil de WhatsApp del ciudadano.

## 🚀 Funcionalidades Futuras

- **Media Encryption:** Cifrado de fotos y videos antes del almacenamiento en Cloud Buckets.
- **Location Pinning:** Extracción de coordenadas geográficas para mapeo de vulnerabilidades
  sociales.
