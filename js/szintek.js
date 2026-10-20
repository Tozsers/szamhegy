/* ============================================================
   SZINTEK — itt állítható minden nehézség. Új szint = új elem.
   gen: a fejezet ELSŐ pályájának beállítása, veg: az UTOLSÓé.
   A köztes pályák a kettő közt fokozatosan nehezednek (palyaCfg).
   csoport: 'hegy' = a létra, 'einstein' = a felhők fölötti tábla.
   ============================================================ */
const SZINTEK = [
  { id:'ovi', csoport:'hegy', nev:'Ovis', sub:'Ujjakon számolni ér. Lábujjakon is.', szin:'#7ed957', db:100, sugo:3,
    gen:{ L:[5], ops:['+'], max:6, mulMax:5, nEq:[2,2], minLatszik:2, arany:.34, csali:0, W:7, H:7 },
    veg:{ max:12, nEq:[2,3], csali:2, H:9 },
    jelmondat:'Szia, Kocka Karcsi vagyok! Számolunk? Ha elfogy az ujjad, kölcsönadom az enyémet. Jó, nekem nincs.' },
  { id:'also', csoport:'hegy', nev:'Kisiskolás', sub:'Plusz, mínusz, és egy kis bátorság.', szin:'#4fd1c5', db:100, sugo:3,
    gen:{ L:[5], ops:['+','−'], max:12, mulMax:5, nEq:[2,3], minLatszik:2, arany:.34, csali:0, W:7, H:9 },
    veg:{ max:30, nEq:[3,4], csali:2, arany:.4 },
    jelmondat:'Iskolatáska fel, tolltartó elő! A számok már sorban állnak.' },
  { id:'felso', csoport:'hegy', nev:'Szorzótábla', sub:'Plusz, mínusz, szorzás. Ne fuss el!', szin:'#ffc82e', db:100, sugo:2,
    gen:{ L:[5], ops:['+','−','×'], max:30, mulMax:6, nEq:[3,3], minLatszik:1, arany:.4, csali:1, W:8, H:10 },
    veg:{ max:100, mulMax:10, nEq:[4,5], arany:.5, csali:3 },
    jelmondat:'A szorzótábla nem harap. Csak néha morog egy kicsit.' },
  { id:'profi', csoport:'hegy', nev:'Fejszámoló', sub:'Mind a négy alapművelet, egy füzetben.', szin:'#ff9a1f', db:100, sugo:2,
    gen:{ L:[5], ops:['+','−','×','÷'], max:60, mulMax:10, nEq:[4,5], minLatszik:1, arany:.5, csali:2, W:9, H:11 },
    veg:{ max:100, mulMax:12, nEq:[6,6], arany:.6, csali:4 },
    jelmondat:'Itt már osztunk is. Igazságosan, maradék nélkül.' },
  { id:'zseni', csoport:'hegy', nev:'Zseni', sub:'Sok rés, kevés súgás, csalinak hála.', szin:'#ff5d8f', db:100, sugo:1,
    gen:{ L:[5], ops:['+','−','×','÷'], max:100, mulMax:12, nEq:[6,7], minLatszik:1, arany:.62, csali:3, W:9, H:12 },
    veg:{ max:144, nEq:[8,9], arany:.72, csali:5 },
    jelmondat:'Ide már csak az jön fel, aki a bevásárlólistát is fejben adja össze.' },
  { id:'genius', csoport:'hegy', nev:'Géniusz', sub:'Műveleti sorrend. Később a jeleket is te teszed be!', szin:'#a98bff', db:100, sugo:1,
    gen:{ L:[7,5], ops:['+','−','×','÷'], max:100, mulMax:10, nEq:[3,4], minLatszik:1, arany:.55, csali:3, W:9, H:12, opRejt:-.25 },
    veg:{ nEq:[5,6], arany:.65, csali:5, opRejt:.35 },
    jelmondat:'Üdv a csúcson! Itt a szorzás tolakodik a sor elejére. Mint a nagymamák a postán.' },

  /* --- EINSTEIN IS ELHASALNA: a kockában forma van, a szám a forma kerülete / területe / térfogata --- */
  { id:'e1', csoport:'einstein', nev:'Kerület', sub:'Négyzet, téglalap, háromszög, kör. A szám maga a forma.', szin:'#5ee6c8', db:50, sugo:2,
    gen:{ L:[5], ops:['+','−'], max:100, mulMax:10, nEq:[3,3], minLatszik:1, arany:.35, csali:2, W:8, H:9,
          alak:{ tip:['negyzetK','teglalapK','haromszogK','korK'], arany:.6, min:2, mag:[44,88] } },
    veg:{ nEq:[4,5], arany:.45, csali:3 },
    jelmondat:'Itt nincs kiírva a szám. A formából kell kiszámolnod. Einstein is elhasalna. Te nem fogsz.' },
  { id:'e2', csoport:'einstein', nev:'Terület', sub:'Mekkora a padló? Mekkora a pizza?', szin:'#7fb8ff', db:50, sugo:2,
    gen:{ L:[5], ops:['+','−'], max:200, mulMax:10, nEq:[3,3], minLatszik:1, arany:.35, csali:2, W:8, H:9,
          alak:{ tip:['negyzetT','teglalapT','derekT','korT'], arany:.6, min:2, mag:[154] } },
    veg:{ nEq:[4,5], arany:.45, csali:3 },
    jelmondat:'Terület: ennyi csempe kell, hogy ne fázzon a lábad.' },
  { id:'e3', csoport:'einstein', nev:'Testek', sub:'Kocka, téglatest: térfogat és felszín.', szin:'#ffb86b', db:50, sugo:2,
    gen:{ L:[5], ops:['+','−'], max:300, mulMax:10, nEq:[3,3], minLatszik:1, arany:.35, csali:2, W:8, H:9,
          alak:{ tip:['kockaV','kockaA','teglatestV'], arany:.65, min:2, mag:[27,64,125,54,96,150,24,60,120] } },
    veg:{ nEq:[4,5], arany:.45, csali:3 },
    jelmondat:'Most már három irányban számolunk. Mint a dobozba pakolás, csak precízebben.' },
  { id:'e4', csoport:'einstein', nev:'Gúlák', sub:'Gúla, csonka gúla. Itt hasal el Einstein.', szin:'#ff8fb1', db:50, sugo:2,
    gen:{ L:[5], ops:['+','−'], max:300, mulMax:10, nEq:[3,3], minLatszik:1, arany:.35, csali:2, W:8, H:9,
          alak:{ tip:['gulaV','csonkaV'], arany:.6, min:2, mag:[28,39,63,48,100,56,78,12,36] } },
    veg:{ nEq:[4,4], arany:.45, csali:3 },
    jelmondat:'A csonka gúla olyan, mint egy piramis, aminek levágták a tetejét. A képlete viszont megmaradt.' }
];
const SZINT = id => SZINTEK.find(s=>s.id===id);

