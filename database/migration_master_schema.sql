-- ====================================================================================
-- @section Database Architecture - Master Relational Ledger Schema
-- @description Infraestructura física completa para el ecosistema Floripa Dignidade.
-- Implementa tablas inmutables (Ledgers), partición lógica, índices de alto
-- rendimiento y seguridad a nivel de fila (Row Level Security - RLS).
--
-- Protocolo OEDP-V18.1 - High Performance SRE & Cloud-Sovereign Architecture (ADR 0015).
-- Motor: PostgreSQL 15+ (Supabase Cloud Optimized).
-- SANEADO Zenith: Erradicación del truncamiento en direct_messages_ledger, incorporación
-- del ledger financiero e inyección de políticas de seguridad perimetral RLS.
--
-- @author Raz Podestá - MetaShark Tech
-- @license UNLICENSED
-- ====================================================================================

-- ------------------------------------------------------------------------------------
-- ⚙️ EXTENSIONES SOBERANAS
-- ------------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------------
-- 📡 DOMINIO 1: TELEMETRÍA Y SISTEMA NERVIOSO (Append-Only Ledger)
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_telemetry_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    severity_level VARCHAR(20) NOT NULL,
    module_identifier VARCHAR(100) NOT NULL,
    operation_code VARCHAR(100) NOT NULL,
    correlation_id UUID NOT NULL,
    message TEXT NOT NULL,
    execution_latency_in_milliseconds FLOAT,
    context_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_correlation ON public.system_telemetry_logs(correlation_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_severity ON public.system_telemetry_logs(severity_level);
CREATE INDEX IF NOT EXISTS idx_telemetry_created_at ON public.system_telemetry_logs(created_at DESC);

ALTER TABLE public.system_telemetry_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------------
-- 📧 DOMINIO 2: NEWSLETTER & COMUNICACIÓN INSTITUCIONAL
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    subscriber_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_address VARCHAR(255) UNIQUE NOT NULL,
    verification_token VARCHAR(100) NOT NULL,
    preferred_locale VARCHAR(10) DEFAULT 'pt-BR',
    status VARCHAR(50) DEFAULT 'PENDING_VERIFICATION',
    correlation_id UUID NOT NULL,
    activation_correlation_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_newsletter_token ON public.newsletter_subscribers(verification_token);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers(email_address);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------------
-- ⚖️ DOMINIO 3: IDENTIDAD CIUDADANA Y REPUTACIÓN BAYESIANA
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.citizen_identities_ledger (
    citizen_id UUID PRIMARY KEY, -- Sincronizado con auth.users si se usa Supabase Auth
    trust_weight_score FLOAT DEFAULT 0.1,
    is_verified_human BOOLEAN DEFAULT FALSE,
    assigned_authority_role VARCHAR(50) DEFAULT 'CITIZEN_REGISTERED',
    last_authority_sync_at TIMESTAMPTZ,
    sync_correlation_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_citizen_trust_score ON public.citizen_identities_ledger(trust_weight_score DESC);

ALTER TABLE public.citizen_identities_ledger ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------------
-- 🤝 DOMINIO 4: MOTOR DE INTERACCIÓN (Termómetro Popular)
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_interaction_ledger (
    interaction_id UUID PRIMARY KEY,
    target_entity_id UUID NOT NULL,
    evaluator_identity_id UUID, -- Null para interacciones anónimas
    interaction_polarity NUMERIC NOT NULL,
    semantic_emoticon_intention VARCHAR(50),
    evaluator_public_alias VARCHAR(100),
    evaluator_avatar_url TEXT,
    territorial_context VARCHAR(100) DEFAULT 'FLORIANÓPOLIS_GLOBAL',
    occurrence_timestamp_iso TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interaction_target_entity ON public.social_interaction_ledger(target_entity_id);
CREATE INDEX IF NOT EXISTS idx_interaction_evaluator ON public.social_interaction_ledger(evaluator_identity_id);

ALTER TABLE public.social_interaction_ledger ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------------
-- 🗺️ DOMINIO 5: MOTOR TERRITORIAL (IBGE Sync)
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.territorial_master_data (
    ibge_id VARCHAR(50) PRIMARY KEY, -- Funciona también para IDs hash 'FD-XXXX'
    name_literal VARCHAR(255) NOT NULL,
    hierarchy_level VARCHAR(50) DEFAULT 'DISTRICT',
    metadata_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb, -- Almacena ContentHash para Sentry
    last_seen_at TIMESTAMPTZ,
    last_sync_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_territorial_name ON public.territorial_master_data(name_literal);

ALTER TABLE public.territorial_master_data ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------------
-- 📲 DOMINIO 6: PRESENCIA COGNITIVA Y HARDWARE (PWA Push)
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_presence_ledger (
    citizen_id UUID PRIMARY KEY REFERENCES public.citizen_identities_ledger(citizen_id) ON DELETE CASCADE,
    availability_status VARCHAR(50) DEFAULT 'OFFLINE',
    custom_status_text VARCHAR(100),
    platform_type VARCHAR(50),
    push_token TEXT,
    correlation_id UUID,
    last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_presence_status ON public.user_presence_ledger(availability_status);
CREATE INDEX IF NOT EXISTS idx_presence_heartbeat ON public.user_presence_ledger(last_heartbeat_at DESC);

ALTER TABLE public.user_presence_ledger ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------------
-- 📬 DOMINIO 7: BUZÓN DE NOTIFICACIONES INSTITUCIONALES
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_notifications_ledger (
    notification_id UUID PRIMARY KEY,
    recipient_id VARCHAR(50) NOT NULL, -- UUID ciudadano o 'GLOBAL_BROADCAST'
    priority_level VARCHAR(50) NOT NULL,
    category_tag VARCHAR(50) NOT NULL,
    headline_text VARCHAR(255) NOT NULL,
    body_content TEXT NOT NULL,
    action_route VARCHAR(255),
    interaction_status VARCHAR(50) DEFAULT 'DELIVERED_UNREAD',
    correlation_id UUID NOT NULL,
    mutation_correlation_id UUID,
    dispatched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.system_notifications_ledger(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.system_notifications_ledger(interaction_status);

ALTER TABLE public.system_notifications_ledger ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------------
-- 👥 DOMINIO 8: GRUPOS DE COMUNICACIÓN (Action Hubs) & MEMBRESÍAS
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.communication_groups_ledger (
    group_id UUID PRIMARY KEY,
    display_name VARCHAR(150) NOT NULL,
    slug_identifier VARCHAR(100) UNIQUE NOT NULL,
    description_text TEXT,
    owner_org_id UUID,
    territory_id VARCHAR(50),
    governance_model VARCHAR(50) NOT NULL,
    visibility_mode VARCHAR(50) NOT NULL,
    creator_id UUID NOT NULL,
    correlation_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.group_memberships_ledger (
    membership_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.communication_groups_ledger(group_id) ON DELETE CASCADE,
    citizen_id UUID NOT NULL,
    membership_status VARCHAR(50) DEFAULT 'ACTIVE',
    delegated_mandatary_id UUID, -- Democracia Líquida
    last_action_correlation_id UUID NOT NULL,
    delegation_correlation_id UUID,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(group_id, citizen_id) -- Regla Upsert: 1 Membresía por ciudadano/grupo
);

CREATE INDEX IF NOT EXISTS idx_group_memberships_lookup ON public.group_memberships_ledger(group_id, citizen_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_citizen ON public.group_memberships_ledger(citizen_id);

ALTER TABLE public.communication_groups_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships_ledger ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------------
-- ✉️ DOMINIO 9: MENSAJERÍA DIRECTA P2P (Threads & Evidencia Forense)
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.direct_messages_ledger (
    message_id UUID PRIMARY KEY,
    thread_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    recipient_id UUID NOT NULL,
    content_type VARCHAR(50) NOT NULL DEFAULT 'STANDARD_TEXT',
    body_text TEXT NOT NULL,
    attachments_array UUID[] DEFAULT ARRAY[]::UUID[],
    is_sensitive BOOLEAN NOT NULL DEFAULT TRUE,
    current_status VARCHAR(50) NOT NULL DEFAULT 'SENT_TO_SERVER',
    dispatched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    correlation_id UUID NOT NULL,
    mutation_correlation_id UUID
);

CREATE INDEX IF NOT EXISTS idx_direct_messages_thread ON public.direct_messages_ledger(thread_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON public.direct_messages_ledger(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient ON public.direct_messages_ledger(recipient_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_status ON public.direct_messages_ledger(current_status);

ALTER TABLE public.direct_messages_ledger ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------------
-- 💰 DOMINIO 10: LEDGER FINANCIERO Y PRESUPUESTO INSTITUCIONAL (XLSX Ingestion)
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_financial_ledger (
    ledger_entry_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_name_literal VARCHAR(255) NOT NULL,
    project_name_literal VARCHAR(255) NOT NULL,
    specification_category_literal VARCHAR(255) NOT NULL,
    reference_month_year_literal VARCHAR(50) NOT NULL,
    allocated_amount_numeric NUMERIC(15, 2) NOT NULL,
    correlation_id UUID NOT NULL,
    last_ingestion_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_name_literal, project_name_literal, specification_category_literal, reference_month_year_literal)
);

CREATE INDEX IF NOT EXISTS idx_financial_ledger_project ON public.project_financial_ledger(project_name_literal);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_period ON public.project_financial_ledger(reference_month_year_literal);

ALTER TABLE public.project_financial_ledger ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------------
-- 🛡️ POLÍTICAS DE SEGURIDAD DE FILA (Row Level Security - RLS)
-- ------------------------------------------------------------------------------------

-- 1. Políticas de Telemetría (Append-Only para auditoría)
CREATE POLICY "Telemetry_Insert_Public" ON public.system_telemetry_logs
    FOR INSERT TO authenticated, anon
    WITH CHECK (TRUE);

CREATE POLICY "Telemetry_Select_Audit_Only" ON public.system_telemetry_logs
    FOR SELECT TO authenticated
    USING (auth.jwt() ->> 'assignedAuthorityRoleLiteral' = 'INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR');

-- 2. Políticas de Presencia
CREATE POLICY "Presence_Select_Authenticated" ON public.user_presence_ledger
    FOR SELECT TO authenticated
    USING (TRUE);

CREATE POLICY "Presence_Upsert_Self_Only" ON public.user_presence_ledger
    FOR ALL TO authenticated
    USING (citizen_id = auth.uid())
    WITH CHECK (citizen_id = auth.uid());

-- 3. Políticas de Mensajería Directa (Privacidad Total)
CREATE POLICY "Direct_Messages_Select_Participants_Only" ON public.direct_messages_ledger
    FOR SELECT TO authenticated
    USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Direct_Messages_Insert_Sender_Only" ON public.direct_messages_ledger
    FOR INSERT TO authenticated
    WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Direct_Messages_Update_Participants_Only" ON public.direct_messages_ledger
    FOR UPDATE TO authenticated
    USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- 4. Políticas de Notificaciones del Sistema
CREATE POLICY "Notifications_Select_Recipient_Only" ON public.system_notifications_ledger
    FOR SELECT TO authenticated
    USING (recipient_id = auth.uid()::text OR recipient_id = 'GLOBAL_BROADCAST');

CREATE POLICY "Notifications_Update_Recipient_Only" ON public.system_notifications_ledger
    FOR UPDATE TO authenticated
    USING (recipient_id = auth.uid()::text);

-- 5. Políticas de Ledger Financiero y Territorial (Transparencia Pública)
CREATE POLICY "Financial_Ledger_Select_Public" ON public.project_financial_ledger
    FOR SELECT TO authenticated, anon
    USING (TRUE);

CREATE POLICY "Territorial_Data_Select_Public" ON public.territorial_master_data
    FOR SELECT TO authenticated, anon
    USING (TRUE);

CREATE POLICY "Interactions_Select_Public" ON public.social_interaction_ledger
    FOR SELECT TO authenticated, anon
    USING (TRUE);

CREATE POLICY "Interactions_Insert_Permitted" ON public.social_interaction_ledger
    FOR INSERT TO authenticated, anon
    WITH CHECK (TRUE);

-- 6. Políticas de Newsletter (Inscripción Pública)
CREATE POLICY "Newsletter_Insert_Public" ON public.newsletter_subscribers
    FOR INSERT TO authenticated, anon
    WITH CHECK (TRUE);

CREATE POLICY "Newsletter_Select_Self" ON public.newsletter_subscribers
    FOR SELECT TO authenticated
    USING (email_address = auth.jwt() ->> 'email');
