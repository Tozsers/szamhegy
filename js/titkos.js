/* ============================================================
   TITKOS KLUB — képernyők: klubszoba, emoji-titkosírás, saját titkosírás, Törd fel!, morze
   A mag (titkosítás, kulcskód, morze-dekódoló) a titkos_mag.js-ben van.
   ============================================================ */
const klubRuha = () => (Tar.p() && Tar.p().ruha) || 'szemuveg';
const klubAdat = () => { const p=Tar.p(); p.klub = p.klub || {kulcs:null, kalib:null}; return p.klub; };
const csillagAd = (kulcs, db) => { const p=Tar.p(); if((p.csillag[kulcs]||0) < db){ const elotte=Tar.ruhak().map(r=>r.id); p.csillag[kulcs]=db; Tar.ment(); return Tar.ruhak().find(r=>!elotte.includes(r.id))||null; } return null; };
function masol(szoveg, gomb){
  const ok=()=>{ const r=gomb.textContent; gomb.textContent='KIMÁSOLVA!'; setTimeout(()=>{ if(gomb.isConnected) gomb.textContent=r; },1500); };
  try{ navigator.clipboard.writeText(szoveg).then(ok, ()=>kijelol()); }catch(e){ kijelol(); }
  function kijelol(){ const ta=gomb.closest('.kbox')?.querySelector('textarea[readonly]'); if(ta){ ta.focus(); ta.select(); gomb.textContent='JELÖLD KI ÉS MÁSOLD'; } }
}
const klubFej = (cim, al, vissza) => `<div class="topbar"><button class="cbtn small" id="vissza">◀</button><div class="ttl">${cim}<small>${al}</small></div>${nemaGomb()}</div>`;

/* ---------- KLUBSZOBA ---------- */
function klub(){
  ujKepernyo();
  const p=Tar.p(); if(!p){ jatekosok(); return; }
  const kartya=(id,cim,sub,szin,ikon)=>`<button class="kcard" data-k="${id}" style="--c:${szin}"><div class="kik">${ikon}</div><div><div class="nm">${cim}</div><div class="sub">${sub}</div></div></button>`;
  app.innerHTML=`
    ${klubFej('TITKOS KLUB','Csak titkos ügynököknek!')}
    ${talk(`Psszt, ${p.nev}! Ez a Titkos Klub. Itt megtanulod, hogyan küldj olyan üzenetet, amit csak a barátod ért meg.`,'vidam',klubRuha())}
    <div class="klubgrid">
      ${kartya('emoji','EMOJI-TITKOSÍRÁS','Írd le a titkod emojikkal, és küldd el!','#ff9a1f','🦅🐘')}
      ${kartya('sajat','SAJÁT TITKOSÍRÁS','Te döntöd el, melyik betű mi legyen.','#a98bff','🔐')}
      ${kartya('tord','TÖRD FEL!','Fejtsd meg más titkát, mint egy igazi nyomozó.','#ff5d8f','🔎')}
      ${kartya('morze','MORZE','Pont, vonal, pont. Így beszéltek a hajók.','#4fd1c5','📡')}
    </div>`;
  document.getElementById('vissza').onclick=()=>{ Hang.vissza(); terkep(); };
  app.querySelectorAll('.kcard').forEach(b=>b.onclick=()=>{ Hang.tesz(); ({emoji:emojiLecke, sajat:sajatTitkos, tord:()=>tordFel(), morze:morze})[b.dataset.k](); });
  nemaBekot();
}

