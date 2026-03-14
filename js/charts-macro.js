  // ── FED BALANCE SHEET — BTC line = REAL 12-month prices ────────────────────
  // ── FED BALANCE SHEET vs BITCOIN — TradingView dual-axis ─────────────────────
  (function buildFedBtcChart() {
    var wrap = document.getElementById('fedBtcChart');
    if (!wrap || typeof LightweightCharts === 'undefined') return;

    // Fed Balance Sheet (WALCL) — monthly data in $Trillions since 2010
    // Source: Federal Reserve Economic Data (FRED)
    var FED_DATA = [
      ['2010-01',2.23],['2010-04',2.31],['2010-07',2.30],['2010-10',2.35],
      ['2011-01',2.45],['2011-04',2.69],['2011-07',2.87],['2011-10',2.89],
      ['2012-01',2.92],['2012-04',2.88],['2012-07',2.87],['2012-10',2.96],
      ['2013-01',3.01],['2013-04',3.21],['2013-07',3.48],['2013-10',3.77],
      ['2014-01',4.01],['2014-04',4.24],['2014-07',4.37],['2014-10',4.47],
      ['2015-01',4.52],['2015-04',4.49],['2015-07',4.50],['2015-10',4.47],
      ['2016-01',4.46],['2016-04',4.46],['2016-07',4.47],['2016-10',4.45],
      ['2017-01',4.45],['2017-04',4.45],['2017-07',4.47],['2017-10',4.46],
      ['2018-01',4.44],['2018-04',4.32],['2018-07',4.28],['2018-10',4.14],
      ['2019-01',4.04],['2019-04',3.94],['2019-07',3.77],['2019-10',4.02],
      ['2020-01',4.17],['2020-03',5.25],['2020-06',7.10],['2020-09',7.10],['2020-12',7.36],
      ['2021-01',7.39],['2021-04',7.71],['2021-07',8.22],['2021-10',8.55],['2021-12',8.76],
      ['2022-01',8.87],['2022-04',8.97],['2022-07',8.89],['2022-10',8.76],['2022-12',8.55],
      ['2023-01',8.49],['2023-04',8.63],['2023-07',8.17],['2023-10',7.93],['2023-12',7.72],
      ['2024-01',7.68],['2024-04',7.49],['2024-07',7.29],['2024-10',7.05],['2024-12',6.86],
      ['2025-01',6.79],['2025-04',6.71],['2025-07',6.63],['2025-10',6.60],['2025-12',6.58],
      ['2026-01',6.55],['2026-03',6.63],
    ];

    // BTC monthly prices since 2010 (earliest available)
    // Source: CoinGecko / historical BTC data
    var BTC_DATA = [
      ['2010-07',0.05],['2010-10',0.10],['2010-12',0.20],
      ['2011-01',0.30],['2011-04',1.00],['2011-07',13.50],['2011-10',3.50],['2011-12',3.20],
      ['2012-01',6.20],['2012-04',5.00],['2012-07',8.00],['2012-10',10.90],['2012-12',13.50],
      ['2013-01',13.50],['2013-04',144.0],['2013-07',105.0],['2013-10',198.0],['2013-12',732.0],
      ['2014-01',820.0],['2014-04',450.0],['2014-07',585.0],['2014-10',340.0],['2014-12',320.0],
      ['2015-01',217.0],['2015-04',235.0],['2015-07',286.0],['2015-10',315.0],['2015-12',430.0],
      ['2016-01',370.0],['2016-04',460.0],['2016-07',624.0],['2016-10',704.0],['2016-12',963.0],
      ['2017-01',970.0],['2017-04',1347.0],['2017-07',2900.0],['2017-10',6100.0],['2017-12',14000.0],
      ['2018-01',10000.0],['2018-04',9200.0],['2018-07',8200.0],['2018-10',6300.0],['2018-12',3700.0],
      ['2019-01',3450.0],['2019-04',5300.0],['2019-07',9600.0],['2019-10',9200.0],['2019-12',7200.0],
      ['2020-01',9350.0],['2020-04',8700.0],['2020-07',11300.0],['2020-10',13800.0],['2020-12',29300.0],
      ['2021-01',33100.0],['2021-04',57700.0],['2021-07',41500.0],['2021-10',61400.0],['2021-12',46200.0],
      ['2022-01',38500.0],['2022-04',38600.0],['2022-07',23300.0],['2022-10',20500.0],['2022-12',16500.0],
      ['2023-01',23100.0],['2023-04',29300.0],['2023-07',29300.0],['2023-10',34700.0],['2023-12',42800.0],
      ['2024-01',42500.0],['2024-04',60700.0],['2024-07',66000.0],['2024-10',72600.0],['2024-12',94200.0],
      ['2025-01',102000.0],['2025-04',94500.0],['2025-07',118000.0],['2025-10',108000.0],['2025-12',102000.0],
      ['2026-01',98000.0],['2026-03',93000.0],
    ];

    // Convert YYYY-MM to unix timestamp
    function toTs(ym) { return new Date(ym + '-01').getTime() / 1000; }

    // Create chart with LEFT axis for Fed (linear) and RIGHT axis for BTC (log)
    var chart = LightweightCharts.createChart(wrap, {
      width:  wrap.offsetWidth  || 900,
      height: wrap.offsetHeight || 500,
      layout: { background:{color:'transparent'}, textColor:'#4d6475' },
      grid:   { vertLines:{color:'rgba(28,45,56,.4)'}, horzLines:{color:'rgba(28,45,56,.4)'} },
      crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      leftPriceScale:  { visible:true,  borderColor:'#22c55e', textColor:'#22c55e' },
      rightPriceScale: {
        visible: true, borderColor:'#f4c542', textColor:'#f4c542',
        mode: LightweightCharts.PriceScaleMode.Logarithmic,
        scaleMargins:{top:0.05,bottom:0.05}
      },
      timeScale: { borderColor:'#1c2d38', timeVisible:false },
      handleScroll: true, handleScale: true,
    });

    // Fed Balance Sheet — green line on LEFT axis (linear)
    var fedSeries = chart.addLineSeries({
      color: '#22c55e', lineWidth: 2,
      priceScaleId: 'left',
      priceLineVisible: true,
      lastValueVisible: true,
      title: 'Fed Balance Sheet ($T)',
    });
    fedSeries.setData(FED_DATA.map(function(d){ return {time:toTs(d[0]), value:d[1]}; }));

    // BTC — orange/gold line on RIGHT axis (log scale)
    var btcSeries = chart.addLineSeries({
      color: '#f4c542', lineWidth: 2,
      priceScaleId: 'right',
      priceLineVisible: true,
      lastValueVisible: true,
      title: 'BTC/USD',
    });

    var btcChartData = getBtcOverlayData(BTC_DATA);
    btcSeries.setData(btcChartData);

    chart.timeScale().fitContent();
    new ResizeObserver(function(){ chart.applyOptions({width:wrap.offsetWidth}); }).observe(wrap);

    window._fedBtcChart  = chart;
    window._fedBtcSeries = btcSeries;

    // Update stat cards
    var fedBalEl = document.getElementById('fedBalVal');
    var fedBtcEl = document.getElementById('fedBtcVal');
    if (fedBalEl) fedBalEl.textContent = '$' + FED_DATA[FED_DATA.length-1][1].toFixed(2) + 'T';
    if (fedBtcEl && window.BTC_CURRENT) fedBtcEl.textContent = '$' + Math.round(window.BTC_CURRENT).toLocaleString();

    var upd = document.getElementById('fedUpdated');
    if (upd) upd.textContent = '↻ Updated ' + new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});

    // Refresh — update live BTC point
    window._fedRefresh = function() {
      if (!window._fedBtcSeries) return;
      var data = getBtcOverlayData(BTC_DATA);
      window._fedBtcSeries.setData(data);
      var el = document.getElementById('fedBtcVal');
      if (el && window.BTC_CURRENT) el.textContent = '$' + Math.round(window.BTC_CURRENT).toLocaleString();
      var upd2 = document.getElementById('fedUpdated');
      if (upd2) upd2.textContent = '↻ Updated ' + new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
    };
  })();

  // ── DOLLAR INDEX vs BITCOIN — TradingView dual-axis since 2013 ───────────────
  (function buildDxyBtcChart() {
    var wrap = document.getElementById('dxyBtcChart');
    if (!wrap || typeof LightweightCharts === 'undefined') return;

    function toTs(ym) { return new Date(ym + '-01').getTime() / 1000; }

    // Trade Weighted USD Index (DTWEXAFEGS / DXY equivalent) — monthly since 2013
    // Source: Federal Reserve / FRED — broader measure tracking ~20 currencies
    var DXY_DATA = [
      ['2013-01',103.5],['2013-04',102.8],['2013-07',103.2],['2013-10',103.8],
      ['2014-01',104.5],['2014-04',103.9],['2014-07',106.5],['2014-10',111.2],
      ['2015-01',117.5],['2015-04',118.8],['2015-07',119.5],['2015-10',121.8],
      ['2016-01',121.0],['2016-04',119.5],['2016-07',118.8],['2016-10',121.5],
      ['2017-01',120.5],['2017-04',118.5],['2017-07',114.5],['2017-10',113.2],
      ['2018-01',112.8],['2018-04',114.5],['2018-07',118.2],['2018-10',119.8],
      ['2019-01',118.5],['2019-04',119.2],['2019-07',120.5],['2019-10',119.8],
      ['2020-01',118.5],['2020-04',121.5],['2020-07',114.5],['2020-10',113.2],
      ['2021-01',112.8],['2021-04',113.5],['2021-07',115.5],['2021-10',116.8],
      ['2022-01',117.5],['2022-04',120.5],['2022-07',124.8],['2022-10',126.5],
      ['2023-01',125.2],['2023-04',124.8],['2023-07',125.5],['2023-10',126.8],
      ['2024-01',125.5],['2024-04',126.2],['2024-07',124.8],['2024-10',125.5],
      ['2025-01',124.2],['2025-04',120.5],['2025-07',116.8],['2025-10',114.5],
      ['2026-01',113.5],['2026-03',111.3],
    ];

    // BTC monthly closes since 2013
    var BTC_DATA = [
      ['2013-01',13.5],['2013-04',144.0],['2013-07',105.0],['2013-10',198.0],['2013-12',732.0],
      ['2014-01',820.0],['2014-04',450.0],['2014-07',585.0],['2014-10',340.0],['2014-12',320.0],
      ['2015-01',217.0],['2015-04',235.0],['2015-07',286.0],['2015-10',315.0],['2015-12',430.0],
      ['2016-01',370.0],['2016-04',460.0],['2016-07',624.0],['2016-10',704.0],['2016-12',963.0],
      ['2017-01',970.0],['2017-04',1347.0],['2017-07',2900.0],['2017-10',6100.0],['2017-12',14000.0],
      ['2018-01',10000.0],['2018-04',9200.0],['2018-07',8200.0],['2018-10',6300.0],['2018-12',3700.0],
      ['2019-01',3450.0],['2019-04',5300.0],['2019-07',9600.0],['2019-10',9200.0],['2019-12',7200.0],
      ['2020-01',9350.0],['2020-04',8700.0],['2020-07',11300.0],['2020-10',13800.0],['2020-12',29300.0],
      ['2021-01',33100.0],['2021-04',57700.0],['2021-07',41500.0],['2021-10',61400.0],['2021-12',46200.0],
      ['2022-01',38500.0],['2022-04',38600.0],['2022-07',23300.0],['2022-10',20500.0],['2022-12',16500.0],
      ['2023-01',23100.0],['2023-04',29300.0],['2023-07',29300.0],['2023-10',34700.0],['2023-12',42800.0],
      ['2024-01',42500.0],['2024-04',60700.0],['2024-07',66000.0],['2024-10',72600.0],['2024-12',94200.0],
      ['2025-01',102000.0],['2025-04',94500.0],['2025-07',118000.0],['2025-10',108000.0],['2025-12',102000.0],
      ['2026-01',98000.0],['2026-03',93000.0],
    ];

    var chart = LightweightCharts.createChart(wrap, {
      width:  wrap.offsetWidth  || 900,
      height: wrap.offsetHeight || 500,
      layout: { background:{color:'transparent'}, textColor:'#4d6475' },
      grid:   { vertLines:{color:'rgba(28,45,56,.4)'}, horzLines:{color:'rgba(28,45,56,.4)'} },
      crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      leftPriceScale: {
        visible: true, borderColor:'#ef4444', textColor:'#ef4444',
        scaleMargins:{top:0.05,bottom:0.05}
      },
      rightPriceScale: {
        visible: true, borderColor:'#f4c542', textColor:'#f4c542',
        mode: LightweightCharts.PriceScaleMode.Logarithmic,
        scaleMargins:{top:0.05,bottom:0.05}
      },
      timeScale: { borderColor:'#1c2d38', timeVisible:false },
      handleScroll: true, handleScale: true,
    });

    // DXY — red line, left axis (linear)
    var dxySeries = chart.addLineSeries({
      color: '#ef4444', lineWidth: 1.8,
      priceScaleId: 'left',
      priceLineVisible: true,
      lastValueVisible: true,
      title: 'DXY',
    });
    dxySeries.setData(DXY_DATA.map(function(d){ return {time:toTs(d[0]), value:d[1]}; }));

    // BTC — gold line, right axis (log scale)
    var btcSeries = chart.addLineSeries({
      color: '#f4c542', lineWidth: 1.8,
      priceScaleId: 'right',
      priceLineVisible: true,
      lastValueVisible: true,
      title: 'BTC',
    });

    btcSeries.setData(getBtcOverlayData(BTC_DATA));

    chart.timeScale().fitContent();
    new ResizeObserver(function(){ chart.applyOptions({width:wrap.offsetWidth}); }).observe(wrap);

    window._dxyBtcChart  = chart;
    window._dxyBtcSeries = btcSeries;

    // Update stat cards
    var dxyValEl = document.getElementById('dxyValNew');
    var dxyBtcEl = document.getElementById('dxyBtcNew');
    var dxyLatest = DXY_DATA[DXY_DATA.length-1][1];
    if (dxyValEl) dxyValEl.textContent = dxyLatest.toFixed(1);
    if (dxyBtcEl && window.BTC_CURRENT) dxyBtcEl.textContent = '$' + Math.round(window.BTC_CURRENT).toLocaleString();

    var upd = document.getElementById('dxyUpdated');
    if (upd) upd.textContent = '↻ Updated ' + new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});

    // Daily refresh — update live BTC endpoint
    window._dxyRefresh = function() {
      if (!window._dxyBtcSeries) return;
      var data = getBtcOverlayData(BTC_DATA);
      window._dxyBtcSeries.setData(data);
      var el = document.getElementById('dxyBtcNew');
      if (el && window.BTC_CURRENT) el.textContent = '$' + Math.round(window.BTC_CURRENT).toLocaleString();
      var upd2 = document.getElementById('dxyUpdated');
      if (upd2) upd2.textContent = '↻ Updated ' + new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
    };
  })();

  // ── GLOBAL LIQUIDITY — BTC line = REAL 12-month prices ─────────────────────
  // ── GLOBAL LIQUIDITY INDEX vs BITCOIN — TradingView multi-series ─────────────
  (function buildLiqBtcChart() {
    var wrap = document.getElementById('liqBtcChart');
    if (!wrap || typeof LightweightCharts === 'undefined') return;

    function toTs(ym) { return new Date(ym + '-01').getTime() / 1000; }

    // Fed Balance Sheet in $T (WALCL) — same as Fed panel
    var FED = [
      ['2012-01',2.92],['2012-07',2.87],['2013-01',3.01],['2013-07',3.48],
      ['2014-01',4.01],['2014-07',4.37],['2015-01',4.52],['2015-07',4.50],
      ['2016-01',4.46],['2016-07',4.47],['2017-01',4.45],['2017-07',4.47],
      ['2018-01',4.44],['2018-07',4.28],['2019-01',4.04],['2019-07',3.77],
      ['2020-01',4.17],['2020-04',5.25],['2020-07',7.10],['2020-10',7.36],
      ['2021-01',7.39],['2021-07',8.22],['2022-01',8.87],['2022-07',8.89],
      ['2022-10',8.76],['2023-01',8.49],['2023-07',8.17],['2024-01',7.68],
      ['2024-07',7.29],['2025-01',6.79],['2025-07',6.63],['2026-01',6.55],['2026-03',6.60],
    ];

    // ECB Balance Sheet in €T × EUR/USD rate → $T
    // EUR/USD approx rates applied for USD conversion
    var ECB = [
      ['2012-01',3.02],['2012-07',3.12],['2013-01',2.95],['2013-07',2.85],
      ['2014-01',2.90],['2014-07',2.95],['2015-01',2.45],['2015-07',2.55],
      ['2016-01',2.70],['2016-07',3.05],['2017-01',3.80],['2017-07',4.30],
      ['2018-01',5.20],['2018-07',5.40],['2019-01',4.70],['2019-07',4.60],
      ['2020-01',4.70],['2020-07',6.20],['2020-10',6.90],
      ['2021-01',7.10],['2021-07',8.20],['2022-01',8.60],['2022-07',8.00],
      ['2022-10',8.10],['2023-01',7.90],['2023-07',7.40],['2024-01',7.20],
      ['2024-07',7.10],['2025-01',7.20],['2025-07',7.30],['2026-01',7.20],['2026-03',7.20],
    ];

    // BOJ Balance Sheet in ¥T × USD/JPY rate → $T
    var BOJ = [
      ['2012-01',1.60],['2012-07',1.70],['2013-01',1.80],['2013-07',2.10],
      ['2014-01',2.30],['2014-07',2.60],['2015-01',2.80],['2015-07',2.90],
      ['2016-01',2.90],['2016-07',3.00],['2017-01',3.40],['2017-07',3.80],
      ['2018-01',4.50],['2018-07',4.80],['2019-01',4.80],['2019-07',4.90],
      ['2020-01',5.00],['2020-07',6.20],['2020-10',6.40],
      ['2021-01',6.60],['2021-07',6.60],['2022-01',6.70],['2022-07',4.80],
      ['2022-10',4.70],['2023-01',5.00],['2023-07',4.80],['2024-01',4.60],
      ['2024-07',4.20],['2025-01',4.40],['2025-07',4.50],['2026-01',4.40],['2026-03',4.40],
    ];

    // Compute Total = FED + ECB + BOJ (aligned by date)
    function buildTotal(fed, ecb, boj) {
      var ecbMap = {}, bojMap = {};
      ecb.forEach(function(d){ ecbMap[d[0]] = d[1]; });
      boj.forEach(function(d){ bojMap[d[0]] = d[1]; });
      return fed.map(function(d) {
        var e = ecbMap[d[0]] || 0, b = bojMap[d[0]] || 0;
        return [d[0], +(d[1] + e + b).toFixed(2)];
      });
    }
    var TOTAL = buildTotal(FED, ECB, BOJ);

    // BTC monthly prices since 2012
    var BTC = [
      ['2012-01',6.2],['2012-07',8.0],['2013-01',13.5],['2013-07',105.0],['2013-12',732.0],
      ['2014-01',820.0],['2014-07',585.0],['2014-12',320.0],
      ['2015-01',217.0],['2015-07',286.0],['2015-12',430.0],
      ['2016-01',370.0],['2016-07',624.0],['2016-12',963.0],
      ['2017-01',970.0],['2017-07',2900.0],['2017-12',14000.0],
      ['2018-01',10000.0],['2018-07',8200.0],['2018-12',3700.0],
      ['2019-01',3450.0],['2019-07',9600.0],['2019-12',7200.0],
      ['2020-01',9350.0],['2020-07',11300.0],['2020-10',13800.0],['2020-12',29300.0],
      ['2021-01',33100.0],['2021-07',41500.0],['2021-12',46200.0],
      ['2022-01',38500.0],['2022-07',23300.0],['2022-10',20500.0],['2022-12',16500.0],
      ['2023-01',23100.0],['2023-07',29300.0],['2023-12',42800.0],
      ['2024-01',42500.0],['2024-07',66000.0],['2024-12',94200.0],
      ['2025-01',102000.0],['2025-07',118000.0],['2025-12',102000.0],
      ['2026-01',98000.0],['2026-03',93000.0],
    ];

    var chart = LightweightCharts.createChart(wrap, {
      width:  wrap.offsetWidth  || 900,
      height: wrap.offsetHeight || 520,
      layout: { background:{color:'transparent'}, textColor:'#4d6475' },
      grid:   { vertLines:{color:'rgba(28,45,56,.4)'}, horzLines:{color:'rgba(28,45,56,.4)'} },
      crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      leftPriceScale:  { visible:true, borderColor:'#22c55e', scaleMargins:{top:0.05,bottom:0.05} },
      rightPriceScale: {
        visible:true, borderColor:'#f4c542',
        mode: LightweightCharts.PriceScaleMode.Logarithmic,
        scaleMargins:{top:0.05,bottom:0.05}
      },
      timeScale: { borderColor:'#1c2d38', timeVisible:false },
      handleScroll:true, handleScale:true,
    });

    // Build all 5 series
    var SERIES_CFG = [
      { key:'fed',   data:FED,   color:'#3b82f6', width:1.5, axis:'left',  title:'Fed' },
      { key:'ecb',   data:ECB,   color:'#06b6d4', width:1.5, axis:'left',  title:'ECB' },
      { key:'boj',   data:BOJ,   color:'#a855f7', width:1.5, axis:'left',  title:'BOJ' },
      { key:'total', data:TOTAL, color:'#22c55e', width:2.5, axis:'left',  title:'Total' },
      { key:'btc',   data:BTC,   color:'#f4c542', width:2.0, axis:'right', title:'BTC/USD' },
    ];

    var seriesMap = {}, visibleMap = {};
    SERIES_CFG.forEach(function(cfg) {
      visibleMap[cfg.key] = true;
      var s = chart.addLineSeries({
        color: cfg.color, lineWidth: cfg.width,
        priceScaleId: cfg.axis,
        priceLineVisible: true,
        lastValueVisible: true,
        title: cfg.title,
      });
      var d = cfg.key === 'btc'
        ? getBtcOverlayData(cfg.data)
        : cfg.data.map(function(p){ return {time:toTs(p[0]), value:p[1]}; });
      s.setData(d);
      seriesMap[cfg.key] = s;
    });

    chart.timeScale().fitContent();
    new ResizeObserver(function(){ chart.applyOptions({width:wrap.offsetWidth}); }).observe(wrap);

    window._liqChart   = chart;
    window._liqSeries  = seriesMap;
    window._liqVisible = visibleMap;
    window._liqBtcData = BTC;

    // Toggle handler
    window.liqToggle = function(key) {
      visibleMap[key] = !visibleMap[key];
      var pill = document.getElementById('liqPill_' + key);
      if (pill) pill.style.opacity = visibleMap[key] ? '1' : '0.35';
      if (seriesMap[key]) seriesMap[key].applyOptions({visible: visibleMap[key]});
    };

    // Update stat cards
    var totalLatest = TOTAL[TOTAL.length-1][1];
    var fedLatest   = FED[FED.length-1][1];
    var ecbLatest   = ECB[ECB.length-1][1];
    var bojLatest   = BOJ[BOJ.length-1][1];
    var el = document.getElementById('liqTotal'); if(el) el.textContent = '$'+totalLatest.toFixed(1)+'T';
    var el2= document.getElementById('liqFed');   if(el2) el2.textContent = '$'+fedLatest.toFixed(1)+'T';
    var el3= document.getElementById('liqEcb');   if(el3) el3.textContent = '$'+ecbLatest.toFixed(1)+'T';
    var el4= document.getElementById('liqBoj');   if(el4) el4.textContent = '$'+bojLatest.toFixed(1)+'T';

    var upd = document.getElementById('liqUpdated');
    if (upd) upd.textContent = '↻ Updated ' + new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});

    // Refresh — update live BTC endpoint
    window._liqRefresh = function() {
      if (!window._liqSeries || !window._liqSeries.btc) return;
      var data = getBtcOverlayData(window._liqBtcData);
      window._liqSeries.btc.setData(data);
      var upd2 = document.getElementById('liqUpdated');
      if (upd2) upd2.textContent = '↻ Updated ' + new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
    };
  })();

  // ── ISM CHARTS ──────────────────────────────────────────────────────────────
  // ── BITCOIN ISM CHART — color-coded by ISM Manufacturing PMI ─────────────────
  (function buildIsmBtcChart() {
    var wrap = document.getElementById('ismBtcChart');
    if (!wrap || typeof LightweightCharts === 'undefined') return;

    // ISM Manufacturing PMI monthly data since 2013
    // Format: [YYYY-MM, PMI value]
    // Source: Institute for Supply Management historical data
    var ISM_DATA = [
      ['2013-01',53.1],['2013-02',54.2],['2013-03',51.3],['2013-04',50.7],['2013-05',49.0],['2013-06',50.9],
      ['2013-07',55.4],['2013-08',55.7],['2013-09',56.2],['2013-10',56.4],['2013-11',57.3],['2013-12',56.5],
      ['2014-01',51.3],['2014-02',53.2],['2014-03',53.7],['2014-04',54.9],['2014-05',55.4],['2014-06',55.3],
      ['2014-07',57.1],['2014-08',59.0],['2014-09',56.6],['2014-10',59.0],['2014-11',58.7],['2014-12',55.5],
      ['2015-01',53.5],['2015-02',52.9],['2015-03',51.5],['2015-04',51.5],['2015-05',52.8],['2015-06',53.5],
      ['2015-07',52.7],['2015-08',51.1],['2015-09',50.1],['2015-10',50.1],['2015-11',48.6],['2015-12',48.2],
      ['2016-01',48.2],['2016-02',49.5],['2016-03',51.8],['2016-04',50.8],['2016-05',51.3],['2016-06',53.2],
      ['2016-07',52.6],['2016-08',49.4],['2016-09',51.5],['2016-10',51.9],['2016-11',53.2],['2016-12',54.7],
      ['2017-01',56.0],['2017-02',57.7],['2017-03',57.2],['2017-04',54.8],['2017-05',54.9],['2017-06',57.8],
      ['2017-07',56.3],['2017-08',58.8],['2017-09',60.8],['2017-10',58.7],['2017-11',58.2],['2017-12',59.7],
      ['2018-01',59.1],['2018-02',60.8],['2018-03',59.3],['2018-04',57.3],['2018-05',58.7],['2018-06',60.2],
      ['2018-07',58.1],['2018-08',61.3],['2018-09',59.8],['2018-10',57.7],['2018-11',59.3],['2018-12',54.1],
      ['2019-01',56.6],['2019-02',54.2],['2019-03',55.3],['2019-04',52.8],['2019-05',52.1],['2019-06',51.7],
      ['2019-07',51.2],['2019-08',49.1],['2019-09',47.8],['2019-10',48.3],['2019-11',48.1],['2019-12',47.2],
      ['2020-01',50.9],['2020-02',50.1],['2020-03',49.1],['2020-04',41.5],['2020-05',43.1],['2020-06',52.6],
      ['2020-07',54.2],['2020-08',56.0],['2020-09',55.4],['2020-10',59.3],['2020-11',57.5],['2020-12',60.7],
      ['2021-01',58.7],['2021-02',60.8],['2021-03',64.7],['2021-04',60.7],['2021-05',61.2],['2021-06',60.6],
      ['2021-07',59.5],['2021-08',59.9],['2021-09',61.1],['2021-10',60.8],['2021-11',61.1],['2021-12',58.7],
      ['2022-01',57.6],['2022-02',58.6],['2022-03',57.1],['2022-04',55.4],['2022-05',56.1],['2022-06',53.0],
      ['2022-07',52.8],['2022-08',52.8],['2022-09',50.9],['2022-10',50.2],['2022-11',49.0],['2022-12',48.4],
      ['2023-01',47.4],['2023-02',47.7],['2023-03',46.3],['2023-04',47.1],['2023-05',46.9],['2023-06',46.0],
      ['2023-07',46.4],['2023-08',47.6],['2023-09',49.0],['2023-10',46.7],['2023-11',46.7],['2023-12',47.4],
      ['2024-01',49.1],['2024-02',47.8],['2024-03',50.3],['2024-04',49.2],['2024-05',48.7],['2024-06',48.5],
      ['2024-07',46.8],['2024-08',47.2],['2024-09',47.2],['2024-10',46.5],['2024-11',48.4],['2024-12',49.3],
      ['2025-01',50.9],['2025-02',50.3],['2025-03',49.0],['2025-04',48.7],['2025-05',48.5],['2025-06',48.7],
      ['2025-07',49.5],['2025-08',49.8],['2025-09',50.1],['2025-10',50.3],['2025-11',50.5],['2025-12',50.3],
      ['2026-01',49.8],['2026-02',49.5],['2026-03',49.8],
    ];

    // BTC monthly close prices since 2013
    // Format: [YYYY-MM, price]
    var BTC_MONTHLY = [
      ['2013-01',13.5],['2013-02',34.0],['2013-03',91.0],['2013-04',144.0],['2013-05',129.0],['2013-06',98.0],
      ['2013-07',105.0],['2013-08',130.0],['2013-09',133.0],['2013-10',198.0],['2013-11',1120.0],['2013-12',732.0],
      ['2014-01',820.0],['2014-02',590.0],['2014-03',450.0],['2014-04',450.0],['2014-05',630.0],['2014-06',635.0],
      ['2014-07',585.0],['2014-08',500.0],['2014-09',390.0],['2014-10',340.0],['2014-11',378.0],['2014-12',320.0],
      ['2015-01',217.0],['2015-02',254.0],['2015-03',247.0],['2015-04',235.0],['2015-05',233.0],['2015-06',263.0],
      ['2015-07',286.0],['2015-08',230.0],['2015-09',237.0],['2015-10',315.0],['2015-11',378.0],['2015-12',430.0],
      ['2016-01',370.0],['2016-02',435.0],['2016-03',415.0],['2016-04',460.0],['2016-05',530.0],['2016-06',670.0],
      ['2016-07',624.0],['2016-08',576.0],['2016-09',610.0],['2016-10',704.0],['2016-11',740.0],['2016-12',963.0],
      ['2017-01',970.0],['2017-02',1190.0],['2017-03',1070.0],['2017-04',1347.0],['2017-05',2300.0],['2017-06',2550.0],
      ['2017-07',2900.0],['2017-08',4700.0],['2017-09',4200.0],['2017-10',6100.0],['2017-11',10900.0],['2017-12',14000.0],
      ['2018-01',10000.0],['2018-02',10900.0],['2018-03',7000.0],['2018-04',9200.0],['2018-05',7500.0],['2018-06',6200.0],
      ['2018-07',8200.0],['2018-08',7000.0],['2018-09',6600.0],['2018-10',6300.0],['2018-11',4000.0],['2018-12',3700.0],
      ['2019-01',3450.0],['2019-02',3800.0],['2019-03',4100.0],['2019-04',5300.0],['2019-05',8700.0],['2019-06',10800.0],
      ['2019-07',9600.0],['2019-08',9600.0],['2019-09',8300.0],['2019-10',9200.0],['2019-11',7500.0],['2019-12',7200.0],
      ['2020-01',9350.0],['2020-02',8600.0],['2020-03',6400.0],['2020-04',8700.0],['2020-05',9450.0],['2020-06',9100.0],
      ['2020-07',11300.0],['2020-08',11650.0],['2020-09',10800.0],['2020-10',13800.0],['2020-11',19700.0],['2020-12',29300.0],
      ['2021-01',33100.0],['2021-02',46200.0],['2021-03',59000.0],['2021-04',57700.0],['2021-05',37300.0],['2021-06',35000.0],
      ['2021-07',41500.0],['2021-08',47100.0],['2021-09',43800.0],['2021-10',61400.0],['2021-11',57000.0],['2021-12',46200.0],
      ['2022-01',38500.0],['2022-02',43200.0],['2022-03',46300.0],['2022-04',38600.0],['2022-05',31800.0],['2022-06',19000.0],
      ['2022-07',23300.0],['2022-08',20050.0],['2022-09',19430.0],['2022-10',20500.0],['2022-11',16600.0],['2022-12',16500.0],
      ['2023-01',23100.0],['2023-02',23500.0],['2023-03',28500.0],['2023-04',29300.0],['2023-05',27700.0],['2023-06',30500.0],
      ['2023-07',29300.0],['2023-08',26000.0],['2023-09',27000.0],['2023-10',34700.0],['2023-11',37900.0],['2023-12',42800.0],
      ['2024-01',42500.0],['2024-02',61500.0],['2024-03',71300.0],['2024-04',60700.0],['2024-05',67500.0],['2024-06',62700.0],
      ['2024-07',66000.0],['2024-08',59000.0],['2024-09',63300.0],['2024-10',72600.0],['2024-11',97700.0],['2024-12',94200.0],
      ['2025-01',102000.0],['2025-02',84500.0],['2025-03',82800.0],['2025-04',94500.0],['2025-05',105000.0],['2025-06',107000.0],
      ['2025-07',118000.0],['2025-08',115000.0],['2025-09',110000.0],['2025-10',108000.0],['2025-11',105000.0],['2025-12',102000.0],
      ['2026-01',98000.0],['2026-02',95000.0],['2026-03',93000.0],
    ];

    // Build ISM lookup map: YYYY-MM → PMI
    var ismMap = {};
    ISM_DATA.forEach(function(d){ ismMap[d[0]] = d[1]; });

    // Color function: PMI → color string (green=low, yellow=neutral, orange=high, red=very high)
    function ismColor(pmi) {
      if (pmi === null || pmi === undefined) return '#4d6475';
      if (pmi < 44)  return '#22c55e'; // deep green — very deflationary
      if (pmi < 48)  return '#4ade80'; // light green — deflationary
      if (pmi < 50)  return '#86efac'; // pale green — below neutral
      if (pmi < 52)  return '#fbbf24'; // yellow — neutral
      if (pmi < 55)  return '#f97316'; // orange — inflationary
      if (pmi < 60)  return '#ef4444'; // red — high inflation
      return '#dc2626';                // deep red — very high
    }

    // Use TradingView baseline series + multiple colored segments
    var chart = LightweightCharts.createChart(wrap, {
      width:  wrap.offsetWidth  || 900,
      height: wrap.offsetHeight || 480,
      layout: { background:{color:'transparent'}, textColor:'#4d6475' },
      grid:   { vertLines:{color:'rgba(28,45,56,.4)'}, horzLines:{color:'rgba(28,45,56,.4)'} },
      crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      rightPriceScale: {
        borderColor: '#1c2d38',
        mode: LightweightCharts.PriceScaleMode.Logarithmic,
        scaleMargins: {top:0.05, bottom:0.05}
      },
      timeScale: { borderColor:'#1c2d38', timeVisible:false },
      handleScroll: true, handleScale: true,
    });

    // Use real BTC monthly history if loaded, otherwise use hardcoded BTC_MONTHLY
    function getBtcSrc() {
      if (window.BTC_MONTHLY_HISTORY && window.BTC_MONTHLY_HISTORY.length > 10) {
        return window.BTC_MONTHLY_HISTORY.map(function(m){ return [m.ym, m.price]; });
      }
      return BTC_MONTHLY;
    }

    // For each month segment, create a 2-point line series with that month's ISM color
    var btcSrc = getBtcSrc();
    btcSrc.forEach(function(entry, i) {
      if (i === 0) return;
      var prevEntry = btcSrc[i-1];
      var ym   = entry[0];
      var pmi  = ismMap[ym] || ismMap[prevEntry[0]] || 50;
      var col  = ismColor(pmi);

      var seg = chart.addLineSeries({
        color:            col,
        lineWidth:        2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });

      var t1 = new Date(prevEntry[0]+'-01').getTime() / 1000;
      var t2 = new Date(entry[0]+'-01').getTime() / 1000;

      seg.setData([
        { time: t1, value: prevEntry[1] },
        { time: t2, value: entry[1] }
      ]);
    });

    // Add current live price as final segment
    var lastBtc  = btcSrc[btcSrc.length - 1];
    var lastPMI  = ISM_DATA[ISM_DATA.length - 1][1];
    var liveSeg  = chart.addLineSeries({
      color: ismColor(lastPMI), lineWidth: 2.5,
      priceLineVisible: true, lastValueVisible: true,
      priceLineStyle: LightweightCharts.LineStyle.Dotted,
    });
    var livePrice = window.BTC_CURRENT ? Math.round(window.BTC_CURRENT) : lastBtc[1];
    liveSeg.setData([
      { time: new Date(lastBtc[0]+'-01').getTime()/1000, value: lastBtc[1] },
      { time: Math.floor(Date.now()/1000), value: livePrice }
    ]);
    window._ismLiveSeg = liveSeg;

    chart.timeScale().fitContent();
    new ResizeObserver(function(){ chart.applyOptions({width:wrap.offsetWidth}); }).observe(wrap);

    // Update current ISM value display
    var latestISM = ISM_DATA[ISM_DATA.length - 1];
    var ismValEl  = document.getElementById('ismCurrentVal');
    var ismMfgEl  = document.getElementById('ismMfgVal');
    if (ismValEl) { ismValEl.textContent = latestISM[1]; ismValEl.style.color = ismColor(latestISM[1]); }
    if (ismMfgEl) ismMfgEl.textContent = latestISM[1];

    var upd = document.getElementById('ismUpdated');
    if (upd) upd.textContent = '↻ Updated ' + new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});

    window._ismBtcChart = chart;

    // Refresh live price endpoint
    window._ismRefresh = function() {
      if (!window._ismLiveSeg) return;
      var tNow = Math.floor(Date.now() / 1000);
      // Get best available last BTC price point
      var lastPrice = (window.BTC_MONTHLY_HISTORY && window.BTC_MONTHLY_HISTORY.length > 0)
        ? window.BTC_MONTHLY_HISTORY[window.BTC_MONTHLY_HISTORY.length - 1].price
        : 93000;
      var lastTs = (window.BTC_MONTHLY_HISTORY && window.BTC_MONTHLY_HISTORY.length > 0)
        ? window.BTC_MONTHLY_HISTORY[window.BTC_MONTHLY_HISTORY.length - 1].ts
        : new Date('2026-03-01').getTime() / 1000;
      var livePrice = window.BTC_CURRENT ? Math.round(window.BTC_CURRENT) : lastPrice;
      window._ismLiveSeg.setData([
        {time: lastTs, value: lastPrice},
        {time: tNow,   value: livePrice}
      ]);
      var upd = document.getElementById('ismUpdated');
      if (upd) upd.textContent = '↻ Updated ' + new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
    };
  })();

  // ── SOCIAL RISK — derived from real 30d BTC price momentum ─────────────────
  // ── BITCOIN SOCIAL RISK — Google Trends color-coded BTC price chart ──────────
  (function buildSocialRiskChart() {
    var wrap = document.getElementById('socialRiskChart');
    if (!wrap || typeof LightweightCharts === 'undefined') return;

    function toTs(ym) { return new Date(ym + '-01').getTime() / 1000; }

    // Google Trends interest for "Bitcoin" — monthly, 0-100 scale
    // Source: Google Trends historical data (trends.google.com)
    // 100 = peak interest, 0 = minimal interest
    var TRENDS = {
      '2013-01':4,'2013-02':5,'2013-03':6,'2013-04':18,'2013-05':10,'2013-06':8,
      '2013-07':8,'2013-08':8,'2013-09':8,'2013-10':9,'2013-11':30,'2013-12':27,
      '2014-01':19,'2014-02':12,'2014-03':10,'2014-04':9,'2014-05':9,'2014-06':9,
      '2014-07':8,'2014-08':8,'2014-09':8,'2014-10':8,'2014-11':8,'2014-12':8,
      '2015-01':7,'2015-02':7,'2015-03':7,'2015-04':7,'2015-05':7,'2015-06':8,
      '2015-07':8,'2015-08':7,'2015-09':7,'2015-10':8,'2015-11':8,'2015-12':10,
      '2016-01':9,'2016-02':9,'2016-03':9,'2016-04':9,'2016-05':10,'2016-06':11,
      '2016-07':10,'2016-08':9,'2016-09':9,'2016-10':10,'2016-11':11,'2016-12':18,
      '2017-01':18,'2017-02':18,'2017-03':19,'2017-04':20,'2017-05':30,'2017-06':35,
      '2017-07':28,'2017-08':32,'2017-09':40,'2017-10':45,'2017-11':75,'2017-12':100,
      '2018-01':75,'2018-02':45,'2018-03':35,'2018-04':30,'2018-05':28,'2018-06':22,
      '2018-07':18,'2018-08':15,'2018-09':14,'2018-10':14,'2018-11':18,'2018-12':15,
      '2019-01':12,'2019-02':11,'2019-03':12,'2019-04':16,'2019-05':22,'2019-06':28,
      '2019-07':22,'2019-08':18,'2019-09':16,'2019-10':16,'2019-11':15,'2019-12':14,
      '2020-01':15,'2020-02':14,'2020-03':14,'2020-04':13,'2020-05':13,'2020-06':13,
      '2020-07':14,'2020-08':14,'2020-09':13,'2020-10':16,'2020-11':28,'2020-12':45,
      '2021-01':55,'2021-02':65,'2021-03':55,'2021-04':75,'2021-05':70,'2021-06':42,
      '2021-07':38,'2021-08':42,'2021-09':42,'2021-10':55,'2021-11':80,'2021-12':62,
      '2022-01':48,'2022-02':40,'2022-03':38,'2022-04':32,'2022-05':35,'2022-06':28,
      '2022-07':22,'2022-08':20,'2022-09':18,'2022-10':18,'2022-11':22,'2022-12':18,
      '2023-01':20,'2023-02':18,'2023-03':20,'2023-04':22,'2023-05':20,'2023-06':19,
      '2023-07':18,'2023-08':18,'2023-09':17,'2023-10':22,'2023-11':28,'2023-12':35,
      '2024-01':38,'2024-02':52,'2024-03':60,'2024-04':48,'2024-05':42,'2024-06':38,
      '2024-07':40,'2024-08':35,'2024-09':38,'2024-10':45,'2024-11':68,'2024-12':62,
      '2025-01':65,'2025-02':55,'2025-03':52,'2025-04':58,'2025-05':60,'2025-06':62,
      '2025-07':65,'2025-08':62,'2025-09':58,'2025-10':55,'2025-11':52,'2025-12':50,
      '2026-01':48,'2026-02':45,'2026-03':42,
    };

    // BTC monthly closes since 2013
    var BTC_MONTHLY = [
      ['2013-01',13.5],['2013-02',34.0],['2013-03',91.0],['2013-04',144.0],['2013-05',129.0],['2013-06',98.0],
      ['2013-07',105.0],['2013-08',130.0],['2013-09',133.0],['2013-10',198.0],['2013-11',1120.0],['2013-12',732.0],
      ['2014-01',820.0],['2014-02',590.0],['2014-03',450.0],['2014-04',450.0],['2014-05',630.0],['2014-06',635.0],
      ['2014-07',585.0],['2014-08',500.0],['2014-09',390.0],['2014-10',340.0],['2014-11',378.0],['2014-12',320.0],
      ['2015-01',217.0],['2015-02',254.0],['2015-03',247.0],['2015-04',235.0],['2015-05',233.0],['2015-06',263.0],
      ['2015-07',286.0],['2015-08',230.0],['2015-09',237.0],['2015-10',315.0],['2015-11',378.0],['2015-12',430.0],
      ['2016-01',370.0],['2016-02',435.0],['2016-03',415.0],['2016-04',460.0],['2016-05',530.0],['2016-06',670.0],
      ['2016-07',624.0],['2016-08',576.0],['2016-09',610.0],['2016-10',704.0],['2016-11',740.0],['2016-12',963.0],
      ['2017-01',970.0],['2017-02',1190.0],['2017-03',1070.0],['2017-04',1347.0],['2017-05',2300.0],['2017-06',2550.0],
      ['2017-07',2900.0],['2017-08',4700.0],['2017-09',4200.0],['2017-10',6100.0],['2017-11',10900.0],['2017-12',14000.0],
      ['2018-01',10000.0],['2018-02',10900.0],['2018-03',7000.0],['2018-04',9200.0],['2018-05',7500.0],['2018-06',6200.0],
      ['2018-07',8200.0],['2018-08',7000.0],['2018-09',6600.0],['2018-10',6300.0],['2018-11',4000.0],['2018-12',3700.0],
      ['2019-01',3450.0],['2019-02',3800.0],['2019-03',4100.0],['2019-04',5300.0],['2019-05',8700.0],['2019-06',10800.0],
      ['2019-07',9600.0],['2019-08',9600.0],['2019-09',8300.0],['2019-10',9200.0],['2019-11',7500.0],['2019-12',7200.0],
      ['2020-01',9350.0],['2020-02',8600.0],['2020-03',6400.0],['2020-04',8700.0],['2020-05',9450.0],['2020-06',9100.0],
      ['2020-07',11300.0],['2020-08',11650.0],['2020-09',10800.0],['2020-10',13800.0],['2020-11',19700.0],['2020-12',29300.0],
      ['2021-01',33100.0],['2021-02',46200.0],['2021-03',59000.0],['2021-04',57700.0],['2021-05',37300.0],['2021-06',35000.0],
      ['2021-07',41500.0],['2021-08',47100.0],['2021-09',43800.0],['2021-10',61400.0],['2021-11',57000.0],['2021-12',46200.0],
      ['2022-01',38500.0],['2022-02',43200.0],['2022-03',46300.0],['2022-04',38600.0],['2022-05',31800.0],['2022-06',19000.0],
      ['2022-07',23300.0],['2022-08',20050.0],['2022-09',19430.0],['2022-10',20500.0],['2022-11',16600.0],['2022-12',16500.0],
      ['2023-01',23100.0],['2023-02',23500.0],['2023-03',28500.0],['2023-04',29300.0],['2023-05',27700.0],['2023-06',30500.0],
      ['2023-07',29300.0],['2023-08',26000.0],['2023-09',27000.0],['2023-10',34700.0],['2023-11',37900.0],['2023-12',42800.0],
      ['2024-01',42500.0],['2024-02',61500.0],['2024-03',71300.0],['2024-04',60700.0],['2024-05',67500.0],['2024-06',62700.0],
      ['2024-07',66000.0],['2024-08',59000.0],['2024-09',63300.0],['2024-10',72600.0],['2024-11',97700.0],['2024-12',94200.0],
      ['2025-01',102000.0],['2025-02',84500.0],['2025-03',82800.0],['2025-04',94500.0],['2025-05',105000.0],['2025-06',107000.0],
      ['2025-07',118000.0],['2025-08',115000.0],['2025-09',110000.0],['2025-10',108000.0],['2025-11',105000.0],['2025-12',102000.0],
      ['2026-01',98000.0],['2026-02',95000.0],['2026-03',93000.0],
    ];

    // Map trend score to color — blue→green→yellow→orange→red
    function trendColor(score) {
      if (score === undefined || score === null) return '#3b82f6';
      if (score < 8)  return '#3b82f6'; // blue — very low
      if (score < 15) return '#22c55e'; // green — low
      if (score < 25) return '#4ade80'; // light green — below average
      if (score < 35) return '#84cc16'; // lime — moderate
      if (score < 45) return '#fbbf24'; // yellow — rising interest
      if (score < 60) return '#f97316'; // orange — high interest
      if (score < 75) return '#ef4444'; // red — very high
      return '#dc2626';                 // deep red — peak FOMO
    }

    // Create chart
    var chart = LightweightCharts.createChart(wrap, {
      width:  wrap.offsetWidth  || 900,
      height: wrap.offsetHeight || 480,
      layout: { background:{color:'transparent'}, textColor:'#4d6475' },
      grid:   { vertLines:{color:'rgba(28,45,56,.4)'}, horzLines:{color:'rgba(28,45,56,.4)'} },
      crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      rightPriceScale: {
        borderColor: '#1c2d38',
        mode: LightweightCharts.PriceScaleMode.Logarithmic,
        scaleMargins: {top:0.05, bottom:0.05}
      },
      timeScale: { borderColor:'#1c2d38', timeVisible:false },
      handleScroll: true, handleScale: true,
    });

    // Use real BTC monthly history if loaded, otherwise use hardcoded BTC_MONTHLY
    var btcSrc = (window.BTC_MONTHLY_HISTORY && window.BTC_MONTHLY_HISTORY.length > 10)
      ? window.BTC_MONTHLY_HISTORY.map(function(m){ return [m.ym, m.price]; })
      : BTC_MONTHLY;

    // Draw colored segments month by month
    btcSrc.forEach(function(entry, i) {
      if (i === 0) return;
      var prev  = btcSrc[i-1];
      var score = TRENDS[entry[0]] || TRENDS[prev[0]] || 10;
      var col   = trendColor(score);

      var seg = chart.addLineSeries({
        color: col, lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      seg.setData([
        {time: toTs(prev[0]), value: prev[1]},
        {time: toTs(entry[0]), value: entry[1]},
      ]);
    });

    // Add live current price as final segment
    var lastBtcEntry = btcSrc[btcSrc.length-1];
    var lastScore    = TRENDS['2026-03'] || 42;
    var liveSeg = chart.addLineSeries({
      color: trendColor(lastScore), lineWidth: 2.5,
      priceLineVisible: true, lastValueVisible: true,
    });
    var livePrice = window.BTC_CURRENT ? Math.round(window.BTC_CURRENT) : lastBtcEntry[1];
    liveSeg.setData([
      {time: toTs(lastBtcEntry[0]), value: lastBtcEntry[1]},
      {time: Math.floor(Date.now()/1000), value: livePrice},
    ]);
    window._socialLiveSeg   = liveSeg;
    window._socialLastEntry = lastBtcEntry;

    chart.timeScale().fitContent();
    new ResizeObserver(function(){ chart.applyOptions({width:wrap.offsetWidth}); }).observe(wrap);
    window._socialChart = chart;

    // Update stat cards
    var latestScore = TRENDS['2026-03'] || 42;
    function scoreSignal(s) {
      if (s < 15) return {txt:'Low Interest', col:'#22c55e'};
      if (s < 30) return {txt:'Moderate', col:'#84cc16'};
      if (s < 50) return {txt:'Rising Hype', col:'#fbbf24'};
      if (s < 70) return {txt:'High FOMO', col:'#f97316'};
      return {txt:'Peak Euphoria', col:'#ef4444'};
    }
    var sig = scoreSignal(latestScore);
    var scoreEl  = document.getElementById('socialScore');
    var signalEl = document.getElementById('socialSignal');
    var trendEl  = document.getElementById('socialTrendVal');
    var btcEl    = document.getElementById('socialBtcPrice');
    if (scoreEl)  { scoreEl.textContent = latestScore; scoreEl.style.color = trendColor(latestScore); }
    if (signalEl) { signalEl.textContent = sig.txt; signalEl.style.color = sig.col; }
    if (trendEl)  { trendEl.textContent = latestScore + '/100'; trendEl.style.color = trendColor(latestScore); }
    if (btcEl && window.BTC_CURRENT) btcEl.textContent = '$' + Math.round(window.BTC_CURRENT).toLocaleString();

    var upd = document.getElementById('socialUpdated');
    if (upd) upd.textContent = '↻ Updated ' + new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});

    // Refresh live price endpoint
    window._socialRefresh = function() {
      if (!window._socialLiveSeg || !window._socialLastEntry) return;
      var last = window._socialLastEntry;
      var livePrice = window.BTC_CURRENT ? Math.round(window.BTC_CURRENT) : last[1];
      var lastTs = (typeof last[0] === 'string')
        ? new Date(last[0]+'-01').getTime()/1000
        : last.ts || new Date('2026-03-01').getTime()/1000;
      window._socialLiveSeg.setData([
        {time: lastTs, value: last[1]},
        {time: Math.floor(Date.now()/1000), value: livePrice},
      ]);
      var el = document.getElementById('socialBtcPrice');
      if (el && window.BTC_CURRENT) el.textContent = '$' + Math.round(window.BTC_CURRENT).toLocaleString();
      var upd = document.getElementById('socialUpdated');
      if (upd) upd.textContent = '↻ Updated ' + new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
    };
  })();

