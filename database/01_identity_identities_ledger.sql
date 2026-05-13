-- ====================================================================================
-- @section 01_IDENTITY: Sovereign Citizen Identities & Trust Ledger
-- @description Cimiento fundamental de la soberanía ciudadana.
-- Esta tabla establece la identidad inmutable que vincula roles, reputación
-- y estados de validación documental antes de cualquier interacción social.
--
-- Protocolo OEDP-V17.0 - High Performance & Cloud Sovereign Ledger.
-- ====================================================================================

CREATE TABLE IF NOT EXISTS public.citizen_identities_ledger (
    -- Identificador único nominal (Branded Type: CitizenIdentifier)
    citizen_identifier UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Nombre legal purificado (ISO 11179)
    full_legal_name_literal VARCHAR(255) NOT NULL,

    -- Dirección electrónica principal (Indexado para búsqueda rápida)
    email_address_literal VARCHAR(255) UNIQUE NOT NULL,

    -- Coeficiente bayesiano de confianza (0.1 a 1.0)
    trust_weight_score_numeric FLOAT DEFAULT 0.1,

    -- Estado de la auditoría documental humana
    is_identity_legally_verified_boolean BOOLEAN DEFAULT FALSE,

    -- Rol institucional (RBAC) - Sincronizado con 'UserAccessRoleSchema'
    assigned_authority_role_literal VARCHAR(100) DEFAULT 'CITIZEN_REGISTERED',

    -- Metadatos de auditoría forense y trazabilidad
    created_at_timestamp_iso TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_mutation_timestamp_iso TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de Alta Performance (SRE Optimization)
CREATE INDEX IF NOT EXISTS idx_citizen_email ON public.citizen_identities_ledger(email_address_literal);
CREATE INDEX IF NOT EXISTS idx_citizen_trust_score ON public.citizen_identities_ledger(trust_weight_score_numeric DESC);

-- Gobernanza RLS (Row Level Security)
ALTER TABLE public.citizen_identities_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sovereign_Auditor_Full_Access" ON public.citizen_identities_ledger
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'assignedAuthorityRoleLiteral' = 'INFRASTRUCTURE_SOVEREIGN_AUDITOR');

CREATE POLICY "Citizen_Self_Read" ON public.citizen_identities_ledger
    FOR SELECT
    TO authenticated
    USING (citizen_identifier = auth.uid());

-- Triggers de Auditoría (Higiene de Datos)
CREATE OR REPLACE FUNCTION public.fn_update_mutation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_mutation_timestamp_iso = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_identity_update_timestamp
    BEFORE UPDATE ON public.citizen_identities_ledger
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_update_mutation_timestamp();
