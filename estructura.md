# Estructura del Portfolio

Portfolio personal de Eric Garcia. Stack: **Astro 6**, **Tailwind CSS v4**, **React 19** (isla del chatbot), **nanostores**, desplegado en **Vercel**.

## Directorios principales

```
src/
├── assets/
│   ├── projectImages/     # Miniaturas de proyectos (PNG)
│   └── SVGs/              # Iconos del stack tecnológico
├── components/            # Componentes Astro y React
├── layouts/               # Layout base de página
├── lib/                   # Lógica de servidor (prompts del chat)
├── pages/                 # Rutas y API
├── styles/                # Estilos globales y design tokens
├── types/                 # Interfaces TypeScript compartidas
├── i18n/                  # Internacionalización (en, es, ca)
│   ├── locales/           # JSON de traducciones
│   ├── index.ts           # getTranslations, parseAcceptLanguage
│   └── locale.ts          # Store cliente + setLocale (cookie)
├── middleware.ts          # Detección de idioma (cookie / Accept-Language)
├── chatStore.ts           # Historial del chatbot (sessionStorage)
├── projectsList.json      # Datos estáticos de proyectos
└── projects.js            # Store nanostores (filtro por categoría de proyectos)
```

## Internacionalización (i18n)

Idiomas soportados: **inglés** (`en`), **español** (`es`), **catalán** (`ca`).

### Detección automática
1. Cookie `locale` (preferencia explícita del usuario)
2. Cabecera `Accept-Language` del navegador
3. Fallback: `en`

Implementado en [`src/middleware.ts`](src/middleware.ts). El `<html lang>` se actualiza en [`Layout.astro`](src/layouts/Layout.astro).

### Selector de idioma
[`LanguageSwitcher.astro`](src/components/LanguageSwitcher.astro) en el Navbar (EN / ES / CA). Al cambiar, guarda cookie y recarga la página.

### Traducciones
Archivos JSON en `src/i18n/locales/`. Los componentes Astro leen `Astro.locals.locale` y usan `getTranslations(locale)`.

- Textos de UI: nav, hero, `a11y`, works, stack, projects, chat, footer
- Descripciones de proyectos: por `slug` en `t.projects.descriptions`
- Prompts del chatbot: `getSystemPrompt(locale)` en [`src/lib/prompts.ts`](src/lib/prompts.ts)

### Accesibilidad (i18n `a11y`)
Claves para skip link, enlaces externos, redes sociales y filtro de proyectos. Skip link en [`Layout.astro`](src/layouts/Layout.astro); estilos `.skip-link` en [`global.css`](src/styles/global.css).

### Chatbot e idioma
- Props traducidas desde `Welcome.astro`
- API `/api/chat` recibe `locale` y selecciona el system prompt
- Al cambiar idioma, el historial del chat se reinicia con el saludo traducido

## Design tokens (`src/styles/global.css`)

Centraliza la identidad visual sin rediseñar la estética:

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-accent` | `#41d3ff` | Títulos, links, acentos cyan |
| `--color-accent-hover` | `#00c932` | Hover en títulos de proyecto |
| `--color-muted` | `#bababa` | Texto secundario |
| `--color-bio` | `#a8a8a8` | Párrafo bio (mejor contraste) |
| `--duration-base` | `250ms` | Transiciones unificadas |

Clases utilitarias globales: `.interactive-base` (transiciones), `.focus-ring` (accesibilidad), `prefers-reduced-motion` desactiva animaciones decorativas.

**Scrollbar de página:** `scrollbar-gutter: stable` en `html` reserva espacio fijo para evitar saltos de layout al cambiar de modo en Projects (cuando aparece/desaparece overflow). Barra fina (4px) con thumb muted/cyan, alineada con `.custom-scrollbar` del chatbot.

**Anti-FOUC (flash blanco en prod):** Con `output: "server"`, el CSS externo puede llegar después del HTML. Mitigaciones en [`astro.config.mjs`](astro.config.mjs) y [`Layout.astro`](src/layouts/Layout.astro):
- `build.inlineStylesheets: "always"` — inyecta Tailwind y estilos en `<style>` del `<head>` en el primer byte.
- Cuadrícula + fondo negro inline en `<html>` — visible desde el primer paint, sin quedar oculta detrás del `background` del `body`.
- `Background.astro` con `z-0` (no `-z-50`) y `transition:persist="site-background"` — cuadrícula estable en navegación SPA.
- Imágenes/SVG con `view-transition-name: none` y `transition:animate="none"` en miniaturas de proyecto — evitan snapshots en View Transitions.
- **Sin prerender** de `/` y `/projects`: el middleware i18n resuelve idioma por cookie/`Accept-Language` en cada request.

## Páginas

### `src/pages/index.astro`
Home con `Welcome.astro`. Contenido con `transition:animate="fade"`; shell (navbar, footer, fondo) persiste sin parpadeo.

### `src/pages/projects.astro`
Grid de proyectos con filtro por categoría (IA, app web, automatización). Muestra todos los proyectos por defecto. Contenido envuelto en `transition:animate="fade"`. Ordena por `year` descendente. Integra `ProjectsTitle` + grid animado con `@formkit/auto-animate`.

