# Tervezet és megvalósítás: H.A.R.C. Gránátvihar és Gidrán Terep – Fal és szakadék (v4.48.0)

## 1. M.E.D.V.E. H.A.R.C. – GRÁNÁTVIHAR

### Az ötlet: hibrid, nem sima lövöldözős
A régi elkapós játék és a klasszikus, felfelé lövöldözős játéktermi műfaj összeolvasztása:
- **Támadás:** fentről hullámokban érkeznek az ellenségek, a medve 155 mm-es gránátokat dob rájuk.
- **Lőszer = elkapás:** a gránát véges. Az ellenséges tüzérség lehulló gránátjait, a lőszerládákat, az elsősegélyt és a fegyverládákat **el kell kapni**. A régi játék lényege így megmaradt, csak most ez tölti a tárat.
- **A döntés a lényeg:** dobás közben (ujj lent) a medve nem tud elkapni, a ráeső gránát felrobban rajta. Elkapáshoz el kell engedni az ujjat, ilyenkor viszont nem dob.

### Irányítás
| | Érintőképernyő | Billentyűzet |
|---|---|---|
| Mozgás + dobás | ujj lent, húzás (a medve az ujj alatt áll, folyamatosan dob) | ←/→ + Szóköz (vagy ↑) nyomva |
| Elkapás | ujj fel (a medve megáll, félig felemelt karral vár) | Szóköz elengedve |
| Tűzcsapás | a jobb alsó 🚨 gomb, ha a csík tele | Enter / F |

### A dobás animációja
- A dobókar és a kézben lévő gránát **a medve saját sprite-jából van kivágva**, két rétegben (kar, gránát). A kar a vállnál fordul.
- **Mozdulat** (az idő a dobás hosszához arányítva, legfeljebb 0,3 s):
  - 0–22%: rövid behúzás;
  - 22–52%: gyors átlendítés a fej fölé;
  - **50%-nál elengedés** – a gránát a kézből, a kar aktuális helyzetéből indul;
  - 52–100%: visszaengedés. A gránát 80%-tól beúszik a kézbe (a következő a hevederről).
- A repülő gránát forog (8–12 rad/s), a dobás pillanatában a medve vízszintes sebességének negyedét is viszi.
- Elkapó tartásban a kar félig fel van emelve, és enyhén ring.
- A medve feje fölött felirat jelzi az állapotot: **DOB** vagy **✋ ELKAP**.

### Ballisztika
- A gravitáció 2,1·H px/s² (H = a vászon magassága), így a játék minden képernyőméreten ugyanúgy viselkedik.
- A kezdősebesség akkora, hogy a gránát csúcspontja a képernyő tetejének 4%-ánál legyen; a csúcsig ~0,85 s.
- Ellenséget érve a levegőben robban (sugár és sebzés fegyverenként, lent).
- Ha semmit nem talál, visszaesik és a földön robban: ez a földre ért ejtőernyősöket sebzi, de **nullázza a kombót** („mellé”).

### Fegyverek
| Fegyver | Újratöltés | Robbanássugár | Sebzés | Különlegesség |
|---|---|---|---|---|
| Gránát (alap) | 0,34 s | 46 px | 1 | – |
| 🔱 Repeszköteg | 0,42 s | 40 px | 1 | 3 gránát legyezőben (−150 / 0 / +150 px/s) |
| 💣 Kazettás | 0,50 s | 30 px | 1 | a csúcson 6 bombácskára nyílik (28 px, 1 sebzés) |
| 🎯 Hőkereső | 0,38 s | 44 px | 1 | emelkedés közben a legközelebbi, feljebb lévő ellenség felé kanyarodik |
| 🔥 Termobárikus | 0,70 s | 96 px | 3 | nagy terület, főellenség ellen |

- A különleges fegyvereket a lelőtt ellenségek hagyják hátra **fegyverládában** (helikopter: mindig, Shahed: 20%, kvadkopter: 12%). Elkapva **15 s**-ig tartanak, és +5 gránátot adnak.
- **Hullámonként nyíló választék:**
  - az 5. hullámig: repeszköteg és hőkereső;
  - a 10.-ig: plusz a kazettás;
  - utána: mind a négy.

### Lőszer
| | Gránát |
|---|---|
| Kezdés | 20 (tár: 30) |
| Elkapott ellenséges 155 mm-es gránát | +5 (és 25 pont × szorzó) |
| Lőszerláda | +12 |
| Utánpótlás | +1 / 3 s, ha nincs tele |

