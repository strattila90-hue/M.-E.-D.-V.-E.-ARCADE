# M.E.D.V.E. Arcade

**Aktuális verzió: 4.49.1** (az app `APP_VER` és a `sw.js` `CACHE` értéke ugyanez; verziónál mindkettőt együtt emeld.)

Telepíthető (PWA) játékgyűjtemény katonai témájú mini-játékokkal:
M.E.D.V.E. H.A.R.C., DroneRun, Gidrán Terep, Gidrán Konvoj, Rába Rakodó, SERE Kitörés, Tüzér Kassza, Shot&Run, Tüzér Derby.

**v4.49.1:** **A vereség-képernyőn látszik a zseton-egyenleg** (H.A.R.C., DroneRun, Shot&Run).
- Mindig kiírja: „🪙 Egyenleged: N zseton”.
- Ha jár folytatás, de kevés hozzá a zseton: kiírja, mennyi hiányzik, a gomb halványabb, a „zsetont szerzek” link pedig megnyitja az Összes pénzem tárcát.

**v4.49.0:** **Gidrán Terep: Expedíció (5 szakasz) és szellemverseny a ranglista elsőjével.** Részletek: `docs/tervezet-harc-terep.md`.
- **🧭 Expedíció:** a pályaválasztó tetején indítható. Öt szakasz: Bajnoki pálya → Mocsaras erdő → Bakonyi sziklák → Fal és szakadék → Hazatérés (új, csak itt).
  - Az üzemanyag és a kopás (abroncs, futómű, motor) szakaszról szakaszra megmarad.
  - **Szervizpark** a szakaszok között: tankolás, abroncs-, futómű- és motorjavítás időbüntetésért vagy zsetonért.
  - Egyszer **vontatás** (+180 s), ha egy szakasz elbukik.
  - Eredmény: összidő, a legjobb a telefonon tárolódik. A félbehagyott expedíció folytatható.
- **🏆 Szellemverseny az elsővel:** a ranglistás pályán a ranglista első helyezettjének legjobb menete arany szellemként fut.
  - Köztes időnként látszik az elsőhöz mért különbség, a célban az is, hogy megverted-e.
  - A saját legjobb menet útvonala új szerver-rekordnál feltöltődik (`gtGhost/{uid}`). Rajtonként legfeljebb 1 olvasás.
- **⚠ A `firestore.rules` változott** (új `gtGhost` gyűjtemény), ezért újra kell telepíteni. Amíg ez nem történik meg, csak a szellemverseny nem működik, minden más igen. A szabályteszt (`tests/firestore-rules.test.mjs`) új esetekkel bővült; emulátor híján még nem futott.

**v4.48.0:** **H.A.R.C. Gránátvihar (dobálós, hullámos, főellenségekkel) és Gidrán Terep – Fal és szakadék.** Részletes terv és számok: `docs/tervezet-harc-terep.md`.
- **M.E.D.V.E. H.A.R.C. – Gránátvihar:** fentről hullámokban jönnek az ellenségek, a medve 155 mm-es gránátokkal dobálja őket.
  - **A lőszer elkapásból jön:** az ellenséges tüzérség lehulló gránátját, a lőszerládát, az elsősegélyt és a fegyverládát el kell kapni, így a régi játék lényege is megmaradt.
  - **Irányítás:** ujj lent (húzás) = követ és dob; ujj fel = megáll és elkap. Billentyűzeten ←/→ és Szóköz.
  - **Pályák:** 5 szektor × 5 hullám (Határsáv, Erdő, Város, Hegyvidék, Éjszaka), minden 5. hullám főellenség: Drónanyahajó, Harci helikopter, Léghajó, Rajkirály, Bombázó. Utána új kör, gyorsabban.
  - **Ellenségek:** FPV-drón, kvadkopter (bombáz), ejtőernyős (földet érve közelharc), Shahed jellegű drón, helikopter (rakéta).
  - **Fegyverek:** alap gránát, repeszköteg ×3, kazettás, hőkereső, termobárikus (fegyverládából, 15 s). Mellé 🚨 tűzcsapás 30 találat után.
  - **Pontok:** kombószorzó (×4-ig), hullám- és sérülésmentes bónusz, főellenség-pont. A ranglistára pont kerül, legfeljebb 100 000 (`firestore.rules`). A régi „db” rekordok pontként látszanak; tiszta laphoz az admin új szezont indíthat.
  - **Dobóanimáció:** a dobókar és a kézben lévő gránát a medve saját képéből van kivágva, a vállnál forog (behúzás, átlendítés a fej fölé, elengedés a csúcson). A gránát forogva repül, a következő beúszik a kézbe.
  - Játék közben az üzenetek a vásznon jelennek meg, a toast nem takarja az ujjat.
- **Gidrán Terep:**
  - **Hátsó lámpa javítva:** a fék- és a tolatólámpa eddig a pótkerék-tartó alatt, a levegőben lebegett, és nem fordult a kocsival. Most a hátfalon van, a karosszériával együtt dől.
  - **Új pálya – Fal és szakadék (1,1 km):** 60%, majd **100%-os (45°)** betonfal, utána **85%-os** szakadék.
    - Felfelé csak **4L + difizár** megy. 4H-ban vagy nyitott difivel visszacsúszik, esőben 1,2 barra kell engedni.
    - Lefelé a **4L motorfék** lépésben tart. 4H-ban megfut, és 28 km/h felett átbukik; a peremről elrugaszkodni sem kiút.
    - Szimulációval ellenőrizve minden változat.
  - **Grafika:** betonblokk-textúra, valódi meredekségű sárga táblák (60% / 100% / 85%), filmes mód és **nagy meredekségmérő** (% és fok) a szükséges beállítások pipáival.
  - Az erősebb 4L motorfék (420, eddig 240) a régi extrém lejtőn is segít.

**v4.47.0:** **Több játékost bír el ingyen: appnyitáskor csak a ranglisták élmezőnye töltődik le.**
- **Előtte:** minden nyitott app a teljes játékoslistát figyelte. Nyitáskor ez n olvasás volt, utána pedig **minden** játékos minden mentése minden telefonnak egy olvasásba került, vagyis a forgalom a létszám négyzetével nőtt.
- **Most:**
  - **Kezdőlap:** játékonként csak az **első 5** helyezettet figyeli (7 × 5 dokumentum, a létszámtól függetlenül). Csak ezeknek a játékosoknak a mentései jutnak el a többi telefonra.
  - **Ranglista:** a nyitott fülön az **első 10**. Ha nem vagy köztük, külön sorban látod a saját eredményed („még nem fértél be az első 10-be”), helyezés nélkül.
  - **Teljes lista** csak ott töltődik le, ahol kell: a **👥 Összes** fülön (kérésre), a Kassza **ütegverseny** lapján (minden üteg összege), az adminnak (terhelésjelző), és egyszer a szezon-nullázáskor.
  - **Chat:** zárt chatnél csak az utolsó 10 üzenet figyelt (az „új” jelzéshez), megnyitáskor 80.
- Egy appnyitás így kb. **46 olvasás** (eddig a regisztráltak száma + 81).
- **Ingyenes keret** a terhelésjelző modellje szerint:

  | Regisztrált | Napi játékos (előtte → most) | Egyszerre (csúcs) |
  |---|---|---|
  | ≤ 200 | ~68–90 → **~200** | ~34 |
  | 300 | ~55 → **~188** | ~31 |
  | 500 | ~39 → **~164** | ~27 |
  | 1000 | ~22 → **~124** | ~21 |

  Ebben már a chat továbbítása és a teljes lista ritka letöltése is benne van. A maradék gyorsan növekvő tag a Kassza ütegverseny-lapja (teljes lista), mert az összes üteg összegéhez mindenki kell.
- A terhelésjelző (`FSM` az `app.js`-ben) az új olvasási mintával számol. A `firestore.rules` és az indexek nem változtak: az egymezős rendezéshez a Firestore automatikus indexe elég.

**v4.46.1:** **A szerverterhelés-jelző piros plafonja a Firestore ingyenes (Spark) napi kerete.**
- Keret: **50 000 olvasás és 20 000 írás naponta**. A beállított mentési ütemből számolva az **olvasás fogy el előbb**; az írás bőven elég (~35 írás/fő/nap).
- Modell (`FSM` az `app.js`-ben): ~2 appnyitás/fő/nap, nyitásonként a teljes játékoslista (n regisztrált) + 80 chatüzenet + saját fiók; ~30 perc játék/nap (zseton 2 percenként, játékszámláló, Kassza 2 percenként); minden mentést minden épp nyitott lista megkap; a szabályok íráskénti 1 olvasása is beszámít.
  Olvasás/nap ≈ D·2·(n+81) + 35·D + 1,94·D² (D = napi játékos, n = regisztrált).
- **Ennyi embert bír el ingyen:**

  | Regisztrált | Napi játékos | Egyszerre (csúcs) |
  |---|---|---|
  | ≤ 100 | ~90 | ~15 |
  | 150 | ~77 | ~13 |
  | 200 | ~68 | ~11 |
  | 300 | ~55 | ~9 |
  | 500 | ~39 | ~7 |

  A regisztrált létszám is számít, mert minden appnyitás a teljes listát letölti.
- A jelző 100%-a (🔴) = a keret: a mai (24 órás) létszámból becsült napi olvasás/írás, az egyszerre aktívak és az olvasás/perc közül a legrosszabb. Az élő mutatóknál a plafon a napi keret egyenletes elosztásának 3-szorosa (csúcsidő). Szintek: 🟢 < 50%, 🟡 50–75%, 🟠 75–100%, 🔴 ≥ 100%. A kártya kiírja a mostani plafont (fő/nap, egyszerre) és a mai becsült olvasás/írás számot.

