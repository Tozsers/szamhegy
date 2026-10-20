/* ============================================================
   SEGÉDESZKÖZ — a jobb oldali sáv (a Szabálykönyv tükre)
   Einstein-fejezetek: számológép (π ≈ 22/7 gombbal) — ott a képlet a nehéz, nem a szorzás.
   Géniusz: sorrend-segéd — megmutatja, mit kell ELŐBB kiszámolni, de az eredményt nem mondja meg.
   ============================================================ */
const segedTipus = lid => { const s=SZINT(lid); return s.csoport==='einstein' ? 'szamologep' : s.id==='genius' ? 'sorrend' : null; };

/* Számológép-kifejezés kiértékelése műveleti sorrenddel, tört is lehet. tokens: [szám, '+', szám, ...] */
function szamolKif(tok){
  const n=[], o=[];
  tok.forEach((t,i)=> (i%2===0 ? n : o).push(t));
  if(n.length!==o.length+1 || n.some(x=>typeof x!=='number' || !Number.isFinite(x))) return null;
  for(let i=0;i<o.length;){ if(ELOBB(o[i])){ if(o[i]==='÷' && n[i+1]===0) return null; n.splice(i,2,MUV[o[i]](n[i],n[i+1])); o.splice(i,1); } else i++; }
  let v=n[0]; for(let i=0;i<o.length;i++) v=MUV[o[i]](v,n[i+1]);
  return Math.round(v*1e9)/1e9;
}
const szamSzoveg = v => { if(v===null) return 'Hiba'; const s=String(Math.round(v*1e6)/1e6).replace('.',','); return s.length>12 ? v.toExponential(4).replace('.',',') : s; };

/* A sorrend-segéd: egy 7 hosszú sor bontása lépésekre */
function sorrendLepesek(tok){
  const [a,o1,b,o2,c,,e]=tok;
  if(ELOBB(o2) && !ELOBB(o1)) return {elso:[b,o2,c], masodik:[a,o1,'①'], miert:`Itt ${o2==='×'?'a szorzás':'az osztás'} az erősebb, ezért a jobb oldali pár megy előre.`};
  if(ELOBB(o1) && !ELOBB(o2)) return {elso:[a,o1,b], masodik:['①',o2,c], miert:`${o1==='×'?'A szorzás':'Az osztás'} jön előbb, aztán a ${o2==='+'?'hozzáadás':'kivonás'}.`};
  return {elso:[a,o1,b], masodik:['①',o2,c], miert:'A két művelet egyforma rangú, ezért balról jobbra haladunk.'};
}

