/* ── AI AUTOMATION PAGE ──────────────────────────────────── */

function openAIAutoPage() {
  document.getElementById('aiAutoOverlay').classList.add('on');
  document.body.style.overflow = 'hidden';
}

function closeAIAutoPage() {
  document.getElementById('aiAutoOverlay').classList.remove('on');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeAIAutoPage();
});