**v4.46.0:** **Adminnak szerverterhelés-jelző a létszám és a tevékenység alapján.**
- A fiók panel **🛡 Admin** dobozában új **📊 Szerverterhelés** kártya: állapot (🟢 Nyugodt · 🟡 Közepes · 🟠 Magas · 🔴 Túlterhelt), százalék és színes sáv.
- **Létszám:** aktív most (5 perc), 1 órán belül, ma (24 óra), összes regisztrált. Az utolsó tevékenység a `lastPlay`, `tkAt`, `zsSt`, `tkSt` bélyegek legkésőbbike, a szerveridőhöz igazítva.
- **Tevékenység:** a többi játékos mentései percenként (a lista-figyelőn élőben mérve, utolsó 5 perc), a becsült olvasás/perc (≈ mentés/perc × aktív kliensek, mert minden mentést minden nyitott lista megkap), és a chat 10 perces forgalma.
- A százalék a négy mutató közül a legterheltebb a `LOADCAP` küszöbökhöz képest (alapból 40 aktív, 60 mentés/perc, 2000 olvasás/perc, 40 chat/10 perc). A küszöbök az `app.js`-ben hangolhatók. A kártya 15 mp-enként frissül.
- Nincs plusz Firestore-lekérdezés, a meglévő figyelt adatokból számol. A `firestore.rules` nem változott.

**v4.45.0:** **Legyen értelme a zsetonnak: bolt, folytatás, tagsági fokozat, napi plafon.** (A `docs/tervezet-zseton.md` mind a 4 javaslata.)
- **🪙 Zseton-bolt** a Tüzér Kassza **Ajándék** fülén:
  - **💸 Pénz-gépágyú most:** 15 zseton, naponta legfeljebb 3. A megvett gépágyú nem tolja el a következő ingyenes érkezését, és egyszerre most is csak egy lehet.
  - **🎫 Golden Ticket:** 15 mp dupla bevétel, 8 zseton, naponta legfeljebb 5.
  - Vásárláskor a fül bezáródik, hogy azonnal koppinthass, illetve lőhess.
- **🪙 Folytatás vereség után** a **H.A.R.C.**-ban, a **DroneRun**-ban és a **Shot&Run**-ban (ott csak gép ellen, és csak ha kilőtték a lövegedet). **Menetenként egyszer, 3 zseton** (Gyémánt fokozaton 2). A gomb a vereség ablakában jelenik meg.
  - **H.A.R.C.:** a medve 60%-kal áll talpra, a lehulló gránátok eltűnnek.
  - **DroneRun:** a PzH talpra áll ugyanott (legalább 60%). A közeli drónok, gránátok és aknák eltűnnek, a főellenség marad.
  - **Shot&Run:** a javítóbrigád helyrehozza a löveget (45%, minden sérülés javítva, a tűz eloltva), és te jössz.
  - A menet pontja, megtett távja és lelőtt drónjai megmaradnak, a ranglistára is a végső eredmény kerül. Az online és a kétszemélyes Shot&Run-ban nincs folytatás.
- **Tagsági fokozat** az **összesen elköltött** zseton szerint. Ide számít a játékindítás, a bolt és a folytatás, a Derbyből pedig a futamonkénti **nettó veszteség**. A tét levonásakor még nem számít, így a megszakadt, visszatérített futam sem emel.

  | Fokozat | Elköltött zseton | Előny |
  |---|---|---|
  | 🥉 Bronz | 100 | Kassza +5% koppintásérték |
  | 🥈 Ezüst | 500 | Kassza +10%, pénz-gépágyú 50 percenként |
  | 🥇 Arany | 2 000 | Kassza +15%, gépágyú 45 percenként, +1 érmeverő-mentés naponta |
  | 💎 Gyémánt | 10 000 | Kassza +20%, gépágyú 40 percenként, +2 érmeverő-mentés, folytatás 2 zsetonért |

  A szintlépést üzenet jelzi. A fokozat a kezdőlap „Összes pénzem” gombján és a tárca ablakában látszik (haladásjelző, összecsukható fokozatlista). Csak a telefonon tárolódik, ezért a fiókba mentés nem változott.
- **Napi plafon:** a játékidőért **naponta legfeljebb 30 zseton** jár, a nap magyar idő szerint vált. Utána a percszámláló megáll, a sarokjelzés egyszer kiírja: „mára kész · 30/30”. A Kassza-kivét (napi 20) és a Derby addig is megy. A tárca mutatja a mai állást, és felsorolja, mire költheted a zsetont.
- A `firestore.rules` most sem változott: a költés a `zs`-t csak csökkenti, azt a szabály mindig elfogadja.

**v4.44.0:** **Tüzér Kassza – új koppintás-nézet és pénz-gépágyú; a zseton nem zavar játék közben.**
- **Köteg lent, a pénz berepül a kerékre:** a koppintható bankó (érme) a kerék közepéről lekerült. A képernyő alján most rendezett **bankóköteg** áll, mint amikor kézben számoljuk a pénzt; az érméknél **recézett peremű érmeoszlop**. A köteg rétegenként, lefelé egyre sötétebb élekkel látszik. **Koppintásra vagy pöccintésre** a legfelső bankó ívben a **rulettkerékre repül**: pörög, átfordul, és a kerék síkjába dőlve landol. Ott a kerékkel együtt forog, majd beszívódik a kasszába, közben kipattan a „+összeg”. A ZSEB-kijelző minden érkezésre lüktet. A kerék közepén arany tengelydísz van; telitalálatnál nagyobb gyűrű, villanás és konfetti.
- **A pöccintés dob, nem tol be:** a felfelé húzás már nem viszi a zsebet az ütegkasszába, így pöccintés közben sem megy el véletlenül. A befizetés az **⇡ ÜTEGBE TOL** gombbal megy; a pénz a ZSEB-kijelzőtől repül a halomra.
- **💸 Pénz-gépágyú:** **óránként egyszer, véletlen pillanatban** érkezik, a szerver órája szerint (a telefon órájának állítása nem hozza előbb). Ha épp nincs nyitva a Kassza, megvár, de egyszerre csak egy lehet, nem gyűlik fel. A gyerekzár alatt pihen. A forgócsöves gépágyú jobb lent jelenik meg; **nyomva tartva felpörög** (I → II → III → IV → **MAX** fokozat = 2×, 4×, 6×, 8×, **10× érték**). Ilyenkor mp-enként 5–14 bankót szór a kerékre, motorzúgással és torkolattűzzel. **Összesen 10 mp lőidő**, amely csak nyomva tartás közben fogy; a hátralévő időt a gépágyú körüli gyűrű mutatja. Elengedve a gépágyú visszapörög, ezért a folyamatos tartás hozza a legtöbbet. A kerék fölött a fokozat és a gyűlő összeg látszik, a végén összesítés. Az első gépágyú a frissítés után 2–6 percen belül megjön.
- **Nem akad, gyenge telefonon sem:** a köteg és a gépágyú teste egyszer kirajzolt kép. Repülő vagy fekvő pénzenként képkockánként egyetlen `drawImage` fut egy `setTransform`-mal; nincs árnyékszámítás és képkockánkénti gradiens, a darabszámnak felső korlátja van. Mérés 6× lassított processzorral (390×844, 2× kijelző): tétlenül **37 → 45** képkocka/mp, folyamatos koppintás közben **24 → 27** (a 95. percentilis **83 → 50 ms**). Gépágyúzás közben 27, gyenge telefon módban 47–59.
- **Kis kijelzőn is elfér:** alacsony kijelzőn a köteg legfeljebb a szabad magasság harmadát foglalja. Nagyon alacsony kijelzőn (pl. 320×568) a futóverseny helyén a kerék fér el. Az ejtőernyős csomag a köteg mellett, balra száll le.
- **A zseton nem zavar játék közben:** a percenként felugró „🪙 +1 zseton” toast helyett 2 mp-re egy kis, kattinthatatlan jelzés villan fel a fejléc bal sarkában (🪙 +1 · egyenleg). Nem takar irányítást, és nem írja felül a játék saját üzeneteit.
- **Elemzés:** miért nincs most igazán értelme a zsetonnak, és hogyan lehetne fejleszteni (zseton-bolt, folytatás, tagsági fokozat, napi plafon): `docs/tervezet-zseton.md`.
- A `firestore.rules` nem változott; a gépágyú állapota a Kassza helyi mentésében van (`mg`).

