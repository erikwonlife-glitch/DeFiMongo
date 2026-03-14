/* ── TRAINING PAGE ────────────────────────────────────── */
function openTrainingPage() {
  document.getElementById('trainingOverlay').classList.add('on');
  document.body.style.overflow = 'hidden';
}
function closeTrainingPage() {
  document.getElementById('trainingOverlay').classList.remove('on');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeTrainingPage();
});

/* ── VIDEO HELPER ─────────────────────────────────────── */
function showVideoInstructions() {
  alert('Видео байршуулахын тулд HTML файлд YOUR_YOUTUBE_VIDEO_ID-ийг өөрийн YouTube видео ID-р солино уу.\n\nTo add your video: replace YOUR_YOUTUBE_VIDEO_ID in the HTML file with your actual YouTube video ID.');
}

/* ── LANGUAGE SWITCHER ────────────────────────────────── */
// Mongolian is the DEFAULT language.
// Every translatable element has data-mn="..." and data-en="..." attributes.
// setLang() swaps all of them at once.
let CR_LANG = 'mn';

function setLang(lang) {
  CR_LANG = lang;
  // Update all translatable elements inside the training overlay
  document.querySelectorAll('#trainingOverlay [data-mn]').forEach(function(el) {
    const text = el.getAttribute('data-' + lang);
    if (text) el.innerHTML = text;
  });
  // Update tab button styles
  const mnBtn = document.getElementById('lang-mn');
  const enBtn = document.getElementById('lang-en');
  if (mnBtn && enBtn) {
    if (lang === 'mn') {
      mnBtn.style.background = '#f4c542';
      mnBtn.style.color = '#000';
      enBtn.style.background = 'transparent';
      enBtn.style.color = 'var(--muted)';
    } else {
      enBtn.style.background = '#f4c542';
      enBtn.style.color = '#000';
      mnBtn.style.background = 'transparent';
      mnBtn.style.color = 'var(--muted)';
    }
  }
}
// Expose globally so onclick works
window.setLang = setLang;
window.openTrainingPage = openTrainingPage;
window.closeTrainingPage = closeTrainingPage;
window.showVideoInstructions = showVideoInstructions;

/* ── MOBILE SIDEBAR ───────────────────────────────────── */
function toggleMobileSidebar() {
  const sb = document.querySelector('.sb');
  const ov = document.getElementById('sbOverlay');
  if (!sb) return;
  const isOpen = sb.classList.contains('mob-open');
  if (isOpen) {
    sb.classList.remove('mob-open');
    ov.classList.remove('on');
  } else {
    sb.classList.add('mob-open');
    ov.classList.add('on');
  }
}
function closeMobileSidebar() {
  const sb = document.querySelector('.sb');
  const ov = document.getElementById('sbOverlay');
  if (sb) sb.classList.remove('mob-open');
  if (ov) ov.classList.remove('on');
}
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.nl').forEach(function(link) {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 768) closeMobileSidebar();
    });
  });
});
