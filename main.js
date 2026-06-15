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
const ticks = Array.from(document.querySelectorAll(".knob-tick"));
const SWEEP_END = angleFor(SECTIONS.length - 1); // +150deg (tick "05")
const SWEEP_TOTAL = SWEEP_END - SWEEP_START; // 300deg of dial travel
let currentIndex = 0;
let lastIndex = -1;
let dragging = false;
const clamp01 = (f) => Math.max(0, Math.min(1, f));
/** Total scrollable distance: 0 = page top, maxScroll() = page bottom. */
const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
/** scroll fraction (0=top, 1=bottom) ↔ dial angle (00 tick ↔ 05 tick) */
const fracToAngle = (f) => SWEEP_START + clamp01(f) * SWEEP_TOTAL;
const angleToFrac = (a) => clamp01((a - SWEEP_START) / SWEEP_TOTAL);
const nearestIndex = (angle) => clampIndex(Math.round((angle - SWEEP_START) / SWEEP_STEP));
function paintReadout(i) {
    ticks.forEach((t, k) => t.classList.toggle("active", k === i));
}
/** Reflect a scroll fraction on the knob: dial rotation + readout + aria. No scrolling. */
function syncKnob(frac) {
    const angle = fracToAngle(frac);
    dial?.style.setProperty("--angle", `${angle}deg`);
    currentIndex = nearestIndex(angle);
    paintReadout(currentIndex);
    if (currentIndex !== lastIndex) {
        lastIndex = currentIndex;
        setDisplay(NAMES[currentIndex]);
    }
    if (knob) {
        knob.setAttribute("aria-valuenow", String(currentIndex));
        knob.setAttribute("aria-valuetext", `${pad(currentIndex)} ${NAMES[currentIndex]}`);
    }
}
/** Smooth-scroll to a section (used by ticks + keyboard). */
function goToSection(i) {
    const idx = clampIndex(i);
    document.getElementById(SECTIONS[idx])?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
    });
}
if (knob && dial) {
    /* pointer position → dial angle, clamped to the 00‒05 travel arc */
    const pointerToAngle = (x, y) => {
        const r = knob.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        let deg = (Math.atan2(y - cy, x - cx) * 180) / Math.PI + 90;
        if (deg > 180)
            deg -= 360;
        if (deg < -180)
            deg += 360;
        return Math.max(SWEEP_START, Math.min(SWEEP_END, deg));
    };
    /* Drag the knob → scroll the page continuously, in immediate sync */
    knob.addEventListener("pointerdown", (e) => {
        if (e.target.closest(".knob-tick"))
            return; // ticks handle their own click
        dragging = true;
        dial.style.transition = "none"; // follow the finger with no lag
        try {
            knob.setPointerCapture(e.pointerId);
        }
        catch { /* noop */ }
    });
    knob.addEventListener("pointermove", (e) => {
        if (!dragging)
            return;
        const frac = angleToFrac(pointerToAngle(e.clientX, e.clientY));
        window.scrollTo(0, frac * maxScroll());
        syncKnob(frac);
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
    };
    knob.addEventListener("pointerup", endDrag);
    knob.addEventListener("pointercancel", endDrag);
    /* Scroll-wheel over the knob scrolls the page (continuous) */
    knob.addEventListener("wheel", (e) => {
        e.preventDefault();
        window.scrollBy(0, e.deltaY);
    }, { passive: false });
    /* Keyboard (role=slider): step through sections */
    knob.addEventListener("keydown", (e) => {
        let handled = true;
        switch (e.key) {
            case "ArrowUp":
            case "ArrowRight":
                goToSection(currentIndex + 1);
                break;
            case "ArrowDown":
            case "ArrowLeft":
                goToSection(currentIndex - 1);
                break;
            case "Home":
                goToSection(0);
                break;
            case "End":
                goToSection(SECTIONS.length - 1);
                break;
            default: handled = false;
        }
        if (handled)
            e.preventDefault();
    });
    /* Tick buttons jump directly to a section */
    ticks.forEach((t) => {
        t.addEventListener("click", () => goToSection(Number(t.dataset.index ?? "0")));
    });
    /* Page scroll → keep the knob in sync (continuous, both directions) */
    let scrollRaf = 0;
    const onScroll = () => {
        if (dragging || scrollRaf)
            return;
        scrollRaf = window.requestAnimationFrame(() => {
            scrollRaf = 0;
            syncKnob(window.scrollY / maxScroll());
        });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
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
/* ---------- Dot-matrix section display ---------- */
/* 5×7 LED font — only the glyphs used by the section names. */
const DM_COLS = 5;
const DM_ROWS = 7;
const FONT_5x7 = {
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
    A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
    E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
    J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
    K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
    L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    N: ["10001", "11001", "11001", "10101", "10011", "10011", "10001"],
    O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
};
const dotMatrix = document.getElementById("dot-matrix");
const dmSr = document.getElementById("dm-sr");
const DM_LEN = Math.max(...NAMES.map((n) => n.length)); // widest section name
const dmCells = [];
/** Build the fixed-width grid of LED dots once. */
function buildDotMatrix() {
    if (!dotMatrix)
        return;
    for (let c = 0; c < DM_LEN; c++) {
        const cell = document.createElement("div");
        cell.className = "dm-char";
        const dots = [];
        for (let i = 0; i < DM_COLS * DM_ROWS; i++) {
            const dot = document.createElement("span");
            dot.className = "dm-dot";
            cell.appendChild(dot);
            dots.push(dot);
        }
        dotMatrix.appendChild(cell);
        dmCells.push(dots);
    }
}
/** Light the dots to spell `text`, centered in the display window. */
function setDisplay(text) {
    const s = text.toUpperCase();
    const offset = Math.max(0, Math.floor((DM_LEN - s.length) / 2));
    for (let c = 0; c < DM_LEN; c++) {
        const dots = dmCells[c];
        if (!dots)
            continue;
        const glyph = FONT_5x7[s[c - offset]] ?? FONT_5x7[" "];
        for (let r = 0; r < DM_ROWS; r++) {
            const bits = glyph[r];
            for (let col = 0; col < DM_COLS; col++) {
                dots[r * DM_COLS + col].classList.toggle("on", bits[col] === "1");
            }
        }
    }
    if (dmSr)
        dmSr.textContent = text.charAt(0) + text.slice(1).toLowerCase();
}
buildDotMatrix();
/* ---------- Init ---------- */
syncKnob(window.scrollY / maxScroll());
