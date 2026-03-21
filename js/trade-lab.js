// ════════════════════════════════════════════════════════════════════════════
// DEFIMONGO — TRADE LAB
// ════════════════════════════════════════════════════════════════════════════

const TL = (function(){

  // ── HELPERS ──────────────────────────────────────────────────────────────

  function tier(){ return typeof getTier === 'function' ? getTier() : 0; }
  function tierName(){ return typeof getTierName === 'function' ? getTierName() : 'FREE'; }
  function tierColor(){ return typeof getTierColor === 'function' ? getTierColor() : '#4a6070'; }

  // ── LOCKED CARD ──────────────────────────────────────────────────────────

  function lockedCard(title, desc, btnLabel){
    return `
      <div style="background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:40px;text-align:center">
        <div style="font-size:32px;margin-bottom:16px">🔒</div>
        <div style="font-family:'Space Mono',monospace;font-size:16px;color:#fff;margin-bottom:12px">${title}</div>
        <div style="font-size:13px;color:#4a6070;line-height:1.6;max-width:360px;margin:0 auto 24px">${desc}</div>
        <button style="background:#9945FF;color:#fff;border:none;border-radius:8px;padding:10px 24px;font-family:'Space Mono',monospace;font-size:11px;letter-spacing:1px;cursor:pointer">${btnLabel}</button>
      </div>`;
  }

  // ── PLACEHOLDER CARD ─────────────────────────────────────────────────────

  function placeholderCard(icon, title, text, extra){
    return `
      <div style="background:#0a1520;border:1px solid rgba(0,180,216,0.12);border-radius:12px;padding:24px">
        <div style="font-size:32px;margin-bottom:12px">${icon}</div>
        <div style="font-family:'Space Mono',monospace;font-size:16px;color:#ccd8df;margin-bottom:8px">${title}</div>
        ${text ? `<div style="font-size:13px;color:#4a6070;line-height:1.6">${text}</div>` : ''}
        ${extra || ''}
      </div>`;
  }

  // ── TAB CONTENT BUILDERS ─────────────────────────────────────────────────

  function signalsContent(){
    const t = tier();
    const badge = t >= 2
      ? `<span style="background:rgba(0,232,122,0.15);color:#00e87a;border:1px solid rgba(0,232,122,0.3);border-radius:4px;padding:3px 10px;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:1px">LIVE</span>`
      : `<span style="background:rgba(255,107,53,0.15);color:#ff6b35;border:1px solid rgba(255,107,53,0.3);border-radius:4px;padding:3px 10px;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:1px">48H DELAY</span>`;
    return placeholderCard(
      '📡',
      'Signal Feed',
      'Live buy/sell signals from the DeFiMongo TradingView indicator. Free tier sees signals with 48-hour delay.',
      `<div style="margin-top:16px;display:flex;align-items:center;gap:8px">
        <span style="font-family:'Space Mono',monospace;font-size:10px;color:#4a6070">Your tier:</span>
        ${badge}
      </div>`
    );
  }

  function journalContent(){
    const t = tier();
    const extra = t < 2
      ? `<div style="margin-top:16px">
          <div style="display:flex;justify-content:space-between;font-family:'Space Mono',monospace;font-size:10px;color:#4a6070;margin-bottom:6px">
            <span>Free tier: 0/10 trades used</span><span>0%</span>
          </div>
          <div style="background:#0a1520;border:1px solid rgba(0,180,216,0.12);border-radius:4px;height:6px;overflow:hidden">
            <div style="width:0%;height:100%;background:#00b4d8;border-radius:4px"></div>
          </div>
        </div>`
      : `<div style="margin-top:12px;font-family:'Space Mono',monospace;font-size:11px;color:#00e87a">Unlimited trades</div>`;
    return placeholderCard('📓', 'Trade Journal', null, extra);
  }

  function riskContent(){
    return `
      <div>
        <!-- Header -->
        <div style="margin-bottom:20px">
          <div style="font-family:'Space Mono',monospace;font-size:16px;color:#ccd8df;margin-bottom:4px">🧮 RISK CALCULATOR</div>
          <div style="font-family:'Space Mono',monospace;font-size:10px;color:#4a6070;letter-spacing:1px">Always free · All tiers</div>
        </div>

        <!-- Inputs grid -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px">

          <div>
            <label style="display:block;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:1px;color:#4a6070;text-transform:uppercase;margin-bottom:6px">Account Size ($)</label>
            <input id="tl-rc-account" type="number" value="10000" min="0" oninput="TL._calcRisk()"
              style="width:100%;box-sizing:border-box;background:#060d12;border:1px solid rgba(0,180,216,0.2);border-radius:6px;padding:10px 14px;color:#ccd8df;font-size:14px;font-family:'Space Mono',monospace;outline:none"
              onfocus="this.style.borderColor='#00b4d8'" onblur="this.style.borderColor='rgba(0,180,216,0.2)'"/>
          </div>

          <div>
            <label style="display:block;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:1px;color:#4a6070;text-transform:uppercase;margin-bottom:6px">Risk Per Trade (%)</label>
            <input id="tl-rc-risk-pct" type="number" value="2" min="0.01" max="100" step="0.1" oninput="TL._calcRisk()"
              style="width:100%;box-sizing:border-box;background:#060d12;border:1px solid rgba(0,180,216,0.2);border-radius:6px;padding:10px 14px;color:#ccd8df;font-size:14px;font-family:'Space Mono',monospace;outline:none"
              onfocus="this.style.borderColor='#00b4d8'" onblur="this.style.borderColor='rgba(0,180,216,0.2)'"/>
          </div>

          <div>
            <label style="display:block;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:1px;color:#4a6070;text-transform:uppercase;margin-bottom:6px">Entry Price ($)</label>
            <input id="tl-rc-entry" type="number" min="0" step="any" placeholder="e.g. 65000" oninput="TL._calcRisk()"
              style="width:100%;box-sizing:border-box;background:#060d12;border:1px solid rgba(0,180,216,0.2);border-radius:6px;padding:10px 14px;color:#ccd8df;font-size:14px;font-family:'Space Mono',monospace;outline:none"
              onfocus="this.style.borderColor='#00b4d8'" onblur="this.style.borderColor='rgba(0,180,216,0.2)'"/>
          </div>

          <div>
            <label style="display:block;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:1px;color:#4a6070;text-transform:uppercase;margin-bottom:6px">Stop Loss Price ($)</label>
            <input id="tl-rc-sl" type="number" min="0" step="any" placeholder="e.g. 63000" oninput="TL._calcRisk()"
              style="width:100%;box-sizing:border-box;background:#060d12;border:1px solid rgba(0,180,216,0.2);border-radius:6px;padding:10px 14px;color:#ccd8df;font-size:14px;font-family:'Space Mono',monospace;outline:none"
              onfocus="this.style.borderColor='#00b4d8'" onblur="this.style.borderColor='rgba(0,180,216,0.2)'"/>
          </div>

          <div>
            <label style="display:block;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:1px;color:#4a6070;text-transform:uppercase;margin-bottom:6px">Take Profit Price ($)</label>
            <input id="tl-rc-tp" type="number" min="0" step="any" placeholder="Optional" oninput="TL._calcRisk()"
              style="width:100%;box-sizing:border-box;background:#060d12;border:1px solid rgba(0,180,216,0.2);border-radius:6px;padding:10px 14px;color:#ccd8df;font-size:14px;font-family:'Space Mono',monospace;outline:none"
              onfocus="this.style.borderColor='#00b4d8'" onblur="this.style.borderColor='rgba(0,180,216,0.2)'"/>
          </div>

          <div>
            <label style="display:block;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:1px;color:#4a6070;text-transform:uppercase;margin-bottom:6px">Asset Ticker</label>
            <input id="tl-rc-ticker" type="text" placeholder="e.g. BTC, ETH, SOL" oninput="TL._calcRisk()"
              style="width:100%;box-sizing:border-box;background:#060d12;border:1px solid rgba(0,180,216,0.2);border-radius:6px;padding:10px 14px;color:#ccd8df;font-size:14px;font-family:'Space Mono',monospace;outline:none"
              onfocus="this.style.borderColor='#00b4d8'" onblur="this.style.borderColor='rgba(0,180,216,0.2)'"/>
          </div>

        </div>

        <!-- Warning -->
        <div id="tl-rc-warn" style="display:none;color:#f4c542;font-family:'Space Mono',monospace;font-size:12px;margin-bottom:16px"></div>

        <!-- Outputs -->
        <div id="tl-rc-outputs" style="display:none">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:20px">

            <div style="background:#060d12;border:1px solid rgba(0,232,122,0.15);border-radius:8px;padding:16px;display:flex;justify-content:space-between;align-items:center">
              <span style="font-family:'Space Mono',monospace;font-size:10px;color:#4a6070;text-transform:uppercase;letter-spacing:1px">Dollar Risk</span>
              <span id="tl-rc-out-risk" style="font-family:'Space Mono',monospace;font-size:16px;color:#00e87a;font-weight:700">—</span>
            </div>

            <div style="background:#060d12;border:1px solid rgba(0,232,122,0.15);border-radius:8px;padding:16px;display:flex;justify-content:space-between;align-items:center">
              <span style="font-family:'Space Mono',monospace;font-size:10px;color:#4a6070;text-transform:uppercase;letter-spacing:1px">Position Size</span>
              <span id="tl-rc-out-units" style="font-family:'Space Mono',monospace;font-size:16px;color:#00e87a;font-weight:700">—</span>
            </div>

            <div style="background:#060d12;border:1px solid rgba(0,232,122,0.15);border-radius:8px;padding:16px;display:flex;justify-content:space-between;align-items:center">
              <span style="font-family:'Space Mono',monospace;font-size:10px;color:#4a6070;text-transform:uppercase;letter-spacing:1px">Position (USD)</span>
              <span id="tl-rc-out-usd" style="font-family:'Space Mono',monospace;font-size:16px;color:#00e87a;font-weight:700">—</span>
            </div>

            <div id="tl-rc-rr-card" style="background:#060d12;border:1px solid rgba(0,232,122,0.15);border-radius:8px;padding:16px;display:flex;justify-content:space-between;align-items:center">
              <span style="font-family:'Space Mono',monospace;font-size:10px;color:#4a6070;text-transform:uppercase;letter-spacing:1px">R:R Ratio</span>
              <span id="tl-rc-out-rr" style="font-family:'Space Mono',monospace;font-size:16px;color:#4a6070;font-weight:700">—</span>
            </div>

            <div id="tl-rc-profit-card" style="background:#060d12;border:1px solid rgba(0,232,122,0.15);border-radius:8px;padding:16px;display:flex;justify-content:space-between;align-items:center">
              <span style="font-family:'Space Mono',monospace;font-size:10px;color:#4a6070;text-transform:uppercase;letter-spacing:1px">Potential Profit</span>
              <span id="tl-rc-out-profit" style="font-family:'Space Mono',monospace;font-size:16px;color:#4a6070;font-weight:700">—</span>
            </div>

          </div>

          <!-- R:R bar -->
          <div>
            <div style="display:flex;justify-content:space-between;font-family:'Space Mono',monospace;font-size:10px;color:#4a6070;letter-spacing:1px;margin-bottom:6px">
              <span>RISK</span><span>REWARD</span>
            </div>
            <div style="height:12px;border-radius:6px;overflow:hidden;display:flex;background:rgba(255,255,255,0.04)">
              <div id="tl-rc-bar-risk" style="height:100%;background:#ff4444;transition:width .3s"></div>
              <div id="tl-rc-bar-reward" style="height:100%;background:#00e87a;transition:width .3s"></div>
            </div>
            <div id="tl-rc-bar-hint" style="font-family:'Space Mono',monospace;font-size:10px;color:#4a6070;margin-top:6px;text-align:center"></div>
          </div>
        </div>

        <!-- Empty state -->
        <div id="tl-rc-empty" style="font-family:'Space Mono',monospace;font-size:11px;color:#4a6070;text-align:center;padding:20px 0">
          Enter entry price and stop loss to see position sizing
        </div>

      </div>`;
  }

  function calcRisk(){
    const account  = parseFloat(document.getElementById('tl-rc-account')?.value)  || 0;
    const riskPct  = parseFloat(document.getElementById('tl-rc-risk-pct')?.value) || 0;
    const entry    = parseFloat(document.getElementById('tl-rc-entry')?.value)    || 0;
    const sl       = parseFloat(document.getElementById('tl-rc-sl')?.value)       || 0;
    const tp       = parseFloat(document.getElementById('tl-rc-tp')?.value)       || 0;
    const ticker   = (document.getElementById('tl-rc-ticker')?.value || '').trim().toUpperCase() || 'UNITS';

    const warn    = document.getElementById('tl-rc-warn');
    const outputs = document.getElementById('tl-rc-outputs');
    const empty   = document.getElementById('tl-rc-empty');

    // Need at least entry and SL to compute anything
    if(!entry || !sl){
      if(warn)  { warn.style.display='none'; warn.textContent=''; }
      if(outputs){ outputs.style.display='none'; }
      if(empty)  { empty.style.display='block'; }
      return;
    }

    // Validation
    if(entry <= sl){
      if(warn)  { warn.style.display='block'; warn.textContent='⚠️ Stop loss must be below entry price'; }
      if(outputs){ outputs.style.display='none'; }
      if(empty)  { empty.style.display='none'; }
      return;
    }

    if(warn)  { warn.style.display='none'; warn.textContent=''; }
    if(empty)  { empty.style.display='none'; }
    if(outputs){ outputs.style.display='block'; }

    // Core calculations
    const dollarRisk     = account * (riskPct / 100);
    const slDistance     = Math.abs(entry - sl);
    const positionUnits  = dollarRisk / slDistance;
    const positionUSD    = positionUnits * entry;
    const hasTp          = tp > 0;
    const rrRatio        = hasTp ? Math.abs(tp - entry) / slDistance : null;
    const potentialProfit= hasTp ? positionUnits * Math.abs(tp - entry) : null;

    // Format helpers
    const usd = n => '$' + n.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
    const dec = (n, d=5) => parseFloat(n.toPrecision(d)).toString();

    // Outputs
    const elRisk   = document.getElementById('tl-rc-out-risk');
    const elUnits  = document.getElementById('tl-rc-out-units');
    const elUSD    = document.getElementById('tl-rc-out-usd');
    const elRR     = document.getElementById('tl-rc-out-rr');
    const elProfit = document.getElementById('tl-rc-out-profit');
    const barRisk  = document.getElementById('tl-rc-bar-risk');
    const barReward= document.getElementById('tl-rc-bar-reward');
    const barHint  = document.getElementById('tl-rc-bar-hint');

    if(elRisk)  elRisk.textContent  = usd(dollarRisk);
    if(elUnits) elUnits.textContent = dec(positionUnits) + ' ' + ticker;
    if(elUSD)   elUSD.textContent   = usd(positionUSD);

    if(elRR){
      if(hasTp && rrRatio !== null){
        elRR.textContent  = rrRatio.toFixed(2) + ' : 1';
        elRR.style.color  = rrRatio >= 2 ? '#00e87a' : rrRatio >= 1 ? '#f4c542' : '#ff4560';
      } else {
        elRR.textContent  = '—';
        elRR.style.color  = '#4a6070';
      }
    }

    if(elProfit){
      if(hasTp && potentialProfit !== null){
        elProfit.textContent = usd(potentialProfit);
        elProfit.style.color = '#00e87a';
      } else {
        elProfit.textContent = '—';
        elProfit.style.color = '#4a6070';
      }
    }

    // R:R bar
    if(barRisk && barReward && barHint){
      if(hasTp && rrRatio !== null){
        const total     = 1 + rrRatio;
        const riskPct2  = (1 / total * 100).toFixed(1);
        const rewardPct = (rrRatio / total * 100).toFixed(1);
        barRisk.style.width   = riskPct2 + '%';
        barReward.style.width = rewardPct + '%';
        barHint.textContent   = '';
      } else {
        barRisk.style.width   = '100%';
        barReward.style.width = '0%';
        barHint.textContent   = 'Enter Take Profit to see R:R ratio';
        barRisk.style.background = '#333';
      }
      if(hasTp) barRisk.style.background = '#ff4444';
    }
  }

  function statsContent(){
    const t = tier();
    if(t < 2){
      return lockedCard(
        'Performance Stats',
        'Upgrade to PRO to unlock advanced performance analytics — win rate, expectancy, drawdown, Sharpe ratio, and more.',
        'UPGRADE TO PRO'
      );
    }
    return placeholderCard('📊', 'Performance Stats', 'Advanced analytics coming soon.');
  }

  function calendarContent(){
    const t = tier();
    if(t < 2){
      return lockedCard(
        'Trade Calendar',
        'Upgrade to PRO to unlock your trading calendar — visualize your performance by day, week, and month.',
        'UPGRADE TO PRO'
      );
    }
    return placeholderCard('📅', 'Trade Calendar', 'Calendar view coming soon.');
  }

  function aiReviewContent(){
    const t = tier();
    if(t < 3){
      return lockedCard(
        'AI Trade Review',
        'Elite tier exclusive. Get AI-powered analysis of every trade — what went right, what went wrong, risk scoring.',
        'UPGRADE TO ELITE'
      );
    }
    return placeholderCard('🤖', 'AI Trade Review', 'AI analysis coming soon.');
  }

  // ── TAB CONFIG ────────────────────────────────────────────────────────────

  const TABS = [
    { id: 'signals',   label: 'SIGNALS',   build: signalsContent  },
    { id: 'journal',   label: 'JOURNAL',   build: journalContent  },
    { id: 'risk',      label: 'RISK CALC', build: riskContent     },
    { id: 'stats',     label: 'STATS',     build: statsContent    },
    { id: 'calendar',  label: 'CALENDAR',  build: calendarContent },
    { id: 'ai-review', label: 'AI REVIEW', build: aiReviewContent },
  ];

  // ── TAB SWITCHER ─────────────────────────────────────────────────────────

  function switchTab(id){
    TABS.forEach(function(tab){
      const btn = document.getElementById('tl-tab-'+tab.id);
      const pane = document.getElementById('tl-pane-'+tab.id);
      if(!btn || !pane) return;
      const active = tab.id === id;
      btn.style.color = active ? '#00e87a' : '#4a6070';
      btn.style.borderBottom = active ? '2px solid #00e87a' : '2px solid transparent';
      pane.style.display = active ? 'block' : 'none';
    });
  }

  // ── INIT ─────────────────────────────────────────────────────────────────

  function init(){
    const wrap = document.getElementById('P-trade-lab');
    if(!wrap) return;

    const tc = tierColor();
    const tn = tierName();

    // Build tab bar HTML
    const tabBarItems = TABS.map(function(tab){
      return `<button id="tl-tab-${tab.id}"
        onclick="TL._switchTab('${tab.id}')"
        style="padding:12px 20px;font-family:'Space Mono',monospace;font-size:11px;letter-spacing:1px;color:#4a6070;cursor:pointer;border:none;border-bottom:2px solid transparent;background:transparent;white-space:nowrap;transition:color .15s,border-color .15s"
      >${tab.label}</button>`;
    }).join('');

    // Build panes HTML
    const panesHTML = TABS.map(function(tab){
      return `<div id="tl-pane-${tab.id}" style="display:none">${tab.build()}</div>`;
    }).join('');

    wrap.innerHTML = `
      <!-- Page header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;flex-wrap:wrap;gap:12px">
        <div>
          <div style="font-family:'Space Mono',monospace;font-size:22px;font-weight:700;color:#fff;margin-bottom:6px">⚗️ TRADE LAB</div>
          <div style="font-family:'Space Mono',monospace;font-size:11px;color:#4a6070;letter-spacing:.5px">Your personal trading intelligence center</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-family:'Space Mono',monospace;font-size:9px;color:#4a6070;letter-spacing:1px;text-transform:uppercase">Tier</span>
          <span style="font-family:'Space Mono',monospace;font-size:11px;font-weight:700;color:${tc};background:${tc}18;border:1px solid ${tc}44;border-radius:4px;padding:4px 12px;letter-spacing:1px">${tn}</span>
        </div>
      </div>

      <!-- Tab bar -->
      <div style="background:#0a1520;border:1px solid rgba(0,180,216,0.12);border-radius:12px 12px 0 0;border-bottom:1px solid rgba(0,180,216,0.12);display:flex;overflow-x:auto;margin-bottom:0">
        ${tabBarItems}
      </div>

      <!-- Tab content -->
      <div style="background:#060d12;border:1px solid rgba(0,180,216,0.12);border-top:none;border-radius:0 0 12px 12px;padding:24px;min-height:240px">
        ${panesHTML}
      </div>
    `;

    // Activate first tab
    switchTab('signals');
  }

  // Expose switchTab and calcRisk for inline event handlers
  return { init, _switchTab: switchTab, _calcRisk: calcRisk };

})();
