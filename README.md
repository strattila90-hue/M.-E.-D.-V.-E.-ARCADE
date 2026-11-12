# M.E.D.V.E. Arcade

**Aktuális verzió: 4.21.2** (az app `APP_VER` és a `sw.js` `CACHE` értéke ugyanez; verziónál mindkettőt együtt emeld.)

Telepíthető (PWA) játékgyűjtemény katonai témájú mini-játékokkal:
M.E.D.V.E. H.A.R.C., DroneRun, Gidrán Terep, Gidrán Konvoj, Rába Rakodó, SERE Kitörés, Tüzér Kassza, Shot&Run.

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
