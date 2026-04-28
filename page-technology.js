// ============================================================
// AARUSH ECO TECH — PAGE-TECHNOLOGY JS  ✅ PRIMARY JS BLOCK
// Page-specific JavaScript for technology.html ONLY.
//
// Contents:
//   1. createNetworkAnimation() — hero IoT network canvas
//   2. Component Explorer       — .component-item tab switching
//   3. Comparison Slider        — drag/touch interaction
//   4. animateCounter()         — stats-showcase count-up
//   5. Scroll Reveal Observer   — .scroll-reveal → .revealed
//   6. Smooth Scroll            — anchor link handler
//   7. Platform Tab Switching   — .platform-tab click
//   8. Leaflet Map Init         — 20 markers, event log, live alert
//   9. ROI Calculator           — bins/collections/trip sliders
//  10. Live Terminal            — streaming event feed
//
// Dependencies:
//   - core.js (global: nav, footer, analytics, etc.)
//   - Leaflet (loaded via CDN, deferred — retried via setTimeout)
// ============================================================

// ==================== IoT NETWORK CANVAS ANIMATION (REMOVED) ====================
// Canvas animation removed — hero glow + grid provide sufficient visual texture.

// ==================== COMPONENT EXPLORER ====================
(function () {
    var items = document.querySelectorAll('.component-item');
    var visuals = document.querySelectorAll('.component-visual');
    var section = document.querySelector('.component-explorer');
    if (!items.length || !section) return;

    var activeIdx = 0;
    var cycleTimer = null;
    var pauseTimer = null;
    var isInView = false;
    var CYCLE_MS = 3000;   // auto-advance every 3s
    var PAUSE_AFTER = 8000;   // resume auto after 8s of no clicks

    function activate(idx) {
        activeIdx = idx;
        items.forEach(function (i) { i.classList.remove('active'); });
        visuals.forEach(function (v) { v.classList.remove('active'); });
        items[idx].classList.add('active');
        var key = items[idx].dataset.component;
        var vis = document.querySelector('[data-visual="' + key + '"]');
        if (vis) vis.classList.add('active');
    }

    function advance() {
        activate((activeIdx + 1) % items.length);
    }

    function startCycle() {
        stopCycle();
        cycleTimer = setInterval(advance, CYCLE_MS);
    }

    function stopCycle() {
        if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
    }

    // Click: select card, pause auto-cycle, resume after PAUSE_AFTER
    items.forEach(function (item, i) {
        item.addEventListener('click', function () {
            activate(i);
            stopCycle();
            clearTimeout(pauseTimer);
            pauseTimer = setTimeout(function () {
                if (isInView) startCycle();
            }, PAUSE_AFTER);
        });
    });

    // Only auto-cycle when section is visible in viewport
    if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
            isInView = entries[0].isIntersecting;
            if (isInView) {
                startCycle();
            } else {
                stopCycle();
            }
        }, { threshold: 0.05 });
        obs.observe(section);
    }
})();

// ==================== COMPARISON SLIDER ====================
var isDragging = false;

function updateComparison(e) {
    if (e.touches && !isDragging) return;
    var sliderEl = document.getElementById('comparisonSlider');
    var dividerEl = document.getElementById('comparisonDivider');
    var afterEl = document.getElementById('comparisonAfter');
    if (!sliderEl || !dividerEl || !afterEl) return;
    var rect = sliderEl.getBoundingClientRect();
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    var pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    dividerEl.style.left = pct + '%';
    afterEl.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
}

document.addEventListener('DOMContentLoaded', function () {
    var sliderEl = document.getElementById('comparisonSlider');
    var dividerEl = document.getElementById('comparisonDivider');
    if (sliderEl) sliderEl.addEventListener('mousemove', updateComparison);
    if (dividerEl) dividerEl.addEventListener('touchstart', function () { isDragging = true; });
    document.addEventListener('touchend', function () { isDragging = false; });
    document.addEventListener('touchmove', updateComparison);
});

