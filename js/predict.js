/* ═══════════════════════════════════════════════════════════
   DEFIMONGO — PREDICT·MN  (v1)
   Mongolian Prediction Market — Phase 1 (Manual Oracle)
   Author: DeFiMongo
═══════════════════════════════════════════════════════════ */

/* ── MARKET DATA ─────────────────────────────────────────────
   Each market:
     id        — unique slug
     cat       — gov | sport | biz | social
     mn / en   — question text in both languages
     yes       — current YES probability 0–100
     vol       — total volume in USD
     closes    — ISO date string (deadline)
     status    — open | resolving | resolved_yes | resolved_no
     minBet    — minimum position in USD
     maxBet    — maximum position per user in USD
═══════════════════════════════════════════════════════════ */
const PM_MARKETS = [
  // ── POLITICS ───────────────────────────────────────────────
  {
    id: 'mgl-election-2024-mpr',
    cat: 'gov',
    mn: 'МАН 2024 оны Улсын Их Хурлын сонгуульд ялах уу?',
    en: 'Will the MPP win the 2024 Parliamentary election?',
    yes: 71,
    vol: 1240,
    closes: '2025-06-28',
    status: 'open',
    minBet: 5,
    maxBet: 100
  },
  {
    id: 'mgl-president-approval',
    cat: 'gov',
    mn: 'Ерөнхийлөгч Хүрэлсүхийн үнэлгэлт 2025 онд 50%-аас дээш байх уу?',
    en: "Will President Khurelsukh's approval rating stay above 50% in 2025?",
    yes: 44,
    vol: 580,
    closes: '2025-12-31',
    status: 'open',
    minBet: 5,
    maxBet: 100
  },
  {
    id: 'mgl-constitution-amendment',
    cat: 'gov',
    mn: 'Үндсэн хуульд 2025 онд нэмэлт өөрчлөлт орох уу?',
    en: 'Will Mongolia amend its constitution in 2025?',
    yes: 28,
    vol: 320,
    closes: '2025-11-30',
    status: 'open',
    minBet: 5,
    maxBet: 100
  },
  // ── SPORT ──────────────────────────────────────────────────
  {
    id: 'mgl-football-worldcup-2026',
    cat: 'sport',
    mn: 'Монголын хөлбөмбөгийн шигшээ баг 2026 дэлхийн аварга шалгаруулалтын бүсийн тойргоос гарах уу?',
    en: 'Will Mongolia national football team advance from their 2026 WC qualifying group?',
    yes: 18,
    vol: 890,
    closes: '2025-10-15',
    status: 'open',
    minBet: 5,
    maxBet: 150
  },
  {
    id: 'mgl-wrestling-title-2025',
    cat: 'sport',
    mn: 'Монголын бөхчүүд 2025 дэлхийн чемпионатад 3+ алтан медаль авах уу?',
    en: 'Will Mongolian wrestlers win 3+ gold medals at the 2025 World Championship?',
    yes: 67,
    vol: 1100,
    closes: '2025-09-20',
    status: 'open',
    minBet: 5,
    maxBet: 100
  },
  {
    id: 'mgl-naadam-archery',
    cat: 'sport',
    mn: '2025 Наадмын сурын харваанд Увс аймаг тэргүүлэх уу?',
    en: 'Will Uvs Province top the archery standings at 2025 Naadam?',
    yes: 35,
    vol: 210,
    closes: '2025-07-13',
    status: 'open',
    minBet: 2,
    maxBet: 50
  },
  // ── BUSINESS ───────────────────────────────────────────────
  {
    id: 'mgl-mse-top100-2025',
    cat: 'biz',
    mn: 'МХБ-ийн TOP-20 индекс 2025 оны эцэс гэхэд 10%+ өсөх үү?',
    en: 'Will the MSE Top-20 index grow 10%+ by end of 2025?',
    yes: 55,
    vol: 760,
    closes: '2025-12-31',
    status: 'open',
    minBet: 5,
    maxBet: 200
  },
  {
    id: 'mgl-erdenes-tavan-ipo',
    cat: 'biz',
    mn: 'Эрдэнэс Тавантолгой ХК 2025 онд гадаад зах зээлд IPO хийх үү?',
    en: 'Will Erdenes Tavan Tolgoi conduct a foreign IPO in 2025?',
    yes: 22,
    vol: 440,
    closes: '2025-12-31',
    status: 'open',
    minBet: 5,
    maxBet: 100
  },
  {
    id: 'mgl-tugrik-usd-2025',
    cat: 'biz',
    mn: '1 ам.доллар 2025 оны эцэст 3,700 төгрөгөөс дээш байх уу?',
    en: 'Will USD/MNT exceed 3,700 by end of 2025?',
    yes: 60,
    vol: 920,
    closes: '2025-12-31',
    status: 'open',
    minBet: 5,
    maxBet: 150
  },
  // ── SOCIAL ─────────────────────────────────────────────────
  {
    id: 'mgl-ulaanbaatar-air-2025',
    cat: 'social',
    mn: 'Улаанбаатарын агаарын бохирдол 2025 өвлийн улиралд 2024 оноос буурах уу?',
    en: 'Will Ulaanbaatar air pollution be lower this winter 2025 vs 2024?',
    yes: 31,
    vol: 390,
    closes: '2026-03-01',
    status: 'open',
    minBet: 2,
    maxBet: 50
  },
  {
    id: 'mgl-population-4m',
    cat: 'social',
    mn: 'Монголын хүн ам 2025 онд 4 саяд хүрэх үү?',
    en: 'Will Mongolia reach a population of 4 million in 2025?',
    yes: 82,
    vol: 270,
    closes: '2025-12-31',
    status: 'open',
    minBet: 2,
    maxBet: 50
  },
  {
    id: 'mgl-crypto-legal-2025',
    cat: 'social',
    mn: 'Монгол улс 2025 онд крипто хөрөнгийг хуулиар зохицуулах уу?',
    en: 'Will Mongolia pass crypto regulation legislation in 2025?',
    yes: 40,
    vol: 680,
    closes: '2025-12-31',
    status: 'open',
    minBet: 5,
    maxBet: 100
  }
];

