# MEAT GRINDER (Húsdaráló) – fejlesztési leírás és iránymutatás

A **Meat Grinder** a korábbi **DroneRun** helyére került (4.54.0). Műfaja: oldalnézetes, poszt-apokaliptikus
„juss el a végéig, közben fejlessz” autós játék – hasonló felépítésű, mint az Earn to Die-féle játékok, de saját
grafikával, saját járművel (PzH 2000) és saját tartalommal.

- Kód: `mg.js` (önálló ES-modul, az `app.js` lustán tölti be: `lazyMod('mg')`, `mgOpen()`).
- Stílus: `styles.css` végén, `/* MEAT GRINDER */` blokk; minden szabály `#harc .mg…` / `#harc.mgon` alatt.
- Ranglista: a régi mezők maradtak (`droneBest`, `droneN`, `medve-drone-best`), így a Firestore-szabályokat
  nem kellett módosítani. A menü-, ranglista- és napi kihívás-nevek „Meat Grinder”-re változtak.
- Mentés: `localStorage['medve-mg-v1']` (kupak, fejlesztési szintek, pályánkénti legjobb táv, megnyitott pályák).
- A régi DroneRun-kód (`droneOpen`, `drLoop` stb.) még az `app.js`-ben van, de a menüből már nem érhető el.
  A Shot&Run használ belőle közös részeket (`D_WHEELS`, `drBodyImg`, …), ezért törlés előtt ezt ellenőrizni kell.

## Játékmenet

1. **Cél:** a pálya végén lévő **MENEDÉK** kapuig eljutni. 3 pálya: Kiürített külváros (1200 m), Rozsdaövezet
   (2000 m), Fertőzött laktanya (3000 m). Egy pálya teljesítése nyitja a következőt.
2. **Menet vége:** elfogyott az üzemanyag és megállt a jármű · 0-ra csökkent a páncél · 2,4 mp-ig fejjel lefelé ·
   6–9 mp-ig elakadt · feladás (szünetmenü).
3. **Jutalom (kupak):** 0,55 kupak / megtett méter + ellenfelenkénti díj + kupakládák + menedék-jutalom.
4. **Műhely:** 9 fejlesztési kategória, szintenként ár és **távfeltétel** (a legnagyobb egy menetben megtett táv).
   Így a fejlesztés a megtett távolsághoz és – a tartályon keresztül – az üzemanyaghoz kötött.
5. **Pontszám (ranglista):** `megtett méter + ellenfelek pontja (+ kombó-bónusz) + 1000 × pálya sorszáma, ha célba értél`.
   Kombó: 1,3 mp-en belüli ölések láncolata; 3-tól ×N kiírás, 7-től „VÉRFÜRDŐ!”, 12-től „HÚSDARÁLÓ!”.

### Irányítás

| Érintés | Billentyű | Hatás |
|---|---|---|
| ▶ GÁZ | → / D | gyorsítás |
| ◀ FÉK | ← / A | fék, álló helyzetből tolatás |
| ↺ / ↻ BILLENT | ↑ W / ↓ S | forgatás (levegőben erősen, földön enyhén) |
| 💥 TŰZ | Space / F | 155 mm-es gránát (ha van lőszer-fejlesztés) |
| 🚀 RAKÉTA | Shift | tolóerő a jármű tengelye mentén |
| ❚❚ | P / Esc | szünet |

Fekvő tájolásban is játszható (a többi játékkal ellentétben ott nem kér forgatást).

## Fejlesztések (`UPG` tömb)

| Kategória | Mit ad | Szintek |
|---|---|---|
| Motor | húzóerő-szorzó `f`, végsebesség `v` | gyári → kipufogó → turbó → iker-turbó → kompresszoros szörny |
| Futómű | tapadás `g`, ütésvédelem `cr`, levegő-irányítás `tl` | kopott → új tagok → tüskés lánc → torziós rudak → versenyfutómű |
| Üzemanyag | tartály literben `l` | 60 → 90 → 130 → 180 → 250 L |
| Páncélzat | páncélpont `hp`, sérüléscsökkentés `dr` | gyári → lemezek → rácsketrec → sínacél → guruló erőd (tetőtüskék) |
| Orr-előtét | ütés-szorzó `m`, folyamatos darálás `dps`, kisebb lassulás `sr`, orrhossz `ext`, orrvédelem `fp` | csupasz → dózerlap → tüskés eke → kombájn-tálca → HÚSDARÁLÓ |
| Oldalvédelem | kapaszkodók sebzése `dps`, felmászás csökkentése `gr` | nincs → szögesdrót → tüskék → láncfűrész |
| Fő fegyver | lőszer `am`, töltés `rl`, sebzés `dm`, sugár `rad` | bedugott cső → 2 / 3 / 5 / 8 gránát |
| Kiegészítő fegyver | tűzgyorsaság `rt`, sebzés `dm`, hatótáv `rg` | nincs → FN MAG → iker MAG → M2HB → minigun |
| Rakétahajtás | idő `cap` (mp), tolóerő `th` | nincs → JATO → iker → utánégető |

