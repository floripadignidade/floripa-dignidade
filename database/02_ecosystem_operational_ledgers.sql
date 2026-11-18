-- ====================================================================================
-- @file database/02_ecosystem_operational_ledgers.sql
-- @section 02_OPERATIONAL_LEDGERS: Ecosystem Operational Tables, Indexes, RLS & Storage
-- @description Provisionamiento idempotente de los 9 ledgers operacionales del
-- ecosistema Floripa Dignidade y endurecimiento de cuota/MIME del bucket `media-vault`
-- para PostgreSQL 17 (Supabase). Optimizado para ahorro de espacio (alineación de
-- tuplas, índices parciales y eliminación de índices redundantes) y seguridad RLS.
--
-- Protocolo OEDP-V18.1 - Cloud-Primary Architecture (ADR 0015 / ADR 0025).
-- Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 27001 y LGPD (Lei 13.709/2018).
--
-- @author Raz Podestá - MetaShark Tech
-- @license UNLICENSED
-- ====================================================================================

-- ------------------------------------------------------------------------------------
-- 1. NEWSLETTER SUBSCRIBERS (Double Opt-In)
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_token UUID NOT NULL
        CONSTRAINT uq_newsletter_verification_token UNIQUE,
    correlation_id UUID NOT NULL,
    activation_correlation_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    preferred_locale VARCHAR(16) NOT NULL DEFAULT 'pt-BR',
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_VERIFICATION'
        CONSTRAINT chk_newsletter_status_valid CHECK (
            status IN ('PENDING_VERIFICATION', 'ACTIVE', 'UNSUBSCRIBED')
        ),
    is_active_boolean BOOLEAN GENERATED ALWAYS AS (status = 'ACTIVE') STORED,
    email_address VARCHAR(255) NOT NULL
        CONSTRAINT uq_newsletter_email_address UNIQUE
);

REVOKE ALL ON public.newsletter_subscribers FROM anon, authenticated;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Administrative_Auditor_Full_Access_Newsletter"
    ON public.newsletter_subscribers;

CREATE POLICY "Administrative_Auditor_Full_Access_Newsletter"
    ON public.newsletter_subscribers
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

-- ------------------------------------------------------------------------------------
-- 2. SYSTEM TELEMETRY LOGS (Cadena Merkle + SRE Observability)
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_telemetry_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "correlationIdentifier" UUID NOT NULL,
    "occurrenceTimestampISO" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "executionLatencyInMillisecondsQuantity" DOUBLE PRECISION
        CONSTRAINT chk_telemetry_latency_non_negative CHECK (
            "executionLatencyInMillisecondsQuantity" IS NULL OR
            "executionLatencyInMillisecondsQuantity" >= 0
        ),
    "isEncryptedPayloadBoolean" BOOLEAN NOT NULL DEFAULT FALSE,
    "severityLevelLiteral" VARCHAR(16) NOT NULL
        CONSTRAINT chk_telemetry_severity_valid CHECK (
            "severityLevelLiteral" IN ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL')
        ),
    "previousEventHashFingerprint" CHAR(64),
    "contentHashFingerprint" CHAR(64),
    "encryptionInitializationVectorLiteral" VARCHAR(64),
    "moduleIdentifierLiteral" VARCHAR(128) NOT NULL,
    "operationCodeLiteral" VARCHAR(128) NOT NULL,
    "semanticIntentTag" VARCHAR(128),
    "messageContentLiteral" TEXT NOT NULL,
    "contextMetadataSnapshot" JSONB
);

CREATE INDEX IF NOT EXISTS idx_telemetry_occurrence_desc
    ON public.system_telemetry_logs("occurrenceTimestampISO" DESC);

CREATE INDEX IF NOT EXISTS idx_telemetry_correlation
    ON public.system_telemetry_logs("correlationIdentifier");

CREATE INDEX IF NOT EXISTS idx_telemetry_critical_errors
    ON public.system_telemetry_logs("occurrenceTimestampISO" DESC)
    WHERE "severityLevelLiteral" IN ('ERROR', 'CRITICAL');

