// ============================================================
// AARUSH ECO TECH — PAGE-INDUSTRIES JS  ✅ PRIMARY JS BLOCK
// Page-specific JavaScript for industries.html ONLY.
//
// Phase 2 refactor — extracted from inline <script> in industries.html
//
// Contents:
//   1. Email obfuscation IIFE   — decodes #contact-email
//   2. Scroll progress bar      — window scroll → #scroll-progress width
//   3. Hero parallax zoom       — window load → #heroBg .loaded class
//   4. Scroll reveal observer   — .reveal elements → .visible class
//   5. switchTab(event, tabId)  — industry tab switcher (WINDOW-SCOPED)
//   6. Counter animation        — .impact-band → .count-up[data-target]
//
// Dependency: core.js (global: nav, analytics, WhatsApp, etc.)
//
// SCOPE NOTE: switchTab() must remain a top-level function declaration.
// It is called via onclick="switchTab(event,'malls')" attributes in the
// HTML — wrapping it in DOMContentLoaded or an IIFE would break it.
// ============================================================


// ==================== SCROLL PROGRESS BAR ====================
window.addEventListener('scroll', function () {
    var st = document.documentElement.scrollTop || document.body.scrollTop;
    var sh = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var bar = document.getElementById('scroll-progress');
    if (bar) bar.style.width = ((st / sh) * 100) + '%';
});

// ==================== HERO PARALLAX ZOOM ====================
// Adds .loaded to #heroBg after a short delay on page load.
// CSS transitions the background-size for a subtle zoom-in effect.
window.addEventListener('load', function () {
    var bg = document.getElementById('heroBg');
    if (bg) setTimeout(function () { bg.classList.add('loaded'); }, 100);
});

// ==================== SCROLL REVEAL ====================
// Industries page uses .visible (not .in) — distinct from components.css system.
var ro = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            ro.unobserve(e.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(function (el) {
    ro.observe(el);
});

// ==================== TAB SWITCHER ====================
// MUST be top-level — called by onclick="switchTab(event,'malls')" in HTML.
// Activates the correct .ind-tab-panel and updates aria-selected on buttons.
function switchTab(event, tabId) {
    document.querySelectorAll('.ind-tab-panel').forEach(function (p) {
        p.classList.remove('active');
    });
    document.querySelectorAll('.ind-tab-btn').forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
    });
    var panel = document.getElementById('tab-' + tabId);
    if (panel) panel.classList.add('active');
    if (event.currentTarget) {
        event.currentTarget.classList.add('active');
        event.currentTarget.setAttribute('aria-selected', 'true');
    }
}

// ==================== COUNTER ANIMATION ====================
// Triggers count-up animation when .impact-band enters the viewport.
var co = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.count-up').forEach(function (counter) {
                var target = parseInt(counter.getAttribute('data-target'), 10) || 0;
                var start = performance.now();
                var dur = 1800;
                function upd(now) {
                    var p = Math.min((now - start) / dur, 1);
                    var e = 1 - Math.pow(1 - p, 4); // ease-out quartic
                    counter.textContent = Math.floor(e * target);
                    if (p < 1) {
                        requestAnimationFrame(upd);
                    } else {
                        counter.textContent = target;
                    }
                }
                requestAnimationFrame(upd);
            });
            co.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

var ib = document.querySelector('.impact-band');
if (ib) co.observe(ib);

// ==================== IMAGE PROTECTION ====================
// Prevent right-click "Save Image As" and drag-to-save on all
// glass-framed image containers across the page.
(function () {
    var selectors = [
        '.panel-hero-img',
        '.pis-main',
        '.pis-side-img',
        '.how-img-wrap',
        '.nz-img-wrap',
        '.hero-pedigree-logo'
    ];
    var containers = document.querySelectorAll(selectors.join(','));
    containers.forEach(function (el) {
        el.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });
        el.addEventListener('dragstart', function (e) {
            e.preventDefault();
        });
    });
})();
