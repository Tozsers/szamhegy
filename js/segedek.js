/* ============================================================
   TÁROLÁS (játékosonként), HANG, KONFETTI, NAPI REJTVÉNY
   Minden a böngészőben marad (localStorage). Ha a böngésző nem enged tárolni, a játék akkor is megy, csak nem emlékszik.
   ============================================================ */
const Tar = {
  k:'szamhegy-v2',
  d:{profilok:{}, aktiv:null, nema:false},
  betolt(){
    try{
      const x=JSON.parse(localStorage.getItem(this.k)); if(x) this.d={...this.d,...x};
      if(!x){ const regi=JSON.parse(localStorage.getItem('szamhegy-v1')||'null');   // az első változat csillagai
        if(regi && regi.csillag && Object.keys(regi.csillag).length){ const p=this.uj('Játékos','felnott'); p.csillag=regi.csillag; this.d.nema=!!regi.nema; this.ment(); } }
    }catch(e){}
  },
  ment(){ try{ localStorage.setItem(this.k, JSON.stringify(this.d)); }catch(e){} },
  uj(nev, osztaly){
    const id='p'+Date.now().toString(36)+Math.floor(Math.random()*1e4);
    this.d.profilok[id]={id, nev, osztaly, csillag:{}, ruha:null, utolso:ajanlott(osztaly), napi:{utolso:null, sorozat:0, legjobb:0, kesz:{}}, gyors:{}};
    this.d.aktiv=id; this.ment(); return this.d.profilok[id];
  },
  torol(id){ delete this.d.profilok[id]; if(this.d.aktiv===id) this.d.aktiv=Object.keys(this.d.profilok)[0]||null; this.ment(); },
  p(){ return this.d.profilok[this.d.aktiv] || null; },
  cs(lvl,p){ const pr=this.p(); return pr ? (pr.csillag[lvl+':'+p]||0) : 0; },
  szint(lvl){ const pr=this.p(), s=SZINT(lvl); let db=0,cs=0; if(pr) for(const k in pr.csillag){ if(k.startsWith(lvl+':')){ db++; cs+=pr.csillag[k]; } } return {db,cs,max:s.db}; },
  osszCs(pr=this.p()){ if(!pr) return 0; let s=0; for(const k in pr.csillag) s+=pr.csillag[k]; for(const k in pr.napi.kesz) s+=pr.napi.kesz[k]; return s; },
  ruhak(pr=this.p()){ const c=this.osszCs(pr); return RUHAK.filter(r=>!r.rejtett && c>=r.kell); }
};

const Napi = {
  ma(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); },
  tegnap(){ const d=new Date(); d.setDate(d.getDate()-1); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); },
  seed(){ return Number(this.ma().replace(/-/g,'')); },
  kesz(){ const p=Tar.p(); return !!(p && p.napi.kesz[this.ma()]); },
  sorozat(){ const p=Tar.p(); if(!p) return 0; const u=p.napi.utolso; return (u===this.ma()||u===this.tegnap()) ? p.napi.sorozat : 0; },
  rogzit(cs){
    const p=Tar.p(); if(!p) return; const ma=this.ma();
    if(p.napi.utolso!==ma){ p.napi.sorozat = p.napi.utolso===this.tegnap() ? p.napi.sorozat+1 : 1; p.napi.utolso=ma; }
    p.napi.kesz[ma]=Math.max(cs, p.napi.kesz[ma]||0); p.napi.legjobb=Math.max(p.napi.legjobb,p.napi.sorozat); Tar.ment();
  }
};

const Hang = {
  ctx:null,
  t(freqs, dur=.09, type='square', gap=.07, vol=.06){
    if(Tar.d.nema) return;
    try{
      this.ctx = this.ctx || new (window.AudioContext||window.webkitAudioContext)();
      const c=this.ctx, now=c.currentTime;
      freqs.forEach((f,i)=>{ const o=c.createOscillator(), g=c.createGain(); o.type=type; o.frequency.value=f;
        g.gain.setValueAtTime(vol, now+i*gap); g.gain.exponentialRampToValueAtTime(.0001, now+i*gap+dur);
        o.connect(g).connect(c.destination); o.start(now+i*gap); o.stop(now+i*gap+dur+.02); });
    }catch(e){}
  },
  tesz(){ this.t([660],.06,'triangle',0,.08); },
  vissza(){ this.t([420],.06,'triangle',0,.07); },
  jo(){ this.t([523,659,784],.12,'square',.08,.05); },
  rossz(){ this.t([300,220],.16,'sawtooth',.12,.05); },
  sugo(){ this.t([880,1175],.1,'sine',.09,.08); },
  gyoz(){ this.t([523,659,784,1047,784,1047],.16,'square',.11,.05); },
  tik(){ this.t([1200],.03,'square',0,.03); }
};

const Konfetti = (()=>{
  let cv=null, ctx=null, parts=[], fut=false;
  const szinek=['#2f9bff','#ff9a1f','#ff5d8f','#ffc82e','#a98bff','#34c759'];
  function lo(){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    cv=cv||document.getElementById('conf'); ctx=ctx||cv.getContext('2d');
    cv.width=innerWidth*devicePixelRatio; cv.height=innerHeight*devicePixelRatio;
    for(let i=0;i<140;i++) parts.push({x:innerWidth/2+(Math.random()-.5)*120,y:innerHeight*.35,vx:(Math.random()-.5)*12,vy:-Math.random()*13-4,
      s:6+Math.random()*7,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:szinek[i%szinek.length],l:1});
    if(!fut){ fut=true; requestAnimationFrame(lep); }
  }
  function lep(){
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); ctx.clearRect(0,0,innerWidth,innerHeight);
    parts.forEach(p=>{ p.vy+=.35; p.vx*=.99; p.x+=p.vx; p.y+=p.vy; p.r+=p.vr; p.l-=.006;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r); ctx.fillStyle=p.c; ctx.strokeStyle='#1b1b2f'; ctx.lineWidth=1.5;
      ctx.fillRect(-p.s/2,-p.s/3,p.s,p.s*.66); ctx.strokeRect(-p.s/2,-p.s/3,p.s,p.s*.66); ctx.restore(); });
    parts=parts.filter(p=>p.l>0 && p.y<innerHeight+40);
    if(parts.length) requestAnimationFrame(lep); else { fut=false; ctx.clearRect(0,0,innerWidth,innerHeight); }
  }
  return {lo};
})();
