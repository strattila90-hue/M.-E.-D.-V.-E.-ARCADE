# Tervezet: PzH 2000 Lóverseny („Tüzér Derby”)

**Állapot:** brainstorming / tervezet – kód még nem készült hozzá.
**Készült:** 2026-11-16, a 4.39.1-es verzió mellé. Megvalósítva a 9. játék lenne (javasolt verzió: 4.40.0).

---

## 1. Rövid összefoglaló

**Az ötlet:** lóverseny, ahol a „lovak” PzH 2000 önjáró lövegek. A játékos a futam előtt a programfüzetből tájékozódik, a Kassza zsebpénzéből (játékpénz) fogad, majd végignézi – vagy a saját lövegét „hajtva” végigjátssza – a futamot.

**Ajánlás:** a három vizsgált irány közül a **C („Fogadó + hajtó”)** – fogadás totalizatőr-rendszerben, és a saját löveg hajtása ügyességi elemként. Ez illik a meglévő játékokhoz (ügyesség + Kassza-gazdaság), és megkerüli a tisztán szerencsejáték-jelleget.

**Három döntés kell tőled, mielőtt kód készül** (részletek a 8. pontban):
1. Legyen-e a futamnak hatása a havi Kassza-ranglistára, vagy maradjon tőle független?
2. Közös, mindenkinek egyszerre futó online futamok kellenek-e már az első változatban, vagy elég a gép elleni?
3. Maradhat-e a „fogadás” szó és forma úgy, hogy a játékot gyerekek is kézbe kapják (lásd Kassza gyerekzár)?

---

## 2. Kutatás: a lóverseny története

A ✅ jelű adatokat a mostani netes keresés megerősítette; a ⚠️ jelűek közismertek, de a keresésben nem kaptak megerősítést, vagy a források ellentmondanak – felhasználás előtt ellenőrizni kell.

### 2.1 Világ

| Mikor | Mi történt | |
|---|---|---|
| Kr. e. 680 | Fogathajtás (kocsiverseny) az ókori olimpián | ✅ |
| Kr. e. 648 | Lovas (nyeregben futott) verseny is az olimpián | ✅ |
| Római Birodalom | A kocsi- és lóverseny tömegszórakozás és iparág | ✅ |
| kb. 1680–1730 | A három alapító mén Angliába kerül: Byerley Turk, Darley Arabian (1700-ban ellett, Aleppóban vették), Godolphin Arabian (kb. 1730) – minden mai angol telivér apai ágon rájuk megy vissza | ✅ |
| 1711 | Anna királynő megalapítja az ascoti pályát | ✅ |
| 1750-es évek | Megalakul a Jockey Club, egységes szabályokat ír | ✅ (pontos év ⚠️) |
| 1779 / 1780 | Első Oaks, majd első Epsom Derby | ✅ |
| 1791 | James Weatherby kiadja az első méneskönyvet (General Stud Book) | ✅ |
| 1867 | Joseph Oller (katalán származású párizsi vállalkozó) feltalálja a totalizatőrt (pari-mutuel) – eleinte palatáblán, krétával vezették az állást | ✅ |
| 1913 | George Julius ausztrál mérnök első automata totalizatőr-gépe Aucklandben (Ellerslie) | ✅ |

### 2.2 Magyarország

