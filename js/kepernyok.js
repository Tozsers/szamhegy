/* ============================================================
   KÉPERNYŐK — térkép, játékosok, gardrób, pályaválasztó, játék, győzelem
   ============================================================ */
const app=document.getElementById('app');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const tipus=v=> typeof v==='number' ? 'n' : v==='=' ? 'e' : v==='−' ? 'o m' : 'o';
const csempe=(v,cls,extra='')=>`<div class="t ${cls}${String(v).length>=3?' d3':''}" ${extra}>${v}</div>`;
const aktRuha=lid=>{ const p=Tar.p(); if(p && p.ruha) return p.ruha; const s=lid&&SZINT(lid); return s && (s.id==='genius'||s.csoport==='einstein') ? 'csako' : null; };
const talk=(szoveg,hang='vidam',ruha=null)=>`<div class="talk" data-ruha="${ruha||''}"><div class="mascot">${Karcsi.svg(hang,ruha)}</div><div class="bubble">${esc(szoveg)}</div></div>`;
const nemaGomb=()=>`<button class="cbtn small" id="nema" aria-label="Hang ki/be">${Tar.d.nema?'NÉMA':'HANG'}</button>`;
function nemaBekot(){ const b=document.getElementById('nema'); if(b) b.onclick=()=>{ Tar.d.nema=!Tar.d.nema; Tar.ment(); b.textContent=Tar.d.nema?'NÉMA':'HANG'; Hang.tesz(); }; }
let idleT=null; const stopIdle=()=>{ clearTimeout(idleT); idleT=null; };
const ujKepernyo=()=>{ stopIdle(); clearInterval(window.__tick); if(window.__klubBil){ removeEventListener('keydown',window.__klubBil); removeEventListener('keyup',window.__klubBil); window.__klubBil=null; } if(typeof Tavirohang!=='undefined') Tavirohang.ki(); document.querySelectorAll('.overlay,.rulesbg,.ghost').forEach(e=>e.remove()); window.onresize=null; scrollTo(0,0); };

/* ---------- Szabálykönyv ---------- */
function miniKocka(expr){
  if(!expr) return '';
  return `<div class="mini">${expr.split(' ').map(t=>{
    const cls = /^\d+$/.test(t)?'n' : t==='?'?'b' : (t==='='||t==='≠'||t==='≈')?'e' : t==='−'?'o m' : 'o';
    return `<div class="t ${cls}${t.length>=3?' d3':''}">${t==='?'?'':t}</div>`; }).join('')}</div>`;
}
function szabalyKonyv(lid){
  const s=SZINT(lid), lista=SZINTEK.filter(x=>x.csoport===s.csoport), i=lista.indexOf(s);
  const korabbi=(s.csoport==='einstein' ? lista.slice(0,i) : SZINTEK.filter(x=>x.csoport==='hegy').slice(0,i));
  const kartya=(id,r,j)=>`<div class="rule" data-rid="${id}:${j}"><div class="rc">${esc(r.c)}</div><div class="rt">${esc(r.t)}</div>${r.k?`<div class="rk">${esc(r.k)}</div>`:''}${miniKocka(r.p)}</div>`;
  return `<div class="rhead">SZABÁLYKÖNYV<small>${esc(s.nev)}</small></div>
    ${SZABALYOK[lid].map((r,j)=>kartya(lid,r,j)).join('')}
    <div class="rnote">${esc(KARCSI_MEGJ[lid])}</div>
    ${korabbi.length?`<details class="rold"><summary>Korábbi szabályok</summary>${korabbi.map(k=>`<div class="rsub">${esc(k.nev)}</div>${SZABALYOK[k.id].map((r,j)=>kartya(k.id,r,j)).join('')}`).join('')}</details>`:''}
    <div class="rhidden" hidden>${SZINTEK.filter(x=>x!==s && !korabbi.includes(x)).map(k=>SZABALYOK[k.id].map((r,j)=>kartya(k.id,r,j)).join('')).join('')}</div>`;
}
const szabalyAside=lid=>`<aside class="rules" id="rules" aria-label="Szabálykönyv">${szabalyKonyv(lid)}<button class="cbtn small rclose" id="rzar">BEZÁR</button></aside>`;
const szabGomb=()=>`<button class="cbtn small szabgomb" id="szab">SZABÁLYOK</button>`;
function szabBekot(){
  const r=document.getElementById('rules'), g=document.getElementById('szab'), z=document.getElementById('rzar');
  if(!r) return;
  const zar=()=>{ r.classList.remove('nyitva'); document.querySelectorAll('.rulesbg').forEach(b=>b.remove()); };
  if(g) g.onclick=()=>{ Hang.tesz(); g.classList.remove('jelez'); const bg=document.createElement('div'); bg.className='rulesbg'; bg.onclick=zar; document.body.appendChild(bg); r.classList.add('nyitva'); };
  if(z) z.onclick=zar;
}
/* egy szabály felvillantása (a hibaelemzés hívja) */
function szabalyVillan(rid){
  const r=document.getElementById('rules'); if(!r||!rid) return;
  let el=r.querySelector(`.rule[data-rid="${rid}"]`);
  if(el && el.closest('.rhidden')){ // más szint szabálya: a lap aljára másoljuk
    const kl=el.cloneNode(true); kl.classList.add('vendeg'); r.querySelectorAll('.vendeg').forEach(v=>v.remove()); r.querySelector('.rnote').before(kl); el=kl; }
  if(!el) return;
  const d=el.closest('details'); if(d) d.open=true;
  r.querySelectorAll('.villan').forEach(v=>v.classList.remove('villan')); void el.offsetWidth; el.classList.add('villan');
  if(getComputedStyle(r).display!=='none') el.scrollIntoView({block:'nearest',behavior:'smooth'});
  const g=document.getElementById('szab'); if(g){ g.classList.remove('jelez'); void g.offsetWidth; g.classList.add('jelez'); }
}

