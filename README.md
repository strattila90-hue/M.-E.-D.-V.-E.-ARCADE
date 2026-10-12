# M.E.D.V.E. Arcade

Telepíthető (PWA) játékgyűjtemény négy katonai témájú mini-játékkal:
M.E.D.V.E. H.A.R.C., DroneRun, Gidrán Terep, Gidrán Konvoj.

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
