# 🗺️ Manifiesto: Inteligencia Territorial y Registro Multidimensional

**Estado:** ESPECIFICACIÓN TÉCNICA (OEDP-V18.1)
**Objetivo:** Eliminar la dependencia de proveedores externos (Google/Mapbox) mediante un Motor de Integridad Territorial basado en datos abiertos del IBGE y un sistema de Ficha Única de Interacción.

## 🧱 1. El Motor de Localización Soberano (Non-Google Strategy)
El sistema operará bajo una base de datos de malla geográfica propia, alimentada por el IBGE:
1. **Jurisdicción Política:** Sincronización con la API de Localidades (Estados y Municipios).
2. **Jurisdicción Operativa:** Mapeo de Malha de Setores Censitários para validación de barrios.
3. **Validación Postal:** Integración con la base de datos de CEPs abierta para autocompletado de direcciones.

## 👥 2. La Ficha del Ciudadano (360° Citizen File)
La identidad no es estática; es un historial inmutable de interacciones.
*   **Perfil Primario:** Identidad Civil (CPF), Nombre Legal y Nivel de Confianza (Bronze/Prata/Ouro).
*   **Metadata de Contacto:** Verificación dual de canales (WhatsApp, Email, Telefonía Móvil).
*   **Residencia Auditada:** Vínculo físico con el territorio (Barrio/CEP) para el cálculo de impacto local.
*   **Ledger de Interacciones:** Registro cronológico de denuncias, apoyos, atenciones recibidas y participación en Action Hubs.

## 🏢 3. Ecosistema Multi-tenant de Alianzas
El sistema permitirá la adhesión de dos tipos de entidades:
1. **Entes Gubernamentales (Tenants):** Prefeituras o Secretarías que gestionan el gasto público.
2. **Instituciones Parceiras (Partners):** OSCs y colectivos que ejecutan la atención directa en el territorio.
*Regla de Oro:* Aislamiento total de datos entre Tenants mediante `organizationIdentifier`.

---


