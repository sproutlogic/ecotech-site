// ============================================================
// AARUSH ECO TECH — PAGE-ESG-ANALYTICS JS  ✅ PRIMARY JS BLOCK
// Page-specific JavaScript for esg-analytics.html ONLY.
//
// Phase 2 refactor — derived from esg-analytics-page.js
//
// Dependencies:
//   - core.js          (global: nav, analytics, WhatsApp, shared footer loader)
//   - Chart.js 4.4.0   (CDN, loaded with defer BEFORE this file)
//
// Contents:
//   1.  Email obfuscation IIFE   — decodes #contact-email (from inline footer <script>)
//   2.  animateCounters()        — .count-anim count-up with decimals/prefix/suffix
//   3.  IntersectionObserver     — triggers animateCounters on #kpiStrip
//   4.  Progress bar animation   — .progress-bar 0% → target width on scroll
//   5.  Chart data constants     — DAILY_WASTE, DAILY_GHG, OVERFLOW_EVENTS, DAY_LABELS
//   6.  getTheme()               — returns theme-aware colour palette
//   7.  buildCharts()            — initialises 4 Chart.js charts
//   8.  rebuildCharts()          — destroys and rebuilds on theme change
//   9.  toggleFAQ(button)        — FAQ accordion (WINDOW-SCOPED — onclick attribute)
//   10. calculateROI()           — ROI calculator (WINDOW-SCOPED — oninput/onchange attributes)
//   11. DOMContentLoaded init    — runs calculateROI() on page load
//
// REMOVED vs esg-analytics-page.js:
//   - toggleMobileMenu() — duplicate of core.js; core.js now loaded on this page
//
// SCOPE NOTE: toggleFAQ() and calculateROI() must remain top-level function
// declarations — they are called from onclick/oninput/onchange HTML attributes.
//
// CHART TIMING: Both core.js and this file are loaded with `defer`. Chart.js CDN
// is also deferred and listed first in the HTML, so DOM-order guarantees
// Chart.js executes before this file. The `readyState` check below is retained
// as a defensive guard.
//
// FOOTER: esg-analytics.html uses shared footer injection via #site-footer.
// ============================================================


// ==================== COUNTER ANIMATION ====================
// Handles .count-anim elements with data-target, data-decimals, data-prefix, data-suffix.
// Distinct from animateKPIs() in core.js (which targets hardcoded IDs for index.html).
function animateCounters() {
    document.querySelectorAll('.count-anim').forEach(function (el) {
        var target = parseFloat(el.dataset.target);
        var decimals = parseInt(el.dataset.decimals || '0');
        var prefix = el.dataset.prefix || '';
        var suffix = el.dataset.suffix || '';
        var dur = 1800;
        var start = performance.now();

        function step(now) {
            var t = Math.min((now - start) / dur, 1);
            var ease = 1 - Math.pow(1 - t, 3);
            var val = (target * ease).toFixed(decimals);
            el.textContent = prefix + Number(val).toLocaleString('en-IN') + suffix;
            if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    });
}

// Trigger counter animation when the KPI strip enters the viewport
var obsCounter = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
        if (e.isIntersecting) {
            animateCounters();
            obsCounter.disconnect();
        }
    });
}, { threshold: 0.3 });

var kpiStrip = document.getElementById('kpiStrip');
if (kpiStrip) obsCounter.observe(kpiStrip);

// ==================== PROGRESS BAR ANIMATION ====================
// Sets progress bars to 0% width on load, then animates to target width on scroll.
var obsProgress = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
        if (e.isIntersecting) {
            var match = e.target.getAttribute('style').match(/width:\s*(\d+%)/);
            if (match) e.target.style.width = match[1];
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.progress-bar').forEach(function (bar) {
    bar.style.width = '0%';
    obsProgress.observe(bar);
});

