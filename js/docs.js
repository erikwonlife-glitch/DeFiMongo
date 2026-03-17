/* ═══════════════════════════════════════════════════════════
   DEFIMONGO — DOCS PAGE  (v1)
   Documentation, Legal, Fees — full bilingual MN/EN
═══════════════════════════════════════════════════════════ */

/* ── OPEN / CLOSE ────────────────────────────────────────── */
function openDocsPage(section) {
  var sec = section || 'overview';
  document.getElementById('docsOverlay').classList.add('on');
  document.body.style.overflow = 'hidden';
  showDocsSection(sec);
  syncDocsLangButtons();
}

function closeDocsPage() {
  document.getElementById('docsOverlay').classList.remove('on');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeDocsPage();
});

/* ── SECTION SWITCHER ────────────────────────────────────── */
function showDocsSection(id) {
  // Hide all sections
  document.querySelectorAll('#docsOverlay .docs-section').forEach(function(el) {
    el.classList.remove('active');
  });
  // Show target
  var target = document.getElementById('docs-' + id);
  if (target) target.classList.add('active');

  // Update nav active state
  document.querySelectorAll('#docsOverlay .docs-nav-item').forEach(function(btn) {
    btn.classList.remove('active');
  });
  // Find matching nav item by onclick attribute
  document.querySelectorAll('#docsOverlay .docs-nav-item').forEach(function(btn) {
    if (btn.getAttribute('onclick') === "showDocsSection('" + id + "')") {
      btn.classList.add('active');
    }
  });

  // Scroll content area to top
  var shell = document.querySelector('#docsOverlay .docs-content');
  if (shell) shell.scrollTop = 0;
  var overlay = document.getElementById('docsOverlay');
  if (overlay) overlay.scrollTop = 0;
}

/* ── LANGUAGE SYNC ───────────────────────────────────────── */
function syncDocsLangButtons() {
  var lang = (typeof SITE_LANG !== 'undefined') ? SITE_LANG : 'mn';
  var mnBtn = document.getElementById('docs-lang-mn');
  var enBtn = document.getElementById('docs-lang-en');
  if (!mnBtn || !enBtn) return;
  if (lang === 'mn') {
    mnBtn.style.background = '#00e87a'; mnBtn.style.color = '#000';
    enBtn.style.background = 'transparent'; enBtn.style.color = 'var(--muted)';
  } else {
    enBtn.style.background = '#00e87a'; enBtn.style.color = '#000';
    mnBtn.style.background = 'transparent'; mnBtn.style.color = 'var(--muted)';
  }
}

/* ── HOOK INTO GLOBAL LANG SWITCHER ─────────────────────── */
var _docsPrevSetSiteLang = window.setSiteLang;
window.setSiteLang = function(lang) {
  if (_docsPrevSetSiteLang) _docsPrevSetSiteLang(lang);
  syncDocsLangButtons();
};

/* ── EXPORTS ─────────────────────────────────────────────── */
window.openDocsPage    = openDocsPage;
window.closeDocsPage   = closeDocsPage;
window.showDocsSection = showDocsSection;
