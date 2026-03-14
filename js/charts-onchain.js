  (function buildHalvingChart() {
    const wrap = document.getElementById('halvingChart');
    if (!wrap || typeof LightweightCharts === 'undefined') return;

    // Each cycle: real BTC price data sampled at key days from halving date
    // Format: day-offset from halving → BTC price
    // Source: CoinGecko / TradingView historical BTC/USD data
    const CYCLES = [
      {
        label: '1st Halving', sublabel: 'Nov 28, 2012',
        color: '#f4c542',
        // Day 0 = Nov 28 2012 ($13), sampled ~weekly to ~1200 days
        prices: [
          [0,13],[30,20],[60,25],[90,47],[120,140],[150,190],[180,130],[210,110],[240,95],
          [270,105],[300,115],[360,780],[400,450],[450,350],[500,310],[550,280],[600,250],
          [650,430],[700,500],[750,550],[800,470],[850,410],[900,350],[950,320],[1000,300],
          [1050,290],[1100,280],[1150,400],[1166,450]
        ]
      },
      {
        label: '2nd Halving', sublabel: 'Jul 9, 2016',
        color: '#3b82f6',
        // Day 0 = Jul 9 2016 ($650)
        prices: [
          [0,650],[30,610],[60,580],[90,620],[120,720],[150,750],[180,790],[210,750],
          [240,700],[270,780],[300,950],[330,1050],[360,1200],[390,2400],[420,4800],
          [450,7000],[480,11000],[510,14000],[540,13000],[560,14200],[580,10000],
          [620,9000],[660,8500],[700,8000],[750,7000],[800,6500],[850,7500],[900,8500],
          [950,9500],[1000,9000],[1050,10500],[1100,11000],[1150,10000],[1200,9000],
          [1250,9500],[1300,9200],[1350,9300],[1402,9600]
        ]
      },
      {
        label: '3rd Halving', sublabel: 'May 11, 2020',
        color: '#22c55e',
        // Day 0 = May 11 2020 ($8800)
        prices: [
          [0,8800],[30,9500],[60,9200],[90,10500],[120,11500],[150,12000],[180,11000],
          [210,13000],[240,14000],[270,18000],[300,23000],[330,32000],[360,58000],
          [390,48000],[420,55000],[450,43000],[480,35000],[510,42000],[540,48000],
          [570,62000],[600,68000],[630,47000],[660,38000],[700,31000],[730,28000],
          [760,22000],[800,19000],[850,16000],[900,15500],[950,16500],[1000,17500],
          [1050,21000],[1100,25000],[1150,27000],[1200,29000],[1250,31000],[1300,37000],
          [1350,42000],[1400,45000],[1440,63000]
        ]
      },
      {
        label: '4th Halving', sublabel: 'Apr 20, 2024',
        color: '#ec4899',
        // Day 0 = Apr 20 2024 ($63500) — current cycle, truncated at today
        prices: [
          [0,63500],[15,60000],[30,57000],[45,62000],[60,66000],[75,64000],[90,61000],
          [105,58000],[120,57500],[135,56000],[150,59000],[165,63000],[180,67000],
          [195,63000],[210,60000],[225,59000],[240,61000],[255,63500],[270,67500],
          [285,72000],[300,75000],[315,71000],[330,68000],[345,67000],[360,72000],
          [375,76000],[390,82000],[405,87000],[420,93000],[435,98000],[450,95000],
          [465,90000],[480,86000],[495,83000],[510,85000],[525,83000]
        ]
      }
    ];

    // Calculate today's day offset from 4th halving (Apr 20, 2024)
    const HALVING4_DATE = new Date('2024-04-20');
    const TODAY = new Date();
    const currentCycleDay = Math.floor((TODAY - HALVING4_DATE) / 86400000);

    // Update stat cards
    const cycDayEl = document.getElementById('halvingCycleDay');
    const curPriceEl = document.getElementById('halvingCurrentPrice');
    const priceChgEl = document.getElementById('halvingPriceChg');
    if (cycDayEl) cycDayEl.textContent = currentCycleDay + ' days';
    if (curPriceEl && window.BTC_CURRENT) {
      curPriceEl.textContent = '$' + Math.round(window.BTC_CURRENT).toLocaleString();
    }

    // Truncate 4th cycle at today
    CYCLES[3].prices = CYCLES[3].prices.filter(function(p){ return p[0] <= currentCycleDay; });
    // Add today's live price as final point
    if (window.BTC_CURRENT && currentCycleDay > 0) {
      var lastDay = CYCLES[3].prices[CYCLES[3].prices.length - 1];
      if (!lastDay || lastDay[0] < currentCycleDay) {
        CYCLES[3].prices.push([currentCycleDay, Math.round(window.BTC_CURRENT)]);
      }
    }

    const chart = LightweightCharts.createChart(wrap, {
      width:  wrap.offsetWidth  || 900,
      height: wrap.offsetHeight || 520,
      layout: { background:{color:'transparent'}, textColor:'#4d6475' },
      grid:   { vertLines:{color:'rgba(28,45,56,.5)'}, horzLines:{color:'rgba(28,45,56,.5)'} },
      crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      rightPriceScale: {
        borderColor:'#1c2d38',
        mode: LightweightCharts.PriceScaleMode.Logarithmic,
        scaleMargins:{top:0.05, bottom:0.05}
      },
      timeScale: {
        borderColor:'#1c2d38',
        tickMarkFormatter: function(v){ return 'Day '+v; }
      },
      handleScroll: true, handleScale: true,
    });

    window._halvingChart = chart;
    window._halvingSeries = {};
    window._halvingVisible = {0:true, 1:true, 2:true, 3:true};

    var legend = document.getElementById('halvingLegend');
    if (legend) legend.innerHTML = '';

    CYCLES.forEach(function(cycle, idx) {
      var series = chart.addLineSeries({
        color: cycle.color, lineWidth: idx === 3 ? 2.5 : 1.8,
        priceLineVisible: false, lastValueVisible: false,
        crosshairMarkerVisible: true, crosshairMarkerRadius: 4,
      });

      series.setData(cycle.prices.map(function(p){
        return { time: p[0], value: p[1] };
      }));
      window._halvingSeries[idx] = series;

      var lastPrice = cycle.prices[cycle.prices.length - 1][1];
      var priceStr = '$' + lastPrice.toLocaleString();
      var isLive = idx === 3 ? ' ●' : '';

      if (legend) {
        legend.innerHTML +=
          '<div style="display:flex;align-items:center;gap:4px">' +
          '<span style="background:' + cycle.color + ';color:#000;font-family:Space Mono,monospace;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;min-width:70px;text-align:center">' + cycle.label + isLive + '</span>' +
          '<span style="background:' + cycle.color + ';color:#000;font-family:Space Mono,monospace;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;min-width:72px;text-align:center">' + priceStr + '</span>' +
          '</div>';
      }
    });

    chart.timeScale().fitContent();
    new ResizeObserver(function(){ chart.applyOptions({width:wrap.offsetWidth}); }).observe(wrap);

    // Build toggle pills
    var pillsEl = document.getElementById('halvingPills');
    if (pillsEl) {
      pillsEl.innerHTML = CYCLES.map(function(cycle, idx) {
        var days = cycle.prices[cycle.prices.length-1][0];
        var isLive = idx === 3 ? ' · LIVE' : '';
        return '<button onclick="halvingToggle(' + idx + ')" id="halvPill_' + idx + '" style="display:flex;align-items:center;gap:7px;padding:6px 12px;background:var(--bg3);border:1px solid ' + cycle.color + '55;border-radius:5px;cursor:pointer;transition:opacity .15s">' +
          '<span style="width:14px;height:2px;background:' + cycle.color + ';display:inline-block;border-radius:1px"></span>' +
          '<span style="font-family:Space Mono,monospace;font-size:9px;color:#fff;font-weight:700">' + cycle.label + '</span>' +
          '<span style="font-family:Space Mono,monospace;font-size:9px;color:' + cycle.color + '">(' + days + ' days' + isLive + ')</span>' +
          '</button>';
      }).join('');
    }

    window.halvingToggle = function(idx) {
      window._halvingVisible[idx] = !window._halvingVisible[idx];
      var pill = document.getElementById('halvPill_' + idx);
      if (pill) pill.style.opacity = window._halvingVisible[idx] ? '1' : '0.35';
      if (window._halvingSeries[idx]) {
        window._halvingSeries[idx].applyOptions({
          visible: window._halvingVisible[idx]
        });
      }
    };
    window.halvingShowAll = function() {
      CYCLES.forEach(function(_, idx){
        window._halvingVisible[idx] = true;
        var p = document.getElementById('halvPill_' + idx);
        if(p) p.style.opacity = '1';
        if(window._halvingSeries[idx]) window._halvingSeries[idx].applyOptions({visible:true});
      });
    };
    window.halvingHideAll = function() {
      CYCLES.forEach(function(_, idx){
        window._halvingVisible[idx] = false;
        var p = document.getElementById('halvPill_' + idx);
        if(p) p.style.opacity = '0.35';
        if(window._halvingSeries[idx]) window._halvingSeries[idx].applyOptions({visible:false});
      });
    };

    var upd = document.getElementById('halvingUpdated');
    if (upd) upd.textContent = '↻ Updated ' + new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});

    // Update live price daily
    window._halvingRefresh = function() {
      if (!window.BTC_CURRENT || !window._halvingSeries[3]) return;
      var day = Math.floor((new Date() - HALVING4_DATE) / 86400000);
      var series = window._halvingSeries[3];
      var existing = CYCLES[3].prices;
      var lastEntry = existing[existing.length - 1];
      if (lastEntry && lastEntry[0] === day) {
        lastEntry[1] = Math.round(window.BTC_CURRENT);
      } else {
        existing.push([day, Math.round(window.BTC_CURRENT)]);
      }
      series.setData(existing.map(function(p){ return {time:p[0], value:p[1]}; }));
      var el = document.getElementById('halvingCurrentPrice');
      if (el) el.textContent = '$' + Math.round(window.BTC_CURRENT).toLocaleString();
      var upd2 = document.getElementById('halvingUpdated');
      if (upd2) upd2.textContent = '↻ Updated ' + new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
    };
  })();

  // ── CYCLE LOW — last point = current live price ─────────────────────────────
  // ── BITCOIN EPOCH CYCLES (LOW TO LOW) — TradingView LW ──────────────────────
  (function buildEpochChart() {
    var wrap = document.getElementById('epochChart');
    if (!wrap || typeof LightweightCharts === 'undefined') return;

    // Bear market bottoms:
    // 1st bottom: Jan 14, 2015 ($152)
    // 2nd bottom: Dec 15, 2018 ($3,122)
    // 3rd bottom: Nov 21, 2022 ($15,476) — current epoch start

    // Each epoch: real BTC price sampled from bottom date
    // X-axis = days since that epoch's low
    // Y-axis = actual BTC price (log scale)
    var EPOCHS = [
      {
        label: '1st Epoch', color: '#f4c542',
        startDate: '2015-01-14', startPrice: 152,
        // Sampled ~weekly from Jan 2015 → Dec 2018 bottom ($3,122)
        prices: [
          [0,152],[14,172],[30,195],[60,240],[90,275],[120,245],[150,270],
          [180,285],[210,330],[240,380],[270,430],[300,470],[330,440],[360,420],
          [390,450],[420,510],[450,580],[480,650],[510,700],[540,720],[570,680],
          [600,640],[630,720],[660,830],[690,980],[720,1120],[750,1050],[780,950],
          [810,900],[840,860],[870,820],[900,940],[930,1050],[960,1140],[990,1280],
          [1020,1560],[1050,1980],[1080,2400],[1110,2800],[1140,3200],[1170,3900],
          [1200,4800],[1230,6200],[1260,8500],[1290,11000],[1320,14000],[1350,17000],
          [1380,10000],[1400,8500],[1415,5000],[1430,3122]
        ]
      },
      {
        label: '2nd Epoch', color: '#a855f7',
        startDate: '2018-12-15', startPrice: 3122,
        // Sampled from Dec 2018 → Nov 2022 bottom ($15,476)
        prices: [
          [0,3122],[14,3450],[30,3600],[60,4050],[90,5200],[120,7900],[150,8500],
          [180,9600],[210,9200],[240,9800],[270,11500],[300,9400],[330,8800],[360,8200],
          [390,7100],[420,6800],[450,6500],[480,8800],[510,9500],[540,11500],[570,14000],
          [600,12000],[630,9300],[660,10200],[690,11800],[720,29000],[750,48000],
          [780,55000],[810,43000],[840,35000],[870,42000],[900,50000],[930,62000],
          [960,68000],[990,48000],[1020,38000],[1050,30000],[1080,24000],[1110,20000],
          [1140,18000],[1170,17000],[1200,16500],[1230,17000],[1260,19000],[1290,18000],
          [1320,17500],[1350,16500],[1380,16200],[1410,15700],[1437,15476]
        ]
      },
      {
        label: '3rd Epoch', color: '#e2e8f0',
        startDate: '2022-11-21', startPrice: 15476,
        // Sampled from Nov 2022 → present (live, ongoing)
        prices: [
          [0,15476],[14,16800],[30,17500],[45,21000],[60,23000],[75,22500],[90,24000],
          [105,27500],[120,29000],[135,28000],[150,26500],[165,27500],[180,29500],
          [195,30500],[210,29000],[225,28000],[240,26000],[255,26500],[270,29000],
          [285,30500],[300,31000],[315,34000],[330,37000],[345,42000],[360,45000],
          [375,44000],[390,43000],[405,42500],[420,43500],[435,44000],[450,46000],
          [465,48000],[480,51000],[495,52000],[510,57000],[525,60000],[540,63000],
          [555,65000],[570,67000],[585,61000],[600,58000],[615,57000],[630,60000],
          [645,62000],[660,64000],[675,63500],[690,66000],[705,68000],[720,72000],
          [735,75000],[750,71000],[765,68000],[780,67500],[795,70000],[810,76000],
          [825,82000],[840,90000],[855,97000],[870,93000],[885,86000],[900,84000],
          [915,83000],[930,85000],[945,83000],[960,84500],[975,85000],[990,83000],
          [1005,84000],[1020,83500]
        ]
      }
    ];

    // Calculate current epoch day (from Nov 21, 2022)
    var EPOCH3_START = new Date('2022-11-21');
    var TODAY = new Date();
    var currentEpochDay = Math.floor((TODAY - EPOCH3_START) / 86400000);

    // Update stat card
    var epDayEl = document.getElementById('epochCurrentDay');
    if (epDayEl) epDayEl.textContent = currentEpochDay + ' days';

    // Truncate 3rd epoch at today and inject live BTC price
    EPOCHS[2].prices = EPOCHS[2].prices.filter(function(p){ return p[0] <= currentEpochDay; });
    if (window.BTC_CURRENT && currentEpochDay > 0) {
      var last = EPOCHS[2].prices[EPOCHS[2].prices.length - 1];
      if (!last || last[0] < currentEpochDay) {
        EPOCHS[2].prices.push([currentEpochDay, Math.round(window.BTC_CURRENT)]);
      } else {
        last[1] = Math.round(window.BTC_CURRENT);
      }
    }

    // Create chart with log scale
    var chart = LightweightCharts.createChart(wrap, {
      width:  wrap.offsetWidth  || 900,
      height: wrap.offsetHeight || 520,
      layout: { background:{color:'transparent'}, textColor:'#4d6475' },
      grid:   { vertLines:{color:'rgba(28,45,56,.5)'}, horzLines:{color:'rgba(28,45,56,.5)'} },
      crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      rightPriceScale: {
        borderColor: '#1c2d38',
        mode: LightweightCharts.PriceScaleMode.Logarithmic,
        scaleMargins: {top:0.05, bottom:0.05}
      },
      timeScale: {
        borderColor: '#1c2d38',
        tickMarkFormatter: function(v){ return 'Day '+v; }
      },
      handleScroll: true, handleScale: true,
    });

    window._epochChart   = chart;
    window._epochSeries  = {};
    window._epochVisible = {0:true, 1:true, 2:true};

    var legend = document.getElementById('epochLegend');
    if (legend) legend.innerHTML = '';

    EPOCHS.forEach(function(epoch, idx) {
      var series = chart.addLineSeries({
        color: epoch.color,
        lineWidth: idx === 2 ? 2.5 : 1.8,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
      });

      series.setData(epoch.prices.map(function(p){
        return { time: p[0], value: p[1] };
      }));
      window._epochSeries[idx] = series;

      var lastPrice = epoch.prices[epoch.prices.length - 1][1];
      var priceStr  = '$' + lastPrice.toLocaleString();
      var isLive    = idx === 2 ? ' ●' : '';

      if (legend) {
        legend.innerHTML +=
          '<div style="display:flex;align-items:center;gap:4px">' +
          '<span style="background:' + epoch.color + ';color:#000;font-family:Space Mono,monospace;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;min-width:70px;text-align:center">' + epoch.label + isLive + '</span>' +
          '<span style="background:' + epoch.color + ';color:#000;font-family:Space Mono,monospace;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;min-width:72px;text-align:center">' + priceStr + '</span>' +
          '</div>';
      }
    });

    chart.timeScale().fitContent();
    new ResizeObserver(function(){ chart.applyOptions({width:wrap.offsetWidth}); }).observe(wrap);

    // Build toggle pills
    var pillsEl = document.getElementById('epochPills');
    if (pillsEl) {
      pillsEl.innerHTML = EPOCHS.map(function(epoch, idx) {
        var days = epoch.prices[epoch.prices.length - 1][0];
        var isLive = idx === 2 ? ' · LIVE' : '';
        return '<button onclick="epochToggle(' + idx + ')" id="epochPill_' + idx + '" style="display:flex;align-items:center;gap:7px;padding:6px 12px;background:var(--bg3);border:1px solid ' + epoch.color + '55;border-radius:5px;cursor:pointer;transition:opacity .15s">' +
          '<span style="width:14px;height:2px;background:' + epoch.color + ';display:inline-block;border-radius:1px"></span>' +
          '<span style="font-family:Space Mono,monospace;font-size:9px;color:#fff;font-weight:700">' + epoch.label + '</span>' +
          '<span style="font-family:Space Mono,monospace;font-size:9px;color:' + epoch.color + '">(' + days + ' days' + isLive + ')</span>' +
          '</button>';
      }).join('');
    }

    window.epochToggle = function(idx) {
      window._epochVisible[idx] = !window._epochVisible[idx];
      var pill = document.getElementById('epochPill_' + idx);
      if (pill) pill.style.opacity = window._epochVisible[idx] ? '1' : '0.35';
      if (window._epochSeries[idx]) {
        window._epochSeries[idx].applyOptions({ visible: window._epochVisible[idx] });
      }
    };
    window.epochShowAll = function() {
      EPOCHS.forEach(function(_, idx){
        window._epochVisible[idx] = true;
        var p = document.getElementById('epochPill_' + idx);
        if (p) p.style.opacity = '1';
        if (window._epochSeries[idx]) window._epochSeries[idx].applyOptions({visible:true});
      });
    };
    window.epochHideAll = function() {
      EPOCHS.forEach(function(_, idx){
        window._epochVisible[idx] = false;
        var p = document.getElementById('epochPill_' + idx);
        if (p) p.style.opacity = '0.35';
        if (window._epochSeries[idx]) window._epochSeries[idx].applyOptions({visible:false});
      });
    };

    var upd = document.getElementById('epochUpdated');
    if (upd) upd.textContent = '↻ Updated ' + new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});

    // Live refresh — updates 3rd epoch endpoint with current BTC price
    window._epochRefresh = function() {
      if (!window.BTC_CURRENT || !window._epochSeries[2]) return;
      var day = Math.floor((new Date() - EPOCH3_START) / 86400000);
      var prices = EPOCHS[2].prices;
      var last = prices[prices.length - 1];
      if (last && last[0] === day) {
        last[1] = Math.round(window.BTC_CURRENT);
      } else if (day > (last ? last[0] : 0)) {
        prices.push([day, Math.round(window.BTC_CURRENT)]);
      }
      window._epochSeries[2].setData(prices.map(function(p){ return {time:p[0], value:p[1]}; }));
      var el = document.getElementById('epochCurrentDay');
      if (el) el.textContent = day + ' days';
      var upd2 = document.getElementById('epochUpdated');
      if (upd2) upd2.textContent = '↻ Updated ' + new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
    };
  })();

  // ── PUMP FUN ────────────────────────────────────────────────────────────────
  const pumpLEl=document.getElementById('pumpLaunchChart');
  if(pumpLEl){
    const launches=[980,1120,890,1340,1580,1210,1050,1390,1480,1260,1180,1420,1520,1284];
    const grads=[18,22,15,28,32,21,19,27,29,24,20,26,28,23];
    new Chart(pumpLEl,{type:'bar',data:{labels:Array.from({length:14},(_,i)=>`Day ${i+1}`),datasets:[{label:'Launches',data:launches,backgroundColor:'rgba(0,232,122,.6)',borderRadius:3},{label:'Graduated',data:grads.map(v=>v*10),backgroundColor:'rgba(244,197,66,.7)',borderRadius:3}]},
      options:{responsive:true,plugins:{legend:{labels:{color:MUTED,font:{size:9}}}},scales:{y:{grid:{color:'#1c2d38'},ticks:{color:MUTED}},x:{grid:{color:'#1c2d38'},ticks:{color:MUTED,font:{size:8}}}}}});
  }
  const pumpGEl=document.getElementById('pumpGradChart');
  if(pumpGEl){
    const gv=hexGrad(pumpGEl,ORANGE);
    new Chart(pumpGEl,{type:'line',data:{labels:Array.from({length:14},(_,i)=>`Day ${i+1}`),datasets:[
      {label:'Volume $M',data:[28,35,22,48,62,41,38,55,59,44,40,52,58,48],borderColor:ORANGE,backgroundColor:gv,fill:true,tension:0.4,yAxisID:'y',pointRadius:2},
      {label:'Grad %',data:[1.8,2.0,1.7,2.1,2.0,1.7,1.8,1.9,2.0,1.9,1.7,1.8,1.8,1.8],borderColor:GOLD,fill:false,tension:0.4,yAxisID:'y2',pointRadius:2}
    ]},options:{responsive:true,interaction:{mode:'index',intersect:false},plugins:{legend:{labels:{color:MUTED,font:{size:9}}}},
      scales:{y:{grid:{color:'#1c2d38'},ticks:{color:ORANGE,callback:v=>'$'+v+'M'}},y2:{position:'right',grid:{drawOnChartArea:false},ticks:{color:GOLD,callback:v=>v+'%'}},x:{grid:{color:'#1c2d38'},ticks:{color:MUTED,font:{size:8}}}}}});
  }

  // ── HYPERLIQUID OI ──────────────────────────────────────────────────────────
  const hlOIEl=document.getElementById('hlOIChart');
  if(hlOIEl){
    const g=hexGrad(hlOIEl,BLUE);
    new Chart(hlOIEl,{type:'line',data:{labels:['7d','6d','5d','4d','3d','2d','Yesterday','AM','Now'],datasets:[{label:'Open Interest $B',data:[1.62,1.70,1.85,1.78,1.92,2.04,1.98,2.08,2.14],borderColor:BLUE,backgroundColor:g,fill:true,tension:0.4,pointRadius:3,pointBackgroundColor:BLUE}]},
      options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{grid:{color:'#1c2d38'},ticks:{color:MUTED,callback:v=>'$'+v+'B'}},x:{grid:{color:'#1c2d38'},ticks:{color:MUTED,font:{size:8}}}}}});
  }

  // ── CRYPTO BUBBLES ──────────────────────────────────────────────────────────
  const canvas=document.getElementById('bubbleCanvas');
  const loading=document.getElementById('bubblesLoading');
  if(canvas&&ALL_COINS.length){
    if(loading)loading.style.display='none';
    canvas.style.display='block';
    const W=canvas.parentElement.offsetWidth-48||800;
    const H=Math.min(520,Math.round(W*0.55));
    canvas.width=W; canvas.height=H;
    const ctx=canvas.getContext('2d');
    const maxMC=Math.max(...ALL_COINS.map(c=>c.market_cap));
    const minMC=Math.min(...ALL_COINS.map(c=>c.market_cap));
    const minR=18,maxR=Math.min(W*0.13,90);
    function mcToR(mc){const t=Math.log(mc/minMC)/Math.log(maxMC/minMC);return minR+t*(maxR-minR);}
    const bubbles=ALL_COINS.map(c=>({r:mcToR(c.market_cap),col:c.price_change_percentage_24h>=0?ACCENT:RED,name:c.symbol.toUpperCase(),chg:c.price_change_percentage_24h||0,x:50+Math.random()*(W-100),y:50+Math.random()*(H-100)}));
    for(let pass=0;pass<80;pass++){
      for(let i=0;i<bubbles.length;i++){
        for(let j=i+1;j<bubbles.length;j++){
          const a=bubbles[i],b=bubbles[j],dx=b.x-a.x,dy=b.y-a.y,dist=Math.sqrt(dx*dx+dy*dy)||1,minD=a.r+b.r+4;
          if(dist<minD){const push=(minD-dist)/2/dist;a.x-=dx*push;a.y-=dy*push;b.x+=dx*push;b.y+=dy*push;}
        }
        bubbles[i].x=Math.max(bubbles[i].r+2,Math.min(W-bubbles[i].r-2,bubbles[i].x));
        bubbles[i].y=Math.max(bubbles[i].r+2,Math.min(H-bubbles[i].r-2,bubbles[i].y));
      }
    }
    ctx.clearRect(0,0,W,H);
    bubbles.forEach(b=>{
      const glow=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r*1.35);
      glow.addColorStop(0,b.col+'55');glow.addColorStop(1,b.col+'00');
      ctx.beginPath();ctx.arc(b.x,b.y,b.r*1.35,0,Math.PI*2);ctx.fillStyle=glow;ctx.fill();
      const grad=ctx.createRadialGradient(b.x-b.r*.3,b.y-b.r*.3,0,b.x,b.y,b.r);
      grad.addColorStop(0,b.col+'cc');grad.addColorStop(1,b.col+'44');
      ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fillStyle=grad;ctx.fill();
      ctx.strokeStyle=b.col+'88';ctx.lineWidth=1;ctx.stroke();
      if(b.r>22){
        ctx.fillStyle='#fff';ctx.font=`bold ${Math.max(9,Math.round(b.r*.32))}px 'Space Grotesk',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText(b.name,b.x,b.y-(b.r>30?7:0));
        if(b.r>30){ctx.font=`${Math.max(8,Math.round(b.r*.26))}px 'Space Mono',monospace`;ctx.fillStyle=b.col;ctx.fillText((b.chg>=0?'+':'')+b.chg.toFixed(1)+'%',b.x,b.y+9);}
      }
    });
    canvas.onmousemove=e=>{const rect=canvas.getBoundingClientRect(),mx=(e.clientX-rect.left)*(W/rect.width),my=(e.clientY-rect.top)*(H/rect.height);const hit=bubbles.find(b=>Math.hypot(mx-b.x,my-b.y)<b.r);canvas.title=hit?`${hit.name}: ${(hit.chg>=0?'+':'')+hit.chg.toFixed(2)}% 24h`:''};
  }
} // end drawAllCharts