// ==================== CHART DATA ====================
var DAILY_WASTE = [76, 85, 82, 78, 71, 88, 84, 79, 73, 81, 86, 75, 79, 84, 76, 90, 82, 88, 85, 77, 74, 79, 81, 87, 73, 83, 80, 72, 86, 82];
var DAILY_GHG = [11.2, 10.8, 12.1, 11.5, 10.9, 11.8, 10.4, 11.2, 9.8, 12.3, 11.7, 10.5, 10.2, 12.1, 11.0, 10.8, 10.1, 11.3, 11.6, 12.0, 10.7, 10.4, 12.2, 10.1, 11.1, 11.4, 10.0, 10.9, 10.3, 11.5];
var OVERFLOW_EVENTS = [2, 1, 2, 3, 1, 2, 1, 2, 1, 0, 2, 1, 3, 2, 1, 2, 1, 1, 2, 3, 1, 2, 1, 0, 2, 1, 3, 1, 2, 1];
var DAY_LABELS = Array.from({ length: 30 }, function (_, i) { return 'Day ' + (i + 1); });

// ==================== CHART THEME ====================
function getTheme() {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
        text: isDark ? '#f8fafc' : '#0f172a',
        grid: isDark ? '#334155' : '#e2e8f0',
        green: '#16a34a',
        lightGreen: '#4ade80',
        amber: '#f59e0b',
        blue: '#3b82f6',
        slate: isDark ? '#475569' : '#64748b'
    };
}

var charts = {};

function rebuildCharts() {
    Object.values(charts).forEach(function (c) { c.destroy(); });
    charts = {};
    buildCharts();
}

// ==================== BUILD CHARTS ====================
// Initialises all 4 Chart.js charts. Called once Chart.js CDN is ready.
// Guarded by canvas element existence checks — safe to call even if canvases are absent.
function buildCharts() {
    var c = getTheme();

    // ── LINE: Daily Waste Collected ──
    var wasteCanvas = document.getElementById('chartWaste');
    if (wasteCanvas) {
        charts.waste = new Chart(wasteCanvas, {
            type: 'line',
            data: {
                labels: DAY_LABELS,
                datasets: [{
                    label: 'Waste Collected (kg)',
                    data: DAILY_WASTE,
                    borderColor: c.green,
                    backgroundColor: c.green + '22',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    borderWidth: 2.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: c.text, font: { size: 12 } } },
                    tooltip: { backgroundColor: c.text, titleColor: '#fff', bodyColor: '#fff' }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { color: c.text }, grid: { color: c.grid } },
                    x: { ticks: { color: c.text, maxTicksLimit: 10 }, grid: { color: 'transparent' } }
                }
            }
        });
    }

    // ── DOUGHNUT: Waste Composition ──
    var compCanvas = document.getElementById('chartComposition');
    if (compCanvas) {
        charts.comp = new Chart(compCanvas, {
            type: 'doughnut',
            data: {
                labels: ['Mixed (81%)', 'Recyclables (19%)'],
                datasets: [{
                    data: [81, 19],
                    backgroundColor: [c.slate, c.green],
                    borderWidth: 3,
                    borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: c.text, padding: 16, font: { size: 13 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (ctx) { return ' ' + ctx.label + ': ' + ctx.parsed + '%'; }
                        }
                    }
                }
            }
        });
    }

    // ── LINE: GHG Avoided ──
    var ghgCanvas = document.getElementById('chartGHG');
    if (ghgCanvas) {
        charts.ghg = new Chart(ghgCanvas, {
            type: 'line',
            data: {
                labels: DAY_LABELS,
                datasets: [{
                    label: 'CO₂e Avoided (kg)',
                    data: DAILY_GHG,
                    borderColor: c.blue,
                    backgroundColor: c.blue + '22',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    borderWidth: 2.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: c.text, font: { size: 12 } } },
                    tooltip: { backgroundColor: c.text, titleColor: '#fff', bodyColor: '#fff' }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { color: c.text }, grid: { color: c.grid } },
                    x: { ticks: { color: c.text, maxTicksLimit: 10 }, grid: { color: 'transparent' } }
                }
            }
        });
    }

    // ── BAR: Overflow Events ──
    var overflowCanvas = document.getElementById('chartOverflow');
    if (overflowCanvas) {
        charts.overflow = new Chart(overflowCanvas, {
            type: 'bar',
            data: {
                labels: DAY_LABELS,
                datasets: [{
                    label: 'Overflow Events',
                    data: OVERFLOW_EVENTS,
                    backgroundColor: c.amber,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: c.text, font: { size: 12 } } },
                    tooltip: { backgroundColor: c.text, titleColor: '#fff', bodyColor: '#fff' }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { color: c.text, stepSize: 1 }, grid: { color: c.grid } },
                    x: { ticks: { color: c.text, maxTicksLimit: 10 }, grid: { color: 'transparent' } }
                }
            }
        });
    }
}