/* ---------- közös kódoló/dekódoló doboz ---------- */
function kodoloDoboz(kulcsAd, cimke=''){
  return `<div class="kbox"><div class="ktitle">TITKOSÍTÁS ${cimke}</div>
      <label for="k-be">Írd ide a titkod:</label><textarea id="k-be" rows="2" maxlength="300" placeholder="Például: Holnap a fa alatt!"></textarea>
      <label for="k-ki">Ezt küldd el a barátodnak:</label><textarea id="k-ki" rows="2" readonly></textarea>
      <div class="row"><button class="cbtn small pink" id="k-masol">MÁSOLD KI</button></div></div>
    <div class="kbox"><div class="ktitle">MEGFEJTÉS ${cimke}</div>
      <label for="m-be">Ide másold be, amit kaptál:</label><textarea id="m-be" rows="2" maxlength="600" placeholder="🍎🦅🦓🧭..."></textarea>
      <label for="m-ki">A titok:</label><div class="kout" id="m-ki">…</div></div>`;
}
function kodoloBekot(kulcsAd){
  const be=document.getElementById('k-be'), ki=document.getElementById('k-ki'), mbe=document.getElementById('m-be'), mki=document.getElementById('m-ki');
  be.oninput=()=>{ ki.value=titkosit(be.value, kulcsAd()); };
  mbe.oninput=()=>{ mki.textContent=mbe.value.trim()?megfejt(mbe.value, kulcsAd()):'…'; };
  document.getElementById('k-masol').onclick=e=>{ if(ki.value) masol(ki.value, e.currentTarget); };
  return ()=>{ be.oninput(); mbe.oninput(); };
}

/* ---------- 1. EMOJI-TITKOSÍRÁS ---------- */
const EMOJI_FELADVANY = ['TITOK','A KINCS A FA ALATT VAN','HOLNAP KARCSI SZÜLINAPJA'];
function emojiLecke(){
  ujKepernyo();
  const k=alapKulcs();
  app.innerHTML=`
    ${klubFej('EMOJI-TITKOSÍRÁS','1. lecke')}
    ${talk('Minden betű helyett egy emojit írsz. Aki nem tudja, melyik emoji melyik betű, az csak állatokat és gyümölcsöket lát!','vidam',klubRuha())}
    <div class="kbox lecke">
      <div class="ktitle">ÍGY MŰKÖDIK</div>
      <ol class="lepesek">
        <li><b>A kulcs.</b> Te és a barátod megbeszélitek, melyik emoji melyik betű. Ez a <b>kulcs</b>. Ezt senkinek nem mondjátok el!</li>
        <li><b>Titkosítás.</b> A titkod minden betűjét kicseréled a kulcs szerint. Az üzenetet bárki láthatja, de nem érti.</li>
        <li><b>Megfejtés.</b> A barátod a kulccsal visszacseréli az emojikat betűkre, és elolvassa a titkot.</li>
      </ol>
      <div class="rt">Julius Caesar, a római hadvezér is így küldött titkos leveleket: minden betű helyett a 3-mal későbbit írta. A kulcs nála a „3” volt.</div>
    </div>
    <div class="kbox"><div class="ktitle">AZ ALAP-ÁBÉCÉ</div><div class="rt">Minden emoji egy olyan szót mutat, ami azzal a betűvel kezdődik. Így könnyű megjegyezni!</div>
      <div class="abc">${ABC.map(b=>`<div class="abcc" title="${esc(ALAP_EMOJI[b][1])}"><span class="ae">${k[b]}</span><span class="ab2">${b}</span><span class="aw">${esc(ALAP_EMOJI[b][1])}</span></div>`).join('')}</div></div>
    ${kodoloDoboz(()=>k)}
    <div class="kbox"><div class="ktitle">FEJTSD MEG!</div><div class="rt">Karcsi küldött neked három titkos üzenetet. Mi áll bennük?</div>
      ${EMOJI_FELADVANY.map((f,i)=>`<div class="fejt" data-i="${i}"><div class="kemoji">${titkosit(f,k)}</div>
        <div class="row"><input class="fval" id="fv${i}" maxlength="40" placeholder="A megfejtés" autocomplete="off"><button class="cbtn small blue fell" data-i="${i}">KÉSZ</button>
        <span class="fst">${Tar.p().csillag['klub:e:'+i]?'★':''}</span></div></div>`).join('')}</div>`;
  document.getElementById('vissza').onclick=()=>{ Hang.vissza(); klub(); };
  kodoloBekot(()=>k); nemaBekot();
  const talkEl=app.querySelector('.talk');
  app.querySelectorAll('.fell').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.i, v=nagy(document.getElementById('fv'+i).value.trim()).replace(/\s+/g,' ');
    if(v===EMOJI_FELADVANY[i]){ Hang.jo(); const uj=csillagAd('klub:e:'+i,1); b.parentElement.querySelector('.fst').textContent='★';
      Karcsi.mond(talkEl, uj?`Megfejtetted! És kaptam egy új ruhát: ${uj.nev}!`:'Megfejtetted! Igazi titkos ügynök vagy!','huu','wow'); }
    else { Hang.rossz(); Karcsi.mond(talkEl,'Még nem az. Nézd meg az ábécét, és cseréld ki a betűket egyenként!','hoppa','oops'); }
  });
}