/* ---------- JÁTÉKOSOK ---------- */
function jatekosok(ujForm=false){
  ujKepernyo();
  const lista=Object.values(Tar.d.profilok);
  const form = ujForm || !lista.length;
  app.innerHTML=`
    <div class="banner"><h1>SZÁMHEGY</h1></div>
    ${talk(lista.length?veletlen(DUMA.udv):'Szia! Kocka Karcsi vagyok. Mondd meg a neved, és hogy hányadikos vagy, és kitalálom, hol kezdjünk!','vidam')}
    <div class="panel">
      ${lista.length?`<div class="plist">${lista.map(p=>`<div class="pcard ${p.id===Tar.d.aktiv?'akt':''}">
          <button class="pvalaszt" data-id="${p.id}"><div class="pav">${Karcsi.svg('vidam',p.ruha)}</div>
          <div class="pinfo"><div class="pnm">${esc(p.nev)}</div><div class="psub">${esc((OSZTALYOK.find(o=>o[0]===p.osztaly)||[,''])[1])} · ★ ${Tar.osszCs(p)}</div></div></button>
          <button class="ptorol" data-id="${p.id}" aria-label="${esc(p.nev)} törlése">✕</button></div>`).join('')}</div>`:''}
      ${form?`<form class="pform" id="pform">
          <label for="pnev">Név</label><input id="pnev" maxlength="16" autocomplete="off" placeholder="Például: Bence" required>
          <label for="posz">Osztály</label><select id="posz">${OSZTALYOK.map(o=>`<option value="${o[0]}" ${o[0]==='3'?'selected':''}>${o[1]}</option>`).join('')}</select>
          <div class="row">${lista.length?'<button type="button" class="cbtn small" id="mégse">MÉGSE</button>':''}<button class="cbtn pink" type="submit">MEHET!</button></div>
        </form>`:`<div class="row"><button class="cbtn small blue" id="ujj">+ ÚJ JÁTÉKOS</button></div>`}
    </div>`;
  app.querySelectorAll('.pvalaszt').forEach(b=>b.onclick=()=>{ Tar.d.aktiv=b.dataset.id; Tar.ment(); Hang.tesz(); terkep(); });
  app.querySelectorAll('.ptorol').forEach(b=>b.onclick=()=>{
    if(b.dataset.biztos){ Tar.torol(b.dataset.id); Hang.vissza(); jatekosok(); return; }
    b.dataset.biztos='1'; b.textContent='TÖRLÖD?'; b.classList.add('biztos'); setTimeout(()=>{ if(b.isConnected){ delete b.dataset.biztos; b.textContent='✕'; b.classList.remove('biztos'); } },3000);
  });
  const uj=document.getElementById('ujj'); if(uj) uj.onclick=()=>jatekosok(true);
  const m=document.getElementById('mégse'); if(m) m.onclick=()=>jatekosok();
  const f=document.getElementById('pform');
  if(f){ f.onsubmit=e=>{ e.preventDefault(); const n=document.getElementById('pnev').value.trim(); if(!n) return; Tar.uj(n, document.getElementById('posz').value); Hang.gyoz(); terkep(); };
    setTimeout(()=>document.getElementById('pnev')?.focus(),50); }
}

