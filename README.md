⚖️ Floripa Dignidade — Ecossistema Digital de Resposta Social e Auditoria Cívica
Plataforma soberana de alta performance para defesa dos Direitos Humanos, auditoria fiscal de recursos públicos e garantia da dignidade humana em Florianópolis/SC.

![Imagen](https://img.shields.io/badge/Orchestrator-Nx%20Monorepo%20v22-blue?logo=nx)
![Imagen](https://img.shields.io/badge/Frontend-Next.js%2016%20%7C%20App%20Router-black?logo=next.js)
![Imagen](https://img.shields.io/badge/UI-React%2019-61dafb?logo=react)
![Imagen](https://img.shields.io/badge/Language-TypeScript%205.9%20Strict-blue?logo=typescript)
![Imagen](https://img.shields.io/badge/CMS-Payload%203.84%20GA-black?logo=payloadcms)
![Imagen](https://img.shields.io/badge/SSOT-Zod%20Sovereign%20Contracts-3e67b1?logo=zod)
![Imagen](https://img.shields.io/badge/Styles-Tailwind%20CSS%203.4-38bdf8?logo=tailwindcss)
![Imagen](https://img.shields.io/badge/Security-LGPD%20%28Lei%2013.709%2F18%29-green)
![Imagen](https://img.shields.io/badge/License-GPLv3-blue.svg)

📌 1. Resumo Executivo & Visão Estratégica
O Floripa Dignidade não é apenas um portal de notícias ou um CMS institucional. É uma Infraestrutura Digital de Resposta Social e Inteligência Territorial, projetada para operar como um ecossistema de missão crítica descentralizado, resiliente e auditável.
A plataforma surge para preencher uma lacuna histórica na gestão pública e na fiscalização cidadã em Florianópolis e Santa Catarina, estabelecendo canais protegidos de denúncia, auditoria automatizada de contratos e dados abertos, e análise preditiva do impacto social de políticas públicas voltadas a populações vulneráveis (como os serviços de acolhimento na Passarela da Cidadania).

`text
          ┌─────────────────────────────────────────────────────────────┐
          │                   FLORIPA DIGNIDADE                         │
          │     "A tecnologia a serviço incondicional da dignidade"     │
          └─────────────────────────────────────────────────────────────┘
                                         │
         ┌───────────────────────────────┼──────────────────────────────┐
         ▼                               ▼                              ▼
  🏛️ TRANSPARÊNCIA RADICAL       🛡️ PROTEÇÃO AO CIDADÃO       📊 EVIDÊNCIA FORENSE
  Cruzamento de contas públicas    Canais seguros via WhatsApp   Matemática bayesiana,
  e dados abertos do município.    e denúncias anônimas (LGPD).  cadeia Merkle e grafos.

`

🎯 A Dor que Solucionamos
Opacidade e Assimetria Fiscal: Contratos milionários e termos de colaboração entre a administração pública e entidades parceiras frequentemente carecem de auditoria cidadã compreensível, granular e em tempo real.
Vulnerabilidade e Medo de Retaliação: Vítimas de violações de direitos humanos hesitam em denunciar devido ao receio de perseguição, rastreamento indevido de dados pessoais e perfilamento facial invasivo.
Desinformação e Ataques de Bots: Enquetes públicas e termômetros sociais convencionais sofrem manipulação massiva de bots e campanhas de difamação coordenada.
Dependência de Soluções Proprietárias Caras: Plataformas que exigem planos de infraestrutura onerosos para processamento de mapas, mensagens e bancos locais tornam-se inviáveis para organizações da sociedade civil (OSCs).

🏗️ 2. Arquitetura do Sistema: O "Sistema Lego" & Doutrina Zenith
O ecossistema adota a Arquitetura Modular Desacoplada (Zenith Reference Architecture / OEDP-V18.1) sobre um monorepo gerenciado por Nx e pnpm.
As aplicações em apps/ funcionam apenas como cascas de montagem (Shells) de baixíssima espessura lógica. 100% da regra de negócio, dos contratos estruturais, da inteligência estatística e dos componentes de interface residem em bibliotecas isoladas (libs/).

🧱 Topologia do Monorepo
`Bash
floripa-dignidade/
├── apps/                                  # Cascas de Execução (Shells)
│   ├── floripa-dignidade/                 # Portal do Cidadão (Next.js 16 + React 19)
│   └── content-manager-system/            # Búnker Administrativo (Payload CMS 3.84)
├── libs/                                  # O Sistema Lego (Aparatos Autónomos)
│   ├── contracts/                         # SSOT Global: Esquemas Zod Puros (.readonly)
│   ├── core/                              # Fundações e Cimentos Invariantes
│   │   ├── telemetry/                     # Sistema Nervoso (Merkle Chain, Web Workers)
│   │   ├── exceptions/                    # Gramática Padronizada de Erros ISO
│   │   ├── environment-validator/         # Alfândega Única de Hardware (process.env)
│   │   ├── routing/                       # Orquestrador de Borda, i18n & RBAC
│   │   └── communication-providers/resend/# Driver de E-mail Transacional
│   ├── engines/                           # Motores Lógicos Agnósticos
│   │   ├── adversarial-simulation-engine/ # Red Team Automatizado (Fuzzing, SQLi/XSS)
│   │   ├── financial-ingestion-engine/    # Extrator Contextual de Planilhas XLSX
│   │   ├── health-analysis/               # Neural Sentinel (SLMs / Hugging Face)
│   │   ├── health-monitor/                # Sondas SRE de Pulso Vital
│   │   ├── impact-analytics-engine/       # Termômetro Popular Bayesiano
│   │   ├── pmf-open-data-engine/          # Ingestão de Contas Públicas de Florianópolis
│   │   └── search-engine/                 # Busca Difusa Instantânea com RBAC
│   ├── modules/                           # Domínios de Negócio do Ecossistema
│   │   ├── identity/                      # Gestão de Autoridade e Acesso Multi-tenant
│   │   ├── interaction-engine/            # Apoios Populares e Reações Otimistas
│   │   ├── messaging-engine/              # PWA Web Push, Presença e Caixa Unificada
│   │   ├── newsletter/                    # Motor Double Opt-In
│   │   ├── reputation-engine/             # Auditoria de Veracidade de Depoimentos
│   │   ├── territorial-engine/            # Malha Geográfica Integrada ao IBGE
│   │   └── whatsapp/communication-service/# Receptor Criptográfico de Webhooks Meta
│   └── shared/                            # Fundição Visual e Utilidades
│       ├── design-system/                 # Tokens Visuais e Paleta Cromática
│       ├── ui-contracts/                  # Blueprints de UI e Contratos WAI-ARIA
│       ├── ui-foundry/                    # Componentes Físicos de Interface (React 19)
│       ├── state-store/                   # Centro de Memória Reativa (Zustand 5)
│       └── utility/                       # Mascaramento PII (LGPD), S3 e Estilos
├── database/                              # Migrações e Esquemas de Persistência SQL
├── tools/                                 # Compiladores de i18n e Ferramentas CLI
└── .docs/                                 # Manifiestos de Engenharia e ADRs
`

🔄 3. Diagramas de Fluxo e Engenharia
A. Grafo de Dependências e Limites Modulares (Nx Boundaries)
`Mermaid
graph TD
    subgraph Applications [Apps: Carcaças de Montagem]
        PORTAL[apps/floripa-dignidade]
        CMS[apps/content-manager-system]
    end

    subgraph BusinessModules [Libs: Módulos de Domínio]
        MOD_ID[modules/identity]
        MOD_MSG[modules/messaging-engine]
        MOD_NEWS[modules/newsletter]
        MOD_WA[modules/whatsapp]
        MOD_REP[modules/reputation-engine]
        MOD_INT[modules/interaction-engine]
        MOD_TERR[modules/territorial-engine]
    end

    subgraph EnginesLayer [Libs: Motores Analíticos e Cognitivos]
        ENG_IMP[engines/impact-analytics]
        ENG_FIN[engines/financial-ingestion]
        ENG_PMF[engines/pmf-open-data]
        ENG_SRCH[engines/search-engine]
        ENG_ADV[engines/adversarial-simulation]
        ENG_AI[engines/health-analysis]
        ENG_MON[engines/health-monitor]
    end

    subgraph SharedLayer [Libs: Fundição Visual e Estado]
        SH_FOUNDRY[shared/ui-foundry]
        SH_STORE[shared/state-store]
        SH_UTIL[shared/utility]
        SH_TOKENS[shared/design-system]
        SH_PLANS[shared/ui-contracts]
    end

    subgraph CoreFoundations [Libs: Cimentos Invariantes]
        CORE_TEL[core/telemetry]
        CORE_EXC[core/exceptions]
        CORE_ENV[core/environment-validator]
        CORE_ROUT[core/routing]
        CORE_RESEND[core/communication-providers/resend]
    end

    subgraph SSOT [Libs: Contratos Puros]
        CONTRACTS[libs/contracts]
    end

    PORTAL --> BusinessModules
    PORTAL --> SharedLayer
    CMS --> BusinessModules
    CMS --> SharedLayer

    BusinessModules --> EnginesLayer
    BusinessModules --> SharedLayer
    BusinessModules --> CoreFoundations
    BusinessModules --> CONTRACTS

    EnginesLayer --> CoreFoundations
    EnginesLayer --> CONTRACTS

    SharedLayer --> CoreFoundations
    SharedLayer --> CONTRACTS

    CoreFoundations --> CONTRACTS
`

B. Ciclo de Vida da Denúncia e Rastro Forense (WhatsApp ao Ledger)
`Mermaid
sequenceDiagram
    autonumber
    actor Cidadao as Cidadão Vulnerável
    participant Meta as Meta WhatsApp Gateway
    participant Edge as Edge Webhook (/api/whatsapp)
    participant Sec as ValidateMetaSignature (HMAC-SHA256)
    participant Mask as MaskSovereignIdentity (LGPD)
    participant Brain as HealthAnalysisEngine (Hugging Face)
    participant Vault as MultimediaVault (Supabase S3)
    participant Ledger as Supabase Cloud Ledger
    participant Sentinel as Telemetry (Merkle Tree)

    Cidadao->>Meta: Envia relato com foto e localização
    Meta->>Edge: POST Webhook (X-Hub-Signature-256)
    Edge->>Sec: Valida assinatura com tempo constante
    Note over Sec: Proteção contra Timing Attacks
    Sec-->>Edge: Assinatura Verificada (200 OK)
    
    Edge->>Mask: Anonimiza telefone civil (Ex: +5548****89)
    Edge->>Vault: Envia binário de foto/áudio criptografado
    Vault-->>Edge: Retorna URL segura e Hash SHA-256
    
    Edge->>Brain: Avalia intenção e urgência humanitária
    Brain-->>Edge: Classificação: VIOLAÇÃO_GRAVE (Score: 0.94)
    
    Edge->>Ledger: Registra denúncia no human_rights_ledger
    Edge->>Sentinel: Emite sinal com Merkle Hash & Snapshot Forense
    Sentinel-->>Sentinel: Encaneia log inalterável no Worker
`

🌟 4. Matriz Funcional Completa (Dores e Soluções)
1. Observatório de Gastos Públicos e Auditoria Fiscal Cidadã
A Dor: Desvio de finalidade, compras superfaturadas e falta de clareza nas contas públicas do município de Florianópolis e do governo estadual.
A Solução: Módulo analítico integrado à API da E-Pública e portais de transparência municipais. Normaliza dados orçamentários brutos, gera séries temporais de execução de despesas por secretaria e identifica discrepâncias em contratos de assistência social.
Recursos:
Classificação ontológica por unidade gestora, credor (CNPJ) e categoria funcional.
Tabela forense interativa com busca, filtros e selos cognitivos de anomalia.
Exportação de relatórios em CSV/JSON assinados digitalmente.

2. Canal de Denúncia Cívica Protegida via WhatsApp
A Dor: Falta de acesso a canais formais da ouvidoria por parte da população em situação de rua ou de bairros periféricos; medo de identificação e retaliação.
A Solução: Gateway oficial para WhatsApp Business com suporte para textos, áudios, imagens e localização geográfica aproximada.
Recursos:
Validação criptográfica de ponta a ponta (HMAC-SHA256 em tempo constante).
Mascaramento isomórfico imediato de identificadores telefônicos (ApplyBrazilianDocumentMask e MaskSensitivePhoneIdentifier).
Triagem automática de urgência humanitária (expulsão, fome extrema, violência policial).

3. Termômetro Popular e Análise de Impacto Bayesiano (Anti-Bot)
A Dor: Opinião pública manipulada por fazendas de cliques, bots anônimos e ataques coordenados de desinformação.
A Solução: Algoritmo estatístico fundamentado no Teorema de Bayes (CalculateWeightedBayesianScore.ts).
Recursos:
Ponderação de autoridade: o parecer de uma identidade validada documentalmente possui peso significativamente maior do que interações anônimas, sem excluir o sentimento popular.
Cálculo de intervalo de certeza estatística e índice de consenso/polarização comunitária.
Detecção de anomalias sociais cruzando volume financeiro gasto vs. índice de aprovação no bairro afetado.

4. Inteligência Territorial e Registro Multidimensional Soberano
A Dor: Custos proibitivos de APIs de mapas privadas (Google Maps/Mapbox) e falta de correlação entre denúncias e divisões distritais oficiais.
A Solução: Motor geográfico soberano alimentado diretamente pela API de Localidades e Malhas Censitárias abertas do IBGE.
Recursos:
Sincronização automatizada de todos os distritos e bairros de Florianópolis (Tapera, Centro, Ingleses, Monte Cristo, etc.).
Normalização toponímica rigorosa (SanitizeTerritoryName).
Indexação de impactos e geração de mapas de calor sem custos recorrentes de licença.

5. Gestão de Identidade, Reputação Cívica e Democracia Líquida
A Dor: Burocracia na identificação civil e impossibilidade de representação técnica em decisões comunitárias.
A Solução: Sistema IAM (Identity & Access Management) com suporte a RBAC em múltiplos níveis e delegação de autoridade.
Recursos:
Tipagem nominal (Branded Types) para identificadores cívicos (CitizenIdentifier, OrganizationIdentifier).
Democracia Líquida: Mecanismo que permite ao cidadão delegar seu peso de voto a um mandatário técnico de sua confiança para temas específicos nos Action Hubs.
Cálculo dinâmico de autoridade e bonificação por senioridade ética e verificação civil.

6. Mensageria Unificada, Presença Cognitiva e Notificações Web Push (PWA)
A Dor: Dependência de SMS pagos ou e-mails que caem no spam em situações emergenciais; falta de sincronização entre dispositivos.
A Solução: Núcleo de comunicação P2P e broadcasting institucional com tolerância a falhas.

Recursos:
Notificações nativas via Web Push API diretamente no navegador do celular (PWA), com zero custo por mensagem enviada.
Unified Inbox: Mapeadores polimórficos que agrupam alertas do sistema e mensagens diretas em uma linha do tempo única.
Sensor de presença em hardware (usePresenceSentry) com mecanismo de keep-alive e registro do "Último Suspiro" do cliente.

7. Bóveda Multimídia e Preservação de Provas Forenses
A Dor: Perda ou adulteração de fotos de abusos de direitos humanos e denúncias antes de chegarem aos órgãos competentes (Ministério Público, OAB, Defensoria Pública).
A Solução: Bóveda de arquivos conectada ao protocolo S3 do Supabase Storage.
Recursos:
Otimização automática em tempo de ingestão para formatos WebP e AVIF forense de alta definição.
Extração e armazenamento do Hash SHA-256 do arquivo original para garantir não-repúdio e integridade.
Isolamento multi-tenant por entidade guardiã.

8. Motor de Ingestão de Matrizes Orçamentárias XLSX
A Dor: Prestação de contas entregues em planilhas Excel despadronizadas, com quebras visuais e células mescladas, impossibilitando a leitura por bancos de dados comuns.
A Solução: Extrator contextual baseado em máquina de estados (ExtractWorkbookData.ts).
Recursos:
Identificação de eixos temporais (meses de execução) e cabeçalhos em profundidade.
Associação inteligente entre cargos, profissionais identificados ("✓") e montantes executados em Real (R$).
Sanitização de valores para formato numérico puro e carga direta no Ledger Cloud.

9. Motor de Simulação Adversária (Red Team Automatizado)
A Dor: Vulnerabilidades de injeção e falhas em aduanas Zod que passam despercebidas em testes unitários convencionais.
A Solução: Búnker de testes de penetração lógica em memória (ExecuteAdversarialFuzzing.ts).
Recursos:
Geradores de cargas maliciosas para injeção de SQL (SQLi), Cross-Site Scripting (XSS) e poluição de protótipos.
Emissão de relatórios forenses estruturados no padrão internacional SARIF e adaptadores para Shannon AI atuar em Pull Requests do GitHub.
Execução em tempo de build/CI sem dependência de rede externa.

10. Motor de Busca Instantânea com Proteção Perimetral (RBAC)
A Dor: Buscas lentas no cliente e exposição acidental de relatórios confidenciais para usuários não autenticados.
A Solução: Motor difuso baseado em Fuse.js com aduana de segurança pré-filtro.
Recursos:
Pesquisa com atalho global de teclado (⌘+K / Ctrl+K).
Filtragem por papel: entidades como denúncias sob sigilo são expurgadas da memória de busca antes do algoritmo de correspondência atuar.
Zero latência percebida em conexões móveis 3G/4G.

11. Búnker de Comunicação e Newsletter (Double Opt-In)
A Dor: Formulários vulneráveis a cadastros falsos, spam e infrações da LGPD por ausência de consentimento inequívoco.
A Solução: Pipeline completo de assinatura com verificação por e-mail transacional (Resend).
Recursos:
Geração e validação de tokens UUID criptográficos de ativação.
Persistência em estado transitório (PENDING_VERIFICATION) até o clique do cidadão no link de confirmação.
Interface otimizada com feedback de sucesso, tratamento de erros e tradução tripla.

12. Gestão de Conteúdo Soberana (Payload CMS 3.0 Headless)
A Dor: Sistemas legados de CMS lentos, acoplados a bancos de dados locais e com interfaces difíceis para operadores de campo.
A Solução: Painel administrativo moderno construído nativamente sobre Next.js 16 e Postgres na nuvem.
Recursos:
Coleções tipadas para Cidadãos, Organizações Parceiras e Bóveda de Mídia.
Editor de texto enriquecido Lexical otimizado para acessibilidade e geração de metadados semânticos.
Integração nativa com a infraestrutura S3 de armazenamento.

🛠️ 5. Stack Tecnológico de Ponta
Tecnologia	Categoria	Papel no Ecossistema	Benefício Arquitetural
Nx Monorepo (v22)	Orquestrador	Gerenciamento do Grafo de Dependências e Build	Execução paralela com computação em cache, limites modulares estritos e zero sobrecarga de compilação.
pnpm (v10)	Package Manager	Gestão de Dependências e Symlinks	Instalação ultrarrápida, redução de espaço em disco e isolamento determinista de pacotes.
Next.js 16	Framework Web	Carcaça do Portal Cidadão e API Routes	App Router nativo, Server Actions, compilação via Turbopack e execução isomórfica na borda (Edge).
React 19	Biblioteca UI	Renderização Declarativa de Alta Fidelidade	Suporte nativo a Actions assíncronas, Server Components (RSC) e transições a 120 FPS.
Payload CMS 3.84	Content Engine	Búnker de Gestão Editorial e Coleções	Headless CMS executado dentro do ecossistema Next.js com Local API de latência zero.
TypeScript 5.9	Linguagem	Tipagem Estrita e Modelagem de Domínio	noEmit: true, verbatimModuleSyntax: true e resolução determinista via motor Bundler.
Zod (v3.25)	SSOT & Aduanas	Única Fonte de Verdade Estrutural	Validação rigorosa em runtime, transformações preventivas e tipagem nominal (Branded Types).
Tailwind CSS (v3.4)	Estilização	Design System Atômico e Responsividade	Mobile-First com container queries, tipografia fluida (clamp) e tempo de carregamento mínimo.
Zustand (v5)	State Manager	Memória Reativa e Persistência Volátil	Gerenciamento de estado dividido em Slices, integração com LocalStorage (ADR 0025) e suporte a UI Otimista.
Supabase / Postgres	Persistência	Ledger Transacional e Bóveda S3	Arquitetura 100% Stateless via PostgREST, Row Level Security (RLS) e conformidade Cloud-Sovereign.
Resend	Comunicação	Driver de E-mail Transacional	Entrega resiliente de mensagens de confirmação e alertas críticos de infraestrutura.
Fuse.js (v7)	Busca	Motor de Descoberta Difusa Local	Indexação em memória para busca instantânea com suporte a pesos de relevância e RBAC.
Hugging Face	Inteligência Art.	Neural Sentinel e Auditoria Cognitiva	Ingestão e inferência via Small Language Models (SLMs) para triagem ética de denúncias sem custos proibitivos.

🔒 6. Privacidade, LGPD e Blindagem Criptográfica
O ecossistema Floripa Dignidade foi desenvolvido sob a doutrina Privacy by Design & Zero-Trust Architecture, em rigorosa observância à Lei Geral de Proteção de Dados (Lei 13.709/2018):

`text
[DADO SENSÍVEL BRUTO] ──► [ADUANA ZOD] ──► [ISOMORPHIC PII MASKING] ──► [LOG/TELEMETRIA OPACA]
(CPF: 123.456.789-00)     (Validação)      (***.456.789-**)              (Cadeia de Custódia)
`

Mascaramento Isomórfico de PII:
CPF e CNPJ são sanitizados por ApplyBrazilianDocumentMask antes de qualquer renderização ou persistência pública.
E-mails civis são ofuscados por ApplyElectronicMailMask (ex.: j***o@dominio.com).
Nomes de denunciantes passam por ApplyCitizenNameMask, gerando assinaturas seguras (ex.: "MARIA S.").

Cadeia de Custódia Merkle:
Cada sinal emitido pelo búnker de telemetria gera um hash SHA-256 encadeado com o rastro do evento anterior (previousEventHashFingerprint). Caso um registro do banco de dados seja adulterado ou apagado, a cadeia matemática é quebrada e o Neural Sentinel dispara um alarme crítico.

Criptografia Simétrica de Metadados:
Dados sensíveis residentes na memória local do navegador são cifrados utilizando AES-GCM de 256 bits antes de tocarem o localStorage.

Comparações de Tempo Constante (Constant-Time):
Validações de assinaturas de Webhooks do WhatsApp utilizam crypto.timingSafeEqual, neutralizando qualquer tentativa de ataque de temporização (Timing Attacks).

Doutrina "The Stateless Developer" (ADR 0015):
É estritamente proibido rodar bancos de dados locais em desenvolvimento. Todo o monorepo conecta-se a camadas seguras na nuvem via tokens autenticados por TLS/SSL.

📂 7. Topologia Estrutural de Pastas

`Text
floripa-dignidade/
├── apps/
│   ├── content-manager-system/         # Painel Administrativo Payload 3.84
│   │   └── src/
│   │       ├── app/(payload)/          # Rotas de API e Interface Admin
│   │       ├── collections/            # Coleções: Identidade, Governança, Mídia
│   │       └── infrastructure/         # Plugins Postgres e S3 Storage
│   └── floripa-dignidade/              # Portal de Transparência e Ação Cívica
│       └── src/
│           ├── app/[locale]/           # Rotas Localizadas (pt-BR, es-ES, en-US)
│           │   ├── observatorio/       # Painel de Gastos Públicos e Auditoria
│           │   ├── newsletter/         # Zonas de Sucesso e Confirmação
│           │   └── sections/           # Hero, Grid de Pilares e Conversão
│           ├── api/                    # Gateways de Ingestão (Newsletter, WhatsApp)
│           ├── instrumentation.ts      # Verificação de Saúde Pré-Voo
│           └── middleware.ts           # Interceptador de Borda e Roteamento RBAC
├── libs/
│   ├── contracts/                      # Contratos Zod Puros (.readonly)
│   ├── core/                           # Cimentos Universais (Telemetria, Erros, SRE)
│   ├── engines/                        # Motores Matemáticos, Busca, Fuzzing e IA
│   ├── modules/                        # Domínios de Governança, Comunicação e Mídia
│   └── shared/                         # Design System, UI Foundry e State Store
├── database/                           # Esquemas e Tabelas Mestras SQL (Supabase)
├── reports/                            # Relatórios Forenses e Auditorias de i18n
├── scripts/                            # Gatilhos de Linha de Comando (CLI Triggers)
├── tests/                              # Búnker de Testes Espejo (QA Mirror)
├── package.json                        # Manifesto Central de Dependências
├── pnpm-workspace.yaml                 # Definição dos Espaços de Trabalho
├── nx.json                             # Configuração de Grafo e Cache do Nx
├── tsconfig.base.json                  # Mapeamento Global de Paths (Source-First)
└── eslint.config.mjs                   # Governança de Código e Limites Modulares
`

🚀 8. Guia do Desenvolvedor
Pré-requisitos
Node.js: Versão >= 20.0.0
pnpm: Versão >= 10.0.0
Git: Atualizado

1. Clonagem e Instalação

# Clonar o repositório institucional
`Bash
git clone https://github.com/razpodesta/floripa-dignidade.git
cd floripa-dignidade
`

# Instalar dependências de forma determinista via pnpm
`Bash
pnpm install
`

2. Configuração de Variáveis de Ambiente
Copie o arquivo de exemplo na raiz e configure os segredos cloud:
`Bash
cp .env.example .env

Nota de Segurança: As variáveis de ambiente são auditadas no arranque do servidor pelo @floripa-dignidade/environment-validator. Se uma chave obrigatória (Supabase, Resend, Meta) estiver ausente, o sistema ativa o protocolo Fail-Fast e recusa a inicialização para proteger a integridade dos dados.
`Bash

3. Compilação de Dicionários (Linguistic Weaver)
Antes de iniciar as aplicações, compile os silos de tradução de todos os búnkeres:
`Bash
pnpm weaver:build
`

4. Execução em Desenvolvimento
# Executar o Portal do Cidadão (Next.js 16)
`Bash
pnpm dev:portal
`

# Executar o CMS Administrativo (Payload 3.0)
`Bash
pnpm dev:cms
`

# Executar todo o ecossistema simultaneamente
`Bash
pnpm dev:all
`

5. Auditoria de Qualidade e Integridade (Zenith Sentry)

# Validação de Tipos em todos os projetos (Source-First)
`Bash
pnpm typecheck
`

# Auditoria de Estilo e Limites de Módulos (Nx Boundaries)
`Bash
pnpm lint
`

# Correção automática de formatação e regras de lint
`Bash
pnpm lint:fix
`

# Executar testes unitários no búnker de QA Mirror
`Bash
pnpm test:unit
`

6. Ferramentas de Manutenção e Auditoria Física
# Purgar resíduos de compilações órfãs (.js, .d.ts perdidos)
`Bash
pnpm purge:emissions
`
# Auditar a integridade dos binários de infraestrutura
`Bash
pnpm audit:exceptions
`

# Ingestão manual de planilhas orçamentárias institucionais (XLSX)
`Bash
pnpm nx run @floripa-dignidade/scripts:ingest-financial-budget
`

🤝 9. Convenções de Código e Protocolo de Contribuição
Para manter a harmonia arquitetural da Doutrina Zenith (OEDP-V18.1), todo código deve seguir rigorosamente:

Zero Abbreviations (Prosa Code):
Proibido o uso de req, res, err, btn, ctx, param.
Obrigatório o uso do padrão ISO 11179: [Objeto][Propriedade][Representação] (Ex.: incomingRequestSnapshot, calculatedLatencyInMillisecondsQuantity).

Booleanos Padronizados:
Variáveis booleanas devem iniciar com verbo de estado e terminar com Boolean: isNetworkOnlineBoolean, hasAcceptedPrivacyPolicyBoolean.

Regra de Exportação e Importação:
Importações entre bibliotecas devem utilizar exclusivamente os apelidos canônicos @floripa-dignidade/*.
Proibido o uso de caminhos relativos ascendentes (../../) entre diferentes módulos do Nx.

Convenção de Commits:
Adotamos o padrão Conventional Commits:
feat(observatorio): implementa cálculo de anomalias fiscais
fix(whatsapp): corrige validação de tempo constante em assinatura
refactor(telemetry): atomiza gerador de hash em web worker
chore(deps): atualiza pacote de contratos institucionais

⚖️ 10. Compromisso Social, Governança e Licença
O Floripa Dignidade é um bem público digital regido sob os princípios da ética comunitária, soberania de dados e defesa intransigente dos Direitos Humanos.
Este projeto é disponibilizado sob a licença GNU General Public License v3.0 (GPL-3.0). O código-fonte é aberto, livre para auditoria da sociedade civil e permanentemente blindado contra apropriação privada ou utilização para fins de vigilância de populações oprimidas.

------------------------------------------------------
Mantenedor Principal: Raz Podestá — MetaShark Tech
Organização Institucional: Coletivo Floripa Dignidade
Jurisdição Territorial: Florianópolis, Santa Catarina, Brasil
Contato Institucional: iamfloripadignidade@gmail.com

"A tecnologia só alcança sua maturidade quando se transforma em escudo para a justiça e alicerce para a dignidade de cada ser humano."