/* ── CATEGORY LABELS ────────────────────────────────────── */
const PM_CAT = {
  gov:    { mn: '🏛️ Улс төр',  en: '🏛️ Politics',  cls: 'pm-cat-gov'    },
  sport:  { mn: '⚽ Спорт',    en: '⚽ Sport',      cls: 'pm-cat-sport'  },
  biz:    { mn: '💼 Бизнес',   en: '💼 Business',   cls: 'pm-cat-biz'    },
  social: { mn: '🔥 Нийгэм',  en: '🔥 Social',     cls: 'pm-cat-social' }
};

/* ── STATE ──────────────────────────────────────────────── */
let pmCurrentCat  = 'all';
let pmCurrentLang = (typeof SITE_LANG !== 'undefined') ? SITE_LANG : 'mn';

/* ── OPEN / CLOSE ────────────────────────────────────────── */
function openPredictPage() {
  document.getElementById('predictOverlay').classList.add('on');
  document.body.style.overflow = 'hidden';
  renderPMMarkets(pmCurrentCat);
  animatePMStats();
}

function closePredictPage() {
  document.getElementById('predictOverlay').classList.remove('on');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closePredictPage();
});

/* ── STAT COUNTER ANIMATION ──────────────────────────────── */
function animatePMStats() {
  animateCount('pm-stat-markets', 0, PM_MARKETS.length, 600, '');
  animateCount('pm-stat-vol', 0, 4820, 900, '$');
  animateCount('pm-stat-traders', 0, 340, 750, '');
}

