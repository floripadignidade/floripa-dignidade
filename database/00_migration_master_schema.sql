-- ====================================================================================
-- @file database/00_migration_master_schema.sql
-- @section 00_INFRASTRUCTURE & 01_IDENTITY: Migration Control & Citizen Identities Ledger
-- @description Cimiento relacional maestro del ecosistema Floripa Dignidade para
-- PostgreSQL 17 (Supabase). Provisiona de forma 100% idempotente las extensiones en el
-- esquema gestionado, la tabla de control de migraciones únicas con checksum SHA-256,
-- el ledger de identidades ciudadanas optimizado en espacio (alineación de tuplas e
-- índices parciales), privilegios granulares por columna y políticas RLS Fail-Closed.
--
-- Protocolo OEDP-V18.1 - Cloud-Primary Architecture (ADR 0015 / ADR 0031).
-- Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 27001 y LGPD (Lei 13.709/2018).
--
-- @author Raz Podestá - MetaShark Tech
-- @license UNLICENSED
-- ====================================================================================

-- ------------------------------------------------------------------------------------
-- 1. EXTENSIONES DE INFRAESTRUCTURA (Esquema gestionado por Supabase)
-- ------------------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS extensions;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- ------------------------------------------------------------------------------------
-- 2. CONTROL IDEMPOTENTE DE MIGRACIONES ÚNICAS
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ecosystem_schema_migrations (
    checksum_sha256_literal CHAR(64) NOT NULL,
    execution_duration_ms INTEGER NOT NULL DEFAULT 0
        CONSTRAINT chk_migration_duration_non_negative CHECK (execution_duration_ms >= 0),
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    migration_filename_literal VARCHAR(255) PRIMARY KEY
);

REVOKE ALL ON public.ecosystem_schema_migrations FROM anon, authenticated;

ALTER TABLE public.ecosystem_schema_migrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Administrative_Auditor_Read_Migrations"
    ON public.ecosystem_schema_migrations;

CREATE POLICY "Administrative_Auditor_Read_Migrations"
    ON public.ecosystem_schema_migrations
    FOR SELECT
    TO authenticated
    USING (
        ((SELECT auth.jwt()) ->> 'assignedAuthorityRoleLiteral') =
        'INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR'
    );

-- ------------------------------------------------------------------------------------
-- 3. TABLA MAESTRA: LEDGER DE IDENTIDADES CIUDADANAS (Alineación física optimizada)
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.citizen_identities_ledger (
    -- Bloque 16B / 8B (sin padding interno innecesario)
    citizen_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_correlation_id UUID,
    trust_weight_score DOUBLE PRECISION NOT NULL DEFAULT 0.1
        CONSTRAINT chk_citizen_trust_weight_range CHECK (
            trust_weight_score >= 0.1 AND trust_weight_score <= 1.0
        ),
    last_authority_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_mutation_timestamp_iso TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Bloque 1B
    is_verified_human BOOLEAN NOT NULL DEFAULT FALSE,

    -- Bloque variable (sin índice duplicado: UNIQUE ya crea B-Tree sobre email_address_literal)
    assigned_authority_role VARCHAR(64) NOT NULL DEFAULT 'IDENTITY_REGISTERED'
        CONSTRAINT chk_citizen_authority_role_valid CHECK (
            assigned_authority_role IN (
                'INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR',
                'PLATFORM_GLOBAL_MANAGER',
                'ORGANIZATION_ADMINISTRATOR',
                'ORGANIZATION_OPERATOR',
                'IDENTITY_REGISTERED',
                'IDENTITY_ANONYMOUS'
            )
        ),
    full_legal_name_literal VARCHAR(255),
    email_address_literal VARCHAR(255)
        CONSTRAINT uq_citizen_email_address UNIQUE
);

-- ------------------------------------------------------------------------------------
-- 4. ÍNDICES DE RENDIMIENTO Y AHORRO DE ESPACIO
-- ------------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_citizen_trust_weight_score_desc
    ON public.citizen_identities_ledger(trust_weight_score DESC);