| Mikor | Mi történt | |
|---|---|---|
| 1821 | Széchenyi István angol mintára kidolgozza az első versenyszabályzatot | ✅ |
| 1827. június 6. | Az első pesti lóverseny az Üllői úti síkon; cél a lótenyésztés javítása versenyszelekcióval | ✅ |
| 1874 | Megszületik Kincsem (tenyésztő és tulajdonos: Blaskovich Ernő; edző: Robert Hesp; zsoké többnyire Elijah Madden) | ✅ |
| 1876–1879 | Kincsem **54 versenyből 54 győzelem** – a leghosszabb veretlen sorozat a telivérversenyzés történetében; első futam: Berlin, 1876. június 21. | ✅ |
| 1878 | Kincsem megnyeri a Goodwood Cupot Angliában; háromszor a badeni nagydíjat; a legenda szerint a macskája nélkül nem utazott | ⚠️ |
| 1880 | Városligeti (Csömöri úti) versenypálya | ✅ |
| 1883. május 17. | Az első hazai ügetőpálya megnyitása a Tattersall területén | ✅ |
| 1887 | Kincsem elpusztul (március 16. vagy 17. – a források eltérnek) | ✅ |
| 1921 | Az első Magyar Derby – Alagon, mert a pesti pálya épül | ✅ |
| 1925 | Megnyílik a mai galopp-pálya (Kincsem Park, Albertirsai út) | ✅ |
| 1933 | Az új Kerepesi úti ügetőpályán futják az ügető derbyt | ✅ |
| 1949 | Államosítás; a bukmékerek megszűnnek, marad a totalizatőr | ✅ (egy forrás) |
| 1960–1990 | Imperiál, a korszak legendás magyar lova – szobra a tribün előtt áll | ✅ |
| 2004–2005 | A Kerepesi úti ügető bezár, az ügetés a Kincsem Parkba költözik | ✅ |
| 2008–2010 | Overdose („Budapest Bullet”): 14 győzelem zsinórban; 2008. október 5-én Longchamp-ban elsőként ér célba a Prix de l'Abbaye-ban (54,4 mp), de a futamot egy be nem nyílt startgép miatt érvénytelenítik; 2010. augusztus 29-én Baden-Badenben kap ki először | ✅ |

Krúdy Gyula külön írást szentelt a témának („A százesztendős pesti lóverseny”) – jó hangulatforrás a játék szövegeihez.

**Ellentmondás a forrásokban:** egy múzeumi blog szerint Magyarországon „1827 óta” lehet totalizatőrben fogadni. Ez nem stimmel, mert a rendszert csak 1867-ben találták fel. Ugyanez a forrás a bukméker-rendszert 1867–1949 közé teszi. A magyar totalizatőr pontos bevezetési évét nem sikerült megtalálni.

---

## 3. Kutatás: a fogadás rendszerei

### 3.1 Két alaprendszer

| | Bukméker (angol eredetű) | Totalizatőr (francia eredetű) |
|---|---|---|
| Ki ellen fogadsz? | A bukméker ellen | A többi fogadó ellen |
| Szorzó | A fogadás pillanatában rögzül | A zárásig változik, a végén derül ki |
| A szervező haszna | A szorzókba épített árrés | Fix levonás a közös kasszából |
| Kockázat | A bukmékeré | Nincs – a szervező mindig a levonást kapja |

### 3.2 A totalizatőr számítása ✅

```
osztalék 1 Ft tétre = (összes tét × (1 − levonás)) ÷ a nyertesre tett összeg
```

- A levonás a **tét** típusú fogadásnál jellemzően kb. 16%, a kombinált fogadásoknál (hármasbefutó) 20% fölött.
- A kifizetést lefelé kerekítik („breakage”); a töredék a szervezőnél marad, így a tényleges levonás a kiírtnál magasabb lehet (egy amerikai példában 17,3% helyett 20,94%).
- A korai szorzók kis kasszánál megbízhatatlanok – az utolsó percben nagyot mozdulhatnak.

### 3.3 Fogadástípusok a Kincsem Parkban ✅

| Típus | Mit kell eltalálni |
|---|---|
| **Tét** | Az első helyezettet |
| **Hely** | A lovad dobogós helyen végez (csak kiemelt versenynapokon játszható) |
| **Befutó** | Az első kettőt |
| **Hármasbefutó** | Az első hármat, sorrendben |

A szelvényen meg kell adni: pálya, futamszám, fogadástípus, az alaptét szorzója, a ló programszáma. Minősítő (kvalifikációs) futamra nem lehet fogadni. Utólagos diszkvalifikáció a már elszámolt fogadást nem módosítja.

Külföldön ezen felül: napi dupla (két egymást követő futam győztese), Pick 3 / Pick 6, superfecta (első négy), a briteknél each-way (tét + hely egyben).

### 3.4 Nagyságrendek ✅

