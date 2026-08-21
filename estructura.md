# Estructura del Portfolio

Portfolio personal de Eric Garcia. Stack: **Astro 6**, **Tailwind CSS v4**, **React 19** (isla del chatbot), **nanostores**, desplegado en **Vercel**.

## Directorios principales

```
src/
├── assets/
│   ├── hero-cover-portada-2.jpg  # Banda izquierda de /home en móvil
│   ├── pc-hero-cover-generated.jpg # Asset histórico (antes fondo desktop /home)
│   ├── projectImages/     # Miniaturas de proyectos (PNG)
│   └── SVGs/              # Iconos del stack tecnológico
├── content/
│   └── blogs/             # Posts Markdown (Content Collections)
├── content.config.ts      # Schema Zod + loader de la colección `blogs`
├── components/            # Componentes Astro y React
│   └── ui/                # Islas React reutilizables (estilo shadcn)
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

- Textos de UI: nav, hero, `a11y`, works, stack, projects, chat, footer, blog
- Descripciones de proyectos: por `slug` en `t.projects.descriptions`
- Prompts del chatbot: `getSystemPrompt(locale)` en [`src/lib/prompts.ts`](src/lib/prompts.ts)

### Accesibilidad (i18n `a11y`)
Claves para skip link, enlaces externos, redes sociales y filtro de proyectos. Skip link en [`Layout.astro`](src/layouts/Layout.astro); estilos `.skip-link` en [`global.css`](src/styles/global.css).

### Chatbot e idioma
- Props traducidas desde `HomePortada.astro`
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
- Fondo negro sólido (`#000`) en todo el sitio + `BackgroundPixelStars` global en Layout, con `brightness(0.4)`.
- Imágenes/SVG con `view-transition-name: none` y `transition:animate="none"` en miniaturas de proyecto — evitan snapshots en View Transitions.
- **Sin prerender** de rutas con i18n dinámico: el middleware resuelve idioma por cookie/`Accept-Language` en cada request.

## Páginas

| Ruta | Archivo | Contenido |
|------|---------|-----------|
| `/` | `index.astro` | Redirige a `/home` |
| `/home` | `home.astro` | Portada (`HomePortada.astro`) en móvil; en desktop (`xl+`) incluye también `SpecialtiesSections` embebidas. `homeScreen` en Layout. |
| `/especialidades` | `especialidades.astro` | Especialidades + stack (`SpecialtiesSections.astro`) |
| `/proyectos` | `proyectos.astro` | Grid de proyectos con filtro por categoría |
| `/projects` | `projects.astro` | Redirige a `/proyectos` (compatibilidad) |
| `/blog` | `blog.astro` | Listado de posts (índice por año) |
| `/blog/[slug]` | `blog/[slug].astro` | Detalle de un post Markdown |
| `/blogs` | `blogs.astro` | Redirige a `/blog` (compatibilidad) |
| `/blogs/[slug]` | `blogs/[slug].astro` | Redirige a `/blog/[slug]` (compatibilidad) |

### `src/pages/home.astro`
Portada con `Layout homeScreen`, `HomePortada.astro` y bloque `.home-page__specialties` (solo visible en `xl+`) con `SpecialtiesSections embedded`. En móvil la página es solo la portada a pantalla completa; en desktop se puede hacer scroll para ver especialidades y stack. Footer visible en desktop home.

### `src/pages/especialidades.astro`
Secciones **Especialidades** (`#works`) y **My Stack** (`#stack`), extraídas del antiguo monolito `Welcome.astro`. Usa `SpecialtiesSections.astro` con scroll-reveal.

### `src/pages/proyectos.astro`
Grid de proyectos con filtro por categoría (IA, app web, automatización). Muestra todos los proyectos por defecto. Ordena por `year` descendente. Integra `ProjectsTitle` + grid animado con `@formkit/auto-animate`. Título, filtro y cards entran con fade-in + deslizamiento ligero hacia arriba (stagger CSS).