CREATE INDEX IF NOT EXISTS idx_citizen_assigned_authority_role
    ON public.citizen_identities_ledger(assigned_authority_role);

CREATE INDEX IF NOT EXISTS idx_citizen_sync_correlation_id
    ON public.citizen_identities_ledger(sync_correlation_id)
    WHERE sync_correlation_id IS NOT NULL;

-- ------------------------------------------------------------------------------------
-- 5. PRIVILEGIOS GRANULARES Y ROW LEVEL SECURITY (RLS) FAIL-CLOSED
-- ------------------------------------------------------------------------------------
REVOKE ALL ON public.citizen_identities_ledger FROM anon, authenticated;

GRANT SELECT, INSERT ON public.citizen_identities_ledger TO authenticated;
GRANT UPDATE (full_legal_name_literal, email_address_literal)
    ON public.citizen_identities_ledger TO authenticated;

ALTER TABLE public.citizen_identities_ledger ENABLE ROW LEVEL SECURITY;

-- 5.1. Control completo exclusivo para Auditores Administrativos de Infraestructura
DROP POLICY IF EXISTS "Administrative_Auditor_Full_Access"
    ON public.citizen_identities_ledger;

CREATE POLICY "Administrative_Auditor_Full_Access"
    ON public.citizen_identities_ledger
    FOR ALL
    TO authenticated
    USING (
        ((SELECT auth.jwt()) ->> 'assignedAuthorityRoleLiteral') =
        'INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR'
    )
    WITH CHECK (
        ((SELECT auth.jwt()) ->> 'assignedAuthorityRoleLiteral') =
        'INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR'
    );

-- 5.2. Lectura restringida al propio ciudadano autenticado
DROP POLICY IF EXISTS "Citizen_Self_Read_Access"
    ON public.citizen_identities_ledger;

CREATE POLICY "Citizen_Self_Read_Access"
    ON public.citizen_identities_ledger
    FOR SELECT
    TO authenticated
    USING (
        citizen_id = (SELECT auth.uid())
    );

-- 5.3. Mutación restringida al propio ciudadano (columnas autorizadas por GRANT UPDATE)
DROP POLICY IF EXISTS "Citizen_Self_Update_Access"
    ON public.citizen_identities_ledger;

CREATE POLICY "Citizen_Self_Update_Access"
    ON public.citizen_identities_ledger
    FOR UPDATE
    TO authenticated
    USING (
        citizen_id = (SELECT auth.uid())
    )
    WITH CHECK (
        citizen_id = (SELECT auth.uid())
    );

-- 5.4. Registro inicial autenticado sin auto-escalamiento de rol ni confianza
DROP POLICY IF EXISTS "Citizen_Initial_Registration_Insert"
    ON public.citizen_identities_ledger;

CREATE POLICY "Citizen_Initial_Registration_Insert"
    ON public.citizen_identities_ledger
    FOR INSERT
    TO authenticated
    WITH CHECK (
        citizen_id = (SELECT auth.uid())
        AND assigned_authority_role = 'IDENTITY_REGISTERED'
        AND is_verified_human = FALSE
        AND trust_weight_score = 0.1
    );

-- ------------------------------------------------------------------------------------
-- 6. FUNCIÓN Y DISPARADOR DE HIGIENE TEMPORAL (SECURITY INVOKER)
-- ------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_update_citizen_mutation_timestamp()
RETURNS TRIGGER
SECURITY INVOKER
SET search_path = public, pg_catalog
LANGUAGE plpgsql AS $$
BEGIN
    NEW.last_mutation_timestamp_iso := NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_citizen_identity_update_timestamp
    ON public.citizen_identities_ledger;

CREATE TRIGGER trg_citizen_identity_update_timestamp
    BEFORE UPDATE ON public.citizen_identities_ledger
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_update_citizen_mutation_timestamp();
