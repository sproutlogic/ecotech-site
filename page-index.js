// ============================================================
// AARUSH ECO TECH — PAGE-INDEX JS  ✅ PRIMARY JS BLOCK (homepage)
// Phase 2 refactor — page-specific logic for index.html only.
//
// Contents:
//   1. GSAP scroll reveals + arena row stagger
//   2. Live Operations map simulation engine (from technology-simulation.js v1)
//      — PREFERRED over technology-simulation2.js:
//        v1 decouples simulate() (always-on) from render() (pauses off-screen)
//        v2 combined both into one loop (inferior for hero dashboard sync)
//   3. SmartBin anatomy canvas
//   4. KPI donut ring + tab bar animations
//   5. Hero Dashboard Sync (was inline <script> in index.html)
//   6. Compare panel toggle: showTraditional() / showSmart()
//
// Requires:
//   - GSAP + ScrollTrigger (loaded via CDN with defer)
//   - core.js (loaded first)
// ============================================================

// ── GSAP Scroll Reveals ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    // Guard: GSAP may not have loaded yet (defer) — wait for it
    if (typeof gsap === 'undefined') {
        window.addEventListener('load', initGSAP);
    } else {
        initGSAP();
    }
});

function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Add class so CSS hides animatable elements only when GSAP is running
    document.documentElement.classList.add('gsap-ready');

    // ── Viewport resize / zoom recalculation ─────────────────
    var _stRefreshTimer;
    function scheduleRefresh(delay) {
        clearTimeout(_stRefreshTimer);
        _stRefreshTimer = setTimeout(function () { ScrollTrigger.refresh(true); }, delay || 350);
    }
    window.addEventListener('resize', function () { scheduleRefresh(350); });
    
    if (window.visualViewport) {
        var _lastScale = window.visualViewport.scale;
        window.visualViewport.addEventListener('resize', function () {
            var newScale = window.visualViewport.scale;
            if (Math.abs(newScale - _lastScale) > 0.01) {
                _lastScale = newScale;
                ScrollTrigger.killAll();
                setTimeout(function () {
                    initCinematic();
                    scheduleRefresh(100);
                }, 80);
            } else {
                scheduleRefresh(350);
            }
        });
    }

    // ── Post-load recalculation ───────────────────────────────
    // Images/fonts shift layout after DOMContentLoaded — refresh fixes stale pin positions
    window.addEventListener('load', function () {
        setTimeout(function () { ScrollTrigger.refresh(true); }, 200);
    });

    // ── Cinematic Sequence ──────────────────────────────────
    function initCinematic() {
        // Query by class/ID to allow multiple cinematic sections if duplicated
        var frames = document.querySelectorAll('.cine-frame, #cine-frame');
        if (!frames.length) return;

        frames.forEach(function (frame) {
            var screens = frame.querySelectorAll('.cine-screen');
            var overlay = frame.querySelector('.cine-bg-overlay, #cine-overlay');
            var dots = frame.querySelectorAll('.cine-dot');
            var counterEl = frame.querySelector('.cine-counter, #cine-counter');
            var N = screens.length;
            if (N === 0) return;

            var counterDone = false;

            // Pin the frame — smooth scrub
            var tl = gsap.timeline({
                scrollTrigger: {
                    trigger: frame,
                    start: 'top top',
                    end: '+=' + (N * 120) + '%',
                    pin: true,
                    pinSpacing: true,
                    anticipatePin: 1,
                    scrub: 1,
                    invalidateOnRefresh: true,
                    onLeave: function () { frame.classList.add('cine-done'); },
                    onEnterBack: function () { frame.classList.remove('cine-done'); },
                    onUpdate: function (self) {
                        var active = Math.min(Math.floor(self.progress * N), N - 1);
                        dots.forEach(function (dot, idx) { dot.classList.toggle('active', idx === active); });

                        if (!counterDone && self.progress > 0.27 && counterEl) {
                            counterDone = true;
                            var start = null, end = 185000, dur = 750;
                            requestAnimationFrame(function tick(now) {
                                if (!start) start = now;
                                var p = Math.min((now - start) / dur, 1);
                                var ep = p < 0.5 ? 16 * Math.pow(p, 5) : 1 - Math.pow(-2 * p + 2, 5) / 2;
                                counterEl.textContent = Math.round(end * ep).toLocaleString('en-US');
                                if (p < 1) requestAnimationFrame(tick);
                            });
                        }
                    }
                }
            });

            // Per-line staggered reveals + fade outs
            screens.forEach(function (scr, i) {
                var pos = i;
                var children = scr.querySelectorAll('.cine-line, .cine-stat, .cine-the-bin');

                gsap.set(scr, { opacity: 1 });
                if (i === 0) {
                    // Keep screen 1 readable at timeline start (progress 0)
                    gsap.set(children, { opacity: 1, y: 0 });
                } else {
                    gsap.set(children, { opacity: 0, y: 30 });
                }

                children.forEach(function (child, j) {
                    if (child.classList.contains('cine-the-bin')) return;
                    tl.to(child, { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' }, pos + (i === 0 ? 0 : 0.05) + j * 0.08);
                });

                var arr = Array.prototype.slice.call(children);
                var isLast = (i === N - 1);
                if (!isLast) {
                    arr.forEach(function (child, j) {
                        if (child.classList.contains('cine-the-bin')) return;
                        tl.to(child, { opacity: 0, y: -20, duration: 0.15, ease: 'power2.in' }, pos + 0.65 + j * 0.05);
                    });
                }

                // Scale breathing: counter number
                var num = scr.querySelector('.cine-stat-num');
                if (num) {
                    gsap.set(num, { scale: 0.92 });
                    tl.to(num, { scale: 1, duration: 0.35, ease: 'power3.out' }, pos + 0.05);
                }

                // Drop reveal: "the Bin" + ghosted logo
                var bin = scr.querySelector('.cine-the-bin');
                if (bin) {
                    tl.fromTo(bin, { scale: 0.88, y: -40, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: 'power4.out' }, pos + 0.05);
                }
                var ghost = scr.querySelector('.cine-bin-ghost');
                if (ghost) {
                    tl.fromTo(ghost, { opacity: 0 }, { opacity: 0.07, duration: 0.5, ease: 'power2.out' }, pos + 0.05);
                    tl.to(ghost, { opacity: 0, duration: 0.25, ease: 'power1.in' }, pos + 0.62);
                }
            });

            // Overlay brightness — dynamically scales to any number of screens
            if (overlay) {
                for (var k = 0; k < N - 1; k++) {
                    tl.to(overlay, { opacity: 0.85, duration: 0.3, ease: 'power1.inOut' }, k + 0.8);
                    tl.to(overlay, { opacity: 0.55, duration: 0.3, ease: 'power1.inOut' }, k + 1.2);
                }
            }
        });
    }
    initCinematic();

    // ── Scroll Theatre — GSAP reveals ────────────────────────
    // start:'top bottom' fires the moment the element scrolls into view at all,
    // avoiding misses caused by pin-spacer offset calculations
    gsap.utils.toArray('.theatre-act').forEach(function (act) {
        gsap.fromTo(act,
            { opacity: 0, y: 35 },
            {
                opacity: 1, y: 0, duration: 0.75, ease: 'power2.out',
                scrollTrigger: { trigger: act, start: 'top bottom', once: true }
            });
    });

    // ── Evidence Strip — stagger reveal + parallax ────────────
    gsap.utils.toArray('.ev-card').forEach(function (card, i) {
        gsap.fromTo(card,
            { opacity: 0 },
            {
                opacity: 1, duration: 0.6, delay: i * 0.12, ease: 'power2.out',
                scrollTrigger: { trigger: '.ev-frame', start: 'top bottom', once: true }
            });
        var img = card.querySelector('img');
        if (img) {
            gsap.fromTo(img, { y: -25, scale: 1.08 }, {
                y: 25, scale: 1, ease: 'none',
                scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true }
            });
        }
    });

    // ── Consequence, Verdict, Bridge ─────────────────────────
    ['.ev-consequence', '.verdict-frame', '.bridge-line'].forEach(function (sel) {
        var el = document.querySelector(sel);
        if (!el) return;
        gsap.fromTo(el,
            { opacity: 0, y: 20 },
            {
                opacity: 1, y: 0, duration: 0.65, ease: 'power2.out',
                scrollTrigger: { trigger: el, start: 'top bottom', once: true }
            });
    });

    // ── Reduced-motion fallback ───────────────────────────────
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.querySelectorAll('.theatre-act, .ev-card, .ev-consequence, .verdict-frame, .bridge-line')
            .forEach(function (el) { gsap.set(el, { opacity: 1, y: 0 }); });
    }

    // Scroll reveals
    document.querySelectorAll('.reveal').forEach(function (el) {
        gsap.fromTo(el, { opacity: 0, y: 22 }, {
            opacity: 1, y: 0, duration: 0.65, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
        });
    });

    // Arena rows stagger
    gsap.from('.af-row', {
        opacity: 0, x: -8, duration: 0.45, stagger: 0.06, ease: 'power1.out',
        scrollTrigger: { trigger: '.comparison-arena', start: 'top 75%' }
    });

    // KPI bar animation trigger
    function animBars() {
        document.querySelectorAll('.kpi-panel.active .kpi-fill').forEach(function (b, i) {
            setTimeout(function () { b.style.width = b.dataset.w + '%'; }, i * 100);
        });
    }

    ScrollTrigger.create({ trigger: '#kpis', start: 'top 75%', once: true, onEnter: animBars });

    // KPI tab switching
    document.querySelectorAll('.kpi-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.kpi-tab').forEach(function (t) { t.classList.remove('active'); });
            document.querySelectorAll('.kpi-panel').forEach(function (p) { p.classList.remove('active'); });
            document.querySelectorAll('.kpi-fill').forEach(function (b) { b.style.width = '0'; });
            tab.classList.add('active');
            document.getElementById('panel-' + tab.dataset.panel).classList.add('active');
            setTimeout(animBars, 60);
        });
    });

    // KPI donut ring
    (function () {
        var canvas = document.getElementById('kpiRing');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2;
        var prog = 0;
        var groups = [
            { vals: [0.85, 0.68, 0.72, 0.95, 0.60], color: '#16a34a', r: 110 },
            { vals: [0.68, 0.72, 1, 0.92, 1], color: '#f59e0b', r: 85 },
            { vals: [0.78, 0.40, 0.85, 0.99, 0.91], color: '#3b82f6', r: 60 },
        ];

        function drawRing() {
            ctx.clearRect(0, 0, W, H);
            var gap = 0.07;
            groups.forEach(function (g) {
                var seg = Math.PI * 2 / g.vals.length;
                g.vals.forEach(function (v, i) {
                    var s = -Math.PI / 2 + i * seg + gap;
                    var e = s + seg - gap * 2;
                    var ef = s + (e - s) * v * prog;
                    ctx.beginPath(); ctx.arc(cx, cy, g.r, s, e);
                    ctx.strokeStyle = '#f1f5f9'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.stroke();
                    if (ef > s) {
                        ctx.beginPath(); ctx.arc(cx, cy, g.r, s, ef);
                        ctx.strokeStyle = g.color; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.stroke();
                    }
                });
            });
            ctx.beginPath(); ctx.arc(cx, cy, 34, 0, Math.PI * 2);
            ctx.fillStyle = '#f8fafc'; ctx.fill();
            prog = Math.min(prog + 0.016, 1);
            if (prog < 1) requestAnimationFrame(drawRing);
        }

        ScrollTrigger.create({
            trigger: '#kpis', start: 'top 72%', once: true,
            onEnter: function () { requestAnimationFrame(drawRing); }
        });
    })();

    initHeroicEntry();
}

