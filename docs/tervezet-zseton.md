# Tervezet: legyen értelme a zsetonnak

**Állapot:** elemzés és javaslat. Ebből a 4.44.0-ban csak a zavaró „+1 zseton” toast helyett bevezetett kis sarokjelzés készült el. A többi pont döntésre vár.
**Készült:** 2026-11-18, a 4.44.0 mellé.

---

## 1. Hogyan működik most (4.42–4.44)

| | Mennyi | Megjegyzés |
|---|---|---|
| **Kezdő egyenleg** | 10 zseton | új játékos |
| **Bevétel – játékidő** | 1 zseton / aktív perc | bármelyik játék, a Derby kivételével |
| **Bevétel – Kassza-kivét** | napi legfeljebb 20 | a zseb nagyságrendje szerint (1 milliárd Ft ≈ 5, 1 kvadrillió = 20) |
| **Bevétel – érmeverő** | 100 koppintás = 3 | csak 0 zsetonnál, naponta 3× |
| **Kiadás – játékindítás** | 1 zseton | a Derbybe a belépés ingyenes |
| **Kiadás – Derby-tét** | 1–50 / futam | megtérülés 90–97% → lassú elfolyás |
| **Szerverkorlát** | növekedés percenként legfeljebb 1 | csökkenést bármikor elfogad (`firestore.rules`, `zsOk`) |

## 2. Miért nincs most értelme

1. **A bevétel mindig nagyobb a kiadásnál.** Egy 1 percnél hosszabb menet már visszahozza a saját indítási díját. A legtöbb menet ennél hosszabb, így az egyenleg csak nő.
2. **A Kassza-kivét tiszta többlet.** Napi +20 zseton, amelyet semmi nem ellensúlyoz.
3. **Nincs mire költeni.** A játékindításon és a Derbyn kívül a zseton semmit nem vesz meg. Néhány nap után a szám már nem jelent semmit, nincs mire gyűjteni.
4. **Az egyetlen igazi elfolyás a Derby.** Ez csak azokat érinti, akik fogadnak.

**Példa:** napi 30 perc játék 10 menetben: +30 (idő) + legfeljebb 20 (Kassza) − 10 (indítás) = **+40 zseton naponta**. Egy hét után kb. 300 zseton gyűlik össze, és nincs mire elkölteni.

A 4.43-ig a rendszer leglátványosabb része a percenként felugró toast volt, ami ráadásul zavart. Ez a 4.44.0-ban egy kis, kattinthatatlan jelzésre cserélődött a fejléc bal sarkában (`walPip`).

## 3. Fejlesztési irányok

### A) Zseton-bolt: legyen mire költeni (ajánlott, 1. lépés)
A meglévő játékelemeket lehet zsetonért megvenni. A szerverszabályon nem kell változtatni, mert a költés csak csökkenti a `zs`-t.

| Mit | Ár (javaslat) | Hol | Miért jó |
|---|---|---|---|
| Extra 💸 pénz-gépágyú | 15 zseton, napi max. 3 | Tüzér Kassza | a 4.44-es újdonságra épül, azonnal érezhető |
| Golden Ticket (15 mp dupla bevétel) | 8 zseton | Tüzér Kassza | már létező mechanika |
| Folytatás vereség után (+1 élet / pajzs) | 3–5 zseton | H.A.R.C., DroneRun, Shot&Run | a rekordhajszában ér a legtöbbet |
| Kiszabadítás büntetés nélkül | 2 zseton | Gidrán Terep | a +10 s helyett |
| Kozmetika: üteg-zászló, löveg-festés, profilkeret | 20–100 zseton | profil, ranglista | látszik mások előtt, hosszú távú cél |

A ranglistás játékokban a „folytatás” a rekord értékét is érinti. Ezért vagy csak egy folytatás engedhető menetenként, vagy a folytatásos menet nem kerülhet a ranglistára.

### B) Tagsági fokozat: a gyűjtésnek legyen iránya (2. lépés)
Az **összesen elköltött** zseton alapján nő a fokozat: Bronz (100) → Ezüst (500) → Arany (2 000) → Gyémánt (10 000). Mindegyik kis, tartós előnyt ad, például:
- Kassza: +5% koppintásérték fokozatonként;
- a pénz-gépágyú gyakrabban jön (60 → 50 → 40 perc);
- naponta +1 érmeverő-mentés;
- jelvény a ranglistán a név mellett.

Ha a fokozatot a fiókba is mentjük, kell hozzá egy új mező (`zsSpent`), amely a szerverszabály szerint csak nőhet, és csak annyival, amennyivel a `zs` ugyanabban a mentésben csökkent. Csak a telefonon tárolva szabálymódosítás nélkül megoldható.

### C) A bevétel újrahangolása (opcionális)
A bolt nélkül ez egymagában csak bosszantaná a játékosokat, ezért csak az A) után érdemes megcsinálni.
- A játékidőért járó zsetonra napi plafon (pl. 30 / nap). Így a Kassza-kivét és a Derby is számít.
- Vagy menetenként adjuk, teljesítményhez kötve (pl. „a rekordod 50%-a felett +2 zseton”), az idő helyett. Így az ügyesség számít, nem az ülve töltött perc.

### D) Amit nem javaslunk
- **Zseton-ranglista:** a puszta gyűjtögetést jutalmazná, nem a játékot.
- **Valódi pénzes vásárlás:** jogilag és erkölcsileg is más terület (lásd a Derby-tervezet 8. pontját).

## 4. Javasolt sorrend

1. **Zseton-bolt a Kasszában** (extra gépágyú, Golden Ticket). Kicsi munka, a szerverszabály nem változik.
2. **Folytatás** a H.A.R.C.-ban, a DroneRunban és a Shot&Runban, egy folytatással menetenként.
3. **Tagsági fokozat** helyben, később a fiókba mentve (`zsSpent`).
4. Ha ezután is túl sok zseton gyűlik: **napi plafon** a játékidős bevételre.

**Döntendő:** az árak; ér-e a folytatásos menet ranglistahelyet; kell-e a fokozat a fiókba (szabálymódosítással).