### `src/pages/blog.astro`
Listado de posts de la colección `blogs`. Usa `getCollection("blogs")`, excluye `draft` fuera de `dev`, ordena por `pubDate` descendente, agrupa por año y renderiza `BlogsTitle` + `BlogCard` en layout índice (`max-w-4xl`). Textos de UI vía `t.blog`; título/descripción del post no se traducen.

### `src/pages/blog/[slug].astro`
Detalle SSR: `getEntry("blogs", slug)` → `render(post)` → `<Content />` dentro de `BlogPost`. 404 si el slug no existe o el post es draft en producción. `/blogs` y `/blogs/[slug]` redirigen aquí.

## Blog (Content Collections)

### Autoría
1. Crear `src/content/blogs/mi-slug/index.md` con frontmatter válido. Las imágenes del post van en la misma carpeta y se referencian con ruta relativa (`![alt](./foto.png)`). Markdown estándar: sin sintaxis de tamaño de Obsidian (`![alt|45]`); un `width` puntual se aplica en CSS (p. ej. comida a 45px).
2. El slug de la URL es el nombre de la carpeta: `/blog/mi-slug`. También vale un `.md` suelto en `blogs/` (mismo nombre = mismo slug).
3. Commit + deploy (o `astro dev`) → aparece en el listado y en la ruta de detalle.

### Schema (`src/content.config.ts`)
Campos: `title`, `description`, `pubDate`, `updatedDate?`, `draft?` (default `false`), `tags?` (default `[]`). Loader `glob` sobre `./src/content/blogs/**/*.md`. `generateId` recorta `.md` y `/index` para que `mi-slug/index.md` y `mi-slug.md` compartan id `mi-slug`.

### Componentes
- `BlogCard.astro` — fila del índice: número `01`, fecha compacta, título, descripción y tags `//`. Hover con fondo accent suave.
- `BlogPost.astro` — shell del detalle (volver, meta, título, descripción, tags) + slot para `<Content />`.
- Estilos del cuerpo Markdown en `.blog-content` (`global.css`), con tokens del sitio.

### Listado
Ledger agrupado por año: rail sticky con el año + hairline cyan en desktop. Sin cajas ni portadas. Stagger CSS de entrada; `prefers-reduced-motion` lo desactiva.

### Decisiones
- Un idioma por post (el del autor); la UI sigue i18n.
- Solo Markdown por ahora (sin MDX).
- Posts con assets: carpeta `src/content/blogs/<slug>/` + `index.md` + imágenes colocadas. El pipeline de Astro resuelve `./imagen.png`.
- Sin `getStaticPaths`: el sitio es `output: "server"`.
- Listado tipo índice técnico, sin imágenes de portada.

## Componentes clave

### `src/components/ui/background-pixel-stars.tsx`
Isla React (`client:load`) montada en [`Layout.astro`](src/layouts/Layout.astro) para **todas las páginas**: canvas a 16 FPS con estrellas pixeladas, titileo, regeneración periódica y estrellas fugaces sobre dither negro. Persiste entre View Transitions (`transition:persist`). Brillo reducido (`brightness(0.4)`). Sin deps externas. Respeta `prefers-reduced-motion` (frame estático). Alias `@/*` → `src/*` en `tsconfig.json`.

### `HomePortada.astro`
Hero/portada: en móvil, banda izquierda con `hero-cover-portada-2.jpg` + navegación vertical en el panel; en desktop (`xl+`) layout con navbar superior y chatbot. El fondo atmosférico del sitio lo aporta `BackgroundPixelStars` en Layout. Animaciones de entrada escalonadas (copy, CTA, redes, chatbot) en móvil y desktop; chatbot entra desde la derecha en `xl+`.
### `SpecialtiesSections.astro`
Bloques de especialidades (`t.works.items[]`) con ilustraciones SVG y sección stack con `Tag.astro`. Prop opcional `embedded` para uso en `/home` (sin `padding-top` de página independiente). Separador `SectionDivider.astro` entre ambas secciones. El título y el primer bloque de works tienen animación de entrada al cargar la página; el resto usa scroll-reveal.