// ── LIVE OPERATIONS MAP SIMULATION ─────────────────────────
// Source: technology-simulation.js (v1 — preferred)
// v1 keeps simulate() always running; render() pauses off-screen.
// This is architecturally superior because window.BIN_DEFS stays
// current for the Hero Dashboard Sync even when map is off-screen.
(function () {
    var canvas = document.getElementById('mapCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = 520, H = 520, CX = 260, CY = 248;

    var BIN_IDS = ['A1', 'B3', 'C2', 'D5', 'E1', 'F2'];
    window.BIN_IDS = BIN_IDS;
    var TRIGGER = 0.80;
    var BIN_DEFS = {
        A1: { pos: [76, 76], label: 'WING A', fill: 0, fillRate: 0, delayUntil: 0 },
        B3: { pos: [444, 76], label: 'WING B', fill: 0, fillRate: 0, delayUntil: 0 },
        C2: { pos: [76, 444], label: 'WING C', fill: 0, fillRate: 0, delayUntil: 0 },
        D5: { pos: [444, 444], label: 'WING D', fill: 0, fillRate: 0, delayUntil: 0 },
        E1: { pos: [260, 68], label: 'CORRIDOR N', fill: 0, fillRate: 0, delayUntil: 0 },
        F2: { pos: [260, 432], label: 'CORRIDOR S', fill: 0, fillRate: 0, delayUntil: 0 },
    };
    window.BIN_DEFS = BIN_DEFS;
    window.BIN_TRIGGER = 0.80;

    // Staggered init
    var shuf = BIN_IDS.slice().sort(function () { return 0.5 - Math.random(); });
    BIN_DEFS[shuf[0]].fill = 0.68 + Math.random() * 0.08; BIN_DEFS[shuf[0]].fillRate = 0.014;
    BIN_DEFS[shuf[1]].fill = 0.42 + Math.random() * 0.14; BIN_DEFS[shuf[1]].fillRate = 0.007;
    for (var i = 2; i < 6; i++) {
        BIN_DEFS[shuf[i]].fill = 0.06 + Math.random() * 0.20;
        BIN_DEFS[shuf[i]].fillRate = 0.003 + Math.random() * 0.004;
    }

    var veh = {
        x: CX, y: CY, phase: 'idle', currentBin: null,
        travelT: 0, startX: CX, startY: CY, destX: CX, destY: CY,
        drainStart: 0, serviceT: 0
    };
    var TRAVEL_SPD = 0.22, SERVICE_SPD = 0.28, RETURN_SPD = 0.26;
    var serviceQueue = [], collectionsToday = 0;

    function bPt(t, x0, y0, cx, cy, x1, y1) {
        var m = 1 - t;
        return { x: m * m * x0 + 2 * m * t * cx + t * t * x1, y: m * m * y0 + 2 * m * t * cy + t * t * y1 };
    }
    function cp(fx, fy, tx, ty) { return { x: (fx + tx) / 2, y: (fy + ty) / 2 }; }

    var evts = [];
    function logEvent(type, msg) {
        var d = new Date();
        var t = [d.getHours(), d.getMinutes(), d.getSeconds()].map(function (n) { return String(n).padStart(2, '0'); }).join(':');
        evts.unshift({ type: type, msg: msg, t: t });
        if (evts.length > 5) evts.pop();
        renderLog();
    }
    function renderLog() {
        var el = document.getElementById('eventList');
        if (!el) return;
        el.innerHTML = '';
        evts.forEach(function (ev) {
            var dc = ev.type === 'crit' ? 'event-dot--red' : ev.type === 'svc' ? 'event-dot--blue' : ev.type === 'done' ? 'event-dot--green' : 'event-dot--amber';
            el.innerHTML += '<div class="event-item"><span class="event-dot ' + dc + '"></span><span class="event-time">' + ev.t + '</span><span>' + ev.msg + '</span></div>';
        });
    }

    function renderQueueStrip() {
        var el = document.getElementById('queueStrip');
        if (!el) return;
        var alertEl = document.getElementById('stat-alerts');
        if (alertEl) alertEl.textContent = collectionsToday;

        if (!veh.currentBin && serviceQueue.length === 0) {
            el.innerHTML = '<span class="qs-empty">All bins optimal</span>'; return;
        }
        var html = '';
        if (veh.currentBin) {
            var ph = veh.phase === 'servicing' ? '🛠 Servicing' : veh.phase === 'travelling' ? '🚛 En route' : '↩ Returning';
            html += '<span class="qs-pill qs-pill--active"><span class="qs-dot qs-dot--green"></span>' + veh.currentBin + ' — ' + ph + '</span>';
        }
        serviceQueue.forEach(function (id) {
            html += '<span class="qs-pill qs-pill--queue"><span class="qs-dot qs-dot--amber"></span>' + id + ' — Queued</span>';
        });
        el.innerHTML = html;
    }

    function enqueue(id) {
        if (serviceQueue.includes(id) || veh.currentBin === id) return;
        serviceQueue.push(id);
        logEvent('crit', '⚠ BIN ' + id + ' at ' + Math.round(BIN_DEFS[id].fill * 100) + '% — queued for collection');
        renderQueueStrip();
        if (veh.phase === 'idle') dispatchNext();
    }

    function dispatchNext() {
        if (serviceQueue.length === 0) { veh.phase = 'idle'; veh.currentBin = null; renderQueueStrip(); return; }
        var next = serviceQueue.shift();
        veh.currentBin = next; veh.phase = 'travelling'; veh.travelT = 0;
        veh.startX = veh.x; veh.startY = veh.y;
        veh.destX = BIN_DEFS[next].pos[0]; veh.destY = BIN_DEFS[next].pos[1];
        logEvent('svc', '🚛 Vehicle dispatched → BIN ' + next);
        renderQueueStrip();
    }

    function forceCollect(id) {
        if (veh.currentBin === id || serviceQueue.includes(id)) return;
        logEvent('svc', '⚡ Manual override: BIN ' + id);
        serviceQueue.push(id); renderQueueStrip();
        if (veh.phase === 'idle') dispatchNext();
    }
    window._mapForceCollect = forceCollect;

    function binColor(f, isServ) {
        if (isServ) return { s: '#22c55e', r: 'rgba(34,197,94,' };
        if (f >= TRIGGER) return { s: '#ef4444', r: 'rgba(239,68,68,' };
        if (f >= 0.60) return { s: '#f59e0b', r: 'rgba(245,158,11,' };
        return { s: '#22c55e', r: 'rgba(34,197,94,' };
    }

    // ── Canvas visibility: pause render when off-screen ──
    var canvasVisible = false, renderRafActive = false;
    new IntersectionObserver(function (es) {
        canvasVisible = es[0].isIntersecting;
        if (canvasVisible && !renderRafActive) { renderRafActive = true; requestAnimationFrame(render); }
    }, { threshold: 0.1 }).observe(canvas);

    // ── SIMULATION LOOP — always on ──
    var lastSimTs = null, pulseT = 0;

    function simulate(ts) {
        if (!lastSimTs) lastSimTs = ts;
        var dt = Math.min(ts - lastSimTs, 50) / 1000;
        lastSimTs = ts; pulseT += dt * 1.8;

        BIN_IDS.forEach(function (id) {
            var b = BIN_DEFS[id];
            if (veh.currentBin === id && veh.phase === 'servicing') return;
            if (ts < b.delayUntil) return;
            if (b.fill < 0.90) b.fill = Math.min(b.fill + b.fillRate * dt, 0.90);
            if (b.fill >= TRIGGER && !serviceQueue.includes(id) && veh.currentBin !== id) enqueue(id);
        });

        if (veh.phase === 'travelling') {
            veh.travelT = Math.min(veh.travelT + TRAVEL_SPD * dt, 1);
            var c0 = cp(veh.startX, veh.startY, veh.destX, veh.destY);
            var p0 = bPt(veh.travelT, veh.startX, veh.startY, c0.x, c0.y, veh.destX, veh.destY);
            veh.x = p0.x; veh.y = p0.y;
            if (veh.travelT >= 1) {
                veh.phase = 'servicing'; veh.serviceT = 0; veh.drainStart = BIN_DEFS[veh.currentBin].fill;
                logEvent('svc', '🛠 Servicing BIN ' + veh.currentBin + ' — draining'); renderQueueStrip();
            }
        } else if (veh.phase === 'servicing') {
            veh.serviceT = Math.min(veh.serviceT + SERVICE_SPD * dt, 1);
            var ease = 1 - Math.pow(1 - veh.serviceT, 2);
            BIN_DEFS[veh.currentBin].fill = veh.drainStart * (1 - ease);
            if (veh.serviceT >= 1) {
                var justDone = veh.currentBin;
                BIN_DEFS[justDone].fill = 0.00;
                BIN_DEFS[justDone].delayUntil = ts + 7000;
                BIN_DEFS[justDone].fillRate = 0.003 + Math.random() * 0.007;
                collectionsToday++;
                logEvent('done', '✅ BIN ' + justDone + ' cleared — fill → 0%');
                if (serviceQueue.length > 0) {
                    var next = serviceQueue.shift();
                    veh.currentBin = next; veh.phase = 'travelling'; veh.travelT = 0;
                    veh.startX = BIN_DEFS[justDone].pos[0]; veh.startY = BIN_DEFS[justDone].pos[1];
                    veh.destX = BIN_DEFS[next].pos[0]; veh.destY = BIN_DEFS[next].pos[1];
                    logEvent('svc', '🚛 Routing to BIN ' + next + ' next'); renderQueueStrip();
                } else {
                    veh.phase = 'returning'; veh.travelT = 0;
                    veh.startX = BIN_DEFS[justDone].pos[0]; veh.startY = BIN_DEFS[justDone].pos[1];
                    veh.destX = CX; veh.destY = CY;
                    logEvent('done', '🏠 Zone clear — vehicle returning to hub'); renderQueueStrip();
                }
            }
        } else if (veh.phase === 'returning') {
            veh.travelT = Math.min(veh.travelT + RETURN_SPD * dt, 1);
            var c1 = cp(veh.startX, veh.startY, CX, CY);
            var p1 = bPt(veh.travelT, veh.startX, veh.startY, c1.x, c1.y, CX, CY);
            veh.x = p1.x; veh.y = p1.y;
            if (veh.travelT >= 1) {
                veh.x = CX; veh.y = CY; veh.currentBin = null; veh.phase = 'idle';
                renderQueueStrip(); if (serviceQueue.length > 0) dispatchNext();
            }
        }

        requestAnimationFrame(simulate); // always-on
    }

    // ── RENDER LOOP — pauses when off-screen ──
    function render(ts) {
        if (!canvasVisible) { renderRafActive = false; return; }

        ctx.clearRect(0, 0, W, H);

        var bgG = ctx.createRadialGradient(CX, CY, 30, CX, CY, 300);
        bgG.addColorStop(0, '#1a2232'); bgG.addColorStop(0.55, '#141c29'); bgG.addColorStop(1, '#0e1520');
        ctx.fillStyle = bgG; ctx.beginPath(); ctx.roundRect(0, 0, W, H, 18); ctx.fill();

        var vig = ctx.createRadialGradient(CX, CY, 160, CX, CY, 300);
        vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.45)');
        ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 0.8;
        for (var x = 40; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (var y = 40; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
        ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 8]);
        ctx.beginPath(); ctx.moveTo(CX, 0); ctx.lineTo(CX, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, CY); ctx.lineTo(W, CY); ctx.stroke();
        ctx.setLineDash([]);

        [{ x: 14, y: 14, w: 172, h: 172, lx: 100, ly: 100, lb: 'WING A' },
        { x: 334, y: 14, w: 172, h: 172, lx: 420, ly: 100, lb: 'WING B' },
        { x: 14, y: 334, w: 172, h: 172, lx: 100, ly: 420, lb: 'WING C' },
        { x: 334, y: 334, w: 172, h: 172, lx: 420, ly: 420, lb: 'WING D' }
        ].forEach(function (r) {
            var rg = ctx.createLinearGradient(r.x, r.y, r.x + r.w, r.y + r.h);
            rg.addColorStop(0, 'rgba(255,255,255,0.055)'); rg.addColorStop(1, 'rgba(255,255,255,0.020)');
            ctx.fillStyle = rg; ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, 8); ctx.fill(); ctx.stroke();
            ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 4;
            ctx.fillStyle = 'rgba(255,255,255,0.72)';
            ctx.font = '700 9.5px DM Sans,sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(r.lb, r.lx, r.ly);
            ctx.shadowBlur = 0;
        });

        ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.2;
        [[186, 100, 334, 100], [186, 420, 334, 420], [100, 186, 100, 334], [420, 186, 420, 334]].forEach(function (line) {
            ctx.beginPath(); ctx.moveTo(line[0], line[1]); ctx.lineTo(line[2], line[3]); ctx.stroke();
        });

        var hx = 184, hy = 198, hw = 152, hh = 104;
        var hubG = ctx.createRadialGradient(CX, CY, 5, CX, CY, 85);
        hubG.addColorStop(0, 'rgba(52,211,153,0.12)'); hubG.addColorStop(1, 'rgba(52,211,153,0)');
        ctx.fillStyle = hubG; ctx.beginPath(); ctx.arc(CX, CY, 85, 0, Math.PI * 2); ctx.fill();
        var hbg = ctx.createLinearGradient(hx, hy, hx, hy + hh);
        hbg.addColorStop(0, 'rgba(52,211,153,0.14)'); hbg.addColorStop(1, 'rgba(16,185,129,0.06)');
        ctx.fillStyle = hbg; ctx.strokeStyle = 'rgba(52,211,153,0.45)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(hx, hy, hw, hh, 10); ctx.fill(); ctx.stroke();
        ctx.shadowColor = 'rgba(52,211,153,0.5)'; ctx.shadowBlur = 8;
        ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.font = '700 9px DM Sans,sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('COLLECTION HUB', CX, CY - 8);
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(110,231,183,0.65)'; ctx.font = '400 7.5px Inter,sans-serif';
        ctx.fillText('AI-Powered Base', CX, CY + 8);

        BIN_IDS.forEach(function (id) {
            var b = BIN_DEFS[id];
            var isActive = veh.currentBin === id && (veh.phase === 'travelling' || veh.phase === 'servicing');
            var isPending = serviceQueue.includes(id);
            if (isActive) { ctx.strokeStyle = 'rgba(52,211,153,0.70)'; ctx.lineWidth = 2; ctx.shadowColor = 'rgba(52,211,153,0.4)'; ctx.shadowBlur = 8; }
            else if (isPending) { ctx.strokeStyle = 'rgba(251,191,36,0.55)'; ctx.lineWidth = 1.5; ctx.shadowBlur = 0; }
            else { ctx.strokeStyle = 'rgba(255,255,255,0.09)'; ctx.lineWidth = 1; ctx.shadowBlur = 0; }
            ctx.setLineDash(isActive ? [7, 3] : [4, 6]);
            var mid = cp(CX, CY, b.pos[0], b.pos[1]);
            ctx.beginPath(); ctx.moveTo(CX, CY);
            ctx.quadraticCurveTo(mid.x, mid.y, b.pos[0], b.pos[1]); ctx.stroke();
            ctx.setLineDash([]); ctx.shadowBlur = 0;
        });

        BIN_IDS.forEach(function (id) {
            var b = BIN_DEFS[id]; var bx = b.pos[0], by = b.pos[1];
            var isSvc = veh.currentBin === id && veh.phase === 'servicing';
            var inQ = serviceQueue.includes(id);
            var c = binColor(b.fill, isSvc);
            var pct = Math.round(b.fill * 100);

            if (b.fill >= TRIGGER || inQ) {
                [1, 2].forEach(function (ring) {
                    var pr = (ring === 1 ? 20 : 14) + Math.abs(Math.sin(pulseT * 1.5 + ring)) * 7;
                    var pa = (ring === 1 ? 0.5 : 0.28) - Math.abs(Math.sin(pulseT * 1.5 + ring)) * 0.45;
                    ctx.beginPath(); ctx.arc(bx, by, pr, 0, Math.PI * 2);
                    ctx.strokeStyle = inQ ? 'rgba(251,191,36,' + pa + ')' : 'rgba(239,68,68,' + pa + ')';
                    ctx.lineWidth = ring === 1 ? 1.5 : 1; ctx.stroke();
                });
            }

            var halo = ctx.createRadialGradient(bx, by, 4, bx, by, 24);
            halo.addColorStop(0, c.r + '0.22)'); halo.addColorStop(1, c.r + '0)');
            ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(bx, by, 24, 0, Math.PI * 2); ctx.fill();

            ctx.beginPath(); ctx.arc(bx, by, 14, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 5; ctx.stroke();

            var bodyG = ctx.createRadialGradient(bx - 2, by - 2, 1, bx, by, 14);
            bodyG.addColorStop(0, 'rgba(15,23,42,0.98)'); bodyG.addColorStop(1, 'rgba(8,13,24,0.98)');
            ctx.fillStyle = bodyG; ctx.beginPath(); ctx.arc(bx, by, 14, 0, Math.PI * 2); ctx.fill();

            if (b.fill > 0.02) {
                ctx.beginPath(); ctx.arc(bx, by, 14, -Math.PI / 2, -Math.PI / 2 + b.fill * Math.PI * 2);
                ctx.strokeStyle = c.s; ctx.lineWidth = 5; ctx.lineCap = 'round';
                ctx.shadowColor = c.s; ctx.shadowBlur = isSvc ? 16 : 10; ctx.stroke(); ctx.shadowBlur = 0;
            }

            ctx.beginPath(); ctx.arc(bx, by, 14, 0, Math.PI * 2);
            ctx.strokeStyle = c.r + '0.4)'; ctx.lineWidth = 1; ctx.stroke();

            ctx.fillStyle = 'rgba(255,255,255,0.95)';
            ctx.font = '700 ' + (pct > 99 ? '7.5' : '8.5') + 'px DM Sans,sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.shadowColor = c.s; ctx.shadowBlur = 6;
            ctx.fillText(pct + '%', bx, by); ctx.shadowBlur = 0;

            ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 3;
            ctx.fillStyle = b.fill >= TRIGGER ? '#fca5a5' : inQ ? '#fde68a' : 'rgba(255,255,255,0.90)';
            ctx.font = '700 8.5px DM Sans,sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'top';
            ctx.fillText(id, bx, by + 18); ctx.shadowBlur = 0;
        });

        if (veh.phase !== 'idle') {
            var isR = veh.phase === 'returning';
            var vc = isR ? '#94a3b8' : '#34d399';
            var vg = ctx.createRadialGradient(veh.x, veh.y, 0, veh.x, veh.y, 16);
            vg.addColorStop(0, isR ? 'rgba(148,163,184,0.3)' : 'rgba(52,211,153,0.35)');
            vg.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = vg; ctx.beginPath(); ctx.arc(veh.x, veh.y, 16, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(veh.x, veh.y, 7.5, 0, Math.PI * 2);
            ctx.fillStyle = vc; ctx.shadowColor = vc; ctx.shadowBlur = 16; ctx.fill(); ctx.shadowBlur = 0;
            ctx.beginPath(); ctx.arc(veh.x, veh.y, 2.8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fill();

            if (veh.phase === 'travelling' || veh.phase === 'returning') {
                [0.07, 0.14, 0.22].forEach(function (offset, i) {
                    var trT = Math.max(0, veh.travelT - offset);
                    var mc = cp(veh.startX, veh.startY, veh.destX, veh.destY);
                    var tp = bPt(trT, veh.startX, veh.startY, mc.x, mc.y, veh.destX, veh.destY);
                    ctx.beginPath(); ctx.arc(tp.x, tp.y, 4 - i * 1.1, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(52,211,153,' + (0.25 - i * 0.08) + ')'; ctx.fill();
                });
            }
        }

        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.beginPath(); ctx.roundRect(8, 497, W - 16, 22, 6); ctx.fill();
        [{ c: 'rgba(52,211,153,0.2)', s: '#34d399', l: 'OK' },
        { c: 'rgba(251,191,36,0.2)', s: '#fbbf24', l: 'QUEUED' },
        { c: 'rgba(239,68,68,0.2)', s: '#ef4444', l: 'CRITICAL' },
        { c: 'rgba(52,211,153,0.2)', s: '#34d399', l: 'VEHICLE' }
        ].forEach(function (li, i) {
            var lx = 24 + i * 120, ly = 508;
            ctx.beginPath(); ctx.arc(lx, ly, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = li.c; ctx.strokeStyle = li.s; ctx.lineWidth = 1.5; ctx.fill(); ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = '600 8px Inter,sans-serif';
            ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(li.l, lx + 8, ly);
        });

        requestAnimationFrame(render);
    }

    canvas.addEventListener('click', function (e) {
        var r = canvas.getBoundingClientRect(), sx = W / r.width, sy = H / r.height;
        var mx = (e.clientX - r.left) * sx, my = (e.clientY - r.top) * sy;
        BIN_IDS.forEach(function (id) {
            var pos = BIN_DEFS[id].pos;
            if (Math.hypot(mx - pos[0], my - pos[1]) < 22) forceCollect(id);
        });
    });

    canvas.addEventListener('mousemove', function (e) {
        var r = canvas.getBoundingClientRect(), sx = W / r.width, sy = H / r.height;
        var mx = (e.clientX - r.left) * sx, my = (e.clientY - r.top) * sy;
        var tip = document.getElementById('mapTip'), hit = false;
        BIN_IDS.forEach(function (id) {
            var pos = BIN_DEFS[id].pos;
            if (Math.hypot(mx - pos[0], my - pos[1]) < 22) {
                var f = Math.round(BIN_DEFS[id].fill * 100);
                var isSvc = veh.currentBin === id && veh.phase === 'servicing';
                var inQ = serviceQueue.includes(id);
                var st = isSvc ? 'SERVICING' : inQ ? 'QUEUED' : f >= 80 ? 'CRITICAL' : f >= 60 ? 'ALERT' : 'OK';
                var col = isSvc ? '#16a34a' : inQ ? '#f59e0b' : f >= 80 ? '#ef4444' : f >= 60 ? '#f59e0b' : '#16a34a';
                document.getElementById('tipTitle').textContent = 'BIN ' + id;
                document.getElementById('tipDetail').innerHTML = 'Fill: <strong>' + f + '%</strong> &nbsp;·&nbsp; Status: <strong style="color:' + col + '">' + st + '</strong>';
                var wrap = canvas.parentElement, wR = wrap.getBoundingClientRect();
                tip.style.left = (r.left - wR.left + pos[0] / sx + 16) + 'px';
                tip.style.top = (r.top - wR.top + pos[1] / sy - 54) + 'px';
                tip.classList.add('show'); hit = true; canvas.style.cursor = 'pointer';
            }
        });
        if (!hit) { tip.classList.remove('show'); canvas.style.cursor = 'crosshair'; }
    });

    canvas.addEventListener('mouseleave', function () { document.getElementById('mapTip').classList.remove('show'); });

    logEvent('info', '📡 SmartBin network active — 6 bins online');
    renderQueueStrip();
    requestAnimationFrame(simulate); // kick off always-on simulation
})();

// ── ANATOMY BIN CANVAS ───────────────────────────────────────
(function () {
    var canvas = document.getElementById('binCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var target = 0.45, anim = 0.45;
    var slider = document.getElementById('fillSlider');
    var activeFeature = '28';
    var overlay = document.getElementById('binEffectOverlay');

    slider.addEventListener('input', function () { target = slider.value / 100; });

    function setOverlay() {
        if (activeFeature === '45') {
            var pct = Math.round(anim * 100);
            overlay.innerHTML =
                '<div class="fx-dashboard">' +
                '<div style="font-weight:700;color:#16a34a;margin-bottom:4px;font-size:0.65rem;">\u{1F4CA} ESG Dashboard</div>' +
                '<div class="fx-dash-row"><span>Fill Level</span><strong class="fx-esg-fill">' + pct + '%</strong></div>' +
                '<div class="fx-dash-row"><span>Collections / day</span><strong>2.1</strong></div>' +
                '<div class="fx-dash-row"><span>CO\u2082 Saved</span><strong>12.4 kg</strong></div>' +
                '<div class="fx-dash-row"><span>BRSR Score</span><strong style="color:#16a34a">A+</strong></div>' +
                '</div>';
        } else {
            overlay.innerHTML = '';
        }
    }

    document.querySelectorAll('.anat-row').forEach(function (row) {
        row.addEventListener('mouseenter', function () {
            document.querySelectorAll('.anat-row').forEach(function (r) { r.classList.remove('active'); });
            row.classList.add('active');
            target = parseInt(row.dataset.fill) / 100;
            slider.value = row.dataset.fill;
            activeFeature = row.dataset.fill;
            setOverlay();
        });
    });

    function getC(p) {
        if (p < 0.6) return { s: '#16a34a', f: 'rgba(22,163,74,', txt: 'Capacity: OK', badge: 'badge--success' };
        if (p < 0.8) return { s: '#f59e0b', f: 'rgba(245,158,11,', txt: '⚠ Alert: Near Full', badge: 'badge--warning' };
        return { s: '#ef4444', f: 'rgba(239,68,68,', txt: '🔴 Critical: Collect Now!', badge: 'badge--warning', red: true };
    }

    function drawBin(p) {
        ctx.clearRect(0, 0, W, H);
        var bx = W / 2 - 62, by = 100, bw = 124, bh = 210, tap = 14;
        var c = getC(p);
        var fillH = bh * p, fillY = by + bh - fillH;

        ctx.beginPath();
        ctx.moveTo(bx + tap, by); ctx.lineTo(bx + bw - tap, by); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx, by + bh); ctx.closePath();
        ctx.save(); ctx.clip();

        var fg = ctx.createLinearGradient(0, fillY, 0, by + bh);
        fg.addColorStop(0, c.f + '0.22)'); fg.addColorStop(1, c.f + '0.4)');
        ctx.fillStyle = fg; ctx.fillRect(bx, fillY, bw, fillH);

        var t = Date.now() * 0.003;
        ctx.beginPath(); ctx.moveTo(bx, fillY + 4);
        for (var x = bx; x <= bx + bw; x += 3) {
            ctx.lineTo(x, fillY + Math.sin((x - bx) * 0.06 + t) * 3 + Math.sin((x - bx) * 0.1 - t) * 1.5);
        }
        ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx, by + bh); ctx.closePath();
        ctx.fillStyle = c.f + '0.12)'; ctx.fill();

        ctx.strokeStyle = 'rgba(0,0,0,0.04)'; ctx.lineWidth = 1;
        for (var ly = by; ly < by + bh; ly += 20) { ctx.beginPath(); ctx.moveTo(bx, ly); ctx.lineTo(bx + bw, ly); ctx.stroke(); }
        ctx.restore();

        ctx.beginPath();
        ctx.moveTo(bx + tap, by); ctx.lineTo(bx + bw - tap, by); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx, by + bh); ctx.closePath();
        ctx.strokeStyle = c.s; ctx.lineWidth = 2;
        ctx.shadowColor = c.s; ctx.shadowBlur = 12; ctx.stroke(); ctx.shadowBlur = 0;

        ctx.beginPath(); ctx.rect(bx + tap - 6, by - 12, bw - tap * 2 + 12, 12);
        ctx.fillStyle = c.f + '0.1)'; ctx.fill();
        ctx.strokeStyle = c.s; ctx.lineWidth = 2; ctx.stroke();

        ctx.beginPath(); ctx.arc(W / 2, by - 6, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = c.s; ctx.shadowColor = c.s; ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0;

        // ── Ultrasonic pulse: emits down from sensor, bounces off fill surface ──
        var sensorY = by - 3;
        var emptyH  = fillY - sensorY;
        if (emptyH > 8) {
            var cycleMs  = 2200;
            var elapsed  = Date.now() % cycleMs;
            var half     = cycleMs / 2;
            var goingDown = elapsed < half;
            var prog     = goingDown ? elapsed / half : 1 - (elapsed - half) / half;
            // Ease in-out for natural deceleration at bounce
            prog = prog < 0.5 ? 2 * prog * prog : 1 - Math.pow(-2 * prog + 2, 2) / 2;
            var pulseY   = sensorY + emptyH * prog;
            // Pulse wave width narrows as it goes deeper (cone shape)
            var pw = 22 + (1 - prog) * 14;
            var cx = W / 2;

            // Faint trail: thin line from sensor to pulse
            ctx.beginPath();
            ctx.moveTo(cx, sensorY);
            ctx.lineTo(cx, pulseY);
            ctx.strokeStyle = 'rgba(59,130,246,' + (goingDown ? 0.18 : 0.10) + ')';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 4]);
            ctx.stroke();
            ctx.setLineDash([]);

            // The pulse — a small concave arc (ultrasonic wavefront)
            ctx.beginPath();
            ctx.moveTo(cx - pw, pulseY);
            ctx.quadraticCurveTo(cx, pulseY + (goingDown ? 6 : -6), cx + pw, pulseY);
            ctx.strokeStyle = 'rgba(59,130,246,' + (0.65 + Math.sin(Date.now() * 0.012) * 0.15) + ')';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#3b82f6';
            ctx.shadowBlur = 8;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Secondary fainter ripple behind pulse
            var trailOff = goingDown ? -14 : 14;
            var trailY   = pulseY + trailOff;
            if (trailY > sensorY && trailY < fillY) {
                ctx.beginPath();
                ctx.moveTo(cx - pw * 0.7, trailY);
                ctx.quadraticCurveTo(cx, trailY + (goingDown ? 4 : -4), cx + pw * 0.7, trailY);
                ctx.strokeStyle = 'rgba(59,130,246,0.22)';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // Bounce flash at fill surface when pulse reaches bottom
            if (prog > 0.92 && goingDown) {
                var flashR = (prog - 0.92) / 0.08;
                ctx.beginPath();
                ctx.moveTo(cx - pw * 1.2, fillY);
                ctx.quadraticCurveTo(cx, fillY - 4, cx + pw * 1.2, fillY);
                ctx.strokeStyle = 'rgba(59,130,246,' + (0.5 * flashR) + ')';
                ctx.lineWidth = 2;
                ctx.shadowColor = '#3b82f6';
                ctx.shadowBlur = 12 * flashR;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }
        // ── end ultrasonic pulse ────────────────────────────────────────

        // ── Solar effect: sun + energy particles flowing to bin top ──
        if (activeFeature === '72') {
            var sunX = W / 2, sunY = 34, sunR = 16;
            // Sun glow
            ctx.beginPath(); ctx.arc(sunX, sunY, sunR + 8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(251,191,36,0.12)'; ctx.fill();
            // Sun body
            ctx.beginPath(); ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
            var sg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
            sg.addColorStop(0, '#fde68a'); sg.addColorStop(0.6, '#fbbf24'); sg.addColorStop(1, '#f59e0b');
            ctx.fillStyle = sg;
            ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 18; ctx.fill(); ctx.shadowBlur = 0;
            // Rotating rays
            var ra = Date.now() * 0.0008;
            for (var ri = 0; ri < 10; ri++) {
                var ang = ra + ri * (Math.PI * 2 / 10);
                var r1 = sunR + 3, r2 = sunR + 10 + Math.sin(Date.now() * 0.005 + ri) * 3;
                ctx.beginPath();
                ctx.moveTo(sunX + Math.cos(ang) * r1, sunY + Math.sin(ang) * r1);
                ctx.lineTo(sunX + Math.cos(ang) * r2, sunY + Math.sin(ang) * r2);
                ctx.strokeStyle = 'rgba(251,191,36,0.6)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
                ctx.stroke();
            }
            // Energy particles streaming from sun to bin cap
            var eStartY = sunY + sunR + 4, eEndY = by - 10;
            var ePath = eEndY - eStartY;
            for (var ei = 0; ei < 6; ei++) {
                var et = ((Date.now() * 0.0018 + ei * 0.167) % 1);
                var ey = eStartY + ePath * et;
                var ex = sunX + Math.sin(et * Math.PI * 3 + ei * 1.2) * 8;
                var ea = Math.sin(et * Math.PI);
                // Particle
                ctx.beginPath(); ctx.arc(ex, ey, 2.2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(251,191,36,' + (ea * 0.85) + ')';
                ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 5; ctx.fill(); ctx.shadowBlur = 0;
                // Trail
                if (et > 0.06) {
                    ctx.beginPath();
                    ctx.moveTo(ex, ey);
                    var tey = ey - ePath * 0.06;
                    ctx.lineTo(sunX + Math.sin((et - 0.06) * Math.PI * 3 + ei * 1.2) * 8, tey);
                    ctx.strokeStyle = 'rgba(251,191,36,' + (ea * 0.3) + ')';
                    ctx.lineWidth = 1.2; ctx.stroke();
                }
            }
            // Glow at bin cap (receiving energy)
            ctx.beginPath(); ctx.arc(W / 2, by - 6, 8, 0, Math.PI * 2);
            var cg = ctx.createRadialGradient(W / 2, by - 6, 0, W / 2, by - 6, 8);
            cg.addColorStop(0, 'rgba(251,191,36,0.4)'); cg.addColorStop(1, 'rgba(251,191,36,0)');
            ctx.fillStyle = cg; ctx.fill();
        }
        // ── end solar effect ────────────────────────────────────────────

        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '700 ' + Math.round(18 + p * 9) + 'px DM Sans, sans-serif';
        ctx.fillStyle = c.s; ctx.shadowColor = c.s; ctx.shadowBlur = 10;
        ctx.fillText(Math.round(p * 100) + '%', W / 2, fillY + Math.max(fillH * 0.5, 12));
        ctx.shadowBlur = 0;

        ctx.beginPath(); ctx.moveTo(bx, fillY); ctx.lineTo(bx + bw, fillY);
        ctx.strokeStyle = c.f + '0.4)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);

        ctx.font = '11px sans-serif'; ctx.fillStyle = '#94a3b8'; ctx.textBaseline = 'top';
        ctx.fillText('☀ Solar', W / 2 - 42, by + bh + 12);
        ctx.fillText('📡 Sensor', W / 2 + 42, by + bh + 12);
    }

    function loop() {
        anim += (target - anim) * 0.07;
        var pct = Math.round(anim * 100);
        document.getElementById('pctLabel').textContent = pct + '%';
        var rfill = document.getElementById('rFill');
        rfill.style.width = pct + '%';
        var c = getC(anim);
        rfill.style.background = 'linear-gradient(90deg, ' + c.s + ', ' + c.s + 'bb)';
        var badge = document.getElementById('binBadge');
        badge.className = 'badge ' + c.badge;
        badge.innerHTML = '<span class="badge-dot"></span>' + c.txt;
        // Live-update ESG dashboard fill level if visible
        if (activeFeature === '45') {
            var esgFill = overlay.querySelector('.fx-esg-fill');
            if (esgFill) esgFill.textContent = pct + '%';
        }
        drawBin(anim);
        requestAnimationFrame(loop);
    }
    loop();
})();

// ── HERO DASHBOARD SYNC ──────────────────────────────────────
// Reads from window.BIN_DEFS (set by map simulation above)
(function () {
    var FALLBACK = {
        A1: { fill: 0.28, label: 'WING A' },
        B3: { fill: 0.74, label: 'WING B' },
        C2: { fill: 0.41, label: 'WING C' },
        D5: { fill: 0.15, label: 'WING D' },
        E1: { fill: 0.91, label: 'CORRIDOR N' },
        F2: { fill: 0.33, label: 'CORRIDOR S' }
    };
    var HERO_BINS = ['A1', 'B3', 'C2', 'D5', 'E1', 'F2'];

    function fillClass(f) {
        if (f >= 0.80) return 'hdash-bar--red';
        if (f >= 0.60) return 'hdash-bar--amber';
        return 'hdash-bar--green';
    }
    function statusClass(f) {
        if (f >= 0.80) return 'hdash-status--crit';
        if (f >= 0.60) return 'hdash-status--warn';
        return 'hdash-status--ok';
    }
    function statusLabel(f) {
        if (f >= 0.80) return 'CRIT';
        if (f >= 0.60) return 'ALERT';
        return 'OK';
    }

    function renderHeroBins(defs) {
        var container = document.getElementById('heroBins');
        if (!container) return;
        container.innerHTML = HERO_BINS.map(function (id) {
            var b = defs[id];
            if (!b) return '';
            var pct = Math.round(b.fill * 100);
            return '<div class="hdash-bin-row" id="hero-row-' + id + '">' +
                '<span class="hdash-bin-id">BIN ' + id + '</span>' +
                '<div class="hdash-bar-track">' +
                '<div class="hdash-bar ' + fillClass(b.fill) + '" style="width:' + pct + '%"></div>' +
                '</div>' +
                '<span class="hdash-bin-pct">' + pct + '%</span>' +
                '<span class="hdash-bin-status ' + statusClass(b.fill) + '">' + statusLabel(b.fill) + '</span>' +
                '</div>';
        }).join('');
    }

    function updateHeroBins(defs) {
        HERO_BINS.forEach(function (id) {
            var row = document.getElementById('hero-row-' + id);
            if (!row || !defs[id]) return;
            var b = defs[id];
            var pct = Math.round(b.fill * 100);
            var bar = row.querySelector('.hdash-bar');
            var pctEl = row.querySelector('.hdash-bin-pct');
            var statusEl = row.querySelector('.hdash-bin-status');
            if (bar) { bar.className = 'hdash-bar ' + fillClass(b.fill); bar.style.width = pct + '%'; }
            if (pctEl) pctEl.textContent = pct + '%';
            if (statusEl) { statusEl.className = 'hdash-bin-status ' + statusClass(b.fill); statusEl.textContent = statusLabel(b.fill); }
        });
        var alertEl = document.getElementById('heroAlertText');
        if (alertEl) {
            var highest = HERO_BINS.reduce(function (a, b) {
                return (defs[b] && (!defs[a] || defs[b].fill > defs[a].fill)) ? b : a;
            }, HERO_BINS[0]);
            var hb = defs[highest];
            alertEl.textContent = (hb && hb.fill >= 0.80)
                ? 'Collection dispatched → BIN ' + highest + ' (' + hb.label + ')'
                : 'All bins nominal — system monitoring 24×7';
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        renderHeroBins(FALLBACK);
        var liveStarted = false;
        function syncLive() {
            var defs = window.BIN_DEFS;
            if (defs) {
                if (!liveStarted) { renderHeroBins(defs); liveStarted = true; }
                else { updateHeroBins(defs); }
            }
            requestAnimationFrame(syncLive);
        }
        requestAnimationFrame(syncLive);
    });
})();

// ── COMPARE PANEL TOGGLE ─────────────────────────────────────
function showTraditional() {
    var trad  = document.getElementById('traditionalMode');
    var smart = document.getElementById('smartMode');
    smart.className = 'card compare-panel compare-panel--hidden compare-panel--green-border';
    trad.className  = 'card compare-panel compare-panel--visible compare-panel--entering';
    void trad.offsetWidth; // force reflow to restart animation
    document.getElementById('btnTraditional').classList.add('btn-traditional-active');
    document.getElementById('btnSmart').classList.remove('btn-smart-active');
    var hint = document.getElementById('smartClickHint');
    if (hint) hint.classList.remove('smart-click-hint--hidden');
    var mSmart = document.getElementById('microSmart');
    var mTrad  = document.getElementById('microTraditional');
    if (mSmart) mSmart.classList.remove('compare-micro--smart-active');
    if (mTrad)  mTrad.classList.remove('compare-micro--dimmed');
}

function showSmart() {
    var trad  = document.getElementById('traditionalMode');
    var smart = document.getElementById('smartMode');
    trad.className  = 'card compare-panel compare-panel--hidden';
    smart.className = 'card compare-panel compare-panel--visible compare-panel--green-border compare-panel--entering';
    void smart.offsetWidth; // force reflow to restart animation
    document.getElementById('btnSmart').classList.add('btn-smart-active');
    document.getElementById('btnTraditional').classList.remove('btn-traditional-active');
    var hint = document.getElementById('smartClickHint');
    if (hint) hint.classList.add('smart-click-hint--hidden');
    var mSmart = document.getElementById('microSmart');
    var mTrad  = document.getElementById('microTraditional');
    if (mSmart) mSmart.classList.add('compare-micro--smart-active');
    if (mTrad)  mTrad.classList.add('compare-micro--dimmed');
}

document.addEventListener('DOMContentLoaded', function () { showTraditional(); });

// ── PUBLIC API ───────────────────────────────────────────────
window.showTraditional = showTraditional;
window.showSmart = showSmart;

// ── Problem Diagnosis — scroll reveal ───────────────────────
(function () {
    if (!('IntersectionObserver' in window)) {
        // Fallback: just show everything immediately
        document.querySelectorAll('.js-pd-reveal').forEach(function (el) {
            el.classList.add('is-visible');
        });
        return;
    }
    var pdObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) {
                e.target.classList.add('is-visible');
                pdObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.js-pd-reveal').forEach(function (el) {
        pdObs.observe(el);
    });
}());

// ── AARUSH HEROIC ENTRY ────────────────────────────────────
function initHeroicEntry() {
    document.fonts.ready.then(function () {
        if (typeof gsap === 'undefined') {
            setTimeout(initHeroicEntry, 200);
            return;
        }
        buildHeroicEntry();
    });

    // Absolute fallback — if GSAP never loads, just show the dirty corridor
    setTimeout(function () {
        if (typeof gsap === 'undefined') {
            var scene = document.querySelector('.he-scene-wrap');
            if (scene) scene.style.opacity = '1';
        }
    }, 3000);
}

function buildHeroicEntry() {
    // ── State variables ──
    var deployFired = false;
    var timelineCompleted = false;
    var breathingTl = null;
    var firstScrollFired = false;
    var ambientLoops = [];
    var flyTweens = [];
    var mainTl = null;

    // ── Initial element setup ──
    gsap.set('#he-reveal-circle', { scale: 0, transformOrigin: '3000px 160px' });
    gsap.set('#he-light-dot', { attr: { r: 0 } });
    gsap.set('#he-white-flash', { opacity: 0 });
    gsap.set('#ghost-base, #ghost-body, #ghost-lid', { scaleY: 0, transformOrigin: 'center bottom' });
    gsap.set('#ghost-outline', { opacity: 0.15 });
    gsap.set('#ghost-dispatch', { opacity: 0 });
    gsap.set('#ghost-dot, #topple-dot, #overflow-dot', { opacity: 0, scale: 1 });
    gsap.set('#bin-toppled-group', { rotation: 90, transformOrigin: 'center bottom' });
    gsap.set('#overflow-waste', { transformOrigin: 'center top' });
    gsap.set('#overflow-lid-clean', { scaleX: 0, transformOrigin: 'center center' });
    gsap.set('.he-notif-pill', { opacity: 0 });
    gsap.set('.he-proof', { opacity: 0, y: 20 });
    gsap.set('.he-char', { opacity: 0 });
    gsap.set('.he-proof-sep', { opacity: 0 });
    gsap.set('.he-proof-label', { opacity: 0 });
    gsap.set('#he-close', { opacity: 0, y: 12 });
    gsap.set('#he-bridge', { opacity: 0 });
    gsap.set('#he-name, #he-secondary, #he-tagline', { opacity: 0 });
    gsap.set('.he-corridor-wrap', { xPercent: 0 });

    // ── Build fly tweens ──
    function buildFlyTweens() {
        flyTweens = [];
        var groups = document.querySelectorAll('.he-fly-group');
        groups.forEach(function (group, i) {
            var tl = gsap.timeline({ repeat: -1 });
            tl.to(group, {
                x: 8 + i * 3,
                duration: 0.4 + i * 0.1,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: 3
            });
            tl.to(group, {
                y: -6 - i * 2,
                duration: 0.3 + i * 0.08,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: 3
            }, 0.1 + i * 0.05);
            flyTweens.push(tl);
        });
    }

    buildFlyTweens();

    // ── Text line visibility ──
    function updateTextLines(p) {
        var lines = [
            ['.he-micro-1', 0.08, 0.13, 0.31],
            ['.he-line-1', 0.12, 0.17, 0.32],
            ['.he-micro-2', 0.38, 0.43, 0.63],
            ['.he-line-2', 0.42, 0.47, 0.64],
            ['.he-micro-3', 0.68, 0.73, 1.01],
            ['.he-line-3', 0.72, 0.77, 1.01]
        ];

        lines.forEach(function (l) {
            var el = document.querySelector(l[0]);
            if (!el) return;
            var op = 0;
            if (p >= l[1] && p < l[2]) {
                op = (p - l[1]) / (l[2] - l[1]);
            } else if (p >= l[2] && p < l[3]) {
                op = 1;
            } else if (p >= l[3]) {
                op = Math.max(0, 1 - (p - l[3]) / 0.04);
            }
            el.style.opacity = op;
        });

        // Show notif pill when near panel 1 area
        var notif = document.querySelector('.he-notif-pill');
        if (notif) {
            if (p >= 0.05 && p < 0.30) {
                notif.style.opacity = Math.min(1, (p - 0.05) / 0.05);
            } else if (p >= 0.30) {
                notif.style.opacity = Math.max(0, 1 - (p - 0.30) / 0.03);
            }
        }

        // Show deploy button when near end of scroll (panel 3 fully in view)
        var btn = document.getElementById('he-deploy-btn');
        if (btn && !deployFired) {
            if (p >= 0.85) {
                btn.style.opacity = Math.min(1, (p - 0.85) / 0.10);
                btn.style.pointerEvents = 'auto';
            } else {
                btn.style.opacity = '0';
                btn.style.pointerEvents = 'none';
            }
        }
    }

    // ── Breathing animation ──
    breathingTl = gsap.timeline({ repeat: -1, yoyo: true });
    breathingTl.to('.he-corridor-wrap', { x: 8, duration: 3, ease: 'sine.inOut' });

    // ── ScrollTrigger ──
    var st = ScrollTrigger.create({
        id: 'aarush-entry',
        trigger: '.he-section',
        start: 'top top',
        end: '+=250%',
        pin: true,
        pinSpacing: true,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
            if (!firstScrollFired && self.progress > 0.01) {
                firstScrollFired = true;
                if (breathingTl) breathingTl.kill();
                gsap.set('.he-corridor-wrap', { x: 0 });
                gsap.to('.he-scroll-hint', { opacity: 0, duration: 0.3 });
            }

            if (timelineCompleted && self.progress < 0.5) {
                resetSection();
            }

            if (!deployFired) {
                gsap.set('.he-corridor-wrap', {
                    xPercent: -(self.progress * 66.667)
                });
                updateTextLines(self.progress);
            }
        },

        onEnterBack: function () {
            if (timelineCompleted) {
                resetSection();
            }
        }
    });

    // ── Bin overlay — lifts bin elements above #he-clean so they're
    //    not hidden by dirty-layer fade or clean-layer clip-path ──
    function liftBinsToOverlay() {
        var svg = document.getElementById('he-corridor');
        if (!svg || document.getElementById('he-bin-overlay')) return;
        var overlay = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        overlay.id = 'he-bin-overlay';
        svg.appendChild(overlay); // renders above both #he-dirty and #he-clean

        // Move all animation-targeted elements by ID
        ['ghost-outline', 'ghost-dispatch', 'ghost-base', 'ghost-body', 'ghost-lid', 'ghost-dot',
         'bin-toppled-group', 'topple-shadow', 'topple-dot',
         'overflow-waste', 'overflow-dot', 'overflow-lid-clean'
        ].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) overlay.appendChild(el);
        });

        // Move elements by class
        document.querySelectorAll('.ghost-debris, .topple-scatter, .overflow-pile, .overflow-footprint').forEach(function (el) {
            overlay.appendChild(el);
        });
    }

    function returnBinsFromOverlay() {
        var overlay = document.getElementById('he-bin-overlay');
        if (!overlay) return;
        var dirty = document.getElementById('he-dirty');
        var clean = document.getElementById('he-clean');

        while (overlay.firstChild) {
            var el = overlay.firstChild;
            if (el.id === 'overflow-lid-clean') {
                if (clean) clean.appendChild(el);
                else overlay.removeChild(el);
            } else {
                if (dirty) dirty.appendChild(el);
                else overlay.removeChild(el);
            }
        }
        overlay.remove();
    }

    // ── Deploy AARUSH — triggered by button click ──
    function deployAarush() {
        if (deployFired) return;
        deployFired = true;

        // Kill fly tweens
        flyTweens.forEach(function (t) { t.kill(); });
        flyTweens = [];

        // Ensure corridor is at panel 3
        gsap.set('.he-corridor-wrap', { xPercent: -66.667 });

        // Lift bin elements above clean layer so animations are visible
        liftBinsToOverlay();

        // Hide all scroll-driven text overlays immediately
        gsap.set('.he-main-line, .he-micro-label, .he-notif-pill', { opacity: 0 });
        gsap.set('.he-scroll-hint', { opacity: 0 });

        // Hide the deploy button
        gsap.to('#he-deploy-btn', { opacity: 0, scale: 0.8, duration: 0.3, onComplete: function () {
            var btn = document.getElementById('he-deploy-btn');
            if (btn) btn.style.display = 'none';
        }});

        mainTl = gsap.timeline({ paused: false });
        buildTimeline(mainTl);
    }

    // Wire deploy button
    var deployBtn = document.getElementById('he-deploy-btn');
    if (deployBtn) {
        deployBtn.addEventListener('click', function () {
            deployAarush();
        });
    }

    function buildTimeline(tl) {
        // Beat 0 — Stillness (0s to 2s)
        // Nothing happens. Ghost bin corridor at maximum darkness.

        // Beat 1 — The Light Approaches (2s to 5s)
        // Make clean layer visible (hidden by CSS to prevent FOUC)
        tl.set('#he-clean', { visibility: 'visible' }, 2);

        // ClipPath circle — scale animation (Safari-safe)
        tl.to('#he-reveal-circle', {
            scale: 0.07,
            duration: 1.2,
            ease: 'power1.in',
            transformOrigin: '3000px 160px'
        }, 2);

        tl.to('#he-reveal-circle', {
            scale: 1,
            duration: 1.8,
            ease: 'power3.in'
        }, 3.2);

        // Visual light dot in overlay SVG
        tl.to('#he-light-dot', { attr: { r: 45 }, duration: 1.2, ease: 'power1.in' }, 2);
        tl.to('#he-light-dot', { attr: { r: 900 }, duration: 1.8, ease: 'power3.in' }, 3.2);

        // Dirty layer fades
        tl.to('#he-dirty', { opacity: 0, duration: 2.5, ease: 'power2.inOut' }, 3.0);

        // Ceiling lights activate — panel 3 first (where circle originates), then cascade
        tl.to('#p3-ceil-1', { attr: { fill: '#e8f4ff' }, duration: 0.3 }, 3.0);
        tl.to('#p3-ceil-2', { attr: { fill: '#e8f4ff' }, duration: 0.3 }, 3.3);
        tl.to('#p3-ceil-3', { attr: { fill: '#e8f4ff' }, duration: 0.3 }, 3.6);
        tl.to('#p2-ceil-1', { attr: { fill: '#e8f4ff' }, duration: 0.3 }, 4.2);
        tl.to('#p2-ceil-2', { attr: { fill: '#e8f4ff' }, duration: 0.3 }, 4.5);
        tl.to('#p2-ceil-3', { attr: { fill: '#e8f4ff' }, duration: 0.3 }, 4.8);
        tl.to('#p1-ceil-1', { attr: { fill: '#e8f4ff' }, duration: 0.3 }, 5.8);
        tl.to('#p1-ceil-2', { attr: { fill: '#e8f4ff' }, duration: 0.3 }, 6.1);
        tl.to('#p1-ceil-3', { attr: { fill: '#e8f4ff' }, duration: 0.3 }, 6.4);

        // Beat 2 — Ghost Bin Assembles (4s to 5.8s)
        // Corridor is at panel 3 — ghost bin is in view
        tl.fromTo('#ghost-dispatch', { opacity: 0 }, { opacity: 0.7, duration: 0.2 }, 4.0);
        tl.to('#ghost-dispatch', { opacity: 0, duration: 0.2 }, 4.2);

        tl.fromTo('#ghost-base', { scaleY: 0 }, { scaleY: 1, duration: 0.3, ease: 'power2.inOut', transformOrigin: 'center bottom' }, 4.1);
        tl.fromTo('#ghost-body', { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: 'power2.inOut', transformOrigin: 'center bottom' }, 4.4);
        tl.fromTo('#ghost-lid', { scaleY: 0 }, { scaleY: 1, duration: 0.25, ease: 'power2.inOut', transformOrigin: 'center bottom' }, 4.9);

        tl.to('#ghost-outline', { opacity: 0, duration: 1.4 }, 4.0);
        tl.to('.ghost-debris', { opacity: 0, stagger: 0.08, duration: 0.4 }, 4.2);

        tl.to('#ghost-dot', { opacity: 1, duration: 0.1 }, 5.3);
        tl.to('#ghost-dot', { scale: 1.5, duration: 0.15, yoyo: true, repeat: 1 }, 5.35);

        // Corridor scrolls back to panel 2 — toppled bin comes into view
        tl.to('.he-corridor-wrap', { xPercent: -33.333, duration: 0.8, ease: 'power2.inOut' }, 5.0);

        // Beat 3 — Toppled Bin Rights Itself (5.5s to 7s)
        tl.to('#topple-shadow', { scaleX: 1.4, opacity: 0.7, duration: 0.2 }, 5.5);
        tl.to('#topple-shadow', { scaleX: 0.8, opacity: 0.35, duration: 0.3 }, 5.7);

        tl.to('#bin-toppled-group', { rotation: 0, duration: 1.5, ease: 'power3.inOut', transformOrigin: 'center bottom' }, 5.5);

        tl.to('.topple-scatter', { opacity: 0, stagger: 0.06, duration: 0.4 }, 5.7);
        tl.to('#topple-dot', { opacity: 1, duration: 0.2 }, 6.8);

        // Corridor scrolls back to panel 1 — overflow bin comes into view
        tl.to('.he-corridor-wrap', { xPercent: 0, duration: 0.8, ease: 'power2.inOut' }, 6.5);

        // Beat 4 — Overflow Bin Clears (7s to 8.5s)
        tl.to('.he-notif-pill', { y: -15, opacity: 0, duration: 0.6 }, 7.0);
        tl.to('#overflow-waste', { scaleY: 0, duration: 1.2, ease: 'power2.inOut', transformOrigin: 'center top' }, 7.0);
        tl.to('.overflow-pile', { opacity: 0, stagger: 0.05, duration: 0.4 }, 7.1);
        tl.to('.overflow-footprint', { opacity: 0, stagger: 0.1, duration: 0.4 }, 7.2);

        tl.fromTo('#overflow-lid-clean', { scaleX: 0, transformOrigin: 'center center' },
            { scaleX: 1, duration: 0.4, ease: 'power2.inOut' }, 8.0);
        tl.to('#overflow-dot', { opacity: 1, duration: 0.2 }, 8.3);

        // Hide text overlays during autoplay
        tl.to('.he-main-line, .he-micro-label', { opacity: 0, duration: 0.3 }, 0.1);
        // Beat 5 — White Flash (8.5s to 9.5s)
        tl.to('#he-light-dot', { opacity: 0, duration: 0.4 }, 8.5);
        tl.to('#he-white-flash', { opacity: 0.85, duration: 0.3, ease: 'power2.in' }, 8.5);
        tl.to('.he-scene-wrap', { opacity: 0, duration: 0.7, ease: 'power2.inOut' }, 8.7);
        tl.to('#he-white-flash', { opacity: 0, duration: 0.3 }, 9.2);

        // Beat 6 — The Name (9.5s to 15s)
        tl.to('#he-name', { opacity: 1, duration: 0.05, ease: 'none' }, 9.5);
        // Hold 3 full seconds
        tl.to('#he-secondary', { opacity: 1, duration: 0.8, ease: 'power2.out' }, 12.5);
        tl.to('#he-tagline', { opacity: 1, duration: 1.0, ease: 'power2.out' }, 13.5);

        // Beat 7 — Return and Proof (15s to 18s)
        tl.set('.he-corridor-wrap', { xPercent: -66.667 }, 14.9);

        tl.to('.he-scene-wrap', { opacity: 1, duration: 1.0 }, 15.0);
        tl.to(['#he-name', '#he-secondary', '#he-tagline'], {
            opacity: 0, duration: 0.8
        }, 15.5);

        tl.to('.he-proof', { opacity: 1, y: 0, duration: 0.6 }, 16.0);
        tl.to('.he-char', { opacity: 1, duration: 0.06, stagger: 0.04, ease: 'none' }, 16.2);
        tl.to('.he-proof-sep', { opacity: 1, duration: 0.3, stagger: 0.1 }, 16.6);
        tl.to('.he-proof-label', { opacity: 1, duration: 0.5, stagger: 0.15 }, 17.0);

        tl.to('#he-close', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 17.8);
        tl.to('#he-bridge', { opacity: 1, duration: 0.6 }, 18.5);

        // Beat 8 — Complete (18s)
        tl.call(function () {
            timelineCompleted = true;
            returnBinsFromOverlay();
            startAmbientLoops();

            document.querySelectorAll('a[href="#aarush-entry"]').forEach(function (link) {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    var stInst = ScrollTrigger.getById('aarush-entry');
                    if (stInst) window.scrollTo({ top: stInst.start, behavior: 'smooth' });
                });
            });
        }, null, null, 18);
    }

    // ── Ambient Loops ──
    function startAmbientLoops() {
        var section = document.querySelector('.he-section');
        if (!section) return;

        var rect = section.getBoundingClientRect();
        var inView = rect.top < window.innerHeight && rect.bottom > 0;

        if (!inView) {
            ScrollTrigger.create({
                trigger: section,
                start: 'top bottom',
                once: true,
                onEnter: startAmbientLoops
            });
            return;
        }

        ambientLoops = [];

        var dotLoop = gsap.timeline({ repeat: -1, repeatDelay: 10 });
        dotLoop.to('.he-status-dot', { scale: 1.5, duration: 0.3, stagger: 0.15, ease: 'power2.out' });
        dotLoop.to('.he-status-dot', { scale: 1.0, duration: 0.3, stagger: 0.15, ease: 'power2.inOut' });
        ambientLoops.push(dotLoop);

        var walkLoop = gsap.timeline({ repeat: -1, repeatDelay: 6 });
        walkLoop.fromTo('#he-ambient-walker',
            { x: -60, opacity: 0 },
            { x: 420, opacity: 0.14, duration: 5, ease: 'none' }
        );
        walkLoop.to('#he-ambient-walker', { opacity: 0, duration: 1 }, '-=1.2');
        ambientLoops.push(walkLoop);

        var cleanerLoop = gsap.timeline({ repeat: -1, repeatDelay: 14 });
        cleanerLoop.to('#he-clean-cleaner', { x: -45, duration: 3, ease: 'power2.inOut' });
        cleanerLoop.to('#he-clean-cleaner', { x: 0, duration: 3, ease: 'power2.inOut' });
        ambientLoops.push(cleanerLoop);

        ScrollTrigger.create({
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            onLeave: function () { ambientLoops.forEach(function (l) { l.pause(); }); },
            onEnterBack: function () { ambientLoops.forEach(function (l) { l.resume(); }); }
        });
    }

    // ── Reset on scroll back ──
    function resetSection() {
        timelineCompleted = false;
        deployFired = false;
        firstScrollFired = false;

        ambientLoops.forEach(function (l) { l.kill(); });
        ambientLoops = [];

        if (mainTl) { mainTl.kill(); mainTl = null; }

        flyTweens.forEach(function (t) { t.kill(); });
        flyTweens = [];

        returnBinsFromOverlay();
        resetToDirtyState();

        gsap.set('.he-corridor-wrap', { xPercent: 0 });
        gsap.set(['#he-name', '#he-secondary', '#he-tagline'], { opacity: 0 });
        gsap.set('.he-proof', { opacity: 0, y: 20 });
        gsap.set('.he-char', { opacity: 0 });
        gsap.set('.he-proof-sep', { opacity: 0 });
        gsap.set('.he-proof-label', { opacity: 0 });
        gsap.set('#he-close', { opacity: 0, y: 12 });
        gsap.set('#he-bridge', { opacity: 0 });
        gsap.set('.he-scene-wrap', { opacity: 1 });

        buildFlyTweens();

        // Re-show deploy button
        var btn = document.getElementById('he-deploy-btn');
        if (btn) { btn.style.display = ''; gsap.set(btn, { opacity: 1, scale: 1 }); }

        gsap.set('.he-scroll-hint', { opacity: 1 });
        breathingTl = gsap.timeline({ repeat: -1, yoyo: true });
        breathingTl.to('.he-corridor-wrap', { x: 8, duration: 3, ease: 'sine.inOut' });
    }

    function resetToDirtyState() {
        gsap.set('#he-dirty', { opacity: 1 });
        gsap.set('#he-clean', { visibility: 'hidden' });
        gsap.set('#he-reveal-circle', { scale: 0, transformOrigin: '3000px 160px' });
        gsap.set('#he-light-dot', { attr: { r: 0 } });
        gsap.set('#he-white-flash', { opacity: 0 });

        gsap.set('#ghost-base, #ghost-body, #ghost-lid', { scaleY: 0 });
        gsap.set('#ghost-outline', { opacity: 0.15 });
        gsap.set('.ghost-debris', { opacity: 0.4 });
        gsap.set('#ghost-dot, #topple-dot, #overflow-dot', { opacity: 0, scale: 1 });
        gsap.set('#ghost-dispatch', { opacity: 0 });
        gsap.set('#bin-toppled-group', { rotation: 90, transformOrigin: 'center bottom' });
        gsap.set('.topple-scatter', { opacity: 0.7 });
        gsap.set('#topple-shadow', { scaleX: 1, opacity: 0.45 });

        gsap.set('#overflow-waste', { scaleY: 1, transformOrigin: 'center top' });
        gsap.set('.overflow-pile', { opacity: 0.7 });
        gsap.set('.overflow-footprint', { opacity: 0.3 });
        gsap.set('#overflow-lid-clean', { scaleX: 0 });
        gsap.set('.he-notif-pill', { y: 0, opacity: 1 });

        gsap.set('.he-ceil-light', { attr: { fill: '#8a7a62' } });
    }

    // ── Mobile ──
    if (window.innerWidth <= 600) {
        initMobileHeroicEntry();
    }
}

