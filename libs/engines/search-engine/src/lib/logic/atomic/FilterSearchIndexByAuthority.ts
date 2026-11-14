/**
 * @section Search Engine Logic - Search Index RBAC Filter (Atom)
 * @description Átomo de seguridad encargado de purgar el índice de búsqueda antes del
 * algoritmo difuso (Security by Design). Valida el rol solicitante contra
 * `SearchAuthorityRoleSchema`, aplica comparación jerárquica Fail-Closed mediante
 * `ResolveSearchAuthorityRank` y emite trazabilidad SRE conforme a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidationException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  ReportForensicException,
} from '@floripa-dignidade/telemetry';

import {
  type ISearchableEntity,
  type SearchAuthorityRole,
  SearchAuthorityRoleSchema,
} from '../../schemas/SearchEngine.schema';
import { ResolveSearchAuthorityRank } from './ResolveSearchAuthorityRank';

const FILTER_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'SEARCH_INDEX_AUTHORITY_FILTER',
);

const FILTER_APPLIED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'SEARCH_INDEX_RBAC_FILTERED',
);

const INVALID_ACTOR_ROLE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'SEARCH_RBAC_INVALID_ACTOR_ROLE',
);

/** Si el actor posee un rol no reconocido, se degrada al mínimo absoluto (-1). */
const FAIL_CLOSED_ACTOR_RANK_NUMERIC = -1;

/** Si una entidad indexada declara un requisito corrupto, exige rango inalcanzable (1000). */
const FAIL_CLOSED_REQUIRED_RANK_NUMERIC = 1000;

/**
 * Filtra jerárquicamente las entidades del índice garantizando acceso estricto por rango RBAC.
 *
 * @param indexCollection - Colección inmutable de entidades candidatas del índice de búsqueda.
 * @param actorRoleLiteral - Nivel de autoridad institucional del usuario que consulta.
 * @returns {ISearchableEntity[]} Colección autorizada lista para ser procesada por Fuse.js.
 * @throws {ValidationException} Si `actorRoleLiteral` incumple el contrato `SearchAuthorityRoleSchema`.
 */
export const FilterSearchIndexByAuthority = (
  indexCollection: readonly ISearchableEntity[],
  actorRoleLiteral: SearchAuthorityRole,
): ISearchableEntity[] => {
  const correlationIdentifier = GenerateCorrelationIdentifier();
  const roleValidationResult = SearchAuthorityRoleSchema.safeParse(actorRoleLiteral);

  if (!roleValidationResult.success) {
    const validationIssuesCollection = roleValidationResult.error.flatten();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: FILTER_MODULE_IDENTIFIER,
      operationCodeLiteral: INVALID_ACTOR_ROLE_OPERATION_CODE,
      correlationIdentifier,
      messageContentLiteral:
        'Filtrado de búsqueda bloqueado: el rol del solicitante incumple el contrato RBAC.',
      semanticIntentTag: 'SECURITY_SEARCH_RBAC_VIOLATION',
      contextMetadataSnapshot: Object.freeze({ validationIssuesCollection }),
    });

    const validationException = new ValidationException('SEARCH_ACTOR_AUTHORITY_ROLE_INVALID', {
      validationIssuesCollection,
      correlationIdentifier,
    });

    ReportForensicException(validationException, correlationIdentifier);
    throw validationException;
  }

  const validatedActorRoleLiteral = roleValidationResult.data;
  const actorAuthorityRankNumeric = ResolveSearchAuthorityRank(
    validatedActorRoleLiteral,
    FAIL_CLOSED_ACTOR_RANK_NUMERIC,
  );

  const authorizedEntitiesCollection = indexCollection.filter((entitySnapshot): boolean => {
    const requiredAuthorityRankNumeric = ResolveSearchAuthorityRank(
      entitySnapshot.requiredAuthorityRole,
      FAIL_CLOSED_REQUIRED_RANK_NUMERIC,
    );

    return actorAuthorityRankNumeric >= requiredAuthorityRankNumeric;
  });

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'DEBUG',
    moduleIdentifierLiteral: FILTER_MODULE_IDENTIFIER,
    operationCodeLiteral: FILTER_APPLIED_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: 'Filtrado perimetral RBAC aplicado sobre el índice de búsqueda.',
    semanticIntentTag: 'SEARCH_RBAC_INDEX_FILTERED',
    contextMetadataSnapshot: Object.freeze({
      actorAuthorityRoleLiteral: validatedActorRoleLiteral,
      totalIndexEntriesQuantity: indexCollection.length,
      authorizedEntriesQuantity: authorizedEntitiesCollection.length,
    }),
  });

  return authorizedEntitiesCollection;
};
