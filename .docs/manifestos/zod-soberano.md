**Autor:** Raz Podestá - MetaShark Tech  
**Projeto:** Floripa Dignidade  
**Status:** Vital / Em vigor  
**Nível:** God Tier (Validação Semântica)

---

## 1. A Filosofia: "Esquema como Única Fonte de Verdade (SSOT)"

En el ecosistema de **Floripa Dignidade**, Zod no es solo un validador de formularios; es la
**Aduana de ADN**. Todo dato que entra en un aparato (vía API, entrada de usuario o Props) debe ser
"desnudado" y reconstruído por Zod. Si el ADN no coincide, el aparato ni siquiera inicia su
ejecución.

---

## 2. Regras de Construção de Elite

Para extraer el máximo de inteligencia de nuestros esquemas, aplicamos estas directrices:

### 2.1. Tipagem Nominal (Branded Types)

Evitamos la "obsesión por los primitivos". No todas las strings son iguales. Usamos `.brand<T>()`
para impedir que se envíe un `UserId` donde se espera un `NewsId`.

- ✅ `const NewsId = z.string().uuid().brand<'NewsId'>()`

### 2.2. Injeção de Metadados para IA (.describe)

Cada campo **debe** poseer una descripción técnica. Esto permite que el `core-ai-audit-brain`
entienda la intención del dato al analizar logs o sugerir cambios.

- ✅
  `email: z.string().email().describe('Correo oficial del ciudadano para notificaciones de derechos humanos')`

### 2.3. Transformação Proativa

Usamos `.transform()` y `.trim()` para que el dato salga de la aduana purificado y listo para la
base de datos o lógica de negocio (Principio DRY).

### 2.4. Erros Customizados e i18n

No permitimos mensajes predeterminados de Zod. Los errores deben ser códigos semánticos que mapeen a
nuestros diccionarios granulares.

- ✅ `{ message: 'ERROR_INVALID_BRAZILIAN_PHONE' }`

---

## 3. Exemplo "Nível Deus": Esquema de Denúncia de Direitos Humanos

Este esquema define la estructura soberana de una denuncia recibida por la ONG.

`libs/modules/denuncias-engine/src/lib/schemas/HumanRightsComplaint.schema.ts`

```typescript
import { z } from 'zod';

/**
 * @section Tipagem Nominal
 */
export const ComplaintIdSchema = z.string().uuid().brand<'ComplaintId'>();
export type ComplaintId = z.infer<typeof ComplaintIdSchema>;

/**
 * @name HumanRightsComplaintSchema
 */
export const HumanRightsComplaintSchema = z.object({
  identifier: ComplaintIdSchema.describe('Identificador único inalterable de la denuncia'),

  informantName: z.string()
    .min(3)
    .transform(val => val.trim())
    .describe('Nombre del denunciante o "Anónimo"'),

  description: z.string()
    .min(50, { message: 'COMPLAINT_DESCRIPTION_TOO_SHORT' })
    .describe('Relato detallado de la violación de derechos humanos detectada'),

  category: z.enum(['VIVIENDA', 'VIOLENCIA', 'ALIMENTACION', 'SALUD', 'OTRO'])
    .describe('Categorización semántica para el triaje de la IA'),

  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),

  evidenceUrls: z.array(z.string().url())
    .min(1, { message: 'EVIDENCE_REQUIRED' })
    .describe('Pruebas multimedia recibidas vía WhatsApp u otros canales')

}).readonly(); // Inmutabilidad forzada

export type IHumanRightsComplaint = z.infer<typeof HumanRightsComplaintSchema>;
4. O Padrão "Safe-Parsing" (A Aduana)
Para consumir estos esquemas, utilizamos el patrón de Purificación Proactiva conectado a nuestro core-logger:
code
TypeScript
const processIncomingData = (rawPayload: unknown) => {
  const result = HumanRightsComplaintSchema.safeParse(rawPayload);

  if (!result.success) {
    // La IA recibe los 'issues' y sabe exactamente qué campo falló y por qué.
    coreLogger.error('ADN_CORRUPTO_DETECTADO', {
      errors: result.error.flatten(),
      payload: rawPayload
    });
    throw new Error('SECURITY_ADUANA_BLOCK');
  }

  return result.data; // Dato purificado, transformado y tipado
};
5. O Papel da IA de Autocura (Neural Auditor)
El core-ai-audit-brain utilizará estos esquemas para:
Generar Testes Adversários: La IA leerá el esquema y creará automáticamente 100 variaciones de datos inválidos para intentar romper el sistema.
Sugerir Evoluções: "He notado que el 70% de las denuncias de WhatsApp fallan en el campo 'description'. Sugiero implementar un paso de 'audio-to-text' previo para mejorar la captación".

---


```