function initMobileHeroicEntry() {
    var ghostPanel = document.querySelector('.he-mobile-panel[data-bin="ghost"]');
    if (!ghostPanel) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                observer.disconnect();
                setTimeout(startMobileAutoPlay, 800);
            }
        });
    }, { threshold: 0.8 });

    observer.observe(ghostPanel);
}

function startMobileAutoPlay() {
    if (typeof gsap === 'undefined') return;

    var tl = gsap.timeline();

    // 2s stillness
    tl.to('.he-mobile-name', { opacity: 1, duration: 0.05, ease: 'none' }, 2);
    // Hold 3s
    tl.to('.he-mobile-secondary', { opacity: 1, duration: 0.8, ease: 'power2.out' }, 5);
    tl.to('.he-mobile-tagline', { opacity: 1, duration: 1.0, ease: 'power2.out' }, 6);

    tl.to('.he-char-m', { opacity: 1, duration: 0.06, stagger: 0.08, ease: 'none' }, 7);

}

// ── Instant state functions (fallback / session skip) ──
function showCleanStateInstantly() {
    var scene = document.querySelector('.he-scene-wrap');
    if (!scene) return;
    scene.style.opacity = '1';

    var dirty = document.getElementById('he-dirty');
    if (dirty) dirty.style.opacity = '0';

    var clean = document.getElementById('he-clean');
    if (clean) clean.style.visibility = 'visible';

    var revealCircle = document.getElementById('he-reveal-circle');
    if (revealCircle) revealCircle.style.transform = 'scale(1)';
    if (revealCircle) revealCircle.style.transformOrigin = '3000px 160px';

    var wrap = document.querySelector('.he-corridor-wrap');
    if (wrap) wrap.style.transform = 'translateX(-66.667%)';

    document.querySelectorAll('.he-status-dot').forEach(function (dot) {
        dot.style.opacity = '1';
    });

    // Text elements to final state
    var textEls = ['#he-name', '#he-secondary', '#he-tagline'];
    textEls.forEach(function (sel) {
        var el = document.querySelector(sel);
        if (el) el.style.opacity = '0';
    });

    // Hide scroll hint
    var hint = document.querySelector('.he-scroll-hint');
    if (hint) hint.style.opacity = '0';

    // Show assembled ghost bin parts
    var parts = ['#ghost-base', '#ghost-body', '#ghost-lid'];
    parts.forEach(function (sel) {
        var el = document.querySelector(sel);
        if (el) { el.style.transform = 'scaleY(1)'; el.style.opacity = '1'; }
    });

    // Upright toppled bin
    var toppled = document.getElementById('bin-toppled-group');
    if (toppled) toppled.style.transform = 'rotate(0deg)';

    // Hide overflow waste
    var waste = document.getElementById('overflow-waste');
    if (waste) waste.style.transform = 'scaleY(0)';

    // Hide debris and scatter
    document.querySelectorAll('.ghost-debris, .topple-scatter, .overflow-pile, .overflow-footprint').forEach(function (el) {
        el.style.opacity = '0';
    });

    // Hide notification
    var notif = document.querySelector('.he-notif-pill');
    if (notif) notif.style.opacity = '0';

    // Ceiling lights on
    document.querySelectorAll('.he-ceil-light').forEach(function (el) {
        el.setAttribute('fill', '#fff8e7');
    });
}