- Hongkong: évi kb. 130 milliárd hongkongi dollár fogadási forgalom.
- Japán: évi több mint 2,5 billió jen.
- A két forrás mást nevez a világ legnagyobb piacának; nagyságrendre azonosak.

---

## 4. Kutatás: fogadási szokások

### 4.1 Hogyan fogadnak az emberek valójában

- **Esélyes–esélytelen torzítás** ✅ – a fogadók túlértékelik a nagy szorzójú esélyteleneket és alulértékelik az esélyeseket. Egy 5,6 millió indulást vizsgáló amerikai kutatás szerint a torzítás kb. 20-szoros szorzó fölött erős; a 30-szoros szorzójú lónak kb. 3%-ban kellene nyernie, a valóságban kb. 1%-ban nyer. Aki tartósan esélytelenre tesz, sokkal többet veszít.
- **Név és szín alapján** ✅ – sokan a ló neve vagy a zsoké dresszének színe alapján választanak.
- **Tippadók** – a nyomtatott programok szakértői tippet közölnek ✅; a pályán önjelölt tippadók is működnek ⚠️.

### 4.2 Babonák ✅

- A 13-as számot kerülik; egyes pályákon nincs is 13-as startbox.
- A szürke ló „szereti a sarat” – a statisztika szerint a szín nem számít.
- A zöld szerencsétlen szín.
- Szerencsekalap; a programfüzetet nem veheti meg helyetted más.
- A startgép közelében heverő pénzérme balszerencse – volt zsoké, aki nem ült fel, amíg el nem vitték.
- Eladott lovat nem neveznek át, mert az balszerencsét hoz.

### 4.3 Pályakultúra

- **Tic-tac** ✅ – a brit bukmékerek fehér kesztyűs kézjelekkel adták tovább egymásnak a szorzókat; 1999-re Dél-Angliában már csak hárman használták.
- **Royal Ascot** ✅ – a királyi család minden versenynapon lovas hintón érkezik; ⚠️ kötelező kalap.
- **Melbourne Cup** ✅ – 2014-ben egyetlen futamra kb. 300 millió ausztrál dollár fogadás; ⚠️ munkahelyi sorsolásos fogadás („sweep”).
- **Pesti „lovi”** – a régi törzsközönség szokásairól a keresés nem adott használható forrást; ehhez Krúdy és a Fehér–Török-féle *A magyar lóversenyzés története (1827–1977)* lenne a jó alap.

---

## 5. Mit veszünk át a kutatásból

| Valódi lóverseny | A játékban |
|---|---|
| Programfüzet (Magyar Turf) | **Tüzér Turf** – futam előtti lap: mezőny, forma (utolsó 5 eredmény), talaj, tipp |
| Telivér, pedigré | Löveg és kezelőszemélyzet: motor, lánctalp, vezető, megbízhatóság |
| Talaj (száraz / mély) | Pálya: száraz, sár, homok – minden lövegnek van kedvence |
| Handikep (pluszsúly a jobb lónak) | Pluszteher: teli lőszerjavadalmazás a jobb lövegen |
| Totalizatőr, levonás | Közös kassza; a levonás **az üteg közös kasszájába** megy |
| Tét / Hely / Befutó / Hármasbefutó | Ugyanezek, ugyanezen a néven |
| Szorzók mozgása zárásig | Élő szorzótábla, az utolsó 10 mp-ben „kései pénz” |
| Esélyes–esélytelen torzítás | A gépi fogadók túlfogadják az esélyteleneket → aki figyeli a formát, jobban jár |
| Tippadó | „Öreg Zászlós” – néha jó, néha rossz tipp, a megbízhatósága kiismerhető |
| Babonák | Nincs 13-as rajtszám; ritka „szerencsekalap” tárgy; a szürke álcás löveg sárban *nem* gyorsabb (poén a súgóban) |
| Kincsem, Overdose, Imperiál | Legendás ellenfelek ritka díjfutamokon („Kincsem 155”, „Budapesti Rakéta”) |
| Érvénytelen futam (Overdose, 2008) | Ritka esemény: beragadt rajt → futam érvénytelen, minden tét visszajár |
| Derby, díjfutamok | Heti nagydíj: Tüzér Derby, Szent Borbála-díj (december 4.) |

