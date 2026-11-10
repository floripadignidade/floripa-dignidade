/**
 * @section Tools & Infrastructure - Cloud Infrastructure Audit Report Contract
 * @description Única Fuente de Verdad (SSOT) para el contrato de auditoría y validación
 * activa de credenciales e infraestructura cloud (Database Postgres, Supabase REST,
 * Supabase Storage S3, Resend, Meta WhatsApp y Hugging Face SLM).
 * Rige bajo la norma ISO/IEC 11179 (Nomenclatura Prosa) y la norma ISO/IEC 25010 (Calidad y Mantenibilidad).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name CloudInfrastructureAuditReportIdentifierSchema
 * @description Sello de marca nominal para el identificador único del reporte forense.
 */
export const CloudInfrastructureAuditReportIdentifierSchema = z
  .string()
  .uuid({ message: 'EL_IDENTIFICADOR_DEL_REPORTE_DEBE_SER_UUID_VALIDO' })
  .brand<'CloudInfrastructureAuditReportIdentifier'>();

export type TCloudInfrastructureAuditReportIdentifier = z.infer<
  typeof CloudInfrastructureAuditReportIdentifierSchema
>;

/**
 * @name InfrastructureProviderIdentifierSchema
 * @description Catálogo institucional de los proveedores de infraestructura externa sujetos a auditoría.
 */
export const InfrastructureProviderIdentifierSchema = z
  .enum([
    'DATABASE_POSTGRES_RELATIONAL',
    'SUPABASE_REST_DATA_LAKE',
    'SUPABASE_STORAGE_S3_GATEWAY',
    'RESEND_TRANSACTIONAL_EMAIL',
    'HUGGING_FACE_COGNITIVE_INFERENCE',
    'META_WHATSAPP_COMMUNICATION_GATEWAY',
  ])
  .describe('Identificador institucional del servicio o proveedor cloud bajo prueba.');

export type TInfrastructureProviderIdentifier = z.infer<
  typeof InfrastructureProviderIdentifierSchema
>;

/**
 * @name ProbeExecutionStatusSchema
 * @description Estados categóricos de salud tras la ejecución física de la sonda de conexión.
 */
export const ProbeExecutionStatusSchema = z
  .enum([
    'NOMINAL_OPERATIONAL',
    'DEGRADED_LATENCY',
    'UNREACHABLE_FAILURE',
    'AUTHENTICATION_REJECTED',
    'UNCONFIGURED_CREDENTIALS',
  ])
  .describe('Veredicto técnico del estado de respuesta de la sonda de infraestructura.');

export type TProbeExecutionStatus = z.infer<typeof ProbeExecutionStatusSchema>;

/**
 * @name IndividualProviderAuditSnapshotSchema
 * @description Contrato inmutable que estructura el diagnóstico individual de cada servicio evaluado.
 */
export const IndividualProviderAuditSnapshotSchema = z
  .object({
    /** Identificador del proveedor evaluado. */
    providerIdentifier: InfrastructureProviderIdentifierSchema,

    /** Veredicto operativo alcanzado tras el sondeo. */
    probeStatusLiteral: ProbeExecutionStatusSchema,

    /** Latencia de respuesta medida físicamente en milisegundos. */
    executionLatencyInMillisecondsQuantity: z
      .number()
      .nonnegative({ message: 'LA_LATENCIA_DEBE_SER_UN_VALOR_POSITIVO' })
      .describe('Tiempo medido físicamente en milisegundos para completar el handshake.'),

    /** Descripción semántica y legible del resultado para el auditor humano. */
    statusDescriptionLiteral: z
      .string()
      .min(1, { message: 'LA_DESCRIPCION_DE_ESTADO_NO_PUEDE_ESTAR_VACIA' }),

    /** Dirección del endpoint físico de destino verificado. */
    endpointTargetLiteral: z
      .string()
      .describe('URL o referencia del endpoint consultado durante la prueba.'),

    /** Indica si las variables de entorno asociadas poseen el formato sintáctico requerido. */
    hasValidSecretFormatBoolean: z
      .boolean()
      .describe('Certificación de que el secreto cumple con las restricciones de formato en Zod.'),

    /** Detalle forense del error capturado en caso de rechazo o caída (opcional). */
    diagnosticErrorLiteral: z.string().optional(),
  })
  .readonly();

export type IIndividualProviderAuditSnapshot = z.infer<
  typeof IndividualProviderAuditSnapshotSchema
>;

/**
 * @name CloudInfrastructureAuditReportSchema
 * @description Contrato maestro inmutable para la emisión de reportes forenses de
 * infraestructura. Define la estructura de persistencia en disco (reports/infrastructure/*.json).
 */
export const CloudInfrastructureAuditReportSchema = z
  .object({
    /** Identificador único inalterable de la sesión de auditoría. */
    reportIdentifier: CloudInfrastructureAuditReportIdentifierSchema,

    /** Marca de tiempo exacta en formato ISO 8601 del inicio de la evaluación. */
    auditTimestampISO: z
      .string()
      .datetime({ message: 'FORMATO_DE_TIMESTAMP_DE_AUDITORIA_INVALIDO' }),

    /** Tiempo total consumido por la ejecución de todas las sondas concurrentes. */
    executionDurationInMillisecondsQuantity: z
      .number()
      .nonnegative({ message: 'LA_DURACION_TOTAL_DEBE_SER_POSITIVA' }),

    /** Certificación global de que la infraestructura está lista para tráfico de producción. */
    isInfrastructureFullyOperationalBoolean: z
      .boolean()
      .describe('Verdadero si el 100% de los servicios críticos están en estado NOMINAL_OPERATIONAL.'),

    /** Total de proveedores analizados en la corrida. */
    totalTestedProvidersQuantity: z
      .number()
      .int()
      .positive({ message: 'EL_TOTAL_DE_SERVICIOS_DEBE_SER_MAYOR_A_CERO' }),

    /** Cantidad de proveedores que superaron la prueba nominalmente. */
    healthyProvidersCountQuantity: z
      .number()
      .int()
      .nonnegative(),

    /** Cantidad de proveedores con credenciales rechazadas o inaccesibles. */
    compromisedProvidersCountQuantity: z
      .number()
      .int()
      .nonnegative(),

    /** Colección estructurada de los diagnósticos unitarios por proveedor. */
    providersAuditCollection: z
      .array(IndividualProviderAuditSnapshotSchema)
      .min(1, { message: 'LA_COLECCION_DE_DIAGNOSTICOS_NO_PUEDE_ESTAR_VACIA' }),

    /** Identificador de correlación único para la cadena de custodia en el bus de telemetría. */
    correlationIdentifier: z
      .string()
      .uuid({ message: 'EL_IDENTIFICADOR_DE_CORRELACION_DEBE_SER_UUID' }),

    /** Modo de entorno de ejecución en el cual se disparó la auditoría. */
    executionEnvironmentLiteral: z.enum(['development', 'production', 'test']),
  })
  .readonly();

export type ICloudInfrastructureAuditReport = z.infer<
  typeof CloudInfrastructureAuditReportSchema
>;