// ==================== ANIMATED COUNTER ====================
function animateCounter(el) {
    var target = parseInt(el.dataset.count);
    var duration = 2000;
    var increment = target / (duration / 16);
    var current = 0;
    var timer = setInterval(function () {
        current += increment;
        if (current >= target) {
            el.textContent = target;
            clearInterval(timer);
        } else {
            el.textContent = Math.floor(current);
        }
    }, 16);
}

// ==================== SCROLL REVEAL ====================
var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            if (entry.target.classList.contains('stats-showcase')) {
                entry.target.querySelectorAll('[data-count]').forEach(animateCounter);
            }
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2, rootMargin: '0px 0px -100px 0px' });

document.querySelectorAll('.scroll-reveal').forEach(function (el) {
    revealObserver.observe(el);
});

// ==================== SMOOTH SCROLL (ANCHOR LINKS) ====================
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        var target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ==================== PLATFORM TAB SWITCHING ====================
document.querySelectorAll('.platform-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
        var platform = this.dataset.platform;
        document.querySelectorAll('.platform-tab').forEach(function (t) {
            t.classList.remove('active');
        });
        document.querySelectorAll('.platform-content').forEach(function (c) {
            c.classList.remove('active');
        });
        this.classList.add('active');
        var content = document.querySelector('[data-content="' + platform + '"]');
        if (content) content.classList.add('active');
    });
});

