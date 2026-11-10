/**
 * @section Scripts & Automation - Cloud Infrastructure Secrets Auditor CLI
 * @description Disparador ejecutable de línea de comandos (CLI) encargado de orquestar
 * la auditoría física y en vivo de todas las claves de API y servicios cloud
 * (PostgreSQL, Supabase REST, Supabase S3 Storage, Resend Email, Hugging Face SLM
 * y WhatsApp Meta Gateway).
 * Imprime un informe forense estructurado en la terminal y certifica la emisión del reporte JSON.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Operabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import process from 'node:process';

/* 1. Infraestructura Core de Telemetría */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

/* 2. Orquestador Central de Infraestructura */
import { AuditCloudInfrastructureSecrets } from '../../libs/tools/src/lib/infrastructure-auditor/AuditCloudInfrastructureSecrets.js';

/* 3. Contratos de Tipado y Esquemas */
import type {
  ICloudInfrastructureAuditReport,
  IIndividualProviderAuditSnapshot,
  TProbeExecutionStatus,
} from '../../libs/tools/src/lib/infrastructure-auditor/schemas/CloudInfrastructureAuditReport.schema.js';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const SCRIPT_MODULE_IDENTIFIER =
  'CLOUD_INFRASTRUCTURE_CLI_RUNNER' as ModuleIdentifier;

/**
 * @section Constantes de Estilo ANSI para Consola
 */
const ANSI_COLOR_RESET_LITERAL = '\x1b[0m';
const ANSI_COLOR_BOLD_LITERAL = '\x1b[1m';
const ANSI_COLOR_GREEN_LITERAL = '\x1b[32m';
const ANSI_COLOR_YELLOW_LITERAL = '\x1b[33m';
const ANSI_COLOR_RED_LITERAL = '\x1b[31m';
const ANSI_COLOR_CYAN_LITERAL = '\x1b[36m';
const ANSI_COLOR_MAGENTA_LITERAL = '\x1b[35m';
const ANSI_COLOR_GRAY_LITERAL = '\x1b[90m';

/**
 * Mapea el estado técnico de la sonda con su color representativo en la consola.
 *
 * @param probeStatusLiteral - Estado resultante emitido por la sonda.
 * @returns {string} Código de escape ANSI correspondiente.
 */
const ResolveStatusColorLiteral = (
  probeStatusLiteral: TProbeExecutionStatus,
): string => {
  switch (probeStatusLiteral) {
    case 'NOMINAL_OPERATIONAL':
      return ANSI_COLOR_GREEN_LITERAL;
    case 'DEGRADED_LATENCY':
      return ANSI_COLOR_YELLOW_LITERAL;
    case 'AUTHENTICATION_REJECTED':
      return ANSI_COLOR_RED_LITERAL;
    case 'UNREACHABLE_FAILURE':
      return ANSI_COLOR_RED_LITERAL;
    case 'UNCONFIGURED_CREDENTIALS':
      return ANSI_COLOR_MAGENTA_LITERAL;
    default:
      return ANSI_COLOR_RESET_LITERAL;
  }
};

/**
 * Imprime por pantalla la tabla visual con el veredicto de cada proveedor.
 *
 * @param providersAuditCollection - Colección de snapshots unitarios por proveedor.
 */
const RenderForensicAuditTable = (
  providersAuditCollection: readonly IIndividualProviderAuditSnapshot[],
): void => {
  console.log(
    `\n${ANSI_COLOR_BOLD_LITERAL}${ANSI_COLOR_CYAN_LITERAL}--- [FLORIPA DIGNIDADE]: MATRIZ DE CONECTIVIDAD E INFRAESTRUCTURA CLOUD ---${ANSI_COLOR_RESET_LITERAL}\n`,
  );

  console.log(
    `${ANSI_COLOR_GRAY_LITERAL}┌──────────────────────────────────────────┬─────────────────────────────┬────────────┬────────────────────────────────────────────────────────────┐${ANSI_COLOR_RESET_LITERAL}`,
  );
  console.log(
    `${ANSI_COLOR_GRAY_LITERAL}│${ANSI_COLOR_RESET_LITERAL} ${ANSI_COLOR_BOLD_LITERAL}PROVEEDOR EVALUADO${ANSI_COLOR_RESET_LITERAL}                     ${ANSI_COLOR_GRAY_LITERAL}│${ANSI_COLOR_RESET_LITERAL} ${ANSI_COLOR_BOLD_LITERAL}ESTADO TÉCNICO${ANSI_COLOR_RESET_LITERAL}              ${ANSI_COLOR_GRAY_LITERAL}│${ANSI_COLOR_RESET_LITERAL} ${ANSI_COLOR_BOLD_LITERAL}LATENCIA${ANSI_COLOR_RESET_LITERAL}   ${ANSI_COLOR_GRAY_LITERAL}│${ANSI_COLOR_RESET_LITERAL} ${ANSI_COLOR_BOLD_LITERAL}DIAGNÓSTICO SRE${ANSI_COLOR_RESET_LITERAL}                                             ${ANSI_COLOR_GRAY_LITERAL}│${ANSI_COLOR_RESET_LITERAL}`,
  );
  console.log(
    `${ANSI_COLOR_GRAY_LITERAL}├──────────────────────────────────────────┼─────────────────────────────┼────────────┼────────────────────────────────────────────────────────────┤${ANSI_COLOR_RESET_LITERAL}`,
  );

  for (const individualProbeSnapshot of providersAuditCollection) {
    const statusColorLiteral = ResolveStatusColorLiteral(
      individualProbeSnapshot.probeStatusLiteral,
    );

    const formattedProviderNameLiteral =
      individualProbeSnapshot.providerIdentifier.padEnd(40, ' ');

    const formattedStatusLiteral = `${statusColorLiteral}${individualProbeSnapshot.probeStatusLiteral.padEnd(
      27,
      ' ',
    )}${ANSI_COLOR_RESET_LITERAL}`;

    const formattedLatencyLiteral = `${individualProbeSnapshot.executionLatencyInMillisecondsQuantity}ms`.padEnd(
      10,
      ' ',
    );

    const truncatedDescriptionLiteral =
      individualProbeSnapshot.statusDescriptionLiteral.length > 58
        ? `${individualProbeSnapshot.statusDescriptionLiteral.substring(0, 55)}...`
        : individualProbeSnapshot.statusDescriptionLiteral.padEnd(58, ' ');

    console.log(
      `${ANSI_COLOR_GRAY_LITERAL}│${ANSI_COLOR_RESET_LITERAL} ${formattedProviderNameLiteral} ${ANSI_COLOR_GRAY_LITERAL}│${ANSI_COLOR_RESET_LITERAL} ${formattedStatusLiteral} ${ANSI_COLOR_GRAY_LITERAL}│${ANSI_COLOR_RESET_LITERAL} ${formattedLatencyLiteral} ${ANSI_COLOR_GRAY_LITERAL}│${ANSI_COLOR_RESET_LITERAL} ${truncatedDescriptionLiteral} ${ANSI_COLOR_GRAY_LITERAL}│${ANSI_COLOR_RESET_LITERAL}`,
    );
  }

  console.log(
    `${ANSI_COLOR_GRAY_LITERAL}└──────────────────────────────────────────┴─────────────────────────────┴────────────┴────────────────────────────────────────────────────────────┘${ANSI_COLOR_RESET_LITERAL}\n`,
  );
};