/* osztály → ajánlott szint */
const OSZTALYOK = [
  ['ovoda','Óvoda','ovi'], ['1','1. osztály','also'], ['2','2. osztály','also'], ['3','3. osztály','felso'],
  ['4','4. osztály','felso'], ['5','5. osztály','profi'], ['6','6. osztály','profi'], ['7','7. osztály','zseni'],
  ['8','8. osztály','e1'], ['kozep','Középiskola','genius'], ['felnott','Felnőtt','genius']
];
const ajanlott = osz => (OSZTALYOK.find(o=>o[0]===osz)||[])[2] || 'felso';

/* a p. pálya beállítása: gen → veg között fokozatosan */
function palyaCfg(s, p){
  const t = s.db>1 ? Math.min(1,Math.max(0,(p-1)/(s.db-1))) : 0, a=s.gen, b={...a, ...(s.veg||{})}, o={};
  const lerp=(x,y,isInt)=>{ const v=x+(y-x)*t; return isInt?Math.round(v):v; };
  for(const k in a){
    const x=a[k], y=b[k];
    if(typeof x==='number' && typeof y==='number') o[k]=lerp(x,y, Number.isInteger(x)&&Number.isInteger(y));
    else if(Array.isArray(x) && typeof x[0]==='number' && Array.isArray(y)) o[k]=x.map((v,i)=>lerp(v,y[i],true));
    else o[k]=x;
  }
  if(o.opRejt!==undefined) o.opRejt=Math.max(0,o.opRejt);
  return o;
}