**v4.43.0:** **Gidrán Terep – valódi offroad élmény.**
- **4×4 hajtáslánc:** új **4H / 4L** gomb (terepfokozat: 2,2-szeres nyomaték, max. 34 km/h, erős motorfék a lejtőn – csak állva váltható) és **DIFIZÁR**. A fizika kétlépcsős lett: előbb a rugózás és a kerekenkénti tapadási határ, aztán a hajtás elosztása. **Nyitott difivel** a gyengébben tapadó kerék szab határt – ha egy kerék a levegőbe emelkedik vagy tehermentesül (kereszttengelyes csavarodás bukkanókon, sziklán), elpörög, és megállsz; **zárt difivel** minden kerék a saját tapadásáig visz. A zár csak 15 km/h alatt kapcsolható, aszfalton/murván 30 km/h felett zárva feszül a hajtáslánc, és **eltörik** (gyengébb hajtás, a zár többé nem kapcsolható).
- **Beásódás sárban, dagonyában, homokban:** a pörgő kerék kerekenként beássa magát (magas nyomással gyorsabban), nő a gördülési ellenállás, csökken a tapadás, a kerék láthatóan a sárba süllyed, és nyomvályút hagy. Kiút: kis gáz, **hintáztatás** (gáz–fék), vagy **önmentés csörlővel**.
- **Horgonyfák és önmentő csörlő:** a nehéz szakaszok közepén és túlpartján álló fákhoz (max. 32 m) fakímélő hevederrel lehet csörlőzni – a csörlő a Gidránt húzza ki, időbüntetés nélkül (fékezve húzva elszakad a kötél). A régi **KISZABADÍTÁS** (+10 s) továbbra is megvan, de horgonyfa közelében csak később jelenik meg.
- **Gázló:** 6–12 km/h-nál szép **orrhullám**; gyorsabban vizet nyel a motor (**vízütés**: leáll, újraindul, 34% motorkár – háromnál vége).
- **Futómű-kár:** felütközés és kemény landolás rongálja (külön kék sáv az abroncs alatt); 100%-nál el kell vontatni a Gidránt.
- **Műszer:** **dőlésmérő** (35° felett borulásveszély) és **4×4 kerékállapot** felülnézetből: terhelés, levegőbe emelt és kipörgő kerék, 4H/4L, nyitott/zárt difi, beásódás mértéke.
- **Valósághű látvány:** alacsony nyomáson kidudorodó abroncs, sárba süllyedő kerék, nyomvályúk, sárfröccs a kamerán (az eső lemossa), rugóstagok.
- **3 pálya:** **Bajnoki pálya** (változatlan nyomvonal, ranglistás), **Mocsaras erdő** (dagonya, mély gázló, bukkanók, 2 kidőlt fa, gyakori eső) és **Bakonyi sziklák** (kőfolyás, bukkanók, sziklamászás, extrém lejtő). Az új pályák rekordja a telefonon tárolódik.
- **Rekord-szellem és részidők:** a legjobb menet áttetsző Gidránként fut veled, a szakaszhatárokon megjelenik a különbség (▼ zöld = gyorsabb). Új talajok: **Dagonya**, **Bukkanók**; okosabb elakadás-tippek (difizár / hintáztatás / 4L / nyomás).
- **Eredmény:** csillagos terepvezetői értékelés, abroncs-, futómű- és motorállapot, max. dőlés, önmentések, kiszabadítások, vízütések, difizáras idő.

**v4.42.0:** **Zseton – egyetlen pénznem, a fiókba mentve.**
- **1 zseton = 1 játék.** A tárca forint helyett zsetonban számol (a főgombon és a Derby fejlécében is). Minden játék indítása 1 zseton; a Tüzér Derbybe a belépés ingyenes, ott futamonként **1–50 zsetont** lehet feltenni. Új játékos 10 zsetonnal indul.
- **Bevétel:** minden aktívan játszott perc **1 zseton**; a **Tüzér Kasszából naponta legfeljebb 20 zseton** vehető ki (a nagyságrend szerint: 1 milliárd Ft kb. 5, 1 billiárd kb. 11, 1 kvadrillió 20 zsetont ér).
- **Érmeverő = mentőöv:** csak akkor jelenik meg, ha elfogyott a zsetonod; **100 koppintás 3 zseton, naponta legfeljebb 3-szor**. Így senki nem szorul ki, de a játék többet ér, mint a koppintás.
- **Átváltás:** a meglévő forintos egyenleg 100 Ft = 1 zseton arányban váltódik át (lefelé kerekítve); a Derby-statisztika is.
- **Derby-kifizetés egész zsetonban:** a tört részt véletlen kerekítés adja (pl. 1,6 zseton = 60% eséllyel 2, 40% eséllyel 1), így a várható nyeremény pontos marad, kis tétnél sem nyeli el a lefelé kerekítés. Mért megtérülés 900 futamon, 1 zsetonos téttel: minden fogadásfajta 100% alatt (esélyes Hely kb. 97%, esélyes Tét kb. 90%).
- **Mentés a fiókba:** az egyenleg bejelentkezve legfeljebb 2 percenként (és háttérbe tételkor) a fiókba is felmegy (`zs`, `zsSt`) – külön mentésként, új figyelő nélkül. **Új telefonon** a fiókban lévő egyenleg töltődik vissza (az azóta ott szerzett/elköltött különbséggel). A tárca ablakában látszik, mennyi van a fiókban (✓ vagy ⏳).
- **Csalás elleni korlát (`firestore.rules`, `zsOk`):** a zseton csökkenhet bármennyit, de **nőni csak a szerveridővel arányosan** tud: percenként 1, de legalább 30 és egyszerre legfeljebb 600; az első feltöltés legfeljebb 500. Egy csaló így óránként legfeljebb kb. 60 zsetont nyerhet; egy nagy, valódi Derby-nyeremény részletekben megy fel (⏳). Új regressziós tesztek: `tests/firestore-rules.test.mjs` (az emulátorban mind átment, a régiekkel együtt).
- **Teendő:** a `firestore.rules`-t a Firebase konzolban közzé kell tenni (Firestore → Rules → Publish). Amíg ez nem történik meg, a zseton csak a telefonon tárolódik (a fiókba mentést a szerver elutasítja), a többi mentés zavartalan.

**v4.41.0:** **Játéktermi érme, „Összes pénzem” tárca, a Tüzér Derby fogadóirodává alakult.**
- **💰 ÖSSZES PÉNZEM** – új főgomb a kezdőlapon (és a Derby fejlécében): közös, forintban számolt tárca. Új játékos 1 000 Ft-tal indul.
  - **Játékidőért:** minden **aktívan játszott perc 100 Ft**, bármelyik játékban. Aktív = nyitott játék, látható ablak, nincs szünet, és az utolsó 15 mp-ben volt érintés vagy billentyű. A Tüzér Derby (fogadás, futamnézés) nem számít bele.
  - **Kivét a Tüzér Kasszából:** a Kassza zsebének 10 / 25 / 50 / 100%-a váltható át. Az érték a zseb **nagyságrendjével** arányos, nem az összegével (1 milliárd Ft kb. 2 850 Ft-ot, 1 billiárd kb. 5 700 Ft-ot, 1 kvadrillió 10 000 Ft-ot ér); a kivett rész a zseb ugyanekkora hányadát viszi el. **Naponta összesen legfeljebb 10 000 Ft** vehető ki (magyar idő, szerveróra – net kell hozzá). A Kasszába visszatenni nem lehet, a havi ranglistát a tárca nem érinti.
  - **🪙 Játéktermi érme:** 1 érme = 100 Ft. **Minden játék indítása 1 érmébe kerül** (a Tüzér Derbybe a belépés ingyenes, ott a tét a költség). Ha nincs érméd, a játék helyett a tárca nyílik meg.
  - **Érmeverő:** a tárcában egy nagy érme – **100 koppintás = 10 érme** (1 000 Ft). Ez a mentőöv: pénz nélkül sem zárhatod ki magad a játékokból. A számláló megmarad, ha közben bezárod.
  - **Mire jó még:** a Tüzér Derbyn lehet fogadni belőle – egy futam legalább 100 Ft.
  - Csak a telefonon tárolódik (nem megy fel a szerverre, telefonok között nem szinkronizál).
- **Tüzér Derby – csak fogadás:** nincs saját löveg, gáz és sávváltás. Futamonként **egy szelvény**: kiválasztasz egy indulót, a fogadás fajtáját (**Tét** – nyer, **Hely** – dobogós) és a tétet (100–5 000 Ft), aztán nézed a futamot. A díjazás megszűnt; a tét és a nyeremény a tárcából megy, nem a Kassza zsebéből.
- **Vegyes mezőny:** az istállóban a PzH 2000 mellett **Gidrán** és **Rába H14** is indul (a Rába saját, rajzolt modellt kapott: bulldogfülke, bordás felszerelésláda, ponyvás plató ablakkal, terepgumik zöld tárcsával). A Gidrán a száraz pályát szereti, a lánctalpas PzH a puha talajt és a sarat, a Rába szívós a hosszú távon.
- **Egységes gyorsulás:** minden induló ugyanannyi idő (2 mp) alatt éri el a teljes sebességét, a tömeg nem számít; a végsebességet a motor, a lassulást a hajrában az állóképesség adja. A málha (súlyterhelés) megszűnt, a programfüzetből a VÁL (váltó) sáv is kikerült.
- **Forgó kerekek és lánctalp:** a PzH futógörgői és lánctalpa, a Gidrán és a Rába kerekei a megtett úttal arányosan forognak – kis kijelzőn és gyenge telefon módban is.
- **Filmes célfotó:** szoros befutónál (az első kettő között 0,1 mp-nél kisebb várható különbség, illetve Hely-szelvénynél a 3–4. hely között, ha a tipped érintett) a futam 0,22×-esre lassul, fekete sávok jönnek, a kamera a két esélyesre közelít és szívdobogás szól; amikor az első orra átér a célvonalon, a kép fekete-fehér fotóvá merevedik (piros célvonal, „4-ES ORRHOSSZAL A 3-AS ELŐTT”), majd visszaáll. Kb. minden ötödik futamban.
- **Csalásmentes, kiszámíthatatlan sorsolás:** a futam véletlenszámait a böngésző kriptográfiai generátora adja (`crypto.getRandomValues`, 128 bites mag), **mindig a tét rögzítése után** – a programfüzetből és a szorzókból nem jósolható meg. A teljes futam és a kifizetés a rajtnál kiszámolódik és elmentődik; a képernyőn rögzített lépésközzel ugyanez a futam játszódik le (gyorsítással, lassítással, akadozó képkockákkal is – 300 próbafutamból 300 egyezett). **Kilépés vagy az app bezárása futam közben nem ad vissza tétet:** a szelvényt a már kisorsolt eredmény szerint számoljuk el (eddig a vesztésre álló tétet kilépéssel vissza lehetett kapni).
- **Futamidők** (a győztesé, átlag): Sprint 600 m kb. 37 mp, Mérföld 900 m kb. 55 mp, Derby 1300 m kb. 79 mp. A ⏩ Gyorsítás 2,5×-esre gyorsít (a filmes célfotó alatt kikapcsol).
- **Hangulat:** rajt előtti kürtszó, élő **kommentár** (élre állás, kanyar, célegyenes, műszaki hiba, a tipped helyezése), **állás-tábla** a pillanatnyi sorrenddel, közönségmoraj, ami a hajrában felerősödik, nyerő/vesztő dallam, konfetti, ha a tipped nyer. **⏩ Gyorsítás** gomb a futam alatt.
- Mért megtérülés (1 200 futam, 100 Ft-os tét): első esélyes Tét kb. 90%, Hely kb. 98%; véletlen induló kb. 87–96%; minden fogadásfajta 100% alatt. Nagy tétnél (5 000 Ft) a saját tét tovább rontja a szorzót. A Hely legkisebb osztaléka 1,00 (a tét visszajár), a Tété 1,05.
- A `firestore.rules` nem változott, a szerver felé nincs új forgalom. A korábbi Derby-statisztika (futam, győzelem, mérleg) nullázódik, a lövegek formája megmarad.

