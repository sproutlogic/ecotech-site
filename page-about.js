// ============================================================
// AARUSH ECO TECH — PAGE-ABOUT JS  ✅ PRIMARY JS BLOCK
// Page-specific JavaScript for about.html ONLY.
//
// Phase 2 refactor — derived from about-page.js + inline footer <script>
//
// Dependencies:
//   - core.js (global: nav, analytics, footer no-op)
//
// Contents:
//   1. Email obfuscation IIFE  — decodes #contact-email (from inline footer <script>)
//   2. Counter animation       — .count-up[data-target] hero stats
//
// FOOTER: about.html has a hardcoded footer (no #site-footer element).
// core.js loadFooter() will find no slot and return early — no regression.
//
// NO window-scoped functions required — toggleMobileMenu() is in core.js.
// ============================================================


// ==================== HERO COUNTER ANIMATION ====================
// Targets .count-up[data-target] elements in the hero stat grid.
// Uses setTimeout-based increment (distinct from rAF-based esg counter).
document.addEventListener('DOMContentLoaded', function () {
    var counters = document.querySelectorAll('.count-up');
    var speed = 200; // lower = slower

    var animateCounters = function () {
        counters.forEach(function (counter) {
            var target = parseInt(counter.getAttribute('data-target'), 10) || 0;
            var count = +counter.innerText;
            var inc = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(animateCounters, 20);
            } else {
                counter.innerText = target;
            }
        });
    };

    // Trigger animation when any counter enters the viewport
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                animateCounters();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(function (counter) {
        observer.observe(counter);
    });
});

// ==================== ABOUT PAGE CONTACT FORM ====================
function submitAboutContact() {
    if (document.getElementById('abHoney').value) return;

    var name = document.getElementById('abName').value.trim();
    var email = document.getElementById('abEmail').value.trim();
    var message = document.getElementById('abMessage').value.trim();

    if (!name || !email || !message) {
        [['abName', name], ['abEmail', email], ['abMessage', message]].forEach(function (pair) {
            if (!pair[1]) {
                var el = document.getElementById(pair[0]);
                if (el) {
                    el.style.borderColor = '#ef4444';
                    el.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)';
                    el.addEventListener('input', function () {
                        el.style.borderColor = '';
                        el.style.boxShadow = '';
                    }, { once: true });
                }
            }
        });
        return;
    }

    function sanitise(str) {
        return str.replace(/[<>&"']/g, function (c) {
            return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    var payload = {
        access_key: 'e74940ca-8c94-4f75-bb4b-f8c00064fdb2',
        subject: 'New Enquiry (About Page) — ' + (document.getElementById('abType').value || 'General') + ' | Aarush Eco Tech',
        name: sanitise(name),
        email: email,
        phone: document.getElementById('abPhone').value,
        organisation: document.getElementById('abOrg').value,
        enquiry_type: document.getElementById('abType').value,
        message: sanitise(message)
    };

    var btn = document.getElementById('abSubmitBtn');
    var label = document.getElementById('abSubmitLabel');
    btn.disabled = true;
    label.textContent = 'Sending…';

    fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
        if (data.success) {
            document.getElementById('aboutFormCard').innerHTML =
                '<div style="text-align:center;padding:3rem 1rem;">' +
                '<div style="font-size:3rem;margin-bottom:1rem;">✓</div>' +
                '<h3 style="margin-bottom:0.5rem;color:var(--color-primary);">Message Sent!</h3>' +
                '<p style="color:var(--color-text-secondary);">We\'ll get back to you within 24 hours.</p></div>';
        } else {
            alert('Error: ' + (data.message || 'Something went wrong.'));
            btn.disabled = false;
            label.textContent = 'Send Message →';
        }
    })
    .catch(function (err) {
        alert('Network error: ' + err.message);
        btn.disabled = false;
        label.textContent = 'Send Message →';
    });
}
