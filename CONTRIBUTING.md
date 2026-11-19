# Contributing

## English

Thanks for your interest! Bug reports, ideas and pull requests are welcome.

**Run locally.** There is no build step. Serve the folder over HTTP and open it:

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

**Checks before a PR.**
- Syntax check: `cp app.js /tmp/app.mjs && node --check /tmp/app.mjs` (the same for `sr.js`, `sere.js`, `lv.js`, `sw.js`). `app.js` is an ES module, so check it as `.mjs`.
- Load the page in a browser (or Playwright), open the main menu and the game you changed, and make sure the console shows no errors.
- If you touch `firestore.rules`, run `tests/firestore-rules.test.mjs` against the Firebase emulator (see the header of that file).

**Style and rules.**
- Vanilla JavaScript, no framework or bundler. Keep the single-file-per-game structure.
- `app.js` has very long lines and an embedded image data; search with `grep -n` instead of opening the whole file.
- Every release bumps the version: `APP_VER` in `app.js` and `CACHE` in `sw.js` must change together (patch for small changes), otherwise installed apps will not update. Also update "Aktuális verzió" in `README.hu.md`.
- Game balance (damage, wave strength) is tuned from player feedback; please open an issue before changing it.
- The UI language is Hungarian.

**Pull request flow.** Fork, create a branch, make a small focused change, open a PR with a short description of what and why (screenshots help for visual changes).

## Magyar

Köszönjük az érdeklődést! Hibajelentést, ötletet és pull requestet is szívesen fogadunk.

**Helyi futtatás.** Nincs build lépés. Szolgáld ki a mappát HTTP-n:

```bash
python3 -m http.server 8080   # majd http://localhost:8080
```

**Ellenőrzés PR előtt.**
- Szintaxis: `cp app.js /tmp/app.mjs && node --check /tmp/app.mjs` (ugyanígy `sr.js`, `sere.js`, `lv.js`, `sw.js`). Az `app.js` ES modul, ezért `.mjs`-ként ellenőrizd.
- Töltsd be az oldalt böngészőben (vagy Playwrighttal), nyisd meg a főmenüt és a módosított játékot, a konzolon ne legyen hiba.
- A `firestore.rules` módosításakor futtasd a `tests/firestore-rules.test.mjs`-t a Firebase emulátoron (lásd a fájl elejét).

**Stílus és szabályok.**
- Vanilla JavaScript, keretrendszer és bundler nélkül.
- Az `app.js` nagyon hosszú sorokat és beágyazott képet tartalmaz: `grep -n`-nel keress, ne nyisd meg egészben.
- Minden változtatásnál lépteted a verziót: az `app.js` `APP_VER` és a `sw.js` `CACHE` együtt (kisebb módosításnál patch), különben a telepített app nem frissül. A `README.hu.md` „Aktuális verzió” sorát is írd át.
- A játékegyensúlyt (sebzés, hullámerősség) a játékosok visszajelzése alapján hangoljuk; módosítás előtt nyiss issue-t.
- A felület nyelve magyar.

**PR menete.** Fork, saját ág, kicsi és célzott módosítás, PR rövid leírással (látványos változásnál képernyőkép).
