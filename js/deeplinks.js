/* ══════════════════════════════════════════════════════════════
   DEEP LINKS — URL hash routing
   Every page gets its own shareable link, e.g.:
     #crypto-prices  →  main crypto prices panel
     #ai-automation  →  AI automation overlay
     #training       →  free training overlay
   Runs after all other scripts have loaded (window.load).
   ══════════════════════════════════════════════════════════════ */

(function () {

  /* Overlay pages that aren't regular panels */
  var OVERLAYS = {
    'ai-automation': {
      open:  function () { if (typeof openAIAutoPage  === 'function') openAIAutoPage(); },
      close: function () { if (typeof closeAIAutoPage === 'function') closeAIAutoPage(); }
    },
    'training': {
      open:  function () { if (typeof openTrainingPage  === 'function') openTrainingPage(); },
      close: function () { if (typeof closeTrainingPage === 'function') closeTrainingPage(); }
    }
  };

  /* Return the id of the currently visible panel */
  function currentPanel() {
    var active = document.querySelector('.pnl.on');
    return active ? active.id.replace('P-', '') : 'crypto-prices';
  }

  /* Set the hash without adding a browser history entry */
  function setHash(h) {
    history.replaceState(null, '', '#' + h);
  }

  /* ── PATCH go() ───────────────────────────────────────────── */
  var _origGo = window.go;
  window.go = function (id, el) {
    _origGo(id, el);
    setHash(id);
  };

  /* ── PATCH overlay open/close ─────────────────────────────── */
  var _origOpenTraining  = window.openTrainingPage;
  var _origCloseTraining = window.closeTrainingPage;
  window.openTrainingPage = function () {
    if (typeof _origOpenTraining === 'function') _origOpenTraining();
    setHash('training');
  };
  window.closeTrainingPage = function () {
    if (typeof _origCloseTraining === 'function') _origCloseTraining();
    setHash(currentPanel());
  };

  var _origOpenAI  = window.openAIAutoPage;
  var _origCloseAI = window.closeAIAutoPage;
  window.openAIAutoPage = function () {
    if (typeof _origOpenAI === 'function') _origOpenAI();
    setHash('ai-automation');
  };
  window.closeAIAutoPage = function () {
    if (typeof _origCloseAI === 'function') _origCloseAI();
    setHash(currentPanel());
  };

  /* ── NAVIGATE TO A HASH ───────────────────────────────────── */
  function navigateTo(raw) {
    var hash = (raw || '').replace(/^#/, '').trim();
    if (!hash) return;

    /* Overlay page? */
    if (OVERLAYS[hash]) {
      OVERLAYS[hash].open();
      return;
    }

    /* Regular panel — find its sidebar nav item to keep active state */
    var panel = document.getElementById('P-' + hash);
    if (!panel) return; /* unknown hash — leave page as-is */

    var navItem = null;
    document.querySelectorAll('.nl').forEach(function (nl) {
      var oc = nl.getAttribute('onclick') || '';
      /* match go('hash', or go("hash", */
      if (oc.indexOf("'" + hash + "'") !== -1 || oc.indexOf('"' + hash + '"') !== -1) {
        navItem = nl;
      }
    });
    window.go(hash, navItem);
  }

  /* ── COPY-LINK BUTTON ─────────────────────────────────────── */
  /* Injects a small "⧉ Copy link" button into every page header */
  function injectCopyButtons() {
    document.querySelectorAll('.pnl').forEach(function (pnl) {
      var id = pnl.id.replace('P-', '');
      var ph = pnl.querySelector('.ph');
      if (!ph || ph.querySelector('.dl-copy-btn')) return; /* already added */

      var btn = document.createElement('button');
      btn.className = 'dl-copy-btn';
      btn.title = 'Copy link to this page';
      btn.innerHTML = '<span class="dl-icon">⧉</span><span class="dl-txt">Copy link</span>';
      btn.onclick = function () {
        var url = location.origin + location.pathname + '#' + id;
        navigator.clipboard.writeText(url).then(function () {
          btn.innerHTML = '<span class="dl-icon">✓</span><span class="dl-txt">Copied!</span>';
          btn.classList.add('dl-copied');
          setTimeout(function () {
            btn.innerHTML = '<span class="dl-icon">⧉</span><span class="dl-txt">Copy link</span>';
            btn.classList.remove('dl-copied');
          }, 2200);
        });
      };
      ph.appendChild(btn);
    });
  }

  /* ── BOOT ─────────────────────────────────────────────────── */
  window.addEventListener('load', function () {
    injectCopyButtons();

    /* Deep-link on initial page open */
    if (window.location.hash && window.location.hash.length > 1) {
      navigateTo(window.location.hash);
    } else {
      /* No hash → set default so the address bar always shows something */
      setHash(currentPanel());
    }

    /* Browser back / forward */
    window.addEventListener('hashchange', function () {
      navigateTo(window.location.hash);
    });
  });

})();
