/**
 * @section Infrastructure Auditor - S3 Configuration Extractor (Atom)
 * @description Átomo de lógica pura encargado de extraer, sanear y normalizar las
 * credenciales y coordenadas de almacenamiento S3-Compatible (Supabase Storage) desde
 * un snapshot de variables de entorno, aplicando valores por defecto institucionales
 * para la región de São Paulo ('sa-east-1') y el contenedor 'media-vault'.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Mantenibilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

const DEFAULT_S3_BUCKET_NAME_LITERAL = 'media-vault';
const DEFAULT_S3_REGION_LITERAL = 'sa-east-1';

/**
 * @interface ISanitizedS3Configuration
 * @description Contrato inmutable con las credenciales y parámetros saneados de la pasarela S3.
 */
export interface ISanitizedS3Configuration {
  readonly isConfiguredBoolean: boolean;
  readonly s3EndpointLiteral: string;
  readonly accessKeyIdentifierSecret: string;
  readonly secretAccessKeySecret: string;
  readonly bucketNameLiteral: string;
  readonly regionNameLiteral: string;
}

/**
 * Extrae y recorta espacios de una variable de entorno específica aplicando un respaldo opcional.
 *
 * @param environmentSnapshot - Diccionario inmutable de variables de entorno capturadas.
 * @param variableNameLiteral - Nombre exacto de la clave de entorno a consultar.
 * @param fallbackLiteral - Valor de respaldo cuando la variable no existe o está vacía.
 * @returns {string} Cadena purificada o valor de respaldo.
 */
const readTrimmedEnvironmentLiteral = (
  environmentSnapshot: Readonly<Record<string, string | undefined>>,
  variableNameLiteral: string,
  fallbackLiteral = '',
): string => {
  const rawValue = environmentSnapshot[variableNameLiteral];
  if (!rawValue) {
    return fallbackLiteral;
  }
  const trimmedValue = rawValue.trim();
  return trimmedValue.length > 0 ? trimmedValue : fallbackLiteral;
};

/**
 * Consolida y valida la presencia mínima de credenciales para firmar peticiones AWS SigV4.
 *
 * @param environmentSnapshot - Snapshot inmutable obtenido desde '@floripa-dignidade/environment-validator'.
 * @returns {ISanitizedS3Configuration} Configuración sellada e inmutable lista para consumo de la sonda.
 */
export const ExtractSanitizedS3Configuration = (
  environmentSnapshot: Readonly<Record<string, string | undefined>>,
): ISanitizedS3Configuration => {
  const s3EndpointLiteral = readTrimmedEnvironmentLiteral(environmentSnapshot, 'S3_ENDPOINT');
  const accessKeyIdentifierSecret = readTrimmedEnvironmentLiteral(
    environmentSnapshot,
    'S3_ACCESS_KEY_ID',
  );
  const secretAccessKeySecret = readTrimmedEnvironmentLiteral(
    environmentSnapshot,
    'S3_SECRET_ACCESS_KEY',
  );
  const bucketNameLiteral = readTrimmedEnvironmentLiteral(
    environmentSnapshot,
    'S3_BUCKET',
    DEFAULT_S3_BUCKET_NAME_LITERAL,
  );
  const regionNameLiteral = readTrimmedEnvironmentLiteral(
    environmentSnapshot,
    'S3_REGION',
    DEFAULT_S3_REGION_LITERAL,
  );

  const isConfiguredBoolean =
    s3EndpointLiteral.length > 0 &&
    accessKeyIdentifierSecret.length > 0 &&
    secretAccessKeySecret.length > 0;

  return Object.freeze({
    isConfiguredBoolean,
    s3EndpointLiteral,
    accessKeyIdentifierSecret,
    secretAccessKeySecret,
    bucketNameLiteral,
    regionNameLiteral,
  });
};