## Componentes clave

### `SectionDivider.astro`
Separador decorativo entre secciones principales de la home: líneas en gradiente muted/cyan con `//` estilizado en mono (skew + opacidad distinta por barra, glow sutil). `role="separator"` y `aria-hidden`. Usado entre hero → works → stack en `Welcome.astro`. Incluye animación scroll-reveal (fade-up) vía `data-scroll-reveal`.

### `Welcome.astro`
Hero (mono + cyan), bio, CTA contacto, redes sociales, sección **"Especialidades"** (`#works`) con cuatro áreas de trabajo, y sección "My Stack" con iconos flotantes (`Tag.astro`). Contenedor `max-w-7xl` con espaciado vertical reducido (6–8rem entre secciones). La sección `#stack` usa scroll-reveal: cabecera con fade-up y cada fila de tecnologías con entrada desde la derecha (`scroll-reveal--from-right`).

#### Sección `#works`
Bloques apilados (`t.works.items[]`) con `title` y `description` por área. Cada bloque: cabecera horizontal (ilustración SVG grande + número/título) y párrafo descriptivo debajo. En desktop, los bloques impares alternan imagen a la derecha (`work-block--reverse`). Textos editables en `src/i18n/locales/es.json`; EN/CA con placeholders hasta traducción. Cabecera y bloques con scroll-reveal (fade-up; bloques pares desde la izquierda, impares desde la derecha).

### `src/lib/scrollReveal.ts`
Intersection Observer para elementos con `data-scroll-reveal`. Añade `scroll-reveal-active` en `<html>` al activarse; sin JS o con `prefers-reduced-motion` el contenido permanece visible (fallback en CSS + JS).

### `Navbar.astro`
Navegación numerada traducida. Incluye `LanguageSwitcher`. Estado activo en cyan con `aria-current="page"`. Header **sticky** con fondo semitransparente y `backdrop-blur`.

### `LanguageSwitcher.astro`
Dropdown en el navbar: muestra el código del idioma activo (EN / ES / CA) y, al hacer clic, despliega las opciones con nombre nativo (English, Español, Català). Persiste preferencia en cookie `locale`.

### `ProjectsTitle.astro`
Cabecera de la página de proyectos: `02. proyectos` (estático, traducido). Incluye `CategoryFilter` para filtrar por categoría.

### `CategoryFilter.astro`
Botones `Todos` / `IA` / `App web` / `Automatización` con `role="group"`, `aria-label` y `aria-pressed`. Indicador deslizante bajo el botón activo. Persiste en `localStorage` vía `projects.js` (`categoryFilter` nanostore).

### `ProjectTag.astro`
Tarjeta de proyecto premium:
- Enlace externo que envuelve toda la card (`group`)
- Cabecera: nombre + año + icono ojo en hover
- Imagen `aspect-video` con `object-cover` y zoom sutil
- Descripción con `line-clamp-3`
- Stack tags como pills con borde
- Hover: borde cyan, glow, título verde con `>`

### `Tag.astro`
Iconos SVG del stack con animación `float`. Respeta `prefers-reduced-motion`.

### `Chatbot.tsx`
Isla React exclusiva de la home (visible en `xl+`). Consume `/api/chat`.

### `Footer.astro`
Pie con padding vertical y texto `gray-500`.

## Datos de proyectos

### `src/projectsList.json`
Cada proyecto incluye: `name`, `slug`, `year`, `link`, `categories` (array: `ai`, `web-app`, `automation`), `imgPath`, `stack`, `width`, `height`. Las **descripciones** viven en los JSON de i18n (`t.projects.descriptions[slug]`), no en este archivo.

- `width: 2` destaca un proyecto en `md:col-span-2` (actualmente AetherType).
- Orden de render: por año descendente en `projects.astro`.

### `src/types/types.ts`
Interface `Project` tipada para JSON y futuras extensiones.

## Flujo del filtro por categoría

```
CategoryFilter.astro  →  categoryFilter.set("all"|"ai"|"web-app"|"automation")  →  projects.js (nanostores)
                              ↓
              projects.astro script: toggle .hidden en .project-tag-wrapper según data-categories
                              ↓
              @formkit/auto-animate reordena el grid con transición suave
```

## Decisiones de diseño (mejoras UX/UI fases 1–4)

1. **Sin rediseño**: se preservan colores, tipografías (Plus Jakarta Sans + mono) y mood terminal/cyan.
2. **Tokens centralizados** en `global.css` para consistencia sin componente Button compartido.
3. **Card clickeable completa** mejora affordance; el enlace sigue siendo externo al proyecto.
4. **`slug` en JSON** prepara Fase 5 (case studies) sin implementar rutas aún.
5. **Placeholders PNG** para miniaturas faltantes hasta que se suban screenshots reales.
6. **auto-animate** solo en el grid de proyectos; el resto de animaciones es CSS puro.

## API

### `src/pages/api/chat.ts`
Endpoint del chatbot con Groq SDK y rate limiting Upstash.
