/* ═══════════════════════════════════════════════════════════════
   CHAINROOT LIVE NEWS ENGINE
   Sources: CryptoCompare · Finnhub · RSS via AllOrigins proxy
   Auto-refresh: 10 min · Filter by category · Sentiment tagging
═══════════════════════════════════════════════════════════════ */
const NEWS = (function(){
  const FH_KEY   = 'd0eaie9r01qgv48uo9igd0eaie9r01qgv48uo9j0';
  const PROXY    = 'https://api.allorigins.win/get?url=';
  const PAGE_SZ  = 20;

  let allArticles = [], filtered = [], currentCat = 'all', displayCount = PAGE_SZ;

  // ── RSS helper ──────────────────────────────────────────────
  async function fetchRSS(feedUrl, defaultCat) {
    try {
      const r = await fetch(PROXY + encodeURIComponent(feedUrl), {signal:AbortSignal.timeout(14000)});
      if (!r.ok) return [];
      const j = await r.json();
      const doc = new DOMParser().parseFromString(j.contents||'', 'text/xml');
      const srcName = doc.querySelector('channel > title')?.textContent?.trim().split('|')[0].trim() || feedUrl.split('/')[2];
      return Array.from(doc.querySelectorAll('item')).slice(0,15).map(function(item,i){
        const title  = item.querySelector('title')?.textContent?.replace(/<[^>]+>/g,'').trim()||'';
        const desc   = item.querySelector('description')?.textContent?.replace(/<[^>]+>/g,'').slice(0,260).trim()||'';
        const link   = item.querySelector('link')?.textContent?.trim()||'#';
        const pubDate= item.querySelector('pubDate')?.textContent?.trim()||'';
        const img    = item.querySelector('enclosure[type^="image"]')?.getAttribute('url')||item.querySelector('thumbnail')?.getAttribute('url')||'';
        return {id:'rss_'+i+'_'+Date.now(), title:title, body:desc, url:link, source:srcName,
          time:pubDate?new Date(pubDate).getTime():Date.now()-i*300000,
          cat:catFromText(defaultCat,title), sentiment:sentimentFromText(title+' '+desc), imageUrl:img};
      }).filter(function(a){return a.title;});
    } catch(e){ return []; }
  }

  // ── Sources ─────────────────────────────────────────────────
  const SOURCES = [
    {id:'cryptocompare', async fetch(){
      try{
        const r=await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest',{signal:AbortSignal.timeout(12000)});
        if(!r.ok)return[];
        const d=await r.json();
        return(d.Data||[]).slice(0,30).map(function(a){return{
          id:'cc_'+a.id, title:a.title, body:(a.body||'').replace(/<[^>]+>/g,'').slice(0,260),
          url:a.url, source:a.source_info?.name||a.source||'CryptoCompare',
          time:(a.published_on||0)*1000, cat:catFromText(a.categories||'',a.title),
          sentiment:sentVotes(a.upvotes,a.downvotes), imageUrl:a.imageurl||''};});
      }catch(e){return[];}
    }},
    {id:'finnhub-general', async fetch(){
      try{
        const r=await fetch('https://finnhub.io/api/v1/news?category=general&token='+FH_KEY,{signal:AbortSignal.timeout(10000)});
        if(!r.ok)return[];
        const d=await r.json();
        return(d||[]).slice(0,20).map(function(a){return{
          id:'fh_'+a.id, title:a.headline, body:a.summary||'', url:a.url,
          source:a.source||'Finnhub', time:(a.datetime||0)*1000,
          cat:catFromText(a.category||'',a.headline), sentiment:sentimentFromText(a.headline+' '+(a.summary||'')),
          imageUrl:a.image||''};});
      }catch(e){return[];}
    }},
    {id:'finnhub-crypto', async fetch(){
      try{
        const r=await fetch('https://finnhub.io/api/v1/news?category=crypto&token='+FH_KEY,{signal:AbortSignal.timeout(10000)});
        if(!r.ok)return[];
        const d=await r.json();
        return(d||[]).slice(0,20).map(function(a){return{
          id:'fhc_'+a.id, title:a.headline, body:a.summary||'', url:a.url,
          source:a.source||'Finnhub', time:(a.datetime||0)*1000,
          cat:catFromText('crypto',a.headline), sentiment:sentimentFromText(a.headline+' '+(a.summary||'')),
          imageUrl:a.image||''};});
      }catch(e){return[];}
    }},
    {id:'cointelegraph',  async fetch(){return fetchRSS('https://cointelegraph.com/rss','crypto');}},
    {id:'coindesk',       async fetch(){return fetchRSS('https://www.coindesk.com/arc/outboundfeeds/rss/','crypto');}},
    {id:'decrypt',        async fetch(){return fetchRSS('https://decrypt.co/feed','crypto');}},
    {id:'investing',      async fetch(){return fetchRSS('https://www.investing.com/rss/news.rss','macro');}},
    {id:'invest-cmd',     async fetch(){return fetchRSS('https://www.investing.com/rss/news_288.rss','commodities');}},
    {id:'invest-eq',      async fetch(){return fetchRSS('https://www.investing.com/rss/news_25.rss','stocks');}},
    {id:'cnbc',           async fetch(){return fetchRSS('https://www.cnbc.com/id/20409666/device/rss/rss.html','stocks');}},
  ];

  // ── Helpers ─────────────────────────────────────────────────
  function catFromText(hint,title){
    const t=(hint+' '+title).toLowerCase();
    if(/defi|uniswap|aave|curve|tvl|amm|raydium|orca|yield farm/i.test(t)) return'defi';
    if(/bitcoin|ethereum|solana|crypto|btc|eth|sol|nft|blockchain|web3|altcoin|binance|stablecoin|xrp|bnb|doge/i.test(t)) return'crypto';
    if(/gold|silver|oil|crude|natural gas|wheat|corn|commodity|commodities|wti|brent|xau|xag|metal|copper/i.test(t)) return'commodities';
    if(/stock|equity|nasdaq|s&p|dow|aapl|msft|nvda|tsla|earnings|ipo|nyse|shares|dividend/i.test(t)) return'stocks';
    if(/fed|federal|inflation|cpi|ppi|gdp|interest rate|treasury|dollar|dxy|macro|economic|recession|central bank|fomc|m2/i.test(t)) return'macro';
    return'crypto';
  }
  const BULL=/surge|soar|rally|gain|bullish|pump|green|rise|high|record|ath|bull|buy|breakout|recovery|growth|adoption|upgrade/i;
  const BEAR=/crash|drop|fall|decline|bearish|dump|red|low|loss|bear|sell|correction|fear|hack|exploit|ban|lawsuit|regulat|fine|liquidat|bankrupt|plunge|warning/i;
  function sentimentFromText(t){const b=(t.match(BULL)||[]).length,br=(t.match(BEAR)||[]).length;return b>br?'bullish':br>b?'bearish':'neutral';}
  function sentVotes(up,down){const u=parseInt(up)||0,d=parseInt(down)||0;return u>d*1.3?'bullish':d>u*1.3?'bearish':'neutral';}
  function dedupe(arr){const seen=new Set();return arr.filter(function(a){const k=a.title.slice(0,55).toLowerCase();if(seen.has(k))return false;seen.add(k);return true;});}
  function timeAgo(ms){if(!ms)return'';const diff=Date.now()-ms,m=Math.floor(diff/60000);if(m<1)return'Just now';if(m<60)return m+'m ago';const h=Math.floor(m/60);if(h<24)return h+'h ago';return Math.floor(h/24)+'d ago';}
  function sentTag(s){if(s==='bullish')return'<span class="news-sentiment-tag nst-bull">▲ Bullish</span>';if(s==='bearish')return'<span class="news-sentiment-tag nst-bear">▼ Bearish</span>';return'<span class="news-sentiment-tag nst-neut">→ Neutral</span>';}
  function catBadge(cat){const m={crypto:['ncb-crypto','🔗 Crypto'],defi:['ncb-defi','⬡ DeFi'],stocks:['ncb-stocks','📈 Stocks'],macro:['ncb-macro','🌐 Macro'],commodities:['ncb-commodities','🪨 Commodities']};const[cls,lbl]=m[cat]||['ncb-news',cat];return'<span class="news-cat-badge '+cls+'">'+lbl+'</span>';}

  // ── Render ───────────────────────────────────────────────────
  function render(){
    const grid=document.getElementById('news-grid');if(!grid)return;
    const slice=filtered.slice(0,displayCount);
    if(!slice.length){grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:60px;font-family:\'Space Mono\',monospace;font-size:11px;color:var(--muted);letter-spacing:2px">No articles found</div>';document.getElementById('news-load-more').style.display='none';return;}
    grid.innerHTML=slice.map(function(a,i){
      const isHero=i===0, hasImg=a.imageUrl&&a.imageUrl.startsWith('http');
      return'<a href="'+a.url+'" target="_blank" rel="noopener noreferrer" class="news-card'+(isHero?' featured news-hero':'')+'" style="text-decoration:none">'
        +(hasImg?'<img class="news-card-img" src="'+a.imageUrl+'" alt="" loading="lazy" onerror="this.style.display=\'none\'"/>'  :'')
        +'<div class="news-card-top"><span class="news-card-source">'+a.source+'</span><span class="news-card-time">'+timeAgo(a.time)+'</span></div>'
        +'<div class="news-card-title">'+a.title+'</div>'
        +(a.body?'<div class="news-card-body">'+a.body+'</div>':'')
        +'<div class="news-card-footer">'+catBadge(a.cat)+sentTag(a.sentiment)+'</div>'
        +'</a>';
    }).join('');
    document.getElementById('news-load-more').style.display=filtered.length>displayCount?'block':'none';
    // Sentiment bar
    const bull=filtered.filter(function(a){return a.sentiment==='bullish';}).length;
    const bear=filtered.filter(function(a){return a.sentiment==='bearish';}).length;
    const neut=filtered.length-bull-bear, tot=filtered.length||1;
    const bb=document.getElementById('news-bull-bar'),nb=document.getElementById('news-neut-bar'),rb=document.getElementById('news-bear-bar'),st=document.getElementById('news-sentiment-txt');
    if(bb)bb.style.width=(bull/tot*100).toFixed(1)+'%';
    if(nb)nb.style.width=(neut/tot*100).toFixed(1)+'%';
    if(rb)rb.style.width=(bear/tot*100).toFixed(1)+'%';
    if(st){st.textContent=bull>bear*1.5?'Bullish 📈':bear>bull*1.5?'Bearish 📉':'Neutral ↔';st.style.color=bull>bear*1.5?'var(--accent)':bear>bull*1.5?'var(--red)':'var(--muted)';}
    const nsTotal=document.getElementById('ns-total'),nsBull=document.getElementById('ns-bull'),nsBear=document.getElementById('ns-bear'),nsSrc=document.getElementById('ns-src');
    if(nsTotal)nsTotal.textContent=filtered.length+' articles';
    if(nsBull)nsBull.textContent=bull+' bullish';
    if(nsBear)nsBear.textContent=bear+' bearish';
    if(nsSrc)nsSrc.textContent=new Set(allArticles.map(function(a){return a.source;})).size+' sources';
  }

  function applyFilter(){
    const q=(document.getElementById('news-search')?.value||'').toLowerCase();
    filtered=allArticles.filter(function(a){
      const mc=currentCat==='all'||a.cat===currentCat;
      const mq=!q||a.title.toLowerCase().includes(q)||(a.body||'').toLowerCase().includes(q)||a.source.toLowerCase().includes(q);
      return mc&&mq;
    });
    displayCount=PAGE_SZ;render();
  }

  async function fetchAll(){
    const results=await Promise.allSettled(SOURCES.map(function(s){return s.fetch();}));
    let fresh=[];
    results.forEach(function(r){if(r.status==='fulfilled')fresh=fresh.concat(r.value);});
    if(fresh.length){
      allArticles=dedupe(fresh).sort(function(a,b){return b.time-a.time;});
      applyFilter();
      const upd=document.getElementById('news-last-updated');
      if(upd)upd.textContent='Updated '+new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
    } else if(!allArticles.length){
      const grid=document.getElementById('news-grid');
      if(grid)grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:60px;font-family:\'Space Mono\',monospace;font-size:11px;color:var(--muted)">⚠ Could not load news — check connection</div>';
    }
  }

  return {
    init:function(){fetchAll();setInterval(fetchAll,10*60*1000);},
    refresh:function(){fetchAll();},
    setCat:function(c){currentCat=c;displayCount=PAGE_SZ;applyFilter();},
    filter:function(){applyFilter();},
    loadMore:function(){displayCount+=PAGE_SZ;render();}
  };
})();

function newsRefresh(){NEWS.refresh();const btn=event&&event.currentTarget;if(btn){const orig=btn.textContent;btn.textContent='⟳ Fetching…';setTimeout(function(){btn.textContent=orig;},3000);}}
function newsSetCat(cat,el){document.querySelectorAll('.news-tab').forEach(function(t){t.classList.remove('on');});if(el)el.classList.add('on');NEWS.setCat(cat);}
function newsFilter(){NEWS.filter();}
function newsLoadMore(){NEWS.loadMore();}

// Lazy-init: only fetch when news panel is first opened
(function(){
  const _orig=window.go;
  window.go=function(id,el){
    if(_orig)_orig(id,el);
    if(id==='news'&&!window._newsInited){window._newsInited=true;setTimeout(function(){NEWS.init();},80);}
  };
})();
