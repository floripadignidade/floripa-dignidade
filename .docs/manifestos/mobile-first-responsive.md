**Autor:** Raz Podestá - MetaShark Tech  
**Projeto:** Floripa Dignidade  
**Status:** Vital / Em vigor

## 1. A Filosofia: Mobile-First, Content-Always

En el contexto de una ONG, el acceso a la información ocurre mayoritariamente en dispositivos
móviles con redes limitadas (3G/4G). **Floripa Dignidade** no se "adapta" al celular; nace en el
celular y se expande al escritorio.

### 1.1. Hierarquia de Desenvolvimento

1. **Mobile (320px - 480px):** Prioridad absoluta. Foco en legibilidad y ahorro de datos.
2. **Tablet (481px - 1024px):** Reorganización en grillas (Grids).
3. **Desktop (1025px+):** Enriquecimiento visual y expansión de metadatos (Layout de Portal).

---

## 2. Padrões de Layout e Visualização (Tailwind)

Utilizamos la lógica de **prefijos positivos**: el estado base de una clase Tailwind es siempre
Mobile.

### 2.1. Touch-First Design

- **Áreas de Toque:** Todo "Lego" interactivo debe tener un área mínima de **44x44px** para evitar
  errores de navegación en personas con movilidad reducida o pantallas pequeñas.
- **Gestos Nativos:** Uso de _swiping_ para noticias y cierre de modais.

### 2.2. Fluid Typography (O Poder do clamp)

No usamos tamaños fijos. La tipografía "respira".

- **Fórmula:** `font-size: clamp(minimum, preferred, maximum);`
- **Objetivo:** Que un titular H1 sea legible tanto en un smartphone antiguo como en un monitor 4K
  sin breakpoints bruscos.

---

## 3. Estratégia de "Aparatos" Lego Responsivos

Cada pieza de Lego debe ser autónoma usando **Container Queries** (clases `@container` de Tailwind).
El componente no sabe el tamaño de la pantalla, solo el tamaño del espacio que ocupa.

---

## 4. Exemplo Prático: NewsArticleCard.tsx

```tsx
/**
 * Aparato: NewsArticleCard (Responsividade Síncrona)
 * Localização: libs/modules/blog-engine/ui/src/lib/news-article-card/
 */

import React from 'react';
import Image from 'next/image';

export interface NewsArticleCardProperties {
  readonly title: string;
  readonly excerpt: string;
  readonly imageSource: string;
}

export const NewsArticleCard: React.FC<NewsArticleCardProperties> = ({
  title,
  excerpt,
  imageSource,
}) => {
  return (
    <article className="flex flex-col gap-4 p-4 border-b md:flex-row md:items-center transition-all hover:bg-neutral-50">
      <div className="relative aspect-video w-full md:w-48 lg:w-64 flex-shrink-0">
        <Image
          src={imageSource}
          alt={title}
          fill
          className="object-cover rounded-sm"
          sizes="(max-width: 768px) 100vw, 300px"
        />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-xl md:text-2xl font-bold leading-tight">{title}</h2>
        <p className="hidden md:block text-sm text-neutral-600 line-clamp-2">{excerpt}</p>
      </div>
    </article>
  );
};
```
