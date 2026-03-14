// ── DRAW ALL CHARTS — called once after BTC price history is loaded ───────────
async function drawAllCharts(){
  const p  = BTC_CURRENT;
  const p30= BTC_30D.prices;
  const l30= BTC_30D.labels;
  const p12= BTC_12M.prices;
  const l12= BTC_12M.labels;
  const p365=BTC_365D.prices;
  const l365=BTC_365D.labels;

  // ── SMA / 200-Day Moving Average chart ──────────────────────────────────────
  const smaEl=document.getElementById('smaChart');
  if(smaEl&&p365.length){
    const sma200=calcMA(p365,200);
    const sma50=calcMA(p365,50);
    const step=Math.max(1,Math.floor(p365.length/80));
    const pl=p365.filter((_,i)=>i%step===0);
    const ll=l365.filter((_,i)=>i%step===0);
    const s200=sma200.filter((_,i)=>i%step===0);
    const s50=sma50.filter((_,i)=>i%step===0);
    ll[ll.length-1]='Now';
    const g=hexGrad(smaEl,GOLD);
    new Chart(smaEl,{type:'line',data:{labels:ll,datasets:[
      {label:'BTC Price',data:pl,borderColor:GOLD,backgroundColor:g,fill:true,tension:0.4,pointRadius:0,borderWidth:2},
      {label:'200-Day SMA',data:s200,borderColor:'rgba(255,69,96,.85)',fill:false,tension:0.4,pointRadius:0,borderWidth:2,borderDash:[6,3],spanGaps:true},
      {label:'50-Day SMA', data:s50, borderColor:'rgba(0,180,216,.7)', fill:false,tension:0.4,pointRadius:0,borderWidth:1.5,borderDash:[3,2],spanGaps:true}
    ]},options:{responsive:true,interaction:{mode:'index',intersect:false},plugins:{legend:{labels:{color:MUTED,font:{size:9}}}},
      scales:{y:{type:'logarithmic',grid:{color:'#1c2d38'},ticks:{color:MUTED,callback:v=>'$'+v.toLocaleString()}},x:{grid:{color:'#1c2d3820'},ticks:{color:MUTED,maxTicksLimit:8}}}}});

    // Stat cards
    const lastSMA200=sma200.filter(Boolean).slice(-1)[0];
    const smaEl2=document.getElementById('smaCurrentPrice');
    const smaPct=document.getElementById('smaPctAbove');
    if(smaEl2)smaEl2.textContent='$'+p.toLocaleString(undefined,{maximumFractionDigits:0});
    if(smaPct&&lastSMA200){
      const pct=((p-lastSMA200)/lastSMA200*100).toFixed(1);
      smaPct.textContent=(p>=lastSMA200?'↑ +':'↓ ')+Math.abs(pct)+'% vs 200D SMA';
      smaPct.className='cc '+(p>=lastSMA200?'up':'dn');
    }
  }

  // ── RSI — Full detailed: gauge, 30d line, multi-asset comparison, signal table ─
  const rsiGaugeEl   = document.getElementById('rsiGaugeChart');
  const rsiLineEl    = document.getElementById('rsiLineChart');
  const rsiMultiEl   = document.getElementById('rsiMultiChart');
  const rsiTableBody = document.getElementById('rsiTableBody');

  if(rsiGaugeEl || rsiLineEl || rsiMultiEl || rsiTableBody){

    // Fetch full 60-day daily RSI history for a coin (returns {vals, labels, high, low})
    async function getRSIHistory(id){
      // Route through Railway API to avoid CoinGecko CORS block
      try{
        const r = await fetch(`${API_BASE}/api/crypto/rsi/${id}`, {signal:AbortSignal.timeout(15000)});
        if(r.ok){
          const d = await r.json();
          if(d&&d.vals30) return d;
        }
      }catch(e){}
      // Fallback: try CoinGecko direct (works in some browsers/regions)
      const d = await fetchJSON(`${CG}/coins/${id}/market_chart?vs_currency=usd&days=60&interval=daily`);
      if(!d) return null;
      const prices = d.prices.map(p=>p[1]);
      const dates  = d.prices.map(p=>new Date(p[0]).toLocaleDateString('en',{month:'short',day:'numeric'}));
      const rsiArr = calcRSI(prices,14);
      const valid  = rsiArr.map((v,i)=>({v,d:dates[i]})).filter(x=>x.v!==null);
      const last30 = valid.slice(-30);
      const rsi7d  = calcRSI(prices.slice(-21),14).filter(v=>v!==null);
      const vals30 = last30.map(x=>x.v);
      return {
        current : valid[valid.length-1]?.v || null,
        rsi7d   : rsi7d[rsi7d.length-1] || null,
        vals30  : vals30,
        labels30: last30.map(x=>x.d),
        high30  : vals30.length ? Math.max(...vals30).toFixed(1) : null,
        low30   : vals30.length ? Math.min(...vals30).toFixed(1) : null,
      };
    }

    const ASSETS = [
      {id:'bitcoin',       label:'BTC', color: GOLD},
      {id:'ethereum',      label:'ETH', color: BLUE},
      {id:'solana',        label:'SOL', color: PURPLE},
      {id:'binancecoin',   label:'BNB', color: '#F0B90B'},
      {id:'ripple',        label:'XRP', color: '#00AAE4'},
      {id:'cardano',       label:'ADA', color: '#0033AD'},
    ];

    // Fetch all in parallel
    const results = await Promise.all(ASSETS.map(a=>getRSIHistory(a.id)));

    function rsiLabel(v){
      if(!v) return {txt:'Loading',col:MUTED};
      if(v>=70) return {txt:'Overbought',col:RED};
      if(v>=55) return {txt:'Bullish',col:ACCENT};
      if(v>=45) return {txt:'Neutral',col:GOLD};
      if(v>=30) return {txt:'Weak',col:ORANGE};
      return {txt:'Oversold',col:BLUE};
    }
    function rsiColor(v){
      if(!v) return MUTED;
      if(v>=70) return RED;
      if(v>=55) return ACCENT;
      if(v>=45) return GOLD;
      if(v>=30) return ORANGE;
      return BLUE;
    }
    function trendArrow(cur, lo, hi){
      if(!cur||!lo||!hi) return {txt:'—',col:MUTED};
      const mid = (parseFloat(lo)+parseFloat(hi))/2;
      const pos = (cur-mid)/(parseFloat(hi)-parseFloat(lo)||1);
      if(pos>0.3) return {txt:'↑ Rising',col:ACCENT};
      if(pos<-0.3) return {txt:'↓ Falling',col:RED};
      return {txt:'→ Ranging',col:GOLD};
    }

    // ── Stat cards
    ASSETS.forEach((a,i)=>{
      const r = results[i];
      const v = r?.current;
      const lbl = rsiLabel(v);
      const col = rsiColor(v);
      const idMap = {bitcoin:'rsibtc',ethereum:'rsieth',solana:'rsisol',binancecoin:'rsibnb',ripple:'rsixrp',cardano:'rsiada'};
      const lblMap = {bitcoin:'rsibtcLbl',ethereum:'rsiethLbl',solana:'rsisolLbl',binancecoin:'rsibnbLbl',ripple:'rsixrpLbl',cardano:'rsiadaLbl'};
      const valEl = document.getElementById(idMap[a.id]);
      const lblEl = document.getElementById(lblMap[a.id]);
      if(valEl){ valEl.textContent = v ? v.toFixed(1) : '—'; valEl.style.color = col; }
      if(lblEl){ lblEl.textContent = lbl.txt; lblEl.style.color = lbl.col; }
    });

    // ── RSI Gauge (horizontal bar chart — all 6 assets)
    if(rsiGaugeEl){
      const vals  = results.map(r=>r?.current||0);
      const cols  = vals.map(v=>rsiColor(v));
      new Chart(rsiGaugeEl,{
        type:'bar',
        data:{
          labels: ASSETS.map(a=>a.label+' 14D'),
          datasets:[{
            label:'RSI',
            data: vals,
            backgroundColor: cols.map(c=>c+'cc'),
            borderColor: cols,
            borderWidth: 1,
            borderRadius: 5,
            borderSkipped: false,
          }]
        },
        options:{
          indexAxis:'y',
          responsive:true,
          plugins:{
            legend:{display:false},
            tooltip:{callbacks:{label:v=>`RSI: ${v.raw.toFixed(1)} — ${rsiLabel(v.raw).txt}`}}
          },
          scales:{
            x:{min:0,max:100,grid:{color:'#1c2d38'},
              ticks:{color:MUTED,callback:v=>v},
              // Zone bands
            },
            y:{grid:{color:'#1c2d38'},ticks:{color:MUTED,font:{size:10}}}
          }
        }
      });
      // Draw zone overlay labels
    }

    // ── BTC RSI 30-day line
    const btcResult = results[0];
    if(rsiLineEl && btcResult?.vals30?.length){
      const g = hexGrad(rsiLineEl, BLUE);
      new Chart(rsiLineEl,{
        type:'line',
        data:{
          labels: btcResult.labels30,
          datasets:[
            {label:'BTC RSI 14D', data:btcResult.vals30, borderColor:BLUE, backgroundColor:g, fill:true, tension:0.4, pointRadius:2, pointBackgroundColor:BLUE, pointHoverRadius:5},
            {label:'Overbought (70)', data:Array(btcResult.labels30.length).fill(70), borderColor:'rgba(255,69,96,.4)', borderDash:[5,4], fill:false, pointRadius:0},
            {label:'Neutral (50)',    data:Array(btcResult.labels30.length).fill(50), borderColor:'rgba(244,197,66,.3)', borderDash:[3,3], fill:false, pointRadius:0},
            {label:'Oversold (30)',  data:Array(btcResult.labels30.length).fill(30), borderColor:'rgba(0,232,122,.4)', borderDash:[5,4], fill:false, pointRadius:0},
          ]
        },
        options:{
          responsive:true,
          interaction:{mode:'index',intersect:false},
          plugins:{legend:{labels:{color:MUTED,font:{size:9},boxWidth:14}}},
          scales:{
            y:{min:15,max:90,grid:{color:'#1c2d38'},ticks:{color:MUTED}},
            x:{grid:{color:'#1c2d38'},ticks:{color:MUTED,maxTicksLimit:7}}
          }
        }
      });
    }

    // ── Multi-asset RSI comparison (last 30 days)
    if(rsiMultiEl){
      const labels = btcResult?.labels30 || [];
      const datasets = ASSETS.map((a,i)=>({
        label: a.label,
        data: results[i]?.vals30 || [],
        borderColor: a.color,
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 2,
      }));
      new Chart(rsiMultiEl,{
        type:'line',
        data:{labels, datasets},
        options:{
          responsive:true,
          interaction:{mode:'index',intersect:false},
          plugins:{legend:{labels:{color:MUTED,font:{size:9},boxWidth:14,padding:14}}},
          scales:{
            y:{min:15,max:90,grid:{color:'#1c2d38'},ticks:{color:MUTED}},
            x:{grid:{color:'#1c2d3820'},ticks:{color:MUTED,maxTicksLimit:8}}
          }
        }
      });
    }

    // ── RSI signal table
    if(rsiTableBody){
      rsiTableBody.innerHTML = ASSETS.map((a,i)=>{
        const r   = results[i];
        const cur = r?.current;
        const r7  = r?.rsi7d;
        const lbl = rsiLabel(cur);
        const col = rsiColor(cur);
        const trnd= trendArrow(cur, r?.low30, r?.high30);
        const barW = cur ? Math.round(cur) : 0;
        const barCol = col;
        return `<tr style="border-bottom:1px solid rgba(28,45,56,.4);transition:background .12s" onmouseover="this.style.background='rgba(0,232,122,.03)'" onmouseout="this.style.background=''">
          <td style="padding:10px 12px">
            <span style="font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;color:#fff">${a.label}</span>
          </td>
          <td style="text-align:center;padding:10px 12px">
            <span style="font-family:'Space Mono',monospace;font-size:14px;font-weight:700;color:${col}">${cur?cur.toFixed(1):'—'}</span>
          </td>
          <td style="text-align:center;padding:10px 12px">
            <span style="font-family:'Space Mono',monospace;font-size:13px;color:${rsiColor(r7)}">${r7?r7.toFixed(1):'—'}</span>
          </td>
          <td style="text-align:center;padding:10px 12px">
            <span style="background:${col}22;color:${col};border:1px solid ${col}44;padding:3px 10px;border-radius:4px;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:1px">${lbl.txt.toUpperCase()}</span>
          </td>
          <td style="text-align:center;padding:10px 12px;font-family:'Space Mono',monospace;font-size:11px;color:${RED}">${r?.high30||'—'}</td>
          <td style="text-align:center;padding:10px 12px;font-family:'Space Mono',monospace;font-size:11px;color:${ACCENT}">${r?.low30||'—'}</td>
          <td style="padding:10px 12px">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="flex:1;height:6px;background:var(--bg3);border-radius:3px;overflow:hidden">
                <div style="width:${barW}%;height:100%;background:${barCol};border-radius:3px;transition:width .6s ease"></div>
              </div>
              <span style="font-family:'Space Mono',monospace;font-size:9px;color:${trnd.col};white-space:nowrap">${trnd.txt}</span>
            </div>
          </td>
        </tr>`;
      }).join('');
    }
  }

