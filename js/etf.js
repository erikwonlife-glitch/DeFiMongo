// ── BITCOIN ETF TRACKER — Fear & Greed + AUM + TradingView comparison ─────────
(function () {

  // ── Static ETF fund data (updated manually, reflects issuer disclosures) ──────
  var ETF_FUNDS = [
    { ticker: 'IBIT', name: 'BlackRock',    aum: 55650000000, btcHeld: 781700, fee: 0.25 },
    { ticker: 'FBTC', name: 'Fidelity',     aum: 13350000000, btcHeld: 187600, fee: 0.25 },
    { ticker: 'GBTC', name: 'Grayscale',    aum: 11110000000, btcHeld: 156100, fee: 1.50 },
    { ticker: 'ARKB', name: 'ARK 21Shares', aum:  4100000000, btcHeld:  57600, fee: 0.21 },
    { ticker: 'BITB', name: 'Bitwise',      aum:  3200000000, btcHeld:  44900, fee: 0.20 }
  ];

  // ── Fear & Greed helpers ───────────────────────────────────────────────────────
  function fgColor(v) {
    if (v <= 25) return '#ef4444';
    if (v <= 45) return '#f97316';
    if (v <= 55) return '#fbbf24';
    if (v <= 75) return '#22c55e';
    return '#00e87a';
  }

  function fgLabel(v) {
    if (v <= 25) return 'Extreme Fear';
    if (v <= 45) return 'Fear';
    if (v <= 55) return 'Neutral';
    if (v <= 75) return 'Greed';
    return 'Extreme Greed';
  }

  function fgInterpret(v) {
    if (v <= 25) return 'Extreme Fear — historically a contrarian buying signal. Long-term holders accumulate while retail panic sells. Potential bottom formation zone.';
    if (v <= 45) return 'Fear is dominating. Investors are cautious and risk-off. Historically associated with short-term price weakness but long-term entry opportunities.';
    if (v <= 55) return 'Neutral sentiment. No strong directional bias from crowd psychology. Market is balanced between buyers and sellers.';
    if (v <= 75) return 'Greed is building. Momentum is strong but caution advised on new entries — market becoming increasingly overextended.';
    return 'Extreme Greed — peak euphoria. Historically precedes significant corrections. High probability of short-term local top.';
  }

  // ── SVG gauge (half-circle) ────────────────────────────────────────────────────
  function polarToXY(cx, cy, r, angleDeg) {
    var rad = angleDeg * Math.PI / 180;
    return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)];
  }

  function arcD(cx, cy, r, startDeg, endDeg) {
    var s = polarToXY(cx, cy, r, startDeg);
    var e = polarToXY(cx, cy, r, endDeg);
    var large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    var sweep = startDeg > endDeg ? 1 : 0;
    return 'M ' + s[0].toFixed(1) + ' ' + s[1].toFixed(1) +
           ' A ' + r + ' ' + r + ' 0 ' + large + ' ' + sweep +
           ' ' + e[0].toFixed(1) + ' ' + e[1].toFixed(1);
  }

  function buildGaugeSVG(value) {
    var col = fgColor(value);
    var lbl = fgLabel(value);
    // Map value 0-100 to angle 180-0 degrees (left to right)
    var needleAngle = 180 - (value / 100 * 180);
    var cx = 100, cy = 105, r = 78;

    // Colored zone arcs (dim background)
    var zones = [
      [180, 135, '#ef4444'], // 0-25 extreme fear
      [135, 99,  '#f97316'], // 25-45 fear
      [99,  81,  '#fbbf24'], // 45-55 neutral
      [81,  45,  '#22c55e'], // 55-75 greed
      [45,  0,   '#00e87a']  // 75-100 extreme greed
    ];

    var zonePaths = zones.map(function(z) {
      return '<path d="' + arcD(cx, cy, r, z[0], z[1]) + '" stroke="' + z[2] +
             '" stroke-width="13" fill="none" stroke-linecap="butt" opacity="0.25"/>';
    }).join('');

    // Active arc from 180° to current needle angle
    var activeArc = '<path d="' + arcD(cx, cy, r, 180, needleAngle) +
                    '" stroke="' + col + '" stroke-width="13" fill="none" stroke-linecap="round" opacity="0.9"/>';

    // Needle
    var tip = polarToXY(cx, cy, r * 0.72, needleAngle);
    var needle = '<line x1="' + cx + '" y1="' + cy + '" x2="' + tip[0].toFixed(1) + '" y2="' + tip[1].toFixed(1) +
                 '" stroke="' + col + '" stroke-width="2.5" stroke-linecap="round"/>';
    var dot = '<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="' + col + '"/>';

    // Zone labels
    var labels =
      '<text x="12" y="115" font-family="Space Mono,monospace" font-size="7" fill="#ef4444" opacity="0.7">FEAR</text>' +
      '<text x="88" y="40" font-family="Space Mono,monospace" font-size="7" fill="#fbbf24" opacity="0.7" text-anchor="middle">NEUTRAL</text>' +
      '<text x="175" y="115" font-family="Space Mono,monospace" font-size="7" fill="#00e87a" opacity="0.7" text-anchor="end">GREED</text>';

    // Score text
    var score =
      '<text x="' + cx + '" y="' + (cy - 10) + '" text-anchor="middle" font-family="Space Mono,monospace" font-size="32" font-weight="800" fill="' + col + '">' + value + '</text>' +
      '<text x="' + cx + '" y="' + (cy + 8) + '" text-anchor="middle" font-family="Space Grotesk,sans-serif" font-size="10" fill="' + col + '">' + lbl.toUpperCase() + '</text>';

    return '<svg viewBox="0 0 200 130" style="width:100%;max-width:260px;display:block;margin:0 auto">' +
      zonePaths + activeArc + needle + dot + labels + score + '</svg>';
  }

  // ── 30-day Fear & Greed chart (Chart.js bar) ───────────────────────────────────
  function buildFGChart(series) {
    var el = document.getElementById('fgChart');
    if (!el || typeof Chart === 'undefined') return;
    var labels = series.map(function(p) { return p.date; });
    var values = series.map(function(p) { return p.value; });
    var colors = values.map(function(v) { return fgColor(v); });
    new Chart(el, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{ data: values, backgroundColor: colors, borderRadius: 2, borderSkipped: false }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(ctx) { return ctx.raw + ' — ' + fgLabel(ctx.raw); }
            }
          }
        },
        scales: {
          y: {
            min: 0, max: 100,
            grid: { color: '#1c2d38' },
            ticks: {
              color: '#4d6475',
              callback: function(v) {
                if (v === 0) return '0';
                if (v === 25) return '25';
                if (v === 50) return '50';
                if (v === 75) return '75';
                if (v === 100) return '100';
                return '';
              }
            }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#4d6475', maxTicksLimit: 8, maxRotation: 0, font: { size: 8 } }
          }
        }
      }
    });
  }

  // ── ETF Holdings table ─────────────────────────────────────────────────────────
  function buildHoldingsTable(funds, btcPrice) {
    var tbody = document.getElementById('etfHoldingsBody');
    if (!tbody) return;
    var maxAum = funds[0].aum;
    var rows = funds.map(function(f, i) {
      var barPct = Math.round(f.aum / maxAum * 100);
      var aumStr = '$' + (f.aum / 1e9).toFixed(1) + 'B';
      var btcStr = (f.btcHeld / 1000).toFixed(1) + 'K';
      var bg = i % 2 === 1 ? 'background:rgba(14,26,32,.4);' : '';
      return '<tr style="' + bg + 'border-bottom:1px solid #1c2d38">' +
        '<td style="padding:12px 20px">' +
          '<span style="font-family:Space Mono,monospace;font-size:13px;font-weight:700;color:#00e87a">' + f.ticker + '</span>' +
          '<span style="font-family:Space Grotesk,sans-serif;font-size:11px;color:#4d6475;margin-left:8px">' + f.name + '</span>' +
        '</td>' +
        '<td style="padding:12px 16px;min-width:160px">' +
          '<div style="font-family:Space Mono,monospace;font-size:12px;font-weight:700;color:#fff">' + aumStr + '</div>' +
          '<div style="margin-top:5px;height:3px;background:#1c2d38;border-radius:2px">' +
            '<div style="height:3px;background:#00e87a;border-radius:2px;width:' + barPct + '%"></div>' +
          '</div>' +
        '</td>' +
        '<td style="padding:12px 16px;text-align:right;font-family:Space Mono,monospace;font-size:12px;color:#fff">' + btcStr + ' BTC</td>' +
        '<td style="padding:12px 16px;text-align:right;font-family:Space Mono,monospace;font-size:11px;color:#4d6475">' + f.fee.toFixed(2) + '%</td>' +
        '</tr>';
    });
    tbody.innerHTML = rows.join('');
  }

  // ── TradingView ETF comparison widget ─────────────────────────────────────────
  function buildTVChart() {
    var container = document.getElementById('etfTVChart');
    if (!container) return;
    container.innerHTML = '';

    var outer = document.createElement('div');
    outer.className = 'tradingview-widget-container';
    outer.style.cssText = 'width:100%;height:100%';

    var inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget';
    inner.style.cssText = 'width:100%;height:calc(100% - 22px)';

    var copy = document.createElement('div');
    copy.className = 'tradingview-widget-copyright';
    copy.style.cssText = 'font-family:Space Mono,monospace;font-size:9px;color:#4d6475;padding:4px 8px';
    copy.innerHTML = '<a href="https://www.tradingview.com" target="_blank" rel="noopener" style="color:#4d6475;text-decoration:none">Data by TradingView</a>';

    outer.appendChild(inner);
    outer.appendChild(copy);
    container.appendChild(outer);

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        ['IBIT BlackRock',  'NASDAQ:IBIT|12M'],
        ['FBTC Fidelity',   'NASDAQ:FBTC|12M'],
        ['GBTC Grayscale',  'NYSE:GBTC|12M'],
        ['ARKB ARK',        'NASDAQ:ARKB|12M']
      ],
      chartOnly: false,
      width: '100%',
      height: '100%',
      locale: 'en',
      colorTheme: 'dark',
      autosize: true,
      showVolume: false,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
      scalePosition: 'right',
      scaleMode: 'Percentage',
      backgroundColor: 'rgba(14,26,32,0)',
      lineWidth: 2,
      fontFamily: 'Space Mono, monospace',
      isTransparent: true,
      chartType: 'area',
      noTimeScale: false
    });
    outer.appendChild(script);
  }

  // ── Update header stat cards ───────────────────────────────────────────────────
  function updateHeader(fg, btcPrice) {
    var fgEl = document.getElementById('etfFGScore');
    var btcEl = document.getElementById('etfBTCPrice');
    if (fgEl) {
      fgEl.textContent = fg.value + ' · ' + fgLabel(fg.value);
      fgEl.style.color = fgColor(fg.value);
    }
    if (btcEl && btcPrice) {
      btcEl.textContent = '$' + Math.round(btcPrice).toLocaleString();
    }
  }

  // ── Render with data ───────────────────────────────────────────────────────────
  function render(d) {
    var fg = d.fearGreed;
    var btcPrice = d.btcPrice;

    // Update global BTC_CURRENT if we have a fresher price
    if (btcPrice && btcPrice > 1000) window.BTC_CURRENT = btcPrice;

    updateHeader(fg, btcPrice);

    // Gauge
    var gaugeEl = document.getElementById('fgGauge');
    if (gaugeEl) gaugeEl.innerHTML = buildGaugeSVG(fg.value);

    // Interpretation
    var interpEl = document.getElementById('fgInterpret');
    if (interpEl) interpEl.textContent = fgInterpret(fg.value);

    // 30-day chart
    buildFGChart(fg.series);

    // Holdings table
    buildHoldingsTable(d.etfAUM.funds, btcPrice);

    // Updated label
    var updEl = document.getElementById('etfUpdated');
    if (updEl) updEl.textContent = '↻ F&G live · ' + new Date(d.updated).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
  }

  // ── Render fallback if API fails ──────────────────────────────────────────────
  function renderFallback() {
    var gaugeEl = document.getElementById('fgGauge');
    if (gaugeEl) gaugeEl.innerHTML = buildGaugeSVG(50);
    var interpEl = document.getElementById('fgInterpret');
    if (interpEl) interpEl.textContent = fgInterpret(50);
    buildHoldingsTable(ETF_FUNDS, window.BTC_CURRENT || null);
    var updEl = document.getElementById('etfUpdated');
    if (updEl) updEl.textContent = '↻ Fallback data · ' + new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
    // Update header with current BTC price at least
    var btcEl = document.getElementById('etfBTCPrice');
    if (btcEl && window.BTC_CURRENT) btcEl.textContent = '$' + Math.round(window.BTC_CURRENT).toLocaleString();
  }

  // ── Main: fetch API then render ────────────────────────────────────────────────
  var API = (typeof CR_API !== 'undefined' ? CR_API : '');

  (async function () {
    try {
      var r = await fetch(API + '/api/macro/etf', { signal: AbortSignal.timeout(15000) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var d = await r.json();
      if (!d || !d.fearGreed) throw new Error('Invalid response');
      render(d);
    } catch (e) {
      console.warn('[ETF] /api/macro/etf failed:', e.message);
      renderFallback();
    }
  })();

  // TradingView chart (runs independently)
  buildTVChart();

})();
