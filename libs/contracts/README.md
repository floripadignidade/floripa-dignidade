# 🧬 ADN Global: Contracts & Blueprints

**Estatus:** Zenith (OEDP-V18.1) **Rol:** SSOT (Single Source of Truth). Contratos de Zod y tipos
nominales (Branded Types).

## 🎯 Misión

Centralizar todo el ADN estructural del ecosistema. Prohibido incluir lógica de negocio, llamadas de
red o dependencias de UI aquí.

## 🏗️ Reglas de Oro

1. **Inmutabilidad:** Todo esquema debe ser `.readonly()`.
2. **Branding:** Todo ID debe ser un Branded Type (ej: `UserIdentifier`).
3. **Cero Lógica:** Si el archivo tiene un `import` de una librería que no sea `zod`, debe ser
   movido a un búnker de lógica.