const segedGomb = lid => segedTipus(lid) ? `<button class="cbtn small segedgomb" id="seged">${segedTipus(lid)==='szamologep'?'SZÁMOLÓGÉP':'SORREND'}</button>` : '';
const segedAside = lid => {
  const t=segedTipus(lid); if(!t) return '';
  return `<aside class="tools" id="tools" aria-label="Segédeszköz">
    <div class="rhead">${t==='szamologep'?'SZÁMOLÓGÉP':'SORREND-SEGÉD'}<small>${t==='szamologep'?'Itt a képlet a nehéz. A szorzást rábízhatod a gépre.':'Megmutatom, mit számolj előbb. Az eredmény a te dolgod!'}</small></div>
    <div id="tools-tart"></div>
    <button class="cbtn small rclose" id="tzar">BEZÁR</button></aside>`;
};
function segedBekot(lid, fvAd){
  const t=segedTipus(lid), el=document.getElementById('tools'); if(!t||!el) return;
  const tart=document.getElementById('tools-tart');
  const zar=()=>{ el.classList.remove('nyitva'); document.querySelectorAll('.rulesbg').forEach(b=>b.remove()); };
  const g=document.getElementById('seged');
  if(g) g.onclick=()=>{ Hang.tesz(); const bg=document.createElement('div'); bg.className='rulesbg'; bg.onclick=zar; document.body.appendChild(bg); el.classList.add('nyitva'); };
  document.getElementById('tzar').onclick=zar;
  if(t==='szamologep') szamologep(tart); else sorrendSeged(tart, fvAd());
}
function szamologep(tart){
  let tok=[], bevitel='', eredmeny=null;
  const gombok=['7','8','9','÷','4','5','6','×','1','2','3','−','0',',','π','+','C','⌫','='];
  tart.innerHTML=`<div class="calc"><div class="cdisp"><div class="ckif" id="ckif">&nbsp;</div><div class="cert" id="cert">0</div></div>
    <div class="ckeys">${gombok.map(k=>`<button class="ck ${'÷×−+'.includes(k)?'op':k==='='?'eq':k==='C'||k==='⌫'?'fn':''}" data-k="${k}">${k}</button>`).join('')}</div>
    <div class="cnote">π gomb: 22/7 (≈ 3,142857). Ebben a játékban mindig ennyi.</div></div>`;
  const kif=tart.querySelector('#ckif'), ert=tart.querySelector('#cert');
  const szam=s=>s==='π'?22/7:parseFloat(s.replace(',','.'));
  const mutat=()=>{ kif.textContent=[...tok.map(x=>typeof x==='number'?szamSzoveg(x):x), bevitel].join(' ').trim()||' '; ert.textContent=eredmeny!==null?szamSzoveg(eredmeny):(bevitel||'0'); };
  tart.querySelectorAll('.ck').forEach(b=>b.onclick=()=>{
    const k=b.dataset.k; Hang.tik();
    if(k==='C'){ tok=[]; bevitel=''; eredmeny=null; }
    else if(k==='⌫'){ if(bevitel) bevitel=bevitel.slice(0,-1); else if(tok.length) tok.pop(); }
    else if(k==='='){ if(bevitel){ tok.push(szam(bevitel)); bevitel=''; } eredmeny=szamolKif(tok); tok=[]; if(eredmeny!==null) bevitel=String(eredmeny).replace('.',','); eredmeny=null; }
    else if('÷×−+'.includes(k)){ if(bevitel){ tok.push(szam(bevitel)); bevitel=''; } if(tok.length && typeof tok[tok.length-1]==='number') tok.push(k); else if(tok.length) tok[tok.length-1]=k; }
    else if(k==='π'){ if(!bevitel) bevitel='π'; }
    else if(k===','){ if(bevitel!=='π' && !bevitel.includes(',')) bevitel=(bevitel||'0')+','; }
    else { if(bevitel==='π') return; bevitel+=k; }
    mutat();
  });
  mutat();
}
function sorrendSeged(tart, fv){
  const res=new Set(fv.resek);
  const hosszu=fv.egyenletek.map((e,i)=>({e,i})).filter(x=>x.e.tokenek.length===7);
  const lat=(e,j)=>{ const k=e.cellak[j].join(','); return res.has(k)?'?':e.tokenek[j]; };
  const kock=t=>t==='?'?'<div class="t b"></div>':t==='①'?'<div class="t lep">1.</div>':csempe(t,tipus(t));
  if(!hosszu.length){ tart.innerHTML='<div class="rt">Ezen a pályán csak rövid sorok vannak. Itt nincs mit sorba rakni, mehet balról jobbra!</div>'; return; }
  tart.innerHTML=hosszu.map(({e},n)=>{
    const tok=e.tokenek.map((_,j)=>lat(e,j)), L=sorrendLepesek(e.tokenek);
    if(tok[1]==='?' || tok[3]==='?')   // rejtett műveleti jel: a sorrendet nem áruljuk el, mert az a megoldás része
      return `<div class="sorr"><div class="rc">${n+1}. hosszú sor</div><div class="mini">${tok.map(kock).join('')}</div>
        <div class="rt">Itt egy műveleti jel is hiányzik, ezért a sorrendet neked kell kitalálnod! Ha szorzás vagy osztás kerül a résbe, az megy előre. Próbáld ki fejben mind a négy jelet!</div></div>`;
    // a lépésekben a rések kérdőjelként jelennek meg (a megoldást nem áruljuk el)
    const poz = ELOBB(e.tokenek[3]) && !ELOBB(e.tokenek[1]) ? [2,3,4] : [0,1,2];
    const e1=poz.map(j=>lat(e,j)), e2 = poz[0]===2 ? [lat(e,0),lat(e,1),'①'] : ['①',lat(e,3),lat(e,4)];
    return `<div class="sorr"><div class="rc">${n+1}. hosszú sor</div>
      <div class="mini">${tok.map(kock).join('')}</div>
      <div class="lep1"><b>1. lépés:</b><div class="mini">${e1.map(kock).join('')}</div></div>
      <div class="lep1"><b>2. lépés:</b><div class="mini">${e2.map(kock).join('')}<div class="t e">=</div>${kock(lat(e,6))}</div></div>
      <div class="rt">${esc(L.miert)}</div></div>`;
  }).join('');
}
