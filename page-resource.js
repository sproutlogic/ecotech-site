// ============================================================
// AARUSH ECO TECH — PAGE-RESOURCE JS
// Page-specific JavaScript for resource.html (RE-Source)
//
// Contents:
//   1. Hero canvas — generative network particle field
//   2. Scroll reveal observer — .reveal-in → .visible
//   3. Form handling — interest registration
//
// Dependency: core.js (nav, footer, analytics, WhatsApp, etc.)
// ============================================================


// ==================== 1. HERO CANVAS ====================
// Generates a subtle particle network that evokes circular
// connections without revealing any system mechanics.
(function () {
    var canvas = document.getElementById('rsCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w, h;
    var particles = [];
    var PARTICLE_COUNT = 60;
    var CONNECTION_DIST = 160;
    var mouse = { x: -1000, y: -1000 };
    var animId;

    function resize() {
        var rect = canvas.parentElement.getBoundingClientRect();
        w = rect.width;
        h = rect.height;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticles() {
        particles = [];
        var count = Math.min(PARTICLE_COUNT, Math.floor((w * h) / 12000));
        for (var i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                r: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.4 + 0.1
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        // Draw connections
        for (var i = 0; i < particles.length; i++) {
            for (var j = i + 1; j < particles.length; j++) {
                var dx = particles[i].x - particles[j].x;
                var dy = particles[i].y - particles[j].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DIST) {
                    var alpha = (1 - dist / CONNECTION_DIST) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = 'rgba(34, 197, 94, ' + alpha + ')';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        // Draw particles
        for (var k = 0; k < particles.length; k++) {
            var p = particles[k];

            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Wrap edges
            if (p.x < -10) p.x = w + 10;
            if (p.x > w + 10) p.x = -10;
            if (p.y < -10) p.y = h + 10;
            if (p.y > h + 10) p.y = -10;

            // Mouse interaction — gentle repulsion
            var mdx = p.x - mouse.x;
            var mdy = p.y - mouse.y;
            var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mdist < 120 && mdist > 0) {
                var force = (120 - mdist) / 120 * 0.3;
                p.vx += (mdx / mdist) * force;
                p.vy += (mdy / mdist) * force;
            }

            // Dampen velocity
            p.vx *= 0.99;
            p.vy *= 0.99;

            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(34, 197, 94, ' + p.alpha + ')';
            ctx.fill();
        }

        animId = requestAnimationFrame(draw);
    }

    // Reduced motion check
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReduced) {
        resize();
        createParticles();
        draw();

        window.addEventListener('resize', function () {
            resize();
            createParticles();
        });

        canvas.parentElement.addEventListener('mousemove', function (e) {
            var rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        canvas.parentElement.addEventListener('mouseleave', function () {
            mouse.x = -1000;
            mouse.y = -1000;
        });
    } else {
        // Static fallback — just draw once with no animation
        resize();
        createParticles();
        // Draw connections statically
        for (var i = 0; i < particles.length; i++) {
            for (var j = i + 1; j < particles.length; j++) {
                var dx = particles[i].x - particles[j].x;
                var dy = particles[i].y - particles[j].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DIST) {
                    var alpha = (1 - dist / CONNECTION_DIST) * 0.1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = 'rgba(34, 197, 94, ' + alpha + ')';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        for (var k = 0; k < particles.length; k++) {
            var p = particles[k];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(34, 197, 94, ' + p.alpha + ')';
            ctx.fill();
        }
    }
})();


// ==================== 2. SCROLL REVEAL ====================
// Elements with class .reveal-in gain .visible when they
// enter the viewport. Staggered via transition-delay inline.
(function () {
    var revealElements = document.querySelectorAll('.reveal-in');
    if (!revealElements.length) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry, index) {
            if (entry.isIntersecting) {
                // Stagger siblings slightly
                var siblings = entry.target.parentElement.querySelectorAll('.reveal-in');
                var idx = Array.prototype.indexOf.call(siblings, entry.target);
                entry.target.style.transitionDelay = (idx * 0.08) + 's';
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealElements.forEach(function (el) {
        observer.observe(el);
    });
})();


// ==================== 3. FORM HANDLING ====================
// Handles interest form submission.
// In production, this would POST to a backend / Google Sheets / etc.
function handleRSForm(event) {
    event.preventDefault();

    var form = document.getElementById('rsInterestForm');
    var btn = document.getElementById('rsSubmitBtn');
    var success = document.getElementById('rsFormSuccess');

    if (!form) return false;

    // Basic validation
    var name = form.querySelector('#rsName').value.trim();
    var email = form.querySelector('#rsEmail').value.trim();
    var org = form.querySelector('#rsOrg').value.trim();
    var role = form.querySelector('#rsRole').value;

    if (!name || !email || !org || !role) {
        return false;
    }

    // Email validation
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return false;
    }

    // Disable button during submission
    btn.disabled = true;
    btn.querySelector('.rs-form-submit-text').textContent = 'Submitting…';

    // Analytics tracking
    if (typeof trackEvent === 'function') {
        trackEvent('RE-Source', 'interest_registered', org + ' — ' + role);
    }

    // Simulate submission delay (replace with actual API call)
    setTimeout(function () {
        form.style.display = 'none';
        success.style.display = 'block';
    }, 800);

    return false;
}

// Make form handler globally accessible for onclick
window.handleRSForm = handleRSForm;


// ==================== 4. IMAGE PROTECTION ====================
// Prevent right-click save on any hero canvas area.
(function () {
    var hero = document.querySelector('.rs-hero');
    if (hero) {
        hero.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });
    }
})();
