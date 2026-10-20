/* ============================================================
   GYORSSZÁMOLÁS — 60 másodperc, egy feladat, négy válasz.
   A feladat a szint beállításaiból jön; Einstein-fejezetben forma a kérdés.
   ============================================================ */
const GYORS_IDO = 60;
function gyorsFeladat(s, r=Math.random){
  const cfg=palyaCfg(s, Math.ceil(s.db/2));
  if(cfg.alak){
    const ertekek=Alak.ertekek(cfg.alak.tip, cfg.max);
    for(let t=0;t<50;t++){
      const v=ertekek[Math.floor(r()*ertekek.length)], a=Alak.keres(v, cfg.alak.tip, r);
      if(a) return {alak:a, valasz:v, kerdes:{K:'Mennyi a kerülete?',T:'Mennyi a területe?',V:'Mennyi a térfogata?',A:'Mennyi a felszíne?'}[ALAKOK[a.tip].betu]};
    }
  }
  const L=cfg.L.includes(7) && r()<.5 ? 7 : 5;
  let tok=null; for(let t=0;t<20 && !tok;t++) tok=egyenlet(cfg, r, L, null);
  if(!tok) tok=[2,'+',3,'=',5];
  const helyek = s.id==='ovi'||s.id==='also' ? [L-1] : SZAMHELY(L);
  const h=helyek[Math.floor(r()*helyek.length)];
  return {tok, rejt:h, valasz:tok[h]};
}
function gyorsOpciok(f, r=Math.random){
  const v=f.valasz, o=new Set([v]);
  const jelolt=[v+1,v-1,v+2,v-2,v+10,v-10,v*2,Math.round(v/2)];
  if(f.tok && f.tok.length===5){ const [a,op,b]=f.tok; if(op==='×') jelolt.push(a+b); if(op==='+') jelolt.push(a*b); if(op==='−') jelolt.push(a+b); }
  if(f.tok && f.tok.length===7){ const {sz,op}=bont(f.tok); const bal=ertekBalrol(sz,op); if(Number.isInteger(bal)) jelolt.push(bal); }
  for(const x of jelolt.sort(()=>r()-.5)){ if(o.size>=4) break; if(Number.isInteger(x) && x>=0 && x!==v) o.add(x); }
  while(o.size<4) o.add(v+o.size*3);
  return [...o].sort(()=>r()-.5);
}
function gyors(lid){
  ujKepernyo();
  const s=SZINT(lid), pr=Tar.p(), ruha=aktRuha(lid);
  const G={pont:0, kombo:0, ido:GYORS_IDO, f:null, vege:false};
  app.innerHTML=`
    <div class="topbar"><button class="cbtn small" id="vissza">◀</button><div class="ttl">GYORSSZÁMOLÁS<small>${esc(s.nev)} · rekord: ${pr.gyors[lid]||0}</small></div>${nemaGomb()}</div>
    ${talk(veletlen(DUMA.gyorsStart),'vidam',ruha)}
    <div class="gyors">
      <div class="gbar"><span id="gido"></span></div>
      <div class="gstat"><span>Pont: <b id="gpont">0</b></span><span id="gkombo"></span><span><b id="gmp">${GYORS_IDO}</b> mp</span></div>
      <div class="gfel" id="gfel"></div>
      <div class="gopc" id="gopc"></div>
    </div>`;
  const talkEl=app.querySelector('.talk');
  document.getElementById('vissza').onclick=()=>{ Hang.vissza(); palyak(lid); };
  nemaBekot();
  function uj(){
    G.f=gyorsFeladat(s);
    const f=G.f, fel=document.getElementById('gfel');
    if(f.alak) fel.innerHTML=`<div class="gal">${`<div class="t a" style="--cs:130px;width:130px;height:130px">${Alak.svg(f.alak)}</div>`}</div><div class="gq">${esc(f.kerdes)}</div><div class="gsub">${esc(Alak.leiras(f.alak).split('. Kell')[0])}.</div>`;
    else fel.innerHTML=`<div class="mini big">${f.tok.map((t,i)=>i===f.rejt?'<div class="t b sel"></div>':csempe(t,tipus(t))).join('')}</div>`;
    document.getElementById('gopc').innerHTML=gyorsOpciok(f).map(v=>`<button class="gbtn" data-v="${v}">${csempe(v,'n','style="width:100%;height:100%;--cs:78px"')}</button>`).join('');
    document.querySelectorAll('.gbtn').forEach(b=>b.onclick=()=>valasz(+b.dataset.v, b));
  }
  function valasz(v, b){
    if(G.vege) return;
    if(v===G.f.valasz){ G.pont++; G.kombo++; Hang.jo(); if(G.kombo>0 && G.kombo%5===0) Karcsi.mond(talkEl, G.kombo+' egymás után! Lángol a ceruza!','huu','wow'); uj(); }
    else { G.kombo=0; Hang.rossz(); b.querySelector('.t').classList.add('bad'); b.disabled=true; Karcsi.mond(talkEl, veletlen(DUMA.rossz),'hoppa','oops'); }
    document.getElementById('gpont').textContent=G.pont;
    document.getElementById('gkombo').textContent=G.kombo>=3?'Sorozat: '+G.kombo:'';
  }
  const kezd=Date.now();
  window.__tick=setInterval(()=>{
    const maradt=Math.max(0, GYORS_IDO-(Date.now()-kezd)/1000);
    const mpEl=document.getElementById('gmp'); if(!mpEl){ clearInterval(window.__tick); return; }
    mpEl.textContent=Math.ceil(maradt); document.getElementById('gido').style.width=(maradt/GYORS_IDO*100)+'%';
    if(maradt<=5 && maradt>0) Hang.tik();
    if(maradt<=0) vege();
  },250);
  function vege(){
    if(G.vege) return; G.vege=true; clearInterval(window.__tick);
    const regi=pr.gyors[lid]||0, rekord=G.pont>regi;
    if(rekord){ pr.gyors[lid]=G.pont; Tar.ment(); Konfetti.lo(); }
    Hang.gyoz();
    const ov=document.createElement('div'); ov.className='overlay';
    ov.innerHTML=`<div class="card" role="dialog" aria-label="Lejárt az idő">
      <div class="burst"><svg viewBox="0 0 220 120" aria-hidden="true"><path d="M110 4 L128 34 L162 14 L156 48 L200 44 L174 70 L212 92 L168 96 L178 118 L140 104 L110 120 L82 104 L42 118 L54 96 L8 92 L46 70 L20 44 L64 48 L58 14 L92 34 Z" fill="${rekord?'#ffc82e':'#5ee6c8'}" stroke="#1b1b2f" stroke-width="4" stroke-linejoin="round"/>
      <text x="110" y="80" text-anchor="middle" font-family="Bangers, Impact, sans-serif" font-size="46" fill="#fff" stroke="#1b1b2f" stroke-width="4" paint-order="stroke">${G.pont} PONT</text></svg></div>
      ${talk(veletlen(rekord?DUMA.rekord:DUMA.gyorsVege),'huu',ruha)}
      <div class="meta">Rekord: ${Math.max(regi,G.pont)} · ${esc(s.nev)}</div>
      <div class="row"><button class="cbtn small" id="vissza2">PÁLYÁK</button><button class="cbtn pink" id="ujra">MÉG EGYSZER!</button></div></div>`;
    document.body.appendChild(ov);
    ov.querySelector('#ujra').onclick=()=>{ ov.remove(); gyors(lid); };
    ov.querySelector('#vissza2').onclick=()=>{ ov.remove(); palyak(lid); };
  }
  uj();
}