- Az ellenséges tüzérség 3,5–6 s-onként lő; magasabb hullámokon gyorsabban, de legfeljebb 1,6-szor.
- A lőszerláda 26–36 s-onként érkezik, ha 5 alá fogy a tár, már 9 s után.
- Az elsősegély (+25 élet) a főellenség után, illetve 45% élet alatt minden második ládában jön.

### Ellenségek
A sebességek a képernyő arányában vannak megadva (H = magasság, W = szélesség), és mind szorzódnak az **SP** tényezővel (lásd lent).

| Ellenség | Élet | Pont | Viselkedés | Sebzés a medvének | Hullámtól |
|---|---|---|---|---|---|
| FPV-drón | 1 | 10 | 0,10·H/s-mal hullámzik lefelé, a képernyő felénél rárepül a medvére (0,45·H/s) | 15 | 1. |
| Kvadkopter | 2 | 25 | egy sorig ereszkedik, oldalazik (0,12·W/s), 2,2–3,5 s-onként bombát ejt (0,33·H/s) | bomba: 10 | 2. |
| Ejtőernyős | 1 | 20 | 0,07·H/s-mal lebeg; ha földet ér, gyalogosként a medvére ront | közelharc: 20 | 3. |
| Shahed jellegű öngyilkos drón | 3 | 40 | a képernyő széléről átlósan a medvére (0,30·H/s) | 25 | 6. |
| Helikopter | 8 | 80 | átrepül (0,17·W/s), 1,4 s-onként rakétát lő (0,38·H/s) | rakéta: 20 | 8. (egyszerre egy) |

- **SP (sebességszorzó) = (1 + 0,035·(hullám − 1)) · 1,15^kör.** Az élet 1,3^kör-rel nő.
- **Hullám:** 6 + 1,25·hullám ellenség (legfeljebb 34, körönként +4). Csoportokban (1–4) jönnek, oszlopban, sorban vagy szórtan. A csoportok között 1,3·0,95^hullám s telik el (legalább 0,35 s).

### Pályák és főellenségek
**5 szektor × 5 hullám = 25 hullám:** Határsáv, Erdő, Város, Hegyvidék, Éjszaka. Minden szektornak saját színezése van, éjjel sötét.

Minden 5. hullám főellenség, utána új szektor jön:

| Hullám | Főellenség | Élet | Pont | Támadás |
|---|---|---|---|---|
| 5. | Drónanyahajó | 60 | 1 000 | 3 s-onként 2 FPV-drónt indít, bombáz |
| 10. | Harci helikopter | 110 | 2 000 | rakétasortűz: 3 piros jelölt sáv, 0,85 s múlva lecsap (az egyik a medvén) |
| 15. | Léghajó | 180 | 3 000 | 5 s-onként 3 ejtőernyőst dob, sűrűn bombáz |
| 20. | Rajkirály | 220 | 4 000 | 6 keringő pajzsdrón (8 s alatt újranőnek), FPV-k, rakétasortűz |
| 25. | Stratégiai bombázó | 320 | 6 000 | szőnyegbombázás oda-vissza, mindig hagy egy rést |

A 25. hullám után **új kör** indul: minden 15%-kal gyorsabb, az ellenségek 30%-kal szívósabbak, a főellenség pontja körönként nő.

### Pontozás
| Esemény | Pont |
|---|---|
| Lelőtt ellenség | alappont × kombószorzó |
| Elkapott ellenséges gránát | 25 × szorzó |
| Lőszerláda / elsősegély | 10 |
| Fegyverláda | 30 |
| Teljesített hullám | 50 × hullám |
| Sérülés nélkül teljesített hullám | további 100 × hullám |
| Főellenség | táblázat szerint × kör |

- **Kombószorzó** = 1 + ⌊kombó / 8⌋, legfeljebb ×4. A kombó minden találattal nő, és nullázódik, ha egy gránát semmit sem talál, vagy a medve sebet kap.
- **🚨 Tűzcsapás:** a csík 30 lelőtt ellenséggel telik meg. 8 PzH 2000 lövedék söpör végig a képernyőn: mindent 3-mal sebez, a főellenségtől 8 × 3%-ot vesz le.
- Egy jó első kör (25 hullám) nagyjából 30–60 ezer pont.
- A ranglistára legfeljebb **100 000** kerül, mert a `firestore.rules` ennyit enged a `harcBest` mezőben. Ha a végtelen körökben ennél több is számítson, a szabályban emelni kell a határt (és újra kell telepíteni).
- **A régi rekordok** a `harcBest` mezőben elkapott darabszámok voltak, ezek most pontként látszanak. Az új pontszámok gyorsan felülírják őket; tiszta lappal az admin „új szezon” gombja indít.