---

## 6. Koncepciók

### A) Tiszta fogadás – „Totalizatőr”
Fogadsz, nézed a futamot, kifizetés. **Mellette:** gyorsan elkészül, jól illik a Kassza hangulatához. **Ellene:** tiszta szerencsejáték, nincs ügyességi elem, hamar unalmas.

### B) Tiszta verseny – „Hajtó”
Te vezeted a löveget 7 gépi ellenfél ellen, nincs fogadás. **Mellette:** ügyességi játék, tiszta ranglista. **Ellene:** a lóverseny lényege – a fogadás, a programfüzet, a szorzók – kimarad; közel van a Gidrán Terephez.

### C) Fogadó + hajtó – **ajánlott**
Minden futamon egy löveg a tiéd, a többire (és a sajátodra) fogadhatsz. A futam alatt a saját lövegedet hajtod; a többiek eredménye a statjaikból és a szerencséből áll össze. **Mellette:** a tudás (forma, talaj) és az ügyesség is számít, a fogadás csak fűszer. **Ellene:** a legtöbb munka; a saját lövegre tett tétet korlátozni kell, különben mindenki csak arra fogad.

---

## 7. Az ajánlott változat részletei

### 7.1 Egy futam menete (kb. 90 mp)

1. **Szemle (20 mp)** – Tüzér Turf: 8 löveg, statok, forma, talaj, Öreg Zászlós tippje. A lövegek elvonulnak a nézők előtt.
2. **Fogadás (20 mp)** – szelvény kitöltése, élő szorzótábla. Zárás előtt 10 mp-cel csengő.
3. **Rajt** – sorompó fel, motorok felbőgnek.
4. **Futam (35–45 mp)** – oldalnézetes pálya, a lövegek sávokban. Hajtás: lásd 7.3.
5. **Célfotó** – szoros befutónál lassítás és fotó.
6. **Kifizetés** – osztalék, a levonás az üteg kasszájába.

### 7.2 A mezőny

8 löveg futamonként, rajtszám 1–8 (13-as soha). Egy löveg adatai:

| Stat | Hatás | Lóverseny-megfelelő |
|---|---|---|
| Motor | Végsebesség | Gyorsaság |
| Váltó | Gyorsulás a rajtnál és kanyar után | Rajtkészség |
| Lánctalp | Melyik talajon erős | Talajkedvelés |
| Állóképesség | Mennyire lassul a végén | Állóképesség |
| Megbízhatóság | Műszaki hiba esélye (túlmelegedés, lánctalp-szakadás) | Egészség |
| Forma | Az utolsó 5 futam helyezése | Forma |

A lövegek állandó „istállót” alkotnak (kb. 24 névvel), hogy a formájuk több futamon át követhető legyen – ettől lesz értelme a programfüzetnek.

### 7.3 Hajtás

- **Gáz** nyomva tartva: gyorsul, de melegszik a motor. Túlmelegedésnél kényszerlassítás.
- **Taktika**, mint a valódi lovaknál: elöl menni (biztos, de fárasztó) vagy hátulról hajrázni (kockázatos, de a végén erős).
- **Sár / homok** szakaszokon a lánctalp-stat dönt; rossz talajon a teljes gáz megcsúszást okoz.
- A hajtás a saját löveg idejét kb. ±15%-kal befolyásolja – elég, hogy számítson, de egy gyenge löveggel ne lehessen mindig nyerni.

### 7.4 Fogadás

- **Pénz:** kizárólag a Kassza zsebpénze (ZSEB). Valódi pénz semmilyen formában nincs és ne is legyen.
- **Típusok az első változatban:** Tét, Hely, Befutó, Hármasbefutó.
- **Tétkorlát:** futamonként legfeljebb a zseb 10%-a; a saját lövegre legfeljebb 2%.
- **Osztalék:** a 3.2 képlet szerint. Levonás: Tét/Hely 15%, Befutó 20%, Hármasbefutó 25% – a levonás az üteg közös kasszáját növeli.
- **Gépi fogadók:** a kasszát gépi tétek töltik fel, szándékosan az esélytelenek felé torzítva (4.1). Így az esélyesre tett tét hosszú távon enyhén jobb, mint a vaktában választott esélytelen.