/* ---------- GARDRÓB ---------- */
function gardrob(){
  ujKepernyo();
  const p=Tar.p(), cs=Tar.osszCs();
  app.innerHTML=`
    <div class="topbar"><button class="cbtn small" id="vissza">◀</button><div class="ttl">GARDRÓB<small>${esc(p.nev)} · ★ ${cs}</small></div><span style="width:44px"></span></div>
    ${talk(p.ruha?`Ebben vagyok most: ${RUHA(p.ruha).nev.toLowerCase()}. Jól állok, ugye?`:'Gyűjts csillagokat, és új ruhákat kapok! Mindegyiket kipróbálhatom.','vidam',p.ruha)}
    <div class="wardrobe">
      <button class="wcard ${!p.ruha?'akt':''}" data-r=""><div class="wav">${Karcsi.svg('vidam',null)}</div><div class="wnm">Semmi</div><div class="wk">mindig</div></button>
      ${RUHAK.filter(r=>!r.rejtett).map(r=>{ const nyitva=cs>=r.kell;
        return `<button class="wcard ${p.ruha===r.id?'akt':''} ${nyitva?'':'zar'}" data-r="${r.id}" ${nyitva?'':'disabled'}>
          <div class="wav">${Karcsi.svg('vidam',r.id)}</div><div class="wnm">${esc(r.nev)}</div>
          <div class="wk">${nyitva?'megvan':'még '+(r.kell-cs)+' ★'}</div></button>`; }).join('')}
    </div>`;
  document.getElementById('vissza').onclick=()=>{ Hang.vissza(); terkep(); };
  app.querySelectorAll('.wcard:not([disabled])').forEach(b=>b.onclick=()=>{ p.ruha=b.dataset.r||null; Tar.ment(); Hang.jo(); gardrob(); });
}

/* ---------- TÉRKÉP ---------- */
function terkep(){
  ujKepernyo();
  const p=Tar.p(); if(!p){ jatekosok(); return; }
  const aj=ajanlott(p.osztaly);
  const kartya=(s,szam)=>{ const pr=Tar.szint(s.id);
    return `<button class="lvl ${p.utolso===s.id?'here':''}" style="--c:${s.szin}" data-l="${s.id}">
      <div class="big">${csempe(szam,'n','style="width:62px;height:62px;--cs:62px"')}</div>
      <div><div class="nm">${esc(s.nev.toUpperCase())}</div><div class="sub">${esc(s.sub)}</div></div>
      <div class="prog">${pr.db}/${pr.max}<small>★ ${pr.cs}</small></div>
      ${s.id===aj?'<div class="ajanl">AJÁNLOTT</div>':''}
      ${p.utolso===s.id?`<div class="climber">${Karcsi.svg('vidam',p.ruha)}</div>`:''}
    </button>`; };
  const hegy=SZINTEK.filter(s=>s.csoport==='hegy'), ein=SZINTEK.filter(s=>s.csoport==='einstein');
  const sor=Napi.sorozat(), maKesz=Napi.kesz();
  const tower=`<svg viewBox="0 0 150 150" aria-hidden="true">
    <path d="M75 6 L75 26" stroke="#1b1b2f" stroke-width="3"/><path d="M75 7 L100 14 L75 21 Z" fill="#ff5d8f" stroke="#1b1b2f" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M40 52 L75 24 L110 52 Z" fill="#ff4d4d" stroke="#1b1b2f" stroke-width="3" stroke-linejoin="round"/>
    <rect x="48" y="52" width="54" height="66" fill="#fff4dc" stroke="#1b1b2f" stroke-width="3"/>
    <rect x="42" y="74" width="66" height="8" fill="#a8743e" stroke="#1b1b2f" stroke-width="2.5"/>
    <rect x="66" y="58" width="18" height="14" rx="7" fill="#8fd8ff" stroke="#1b1b2f" stroke-width="2.5"/>
    <rect x="66" y="90" width="18" height="28" rx="8" fill="#a8743e" stroke="#1b1b2f" stroke-width="2.5"/>
    <path d="M10 150 Q30 112 75 116 Q120 112 140 150 Z" fill="#7ed957" stroke="#1b1b2f" stroke-width="3"/>
    <text x="75" y="141" text-anchor="middle" font-family="Bangers, Impact, sans-serif" font-size="17" fill="#fff" stroke="#1b1b2f" stroke-width="3" paint-order="stroke" letter-spacing="1">GÉNIUSZ-TORONY</text></svg>`;
  app.innerHTML=`
    <div class="mapscreen">
      <div class="banner"><h1>SZÁMHEGY</h1></div>
      <div class="profrow">
        <button class="cbtn small blue" id="prof">${esc(p.nev.toUpperCase())} ▾</button>
        <button class="cbtn small" id="gard">GARDRÓB · ★ ${Tar.osszCs()}</button>
        ${nemaGomb()}
      </div>
      <button class="daily ${maKesz?'kesz':''}" id="napi">
        <div class="dl">NAPI REJTVÉNY</div>
        <div class="ds">${maKesz?'A mai megvan! Holnap jön az újabb.':'Ma még nem fejtetted meg!'} · Sorozat: <b>${sor}</b> nap</div>
      </button>
      <button class="daily klubgomb" id="klubb">
        <div class="dl">TITKOS KLUB</div>
        <div class="ds">Emoji-titkosírás, saját titkosírás, törd fel, morze</div>
      </button>
      <div class="einstein">
        <div class="eh">EINSTEIN IS ELHASALNA</div>
        <div class="es">Itt nem számok vannak a kockákban, hanem formák. A szám maga a forma kerülete, területe vagy térfogata.</div>
        <div class="mountain e">${[...ein].reverse().map(s=>kartya(s,'E'+(ein.indexOf(s)+1))).join('')}</div>
      </div>
      <div class="tower">${tower}</div>
      <div class="mountain">${[...hegy].reverse().map(s=>kartya(s,hegy.indexOf(s)+1)).join('')}</div>
      ${talk(`Szia ${p.nev}! Válassz szintet! Fent a torony, lent az ovi. A létra nem inog. Nagyon.`,'vidam',p.ruha)}
    </div>`;
  app.querySelectorAll('.lvl').forEach(b=>b.onclick=()=>{ Hang.tesz(); palyak(b.dataset.l); });
  document.getElementById('prof').onclick=()=>{ Hang.tesz(); jatekosok(); };
  document.getElementById('gard').onclick=()=>{ Hang.tesz(); gardrob(); };
  document.getElementById('napi').onclick=()=>{ Hang.tesz(); jatek(aj,'napi'); };
  document.getElementById('klubb').onclick=()=>{ Hang.tesz(); klub(); };
  nemaBekot();
  const itt=app.querySelector('.lvl.here'); if(itt) setTimeout(()=>itt.scrollIntoView({block:'center'}),30);
}