**v4.40.0:** **Új játék: TÜZÉR DERBY – PzH 2000 lóverseny (galopp).** 8 löveg fut egy futamban: 7 az istállóból (gép hajtja), 1 a tiéd.
- **Programfüzet:** futamonként táv (Sprint 600 m, Mérföld 900 m, Derby 1300 m), talaj (száraz, puha, mély sár), rajthely, futásstílus (élen menő, követő, hajrázó), málha (súlyterhelés – a jobb löveg több gránátot visz), forma (az utolsó 5 futam helyezése), a löveg adottságai és Öreg Zászlós tippje. Az istálló 24 lövege állandó, a formájuk futamról futamra követhető.
- **Fogadás a Kassza zsebpénzéből** (csak játékpénz): **Tét** (a löveg nyer) és **Hely** (az első háromban végez), totalizatőr-rendszerben, 15% levonással. A kiírt szorzó becslés; a végső osztalék a zárás után alakul ki. A gépi fogadók az esélyteleneket túlfogadják, ezért a formát figyelő játékos jár jobban. Egy futamra legfeljebb a zseb 10%-a, a saját lövegre 2%-a tehető. Futam közbeni kilépésnél a tét visszajár.
- **Hajtás:** startgép, csengőre rajt (a korai gáz kiugrás, késve indulsz; a gyors reakció jobb rajt). A **GÁZ** nyomva tartva hajtás (gyorsabb, de melegszik a motor), elengedve tempómenés (hűl); túlmelegedésnél 3 mp-re leesik a teljesítmény. **Sávváltás** ▲▼: kanyarban a belső sáv rövidebb, más löveg mögött szélárnyék van, de be is lehet szorulni. **Utánégető** futamonként 3, csak a célegyenesben. A gépi lövegek is a korláthoz húzódnak és kikerülik a lassabbat.
- **Díjazás:** a saját löveg 1–3. helyéért a zseb 1 / 0,5 / 0,25%-a (legalább 5 000 / 2 500 / 1 000 Ft).
- **Modell:** egyszínű szürkészöld PzH 2000 oldalnézetben, a megadott tervrajz arányai szerint rajzolva (155 mm L/52 löveg csőszájfékkel, 7 futógörgő, szellőzőrácsok).
- **Látvány:** a lánctalp alól felvert por (száraz pályán sűrű, sárban kevés), sárfröccs, rögök és tócsák puha és mély talajon, dízel kipufogófüst (alapjáraton vékony, hajtásnál sűrű, túlmelegedésnél és műszaki hibánál fekete), rajtnál füstlöket, utánégető-láng, forgó futógörgők és futó lánctalp, bólintó löveg gyorsításnál, nyomvályú, lelátó ugráló közönséggel és lobogó zászlókkal, távolságjelző táblák, célfotó-villanás, konfetti győzelemnél. Gyenge telefon módban kevesebb részecske.
- **Megszakadt futam:** ha az appot futam közben zárják be, a tét a következő megnyitáskor visszajár.
- **A szervert nem terheli:** a futam, a szorzók és a gépi fogadók a telefonon számolódnak; nincs új figyelő, nincs új mentés, a `firestore.rules` nem változott. A zsebpénz a Kassza helyi állásában változik, a ranglistára továbbra is csak a Kasszában befizetett (szerveroldalon korlátozott) összeg kerül. A győzelmek és a mérleg egyelőre csak a telefonon tárolódnak (nincs közös ranglista). Net nélkül is játszható.
- Következő lépések (még nincs kész): Befutó és Hármasbefutó, élő szorzótábla, események (érvénytelen futam), levonás az üteg kasszájába, díjfutamok, gátverseny. A tervezet: `docs/tervezet-pzh2000-loverseny.md`.

*Fejlesztőknek:* az új játék az `lv.js` modulban van (lustán töltődik, mint a `sr.js` és a `sere.js`); a Kassza zsebét az `app.js` `tkWallet(d)` függvényén át éri el. Az egyensúly állandói az `lv.js` elején vannak (`LV_PUSH`, `LV_CRUISE`, `LV_HEAT`, `LV_HCP`, `LV_BIAS`, `LV_TAKE`).

**v4.39.1:** Tüzér Kassza: a felső ZSEB-kijelző körül a villogó izzósor helyett álló, kettős arany keret szegecsekkel (Golden Ticket alatt világosabb) – a rulettkerékhez illik, nincs mozgó fény, és kicsit gyorsabb (6× lassított processzorral kb. 27 → 29 képkocka/mp). Mind a 8 játék nyitás–játék–bezárás próbája hibamentes.

**v4.39.0:** Tüzér Kassza: **👶 ULTRA KOPPINTÁS gyerekzárral.** A Kassza képernyőjén bal lent egy csúszka: jobbra húzva (végig) bekapcsol. Ilyenkor az egész képernyő koppintófelület – bárhová koppint a gyerek, az pénzt termel –, de **semmi más nem érhető el**: bezárás ✕, alsó fülek (Fejlesztés, Piac, Bankók, Ajándék, Érdemek, Ütegek), Ütegbe tol, felhúzás, Pénzverde és az Android „vissza” gomb sem működik. A koppintás ugyanannyit ér, mint egyébként (ugyanaz a 15/mp korlát, nincs extra bevétel). **Feloldás:** a jobb felső lakat folyamatos, **15 mp-es nyomva tartásával** (körbefutó jelző és visszaszámláló; elengedésre újraindul). Félig húzott csúszka nem kapcsol be. Megjegyzés: a telefon saját gombjai (kezdőképernyő, alkalmazásváltó) böngészőből nem tilthatók le – teljes zároláshoz a telefon „Képernyő rögzítése” (Android) vagy „Irányított hozzáférés” (iPhone) funkciója használható.

**v4.38.0:** Tüzér Kassza: a koppintható pénz körül a csillogó, mozgó fénykoszorú (forgó fénysugarak, ragyogás, villogó izzósor) helyett **forgó kaszinó-rulettkerék**: piros-fekete zsebek, zöld nulla, arany elválasztók és szegecsek, fa perem, ellentétes irányban futó fehér golyó. A kerék a kombóval gyorsul, Golden Ticket alatt pörög; bankjegynél perspektívában, asztalon fekvőnek látszik. **Gyorsabb:** a kerék egyszer rajzolódik ki gyorsítótárba, képkockánként csak egy forgatott kép + a golyó (a korábbi nagy felületű fényösszeadás helyett) – 6× lassított processzorral mérve kb. 22 → 26–29 képkocka/mp; gyenge készüléken (automatikus kímélő mód) a kerék áll, csak a golyó fut. A pénz neve és a kombósáv a kerék fölé/alá került, hogy ne takarja a perem.

**v4.37.1:** Tüzér Kassza: a fejléc 🏆 számlálója mostantól az **egész üteg közös kasszáját** mutatja (minden ütegtárs befizetése együtt, élőben), nem csak a sajátodat; a saját részed a számlálóra mutatva (címke) és az Ütegek fülön látszik. Az ütegtársak adatai a Kassza nyitva tartása alatt külön, csak az adott ütegre szűrt figyelővel frissülnek. A szabálymagyarázat ennek megfelelően frissült.

