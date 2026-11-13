**Estado:** VIGENTE / PRIORIDAD ABSOLUTA  
**Autor:** Dirección de Ingeniería - Floripa Dignidade  
**Estándares de Referencia:** ISO/IEC 11179 (Metadata Naming), ISO/IEC 25010, Google Engineering
Standards.

---

## 1. Filosofía de Nomenclatura: "Claridad sobre Metáfora"

Queda estrictamente prohibido el uso de términos metafóricos, cinematográficos o informales en el
código, infraestructura y documentación. El código de la ONG debe reflejar profesionalismo,
transparencia y rigor científico.

### Tabla de Equivalencias de Transición:

| Término Prohibido             | Término Técnico Obligatorio        |
| :---------------------------- | :--------------------------------- |
| Sovereign / Zenith / God Tier | **Core / Enterprise / Global**     |
| Bunker / Aparato              | **Module / Library / Component**   |
| Neural Sentinel / Brain       | **HealthMonitor / AnalysisEngine** |
| Blood Flow / Sanguíneo        | **EventStream / DataFlow**         |
| Mutant Identity               | **UserContext / SessionIdentity**  |
| Lego                          | **Modular / Atomic Artifact**      |

---

## 2. Definición de Estándares ISO aplicados

### 2.1. ISO/IEC 11179 (Nombramiento de Datos)

Cada variable y archivo debe ser nombrado siguiendo el principio de **Objeto + Propiedad +
Representación**.

- **Mala Práctica:** `const userMail = "..."`
- **Buena Práctica (ISO):** `const userEmailAddress = "..."`

### 2.2. ISO 25010 (Mantenibilidad)

Para garantizar la mantenibilidad, los nombres deben describir **QUÉ HACE** la función, no cómo lo
hace.

- **Mala Práctica:** `function sendDataToDatabase()`
- **Buena Práctica:** `function persistUserRegistration()`

---

## 3. Jerarquía de Carpetas y Workspaces

Los nombres de las carpetas deben ser puramente funcionales y descriptivos de su responsabilidad
única:

- `libs/core/` -> Funcionalidades compartidas de bajo nivel (Logger, ErrorHandler).
- `libs/modules/` -> Dominios de negocio (Newsletter, Complaints).
- `libs/shared/` -> Recursos genéricos (UIComponents, UtilityTypes).
- `apps/` -> Consumidores finales (WebPortal, AdministrationSystem).

---

## 4. Prohibición de Abreviaturas (Ampliación ADR 0002)

Se refuerza la regla de **Cero Abreviaturas**. Bajo ninguna circunstancia se aceptarán términos como
`req`, `res`, `err`, `auth`, `ctx`, `ptr`.

- **Correcto:** `requestContext`, `responsePayload`, `authenticationService`.

---

## 5. Aplicación y Auditoría

Cualquier Pull Request que contenga terminología informal será rechazado automáticamente por el
`HealthAuditEngine`. La integridad del lenguaje es la base de la integridad del software.

---
