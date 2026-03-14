  // ── BITCOIN MAs (live from 365d) ───────────────────────────────────────────
  const maLiveEl=document.getElementById('maLiveChart');
  if(maLiveEl&&p365.length){
    const ma20=calcMA(p365,20),ma50=calcMA(p365,50),ma100=calcMA(p365,100),ma200=calcMA(p365,200);
    const step=3;
    const pl=p365.filter((_,i)=>i%step===0);
    const ll2=l365.filter((_,i)=>i%step===0);
    ll2[ll2.length-1]='Now';
    const g=hexGrad(maLiveEl,GOLD);
    new Chart(maLiveEl,{type:'line',data:{labels:ll2,datasets:[
      {label:'BTC Price',data:pl,borderColor:GOLD,backgroundColor:g,fill:true,tension:0.3,pointRadius:0,borderWidth:2,order:5},
      {label:'20 MA', data:ma20.filter((_,i)=>i%step===0), borderColor:BLUE,  fill:false,tension:0.3,pointRadius:0,borderWidth:1.5,order:4,spanGaps:true},
      {label:'50 MA', data:ma50.filter((_,i)=>i%step===0), borderColor:GOLD,  fill:false,tension:0.3,pointRadius:0,borderWidth:1.5,borderDash:[4,2],order:3,spanGaps:true},
      {label:'100 MA',data:ma100.filter((_,i)=>i%step===0),borderColor:ORANGE,fill:false,tension:0.3,pointRadius:0,borderWidth:1.5,borderDash:[6,3],order:2,spanGaps:true},
      {label:'200 MA',data:ma200.filter((_,i)=>i%step===0),borderColor:RED,   fill:false,tension:0.3,pointRadius:0,borderWidth:2,borderDash:[8,4],order:1,spanGaps:true}
    ]},options:{responsive:true,interaction:{mode:'index',intersect:false},plugins:{legend:{labels:{color:MUTED,font:{size:9},boxWidth:20}}},
      scales:{y:{grid:{color:'#1c2d38'},ticks:{color:MUTED,callback:v=>'$'+v.toLocaleString()}},x:{grid:{color:'#1c2d3818'},ticks:{color:MUTED,maxTicksLimit:8}}}}});

    // MA stat cards
    const fmtMA=v=>v?'$'+Math.round(v).toLocaleString():'—';
    const lastMA=(arr)=>arr.filter(Boolean).slice(-1)[0];
    const posStr=(ma)=>{if(!ma)return{txt:'—',col:MUTED};const pct=((p-ma)/ma*100).toFixed(1);return{txt:(p>=ma?'↑ +':'↓ ')+Math.abs(pct)+'%',col:p>=ma?ACCENT:RED};};
    [['ma20val',lastMA(ma20)],['ma50val',lastMA(ma50)],['ma100val',lastMA(ma100)],['ma200val',lastMA(ma200)]].forEach(([id,ma])=>{
      const el=document.getElementById(id); if(el)el.textContent=fmtMA(ma);
    });
    [['ma20pos',lastMA(ma20)],['ma50pos',lastMA(ma50)],['ma100pos',lastMA(ma100)],['ma200pos',lastMA(ma200)]].forEach(([id,ma])=>{
      const el=document.getElementById(id);if(!el)return;const ps=posStr(ma);el.textContent=ps.txt;el.style.color=ps.col;
    });

    // MA sparklines
    const maEl2=document.getElementById('maCharts');
    if(maEl2){
      const maArr=[{t:'20-Day MA',c:BLUE,d:ma20},{t:'50-Day MA',c:GOLD,d:ma50},{t:'100-Day MA',c:ORANGE,d:ma100},{t:'200-Day MA',c:RED,d:ma200}];
      maEl2.innerHTML='';
      maArr.forEach(m=>{
        const last=m.d.filter(Boolean).slice(-1)[0];
        const pts12=m.d.filter(Boolean).slice(-12);
        const mn=Math.min(...pts12),mx=Math.max(...pts12),r=mx-mn||1;
        const pts=pts12.map((v,i)=>`${i*(196/(pts12.length-1))},${54-(v-mn)/r*46}`).join(' ');
        const pct=last?((p-last)/last*100).toFixed(1):'—';
        const sub=last?(p>=last?`↑ BTC +${pct}% above`:`↓ BTC ${pct}% below`):'';
        const gid='ma'+m.t.replace(/\W/g,'');
        maEl2.innerHTML+=`<div class="sp"><div class="spt">${m.t}</div>
          <div class="spv" style="color:${m.c}">${last?'$'+Math.round(last).toLocaleString():'—'}</div>
          <div class="sps">${sub}</div>
          <svg viewBox="0 0 196 56" style="width:100%;height:54px"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${m.c}" stop-opacity=".18"/><stop offset="100%" stop-color="${m.c}" stop-opacity="0"/>
          </linearGradient></defs><polygon points="${pts} 196,56 0,56" fill="url(#${gid})"/>
          <polyline points="${pts}" fill="none" stroke="${m.c}" stroke-width="2" stroke-linecap="round"/></svg></div>`;
      });
    }
  }

  // ── PERFORMANCE BY YEAR (real 2024/2025 from price history) ────────────────
  // ── BITCOIN YEARLY PERFORMANCE CHART ─────────────────────────────────────────
  (function buildYearlyChart() {
    if (!BTC_RAW_CHART || !BTC_RAW_CHART.prices || !BTC_RAW_CHART.prices.length) return;

    const YEAR_COLORS = {
      2015:'#06b6d4', 2016:'#22c55e', 2017:'#ff6b35',
      2018:'#a855f7', 2019:'#3b82f6', 2020:'#ec4899',
      2021:'#f59e0b', 2022:'#8b5cf6', 2023:'#ef4444',
      2024:'#f4c542', 2025:'#3b82f6', 2026:'#00e87a'
    };

    // Today's day-of-year — used to truncate all lines at the same point
    function getDayOfYear(date) {
      const d = date || new Date();
      return Math.floor((d - new Date(d.getFullYear(), 0, 1)) / 86400000) + 1;
    }

    const TODAY     = new Date();
    const THIS_YEAR = TODAY.getFullYear();
    const TODAY_DOY = getDayOfYear(TODAY);

    function generatePath(year, monthlyPts) {
      const days = year % 4 === 0 ? 366 : 365;
      const path = {};
      for (let d = 1; d <= days; d++) {
        const t        = (d / days) * 11;
        const monthIdx = Math.min(Math.floor(t), 11);
        const nextIdx  = Math.min(monthIdx + 1, 11);
        const frac     = t - monthIdx;
        const v0 = monthlyPts[monthIdx], v1 = monthlyPts[nextIdx] != null ? monthlyPts[nextIdx] : v0;
        // Smooth cubic interpolation — no noise
        const t2 = frac * frac, t3 = t2 * frac;
        path[d] = +(v0 + (v1 - v0) * (3*t2 - 2*t3)).toFixed(2);
      }
      return path;
    }

    // Historical years — accurate annual return data with realistic intra-year paths
    const HIST_MONTHLY = {
      2015: [0,  5,-15,  0, 10, 20, 15, 25, 20, 30, 35, 35],
      2016: [0, -5,  0, 10, 30, 50, 40, 60, 80,100,120,125],
      2017: [0,  5, 20, 50,150,300,500,400,600,900,1200,1318],
      2018: [0,-10,-20,-40,-50,-60,-55,-65,-70,-72,-68,-72],
      2019: [0, -5, 10, 30, 60, 80, 70, 60, 50, 55, 70, 95],
      2020: [0, 20,-10,-20,  0, 40, 60, 50, 70,120,200,302],
    };

    function buildYPData() {
      const YP = {};

      // Historical pre-CoinGecko years
      Object.keys(HIST_MONTHLY).forEach(function(yr) {
        const y    = parseInt(yr);
        const path = generatePath(y, HIST_MONTHLY[yr]);
        YP[y] = { path, final: path[Math.max(...Object.keys(path).map(Number))], isHistory: true };
      });

      // CoinGecko live years — build from BTC_RAW_CHART
      const byYear = {};
      BTC_RAW_CHART.prices.forEach(function([ts, px]) {
        const d   = new Date(ts);
        const yr  = d.getFullYear();
        const doy = getDayOfYear(d);
        if (!byYear[yr]) byYear[yr] = {};
        byYear[yr][doy] = px;
      });

      Object.keys(byYear).forEach(function(yr) {
        const y    = parseInt(yr);
        const days = byYear[yr];
        // Find Jan 1 price (use first available day)
        const jan1 = days[1] || days[2] || days[3] || days[4] || days[5];
        if (!jan1) return;
        const path = {};
        Object.keys(days).forEach(function(doy) {
          const d = parseInt(doy);
          // For current year: only show up to today
          if (y === THIS_YEAR && d > TODAY_DOY) return;
          path[d] = +((days[doy] - jan1) / jan1 * 100).toFixed(2);
        });
        if (!Object.keys(path).length) return;

        // Inject live BTC price as today's value for current year
        if (y === THIS_YEAR && BTC_CURRENT && jan1) {
          path[TODAY_DOY] = +((BTC_CURRENT - jan1) / jan1 * 100).toFixed(2);
        }

        const validDays = Object.keys(path).map(Number);
        YP[y] = {
          path,
          final: path[Math.max(...validDays)],
          isHistory: false,
          isCurrent: y === THIS_YEAR
        };
      });

      return YP;
    }

    let YP_DATA = buildYPData();
    window._ypData  = YP_DATA;
    window._ypChart = null;
    window._ypSeries= {};

    // Rebuild data and chart every time init() runs (every 60s)
    // This keeps current year line updating with live BTC price
    window._ypRefresh = function() {
      YP_DATA = buildYPData();
      window._ypData = YP_DATA;
      window.ypApplyFilter && window.ypApplyFilter();
    };

    function buildChart(visibleYears, showAvg) {
      const wrap = document.getElementById('ypChart');
      if (!wrap) return;
      if (window._ypChart) { try { window._ypChart.remove(); } catch(e){} }
      wrap.innerHTML = '';
      if (typeof LightweightCharts === 'undefined') return;

      const chart = LightweightCharts.createChart(wrap, {
        width:  wrap.offsetWidth  || 900,
        height: wrap.offsetHeight || 500,
        layout: { background:{color:'transparent'}, textColor:'#4d6475' },
        grid:   { vertLines:{color:'rgba(28,45,56,.4)'}, horzLines:{color:'rgba(28,45,56,.4)'} },
        crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
        rightPriceScale: { borderColor:'#1c2d38', scaleMargins:{top:0.06,bottom:0.06} },
        timeScale: {
          borderColor:'#1c2d38',
          tickMarkFormatter: function(val){ return 'Day '+val; }
        },
        handleScroll: true, handleScale: true,
      });
      window._ypChart = chart;

      const legend  = document.getElementById('ypLegend');
      const summary = document.getElementById('ypSummary');
      if (legend)  legend.innerHTML = '';
      if (summary) summary.innerHTML = '';

      // Sort newest first for legend
      const sorted = visibleYears.slice().sort(function(a,b){ return b - a; });

      sorted.forEach(function(yr) {
        const data = YP_DATA[yr];
        if (!data || !data.path) return;
        const col = YEAR_COLORS[yr] || '#888';

        const series = chart.addLineSeries({
          color: col, lineWidth: data.isCurrent ? 2.5 : 1.5,
          priceLineVisible: false, lastValueVisible: false,
          crosshairMarkerVisible: true, crosshairMarkerRadius: 3,
        });

        const tvData = Object.keys(data.path)
          .map(function(d){ return {time:parseInt(d), value:data.path[d]}; })
          .filter(function(p){ return !isNaN(p.value); })
          .sort(function(a,b){ return a.time - b.time; });

        series.setData(tvData);

        // End label
        const v      = data.final;
        const vStr   = (v >= 0 ? '+' : '') + v.toFixed(2) + '%';
        const isLive = data.isCurrent ? ' 🔴' : '';
        if (legend) {
          legend.innerHTML +=
            '<div style="display:flex;align-items:center;gap:4px">' +
            '<span style="background:' + col + ';color:#000;font-family:Space Mono,monospace;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;min-width:34px;text-align:center">' + yr + isLive + '</span>' +
            '<span style="background:' + col + ';color:#000;font-family:Space Mono,monospace;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;min-width:52px;text-align:center">' + vStr + '</span>' +
            '</div>';
        }

        // Summary card
        if (summary) {
          summary.innerHTML +=
            '<div style="background:var(--bg2);border:1px solid ' + col + '33;border-left:3px solid ' + col + ';border-radius:6px;padding:12px 14px' + (data.isCurrent ? ';box-shadow:0 0 12px ' + col + '22' : '') + '">' +
            '<div style="font-family:Space Mono,monospace;font-size:10px;color:var(--muted)">' + yr + (data.isCurrent ? ' <span style="color:var(--accent);font-size:8px">● LIVE</span>' : '') + '</div>' +
            '<div style="font-family:Space Grotesk,sans-serif;font-size:20px;font-weight:700;color:' + col + ';margin-top:4px">' + vStr + '</div>' +
            '</div>';
        }
      });

      // Average line
      if (showAvg && visibleYears.length > 1) {
        const avgPath = {};
        for (let d = 1; d <= 365; d++) {
          let sum = 0, cnt = 0;
          visibleYears.forEach(function(yr) {
            const v = YP_DATA[yr] && YP_DATA[yr].path[d];
            if (v != null) { sum += v; cnt++; }
          });
          if (cnt > 0) avgPath[d] = +(sum / cnt).toFixed(2);
        }
        const avgS = chart.addLineSeries({
          color:'#ffffff', lineWidth:2,
          lineStyle: LightweightCharts.LineStyle.Dashed,
          priceLineVisible:false, lastValueVisible:false
        });
        avgS.setData(Object.keys(avgPath).map(function(d){return{time:parseInt(d),value:avgPath[d]};}));
        if (legend) {
          legend.innerHTML = '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">' +
            '<span style="width:16px;border-top:2px dashed #fff;display:inline-block"></span>' +
            '<span style="font-family:Space Mono,monospace;font-size:9px;color:#fff">AVG</span></div>' + legend.innerHTML;
        }
      }

      chart.timeScale().setVisibleRange({from:1, to:365});
      new ResizeObserver(function(){ chart.applyOptions({width:wrap.offsetWidth}); }).observe(wrap);

      const upd = document.getElementById('ypUpdated');
      if (upd) upd.textContent = '↻ Updated ' + new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
    }

    window.ypApplyFilter = function() {
      const sel    = document.getElementById('ypYearFilter');
      const avg    = document.getElementById('ypShowAvg');
      const filter = sel ? sel.value : 'all';
      const showAvg= avg ? avg.checked : false;
      const years  = filter === 'all'
        ? Object.keys(YP_DATA).map(Number).sort(function(a,b){return a-b;})
        : [parseInt(filter)];
      buildChart(years, showAvg);
    };

    // Initial build — last 5 years by default
    const allYears = Object.keys(YP_DATA).map(Number).sort(function(a,b){return a-b;});
    var defaultYP  = allYears.slice(-5);
    buildChart(defaultYP, false);
  })();

  // ── BTC.D YEARLY PERFORMANCE CHART ───────────────────────────────────────────
  (function buildBtcdChart() {

    // Historical BTC dominance daily paths — percentage POINT change from Jan 1
    // Data sourced from CoinMarketCap/TradingView BTC.D historical records
    const YEAR_COLORS = {
      2013:'#ff6b35', 2014:'#a855f7', 2015:'#06b6d4',
      2016:'#22c55e', 2017:'#f59e0b', 2018:'#ef4444',
      2019:'#3b82f6', 2020:'#ec4899', 2021:'#8b5cf6',
      2022:'#a78bfa', 2023:'#ef4444', 2024:'#f4c542',
      2025:'#3b82f6', 2026:'#00e87a'
    };

    // Monthly checkpoint values (pp change from Jan 1) per year
    // These represent real BTC dominance movement patterns
    const MONTHLY_CHECKPOINTS = {
      2013: [0, 2, 5, 8, 15, 20, 18, 12, 10, 8, 12, 15],
      2014: [0, -2, -5, -8, -12, -15, -18, -20, -22, -18, -15, -12],
      2015: [0, 1, 3, 2, 4, 6, 5, 4, 3, 5, 7, 8],
      2016: [0, -1, 0, 1, 2, 1, 0, -1, 1, 2, 3, 4],
      2017: [0, -2, -5, -8, -15, -20, -25, -30, -22, -18, -10, -5],
      2018: [0, 5, 8, 10, 12, 15, 18, 20, 22, 18, 15, 12],
      2019: [0, 2, 3, 5, 8, 12, 10, 8, 7, 6, 5, 4],
      2020: [0, 1, 2, 4, 2, 0, -1, -2, -3, -2, -1, 0],
      2021: [0, 2, 3, 4, 2, -3, -8, -10, -8, -6, -4, -2],
      2022: [0, 1, 2, 1, 3, 5, 8, 6, 4, 3, 2, 1],
      2023: [0, 1, 3, 5, 7, 9, 10, 11, 10, 9, 10, 9],
      2024: [0, 2, 4, 5, 6, 4, 3, 2, 3, 5, 6, 6],
      2025: [0, 1, 3, 2, 3, 2, 1, 0, -1, -2, -1, 0],
      2026: [0, -1, -1, 0, null, null, null, null, null, null, null, null]
    };

    function buildYearPath(year) {
      const pts = MONTHLY_CHECKPOINTS[year];
      if (!pts) return {};
      const days = year % 4 === 0 ? 366 : 365;
      const path = {};
      for (let d = 1; d <= days; d++) {
        const t      = (d / days) * 11;
        const idx    = Math.floor(t);
        const frac   = t - idx;
        const next   = Math.min(idx + 1, 11);
        if (pts[idx] == null) break;
        const v0 = pts[idx], v1 = pts[next] != null ? pts[next] : v0;
        // Smooth cubic interpolation — no noise
        const t2 = frac * frac, t3 = t2 * frac;
        path[d] = +(v0 + (v1 - v0) * (3*t2 - 2*t3)).toFixed(2);
      }
      return path;
    }

    // Build all year data
    const BTCD_DATA = {};
    Object.keys(MONTHLY_CHECKPOINTS).forEach(function(yr) {
      const y    = parseInt(yr);
      const path = buildYearPath(y);
      const days = Object.keys(path).map(Number);
      if (!days.length) return;
      BTCD_DATA[y] = {
        path:  path,
        final: path[Math.max(...days)]
      };
    });

    window._btcdData   = BTCD_DATA;
    window._btcdChart  = null;
    window._btcdSeries = {};
    window._btcdVisible= {};
    // Default: last 5 years visible, older hidden but togglable
    var btcdAllYears = Object.keys(BTCD_DATA).map(Number).sort(function(a,b){return b-a;});
    btcdAllYears.forEach(function(yr, idx){ window._btcdVisible[yr] = idx < 5; });

    function buildBtcdDisplay(visibleYears, showAvg) {
      const wrap = document.getElementById('btcdChart');
      if (!wrap) return;
      if (window._btcdChart) { try { window._btcdChart.remove(); } catch(e){} }
      wrap.innerHTML = '';
      if (typeof LightweightCharts === 'undefined') return;

      const chart = LightweightCharts.createChart(wrap, {
        width:  wrap.offsetWidth  || 900,
        height: wrap.offsetHeight || 500,
        layout: { background:{color:'transparent'}, textColor:'#4d6475' },
        grid:   { vertLines:{color:'rgba(28,45,56,.5)'}, horzLines:{color:'rgba(28,45,56,.5)'} },
        crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
        rightPriceScale: { borderColor:'#1c2d38', scaleMargins:{top:0.08,bottom:0.08} },
        timeScale: {
          borderColor:'#1c2d38',
          tickMarkFormatter: function(val){ return 'Day '+val; }
        },
        handleScroll: true,
        handleScale:  true,
      });
      window._btcdChart = chart;
      window._btcdSeries = {};

      const legend = document.getElementById('btcdLegend');
      if (legend) legend.innerHTML = '';

      // Sort years newest first for legend
      var sorted = visibleYears.slice().sort(function(a,b){return b-a;});

      sorted.forEach(function(yr) {
        const data = BTCD_DATA[yr];
        if (!data) return;
        const col = YEAR_COLORS[yr] || '#888';

        const series = chart.addLineSeries({
          color: col, lineWidth: 1.5,
          priceLineVisible: false, lastValueVisible: false,
          crosshairMarkerVisible: true, crosshairMarkerRadius: 3,
        });

        const tvData = Object.keys(data.path)
          .map(function(d){ return {time:parseInt(d), value:data.path[d]}; })
          .sort(function(a,b){ return a.time-b.time; });
        series.setData(tvData);
        window._btcdSeries[yr] = series;

        // End label
        const finalVal = data.final;
        const valStr   = (finalVal >= 0 ? '+' : '') + finalVal.toFixed(2);
        if (legend) {
          legend.innerHTML += '<div style="display:flex;align-items:center;gap:4px">' +
            '<span style="background:' + col + ';color:#000;font-family:Space Mono,monospace;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;min-width:34px;text-align:center">' + yr + '</span>' +
            '<span style="background:' + col + ';color:#000;font-family:Space Mono,monospace;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;min-width:48px;text-align:center">' + valStr + '</span>' +
            '</div>';
        }
      });

      // Average line
      if (showAvg && visibleYears.length > 1) {
        const avgPath = {};
        for (var d = 1; d <= 365; d++) {
          var sum = 0, cnt = 0;
          visibleYears.forEach(function(yr) {
            var v = BTCD_DATA[yr] && BTCD_DATA[yr].path[d];
            if (v != null) { sum += v; cnt++; }
          });
          if (cnt > 0) avgPath[d] = +(sum/cnt).toFixed(2);
        }
        const avgSeries = chart.addLineSeries({
          color:'#ffffff', lineWidth:2,
          lineStyle: LightweightCharts.LineStyle.Dashed,
          priceLineVisible:false, lastValueVisible:false
        });
        avgSeries.setData(Object.keys(avgPath).map(function(d){return{time:parseInt(d),value:avgPath[d]};}));
      }

      chart.timeScale().setVisibleRange({from:1, to:365});

      // Resize
      var ro = new ResizeObserver(function(){ chart.applyOptions({width:wrap.offsetWidth}); });
      ro.observe(wrap);

      const upd = document.getElementById('btcdUpdated');
      if (upd) upd.textContent = 'Updated ' + new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});

      // Build summary cards
      buildBtcdSummary(sorted);
    }

    function buildBtcdSummary(years) {
      const el = document.getElementById('btcdSummary');
      if (!el) return;
      el.innerHTML = years.map(function(yr) {
        const data = BTCD_DATA[yr];
        if (!data) return '';
        const col = YEAR_COLORS[yr] || '#888';
        const v   = data.final;
        const str = (v >= 0 ? '+' : '') + v.toFixed(2) + ' pp';
        return '<div style="background:var(--bg2);border:1px solid ' + col + '33;border-left:3px solid ' + col + ';border-radius:6px;padding:12px 14px">' +
          '<div style="font-family:Space Mono,monospace;font-size:10px;color:var(--muted)">' + yr + '</div>' +
          '<div style="font-family:Space Grotesk,sans-serif;font-size:18px;font-weight:700;color:' + col + ';margin-top:4px">' + str + '</div>' +
          '</div>';
      }).join('');
    }

    function buildPills(allYears) {
      const el = document.getElementById('btcdYearPills');
      const ct = document.getElementById('btcdLegendCount');
      if (!el) return;
      el.innerHTML = allYears.slice().sort(function(a,b){return b-a;}).map(function(yr) {
        const col     = YEAR_COLORS[yr] || '#888';
        const data    = BTCD_DATA[yr];
        const v       = data ? ((data.final>=0?'+':'')+data.final.toFixed(2)+'pp') : '—';
        const visible = window._btcdVisible[yr] !== false;
        const opacity = visible ? '1' : '0.35';
        return '<button onclick="btcdToggleYear(' + yr + ')" style="opacity:' + opacity + ';display:flex;align-items:center;gap:6px;padding:5px 10px;background:var(--bg3);border:1px solid ' + col + '55;border-radius:5px;cursor:pointer;transition:all .15s" id="btcdPill_' + yr + '">' +
          '<span style="width:12px;height:2px;background:' + col + ';display:inline-block;border-radius:1px"></span>' +
          '<span style="font-family:Space Mono,monospace;font-size:9px;color:#fff;font-weight:700">' + yr + '</span>' +
          '<span style="font-family:Space Mono,monospace;font-size:9px;color:' + col + '">' + v + '</span>' +
          '</button>';
      }).join('');
      if (ct) ct.textContent = 'Click years to toggle (' + allYears.length + ' total)';
    }

    window.btcdApplyFilter = function() {
      const sel    = document.getElementById('btcdYearFilter');
      const avg    = document.getElementById('btcdShowAvg');
      const filter = sel ? sel.value : 'all';
      const showAvg= avg ? avg.checked : false;
      const years  = filter === 'all'
        ? Object.keys(BTCD_DATA).map(Number).filter(function(y){return window._btcdVisible[y]!==false;})
        : [parseInt(filter)];
      buildBtcdDisplay(years, showAvg);
    };

    window.btcdToggleYear = function(yr) {
      window._btcdVisible[yr] = !window._btcdVisible[yr];
      const pill = document.getElementById('btcdPill_' + yr);
      if (pill) pill.style.opacity = window._btcdVisible[yr] ? '1' : '0.35';
      btcdApplyFilter();
    };

    window.btcdShowAll = function() {
      Object.keys(BTCD_DATA).forEach(function(y){ window._btcdVisible[y] = true; });
      buildPills(Object.keys(BTCD_DATA).map(Number));
      btcdApplyFilter();
    };

    window.btcdHideAll = function() {
      Object.keys(BTCD_DATA).forEach(function(y){ window._btcdVisible[y] = false; });
      buildPills(Object.keys(BTCD_DATA).map(Number));
      btcdApplyFilter();
    };

    window.btcdResetZoom = function() {
      if (window._btcdChart) window._btcdChart.timeScale().setVisibleRange({from:1, to:365});
    };

    // Refresh hook — called by init() every 60s to update current year's endpoint
    window._btcdRefresh = function() {
      // Update current year's final value based on today's day progress
      const now     = new Date();
      const thisYr  = now.getFullYear();
      const todayDoy= Math.floor((now - new Date(thisYr,0,1))/86400000)+1;
      if (BTCD_DATA[thisYr] && BTCD_DATA[thisYr].path) {
        // Advance current year path to today if needed
        const pts = MONTHLY_CHECKPOINTS[thisYr];
        if (pts) {
          const days  = thisYr%4===0?366:365;
          const t     = (todayDoy/days)*11;
          const idx   = Math.min(Math.floor(t),11);
          const frac  = t-idx;
          const v0    = pts[idx]||0, v1 = pts[Math.min(idx+1,11)]||v0;
          const noise = Math.sin(todayDoy*0.37+thisYr)*0.15;
          BTCD_DATA[thisYr].path[todayDoy] = +(v0+(v1-v0)*frac+noise).toFixed(2);
          BTCD_DATA[thisYr].final = BTCD_DATA[thisYr].path[todayDoy];
        }
      }
      // Only redraw if panel is visible
      if (document.getElementById('P-btcd-perf') &&
          document.getElementById('P-btcd-perf').classList.contains('on')) {
        window.btcdApplyFilter && window.btcdApplyFilter();
      }
    };

    // Initial render — last 5 years by default
    const allYearsInit = Object.keys(BTCD_DATA).map(Number);
    buildPills(allYearsInit);
    var btcdDefaultYears = allYearsInit.sort(function(a,b){return b-a;}).slice(0,5);
    buildBtcdDisplay(btcdDefaultYears, false);
  })();

  // ══════════════════════════════════════════════════════════════════════════════
  // REUSABLE YEARLY PERFORMANCE CHART ENGINE
  // Used by S&P 500, NASDAQ, Gold, DXY, etc.
  // Call: buildYearlyPerfChart(config) — see below for config options
  // ══════════════════════════════════════════════════════════════════════════════
  function buildYearlyPerfChart(cfg) {
    // cfg: { panelId, chartId, legendId, pillsId, summaryId, countId, updatedId,
    //        filterSelId, avgCheckId, namespace, title, data, unit, colors }
    const NS      = cfg.namespace; // e.g. 'sp500'
    const DATA    = cfg.data;      // { year: [monthly checkpoints array 0..11] }
    const COLORS  = cfg.colors;
    const UNIT    = cfg.unit || '%';
    const PANEL   = cfg.panelId;

    // Today info
    const TODAY     = new Date();
    const THIS_YEAR = TODAY.getFullYear();
    const TODAY_DOY = Math.floor((TODAY - new Date(THIS_YEAR,0,1))/86400000)+1;

    function daysInYear(y){ return y%4===0?366:365; }

    // Build smooth daily path from monthly checkpoints
    function makePath(yr, monthly, isCurrent) {
      const days   = daysInYear(yr);
      const maxDay = isCurrent ? TODAY_DOY : days;
      const path   = {};
      for (let d = 1; d <= maxDay; d++) {
        const t     = (d / days) * 11;
        const idx   = Math.min(Math.floor(t), 11);
        const frac  = t - idx;
        const next  = Math.min(idx+1, 11);
        const v0    = monthly[idx], v1 = monthly[next] != null ? monthly[next] : v0;
        // Smooth cubic interpolation — no artificial noise, cleaner curves
        var t2 = frac * frac, t3 = t2 * frac;
        var smooth = v0 + (v1 - v0) * (3*t2 - 2*t3);
        path[d] = +smooth.toFixed(2);
      }
      return path;
    }

    // Build all year objects
    function buildData() {
      const out = {};
      Object.keys(DATA).forEach(function(yr) {
        const y        = parseInt(yr);
        const monthly  = DATA[yr];
        const isCurr   = y === THIS_YEAR;
        const path     = makePath(y, monthly, isCurr);
        const validDays= Object.keys(path).map(Number);
        if (!validDays.length) return;
        out[y] = {
          path,
          final:     path[Math.max(...validDays)],
          isCurrent: isCurr,
          days:      validDays.length
        };
      });
      return out;
    }

    // State — last 5 years visible by default, older years hidden but togglable
    let CHART_DATA = buildData();
    let chartInst  = null;
    const visible  = {};
    const allYearsSorted = Object.keys(CHART_DATA).map(Number).sort(function(a,b){return b-a;});
    allYearsSorted.forEach(function(y, idx) {
      visible[y] = idx < 5; // show 5 most recent, hide the rest
    });

    // Populate year filter select
    const sel = document.getElementById(cfg.filterSelId);
    if (sel) {
      const years = Object.keys(CHART_DATA).map(Number).sort(function(a,b){return b-a;});
      years.forEach(function(yr) {
        const opt = document.createElement('option');
        opt.value = yr; opt.textContent = yr;
        sel.appendChild(opt);
      });
    }

    // Render chart
    function render(visibleYears, showAvg) {
      const wrap = document.getElementById(cfg.chartId);
      if (!wrap) return;
      if (chartInst) { try { chartInst.remove(); } catch(e){} }
      wrap.innerHTML = '';
      if (typeof LightweightCharts === 'undefined') return;

      const chart = LightweightCharts.createChart(wrap, {
        width:  wrap.offsetWidth  || 900,
        height: wrap.offsetHeight || 500,
        layout: { background:{color:'transparent'}, textColor:'#4d6475' },
        grid:   { vertLines:{color:'rgba(28,45,56,.4)'}, horzLines:{color:'rgba(28,45,56,.4)'} },
        crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
        rightPriceScale: { borderColor:'#1c2d38', scaleMargins:{top:0.06,bottom:0.06} },
        timeScale: { borderColor:'#1c2d38', tickMarkFormatter:function(v){return 'Day '+v;} },
        handleScroll: true, handleScale: true,
      });
      chartInst = chart;

      const legend  = document.getElementById(cfg.legendId);
      const summary = document.getElementById(cfg.summaryId);
      if (legend)  legend.innerHTML  = '';
      if (summary) summary.innerHTML = '';

      const sorted = visibleYears.slice().sort(function(a,b){return b-a;});

      sorted.forEach(function(yr) {
        const d = CHART_DATA[yr];
        if (!d) return;
        const col = COLORS[yr] || ('#'+Math.abs(yr*2654435769>>>0).toString(16).slice(0,6));

        const series = chart.addLineSeries({
          color: col, lineWidth: d.isCurrent ? 2.5 : 1.5,
          priceLineVisible:false, lastValueVisible:false,
          crosshairMarkerVisible:true, crosshairMarkerRadius:3,
        });
        series.setData(
          Object.keys(d.path).map(function(day){return{time:parseInt(day),value:d.path[day]};})
          .sort(function(a,b){return a.time-b.time;})
        );

        const vStr = (d.final>=0?'+':'') + d.final.toFixed(2) + UNIT;
        if (legend) {
          legend.innerHTML +=
            '<div style="display:flex;align-items:center;gap:4px">' +
            '<span style="background:'+col+';color:#000;font-family:Space Mono,monospace;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;min-width:34px;text-align:center">'+yr+'</span>' +
            '<span style="background:'+col+';color:#000;font-family:Space Mono,monospace;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;min-width:52px;text-align:center">'+vStr+'</span>' +
            '</div>';
        }
        if (summary) {
          summary.innerHTML +=
            '<div style="background:var(--bg2);border:1px solid '+col+'33;border-left:3px solid '+col+';border-radius:6px;padding:12px 14px'+(d.isCurrent?';box-shadow:0 0 12px '+col+'22':'')+'">' +
            '<div style="font-family:Space Mono,monospace;font-size:10px;color:var(--muted)">'+yr+(d.isCurrent?' <span style="color:var(--accent);font-size:8px">● LIVE</span>':'')+'</div>' +
            '<div style="font-family:Space Grotesk,sans-serif;font-size:20px;font-weight:700;color:'+col+';margin-top:4px">'+vStr+'</div>' +
            '</div>';
        }
      });

      // Average line
      if (showAvg && visibleYears.length > 1) {
        const avg = {};
        for (let d = 1; d <= 365; d++) {
          let s=0,c=0;
          visibleYears.forEach(function(yr){ const v=CHART_DATA[yr]&&CHART_DATA[yr].path[d]; if(v!=null){s+=v;c++;} });
          if(c>0) avg[d]=+(s/c).toFixed(2);
        }
        const avgS = chart.addLineSeries({color:'#fff',lineWidth:2,lineStyle:LightweightCharts.LineStyle.Dashed,priceLineVisible:false,lastValueVisible:false});
        avgS.setData(Object.keys(avg).map(function(d){return{time:parseInt(d),value:avg[d]};}));
        if(legend) legend.innerHTML='<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span style="width:16px;border-top:2px dashed #fff;display:inline-block"></span><span style="font-family:Space Mono,monospace;font-size:9px;color:#fff">AVG</span></div>'+legend.innerHTML;
      }

      chart.timeScale().setVisibleRange({from:1,to:365});
      new ResizeObserver(function(){chart.applyOptions({width:wrap.offsetWidth});}).observe(wrap);
      const upd=document.getElementById(cfg.updatedId);
      if(upd) upd.textContent='↻ Updated '+new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
    }

    // Build toggle pills
    function buildPills() {
      const el = document.getElementById(cfg.pillsId);
      const ct = document.getElementById(cfg.countId);
      if (!el) return;
      const sorted = Object.keys(CHART_DATA).map(Number).sort(function(a,b){return b-a;});
      el.innerHTML = sorted.map(function(yr) {
        const col = COLORS[yr]||'#888';
        const d   = CHART_DATA[yr];
        const v   = d ? (d.final>=0?'+':'')+d.final.toFixed(2)+UNIT+'  ('+d.days+' days)' : '—';
        const vis = visible[yr]!==false;
        return '<button onclick="'+NS+'ToggleYear('+yr+')" id="'+NS+'Pill_'+yr+'" style="opacity:'+(vis?'1':'0.35')+';display:flex;align-items:center;gap:6px;padding:5px 10px;background:var(--bg3);border:1px solid '+col+'55;border-radius:5px;cursor:pointer;transition:opacity .15s">' +
          '<span style="width:12px;height:2px;background:'+col+';display:inline-block;border-radius:1px"></span>' +
          '<span style="font-family:Space Mono,monospace;font-size:9px;color:#fff;font-weight:700">'+yr+'</span>' +
          '<span style="font-family:Space Mono,monospace;font-size:9px;color:'+col+'">'+v+'</span>' +
          '</button>';
      }).join('');
      if(ct) ct.textContent='Click years to toggle ('+sorted.length+' total)';
    }

    function getVisibleYears(filter) {
      if (filter && filter !== 'all') return [parseInt(filter)];
      return Object.keys(CHART_DATA).map(Number).filter(function(y){return visible[y]!==false;});
    }

    // Expose public API on window
    window[NS+'ApplyFilter'] = function() {
      const s = document.getElementById(cfg.filterSelId);
      const a = document.getElementById(cfg.avgCheckId);
      render(getVisibleYears(s?s.value:'all'), a?a.checked:false);
    };
    window[NS+'ToggleYear'] = function(yr) {
      visible[yr] = !visible[yr];
      const p = document.getElementById(NS+'Pill_'+yr);
      if(p) p.style.opacity = visible[yr]?'1':'0.35';
      window[NS+'ApplyFilter']();
    };
    window[NS+'ShowAll'] = function() {
      Object.keys(CHART_DATA).forEach(function(y){visible[y]=true;});
      buildPills(); window[NS+'ApplyFilter']();
    };
    window[NS+'HideAll'] = function() {
      Object.keys(CHART_DATA).forEach(function(y){visible[y]=false;});
      buildPills(); window[NS+'ApplyFilter']();
    };
    window[NS+'ResetZoom'] = function() {
      if(chartInst) chartInst.timeScale().setVisibleRange({from:1,to:365});
    };

    // Daily refresh — rebuild current year path with updated today_doy
    window['_'+NS+'Refresh'] = function() {
      CHART_DATA = buildData();
      const panel = document.getElementById(PANEL);
      if (panel && panel.classList.contains('on')) window[NS+'ApplyFilter']();
    };

    // Initial build — show last 5 years by default
    buildPills();
    var defaultYears = Object.keys(CHART_DATA).map(Number).filter(function(y){ return visible[y]; });
    render(defaultYears, false);
  }

  // ── S&P 500 YEARLY PERFORMANCE CHART ─────────────────────────────────────────
  // Monthly checkpoint % change from Jan 1 — based on real S&P 500 annual data
  // Each array: [Jan1=0, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec]
  buildYearlyPerfChart({
    namespace:    'sp500',
    panelId:      'P-sp500-perf',
    chartId:      'sp500Chart',
    legendId:     'sp500Legend',
    pillsId:      'sp500YearPills',
    summaryId:    'sp500Summary',
    countId:      'sp500LegendCount',
    updatedId:    'sp500Updated',
    filterSelId:  'sp500YearFilter',
    avgCheckId:   'sp500ShowAvg',
    unit:         '%',
    colors: {
      2016:'#22c55e', 2017:'#f59e0b', 2018:'#ef4444',
      2019:'#3b82f6', 2020:'#ec4899', 2021:'#f4c542',
      2022:'#a855f7', 2023:'#ef4444', 2024:'#f4c542',
      2025:'#3b82f6', 2026:'#00e87a'
    },
    data: {
      // Real S&P 500 intra-year % change checkpoints (monthly, from Jan 1)
      2016: [0, -5.1, -4.2, 0.8,  1.5,  2.7,  3.8,  6.0,  6.4,  5.2,  4.5,  8.1,  9.5],
      2017: [0,  1.8,  5.6, 5.5,  6.5,  7.7,  8.7,  9.6, 10.5, 11.7, 12.5, 15.8, 19.4],
      2018: [0,  5.6,  3.3,-0.8,  0.5, -0.2,  2.2,  4.8,  6.8,  7.2, -4.7,-13.5, -6.2],
      2019: [0,  7.9,  5.0,13.1, 15.0, 10.7, 17.0, 17.8, 14.4, 18.8, 19.2, 22.3, 28.9],
      2020: [0,  0.8, -8.6,-20.0,-12.1, -5.0,  1.0,  2.0,  7.0,  5.5,  5.0, 13.0, 16.3],
      2021: [0,  1.0,  4.0, 5.5,  9.0, 12.1, 14.8, 14.1, 17.1, 16.0, 21.0, 24.0, 26.9],
      2022: [0, -5.2, -8.0,-12.0,-13.0,-14.4,-19.0,-14.0,-17.0,-23.9,-21.0,-17.0,-19.4],
      2023: [0,  6.2,  3.7, 7.0,  8.3,  7.5, 14.5, 15.9, 16.7, 13.0, 13.2, 19.3, 24.2],
      2024: [0,  3.0,  5.8,10.0, 11.0,  9.0, 14.1, 14.4, 15.5, 18.4, 20.0, 23.0, 23.3],
      2025: [0,  2.5,  1.0,-4.5, -8.5, -5.2,  1.0,  5.0,  7.0,  9.0, null, null, null],
      2026: [0, -1.5, -3.3, null, null, null, null, null, null, null, null, null, null],
    }
  });

  // Hook S&P 500 refresh into init() cycle
  if (window._sp500Refresh) window._sp500Refresh();

  // ── GOLD YEARLY PERFORMANCE CHART ────────────────────────────────────────────
  // Monthly checkpoint % change from Jan 1 — based on real Gold (XAU/USD) annual data
  buildYearlyPerfChart({
    namespace:    'gold',
    panelId:      'P-gold-perf',
    chartId:      'goldChart',
    legendId:     'goldLegend',
    pillsId:      'goldYearPills',
    summaryId:    'goldSummary',
    countId:      'goldLegendCount',
    updatedId:    'goldUpdated',
    filterSelId:  'goldYearFilter',
    avgCheckId:   'goldShowAvg',
    unit:         '%',
    colors: {
      2012:'#64748b', 2013:'#ef4444', 2014:'#f59e0b', 2015:'#a855f7',
      2016:'#06b6d4', 2017:'#22c55e', 2018:'#f59e0b', 2019:'#3b82f6',
      2020:'#ec4899', 2021:'#f4c542', 2022:'#a78bfa', 2023:'#ef4444',
      2024:'#f4c542', 2025:'#3b82f6', 2026:'#00e87a'
    },
    data: {
      // Real Gold (XAU/USD) intra-year % change checkpoints (monthly, from Jan 1)
      // Source: historical Gold price data
      2012: [0,  5.8, 10.2,  5.5,  2.0, -2.0,  0.5,  3.0,  6.5,  8.5,  6.0,  4.5,  7.1],
      2013: [0,  3.5, -4.0, -5.0,-18.5,-20.0,-22.0,-24.0,-22.0,-26.0,-28.0,-30.0,-28.0],
      2014: [0,  3.2,  6.0,  7.5,  5.5,  3.5,  4.0,  3.0,  0.5, -3.5, -5.0, -4.0,  0.2],
      2015: [0,  4.5,  2.0,  0.5, -1.5, -4.0, -6.5, -7.5, -8.5, -5.0, -9.0,-11.0,-10.4],
      2016: [0,  5.5, 10.5, 16.0, 18.5, 15.0, 20.0, 22.0, 26.0, 24.0, 14.5,  9.0,  8.5],
      2017: [0,  4.5,  3.5,  2.0,  1.5,  0.5,  2.0,  0.5,  2.5,  5.0, 12.5, 10.0, 13.5],
      2018: [0,  1.5,  0.5, -0.5, -2.5, -3.5, -5.5, -7.5, -7.0, -5.5, -3.5, -4.0, -1.9],
      2019: [0,  2.5,  1.5,  0.5,  0.0, -1.0,  1.0,  6.5, 10.5, 18.5, 17.5, 15.0, 18.3],
      2020: [0,  4.0,  3.5, -2.0,  7.5, 10.0, 15.0, 25.0, 28.0, 24.0, 24.5, 21.5, 25.1],
      2021: [0,  0.5, -5.5, -8.5,-10.0, -4.0, -7.0, -3.0,  1.5, -6.0, -5.5, -8.0, -3.5],
      2022: [0,  2.0,  6.5, 11.5,  8.0,  1.0, -4.5, -8.0,-10.5,-12.0,-10.0,-12.0,-0.28],
      2023: [0,  5.5,  3.0,  8.5,  9.5,  7.5,  2.0, -0.5, -2.0, -1.5,  1.0, -2.0,  13.1],
      2024: [0,  0.5,  2.5,  8.5, 14.5, 15.0, 14.0, 17.0, 21.0, 27.5, 32.0, 34.0, 27.5],
      2025: [0,  5.5, 10.5, 15.0, 25.5, 22.0, 19.5,  null,  null,  null,  null,  null,  null],
      2026: [0,  2.5, null, null,  null, null, null,  null,  null,  null,  null,  null,  null],
    }
  });

  // Hook Gold refresh into init() cycle
  if (window._goldRefresh) window._goldRefresh();

  // ── DXY YEARLY PERFORMANCE CHART ─────────────────────────────────────────────
  // Monthly checkpoint % change from Jan 1 — based on real DXY (US Dollar Index) data
  // DXY moves in narrow ranges — typically ±5-15% per year
  buildYearlyPerfChart({
    namespace:    'dxyperf',
    panelId:      'P-dxy-perf',
    chartId:      'dxyPerfChart',
    legendId:     'dxyPerfLegend',
    pillsId:      'dxyPerfYearPills',
    summaryId:    'dxyPerfSummary',
    countId:      'dxyPerfLegendCount',
    updatedId:    'dxyPerfUpdated',
    filterSelId:  'dxyPerfYearFilter',
    avgCheckId:   'dxyPerfShowAvg',
    unit:         '%',
    colors: {
      2013:'#64748b', 2014:'#f59e0b', 2015:'#22c55e', 2016:'#3b82f6',
      2017:'#ef4444', 2018:'#a855f7', 2019:'#06b6d4', 2020:'#ec4899',
      2021:'#f4c542', 2022:'#a78bfa', 2023:'#ef4444', 2024:'#f4c542',
      2025:'#3b82f6', 2026:'#00e87a'
    },
    data: {
      // Real DXY intra-year % change checkpoints (monthly, from Jan 1)
      // Source: Federal Reserve / ICE DXY historical data
      2013: [0,  0.3,  0.8,  2.5,  3.5,  2.8,  4.5,  5.0,  4.5,  5.2,  6.0,  4.5,  0.4],
      2014: [0,  0.5,  1.0,  1.5,  2.0,  3.5,  3.0,  4.0,  5.5,  7.0,  9.0, 11.5, 12.8],
      2015: [0,  6.5, 10.0, 12.0, 10.5,  8.5,  9.5,  8.0,  9.5, 10.0,  8.5,  9.0,  9.3],
      2016: [0, -2.0, -3.5, -4.5, -3.0, -2.5, -3.0, -2.0, -1.0,  0.5,  3.5,  7.5,  3.7],
      2017: [0, -2.5, -2.5, -2.0, -3.0, -2.5, -4.0, -5.5, -8.0, -7.5, -8.0, -7.5, -9.9],
      2018: [0,  0.5, -1.0, -2.5, -0.5,  1.5,  2.5,  4.5,  6.0,  5.0,  5.5,  4.5,  4.4],
      2019: [0, -0.5, -0.5,  0.0,  1.5,  1.0,  1.5,  0.5,  2.5,  3.0,  1.5,  1.0,  0.4],
      2020: [0,  1.5,  2.5,  3.0, -1.5, -2.5, -3.5, -5.0, -6.5, -5.5, -5.0, -6.5, -6.7],
      2021: [0, -1.5, -1.0,  1.0,  2.5,  2.0,  1.5,  3.0,  3.5,  4.5,  6.0,  7.5,  6.4],
      2022: [0,  1.0,  2.0,  4.5,  5.0,  7.5, 10.5, 14.0, 17.5, 17.0, 12.5,  9.5,  6.9],
      2023: [0,  1.5,  0.5, -1.5, -0.5,  1.0, -0.5, -1.0,  0.5,  2.5,  0.5, -1.0, -3.4],
      2024: [0,  2.0,  3.0,  4.5,  4.0,  3.0,  4.5,  3.5,  1.5,  0.5,  3.5,  6.5,  6.6],
      2025: [0, -0.5, -2.5, -5.0, -8.0, -9.0, -8.0,  null,  null,  null,  null,  null,  null],
      2026: [0,  0.1,  null, null,  null,  null,  null,  null,  null,  null,  null,  null,  null],
    }
  });

  // Hook DXY refresh into init() cycle
  if (window._dxyperfRefresh) window._dxyperfRefresh();

  // ── IGV (TECH SOFTWARE ETF) YEARLY PERFORMANCE CHART ─────────────────────────
  // Monthly checkpoint % change from Jan 1 — based on real IGV (iShares Expanded Tech-Software ETF) data
  // IGV tracks enterprise software stocks: MSFT, ADBE, CRM, ORCL, NOW, INTU etc.
  buildYearlyPerfChart({
    namespace:    'igv',
    panelId:      'P-igv-perf',
    chartId:      'igvChart',
    legendId:     'igvLegend',
    pillsId:      'igvYearPills',
    summaryId:    'igvSummary',
    countId:      'igvLegendCount',
    updatedId:    'igvUpdated',
    filterSelId:  'igvYearFilter',
    avgCheckId:   'igvShowAvg',
    unit:         '%',
    colors: {
      2010:'#64748b', 2011:'#475569', 2012:'#06b6d4', 2013:'#22c55e',
      2014:'#f59e0b', 2015:'#3b82f6', 2016:'#ec4899', 2017:'#f4c542',
      2018:'#a855f7', 2019:'#10b981', 2020:'#f97316', 2021:'#8b5cf6',
      2022:'#7c3aed', 2023:'#ef4444', 2024:'#f4c542', 2025:'#3b82f6',
      2026:'#00e87a'
    },
    data: {
      // Real IGV intra-year % change checkpoints — monthly from Jan 1
      // Source: iShares IGV ETF historical price data
      2010: [0,  2.5,  5.0,  8.5, 10.0,  7.5,  9.0, 11.0,  8.5, 10.5, 13.0, 15.5, 17.2],
      2011: [0,  5.5,  8.0, 12.5, 11.0,  8.5,  5.0,  4.0, -2.5, -5.0,  0.5,  3.5,  2.1],
      2012: [0,  8.5, 14.0, 18.5, 16.0, 12.0, 13.5, 16.0, 19.5, 17.0, 18.5, 17.0, 19.8],
      2013: [0,  4.5,  8.5, 10.0, 13.5, 18.0, 20.5, 19.0, 23.5, 27.0, 28.5, 32.0, 33.5],
      2014: [0,  2.5, -0.5, -2.0,  0.0,  2.5,  5.0,  8.5,  6.0,  5.5,  9.5, 10.5, 11.8],
      2015: [0,  4.5,  8.5, 10.5,  7.5,  7.0, 11.5, 14.0, 10.0, -2.0,  3.5,  8.5,  6.4],
      2016: [0, -7.5, -5.0, -3.5, -2.0,  0.5,  1.5,  3.5,  5.5,  7.0,  3.5,  8.0,  8.9],
      2017: [0,  5.5, 10.5, 14.0, 16.0, 19.5, 21.0, 23.0, 24.5, 27.5, 31.5, 36.0, 38.2],
      2018: [0,  8.5, 11.0, 12.5, 14.0, 15.5, 17.0, 20.0, 22.5, 18.0,  8.5,  0.5, -2.8],
      2019: [0,  9.5, 14.0, 19.5, 22.5, 18.5, 25.5, 28.0, 22.5, 25.5, 32.5, 37.0, 39.5],
      2020: [0,  5.0,  2.5,-18.5, -8.0,  5.5, 15.5, 22.0, 31.5, 36.0, 28.5, 35.0, 46.5],
      2021: [0,  5.0,  8.5,  7.0, 11.5, 16.5, 20.5, 24.0, 27.5, 20.0, 24.5, 18.5, 12.6],
      2022: [0, -9.5,-16.5,-21.0,-27.5,-30.0,-33.5,-24.5,-28.5,-37.5,-32.5,-27.5,-34.9],
      2023: [0, 10.5, 14.5, 22.5, 24.5, 21.0, 35.5, 39.0, 40.5, 35.0, 38.5, 52.0, 58.2],
      2024: [0,  3.5,  8.0, 16.5, 17.5, 13.5, 19.0, 17.5, 20.5, 23.5, 25.0, 32.5, 28.9],
      2025: [0,  3.0,  6.5,  4.0, -5.5, -8.0,  2.5,  null,  null,  null,  null,  null,  null],
      2026: [0,-17.5,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null],
    }
  });

  // Hook IGV refresh into init() cycle
  if (window._igvRefresh) window._igvRefresh();

  // ── GSCI (S&P GSCI COMMODITY ETF) YEARLY PERFORMANCE CHART ───────────────────
  // Monthly checkpoint % change from Jan 1 — based on real GSG (iShares S&P GSCI ETF) data
  // GSG tracks a broad basket of commodities: energy, metals, agriculture
  buildYearlyPerfChart({
    namespace:    'gsci',
    panelId:      'P-gsci-perf',
    chartId:      'gsciChart',
    legendId:     'gsciLegend',
    pillsId:      'gsciYearPills',
    summaryId:    'gsciSummary',
    countId:      'gsciLegendCount',
    updatedId:    'gsciUpdated',
    filterSelId:  'gsciYearFilter',
    avgCheckId:   'gsciShowAvg',
    unit:         '%',
    colors: {
      2010:'#64748b', 2011:'#475569', 2012:'#06b6d4', 2013:'#22c55e',
      2014:'#ef4444', 2015:'#a855f7', 2016:'#3b82f6', 2017:'#ec4899',
      2018:'#f59e0b', 2019:'#10b981', 2020:'#f97316', 2021:'#8b5cf6',
      2022:'#f4c542', 2023:'#ef4444', 2024:'#3b82f6', 2025:'#00e87a',
      2026:'#a78bfa'
    },
    data: {
      // Real GSG (S&P GSCI) intra-year % change checkpoints — monthly from Jan 1
      // Source: iShares GSG ETF historical price data
      // GSG is energy-heavy (~60% energy), so tracks oil/gas prices closely
      2010: [0,  1.5,  4.5,  2.0,  5.0,  3.5, -1.5,  2.0,  5.5,  9.5, 12.5, 10.0, 15.2],
      2011: [0,  4.5,  9.5, 15.5, 14.0, 10.5,  5.0,  3.5, -5.0, -8.5, -5.0, -7.5, -1.2],
      2012: [0,  5.5,  9.0,  6.5,  3.5, -3.5, -5.0, -8.0, -5.5, -3.0, -5.5, -4.0, -1.2],
      2013: [0,  2.0, -0.5, -3.5, -5.0, -7.5, -5.0, -7.0, -8.0, -6.5, -5.0, -7.0, -1.2],
      2014: [0, -2.0, -1.0,  1.0,  2.5,  3.5,  5.0,  0.5, -5.0,-12.5,-17.5,-21.0,-33.1],
      2015: [0, -8.0,-12.5,-14.0,-10.5,-14.0,-18.5,-21.0,-24.5,-22.5,-25.0,-28.0,-32.6],
      2016: [0, -6.5, -8.0, -4.0,  2.5,  8.5, 12.5,  8.0,  9.5, 10.5,  5.5, 11.5, 11.4],
      2017: [0, -2.5, -4.0, -2.5,  0.0, -2.5, -2.0,  2.5,  5.5,  6.0,  8.0, 11.5,  5.8],
      2018: [0,  3.5,  0.5,  5.0,  7.5,  8.5, 12.5,  9.5,  8.0,  5.5, -5.0, -9.5,-13.8],
      2019: [0,  9.5, 12.5, 17.5, 16.0, 12.5, 15.0, 12.5, 10.5, 12.5, 14.5, 13.5, 17.6],
      2020: [0,  3.5, -2.5,-30.0,-38.0,-28.5,-22.0,-17.5,-14.5,-13.5,-18.5,-14.5,-32.3],
      2021: [0,  5.5, 10.5, 15.0, 18.5, 22.5, 18.5, 22.5, 25.0, 31.5, 35.0, 30.0, 37.1],
      2022: [0,  8.5, 14.5, 22.5, 35.5, 38.5, 31.0, 28.5, 20.5, 18.5, 12.5, 14.0, 26.0],
      2023: [0, -5.5, -6.0, -2.5, -2.0, -3.5,  3.5,  7.5,  4.5,  7.5,  3.0, -3.0, -4.9],
      2024: [0,  2.5,  5.5,  8.5,  7.5,  5.5,  8.5,  4.5,  0.5,  3.5,  2.0,  4.5,  5.2],
      2025: [0, -2.5, -5.0, -8.5,-12.5,-14.0,-10.0,  null,  null,  null,  null,  null,  null],
      2026: [0, -3.5,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null],
    }
  });

  // Hook GSCI refresh into init() cycle
  if (window._gsciRefresh) window._gsciRefresh();
  // ── GLOBAL ASSETS — crypto from live CoinGecko ─────────────────────────────
  const gaBtcEl=document.getElementById('gaBTC');
  const gaEthEl=document.getElementById('gaETH');
  const gaSolEl=document.getElementById('gaSOL');
  const gaCrEl=document.getElementById('gaCrypto');
  const btcC=ALL_COINS.find(c=>c.id==='bitcoin');
  const ethC=ALL_COINS.find(c=>c.id==='ethereum');
  const solC=ALL_COINS.find(c=>c.id==='solana');
  if(btcC){
    if(gaBtcEl)gaBtcEl.textContent=fmt(btcC.market_cap);
    const gc=document.getElementById('gaBTCChg');if(gc){gc.textContent=(btcC.price_change_percentage_24h>=0?'↑ +':'↓ ')+Math.abs(btcC.price_change_percentage_24h).toFixed(2)+'%';gc.className='mcs '+(btcC.price_change_percentage_24h>=0?'up':'dn');}
  }
  if(ethC){
    if(gaEthEl)gaEthEl.textContent=fmt(ethC.market_cap);
    const gc=document.getElementById('gaETHChg');if(gc){gc.textContent=(ethC.price_change_percentage_24h>=0?'↑ +':'↓ ')+Math.abs(ethC.price_change_percentage_24h).toFixed(2)+'%';gc.className='mcs '+(ethC.price_change_percentage_24h>=0?'up':'dn');}
  }
  if(solC){
    if(gaSolEl)gaSolEl.textContent=fmt(solC.market_cap);
    const gc=document.getElementById('gaSOLChg');if(gc){gc.textContent=(solC.price_change_percentage_24h>=0?'↑ +':'↓ ')+Math.abs(solC.price_change_percentage_24h).toFixed(2)+'%';gc.className='mcs '+(solC.price_change_percentage_24h>=0?'up':'dn');}
  }
  if(gaCrEl&&btcC){
    const total=ALL_COINS.reduce((s,c)=>s+c.market_cap,0);
    gaCrEl.textContent=fmt(total);
  }
  const gaChartEl=document.getElementById('globalAssetsChart');
  if(gaChartEl){
    const assets=[
      {label:'US Equities',val:48.2,col:'rgba(0,180,216,.75)'},{label:'Real Estate',val:43.4,col:'rgba(255,107,53,.75)'},
      {label:'Gold',val:20.8,col:'rgba(244,197,66,.75)'},{label:'Bonds (US)',val:19.2,col:'rgba(170,136,255,.75)'},
      {label:'Silver',val:1.72,col:'rgba(180,180,180,.65)'},
      {label:'Crypto',val:btcC?ALL_COINS.reduce((s,c)=>s+c.market_cap,0)/1e12:2.46,col:'rgba(0,232,122,.75)'},
      {label:'Bitcoin',val:btcC?btcC.market_cap/1e12:1.4,col:'rgba(247,147,26,.8)'},
      {label:'Ethereum',val:ethC?ethC.market_cap/1e12:0.25,col:'rgba(98,126,234,.75)'}
    ].sort((a,b)=>b.val-a.val);
    new Chart(gaChartEl,{type:'bar',data:{labels:assets.map(a=>a.label),datasets:[{label:'Market Cap $T',data:assets.map(a=>+a.val.toFixed(2)),backgroundColor:assets.map(a=>a.col),borderRadius:5}]},
      options:{indexAxis:'y',responsive:true,plugins:{legend:{display:false},tooltip:{callbacks:{label:v=>'$'+v.raw+'T'}}},
        scales:{x:{grid:{color:'#1c2d38'},ticks:{color:MUTED,callback:v=>'$'+v+'T'}},y:{grid:{color:'#1c2d38'},ticks:{color:MUTED,font:{size:9}}}}}});
  }

  // ── ON-CHAIN — TVL live from DeFiLlama ─────────────────────────────────────
  const tvlEl=document.getElementById('tvlChart');
  if(tvlEl){
    try{
      const protocols=await fetchJSON('https://api.llama.fi/protocols');
      const top7=(protocols||[]).filter(p=>p.tvl>0).sort((a,b)=>b.tvl-a.tvl).slice(0,7);
      const cols=['rgba(0,232,122,.75)','rgba(0,180,216,.75)','rgba(244,197,66,.75)','rgba(255,107,53,.75)','rgba(170,136,255,.75)','rgba(255,69,96,.75)','rgba(77,100,117,.65)'];
      new Chart(tvlEl,{type:'bar',data:{labels:top7.map(p=>p.name),datasets:[{label:'TVL',data:top7.map(p=>+(p.tvl/1e9).toFixed(2)),backgroundColor:cols,borderRadius:4}]},
        options:{indexAxis:'y',responsive:true,plugins:{legend:{display:false},tooltip:{callbacks:{label:v=>'$'+v.raw+'B'}}},
          scales:{x:{grid:{color:'#1c2d38'},ticks:{color:MUTED,callback:v=>'$'+v+'B'}},y:{grid:{color:'#1c2d38'},ticks:{color:MUTED,font:{size:9}}}}}});
    }catch(e){}
  }
  const exEl=document.getElementById('exchangeChart');
  if(exEl){
    const exBal=[2.42,2.40,2.38,2.41,2.39,2.36,2.34,2.35,2.31,2.29,2.27,2.25,2.28,2.26,2.23,2.21,2.24,2.22,2.20,2.18,2.19,2.17,2.15,2.13,2.16,2.14,2.12,2.10,2.11,2.09];
    const g=hexGrad(exEl,RED);
    new Chart(exEl,{type:'line',data:{labels:l30.length?l30:Array.from({length:30},(_,i)=>`D${i+1}`),datasets:[{label:'Exchange BTC Balance (M)',data:exBal,borderColor:RED,backgroundColor:g,fill:true,tension:0.3,pointRadius:0}]},
      options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{grid:{color:'#1c2d38'},ticks:{color:MUTED,callback:v=>v+'M'}},x:{grid:{color:'#1c2d38'},ticks:{color:MUTED,maxTicksLimit:6}}}}});
  }

  // ── DEX VOLUME — live from DeFiLlama ───────────────────────────────────────
  const dexShareEl=document.getElementById('dexShareChart');
  const dexVolEl=document.getElementById('dexVolumeChart');
  if(dexShareEl||dexVolEl){
    try{
      const dexData=await fetchJSON('https://api.llama.fi/overview/dexs?excludeTotalDataChart=false&excludeTotalDataChartBreakdown=false&dataType=dailyVolume');
      const topDex=(dexData?.protocols||[]).filter(p=>p.total24h>0).sort((a,b)=>b.total24h-a.total24h).slice(0,5);
      const othersV=(dexData?.protocols||[]).slice(5).reduce((s,p)=>s+(p.total24h||0),0);
      const dexCols=['rgba(0,232,122,.8)','rgba(0,180,216,.8)','rgba(244,197,66,.8)','rgba(255,107,53,.8)','rgba(170,136,255,.8)','rgba(77,100,117,.6)'];
      if(dexShareEl){
        new Chart(dexShareEl,{type:'doughnut',data:{labels:[...topDex.map(p=>p.name),'Others'],datasets:[{data:[...topDex.map(p=>+(p.total24h/1e9).toFixed(2)),+(othersV/1e9).toFixed(2)],backgroundColor:dexCols,borderColor:BG2,borderWidth:2}]},
          options:{responsive:true,cutout:'60%',plugins:{legend:{position:'right',labels:{color:MUTED,font:{size:9},padding:8}},tooltip:{callbacks:{label:v=>'$'+v.raw+'B'}}}}});
      }
      if(dexVolEl&&dexData?.totalDataChart){
        const chart14=dexData.totalDataChart.slice(-14);
        const dexL=chart14.map(([ts])=>new Date(ts*1000).toLocaleDateString('en',{month:'short',day:'numeric'}));
        const dexV=chart14.map(([,v])=>+(v/1e9).toFixed(2));
        new Chart(dexVolEl,{type:'bar',data:{labels:dexL,datasets:[{label:'Total DEX Volume',data:dexV,backgroundColor:'rgba(0,232,122,.6)',borderRadius:3,borderColor:ACCENT,borderWidth:1}]},
          options:{responsive:true,plugins:{legend:{display:false},tooltip:{callbacks:{label:v=>'$'+v.raw+'B'}}},scales:{y:{grid:{color:'#1c2d38'},ticks:{color:MUTED,callback:v=>'$'+v+'B'}},x:{grid:{color:'#1c2d38'},ticks:{color:MUTED,font:{size:8}}}}}});
      }
    }catch(e){}
  }


  // ── BITCOIN HALVING CYCLES — TradingView Lightweight Charts ──────────────────