Minden szint látszik a járművön is (`drawVeh` / `drawFront`): kannák, hordók, rácsok, tüskék, kipufogók,
kompresszor, géppuska, rakéták, eke/motolla/darálódobok.

## Ellenfelek (`ZT` objektum)

| Típus | Életerő | Jellemző |
|---|---|---|
| Csoszogó | 62 | lassú, tömegben jön, felmászik |
| Futó | 44 | gyors, ugrik, gyakran felkapaszkodik |
| Puffadt | 120 | szétrobbanva savat fröcsköl (sebzi a járművet és a többi zombit) |
| Köpködő | 70 | ívben savat köp |
| Martalóc katona | 75 | barikád mögül lő |
| Rohamzombi | 230 | pajzs: lassú ütésnél csak 45% sebzés, a géppuska is gyengén fogja (M2HB-ig) |
| Óriás | 800 | fal: megállítja a járművet és üt; csak nagy sebességnél esik el |

A pályán 15–40 fős **hordák** vannak (figyelmeztető tábla + „⚠ HORDA ELŐTTED”), az ellenfelek életereje
pályánként +15%. Nehéz megölni őket: az ütés sebzése `(relatív sebesség / 10)^1,35 × 2,4 × orr-szorzó`,
lassú ütközésnél semmi – ilyenkor nekifeszülnek, lassítanak, felmásznak, vagy elesnek és a lánctalp eltapossa őket.
Sérülten leszakad a karjuk, véreznek.

## Fizika (`vehStep`)

- **Jármű: az eredeti PzH 2000 modell** – ugyanaz a kép (`img/sprite5.webp` test, `img/sprite6.webp` cső) és
  ugyanaz a 9 kerekes futómű-geometria (`D_WHEELS`, `PK`, `PCX`, `PBY`), mint a DroneRunban és a Shot&Runban;
  a „Mad Max” fejlesztések erre a sziluettre vannak rárajzolva.
- Merev test (x, y, szög, sebességek), 7 futógörgő + hajtó- és feszítőkerék rugós-csillapított kontaktussal,
  a test sarkai külön ütköznek (tető- és orrütés sebez). Al-lépésekben fut (≥ 240 Hz).
- Vonóerő tapadáshoz kötve (`grip × normálerő`), motorerő a végsebesség felé csökken; a kapaszkodó zombik lefogják.
- Talaj: 16 egységenként mintavett magasságtérkép, pályánként rögzített maggal (minden menetben ugyanaz a pálya,
  így megtanulható). Elemek: rámpa (ugrató, hirtelen leszakad), kráter, roncsautó-halom, barikád, robbanó hordó,
  üzemanyag-kanna, kupakláda.
- 1 m = 10 egység, gravitáció 300 egység/s².

## Gore-rendszer

- **Folyadék-cseppek** (`MG.parts`): sebesség irányába nyúlnak, a földre érve tócsát hagynak; vér (piros), nyálka/sav (zöld).
- **Tócsák** (`MG.dec`): a talaj lejtésével forgatott ellipszisek, idővel szétterülnek.
- **Húscafatok** (`MG.gibs`): szabálytalan húsdarabok, csont, fej, kar, láb; pattognak, vércsíkot húznak.
- **Belek** (`MG.guts`): Verlet-lánc (7–11 pont) távolság-kényszerrel, talajjal ütközik.
- **Tetemek** a földön, **véres jármű** (foltok az orron, csöpög), a darálódob felfelé köpi a húst.
- Darabszám-plafonok: `LOWFX` (gyenge telefon mód) mellett kb. a fele.

## Teszt

A fejlesztés közben Playwright „robotpilótával” végigvezetett menetek (800×450, fekvő):