REVOKE ALL ON public.system_telemetry_logs FROM anon, authenticated;
ALTER TABLE public.system_telemetry_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Administrative_Auditor_Full_Access_Telemetry"
    ON public.system_telemetry_logs;

CREATE POLICY "Administrative_Auditor_Full_Access_Telemetry"
    ON public.system_telemetry_logs
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

-- ------------------------------------------------------------------------------------
-- 3. SYSTEM NOTIFICATIONS LEDGER
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_notifications_ledger (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correlation_id UUID NOT NULL,
    mutation_correlation_id UUID,
    dispatched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    recipient_id VARCHAR(128) NOT NULL,
    priority_level VARCHAR(32) NOT NULL
        CONSTRAINT chk_notification_priority_valid CHECK (
            priority_level IN (
                'ROUTINE_INFO',
                'MODERATE_WARNING',
                'CRITICAL_ALERT',
                'EMERGENCY_BROADCAST'
            )
        ),
    category_tag VARCHAR(64) NOT NULL
        CONSTRAINT chk_notification_category_valid CHECK (
            category_tag IN (
                'HUMAN_RIGHTS_UPDATE',
                'TERRITORIAL_ALERT',
                'INSTITUTIONAL_MESSAGE',
                'SYSTEM_MAINTENANCE'
            )
        ),
    interaction_status VARCHAR(32) NOT NULL DEFAULT 'DELIVERED_UNREAD'
        CONSTRAINT chk_notification_status_valid CHECK (
            interaction_status IN (
                'DELIVERED_UNREAD',
                'ACKNOWLEDGED_READ',
                'ARCHIVED_SILENT',
                'TRASHED_DELETED'
            )
        ),
    headline_text VARCHAR(120) NOT NULL,
    action_route VARCHAR(255),
    body_content TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_dispatched
    ON public.system_notifications_ledger(recipient_id, dispatched_at DESC)
    WHERE interaction_status <> 'TRASHED_DELETED';

CREATE INDEX IF NOT EXISTS idx_notifications_unread_count
    ON public.system_notifications_ledger(recipient_id)
    WHERE interaction_status = 'DELIVERED_UNREAD';

REVOKE ALL ON public.system_notifications_ledger FROM anon, authenticated;
GRANT SELECT ON public.system_notifications_ledger TO authenticated;
GRANT UPDATE (interaction_status, acknowledged_at)
    ON public.system_notifications_ledger TO authenticated;

ALTER TABLE public.system_notifications_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Administrative_Auditor_Full_Access_Notifications"
    ON public.system_notifications_ledger;

CREATE POLICY "Administrative_Auditor_Full_Access_Notifications"
    ON public.system_notifications_ledger
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

DROP POLICY IF EXISTS "Citizen_Read_Own_Or_Global_Notifications"
    ON public.system_notifications_ledger;

CREATE POLICY "Citizen_Read_Own_Or_Global_Notifications"
    ON public.system_notifications_ledger
    FOR SELECT
    TO authenticated
    USING (
        recipient_id = (SELECT auth.uid())::TEXT OR recipient_id = 'GLOBAL_BROADCAST'
    );

DROP POLICY IF EXISTS "Citizen_Acknowledge_Own_Notifications"
    ON public.system_notifications_ledger;

CREATE POLICY "Citizen_Acknowledge_Own_Notifications"
    ON public.system_notifications_ledger
    FOR UPDATE
    TO authenticated
    USING (
        recipient_id = (SELECT auth.uid())::TEXT
    )
    WITH CHECK (
        recipient_id = (SELECT auth.uid())::TEXT
    );

-- ------------------------------------------------------------------------------------
-- 4. DIRECT MESSAGES LEDGER
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.direct_messages_ledger (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    recipient_id UUID NOT NULL,
    correlation_id UUID NOT NULL,
    mutation_correlation_id UUID,
    dispatched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_sensitive BOOLEAN NOT NULL DEFAULT TRUE,
    content_type VARCHAR(32) NOT NULL DEFAULT 'STANDARD_TEXT'
        CONSTRAINT chk_dm_content_type_valid CHECK (
            content_type IN ('STANDARD_TEXT', 'RICH_MEDIA_DOCUMENT', 'SYSTEM_ACTION_CARD')
        ),
    current_status VARCHAR(32) NOT NULL DEFAULT 'SENT_TO_SERVER'
        CONSTRAINT chk_dm_status_valid CHECK (
            current_status IN (
                'SENT_TO_SERVER',
                'DELIVERED_TO_DEVICE',
                'READ_BY_RECIPIENT',
                'ARCHIVED_BY_USER',
                'TRASHED_DELETED'
            )
        ),
    attachments_array UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
    body_text TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dm_sender_dispatched
    ON public.direct_messages_ledger(sender_id, dispatched_at DESC)
    WHERE current_status <> 'TRASHED_DELETED';

CREATE INDEX IF NOT EXISTS idx_dm_recipient_dispatched
    ON public.direct_messages_ledger(recipient_id, dispatched_at DESC)
    WHERE current_status <> 'TRASHED_DELETED';

CREATE INDEX IF NOT EXISTS idx_dm_thread_dispatched
    ON public.direct_messages_ledger(thread_id, dispatched_at DESC);

REVOKE ALL ON public.direct_messages_ledger FROM anon, authenticated;
GRANT SELECT ON public.direct_messages_ledger TO authenticated;

ALTER TABLE public.direct_messages_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Administrative_Auditor_Full_Access_Direct_Messages"
    ON public.direct_messages_ledger;

CREATE POLICY "Administrative_Auditor_Full_Access_Direct_Messages"
    ON public.direct_messages_ledger
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

DROP POLICY IF EXISTS "Citizen_Read_Own_Direct_Messages"
    ON public.direct_messages_ledger;

CREATE POLICY "Citizen_Read_Own_Direct_Messages"
    ON public.direct_messages_ledger
    FOR SELECT
    TO authenticated
    USING (
        sender_id = (SELECT auth.uid()) OR recipient_id = (SELECT auth.uid())
    );

-- ------------------------------------------------------------------------------------
-- 5. USER PRESENCE LEDGER
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_presence_ledger (
    citizen_id UUID PRIMARY KEY,
    correlation_id UUID NOT NULL,
    last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    availability_status VARCHAR(24) NOT NULL DEFAULT 'OFFLINE'
        CONSTRAINT chk_presence_availability_valid CHECK (
            availability_status IN ('ONLINE', 'AWAY', 'DO_NOT_DISTURB', 'OFFLINE')
        ),
    platform_type VARCHAR(32)
        CONSTRAINT chk_presence_platform_valid CHECK (
            platform_type IS NULL OR platform_type IN (
                'WEB_DESKTOP',
                'PWA_MOBILE_ANDROID',
                'PWA_MOBILE_APPLE',
                'NATIVE_TABLET'
            )
        ),
    custom_status_text VARCHAR(60),
    push_token TEXT
);

CREATE INDEX IF NOT EXISTS idx_presence_active_push_token
    ON public.user_presence_ledger(citizen_id)
    WHERE push_token IS NOT NULL;

REVOKE ALL ON public.user_presence_ledger FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_presence_ledger TO authenticated;

ALTER TABLE public.user_presence_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Administrative_Auditor_Full_Access_Presence"
    ON public.user_presence_ledger;

CREATE POLICY "Administrative_Auditor_Full_Access_Presence"
    ON public.user_presence_ledger
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

DROP POLICY IF EXISTS "Citizen_Self_Presence_Manage"
    ON public.user_presence_ledger;

CREATE POLICY "Citizen_Self_Presence_Manage"
    ON public.user_presence_ledger
    FOR ALL
    TO authenticated
    USING (
        citizen_id = (SELECT auth.uid())
    )
    WITH CHECK (
        citizen_id = (SELECT auth.uid())
    );

-- ------------------------------------------------------------------------------------
-- 6. COMMUNICATION GROUPS LEDGER
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.communication_groups_ledger (
    group_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_org_id UUID NOT NULL,
    creator_id UUID NOT NULL,
    correlation_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    governance_model VARCHAR(32) NOT NULL DEFAULT 'MODERATED_DIALOGUE'
        CONSTRAINT chk_group_governance_valid CHECK (
            governance_model IN ('BROADCAST_ONLY', 'MODERATED_DIALOGUE', 'OPEN_COLLABORATION')
        ),
    visibility_mode VARCHAR(32) NOT NULL DEFAULT 'VERIFIED_ONLY'
        CONSTRAINT chk_group_visibility_valid CHECK (
            visibility_mode IN (
                'PUBLIC_TRANSPARENCY',
                'VERIFIED_ONLY',
                'INSTITUTIONAL_PRIVATE'
            )
        ),
    operational_status VARCHAR(24) NOT NULL DEFAULT 'ACTIVE'
        CONSTRAINT chk_group_status_valid CHECK (
            operational_status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED')
        ),
    territory_id VARCHAR(32),
    display_name VARCHAR(120) NOT NULL,
    slug_identifier VARCHAR(128) NOT NULL
        CONSTRAINT uq_communication_groups_slug UNIQUE,
    description_text VARCHAR(500) NOT NULL DEFAULT '',
    participation_stats_json JSONB NOT NULL DEFAULT '{}'::JSONB
);

CREATE INDEX IF NOT EXISTS idx_groups_owner_org_status
    ON public.communication_groups_ledger(owner_org_id, operational_status);

CREATE INDEX IF NOT EXISTS idx_groups_public_active
    ON public.communication_groups_ledger(visibility_mode, created_at DESC)
    WHERE operational_status = 'ACTIVE';

REVOKE ALL ON public.communication_groups_ledger FROM anon, authenticated;
GRANT SELECT ON public.communication_groups_ledger TO anon, authenticated;

ALTER TABLE public.communication_groups_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Administrative_Auditor_Full_Access_Groups"
    ON public.communication_groups_ledger;

CREATE POLICY "Administrative_Auditor_Full_Access_Groups"
    ON public.communication_groups_ledger
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

DROP POLICY IF EXISTS "Public_Transparency_Groups_Read"
    ON public.communication_groups_ledger;

CREATE POLICY "Public_Transparency_Groups_Read"
    ON public.communication_groups_ledger
    FOR SELECT
    TO anon, authenticated
    USING (
        visibility_mode = 'PUBLIC_TRANSPARENCY' AND operational_status = 'ACTIVE'
    );

DROP POLICY IF EXISTS "Authenticated_Verified_Groups_Read"
    ON public.communication_groups_ledger;

CREATE POLICY "Authenticated_Verified_Groups_Read"
    ON public.communication_groups_ledger
    FOR SELECT
    TO authenticated
    USING (
        visibility_mode IN ('PUBLIC_TRANSPARENCY', 'VERIFIED_ONLY')
        AND operational_status = 'ACTIVE'
    );

-- ------------------------------------------------------------------------------------
-- 7. GROUP MEMBERSHIPS LEDGER (PK compuesta para Upsert idempotente)
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.group_memberships_ledger (
    citizen_id UUID NOT NULL,
    group_id UUID NOT NULL
        CONSTRAINT fk_membership_communication_group
            REFERENCES public.communication_groups_ledger(group_id)
            ON DELETE CASCADE,
    delegated_mandatary_id UUID,
    last_action_correlation_id UUID,
    delegation_correlation_id UUID,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    membership_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE'
        CONSTRAINT chk_membership_status_valid CHECK (
            membership_status IN (
                'ACTIVE',
                'PAUSED',
                'LEFT_INACTIVE',
                'BANNED_BY_MODERATION',
                'REPRESENTED'
            )
        ),
    CONSTRAINT pk_group_memberships_ledger PRIMARY KEY (citizen_id, group_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_group_status
    ON public.group_memberships_ledger(group_id, membership_status);

REVOKE ALL ON public.group_memberships_ledger FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.group_memberships_ledger TO authenticated;

ALTER TABLE public.group_memberships_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Administrative_Auditor_Full_Access_Memberships"
    ON public.group_memberships_ledger;

CREATE POLICY "Administrative_Auditor_Full_Access_Memberships"
    ON public.group_memberships_ledger
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

DROP POLICY IF EXISTS "Citizen_Self_Membership_Manage"
    ON public.group_memberships_ledger;

CREATE POLICY "Citizen_Self_Membership_Manage"
    ON public.group_memberships_ledger
    FOR ALL
    TO authenticated
    USING (
        citizen_id = (SELECT auth.uid())
    )
    WITH CHECK (
        citizen_id = (SELECT auth.uid())
        AND membership_status IN ('ACTIVE', 'PAUSED', 'LEFT_INACTIVE', 'REPRESENTED')
    );

-- ------------------------------------------------------------------------------------
-- 8. TERRITORIAL MASTER DATA (Malla geográfica abierta IBGE)
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.territorial_master_data (
    last_sync_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ibge_id VARCHAR(32) PRIMARY KEY,
    hierarchy_level VARCHAR(24) NOT NULL
        CONSTRAINT chk_territorial_hierarchy_valid CHECK (
            hierarchy_level IN ('MUNICIPALITY', 'DISTRICT', 'NEIGHBORHOOD')
        ),
    name_literal VARCHAR(160) NOT NULL,
    metadata_snapshot JSONB NOT NULL DEFAULT '{}'::JSONB
);

CREATE INDEX IF NOT EXISTS idx_territorial_hierarchy_name
    ON public.territorial_master_data(hierarchy_level, name_literal);

REVOKE ALL ON public.territorial_master_data FROM anon, authenticated;
GRANT SELECT ON public.territorial_master_data TO anon, authenticated;

ALTER TABLE public.territorial_master_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Administrative_Auditor_Full_Access_Territorial"
    ON public.territorial_master_data;

CREATE POLICY "Administrative_Auditor_Full_Access_Territorial"
    ON public.territorial_master_data
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

DROP POLICY IF EXISTS "Public_Read_Territorial_Master_Data"
    ON public.territorial_master_data;

CREATE POLICY "Public_Read_Territorial_Master_Data"
    ON public.territorial_master_data
    FOR SELECT
    TO anon, authenticated
    USING (TRUE);

-- ------------------------------------------------------------------------------------
-- 9. PROJECT FINANCIAL LEDGER (Transparencia Presupuestaria)
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_financial_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correlation_id UUID NOT NULL,
    last_ingestion_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    allocated_amount_numeric NUMERIC(14, 2) NOT NULL
        CONSTRAINT chk_financial_allocated_amount_non_negative CHECK (
            allocated_amount_numeric >= 0
        ),
    organization_name_literal VARCHAR(180) NOT NULL,
    project_name_literal VARCHAR(180) NOT NULL,
    specification_category_literal VARCHAR(180) NOT NULL,
    reference_month_year_literal VARCHAR(48) NOT NULL,
    CONSTRAINT uq_project_financial_natural_key UNIQUE (
        organization_name_literal,
        project_name_literal,
        specification_category_literal,
        reference_month_year_literal
    )
);

CREATE INDEX IF NOT EXISTS idx_financial_ledger_ingestion_desc
    ON public.project_financial_ledger(last_ingestion_at DESC);

REVOKE ALL ON public.project_financial_ledger FROM anon, authenticated;
GRANT SELECT ON public.project_financial_ledger TO anon, authenticated;

ALTER TABLE public.project_financial_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Administrative_Auditor_Full_Access_Financial_Ledger"
    ON public.project_financial_ledger;

CREATE POLICY "Administrative_Auditor_Full_Access_Financial_Ledger"
    ON public.project_financial_ledger
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

DROP POLICY IF EXISTS "Public_Read_Project_Financial_Ledger"
    ON public.project_financial_ledger;

CREATE POLICY "Public_Read_Project_Financial_Ledger"
    ON public.project_financial_ledger
    FOR SELECT
    TO anon, authenticated
    USING (TRUE);

-- ------------------------------------------------------------------------------------
-- 10. HARDENING DE STORAGE BUCKET `media-vault` (Cuota 15 MiB + Lista Blanca MIME)
-- ------------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'media-vault',
    'media-vault',
    TRUE,
    15728640,
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/avif',
        'application/pdf'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