**v4.37.0:** **Élő futóverseny a Kasszában + kevesebb mentés.** A Kassza tetején futó kis katonák (a legtöbbet befizetők) újra élőben versenyeznek: a Kassza külön, valós időben figyeli a verseny élmezőnyét (első 8), így a többiek katonái a mentéseik beérkezésekor azonnal előrelépnek – közben a teljes játékoslistát továbbra sem kell figyelni. **Mentési időköz:** aki a futóverseny élmezőnyében áll, 30 mp-enként ment (hogy a verseny élő legyen), mindenki más legfeljebb 2 percenként; a hónap utolsó 10 percében 15 mp-enként; bezáráskor és háttérbe tételkor azonnal. A befizetés, vásárlás, ajándék már nem ment külön-külön azonnal, hanem összevonva – egy aktív játékosnál ez a korábbi percenkénti 10–20 mentés helyett legfeljebb 0,5–2. **Javítva:** új játékos ütegválasztása az első befizetés előtt („Ranglista-mentés elutasítva”) – az első, 0 Ft-os mentésből hiányzott a szerveridő. **Teendő (egyszer):** a havi verseny nézethez összetett index kell: Firebase konzol → Firestore Database → Indexes → Composite → Create index: Collection ID `users`, mezők `tkWk` Ascending, `tkWg` Descending, Query scope: Collection → Create (pár perc alatt elkészül; a leírása a `firestore.indexes.json`-ban is megvan). Amíg nincs meg, a havi nézet a drágább teljes lista-figyelővel működik, a verseny akkor is élő.

**v4.36.0:** **Több száz egyidejű játékosra optimalizálva.** Eddig minden telefon valós időben figyelte a teljes játékoslistát: bármelyik játékos mentése azonnal letöltődött mindenki telefonjára, és minden alkalommal újrarajzolta a ranglistát – sok játékosnál ez a telefonon akadást, a szerveren megsokszorozódó olvasást okozott. Most: (1) a saját fiók valós időben figyelt, a teljes lista viszont csak akkor, ha látszik (menü, ranglista, Kassza Ütegek fül) – **játék közben és háttérben szünetel**, visszatéréskor csak a változások jönnek le; (2) a beérkező változásokból csak a módosult játékosok frissülnek, nem épül újra a teljes lista; (3) a kijelző frissítése összevonva, legfeljebb 1,5 mp-enként, játék közben elhalasztva; (4) a Kassza automatikus mentése 20 helyett 45 mp-enként (bezáráskor, vásárláskor, befizetéskor azonnal). Terheléses teszt (300 szimulált játékos, emulátor): játék közben a telefon a többiek mentéseiből semmit nem kap és nem dolgoz fel (korábban mindet), a menüben a feldolgozási idő kb. hetedére csökkent. A szabályok nem változtak a 4.35.2-höz képest.

**v4.35.2:** **Javítva: „Ranglista-mentés elutasítva” (tkSync permission-denied, KAS-9086).** Ok: a Firestore egy kérésben legfeljebb 1000 kifejezést értékel ki; a `firestore.rules` felhasználói szabálya minden mentésnél az összes (kb. 30) mezőt újra összehasonlította, ami egy régóta játszó, teljesen kitöltött fióknál túllépte a korlátot – így a szerver minden mentést (Kassza-befizetés, rekord, játékszámláló, rendfokozat) elutasított, pedig az adat helyes volt. Most az érintett mezők halmaza egyszer készül el, és a mentés által nem érintett mezőcsoportok (rekordok, számlálók, Kassza) ellenőrzése egy lépésben kimarad. Az ellenőrzések tartalma nem változott. Új regressziós teszt: teljesen kitöltött fiók. **Teendő:** a `firestore.rules`-t újra közzé kell tenni (Firebase konzol → Firestore → Rules → Publish); az app kódja nem változott, a beragadt mentések a közzététel után maguktól feltöltődnek.

**v4.35.1:** **Javítva: az admin ranglista-nullázás nem törölt mindenkinél.** Ok: a telefonok a nullázást csak akkor vették át, ha „újabb” volt a náluk utoljára átvettnél – egy korábbi, előreállított naptárú telefonról indított nullázás jövőbeli jelzése miatt az új nullázást régebbinek látták, nem törölték a helyi állást, és visszatöltötték a régi összegeket. Most a nullázást az azonosítója alapján veszi át minden telefon (ha eltér, törlődik a helyi állás; a nyitott Kassza előbb bezárul, mentés nélkül). **Szerveroldali védelem:** nullázás után a fiók semmit nem tölthet fel, amíg a telefonja nem nyugtázta a nullázást (`lbSeen`), így régi helyi állás nem kerülhet vissza a ranglistára. **Teendő:** a `firestore.rules`-t újra közzé kell tenni, majd adminként **még egyszer nullázni** (Továbbiak → Fiók → Ranglista nullázása).

**v4.35.0:** **Csalás elleni szerveridő, egységes pontozás, kímélőbb grafika.**
- **A telefon naptára/órája nem számít többé.** Eddig a naptár átállításával újra lehetett nyitni a napi ajándékot, pörgetni a szerencsekereket, lerövidíteni az előléptetési várakozást, és a hónap is máskor nullázódott – ezért mutattak a telefonok különböző eredményt. Most a játék a **szerver pontos idejét** használja (a telefon óráját csak ezzel korrigálva), a napok és hónapok **mindenkinél magyar idő szerint** váltanak. Ha a telefon órája játék közben ugrik, a pontos időt újra lekéri. Net nélkül az időhöz kötött jutalmak (napi doboz, kerék, napi küldetés, előléptetés) zárva vannak, amíg a pontos idő meg nem jön; a sima játék net nélkül is megy.
- **A szerver nem fogad el más számot** (`firestore.rules`): a Kassza hónapja csak a szerver szerinti aktuális hónap lehet; a befizetés csak nőhet, és csak a valós (szerver)idővel arányosan (az utolsó befizetés óta másodpercenként legfeljebb a meglévő összeg 2%-a, de legalább 10 millió Ft) – kitalált óriásszám nem kerülhet a ranglistára; a havi összeg csak annyival nőhet, amennyi ténylegesen be lett fizetve; új játékos első befizetése legfeljebb 1 billió Ft; időbélyeg nem lehet a szerver szerinti jövőben; a havi lezárás csak elmúlt hónapra és csak a ranglistán ténylegesen álló összeggel írható. A játék ezt maga is betartja: ha egyszerre túl sok menne fel, a maradék a következő mentésekkel megy (addig ⏳).
- **Grafika:** 90/120 Hz-es kijelzőn sem rajzol 60 képkocka/mp-nél többet (fele munka, hűvösebb telefon, tovább bírja az akku); a játékvásznak felbontása legfeljebb 1,5× (gyenge telefon módban 1×); gyenge telefon módban a Tüzér Kassza 30 képkocka/mp-cel megy.
- **Teendő:** a `firestore.rules` új tartalmát a Firebase konzolban közzé kell tenni (Firestore → Rules → Publish) **ugyanakkor**, amikor ez a verzió élesbe megy – a régi szabály az új mentést, az új szabály a régi appot utasítja el (adat nem vész el, a frissítés után minden feltöltődik).

**v4.34.1:** Élesítési javítás: a 4.33 és a 4.34 a Vercelen csak előnézetként épült meg, az éles oldal a 4.32-n maradt. Ettől a verziótól a frissítések közvetlenül a `main` ágra kerülnek, hogy az éles telepítés magától elinduljon. Tartalmi változás nincs a 4.34.0-hoz képest.

**v4.34.0:** Tüzér Kassza: **új kincshegy** a háttérben – a csíkos piramis helyett változatos elemekből épülő, megvilágított halom: érmeoszlopok, bankjegyköteg-falak, pénzeszsákok, aranyrudak, pénzzel teli ládák, drágakövek, nyitott kincsesláda, zsugorfóliás raklapok, páncélszekrény, a csúcson az üteg színes zászlaja, a legnagyobb összegeknél korona. Az összeggel együtt nő, és egyre újabb elemek jelennek meg rajta; az Ütegek fülön minden üteg saját zászlós halmot kap. **Látványosabb koppintás:** a pénz rugózva benyomódik és a koppintás irányába billen, lökéshullám-gyűrű és szikrák a koppintás helyén, a megkeresett pénz ívben a zsebbe repül (a köteg megugrik), a számok kipattannak; a pénz mögött forgó sugárkoszorú, ami a kombóval erősödik; **kombó-sáv** (sárga → narancs → piros, MAX-nál villog); telitalálatnál villanás és képernyőrázkódás. Betoláskor a pénz a kincshegyre repül, a hegy megugrik és szikrázik. Az effektek előre kirajzolt rétegekből és kötegelt rajzolásból mennek, gyenge telefon módban kevesebb belőlük.

**v4.33.0:** Tüzér Kassza: **élő ranglista-futóverseny a főképernyőn** – a zseb alatt a legtöbbet befizető bajtársak mini katonái futnak egymás mellett, a ranglista élő adatai szerint (jobbra, a célnál az első, koronával). Mindenki fölött jól olvasható névtábla a helyezéssel, alatta a befizetett összeg; a katona színe az üteg színe, a sajátod sárga névtáblát kap. Ha valaki előz, a katonája előrefut. Ha nem vagy a legjobbak között, az utolsó helyen a saját katonád látszik a valódi helyezéseddel. **Új 💵 Bankók fül:** a teljes pénznem-gyűjtemény külön oldalon – nagy számláló, hány féle van meg eddig (pl. 12 / 23), csoportonként (érmék, bankjegyek, rendfokozat-jegyek, csúcsjegyek), a következő pénznemnél a pénzverde-ár, a hátralévő szolgálati idő és haladásjelző. **Akadásmentes futás:** a Kassza képkockánkénti munkája kb. a felére-harmadára csökkent – a bázis álló része, a sprite-ok, a pénz árnyéka, a névtáblák és a pixelszöveg előre kirajzolt rétegből jön; a ranglista- és ütegadatok másodpercenként egyszer számolódnak (nem képkockánként); a fejléc számlálói ~6×/mp frissülnek; gyenge telefon módban kevesebb a fényeffekt és a konfetti.

