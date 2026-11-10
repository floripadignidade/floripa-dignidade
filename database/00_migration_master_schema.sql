-- ====================================================================================
-- @section 01_IDENTITY: Core Citizen Identities & Trust Ledger
-- @description Cimiento fundamental de la identidad ciudadana y gobernanza institucional.
-- Esta tabla establece el registro relacional inmutable que vincula roles RBAC,
-- reputación bayesiana, consentimiento LGPD y estados de validación documental.
--
-- Protocolo OEDP-V18.1 - High Performance SRE & Cloud-Primary Architecture.
-- Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 27001 (Seguridad) y LGPD (Lei 13.709/18).
--
-- @author Raz Podestá - MetaShark Tech
-- @license UNLICENSED
-- ====================================================================================

-- ------------------------------------------------------------------------------------
-- ⚙️ EXTENSIONES DE INFRAESTRUCTURA
-- ------------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------------
-- ⚖️ TABLA MAESTRA: LEDGER DE IDENTIDADES CIUDADANAS
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.citizen_identities_ledger (
    -- Identificador único universal (Sincronizado con auth.users de Supabase / CitizenIdentifier)
    citizen_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Nombre legal purificado bajo estándares de privacidad (Opcional en registro preliminar)
    full_legal_name_literal VARCHAR(255),

    -- Dirección electrónica institucional (Indexada para verificación unívoca)
    email_address_literal VARCHAR(255) UNIQUE,

    -- Coeficiente bayesiano de confianza ponderada (Rango: 0.1 a 1.0)
    trust_weight_score FLOAT NOT NULL DEFAULT 0.1,

    -- Estado de la validación legal humana (Auditoría Documental / gov.br)
    is_verified_human BOOLEAN NOT NULL DEFAULT FALSE,

    -- Rol institucional (RBAC) - Sincronizado estrictamente con IDENTITY_ACCESS_ROLES_COLLECTION
    assigned_authority_role VARCHAR(100) NOT NULL DEFAULT 'IDENTITY_REGISTERED',

    -- Marca temporal de la última sincronización de autoridad ejecutada por el motor
    last_authority_sync_at TIMESTAMPTZ,

    -- Identificador de seguimiento para la cadena de custodia y trazabilidad forense
    sync_correlation_id UUID,

    -- Metadatos temporales de auditoría y ciclo de vida
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_mutation_timestamp_iso TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------------
-- 🚀 ÍNDICES DE ALTO RENDIMIENTO (SRE & Query Optimization)
-- ------------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_citizen_email_lookup 
    ON public.citizen_identities_ledger(email_address_literal);

CREATE INDEX IF NOT EXISTS idx_citizen_trust_weight_score_desc 
    ON public.citizen_identities_ledger(trust_weight_score DESC);

CREATE INDEX IF NOT EXISTS idx_citizen_assigned_authority_role 
    ON public.citizen_identities_ledger(assigned_authority_role);

CREATE INDEX IF NOT EXISTS idx_citizen_sync_correlation_id 
    ON public.citizen_identities_ledger(sync_correlation_id);

-- ------------------------------------------------------------------------------------
-- 🛡️ POLÍTICAS DE SEGURIDAD PERIMETRAL (Row Level Security - RLS)
-- ------------------------------------------------------------------------------------
ALTER TABLE public.citizen_identities_ledger ENABLE ROW LEVEL SECURITY;

-- 1. Acceso de Auditoría Administrativa (Control Total SRE & Kernel)
CREATE POLICY "Administrative_Auditor_Full_Access" 
    ON public.citizen_identities_ledger
    FOR ALL
    TO authenticated
    USING (
        auth.jwt() ->> 'assignedAuthorityRoleLiteral' = 'INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR'
    )
    WITH CHECK (
        auth.jwt() ->> 'assignedAuthorityRoleLiteral' = 'INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR'
    );

-- 2. Lectura Ciudadana Soberana (Privacidad Estricta - Solo su propio registro)
CREATE POLICY "Citizen_Self_Read_Access" 
    ON public.citizen_identities_ledger
    FOR SELECT
    TO authenticated
    USING (
        citizen_id = auth.uid()
    );

-- 3. Actualización de Datos Propios (Mutación Restringida)
CREATE POLICY "Citizen_Self_Update_Access" 
    ON public.citizen_identities_ledger
    FOR UPDATE
    TO authenticated
    USING (
        citizen_id = auth.uid()
    )
    WITH CHECK (
        citizen_id = auth.uid()
    );

-- 4. Inserción Inicial por Delegación (Permitida para creación de cuenta)
CREATE POLICY "Citizen_Initial_Registration_Insert" 
    ON public.citizen_identities_ledger
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (
        citizen_id = auth.uid() OR auth.uid() IS NULL
    );

-- ------------------------------------------------------------------------------------
-- 🔄 PROCEDIMIENTOS ALMACENADOS & TRIGGERS DE HIGIENE TEMPORAL
-- ------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_update_citizen_mutation_timestamp()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    NEW.last_mutation_timestamp_iso = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_citizen_identity_update_timestamp ON public.citizen_identities_ledger;

CREATE TRIGGER trg_citizen_identity_update_timestamp
    BEFORE UPDATE ON public.citizen_identities_ledger
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_update_citizen_mutation_timestamp();