// ==================== LEAFLET MAP + LIVE SIMULATION ====================
document.addEventListener('DOMContentLoaded', function () {
    // createNetworkAnimation() removed — canvas animation no longer used

    var _leafletRetries = 0;
    function initDashboard() {
        if (typeof L === 'undefined') {
            if (++_leafletRetries < 25) setTimeout(initDashboard, _leafletRetries < 5 ? 200 : 500);
            return;
        }
        var mapEl = document.getElementById('map');
        if (!mapEl) return;

        var map = L.map('map', { scrollWheelZoom: false, zoomControl: true }).setView([27.55, 79.20], 7);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);

        // ── BIN DATA MODEL — 20 bins across 3 pilot zones ──
        var bins = [
            // Delhi NCR (~28.61, 77.21) — 8 bins
            { id: 'NCR-01', zone: 'NCR \u00b7 Connaught Place', lat: 28.6315, lng: 77.2167, fill: 41, bat: 93 },
            { id: 'NCR-02', zone: 'NCR \u00b7 Nehru Place', lat: 28.5494, lng: 77.2530, fill: 73, bat: 85 },
            { id: 'NCR-03', zone: 'NCR \u00b7 Saket', lat: 28.5244, lng: 77.2167, fill: 52, bat: 91 },
            { id: 'NCR-04', zone: 'NCR \u00b7 Lajpat Nagar', lat: 28.5677, lng: 77.2433, fill: 37, bat: 89 },
            { id: 'NCR-05', zone: 'NCR \u00b7 Rohini', lat: 28.7041, lng: 77.1025, fill: 38, bat: 94 },
            { id: 'NCR-06', zone: 'NCR \u00b7 Dwarka', lat: 28.5921, lng: 77.0460, fill: 25, bat: 97 },
            { id: 'NCR-07', zone: 'NCR \u00b7 Noida Sec-18', lat: 28.5705, lng: 77.3214, fill: 61, bat: 80 },
            { id: 'NCR-08', zone: 'NCR \u00b7 Gurugram', lat: 28.4949, lng: 77.0880, fill: 57, bat: 86 },
            // Faridabad (~28.41, 77.31) — 4 bins
            { id: 'FBD-01', zone: 'Faridabad \u00b7 NIT', lat: 28.3820, lng: 77.3167, fill: 48, bat: 82 },
            { id: 'FBD-02', zone: 'Faridabad \u00b7 Sec-15', lat: 28.3900, lng: 77.3200, fill: 31, bat: 88 },
            { id: 'FBD-03', zone: 'Faridabad \u00b7 Ballabhgarh', lat: 28.3427, lng: 77.3217, fill: 33, bat: 79 },
            { id: 'FBD-04', zone: 'Faridabad \u00b7 Industrial', lat: 28.4100, lng: 77.3000, fill: 68, bat: 72 },
            // Kanpur (~26.45, 80.35) — 8 bins
            { id: 'KNP-01', zone: 'Kanpur \u00b7 Naveen Market', lat: 26.4716, lng: 80.3414, fill: 62, bat: 87 },
            { id: 'KNP-02', zone: 'Kanpur \u00b7 Swaroop Nagar', lat: 26.4780, lng: 80.3150, fill: 45, bat: 92 },
            { id: 'KNP-03', zone: 'Kanpur \u00b7 Gumti No. 5', lat: 26.4580, lng: 80.3050, fill: 34, bat: 78 },
            { id: 'KNP-04', zone: 'Kanpur \u00b7 Civil Lines', lat: 26.4800, lng: 80.3480, fill: 18, bat: 95 },
            { id: 'KNP-05', zone: 'Kanpur \u00b7 Birhana Road', lat: 26.4620, lng: 80.3300, fill: 55, bat: 81 },
            { id: 'KNP-06', zone: 'Kanpur \u00b7 Mall Road', lat: 26.4700, lng: 80.3550, fill: 43, bat: 88 },
            { id: 'KNP-07', zone: 'Kanpur \u00b7 Station Area', lat: 26.4500, lng: 80.3500, fill: 71, bat: 74 },
            { id: 'KNP-08', zone: 'Kanpur \u00b7 Kidwai Nagar', lat: 26.4650, lng: 80.3200, fill: 29, bat: 90 }
        ];

        var totalCollections = 0;
        var totalAlerts = 0;

        // ── COLOUR HELPER ──
        function binColor(fill) {
            return fill > 85 ? '#ef4444' : fill > 65 ? '#f59e0b' : '#16a34a';
        }

        // ── CREATE MARKERS ──
        function makeIcon(fill) {
            var c = binColor(fill);
            return L.divIcon({
                className: 'market-icon',
                html: '<div style="background:' + c + ';width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 10px ' + c + '66;animation:tsp-pulse 2s ease infinite;"></div>',
                iconSize: [12, 12]
            });
        }

        function tooltipHtml(b) {
            var c = binColor(b.fill);
            return '<div style="font-size:.78rem;line-height:1.5;min-width:140px;padding:2px 0;">' +
                '<strong>' + b.id + '</strong><br>' +
                '<span style="color:#6b7280;">' + b.zone + '</span><br>' +
                '<div style="margin:4px 0 2px;background:#e5e7eb;border-radius:3px;height:6px;overflow:hidden;">' +
                '<div style="width:' + b.fill + '%;height:100%;background:' + c + ';border-radius:3px;transition:width .5s;"></div>' +
                '</div>' +
                '<div style="display:flex;justify-content:space-between;font-size:.7rem;margin-top:2px;">' +
                '<span style="color:' + c + ';font-weight:700;">Fill: ' + b.fill + '%</span>' +
                '<span style="color:#6b7280;">\uD83D\uDD0B ' + b.bat + '%</span>' +
                '</div></div>';
        }

        bins.forEach(function (b) {
            b.marker = L.marker([b.lat, b.lng], { icon: makeIcon(b.fill) })
                .addTo(map)
                .bindTooltip(tooltipHtml(b), { sticky: true, offset: [8, 0] });
        });

        // Zone overlays
        var zs = { color: '#16a34a', weight: 1, opacity: 0.15, fillOpacity: 0.02 };
        L.circle([28.59, 77.18], { radius: 18000, color: zs.color, weight: zs.weight, opacity: zs.opacity, fillOpacity: zs.fillOpacity }).addTo(map);  // NCR
        L.circle([28.38, 77.31], { radius: 8000, color: zs.color, weight: zs.weight, opacity: zs.opacity, fillOpacity: zs.fillOpacity }).addTo(map);  // Faridabad
        L.circle([26.47, 80.33], { radius: 12000, color: zs.color, weight: zs.weight, opacity: zs.opacity, fillOpacity: zs.fillOpacity }).addTo(map);  // Kanpur

        // ── UPDATE MARKER ON MAP ──
        function refreshMarker(b) {
            b.marker.setIcon(makeIcon(b.fill));
            b.marker.setTooltipContent(tooltipHtml(b));
        }

        // ── UPDATE DASHBOARD CARDS ──
        function refreshDashboard() {
            // Avg fill
            var sum = 0;
            var buckets = [0, 0, 0, 0, 0]; // 0-20, 20-40, 40-60, 60-80, 80+
            bins.forEach(function (b) {
                sum += b.fill;
                var idx = Math.min(4, Math.floor(b.fill / 20));
                buckets[idx]++;
            });
            var avg = Math.round(sum / bins.length);

            var el = document.getElementById('dashAvgFill');
            if (el) el.textContent = avg + '%';

            var elC = document.getElementById('dashCollections');
            if (elC) elC.textContent = totalCollections;

            var elA = document.getElementById('dashAlerts');
            if (elA) elA.textContent = totalAlerts;

            // Fill distribution histogram (max bucket height = 100%)
            var maxB = Math.max.apply(null, buckets) || 1;
            for (var i = 0; i < 5; i++) {
                var bar = document.getElementById('fb' + i);
                if (bar) bar.style.height = Math.max(5, Math.round((buckets[i] / maxB) * 100)) + '%';
            }

            // Last sync
            var syncEl = document.getElementById('dashLastSync');
            if (syncEl) syncEl.textContent = 'Last sync: ' + new Date().toLocaleTimeString();
        }

        // ── EVENT LOG ──
        var log = document.getElementById('eventLog');
        function addLog(msg) {
            if (!log) return;
            var line = document.createElement('div');
            line.className = 'log-line';
            line.textContent = '> [' + new Date().toLocaleTimeString() + '] ' + msg;
            log.prepend(line);
            if (log.children.length > 7) log.lastElementChild.remove();
        }

        // ── ALERT TOAST ──
        var alertEl = document.getElementById('liveAlert');
        var alertText = document.getElementById('alertText');
        var alertTimer = null;

        function showAlert(msg) {
            if (!alertEl || !alertText) return;
            alertText.textContent = msg;
            alertEl.classList.add('alert-toast--visible');
            totalAlerts++;
            clearTimeout(alertTimer);
            alertTimer = setTimeout(function () {
                alertEl.classList.remove('alert-toast--visible');
            }, 5000);
        }

        // ── SIMULATION TICK (every 3s) ──
        function simTick() {
            // Pick 3-6 random bins to update
            var count = 3 + Math.floor(Math.random() * 4);
            for (var t = 0; t < count; t++) {
                var idx = Math.floor(Math.random() * bins.length);
                var b = bins[idx];

                // Increase fill by 2-8%
                var inc = 2 + Math.floor(Math.random() * 7);
                b.fill = Math.min(100, b.fill + inc);

                // Battery drain (tiny)
                b.bat = Math.max(10, b.bat - Math.floor(Math.random() * 2));
                // Solar recharge during day hours
                var hr = new Date().getHours();
                if (hr >= 6 && hr <= 18) b.bat = Math.min(100, b.bat + Math.floor(Math.random() * 3));

                // Sync log
                if (Math.random() > 0.4) {
                    addLog(b.id + ': Fill ' + b.fill + '% \u00b7 Sync OK');
                } else {
                    addLog(b.id + ': Battery ' + b.bat + '% \u00b7 Solar ' + (hr >= 6 && hr <= 18 ? 'charging' : 'standby'));
                }

                // Threshold alert
                if (b.fill >= 80 && b.fill < 95 && Math.random() > 0.5) {
                    showAlert('\u26a0 ' + b.id + ' fill rising \u2014 ' + b.fill + '% (' + b.zone + ')');
                    addLog(b.id + ': \u26a0 Threshold warning \u00b7 Alert dispatched');
                }

                // Auto-collection when bin hits 95%+
                if (b.fill >= 95) {
                    totalCollections++;
                    var oldFill = b.fill;
                    b.fill = 5 + Math.floor(Math.random() * 12); // reset to 5-16%
                    b.bat = Math.min(100, b.bat + 5); // slight battery bump from interaction
                    addLog(b.id + ': \u2705 Collection completed (' + oldFill + '% \u2192 ' + b.fill + '%) \u00b7 Crew dispatched');
                    showAlert('\u2705 ' + b.id + ' collected & reset (' + b.zone + ')');
                }

                refreshMarker(b);
            }

            refreshDashboard();
        }

        // Initial dashboard state
        refreshDashboard();

        // Start simulation after a short delay
        setTimeout(function () {
            addLog('System online \u00b7 20 bins connected \u00b7 3 zones active');
            addLog('MQTT broker: Connected \u00b7 TLS OK');
            setInterval(simTick, 3000);
        }, 1500);
    }

    initDashboard();
});

