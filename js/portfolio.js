/* ═══════════════════════════════════════════════════════════
   CHAINROOT — PORTFOLIO DASHBOARD v1
   Real-time Solana portfolio tracker
   • Fetches SOL balance via Solana RPC
   • Fetches SPL token accounts via getTokenAccountsByOwner
   • Prices from CoinGecko (same source as the rest of the app)
   • Allocation chart via Canvas (no extra lib needed)
═══════════════════════════════════════════════════════════ */

'use strict';

const PORT = (function() {

// ── CONSTANTS ────────────────────────────────────────────────
const SOL_RPC   = 'https://api.mainnet-beta.solana.com';
const SOL_MINT  = 'So11111111111111111111111111111111111111112';
const LAMPORTS  = 1e9;

// Well-known SPL token mints → CoinGecko IDs
const MINT_TO_CG = {
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { id:'usd-coin',        sym:'USDC',  name:'USD Coin',    dec:6  },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { id:'tether',           sym:'USDT',  name:'Tether',      dec:6  },
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': { id:'msol',             sym:'mSOL',  name:'mSOL',        dec:9  },
  '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': { id:'wrapped-ether',    sym:'wETH',  name:'Wrapped ETH', dec:8  },
  '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E': { id:'wrapped-bitcoin',  sym:'wBTC',  name:'Wrapped BTC', dec:6  },
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': { id:'bonk',             sym:'BONK',  name:'BONK',        dec:5  },
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN':  { id:'jupiter-exchange-solana', sym:'JUP', name:'Jupiter', dec:6 },
  'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL':  { id:'jito-governance-token',   sym:'JTO', name:'Jito',    dec:9 },
  'HZ1JovNiVvGrCNiiYWY1ZRyfSBZqCM3EPpLQm7e7P3N':  { id:'tensor',           sym:'TNSR',  name:'Tensor',      dec:8  },
  'WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk':   { id:'wen-4',            sym:'WEN',   name:'WEN',         dec:5  },
};

// ── STATE ────────────────────────────────────────────────────
let _holdings     = [];   // [{sym, name, mint, amount, cgId, price, value, chg24h, color}]
let _initialized  = false;
let _lastFetch    = null;
let _allocChart   = null;

// ── PALETTE (for allocation chart) ──────────────────────────
const PALETTE = [
  '#9945FF','#14F195','#00b4d8','#f4c542','#ff7c3a',
  '#a78bfa','#00e87a','#38bdf8','#fb923c','#e879f9',
];

// ── ENTRY POINT (called by go() in auth.js) ──────────────────
async function initPortfolioDashboard() {
  if (!CR_USER) { showState('auth'); return; }

  const wallet = CR_USER.walletAddress;
  if (!wallet) {
    showState('auth');
    return;
  }

  showState('loading');
  updatePhHeader(null, null, null);

  try {
    await loadPortfolio(wallet);
  } catch(e) {
    console.error('[Portfolio]', e);
    showState('auth'); // fallback — show connect prompt
  }
}

// ── LOAD / REFRESH ───────────────────────────────────────────
async function loadPortfolio(wallet) {
  showState('loading');

  const [solBalance, tokenAccounts, prices] = await Promise.all([
    fetchSolBalance(wallet),
    fetchTokenAccounts(wallet),
    fetchPrices(),
  ]);

  _holdings = buildHoldings(solBalance, tokenAccounts, prices);
  _lastFetch = new Date();

  renderDashboard(wallet);
  showState('main');
}

async function refreshPortfolioData() {
  if (!CR_USER?.walletAddress) return;
  await loadPortfolio(CR_USER.walletAddress);
  if (typeof toast === 'function') toast('Portfolio refreshed', '#14F195');
}

// ── RPC CALLS ─────────────────────────────────────────────────
async function fetchSolBalance(wallet) {
  try {
    const res = await fetch(SOL_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1, method: 'getBalance',
        params: [wallet, { commitment: 'confirmed' }],
      }),
      signal: AbortSignal.timeout(10000),
    });
    const j = await res.json();
    return (j?.result?.value || 0) / LAMPORTS;
  } catch(e) { return 0; }
}

