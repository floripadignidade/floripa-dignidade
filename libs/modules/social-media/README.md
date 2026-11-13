# 🌐 PROMPT DE CONSTRUCCIÓN: Social Media Multi-Platform Kernel

**Rol:** Orquestador de publicación y escucha social en redes externas. **Estructura Jerárquica:**
Este workspace es una CARCASA que anida búnkeres independientes.

## 🎯 Objetivo para la IA

Debes construir adaptadores desacoplados para cada red social siguiendo el
**SocialMediaProvider.interface** definido en el búnker `kernel`.

## 🏗️ Instrucciones de Configuración Anidada

1. **Aparatos por Plataforma:**
   - `./facebook/`: Implementación de Graph API.
   - `./instagram/`: Implementación de Display API.
2. **Regla de Independencia:** El búnker de Facebook NO puede importar nada del búnker de Instagram.
3. **Soberanía del Kernel:** Cualquier nueva red social debe ser primero definida como contrato en
   `social-media/kernel`.

## 🧬 ADN Estructural

Uso estricto de `ISocialMediaPost` para garantizar que el contenido sea agnóstico a la plataforma.