**v4.32.0:** Tüzér Kassza: **13 új bankjegy** az Arany Jegy fölött – rendfokozat-jegyek (Őrmester, Törzsőrmester, Főtörzsőrmester, Zászlós, Főzászlós, Hadnagy, Főhadnagy, Százados, Őrnagy, Alezredes; mindegyiken a rendfokozat váll-lapja), majd az **Osztályparancsnoki bankjegy**, a **Tüzér Rettenet** és a legfelső, a **Szent Borbála-jegy** (10 trilliárd Ft). Az új pénznemekhez a pénzen felül **előléptetési szolgálati idő** is kell az előző legyártása óta (3 naptól 40 napig, összesen kb. fél év), a pénzverde ára szintenként duplázódik. Új érdem: Előléptetés. **10 új piaci tétel** (pl. HIMARS, Leopard 2A7HU, NASAMS-üteg, GMLRS, kamikaze drón, drónelhárítás, laktanya, szimulátorközpont), és egyszerre **×1000 vagy MAX** darab is vehető. Az eddigi eredmények (pénz, befizetés, pénznem, eszközök, érdemek) megmaradnak. A `firestore.rules` havi lezárásánál megszűnt az 1 billiárd Ft-os felső korlát – a szabályt a Firebase konzolban újra közzé kell tenni.

**v4.31.0:** Tüzér Kassza: **javítva a pénzösszeg-eltérés** – egy játékosnál több pénz látszott, mint amennyit a többiek a ranglistán láttak. Ok: a szerverről visszatöltés egy hibás változó miatt félbeszakadt, ezért a havi összeg nem töltődött vissza, és a szerver minden további mentést elutasított; emellett a még úton lévő saját mentést a játék egyszer újra hozzáadhatta. Most a 🏆 számláló és a ranglista ugyanazt mutatja; amíg a mentés úton van, a 🏆 mellett ⏳ jelzi, az Ütegek fülön pedig látszik, mennyi áll rólad a ranglistán. **Pontosított szabályok** (kezdőképernyő és Ütegek fül): mi kerül a zsebbe, mi látszik másoknak, havi nullázás, átigazolás, több telefon. **Új 🎁 Ajándék fül:** 7 napos napi ajándékdoboz (egyre nagyobb, 7. nap főnyeremény), **szerencsekerék** 3 óránként (pénz ×3–×60, Golden Ticket, ingyen fejlesztés/eszköz, extra pörgetés), **ejtőernyős ajándékcsomag** 1–2 percenként, gyakoribb Golden Ticket. **Kaszinós grafika:** futófényes izzósor a pénz és a zseb körül, mozgó reflektorok, konfetti és érmeeső. **Új kaszinózene:** swinges lounge-jazz sétáló nagybőgővel, ride-cinnel, seprűs pergővel, Rhodes-kísérettel, vibrafon-dallammal és teremzengetéssel; Golden Ticket alatt gyorsabb, rézfúvós betétekkel.

**v4.30.1:** Shot&Run: javítva a lövés utáni kamera-lemaradás – a filmes lövés-jelenet a torkolattűz után 0,2 mp-cel átúszik a kilőtt gránátra (eddig 1,25 mp-ig a csövön maradt, és a gránát kirepült a képből), a követés gyorsabb, és a gránát sebességének irányába előre tart, így nincs állandó lemaradás (mérve: legnagyobb eltérés a kép közepétől 750 → 108 képpont).

**v4.30.0:** Shot&Run: a szövegek nem takarják a csatateret – a figyelmeztetések (atomcsapás, idő, lőszer) teljesen fent, a fejlécben jelennek meg, az üzenetek (megfigyelői jelentés, állapot) a kép legalján, vékony, legfeljebb kétsoros sávban; az adatdoboz és a gombok fölé csúsznak. A távcső helyett **kameranézet-váltó** (🎥): AUTO (filmszerű követés), SAJÁT löveg, TÉRKÉP (mindkét löveg), ELLENSÉG lövege, GRÁNÁT (a lövedék és a SMArt-résztöltetek követése); a választott nézet megmarad, és nem AUTO nézetben a képen is van egy nagy TŰZ gomb, így bármelyik nézetből lehet lőni. A SMArt nagyobb területet pásztáz (175 egység, oldalt is szélesebben), így jobban befogja a célt.

**v4.29.2:** Shot&Run SMArt: ha a résztöltet pásztázás közben megtalálja a célt, kb. 0,6 mp-cel a befogás után azonnal tüzel – a levegőből, az aktuális magasságából (kb. 3 mp-cel a kilökés után, eddig csak a 7 mp-es ereszkedés végén); a második résztöltet 0,3 mp-cel később, a sebzés is ekkor éri a célt. Befogás nélkül végig pásztáznak, majd önmegsemmisülnek. Javítva: a gép célzója a 4.28-as magasabb kilökés óta rossz pontra irányozta a SMArt-ot (a kilökés helyére, nem oda, ahova a töltetek sodródnak), ezért szinte sosem talált.

**v4.29.1:** Shot&Run: mélyebb, súlyosabb motorindítás és málházás – nehéz relé- és mágneskapcsoló-csattanás, mélyen morgó 24 V-os önindító, tompán dobbanó kompressziók, dübörgő égési lökések és főtengely-dörmögés; a málházásnál nehéz láncszem-léptetés, mély hidraulikus átadókar, a 43 kg-os gránát csúszása és mély, hosszan csengő döngölés. A hangok a telefonhangszóróra vannak hangolva: a hallhatatlan legmélyebb részt kiszűrik, a mélységet dús felharmonikusok adják (így kis hangszórón is mélynek hallatszanak); a töltőautomata búgása és az alapjárat is mélyebb.

**v4.29.0:** Shot&Run: élethűbb rendszerhangok – a hangok most mintánként, fizikai folyamatok alapján számolt hangfelvételekként készülnek (meccs elején, előre). **Motorindítás:** főkapcsoló-relé, üzemanyag-szivattyú, önindító-mágneskapcsoló és fogaskerék-kapcsolódás, áttekerés (a V12 kompressziós ütemeinél az önindító érezhetően lelassul), első gyújtások, beindulás, az önindító leválása, felpörgés turbósivítással, majd hézagmentes átmenet az alapjáratba. **Rádió:** forgókapcsoló-reteszek, bekapcsoló relé, inverter-zúgás, három önteszt-sípolás, frekvenciaugratásos szinkron-csipogás, zajzár, formánsokkal szintetizált, rádiósávra szűrt és torzított „Rádiópróba, vétel”, nyugtázó sípszó, zajzár-csattanás. **Torony:** hidraulikaszivattyú villanymotorja, 9 dugattyús szivattyú-lüktetés, nyomásmentesítő szelep, reteszkioldás, fogaskoszorú-morgás holtjáték-kattogással, megálláskor koppanás. **Málházás:** gránátonként tárlánc-léptetés, átadókar, hüvelycsúszás, döngölés acélos csengéssel, sűrített levegő (négy változat); a töltőautomata búgása villanymotorral, szivattyúval, kompresszor-lüktetéssel.

**v4.28.0:** Shot&Run **filmes mód** (a menüben „🎬 Filmes mód: BE/KI”, alapból bekapcsolva; jelenet közben koppintásra tovább lehet lépni): szélesvásznú fekete sávok, közeli kamera, képregényes felirat és lassítás a fontos pillanatokban – első motorindítás (fekete füstcsóva, rázkódás, mély filmes „braam”), torony bekapcsolása (hidraulika-sziszegés, pára), málházás, minden lövés (lassított torkolattűz a cső mellől, a lőszer nevével), végzetes találat („KILŐVE!”: lassítás, szívdobogás, három késleltetett másodlagos robbanás, a kamera a kiugró kezelőkkel együtt keretez, majd lassan visszahúzódik). A repülő gránátot a kamera közelebbről, enyhe ráközelítéssel követi. A SMArt sokkal hamarabb és magasabban löki ki az ejtőernyős résztölteteket, és majdnem kétszer annyi ideig pásztáznak a levegőben. Ijesztőbb hangok: a saját lövegünk felé zuhanó gránát vészjósló, lebegő süvítése; a földön kúszó és fekvő sebesültek hörgése; égő kezelők összeesése. A jelenet alatt a köridő áll; online párbajban a játék nem lassul, csak a kamera és a sávok filmesek.

**v4.27.0:** Shot&Run: a játék közbeni üzenetek (megfigyelői jelentés, „TŰZPÁRBAJ!”, figyelmeztetések) automatikusan oda csúsznak, ahol nem takarják a lövegeket, a fölöttük lévő életerő-sávot és a kiugró kezelőket; ha két üzenet van, egymást sem fedik. Végzetes találatnál a túlélő kezelők (legalább 2) kiugranak a lövegből a búvónyílásokon: sokan lángolva, kapálózva futnak, a földön gurulva oltják magukat, majd kúszva menekülnek, a sérültek rögtön kúsznak; a lángok füstölnek, az égett egyenruha megfeketedik; mindegyik sikoltozik (szintetizált, térben elhelyezett hang). A „kilőve” jelenet ilyenkor hosszabb, hogy látszódjon.

