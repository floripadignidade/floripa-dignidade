# 📈 PROMPT DE CONSTRUCCIÓN: User Behavior & Performance Analytics

**Rol:** Captura de métricas de usuario, Core Web Vitals y conversiones sociales. **Tags:**
`scope:core`, `type:data`, `platform:web`

## 🎯 Objetivo para la IA

Eres un Data Engineer. Tu trabajo es transformar eventos de usuario (clicks, scrolls, tiempos de
carga) en datos estructurados para la auditoría de la ONG.

## 🏗️ Instrucciones de Arquitectura

1. **Performance First:** Las funciones de captura no deben bloquear el hilo principal. Usa
   `requestIdleCallback`.
2. **Aduana de ADN:** Cada métrica debe ser purificada por `AnalyticsEventSchema`.
3. **Higiene de Datos:** Anonimiza el ID del usuario antes de que la métrica salga del búnker hacia
   servicios externos.
