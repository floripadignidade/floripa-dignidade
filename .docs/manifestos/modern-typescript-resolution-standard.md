# ⚙️ ESTÁNDAR DE RESOLUCIÓN DE TIPOS (OEDP-V18.1)

**Estado:** VIGENTE / LEY ABSOLUTA  
**Referencia:** TypeScript 5.0+ / Next.js 16 (Turbopack)  
**Objetivo:** Erradicar la ambigüedad en el grafo de dependencias y optimizar la velocidad de
compilación eliminando configuraciones legadas.

---

## 🚫 1. Prohibición de `baseUrl`

Queda estrictamente prohibido el uso de la propiedad `"baseUrl": "..."` en cualquier archivo
`tsconfig.json` del ecosistema.

- **Razón:** Crea resoluciones no deterministas y es una opción considerada "legacy" que genera
  fricción con el motor de Next.js 16.
- **Acción:** Si el Health Monitor (IA) detecta esta propiedad, debe eliminarla inmediatamente y
  ajustar los `paths` para que sean relativos a la ubicación física del archivo de configuración.

## 🛠️ 2. Estándar de Mapeo de Rutas (Root-Relative Paths)

La resolución debe ser explícita y apuntar directamente a los puntos de entrada del código fuente
(`src/index.ts`).

### Ejemplo Correcto (tsconfig.base.json):

```json
{
  "compilerOptions": {
    "paths": {
      "@floripa-dignidade/core-logic": ["libs/core/logic/src/index.ts"]
    }
  }
}

🤖 3. Instrucciones para la IA (Neural Sentinel)
Auditoría de Configuración: Ante cada refactorización de infraestructura, verifica que baseUrl no exista.
Resolución Source-First: Asegura que los paths siempre apunten a la fuente .ts y nunca a carpetas dist o out-tsc.
Fallo de Validación: Cualquier intento de importar mediante rutas "mágicas" facilitadas por baseUrl debe ser rechazado y corregido por una ruta absoluta institucional (@floripa-dignidade/*).

---


```