### Élet
- A medvének 100 élete van.
- **Sebzések:** FPV-drón 15, Shahed 25, bomba 10, rakéta 20, közelharc 20, a medvére eső gránát dobás közben 15, mellette (70 px-en belül) becsapódó gránát 10.
- **Folytatás zsetonért** (menetenként egyszer): a medve 60%-kal áll fel, legalább 12 gránáttal, a közeli ellenség eltűnik.

## 2. GIDRÁN TEREP – FAL ÉS SZAKADÉK

### Hátsó lámpa (javítva)
- **Hiba:** a féklámpa és a tolatólámpa x = −72-n ült, a pótkerék-tartó túlnyúlása alatt, a levegőben. Tengelyhez igazított téglalapként rajzolódott, ezért emelkedőn és lejtőn a kocsi mögött lebegett.
- **Javítás:** most a karosszéria hátfalán vannak (x = −61,4; féklámpa y = −13, tolató y = −7,4), keretezve, a kocsival együtt elforgatva. A fényudvar maradt.

### Új pálya: Fal és szakadék (1,1 km)
- **A pálya:** aszfalt, murva, kőfolyás (töltőállomással), majd **a fal**: 60%-os, aztán **100%-os (45°)** betonfal lekerekített peremmel, 19 m szintkülönbség. A tetőn rövid aszfalt jön, utána **a szakadék**: 85%-os (≈ 40°) lejtő vissza a kiinduló szintre, végül murva és aszfalt.
- **Fizika (a meglévő modellel számolva):**
  - 45°-on a lejtőirányú gravitáció 354 egység. A motor 4H-ban 270-et ad, ezzel nem megy fel, 4L-ben 594-et.
  - A fal betonja lépcsős, ezért nyitott difivel az egyik kerék tehermentesül: a tapadás 30–35%-kal kisebb, a kocsi visszacsúszik. **Csak zárt difivel megy fel.**
  - Esőben a fal tapadása 8%-kal csökken (mint az aszfalté). Ekkor közúti nyomással (4,0 bar) kipörög, **1,2 barra engedve** felmegy.
  - **Lefelé:** a 4L motorfék most legfeljebb 420 (eddig 240), így a szakadékon kb. 14 km/h-val, lépésben tart. 4H-ban se a fék, se a motor nem tartja meg.
  - **Megfutás:** 28 km/h felett a szakadék meredek részén 0,7 s után a kocsi orra beás, és átbukik (a pálya véget ér). 20 km/h felett figyelmeztetés jön. A levegőben is számít, tehát a peremről nagy sebességgel elrugaszkodni sem kiút.
- **Szimulációval ellenőrizve:**

  | Felfelé | Eredmény |
  |---|---|
  | 4L + difizár | felmegy |
  | 4L nyitott difi | elakad („kapcsold be a DIFIZÁRAT!”) |
  | 4H (zárral vagy anélkül) | elakad |
  | eső, 4,0 bar | elakad („engedd le a nyomást”) |
  | eső, 1,2 bar + zár | felmegy |

  | Lefelé | Eredmény |
  |---|---|
  | 4L motorfék | célba ér (max. 14 km/h) |
  | 4H gáz nélkül vagy fékkel | megfut, átbukik |
  | 100 km/h-val a peremre | átbukik |
- **Grafika:**
  - lépcsős betonblokk-textúra a falon és a szakadékon;
  - sárga háromszögtáblák a valódi meredekséggel (60%, 100%, 85%);
  - filmes mód (fekete sávok, kísérő helikopter, cím).
  - **Nagy meredekségmérő:** a kép tetején, a fal és a szakadék alatt. Százalékban és fokban mutat, színes zónákkal. Alatta a szükséges beállítások pipával vagy X-szel: 4L, DIFIZÁR, illetve 4L MOTORFÉK.
- **Mellékhatás a többi pályán:** az erősebb 4L motorfék a régi extrém lejtőn is jobban tart.

### Javaslat a teljes játékmód újragondolásához (nincs megvalósítva, döntésre vár)
1. **Expedíció (kampány):** 5 egymásra épülő bevetés közös üzemanyaggal és futómű-kopással. A pályák között javítani és tankolni lehet, ami időbe vagy zsetonba kerül. A végén összesített idő és állapot számít.
2. **Hegymenet-kihívás:** csak a fal, egyre meredekebb változatokban (60%, 80%, 100%, 120% és lépcsős). Napi pálya a szerveridő szerinti maggal, külön napi ranglistával.
3. **Mentőakció:** a szakadék alján elakadt jármű. Csörlővel és horgonyfával kell felhúzni a falra, a pontszám az idő és a csörlőkábel terhelése szerint jár.
4. **Szellemverseny a ranglista első helyezettjével** (a meglévő szellem-rendszerre építve).
