# 🆔 Manifiesto Técnico de Integración: gov.br Login Único

**Estado:** PENDIENTE DE IMPLEMENTACIÓN
**Protocolo de Enlace:** OAuth 2.0 / OpenID Connect (OIDC)
**Jurisdicción:** Identidad y Autoridad Institucional

## 📖 Descripción del Servicio
Integración con el proveedor oficial de identidad del Gobierno Federal de Brasil para certificar la veracidad de los ciudadanos y organizaciones que participan en la plataforma.

## 🔗 Recursos y Documentación Oficial
*   **Manual de Integración:** [Roteiro de Integração gov.br](https://manual-roteiro-integracao-login-unico.servicos.gov.br/)
*   **Repositorio de Ejemplos (GitHub):** [servicosgovbr/login-unico-exemplos](https://github.com/servicosgovbr/login-unico-exemplos)
*   **Portal de Servicios para Instituciones:** [gov.br/empresas-e-negocios](https://www.gov.br/empresas-e-negocios/pt-br)

## 🏗️ Requerimientos para la Integración
1. **Certificado Digital:** Necesidad de un **e-CNPJ** de la asociación para registrar la aplicación en el ambiente de producción.
2. **Atributos de Identidad:** Solicitud de `cpf`, `email` y `confiabilidade` (Nivel de Bronce/Plata/Oro).
3. **Validación de Niveles:**
    *   **Bronze:** Acceso declarativo.
    *   **Prata:** Validación vía bancos o biometría facial (CNH).
    *   **Ouro:** Validación vía biometría facial (TSE) o Certificado Digital.

## 💰 Análisis de Costos de Implementación
*   **Uso de API:** Gratuito para instituciones que demuestren actividad de interés público o social.
*   **Mantenimiento:** Costo de renovación anual del Certificado Digital e-CNPJ (aprox. R$ 250,00/año).
*   **Infraestructura:** Cero costo adicional (Ejecución isomórfica en Vercel Edge).
