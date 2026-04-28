// ============================================================
// AARUSH ECO TECH — contact-page.js
// Extracted from inline <script> block in contact.html
// Requires: scripts.js loaded before this
// ============================================================


// Form submission
async function submitContact() {
  if (document.getElementById('fHoney').value) return;

  const name = document.getElementById('fName').value.trim();
  const email = document.getElementById('fEmail').value.trim();
  const message = document.getElementById('fMessage').value.trim();

  if (!name || !email || !message) {
    [['fName', name], ['fEmail', email], ['fMessage', message]].forEach(([id, val]) => {
      if (!val) {
        const el = document.getElementById(id);
        if (el) {
          el.style.borderColor = '#ef4444';
          el.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)';
          el.addEventListener('input', () => {
            el.style.borderColor = '';
            el.style.boxShadow = '';
          }, { once: true });
        }
      }
    });
    return;
  }

  const isLocal = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
  const hCaptchaResponse = document.querySelector('[name="h-captcha-response"]')?.value || '';
  if (!isLocal && !hCaptchaResponse) {
    alert('Please complete the captcha before submitting.');
    return;
  }

  // Sanitise user input before sending
  function sanitise(str) {
    return str.replace(/[<>&"']/g, function (c) {
      return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  const payload = {
    access_key: document.getElementById('submitBtn')?.getAttribute('data-access-key') || '',
    subject: 'New Contact Enquiry — ' + (document.getElementById('fType').value || 'General') + ' | Aarush Eco Tech',
    name: sanitise(name),
    email,
    phone: document.getElementById('fPhone').value,
    organisation: document.getElementById('fOrg').value,
    city: document.getElementById('fCity').value,
    enquiry_type: document.getElementById('fType').value,
    message: sanitise(message),
  };

  if (!isLocal && hCaptchaResponse) payload['h-captcha-response'] = hCaptchaResponse;

  const btn = document.getElementById('submitBtn');
  const label = document.getElementById('submitLabel');
  btn.disabled = true;
  label.textContent = 'Sending…';

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('formBody').style.display = 'none';
      document.getElementById('formSuccess').style.display = 'block';
    } else {
      alert('Error: ' + (data.message || 'Something went wrong. Please try again.'));
      btn.disabled = false;
      label.textContent = 'Send Message';
    }
  } catch (err) {
    alert('Network error: ' + err.message);
    btn.disabled = false;
    label.textContent = 'Send Message';
  }
}
// ==================== CURSOR REVEAL EFFECT ====================
(function () {
  const wrap = document.querySelector('.contact-image-wrap');
  if (!wrap) return;
  const img = wrap.querySelector('.contact-hero-image');
  if (!img) return;

  const gray = document.createElement('img');
  gray.src = img.src;
  gray.alt = '';
  gray.setAttribute('aria-hidden', 'true');
  gray.classList.add('contact-gray-clone');
  wrap.appendChild(gray);

  let radius = 0, target = 0, cx = 50, cy = 50, raf;

  // Entry point se color grow start ho
  wrap.addEventListener('mouseenter', function (e) {
    const r = wrap.getBoundingClientRect();
    cx = ((e.clientX - r.left) / r.width) * 100;
    cy = ((e.clientY - r.top) / r.height) * 100;
    radius = 0;
    target = 600;
    run();
  });

  // Cursor ke saath color follow kare
  wrap.addEventListener('mousemove', function (e) {
    const r = wrap.getBoundingClientRect();
    cx = ((e.clientX - r.left) / r.width) * 100;
    cy = ((e.clientY - r.top) / r.height) * 100;
  });

  // Exit point pe color shrink ho
  wrap.addEventListener('mouseleave', function (e) {
    const r = wrap.getBoundingClientRect();
    cx = ((e.clientX - r.left) / r.width) * 100;
    cy = ((e.clientY - r.top) / r.height) * 100;
    target = 0;
    run();
  });

  function run() {
    cancelAnimationFrame(raf);
    (function step() {
      radius += (target - radius) * 0.08;
      const m = `radial-gradient(circle ${radius.toFixed(1)}px at ${cx.toFixed(1)}% ${cy.toFixed(1)}%, transparent 0%, black 100%)`;
      gray.style.webkitMaskImage = m;
      gray.style.maskImage = m;
      if (Math.abs(target - radius) > 0.3) raf = requestAnimationFrame(step);
    })();
  }
})();