/* ---------- PÁLYAVÁLASZTÓ (lapozós) ---------- */
const LAP=20;
function palyak(lid, lap){
  ujKepernyo();
  const s=SZINT(lid), p=Tar.p(); p.utolso=lid; Tar.ment();
  let kov=1; while(kov<=s.db && Tar.cs(lid,kov)) kov++;
  const lapok=Math.ceil(s.db/LAP); if(lap===undefined) lap=Math.min(lapok-1, Math.floor((Math.min(kov,s.db)-1)/LAP));
  const tol=lap*LAP+1, ig=Math.min(s.db,tol+LAP-1);
  app.innerHTML=`
    <div class="topbar"><button class="cbtn small" id="vissza">◀</button><div class="ttl">${esc(s.nev.toUpperCase())}<small>${esc(s.sub)}</small></div>${nemaGomb()}</div>
    ${talk(s.jelmondat,'vidam',aktRuha(lid))}
    <div class="stages">${Array.from({length:ig-tol+1},(_,i)=>{ const pp=tol+i, c=Tar.cs(lid,pp);
      return `<button class="stage ${pp===kov?'next':''}" data-p="${pp}" aria-label="${pp}. pálya"><div class="tl" style="--cs:58px"><div class="t face ${c?'ok':(pp===kov?'n':'b')}${pp>=100?' d3':''}" style="width:100%;height:100%">${pp}</div></div>
        <div class="st">${c?'★'.repeat(c)+'☆'.repeat(3-c):''}</div></button>`; }).join('')}</div>
    <div class="pager"><button class="cbtn small" id="elo" ${lap===0?'disabled':''}>◀</button><span>${tol}–${ig} / ${s.db}</span><button class="cbtn small" id="kovl" ${lap>=lapok-1?'disabled':''}>▶</button></div>
    <div class="foot"><button class="cbtn blue" id="gyors">GYORSSZÁMOLÁS · 60 MP</button>${szabGomb()}</div>
    ${szabalyAside(lid)}`;
  document.getElementById('vissza').onclick=()=>{ Hang.vissza(); terkep(); };
  document.getElementById('elo').onclick=()=>{ Hang.tesz(); palyak(lid,lap-1); };
  document.getElementById('kovl').onclick=()=>{ Hang.tesz(); palyak(lid,lap+1); };
  document.getElementById('gyors').onclick=()=>{ Hang.tesz(); gyors(lid); };
  app.querySelectorAll('.stage').forEach(b=>b.onclick=()=>{ Hang.tesz(); jatek(lid,+b.dataset.p); });
  nemaBekot(); szabBekot();
}

