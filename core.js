// ============================================================
// AARUSH ECO TECH â€” CORE JS  âœ… PRIMARY JS BLOCK (global)
// Phase 2 refactor â€” extracted from scripts.js
//
// Contents: mobile nav, navbar scroll, lazy images,
// analytics tracking, clipboard, WhatsApp, service worker,
// footer loader, keyboard accessibility, card interactions,
// page-load fade-in observer.
//
// NOT included here (page-specific, moved to page-index.js):
//   - animateKPIs()      â†’ targets esg-analytics.html IDs
//   - setupKPIObserver() â†’ tied to animateKPIs()
//   - toggleTheme()      â†’ theme disabled, moved to secondary
//   - initializeTheme()  â†’ theme disabled, moved to secondary
// ============================================================

// ==================== THEME LOCK (Light-mode only) ====================
// Theme toggle disabled â€” always force light mode.
(function () {
    document.documentElement.setAttribute('data-theme', 'light');
})();

document.body.classList.add('loading');

function markHeaderReady() {
    if (!document.body) return;
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
}

// ==================== EMAIL OBFUSCATION ====================
function obfuscateEmails() {
    var u = 'info';
    var d = 'ecotech.co.in';
    var link = '<a href="mailto:' + u + '@' + d + '">' + u + '@' + d + '</a>';
    var fEmail = document.getElementById('footer-email');
    var cEmail = document.getElementById('contact-email');
    if (fEmail) fEmail.innerHTML = link;
    if (cEmail) cEmail.innerHTML = link;
}

// ==================== SOLUTIONS DROPDOWN ====================
function initSolutionsDropdown() {
    (function () {
      const trigger = document.getElementById('nav-solutions-trigger');
      const panel = document.getElementById('solutions-dropdown');
      if (!trigger || !panel) return;

      let openTimer, closeTimer;
      const DELAY = 120;

      const solutionPages = [
        'industries.html',
        'esg-analytics.html', 
        'resource.html',
        'advertise.html'
      ];

      function open() {
        clearTimeout(closeTimer);
        openTimer = setTimeout(() => {
          panel.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
        }, DELAY);
      }

      function close() {
        clearTimeout(openTimer);
        closeTimer = setTimeout(() => {
          panel.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        }, DELAY);
      }

      trigger.addEventListener('mouseenter', open);
      trigger.addEventListener('mouseleave', close);
      panel.addEventListener('mouseenter', () => clearTimeout(closeTimer));
      panel.addEventListener('mouseleave', close);

      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          panel.classList.contains('open') ? close() : open();
        }
        if (e.key === 'Escape') close();
      });

      document.addEventListener('click', (e) => {
        if (!trigger.contains(e.target) && !panel.contains(e.target)) close();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
      });

      // Highlight Solutions trigger when on a child page
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      if (solutionPages.includes(currentPage)) {
        trigger.classList.add('active');
      }

      // Throttled scroll for navbar border
      let ticking = false;
      const navbar = document.getElementById('site-header');
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            if (navbar) {
              navbar.style.borderBottom = window.scrollY > 10
                ? '1px solid #e8e8e8'
                : 'none';
            }
            ticking = false;
          });
          ticking = true;
        }
      });
    })();
}

// ==================== SHARED HEADER LOADER ====================
function normalizePageName(pathname) {
    var page = pathname.split('/').pop() || 'index.html';
    return page.toLowerCase();
}

function bindMobileNavLinkClose(scope) {
    var el = scope || document;
    // close mobile nav on any nav link click (including dropdown links)
    el.querySelectorAll('.site-nav__links a:not([aria-disabled="true"])').forEach(function (link) {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768) {
                var navLinks = document.getElementById('navLinks');
                if (navLinks && navLinks.classList.contains('active')) toggleMobileMenu();
            }
        });
    });
}

function setActiveNavLink(scope) {
    var page = normalizePageName(window.location.pathname);
    var normalized = page === '' ? 'index.html' : page;
    var el = scope || document;

    // Top-level <a> links
    el.querySelectorAll('.site-nav__links > li > a').forEach(function (a) {
        var target = a.getAttribute('data-nav') || normalizePageName(a.getAttribute('href') || '');
        var isActive = target === normalized;
        a.classList.toggle('active', isActive);
        if (isActive) { a.setAttribute('aria-current', 'page'); }
        else { a.removeAttribute('aria-current'); }
    });

}

