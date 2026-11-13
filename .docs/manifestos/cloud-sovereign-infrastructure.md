**Estado:** VIGENTE / LEY DE ECONOMÍA TÉCNICA  
**Referencia:** ADR 0015  
**Objetivo:** Establecer la soberanía operativa en la nube mediante el uso exclusivo de servicios
gestionados (SaaS/PaaS) en capas gratuitas, garantizando el desacoplamiento total de recursos
locales y la portabilidad hacia infraestructuras Enterprise (AWS, Alibaba Cloud).

---

## ☁️ 1. Filosofía: "The Stateless Developer"

Queda estrictamente prohibida la instalación o dependencia de bases de datos locales (Postgres,
MongoDB, Redis) en los entornos de desarrollo.

- **Verdad Única:** Si no está en la nube, no existe.
- **Acceso:** Toda conexión se realiza mediante **Access Tokens** y **Connection Strings** seguros.
- **Costo:** Se priorizarán proveedores con "Generous Free Tiers" (Neon, Supabase, Upstash, Resend,
  Cloudinary).

---

## 🛠️ 2. Reglas de Conectividad Zenith

1.  **Transporte Seguro:** Toda comunicación con la persistencia debe realizarse sobre TLS/SSL.
2.  **Validación de Credenciales:** Ningún aparato de datos iniciará ejecución sin que el
    `environment-validator` haya verificado la integridad del token de acceso.
3.  **Abstracción de Driver:** La lógica de negocio no debe saber _qué_ nube estamos usando. Se
    utilizarán interfaces abstractas para permitir la migración de un "Free Tier" a una
    infraestructura propia en AWS/Alibaba sin refactorizar el núcleo.

---

## 🧬 3. El Triángulo de Escalabilidad

Para garantizar que el sistema crezca sin presupuesto inicial, los aparatos deben cumplir con:

- **Cold-Start Optimization:** Código ligero para evitar latencia en capas gratuitas de
  Vercel/Hugging Face.
- **Connection Pooling:** Uso obligatorio de proxies de conexión (ej: Prisma Data Proxy o Neon
  Serverless Driver) para no agotar los límites de sockets de los planes gratis.
- **Data Pruning:** Algoritmos de limpieza automática para mantener el volumen de datos dentro de
  los límites del Tier gratuito.

---

## 🤖 4. Auditoría IA (Infrastructure Sentry)

El Neural Sentinel invalidará cualquier Pull Request que intente introducir dependencias de
`localhost` o binarios de base de datos dentro del monorepo. La soberanía es líquida y reside en la
red.

---