/* ---------- 2. SAJÁT TITKOSÍRÁS ---------- */
function sajatTitkos(){
  ujKepernyo();
  const kd=klubAdat(); let kulcs = kd.kulcs ? kodbolKulcs(kd.kulcs) || alapKulcs() : veletlenKulcs();
  let valasztott=null;
  const ment=()=>{ kd.kulcs=kulcsKod(kulcs); Tar.ment(); };
  ment();
  app.innerHTML=`
    ${klubFej('SAJÁT TITKOSÍRÁS','2. lecke')}
    ${talk('Itt te vagy a főnök! Koppints egy betűre, aztán válaszd ki, melyik emoji legyen. A kulcskódot add oda a barátodnak, és ő is meg tudja fejteni.','vidam',klubRuha())}
    <div class="kbox"><div class="ktitle">A TE KULCSOD</div>
      <div class="abc" id="sajatabc"></div>
      <div class="paletta" id="paletta" hidden></div>
      <div class="row"><button class="cbtn small" id="velet">VÉLETLEN KULCS</button><button class="cbtn small" id="alap">ALAP-ÁBÉCÉ</button></div></div>
    <div class="kbox"><div class="ktitle">KULCSKÓD</div>
      <div class="rt">Ezt add oda a barátodnak (írd le neki, vagy küldd el). Akinél ez megvan, az el tudja olvasni a titkaidat. Másnak ne add!</div>
      <textarea id="kkod" rows="1" readonly></textarea><div class="row"><button class="cbtn small pink" id="kkmasol">MÁSOLD KI</button></div>
      <label for="kkbe">Kaptál kulcskódot a barátodtól? Írd ide:</label><div class="row"><input id="kkbe" maxlength="40" placeholder="SH-..." autocomplete="off"><button class="cbtn small blue" id="kkbetolt">BETÖLTÖM</button></div>
      <div class="kmsg" id="kkmsg"></div></div>
    ${kodoloDoboz(()=>kulcs,'(a te kulcsoddal)')}`;
  document.getElementById('vissza').onclick=()=>{ Hang.vissza(); klub(); };
  const frissit=kodoloBekot(()=>kulcs); nemaBekot();
  const abcEl=document.getElementById('sajatabc'), pal=document.getElementById('paletta');
  function rajz(){
    abcEl.innerHTML=ABC.map(b=>`<button class="abcc ${valasztott===b?'sel':''}" data-b="${b}"><span class="ae">${kulcs[b]}</span><span class="ab2">${b}</span></button>`).join('');
    abcEl.querySelectorAll('.abcc').forEach(x=>x.onclick=()=>{ valasztott = valasztott===x.dataset.b?null:x.dataset.b; Hang.tesz(); rajz(); });
    if(valasztott){ pal.hidden=false; pal.innerHTML=`<div class="rt">Melyik emoji legyen a(z) <b>${valasztott}</b>?</div>`+PALETTA.map(e=>{ const kie=ABC.find(b=>kulcs[b]===e); return `<button class="pe ${kulcs[valasztott]===e?'sel':''}" data-e="${e}" title="${kie?'most: '+kie:'szabad'}">${e}${kie&&kie!==valasztott?`<small>${kie}</small>`:''}</button>`; }).join('');
      pal.querySelectorAll('.pe').forEach(x=>x.onclick=()=>{ const e=x.dataset.e, masik=ABC.find(b=>kulcs[b]===e); if(masik && masik!==valasztott) kulcs[masik]=kulcs[valasztott]; kulcs[valasztott]=e; Hang.jo(); valasztott=null; ment(); rajz(); frissit(); }); }
    else pal.hidden=true;
    document.getElementById('kkod').value=kulcsKod(kulcs);
  }
  document.getElementById('velet').onclick=()=>{ kulcs=veletlenKulcs(); valasztott=null; ment(); Hang.tesz(); rajz(); frissit(); };
  document.getElementById('alap').onclick=()=>{ kulcs=alapKulcs(); valasztott=null; ment(); Hang.tesz(); rajz(); frissit(); };
  document.getElementById('kkmasol').onclick=e=>masol(kulcsKod(kulcs), e.currentTarget);
  document.getElementById('kkbetolt').onclick=()=>{ const k=kodbolKulcs(document.getElementById('kkbe').value), m=document.getElementById('kkmsg');
    if(k){ kulcs=k; ment(); Hang.jo(); m.textContent='Betöltve! Most már a barátod titkosírását használod.'; rajz(); frissit(); }
    else { Hang.rossz(); m.textContent='Ez nem jó kulcskód. SH-val kezdődik, és utána 35 jel jön. Nézd meg, nem maradt-e ki valami!'; } };
  rajz();
}

