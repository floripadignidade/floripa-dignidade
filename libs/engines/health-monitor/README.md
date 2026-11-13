# 🩺 PROMPT DE CONSTRUCCIÓN: Global System Health Monitor

**Rol:** Vigilante de signos vitales e infraestructura externa. **Estándar:** ADR 0001 (Telemetría)

## 🎯 Objetivo para la IA

Actúa como un Ingeniero de Site Reliability (SRE). Este búnker hace "pings" lógicos a la base de
datos, APIs de redes sociales y servicios de correo.

## 🏗️ Instrucciones de Arquitectura

1. **El Pulso Vital:** Cada chequeo de salud debe devolver un `healthScore` (0.0 a 1.0).
2. **Dependencias Core:** Reporta sus hallazgos exclusivamente a `@floripa-dignidade/telemetry`.
3. **Aislamiento:** No debe tener lógica de interfaz de usuario. Es lógica pura de servidor
   (`platform:node`).

## 🧬 ADN Estructural

Utiliza `HealthCheckResultSchema`. Si un servicio tiene una latencia superior a 500ms, debe marcarse
como `DEGRADED`.
