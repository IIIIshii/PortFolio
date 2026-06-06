/* ============================================================
   iiiishii — Portfolio interactions
   ============================================================ */

const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Smooth scroll for in-page anchors ---------- */
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
        const href = anchor.getAttribute("href");
        if (!href || href === "#") return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "start",
        });
        closeMobileNav();
    });
});

/* ---------- Header state + scroll progress ---------- */
const header = document.getElementById("header");
const progress = document.getElementById("scroll-progress");

function onScroll(): void {
    const y = window.scrollY;
    header?.classList.toggle("scrolled", y > 8);

    if (progress) {
        const docHeight =
            document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (y / docHeight) * 100 : 0;
        progress.style.width = `${pct}%`;
    }
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Mobile nav toggle ---------- */
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");

function closeMobileNav(): void {
    navMenu?.classList.remove("open");
    navToggle?.setAttribute("aria-expanded", "false");
}

navToggle?.addEventListener("click", () => {
    const isOpen = navMenu?.classList.toggle("open") ?? false;
    navToggle.setAttribute("aria-expanded", String(isOpen));
});

/* ---------- Scroll reveal ---------- */
const reveals = document.querySelectorAll<HTMLElement>(".reveal");
if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
} else {
    const revealObserver = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    obs.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => revealObserver.observe(el));
}

/* ---------- Nav scrollspy ---------- */
const sections = document.querySelectorAll<HTMLElement>("section[id]");
const navLinks = document.querySelectorAll<HTMLAnchorElement>(".nav-links a[data-nav]");

function setActive(id: string): void {
    navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
    });
}

if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) setActive(entry.target.id);
            });
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
}

/* ---------- Hero typing effect ---------- */
const typedEl = document.getElementById("typed");
// TODO: 差し替え - 肩書きの候補
const phrases = [
    "Software Engineer",
    "Web Developer",
    "Problem Solver",
];

if (typedEl) {
    if (prefersReducedMotion) {
        typedEl.textContent = phrases[0];
    } else {
        let phraseIndex = 0;
        let charIndex = 0;
        let deleting = false;

        const type = (): void => {
            const current = phrases[phraseIndex];
            typedEl.textContent = current.slice(0, charIndex);

            if (!deleting && charIndex < current.length) {
                charIndex++;
                setTimeout(type, 70);
            } else if (!deleting && charIndex === current.length) {
                deleting = true;
                setTimeout(type, 1600);
            } else if (deleting && charIndex > 0) {
                charIndex--;
                setTimeout(type, 35);
            } else {
                deleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                setTimeout(type, 350);
            }
        };
        type();
    }
}

/* ---------- Footer year ---------- */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
