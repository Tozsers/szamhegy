/* ============================================================
   GENERÁTOR (KERESZTMATEK) — DOM nélkül, node-dal tesztelhető.
   generalKereszt(cfg, seed) →
   {cellak:Map("r,c"→{r,c,k:'n'|'o'|'e',v,alak?}), egyenletek:[{cellak,tokenek,dir}], resek:[kulcs], talca:[érték], sorok, oszlopok}
   Ugyanaz a seed mindig ugyanazt a pályát adja.
   ============================================================ */
function rng(seed){ let a = seed>>>0; return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const MUV = {'+':(a,b)=>a+b,'−':(a,b)=>a-b,'×':(a,b)=>a*b,'÷':(a,b)=>b===0?NaN:a/b};
const ELOBB = o => o==='×'||o==='÷';
const SZAMHELY = L => L===5?[0,2,4]:[0,2,4,6];

/* Kifejezés értéke műveleti sorrenddel; null, ha nem egész vagy negatív lesz közben */
function ertek(sz, op){
  const n=[...sz], o=[...op];
  for(let i=0;i<o.length;){ if(ELOBB(o[i])){ const v=MUV[o[i]](n[i],n[i+1]); if(!Number.isInteger(v)||v<0) return null; n.splice(i,2,v); o.splice(i,1);} else i++; }
  let v=n[0]; for(let i=0;i<o.length;i++){ v=MUV[o[i]](v,n[i+1]); if(!Number.isInteger(v)||v<0) return null; }
  return v;
}
/* Balról jobbra (a tipikus hiba) */
function ertekBalrol(sz, op){
  let v=sz[0]; for(let i=0;i<op.length;i++){ v=MUV[op[i]](v,sz[i+1]); if(!Number.isFinite(v)) return null; } return v;
}
function bont(tok){ const L=tok.length, sz=[], op=[]; for(let i=0;i<L-2;i++) (i%2?op:sz).push(tok[i]); return {sz,op,e:tok[L-1]}; }
function egyenletOk(tok){
  const {sz,op,e}=bont(tok);
  if(!sz.every(x=>typeof x==='number') || typeof e!=='number' || !op.every(o=>o in MUV)) return false;
  const v=ertek(sz,op); return v!==null && v===e;
}

function eq5(cfg, r, op, fix){
  const R=(lo,hi)=>{ if(lo>hi) return null;
    if(cfg.kedvelt && r()<.55){ const k=cfg.kedvelt.filter(x=>x>=lo&&x<=hi); if(k.length) return k[Math.floor(r()*k.length)]; }
    return lo+Math.floor(r()*(hi-lo+1)); };
  const M=cfg.max, K=cfg.mulMax, P=K*K;
  let a=null,b=null,c=null; const f=fix?fix.i:-1, v=fix?fix.v:null;
  if(op==='+'){ if(f===0){a=v;b=R(1,M-a);} else if(f===2){b=v;a=R(1,M-b);} else if(f===4){c=v;a=R(1,c-1);b=a===null?null:c-a;} else {a=R(1,M-1);b=a===null?null:R(1,M-a);} if(a!==null&&b!==null&&c===null)c=a+b; }
  if(op==='−'){ if(f===0){a=v;b=R(1,a-1);} else if(f===2){b=v;a=R(b+1,M);} else if(f===4){c=v;b=R(1,M-c);a=b===null?null:c+b;} else {a=R(2,M);b=a===null?null:R(1,a-1);} if(a!==null&&b!==null&&c===null)c=a-b; }
  if(op==='×'){ if(f===0){a=v; if(a<1||a>K) return null; b=R(2,K);} else if(f===2){b=v; if(b<1||b>K) return null; a=R(2,K);} else if(f===4){c=v; const p=[]; for(let x=2;x<=K;x++) if(c%x===0&&c/x>=2&&c/x<=K) p.push(x); if(!p.length) return null; a=p[Math.floor(r()*p.length)]; b=c/a;} else {a=R(2,K);b=R(2,K);} if(a!==null&&b!==null&&c===null)c=a*b; }
  if(op==='÷'){ if(f===0){a=v; const d=[]; for(let x=2;x<=K;x++) if(a%x===0&&a/x>=1&&a/x<=K) d.push(x); if(!d.length) return null; b=d[Math.floor(r()*d.length)]; c=a/b;} else if(f===2){b=v; if(b<2||b>K) return null; c=R(1,K); a=b*c;} else if(f===4){c=v; if(c<1||c>K) return null; b=R(2,K); a=b*c;} else {b=R(2,K);c=R(1,K);a=b*c;} }
  if([a,b,c].some(x=>x===null||!Number.isInteger(x)||x<0||x>Math.max(M,P))) return null;
  const tok=[a,op,b,'=',c]; return egyenletOk(tok)?tok:null;
}
function eq7(cfg, r, fix){
  const R=(lo,hi)=>lo+Math.floor(r()*(hi-lo+1)), K=cfg.mulMax, M=cfg.max, F=Math.floor(M/2);
  for(let t=0;t<400;t++){
    const o1=cfg.ops[Math.floor(r()*cfg.ops.length)], o2=cfg.ops[Math.floor(r()*cfg.ops.length)];
    if(!ELOBB(o1)&&!ELOBB(o2)&&r()<.7) continue;          // legyen benne műveleti sorrend
    let a=ELOBB(o1)?R(2,K):R(1,F), b=(ELOBB(o1)||ELOBB(o2))?R(2,K):R(1,F), c=ELOBB(o2)?R(2,K):R(1,F);
    if(o1==='÷') a=b*R(1,K);
    if(o2==='÷' && !ELOBB(o1)) b=c*R(1,K);
    if(fix){ if(fix.i===0)a=fix.v; if(fix.i===2)b=fix.v; if(fix.i===4)c=fix.v; }
    const e=ertek([a,b,c],[o1,o2]);
    if(e===null||e>M) continue;
    if(fix && fix.i===6 && e!==fix.v) continue;
    return [a,o1,b,o2,c,'=',e];
  }
  return null;
}
function egyenlet(cfg, r, L, fix){
  for(let t=0;t<200;t++){
    const tok = L===5 ? eq5(cfg,r,cfg.ops[Math.floor(r()*cfg.ops.length)],fix) : eq7(cfg,r,fix);
    if(tok) return tok;
  }
  return null;
}

function generalKereszt(cfg0, seed){
  const cfg={...cfg0};
  if(cfg.alak && !cfg.kedvelt) cfg.kedvelt=Alak.ertekek(cfg.alak.tip, cfg.max);
  let tartalek=null;
  for(let proba=0; proba<120; proba++){
    const r=rng(seed*131+proba*7919+1);
    const cellak=new Map(), egy=[];
    const n=cfg.nEq[0]+Math.floor(r()*(cfg.nEq[1]-cfg.nEq[0]+1));
    const valL=()=>cfg.L[Math.floor(r()*cfg.L.length)];
    const kind=(i,L)=> i===L-2?'e':(i%2?'o':'n');
    const box={r0:0,r1:0,c0:0,c1:0};
    const tesz=(tok,r0,c0,dir)=>{
      const cs=[];
      tok.forEach((v,i)=>{ const rr=r0+(dir==='v'?i:0), cc=c0+(dir==='h'?i:0), k=rr+','+cc;
        if(!cellak.has(k)) cellak.set(k,{r:rr,c:cc,k:kind(i,tok.length),v});
        cs.push([rr,cc]); box.r0=Math.min(box.r0,rr);box.r1=Math.max(box.r1,rr);box.c0=Math.min(box.c0,cc);box.c1=Math.max(box.c1,cc); });
      egy.push({cellak:cs,tokenek:tok,dir});
    };
    const L0=cfg.L[0];
    const magFix = cfg.alak && cfg.alak.mag && r()<.8 ? {i:SZAMHELY(L0)[Math.floor(r()*SZAMHELY(L0).length)], v:cfg.alak.mag[Math.floor(r()*cfg.alak.mag.length)]} : null;
    const t0=egyenlet(cfg,r,L0,magFix) || egyenlet(cfg,r,L0,null); if(!t0) continue;
    tesz(t0,0,0, r()<.5?'h':'v');
    let tries=0;
    while(egy.length<n && tries<500){
      tries++;
      const E=egy[Math.floor(r()*egy.length)];
      const ix=SZAMHELY(E.tokenek.length), i=ix[Math.floor(r()*ix.length)];
      const [cr,cc]=E.cellak[i], cv=E.tokenek[i];
      const dir=E.dir==='h'?'v':'h', L=valL(), jx=SZAMHELY(L), j=jx[Math.floor(r()*jx.length)];
      const tok=egyenlet(cfg,r,L,{i:j,v:cv}); if(!tok) continue;
      const dr=dir==='v'?1:0, dc=dir==='h'?1:0, pr=dc, pc=dr;
      const r0=cr-j*dr, c0=cc-j*dc;
      const ures=(rr,c2)=>!cellak.has(rr+','+c2);
      if(!ures(r0-dr,c0-dc) || !ures(r0+L*dr,c0+L*dc)) continue;
      let ok=true; const nb={...box};
      for(let t=0;t<L && ok;t++){
        const rr=r0+t*dr, c2=c0+t*dc;
        nb.r0=Math.min(nb.r0,rr);nb.r1=Math.max(nb.r1,rr);nb.c0=Math.min(nb.c0,c2);nb.c1=Math.max(nb.c1,c2);
        if(t===j) continue;
        if(cellak.has(rr+','+c2)) { ok=false; break; }
        if(!ures(rr+pr,c2+pc) || !ures(rr-pr,c2-pc)) ok=false;
      }
      if(!ok) continue;
      if(nb.c1-nb.c0+1>cfg.W || nb.r1-nb.r0+1>cfg.H) continue;
      tesz(tok,r0,c0,dir);
    }
    if(egy.length<n) continue;
    // eltolás 0-ra
    const cell2=new Map();
    cellak.forEach(c=>{ const rr=c.r-box.r0, c2=c.c-box.c0; cell2.set(rr+','+c2,{...c,r:rr,c:c2}); });
    egy.forEach(e=>e.cellak=e.cellak.map(([a,b])=>[a-box.r0,b-box.c0]));
    const kulcs=c=>c.r+','+c.c;
    const egyben=k=>egy.filter(e=>e.cellak.some(([a,b])=>a+','+b===k));
    const kever=t=>{ for(let i=t.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[t[i],t[j]]=[t[j],t[i]];} return t; };
    // rések
    const szamCellak=[...cell2.values()].filter(c=>c.k==='n');
    const cel=Math.max(egy.length, Math.round(szamCellak.length*cfg.arany));
    const rejt=new Set();
    for(const c of kever([...szamCellak])){
      if(rejt.size>=cel) break;
      const k=kulcs(c);
      const jo=egyben(k).every(e=>{ const szk=SZAMHELY(e.tokenek.length).map(i=>e.cellak[i].join(','));
        return szk.filter(x=>rejt.has(x)).length+1 <= szk.length-cfg.minLatszik; });
      if(jo) rejt.add(k);
    }
    if(!egy.every(e=>SZAMHELY(e.tokenek.length).some(i=>rejt.has(e.cellak[i].join(','))))) continue;
    // műveleti jelek elrejtése (Géniusz második fele)
    if(cfg.opRejt>0) for(const c of kever([...cell2.values()].filter(c=>c.k==='o'))) if(r()<cfg.opRejt) rejt.add(kulcs(c));
    // formák a látható számok helyén (Einstein)
    let alakDb=0;
    if(cfg.alak){
      for(const c of kever(szamCellak.filter(c=>!rejt.has(kulcs(c))))){
        if(r()>cfg.alak.arany) continue;
        const a=Alak.keres(c.v, cfg.alak.tip, r); if(a){ c.alak=a; alakDb++; }
      }
    }
    const vals=[...rejt].map(k=>cell2.get(k).v);
    const talca=[...vals];
    const szamok=vals.filter(v=>typeof v==='number');
    for(let i=0;i<cfg.csali && szamok.length;i++){ const base=szamok[Math.floor(r()*szamok.length)]; let d=base+(r()<.5?-1:1)*(1+Math.floor(r()*3)); if(d<1)d=base+2; talca.push(d); }
    kever(talca);
    const kesz={cellak:cell2, egyenletek:egy, resek:[...rejt], talca, sorok:box.r1-box.r0+1, oszlopok:box.c1-box.c0+1, alakDb};
    if(cfg.alak && alakDb<cfg.alak.min){ if(!tartalek || alakDb>tartalek.alakDb) tartalek=kesz; continue; }
    return kesz;
  }
  return tartalek;
}

/* Hibaelemzés: miért rossz egy kitöltött sor? → {szoveg, szabaly:'szint:index'} vagy null */
function hibaOka(tok, alakok){
  const {sz,op,e}=bont(tok);
  if(!sz.every(x=>typeof x==='number') || typeof e!=='number')
    return {szoveg:'Oda, ahol műveleti jelnek kell állnia, szám került (vagy fordítva). Jel a jel helyére, szám a szám helyére!', szabaly:'genius:5'};
  if(!op.every(o=>o in MUV)) return {szoveg:'Két szám közé műveleti jel kell!', szabaly:'genius:5'};
  if(op.length===2){
    const v=ertekBalrol(sz,op);
    if(v===e && ertek(sz,op)!==e) return {szoveg:'Balról jobbra számoltál? Itt előbb szorzunk és osztunk, csak utána adunk össze!', szabaly:'genius:0'};
  }
  if(op.length===1){
    const [a,b]=sz, o=op[0];
    if(o==='−' && b-a===e) return {szoveg:'Fordítva vontál ki! A kivonásnál nem mindegy a sorrend.', szabaly:'also:1'};
    if(o==='×' && a+b===e) return {szoveg:'Ez szorzás, nem összeadás! A szorzás olyan, mint a sokszor összeadás.', szabaly:'felso:0'};
    if(o==='+' && a*b===e) return {szoveg:'Itt összeadunk, nem szorzunk. A kereszt nem ferde!', szabaly:'ovi:0'};
    if(o==='÷' && a*b===e) return {szoveg:'Ez osztás! Az osztás a szorzás visszafelé.', szabaly:'profi:0'};
    if(o==='+' && a-b===e) return {szoveg:'Kivontál, pedig itt összeadunk!', szabaly:'ovi:0'};
  }
  if(alakok.length) { const a=alakok[0]; return {szoveg:'Nézd meg újra a formát! '+Alak.leiras(a), szabaly:ALAKOK[a.tip].szabaly}; }
  const v=ertek(sz,op);
  if(v!==null && Math.abs(v-e)===1) return {szoveg:'Majdnem! Csak eggyel tévedtél. Számold újra lassan!', szabaly:null};
  if(v!==null && Math.abs(v-e)===10) return {szoveg:'Pont tízzel tévedtél. Figyelj a tízesátlépésre!', szabaly:'also:3'};
  return null;
}

/* Játékmódok regisztere — új mód: MODOK.ujmod = {nev, general(cfg, seed)} */
const MODOK = { kereszt:{ nev:'Keresztmatek', general:generalKereszt } };
