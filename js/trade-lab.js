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
    return placeholderCard('🧮', 'Risk Calculator', 'Always free for all users');
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

  // Expose switchTab for inline onclick
  return { init, _switchTab: switchTab };

})();
