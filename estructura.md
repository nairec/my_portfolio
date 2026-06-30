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
├── projectsList.json      # Datos estáticos de proyectos
└── projects.js            # Store nanostores (modo serious/fun)
```

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

## Páginas

### `src/pages/index.astro`
Home con `Welcome.astro`. Usa `transition:animate="fade"` para transiciones suaves entre rutas.

### `src/pages/projects.astro`
Grid de proyectos con filtro serious/fun. Ordena por `year` descendente. Integra `ProjectsTitle` + grid animado con `@formkit/auto-animate`.

## Componentes clave

### `Welcome.astro`
Hero (mono + cyan), bio, CTA contacto, redes sociales y sección "My Stack" con iconos flotantes (`Tag.astro`). Contenedor `max-w-7xl` con espaciado vertical reducido (6–8rem entre secciones).

### `Navbar.astro`
Navegación numerada (`01. Home`). Estado activo en cyan con subrayado. Clases `interactive-base` y `focus-ring`.

### `ProjectsTitle.astro`
Cabecera de la página de proyectos: `02. serious projects` / `02. fun projects`. El color del span cambia según el modo (indigo = serious, cyan = fun), sincronizado con `nanostores`.

### `ModeToggle.astro`
Botones `01_Serious` / `02_Fun`. Estado activo diferenciado cromáticamente (indigo vs cyan). Un **indicador deslizante** (`#mode-indicator`) se desplaza con `transform: translateX` bajo el botón activo y anima el color indigo ↔ cyan. Persiste en `localStorage` vía `projects.js`.

### `ProjectTag.astro`
Tarjeta de proyecto premium:
- Enlace externo que envuelve toda la card (`group`)
- Cabecera: nombre + año + icono `↗` en hover
- Imagen `aspect-video` con `object-cover` y zoom sutil
- Descripción con `line-clamp-3`
- Stack tags como pills con borde; corchetes `[Tag]` solo en modo fun
- Hover: borde cyan, glow, título verde con `>`

### `Tag.astro`
Iconos SVG del stack con animación `float`. Respeta `prefers-reduced-motion`.

### `Chatbot.tsx`
Isla React exclusiva de la home (visible en `xl+`). Consume `/api/chat`.

### `Footer.astro`
Pie con padding vertical y texto `gray-500`.

## Datos de proyectos

### `src/projectsList.json`
Cada proyecto incluye: `name`, `slug` (preparado para futuras rutas `/projects/[slug]`), `year`, `description`, `link`, `type`, `imgPath`, `stack`, `width`, `height`.

- `width: 2` destaca un proyecto en `md:col-span-2` (actualmente AetherType).
- Orden de render: por año descendente en `projects.astro`.

### `src/types/types.ts`
Interface `Project` tipada para JSON y futuras extensiones.

## Flujo del filtro serious/fun

```
ModeToggle.astro  →  mode.set("serious"|"fun")  →  projects.js (nanostores)
                              ↓
              projects.astro script: toggle .hidden en .project-tag-wrapper
                              ↓
              @formkit/auto-animate reordena el grid con transición suave
                              ↓
              ProjectsTitle.astro actualiza el label de cabecera
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