### `SectionDivider.astro`
Separador decorativo entre secciones principales: líneas en gradiente muted/cyan con `//` estilizado en mono (skew + opacidad distinta por barra, glow sutil). `role="separator"` y `aria-hidden`. Usado entre works → stack en `SpecialtiesSections.astro`. Incluye animación scroll-reveal (fade-up) vía `data-scroll-reveal`.

#### Sección `#works` (en `/especialidades`)
Bloques apilados (`t.works.items[]`) con `title` y `description` por área. Cada bloque: cabecera horizontal (ilustración SVG grande + número/título) y párrafo descriptivo debajo. En desktop, los bloques impares alternan imagen a la derecha (`work-block--reverse`). Textos editables en `src/i18n/locales/es.json`; EN/CA con placeholders hasta traducción. Cabecera y bloques con scroll-reveal (fade-up; bloques pares desde la izquierda, impares desde la derecha).

### `src/lib/scrollReveal.ts`
Intersection Observer para elementos con `data-scroll-reveal`. Añade `scroll-reveal-active` en `<html>` al activarse; sin JS o con `prefers-reduced-motion` el contenido permanece visible (fallback en CSS + JS).

### `Navbar.astro`
Navegación numerada traducida. Incluye `LanguageSwitcher`. Estado activo en cyan con `aria-current="page"`. Header **sticky** con fondo semitransparente y `backdrop-blur`. En móvil (&lt; 768px): icono de tres barras que abre un menú desplegable con las rutas; en desktop los enlaces se muestran en línea.

### `LanguageSwitcher.astro`
Dropdown en el navbar: muestra el código del idioma activo (EN / ES / CA) y, al hacer clic, despliega las opciones con nombre nativo (English, Español, Català). Persiste preferencia en cookie `locale`.

### `ProjectsTitle.astro`
Cabecera de la página de proyectos: título en gris (`text-5xl text-muted tracking-tight`, mismo estilo que especialidades) e incluye `CategoryFilter` para filtrar por categoría. Título y filtro con animación de entrada fade-up.

### `CategoryFilter.astro`
Botones `Todos` / `IA` / `App web` / `Automatización` con `role="group"`, `aria-label` y `aria-pressed`. Indicador deslizante bajo el botón activo. Persiste en `localStorage` vía `projects.js` (`categoryFilter` nanostore).

### `ProjectTag.astro`
Tarjeta de proyecto premium:
- Enlace externo que envuelve toda la card (`group`)
- Cabecera: nombre + año + icono ojo en hover
- Imagen `aspect-video` con `object-cover` y zoom sutil
- Descripción con `line-clamp-3`. Si el texto se recorta, al hover aparece un recuadro discreto con la descripción completa (solo cuando `scrollHeight > clientHeight`).
- Stack tags como pills con borde
- Hover: borde cyan, glow, título verde con `>`

### `Tag.astro`
Iconos SVG del stack con animación `float`. Respeta `prefers-reduced-motion`.

### `Chatbot.tsx`
Isla React de la portada `/home` (visible en `xl+`). Consume `/api/chat`.

### `Footer.astro`
Pie con padding vertical y texto `gray-500`.

## Datos de proyectos

### `src/projectsList.json`
Cada proyecto incluye: `name`, `slug`, `year`, `link`, `categories` (array: `ai`, `web-app`, `automation`), `imgPath`, `stack`, `width`, `height`. Opcionalmente `imgObjectPosition` para ajustar el encuadre de la miniatura (`object-position` en CSS). Las **descripciones** viven en los JSON de i18n (`t.projects.descriptions[slug]`), no en este archivo.

- `width: 2` destaca un proyecto en `md:col-span-2` (actualmente AetherType).
- Orden de render: por año descendente en `proyectos.astro`.

### `src/types/types.ts`
Interface `Project` tipada para JSON y futuras extensiones.

## Flujo del filtro por categoría

```
CategoryFilter.astro  →  categoryFilter.set("all"|"ai"|"web-app"|"automation")  →  projects.js (nanostores)
                              ↓
              proyectos.astro script: toggle .hidden en .project-tag-wrapper según data-categories
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
