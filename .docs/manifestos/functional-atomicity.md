**Autor:** Raz Podestá - MetaShark Tech  
**Projeto:** Floripa Dignidade  
**Status:** Vital / Em vigor  
**Nível:** God Tier (Arquitetura de Fluxo Puro)

## 1. A Filosofia: "Um Aparato, Uma Função, Uma Verdade"

Para permitir que el cerebro de IA (`core-ai-audit-brain`) opere con precisión quirúrgica,
pulverizamos la complejidad en **Unidades Lógicas Atómicas**.

### 1.1. A Regra do Arquivo Único

Cada archivo de lógica (`.ts`) debe exportar **exclusivamente una única función**. Si una lógica
requiere sub-funciones, estas se extraen a sus propios aparatos atómicos.

---

## 2. Anatomia de um Aparato Atômico (Standard OEDP-V5.5)

Todo aparato debe ser entregado con esta tríada obligatoria:

1. **A Lógica (`ApparatusName.ts`):** La ejecución pura.
2. **O Contrato (`schemas/ApparatusName.schema.ts`):** Validación Zod estricta.
3. **A Alma Linguística (`i18n/pt/ApparatusName.pt.schema.json`):** Diccionario granular.

---

## 3. Exemplo Prático: ValidateComplaintUrgency

Este aparato determina si una denuncia recibida vía WhatsApp requiere intervención inmediata.

### 📄 Arquivo 1: Lógica Atômica

`libs/modules/whatsapp-engine/src/lib/processors/ValidateComplaintUrgency.ts`

```typescript
import { coreLogger } from '@floripa-dignidade/core-logger';
import {
  ValidateComplaintUrgencySchema,
  ValidateComplaintUrgencyParameters,
} from './schemas/ValidateComplaintUrgency.schema';

export const ValidateComplaintUrgency = async (
  parameters: ValidateComplaintUrgencyParameters,
): Promise<boolean> => {
  // 1. Validação de Fronteira (Aduana do Átomo)
  const validatedData = ValidateComplaintUrgencySchema.parse(parameters);

  // 2. Execução Atômica
  const criticalKeywords = ['violência', 'fome', 'expulsão', 'emergência'];
  const isUrgent = criticalKeywords.some((keyword) =>
    validatedData.messageContent.toLowerCase().includes(keyword),
  );

  // 3. Telemetria e Logs
  coreLogger.info(`Auditando urgência de denúncia: ${isUrgent}`);

  return isUrgent;
};
```