| Felszereltség | Pálya | Eredmény |
|---|---|---|
| alap (minden 0) | 1. | kb. 508 m, kifogyott az üzemanyag |
| közepes (főleg 2. szint) | 1. | célba ért |
| közepes | 2. | kb. 1100–1450 m |
| maximális | 1., 2., 3. | mind célba ért (a 3.-on 9 páncélponttal) |

Konzolhiba egyik menetben sem volt; a képkockaszám a fej nélküli böngészőben végig ~120 FPS.

## Bővítési útmutató

- **Új fejlesztési szint:** új elem az adott `UPG[…].lv` tömb végére (`n`, `d`, `c` ár, `r` távfeltétel, `s` statok).
  A műhely, a mentés és a szint-pöttyök automatikusan követik. Ha új stat kell, a `makeVeh()`-ben kösd be.
- **Új fejlesztési kategória:** új objektum az `UPG`-be + felhasználás a `makeVeh()`-ben + rajz a `drawVeh()`-ben.
  A régi mentések automatikusan 0. szintet kapnak (`load()`).
- **Új ellenfél:** új kulcs a `ZT`-be, viselkedés a `zStep()`-ben (`z.t === '…'`), rajz a `zBody()`-ban,
  és súly a pályák `mix` listájában.
- **Új pálya:** új elem a `STAGES`-be (hossz, mag, színek, horda-pozíciók, keverék, jutalom). A pályaválasztó és a
  megnyitás (`sv.unl`) automatikus; a `blankSave().best/done` tömbök hosszát is növeld.
- **Új akadály:** a `buildStage()` `props` listájába új `k`, ütközés a `propStep()`-ben, rajz a `drawProp()`-ban.
- **Hangolás:** az ütés-képlet a `zStep()` „ELÖL” ágában, a sebzések a `hurt()` hívásoknál, a fogyasztás a
  `vehStep()` végén (`burn`), a jutalom a `showResult()`-ban. Az `MG.hurtBy` sebzésforrásonként összesít
  (hangoláshoz hasznos).
- **Teljesítmény:** minden effekt-lista plafonos; új effektnél adj hozzá plafont, és `LOWFX` alatt csökkentsd.
- **Verzió:** új kiadásnál az `app.js` `APP_VER` és a `sw.js` `CACHE` értékét együtt emeld (az `mg.js` benne van a
  service worker offline listájában).

## Ötletek a folytatáshoz

- Végtelen mód a 3. pálya után (egyre sűrűbb hordák), napi kihívás-pálya véletlen maggal.
- Mentés szinkronizálása Firestore-ba (ehhez új mezők és szabálymódosítás kell).
- Fényező/festés-választó a műhelyben, matricák.
- Helikopteres utánpótlás-ledobás, éjszakai pálya fényszóróval.
- (Kész, 4.55.0) Saját zenei téma: `SONGS.grinder` az `app.js`-ben.


## 4.55.0 – fejlesztések

- **Valódi felfüggesztés** (`vehStep`): a 7 futógörgő egyenként rugózik (rugó + lengéscsillapító, visszarugózáskor keményebb,
  ütközőgumi a végén, véges sebességű kirugózás). A kerék a talajhoz **5 pontos burkolóval** illeszkedik. A futómű-fejlesztés
  (`SUSV`) nagyobb lengést és keményebb csillapítást ad. A hajtó- és feszítőkerék merev, csak ütőszerűen ér a talajhoz.
  A vonóerő a rugó normálterheléséhez kötött (gyorsításkor/fékezéskor a jármű ténylegesen bólint). Kirajzolva: lengőkarok,
  csillapítók, a lánctalp követi a kerekeket (`V.sy`). A talaj Catmull-Rom görbe (`gY`/`gSl`), a pálya simítva.
- **Por** a lánctalp alól és landoláskor (`MG.dust`), jármű-árnyék, vignetta, napfény, köd-rétegek, additív robbanás-fény.
- **Kamera**: közelebb (kb. 1,6–2×), frame-rate független követés, előre- és függőleges előrenézés.
- **Felbontás + lag**: a képpont-arány max 2,5 (korábban 2); `qualityGov` a képkocka-idő alapján automatikusan csökkenti/emeli
  (`MG.q`). Az ég egy gyorsítótárazott réteg.
- **Új szörnyek** az ALONE IN THE CORRIDOR-ból (`mgmon.js`, pixel-art sprite-ok): Nyurga, Bőrtelen Kopó, Pókanya, Csigaszörny,
  Kiborg-Bio, Polip-Isten, Sziámi Iker (halálakor két Nyurgára hasad), Hústorony (fal, mint az Óriás). A `ZT` jelzői:
  `leap` (ugrik), `rng` (`gun`/`acid`: távolról lő), `stand`, `wall` (megállítja a járművet), `big`, `bar`, `mon`.
  Halálukkor a sprite darabokra esik szét (`chunk` húscafatok).