function showProofInstantly() {
    var proof = document.querySelector('.he-proof');
    if (!proof) return;
    proof.style.opacity = '1';
    proof.style.transform = 'translateY(0)';

    document.querySelectorAll('.he-char').forEach(function (el) {
        el.style.opacity = '1';
    });
    document.querySelectorAll('.he-proof-sep').forEach(function (el) {
        el.style.opacity = '1';
    });
    document.querySelectorAll('.he-proof-label').forEach(function (el) {
        el.style.opacity = '1';
    });

    var close = document.getElementById('he-close');
    if (close) { close.style.opacity = '1'; close.style.transform = 'translateY(0)'; }

    var bridge = document.getElementById('he-bridge');
    if (bridge) bridge.style.opacity = '1';

    // Mobile chars
    document.querySelectorAll('.he-char-m').forEach(function (el) {
        el.style.opacity = '1';
    });
}
// Pipeline section scroll reveal
if (document.getElementById('pipelineFlow')) {
  gsap.from('.pipe-stage', {
    scrollTrigger: { trigger: '#pipelineFlow', start: 'top 70%' },
    opacity: 0, x: -30, stagger: 0.2, duration: 0.7, ease: 'power2.out'
  });
  gsap.from('.pipe-outcome', {
    scrollTrigger: { trigger: '.pipe-stage--outcomes', start: 'top 75%' },
    opacity: 0, y: 15, stagger: 0.12, duration: 0.5, ease: 'power2.out'
  });
}

/* ================================================================
   PIPELINE SECTION — GSAP scroll reveal
   ================================================================ */
(function () {
  if (!document.getElementById('pipelineFlow')) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.from('.pipe-stage', {
    scrollTrigger: { trigger: '#pipelineFlow', start: 'top 72%' },
    opacity: 0,
    x: -24,
    stagger: 0.18,
    duration: 0.65,
    ease: 'power2.out'
  });

  gsap.from('.pipe-outcome', {
    scrollTrigger: { trigger: '.pipe-stage--outcomes', start: 'top 78%' },
    opacity: 0,
    y: 12,
    stagger: 0.1,
    duration: 0.45,
    ease: 'power2.out'
  });
})();