// Initialise charts — with defer, document is already parsed; use readyState as defensive guard
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildCharts);
} else {
    buildCharts();
}

// ==================== FAQ ACCORDION ====================
// MUST be top-level — called by onclick="toggleFAQ(this)" on FAQ buttons.
function toggleFAQ(button) {
    var faqItem = button.parentElement;
    var wasActive = faqItem.classList.contains('active');

    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(function (item) {
        item.classList.remove('active');
    });

    // Open the clicked item if it wasn't already active
    if (!wasActive) {
        faqItem.classList.add('active');
    }
}

// ==================== ROI CALCULATOR ====================
// MUST be top-level — called by oninput="calculateROI()" and onchange="calculateROI()".
function calculateROI() {
    var binCountEl = document.getElementById('binCount');
    var periodEl = document.getElementById('deploymentPeriod');
    if (!binCountEl || !periodEl) return;

    var binCount = parseInt(binCountEl.value, 10) || 0;
    var period = parseInt(periodEl.value, 10) || 0;

    // Update bin count display label
    document.getElementById('binCountDisplay').textContent = binCount + ' bins';

    // Update range track progress (CSS custom property for webkit gradient fill)
    var slider = document.getElementById('binCount');
    var progress = ((binCount - 5) / (100 - 5)) * 100;
    slider.style.setProperty('--range-progress', progress + '%');

    // Base metrics per 5-bin cluster per month (from measured data)
    var ghgPerClusterMonth = 0.388; // tCO₂e
    var wastePerClusterMonth = 1.0;  // tonnes
    var diversionRate = 0.19;  // 19%
    var savingsPerTon = 11725; // ₹

    var clusters = binCount / 5;
    var months = period;

    // Projected totals
    var totalGHG = (ghgPerClusterMonth * clusters * months).toFixed(2);
    var totalWaste = (wastePerClusterMonth * clusters * months).toFixed(1);
    var totalDiverted = (totalWaste * diversionRate).toFixed(2);
    var totalSavings = Math.round(totalWaste * savingsPerTon).toLocaleString('en-IN');
    var treesEquiv = Math.round(totalGHG * 43.8); // ~43.8 tree-years per tCO₂e

    // Update result display
    document.getElementById('roiGHG').textContent = totalGHG;
    document.getElementById('roiTrees').textContent = treesEquiv;
    document.getElementById('roiWaste').textContent = totalDiverted;
    document.getElementById('roiDiversion').textContent = (diversionRate * 100).toFixed(0);
    document.getElementById('roiSavings').textContent = totalSavings;
    document.getElementById('roiTotal').textContent = totalWaste;
}

// ── Scroll Reveal (pillar-style) ──
var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            revealObs.unobserve(e.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(function (el) {
    revealObs.observe(el);
});

// Initialise calculator with default values on page load
document.addEventListener('DOMContentLoaded', function () {
    calculateROI();
});
