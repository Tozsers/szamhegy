/* ============================================================
   TITKOS KLUB — a mag (DOM nélkül, node-dal tesztelhető)
   Emoji-titkosírás, saját kulcs kulcskóddal, „Törd fel!” fejtörők, morze kódolás/dekódolás.
   Minden emoji EGY kódpont (nincs ZWJ, nincs FE0F) → Messengerbe másolva sem esik szét.
   ============================================================ */
const ABC = ['A','Á','B','C','D','E','É','F','G','H','I','Í','J','K','L','M','N','O','Ó','Ö','Ő','P','Q','R','S','T','U','Ú','Ü','Ű','V','W','X','Y','Z'];
/* az alap ábécé: mindegyik emoji egy olyan szót mutat, ami azzal a betűvel kezdődik */
const ALAP_EMOJI = {A:['🍎','alma'],Á:['🛌','ágy'],B:['🍌','banán'],C:['🐱','cica'],D:['🦖','dínó'],E:['🐘','elefánt'],É:['🎤','ének'],F:['🌳','fa'],
  G:['🍄','gomba'],H:['🐟','hal'],I:['🧭','iránytű'],Í:['🏹','íj'],J:['🧊','jég'],K:['🐶','kutya'],L:['🐴','ló'],M:['🐵','majom'],N:['🌞','nap'],
  O:['🦁','oroszlán'],Ó:['⌚','óra'],Ö:['👴','öreg'],Ő:['🦌','őz'],P:['🐧','pingvin'],Q:['👑','queen (királynő)'],R:['🦀','rák'],S:['🦅','sas'],
  T:['🐢','teknős'],U:['🦄','unikornis'],Ú:['🏊','úszás'],Ü:['🍾','üveg'],Ű:['🚀','űrhajó'],V:['🏰','vár'],W:['🧇','waffle (gofri)'],
  X:['❌','x'],Y:['🪀','yo-yo'],Z:['🦓','zebra']};
/* 64 emojis paletta a saját kulcshoz (a sorszámuk adja a kulcskódot) */
const PALETTA = [...ABC.map(b=>ALAP_EMOJI[b][0]),
  '🌈','🍕','🍩','🍦','🎸','🚲','🚗','🌵','🌻','🐞','🐝','🐙','🦋','🐸','🐼','🐨','🦊','🐯','🐮','🐷','🐔','🍉','🍓','🥕','🎃','⭐','⚽','🎈','💎'];
const KOD64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const alapKulcs = () => Object.fromEntries(ABC.map(b=>[b, ALAP_EMOJI[b][0]]));
const nagy = s => s.toLocaleUpperCase('hu-HU');
const tisztit = s => s.replace(/️/g,'');
function titkosit(szoveg, kulcs){ return Array.from(nagy(szoveg)).map(ch => kulcs[ch] || ch).join(''); }
function megfejt(emojik, kulcs){
  const vissza = Object.fromEntries(Object.entries(kulcs).map(([b,e])=>[e,b]));
  return Array.from(tisztit(emojik)).map(ch => vissza[ch] || ch).join('');
}
/* kulcs ↔ kulcskód: 'SH-' + 35 karakter (minden betűhöz a palettabeli sorszám) */
function kulcsKod(kulcs){ return 'SH-' + ABC.map(b=>KOD64[PALETTA.indexOf(kulcs[b])]).join(''); }
function kodbolKulcs(kod){
  const k=(kod||'').trim().replace(/^SH-/i,'');
  if(k.length!==ABC.length) return null;
  const kulcs={}, latott=new Set();
  for(let i=0;i<ABC.length;i++){ const n=KOD64.indexOf(k[i]); if(n<0||n>=PALETTA.length||latott.has(n)) return null; latott.add(n); kulcs[ABC[i]]=PALETTA[n]; }
  return kulcs;
}
function veletlenKulcs(r=Math.random){
  const p=[...PALETTA]; for(let i=p.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [p[i],p[j]]=[p[j],p[i]]; }
  return Object.fromEntries(ABC.map((b,i)=>[b,p[i]]));
}

/* „Törd fel!” fejtörők — elég hosszúak ahhoz, hogy a betűgyakoriság segítsen */
const FEJTOROK = [
  'A KIS KUTYA A KERT VÉGÉBEN ELÁSTA A CSONTOT, DE MÁSNAP MÁR NEM TALÁLTA MEG.',
  'MA ESTE A NAGYMAMA PALACSINTÁT SÜT, ÉS MINDENKI KAP BELŐLE KETTŐT.',
  'A TITKOS KLUB TAGJAI SZOMBATON A PADLÁSON TALÁLKOZNAK. A JELSZÓ: ALMA.',
  'KOCKA KARCSI SZERINT A MATEK OLYAN, MINT A SÜTEMÉNY: MINÉL TÖBB, ANNÁL JOBB.',
  'A KALÓZOK A KINCSET A SZIGET KÖZEPÉN, A NAGY FA ALATT ÁSTÁK EL.',
  'HOLNAP REGGEL KIRÁNDULNI MEGYÜNK A HEGYRE, VIGYÉL MAGADDAL ESERNYŐT IS.',
  'AZ ŰRHAJÓ ELINDULT A HOLD FELÉ, A MACSKA PEDIG NYUGODTAN ALUDT TOVÁBB.',
  'A LEGJOBB BARÁTOM TUDJA A TITKOMAT, DE SENKINEK SEM MONDJA EL SOHA.'
];
const fejtoroKulcs = i => veletlenKulcs(rng(9000+i));
function gyakorisag(emojik){ const g={}; Array.from(tisztit(emojik)).forEach(ch=>{ if(PALETTA.includes(ch)) g[ch]=(g[ch]||0)+1; }); return Object.entries(g).sort((a,b)=>b[1]-a[1]); }
const MAGYAR_GYAKORI = ['E','A','T','L','N','S','K','O','R','I','M','Z','G','É','Á'];