/* ============================================================
   MERGED FROM VISION.HTML — ROI Calculator, Terminal, KPI Counters
   ============================================================ */

/* ── ROI Calculator ── */
(function () {
    const industryMultipliers = { food: 1.2, industrial: 1.4, msme: 1.0, mall: 1.1, campus: 0.9, ulb: 1.6 };

    function calc() {
        const binsEl = document.getElementById('bins-range');
        const collEl = document.getElementById('coll-range');
        const tripEl = document.getElementById('trip-range');
        const indEl = document.getElementById('industry-select');
        if (!binsEl || !collEl || !tripEl || !indEl) return;

        const bins = +binsEl.value;
        const coll = +collEl.value;
        const trip = +tripEl.value / 100;
        const ind = indEl.value;
        const mult = industryMultipliers[ind] || 1;

        // GHG: ~2.1 kgCO2e per collection prevented
        const ghg = Math.round(bins * coll * 30 * trip * 2.1 * mult);
        // Savings: Rs.350 per trip saved (fuel + labour)
        const savings = Math.round(bins * coll * 30 * trip * 350 * mult);
        // Diversion: base 30% + adjustments
        const div = Math.min(65, Math.round((30 + trip * 60) * mult));

        animateCalcNum('out-ghg', ghg, '', '');
        animateCalcNum('out-savings', savings, '', '\u20B9', true);
        animateCalcNum('out-diversion', div, '%', '');

        var bv = document.getElementById('bins-val');
        var cv = document.getElementById('coll-val');
        var tv = document.getElementById('trip-val');
        if (bv) bv.textContent = bins;
        if (cv) cv.textContent = coll;
        if (tv) tv.textContent = Math.round(trip * 100) + '%';
    }

    function animateCalcNum(id, target, suffix, prefix, commas) {
        var el = document.getElementById(id);
        if (!el) return;
        var cur = parseInt(el.textContent.replace(/[^0-9]/g, '')) || 0;
        var step = Math.ceil(Math.abs(target - cur) / 20);
        var dir = target > cur ? 1 : -1;
        var iv = setInterval(function () {
            cur += dir * step;
            if ((dir > 0 && cur >= target) || (dir < 0 && cur <= target)) cur = target;
            el.textContent = prefix + (commas ? cur.toLocaleString('en-IN') : cur) + suffix;
            if (cur === target) clearInterval(iv);
        }, 25);
    }

    ['bins-range', 'coll-range', 'trip-range', 'industry-select'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('input', calc);
    });

    // Initial calculation after DOM ready
    if (document.getElementById('bins-range')) calc();
})();

