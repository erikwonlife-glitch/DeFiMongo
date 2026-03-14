/* ═══════════════════════════════════════════════════════════
   CHAINROOT YIELD PAGE
═══════════════════════════════════════════════════════════ */

function openYieldPage() {
  const overlay = document.getElementById('yieldOverlay');
  if (!overlay) return;
  overlay.classList.add('on');
  document.body.style.overflow = 'hidden';
  // Sync language
  if (window.SITE_LANG) {
    document.querySelectorAll('#yieldOverlay [data-mn]').forEach(function(el) {
      const txt = el.getAttribute('data-' + window.SITE_LANG);
      if (txt !== null) el.innerHTML = txt;
    });
  }
}

function closeYieldPage() {
  const overlay = document.getElementById('yieldOverlay');
  if (!overlay) return;
  overlay.classList.remove('on');
  document.body.style.overflow = '';
}

// Close on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeYieldPage();
});

function updateVaultPreview() {
  const name = document.getElementById('vaultName')?.value || 'ChainRoot SOL/USDC Vault';
  const pair = document.getElementById('vaultPair')?.value || 'SOL/USDC';
  const perf = parseFloat(document.getElementById('perfFee')?.value || 15);
  const mgmt = parseFloat(document.getElementById('mgmtFee')?.value || 0);
  const addr = document.getElementById('vaultAddr')?.value || '';

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const perfClamped = clamp(perf, 10, 20);
  const mgmtClamped = clamp(mgmt, 0, 2);

  const pvName = document.getElementById('pvName');
  const pvPair = document.getElementById('pvPair');
  const pvPerf = document.getElementById('pvPerf');
  const pvMgmt = document.getElementById('pvMgmt');
  const pvAddr = document.getElementById('pvAddr');

  if (pvName) pvName.textContent = name || 'ChainRoot Vault';
  if (pvPair) pvPair.textContent = pair;
  if (pvPerf) pvPerf.textContent = perfClamped + '%';
  if (pvMgmt) pvMgmt.textContent = mgmtClamped.toFixed(1) + '%/yr';
  if (pvAddr) {
    if (addr.length > 6) {
      pvAddr.textContent = addr.slice(0, 6) + '...' + addr.slice(-6);
      pvAddr.style.color = '#14F195';
    } else {
      pvAddr.textContent = 'Not yet deployed';
      pvAddr.style.color = '#4d6475';
    }
  }
}

function handleVaultDeploy() {
  const addr = document.getElementById('vaultAddr')?.value || '';
  const pair = document.getElementById('vaultPair')?.value || 'SOL/USDC';
  const name = document.getElementById('vaultName')?.value || 'ChainRoot Vault';
  
  if (!addr || addr.length < 32) {
    // Guide user to deploy first
    alert('📋 Steps to deploy your vault:\n\n1. Run the TypeScript SDK code shown above\n2. Copy the vault address from the output\n3. Paste it into the "Your Vault Address" field\n4. Click Deploy to register it with ChainRoot\n\ncontact ChainRoot support to get started.');
    return;
  }
  
  // Simulate vault registration
  const btn = document.querySelector('.yl-deploy-btn');
  if (btn) {
    btn.textContent = '⟳ Registering vault...';
    btn.style.opacity = '.7';
    setTimeout(function() {
      btn.textContent = '✓ Vault registered! Appearing in community list soon.';
      btn.style.background = 'linear-gradient(135deg, #14F195, #00b85e)';
      setTimeout(function() {
        btn.textContent = '◈ Deploy ChainRoot Vault →';
        btn.style.background = '';
        btn.style.opacity = '';
      }, 5000);
    }, 2000);
  }
}

function openVaultDeposit(tokenMint) {
  // Internal: opens ChainRoot deposit flow
  const section = document.querySelector('.yl-vault-setup');
  if (section) section.scrollIntoView({ behavior: 'smooth' });
}
function openYieldDeposit() {
  const section = document.querySelector('.yl-vault-setup');
  if (section) section.scrollIntoView({ behavior: 'smooth' });
}
function openYieldDocs() {
  const section = document.querySelector('.yl-steps');
  if (section) section.scrollIntoView({ behavior: 'smooth' });
}

window.openYieldPage = openYieldPage;
window.closeYieldPage = closeYieldPage;
window.updateVaultPreview = updateVaultPreview;
window.handleVaultDeploy = handleVaultDeploy;
window.openVaultDeposit = openVaultDeposit;
window.openYieldDeposit = openYieldDeposit;
window.openYieldDocs = openYieldDocs;