/* ---------------- MORZE ---------------- */
const MORZE = {A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',
  Á:'.--.-',É:'..-..',Ö:'---.',Ü:'..--'};
const MORZE_VISSZA = Object.fromEntries(Object.entries(MORZE).map(([b,k])=>[k,b]));
const EKEZET_LE = {Ó:'Ö',Ő:'Ö',Ú:'Ü',Ű:'Ü',Í:'I'};
function morzeKod(szo){ return Array.from(nagy(szo)).map(ch=> ch===' ' ? '/' : (MORZE[ch]||MORZE[EKEZET_LE[ch]]||'')).filter(Boolean).join(' '); }

/* Dekódoló a gyerek saját tempójához igazítva.
   esemenyek: [{le, fel}] ezredmásodpercben. kalib: korábban megismert határ (pont/vonal) ezredmásodpercben, vagy null.
   1) A lenyomásokat két csoportra bontja (rövid = pont, hosszú = vonal), ha van köztük egyértelmű különbség.
   2) Ha mind egyforma (pl. E, T, SOS nélkül), a korábbi kalibrációt vagy egy gyerekbarát alapértéket használ.
   3) A szüneteket a pont hosszához méri: > 2 pont = új betű, > 5 pont = új szó. */
const MORZE_ALAP_HATAR = 380;
function morzeDekodol(esemenyek, kalib=null){
  if(!esemenyek.length) return {szoveg:'', jelek:[], hatar:kalib||MORZE_ALAP_HATAR, pont:null};
  const d=esemenyek.map(e=>e.fel-e.le), min=Math.min(...d), max=Math.max(...d);
  let hatar;
  if(max/min >= 1.8){            // két csoport: egyszerű 1D k-közép
    let c1=min, c2=max;
    for(let it=0;it<10;it++){ const h=(c1+c2)/2, a=d.filter(x=>x<h), b=d.filter(x=>x>=h); c1=a.reduce((s,x)=>s+x,0)/a.length; c2=b.reduce((s,x)=>s+x,0)/b.length; }
    hatar=Math.sqrt(c1*c2);
  } else hatar = kalib || MORZE_ALAP_HATAR;
  const jel=d.map(x=>x<hatar?'.':'-');
  const pontok=d.filter(x=>x<hatar), vonalak=d.filter(x=>x>=hatar);
  const pont = pontok.length ? pontok.reduce((s,x)=>s+x,0)/pontok.length : vonalak.reduce((s,x)=>s+x,0)/vonalak.length/3;
  let szoveg='', akt='';
  esemenyek.forEach((e,i)=>{
    if(i>0){ const sz=e.le-esemenyek[i-1].fel;
      if(sz > 2*pont){ szoveg+=MORZE_VISSZA[akt]||'?'; akt=''; if(sz > 5*pont) szoveg+=' '; } }
    akt+=jel[i];
  });
  szoveg+=MORZE_VISSZA[akt]||'?';
  return {szoveg, jelek:jel, hatar, pont, utolsoBetu:akt};
}
/* Bemelegítés: egy rövid és egy hosszú lenyomásból a határ (a kettő mértani közepe) */
function morzeKalibral(rovid, hosszu){ return (rovid>0 && hosszu>rovid*1.4) ? Math.sqrt(rovid*hosszu) : null; }
/* Gépi „gyerek”: egy szóból lenyomás-sorozat adott egységgel és szórással (teszthez és a lejátszáshoz) */
function morzeEsemenyek(szo, egyseg=150, szoras=0, r=Math.random){
  const j=x=>x*(1+(r()*2-1)*szoras); const ev=[]; let t=0;
  Array.from(nagy(szo)).forEach((ch,ci,arr)=>{
    if(ch===' '){ t+=j(4*egyseg); return; }
    const k=MORZE[ch]||MORZE[EKEZET_LE[ch]]||'';
    Array.from(k).forEach((jel,ji)=>{ const d=j(jel==='.'?egyseg:3*egyseg); ev.push({le:t,fel:t+d}); t+=d+(ji<k.length-1?j(egyseg):0); });
    if(ci<arr.length-1) t+=j(3*egyseg);
  });
  return ev;
}
const MORZE_FELADATOK = {
  bekopog:['E','T','SOS','NAP','HAL','MAMA','PAPA','CICA','KUTYA','KARCSI'],
  hallgat:['SOS','NAP','HAL','TE','IGEN','NEM','MAMA','LABDA','OKOS','TITOK']
};