/**
 * Función principal de arranque del script CLI.
 */
const ExecuteAuditCommandLineInterface = async (): Promise<void> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'INFO',
    moduleIdentifierLiteral: SCRIPT_MODULE_IDENTIFIER,
    operationCodeLiteral: 'CLI_AUDIT_EXECUTION_TRIGGERED' as OperationCode,
    correlationIdentifier,
    messageContentLiteral:
      'Iniciando ejecución de auditoría de infraestructura cloud desde CLI.',
    semanticIntentTag: 'CLI_INFRASTRUCTURE_AUDIT_START',
  });

  try {
    const auditReportSnapshot: ICloudInfrastructureAuditReport =
      await AuditCloudInfrastructureSecrets(undefined, correlationIdentifier);

    // 1. RENDERIZADO VISUAL EN TERMINAL
    RenderForensicAuditTable(auditReportSnapshot.providersAuditCollection);

    // 2. RESUMEN GLOBAL DE FIABILIDAD
    console.log(
      `${ANSI_COLOR_BOLD_LITERAL}Duración Total de Sondas:${ANSI_COLOR_RESET_LITERAL} ${auditReportSnapshot.executionDurationInMillisecondsQuantity}ms`,
    );
    console.log(
      `${ANSI_COLOR_BOLD_LITERAL}Proveedores Evaluados:${ANSI_COLOR_RESET_LITERAL}    ${auditReportSnapshot.totalTestedProvidersQuantity}`,
    );
    console.log(
      `${ANSI_COLOR_BOLD_LITERAL}Servicios Nominales:${ANSI_COLOR_RESET_LITERAL}      ${ANSI_COLOR_GREEN_LITERAL}${auditReportSnapshot.healthyProvidersCountQuantity}${ANSI_COLOR_RESET_LITERAL}`,
    );
    console.log(
      `${ANSI_COLOR_BOLD_LITERAL}Servicios Comprometidos:${ANSI_COLOR_RESET_LITERAL}  ${
        auditReportSnapshot.compromisedProvidersCountQuantity > 0
          ? ANSI_COLOR_RED_LITERAL
          : ANSI_COLOR_GREEN_LITERAL
      }${auditReportSnapshot.compromisedProvidersCountQuantity}${ANSI_COLOR_RESET_LITERAL}`,
    );
    console.log(
      `${ANSI_COLOR_BOLD_LITERAL}Reporte Persistido en:${ANSI_COLOR_RESET_LITERAL}    ${ANSI_COLOR_CYAN_LITERAL}reports/infrastructure/infrastructure-secrets-audit-report.json${ANSI_COLOR_RESET_LITERAL}\n`,
    );

    // 3. DICTAMEN DE SALIDA SRE
    if (auditReportSnapshot.isInfrastructureFullyOperationalBoolean) {
      console.log(
        `${ANSI_COLOR_BOLD_LITERAL}${ANSI_COLOR_GREEN_LITERAL}✔ INFRAESTRUCTURA 100% OPERATIVA: Todas las credenciales fueron autenticadas físicamente.${ANSI_COLOR_RESET_LITERAL}\n`,
      );
      process.exit(0);
    } else {
      console.log(
        `${ANSI_COLOR_BOLD_LITERAL}${ANSI_COLOR_RED_LITERAL}✖ ALERTA DE PREVUELO: Existen servicios con credenciales ausentes, rechazadas o inaccesibles.${ANSI_COLOR_RESET_LITERAL}\n`,
      );
      process.exit(1);
    }
  } catch (caughtExecutionError: unknown) {
    const errorDescriptionLiteral =
      caughtExecutionError instanceof Error
        ? caughtExecutionError.message
        : String(caughtExecutionError);

    console.error(
      `\n${ANSI_COLOR_BOLD_LITERAL}${ANSI_COLOR_RED_LITERAL}ERROR FATAL EN AUDITORÍA:${ANSI_COLOR_RESET_LITERAL} ${errorDescriptionLiteral}\n`,
    );

    process.exit(1);
  }
};

// Arranque determinista del script
void ExecuteAuditCommandLineInterface();