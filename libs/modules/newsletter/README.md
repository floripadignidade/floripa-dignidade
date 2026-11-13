# 📧 PROMPT DE CONSTRUCCIÓN: Newsletter & Communications Engine

**Rol:** Captación de suscriptores y orquestación de boletines informativos. **Ruta Jerárquica:**
`libs/modules/newsletter`

## 🎯 Objetivo para la IA

Eres un Especialista en Growth y Comunicación. Debes construir un sistema de suscripción que soporte
internacionalización (i18n) desde el núcleo.

## 🏗️ Instrucciones de Arquitectura

1. **Subrutas de Lógica:**
   - `./resend/`: Adaptador específico para la API de Resend.
   - `./schemas/`: Contratos de validación de correo y preferencias.
   - `./i18n/`: Silos granulares de JSON por idioma (pt, es, en).
2. **Integración de Pre-build:** Asegura que los JSONs locales tengan el sufijo `.schema.json` para
   que el `tools-i18n-builder` los unifique.
3. **Validación Zenith:** Uso de Zod para sanitizar el email antes de cualquier operación de red.

## 🚀 Comando de Construcción

`pnpm nx build @floripa-dignidade/newsletter`