function animateCount(id, from, to, dur, prefix) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const val = Math.round(from + (to - from) * ease);
    el.textContent = prefix + val.toLocaleString();
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ── FILTER TABS ─────────────────────────────────────────── */
function filterPMMarkets(cat) {
  pmCurrentCat = cat;
  // Update tab active state
  document.querySelectorAll('.pm-tab').forEach(function(btn) {
    btn.classList.toggle('active', btn.getAttribute('data-cat') === cat);
  });
  renderPMMarkets(cat);
}

/* ── RENDER MARKET CARDS ─────────────────────────────────── */
function renderPMMarkets(cat) {
  const lang = (typeof SITE_LANG !== 'undefined') ? SITE_LANG : 'mn';
  const grid = document.getElementById('pmMarketsGrid');
  if (!grid) return;

  const filtered = cat === 'all'
    ? PM_MARKETS
    : PM_MARKETS.filter(function(m) { return m.cat === cat; });

  if (filtered.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted);font-family:\'Space Mono\',monospace;font-size:11px">Одоогоор зах зээл байхгүй байна.</div>';
    return;
  }

  grid.innerHTML = filtered.map(function(m) { return buildMarketCard(m, lang); }).join('');
}

/* ── BUILD SINGLE CARD ───────────────────────────────────── */
function buildMarketCard(m, lang) {
  const catInfo   = PM_CAT[m.cat];
  const question  = lang === 'en' ? m.en : m.mn;
  const catLabel  = lang === 'en' ? catInfo.en : catInfo.mn;
  const yesW      = m.yes;
  const noW       = 100 - m.yes;
  const yesPrice  = (m.yes / 100).toFixed(2);
  const noPrice   = ((100 - m.yes) / 100).toFixed(2);
  const closesDate = formatPMDate(m.closes, lang);
  const volFmt    = '$' + m.vol.toLocaleString();

  const statusBadge = buildStatusBadge(m.status, lang);
  const cardCls     = m.status === 'resolving'   ? 'pm-market-card resolving'
                    : m.status === 'resolved_yes' ? 'pm-market-card resolved-yes'
                    : m.status === 'resolved_no'  ? 'pm-market-card resolved-no'
                    : 'pm-market-card';

  const actionBtns = m.status === 'open'
    ? `<div style="display:flex;gap:8px;margin-top:14px">
        <button class="pm-vote-yes" onclick="pmBuyShare('${m.id}','yes')"
          data-mn="ТИЙМ ${yesPrice}¢" data-en="YES ${yesPrice}¢">
          ${lang === 'en' ? 'YES' : 'ТИЙМ'} <span style="opacity:.7;font-size:9px">${yesPrice}¢</span>
        </button>
        <button class="pm-vote-no" onclick="pmBuyShare('${m.id}','no')"
          data-mn="ҮГҮЙ ${noPrice}¢" data-en="NO ${noPrice}¢">
          ${lang === 'en' ? 'NO' : 'ҮГҮЙ'} <span style="opacity:.7;font-size:9px">${noPrice}¢</span>
        </button>
      </div>`
    : `<div style="margin-top:14px;padding:10px;background:#0c1014;border-radius:6px;text-align:center;font-family:'Space Mono',monospace;font-size:10px;color:var(--muted)">${statusBadge}</div>`;

  return `
    <div class="${cardCls}" onclick="pmCardClick(event,'${m.id}')">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:6px">
        <span class="pm-cat-pill ${catInfo.cls}">${catLabel}</span>
        <span style="font-family:'Space Mono',monospace;font-size:9px;color:var(--muted)">${statusBadge}</span>
      </div>

      <div style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;color:#ccd8df;line-height:1.5;margin-bottom:14px;min-height:44px">
        ${question}
      </div>

      <!-- Probability bar -->
      <div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;margin-bottom:5px">
          <span style="font-family:'Space Mono',monospace;font-size:9px;color:#00e87a;font-weight:700">
            ${lang === 'en' ? 'YES' : 'ТИЙМ'} ${yesW}%
          </span>
          <span style="font-family:'Space Mono',monospace;font-size:9px;color:#e84040;font-weight:700">
            ${noW}% ${lang === 'en' ? 'NO' : 'ҮГҮЙ'}
          </span>
        </div>
        <div style="display:flex;gap:2px;height:6px;border-radius:3px;overflow:hidden">
          <div class="pm-yes-bar" style="width:${yesW}%"></div>
          <div class="pm-no-bar"  style="width:${noW}%"></div>
        </div>
      </div>

      <!-- Meta row -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;flex-wrap:wrap;gap:4px">
        <div style="font-family:'Space Mono',monospace;font-size:9px;color:var(--muted)">
          <span style="color:#f4c542">${volFmt}</span>
          &nbsp;${lang === 'en' ? 'vol' : 'эзлэхүүн'}
        </div>
        <div style="font-family:'Space Mono',monospace;font-size:9px;color:var(--muted)">
          ${lang === 'en' ? 'Closes' : 'Хаагдах'}: <span style="color:#ccd8df">${closesDate}</span>
        </div>
      </div>

      <!-- Bet limits -->
      <div style="font-family:'Space Mono',monospace;font-size:8px;color:var(--muted);margin-top:6px;opacity:.6">
        ${lang === 'en' ? 'Min' : 'Мин'} $${m.minBet} · ${lang === 'en' ? 'Max' : 'Макс'} $${m.maxBet} ${lang === 'en' ? 'per position' : 'нэг байрлалд'}
      </div>

      ${actionBtns}
    </div>`;
}