function loadHeader() {
    var slot = document.getElementById('site-header');
    var HEADER_CACHE_KEY = 'aet:header.fragment:v20260313-07';

    function hydrateHeader(scope) {
        setActiveNavLink(scope);
        bindMobileNavLinkClose(scope);
        navbar = document.querySelector('.site-nav');

        // Logo smooth-scroll-to-top on homepage
        var logoEl = document.querySelector('.site-nav__logo');
        if (logoEl) {
            logoEl.addEventListener('click', function (e) {
                var page = normalizePageName(window.location.pathname);
                if (page === 'index.html' || page === '') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }

        initSolutionsDropdown();
        markHeaderReady();
    }

    if (!slot) {
        hydrateHeader(document);
        return;
    }

    // Header already baked in by build.js (Netlify build) — skip fetch entirely
    if (slot.children.length > 0) {
        hydrateHeader(slot);
        return;
    }

    var cachedHeader = null;
    try {
        cachedHeader = sessionStorage.getItem(HEADER_CACHE_KEY);
    } catch (err) {
        cachedHeader = null;
    }

    if (cachedHeader) {
        slot.innerHTML = cachedHeader;
        hydrateHeader(slot);
        return;
    }

    fetch('header.fragment?v=20260313-07', { cache: 'no-cache' })
        .then(function (res) {
            if (!res.ok) throw new Error('Header fetch failed: ' + res.status);
            return res.text();
        })
        .then(function (html) {
            slot.innerHTML = html;
            try {
                sessionStorage.setItem(HEADER_CACHE_KEY, html);
            } catch (err) {
                // Ignore storage errors (private mode/quota/etc.)
            }
            hydrateHeader(slot);
        })
        .catch(function (err) {
            console.warn('Header load error:', err);
            markHeaderReady();
        });
}

// ==================== SHARED FOOTER LOADER ====================
function loadFooter() {
    var slot = document.getElementById('site-footer');
    if (!slot) return;

    // Footer already baked in by build.js (Netlify build) — skip fetch entirely
    if (slot.children.length > 0) {
        obfuscateEmails();
        return;
    }

    fetch('footer.fragment', { cache: 'no-store' })
        .then(function (res) {
            if (!res.ok) throw new Error('Footer fetch failed: ' + res.status);
            return res.text();
        })
        .then(function (html) {
            slot.innerHTML = html;
            obfuscateEmails();
        })
        .catch(function (err) {
            if (slot) {
                var fu = 'info', fd = 'ecotech.co.in';
                slot.innerHTML =
                    '<footer class="footer"><div class="container">' +
                    '<div class="footer-bottom">' +
                    '<p>&copy; 2026 Aarush Eco Tech. <a href="mailto:' + fu + '@' + fd + '">' + fu + '@' + fd + '</a></p>' +
                    '</div></div></footer>';
            }
            console.warn('Footer load error:', err);
        });
}

// ==================== MOBILE NAVIGATION ====================
function toggleMobileMenu() {
    var navLinks = document.getElementById('navLinks');
    var overlay = document.getElementById('navOverlay');
    var menuBtn = document.getElementById('navHamburger');

    if (navLinks && overlay && menuBtn) {
        navLinks.classList.toggle('active');
        overlay.classList.toggle('active');
        menuBtn.classList.toggle('active');

        var isExpanded = navLinks.classList.contains('active');
        menuBtn.setAttribute('aria-expanded', isExpanded);

        document.body.style.overflow = isExpanded ? 'hidden' : '';
    }
}

// ==================== NAVBAR SCROLL EFFECT ====================
var navbar = null;
var lastScrolled = false;
var rafPending = false;

function handleHeaderScroll() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var shouldScroll = scrollTop > 10;

    if (shouldScroll === lastScrolled) { rafPending = false; return; }
    lastScrolled = shouldScroll;

    if (!navbar) navbar = document.querySelector('.site-nav');

    if (navbar) {
        navbar.classList.toggle('scrolled', shouldScroll);
    }
    rafPending = false;
}

window.addEventListener('scroll', function () {
    if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(handleHeaderScroll);
    }
}, { passive: true });

// ==================== SCROLL PROGRESS BAR ====================

window.addEventListener("scroll", function () {

  const bar = document.getElementById("scroll-progress");
  if (!bar) return;

  const scrollTop = window.scrollY;
  const scrollHeight =
    document.documentElement.scrollHeight - window.innerHeight;

  const progress = Math.min((scrollTop / scrollHeight) * 100, 100);

  bar.style.width = progress + "%";

});

