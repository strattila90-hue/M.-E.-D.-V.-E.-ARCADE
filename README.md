# M.E.D.V.E. Arcade

**Aktuális verzió: 4.17.0** (az app `APP_VER` és a `sw.js` `CACHE` értéke ugyanez; verziónál mindkettőt együtt emeld.)

Telepíthető (PWA) játékgyűjtemény katonai témájú mini-játékokkal:
M.E.D.V.E. H.A.R.C., DroneRun, Gidrán Terep, Gidrán Konvoj, Rába Rakodó, SERE Kitörés, Tüzér Kassza, Shot&Run.

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
- **Sértő név / csaló rekord:** Firestore → `users` → a dokumentum → mező szerkesztése vagy törlése.
- **Elfelejtett jelszó:** Authentication → Users → a felhasználó (`becenev@medve.invalid`) → *Delete account*,
  és Firestore-ban a `users` dokumentumát is töröld. Ezután újra regisztrálhat ugyanazzal a becenévvel.

## Tudnivalók

- A rekordokat a telefon küldi be, ezért egy ügyes játékos elvileg hamisíthat. A szabályok ezt korlátozzák
  (csak a saját rekord, csak javulhat, ésszerű határokon belül), a többit admin törléssel lehet rendezni.
- A ranglistát csak bejelentkezett játékos látja; a becenév, a rendfokozat és a rekordok látszanak.
- A Firebase-könyvtár a `www.gstatic.com`-ról töltődik (a `vercel.json` CSP ezt engedi), és a service worker eltárolja.
