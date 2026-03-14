/* ═══════════════════════════════════════════════════════════════
   CHAINROOT LIVE NEWS ENGINE v2
   Sources: CryptoCompare · CoinTelegraph · CoinDesk · Reuters RSS
   Tweets: @WatcherGuru (Crypto) · @zerohedge (TradFi) via Railway
   Translation: MyMemory API → Mongolian
   Auto-refresh: 10 min news · 15 min tweets
═══════════════════════════════════════════════════════════════ */

const CR_NEWS_API = 'https://chainroot-production.up.railway.app';

// ── TWEET ENGINE ─────────────────────────────────────────────────────────────
const TWEETS = (function(){
  var _cache = { crypto: [], tradfi: [] };
  var _translated = {};

  async function _translate(id, text) {
    if (_translated[id]) return _translated[id];
    try {
      var r = await fetch(CR_NEWS_API + '/api/translate?text=' + encodeURIComponent(text.slice(0, 400)), {signal: AbortSignal.timeout(8000)});
      if (!r.ok) return null;
      var d = await r.json();
      if (d.translation && d.translation !== text) { _translated[id] = d.translation; return d.translation; }
    } catch(e) {}
    return null;
  }

  function _timeAgo(ms) {
    if (!ms) return '';
    var m = Math.floor((Date.now() - ms) / 60000);
    if (m < 1) return 'Одоо';
    if (m < 60) return m + 'мин өмнө';
    var h = Math.floor(m / 60);
    if (h < 24) return h + 'ц өмнө';
    return Math.floor(h / 24) + 'өдр өмнө';
  }

  function _renderTweet(tw, type) {
    var color = type === 'crypto' ? 'var(--accent)' : 'var(--blue)';
    var account = type === 'crypto' ? '@WatcherGuru' : '@zerohedge';
    var mn = _translated[tw.id] || '';
    return '<div class="tweet-card" style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:10px;">'
      + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">'
      +   '<div style="width:32px;height:32px;border-radius:50%;background:' + color + '22;border:1px solid ' + color + '44;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:' + color + ';font-family:Space Mono,monospace">𝕏</div>'
      +   '<div><div style="font-family:Space Grotesk,sans-serif;font-size:12px;font-weight:700;color:var(--text)">' + account + '</div>'
      +   '<div style="font-family:Space Mono,monospace;font-size:9px;color:var(--muted)">' + _timeAgo(tw.time) + '</div></div>'
      +   '<a href="' + (tw.url||'#') + '" target="_blank" rel="noopener" style="margin-left:auto;color:var(--muted);font-size:12px;text-decoration:none">↗</a>'
      + '</div>'
      + '<div style="font-family:Inter,sans-serif;font-size:13px;color:var(--text);line-height:1.65;margin-bottom:' + (mn ? '8px' : '4px') + '">' + (tw.text || '') + '</div>'
      + (mn
        ? '<div style="font-size:12px;color:var(--muted);line-height:1.6;padding:8px 12px;background:rgba(255,255,255,.03);border-left:2px solid ' + color + '44;border-radius:0 4px 4px 0">'
        +   '<span style="font-family:Space Mono,monospace;font-size:8px;color:' + color + ';letter-spacing:1.5px;display:block;margin-bottom:4px">МН ·</span>' + mn + '</div>'
        : '<button onclick="TWEETS.translateOne(\'' + tw.id + '\',\'' + encodeURIComponent((tw.text||'').slice(0,400)) + '\')" style="margin-top:4px;padding:4px 10px;background:transparent;border:1px solid var(--border);border-radius:4px;font-family:Space Mono,monospace;font-size:9px;color:var(--muted);cursor:pointer">🇲🇳 Монголоор уншмаар байна уу?</button>'
        )
      + '</div>';
  }

  function _renderAll() {
    var gc = document.getElementById('tweet-grid-crypto');
    var gt = document.getElementById('tweet-grid-tradfi');
    if (gc) gc.innerHTML = _cache.crypto.length
      ? _cache.crypto.map(function(tw){ return _renderTweet(tw,'crypto'); }).join('')
      : '<div style="padding:20px;text-align:center;font-family:Space Mono,monospace;font-size:10px;color:var(--muted)">Твит ачаалж байна…</div>';
    if (gt) gt.innerHTML = _cache.tradfi.length
      ? _cache.tradfi.map(function(tw){ return _renderTweet(tw,'tradfi'); }).join('')
      : '<div style="padding:20px;text-align:center;font-family:Space Mono,monospace;font-size:10px;color:var(--muted)">Твит ачаалж байна…</div>';
  }

  async function _fetch() {
    try {
      var [rc, rt] = await Promise.allSettled([
        fetch(CR_NEWS_API + '/api/tweets/crypto', {signal:AbortSignal.timeout(15000)}).then(function(r){return r.json();}),
        fetch(CR_NEWS_API + '/api/tweets/tradfi',  {signal:AbortSignal.timeout(15000)}).then(function(r){return r.json();})
      ]);
      if (rc.status==='fulfilled' && rc.value.tweets) _cache.crypto = rc.value.tweets.slice(0,10);
      if (rt.status==='fulfilled' && rt.value.tweets) _cache.tradfi  = rt.value.tweets.slice(0,10);
      _renderAll();
      // Auto-translate first 3 of each
      var toTr = _cache.crypto.slice(0,3).concat(_cache.tradfi.slice(0,3));
      for (var i = 0; i < toTr.length; i++) {
        await _translate(toTr[i].id, toTr[i].text||'');
        await new Promise(function(r){setTimeout(r,300);});
      }
      _renderAll();
    } catch(e){ console.warn('[ChainRoot] Tweets:', e.message); }
  }

  return {
    init: function(){ _fetch(); setInterval(_fetch, 15*60*1000); },
    refresh: _fetch,
    translateOne: async function(id, enc) {
      var btn = event && event.currentTarget;
      if (btn) { btn.textContent='⟳ Орчуулж байна…'; btn.disabled=true; }
      var mn = await _translate(id, decodeURIComponent(enc));
      if (mn) { _renderAll(); } else if (btn) { btn.textContent='⚠ Орчуулга олдсонгүй'; }
    }
  };
})();

