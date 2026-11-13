# ⚠️ PROMPT DE CONSTRUCCIÓN: Global Exceptions Engine

**Rol:** Gestión unificada de fallos y sensores de dolor del algoritmo. **Estándar:** ADR 0014
(Atomicidad)

## 🎯 Objetivo para la IA

Este búnker define qué es una "falla" en el sistema. Debes construir clases de error que hereden de
`GlobalBaseException`.

## 🏗️ Instrucciones de Arquitectura

1. **Zero Abbreviations:** Usa `ValidationException` en lugar de `ValErr`.
2. **Estructura de Aparato:**
   - `lib/codes/`: Diccionario de códigos de error estandarizados.
   - `lib/mappers/`: Conversor de errores HTTP a excepciones internas.
3. **Soberanía:** Las excepciones deben capturar un `runtimeSnapshot` para que el Neural Sentinel
   pueda reconstruir el fallo.

## 🧬 ADN Estructural

Cada excepción debe incluir obligatoriamente: `errorCode`, `statusCode` y `contextMetadata`.