/* ---------- 3. TÖRD FEL! ---------- */
function tordFel(i){
  ujKepernyo();
  const p=Tar.p();
  if(i===undefined){
    app.innerHTML=`${klubFej('TÖRD FEL!','Nyomozós titkosírás-törés')}
      ${talk('Valaki titkos üzenetet hagyott itt, de a kulcsot nem tudjuk. Egy nyomozónak nem is kell: a leggyakoribb emoji valószínűleg az E vagy az A!','gondol',klubRuha())}
      <div class="kbox lecke"><div class="ktitle">A NYOMOZÓ TRÜKKJE</div><div class="rt">A magyar szövegekben vannak betűk, amik sokkal gyakoribbak a többinél. A leggyakoribbak sorban: <b>${MAGYAR_GYAKORI.slice(0,10).join(', ')}</b>. Számold meg, melyik emoji fordul elő a legtöbbször, és kezdd azzal! A rövid szavak is sokat segítenek: az egybetűs szó szinte mindig „A”.</div></div>
      <div class="stages tf">${FEJTOROK.map((_,j)=>{ const c=p.csillag['klub:tf:'+j]||0; return `<button class="stage" data-j="${j}"><div class="tl" style="--cs:58px"><div class="t face ${c?'ok':'n'}" style="width:100%;height:100%">${j+1}</div></div><div class="st">${c?'★'.repeat(c)+'☆'.repeat(3-c):''}</div></button>`; }).join('')}</div>`;
    document.getElementById('vissza').onclick=()=>{ Hang.vissza(); klub(); };
    app.querySelectorAll('.stage').forEach(b=>b.onclick=()=>{ Hang.tesz(); tordFel(+b.dataset.j); });
    nemaBekot(); return;
  }
  const mondat=FEJTOROK[i], kulcs=fejtoroKulcs(i), titok=titkosit(mondat,kulcs);
  const vissza=Object.fromEntries(Object.entries(kulcs).map(([b,e])=>[e,b]));
  const tipp={}; let sugok=0, kesz=false, aktE=null;
  const gyak=gyakorisag(titok);
  app.innerHTML=`${klubFej('TÖRD FEL!',(i+1)+'. titok')}
    ${talk('Koppints egy emojira, és tippeld meg, melyik betű lehet! A tipped azonnal megjelenik a szövegben.','gondol',klubRuha())}
    <div class="kbox"><div class="ktitle">A TITKOS ÜZENET</div><div class="kemoji nagy" id="titok"></div><div class="ktitle">AMIT EDDIG KITALÁLTÁL</div><div class="kout tipp" id="tippki"></div></div>
    <div class="kbox"><div class="ktitle">EMOJIK, GYAKORISÁG SZERINT</div><div class="gyak" id="gyak"></div><div class="betuk" id="betuk" hidden></div>
      <div class="row"><button class="cbtn small" id="tfsugo">SÚGÓ (3)</button><button class="cbtn small" id="tftorol">TÖRLÉS</button></div></div>`;
  document.getElementById('vissza').onclick=()=>{ Hang.vissza(); tordFel(); };
  nemaBekot();
  const talkEl=app.querySelector('.talk');
  function rajz(){
    document.getElementById('titok').innerHTML=Array.from(titok).map(ch=>vissza[ch]?`<span class="te ${aktE===ch?'akt':''}">${ch}</span>`:`<span class="tj">${ch===' '?'&nbsp;':esc(ch)}</span>`).join('');
    document.getElementById('tippki').innerHTML=Array.from(titok).map(ch=>vissza[ch]?`<span class="tb ${tipp[ch]?(tipp[ch]===vissza[ch]&&kesz?'jo':''):'ures'}">${tipp[ch]||'_'}</span>`:`<span class="tj">${ch===' '?'&nbsp;':esc(ch)}</span>`).join('');
    const g=document.getElementById('gyak');
    g.innerHTML=gyak.map(([e,n])=>`<button class="gy ${aktE===e?'akt':''}" data-e="${e}"><span class="ge">${e}</span><span class="gn">${n}×</span><span class="gt">${tipp[e]||'?'}</span></button>`).join('');
    g.querySelectorAll('.gy').forEach(x=>x.onclick=()=>{ if(kesz) return; aktE = aktE===x.dataset.e?null:x.dataset.e; Hang.tesz(); rajz(); });
    const bt=document.getElementById('betuk');
    if(aktE){ bt.hidden=false; bt.innerHTML=`<div class="rt">Melyik betű a ${aktE}?</div>`+ABC.map(b=>`<button class="bb ${tipp[aktE]===b?'sel':''}" data-b="${b}">${b}</button>`).join('')+'<button class="bb" data-b="">✕</button>';
      bt.querySelectorAll('.bb').forEach(x=>x.onclick=()=>{ const b=x.dataset.b; for(const e in tipp) if(tipp[e]===b && b) delete tipp[e]; if(b) tipp[aktE]=b; else delete tipp[aktE]; aktE=null; Hang.tesz(); rajz(); ellenoriz(); }); }
    else bt.hidden=true;
    document.getElementById('tfsugo').textContent='SÚGÓ ('+(3-sugok)+')';
  }
  function ellenoriz(){
    const mind=gyak.every(([e])=>tipp[e]===vissza[e]);
    if(!mind) return;
    kesz=true; rajz();
    const cs = sugok===0?3:sugok===1?2:1, uj=csillagAd('klub:tf:'+i, cs);
    Hang.gyoz(); Konfetti.lo();
    Karcsi.mond(talkEl, uj?`Feltörted! Ez igazi nyomozómunka volt. Új ruhám is lett: ${uj.nev}!`:`Feltörted! ${'★'.repeat(cs)} Sherlock Holmes is büszke lenne rád.`,'huu','wow');
  }
  document.getElementById('tfsugo').onclick=()=>{
    if(kesz) return; if(sugok>=3){ Karcsi.mond(talkEl,'Elfogyott a súgás! De már nagyon közel vagy.','gondol'); return; }
    const jel=gyak.find(([e])=>tipp[e]!==vissza[e]); if(!jel) return;
    const e=jel[0]; for(const x in tipp) if(tipp[x]===vissza[e]) delete tipp[x]; tipp[e]=vissza[e]; sugok++; Hang.sugo();
    Karcsi.mond(talkEl,`Psszt! A ${e} az „${vissza[e]}”.`,'gondol'); rajz(); ellenoriz();
  };
  document.getElementById('tftorol').onclick=()=>{ if(kesz) return; for(const e in tipp) delete tipp[e]; aktE=null; Hang.vissza(); rajz(); };
  rajz();
}