// ── NEWS ENGINE ───────────────────────────────────────────────────────────────
const NEWS = (function(){
  const PROXY  = 'https://api.allorigins.win/get?url=';
  const PAGE_SZ = 20;
  let allArticles=[], filtered=[], currentCat='all', displayCount=PAGE_SZ;

  async function fetchRSS(feedUrl, defaultCat) {
    try {
      var r = await fetch(PROXY + encodeURIComponent(feedUrl), {signal:AbortSignal.timeout(14000)});
      if (!r.ok) return [];
      var j = await r.json();
      var doc = new DOMParser().parseFromString(j.contents||'','text/xml');
      var srcName = doc.querySelector('channel > title')?.textContent?.trim().split('|')[0].trim() || feedUrl.split('/')[2];
      return Array.from(doc.querySelectorAll('item')).slice(0,15).map(function(item,i){
        var title  = item.querySelector('title')?.textContent?.replace(/<[^>]+>/g,'').trim()||'';
        var desc   = item.querySelector('description')?.textContent?.replace(/<[^>]+>/g,'').slice(0,260).trim()||'';
        var link   = item.querySelector('link')?.textContent?.trim()||'#';
        var pub    = item.querySelector('pubDate')?.textContent?.trim()||'';
        var img    = item.querySelector('enclosure[type^="image"]')?.getAttribute('url')||item.querySelector('thumbnail')?.getAttribute('url')||'';
        return {id:'rss_'+i+'_'+Date.now(), title, body:desc, url:link, source:srcName,
          time:pub?new Date(pub).getTime():Date.now()-i*300000,
          cat:catFromText(defaultCat,title), sentiment:sentFromText(title+' '+desc), imageUrl:img};
      }).filter(function(a){return a.title;});
    } catch(e){ return []; }
  }

  const SOURCES = [
    {id:'cryptocompare', async fetch(){
      try {
        var r=await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest',{signal:AbortSignal.timeout(12000)});
        if(!r.ok)return[];
        var d=await r.json();
        return (d.Data||[]).slice(0,30).map(function(a){return{
          id:'cc_'+a.id, title:a.title, body:(a.body||'').replace(/<[^>]+>/g,'').slice(0,260),
          url:a.url, source:a.source_info?.name||'CryptoCompare',
          time:(a.published_on||0)*1000, cat:catFromText(a.categories||'',a.title),
          sentiment:sentVotes(a.upvotes,a.downvotes), imageUrl:a.imageurl||''};});
      } catch(e){return[];}
    }},
    {id:'cointelegraph', async fetch(){return fetchRSS('https://cointelegraph.com/rss','crypto');}},
    {id:'coindesk',      async fetch(){return fetchRSS('https://www.coindesk.com/arc/outboundfeeds/rss/','crypto');}},
    {id:'decrypt',       async fetch(){return fetchRSS('https://decrypt.co/feed','crypto');}},
    {id:'cnbc-markets',  async fetch(){return fetchRSS('https://www.cnbc.com/id/20910258/device/rss/rss.html','macro');}},
    {id:'reuters-biz',   async fetch(){return fetchRSS('https://feeds.reuters.com/reuters/businessNews','macro');}},
    {id:'investing',     async fetch(){return fetchRSS('https://www.investing.com/rss/news.rss','macro');}},
    {id:'invest-eq',     async fetch(){return fetchRSS('https://www.investing.com/rss/news_25.rss','stocks');}},
  ];

  function catFromText(hint,title){
    var t=(hint+' '+title).toLowerCase();
    if(/defi|uniswap|aave|curve|tvl|amm|raydium|orca|yield farm/i.test(t)) return 'defi';
    if(/bitcoin|ethereum|solana|crypto|btc|eth|sol|nft|blockchain|web3|altcoin|binance|stablecoin|xrp|bnb|doge/i.test(t)) return 'crypto';
    if(/gold|silver|oil|crude|natural gas|wheat|corn|commodity|commodities|wti|brent|xau|xag|metal|copper/i.test(t)) return 'commodities';
    if(/stock|equity|nasdaq|s&p|dow|aapl|msft|nvda|tsla|earnings|ipo|nyse|shares|dividend/i.test(t)) return 'stocks';
    if(/fed|federal|inflation|cpi|ppi|gdp|interest rate|treasury|dollar|dxy|macro|economic|recession|central bank|fomc|m2/i.test(t)) return 'macro';
    return 'crypto';
  }
  var BULL=/surge|soar|rally|gain|bullish|pump|green|rise|high|record|ath|bull|buy|breakout|recovery|growth|adoption|upgrade/i;
  var BEAR=/crash|drop|fall|decline|bearish|dump|red|low|loss|bear|sell|correction|fear|hack|exploit|ban|lawsuit|regulat|fine|liquidat|bankrupt|plunge|warning/i;
  function sentFromText(t){var b=(t.match(BULL)||[]).length,br=(t.match(BEAR)||[]).length;return b>br?'bullish':br>b?'bearish':'neutral';}
  function sentVotes(up,down){var u=parseInt(up)||0,d=parseInt(down)||0;return u>d*1.3?'bullish':d>u*1.3?'bearish':'neutral';}
  function dedupe(arr){var seen=new Set();return arr.filter(function(a){var k=a.title.slice(0,55).toLowerCase();if(seen.has(k))return false;seen.add(k);return true;});}
  function timeAgo(ms){if(!ms)return'';var m=Math.floor((Date.now()-ms)/60000);if(m<1)return'Just now';if(m<60)return m+'m ago';var h=Math.floor(m/60);if(h<24)return h+'h ago';return Math.floor(h/24)+'d ago';}
  function sentTag(s){if(s==='bullish')return'<span class="news-sentiment-tag nst-bull">▲ Bullish</span>';if(s==='bearish')return'<span class="news-sentiment-tag nst-bear">▼ Bearish</span>';return'<span class="news-sentiment-tag nst-neut">→ Neutral</span>';}
  function catBadge(cat){var m={crypto:['ncb-crypto','🔗 Crypto'],defi:['ncb-defi','⬡ DeFi'],stocks:['ncb-stocks','📈 Stocks'],macro:['ncb-macro','🌐 Macro'],commodities:['ncb-commodities','🪨 Commodities']};var r=m[cat]||['ncb-news',cat];return'<span class="news-cat-badge '+r[0]+'">'+r[1]+'</span>';}

  function render(){
    var grid=document.getElementById('news-grid');if(!grid)return;
    var slice=filtered.slice(0,displayCount);
    if(!slice.length){grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:60px;font-family:\'Space Mono\',monospace;font-size:11px;color:var(--muted)">No articles found</div>';document.getElementById('news-load-more').style.display='none';return;}
    grid.innerHTML=slice.map(function(a,i){
      var isHero=i===0,hasImg=a.imageUrl&&a.imageUrl.startsWith('http');
      return '<a href="'+a.url+'" target="_blank" rel="noopener noreferrer" class="news-card'+(isHero?' featured news-hero':'')+'" style="text-decoration:none">'
        +(hasImg?'<img class="news-card-img" src="'+a.imageUrl+'" alt="" loading="lazy" onerror="this.style.display=\'none\'"/>':'')
        +'<div class="news-card-top"><span class="news-card-source">'+a.source+'</span><span class="news-card-time">'+timeAgo(a.time)+'</span></div>'
        +'<div class="news-card-title">'+a.title+'</div>'
        +(a.body?'<div class="news-card-body">'+a.body+'</div>':'')
        +'<div class="news-card-footer">'+catBadge(a.cat)+sentTag(a.sentiment)+'</div>'
        +'</a>';
    }).join('');
    document.getElementById('news-load-more').style.display=filtered.length>displayCount?'block':'none';
    var bull=filtered.filter(function(a){return a.sentiment==='bullish';}).length;
    var bear=filtered.filter(function(a){return a.sentiment==='bearish';}).length;
    var neut=filtered.length-bull-bear,tot=filtered.length||1;
    var bb=document.getElementById('news-bull-bar'),nb=document.getElementById('news-neut-bar'),rb=document.getElementById('news-bear-bar'),st=document.getElementById('news-sentiment-txt');
    if(bb)bb.style.width=(bull/tot*100).toFixed(1)+'%';
    if(nb)nb.style.width=(neut/tot*100).toFixed(1)+'%';
    if(rb)rb.style.width=(bear/tot*100).toFixed(1)+'%';
    if(st){st.textContent=bull>bear*1.5?'Bullish 📈':bear>bull*1.5?'Bearish 📉':'Neutral ↔';st.style.color=bull>bear*1.5?'var(--accent)':bear>bull*1.5?'var(--red)':'var(--muted)';}
    var nsTotal=document.getElementById('ns-total'),nsBull=document.getElementById('ns-bull'),nsBear=document.getElementById('ns-bear'),nsSrc=document.getElementById('ns-src');
    if(nsTotal)nsTotal.textContent=filtered.length+' articles';
    if(nsBull)nsBull.textContent=bull+' bullish';
    if(nsBear)nsBear.textContent=bear+' bearish';
    if(nsSrc)nsSrc.textContent=new Set(allArticles.map(function(a){return a.source;})).size+' sources';
  }

  function applyFilter(){
    var q=(document.getElementById('news-search')?.value||'').toLowerCase();
    filtered=allArticles.filter(function(a){
      var mc=currentCat==='all'||a.cat===currentCat;
      var mq=!q||a.title.toLowerCase().includes(q)||(a.body||'').toLowerCase().includes(q)||a.source.toLowerCase().includes(q);
      return mc&&mq;
    });
    displayCount=PAGE_SZ;render();
  }

  async function fetchAll(){
    var results=await Promise.allSettled(SOURCES.map(function(s){return s.fetch();}));
    var fresh=[];
    results.forEach(function(r){if(r.status==='fulfilled')fresh=fresh.concat(r.value);});
    if(fresh.length){
      allArticles=dedupe(fresh).sort(function(a,b){return b.time-a.time;});
      applyFilter();
      var upd=document.getElementById('news-last-updated');
      if(upd)upd.textContent='Updated '+new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
    } else if(!allArticles.length){
      var grid=document.getElementById('news-grid');
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

function newsRefresh(){NEWS.refresh();TWEETS.refresh();var btn=event&&event.currentTarget;if(btn){var orig=btn.textContent;btn.textContent='⟳ Fetching…';setTimeout(function(){btn.textContent=orig;},3000);}}
function newsSetCat(cat,el){document.querySelectorAll('.news-tab').forEach(function(t){t.classList.remove('on');});if(el)el.classList.add('on');NEWS.setCat(cat);}
function newsFilter(){NEWS.filter();}
function newsLoadMore(){NEWS.loadMore();}

// Lazy-init via go() in auth.js — called when news panel opens
window._newsInit = function(){
  if(!window._newsInited){window._newsInited=true;NEWS.init();TWEETS.init();}
};