async function fetchTokenAccounts(wallet) {
  try {
    const res = await fetch(SOL_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1,
        method: 'getTokenAccountsByOwner',
        params: [
          wallet,
          { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
          { encoding: 'jsonParsed', commitment: 'confirmed' },
        ],
      }),
      signal: AbortSignal.timeout(12000),
    });
    const j = await res.json();
    const accounts = j?.result?.value || [];
    const out = [];
    for (const acc of accounts) {
      const info  = acc?.account?.data?.parsed?.info;
      if (!info) continue;
      const mint  = info.mint;
      const meta  = MINT_TO_CG[mint];
      if (!meta) continue;                     // skip unknown tokens for now
      const raw   = info.tokenAmount;
      const amt   = parseFloat(raw?.uiAmountString || '0');
      if (amt <= 0) continue;
      out.push({ mint, sym: meta.sym, name: meta.name, cgId: meta.id, amount: amt });
    }
    return out;
  } catch(e) { return []; }
}

// ── PRICES ───────────────────────────────────────────────────
async function fetchPrices() {
  // Always fetch SOL + any held tokens
  const ids = ['solana', ...Object.values(MINT_TO_CG).map(m => m.id)];
  const unique = [...new Set(ids)].join(',');
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${unique}&vs_currencies=usd&include_24hr_change=true`;
    const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
    return await r.json();
  } catch(e) { return {}; }
}

// ── BUILD HOLDINGS ARRAY ──────────────────────────────────────
function buildHoldings(solBalance, tokenAccts, prices) {
  const out = [];
  let colorIdx = 0;

  // SOL first
  const solPrice = prices?.solana?.usd || 0;
  const solChg   = prices?.solana?.usd_24h_change || 0;
  if (solBalance > 0) {
    out.push({
      sym: 'SOL', name: 'Solana', mint: SOL_MINT,
      amount: solBalance, cgId: 'solana',
      price: solPrice, value: solBalance * solPrice,
      chg24h: solChg, color: PALETTE[colorIdx++ % PALETTE.length],
    });
  }

  // SPL tokens
  for (const t of tokenAccts) {
    const p   = prices?.[t.cgId]?.usd || 0;
    const chg = prices?.[t.cgId]?.usd_24h_change || 0;
    out.push({
      ...t, price: p, value: t.amount * p,
      chg24h: chg, color: PALETTE[colorIdx++ % PALETTE.length],
    });
  }

  // Also include manually added assets (from old portfolio system)
  const manual = (CR_USER?.portfolio || []).filter(m =>
    !out.find(h => h.sym.toLowerCase() === (m.symbol||'').toLowerCase())
  );
  for (const m of manual) {
    const coins = typeof ALL_COINS !== 'undefined' ? ALL_COINS : [];
    const coin  = coins.find(c => c.symbol?.toLowerCase() === (m.symbol||'').toLowerCase());
    const p     = coin?.current_price || 0;
    const chg   = coin?.price_change_percentage_24h || 0;
    if (m.amount > 0) {
      out.push({
        sym: (m.symbol||m.id||'?').toUpperCase(),
        name: coin?.name || m.symbol || m.id,
        mint: null,
        amount: m.amount, cgId: coin?.id || null,
        price: p, value: m.amount * p,
        chg24h: chg, color: PALETTE[colorIdx++ % PALETTE.length],
        manual: true,
      });
    }
  }

  // Sort by value desc
  out.sort((a, b) => b.value - a.value);
  return out;
}

// ── RENDER ────────────────────────────────────────────────────
function renderDashboard(wallet) {
  const total    = _holdings.reduce((s, h) => s + h.value, 0);
  const solH     = _holdings.find(h => h.sym === 'SOL');
  const totalChg = _holdings.length
    ? _holdings.reduce((s, h) => s + (h.value * h.chg24h / 100), 0) : 0;
  const totalChgPct = total > 0 ? (totalChg / (total - totalChg)) * 100 : 0;

  // Header stats
  updatePhHeader(total, solH?.amount || 0, totalChgPct);

  // Summary bar
  set('ps-total',  fmt$(total));
  set('ps-sol',    solH ? solH.amount.toFixed(4) + ' SOL' : '—');
  set('ps-tokens', (_holdings.length) + ' assets');
  const chgEl = document.getElementById('ps-chg');
  if (chgEl) {
    chgEl.textContent = (totalChgPct >= 0 ? '+' : '') + totalChgPct.toFixed(2) + '%';
    chgEl.style.color  = totalChgPct >= 0 ? '#14F195' : '#ff4560';
  }
  set('ps-refresh', _lastFetch.toLocaleTimeString() + '  ↻');

  // Wallet badge
  const waddrEl = document.getElementById('port-wallet-addr');
  if (waddrEl) waddrEl.textContent = wallet.slice(0,8) + '...' + wallet.slice(-8);

  // Holdings list
  const listEl = document.getElementById('port-holdings-list');
  if (listEl) {
    if (_holdings.length === 0) {
      listEl.innerHTML = `<div style="text-align:center;padding:40px 0;font-family:'Space Mono',monospace;font-size:11px;color:var(--muted)">No holdings found on this wallet.<br>Add assets manually with the + MANUAL button.</div>`;
    } else {
      listEl.innerHTML = _holdings.map(h => holdingRow(h)).join('');
    }
  }

  // Allocation chart
  drawAllocationChart(_holdings, total);

  // Allocation legend
  const legEl = document.getElementById('port-alloc-legend');
  if (legEl) {
    legEl.innerHTML = _holdings.slice(0, 8).map(h => {
      const pct = total > 0 ? (h.value / total * 100) : 0;
      return `<div style="display:flex;align-items:center;gap:8px">
        <div style="width:10px;height:10px;border-radius:50%;background:${h.color};flex-shrink:0"></div>
        <div style="font-family:'Space Mono',monospace;font-size:10px;color:var(--text);flex:1">${h.sym}</div>
        <div style="font-family:'Space Mono',monospace;font-size:10px;color:var(--muted)">${pct.toFixed(1)}%</div>
      </div>`;
    }).join('');
  }
}

function holdingRow(h) {
  const chgColor = h.chg24h >= 0 ? '#14F195' : '#ff4560';
  const chgStr   = (h.chg24h >= 0 ? '+' : '') + h.chg24h.toFixed(2) + '%';
  const icon     = h.sym[0];
  const removeBtn = h.manual
    ? `<button class="port-remove-btn" onclick="portRemoveManual('${h.sym}')" title="Remove">✕</button>`
    : `<div></div>`;

  return `<div class="port-holding-row">
    <div style="display:flex;align-items:center;gap:10px;min-width:0">
      <div class="port-holding-icon" style="background:${h.color}22;color:${h.color}">${icon}</div>
      <div style="min-width:0">
        <div class="port-holding-name">${h.name}</div>
        <div class="port-holding-sym">${h.sym}${h.manual ? ' · manual' : ''}</div>
      </div>
    </div>
    <div>
      <div class="port-holding-num">${fmtAmt(h.amount)}</div>
      <div class="port-holding-chg" style="color:${chgColor}">${chgStr}</div>
    </div>
    <div class="port-holding-price">${h.price > 0 ? fmt$(h.price) : '—'}</div>
    <div class="port-holding-val">${h.value > 0 ? fmt$(h.value) : '—'}</div>
    ${removeBtn}
  </div>`;
}

// ── ALLOCATION PIE CHART (plain Canvas) ──────────────────────
function drawAllocationChart(holdings, total) {
  const canvas = document.getElementById('port-alloc-chart');
  if (!canvas) return;
  const ctx  = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 10, r = R * 0.5;

  ctx.clearRect(0, 0, W, H);
  if (total <= 0 || holdings.length === 0) {
    ctx.fillStyle = '#1c2d38';
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    return;
  }

  let startAngle = -Math.PI / 2;
  for (const h of holdings) {
    const slice = (h.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, startAngle, startAngle + slice);
    ctx.closePath();
    ctx.fillStyle = h.color;
    ctx.fill();
    startAngle += slice;
  }

  // Center hole
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg1').trim() || '#07090b';
  ctx.fill();

  // Center label
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px Space Mono, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(fmt$(total), cx, cy);
}

// ── MANUAL ASSET ACTIONS ─────────────────────────────────────
function addManualAsset() {
  if (!CR_USER) { openAuth('register'); return; }
  const sym = prompt('Enter coin symbol (e.g. BTC, ETH, SOL):');
  if (!sym) return;
  const amt = parseFloat(prompt('Enter amount you hold:'));
  if (!amt || isNaN(amt)) return;

  const coins  = typeof ALL_COINS !== 'undefined' ? ALL_COINS : [];
  const coin   = coins.find(c => c.symbol?.toLowerCase() === sym.toLowerCase());
  const entry  = { id: coin?.id || sym.toLowerCase(), symbol: sym.toUpperCase(), amount: amt };

  if (!CR_USER.portfolio) CR_USER.portfolio = [];
  // Remove duplicate if exists
  CR_USER.portfolio = CR_USER.portfolio.filter(a =>
    a.symbol?.toLowerCase() !== sym.toLowerCase()
  );
  CR_USER.portfolio.push(entry);
  DB.save(CR_USER);

  const users = DB.getUsers();
  const key   = CR_USER.email || 'wallet_' + CR_USER.walletAddress;
  if (users[key]) { users[key].portfolio = CR_USER.portfolio; }
  try { localStorage.setItem('cr_users', JSON.stringify(users)); } catch(e) {}

  if (typeof toast === 'function') toast('Asset added!', '#00e87a');
  refreshPortfolioData();
}

function portRemoveManual(sym) {
  if (!CR_USER?.portfolio) return;
  CR_USER.portfolio = CR_USER.portfolio.filter(a =>
    (a.symbol || '').toLowerCase() !== sym.toLowerCase()
  );
  DB.save(CR_USER);
  refreshPortfolioData();
}

// ── UI HELPERS ────────────────────────────────────────────────
function showState(state) {
  // state: 'auth' | 'loading' | 'main'
  const states = { auth: 'port-state-auth', loading: 'port-state-loading', main: 'port-state-main' };
  Object.entries(states).forEach(([k, id]) => {
    const el = document.getElementById(id);
    if (el) el.style.display = (k === state) ? 'block' : 'none';
  });
}

function updatePhHeader(total, sol, chgPct) {
  const tv = document.getElementById('port-total-val');
  const sv = document.getElementById('port-sol-bal');
  const cv = document.getElementById('port-24h-chg');
  if (tv) tv.textContent = total != null ? fmt$(total) : '$—';
  if (sv) sv.textContent = sol != null ? sol.toFixed(4) + ' SOL' : '—';
  if (cv) {
    cv.textContent = chgPct != null
      ? (chgPct >= 0 ? '+' : '') + chgPct.toFixed(2) + '%' : '—';
    if (cv && chgPct != null) cv.style.color = chgPct >= 0 ? '#14F195' : '#ff4560';
  }
}

function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function fmt$(n) {
  if (n >= 1e6)  return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1000) return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (n >= 1)    return '$' + n.toFixed(2);
  if (n > 0)     return '$' + n.toFixed(4);
  return '$0.00';
}

function fmtAmt(n) {
  if (n >= 1e6)  return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (n >= 1)    return n.toFixed(4);
  return n.toFixed(6);
}

// ── EXPORTS ───────────────────────────────────────────────────
return {
  init: initPortfolioDashboard,
  refresh: refreshPortfolioData,
  addManual: addManualAsset,
  removeManual: portRemoveManual,
};

})(); // END PORT IIFE

// Global bindings expected by inline HTML onclick handlers
window.initPortfolioDashboard = PORT.init;
window.refreshPortfolioData   = PORT.refresh;
window.addManualAsset         = PORT.addManual;
window.portRemoveManual       = PORT.removeManual;
