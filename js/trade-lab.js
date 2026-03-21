// ════════════════════════════════════════════════════════════════════════════
// DEFIMONGO — TRADE LAB
// ════════════════════════════════════════════════════════════════════════════

const TL = (function(){

  // ── HELPERS ──────────────────────────────────────────────────────────────

  function tier(){ return typeof getTier === 'function' ? getTier() : 0; }
  function tierName(){ return typeof getTierName === 'function' ? getTierName() : 'FREE'; }
  function tierColor(){ return typeof getTierColor === 'function' ? getTierColor() : '#4a6070'; }

  // ── JOURNAL STATE ─────────────────────────────────────────────────────────

  const JOURNAL_KEY = 'dfm_journal_v1';
  let _jDir = 'BUY';

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

  // ── JOURNAL: STORAGE ─────────────────────────────────────────────────────

  function jLoadTrades(){
    try { return JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]'); } catch(e){ return []; }
  }
  function jSaveTrades(trades){
    try { localStorage.setItem(JOURNAL_KEY, JSON.stringify(trades)); } catch(e){}
  }

  // ── JOURNAL: CONTENT HTML ─────────────────────────────────────────────────

  function journalContent(){
    const t      = tier();
    const trades = jLoadTrades();
    const count  = trades.length;
    const today  = new Date().toISOString().slice(0, 10);

    const tierInfo = t < 2
      ? `<span style="color:#ff6b35;font-family:'Space Mono',monospace;font-size:10px">Free tier: ${count}/10 trades used</span>`
      : `<span style="color:#00e87a;font-family:'Space Mono',monospace;font-size:10px">Pro · Unlimited trades</span>`;

    const inp  = `width:100%;box-sizing:border-box;background:#060d12;border:1px solid rgba(0,180,216,0.2);border-radius:6px;padding:10px 14px;color:#ccd8df;font-size:13px;font-family:'Space Mono',monospace;outline:none`;
    const lbl  = `display:block;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:1px;color:#4a6070;text-transform:uppercase;margin-bottom:6px`;
    const grid = `display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:16px`;

    const tagId = t => 'tl-jrn-tag-' + t.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const TAGS  = ['Scalp', 'Swing', 'Position', 'Signal-Based'];

    return `
      <!-- ── FORM CARD ── -->
      <div style="background:#0a1520;border:1px solid rgba(0,180,216,0.12);border-radius:12px;padding:24px;margin-bottom:20px">

        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:20px">
          <div>
            <div style="font-family:'Space Mono',monospace;font-size:16px;color:#ccd8df;margin-bottom:4px">📓 TRADE JOURNAL</div>
            <div id="tl-jrn-tier">${tierInfo}</div>
          </div>
        </div>

        <!-- Row 1: Date | Symbol | Direction -->
        <div style="${grid}">
          <div>
            <label style="${lbl}">Date</label>
            <input id="tl-jrn-date" type="date" value="${today}"
              style="${inp}"
              onfocus="this.style.borderColor='#00b4d8'" onblur="this.style.borderColor='rgba(0,180,216,0.2)'"/>
          </div>
          <div>
            <label style="${lbl}">Symbol</label>
            <input id="tl-jrn-sym" type="text" placeholder="BTC, ETH, SOL..."
              oninput="TL.calcPnl()" style="${inp}"
              onfocus="this.style.borderColor='#00b4d8'" onblur="this.style.borderColor='rgba(0,180,216,0.2)'"/>
          </div>
          <div>
            <label style="${lbl}">Direction</label>
            <div style="display:flex;gap:8px">
              <button id="tl-jrn-buy" onclick="TL.setDirection('BUY')"
                style="flex:1;padding:10px 0;border-radius:6px;border:1px solid rgba(255,255,255,0.1);background:#00e87a;color:#000;font-family:'Space Mono',monospace;font-size:11px;font-weight:700;letter-spacing:1px;cursor:pointer;transition:all .15s">BUY</button>
              <button id="tl-jrn-sell" onclick="TL.setDirection('SELL')"
                style="flex:1;padding:10px 0;border-radius:6px;border:1px solid rgba(255,255,255,0.1);background:#060d12;color:#4a6070;font-family:'Space Mono',monospace;font-size:11px;font-weight:700;letter-spacing:1px;cursor:pointer;transition:all .15s">SELL</button>
            </div>
          </div>
        </div>

        <!-- Row 2: Entry | Exit | Position Size -->
        <div style="${grid}">
          <div>
            <label style="${lbl}">Entry Price ($)</label>
            <input id="tl-jrn-entry" type="number" min="0" step="any"
              oninput="TL.calcPnl()" style="${inp}"
              onfocus="this.style.borderColor='#00b4d8'" onblur="this.style.borderColor='rgba(0,180,216,0.2)'"/>
          </div>
          <div>
            <label style="${lbl}">Exit Price ($)</label>
            <input id="tl-jrn-exit" type="number" min="0" step="any"
              oninput="TL.calcPnl()" style="${inp}"
              onfocus="this.style.borderColor='#00b4d8'" onblur="this.style.borderColor='rgba(0,180,216,0.2)'"/>
          </div>
          <div>
            <label style="${lbl}">Position Size ($)</label>
            <input id="tl-jrn-size" type="number" min="0" step="any"
              oninput="TL.calcPnl()" style="${inp}"
              onfocus="this.style.borderColor='#00b4d8'" onblur="this.style.borderColor='rgba(0,180,216,0.2)'"/>
          </div>
        </div>

        <!-- Row 3: Fees | Tags | Notes -->
        <div style="${grid};margin-bottom:20px">
          <div>
            <label style="${lbl}">Fees ($)</label>
            <input id="tl-jrn-fees" type="number" value="0" min="0" step="any"
              oninput="TL.calcPnl()" style="${inp}"
              onfocus="this.style.borderColor='#00b4d8'" onblur="this.style.borderColor='rgba(0,180,216,0.2)'"/>
          </div>
          <div>
            <label style="${lbl}">Tags</label>
            <div style="display:flex;flex-wrap:wrap;gap:8px;padding-top:4px">
              ${TAGS.map(tag => `
                <label style="display:flex;align-items:center;gap:5px;cursor:pointer">
                  <input type="checkbox" id="${tagId(tag)}" value="${tag}"
                    style="accent-color:#00b4d8;cursor:pointer;width:13px;height:13px"/>
                  <span style="font-family:'Space Mono',monospace;font-size:10px;color:#4a6070">${tag}</span>
                </label>`).join('')}
            </div>
          </div>
          <div>
            <label style="${lbl}">Notes</label>
            <textarea id="tl-jrn-notes" rows="2" placeholder="Optional notes..."
              style="${inp};resize:vertical;line-height:1.5"></textarea>
          </div>
        </div>

        <!-- Live P&L preview -->
        <div id="tl-jrn-pnl" style="font-family:'Space Mono',monospace;font-size:13px;color:#4a6070;margin-bottom:14px;text-align:center">
          Estimated P&amp;L: —
        </div>

        <!-- Free tier gate message -->
        <div id="tl-jrn-limit" style="display:none;font-family:'Space Mono',monospace;font-size:11px;color:#ff6b35;text-align:center;margin-bottom:10px">
          🔒 Free tier limit reached (10/10). Upgrade to Pro for unlimited trades.
        </div>

        <!-- Save button -->
        <button id="tl-jrn-save-btn" onclick="TL.saveTrade()"
          style="background:#00e87a;color:#000;border:none;border-radius:8px;padding:14px;width:100%;font-family:'Space Mono',monospace;font-size:11px;font-weight:700;letter-spacing:2px;cursor:pointer;transition:opacity .15s">
          SAVE TRADE
        </button>
      </div>

      <!-- ── TRADE LIST CARD ── -->
      <div style="background:#0a1520;border:1px solid rgba(0,180,216,0.12);border-radius:12px;padding:24px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div style="font-family:'Space Mono',monospace;font-size:13px;color:#ccd8df">Trade History</div>
          <button onclick="TL._exportCsv()"
            style="background:transparent;border:1px solid rgba(0,180,216,0.2);border-radius:6px;padding:6px 14px;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:1px;color:#4a6070;cursor:pointer;transition:border-color .15s"
            onmouseover="this.style.borderColor='#00b4d8'" onmouseout="this.style.borderColor='rgba(0,180,216,0.2)'">
            📥 EXPORT CSV
          </button>
        </div>
        <div id="tl-jrn-list"></div>
      </div>`;
  }

  // ── JOURNAL: DIRECTION TOGGLE ─────────────────────────────────────────────

  function jSetDirection(dir){
    _jDir = dir;
    const buyBtn  = document.getElementById('tl-jrn-buy');
    const sellBtn = document.getElementById('tl-jrn-sell');
    if(buyBtn && sellBtn){
      if(dir === 'BUY'){
        buyBtn.style.background  = '#00e87a'; buyBtn.style.color  = '#000';
        sellBtn.style.background = '#060d12'; sellBtn.style.color = '#4a6070';
      } else {
        sellBtn.style.background = '#ff4444'; sellBtn.style.color = '#fff';
        buyBtn.style.background  = '#060d12'; buyBtn.style.color  = '#4a6070';
      }
    }
    jCalcPnl();
  }

  // ── JOURNAL: LIVE P&L PREVIEW ─────────────────────────────────────────────

  function jCalcPnl(){
    const entry = parseFloat(document.getElementById('tl-jrn-entry')?.value) || 0;
    const exit  = parseFloat(document.getElementById('tl-jrn-exit')?.value)  || 0;
    const size  = parseFloat(document.getElementById('tl-jrn-size')?.value)  || 0;
    const fees  = parseFloat(document.getElementById('tl-jrn-fees')?.value)  || 0;
    const el    = document.getElementById('tl-jrn-pnl');
    if(!el) return;

    if(!entry || !exit || !size){
      el.innerHTML = 'Estimated P&amp;L: —';
      el.style.color = '#4a6070';
      return;
    }

    const pnl    = _jDir === 'BUY'
      ? (exit - entry) / entry * size - fees
      : (entry - exit) / entry * size - fees;
    const pct    = ((exit - entry) / entry * 100) * (_jDir === 'BUY' ? 1 : -1);
    const sign   = pnl >= 0 ? '+' : '';
    const color  = pnl > 0 ? '#00e87a' : pnl < 0 ? '#ff4444' : '#4a6070';

    el.innerHTML = `Estimated P&amp;L: <strong style="color:${color}">${sign}$${Math.abs(pnl).toFixed(2)} (${sign}${pct.toFixed(2)}%)</strong>`;
    el.style.color = color;
  }

  // ── JOURNAL: SAVE TRADE ───────────────────────────────────────────────────

  function jSaveTrade(){
    const t      = tier();
    const trades = jLoadTrades();
    if(t < 2 && trades.length >= 10) return;

    const entry  = parseFloat(document.getElementById('tl-jrn-entry')?.value) || 0;
    const exit   = parseFloat(document.getElementById('tl-jrn-exit')?.value)  || 0;
    const size   = parseFloat(document.getElementById('tl-jrn-size')?.value)  || 0;
    const fees   = parseFloat(document.getElementById('tl-jrn-fees')?.value)  || 0;
    const date   = document.getElementById('tl-jrn-date')?.value  || new Date().toISOString().slice(0,10);
    const sym    = (document.getElementById('tl-jrn-sym')?.value  || '').trim().toUpperCase();
    const notes  = document.getElementById('tl-jrn-notes')?.value || '';

    if(!sym || !entry || !exit || !size){
      if(typeof toast === 'function') toast('Fill in Symbol, Entry, Exit, and Position Size', '#f4c542');
      return;
    }

    const pnl    = _jDir === 'BUY'
      ? (exit - entry) / entry * size - fees
      : (entry - exit) / entry * size - fees;
    const pnlPct = ((exit - entry) / entry * 100) * (_jDir === 'BUY' ? 1 : -1);

    const TAGS = ['Scalp', 'Swing', 'Position', 'Signal-Based'];
    const tags = TAGS.filter(tag =>
      document.getElementById('tl-jrn-tag-' + tag.toLowerCase().replace(/[^a-z0-9]/g, '-'))?.checked
    );

    trades.push({
      id: 'trd_' + Date.now(),
      date, symbol: sym, direction: _jDir,
      entryPrice: entry, exitPrice: exit,
      positionSize: size, fees, tags, notes,
      pnl: parseFloat(pnl.toFixed(2)),
      pnlPct: parseFloat(pnlPct.toFixed(2)),
      savedAt: Date.now()
    });
    jSaveTrades(trades);

    // Reset form
    ['tl-jrn-sym','tl-jrn-entry','tl-jrn-exit','tl-jrn-size','tl-jrn-notes'].forEach(id => {
      const el = document.getElementById(id); if(el) el.value = '';
    });
    const feesEl = document.getElementById('tl-jrn-fees'); if(feesEl) feesEl.value = '0';
    TAGS.forEach(tag => {
      const cb = document.getElementById('tl-jrn-tag-' + tag.toLowerCase().replace(/[^a-z0-9]/g, '-'));
      if(cb) cb.checked = false;
    });
    const pnlEl = document.getElementById('tl-jrn-pnl');
    if(pnlEl){ pnlEl.innerHTML = 'Estimated P&amp;L: —'; pnlEl.style.color = '#4a6070'; }

    if(typeof toast === 'function') toast('Trade saved!', '#00e87a');
    jRenderList();
  }

  // ── JOURNAL: DELETE TRADE ─────────────────────────────────────────────────

  function jDeleteTrade(id){
    jSaveTrades(jLoadTrades().filter(tr => tr.id !== id));
    jRenderList();
  }

  // ── JOURNAL: RENDER LIST ──────────────────────────────────────────────────

  function jRenderList(){
    const listEl = document.getElementById('tl-jrn-list');
    if(!listEl) return;

    const t      = tier();
    const trades = jLoadTrades();
    const count  = trades.length;

    // Refresh tier badge
    const tierEl = document.getElementById('tl-jrn-tier');
    if(tierEl){
      tierEl.innerHTML = t < 2
        ? `<span style="color:#ff6b35;font-family:'Space Mono',monospace;font-size:10px">Free tier: ${count}/10 trades used</span>`
        : `<span style="color:#00e87a;font-family:'Space Mono',monospace;font-size:10px">Pro · Unlimited trades</span>`;
    }

    // Gate: disable save btn when free tier full
    const saveBtn  = document.getElementById('tl-jrn-save-btn');
    const limitMsg = document.getElementById('tl-jrn-limit');
    const atLimit  = t < 2 && count >= 10;
    if(saveBtn){
      saveBtn.disabled     = atLimit;
      saveBtn.style.opacity  = atLimit ? '0.4' : '1';
      saveBtn.style.cursor   = atLimit ? 'not-allowed' : 'pointer';
    }
    if(limitMsg) limitMsg.style.display = atLimit ? 'block' : 'none';

    // Empty state
    if(!count){
      listEl.innerHTML = `<div style="text-align:center;padding:32px;font-family:'Space Mono',monospace;font-size:11px;color:#4a6070">No trades yet. Add your first trade above.</div>`;
      return;
    }

    const th = s => `<th style="padding:10px 12px;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:1px;color:#4a6070;text-align:left;text-transform:uppercase;white-space:nowrap">${s}</th>`;

    const rows = [...trades].reverse().map((tr, i) => {
      const rowBg    = i % 2 === 1 ? 'rgba(0,180,216,0.02)' : 'transparent';
      const pnlColor = tr.pnl > 0 ? '#00e87a' : tr.pnl < 0 ? '#ff4444' : '#4a6070';
      const sign     = tr.pnl >= 0 ? '+' : '';
      const dirColor = tr.direction === 'BUY' ? '#00e87a' : '#ff4444';
      const dirBg    = tr.direction === 'BUY' ? 'rgba(0,232,122,0.1)' : 'rgba(255,68,68,0.1)';
      const td       = (content, extra='') => `<td style="padding:10px 12px;${extra}">${content}</td>`;

      return `<tr style="background:${rowBg};border-bottom:1px solid rgba(255,255,255,0.03)">
        ${td(`<span style="font-family:'Space Mono',monospace;font-size:11px;color:#ccd8df">${tr.date}</span>`)}
        ${td(`<span style="font-family:'Space Mono',monospace;font-size:13px;color:#ccd8df;font-weight:700">${tr.symbol||'—'}</span>`)}
        ${td(`<span style="background:${dirBg};color:${dirColor};border-radius:4px;padding:2px 8px;font-family:'Space Mono',monospace;font-size:10px;font-weight:700">${tr.direction}</span>`)}
        ${td(`<span style="font-family:'Space Mono',monospace;font-size:12px;color:#ccd8df">$${(+tr.entryPrice).toLocaleString()}</span>`)}
        ${td(`<span style="font-family:'Space Mono',monospace;font-size:12px;color:#ccd8df">$${(+tr.exitPrice).toLocaleString()}</span>`)}
        ${td(`<span style="font-family:'Space Mono',monospace;font-size:13px;color:${pnlColor};font-weight:700">${sign}$${Math.abs(tr.pnl||0).toFixed(2)}</span>`)}
        ${td(`<span style="font-size:11px;color:#4a6070">${(tr.tags||[]).join(', ')||'—'}</span>`)}
        ${td(`<button onclick="TL.deleteTrade('${tr.id}')" style="background:transparent;border:none;color:#ff4444;cursor:pointer;font-size:16px;line-height:1;padding:2px 6px">×</button>`)}
      </tr>`;
    }).join('');

    listEl.innerHTML = `
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="border-bottom:1px solid rgba(0,180,216,0.1)">
              ${th('Date')}${th('Symbol')}${th('Dir')}${th('Entry')}${th('Exit')}${th('P&amp;L')}${th('Tags')}<th></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  // ── JOURNAL: EXPORT CSV ───────────────────────────────────────────────────

  function jExportCsv(){
    const trades = jLoadTrades();
    if(!trades.length){ if(typeof toast==='function') toast('No trades to export','#f4c542'); return; }
    const headers = ['Date','Symbol','Direction','Entry Price','Exit Price','Position Size','Fees','P&L','P&L %','Tags','Notes'];
    const rows    = trades.map(tr => [
      tr.date, tr.symbol, tr.direction,
      tr.entryPrice, tr.exitPrice, tr.positionSize, tr.fees,
      tr.pnl, tr.pnlPct,
      (tr.tags||[]).join(';'),
      '"' + (tr.notes||'').replace(/"/g,'""') + '"'
    ].join(','));
    const csv  = [headers.join(','), ...rows].join('\n');
    const url  = URL.createObjectURL(new Blob([csv], {type:'text/csv'}));
    const a    = document.createElement('a');
    a.href = url; a.download = 'dfm_trades.csv'; a.click();
    URL.revokeObjectURL(url);
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
    if(id === 'journal') jRenderList();
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

  // Expose all functions called from inline event handlers
  return {
    init,
    _switchTab:  switchTab,
    _calcRisk:   calcRisk,
    setDirection: jSetDirection,
    calcPnl:      jCalcPnl,
    saveTrade:    jSaveTrade,
    deleteTrade:  jDeleteTrade,
    _exportCsv:   jExportCsv,
  };

})();
