"use strict";
/* ============================================================
   iiiishii — Portfolio interactions
   Rotary-knob section navigator + scroll reveal
   ============================================================ */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
/* ---------- Section model ---------- */
const SECTIONS = ["home", "about", "skills", "projects", "experience", "contact"];
const NAMES = ["HOME", "ABOUT", "SKILLS", "PROJECTS", "EXPERIENCE", "CONTACT"];
const SWEEP_START = -150; // deg
const SWEEP_STEP = 60; // deg  (-150 .. 150 over 6 ticks)
const clampIndex = (i) => Math.max(0, Math.min(SECTIONS.length - 1, i));
const angleFor = (i) => SWEEP_START + i * SWEEP_STEP;
const pad = (i) => `0${i}`.slice(-2);
/* ---------- Smooth scroll for plain anchors ---------- */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
        const href = anchor.getAttribute("href");
        if (!href || href === "#")
            return;
        const target = document.querySelector(href);
        if (!target)
            return;
        e.preventDefault();
        target.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "start",
        });
    });
});
/* ---------- Rotary knob ---------- */
const knob = document.getElementById("knob");
const dial = document.getElementById("knob-dial");
const readoutNum = document.getElementById("readout-num");
const readoutName = document.getElementById("readout-name");
const ticks = Array.from(document.querySelectorAll(".knob-tick"));
let currentIndex = 0;
let dragging = false;
let navLock = false;
let navTarget = -1;
let navTimer = 0;
function paintReadout(i) {
    if (readoutNum)
        readoutNum.textContent = pad(i);
    if (readoutName)
        readoutName.textContent = NAMES[i];
    ticks.forEach((t, k) => t.classList.toggle("active", k === i));
}
/** Reflect a section in the knob (rotation + readout + aria). No scrolling. */
function setActive(i) {
    currentIndex = clampIndex(i);
    dial?.style.setProperty("--angle", `${angleFor(currentIndex)}deg`);
    paintReadout(currentIndex);
    if (knob) {
        knob.setAttribute("aria-valuenow", String(currentIndex));
        knob.setAttribute("aria-valuetext", `${pad(currentIndex)} ${NAMES[currentIndex]}`);
    }
}
/** Navigate to a section: rotate knob + scroll the page there. */
function goTo(i) {
    const idx = clampIndex(i);
    navTarget = idx;
    navLock = true;
    setActive(idx);
    document.getElementById(SECTIONS[idx])?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
    });
    window.clearTimeout(navTimer);
    navTimer = window.setTimeout(() => { navLock = false; }, 1000);
}
if (knob && dial) {
    /* angle of the pointer position, expressed as a dial rotation (0deg = up) */
    const pointerToAngle = (x, y) => {
        const r = knob.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        let deg = (Math.atan2(y - cy, x - cx) * 180) / Math.PI + 90;
        if (deg > 180)
            deg -= 360;
        if (deg < -180)
            deg += 360;
        return Math.max(SWEEP_START, Math.min(angleFor(SECTIONS.length - 1), deg));
    };
    const nearestIndex = (angle) => clampIndex(Math.round((angle - SWEEP_START) / SWEEP_STEP));
    /* Drag to rotate */
    knob.addEventListener("pointerdown", (e) => {
        if (e.target.closest(".knob-tick"))
            return; // ticks handle their own click
        dragging = true;
        dial.style.transition = "none";
        try {
            knob.setPointerCapture(e.pointerId);
        }
        catch { /* noop */ }
    });
    knob.addEventListener("pointermove", (e) => {
        if (!dragging)
            return;
        const a = pointerToAngle(e.clientX, e.clientY);
        dial.style.setProperty("--angle", `${a}deg`);
        paintReadout(nearestIndex(a));
    });
    const endDrag = (e) => {
        if (!dragging)
            return;
        dragging = false;
        dial.style.transition = "";
        try {
            knob.releasePointerCapture(e.pointerId);
        }
        catch { /* noop */ }
        goTo(nearestIndex(pointerToAngle(e.clientX, e.clientY)));
    };
    knob.addEventListener("pointerup", endDrag);
    knob.addEventListener("pointercancel", endDrag);
    /* Scroll-wheel over the knob steps sections */
    let wheelLock = false;
    knob.addEventListener("wheel", (e) => {
        e.preventDefault();
        if (wheelLock)
            return;
        wheelLock = true;
        window.setTimeout(() => { wheelLock = false; }, 260);
        goTo(currentIndex + (e.deltaY > 0 ? 1 : -1));
    }, { passive: false });
    /* Keyboard (role=slider) */
    knob.addEventListener("keydown", (e) => {
        let handled = true;
        switch (e.key) {
            case "ArrowUp":
            case "ArrowRight":
                goTo(currentIndex + 1);
                break;
            case "ArrowDown":
            case "ArrowLeft":
                goTo(currentIndex - 1);
                break;
            case "Home":
                goTo(0);
                break;
            case "End":
                goTo(SECTIONS.length - 1);
                break;
            case "Enter":
            case " ":
                goTo(currentIndex);
                break;
            default: handled = false;
        }
        if (handled)
            e.preventDefault();
    });
    /* Tick buttons jump directly */
    ticks.forEach((t) => {
        t.addEventListener("click", () => {
            const idx = Number(t.dataset.index ?? "0");
            goTo(idx);
        });
    });
}
/* ---------- Scroll reveal ---------- */
const reveals = document.querySelectorAll(".reveal");
if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
}
else {
    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => revealObserver.observe(el));
}
/* ---------- Scrollspy → drives the knob ---------- */
const sectionEls = document.querySelectorAll("section[id]");
if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting)
                return;
            const idx = SECTIONS.indexOf(entry.target.id);
            if (idx < 0 || dragging)
                return;
            if (navLock) {
                if (idx === navTarget)
                    navLock = false;
                else
                    return;
            }
            setActive(idx);
        });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sectionEls.forEach((s) => spy.observe(s));
}
/* ---------- Rail clock ---------- */
const clockEl = document.getElementById("rail-clock");
if (clockEl) {
    const tick = () => {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        const ss = String(now.getSeconds()).padStart(2, "0");
        clockEl.textContent = `${hh}:${mm}:${ss}`;
    };
    tick();
    window.setInterval(tick, 1000);
}
/* ---------- Footer year ---------- */
const yearEl = document.getElementById("year");
if (yearEl)
    yearEl.textContent = String(new Date().getFullYear());
/* ---------- Init ---------- */
setActive(0);