/* ---------- JÁTÉK ---------- */
function jatek(lid, p){
  ujKepernyo();
  const s=SZINT(lid), si=SZINTEK.indexOf(s), napi=p==='napi';
  const cfg=palyaCfg(s, napi ? Math.round(s.db*.35) : p);
  const seed = napi ? Napi.seed() : (si+1)*1000+p;
  const fv=generalKereszt(cfg, seed) || generalKereszt(cfg, seed+500);
  const J={ kitolt:{}, sel:null, pick:null, hibak:0, sugo:s.sugo, stat:{}, kezd:Date.now(), vege:false, sugoDb:0 };
  const resSet=new Set(fv.resek);
  const ruha=aktRuha(lid);
  const kezdo = fv.alakDb ? veletlen(DUMA.kezdesAlak) : fv.resek.some(k=>fv.cellak.get(k).k==='o') ? veletlen(DUMA.kezdesOp) : napi ? veletlen(DUMA.napi) : veletlen(DUMA.kezdes);
  app.innerHTML=`
    <div class="topbar"><button class="cbtn small" id="vissza">◀</button>
      <div class="ttl">${napi?'NAPI REJTVÉNY':esc(s.nev.toUpperCase())}<small>${napi?esc(s.nev)+' · '+Napi.ma():p+'. pálya / '+s.db}</small></div>
      <button class="cbtn small pink" id="sugo">SÚGÓ ${J.sugo}</button></div>
    ${talk(kezdo,'vidam',ruha)}
    <div class="pad"><div class="rings">${'<i></i>'.repeat(12)}</div><div class="grid" id="grid"></div></div>
    <div class="tray" id="tray"></div>
    <div class="hud"><span>Hibák: <b id="hib">0</b></span><span>Idő: <b id="ido">0:00</b></span>${szabGomb()}${segedGomb(lid)}<button class="cbtn small" id="felad">FELADOM</button>${nemaGomb()}</div>
    ${segedAside(lid)}
    ${szabalyAside(lid)}`;
  const talkEl=app.querySelector('.talk'), gridEl=document.getElementById('grid'), trayEl=document.getElementById('tray');
  document.getElementById('vissza').onclick=()=>{ Hang.vissza(); napi?terkep():palyak(lid); };
  nemaBekot(); szabBekot(); segedBekot(lid, ()=>fv);

  function meretez(){
    const w=gridEl.parentElement.clientWidth-24;
    const gap=fv.oszlopok>8?3:4, tc=innerWidth<=420?53:63;
    const tSor=Math.ceil(fv.talca.length/Math.max(1,Math.floor((w+9)/tc)));
    const csW=Math.floor((w-gap*(fv.oszlopok-1))/fv.oszlopok);
    const csH=Math.floor((innerHeight-270-tSor*tc-gap*(fv.sorok-1))/fv.sorok);
    const cs=Math.max(fv.alakDb?34:26, Math.min(fv.alakDb?70:62, csW, csH));
    gridEl.style.setProperty('--cs',cs+'px'); gridEl.style.setProperty('--gap',gap+'px');
    gridEl.style.gridTemplateColumns=`repeat(${fv.oszlopok},${cs}px)`;
  }
  const eqKulcsok=fv.egyenletek.map(e=>new Set(e.cellak.map(c=>c.join(','))));
  function rajzRacs(){
    let h='';
    for(let r=0;r<fv.sorok;r++) for(let c=0;c<fv.oszlopok;c++){
      const k=r+','+c, cell=fv.cellak.get(k);
      if(!cell){ h+='<div class="x"></div>'; continue; }
      const okCell = fv.egyenletek.some((e,ei)=>J.stat[ei]==='ok' && eqKulcsok[ei].has(k));
      const badCell = fv.egyenletek.some((e,ei)=>J.stat[ei]==='rossz' && eqKulcsok[ei].has(k));
      if(resSet.has(k)){
        const ti=J.kitolt[k];
        if(ti===undefined) h+=csempe('', 'b'+(J.sel===k?' sel':''), `data-k="${k}" role="button" tabindex="0" aria-label="üres mező"`);
        else { const v=fv.talca[ti]; h+=csempe(v, (okCell?'ok':badCell?'bad':(typeof v==='number'?'f':tipus(v)+' f2')), `data-k="${k}" role="button" tabindex="0"`); }
      } else if(cell.alak){
        h+=`<div class="t a${okCell?' aok':''}" data-alak="${k}" role="button" tabindex="0" aria-label="${esc(Alak.leiras(cell.alak))}">${Alak.svg(cell.alak)}</div>`;
      } else h+=csempe(cell.v, okCell && cell.k==='n' ? 'ok' : tipus(cell.v));
    }
    gridEl.innerHTML=h;
    gridEl.querySelectorAll('[data-k]').forEach(el=>{
      const act=()=>cellaKatt(el.dataset.k);
      el.onclick=act; el.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); act(); } };
    });
    gridEl.querySelectorAll('[data-alak]').forEach(el=>{
      const act=()=>{ idle(); Hang.tesz(); Karcsi.mond(talkEl, Alak.leiras(fv.cellak.get(el.dataset.alak).alak),'gondol'); szabalyVillan(ALAKOK[fv.cellak.get(el.dataset.alak).alak.tip].szabaly); };
      el.onclick=act; el.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); act(); } };
    });
  }
  function rajzTalca(){
    const hasznalt=new Set(Object.values(J.kitolt));
    trayEl.innerHTML=fv.talca.map((v,i)=>csempe(v,tipus(v)+(hasznalt.has(i)?' used':'')+(J.pick===i?' pick':''),`data-i="${i}" role="button" tabindex="0" aria-label="${v}"`)).join('');
    trayEl.querySelectorAll('[data-i]').forEach(el=>huzhato(el, +el.dataset.i));
  }
  function frissit(){ rajzRacs(); rajzTalca(); document.getElementById('hib').textContent=J.hibak; document.getElementById('sugo').textContent='SÚGÓ '+J.sugo; }
  function kovUres(utan){
    const ures=fv.resek.filter(k=>J.kitolt[k]===undefined);
    if(!ures.length) return null;
    const i=ures.indexOf(utan); return ures[(i+1)%ures.length] || ures[0];
  }
  function cellaKatt(k){
    idle(); if(J.vege) return;
    if(J.kitolt[k]!==undefined){ delete J.kitolt[k]; Hang.vissza(); J.sel=k; ellenoriz(); frissit(); return; }
    if(J.pick!==null){ tesz(k,J.pick); return; }
    J.sel=k; Hang.tesz(); frissit();
  }
  function tesz(k, ti){
    if(J.vege) return;
    for(const kk in J.kitolt) if(J.kitolt[kk]===ti) delete J.kitolt[kk];
    J.kitolt[k]=ti; J.pick=null; Hang.tesz();
    J.sel=kovUres(k);
    ellenoriz(); frissit();
  }
  function talcaKatt(ti){
    idle(); if(J.vege) return;
    if(J.sel){ tesz(J.sel, ti); return; }
    const u=kovUres(null); if(u && J.pick===null){ J.sel=u; tesz(u,ti); return; }
    J.pick = J.pick===ti?null:ti; Hang.tesz(); frissit();
  }
  function ertekK(k){ const c=fv.cellak.get(k); return resSet.has(k) ? (J.kitolt[k]===undefined?null:fv.talca[J.kitolt[k]]) : c.v; }
  function ellenoriz(){
    let ujJo=false, rosszEq=null;
    fv.egyenletek.forEach((e,ei)=>{
      const tok=e.cellak.map(([a,b])=>ertekK(a+','+b));
      const elozo=J.stat[ei];
      if(tok.some(v=>v===null)){ J.stat[ei]=null; return; }
      const ok=egyenletOk(tok);
      J.stat[ei]=ok?'ok':'rossz';
      if(elozo!==J.stat[ei]){ if(ok) ujJo=true; else if(!rosszEq) rosszEq={e,tok}; }
    });
    if(rosszEq){
      J.hibak++; Hang.rossz();
      const alakok=rosszEq.e.cellak.map(([a,b])=>fv.cellak.get(a+','+b).alak).filter(Boolean);
      const ok=hibaOka(rosszEq.tok, alakok);
      Karcsi.mond(talkEl, ok ? ok.szoveg : veletlen(DUMA.rossz),'hoppa','oops');
      if(ok && ok.szabaly) szabalyVillan(ok.szabaly);
    }
    else if(ujJo){ Hang.jo(); Karcsi.mond(talkEl, veletlen(DUMA.jo),'huu','wow'); }
    const mind = fv.resek.every(k=>J.kitolt[k]!==undefined) && fv.egyenletek.every((e,ei)=>J.stat[ei]==='ok');
    if(mind) setTimeout(gyozelem, 450);
  }
  document.getElementById('sugo').onclick=()=>{
    idle(); if(J.vege) return;
    if(J.sugo<=0){ Karcsi.mond(talkEl, veletlen(DUMA.nincsSugo),'gondol'); Hang.rossz(); return; }
    const jelolt=fv.resek.filter(k=>J.kitolt[k]===undefined || fv.talca[J.kitolt[k]]!==fv.cellak.get(k).v);
    if(!jelolt.length) return;
    const k=jelolt[Math.floor(Math.random()*jelolt.length)], kell=fv.cellak.get(k).v;
    const hasznalt=new Set(Object.values(J.kitolt));
    let ti=fv.talca.findIndex((v,i)=>v===kell && !hasznalt.has(i));
    if(ti<0) ti=fv.talca.findIndex(v=>v===kell);
    if(ti<0) return;
    J.sugo--; J.sugoDb++; Hang.sugo(); Karcsi.mond(talkEl, veletlen(DUMA.sugo),'gondol');
    for(const kk in J.kitolt) if(J.kitolt[kk]===ti) delete J.kitolt[kk];
    J.kitolt[k]=ti; J.sel=kovUres(k);
    ellenoriz(); frissit();
    const el=gridEl.querySelector(`[data-k="${k}"]`); if(el) el.classList.add('hintflash');
  };
  /* húzás: az egész ablakot figyeljük, így nem ragad be a kocka */
  function huzhato(el, ti){
    el.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); talcaKatt(ti); } };
    el.onpointerdown=e=>{
      if(e.button>0) return; e.preventDefault(); szellemTorol();
      const start={x:e.clientX,y:e.clientY}; let ghost=null;
      const mozog=ev=>{
        if(!ghost && Math.hypot(ev.clientX-start.x,ev.clientY-start.y)>8){
          ghost=document.createElement('div'); ghost.className='ghost'; ghost.innerHTML=csempe(fv.talca[ti],tipus(fv.talca[ti]),'style="width:58px;height:58px"');
          document.body.appendChild(ghost); el.style.opacity='.35';
        }
        if(ghost){ ghost.style.left=ev.clientX+'px'; ghost.style.top=ev.clientY+'px'; }
      };
      const vege=(ev, megszakadt)=>{
        removeEventListener('pointermove',mozog); removeEventListener('pointerup',fel); removeEventListener('pointercancel',megszak); removeEventListener('blur',megszak);
        const huzott=!!ghost; szellemTorol(); el.style.opacity='';
        if(megszakadt) return;
        if(huzott){ const cel=document.elementFromPoint(ev.clientX,ev.clientY)?.closest('[data-k]'); if(cel) tesz(cel.dataset.k, ti); else frissit(); }
        else talcaKatt(ti);
      };
      const fel=ev=>vege(ev,false), megszak=ev=>vege(ev,true);
      addEventListener('pointermove',mozog); addEventListener('pointerup',fel); addEventListener('pointercancel',megszak); addEventListener('blur',megszak);
    };
  }
  /* Feladom: kétlépcsős (BIZTOS?), megmutatja a megfejtést, a pálya nem számít teljesítettnek */
  const fb=document.getElementById('felad');
  fb.onclick=()=>{
    idle(); if(J.vege) return;
    if(!fb.dataset.biztos){ fb.dataset.biztos='1'; fb.textContent='BIZTOS?'; fb.classList.add('pink'); Hang.tesz();
      setTimeout(()=>{ if(fb.isConnected && !J.vege){ delete fb.dataset.biztos; fb.textContent='FELADOM'; fb.classList.remove('pink'); } },3000); return; }
    feladom();
  };
  function feladom(){
    J.vege=true; J.feladva=true; clearInterval(window.__tick); stopIdle(); szellemTorol();
    J.kitolt={}; const foglalt=new Set();
    fv.resek.forEach(k=>{ const kell=fv.cellak.get(k).v; const ti=fv.talca.findIndex((v,i)=>v===kell && !foglalt.has(i)); if(ti>=0){ foglalt.add(ti); J.kitolt[k]=ti; } });
    fv.egyenletek.forEach((e,ei)=>J.stat[ei]='ok');
    rajzRacs();
    gridEl.querySelectorAll('[data-k]').forEach((el,i)=>{ el.style.animationDelay=(i*90)+'ms'; el.classList.add('felfed'); });
    Hang.t([392,330,262],.18,'triangle',.14,.06);
    Karcsi.mond(talkEl, veletlen(DUMA.feladom),'gondol');
    trayEl.innerHTML=`<div class="feladva"><div class="fm">Itt a megfejtés. Ez a pálya most nem számít bele, bármikor újrakezdheted!</div>
      <div class="row"><button class="cbtn small" id="f-ujra">ÚJRAKEZDEM</button><button class="cbtn small blue" id="f-vissza">${napi?'TÉRKÉP':'PÁLYÁK'}</button>${!napi&&p<s.db?'<button class="cbtn small pink" id="f-kov">KÖVETKEZŐ ▶</button>':''}</div></div>`;
    document.getElementById('f-ujra').onclick=()=>jatek(lid,p);
    document.getElementById('f-vissza').onclick=()=>napi?terkep():palyak(lid);
    const k2=document.getElementById('f-kov'); if(k2) k2.onclick=()=>jatek(lid,p+1);
    fb.disabled=true; document.getElementById('sugo').disabled=true;
  }
  function idle(){ stopIdle(); idleT=setTimeout(()=>{ if(!J.vege) Karcsi.mond(talkEl, veletlen(DUMA.unalom),'gondol'); }, 35000); }
  function gyozelem(){
    if(J.vege) return; J.vege=true; clearInterval(window.__tick); stopIdle(); szellemTorol();
    const cs = (J.hibak===0 && J.sugoDb===0) ? 3 : (J.hibak<=2 && J.sugoDb<=1) ? 2 : 1;
    const pr=Tar.p(), elotte=Tar.ruhak().map(r=>r.id);
    if(napi) Napi.rogzit(cs);
    else if(cs>Tar.cs(lid,p)){ pr.csillag[lid+':'+p]=cs; Tar.ment(); }
    const ujRuha=Tar.ruhak().find(r=>!elotte.includes(r.id));
    Hang.gyoz(); Konfetti.lo();
    const mp=Math.round((Date.now()-J.kezd)/1000);
    const kovP = !napi && p<s.db ? p+1 : null;
    const ov=document.createElement('div'); ov.className='overlay';
    ov.innerHTML=`<div class="card" role="dialog" aria-label="Pálya kész">
      <div class="burst"><svg viewBox="0 0 220 120" aria-hidden="true">
        <path d="M110 4 L128 34 L162 14 L156 48 L200 44 L174 70 L212 92 L168 96 L178 118 L140 104 L110 120 L82 104 L42 118 L54 96 L8 92 L46 70 L20 44 L64 48 L58 14 L92 34 Z" fill="#ffc82e" stroke="#1b1b2f" stroke-width="4" stroke-linejoin="round"/>
        <text x="110" y="78" text-anchor="middle" font-family="Bangers, Impact, sans-serif" font-size="40" fill="#fff" stroke="#1b1b2f" stroke-width="4" paint-order="stroke" letter-spacing="2">${cs===3?'SZUPER!':cs===2?'ÜGYES!':'MEGVAN!'}</text></svg></div>
      <div class="stars">${[1,2,3].map(i=>`<span class="${i<=cs?'on':''}">★</span>`).join('')}</div>
      ${ujRuha ? talk(veletlen(DUMA.ujRuha)+' ('+ujRuha.nev+')','huu',ujRuha.id) : talk(napi?`Napi rejtvény kész! Sorozat: ${Napi.sorozat()} nap.`:veletlen(cs===3?DUMA.hibatlan:DUMA.kesz),'huu',ruha)}
      <div class="meta">${Math.floor(mp/60)}:${String(mp%60).padStart(2,'0')} · ${J.hibak} hiba · ${J.sugoDb} súgás · összesen ★ ${Tar.osszCs()}</div>
      <div class="row">
        ${napi?'':'<button class="cbtn small" id="ujra">ÚJRA</button>'}
        <button class="cbtn small blue" id="terkep">TÉRKÉP</button>
        ${ujRuha?'<button class="cbtn small" id="gardr">GARDRÓB</button>':''}
        ${kovP?'<button class="cbtn pink" id="kov">KÖVETKEZŐ ▶</button>':''}
      </div></div>`;
    document.body.appendChild(ov);
    const zar=()=>ov.remove();
    ov.querySelector('#ujra')?.addEventListener('click',()=>{ zar(); jatek(lid,p); });
    ov.querySelector('#terkep').onclick=()=>{ zar(); terkep(); };
    ov.querySelector('#gardr')?.addEventListener('click',()=>{ zar(); gardrob(); });
    if(kovP) ov.querySelector('#kov').onclick=()=>{ zar(); jatek(lid,kovP); };
  }
  window.__tick=setInterval(()=>{ const mp=Math.round((Date.now()-J.kezd)/1000); const el=document.getElementById('ido'); if(el) el.textContent=Math.floor(mp/60)+':'+String(mp%60).padStart(2,'0'); },1000);
  J.sel=fv.resek[0];
  meretez(); frissit(); idle();
  window.onresize=meretez;
}
function szellemTorol(){ document.querySelectorAll('.ghost').forEach(g=>g.remove()); }
