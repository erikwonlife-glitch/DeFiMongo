/* ── AI AUTOMATION PAGE ──────────────────────────────────── */

function openAIAutoPage() {
  document.getElementById('aiAutoOverlay').classList.add('on');
  document.body.style.overflow = 'hidden';
}

function closeAIAutoPage() {
  document.getElementById('aiAutoOverlay').classList.remove('on');
  document.body.style.overflow = '';
  // also hide phone popup when page closes
  var p = document.getElementById('aiPhonePopup');
  if (p) p.classList.remove('on');
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeAIAutoPage();
});

/* ── PHONE POPUP ─────────────────────────────────────────── */

function togglePhonePopup(e) {
  e.stopPropagation();
  var popup = document.getElementById('aiPhonePopup');
  popup.classList.toggle('on');
}

// Close popup when clicking anywhere outside it
document.addEventListener('click', function(e) {
  var popup = document.getElementById('aiPhonePopup');
  if (!popup) return;
  if (popup.classList.contains('on') && !popup.contains(e.target)) {
    popup.classList.remove('on');
  }
});

function copyAIPhone(btn) {
  navigator.clipboard.writeText('+97672208456').then(function() {
    btn.textContent = '✓';
    btn.classList.add('copied');
    setTimeout(function() {
      btn.textContent = '⧉';
      btn.classList.remove('copied');
    }, 2000);
  });
}
