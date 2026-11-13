# 🧪 Quality Assurance Mirror Bunker (QA Mirror)

**Rol:** Terreno Sagrado para la Validación y Aserción de Lógica.  
**Estatus:** Zenith (OEDP-V10.0)  
**Estándar:** ISO/IEC 25010 (Calidad del Producto de Software).

## 🎯 Misión Ontológica

El búnker `@floripa-dignidade/qa-mirror` existe para implementar la **Doctrina del Mirror Testing**.
Su objetivo es desacoplar físicamente la lógica de aserción (pruebas) de la lógica de negocio. Esto
garantiza despliegues en Vercel 100% limpios y optimiza los tiempos de construcción al no procesar
artefactos de QA en las aplicaciones finales.

## 🏗️ Arquitectura de Espejo (Mirroring)

La carpeta `src/lib/` debe replicar exactamente la estructura de carpetas del monorepo en `libs/`.

**Ejemplo de Simetría:**

- **Lógica:** `libs/core/exceptions/src/lib/codes/GlobalBaseException.ts`
- **Prueba:** `tests/src/lib/core/exceptions/GlobalBaseException.spec.ts`

## 🛡️ Estándares de Ejecución

1. **Zero Contamination:** Prohibido crear archivos `.spec.ts` o `.test.ts` dentro de la carpeta
   `libs/`.
2. **Atomic Asserts:** Cada archivo de prueba debe validar una única unidad atómica de lógica.
3. **Sovereign Paths:** Las pruebas importan la lógica de producción exclusivamente a través de los
   alias oficiales (`@floripa-dignidade/*`).

## 🚀 Comandos de Auditoría de Calidad

Ejecutar todas las pruebas unitarias y de integración:

```bash
nx test @floripa-dignidade/qa-mirror
Generar reporte de cobertura forense:

nx test @floripa-dignidade/qa-mirror

--codeCoverage
🧬 ADN Tecnológico
Motor de Ejecución: Jest.
Transpilador: @swc/jest (Velocidad sub-milisegundo).
Entorno: JSDOM (Soporte para componentes de React y Web APIs).

---


```