- **Zene**: `grinder` – csapatos stadion-hard rock (e-moll, taps-stomp, tapsolás, „HEY!” kórus). `rkClap`/`rkGang` az `app.js`-ben.

## 4.55.1 – fémes megjelenés

A fejlesztések (páncéllemezek, ketrec, tüskék, kipufogók, turbó/kompresszor, hordók, tolólap/eke/kombájn/darálódob) tompa, csiszolt,
rozsdás-hegesztett acélnak néznek ki. Segédek a `mg.js`-ben (`drawVeh` előtt): `metalTile`/`mt` (gyorsítótárazott lemez: színátmenet,
csiszolási szálak, szemcse, karcok, rozsda, szegecs, varrat + érintkezési árnyék), `mpoly`, `spike`/`spikeH`, `pipe`, `disc`.
Új alkatrésznél ezekkel rajzolj, a szín `#rrggbb` legyen.

## 4.55.2 – közepes rugózás, valósághűbb lánc

- Rugózás közepesre hangolva (`SUSV`): kb. 35% beülés állva, csillapítási tényező ~0,5, 11–16 egység lengés a futómű szintjétől függően.
- Lánctalp (`trackPath`/`drawTrack`): a lánc a kerekek külső érintői mentén fut, a hajtó/feszítőkerék körül körbeível, a felső ága megereszkedik,
  az alsó ága a kiemelkedő talaj fölött fölfelé tolódik (átfekszik a kisebb egyenetlenségeken). Láncszemek, csapszegek, tüskék/bordák a
  futómű-szinttel. A lánc fázisa a talajhoz képest hátrafelé fut (korábban rossz irányba), a kerekek gördülés-helyesen forognak, a
  levegőben a gázra pörög, fékre lassul (`V.trkV`). Gumiabroncsos, csavarozott acél görgők, fogaskerekű hajtókerék.

## 4.56.0 – lefolyó vér a járművön

`bloodOn` / `bloodStep` / `drawBlood` (mg.js): az orrra és a testre fröccsent vér nedvesen **lefolyik** a lemezeken – a „lefelé” a jármű dőlése
szerint változik, a menetszél hátrafelé fújja a csíkot –, a csík végéről és az alsó élről **csöpög** (a cseppek a talajon tócsát hagynak),
~45 mp alatt **megszárad** (sötétedik), majd elhalványul. Több vér kerül rá, ha erősebb az orr-előtét, és nagy ellenfeleknél
(`ZT.big`). Plafon: 54 folt (gyenge telefonon 24).

## 4.57.0 – új főmenü-poszter

A főmenü Meat Grinder lapja (`ART_SCN.drone` az `app.js`-ben) képregény-poszter lett: égő romváros és füstoszlopok, nap félárnyék-pontozással,
óriás PzH 2000 hátsó rakétákkal, tetőtüskékkel és véres húsdaráló-dobokkal, szétrepülő húscafatok, lefolyó vér a felső szélről, „HÚSDARÁLÓ!”
felirat. A horda a Corridor szörnyeiből áll (Hústorony, Polip-Isten, Pókanya, Kopó, Nyurga – `mgmon.js`, az `artAssets` tölti be).
Az aktív lapon lassú ráközelítés, izzó keret és felszálló parázs fut (`styles.css` vége; `prefers-reduced-motion` mellett kikapcsol).

## 4.58.0 – új fegyverek, életszerűbb zombik és vér

- **Fő ágyú**: két új szint – 20 gránát (forgótáras tár) és **60 gránát** (automata ágyú, kb. 2 lövés/mp). A TŰZ gomb / Space / F **nyomva tartva** sorozatot lő.
- **Lángszóró** (`lang`, 4 szint): LÁNG gomb / G billentyű. Kúp alakú láng a fúvókából (`NZ`); az ellenfelek égnek (`burn`/`bd`), a tüzet továbbadják egymásnak,
  a robbanó hordók felrobbannak. A tartály lassan töltődik, ha nem tüzelsz.
