🎨 MANIFIESTO DE ARQUITECTURA GRÁFICA Y ACTIVOS PÚBLICOS (OEDP-V18.1 / ADR 0028) Estado: VIGENTE /
LEY ABSOLUTA DE IDENTIDAD VISUAL Ubicación de Referencia en Monorepo:
.docs/manifestos/graphic-assets-and-public-vault.md Normas de Referencia: ISO/IEC 11179
(Nomenclatura Prosa), ISO/IEC 25010 (Rendimiento y Mantenibilidad), W3C Web App Manifest
Specification, Apple Human Interface Guidelines (HIG), Google Material You (Adaptive Maskable
Icons). Objetivo: Establecer la topología física jerárquica, las matrices dimensionales exactas, los
formatos de compresión de próxima generación (AVIF, WebP, SVG) y las reglas de consumo inmutable
para todos los recursos gráficos residentes en los directorios public/ del ecosistema Floripa
Dignidade. 🏛️ 1. Filosofía de Ingeniería: "Zero-Latency Visual Assets" En el ecosistema Floripa
Dignidade, ningún recurso visual se coloca de forma improvisada ni sin propósito arquitectónico:
Desacoplamiento Absoluto (Capa Estática vs. Bóveda Cloud): Activos de Infraestructura (public/):
Pertenecen al código fuente de la aplicación (identidad institucional, favicons, iconos de la PWA,
sellos de autoridad, imágenes OpenGraph fijas). Se empaquetan con la aplicación y se sirven en el
Edge con cabeceras Cache-Control: public, max-age=31536000, immutable. Activos Dinámicos (MediaVault
en Supabase S3): Fotografías de noticias, evidencias de denuncias ciudadanas y balances
presupuestarios. Jamás se guardan en public/. Prioridad Vectorial (SVG-First): Todo símbolo, isotipo
o logotipo vectorial debe nacer como .svg optimizado mediante SVGO (removiendo metadatos de
Adobe/Figma) para garantizar escalabilidad infinita a 0% de pérdida de nitidez y peso ≤ 4 KB ≤4 KB .
Formatos de Próxima Generación: Para mapas de bits (rasterizados), el estándar prioritario es AVIF /
WebP, proveyendo fallbacks .png comprimidos sin pérdida exclusivamente para navegadores legados.
Respeto a los Contratos Preexistentes: La nueva estructura jerárquica debe proveer
retrocompatibilidad total con los paths ya cableados en el código de producción
(/brand/floripa-dignidade-logo-color.png, /brand/floripa-dignidade-logo-white.png,
/brand/favicon.ico y /brand/icon-192x192.png). 📁 2. Topología Jerárquica Profesional
(apps/floripa-dignidade/public/) Text apps/floripa-dignidade/public/ ├── brand/ # Bóveda Central de
Marca e Identidad │ ├── favicon/ # Ecosistema de Favicons Multi-Resolución │ │ ├── favicon.ico #
Multipágina binario (16x16, 32x32, 48x48) │ │ ├── favicon-16x16.png # Pestañas clásicas de navegador
de baja densidad │ │ ├── favicon-32x32.png # Pestañas estándar Retina / pantallas HiDPI │ │ ├──
favicon-48x48.png # Accesos directos de escritorio (Windows/macOS) │ │ └── favicon.svg # Favicon
vectorial moderno (Safari, Chrome Dark/Light) │ │ │ ├── logos/ # Logotipos Institucionales Oficiales
│ │ ├── horizontal/ # Logotipo Completo (Isotipo + Tipografía) │ │ │ ├── logo-horizontal-color.svg │
│ │ ├── logo-horizontal-color.webp │ │ │ ├── logo-horizontal-color.png │ │ │ ├──
logo-horizontal-white.svg │ │ │ ├── logo-horizontal-white.webp │ │ │ └── logo-horizontal-white.png │
│ ├── vertical/ # Logotipo Apilado (Emblema sobre texto) │ │ │ ├── logo-vertical-color.svg │ │ │ ├──
logo-vertical-color.webp │ │ │ ├── logo-vertical-white.svg │ │ │ └── logo-vertical-white.webp │ │
└── symbol/ # Isotipo / Emblema Solitario (El Escudo) │ │ ├── brand-symbol-color.svg │ │ ├──
brand-symbol-white.svg │ │ └── brand-symbol-color.webp │ │ │ ├── pwa/ # Iconos de Aplicación
Progresiva (PWA & Móvil) │ │ ├── apple-touch-icon.png # iOS Home Screen (180x180 px sin
transparencia) │ │ ├── icon-192x192.png # Splash screen Android & Task Switcher │ │ ├──
icon-384x384.png # Pantallas intermedias de alta densidad │ │ ├── icon-512x512.png # PWA App Store /
Instalador de escritorio │ │ ├── maskable-icon-192x192.png # Android Adaptive Icon (Safe zone 80%
concéntrico) │ │ └── maskable-icon-512x512.png # Android Adaptive Icon alta definición │ │ │ ├──
badges/ # Sellos de Verificación y Confianza │ │ ├── trust-seal-verified.svg # Sello de Organización
Social Verificada │ │ ├── human-rights-shield.svg # Emblema del Canal de Denuncias │ │ └──
lgpd-privacy-certified.svg # Certificación de Anonimización │ │ │ ├──
floripa-dignidade-logo-color.png # [Compatibilidad Canónica Legacy] │ ├──
floripa-dignidade-logo-white.png # [Compatibilidad Canónica Legacy] │ ├── favicon.ico #
[Compatibilidad Canónica Legacy] │ └── icon-192x192.png # [Compatibilidad Canónica Legacy Push] │
├── meta/ # Metadatos de Redes Sociales (SEO & E-E-A-T) │ ├── opengraph-image.png # 1200x630 px
(Facebook, WhatsApp, LinkedIn, Telegram) │ ├── opengraph-image.webp # 1200x630 px de alta fidelidad
y bajo peso (< 80 KB) │ ├── twitter-image.png # 1200x600 px (X / Twitter Card Summary Large) │ └──
whatsapp-preview-square.png # 400x400 px (Thumbnail para enlaces directos en chat) │ ├──
manifest.webmanifest # Manifiesto Oficial PWA W3C ├── robots.txt # Gobernanza de Rastreadores
(Directiva ISO) └── favicon.ico # Fallback universal para la raíz del dominio 📊 3. Matriz
Dimensional y Especificación Técnica de Activos Objeto de Activo Ubicación Canónica Dimensiones (px)
Relación de Aspecto Espacio Cromático / Formato Propósito y Audiencia Favicon Tablero
/brand/favicon/favicon-16x16.png 16 × 16 1:1 sRGB / PNG-8 Pestañas de navegador clásicas y
marcadores. Favicon Retina /brand/favicon/favicon-32x32.png 32 × 32 1:1 sRGB / PNG-24 Pantallas de
alta densidad Retina, OLED y 4K. Favicon Vectorial /brand/favicon/favicon.svg Escalable 1:1
Vectorial / SVG Favicon dinámico (se adapta a modo claro/oscuro). Favicon Master
/brand/favicon/favicon.ico 16, 32, 48 1:1 Binario .ico Soporte para navegadores heredados y Windows
Taskbar. Apple Touch Icon /brand/pwa/apple-touch-icon.png 180 × 180 1:1 sRGB / PNG (Fondo Sólido)
Icono de acceso directo en iOS / iPadOS Safari. PWA Icon Medium /brand/pwa/icon-192x192.png 192 ×
192 1:1 sRGB / PNG con Alpha Pantalla de inicio de Android y Web Push notifications. PWA Icon Large
/brand/pwa/icon-512x512.png 512 × 512 1:1 sRGB / PNG con Alpha Splash screen de carga en Progressive
Web Apps. Maskable Icon /brand/pwa/maskable-icon-512x512.png 512 × 512 1:1 sRGB / PNG (Safe Zone
80%) Icono adaptable Android (círculo, gota, cuadrado). Logo Horizontal /brand/logos/horizontal/_
360 × 80 9:2 SVG / WebP / PNG Barra de navegación superior (Header) de escritorio. Logo Vertical
/brand/logos/vertical/_ 240 × 240 1:1 SVG / WebP / PNG Portadas, reportes imprimibles y footers
centrados. Isotipo Símbolo /brand/logos/symbol/\* 120 × 120 1:1 SVG / WebP Botones flotantes,
avatares y marcas de agua. OpenGraph Master /meta/opengraph-image.png 1200 × 630 1.91:1 sRGB / PNG (
≤ 300 KB ≤300 KB ) Vista previa al compartir en WhatsApp, Facebook, LinkedIn. Twitter Card
/meta/twitter-image.png 1200 × 600 2:1 sRGB / PNG ( ≤ 250 KB ≤250 KB ) Vista previa de impacto en X
/ Twitter Cards. 🎨 4. Paleta de Color Institucional en Activos Gráficos Todo recurso vectorial o
rasterizado debe estar estrictamente calibrado bajo los tokens del Design System
(ColorPalette.tokens.ts): Azul Hércules Institucional (Autoridad y Dignidad): #003366 Ámbar Impacto
Social (Conversión y Rescate Cívico): #F5A623 Azul Puente (Conectividad y Red Solidaria): #4A90E2
Blanco Puro (Fondo y Contraste): #FFFFFF Gris Pizarra Neutro (Tipografía y Sombras): #1E293B Regla
de Accesibilidad (WCAG 2.1 AA): Todo logotipo sobre fondo #003366 debe utilizar la variante blanca
pura (#FFFFFF), garantizando una relación de contraste mínima de 12.6:1 (superando con creces la
exigencia de 4.5:1). 📄 5. Contrato del Manifiesto W3C
(apps/floripa-dignidade/public/manifest.webmanifest) La PWA del portal consumirá formalmente estos
recursos mediante la siguiente estructura inmutable: JSON { "$schema":
"https://json.schemastore.org/web-manifest.json", "name": "Floripa Dignidade — Defesa e Cidadania",
"short_name": "FloripaDignidade", "description": "Plataforma cidadã de transparência pública,
denúncia de direitos humanos e resposta social em Florianópolis.", "start_url": "/pt-BR", "display":
"standalone", "orientation": "portrait-primary", "background_color": "#003366", "theme_color":
"#003366", "icons": [ { "src": "/brand/pwa/icon-192x192.png", "sizes": "192x192", "type":
"image/png", "purpose": "any" }, { "src": "/brand/pwa/maskable-icon-192x192.png", "sizes":
"192x192", "type": "image/png", "purpose": "maskable" }, { "src": "/brand/pwa/icon-512x512.png",
"sizes": "512x512", "type": "image/png", "purpose": "any" }, { "src":
"/brand/pwa/maskable-icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose":
"maskable" } ] } ⚙️ 6. Script de Generación Automatizada de Estructura de Carpetas Para materializar
físicamente esta arquitectura en el sistema de archivos de Windows/Linux dentro del proyecto, el
desarrollador o la terminal de Git ejecutará el siguiente comando en la raíz de
apps/floripa-dignidade/: Bash

# Ejecutar en PowerShell o Bash desde: apps/floripa-dignidade

mkdir -p public/brand/favicon \
 public/brand/logos/horizontal \
 public/brand/logos/vertical \
 public/brand/logos/symbol \
 public/brand/pwa \
 public/brand/badges \
 public/meta 🤖 7. Directiva de Auditoría IA (Neural Sentinel Enforcement) El Health Monitor y el
motor de compilación verificarán que: Ninguna imagen con peso superior a 1 MB resida dentro de
public/. Las rutas solicitadas por componentes de interfaz (GlobalBrandLogo.tsx,
PushPayload.schema.ts, metadata) resuelvan en archivos físicos reales, impidiendo errores de
hidratación 404 Not Found en la consola del navegador. Se mantengan intactos los enlaces simbólicos
o copias canónicas de retrocompatibilidad en /brand/ para evitar regresiones en el código desplegado
en producción.

---
