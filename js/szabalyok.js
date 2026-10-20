/* ============================================================
   SZABÁLYKÖNYV — szintenkénti szabályok.
   c: cím, t: magyarázat, p: példa mini-kockákkal (szóközzel tagolva, ? = üres kocka), k: képlet.
   A sorrend számít: a hibaelemzés 'szint:index' alakban hivatkozik rájuk (generator.js → hibaOka, alakok.js → szabaly).
   ============================================================ */
const SZABALYOK = {
  ovi:[
    {c:'Összeadás', t:'Ha hozzáteszünk valamit, több lesz.', p:'3 + 2 = 5'},
    {c:'Mindegy a sorrend', t:'Az összeadásnál a két szám helyet cserélhet.', p:'2 + 4 = 4 + 2'},
    {c:'Tipp: a nagyobbtól', t:'A nagyobb számtól indulj, és onnan számolj tovább!', p:'6 + 3 = 9'},
    {c:'Hiányzik egy szám?', t:'Számolj a kisebbtől a nagyobbig: ennyi hiányzik.', p:'4 + ? = 7'}
  ],
  also:[
    {c:'Kivonás', t:'Ha elveszünk, kevesebb marad.', p:'9 − 4 = 5'},
    {c:'Itt NEM mindegy a sorrend', t:'A kivonásnál a nagyobb szám áll elöl.', p:'7 − 2 ≠ 2 − 7'},
    {c:'Ellenőrizd összeadással', t:'Az eredményhez add hozzá, amit elvettél: visszakapod az elejét.', p:'5 + 4 = 9'},
    {c:'Tízesátlépés', t:'Előbb egészítsd ki tízre, aztán jöhet a maradék.', p:'8 + 5 = 8 + 2 + 3'}
  ],
  felso:[
    {c:'Szorzás = sok összeadás', t:'Ugyanazt a számot adjuk össze többször.', p:'4 × 3 = 4 + 4 + 4'},
    {c:'Felcserélhető', t:'A szorzásnál is mindegy a sorrend.', p:'6 × 7 = 7 × 6'},
    {c:'Trükk: szorzás 9-cel', t:'Szorozd meg 10-zel, aztán vonj le egyszer a számból.', p:'9 × 6 = 60 − 6'},
    {c:'Hiányzó tag', t:'Ha az összeg ismert, a hiányzó tagot kivonással kapod meg.', p:'? + 14 = 20'}
  ],
  profi:[
    {c:'Osztás = szorzás visszafelé', t:'Azt keresed, hányszor van meg benne.', p:'56 ÷ 8 = 7'},
    {c:'Ellenőrzés', t:'Az osztást szorzással ellenőrzöd.', p:'7 × 8 = 56'},
    {c:'Hiányzó szorzó', t:'Ha a szorzat ismert, a hiányzó számot osztással kapod.', p:'? × 6 = 42'},
    {c:'Hiányzó osztandó', t:'Ha az osztás eredménye ismert, szorozz vissza.', p:'? ÷ 4 = 9'},
    {c:'Nullával nem osztunk', t:'Ezt még a számológép is megtagadja.'}
  ],
  zseni:[
    {c:'Hol kezdd?', t:'Azzal a sorral, ahol csak egy kocka hiányzik.'},
    {c:'Kereszteződés', t:'Ami két sorban is benne van, annak mindkettőben jónak kell lennie.'},
    {c:'Csali', t:'Nem minden szám kell a tálcáról. Néhány csak kísértésnek van ott.'},
    {c:'Páros, páratlan', t:'Páros + páros = páros, páros + páratlan = páratlan, páros × bármi = páros.', p:'6 + 3 = 9'},
    {c:'Utolsó számjegy', t:'A szorzat utolsó jegye csak a tényezők utolsó jegyén múlik.', p:'7 × 8 = 56'}
  ],
  genius:[
    {c:'Előbb szorzunk!', t:'Előbb a szorzás és az osztás, csak utána az összeadás és a kivonás.', p:'2 + 3 × 4 = 14'},
    {c:'Nem 20!', t:'Ha balról jobbra mennél, 5 × 4 = 20 jönne ki. Ez a leggyakoribb csapda.', p:'2 + 12 = 14'},
    {c:'Egyformák: balról jobbra', t:'Az azonos rangú műveleteket balról jobbra végezzük.', p:'20 − 5 − 3 = 12'},
    {c:'Osztás és szorzás együtt', t:'Ezek is egyenrangúak: balról jobbra.', p:'24 ÷ 4 × 2 = 12'},
    {c:'Zárójel', t:'Itt nincs, de ha lenne, az menne legelőször. Ő a VIP.'},
    {c:'Jelek a helyükön', t:'A pálya második felében a műveleti jel is hiányozhat. Jel a jel helyére, szám a szám helyére!', p:'6 ? 7 = 42'}
  ],
  e1:[
    {c:'A szám maga a forma', t:'A világoskék kockában nincs kiírva a szám. Számold ki a forma kerületét: az a szám. Koppints a formára, és Karcsi elmondja, mi az.'},
    {c:'Négyzet', t:'Mind a 4 oldala egyforma.', k:'K = 4 · a'},
    {c:'Téglalap', t:'Két hosszú és két rövid oldal.', k:'K = 2 · (a + b)'},
    {c:'Szabályos háromszög', t:'Mind a 3 oldala egyforma.', k:'K = 3 · a'},
    {c:'Kör', t:'Itt π ≈ 22/7, ezért a sugár mindig 7 többszöröse. r = 7 esetén K = 2 · 7 · 22/7 = 44.', k:'K = 2 · r · π'}
  ],
  e2:[
    {c:'Terület', t:'Hány egységnyi négyzet fér bele? Az a szám.'},
    {c:'Négyzet', t:'Oldal szorozva oldallal.', k:'T = a · a'},
    {c:'Téglalap', t:'Hosszúság szorozva szélességgel.', k:'T = a · b'},
    {c:'Derékszögű háromszög', t:'Fél téglalap: a két befogó szorzatának a fele.', k:'T = a · b / 2'},
    {c:'Kör', t:'r = 7 esetén T = 7 · 7 · 22/7 = 154.', k:'T = r · r · π'}
  ],
  e3:[
    {c:'Térfogat és felszín', t:'V: hány kis kocka fér bele. A: mekkora a burkolata, mind a 6 lapja együtt.'},
    {c:'Kocka térfogata', t:'Él · él · él.', k:'V = a · a · a'},
    {c:'Kocka felszíne', t:'6 egyforma négyzetlap.', k:'A = 6 · a · a'},
    {c:'Téglatest térfogata', t:'A három él szorzata.', k:'V = a · b · c'}
  ],
  e4:[
    {c:'Gúla', t:'A gúla pont harmada a vele egyforma alapú és magasságú hasábnak.'},
    {c:'Négyzet alapú gúla', t:'Alapterület szorozva a magassággal, osztva hárommal.', k:'V = a · a · m / 3'},
    {c:'Csonka gúla', t:'Alul a, felül b oldalú négyzet. Ez a képlet már Einsteint is megizzasztotta volna.', k:'V = m / 3 · (a·a + a·b + b·b)'}
  ]
};
const KARCSI_MEGJ = {
  ovi:'Karcsi szerint: az ujjak a legjobb számológépek. Nem merülnek le.',
  also:'Karcsi szerint: a kivonás olyan, mint a sütiosztás. Fogy.',
  felso:'Karcsi szerint: a szorzótábla az egyetlen tábla, amit nem kell letörölni.',
  profi:'Karcsi szerint: az osztás igazságos. Mindenki ugyanannyit kap.',
  zseni:'Karcsi szerint: a csalik a legravaszabb számok. Ne higgy nekik.',
  genius:'Karcsi szerint: a szorzás tolakodik, de udvariasan. Mint a nagymama a postán.',
  e1:'Karcsi szerint: a kerület az, amit a hangya bejár, ha körbesétál.',
  e2:'Karcsi szerint: a pizzánál a terület számít, nem a kerület. Ezt jegyezd meg.',
  e3:'Karcsi szerint: ő maga is kocka. A térfogatáról nem nyilatkozik.',
  e4:'Karcsi szerint: a fáraók is így számoltak. Csak ők kőből.'
};