// ==================== FORM VALIDATION ====================
function validateContactForm(event) {
    var form = event.target;
    var email = form.querySelector('input[type="email"]');
    var phone = form.querySelector('input[type="tel"]');
    var isValid = true;

    if (email && email.value) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            alert('Please enter a valid email address');
            email.focus();
            isValid = false;
        }
    }

    if (phone && phone.value) {
        var phoneRegex = /^[6-9]\d{9}$/;
        var cleanPhone = phone.value.replace(/\D/g, '');
        if (!phoneRegex.test(cleanPhone)) {
            alert('Please enter a valid 10-digit Indian mobile number');
            phone.focus();
            isValid = false;
        }
    }

    return isValid;
}

// ==================== CARD INTERACTIONS ====================
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.card, .kpi-card, .stat-card').forEach(function (card) {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-4px)';
        });
        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });
});

// ==================== LAZY LOADING IMAGES ====================
document.addEventListener('DOMContentLoaded', function () {
    var images = document.querySelectorAll('img[data-src]');
    var imageObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    images.forEach(function (img) { imageObserver.observe(img); });
});

// ==================== ANALYTICS TRACKING ====================
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
}

// Track CTA clicks
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.btn-primary, .btn-accent').forEach(function (button) {
        button.addEventListener('click', function () {
            var text = this.textContent.trim();
            var href = this.getAttribute('href') || '';
            trackEvent('CTA', 'click', text + ' - ' + href);
        });
    });
});

// ==================== COPY TO CLIPBOARD ====================
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function () {
        var toast = document.createElement('div');
        toast.textContent = 'Copied to clipboard!';
        toast.style.cssText =
            'position:fixed;bottom:2rem;right:2rem;background:var(--color-primary);' +
            'color:white;padding:1rem 1.5rem;border-radius:8px;' +
            'box-shadow:var(--shadow-lg);z-index:10000;animation:fadeInUp .3s ease-out;';
        document.body.appendChild(toast);
        setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity .3s ease-out';
            setTimeout(function () { toast.remove(); }, 300);
        }, 2000);
    }).catch(function (err) {
        console.error('Failed to copy:', err);
    });
}

// ==================== KEYBOARD ACCESSIBILITY ====================
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        // Close mobile nav if open (Solutions dropdown has its own Escape handler)
        var navLinks = document.getElementById('navLinks');
        if (navLinks && navLinks.classList.contains('active')) toggleMobileMenu();
    }
});


// ==================== PAGE LOAD OPTIMIZATIONS ====================
window.addEventListener('load', function () {
    markHeaderReady();

    // Fade-in animation for sections
    var sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section').forEach(function (s) {
        sectionObserver.observe(s);
    });
});

// ==================== WHATSAPP INTEGRATION ====================
function openWhatsApp(phone, message) {
    var formattedPhone = phone.replace(/\D/g, '');
    var encodedMessage = encodeURIComponent(message);
    var url = 'https://wa.me/' + formattedPhone + '?text=' + encodedMessage;
    window.open(url, '_blank', 'noopener,noreferrer');
    trackEvent('WhatsApp', 'click', phone);
}

// ==================== SERVICE WORKER ====================
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js')
            .then(function () { /* registered */ })
            .catch(function (err) { console.warn('SW registration failed:', err); });
    });
}

// ==================== INIT ====================
var headerInitStarted = false;
function ensureHeaderLoaded() {
    if (headerInitStarted) return;
    headerInitStarted = true;
    loadHeader();
}

// Start header load as early as possible to avoid visible delay.
ensureHeaderLoaded();

// ==================== FLOATING CONTACT CTA ====================
function injectFloatingCta() {
    // Skip on contact pages
    var body = document.body;
    if (body.classList.contains('page-contact') || body.classList.contains('page-contact-urbanreach')) return;
    // Skip if already present (e.g. from shared footer)
    if (document.getElementById('floatingCta')) return;

    var a = document.createElement('a');
    a.className = 'floating-cta';
    a.id = 'floatingCta';
    a.href = 'contact.html';
    a.setAttribute('aria-label', 'Contact us');
    a.innerHTML =
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg><span>Contact Us</span>';
    body.appendChild(a);
}

document.addEventListener('DOMContentLoaded', function () {
    ensureHeaderLoaded();
    obfuscateEmails();
    loadFooter();
    injectFloatingCta();
});

// ==================== PUBLIC API ====================
window.ecoTech = {
    toggleMobileMenu: toggleMobileMenu,
    trackEvent: trackEvent,
    copyToClipboard: copyToClipboard,
    openWhatsApp: openWhatsApp,
    validateContactForm: validateContactForm
};

