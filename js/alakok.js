/* ============================================================
   ALAKOK — az „Einstein is elhasalna” fejezetek formái.
   Minden forma: mit kérdez (betu: K/T/V/A), keres(v,r) → paraméterek, amelyekből pont v jön ki,
   rajz(p) → SVG (100×100), leiras(p) → amit Karcsi mond, ha rákoppintasz, szabaly → hivatkozás a Szabálykönyvre.
   Új forma = új elem; a szintek.js-ben a fejezet alak.tip listájához kell adni.
   ============================================================ */
const PI_TORT = '22/7';
const SZ = (x,y,t,cls='')=>`<text x="${x}" y="${y}" class="al ${cls}" text-anchor="middle">${t}</text>`;
const VON = 'fill="#ffe9a8" stroke="#1b1b2f" stroke-width="4" stroke-linejoin="round"';
const valaszt = (lista, r) => lista.length ? lista[Math.floor(r()*lista.length)] : null;

const ALAKOK = {
  negyzetK:{ betu:'K', nev:'négyzet kerülete', szabaly:'e1:1',
    keres:(v,r)=> v%4===0 && v/4>=2 && v/4<=30 ? {a:v/4} : null,
    ertek:p=>4*p.a,
    rajz:p=>`<rect x="8" y="8" width="84" height="84" ${VON}/>${SZ(50,60,'a='+p.a)}`,
    leiras:p=>`Négyzet, oldala a = ${p.a}. Kell: a kerülete. K = 4 · a.` },
  teglalapK:{ betu:'K', nev:'téglalap kerülete', szabaly:'e1:2',
    keres:(v,r)=>{ if(v%2) return null; const s=v/2, o=[]; for(let b=2;b<s-b;b++) if(s-b<=30) o.push({a:s-b,b}); return valaszt(o,r); },
    ertek:p=>2*(p.a+p.b),
    rajz:p=>`<rect x="4" y="16" width="92" height="68" ${VON}/>${SZ(50,47,'a='+p.a,'sm')}${SZ(50,74,'b='+p.b,'sm')}`,
    leiras:p=>`Téglalap, a = ${p.a}, b = ${p.b}. Kell: a kerülete. K = 2 · (a + b).` },
  haromszogK:{ betu:'K', nev:'szabályos háromszög kerülete', szabaly:'e1:3',
    keres:(v,r)=> v%3===0 && v/3>=2 && v/3<=40 ? {a:v/3} : null,
    ertek:p=>3*p.a,
    rajz:p=>`<path d="M50 4 L96 90 L4 90 Z" ${VON}/>${SZ(50,78,'a='+p.a,'sm')}`,
    leiras:p=>`Szabályos háromszög, minden oldala a = ${p.a}. Kell: a kerülete. K = 3 · a.` },
  korK:{ betu:'K', nev:'kör kerülete', szabaly:'e1:4',
    keres:(v,r)=> v%44===0 && v/44>=1 && v/44<=3 ? {r:7*v/44} : null,
    ertek:p=>2*p.r*22/7,
    rajz:p=>`<circle cx="50" cy="50" r="45" ${VON}/><path d="M50 50 L95 50" stroke="#1b1b2f" stroke-width="4"/><circle cx="50" cy="50" r="5" fill="#1b1b2f"/>${SZ(56,40,'r='+p.r)}`,
    leiras:p=>`Kör, sugara r = ${p.r}. Kell: a kerülete. K = 2 · r · π, ahol π ≈ ${PI_TORT}.` },

  negyzetT:{ betu:'T', nev:'négyzet területe', szabaly:'e2:1',
    keres:(v,r)=>{ const a=Math.round(Math.sqrt(v)); return a*a===v && a>=2 ? {a} : null; },
    ertek:p=>p.a*p.a,
    rajz:p=>`<rect x="8" y="8" width="84" height="84" ${VON}/><path d="M8 36 H92 M8 64 H92 M36 8 V92 M64 8 V92" stroke="#1b1b2f" stroke-width="2" opacity=".25"/>${SZ(50,60,'a='+p.a)}`,
    leiras:p=>`Négyzet, oldala a = ${p.a}. Kell: a területe. T = a · a.` },
  teglalapT:{ betu:'T', nev:'téglalap területe', szabaly:'e2:2',
    keres:(v,r)=>{ const o=[]; for(let b=2;b*b<v;b++) if(v%b===0 && v/b<=30) o.push({a:v/b,b}); return valaszt(o,r); },
    ertek:p=>p.a*p.b,
    rajz:p=>`<rect x="4" y="16" width="92" height="68" ${VON}/><path d="M27 16 V84 M50 16 V84 M73 16 V84 M4 50 H96" stroke="#1b1b2f" stroke-width="2" opacity=".25"/>${SZ(50,47,'a='+p.a,'sm')}${SZ(50,74,'b='+p.b,'sm')}`,
    leiras:p=>`Téglalap, a = ${p.a}, b = ${p.b}. Kell: a területe. T = a · b.` },
  derekT:{ betu:'T', nev:'derékszögű háromszög területe', szabaly:'e2:3',
    keres:(v,r)=>{ const o=[], w=2*v; for(let b=2;b*b<w;b++) if(w%b===0 && w/b<=30) o.push({a:w/b,b}); return valaszt(o,r); },
    ertek:p=>p.a*p.b/2,
    rajz:p=>`<path d="M6 4 L6 94 L96 94 Z" ${VON}/><rect x="6" y="80" width="14" height="14" fill="none" stroke="#1b1b2f" stroke-width="3"/>${SZ(54,86,'a='+p.a,'xs')}${SZ(30,58,'b='+p.b,'xs')}`,
    leiras:p=>`Derékszögű háromszög, befogói a = ${p.a} és b = ${p.b}. Kell: a területe. T = a · b / 2.` },
  korT:{ betu:'T', nev:'kör területe', szabaly:'e2:4',
    keres:(v,r)=> v===154 ? {r:7} : v===616 ? {r:14} : null,
    ertek:p=>p.r*p.r*22/7,
    rajz:p=>`<circle cx="50" cy="50" r="45" ${VON}/><path d="M50 50 L95 50" stroke="#1b1b2f" stroke-width="4"/><circle cx="50" cy="50" r="5" fill="#1b1b2f"/>${SZ(56,40,'r='+p.r)}`,
    leiras:p=>`Kör, sugara r = ${p.r}. Kell: a területe. T = r · r · π, ahol π ≈ ${PI_TORT}.` },

  kockaV:{ betu:'V', nev:'kocka térfogata', szabaly:'e3:1',
    keres:(v,r)=>{ const a=Math.round(Math.cbrt(v)); return a*a*a===v && a>=2 ? {a} : null; },
    ertek:p=>p.a**3,
    rajz:p=>kockaRajz()+SZ(36,74,'a='+p.a,'sm'),
    leiras:p=>`Kocka, éle a = ${p.a}. Kell: a térfogata. V = a · a · a.` },
  kockaA:{ betu:'A', nev:'kocka felszíne', szabaly:'e3:2',
    keres:(v,r)=>{ if(v%6) return null; const a=Math.round(Math.sqrt(v/6)); return 6*a*a===v && a>=2 ? {a} : null; },
    ertek:p=>6*p.a*p.a,
    rajz:p=>kockaRajz()+SZ(36,74,'a='+p.a,'sm'),
    leiras:p=>`Kocka, éle a = ${p.a}. Kell: a felszíne (mind a 6 lap együtt). A = 6 · a · a.` },
  teglatestV:{ betu:'V', nev:'téglatest térfogata', szabaly:'e3:3',
    keres:(v,r)=>{ const o=[]; for(let a=2;a<=10;a++) for(let b=2;b<a;b++) for(let c=2;c<=b;c++) if(a*b*c===v) o.push({a,b,c}); return valaszt(o,r); },
    ertek:p=>p.a*p.b*p.c,
    rajz:p=>`<path d="M8 40 L66 40 L66 86 L8 86 Z" ${VON}/><path d="M8 40 L30 20 L88 20 L66 40 Z" fill="#fff4cc" stroke="#1b1b2f" stroke-width="4" stroke-linejoin="round"/><path d="M66 40 L88 20 L88 66 L66 86 Z" fill="#f5d77a" stroke="#1b1b2f" stroke-width="4" stroke-linejoin="round"/>${SZ(35,72,'a='+p.a,'xs')}${SZ(84,84,'b='+p.b,'xs')}${SZ(52,15,'c='+p.c,'xs')}`,
    leiras:p=>`Téglatest, élei a = ${p.a}, b = ${p.b}, c = ${p.c}. Kell: a térfogata. V = a · b · c.` },

  gulaV:{ betu:'V', nev:'négyzet alapú gúla térfogata', szabaly:'e4:1',
    keres:(v,r)=>{ const o=[]; for(let a=2;a<=10;a++){ const w=3*v; if(w%(a*a)===0){ const m=w/(a*a); if(m>=2&&m<=15) o.push({a,m}); } } return valaszt(o,r); },
    ertek:p=>p.a*p.a*p.m/3,
    rajz:p=>`<path d="M10 78 L62 78 L88 62 L36 62 Z" fill="#f5d77a" stroke="#1b1b2f" stroke-width="3.5" stroke-linejoin="round"/><path d="M50 8 L10 78 L62 78 Z" ${VON}/><path d="M50 8 L62 78 L88 62 Z" fill="#f5d77a" stroke="#1b1b2f" stroke-width="4" stroke-linejoin="round"/><path d="M50 8 L49 70" stroke="#1b1b2f" stroke-width="2.5" stroke-dasharray="4 3"/>${SZ(36,96,'a='+p.a,'xs')}${SZ(28,50,'m='+p.m,'xs')}`,
    leiras:p=>`Gúla, az alapja négyzet (a = ${p.a}), magassága m = ${p.m}. Kell: a térfogata. V = a · a · m / 3.` },
  csonkaV:{ betu:'V', nev:'csonka gúla térfogata', szabaly:'e4:2',
    keres:(v,r)=>{ const o=[]; for(let a=3;a<=8;a++) for(let b=1;b<a;b++){ const S=a*a+a*b+b*b, w=3*v; if(w%S===0){ const m=w/S; if(m>=2&&m<=12) o.push({a,b,m}); } } return valaszt(o,r); },
    ertek:p=>p.m*(p.a*p.a+p.a*p.b+p.b*p.b)/3,
    rajz:p=>`<path d="M8 80 L66 80 L90 64 L32 64 Z" fill="#f5d77a" stroke="#1b1b2f" stroke-width="3.5" stroke-linejoin="round"/><path d="M28 24 L52 24 L66 80 L8 80 Z" ${VON}/><path d="M52 24 L66 18 L90 64 L66 80 Z" fill="#f5d77a" stroke="#1b1b2f" stroke-width="4" stroke-linejoin="round"/><path d="M28 24 L42 18 L66 18 L52 24 Z" fill="#fff4cc" stroke="#1b1b2f" stroke-width="3.5" stroke-linejoin="round"/>${SZ(36,97,'a='+p.a,'xs')}${SZ(52,13,'b='+p.b,'xs')}${SZ(37,58,'m='+p.m,'xs')}`,
    leiras:p=>`Csonka gúla: alul a = ${p.a}, felül b = ${p.b} oldalú négyzet, magassága m = ${p.m}. Kell: a térfogata. V = m / 3 · (a·a + a·b + b·b).` }
};
function kockaRajz(){
  return `<path d="M4 32 L70 32 L70 96 L4 96 Z" ${VON}/><path d="M4 32 L30 6 L96 6 L70 32 Z" fill="#fff4cc" stroke="#1b1b2f" stroke-width="4" stroke-linejoin="round"/><path d="M70 32 L96 6 L96 70 L70 96 Z" fill="#f5d77a" stroke="#1b1b2f" stroke-width="4" stroke-linejoin="round"/>`;
}
const Alak = {
  /* v-hez egy véletlen forma a megadott típusokból (vagy null) */
  keres(v, tipusok, r){
    // a ritka formák (pl. kör) elsőbbséget kapnak, különben szinte sosem kerülnének elő
    const ritka=t=>{ this._rit=this._rit||{}; if(this._rit[t]===undefined){ let n=0; for(let x=2;x<=400;x++) if(ALAKOK[t].keres(x,()=>.5)) n++; this._rit[t]=n; } return this._rit[t]; };
    const sorr=[...tipusok].sort((a,b)=>ritka(a)*(.4+r())-ritka(b)*(.4+r()));
    for(const tip of sorr){ const p=ALAKOK[tip].keres(v,r); if(p && Math.abs(ALAKOK[tip].ertek(p)-v)<1e-9) return {tip,p}; }
    return null;
  },
  svg(a){ return `<svg viewBox="0 0 100 100" aria-hidden="true">${ALAKOK[a.tip].rajz(a.p)}</svg><span class="ab">${ALAKOK[a.tip].betu}</span>`; },
  leiras(a){ return ALAKOK[a.tip].leiras(a.p); },
  /* a fejezet összes formázható értéke (a kedvelt operandusokhoz) */
  ertekek(tipusok, max){ const r=()=>.5, o=[]; for(let v=2;v<=max;v++) if(tipusok.some(t=>ALAKOK[t].keres(v,r))) o.push(v); return o; }
};
