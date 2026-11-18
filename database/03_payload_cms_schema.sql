-- ====================================================================================
-- @file database/03_payload_cms_schema.sql
-- @section 03_CMS_SCHEMA: Payload CMS 3.x Relational Tables, Indexes, FKs & RLS Hardening
-- @description Provisionamiento idempotente del esquema relacional de Payload CMS
-- (`citizen_users`, `citizen_users_sessions`, `organizations`, `media_vault`,
-- `payload_kv`, `payload_locked_documents*`, `payload_preferences*`, `payload_migrations`)
-- derivado exactamente del snapshot Drizzle de `apps/content-manager-system`.
-- Incluye endurecimiento de privilegios (`REVOKE ALL FROM anon, authenticated`) y RLS
-- activado por defecto para impedir fugas de hashes/correos mediante la API REST pública
-- de Supabase sin interferir con el acceso administrativo de Payload (`postgres`).
--
-- Protocolo OEDP-V18.1 - Cloud-Primary Architecture (ADR 0015 / ADR 0031).
-- Normas: ISO/IEC 11179, ISO/IEC 27001 y LGPD (Lei 13.709/2018).
--
-- @author Raz Podestá - MetaShark Tech
-- @license UNLICENSED
-- ====================================================================================

-- ------------------------------------------------------------------------------------
-- 1. TIPOS ENUMERADOS DE PAYLOAD CMS (Idempotentes)
-- ------------------------------------------------------------------------------------
DO $$
BEGIN
    CREATE TYPE public.enum_citizen_users_assigned_authority_role_literal AS ENUM (
        'INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR',
        'PLATFORM_GLOBAL_MANAGER',
        'ORGANIZATION_ADMINISTRATOR',
        'ORGANIZATION_OPERATOR',
        'IDENTITY_REGISTERED',
        'IDENTITY_ANONYMOUS'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE public.enum_organizations_operational_status_literal AS ENUM (
        'ACTIVE',
        'SUSPENDED',
        'ARCHIVED'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ------------------------------------------------------------------------------------
-- 2. TABLAS DE COLECCIONES CMS
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
    id SERIAL PRIMARY KEY NOT NULL,
    institutional_name_literal VARCHAR NOT NULL,
    legal_identification_literal VARCHAR NOT NULL,
    institutional_slug_literal VARCHAR NOT NULL,
    primary_brand_color_hex VARCHAR DEFAULT '#003366',
    secondary_brand_color_hex VARCHAR DEFAULT '#F5A623',
    institutional_logo_identifier_id INTEGER,
    is_root_organization_boolean BOOLEAN DEFAULT FALSE,
    operational_status_literal public.enum_organizations_operational_status_literal
        DEFAULT 'ACTIVE' NOT NULL,
    updated_at TIMESTAMPTZ(3) DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ(3) DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.citizen_users (
    id SERIAL PRIMARY KEY NOT NULL,
    full_legal_name_literal VARCHAR NOT NULL,
    assigned_authority_role_literal public.enum_citizen_users_assigned_authority_role_literal
        DEFAULT 'IDENTITY_REGISTERED' NOT NULL,
    tenant_organization_identifier_id INTEGER,
    forensic_identification_group_is_identity_legally_verified_boolean BOOLEAN DEFAULT FALSE,
    forensic_identification_group_has_accepted_privacy_policy_boolean BOOLEAN DEFAULT FALSE NOT NULL,
    updated_at TIMESTAMPTZ(3) DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ(3) DEFAULT NOW() NOT NULL,
    email VARCHAR NOT NULL,
    reset_password_token VARCHAR,
    reset_password_expiration TIMESTAMPTZ(3),
    salt VARCHAR,
    hash VARCHAR,
    reset_password_requested_at TIMESTAMPTZ(3),
    login_attempts NUMERIC DEFAULT 0,
    lock_until TIMESTAMPTZ(3)
);

CREATE TABLE IF NOT EXISTS public.citizen_users_sessions (
    _order INTEGER NOT NULL,
    _parent_id INTEGER NOT NULL,
    id VARCHAR PRIMARY KEY NOT NULL,
    created_at TIMESTAMPTZ(3),
    expires_at TIMESTAMPTZ(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.media_vault (
    id SERIAL PRIMARY KEY NOT NULL,
    alternative_text_literal VARCHAR NOT NULL,
    caption_literal VARCHAR,
    organization_owner_identifier_id INTEGER,
    _objectkey VARCHAR,
    updated_at TIMESTAMPTZ(3) DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ(3) DEFAULT NOW() NOT NULL,
    url VARCHAR,
    thumbnail_u_r_l VARCHAR,
    filename VARCHAR,
    mime_type VARCHAR,
    filesize NUMERIC,
    width NUMERIC,
    height NUMERIC,
    focal_x NUMERIC,
    focal_y NUMERIC,
    sizes_thumbnail_url VARCHAR,
    sizes_thumbnail_width NUMERIC,
    sizes_thumbnail_height NUMERIC,
    sizes_thumbnail_mime_type VARCHAR,
    sizes_thumbnail_filesize NUMERIC,
    sizes_thumbnail_filename VARCHAR,
    sizes_standard_card_url VARCHAR,
    sizes_standard_card_width NUMERIC,
    sizes_standard_card_height NUMERIC,
    sizes_standard_card_mime_type VARCHAR,
    sizes_standard_card_filesize NUMERIC,
    sizes_standard_card_filename VARCHAR,
    sizes_forensic_high_definition_url VARCHAR,
    sizes_forensic_high_definition_width NUMERIC,
    sizes_forensic_high_definition_height NUMERIC,
    sizes_forensic_high_definition_mime_type VARCHAR,
    sizes_forensic_high_definition_filesize NUMERIC,
    sizes_forensic_high_definition_filename VARCHAR
);

-- ------------------------------------------------------------------------------------
-- 3. TABLAS INTERNAS DEL NÚCLEO PAYLOAD CMS
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payload_kv (
    id SERIAL PRIMARY KEY NOT NULL,
    key VARCHAR NOT NULL,
    data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payload_locked_documents (
    id SERIAL PRIMARY KEY NOT NULL,
    global_slug VARCHAR,
    updated_at TIMESTAMPTZ(3) DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ(3) DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payload_locked_documents_rels (
    id SERIAL PRIMARY KEY NOT NULL,
    "order" INTEGER,
    parent_id INTEGER NOT NULL,
    path VARCHAR NOT NULL,
    citizen_users_id INTEGER,
    organizations_id INTEGER,
    media_vault_id INTEGER
);

CREATE TABLE IF NOT EXISTS public.payload_preferences (
    id SERIAL PRIMARY KEY NOT NULL,
    key VARCHAR,
    value JSONB,
    updated_at TIMESTAMPTZ(3) DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ(3) DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payload_preferences_rels (
    id SERIAL PRIMARY KEY NOT NULL,
    "order" INTEGER,
    parent_id INTEGER NOT NULL,
    path VARCHAR NOT NULL,
    citizen_users_id INTEGER
);

CREATE TABLE IF NOT EXISTS public.payload_migrations (
    id SERIAL PRIMARY KEY NOT NULL,
    name VARCHAR,
    batch NUMERIC,
    updated_at TIMESTAMPTZ(3) DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ(3) DEFAULT NOW() NOT NULL
);

-- ------------------------------------------------------------------------------------
-- 4. LLAVES FORÁNEAS (Idempotentes)
-- ------------------------------------------------------------------------------------
DO $$
BEGIN
    ALTER TABLE public.citizen_users_sessions
        ADD CONSTRAINT citizen_users_sessions_parent_id_fk
        FOREIGN KEY (_parent_id) REFERENCES public.citizen_users(id)
        ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.citizen_users
        ADD CONSTRAINT citizen_users_tenant_organization_identifier_id_organizations_id_fk
        FOREIGN KEY (tenant_organization_identifier_id) REFERENCES public.organizations(id)
        ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.organizations
        ADD CONSTRAINT organizations_institutional_logo_identifier_id_media_vault_id_fk
        FOREIGN KEY (institutional_logo_identifier_id) REFERENCES public.media_vault(id)
        ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.media_vault
        ADD CONSTRAINT media_vault_organization_owner_identifier_id_organizations_id_fk
        FOREIGN KEY (organization_owner_identifier_id) REFERENCES public.organizations(id)
        ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.payload_locked_documents_rels
        ADD CONSTRAINT payload_locked_documents_rels_parent_fk
        FOREIGN KEY (parent_id) REFERENCES public.payload_locked_documents(id)
        ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.payload_locked_documents_rels
        ADD CONSTRAINT payload_locked_documents_rels_citizen_users_fk
        FOREIGN KEY (citizen_users_id) REFERENCES public.citizen_users(id)
        ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.payload_locked_documents_rels
        ADD CONSTRAINT payload_locked_documents_rels_organizations_fk
        FOREIGN KEY (organizations_id) REFERENCES public.organizations(id)
        ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.payload_locked_documents_rels
        ADD CONSTRAINT payload_locked_documents_rels_media_vault_fk
        FOREIGN KEY (media_vault_id) REFERENCES public.media_vault(id)
        ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.payload_preferences_rels
        ADD CONSTRAINT payload_preferences_rels_parent_fk
        FOREIGN KEY (parent_id) REFERENCES public.payload_preferences(id)
        ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.payload_preferences_rels
        ADD CONSTRAINT payload_preferences_rels_citizen_users_fk
        FOREIGN KEY (citizen_users_id) REFERENCES public.citizen_users(id)
        ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ------------------------------------------------------------------------------------
-- 5. ÍNDICES B-TREE Y UNICIDAD
-- ------------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS citizen_users_sessions_order_idx
    ON public.citizen_users_sessions USING BTREE (_order);
CREATE INDEX IF NOT EXISTS citizen_users_sessions_parent_id_idx
    ON public.citizen_users_sessions USING BTREE (_parent_id);

CREATE INDEX IF NOT EXISTS citizen_users_tenant_organization_identifier_idx
    ON public.citizen_users USING BTREE (tenant_organization_identifier_id);
CREATE INDEX IF NOT EXISTS citizen_users_updated_at_idx
    ON public.citizen_users USING BTREE (updated_at);
CREATE INDEX IF NOT EXISTS citizen_users_created_at_idx
    ON public.citizen_users USING BTREE (created_at);
CREATE UNIQUE INDEX IF NOT EXISTS citizen_users_email_idx
    ON public.citizen_users USING BTREE (email);

CREATE UNIQUE INDEX IF NOT EXISTS organizations_legal_identification_literal_idx
    ON public.organizations USING BTREE (legal_identification_literal);
CREATE UNIQUE INDEX IF NOT EXISTS organizations_institutional_slug_literal_idx
    ON public.organizations USING BTREE (institutional_slug_literal);
CREATE INDEX IF NOT EXISTS organizations_institutional_logo_identifier_idx
    ON public.organizations USING BTREE (institutional_logo_identifier_id);
CREATE INDEX IF NOT EXISTS organizations_updated_at_idx
    ON public.organizations USING BTREE (updated_at);
CREATE INDEX IF NOT EXISTS organizations_created_at_idx
    ON public.organizations USING BTREE (created_at);

CREATE INDEX IF NOT EXISTS media_vault_organization_owner_identifier_idx
    ON public.media_vault USING BTREE (organization_owner_identifier_id);
CREATE INDEX IF NOT EXISTS media_vault_updated_at_idx
    ON public.media_vault USING BTREE (updated_at);
CREATE INDEX IF NOT EXISTS media_vault_created_at_idx
    ON public.media_vault USING BTREE (created_at);
CREATE UNIQUE INDEX IF NOT EXISTS media_vault_filename_idx
    ON public.media_vault USING BTREE (filename);
CREATE INDEX IF NOT EXISTS media_vault_sizes_thumbnail_sizes_thumbnail_filename_idx
    ON public.media_vault USING BTREE (sizes_thumbnail_filename);
CREATE INDEX IF NOT EXISTS media_vault_sizes_standard_card_sizes_standard_card_file_idx
    ON public.media_vault USING BTREE (sizes_standard_card_filename);
CREATE INDEX IF NOT EXISTS media_vault_sizes_forensic_high_definition_sizes_forensi_idx
    ON public.media_vault USING BTREE (sizes_forensic_high_definition_filename);

CREATE UNIQUE INDEX IF NOT EXISTS payload_kv_key_idx
    ON public.payload_kv USING BTREE (key);

CREATE INDEX IF NOT EXISTS payload_locked_documents_global_slug_idx
    ON public.payload_locked_documents USING BTREE (global_slug);
CREATE INDEX IF NOT EXISTS payload_locked_documents_updated_at_idx
    ON public.payload_locked_documents USING BTREE (updated_at);
CREATE INDEX IF NOT EXISTS payload_locked_documents_created_at_idx
    ON public.payload_locked_documents USING BTREE (created_at);

CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_order_idx
    ON public.payload_locked_documents_rels USING BTREE ("order");
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_parent_idx
    ON public.payload_locked_documents_rels USING BTREE (parent_id);
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_path_idx
    ON public.payload_locked_documents_rels USING BTREE (path);
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_citizen_users_id_idx
    ON public.payload_locked_documents_rels USING BTREE (citizen_users_id);
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_organizations_id_idx
    ON public.payload_locked_documents_rels USING BTREE (organizations_id);
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_media_vault_id_idx
    ON public.payload_locked_documents_rels USING BTREE (media_vault_id);

CREATE INDEX IF NOT EXISTS payload_preferences_key_idx
    ON public.payload_preferences USING BTREE (key);
CREATE INDEX IF NOT EXISTS payload_preferences_updated_at_idx
    ON public.payload_preferences USING BTREE (updated_at);
CREATE INDEX IF NOT EXISTS payload_preferences_created_at_idx
    ON public.payload_preferences USING BTREE (created_at);

CREATE INDEX IF NOT EXISTS payload_preferences_rels_order_idx
    ON public.payload_preferences_rels USING BTREE ("order");
CREATE INDEX IF NOT EXISTS payload_preferences_rels_parent_idx
    ON public.payload_preferences_rels USING BTREE (parent_id);
CREATE INDEX IF NOT EXISTS payload_preferences_rels_path_idx
    ON public.payload_preferences_rels USING BTREE (path);
CREATE INDEX IF NOT EXISTS payload_preferences_rels_citizen_users_id_idx
    ON public.payload_preferences_rels USING BTREE (citizen_users_id);

CREATE INDEX IF NOT EXISTS payload_migrations_updated_at_idx
    ON public.payload_migrations USING BTREE (updated_at);
CREATE INDEX IF NOT EXISTS payload_migrations_created_at_idx
    ON public.payload_migrations USING BTREE (created_at);

-- ------------------------------------------------------------------------------------
-- 6. BLINDAJE POSTGREST (REVOKE + RLS FAIL-CLOSED SIN BLOQUEAR AL ROL POSTGRES DE PAYLOAD)
-- ------------------------------------------------------------------------------------
REVOKE ALL ON public.organizations FROM anon, authenticated;
REVOKE ALL ON public.citizen_users FROM anon, authenticated;
REVOKE ALL ON public.citizen_users_sessions FROM anon, authenticated;
REVOKE ALL ON public.media_vault FROM anon, authenticated;
REVOKE ALL ON public.payload_kv FROM anon, authenticated;
REVOKE ALL ON public.payload_locked_documents FROM anon, authenticated;
REVOKE ALL ON public.payload_locked_documents_rels FROM anon, authenticated;
REVOKE ALL ON public.payload_preferences FROM anon, authenticated;
REVOKE ALL ON public.payload_preferences_rels FROM anon, authenticated;
REVOKE ALL ON public.payload_migrations FROM anon, authenticated;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_users_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payload_kv ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payload_locked_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payload_locked_documents_rels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payload_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payload_preferences_rels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payload_migrations ENABLE ROW LEVEL SECURITY;