/* ── STATUS BADGE TEXT ───────────────────────────────────── */
function buildStatusBadge(status, lang) {
  if (status === 'open')         return lang === 'en' ? '🟢 OPEN' : '🟢 НЭЭЛТТЭЙ';
  if (status === 'resolving')    return lang === 'en' ? '🟡 RESOLVING' : '🟡 ШИЙДВЭРЛЭЖ БАЙНА';
  if (status === 'resolved_yes') return lang === 'en' ? '✅ RESOLVED YES' : '✅ ТИЙМ ШИЙДВЭРЛЭГДСЭН';
  if (status === 'resolved_no')  return lang === 'en' ? '❌ RESOLVED NO' : '❌ ҮГҮЙ ШИЙДВЭРЛЭГДСЭН';
  return status;
}

/* ── DATE FORMAT ─────────────────────────────────────────── */
function formatPMDate(iso, lang) {
  const d = new Date(iso);
  if (lang === 'mn') {
    return (d.getFullYear()) + ' оны ' + (d.getMonth() + 1) + ' сарын ' + d.getDate();
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── CARD CLICK (prevent button double-fire) ─────────────── */
function pmCardClick(e, id) {
  if (e.target.tagName === 'BUTTON') return;
  // Future: open market detail modal
}

/* ── BUY SHARE HANDLER ───────────────────────────────────── */
function pmBuyShare(marketId, side) {
  const lang = (typeof SITE_LANG !== 'undefined') ? SITE_LANG : 'mn';
  const market = PM_MARKETS.find(function(m) { return m.id === marketId; });
  if (!market) return;

  const question = lang === 'en' ? market.en : market.mn;
  const sideLabel = side === 'yes'
    ? (lang === 'en' ? 'YES' : 'ТИЙМ')
    : (lang === 'en' ? 'NO'  : 'ҮГҮЙ');
  const price = side === 'yes'
    ? (market.yes / 100).toFixed(2)
    : ((100 - market.yes) / 100).toFixed(2);

  // Build the modal
  let existing = document.getElementById('pmBuyModal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'pmBuyModal';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px';
  overlay.innerHTML = buildBuyModal(market, side, sideLabel, price, question, lang);
  document.body.appendChild(overlay);

  // Recalculate on amount input
  setTimeout(function() {
    const inp = document.getElementById('pmAmountInput');
    if (inp) inp.addEventListener('input', function() { pmRecalc(market, side, price); });
  }, 50);
}

/* ── BUY MODAL HTML ──────────────────────────────────────── */
function buildBuyModal(market, side, sideLabel, price, question, lang) {
  const sideColor  = side === 'yes' ? '#00e87a' : '#e84040';
  const minBet     = market.minBet;
  const maxBet     = market.maxBet;
  const sharesPreview = Math.floor(minBet / parseFloat(price));
  const potentialReturn = (sharesPreview * 1).toFixed(2);

  const WALLET_ADDRESS = 'GskmXrB1ESZqx8p76fi154UNi2sZgFUU26N2QtuMXnmZ';

  return `
    <div style="background:#111820;border:1px solid #1c2d38;border-radius:16px;padding:28px;max-width:420px;width:100%;position:relative;max-height:90vh;overflow-y:auto">
      <button onclick="document.getElementById('pmBuyModal').remove()"
        style="position:absolute;top:14px;right:14px;background:transparent;border:none;color:#4d6475;font-size:18px;cursor:pointer;line-height:1">✕</button>

      <!-- Header -->
      <div style="font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;color:${sideColor};margin-bottom:10px">
        ${lang === 'en' ? 'BUY' : 'ХУДАЛДАЖ АВАХ'} · ${sideLabel}
      </div>
      <div style="font-family:'Space Grotesk',sans-serif;font-size:13px;color:#ccd8df;line-height:1.5;margin-bottom:18px;padding-bottom:16px;border-bottom:1px solid #1c2d38">
        ${question}
      </div>

      <!-- Current price -->
      <div style="display:flex;justify-content:space-between;margin-bottom:16px">
        <div style="text-align:center;flex:1;padding:12px;background:#0c1014;border-radius:8px;margin-right:6px">
          <div style="font-family:'Space Mono',monospace;font-size:9px;color:var(--muted);margin-bottom:4px">
            ${lang === 'en' ? 'SHARE PRICE' : 'ХУВЬЦААНЫ ҮНЭ'}
          </div>
          <div style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:${sideColor}">${price}¢</div>
          <div style="font-family:'Space Mono',monospace;font-size:8px;color:var(--muted);margin-top:2px">per share</div>
        </div>
        <div style="text-align:center;flex:1;padding:12px;background:#0c1014;border-radius:8px;margin-left:6px">
          <div style="font-family:'Space Mono',monospace;font-size:9px;color:var(--muted);margin-bottom:4px">
            ${lang === 'en' ? 'WIN RETURN' : 'ЯЛБАЛ БУЦААНА'}
          </div>
          <div style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:#f4c542">$1.00</div>
          <div style="font-family:'Space Mono',monospace;font-size:8px;color:var(--muted);margin-top:2px">per share</div>
        </div>
      </div>

      <!-- Amount input -->
      <div style="margin-bottom:14px">
        <div style="font-family:'Space Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:1.5px;margin-bottom:7px">
          ${lang === 'en' ? 'YOUR POSITION (USD)' : 'ТАНЫ БАЙРЛАЛ (USD)'}
        </div>
        <input id="pmAmountInput" type="number" min="${minBet}" max="${maxBet}" value="${minBet}" step="1"
          style="width:100%;padding:11px 14px;background:#0c1014;border:1px solid #1c2d38;border-radius:8px;color:#ccd8df;font-family:'Space Mono',monospace;font-size:14px;box-sizing:border-box;outline:none;transition:border .15s"
          onfocus="this.style.borderColor='${sideColor}'" onblur="this.style.borderColor='#1c2d38'">
        <div style="font-family:'Space Mono',monospace;font-size:8px;color:var(--muted);margin-top:4px">
          Min $${minBet} · Max $${maxBet}
        </div>
      </div>

      <!-- Live calc -->
      <div id="pmCalcBox" style="background:#0c1014;border:1px solid #1c2d38;border-radius:8px;padding:14px;margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="font-family:'Space Mono',monospace;font-size:10px;color:var(--muted)">${lang === 'en' ? 'Shares' : 'Хувьцаа'}</span>
          <span id="pmSharesOut" style="font-family:'Space Mono',monospace;font-size:10px;color:#ccd8df">${sharesPreview}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="font-family:'Space Mono',monospace;font-size:10px;color:var(--muted)">${lang === 'en' ? 'If correct' : 'Зөв бол'}</span>
          <span id="pmReturnOut" style="font-family:'Space Mono',monospace;font-size:10px;color:#00e87a">$${potentialReturn}</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="font-family:'Space Mono',monospace;font-size:10px;color:var(--muted)">${lang === 'en' ? 'Profit' : 'Ашиг'}</span>
          <span id="pmProfitOut" style="font-family:'Space Mono',monospace;font-size:10px;color:#f4c542">$${(potentialReturn - minBet).toFixed(2)}</span>
        </div>
      </div>

      <!-- Payment instructions -->
      <div style="background:rgba(0,232,122,.04);border:1px solid rgba(0,232,122,.15);border-radius:8px;padding:14px;margin-bottom:16px">
        <div style="font-family:'Space Mono',monospace;font-size:9px;letter-spacing:1.5px;color:#00e87a;margin-bottom:10px">
          ${lang === 'en' ? '📋 HOW TO ENTER' : '📋 ХЭРХЭН ОРОЛЦОХ'}
        </div>
        <ol style="font-family:'Space Grotesk',sans-serif;font-size:12px;color:var(--muted);line-height:2;margin:0;padding-left:16px">
          <li>${lang === 'en'
            ? 'Send USDT (TRC20) or SOL to the address below'
            : 'Доорх хаяг руу USDT (TRC20) эсвэл SOL илгээнэ үү'}</li>
          <li>${lang === 'en'
            ? 'Copy your TX Hash after sending'
            : 'Илгээсний дараа TX Hash-ийг хуулна уу'}</li>
          <li>${lang === 'en'
            ? 'DM <strong style="color:#ccd8df">@DeFiMongo</strong> on X with: TX Hash + Market + YES/NO + Amount'
            : 'X дээр <strong style="color:#ccd8df">@DeFiMongo</strong> руу: TX Hash + Зах зээл + ТИЙМ/ҮГҮЙ + Дүн илгээнэ үү'}</li>
          <li>${lang === 'en'
            ? 'We confirm your position within 24 hours'
            : 'Бид 24 цагийн дотор байрлалыг баталгаажуулна'}</li>
        </ol>
      </div>

      <!-- Wallet address -->
      <div style="margin-bottom:16px">
        <div style="font-family:'Space Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:1.5px;margin-bottom:7px">
          ${lang === 'en' ? 'PAYMENT ADDRESS (USDT TRC20 / SOL)' : 'ТӨЛБӨРИЙН ХАЯГ (USDT TRC20 / SOL)'}
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="flex:1;font-family:'Space Mono',monospace;font-size:10px;color:#ccd8df;background:#0c1014;border:1px solid #1c2d38;border-radius:6px;padding:10px 12px;word-break:break-all;line-height:1.5">
            ${WALLET_ADDRESS}
          </div>
          <button onclick="pmCopyAddr('${WALLET_ADDRESS}')"
            style="padding:10px 14px;background:rgba(0,232,122,.1);border:1px solid rgba(0,232,122,.3);border-radius:6px;color:#00e87a;font-family:'Space Mono',monospace;font-size:10px;cursor:pointer;white-space:nowrap;flex-shrink:0">
            ${lang === 'en' ? 'Copy' : 'Хуулах'}
          </button>
        </div>
      </div>

      <!-- X DM button -->
      <a href="https://x.com/DeFiMongo" target="_blank"
        style="display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:13px;background:#000;border:1px solid #333;border-radius:8px;text-decoration:none;color:#fff;font-family:'Space Mono',monospace;font-size:11px;font-weight:700;letter-spacing:1.5px;box-sizing:border-box;transition:background .2s;margin-bottom:10px"
        onmouseover="this.style.background='#111'" onmouseout="this.style.background='#000'">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.737-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
        ${lang === 'en' ? 'DM @DeFiMongo ON X →' : 'X ДЭЭР @DeFiMongo РУУ →'}
      </a>

      <div style="font-family:'Space Mono',monospace;font-size:8px;color:var(--muted);text-align:center;line-height:1.6">
        ${lang === 'en'
          ? 'By participating you agree that DeFiMongo is not liable for any losses. 18+ only.'
          : 'Оролцсоноор та DeFiMongo нь аливаа алдагдалд хариуцлага хүлээхгүй гэдгийг зөвшөөрч байна. 18+.'}
      </div>
    </div>`;
}

/* ── LIVE RECALCULATE ────────────────────────────────────── */
function pmRecalc(market, side, price) {
  const lang   = (typeof SITE_LANG !== 'undefined') ? SITE_LANG : 'mn';
  const inp    = document.getElementById('pmAmountInput');
  if (!inp) return;
  const amt    = Math.max(market.minBet, Math.min(market.maxBet, parseFloat(inp.value) || market.minBet));
  const shares = Math.floor(amt / parseFloat(price));
  const ret    = (shares * 1).toFixed(2);
  const profit = (ret - amt).toFixed(2);

  const sharesEl = document.getElementById('pmSharesOut');
  const returnEl = document.getElementById('pmReturnOut');
  const profitEl = document.getElementById('pmProfitOut');
  if (sharesEl) sharesEl.textContent = shares;
  if (returnEl) returnEl.textContent = '$' + ret;
  if (profitEl) {
    profitEl.textContent = '$' + profit;
    profitEl.style.color = parseFloat(profit) >= 0 ? '#f4c542' : '#e84040';
  }
}

/* ── COPY WALLET ADDRESS ─────────────────────────────────── */
function pmCopyAddr(addr) {
  const lang = (typeof SITE_LANG !== 'undefined') ? SITE_LANG : 'mn';
  navigator.clipboard.writeText(addr).then(function() {
    if (typeof toast === 'function') {
      toast(lang === 'en' ? 'Address copied!' : 'Хаяг хуулагдлаа!', '#00e87a');
    }
  }).catch(function() {
    if (typeof toast === 'function') {
      toast(lang === 'en' ? 'Copy failed — copy manually' : 'Хуулж чадсангүй — гараар хуулна уу', '#e84040');
    }
  });
}

/* ── LANGUAGE SYNC ───────────────────────────────────────── */
// Hook into setSiteLang so predict page re-renders on lang switch
const _origSetSiteLang = window.setSiteLang;
window.setSiteLang = function(lang) {
  if (_origSetSiteLang) _origSetSiteLang(lang);
  // Re-render markets if predict page is open
  const overlay = document.getElementById('predictOverlay');
  if (overlay && overlay.classList.contains('on')) {
    renderPMMarkets(pmCurrentCat);
  }
  // Sync predict page lang toggle buttons
  const pmMn = document.getElementById('pm-lang-mn');
  const pmEn = document.getElementById('pm-lang-en');
  if (pmMn && pmEn) {
    if (lang === 'mn') {
      pmMn.style.background = '#e84040'; pmMn.style.color = '#fff';
      pmEn.style.background = 'transparent'; pmEn.style.color = 'var(--muted)';
    } else {
      pmEn.style.background = '#e84040'; pmEn.style.color = '#fff';
      pmMn.style.background = 'transparent'; pmMn.style.color = 'var(--muted)';
    }
  }
};

/* ── EXPORTS ─────────────────────────────────────────────── */
window.openPredictPage   = openPredictPage;
window.closePredictPage  = closePredictPage;
window.filterPMMarkets   = filterPMMarkets;
window.pmBuyShare        = pmBuyShare;
window.pmCopyAddr        = pmCopyAddr;
window.pmCardClick       = pmCardClick;
window.pmRecalc          = pmRecalc;