/* ── Live Terminal (Tech Page) ── */
(function () {
    var body = document.getElementById('terminal-body-tech');
    if (!body) return;

    var bins = ['IBN-DL-001', 'IBN-DL-007', 'IBN-DL-012', 'IBN-DL-042', 'IBN-FB-003', 'IBN-FB-007', 'IBN-FB-011', 'IBN-KP-002', 'IBN-KP-008', 'IBN-KP-013', 'IBN-FDB-004', 'IBN-FDB-009', 'IBN-FDB-015', 'IBN-FDB-019', 'IBN-DL-025', 'IBN-DL-031', 'IBN-DL-038', 'IBN-DL-055', 'IBN-DL-072', 'IBN-DL-088'];

    function randInt(min, max) { return Math.floor(Math.random() * (max - min) + min); }
    function randFill() { return randInt(15, 95); }
    function randBatt() { return randInt(45, 99); }

    var events = [
        function (b, ts) { return '<span class="term-ts">' + ts + '</span> <span class="term-tag-data">[DATA]</span>  ' + b + ' \u00b7 fill=<span style="color:#22c55e">' + randFill() + '%</span> \u00b7 battery=' + randBatt() + '% \u00b7 solar=ON'; },
        function (b, ts) { return '<span class="term-ts">' + ts + '</span> <span class="term-tag-alert">[ALERT]</span> ' + b + ' \u00b7 fill=<span style="color:#f59e0b">' + randInt(80, 96) + '%</span> \u00b7 dispatch triggered \u2192 driver notified'; },
        function (b, ts) { return '<span class="term-ts">' + ts + '</span> <span class="term-tag-ok">[ESG]</span>   ' + b + ' \u00b7 collection complete \u00b7 +' + (randInt(20, 55) / 10).toFixed(1) + ' kg CO\u2082e avoided \u00b7 ledger written'; },
        function (b, ts) { return '<span class="term-ts">' + ts + '</span> <span class="term-tag-data">[SYNC]</span>  ' + b + ' \u00b7 heartbeat OK \u00b7 uptime=99.' + randInt(1, 4) + '% \u00b7 packets=' + randInt(1800, 4200); },
        function (b, ts) { return '<span class="term-ts">' + ts + '</span> <span class="term-tag-ok">[OTA]</span>   ' + b + ' \u00b7 firmware v2.4.1 \u2192 v2.4.2 \u00b7 update successful'; },
        function (b, ts) { return '<span class="term-ts">' + ts + '</span> <span class="term-tag-alert">[WARN]</span>  ' + b + ' \u00b7 battery=<span style="color:#f59e0b">' + randInt(12, 22) + '%</span> \u00b7 solar charging \u00b7 ETA full: ' + (randInt(15, 45) / 10).toFixed(1) + 'h'; },
        function (b, ts) { return '<span class="term-ts">' + ts + '</span> <span class="term-tag-data">[ROUTE]</span> Optimizer: ' + randInt(2, 5) + ' bins ready \u00b7 route recalculated \u00b7 ' + randInt(1, 4) + ' trips saved'; },
        function (b, ts) { return '<span class="term-ts">' + ts + '</span> <span class="term-tag-ok">[BRSR]</span>  Q1 KPI snapshot \u00b7 GHG=' + randInt(2200, 3400) + 'kg \u00b7 Div=' + randInt(38, 48) + '% \u00b7 Trips saved=' + randInt(1100, 1500); }
    ];

    var sec = 0;
    function ts() {
        var h = Math.floor(sec / 3600) % 24;
        var m = Math.floor(sec / 60) % 60;
        var s = sec % 60;
        return [h, m, s].map(function (v) { return String(v).padStart(2, '0'); }).join(':');
    }

    function addLine() {
        sec += randInt(3, 18);
        var b = bins[randInt(0, bins.length)];
        var ev = events[randInt(0, events.length)];
        var line = document.createElement('div');
        line.className = 'term-line-tech';
        line.innerHTML = ev(b, ts());
        var cursor = body.querySelector('.term-cursor-tech');
        if (cursor) cursor.remove();
        body.appendChild(line);
        var c = document.createElement('span');
        c.className = 'term-cursor-tech';
        body.appendChild(c);
        body.scrollTop = body.scrollHeight;
        // Keep max 50 lines
        while (body.children.length > 52) {
            body.removeChild(body.firstChild);
        }
    }

    // Boot then stream
    setTimeout(function () {
        addLine();
        setInterval(addLine, 2200);
    }, 800);
})();