/* ---------- 4. MORZE ---------- */
const Tavirohang = {
  osc:null,
  be(){ if(Tar.d.nema) return; try{ Hang.ctx = Hang.ctx || new (window.AudioContext||window.webkitAudioContext)(); const c=Hang.ctx; if(this.osc) return;
    const o=c.createOscillator(), g=c.createGain(); o.type='sine'; o.frequency.value=650; g.gain.value=.08; o.connect(g).connect(c.destination); o.start(); this.osc={o,g}; }catch(e){} },
  ki(){ if(this.osc){ try{ this.osc.o.stop(); }catch(e){} this.osc=null; } }
};
function morze(){
  ujKepernyo();
  const kd=klubAdat();
  app.innerHTML=`${klubFej('MORZE','Pont, vonal, pont')}
    ${talk('A morzét 1838-ban találták ki. Minden betű rövid (pont) és hosszú (vonal) jelekből áll. Hajók, pilóták és kémek is így beszéltek!','vidam',klubRuha())}
    <div class="kbox lecke"><div class="ktitle">ÍGY MŰKÖDIK</div>
      <ol class="lepesek"><li><b>Pont (·):</b> rövid nyomás. <b>Vonal (−):</b> hosszú nyomás, körülbelül háromszor olyan hosszú.</li>
      <li><b>Betűk között</b> tarts egy kis szünetet, <b>szavak között</b> egy nagyobbat.</li>
      <li>A leghíresebb jel az <b>SOS</b> (segítség!): · · · − − − · · ·</li></ol>
      <div class="rt">Koppints egy betűre, és meghallgathatod!</div>
      <div class="mtabla">${Object.keys(MORZE).filter(b=>/[A-Z]/.test(b)).map(b=>`<button class="mt" data-b="${b}"><b>${b}</b><span>${MORZE[b].replace(/\./g,'·').replace(/-/g,'−')}</span></button>`).join('')}</div></div>
    <div class="kbox"><div class="ktitle">A TÁVÍRÓ</div>
      <div class="lampa" id="lampa"></div>
      <div class="mjelek" id="mjelek">&nbsp;</div><div class="kout morze" id="mszoveg">…</div>
      <button class="taviro" id="taviro" aria-label="Távíró gomb">NYOMD!<small>vagy a SZÓKÖZT</small></button>
      <div class="row"><button class="cbtn small" id="mtorol">TÖRLÉS</button><button class="cbtn small" id="mkalib">TEMPÓ BEÁLLÍTÁSA</button></div>
      <div class="kmsg" id="mmsg"></div></div>
    <div class="kbox"><div class="ktitle">FELADATOK</div>
      <div class="row"><button class="cbtn small blue" id="fbe">MORZÉZD BE!</button><button class="cbtn small blue" id="fhall">MIT HALLASZ?</button><button class="cbtn small pink" id="fteszt">TESZT</button></div>
      <div id="mfeladat"></div></div>`;
  document.getElementById('vissza').onclick=()=>{ Hang.vissza(); klub(); };
  nemaBekot();
  const talkEl=app.querySelector('.talk'), lampa=document.getElementById('lampa'), jelekEl=document.getElementById('mjelek'), szovegEl=document.getElementById('mszoveg'), msg=document.getElementById('mmsg'), fel=document.getElementById('mfeladat');
  let esemenyek=[], le=null, mod=null, kalibLepes=null, kalibRovid=0, lejatszas=false;
  let feladat=null;    // {tip:'be'|'hall'|'teszt', szo, kor, pont}
  const vilagit=on=>lampa.classList.toggle('on',on);
  function nyom(){ if(le!==null || lejatszas) return; le=performance.now(); vilagit(true); Tavirohang.be(); }
  function enged(){
    if(le===null) return; const fel_=performance.now(); vilagit(false); Tavirohang.ki();
    const d=fel_-le, ev={le, fel:fel_}; le=null;
    if(kalibLepes==='rovid'){ kalibRovid=d; kalibLepes='hosszu'; msg.textContent='Most egy HOSSZÚT (vonal)!'; return; }
    if(kalibLepes==='hosszu'){ const k=morzeKalibral(kalibRovid,d); kalibLepes=null;
      if(k){ kd.kalib=Math.round(k); Tar.ment(); msg.textContent=`Megvan a tempód! Ami ${kd.kalib} ezredmásodpercnél rövidebb, az pont, ami hosszabb, az vonal.`; Hang.jo(); }
      else { msg.textContent='A hosszú legyen jóval hosszabb a rövidnél! Próbáld újra: TEMPÓ BEÁLLÍTÁSA.'; Hang.rossz(); } return; }
    esemenyek.push(ev); mutat();
  }
  function mutat(){
    const r=morzeDekodol(esemenyek, kd.kalib);
    jelekEl.textContent = esemenyek.length ? r.jelek.join('').replace(/\./g,'·').replace(/-/g,'−') : ' ';
    szovegEl.textContent = esemenyek.length ? r.szoveg : '…';
    if(feladat && (feladat.tip==='be' || (feladat.tip==='teszt' && feladat.mod==='be')) && r.szoveg.replace(/\s+/g,'')===feladat.szo){ setTimeout(()=>siker(),400); }
  }
  const tav=document.getElementById('taviro');
  tav.onpointerdown=e=>{ e.preventDefault(); nyom(); }; tav.onpointerup=enged; tav.onpointerleave=enged; tav.onpointercancel=enged;
  window.__klubBil = e=>{ if(e.code!=='Space' || (e.target && e.target.matches && e.target.matches('input,textarea'))) return; e.preventDefault(); if(e.type==='keydown'){ if(!e.repeat) nyom(); } else enged(); };
  addEventListener('keydown', window.__klubBil); addEventListener('keyup', window.__klubBil);
  document.getElementById('mtorol').onclick=()=>{ esemenyek=[]; Hang.vissza(); mutat(); };
  document.getElementById('mkalib').onclick=()=>{ kalibLepes='rovid'; esemenyek=[]; mutat(); msg.textContent='Nyomj egy RÖVIDET (pont)!'; Hang.tesz(); };
  if(!kd.kalib){ kalibLepes='rovid'; msg.textContent='Először beállítjuk a tempódat. Nyomj egy RÖVIDET (pont) a nagy gombon vagy a szóközön!'; }

  /* lejátszás: hang + lámpa */
  function lejatszik(szo, egyseg=180, kesz){
    lejatszas=true; const ev=morzeEsemenyek(szo, egyseg); const t0=performance.now()+300;
    ev.forEach(e=>{ setTimeout(()=>{ vilagit(true); Tavirohang.be(); }, 300+e.le); setTimeout(()=>{ vilagit(false); Tavirohang.ki(); }, 300+e.fel); });
    const vege=ev.length?ev[ev.length-1].fel:0; setTimeout(()=>{ lejatszas=false; kesz&&kesz(); }, 300+vege+200);
  }
  app.querySelectorAll('.mt').forEach(b=>b.onclick=()=>{ if(!lejatszas) lejatszik(b.dataset.b, 160); });

  /* feladatok */
  function bekopogFeladat(){ const lista=MORZE_FELADATOK.bekopog, p=Tar.p(); let i=lista.findIndex((_,j)=>!p.csillag['klub:mb:'+j]); if(i<0) i=Math.floor(Math.random()*lista.length);
    feladat={tip:'be', szo:lista[i], i}; esemenyek=[]; mutat();
    fel.innerHTML=`<div class="mfel"><div class="rt">Morzézd be ezt a szót:</div><div class="mcel">${lista[i]}</div><div class="mkod">${morzeKod(lista[i]).replace(/\./g,'·').replace(/-/g,'−')}</div>
      <div class="rt">Nyomd a távírót! Ha hibáztál, nyomd meg a TÖRLÉS gombot.</div></div>`; }
  function hallFeladat(teszt){ const lista=MORZE_FELADATOK.hallgat, p=Tar.p(); let i=teszt?Math.floor(Math.random()*lista.length):lista.findIndex((_,j)=>!p.csillag['klub:mh:'+j]); if(i<0) i=Math.floor(Math.random()*lista.length);
    if(!teszt) feladat={tip:'hall', szo:lista[i], i}; else { feladat.szo=lista[i]; feladat.mod='hall'; }
    fel.innerHTML=`<div class="mfel">${teszt?`<div class="rt">Teszt: ${feladat.kor}/5. kör</div>`:''}<div class="rt">Hallgasd és nézd a lámpát! Melyik szót morzézom?</div>
      <div class="row"><button class="cbtn small" id="hujra">MÉG EGYSZER</button><button class="cbtn small" id="hlassu">LASSABBAN</button></div>
      <div class="row"><input id="hval" maxlength="12" placeholder="A szó" autocomplete="off"><button class="cbtn small pink" id="hkesz">KÉSZ</button></div></div>`;
    const szo=feladat.szo;
    document.getElementById('hujra').onclick=()=>{ if(!lejatszas) lejatszik(szo,180); };
    document.getElementById('hlassu').onclick=()=>{ if(!lejatszas) lejatszik(szo,300); };
    document.getElementById('hkesz').onclick=()=>{ const v=nagy(document.getElementById('hval').value.trim()); if(v===szo) siker(); else hiba(v); };
    document.getElementById('hval').onkeydown=e=>{ if(e.key==='Enter') document.getElementById('hkesz').click(); };
    setTimeout(()=>lejatszik(szo,180), 400);
  }
  function tesztKor(){
    if(feladat.kor>5){ const pont=feladat.pont, cs=pont>=5?3:pont>=4?2:pont>=2?1:0; const uj=cs?csillagAd('klub:mt',cs):null;
      fel.innerHTML=`<div class="mfel"><div class="mcel">${pont}/5</div><div class="rt">${cs?'★'.repeat(cs)+' ':''}${pont>=4?'Kiváló távírász vagy!':'Gyakorolj még egy kicsit, és menni fog!'}</div></div>`;
      Hang.gyoz(); if(cs>=2) Konfetti.lo(); Karcsi.mond(talkEl, uj?`Teszt kész! Új ruhát kaptam: ${uj.nev}!`:`Teszt kész: ${pont} jó válasz az 5-ből.`,'huu','wow'); feladat=null; return; }
    if(feladat.kor%2===1){ const lista=MORZE_FELADATOK.bekopog.slice(1); feladat.szo=lista[Math.floor(Math.random()*lista.length)]; feladat.mod='be'; esemenyek=[]; mutat();
      fel.innerHTML=`<div class="mfel"><div class="rt">Teszt: ${feladat.kor}/5. kör. Morzézd be (most segítség nélkül!):</div><div class="mcel">${feladat.szo}</div>
        <div class="row"><button class="cbtn small" id="tkihagy">NEM MEGY, KÖVETKEZŐ</button></div></div>`;
      document.getElementById('tkihagy').onclick=()=>hiba(''); }
    else hallFeladat(true);
  }
  function siker(){
    if(!feladat) return;
    Hang.jo();
    if(feladat.tip==='be'){ const uj=csillagAd('klub:mb:'+feladat.i,1); Karcsi.mond(talkEl, uj?`Szuper! Új ruhám van: ${uj.nev}!`:`Tökéletes! „${feladat.szo}” megérkezett!`,'huu','wow'); feladat=null; fel.innerHTML='<div class="mfel"><div class="rt">Ügyes! Jöhet a következő?</div></div>'; setTimeout(bekopogFeladat,1800); }
    else if(feladat.tip==='hall'){ const uj=csillagAd('klub:mh:'+feladat.i,1); Karcsi.mond(talkEl, uj?`Jó füled van! Új ruhám: ${uj.nev}!`:`Igen, „${feladat.szo}”! Jó füled van!`,'huu','wow'); feladat=null; setTimeout(()=>hallFeladat(false),1500); }
    else { feladat.pont++; feladat.kor++; Karcsi.mond(talkEl,'Jó!','huu','wow'); setTimeout(tesztKor,900); }
  }
  function hiba(v){
    Hang.rossz();
    if(feladat && feladat.tip==='teszt'){ Karcsi.mond(talkEl, v?`Nem ${v}, hanem ${feladat.szo}.`:`Ez a(z) ${feladat.szo} volt.`,'hoppa','oops'); feladat.kor++; setTimeout(tesztKor,1300); }
    else Karcsi.mond(talkEl,'Nem egészen. Hallgasd meg még egyszer, akár lassabban!','hoppa','oops');
  }
  document.getElementById('fbe').onclick=()=>{ Hang.tesz(); bekopogFeladat(); };
  document.getElementById('fhall').onclick=()=>{ Hang.tesz(); hallFeladat(false); };
  document.getElementById('fteszt').onclick=()=>{ Hang.tesz(); feladat={tip:'teszt', kor:1, pont:0}; tesztKor(); };
}