### 7.5 Események

- Beragadt rajt → érvénytelen futam, tétek vissza (ritka).
- Műszaki hiba az élen haladónál.
- Célfotó.
- „Kései pénz”: egy löveg szorzója a zárás előtt hirtelen leesik – valaki tud valamit?
- Díjfutamok legendás ellenféllel.

### 7.6 Illesztés a meglévő kódhoz

- Új fájl: `lv.js`, a `sr.js` és a `sere.js` mintájára; a közös segédeket az `app.js` export-listájából importálja.
- `sw.js`: a `SHELL` lista bővítése, `CACHE` és `APP_VER` emelése.
- Grafika: a meglévő PzH-modellképek (`PZH_SPRITE`, `PZH_FULL`) újrahasználhatók; hang: a Shot&Run motorhangjai.
- `firestore.rules`: az új mezőket (pl. `lvBest`, `lvN`) fel kell venni a `userUpdOk` engedélylistájába és a rekord-/számláló-ellenőrzésbe. Figyelni kell a kérésenkénti 1000 kifejezéses korlátra (ez okozta a 4.35.2-es hibát).
- A nyeremény a Kassza zsebébe megy. A havi ranglistára csak befizetéssel kerülhet, amit a szerver már most is időarányosan korlátoz – ez a futamból származó pénzre is érvényes lenne.

### 7.7 Ütemezés

| Lépés | Tartalom |
|---|---|
| **1. – gép ellen** | Egy pálya, 8 löveg, Tét és Hely, hajtás, Tüzér Turf, helyi rekord |
| **2. – teljes fogadás** | Befutó, Hármasbefutó, gépi fogadók, élő szorzótábla, események |
| **3. – üteg és online** | Levonás az üteg kasszájába, díjfutamok, közös futamok |

---

## 8. Nyitott kérdések és kockázatok

1. **Közös online futam és a csalás.** Ha minden telefon ugyanabból a kiinduló számból számolja ki a futamot (ahogy a Shot&Run szobák teszik), a végeredmény a fogadás lezárása előtt kiszámolható a telefonon. Valódi közös totalizatőrhöz szerveroldali sorsolás kell (pl. egy Vercel-függvény), ami most nincs a projektben. Javaslat: az 1–2. lépés gép ellen, helyben; a közös futam külön döntés.
2. **Hatás a Kassza-ranglistára.** Egy nagy szorzós hármasbefutó felboríthatja a havi versenyt. A tétkorlát és a meglévő szerveroldali befizetési korlát tompítja, de érdemes eldönteni: számítson-e egyáltalán.
3. **Gyerekek.** A Kasszában gyerekzáras koppintó mód van, tehát a játék gyerek kezébe is kerül. Fogadást utánzó játék gyereknek kényes. Lehetőségek: (a) marad „fogadás”, csak játékpénzzel; (b) átnevezés „tipp”-re, tét nélkül, pontokért; (c) a fogadó rész rendfokozathoz kötve. Ez a te döntésed.
4. **Egyensúly.** A hajtás ±15%-os hatását és a levonásokat szimulációval kell belőni, hogy a hosszú távú megtérülés 85–95% között maradjon.
5. **Méret.** Az `app.js` már 636 KB; az új játéknak külön fájlban kell maradnia.

---

## 9. Források

A weboldalak közvetlen megnyitása ebben a munkamenetben le volt tiltva (a Wikipédia és a welovebudapest.com nem érhető el), ezért az adatok keresési találatok kivonataiból származnak. A ⚠️ jelű tételeket felhasználás előtt ellenőrizni kell.