**v4.26.0:** Gyorsabb indulás: a két legnagyobb játék (SERE Kitörés, Shot&Run) külön fájlba került (`sere.js`, `sr.js`), az `app.js` 1 MB-ról 562 KB-ra csökkent (tömörítve 371 → 204 KB). A kezdőlap így hamarabb megjelenik; a két játék a kezdőlap után a háttérben töltődik le (és offline is tárolódik), így a megnyitásuk ugyanolyan gyors. Shot&Run: **új, sérülhető alkatrész: GPS-vevő** – a GPS-es gránátok (Excalibur, Vulcano, PGK) sérült vevővel pontatlanabbak és gyengébben korrigálnak (közvetlen találat kb. 50% → 20%), kiesett vevővel irányítás nélkül, ballisztikusan repülnek; az adatdoboz figyelmeztet, a gép nem lő GPS-es gránátot kiesett vevővel; a FELÜLNÉZET kijelző a rádió vagy a GPS sérülésétől is megreped („GPS KIESETT”, „RÁDIÓ+GPS KIESETT”).

*Fejlesztőknek:* a `sr.js` és a `sere.js` a közös segédeket az `app.js` végén lévő `export {…}` listából importálja; ha ezekben új közös függvényt használsz, vedd fel az export listába. Új fájlnál a `sw.js` SHELL listáját is bővítsd.

**v4.25.0:** Shot&Run: összecsukható kiegészítő kijelzők – a FELÜLNÉZET és a bal alsó adatdoboz (METEO, TÁVMÉRŐ, LŐTÁBLA, ELTÉRÉS) egy koppintással fejléccé / „▸ ADATOK” füllé csukható, újabb koppintásra kinyílik; a telefon megjegyzi a beállítást. A TÁVMÉRŐ sorban is kiírt szavak: „irány jobbra/balra”, „szint” (a Δ és a J/B helyett).

**v4.24.0:** Shot&Run: a FELÜLNÉZET kis kijelző a rádió sérülésekor megreped (repedés, időnkénti képhiba), a rádió megsemmisülésekor pókhálósan szétreped, kialszik és villódzik („RÁDIÓ KIESETT”). Rövidítések helyett érthető feliratok: METEO (időjárás), TÁVMÉRŐ (lézeres távmérő, korábban LRF), LŐTÁBLA (korábban TBL), ELTÉRÉS (az utolsó becsapódás eltérése, korábban OBS), CÉL (megvilágított cél, korábban FCS).

**v4.23.0:** Shot&Run: **⚡ MINDENT BE** gomb – egy koppintással sorban bekapcsolja a motort, a rádiót, a tornyot és indítja a málházást (a megszokott hangokkal); csak akkor látszik, ha van még bekapcsolandó rendszer. **Bevezető az első játékhoz:** 6 lépéses, kihagyható súgóbuborék, amely mindig a következő teendőre mutat és kiemeli a gombot (MOTOR → RÁDIÓ → TORONY → MÁLHÁZÁS → MAGASSÁG → TŰZ); az első lövés után (vagy a „Kihagyom” gombra) többet nem jelenik meg.

**v4.22.0:** Shot&Run: teljesen új, látványos tűzvezető kis kijelző (FELÜLNÉZET) – foszforzöld radarképernyő rácsozattal, távgyűrűkkel, pásztázó radarsugárral (csak működő rádióval), izzó, futó szaggatott irányvonallal és célkereszttel, villogó, lüktető célponttal, az utolsó becsapódás jelével, mozgó szélnyilakkal, képcső-csíkozással; alul a céltávolság km-ben és az oldalirány, köd vagy kiesett optika esetén zajos kép és figyelmeztetés. Nagyobb kijelzőn nagyobb, kis telefonon kisebb.

**v4.21.2:** Shot&Run csiszolás: a menü- és eredménypanel nem csúszik a fejléc alá (minden kijelzőméreten); a menüben nem látszik a felesleges „– Kör 1”; az irányzó skálák számai nem takarják a piros jelölőt és nem vágódnak le a szélén; kis kijelzőn a sérülés-címkék egy sorban, oldalra görgethetően (nem tolják le a kezelőket); olvashatóbb menet/kör kijelző, lüktető TŰZ gomb, ha lőhetsz. Optimalizálás: menüben a háttér csak egyszer rajzolódik ki (eddig másodpercenként 60-szor), szünetben kb. 12 kép/mp – kevesebb akkuhasználat és melegedés.

**v4.21.1:** Javítva: SERE Kitörés – a kiképző-állomás feladatainál (pl. árnyékbot, víztisztítás) a válaszgombok szövege világos témájú telefonon olvashatatlan volt (sötét betű sötét háttéren); a gombok fix világos betűt és a többi játékkal egyező képregényes stílust kaptak.

**v4.21.0:** Egységes képregényes megjelenés minden játékban: ugyanaz a betűtípus (Bangers) a fejlécekben, címekben és gombokon; vastag kontúros, nagyobb (40 px) bezáró és szünet gomb; átlátszatlan kezdő- és eredménypanelek (nem üt át rajtuk a játék), a felugró ablak mögött elsötétül a kép; a hosszú leírású játékoknál (Gidrán Terep, Konvoj, SERE) az INDÍTÁS gomb mindig látszik; képregényes pedálok és kezelőgombok (GÁZ/FÉK, KÖD, DRÓN, kézifék, CTIS), olvashatóbb műszerfeliratok. Javítva: a Tüzér Kassza fejlécéből kilógó, levágott sorok (a „Hónap vége” külön címkére került); a Rába Rakodó fejlécének szétcsúszó életjelzője; kis kijelzőn a pedálok alá csúszó CTIS-gombok; a ranglista-ablak és a Továbbiak lap gombjai is az új stílust kapták.

**v4.20.1:** Javítva: különböző telefonokon eltérő rekordok látszottak. Bejelentkezve a ranglista már csak a szerver adatait mutatja; a rekordok kétirányúan szinkronizálódnak minden szerverfrissítéskor (a másik telefonon elért jobb rekordot ez a telefon is átveszi, a net nélkül elértet feltölti, sikertelen feltöltésnél újrapróbálja), így a játékokon belüli „Rekord” is mindenhol ugyanaz.

**v4.20.0:** Ranglista nullázása (új szezon): adminként a Továbbiak → Fiók panelen a „Ranglista nullázása – új szezon” gombbal minden játék rekordja, a játékszámlálók és a Kassza-állás mindenkinél törlődik; a telefonok a helyben tárolt régi rekordjaikat is eldobják, így azok nem töltődnek vissza. Javítva: ha egy telefonon másik felhasználó lépett be, átvehette az előzőnek a Kassza-állását és -rekordját; a Kassza összegét két különböző mentés is feltöltötte – ez eltéréseket okozott a ranglistán.

**v4.19.0:** Shot&Run: a SMArt 155 emelt, nyújtott röppályán repül (felső szögcsoport – kiválasztáskor a tűzvezető átáll rá, a lőtábla is ezt mutatja; kb. 2,5× magasabb csúcs, majdnem kétszer olyan hosszú repülés); a csúcs után magasan leválik a fenéklap, kilökődik a 2 résztöltet: fékezőszalag, majd pörgő örvényernyő, ferde tengelyű radaros-infravörös spirálpásztázás (radarimpulzusok, pásztázási hang), befogáskor piros célkeret és zárolási hang, utána felülről csapó EFP; befogás nélkül önmegsemmisítés a levegőben. Két új, valós 155 mm-es gránát: M712 Copperhead (lézerirányított páncéltörő – csak élő rádióval és ködmentes célra, villogó lézerpont a célon) és M1156 PGK (GPS-es irányító gyújtós HE); a DM121 készlet 14 db, így összesen továbbra is 60 gránát.

**v4.18.2:** Shot&Run online: ha valamelyik játékos telefonhívást kap (vagy háttérbe teszi az appot, lezárja a képernyőt), a párbaj mindkét telefonon azonnal megáll, bárki köre is van – a köridő áll, az ellenfél látja, hogy hívás miatt állt meg; visszatérve a „Folytatás” gombbal megy tovább. Ha a szünetjelzés nem jutna át, az ellenfél 5 percig vár a játékosra, mielőtt a párbaj véget érne.

**v4.18.1:** Shot&Run: a málházás fele annyi ideig tart (kb. 2,7 mp); a töltőautomata pneumatikus-elektromos búgással szól (villanymotor-búgás, sűrített levegő sziszegése és lüktetése, gránátonként döngölő-szisszenés, leálláskor levegő-kifúvás).

**v4.18.0:** Shot&Run: 120 mp-es köridő minden módban (fogyó sáv a kép tetején, 60/30/10 mp-es figyelmeztetés); lőszer-figyelmeztetések (elfogyott típus automatikus átváltással, kevés lőszer, teljes kifogyás – hanggal, rezgéssel; az ellenfélé is); stabilabb online kapcsolat (sorszámozott, nyugtázott, szükség esetén újraküldött események – nem vész el és nem fut le kétszer lövés; a lőszerállapot is szinkronizálódik; kapcsolódási jelzés; a Firestore-szabályok nem változtak); a készülék erejéhez igazodó részecskeszám és felbontás (gyenge telefonon visszavesz, erősön többet mutat), a kijelző játék közben nem alszik el; valósághűbb becsapódás (villanás, gomolygó tűzgömb, földoszlopok, sokkal több rög, kő és repesz, porgyűrű, füstoszlop); nagyobb lőporfüst; gránáttípusonként eltérő lövés-, röppálya- és becsapódáshang (V-LAP rakétahajtómű, Excalibur kormányszárnyak, Vulcano leváló vezetőelem, PFF repeszsüvítés, köd- és világítógránát tompább hangja); részletesebb, arányosított háttér (három hegyréteg, erdős dombok, falvak templomtoronnyal, villanyoszlopok, harckocsioszlop); háborús jelenetek (helikopterek rakétákkal, vadászgépek, rakéta-sorozatvető, világítórakéta); ritkán távoli atomcsapás gombafelhővel, késve érkező dörgéssel – a felhő később szétoszlik és eltűnik; a TŰZ gomb kiírja, mit lő vagy miért nem lehet lőni, gombnyomásra rezgés és fényvisszajelzés; nyugodt, nem rázkódó életerő-kijelzés a sebzés értékével, a lövegek fölötti sáv állandó méretű.