- **Lézer** (`lezer`, 4 szint): automatikus; a legközelebbi célpontokat égeti (1–3 sugár), az Impulzus-lézertől kezdve a sugár útjában minden ellenfelet (`pi`).
- **Automata torony** (`torony`, 4 szint): a tetőn hátul, 360°-ban lő, a rádmászókat előbb leszedi; Gatling és páncéltörő iker-gatling szint.
- A műhely „Tűzerő” csíkja (`firePower`) az összes fegyvert számolja. Régi mentések kompatibilisek (az új kategóriák 0. szintről indulnak).
- **Zombik**: új, emberi arányú rajz (`zBody`): görnyedt törzs, hajlító térdű lábak, két előrenyújtott kar (felkar ruha, alkar bőr), előre lógó fej nyitott
  állkapoccsal és izzó szemmel; típusonként ruházat (katona: sisak, mellény, puska; rohamzombi: sisak, pajzs; puffadt: dagadt has; köpködő: nyálzsák).
- **Vér**: nem ragad: a folt csíkot húz (gravitáció + menetszél), a farka követi, fogy és lecsöpög – ~10–30 mp alatt lemegy a gépről.

## 4.59.0 – saját rajzolt piktogramok

A Meat Grinder minden emoji-ikonja le lett cserélve a `mgico.js` saját, egyedi SVG-piktogramjaira (katonai sablon-stílus: vastag, 45°-ban
levágott sarkok, két tónus, sötét kivágások, szegecsek). `ico('név')` ad beágyazható SVG-t; a szín a `color`, a kiemelés a `--ic2`, a kivágás a `--ic0`
CSS-változóból jön. Készlet: motor, track, fuel, shield, plow, spikes, cannon, mg, rocket, flame, laser, turret, coin (kupak = kapszli), wrench,
flag, lock/unlock, check, skull, trophy, pause, close, left/right, play, rotl/rotr, warn, zombie, boom, white. A vászonra rajzolt jelek
(horda-figyelmeztetés, robbanó hordó) is rajzolt alakzatok. Új ikon: új bejegyzés az `ICONS`-ba `[fő szín, kiemelés, SVG-tartalom]`.

## 4.60.0 – gyorsabb elakadás-kérdés, lánc–talaj kapcsolat

- **Elakadás** (`askStuck`): a játék megáll és megkérdezi, **feladod-e**, ha a gép ~3 mp-ig áll (4 mp, ha rajta vannak a zombik), vagy 4 mp alatt
  28 egységnél (2,8 m) kevesebbet jut előre (pl. ide-oda ringatózik), illetve 2,2 mp-ig fejjel lefelé áll. A „Tovább próbálom” 5 mp haladékot ad.
  Az első gáz / mozgás előtt nem kérdez. Kifogyott üzemanyagnál 1,2 mp után azonnal vége.
- **Lánc és talaj** (`TKO`, `trackPath`): a talajjal a lánc **külső felülete** érintkezik (korábban a kerék pereme, ezért a lánc kb. 6 egységet belesüllyedt),
  a lánc a kerekek között megereszkedik, a hajtó/feszítőkerék körüli ívek és az alsó ág soha nem mennek a talaj alá, kiemelkedő talajon fölfelé tolódnak.

## 4.61.0 – városi pálya, erősebb alap motor

- **Új pálya: „Lakott városnegyed”** (2. pálya, 1800 m, `kind: 'city'`): alkonyi égbolt, égő ablakú panelházak két rétegben, utcai lámpák, reklámtáblák,
  sávjelzés és zebra az úton, villogó rendőrautó, jersey-betonakadályok (`kind: 'jersey'`), taxik és dugó-roncsok, katonai útzárak.
  A pályák nehézségét mostantól a `lv` (ellenség-sűrűség, roncs-halmok), a `hpm` (ellenség életerő-szorzó) és az `sb` (győzelmi pontbónusz) mező adja
  (nem a sorszám), így az új pálya beilleszthető anélkül, hogy a többi változna. Mentés-verzió: 3 – a régi mentések 2. és 3. pályája egyet tolódik
  (`load()`), a kupak és a fejlesztések változatlanok.
- **Motor és terepjáró-képesség alapon is jobb**: a gyári motor `f` 1,0 → 1,35 (a szorzó 95 → 110), végsebesség 150 → 165, a gyári lánc tapadása
  0,85 → 1,05. Mért emelkedő (alap felszerelés, 9 mp): régen már a 20°-ot sem mászta meg, most a 20°-ot végig, a 25°-ot lassan. A magasabb szintek
  arányosan feljebb kerültek (a legerősebb motor 2,05 → 2,3).