**Magyar lóversenyzés**
- [Lóverseny (Magyarország) – Wikipédia](https://hu.wikipedia.org/wiki/L%C3%B3verseny_(Magyarorsz%C3%A1g))
- [Helyre, tétre, befutóra – a Mezőgazdasági Múzeum blogja](https://mmgm.blog.hu/2020/06/05/helyre_tetre_befutora_729)
- [A lóverseny története Budapesten – We Love Budapest](https://welovebudapest.com/cikk/2023/08/10/szabadido-budapest-loverseny-tortenete-lovi-kincsem/)
- [Kincsem Park: Széchenyitől Madonnáig – Világgazdaság](https://www.vg.hu/kozelet/2019/07/kincsem-park-szechenyitol-madonnaig)
- [184 éves a magyar lóversenysport – lovasok.hu](https://www.lovasok.hu/lovassportok/galopp-lovassportok/galopp-tortenelem/184-eves-a-magyar-loversenysport-a-derby/)
- [Magyar Derby (ügető) – Wikipédia](https://hu.wikipedia.org/wiki/Magyar_Derby_(%C3%BCget%C5%91))
- [Tattersall, Nemzeti Lovarda – egykor.hu](https://egykor.hu/budapest-viii--kerulet/tattersal-nemzeti-lovarda/3228)
- [Krúdy Gyula: A százesztendős pesti lóverseny – Arcanum](https://www.arcanum.com/en/online-kiadvanyok/Krudy-krudy-gyula-munkai-1/almoskonyv-tenyerjoslasok-konyve-3/futtatas-1337/a-szazesztendos-pesti-loverseny-139A/)
- [Kincsem – Wikipedia](https://en.wikipedia.org/wiki/Kincsem)
- [Overdose (horse) – Wikipedia](https://en.wikipedia.org/wiki/Overdose_(horse))
- [Egy ország esett át Overdose túloldalára – 444.hu](https://444.hu/2013/08/23/egy-orszag-esett-at-overdose-tuloldalara)
- [Kincsem Park versenyprogram, 2024. június 1. (fogadástípusok)](https://kincsempark.hu/data/versenyprogram/2024/versenyprogram_2024_06_01_galopp.pdf)

**Világtörténet**
- [Horse racing history – horseracingsense.com](https://horseracingsense.com/horse-racing-history/)
- [Epsom Derby – Wikipedia](https://www.wikipedia.org/wiki/Epsom_Derby)
- [Byerley Turk – Wikipedia](https://en.wikipedia.org/wiki/Byerley_Turk)
- [Foundation Sires – Thoroughbred Heritage](https://tbheritage.com/HistoricSires/FoundationSires.html)

**Fogadás**
- [Joseph Oller – Wikipedia](https://en.wikipedia.org/wiki/Joseph_Oller)
- [The First Automatic Totalisator – Rutherford Journal](https://rutherfordjournal.org/article020109.html)
- [Tote Boards – Hackaday](https://hackaday.com/2015/11/04/tote-boards-the-impressive-engineering-of-horse-gambling)
- [Pari-Mutuel Betting Guide – covers.com](https://covers.com/horse-racing/pari-mutuel-betting-guide)
- [Penny Breakage – Thoroughbred Idea Foundation](https://racingthinktank.com/reports/tif-reports-penny-breakage)
- [Betting on horse racing – Wikipedia](https://en.wikipedia.org/wiki/Betting_on_horse_racing)

**Fogadási szokások**
- [Favourite-longshot bias – Wikipedia](https://en.wikipedia.org/wiki/Favourite-longshot_bias)
- [Green, Lee, Rothschild: The Favorite-Longshot Midas](https://jacobslevycenter.wharton.upenn.edu/wp-content/uploads/2018/08/The-Favorite-Longshot-Midas.pdf)
- [Tic-tac (horse racing) – Wikipedia](https://www.wikipedia.org/wiki/Tic-tac_(horse_racing))
- [Men in White Gloves: The Rise and Demise of the Tic-Tac Man – gambling.com](https://www.gambling.com/uk/news/men-in-white-gloves-the-rise-and-demise-of-the-tic-tac-man-2469900)
- [Twenty-Five Quirky Betting Superstitions – America's Best Racing](https://www.americasbestracing.net/node/17396)
- [Seven Horse Racing Superstitions – BetMGM](https://sports.betmgm.com/en/blog/seven-horse-racing-superstitions-from-across-the-globe/)
- [What happens if you only bet on grey horses – deeside.com](https://www.deeside.com/what-happens-if-you-only-bet-on-grey-horses/)