**v4.17.3:** Shot&Run online: a hálózati késés kiegyenlítése – a fogadó oldalon a lövés röppályájának eleje a mért késésnek megfelelően gyorsabban fut, így a két telefonon egyszerre csapódik be (400 ms késésnél eddig ~430 ms lemaradás, most ~0); ping-kijelző a fejlécben; a Firestore többfüles szinkron módja kikapcsolva (gyorsabb írás/olvasás).

**v4.17.2:** Shot&Run: élethűbb rendszerhangok – dízelmotor (behúzó relé, önindító, áttekerés, beindulás, felpörgés, V8 alapjárati hurok egyenetlen gyújtással, menet közben fordulatszám és turbó), harctéri rádió (forgókapcsoló, zajzár-sistergés, torz beszédfoszlány, nyugtázó sípszó), toronyforgató (relé, szervomotor, fogaskerék-morgás, hidraulika, fémes reteszelés), málházás (töltőautomata motorja és lánca, gránátonként fémes csattanás és döngölés).

**v4.17.1:** Hibajavítások: H.A.R.C. és DroneRun bezárás után bent maradó billentyűkezelők (minden megnyitással szaporodtak, és bezárva is reagáltak); a csak induláskor méretezett játékvásznak (H.A.R.C., DroneRun, Gidrán Terep/Konvoj, Tüzér Kassza) elforgatáskor és böngészősáv-változáskor újraméreteződnek; a kezdő- és eredménypanelek nem csúsznak a fejléc alá.

**v4.17.0:** Shot&Run: a lövegcső is ütközik – minden gránát (SMArt, köd stb. is) fennakad rajta, a cső sérül; filmszerű kamera (a végfázisban a becsapódási pont és a cél együtt a kép közepén, lassítás, ráközelítés, a löveg nem tűnik el a kép alján); a robbanás meglöki és megbillenti a löveget, a kráter mélysége korlátozott; a pálya szélén túlra lőtt gránát is földbe csapódik; ha mindkét lövegnek elfogy a lőszere, ejtőernyős lőszerláda érkezik (4 gránát), ha az is elfogy, a több életerő nyer, egyenlőnél döntetlen. Borítók: angol, kisebb hangszavak.

**v4.16.0:** Teljesen új, képregényes design: minden játékcsempén egész képet kitöltő, rajzolt akcióborító (tusvonal, akciósugarak, raszterpontok, hangszavak – a vásznon generálva, gyorsítótárazva); képregényes Bangers feliratok (SIL OFL 1.1), saját SVG ikonok emoji helyett, vastag kontúros gombok. Minden kijelzőre és kivágásra igazítva, fekvő kezdőlap; a telepített app már fekvőbe is fordul – a Shot&Run fekvőben is játszható („Fekvő mód” gomb), a többi játék álló helyzetet kér.

**v4.15.0:** Új kezdőlap: görgetés nélküli, egy képernyős játékválasztó nagy csempékkel, oldalra csúsztatással (Shot&Run az első), játékszámláló (pl. 3/8 · 8 játék), lapozó pöttyök, gépen nyilak és billentyűk; a belépés, dicsőségfal, beállítások és telepítés a „Továbbiak” lapon; játék közben a háttérben lévő kezdőlap nem terheli a kirajzolást.

**v4.14.0:** Shot&Run: új, nagy kártyás menü; egyszerű online párbaj (meghívó küldése megosztható linkkel – a barát egy koppintással belép –, vagy nagy kódmező beillesztés gombbal); szünet gomb játék közben (online is: a soron lévő játékos megállíthatja, a köridő áll); gép ellen és ketten egy telefonon az állás mentődik, a menüből „Folytatás innen”.

**v4.13.2:** Shot&Run: látványos életerő-kijelzés (színátmenetes sáv, fehéren villanó és lefolyó friss sebzés, lüktető kritikus állapot, kezelők és rendszerek állapotjelzői, életerő-sáv a lövegek fölött), élethűbb lövéshang, sokkal hangosabb becsapódás, süvítő lövedék a röppályán.

**v4.13.1:** Javítás: Shot&Run – egyes telefonokon eltűnt a PzH modellje (csak a lánctalp látszott); a modell mostantól kész képfájlokból rajzolódik.

**v4.13.0:** Shot&Run: valósabb talajfizika (két ponton felfekvő, rugózó, leeső löveg), nagyobb pálya és lőtávolság, élesebb és részletesebb grafika, minden telefonkijelzőre (iOS, Android, fekvő, kivágásos) igazított kezelőfelület.

**v4.12.1:** Automatikus frissítés: az app indításkor azonnal, utána 2 percenként és előtérbe kerüléskor keres új verziót, magától letölti, és (ha épp nem fut játék) azonnal át is vált rá.

**v4.12.0:** Shot&Run: magyar felségjelű PzH 2000 modell, izzó repeszek, por, füst, találatnyomok; online körönként 60 mp; valós lőszeradatok; net nélkül gép ellen játszható.

**v4.11.0:** **Shot&Run** – körökre osztott PzH 2000 tüzérpárbaj a DroneRun pályáján: gép ellen, meghívókóddal ember ellen (online), vagy ketten egy telefonon.
Az online párbajhoz a `firestore.rules` új `srRooms` szabályát közzé kell tenni a Firebase konzolban (Firestore → Rules → Publish).

**v1.11.0:** Rába Rakodó: a platform rakétákkal emelkedik, a bal skála a valós tengerszint feletti magasság; tolóerő-bónusz, villám, zónák. (v1.10.0: 6×6 Rába, nehéz ipari drón.)

**v1.1.0:** becenév + jelszó fiók és **élő közös ranglista** (Firebase).
- Regisztrációhoz csak becenév és jelszó kell (e-mail nem), a rendfokozat nem kötelező.
- A játékhoz be kell jelentkezni; bárki regisztrálhat, aki megkapja a linket.
- A ranglista másodperceken belül frissül mindenkinél, a kezdőoldalon minden játék top 3-a látszik.
- Telepítés után net nélkül is játszható; a net nélkül elért rekord a következő kapcsolódáskor feltöltődik.
- Amíg a `firebase-config.js` üres, az app a régi módon, csak helyi rekordokkal működik.

## Firebase beállítása (egyszer, kb. 10 perc)

1. **Projekt:** https://console.firebase.google.com → *Projekt hozzáadása* → név pl. `medve-arcade`
   (Google Analytics nem kell). Az ingyenes Spark csomag bőven elég 50–60 játékosnak.
2. **Bejelentkezés:** *Build → Authentication → Get started → Sign-in method →
   Email/Password → Enable* (csak az első kapcsoló, az „Email link” maradjon kikapcsolva) → Save.
3. **Adatbázis:** *Build → Firestore Database → Create database* →
   helyszín: `europe-west3 (Frankfurt)` → *Start in production mode*.
4. **Szabályok:** Firestore → *Rules* fül → a teljes tartalmat cseréld le a
   `firestore.rules` fájl tartalmára → *Publish*.
5. **Web app:** *Projekt beállításai (fogaskerék) → Általános → Saját alkalmazások → `</>` (Web)* →
   név: `medve-arcade` (a Firebase Hosting kell NEM) → a kapott `firebaseConfig` értékeit
   másold be a `firebase-config.js` fájlba.
6. **Domain:** *Authentication → Settings → Authorized domains → Add domain* → a Vercel-cím
   (pl. `medve-arcade.vercel.app`).
7. Töltsd fel a módosított fájlokat a GitHub-repóba; a Vercel magától újra kiteszi.
   Az éles oldalt (`medvearcade.vercel.app`) a `main` ágra **közvetlenül feltöltött** módosítás frissíti.
   Ha egy módosítás csak *Preview*-ként jelenik meg a Vercel *Deployments* listájában, ott a ⋯ menü
   *Promote to Production* pontjával léptethető élesbe.

## Admin teendők (Firebase konzolból)

- **Adminná tétel:** Firestore → `users` → a saját dokumentumod → *Add field*: `role` = `admin` (string).
  Admin javíthat vagy törölhet bárki rekordját.
- **Ranglista nullázása (új szezon):** adminként az appban Továbbiak → Fiók → „Ranglista nullázása – új szezon”, megerősítésként be kell írni: `NULLÁZÁS`.
- **Sértő név / csaló rekord:** Firestore → `users` → a dokumentum → mező szerkesztése vagy törlése.
- **Elfelejtett jelszó:** Authentication → Users → a felhasználó (`becenev@medve.invalid`) → *Delete account*,
  és Firestore-ban a `users` dokumentumát is töröld. Ezután újra regisztrálhat ugyanazzal a becenévvel.

## Tudnivalók

- A rekordokat a telefon küldi be, ezért egy ügyes játékos elvileg hamisíthat. A szabályok ezt korlátozzák
  (csak a saját rekord, csak javulhat, ésszerű határokon belül), a többit admin törléssel lehet rendezni.
- A ranglistát csak bejelentkezett játékos látja; a becenév, a rendfokozat és a rekordok látszanak.
- A Firebase-könyvtár a `www.gstatic.com`-ról töltődik (a `vercel.json` CSP ezt engedi), és a service worker eltárolja.
