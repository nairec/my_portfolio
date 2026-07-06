const REVEAL_SELECTOR = "[data-scroll-reveal]";

export function initScrollReveal() {
    const elements = document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR);
    if (!elements.length) return;

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
        elements.forEach((el) => el.classList.add("is-visible"));
        return;
    }

    document.documentElement.classList.add("scroll-reveal-active");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    elements.forEach((el) => observer.observe(el));
}

document.addEventListener("astro:page-load", initScrollReveal);
