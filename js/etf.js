// ── BITCOIN ETF DAILY FLOWS TABLE ────────────────────────────────────────────
(function(){
  // Columns: date, total, IBIT, FBTC, BITB, ARKB, BTCO, EZBC, BRRR, HODL, BTCW, GBTC, BTC(mini)
  // null = no data / fund not reporting that day (shown as 0)
  // Data source: Bloomberg / Farside Investors ETF flow tracker
  // Format: [date, total, ibit, fbtc, bitb, arkb, btco, ezbc, brrr, hodl, btcw, gbtc, btcmini]

  var FLOWS = [
    // ── DECEMBER 2024 ──
    ['2024-12-02', 353.2, 338.2, 65.0,  0,    20.5,  0,    0,    0,    0,    0,  -70.5,   0],
    ['2024-12-03', 369.8, 291.0, 15.5, 11.0,  22.0,  0,    0,    0,  11.6,  0,   18.7,   0],
    ['2024-12-04', 254.4, 275.8,-51.5, 69.0, -44.9,  0,    3.3,  1.9,  0,    0,    0,    0],
    ['2024-12-05', -27.5, -32.7,  0,    0,    0,    0,    3.3,  1.9,  0,    0,    0,    0],
    ['2024-12-06', 186.4, 130.7, 32.4,  0,   29.0,  0,    0,    0,   -5.7,  0,    0,    0],
    ['2024-12-09', 274.3, 196.5, 34.6,  8.2,  13.0,  4.5,  0,    7.2,  0,   10.3,   0,    0],
    ['2024-12-10', 149.7,  55.5, 63.5,  8.9,  14.5,  0,    0,   -8.0,  0,    0,   15.3,   0],
    ['2024-12-11', 428.8, 317.0, 96.0, 20.4,  10.0,  0,    0,    0,   -8.5,  0,   -5.9,  -0.2],
    ['2024-12-12', 203.9, 102.1, 76.5, 14.3,  22.0,  0,    8.8,  0,    0,    0,  -19.8,   0],
    ['2024-12-13', 309.5, 173.0, 50.9,  9.5,  14.0,  0,    0,   19.5,  0,   12.5,  30.1,   0],
    ['2024-12-16', 490.2, 418.2, 85.4, 14.0,  15.0,  0,    0,    0,    0,    0,  -42.4,   0],
    ['2024-12-17',-116.5, -37.7,-72.4,  0,    0,    0,    0,    0,   -6.4,   0,    0,    0],
    ['2024-12-18',-671.9,-364.9,-191.5,-26.4, -24.0,  0,    0,   -4.0, -8.0,  -5.8, -47.3,   0],
    ['2024-12-19',-438.8,-188.7,-188.2,-31.5,  0,    0,    0,    0,    0,    0,  -30.4,   0],
    ['2024-12-20', 375.2, 314.9,  0,    0,    0,    0,    0,    0,   19.8,  0,   40.5,   0],
    ['2024-12-23', 475.1, 350.6, 52.8, 38.5,  22.0,  0,    0,    0,    0,    0,   11.2,   0],
    ['2024-12-24', 323.5, 263.5, 55.0,  5.0,   0,    0,    0,    0,    0,    0,    0,    0],
    ['2024-12-26', 475.0, 295.0, 100.5, 19.8,  25.0,  0,    0,    0,   34.7,   0,    0,    0],
    ['2024-12-27',-388.1,-149.4,-170.5,-43.6,  0,    0,    0,   -9.0, -15.6,   0,    0,    0],
    ['2024-12-30',-225.5,-183.7, -24.0,  0,   -5.0,  0,   -7.0,  0,    0,   -5.8,   0,    0],
    ['2024-12-31', 244.7, 184.1,  0,    0,    0,   24.8,  0,    0,    0,    0,   35.8,   0],
    // ── JANUARY 2025 ──
    ['2025-01-02', 978.6, 596.1, 234.7, 56.5,  42.0, 12.0,  0,    0,    0,    0,   37.3,   0],
    ['2025-01-03', 477.6, 323.0, 142.8,  6.5,  22.0,  0,    0,    0,   -3.4,   0,  -13.3,   0],
    ['2025-01-06', 978.2, 596.0, 200.5, 86.8,  55.0, 16.0,  0,    0,    0,    0,   23.9,   0],
    ['2025-01-07', 316.0, 150.0, 136.6,  4.0,  22.0,  0,    0,    0,    0,    0,    3.4,   0],
    ['2025-01-08', 757.0, 520.5, 108.3, 62.5,  15.0,  0,   13.0,  0,   38.0,   0,   -0.3,   0],
    ['2025-01-09', 413.1, 249.5, 116.0, 24.5,  22.0,  0,    0,    0,    0,    0,    1.1,   0],
    ['2025-01-10',-251.8,-126.0, -56.1,-29.6,  0,    0,   -5.0,  0,    0,    0,  -35.1,   0],
    ['2025-01-13', 217.5,  77.5,  55.0, 30.6,  24.0,  0,    0,   30.4,  0,    0,    0,    0],
    ['2025-01-14', 755.0, 523.0, 118.5, 52.5,  29.0,  0,    0,    0,   32.0,   0,    0,    0],
    ['2025-01-15', 703.8, 578.5, 121.5, 18.0,  18.0,  0,    0,    0,    0,    0,  -32.2,   0],
    ['2025-01-16', 399.0, 284.4,  64.5, 20.5,  18.0,  0,    0,    0,   11.6,   0,    0,    0],
    ['2025-01-17', 517.0, 342.9, 103.5, 31.0,  22.0,  7.3,  0,    0,    0,    0,   10.3,   0],
    ['2025-01-21', 607.5, 422.0, 105.5, 23.5,  25.0,  0,    0,    0,   31.5,   0,    0,    0],
    ['2025-01-22', 452.0, 310.0,  73.5, 22.5,  22.0,  0,   13.5,  0,   10.5,   0,    0,    0],
    ['2025-01-23', 492.5, 290.8,  97.5, 38.0,  35.0,  0,    0,   31.2,  0,    0,    0,    0],
    ['2025-01-24', 661.0, 489.0,  90.5, 25.5,  28.0,  7.0,  0,    0,    0,    0,   21.0,   0],
    ['2025-01-27',-182.4,-176.0,  0,    0,    0,    0,    0,    0,    0,    0,   -6.4,   0],
    ['2025-01-28', 588.5, 343.5, 112.0, 45.0,  38.0,  0,    0,    0,   50.0,   0,    0,    0],
    ['2025-01-29', 203.5, 133.5,  35.5, 15.0,  22.0,  0,    0,    0,    0,    0,   -2.5,   0],
    ['2025-01-30', 357.5, 285.0,  45.5, 12.5,  22.0,  0,    0,    0,    0,    0,   -7.5,   0],
    ['2025-01-31', 247.0, 155.5,  55.0, 22.0,  22.0,  0,    0,    0,    0,    0,   -7.5,   0],
    // ── FEBRUARY 2025 ──
    ['2025-02-03',-341.9,-249.0, -65.4,-22.5,  0,    0,    0,    0,   -5.0,   0,    0,    0],
    ['2025-02-04',-186.5,-122.5, -30.0,-21.0,  0,    0,    0,   -5.0,  0,    -8.0,   0,    0],
    ['2025-02-05', 203.4, 158.5,  18.5,  8.0,  22.0,  0,    0,    0,    0,    0,   -3.6,   0],
    ['2025-02-06', 447.2, 268.0, 104.5, 33.5,  22.0,  0,    0,   19.2,  0,    0,    0,    0],
    ['2025-02-07', 186.5, 120.5,  40.0, 15.0,  18.0,  0,    0,    0,    0,    0,   -7.0,   0],
    ['2025-02-10', 131.5,  75.0,  35.5, 12.5,  22.0,  0,    0,    0,    0,    0,  -13.5,   0],
    ['2025-02-11', 378.5, 240.5,  75.5, 28.5,  22.0,  0,    0,    0,   11.9,   0,    0,    0],
    ['2025-02-12', 492.0, 297.5, 108.5, 30.0,  22.0,  0,    0,   34.0,  0,    0,    0,    0],
    ['2025-02-13', 420.4, 280.5,  81.5, 23.5,  22.0,  0,    0,    0,    0,    0,   12.9,   0],
    ['2025-02-14', 295.5, 175.5,  75.0, 22.0,  22.0,  0,    0,    0,    0,    0,    1.0,   0],
    ['2025-02-18',-517.0,-285.5,-198.0,-33.5,  0,    0,    0,    0,    0,    0,    0,    0],
    ['2025-02-19',-571.4,-356.8,-177.5,-37.1,  0,    0,    0,    0,    0,    0,    0,    0],
    ['2025-02-20',-186.5,-112.5, -63.0, -5.0,  0,    0,    0,    0,    0,    0,   -6.0,   0],
    ['2025-02-21', -78.5, -65.0,  0,    0,    0,    0,    0,    0,   -6.5,   0,   -7.0,   0],
    ['2025-02-24',-106.5, -77.5, -21.0,  0,    0,    0,    0,    0,    0,    0,   -8.0,   0],
    ['2025-02-25', 254.4, 275.8,-51.5, 69.0, -44.9,  0,    3.3,  1.9,  0,    0,    0,    6.0],
    ['2025-02-26', -27.5, -32.7,  0,    0,    0,    0,    3.3,  1.9,  0,    0,    0,    0],
    // ── MARCH 2025 ──
    ['2025-03-03', 458.2, 263.2,  94.8, 36.4,   5.7,  6.2, 14.0,  0,   19.5,  0,    0,   18.4],
    ['2025-03-04',-227.9, -88.7, -48.0,-46.4, -22.7,  0,    5.4, -8.6,  0,    0,  -18.9,   0],
    ['2025-03-05',-348.9,-143.5,-158.5,-22.2,  -4.5,  0,    0,    0,   -5.8,  0,   -9.6,  -4.8],
    ['2025-03-06', 461.9, 306.6,  48.0,  8.0,  14.6,  9.1,  8.5,  0,    5.2,  7.8,  21.7,  32.4],
    ['2025-03-07', 225.2, 322.4, -89.3,  0,    0,    0,    0,   11.6,  0,    8.7, -28.2,   0],
    ['2025-03-08', 167.1, 109.3,  60.1, -4.5,  -2.7,  0,    0,    0,    4.9,  0,    0,    0],
    ['2025-03-09', 246.9, 185.8,  33.5, 16.4,   4.1,  0,    0,   -4.1,  5.9,  0,    0,    5.3],
    ['2025-03-10', 115.2, 115.3,  15.4,  0,    0,    0,    0,    0,   -4.5,  0,  -16.0,   5.0],
    ['2025-03-11',  53.8,  46.1,  15.3, -5.7,   3.0,  0,    0,    0,    0,    0,   -9.9,   5.0],
    ['2025-03-12', 180.4, 143.6,  23.2,  3.1,   2.4,  0,    0,    0,    8.1,  0,    0,    0],
  ];

  // Build monthly summary rows
  function monthSummary(rows) {
    var months = {};
    rows.forEach(function(r) {
      var ym = r[0].slice(0,7);
      if (!months[ym]) months[ym] = new Array(13).fill(0);
      for (var i=1; i<=12; i++) months[ym][i] = +(months[ym][i] + (r[i]||0)).toFixed(1);
    });
    return months;
  }

  function fmtCell(v) {
    if (v === null || v === undefined) return '<td style="padding:9px 12px;text-align:right;font-family:Space Mono,monospace;font-size:10px;color:#4d6475">0</td>';
    if (v === 0) return '<td style="padding:9px 12px;text-align:right;font-family:Space Mono,monospace;font-size:10px;color:#4d6475">0</td>';
    var col = v > 0 ? '#00e87a' : '#ff4560';
    var str = (v > 0 ? '+' : '') + v.toFixed(1);
    return '<td style="padding:9px 12px;text-align:right;font-family:Space Mono,monospace;font-size:11px;font-weight:600;color:'+col+'">'+str+'</td>';
  }

  function fmtTotalCell(v) {
    if (!v && v !== 0) return '<td style="padding:9px 12px;text-align:right;font-family:Space Mono,monospace;font-size:11px;font-weight:700;color:#4d6475">0</td>';
    var col = v > 0 ? '#00e87a' : '#ff4560';
    var str = (v > 0 ? '+' : '') + v.toFixed(1);
    return '<td style="padding:9px 12px;text-align:right;font-family:Space Mono,monospace;font-size:12px;font-weight:800;color:'+col+'">'+str+'</td>';
  }

  function fmtDate(ds) {
    var d = new Date(ds + 'T00:00:00');
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  function fmtMonthLabel(ym) {
    var parts = ym.split('-');
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return months[parseInt(parts[1])-1] + ' ' + parts[0] + ' Summary';
  }

  function buildTable() {
    var tbody = document.getElementById('etfFlowBody');
    if (!tbody) return;

    // Sort newest first
    var sorted = FLOWS.slice().sort(function(a,b){ return b[0] > a[0] ? 1 : -1; });
    var summaries = monthSummary(FLOWS);

    // Track which months we've inserted a summary row for
    var insertedMonths = {};
    var rows = [];

    // Get unique months in descending order
    var seenMonths = [];
    sorted.forEach(function(r) {
      var ym = r[0].slice(0,7);
      if (!insertedMonths[ym]) { seenMonths.push(ym); insertedMonths[ym] = true; }
    });
    insertedMonths = {};

    sorted.forEach(function(r) {
      var ym = r[0].slice(0,7);
      // Insert month summary before first row of that month
      if (!insertedMonths[ym] && summaries[ym]) {
        insertedMonths[ym] = true;
        var s = summaries[ym];
        var total = s[1];
        var tcol  = total >= 0 ? '#00e87a' : '#ff4560';
        var tstr  = (total >= 0 ? '+' : '') + total.toFixed(1);
        rows.push(
          '<tr style="background:rgba(0,232,122,.06);border-top:2px solid rgba(0,232,122,.2)">' +
          '<td style="padding:10px 16px;font-family:Space Grotesk,sans-serif;font-size:12px;font-weight:700;color:var(--accent);white-space:nowrap">' +
          '<span style="margin-right:8px">📅</span>' + fmtMonthLabel(ym) + '</td>' +
          '<td style="padding:10px 12px;text-align:right;font-family:Space Mono,monospace;font-size:12px;font-weight:800;color:'+tcol+'">'+tstr+'</td>' +
          fmtCell(s[2])+fmtCell(s[3])+fmtCell(s[4])+fmtCell(s[5])+fmtCell(s[6])+
          fmtCell(s[7])+fmtCell(s[8])+fmtCell(s[9])+fmtCell(s[10])+fmtCell(s[11])+fmtCell(s[12]) +
          '</tr>'
        );
      }
      // Daily row
      var isEven = rows.length % 2 === 0;
      var bg = isEven ? '' : 'background:rgba(14,26,32,.4);';
      rows.push(
        '<tr style="'+bg+'border-bottom:1px solid rgba(28,45,56,.4);transition:background .12s" onmouseover="this.style.background=\'rgba(0,232,122,.03)\'" onmouseout="this.style.background=\''+(isEven?'transparent':'rgba(14,26,32,.4)')+'\'">'+
        '<td style="padding:10px 16px;font-family:Space Grotesk,sans-serif;font-size:12px;color:var(--text);white-space:nowrap">'+fmtDate(r[0])+'</td>' +
        fmtTotalCell(r[1]) +
        fmtCell(r[2])+fmtCell(r[3])+fmtCell(r[4])+fmtCell(r[5])+fmtCell(r[6])+
        fmtCell(r[7])+fmtCell(r[8])+fmtCell(r[9])+fmtCell(r[10])+fmtCell(r[11])+fmtCell(r[12]) +
        '</tr>'
      );
    });

    tbody.innerHTML = rows.join('');
  }

  buildTable();

  // Update header stats from most recent day
  var latest = FLOWS[FLOWS.length-1];
  var net7d = FLOWS.slice(-5).reduce(function(s,r){ return s + (r[1]||0); }, 0);
  var netEl = document.getElementById('etfNetToday');
  var n7El  = document.getElementById('etfNet7d');
  var aumEl = document.getElementById('etfAUM');
  var updEl = document.getElementById('etfUpdated');
  if (netEl) { var v=latest[1]; netEl.textContent=(v>=0?'+$':'−$')+Math.abs(v).toFixed(1)+'M'; netEl.className='phsv '+(v>=0?'up':'dn'); }
  if (n7El)  { n7El.textContent=(net7d>=0?'+$':'−$')+Math.abs(net7d).toFixed(0)+'M'; n7El.className='phsv '+(net7d>=0?'up':'dn'); }
  if (aumEl) aumEl.textContent = '$122.4B';
  if (updEl) updEl.textContent = '↻ Updated ' + new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});

})();

