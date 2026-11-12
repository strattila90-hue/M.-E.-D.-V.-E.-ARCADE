// M.E.D.V.E. Arcade – sere.js modul (az app.js tölti be lustán, amikor először kell). A közös segédeket az app.js-ből veszi át.
import {$,AC,D_WHEELS,LOWFX,MASTER,NOISE,PBY,PCX,PK,ROCK,S,SONGS,SOUND,USERDOC,V,ac,boom,drBarrelImg,drBodyImg,esc,gBoard,gSave,ic,medveWrap,n0,pad,playCount,rkRadioSnd,rockStart,rockStop,rockTempo,seFmt,seH,snare,sndBoom,sndPing,sndThud,st,toast} from './app.js';
/* ===== SERE KITÖRÉS (6. játék): 1. nap Alpha-küldetések, 2. naptól Bravo (kitérés), Charlie (fogság, kimentés); erdei hangkép, feszültségzene csak veszélyben ===== */
const SE={};
const SE_DAY=56;// egy nap hossza másodpercben (2. naptól)
const SE_QA=[
 ['Eltévedtél, sötétedik, hideg van. Mi az első?',['Menedék a szél és a hideg ellen','Továbbmész a sötétben','Nagy tüzet raksz a dombtetőn'],'Zord időben a kihűlés gyorsabban végez, mint a szomjúság vagy az éhség.'],
 ['Mi nélkül halsz meg a leghamarabb zord időben?',['Menedék nélkül','Élelem nélkül','Víz nélkül'],'3-as szabály: 3 perc levegő, 3 óra menedék zord időben, 3 nap víz, 3 hét élelem.'],
 ['Patakvizet találtál. Mit teszel vele?',['Felforralod vagy fertőtleníted','Rögtön iszol, ha tisztának látszik','Csak éjjel iszol belőle'],'A tisztának látszó víz is lehet fertőzött – a hasmenés gyorsan kiszárít.'],
 ['Délben merre van észak (északi félteke)?',['Amerre az árnyékod mutat','A Nap felé','Ahol a fán moha van'],'Délben a Nap délen áll, az árnyék északra mutat. A moha nem megbízható.'],
 ['Éjjel mi alapján találod meg az északot?',['Sarkcsillag (Göncölszekér hátsó két csillaga ötször)','A Hold mindig északon van','A legfényesebb csillag'],'A Göncölszekér két hátsó csillagának távolságát ötször felmérve a Sarkcsillaghoz jutsz.'],
 ['Ismeretlen bogyót találsz. Megeszed?',['Nem, ha nem ismered biztosan','Igen, ha a madarak is eszik','Csak egy keveset'],'Sok mérgező bogyót a madarak gond nélkül megesznek.'],
 ['Erősen vérzik a lábad. Mi az első?',['Erős, közvetlen nyomás a sebre','Hagyod, majd eláll','Vizet öntesz rá és mész tovább'],'Közvetlen nyomás; ha végtag és nem áll el, érszorító a seb fölé.'],
 ['Átáztál, fúj a szél. Mit teszel?',['Kicsavarod, rétegeket cserélsz, szélárnyékba mész','Rajtad hagyod, majd megszárad','Leveszed az összeset'],'A vizes ruha sokszorosan gyorsabban hűt – a kihűlés alattomos.'],
 ['Hova NE építs menedéket?',['Patakmederbe, vízmosásba','Sűrű bozótba','Szélvédett lejtőre'],'Hirtelen ár jöhet, és a mélyedésekben gyűlik a hideg levegő.'],
 ['Kitérés közben tüzet raksz. Mire figyelsz?',['Kicsi, takart, füstmentes tűz, rövid ideig','Nagy tűz, hogy jobban melegítsen','Dombtetőn, hogy lásd a környéket'],'A tűz fénye és füstje kilométerekre elárul.'],
 ['Kevés a vized. Hogyan iszol?',['Rendszeresen, kis kortyokban','Csak ha már nagyon szomjas vagy','Amíg bírod, egyáltalán nem'],'A víz a testedben ér többet, nem a kulacsban.'],
 ['Mi a legjobb álcázás nappal?',['Árnyékban maradni, az alakot és a csillogást megtörni','Nyílt terepen gyorsan átfutni','Világos ruha'],'Az alak, árnyék, csillogás és mozgás árul el a leggyorsabban.'],
 ['Miért inkább éjjel mozogsz kitéréskor?',['Nehezebb észrevenni','Melegebb van','Éjjel nincs járőr'],'A sötétség takar – de a hőkamerás drón ellen bokor vagy víz kell.'],
 ['Hogyan nem hagysz nyomot?',['Kemény talajon, kövön, patakban haladsz','Sárban futsz','Letöröd az ágakat magad mögött'],'A kutya és a nyomolvasó a talajt és a szagot követi.'],
 ['Mikor jelezz a mentő helikopternek?',['Amikor látod vagy hallod a gépet','Egész nap folyamatosan','Soha, megvárod, míg leszáll'],'A korai jelzés csak az ellenségnek árulja el, hol vagy.'],
 ['A kihűlés (hipotermia) egyik jele:',['Remegés, zavartság, akadozó beszéd','Izzadás','Kipirult arc'],'Ha a remegés megszűnik, az már súlyos állapot.'],
 ['Kígyó mart meg. Mit teszel?',['Nyugalom, a végtagot rögzíted, segítséget kérsz','Kiszívod a mérget','Bevágod a sebet'],'A kiszívás és a bevágás többet árt, mint használ.'],
 ['Hó van, nincs vized. Eszed a havat?',['Inkább előbb megolvasztod','Igen, sokat','Az a legtisztább víz'],'A hó evése kihűt és energiát visz el.'],
 ['Hol pihensz kitérés közben?',['Sűrű takarásban, utaktól és falutól távol','Út melletti árokban','Elhagyott házban a faluban'],'Az utak, házak és hidak mentén járnak a járőrök.'],
 ['Mi az EPA (Evasion Plan of Action)?',['Előre megtervezett kitérési terv','Elsősegélycsomag','Egy rádiótípus'],'Útvonal, rejtekhelyek, jelzések és kimentési pontok – még bevetés előtt.'],
 ['Fáradt vagy és szomjas. Mi a fontosabb?',['A víz','Az élelem','Az alvás'],'Víz nélkül pár nap alatt összeomlik a szervezet.'],
 ['Tükörrel jelzel. Hogyan célzol?',['Kinyújtott kézzel V-t formálsz, és a fényfoltot a célra vezeted','Vakon villogtatsz','Csak éjjel működik'],'Napos időben egy jelzőtükör villanása kilométerekről látszik.'],
 ['Melyik a kihűlés korai jele?',['Erős didergés, ügyetlen kéz, lassuló gondolkodás','Kipirult, forró bőr','Csak az erős szomjúság'],'Didergés és ügyetlenség az első jel – ekkor kell menedék, száraz ruha, meleg.'],
 ['Nappal, napsütésben hogyan jelzel a kimentő helikopternek?',['Jelzőtükörrel villantasz felé','Síppal','Zseblámpával'],'A tükör villanása kilométerekről látszik, és szinte nem fogy energiád.'],
 ['Hogyan add le a vészjelet síppal?',['Hármas csoportokban, szünetekkel ismételve','Egy hosszú sípszóval','Folyamatos sípolással, amíg bírod'],'A hármas jelcsoport (sípszó, villanás, tűz) nemzetközileg vészjelzésnek számít.'],
 ['Hol NE verj tábort?',['Kiszáradt patakmederben, völgy alján','Szélvédett, kissé kiemelt, takart helyen','Sűrű növényzet takarásában'],'A mederben hirtelen ár jöhet, a völgy aljára éjjel lefolyik a hideg levegő.'],
 ['Hogyan találod meg a Sarkcsillagot?',['A Göncölszekér hátsó két csillagát kb. ötszörösen meghosszabbítod','Ez a legfényesebb csillag az égen','Mindig keleten kel fel'],'A Sarkcsillag nem a legfényesebb, de szinte pontosan északon áll.'],
 ['Megbízható a „moha az északi oldalon nő” szabály?',['Nem – a moha a nedvességet és árnyékot követi','Igen, mindig','Csak télen'],'Erdőben a moha bármelyik oldalon nőhet – iránytű, Nap, csillagok a biztosak.'],
 ['Erős vérzés a karon. Mi az első lépés?',['Erős, közvetlen nyomás a sebre','Kimosod alkohollal','Megvárod, hátha eláll'],'Nyomás, nyomókötés – ha életveszélyes végtagvérzés, érszorító a seb fölé.'],
 ['Nagyon kevés a vized. Mit egyél?',['Keveset, és a fehérjedús ételt kerüld','Sokat, hogy legyen erőd','Sós ételt'],'Az emésztés – főleg a fehérjéé – vizet von el a szervezettől.'],
 ['Hidegben menetelsz, izzadni kezdesz. Mit teszel?',['Lassítasz, leveszel egy réteget','Semmit, a meleg jó','Még gyorsabban mész, hogy átérj'],'A nedves ruha megállás után gyorsan kihűt – az izzadást kerülni kell.'],
 ['Hogyan őrzöd meg az éjszakai látásodat?',['Piros fényt használsz, nem nézel erős fénybe','Fehér zseblámpával világítasz','Belebámulsz a tűzbe'],'A szem sötéthez szokása kb. 20-30 perc – egy fehér villanás lenullázza.'],
 ['Nincs más víz, csak hó. Mit teszel?',['Előbb megolvasztod, nem eszed a havat','Eszed a havat, ugyanúgy itat','Sóval keverve eszed'],'A hó evése elvonja a testhőt és kevés vizet ad – olvaszd meg, ha tudod, forrald.'],
 ['Hogyan lépsz csendben avarban, éjjel?',['Lassan, a talp külső élét letéve, előbb tapogatva','Gyorsan, hogy minél előbb átérj','Nagy léptekkel, sarokra érkezve'],'A tapogató lépéssel a reccsenő ágat még terhelés előtt megérzed.'],
 ['Nyílt terepen kell átkelned nappal. Hogyan?',['Takarástól takarásig, a gerincvonalat kerülve','A dombgerincen, onnan messze látsz','Egyenesen, a tisztás közepén'],'A gerincen az égbolt előtt a sziluetted messziről látszik.'],
 ['Kullancsot találsz a bőrödön. Hogyan távolítod el?',['Csipesszel a bőrhöz közel fogva, egyenletesen kihúzva','Olajjal lekenve megvárod, míg kimászik','Kiégeted'],'Az olaj és az égetés miatt a kullancs a kórokozókat a sebbe ürítheti.'],
 ['Mit tegyél a hátizsák helyett a zsebedbe?',['A túléléshez nélkülözhetetlent: kés, tűzgyújtó, tükör, iránytű','Semmit, minden a zsákban legyen','A tartalék ruhát'],'Ha a zsákot el kell dobnod menekülés közben, a legfontosabb akkor is nálad marad.']];
// Charlie – helyes magatartás fogságban (nyilvános alapelvek, III. genfi egyezmény)
const SE_CAP=[
 ['Kihallgatnak. Mit kell megadnod?',['Név, rendfokozat, szolgálati szám, születési dátum','Az egységed helyét','A bevetés célját'],'A III. genfi egyezmény szerint ennyit – és nem többet.'],
 ['Nyilatkozatot kérnek „a jó bánásmódról”. Aláírod?',['Nem írsz alá semmilyen nyilatkozatot','Aláírod, ha cserébe enni adnak','Aláírod, ha csak ennyi kell'],'Bármilyen aláírt szöveget propagandára használhatnak.'],
 ['Külön előnyt kínálnak, ha elválsz a társaidtól. Elfogadod?',['Nem fogadsz el különleges bánásmódot','Elfogadod','Alkudozol'],'A megosztás a fogolycsoport ellen fordítható.'],
 ['Hogyan viselkedsz a fogolytársaiddal?',['Összetartotok, segítitek egymást, a rangidős vezet','Mindenki magáért','Kerülöd őket'],'Az egység a legerősebb védelem.'],
 ['Mikor a legjobb esély a szökésre?',['Közvetlenül az elfogás után, mielőtt mélyebbre visznek','Hetekkel később','Soha nem érdemes'],'Az elfogás utáni zűrzavarban még ismerős a terep és közel vannak a saját erők.'],
 ['Megsebesültél, fogoly vagy. Mi illet meg?',['Orvosi ellátás','Semmi','Csak ha beszélsz'],'A sebesült hadifogolynak a genfi egyezmény szerint ellátás jár.'],
 ['Mi a cél fogságban?',['Visszatérni – tisztességgel','Mindent elmondani, hogy elengedjenek','Feladni'],'A túlélés és a becsület együtt.'],
 ['Azt mondják, a társad már mindent elmondott. Mit teszel?',['Ugyanúgy csak a négy adatot adod meg','Akkor te is elmondod','Kijavítod, amit rosszul mondott'],'Ez klasszikus nyomásgyakorlás – lehet, hogy nem is igaz.']];
const _sb=0;
// ---- „Tudtad?” adatbázis (offline): valós történetek, tévhitek, katonai és túlélési tippek ----
// [kategória, cím, szöveg, ítélet(opcionális)]  kategóriák: igaz, tipp, katonai, atom, bear, kamu
const SE_FCAT={igaz:['✅','Igaz történet','#9dff9d'],tipp:['🧭','Túlélőtipp','#9fd8ff'],katonai:['🎖️','Katonai tipp','#f3d77a'],atom:['☢️','Atomháború esetén','#ffb36b'],bear:['🎬','Bear Grylls','#e0b8ff'],kamu:['❌','Tévhit / kamu','#ff8a7a']};
const SE_FACTS=[
 ['igaz','A szemével pislogta: TORTURE','Jeremiah Denton amerikai haditengerész-pilóta 1966-ban vietnámi fogságban kényszerített tévéinterjút adott. Közben a szemével Morse-jeleket pislogott: T-O-R-T-U-R-E. Ebből tudták meg először biztosan, hogy kínozzák a foglyokat.'],
 ['igaz','Kopogókód a „Hanoi Hiltonban”','Az amerikai hadifoglyok Vietnámban egy 5×5-ös betűtáblán alapuló kopogókóddal tartották a kapcsolatot falon át (a K-t a C helyettesítette). Évekig így adták tovább a híreket és a lelkierőt – a játék cellájában is ezt gyakorolod.'],
 ['igaz','Onoda Hiroo: 29 év a dzsungelben','A japán hírszerző tiszt a Fülöp-szigeteki Lubang dzsungelében egészen 1974-ig folytatta a harcot, mert nem hitte el, hogy a háború 1945-ben véget ért. Csak akkor tette le a fegyvert, amikor egykori parancsnoka személyesen felmentette a parancs alól.'],
 ['igaz','Scott O’Grady – 6 nap Boszniában','1995-ben lelőtték az F-16-osát. Hat napig bujkált: nappal mozdulatlanul feküdt a fedezékben, éjjel mozgott, rovarokat és leveleket evett, esővizet gyűjtött. Az amerikai tengerészgyalogosok helikopterrel mentették ki.'],
 ['igaz','Juliane Koepcke és a patak','1971-ben 17 évesen egyedül élte túl egy repülőgép lezuhanását a perui esőerdőben. Apja tanácsát követte: a patakot követte lefelé, mert a víz mentén előbb-utóbb emberek élnek. 11 nap után favágók találtak rá.'],
 ['igaz','Golfpálya-kód (Bat 21, 1972)','Iceal Hambleton amerikai navigátort lelőtték Vietnámban; 11 és fél napig bujkált. A mentők rádión egy általa jól ismert golfpálya lyukainak hosszával kódolták az útvonalát, hogy az ellenség ne értse.'],
 ['igaz','A „Nagy szökés” (1944)','A Stalag Luft III fogolytáborból 76 hadifogoly szökött meg a „Harry” nevű alagúton át (a másik kettő „Tom” és „Dick” volt). Csak hárman jutottak haza; a visszafogottak közül ötvenet kivégeztek.'],
 ['igaz','Wojtek, a katonamedve','A II. világháborúban a lengyel 2. hadtest egyik ellátó századába egy barna medvebocs került. Hivatalosan „besorozták”, és a történetek szerint Monte Cassinónál lőszeresládákat cipelt. A M.E.D.V.E. névnek is van múltja!'],
 ['igaz','Dieter Dengler szökése','Az amerikai haditengerész-pilóta 1966-ban laoszi fogságba esett, megszökött, és hetekig vándorolt a dzsungelben, mire egy pilóta észrevette és kimentették. Történetéből film is készült (Mentőakció Vietnamban / Rescue Dawn).'],
 ['bear','Eltört gerinccel az Everestre','Bear Grylls 1996-ban egy ejtőernyős balesetben három csigolyáját törte. Két évvel később, 23 évesen feljutott a Mount Everestre. Előtte a brit SAS tartalékos alakulatánál (21 SAS) szolgált.'],
 ['bear','A műsor nem mindig volt „vad”','2007-ben kiderült, hogy a Man vs. Wild (Ember vs. vadon) egyes epizódjainál a forgatás szüneteiben időnként szálláson aludt, és egyes jeleneteket megrendeztek. A csatorna ezután figyelmeztetést tett az adások elé.','Igaz, de…'],
 ['bear','Vizeletet inni?','Bear Grylls több műsorban is ivott vizeletet. A katonai túlélési kézikönyvek kifejezetten azt írják: ne idd meg! Sót és bomlástermékeket tartalmaz, a kiszáradást inkább rontja.','KAMU'],
 ['bear','Nyers állat a műsorban','A tévében látványos, de a valódi túlélésben a nyers hús és a bélsár közeli belsőség fertőzésveszélyes. Ha teheted, főzd meg – a tűz a legfontosabb túlélő eszköz.'],
 ['kamu','„Szívd ki a kígyómérget!”','Nem segít, csak a szádon át is mérgezhet és fertőzést okozhat. Helyesen: nyugalom, a végtag rögzítése, ékszer levétele, és mielőbb orvos.','KAMU'],
 ['kamu','„Medúzacsípésre pisilj rá!”','Nem enyhít, sőt egyes fajoknál további csalánsejteket aktiválhat. Ecet vagy tengervíz, a csápok óvatos eltávolítása – és nem dörzsölés.','KAMU'],
 ['kamu','„A fagyott bőrt dörzsöld hóval!”','A dörzsölés tovább roncsolja a fagyott szöveteket. Helyesen: lassú felmelegítés testmeleggel (pl. hónaljban), és ha újrafagyhat, inkább ne olvaszd fel.','KAMU'],
 ['kamu','„Egy korty pálinka felmelegít”','Csak a bőr érzi melegnek: az alkohol kitágítja a bőr ereit, így a test gyorsabban veszít hőt. Hidegben az alkohol kihűléshez vezethet.','KAMU'],
 ['kamu','„A moha mindig északon nő”','A moha a nedvességet és az árnyékot követi – erdőben bármelyik oldalon nőhet. A fák évgyűrűi sem mutatnak megbízhatóan irányt. Nap, csillagok, iránytű!','TÉVHIT'],
 ['kamu','„Hűtőszekrényben túléled az atomrobbanást”','Az Indiana Jones-film jelenete fizikailag lehetetlen: a lökéshullám és a hő a hűtővel együtt megsemmisítené az embert.','KAMU'],
 ['kamu','„Csak a csótányok élik túl az atomháborút”','Félig igaz: a csótányok sokkal jobban tűrik a sugárzást, mint az ember (a MythBusters kísérletében is többen túlélték a nagy dózist), de az igazán nagy dózis őket is megöli.','FÉLIG IGAZ'],
 ['kamu','„A kaktusz belsejéből vizet ihatsz”','A legtöbb kaktusz nedve keserű, savas, hányást és hasmenést okozhat – így inkább vizet veszítesz. Sivatagban nappal árnyékban pihenj, éjjel mozogj.','KAMU'],
 ['kamu','„A hangtompítós pisztoly szinte néma”','A filmekkel ellentétben a hangtompító csak csökkenti a durranást; egy tompított lövés is nagyon hangos marad, messziről hallható.','KAMU'],
 ['kamu','„A kézigránát nagy tűzgömbbel robban”','A repeszgránát fő hatása a repesz és a lökéshullám; a filmes tűzgömb látványelem. A valóságban inkább villanás, füst és por.','KAMU'],
 ['kamu','„Ha eltévedtél, siess, hogy kiérj”','A pánikszerű rohanás a leggyakoribb hiba: kimerülsz, izzadsz, rossz irányba mész. STOP: állj meg, gondold át, figyelj, tervezz.','KAMU'],
 ['tipp','A 3-as szabály','Nagyjából: 3 perc levegő nélkül, 3 óra menedék nélkül zord időben, 3 nap víz nélkül, 3 hét élelem nélkül. Ebből a sorrend is következik: menedék, víz, tűz, élelem.'],
 ['tipp','Kövesd a vizet lefelé','Ha eltévedtél lakott területen kívül, a patakok és folyók lefelé haladva előbb-utóbb utakhoz, házakhoz vezetnek. (A kitérésnél viszont épp ezért ott is járőröznek!)'],
 ['tipp','Víz forralása','A forralás a legbiztosabb fertőtlenítés: ha a víz lobogva forr, a kórokozók nagy része elpusztul. Zavaros vizet előbb ruhán, homokon szűrj át.'],
 ['tipp','Hőveszteség a földön','A hideg talaj gyorsan elvonja a testhőt. Mindig tegyél magad alá avart, ágakat, hátizsákot – fontosabb, mint a takaró a tetején.'],
 ['tipp','Irány az órával','Északi féltekén: a kismutatót a Nap felé fordítod; a kismutató és a 12-es közti szög felezője nagyjából délre mutat (nyári időszámításnál az 1-est vedd 12 helyett).'],
 ['tipp','Sarkcsillag','A Göncölszekér két „hátsó” csillagát kb. ötszörösen meghosszabbítva éred el a Sarkcsillagot – ez szinte pontosan északon áll.'],
 ['tipp','Tűz: tapló → gyújtós → tűzifa','Ne a vastag fával kezdd! Száraz fű, nyírfakéreg, vazelinos vatta fogja meg a szikrát, utána ceruzányi gallyak, majd csuklóvastag fa.'],
 ['katonai','Az álcázás jelei','Ami elárul: alak, árnyék, fénylés, sziluett, szín, távolság (a szabályos elrendezés) – és mindenekelőtt a mozgás. Ha figyelnek, a mozdulatlanság a legjobb álcázás.'],
 ['katonai','Fényfegyelem','Éjjel egy cigaretta parazsa vagy egy mobil kijelzője meglepően messziről látszik. Piros szűrős lámpa, takarás, és soha ne világíts a nyílt terepen.'],
 ['katonai','Hangfegyelem – ugrálópróba','Indulás előtt ugorj egyet: ami csörög, csattog, azt rögzítsd ragasztószalaggal, gumival. Éjjel a hang sokkal messzebbre jut.'],
 ['katonai','Éjszakai látás: nézz mellé!','Sötétben a szem pálcikái a látómező szélén érzékenyebbek. Ha egy tárgyat akarsz látni, kissé mellé nézz, és lassan pásztázz.'],
 ['katonai','Négy adat – nem több','A III. genfi egyezmény szerint a hadifogoly csak a nevét, rendfokozatát, születési dátumát és szolgálati / azonosító számát köteles megadni.'],
 ['katonai','ISOPREP – csak te tudod','A mentőerők előre kitöltött, személyes hitelesítő adatok (ISOPREP) alapján ellenőrzik, hogy tényleg az elveszett katonát veszik-e fel – nem egy csapdát.'],
 ['katonai','MGRS – a NATO térképnyelve','A katonai koordináta: zóna (pl. 33T), 100 km-es négyzet (két betű), majd keleti és északi érték. 5+5 számjegy = 1 méteres pontosság. Rádión a 9-et „niner”-nek mondják.'],
 ['katonai','Rádión röviden','Rádión minimális ideig forgalmazz: minden adás bemérhető. Előre írd le, mit mondasz; az eljárási szavak (OVER, OUT, SAY AGAIN, ROGER) időt spórolnak.'],
 ['katonai','Jelzőtükör','Tiszta időben egy jelzőtükör villanása több mint 10 km-ről is látszhat – messzebbről, mint egy kiabálás vagy egy lámpa nappal.'],
 ['atom','Menj be, maradj bent, figyeld a híreket','Nukleáris robbanás esetén a katasztrófavédelmi ajánlás: azonnal egy szilárd épület belsejébe, és ott maradni legalább 24 óráig, amíg a hatóság mást nem mond.'],
 ['atom','A 7–10-es szabály','A radioaktív kihullás sugárzása gyorsan csökken: nagyjából 7 óra alatt a tizedére, 49 óra (kb. 2 nap) alatt a századára. Az első órák a legveszélyesebbek.'],
 ['atom','Pince, épület közepe','Minél több fal, beton, föld van közted és a kinti por között, annál jobb. Pince vagy egy nagy épület középső része sokkal többet véd, mint egy autó vagy faház.'],
 ['atom','Ha a por rád hullott','Vedd le a külső ruhádat (a szennyeződés nagy része így eltávolítható), zacskózd be, zuhanyozz szappannal, samponnal – hajbalzsamot ne használj, mert a hajhoz köti a port.'],
 ['atom','Jódtabletta – csak a pajzsmirigynek','A kálium-jodid csak a pajzsmirigyet védi a radioaktív jódtól, más sugárzás ellen nem véd. Csak hatósági utasításra szedd.'],
 ['atom','Villanás: hasra, fedezékbe!','Ha vakító villanást látsz, ne nézz oda: azonnal feküdj le, takard a fejed, bújj fedezékbe. A lökéshullám a távolságtól függően másodpercekkel később érkezik.']];
const seBest=()=>{try{return Number(localStorage.getItem('medve-sere-best')||0)}catch(e){return 0}};
const seShuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const SE_TUTKEY='medve-sere-tut5',SE_DD=.95;// árokmélység (m)
const SE_TUT=[
  ['👆 Koppints oda, ahová menni akarsz','A katona odasétál és megáll. Koppints a 🚩 zászló mellé! (Gyors dupla koppintás: futás – de az zajos.)','tap'],
  ['🪨 Fedezék: koppints a sziklára','Odamegy, és mögé guggol – a túloldali őr így nem lát. Koppints a nagy sziklára!','tap'],
  ['🪵 Akadályok: koppints mögéjük','A farönkön magától átlép, a kidőlt fa alatt lefekszik és átkúszik. Koppints messze a kidőlt fa mögé!','tap'],
  ['🕳️ Árok: bújj el benne','Koppints az árokra: belemegy és lefekszik – a lámpa sem lát. Aztán koppints túlra: kimászik.','tap'],
  ['🔦 Őr: várd ki a pillanatot','Koppints a bokorra: elbújsz benne. Amikor a járőr elfordul (💬), koppints messze előre!','tap'],
  ['🧎 Mozgásmód: guggolás','Lent a gombok a mozgásmódot váltják. Nyomd a 🧎 GUGGOLÁS gombot, és koppints előre: halkan lopakodsz.','crouch'],
  ['💧 Gyűjts készletet','Koppints a tárgyakra – odamész és felveszed. A magasan lógót felnyúlva is eléred.','tap']];
// ---- vezérlés: 6 dedikált gomb ----
const SE_PAD=[['walk','🚶','SÉTA'],['stop','🛑','ÁLLJ'],['crouch','🧎','GUGGOLÁS'],['prone','🛌','FEKVÉS'],['crawl','🐛','KÚSZÁS'],['back','↩️','HÁTRA']];
function seCmd(k){if(SE.phase!=='play'||SE.paused||SE.amb||SE.vault)return;const P=SE.post;if(k!=='crouch')SE.tgt=null;if(k!=='crouch'&&k!=='prone')SE.cover=null;SE.prePost=null;
  if(k==='walk'){if(P==='prone')SE.post='stand';SE.mv=SE.mv===1&&SE.post==='stand'?2:1;if(SE.mv===2)sePop('🏃 Futás','#ffe08a')}
  else if(k==='stop'){SE.mv=0;SE.post='stand'}
  else if(k==='crouch'){if(P==='crouch')SE.post='stand';else{SE.post='crouch';if(P==='prone')SE.mv=0;if(SE.mv===2)SE.mv=1}}
  else if(k==='prone'){SE.post='prone';SE.mv=0}
  else if(k==='crawl'){SE.post='prone';SE.mv=1}
  else if(k==='back'){SE.mv=-1}
  SE.padK='';if(navigator.vibrate)try{navigator.vibrate(12)}catch(e){}}
function sePadSync(){const p=SE.pad;if(!p)return;const show=SE.phase==='play'&&!SE.paused,k=[show,SE.mv,SE.post,SE.padHint].join();if(SE.padK===k)return;SE.padK=k;p.hidden=!show;
  const on={walk:(SE.mv>0||SE.tgt&&SE.tgt.x>SE.x)&&SE.post!=='prone',stop:SE.mv===0&&SE.post==='stand',crouch:SE.post==='crouch',prone:SE.post==='prone'&&SE.mv===0,crawl:SE.post==='prone'&&SE.mv>0,back:SE.mv<0};
  p.querySelectorAll('[data-sc]').forEach(b=>{const c=b.dataset.sc;b.classList.toggle('on',!!on[c]);b.classList.toggle('hint',SE.padHint===c);if(c==='walk'){b.classList.toggle('run',SE.mv===2);b.querySelector('span').textContent=SE.mv===2?'FUTÁS':'SÉTA'}})}
const SE_LVL=d=>d===1?['ALPHA','A túlélés alapjai','Rádió, víz, tájékozódás, tűz, élelem, menedék']:d===2?['BRAVO I','Kitérés','Gyalogos őrök lámpával – fedezékről fedezékre']:d===3?['BRAVO II','Kutyák, őrtorony, utak','A kivonási pont felé…']:['KIVONÁS','Szökés után','Juss el a helikopterig hajnalra'];
// ---- Alpha küldetéslánc (1. nap) ----
const SE_AL=[
  {id:'stop',n:'Helyzetfelmérés',ic:'🧭'},{id:'comms',n:'Rádiókapcsolat (MGRS)',ic:'📻'},{id:'water',n:'Ivóvíz',ic:'💧'},{id:'nav',n:'Tájékozódás',ic:'🧭'},{id:'fire',n:'Tűzanyag',ic:'🔥'},{id:'food',n:'Élelem',ic:'🫐'},
  {id:'boar',n:'Vadállat',ic:'🐗'},{id:'aid',n:'Elsősegély',ic:'✚'},{id:'storm',n:'Vihar',ic:'⛈️'},{id:'shelter',n:'Menedék + tűz',ic:'⛺'}];
const SE_EV={
  stop:{ic:'🧭',t:'Elszakadtál az egységedtől',q:'Mi az első lépés? (STOP-szabály)',o:[['Megállsz, átgondolod, körülnézel, tervezel',1,'S-T-O-P: Stop, Think, Observe, Plan. A pánik többet árt, mint bármi más.'],['Azonnal futni kezdesz valamerre',0,'A kapkodó menekülés elvisz az utadtól és kimerít.'],['Kiabálsz segítségért',0,'Ellenséges területen ezzel elárulod magad.']]},
  water:{ic:'💧',t:'Patakhoz értél',q:'Megtöltöd a kulacsot. Még nincs tűz. Hogyan teszed ihatóvá?',o:[['Víztisztító tablettát teszel bele, és kivárod a hatóidőt',1,'Tabletta vagy forralás – a tiszta látszat semmit nem jelent.'],['Rögtön iszol, hiszen tiszta',0,'A patakvíz fertőzött lehet: hasmenés → kiszáradás.'],['Ruhán átszűröd, és kész',0,'A szűrés csak a szennyet veszi ki, a kórokozót nem.']]},
  nav:{ic:'🧭',t:'Útelágazás',q:'Délelőtt van. Nyugatra kell menned a gyülekezési pontra. Merre indulsz?',o:[['Háttal a Napnak – délelőtt keleten, délkeleten áll',1,'Délelőtt a Nap keleten-délkeleten jár, a hátad mögött hagyva nyugatra haladsz.'],['A Nap felé',0,'Délelőtt a Nap keleten van – ez éppen az ellenkező irány.'],['Amerre a moha nő a fákon',0,'A moha a nedves oldalon nő, nem megbízható iránytű.']]},
  boar:{ic:'🐗',t:'Vaddisznó koca malacokkal!',q:'Húsz méterre túrnak az ösvény mellett. Mit teszel?',o:[['Lassan, nagy ívben, széllel szemben elkerülöd',1,'A malacait védő koca támad. Nyugodt, távolságtartó kerülés a helyes.'],['Kiabálva elzavarod őket',0,'A megriasztott koca támadhat – és a zajt a járőr is hallja.'],['Közelebb mész, hogy jobban lásd',0,'Ez a legrosszabb: a koca a malacait védi.']]},
  aid:{ic:'✚',t:'Megvágtad a karod egy éles kövön',q:'A seb erősen vérzik. Mi az első?',o:[['Közvetlen nyomás, aztán nyomókötés tiszta kötszerrel',1,'Nyomás, nyomókötés; ha végtag és nem áll el, érszorító a seb fölé.'],['Földdel bekened, hogy elálljon',0,'Fertőzést okozhat – soha.'],['Nem foglalkozol vele',0,'A vérveszteség és a fertőzés gyorsan legyengít.']]},
  storm:{ic:'⛈️',t:'Zivatar közeleg, villámlik',q:'Hol vészeled át?',o:[['Sűrű, egyforma magas fák között, mélyedésben, nem fém közelében',1,'Kerüld a magányos fát, a csúcsot és a nyílt terepet.'],['Egy magányos nagy fa alatt',0,'A magányos fát gyakran éri villám.'],['A domb tetején, hogy lásd, merre megy',0,'A kiemelkedő pont a legveszélyesebb.']]},
  berry:{ic:'🔴',t:'Ismeretlen piros bogyó',q:'Éhes vagy. Megeszed?',o:[['Nem – amit nem ismerek biztosan, nem eszem meg',1,'Sok mérgező bogyót a madarak gond nélkül megesznek.'],['Igen, ha a madarak is eszik',0,'Rossz szabály – mérgező volt.'],['Csak egy keveset kóstolok',0,'Egy kevés is elég lehet a mérgezéshez.']]},
  epa:{ic:'🗺️',t:'Kitérési terv (EPA)',q:'Ellenséges területen vagy. Merre és mikor mozogsz?',o:[['Erdőn át, főleg éjjel; nappal rejtekhely; utakat, falvakat kerülöm',1,'Az EPA lényege: rejtett útvonal, rejtekhelyek, kerülendő pontok, gyülekezési helyek.'],['Az úton, mert gyorsabb',0,'Az utakon járőröznek – ott fognak el a legkönnyebben.'],['Bemegyek a faluba élelemért',0,'A lakott terület a legveszélyesebb: kutyák, szemtanúk.']]},
  camo:{ic:'🎨',t:'Álcázás',q:'Rejtekhelyen pihensz napközben. Hogyan álcázod magad?',o:[['Sár és növényzet; arc, kéz sötétítése; csillogó tárgyak takarása; az alak megtörése',1,'Alak, árnyék, csillogás, szín, mozgás – ezek árulnak el. (Ma nehezebben vesznek észre.)'],['Elég, ha mozdulatlan vagyok',0,'A csillogó óra, az arc fényessége messziről látszik.'],['Világos ruhát veszek fel, hogy beleolvadjak az égbe',0,'Ellenkezőleg: a világos szín messziről kiugrik.']]},
  track:{ic:'👣',t:'Nyomeltüntetés',q:'Kutyák a nyomodban. Mit teszel?',o:[['Patakban haladok egy darabig, utána kemény talajon lépek',1,'A víz és a kemény talaj megtöri a szagnyomot.'],['Gyorsabban futok a sárban',0,'A sár mély, jól követhető nyomot hagy.'],['Felmászok egy fára',0,'A kutya megtalálja, és ott csapdában vagy.']]},
  hide:{ic:'🏚️',t:'Nappali rejtekhely',q:'Hajnalodik. Hol töltöd a napot?',o:[['Sűrű, nem feltűnő helyen, kilátással és menekülőúttal, víz közelében',1,'A „legjobb” helyet keresik először – a jó rejtekhely nem feltűnő.'],['Elhagyott házban',0,'Az épületeket átvizsgálják.'],['Híd alatt',0,'Kézenfekvő hely – a járőrök is ismerik.']]},
  radio:{ic:'📻',t:'Rádióforgalmazás',q:'Kapcsolatba lépnél a mentőerővel. Hogyan?',o:[['Röviden, a megbeszélt időablakban, utána helyet változtatok',1,'A hosszú adást bemérik; a helyszínt el kell hagyni.'],['Hosszan elmondok mindent',0,'Bemérték az adást.'],['Folyamatosan bekapcsolva hagyom',0,'Lemerül, és bemérik.']]},
  road:{ic:'🛣️',t:'Átkelés az úton',q:'Út előtted, járművek járnak rajta. Hogyan kelsz át?',o:[['Takarásból megfigyelem, és a takart, keskeny ponton egyszerre, gyorsan átfutok',1,'Egyenesen, gyorsan, takarástól takarásig – a jármű elhaladta után.'],['Végigsétálok az úton a kanyarig',0,'Az úton mindenki lát.'],['Ott kelek át, ahol a legjobb a kilátás',0,'Ahonnan te látsz, onnan téged is látnak.']]},
  mush:{ic:'🍄',t:'Ismeretlen gomba',q:'Szép, fehér gomba a fa tövében. Megeszed?',o:[['Nem, a gombát terepen nem lehet biztosan felismerni',1,'A halálos gyilkos galóca is fehér és szép.'],['Igen, ha fehér, akkor ehető',0,'Hiba – a gyilkos galóca is fehér.'],['Megfőzöm, akkor már nem mérgező',0,'A főzés a legtöbb gombaméreget nem bontja el.']]}};
function seOpen(){const el=$('#harc');el.hidden=false;el.classList.add('rk','se');document.body.classList.add('harcon');
  el.innerHTML=`<div class="hbar"><div class="htitle">SERE <b>Kitörés</b></div><div class="hstat"><span id="seDay">☀️ 1. nap</span><span>💧<b id="seW">100</b></span><span>🍖<b id="seF">100</b></span><span>❤<b id="seHp">100</b></span></div><button class="hx sep" id="sePause" aria-label="Szünet"><b data-st="letter-spacing:-1px">❙❙</b></button><button class="hx" id="seClose" aria-label="Bezárás">✕</button></div>
   <div class="sedaybar" id="seDayBar" hidden><button type="button" class="sdbbtn" id="seBagBtn" aria-label="Hátizsák">🎒</button><div class="sdbmid"><div class="sdbgoal" id="seDbG"></div><div class="sdbchips" id="seDbC"></div><div class="sdblab"><span id="seDbL"></span><span id="seDbR"></span></div></div><button type="button" class="sdbbtn sdbfact" id="seFactBtn" aria-label="Tudtad?">💡</button><button type="button" class="sdbbtn sdbpause" id="seBarPause" aria-label="Szünet">⏸<small>SZÜNET</small></button></div>
   <div class="rkwrap" id="seWrap"><canvas id="seCv"></canvas><div class="setut" id="seTut" hidden></div><div class="rkradio" id="seRadio" hidden></div><div class="rkpop" id="sePop"></div></div>
   <div class="rktray setray" id="seTray"></div>
   <div class="sepad" id="sePad" hidden>${SE_PAD.map(([k,i,t])=>`<button type="button" data-sc="${k}" aria-label="${t}"><i>${i}</i><span>${t}</span></button>`).join('')}</div>
   <div class="hstart" id="seStart"><div class="rkhero">🌲🪖🚁</div><h3>SERE KITÖRÉS</h3><p>💥 A PzH 2000-edet kilőtték. Egyedül maradtál ellenséges területen. Vedd fel a rádiókapcsolatot, írd be a <b>kivonási pont MGRS-koordinátáját</b>, és juss el oda – Alpha, Bravo, Charlie egyetlen bevetésben (kb. 60 perc, bármikor menthető).</p>
    <div class="seabc"><div><b>💥 Kezdés: kilőtt PzH 2000</b><span>Kimászol a roncsból, rádión megkapod a kivonási pontot (MGRS) – kb. 15 km.</span></div><div><b>🅰️ 1. nap – Alpha: túlélés alapjai</b><span>Rádió, ivóvíz, tájékozódás, tűzanyag, élelem, vadállat, elsősegély, vihar – estére menedék és tűz.</span></div><div><b>🅱️ 2–3. nap – Bravo: kitérés</b><span>Gyalogos őrök lámpával, járőrök, drón, kutyák, őrtorony – fedezékről fedezékre.</span></div><div><b>🅲 Charlie: fogság, szökés</b><span>A Bravo végén elfognak: kihallgatás, cella, kopogókód – aztán szökés.</span></div><div><b>🚁 Kivonás</b><span>A szökés után el kell jutnod a kivonási pontra a H225M helikopterhez.</span></div></div>
    <p class="rk3">👆 <b>Koppints a terepre</b>: odamegy. <b>Fedezékre</b> (szikla, bokor, árok, rönk, fa) koppintva mögé bújik. Akadályon magától átlép, alatta átkúszik. Dupla koppintás: futás (zajos!). Lent a 6 gomb a mozgásmódot váltja. A pont a válaszokért, a gyűjtésért és a lopakodásért jár – a gyorsaság nem számít.</p>
    ${seContBtn()}<button type="button" class="btn pri" id="seGo">▶ Új bevetés</button> <button type="button" class="btn line" id="seFactGo">💡 Tudtad?</button> <button type="button" class="btn line" id="seTutGo">🎓 Gyakorlás</button>
    <button type="button" class="btn line rkstart" data-rank="sere">🏆 Rekordok</button>${gBoard('sereBest',false,seFmt)}</div>
   <div class="hover" id="seOver" hidden></div>`;
  $('#seClose').onclick=seClose;const cb=$('#seCont');if(cb)cb.onclick=()=>seLoad();$('#seFactGo').onclick=()=>seFacts();$('#seFactBtn').onclick=()=>{if(SE.bag==='facts')seBagClose();else seFacts()};$('#seGo').onclick=()=>{let done=false;try{done=localStorage.getItem(SE_TUTKEY)==='1'}catch(e){}done?seStart():seTutAsk()};$('#seTutGo').onclick=seTutStart;$('#sePause').onclick=()=>sePause();$('#seBarPause').onclick=()=>{if(SE.bag)seBagClose();else sePause()};$('#seBagBtn').onclick=seBag;seSetup()}
function seClose(){seSave();try{speechSynthesis.cancel()}catch(e){}seStatic(false);seCapHum(false);if(SE.up){removeEventListener('pointerup',SE.up);removeEventListener('pointercancel',SE.up)}if(SE.vis)document.removeEventListener('visibilitychange',SE.vis);saStop(.3);SE.run=false;SE.phase=null;rockStop(.3);cancelAnimationFrame(SE.raf);if(SE.key){removeEventListener('keydown',SE.key);removeEventListener('keyup',SE.key)}const el=$('#harc');el.hidden=true;el.innerHTML='';el.classList.remove('rk','se');document.body.classList.remove('harcon')}
function seSetup(){const cv=$('#seCv');SE.cv=cv;SE.c=cv.getContext('2d');seReset();SE.phase='menu';
  SE.stars=Array.from({length:110},()=>({x:Math.random(),y:Math.random()*.62,r:Math.random()*1.3+.3,p:Math.random()*6}));
  SE.clouds=Array.from({length:6},()=>({x:Math.random(),y:.06+Math.random()*.22,w:.18+Math.random()*.22,v:.004+Math.random()*.006}));
  const fit=()=>{const r=cv.getBoundingClientRect(),dpr=LOWFX?1:Math.min(2,devicePixelRatio||1);cv.width=r.width*dpr;cv.height=r.height*dpr;SE.W=r.width;SE.H=r.height;SE.dpr=dpr;SE.s=Math.max(24,Math.min(r.height/11,r.width/11))};fit();SE.fit=fit;
  const wrap=$('#seWrap'),down=e=>{if(e.target.closest&&e.target.closest('button,input,.setut'))return;e.preventDefault();saStart();if(SE.phase==='intro'&&SE.intro&&SE.intro.t>1){seIntroEnd();return}if(SE.phase==='td'){seTDTap(e);return}seTap(e)},
    up=()=>{};
  wrap.addEventListener('pointerdown',down);addEventListener('pointerup',up);addEventListener('pointercancel',up);SE.up=up;
  SE.key=e=>{if(e.target&&e.target.tagName==='INPUT')return;const dn=e.type==='keydown';if(dn&&e.key==='Escape')seClose();if(dn&&(e.key==='p'||e.key==='P'))sePause();if(dn&&(e.key==='b'||e.key==='B'))seBag();
    const km={ArrowRight:'walk',d:'walk',D:'walk',s:'stop',S:'stop',c:'crouch',C:'crouch',ArrowDown:'prone',x:'crawl',X:'crawl',ArrowLeft:'back',a:'back',A:'back'}[e.key];if(km){e.preventDefault();if(dn&&!e.repeat)seCmd(km)}};addEventListener('keydown',SE.key);addEventListener('keyup',SE.key);
  SE.dbar=$('#seDayBar');SE.dbG=$('#seDbG');SE.dbC=$('#seDbC');seFactBadge();SE.dbL=$('#seDbL');SE.dbR=$('#seDbR');SE.pad=$('#sePad');SE.pad.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-sc]');if(!b)return;e.preventDefault();saStart();seCmd(b.dataset.sc)});SE.pad.addEventListener('contextmenu',e=>e.preventDefault());
  SE.vis=()=>{if(document.hidden){seSave();if(SE.phase==='play'&&!SE.paused)sePause(true)}};document.addEventListener('visibilitychange',SE.vis);
  seTray();seHud();SE.raf=requestAnimationFrame(seLoop)}
function seReset(){Object.assign(SE,{x:0,y:0,vy:0,v:0,pr:0,fallT:0,land:0,step:0,crawlD:0,spd:4.2,day:1,tod:.03,t:0,water:100,food:100,hp:100,det:0,objs:[],genX:12,pts:0,items:0,correct:0,wrong:0,escapes:0,captures:0,extr:0,silent:0,
  inv:{tinder:0,kindling:0,wood:0,leaf:0,forage:0},al:0,alDone:{},cleanWater:false,choice:null,mg:null,climbT:0,climbFrom:null,atWall:false,inDitch:false,crawling:false,
  mv:0,post:'stand',cr:0,maxX:0,minX:null,padHint:null,padK:'',tgt:null,face:1,cover:null,prePost:null,kit:[],kitUsed:{},kitMiss:{},mre:0,radioBack:0,wx:'osz',route:'forest',buddy:false,budName:'Kovács',diSeen:[],drNext:0,anSeen:[],plSeen:[],pur:null,cin2:null,lzSafe:0,cin:null,lzK:0,tr:null,trDone:[],trQ:[],td:null,capRes:null,coverX:0,vault:null,autoP:false,sc:{},stage:1,G:null,grid:null,cm:null,kmD:15000,kmR:15000,kmX0:null,escDone:false,escTries:0,exTries:0,amb:null,intro:null,playT:0,qN:0,qOk:0,dist:0,zoom:1,noise:0,heard:0,quiz:null,nextQuiz:20,qDeck:null,qLast:-1,bag:false,dog:null,ex:null,cap:null,fx:[],seen:0,inStream:false,inBush:false,prone:false,cause:'',hudT:0,beepT:0,tut:null,paused:false,banner:null,shake:0,rain:0,
  sheltered:false,fire:false,campT:0,campNext:0,vehT:14,cones:[],calmT:9,alNext:0,br:0,brDone:{},brBusy:null,brNext:0,camo:false,epa:false,esc:null,auth:['BAGOLY-7','HÓVIRÁG-3','VÉRCSE-9','TÖLGY-4','SÓLYOM-2','PATAK-8'][Math.floor(Math.random()*6)]})}
function seStart(){seSaveDel();seReset();Object.assign(SE,{phase:'intro',run:true,intro:{t:0},minX:-.3,x:-1.9,y:.55,genX:14,zoom:.6});SE.G=seMkGrid();SE.wx=['nyar','tel','kod','osz'][Math.floor(Math.random()*4)];SE.objs.push({k:'wreck',x:-4.4});$('#seStart').hidden=true;$('#seOver').hidden=true;$('#seTut').hidden=true;
  for(let x=SE.genX;x<45;)x=seGen(x);SE.genX=Math.max(SE.genX,45);rockStop(.5);saStart();playCount('sere');sndBoom();seTray();seHud();seSave()}
function seContBtn(){const d=seSaveGet();if(!d)return '';const st=d.phase==='cap'||d.esc?'Charlie':d.escDone?'Kivonás':d.day===1?'Alpha':'Bravo '+(d.day-1);return `<button type="button" class="btn pri" id="seCont">▶ Folytatás – ${st}, ${Math.round((d.playT||0)/60)} perc</button> `}
function seBanner(d){const L=SE_LVL(d);SE.banner={t:0,a:d>3?'🚁 KIVONÁS':`${d}. NAP`,b:L[0]+' – '+L[1],c:L[2]}}
function sePop(m,col){const p=$('#sePop');if(!p)return;p.textContent=m;p.style.color=col||'#fff';p.classList.remove('on');void p.offsetWidth;p.classList.add('on')}
function seRadio(msg,ms){const r=$('#seRadio');if(!r)return;r.textContent=msg;r.hidden=false;rkRadioSnd();clearTimeout(SE.rt);SE.rt=setTimeout(()=>{r.hidden=true},ms||3800)}
function seLight(t){t=t==null?SE.tod:t;if(t<.42)return 1;if(t<.52)return 1-(t-.42)/.1;if(t<.9)return 0;return (t-.9)/.1}
function seNight(){return seLight()<.5}
function sePause(auto){if(SE.tr)return;if(SE.bag){if(!auto)seBagClose();return}if(SE.phase!=='play'&&!SE.paused)return;SE.paused=!SE.paused;const o=$('#seOver');if(SE.paused)seSave();
  if(SE.paused){SE.mv=0;SE.tgt=null;o.hidden=false;const bl=seBrList(),br=bl?`<div class="rkres">${bl.map((id,i)=>`<div><span>${SE_BRN[id][0]} ${SE_BRN[id][1]}</span><b>${SE.brDone[id]?'✅':i===SE.br?'▶':'·'}</b></div>`).join('')}</div>`:'';const al=SE.day===1?`<div class="rkres">${SE_AL.map((a,i)=>`<div><span>${a.ic} ${a.n}</span><b>${SE.alDone[a.id]?'✅':i===SE.al?'▶':'·'}</b></div>`).join('')}</div>`:'';
    o.innerHTML=`<h3>❙❙ Szünet</h3><p class="sesm">${auto?'Az app a háttérbe került, megállítottuk és elmentettük.':'A játék áll – el is mentettük.'} 🔐 Jelszó: <b>${SE.auth}</b>${SE.grid?` · 🎯 LZ: <b class="semono">${SE.grid.lz}</b>`:''}</p>${al}${br}<div class="rkres"><div><span>👆 Koppintás a terepre</span><b>odamegy</b></div><div><span>🪨🌿🕳️ Koppintás fedezékre</span><b>mögé bújik</b></div><div><span>👆👆 Dupla koppintás</span><b>futás (zajos)</b></div><div><span>🚶 🛑 🧎 🛌 🐛 ↩️</span><b>mozgásmód</b></div><div><span>💾 Mentés</span><b>automatikus</b></div><div><span>⏱️ Játékidő</span><b>${Math.round((SE.playT||0)/60)} perc</b></div><div><span>🌿 bokor · 🕳️ árok · 🌊 patak</span><b>takarás</b></div></div>${seFactLine()}${typeof SE_TR!=='undefined'?`<details class="setrlog"><summary>📘 Kiképzési napló – ${(SE.trDone||[]).length}/${SE_TR.length}</summary>${SE_TR.map(r=>{const d=(SE.trDone||[]).includes(r.id);return `<div class="${d?'ok':''}"><b>${d?'✅':'⬜'} ${r.ic} ${r.t}</b>${d?`<small>${r.l}</small>`:'<small>még nem teljesítetted</small>'}</div>`}).join('')}</details>`:''}<button class="btn pri" id="seResume">▶ Folytatás</button> <button class="btn line" id="seBag2">🎒 Hátizsák</button> <button class="btn line" id="seQuit">Kilépés</button>`;$('#seBag2').onclick=()=>{sePause();seBag()};
    $('#seResume').onclick=()=>sePause();$('#seQuit').onclick=seClose;saVol(.25);try{if(ROCK.on&&AC)ROCK.b.out.gain.setTargetAtTime(.1,AC.currentTime,.2)}catch(e){}}
  else{o.hidden=true;SE.last=performance.now();saVol(1);try{if(ROCK.on&&AC)ROCK.b.out.gain.setTargetAtTime(.5,AC.currentTime,.2)}catch(e){}}}
function seBeep(f,d,v){if(!SOUND||!ac())return;const a=AC,t=a.currentTime,o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(v||.05,t);g.gain.exponentialRampToValueAtTime(.001,t+(d||.1));o.connect(g).connect(MASTER);o.start(t);o.stop(t+(d||.1)+.02)}
// ===== erdei hangkép (szintetizált, offline is szól) =====
const SA={on:false};
function saNoise(type,f,q,g){const a=AC,src=a.createBufferSource();src.buffer=NOISE;src.loop=true;const fl=a.createBiquadFilter();fl.type=type;fl.frequency.value=f;if(q)fl.Q.value=q;const gn=a.createGain();gn.gain.value=g||0;src.connect(fl).connect(gn).connect(SA.out);src.start(0,Math.random()*.5);return {src,fl,g:gn}}
function saStart(){if(SA.on||!SOUND||!ac()||!NOISE)return;const a=AC;SA.on=true;SA.out=a.createGain();SA.out.gain.value=0;SA.out.connect(MASTER);SA.out.gain.setTargetAtTime(1,a.currentTime,1.2);
  SA.wind=saNoise('lowpass',380,.5,.045);SA.leaves=saNoise('bandpass',3200,.6,.006);SA.stream=saNoise('bandpass',1400,.8,0);SA.rain=saNoise('highpass',2600,.4,0);
  const dg=a.createGain();dg.gain.value=0;const df=a.createBiquadFilter();df.type='bandpass';df.frequency.value=700;df.Q.value=1.4;dg.connect(SA.out);df.connect(dg);SA.dro=[170,341,512].map((f,i)=>{const o=a.createOscillator();o.type='sawtooth';o.frequency.value=f;o.detune.value=i*7;o.connect(df);o.start();return o});SA.drone=dg;
  const vg=a.createGain();vg.gain.value=0;const vf=a.createBiquadFilter();vf.type='lowpass';vf.frequency.value=260;vg.connect(SA.out);vf.connect(vg);SA.vo=[52,78].map(f=>{const o=a.createOscillator();o.type='sawtooth';o.frequency.value=f;o.connect(vf);o.start();return o});SA.veh=vg;
  SA.nb=a.currentTime+1;SA.nc=a.currentTime+.5;SA.no=a.currentTime+9;SA.nr=a.currentTime+3;SA.nk=a.currentTime+20}
function saStop(f){if(!SA.on)return;SA.on=false;const out=SA.out,a=AC;try{out.gain.cancelScheduledValues(a.currentTime);out.gain.setTargetAtTime(0,a.currentTime,(f||.5)/3)}catch(e){}
  const all=[SA.wind,SA.leaves,SA.stream,SA.rain].map(x=>x&&x.src).concat(SA.dro||[],SA.vo||[]);setTimeout(()=>{all.forEach(x=>{try{x.stop()}catch(e){}});try{out.disconnect()}catch(e){}},(f||.5)*1000+600)}
function saVol(v){if(SA.on)try{SA.out.gain.setTargetAtTime(v,AC.currentTime,.2)}catch(e){}}
function saPan(node,p){if(AC.createStereoPanner){const pn=AC.createStereoPanner();pn.pan.value=p;node.connect(pn).connect(SA.out)}else node.connect(SA.out)}
function saBird(){const a=AC,t=a.currentTime,n=2+Math.floor(Math.random()*5),f0=2300+Math.random()*2600,g=a.createGain();g.gain.value=0;saPan(g,Math.random()*1.6-.8);
  for(let i=0;i<n;i++){const o=a.createOscillator();o.type='sine';const st=t+i*(.07+Math.random()*.05);o.frequency.setValueAtTime(f0*(.9+Math.random()*.2),st);o.frequency.exponentialRampToValueAtTime(f0*(.65+Math.random()*.8),st+.06);
    const e=a.createGain();e.gain.setValueAtTime(0,st);e.gain.linearRampToValueAtTime(.025,st+.01);e.gain.exponentialRampToValueAtTime(.0008,st+.07);o.connect(e).connect(g);o.start(st);o.stop(st+.09)}g.gain.value=1}
function saCuckoo(){const a=AC,t=a.currentTime;[[660,0,.22],[540,.3,.32]].forEach(([f,d,l])=>{const o=a.createOscillator(),e=a.createGain();o.type='triangle';o.frequency.value=f;e.gain.setValueAtTime(0,t+d);e.gain.linearRampToValueAtTime(.03,t+d+.03);e.gain.exponentialRampToValueAtTime(.001,t+d+l);saPan(e,.5);o.connect(e);o.start(t+d);o.stop(t+d+l+.05)})}
function saCricket(){const a=AC,t=a.currentTime,f=4200+Math.random()*700,g=a.createGain();g.gain.value=1;saPan(g,Math.random()*1.4-.7);const k=3+Math.floor(Math.random()*3);
  for(let i=0;i<k;i++){const o=a.createOscillator(),e=a.createGain();o.frequency.value=f;const st=t+i*.045;e.gain.setValueAtTime(0,st);e.gain.linearRampToValueAtTime(.009,st+.005);e.gain.linearRampToValueAtTime(0,st+.028);o.connect(e).connect(g);o.start(st);o.stop(st+.04)}}
function saOwl(){const a=AC,t=a.currentTime;[0,.55,.85].forEach((d,i)=>{const o=a.createOscillator(),e=a.createGain(),lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=700;o.frequency.setValueAtTime(i?370:400,t+d);o.frequency.linearRampToValueAtTime(i?350:380,t+d+.3);e.gain.setValueAtTime(0,t+d);e.gain.linearRampToValueAtTime(.035,t+d+.06);e.gain.exponentialRampToValueAtTime(.001,t+d+.38);saPan(e,-.6);o.connect(lp).connect(e);o.start(t+d);o.stop(t+d+.42)})}
function saRustle(v){const a=AC,t=a.currentTime,n=a.createBufferSource();n.buffer=NOISE;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=2200+Math.random()*1800;f.Q.value=.6;const e=a.createGain();e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v||.03,t+.05);e.gain.exponentialRampToValueAtTime(.001,t+.25+Math.random()*.2);saPan(e,Math.random()*1.6-.8);n.connect(f).connect(e);n.start(t,Math.random()*.5,.5)}
function saDogFar(){const a=AC,t=a.currentTime;[0,.3,.55].forEach(d=>{const o=a.createOscillator(),e=a.createGain(),f=a.createBiquadFilter();o.type='sawtooth';o.frequency.setValueAtTime(360,t+d);o.frequency.exponentialRampToValueAtTime(170,t+d+.12);f.type='bandpass';f.frequency.value=800;e.gain.setValueAtTime(.018,t+d);e.gain.exponentialRampToValueAtTime(.0005,t+d+.15);saPan(e,.8);o.connect(f).connect(e);o.start(t+d);o.stop(t+d+.17)})}
function saTick(dt){if(!SA.on||!AC)return;const a=AC,t=a.currentTime,L=seLight(),near=k=>{let d=1e9;for(const o of SE.objs)if(o.k===k)d=Math.min(d,Math.abs(o.x-SE.x));return d};
  SA.wind.g.gain.setTargetAtTime(.03+.025*Math.sin(t*.21)+.015*Math.sin(t*.53)+(SE.rain?.03:0),t,.5);SA.wind.fl.frequency.setTargetAtTime(320+180*Math.sin(t*.13),t,.5);
  SA.leaves.g.gain.setTargetAtTime(.004+.006*Math.max(0,Math.sin(t*.37)),t,.4);
  SA.stream.g.gain.setTargetAtTime(.11*Math.max(0,1-near('stream')/16),t,.25);SA.rain.g.gain.setTargetAtTime(SE.rain?.05:0,t,.8);
  const dd=near('drone');SA.drone.gain.setTargetAtTime(.045*Math.max(0,1-dd/20)*(.8+.2*Math.sin(t*23)),t,.1);
  const vd=near('veh');SA.veh.gain.setTargetAtTime(.12*Math.max(0,1-vd/34),t,.15);
  if(t>SA.nb&&L>.45){SA.nb=t+.4+Math.random()*(L>.9?2.2:5);saBird()}
  if(t>SA.nk&&L>.9&&SE.day===1){SA.nk=t+18+Math.random()*25;saCuckoo()}
  if(t>SA.nc&&L<.5){SA.nc=t+.25+Math.random()*.9;saCricket()}
  if(t>SA.no&&L<.3){SA.no=t+14+Math.random()*20;Math.random()<.7?saOwl():saDogFar()}
  if(t>SA.nr){SA.nr=t+2.5+Math.random()*6;saRustle(.02)}}
function seStepSnd(k){if(!SOUND||!ac()||!NOISE)return;const a=AC,t=a.currentTime,n=a.createBufferSource();n.buffer=NOISE;const f=a.createBiquadFilter(),g=a.createGain();
  if(SE.inStream){f.type='bandpass';f.frequency.value=1100+Math.random()*500;f.Q.value=.8;g.gain.setValueAtTime(.09,t);g.gain.exponentialRampToValueAtTime(.001,t+.18)}
  else if(k===3){f.type='bandpass';f.frequency.value=1500+Math.random()*900;f.Q.value=.5;g.gain.setValueAtTime(.025,t);g.gain.exponentialRampToValueAtTime(.001,t+.28)}// kúszás: avar súrlódás
  else{f.type='bandpass';f.frequency.value=(k===2?700:1900)+Math.random()*700;f.Q.value=.9;g.gain.setValueAtTime(k===2?.12:SE.rain?.025:.045,t);g.gain.exponentialRampToValueAtTime(.001,t+(k===2?.16:.09))}// avar ropogás
  n.connect(f).connect(g).connect(MASTER);n.start(t,Math.random()*.5,.35);if(k===2||k===0){const o=a.createOscillator(),e=a.createGain();o.frequency.setValueAtTime(k===2?90:120,t);o.frequency.exponentialRampToValueAtTime(50,t+.08);e.gain.setValueAtTime(k===2?.12:.04,t);e.gain.exponentialRampToValueAtTime(.001,t+.1);o.connect(e).connect(MASTER);o.start(t);o.stop(t+.12)}}
function seBark(){if(!SOUND||!ac())return;const a=AC,t=a.currentTime;[0,.22].forEach(dt=>{const o=a.createOscillator(),g=a.createGain(),f=a.createBiquadFilter();o.type='sawtooth';o.frequency.setValueAtTime(420,t+dt);o.frequency.exponentialRampToValueAtTime(180,t+dt+.12);f.type='bandpass';f.frequency.value=900;g.gain.setValueAtTime(.12,t+dt);g.gain.exponentialRampToValueAtTime(.001,t+dt+.16);o.connect(f).connect(g).connect(MASTER);o.start(t+dt);o.stop(t+dt+.18)})}
// feszültségzene: csak veszélyben, szívverés-ütemmel; egyébként csak az erdő szól
function seTension(dt){const night=seNight();let danger=SE.det>.12||(SE.dog&&SE.dog.st==='chase')||(SE.ex&&SE.ex.st!=='out')||SE.cones.some(q=>Math.abs(q.ax-SE.x)<(night?11:7)&&q.o.k!=='drone'||q.thermal&&Math.abs(q.ax-SE.x)<6);
  if(SE.tut)danger=false;
  if(danger){SE.calmT=0;if(!(ROCK.on&&ROCK.id==='sere_t'))rockStart('sere_t');rockTempo(Math.round(84+SE.det*70+(SE.dog&&SE.dog.st==='chase'?24:0)))}
  else{SE.calmT+=dt;if(SE.calmT>4.5&&ROCK.on&&ROCK.id==='sere_t')rockStop(2.5)}}

// ---- felvételi hangok tárgyfajtánként ----
// ---- hátizsák ----
const SE_KIT=[['💧','Kulacs + víztisztító tabletta','Víz nélkül kb. 3 nap. A tabletta után várni kell (általában 30 perc); a zavaros vizet előbb ruhán szűrd át.'],
 ['🔥','Tűzacél + tapló (pl. vazelinos vatta)','Nedvesen is szikrázik, ezer gyújtásra elég. A gyufa elázik, az öngyújtó kifagyhat.'],
 ['🔪','Rögzített pengéjű kés','Menedék, tűzifa, élelem – a legfontosabb szerszám. Legyen a testeden.'],
 ['🧭','Iránytű + térkép vízálló tasakban','Az elem lemerül, a jel zavarható – az iránytűnek nem kell áram.'],
 ['✚','Egyéni elsősegélycsomag, érszorító','Először a vérzést csillapítsd. Hólyagtapasz: ha a lábad tönkremegy, nem tudsz haladni.'],
 ['🪞','Jelzőtükör + síp','Kimentéskor: a villanás messzire látszik, a síp kevesebb erőt visz, mint a kiabálás.'],
 ['🪢','10 m paracord (zsinór)','Menedék, javítás, csomag rögzítése – kis helyen, sokra jó.'],
 ['🛡️','Túlélőfólia vagy poncsó','A hideg és a nedvesség gyorsabban öl, mint az éhség. Tető, alátét, szélfogó.'],
 ['🔦','Fejlámpa piros szűrővel','A piros fény nem vakít el, és nehezebben veszik észre.'],
 ['🍫','Kis tömegű, nagy energiájú élelem','Nem kell főzni. Ha kevés a víz, keveset egyél.'],
 ['🧦','Száraz zokni','A láb ápolása = mozgásképesség. Esténként cseréld.'],
 ['🎨','Álcafesték / sötét kendő','A fénylő arc és kéz messziről elárul.']];
function seBag(){if(SE.bag){seBagClose();return}if(SE.phase!=='play'||SE.tut||SE.cap)return;if(SE.paused)return;SE.paused=true;SE.bag='bag';SE.tgt=null;SE.mv=0;SE.padK='';
  const I=SE.inv,o=$('#seOver');o.hidden=false;o.classList.add('sebag');const row=(ic,n,v,ok)=>`<div><span>${ic} ${n}</span><b class="${ok?'ok':''}">${v}</b></div>`;
  o.innerHTML=`<h3>🎒 Hátizsák</h3><p class="sesm">A játék áll, amíg nyitva van.</p>
   <div class="sebagtabs"><button type="button" class="on" data-sebt="0">Nálad van</button><button type="button" data-sebt="1">Mit érdemes vinni?</button></div>
   <div class="sebagp" data-sebp="0"><div class="rkres">${row('💧','Víz',Math.round(SE.water)+'%',SE.water>40)}${row('🍖','Erő / élelem',Math.round(SE.food)+'%',SE.food>40)}${row('❤','Egészség',Math.round(SE.hp)+'%',SE.hp>40)}</div>
    <div class="rkres">${row('🌾','Tapló, száraz fű',I.tinder+' db',I.tinder>=2)}${row('🍂','Gyújtós',I.kindling+' db',I.kindling>=3)}${row('🪵','Tűzifa',I.wood+' db',I.wood>=3)}${row('🌿','Ágak (menedék)',I.leaf+' / '+seLN()+' db',I.leaf>=seLN())}${row('🫐','Gyűjtött élelem',I.forage+' db',I.forage>=3)}</div>
    <div class="rkres">${row('🔪','Kés','✅',1)}${row('🔥','Tűzacél','✅',1)}${row('🪞','Jelzőtükör','✅',1)}${row('🎨','Álcázás',SE.camo?'✅ felvéve':'—',SE.camo)}${row('🗺️','Rejtekhely-terv (EPA)',SE.epa?'✅':'—',SE.epa)}${row('🔐','Hitelesítő jelszó','<span class="semono">'+SE.auth+'</span>',1)}${row('📍','Kivonási pont (LZ)',SE.grid?'<span class="semono">'+SE.grid.lz+'</span>':'— (rádió!)',!!SE.grid)}${row('🎯','Távolság',SE.grid?(Math.max(0,SE.kmR)/1000).toFixed(1).replace('.',',')+' km '+seDir(SE.grid.brg):'?',!!SE.grid)}</div>
    <p class="sesm">Tűzhöz kell: 🌾 2 · 🍂 3 · 🪵 3${seKit('fire')?'':' + 🔥 tűzacél (nincs!)'} · menedékhez 🌿 ${seLN()}.</p><div class="rkres">${(SE.kit||[]).length?(SE.kit||[]).map(id=>{const k=SE_KIT_ITEMS.find(x=>x[0]===id);return row(k[1],k[2],String(k[3]).replace('.',',')+' kg',!['phone','tablet','ammo'].includes(id))}).join(''):row('🎒','Bepakolt felszerelés','üres',0)}</div></div>
   <div class="sebagp" data-sebp="1" hidden><p class="sesm"><b>Alapelv:</b> kevés, de többfunkciós. A legfontosabb a <b>testeden</b> (zsebben) legyen – ha a hátizsákot menekülés közben el kell dobnod, az életben maradáshoz szükséges akkor is nálad marad.</p>
    <div class="sekit">${SE_KIT.map(k=>`<div><i>${k[0]}</i><div><b>${k[1]}</b><span>${k[2]}</span></div></div>`).join('')}</div><p class="sesm" data-st="opacity:.7">Általános túlélési ismeret, nem hivatalos felszerelési jegyzék.</p></div>
   <button class="btn pri" id="seBagX">▶ Vissza a játékba</button>`;
  o.querySelectorAll('[data-sebt]').forEach(b=>b.onclick=()=>{o.querySelectorAll('[data-sebt]').forEach(x=>x.classList.toggle('on',x===b));o.querySelectorAll('[data-sebp]').forEach(p=>p.hidden=p.dataset.sebp!==b.dataset.sebt)});
  $('#seBagX').onclick=seBagClose;saRustle(.06);saVol(.25)}
function seBagClose(){if(!SE.bag)return;const k=SE.bag;SE.bag=false;const o=$('#seOver');o.classList.remove('sebag');SE.padK='';if(k==='facts'&&!SE.factPause){o.hidden=true;if(SE.phase==='play'&&SE.paused){SE.paused=false;sePause()}return}SE.paused=false;o.hidden=true;SE.last=performance.now();saVol(1);if(k==='bag')saRustle(.05)}
// ---- felső napcsúszka: mennyi van hátra a napból, mi a cél ----
function seDayBar(){const el=SE.dbar;if(!el)return;const show=['play','camp','cap','intro','kit','td'].includes(SE.phase)&&!SE.tut;if(el.hidden===show)el.hidden=!show;if(!show)return;
  const now=performance.now();if(SE.dbT&&now-SE.dbT<250)return;SE.dbT=now;
  const stage=SE.phase==='cap'||SE.esc?4:SE.escDone?5:SE.phase==='intro'?0:Math.min(3,SE.day);let goal;
  if(SE.phase==='intro')goal='💥 Találat! Kimászol a kilőtt PzH 2000-ből…';
  else if(SE.phase==='td')goal='🅲 SZÖKÉS – felülnézet: juss ki a táborból, árnyékból árnyékba';
  else if(SE.phase==='kit')goal='🎒 Pakold be a hátizsákot – max. '+SE_KITMAX+' kg';
  else if(SE.phase==='cap'){const st=SE.cap&&SE.cap.st;goal='🅲 Charlie – '+({intro:'elfogtak',blind:'bekötött szemmel – figyelj a jelekre',blindq:'merre vittek?',int:'kihallgatás: csak a négy adat',intwhy:'kihallgatás',breath:'légzés – nyugalom',cell:'cella – rutin',tap:'kopogókód a falon',sum:'készülj a szökésre',broken:'megtörtél'}[st]||'fogság')}
  else if(SE.amb)goal='⚠️ RAJTAÜTÉS – bekerítettek!';
  else if(SE.esc)goal='🅲 SZÖKÉS – kerítés alatt, fedezékről fedezékre';
  else if(SE.ex&&SE.ex.st!=='out')goal='🚁 Kivonás – '+({wait:'jelezz a helikopternek!',auth:'hitelesítés',land:'koppints a helikopterre, fuss oda!',board:'beszállás',gone:'a gép kört tesz…'}[SE.ex.st]||'');
  else if(SE.escDone)goal='🚁 Juss el a kivonási pontra – hajnalra';
  else if(SE.phase==='camp')goal='⛺ Tábor – menedék és tűz';
  else if(SE.day===1){const A=SE_AL[SE.al];goal=A?`🎯 Alpha ${SE.al+1}/${SE_AL.length}: ${A.ic} ${A.n}`:'🎯 Sötétedés előtt: ⛺ menedék + 🔥 tűz'}
  else{const BL=seBrList(),id=BL&&BL[SE.br];goal=id?`🎯 Bravo ${SE.br+1}/${BL.length}: ${SE_BRN[id][0]} ${SE_BRN[id][1]}`:'🎯 Tovább a kivonási pont felé – óvatosan'}
  if(SE.dbG.textContent!==goal)SE.dbG.textContent=goal;
  const ch=[['💥','PzH'],['🅰️','Alpha'],['🅱️','Bravo I'],['🅱️','Bravo II'],['🅲','Charlie'],['🚁','Kivonás']],key=String(stage);if(SE.dbC.dataset.k!==key){SE.dbC.dataset.k=key;SE.dbC.innerHTML=ch.map((n,i)=>`<i class="${i<stage?'ok':i===stage?'cur':''}">${i===stage?n[0]+' '+n[1]:n[0]+(i===2?'¹':i===3?'²':'')}</i>`).join('<b>›</b>')}
  const tod=SE.tod,phase=tod<.42?'☀️ nappal':tod<.52?'🌇 alkonyat':tod<.9?'🌙 éjszaka':'🌅 hajnal';
  SE.dbL.textContent=SE.phase==='cap'?'⛓️ fogságban':`${Math.min(SE.day,4)}. nap · ${phase} · ${seWxIc()}`;
  SE.dbR.textContent=SE.grid?(SE.phase==='cap'||SE.esc?'🎯 LZ: '+SE.grid.lz.slice(4):`🎯 ${(Math.max(0,SE.kmR)/1000).toFixed(1).replace('.',',')} km · ${seDir(SE.grid.brg)}`):(SE.phase==='intro'?'':'🎯 ? km – rádió!');
  el.classList.toggle('night',seNight())}

// ===== v3: pontozás, hangok, rádió (MGRS), mentés, panelek =====
const SE_KM=7,SE_QT=20,SE_CT=30;// 1 m a játékban ≈ 7 m terep · kérdés / döntés ideje (s)
function sePts(cat,n){SE.pts+=n;SE.sc=SE.sc||{};SE.sc[cat]=(SE.sc[cat]||0)+n}
// halk, természetes hangok (nincs éles csipogás)
function seOk(){if(!SOUND||!ac())return;const a=AC,t=a.currentTime+.01;[[392,0],[523,.11]].forEach(([f,d])=>{const o=a.createOscillator(),g=a.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(.045,t+d+.015);g.gain.exponentialRampToValueAtTime(.001,t+d+.22);o.connect(g).connect(MASTER);o.start(t+d);o.stop(t+d+.25)})}
function seClick(v){if(!SOUND||!ac()||!NOISE)return;const a=AC,t=a.currentTime,n=a.createBufferSource();n.buffer=NOISE;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=1800;f.Q.value=1.2;const g=a.createGain();g.gain.setValueAtTime(.03*(v||1),t);g.gain.exponentialRampToValueAtTime(.001,t+.05);n.connect(f).connect(g).connect(MASTER);n.start(t,Math.random()*2,.07)}
function sePickSnd(it){if(!SOUND||!ac()||!NOISE)return;const a=AC,t=a.currentTime+.01;
  const nz=(t0,dur,f,v)=>{const n=a.createBufferSource();n.buffer=NOISE;const fl=a.createBiquadFilter();fl.type='lowpass';fl.frequency.value=f;const g=a.createGain();g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+dur*.3);g.gain.exponentialRampToValueAtTime(.001,t0+dur);n.connect(fl).connect(g).connect(MASTER);n.start(t0,Math.random()*2,dur+.05)};
  nz(t,.22,1400,.035);// zsebbe tevés: ruha súrlódása
  const o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.setValueAtTime(130,t+.12);o.frequency.exponentialRampToValueAtTime(80,t+.22);g.gain.setValueAtTime(.06,t+.12);g.gain.exponentialRampToValueAtTime(.001,t+.26);o.connect(g).connect(MASTER);o.start(t+.12);o.stop(t+.3);// tompa koppanás
  if(it==='water')nz(t+.25,.3,600,.03)}// a kulacsban lötyögő víz
// ---- rádió: angol NATO-forgalmazás felolvasva, MGRS-koordináta ----
const SE_NATO={A:'Alfa',B:'Bravo',C:'Charlie',D:'Delta',E:'Echo',F:'Foxtrot',G:'Golf',H:'Hotel',I:'India',J:'Juliett',K:'Kilo',L:'Lima',M:'Mike',N:'November',O:'Oscar',P:'Papa',Q:'Quebec',R:'Romeo',S:'Sierra',T:'Tango',U:'Uniform',V:'Victor',W:'Whiskey',X:'X-ray',Y:'Yankee',Z:'Zulu'},SE_NUM=['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Niner'];
const seSay=s=>s.split('').map(ch=>/\d/.test(ch)?SE_NUM[+ch]:SE_NATO[ch]||'').filter(Boolean).join(' ');
const seGridSay=g=>g.split(' ').map(seSay).join(', ');
function seMkGrid(){const r=(a,b)=>a+Math.random()*(b-a);let sE,sN,lE,lN;for(let i=0;i<80;i++){sE=Math.round(r(12000,88000));sN=Math.round(r(12000,88000));const b=r(0,Math.PI*2),d=r(14300,15700);lE=Math.round(sE+Math.sin(b)*d);lN=Math.round(sN+Math.cos(b)*d);if(lE>1500&&lE<98500&&lN>1500&&lN<98500)break}
  const f=n=>String(n).padStart(5,'0'),dist=Math.hypot(lE-sE,lN-sN),brg=(Math.atan2(lE-sE,lN-sN)*180/Math.PI+360)%360;return {me:`33T YN ${f(sE)} ${f(sN)}`,lz:`33T YN ${f(lE)} ${f(lN)}`,dist,brg}}
const seDir=b=>['É','ÉK','K','DK','D','DNy','Ny','ÉNy'][Math.round(b/45)%8];
function seStatic(on){try{if(!SOUND||!ac()||!NOISE)return;if(on&&!SE._st){const a=AC,n=a.createBufferSource();n.buffer=NOISE;n.loop=true;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=2200;f.Q.value=.7;const g=a.createGain();g.gain.value=.012;n.connect(f).connect(g).connect(MASTER);n.start();SE._st={n,g}}
  else if(!on&&SE._st){const S=SE._st;SE._st=null;S.g.gain.setTargetAtTime(0,AC.currentTime,.05);setTimeout(()=>{try{S.n.stop()}catch(e){}},300)}}catch(e){}}
function seSpeak(txt,cb){return seSpeakSeq([[txt,.88,0]],cb)}
// több részletben, szünetekkel olvas fel (a koordinátát lassan, tagoltan)
function seSpeakSeq(parts,cb){try{if(!SOUND||!('speechSynthesis' in window)){cb&&cb(false);return false}const S=speechSynthesis;S.cancel();const id=(SE._spk=(SE._spk||0)+1);
  const vs=S.getVoices(),v=vs.find(v=>/^en[-_](US|GB)/i.test(v.lang)&&/male|david|alex|fred|daniel|george|guy/i.test(v.name))||vs.find(v=>/^en[-_](US|GB)/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang));
  seStatic(true);try{rkRadioSnd()}catch(e){}let i=0;const done=ok=>{if(SE._spk!==id)return;seStatic(false);cb&&cb(ok)};
  const next=()=>{if(SE._spk!==id)return;if(i>=parts.length){done(true);return}const [t,r,g]=parts[i++];const u=new SpeechSynthesisUtterance(t);u.lang='en-US';u.rate=r||.88;u.pitch=.85;if(v)u.voice=v;
    u.onend=()=>setTimeout(next,g||0);u.onerror=()=>done(false);S.speak(u)};next();return true}catch(e){cb&&cb(false);return false}}
function seGridParts(g){const [zb,sq,e,n]=g.split(' '),grp=s=>s.split('').map(ch=>/\d/.test(ch)?SE_NUM[+ch]:SE_NATO[ch]).join('. ')+'.';return [['Grid.',.8,450],[grp(zb),.68,750],[grp(sq),.68,750],[grp(e),.66,800],[grp(n),.66,900]]}
function seCommsMsg(G){return [['Hammer Two-One, this is Overlord. Copy your last.',.88,400],['Extraction point follows.',.86,600],...seGridParts(G.lz),['I say again.',.84,600],...seGridParts(G.lz),['Move by night, avoid contact, report at extraction point. Overlord, over.',.88,0]]}
function seComms(){if(SE.phase!=='play'||SE.bag||SE.choice)return;if(!seKit('radio')&&!SE.radioBack){SE.radioBack=1;SE.food=Math.max(5,SE.food-15);SE.water=Math.max(5,SE.water-10);sePts('kit',-100);seKitMiss('radio','📻 Nincs nálad rádió! Vissza kell menned a roncshoz – a PzH rádiója akkumulátorról még megy. (−15 erő, −10 víz, −100 p)');setTimeout(()=>{if(SE.phase==='play')seComms()},3200);return}if(seKit('radio'))seKitUse('radio');const G=SE.G||(SE.G=seMkGrid());SE.paused=true;SE.bag='comms';SE.mv=0;SE.tgt=null;SE.padK='';const C=SE.cm||(SE.cm={wrong:0,txt:false,plays:0});
  const o=$('#seOver');o.hidden=false;o.classList.add('sebag');const canTTS=SOUND&&('speechSynthesis' in window);
  o.innerHTML=`<h3>📻 Rádió – kapcsolatfelvétel</h3><p class="sesm">📍 Saját hely (a PzH navigációs rendszeréből): <b class="semono">${G.me}</b></p>
   <div class="secomm"><div class="cme">🎙️ <b>Te:</b> „OVERLORD, HAMMER TWO-ONE. Vehicle destroyed, one crew, no injuries. Request extraction point. Over.”</div><div class="cmo" id="seCmTx" ${C.txt||!canTTS?'':'hidden'}>📻 <b>OVERLORD:</b> „Hammer Two-One, this is Overlord. Copy your last. Extraction point follows. Grid: <b class="semono">${G.lz}</b>. I say again… Move by night, avoid contact, report at extraction point. Overlord, over.”</div></div>
   ${canTTS?'':'<p class="sesm">🔇 A felolvasáshoz kapcsold be a hangot (a menüben) – addig a szöveg látszik.</p>'}
   <div class="secmbtn"><button type="button" class="btn pri" id="seCmPlay">▶ Adás lejátszása</button><button type="button" class="btn line" id="seCmAgain">🔁 SAY AGAIN</button>${C.txt||!canTTS?'':'<button type="button" class="btn line" id="seCmTxt">📝 Szöveg (−100 p)</button>'}</div>
   <label class="sesm" for="seCmIn"><b>Kivonási pont MGRS-ben</b> (zóna · négyzet · keleti · északi):</label>
   <input id="seCmIn" class="secmin" placeholder="pl. 33T AB 12345 67890" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="24">
   <button type="button" class="btn pri sebig" id="seCmOk">✔ READ BACK – visszaolvasás</button><p class="sesm" id="seCmMsg"></p>
   <p class="sesm" data-st="opacity:.75">💡 Rádión a számokat egyesével mondják, a 9 = „niner”; a betűk a NATO-ábécé szerint (Yankee = Y).</p>`;
  const play=()=>{C.plays++;seSpeakSeq(seCommsMsg(G))||($('#seCmTx').hidden=false)};$('#seCmPlay').onclick=play;$('#seCmAgain').onclick=()=>{seSpeak('Say again, all after grid. Over.',()=>setTimeout(play,400))||play()};
  const tb=$('#seCmTxt');if(tb)tb.onclick=()=>{C.txt=true;$('#seCmTx').hidden=false;tb.remove()};
  const inp=$('#seCmIn');inp.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')$('#seCmOk').click()});inp.addEventListener('keyup',e=>e.stopPropagation());
  $('#seCmOk').onclick=()=>{const v=inp.value.toUpperCase().replace(/[^0-9A-Z]/g,''),want=G.lz.replace(/ /g,''),msg=$('#seCmMsg');
    if(v===want){const p=Math.max(60,300-C.wrong*60-(C.txt?100:0));sePts('comms',p);SE.grid=G;SE.kmD=Math.round(G.dist);SE.kmX0=SE.x;SE.kmR=SE.kmD;
      msg.innerHTML=`✅ <b>Read back correct.</b> Kivonási pont rögzítve: <b>${(G.dist/1000).toFixed(1).replace('.',',')} km</b>, irány <b>${Math.round(G.brg)}° (${seDir(G.brg)})</b>. +${p} p`;seOk();
      SE._spk=(SE._spk||0)+1;try{speechSynthesis.cancel()}catch(e){}seStatic(false);msg.classList.add('ok');
      $('#seCmOk').textContent='▶ Tovább: útvonal';$('#seCmOk').onclick=()=>seRouteAsk();inp.disabled=true}
    else{C.wrong++;msg.classList.remove('ok');msg.classList.add('bad');msg.innerHTML=v.length<10?'⚠️ Hiányos – zóna, négyzet, 5 + 5 számjegy kell.':`❌ <b>Nem egyezik.</b> Kérj ismétlést: <b>🔁 SAY AGAIN</b>. (−60 p)`;seBeep(220,.15,.04)}};
  setTimeout(()=>{if(SE.bag==='comms'&&C.plays===0&&canTTS)play()},700)}
// ---- mentés (bármikor megszakítható) ----
const SE_SAVEKEY='medve-sere-save1',SE_NOSAVE=new Set(['tr','c','cv','pad','dbar','dbG','dbF','dbM','dbL','dbR','dbS','dbC','fit','key','up','vis','raf','rt','stars','clouds','wins','cones','fx','last','W','H','dpr','s','px0','padK','dbT','saveT','lastTap','lastTapX','mk','paused','bag','banner']);
function seSave(){if(SE.tut||!['play','cap','camp','intro','kit','td'].includes(SE.phase))return;try{const o={};SE.coverI=SE.cover?SE.objs.indexOf(SE.cover):-1;if(SE.tgt&&SE.tgt.cov)SE.tgt.covI=SE.objs.indexOf(SE.tgt.cov);
  for(const k in SE){if(SE_NOSAVE.has(k)||k[0]==='_')continue;const v=SE[k];if(typeof v==='function'||v===SE.cover&&k==='cover')continue;o[k]=v}if(o.tgt)o.tgt={...o.tgt,cov:null};o.cover=null;o.ver=3;o.savedAt=Date.now();localStorage.setItem(SE_SAVEKEY,JSON.stringify(o))}catch(e){}}
function seSaveGet(){try{const s=localStorage.getItem(SE_SAVEKEY);if(!s)return null;const o=JSON.parse(s);return o&&o.ver===3?o:null}catch(e){return null}}
function seSaveDel(){try{localStorage.removeItem(SE_SAVEKEY)}catch(e){}}
function seLoad(){const d=seSaveGet();if(!d)return seStart();seReset();Object.assign(SE,d);SE.run=true;SE.paused=false;SE.bag=false;SE.cover=SE.coverI>=0?SE.objs[SE.coverI]||null:null;if(SE.tgt)SE.tgt.cov=SE.tgt.covI>=0?SE.objs[SE.tgt.covI]||null:null;
  $('#seStart').hidden=true;$('#seTut').hidden=true;const o=$('#seOver');o.hidden=true;rockStop(.3);saStart();playCount('sere');
  if(SE.phase==='intro')seIntroEnd();
  if(SE.phase==='play'&&!d.kitDone&&SE.day===1&&!SE.escDone){seKitPick();sePop('🎒 Előbb pakold be a hátizsákot!','#ffd24a');return}
  if(SE.phase==='kit'){seKitPick();sePop('💾 Mentés betöltve','#9dff9d');return}
  if(SE.phase==='td'){seTDBuild();sePop('💾 Mentés betöltve','#9dff9d');return}
  if(SE.phase==='cap'){seCapHum(true);seCapRender()}else{if(SE.day===1&&SE.alDone[seAlId()])seAlNext();seTray();seHud();sePause()}
  sePop('💾 Mentés betöltve','#9dff9d')}
// ---- kezdés: kimászás a kilőtt PzH 2000-ből ----
function seIntroTick(dt){const I=SE.intro;if(!I)return;I.t+=dt;SE.t+=dt;const t=I.t,hx=-2.0,deck=1.85;
  if(t<.35)SE.shake=.3;
  if(t<1.3){SE.x=hx;SE.y=deck-1.45;SE.v=0;I.clip=1}
  else if(t<2.7){const k=(t-1.3)/1.4;SE.y=deck-1.45+1.45*k*k*(3-2*k);SE.x=hx;I.clip=1;if(!I.s1){I.s1=1;saRustle(.07)}}
  else if(t<3.7){I.clip=0;SE.y=deck;const k=(t-2.7);SE.x=hx+1.15*k;SE.v=1.15;SE.step+=1.15*dt}
  else if(t<4.4){const k=(t-3.7)/.7,x1=hx+1.15;SE.x=x1+(0-x1)*k;SE.y=deck*(1-k)+Math.sin(Math.PI*k)*.45;SE.v=1.8;if(!I.s2){I.s2=1;seStepSnd(1)}}
  else{SE.x=0;SE.y=0;SE.v=0;if(!I.s3){I.s3=1;seStepSnd(2);SE.land=.16}if(t>5.3)seIntroEnd()}}
function seIntroEnd(){SE.intro=null;SE.x=0;SE.y=0;SE.v=0;SE.maxX=0;SE.minX=-.3;seKitPick()}
// ---- Charlie háttérzaj: zümmögő villanykörte, mély búgás ----
function seCapHum(on){try{if(on&&!SE._hum&&SOUND&&ac()){const a=AC,g=a.createGain();g.gain.value=0;g.connect(MASTER);g.gain.setTargetAtTime(.04,a.currentTime,.8);const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=240;lp.connect(g);
    const os=[55,110,165].map((f,i)=>{const o=a.createOscillator();o.type=i?'sine':'sawtooth';o.frequency.value=f;const og=a.createGain();og.gain.value=[.5,.25,.08][i];o.connect(og).connect(lp);o.start();return o});SE._hum={g,os}}
  else if(!on&&SE._hum){const H=SE._hum;SE._hum=null;H.g.gain.setTargetAtTime(0,AC.currentTime,.3);setTimeout(()=>H.os.forEach(o=>{try{o.stop()}catch(e){}}),1500)}}catch(e){}}
// ---- „Tudtad?” panel ----
function seFactSeen(){try{return new Set(JSON.parse(localStorage.getItem('medve-sere-facts')||'[]'))}catch(e){return new Set()}}
function seFacts(i){if(SE.bag&&SE.bag!=='facts')seBagClose();const wasPlay=SE.phase==='play'&&!SE.paused;if(SE.bag!=='facts'){if(wasPlay){SE.paused=true;SE.mv=0;SE.tgt=null}SE.bag='facts';SE.factPause=wasPlay;SE.padK=''}
  const seen=seFactSeen(),f=SE.factF||'all',list=SE_FACTS.map((x,j)=>j).filter(j=>f==='all'||SE_FACTS[j][0]===f);
  if(i==null){const un=list.filter(j=>!seen.has(j));i=(un.length?un:list)[Math.floor(Math.random()*(un.length||list.length))]}SE.factI=i;seen.add(i);try{localStorage.setItem('medve-sere-facts',JSON.stringify([...seen]))}catch(e){}
  const F=SE_FACTS[i],C=SE_FCAT[F[0]],pos=list.indexOf(i);const o=$('#seOver');o.hidden=false;o.classList.add('sebag');
  o.innerHTML=`<h3>💡 Tudtad?</h3><div class="sefchips">${[['all','Mind'],...Object.entries(SE_FCAT).map(([k,v])=>[k,v[0]+' '+v[1]])].map(([k,n])=>`<button type="button" class="${f===k?'on':''}" data-sefc="${k}">${n}</button>`).join('')}</div>
   <div class="sefact" data-st="--fc:${C[2]}"><span class="sefcat">${C[0]} ${C[1]}</span><b>${esc(F[1])}</b><p>${esc(F[2])}</p>${F[3]?`<em>Ítélet: ${esc(F[3])}</em>`:''}</div>
   <div class="secmbtn"><button type="button" class="btn line" data-sefn="-1">‹ Előző</button><span class="sesm">${pos+1}/${list.length} · látott: ${seen.size}/${SE_FACTS.length}</span><button type="button" class="btn line" data-sefn="1">Következő ›</button></div>
   <button type="button" class="btn pri" id="seFactX">${SE.phase==='play'?'▶ Vissza a játékba':'Bezárás'}</button>`;
  o.querySelectorAll('[data-sefc]').forEach(b=>b.onclick=()=>{SE.factF=b.dataset.sefc;seFacts()});o.querySelectorAll('[data-sefn]').forEach(b=>b.onclick=()=>{const L=SE.factF&&SE.factF!=='all'?SE_FACTS.map((x,j)=>j).filter(j=>SE_FACTS[j][0]===SE.factF):SE_FACTS.map((x,j)=>j);const p=L.indexOf(SE.factI);seFacts(L[(p+Number(b.dataset.sefn)+L.length)%L.length])});
  $('#seFactX').onclick=seBagClose;seFactBadge()}
function seFactBadge(){const b=$('#seFactBtn');if(!b)return;const n=SE_FACTS.length-seFactSeen().size;b.dataset.n=n>0?n:'';}
function seFactLine(){const F=SE_FACTS[Math.floor(Math.random()*SE_FACTS.length)],C=SE_FCAT[F[0]];return `<div class="sefact sm" data-st="--fc:${C[2]}"><span class="sefcat">💡 Tudtad? · ${C[0]} ${C[1]}</span><b>${esc(F[1])}</b><p>${esc(F[2])}</p>${F[3]?`<em>Ítélet: ${esc(F[3])}</em>`:''}</div>`}

// első indításkor: gyakorlás vagy azonnal indulás
function seTutAsk(){const o=$('#seOver');o.hidden=false;o.innerHTML=`<h3>🎓 Gyakorlás?</h3><p>Rövid bevezető az új irányításhoz: koppintás, fedezék, akadályok, árok, őr, gyűjtés (kb. 2 perc).</p><button type="button" class="btn pri sebig" id="seTA1">🎓 Gyakorlás</button><button type="button" class="btn line sebig" id="seTA2" data-st="margin-top:8px">⏭ Kihagyom – indulás</button>`;
  $('#seTA1').onclick=()=>{o.hidden=true;seTutStart()};$('#seTA2').onclick=()=>{try{localStorage.setItem(SE_TUTKEY,'1')}catch(e){}o.hidden=true;seStart()}}

// ===== Hátizsák összeállítása a PzH roncsa mellett: ami nincs nálad, annak ára van =====
const SE_KITMAX=7;// kg – könnyű kitérési csomag
const SE_KIT_ITEMS=[
 ['radio','📻','Túlélőrádió (PRC)',0.9,'Kapcsolat a mentőkkel'],
 ['water','💧','Kulacs + víztisztító tabletta',1.2,'Biztonságos ivóvíz'],
 ['fire','🔥','Tűzacél + tapló',0.2,'Tűzgyújtás bármilyen időben'],
 ['knife','🔪','Kés',0.3,'Menedék, gallyak, élelem'],
 ['compass','🧭','Iránytű + térkép',0.3,'Tájékozódás'],
 ['med','✚','Egyéni elsősegélycsomag',0.5,'Vérzéscsillapítás, kötés'],
 ['mirror','🪞','Jelzőtükör + síp',0.2,'Jelzés a mentőknek'],
 ['poncho','🛡️','Poncsó / hővédő fólia',0.4,'Eső, hideg – és a hőkamera ellen'],
 ['mre','🍫','Harci élelem (2 adag)',1.4,'Energia, ha elfogy az erőd'],
 ['camo','🎨','Álcafesték',0.1,'Arc és kéz álcázása'],
 ['cord','🪢','Paracord, 10 m',0.2,'Menedékhez, rögzítéshez'],
 ['socks','🧦','Száraz zokni',0.2,'Lábápolás, nincs vízhólyag'],
 ['helmet','⛑️','Rohamsisak',1.4,'Fejvédelem – de nehéz'],
 ['phone','📱','Saját mobiltelefon',0.2,'„Hátha lesz térerő…”'],
 ['tablet','💻','Tűzvezető tablet',2.0,'Tele adatokkal az egységről'],
 ['ammo','🎒','Tartalék lőszer, 2 heveder',3.0,'Fegyvered nincs – a roncsban maradt']];
const SE_KIT_WHY={radio:'Nélküle nem kapod meg a kivonási pontot – vissza kell menned a roncs rádiójához.',water:'Nélküle a patakvíz kockázatos – kevesebbet ihatsz.',fire:'Nélküle nincs tűz az éjszakában.',knife:'Nélküle nehezebb a menedék (több ág kell).',compass:'Nélküle kerülőt teszel – hosszabb az út.',med:'Nélküle a sérülés jobban fáj.',mirror:'Nélküle nehezebb jelezni a helikopternek.',poncho:'A hőkamera kevésbé lát, és nem fázol annyira.',mre:'Ha nagyon elfogy az erőd, magától eszel belőle.',camo:'Messziről kevésbé látszol.',cord:'A menedékhez kevesebb ág kell.',socks:'Nélküle a 2. naptól vízhólyag – lassabb vagy.',helmet:'Kevesebbet sebződsz – de nehéz.',phone:'Bemérhető, és elfogáskor mindent kiolvasnak belőle.',tablet:'Ha elfognak, az ellenség kezébe kerülnek az egység adatai.',ammo:'Fegyver nélkül csak nehezék.'};
const seKit=id=>(SE.kit||[]).includes(id);
const seKitW=()=>(SE.kit||[]).reduce((s,id)=>s+(SE_KIT_ITEMS.find(k=>k[0]===id)||[0,0,0,0])[3],0);
const seLN=()=>3+(seKit('knife')?0:1)+(seKit('cord')?0:1);// menedékhez szükséges ágak
function seKitPick(){SE.phase='kit';SE.kit=SE.kit||[];SE.tgt=null;const o=$('#seOver');o.hidden=false;o.classList.add('sekitp');seKitRender();seSave()}
function seKitRender(){const o=$('#seOver'),w=seKitW();o.innerHTML=`<h3>🎒 Mit viszel magaddal?</h3><p class="sesm">A roncsból ennyit tudtál kimenteni – ott hever melletted a földön. Legfeljebb <b>${SE_KITMAX} kg</b> fér a hátizsákba. Gondold át: ami nincs nálad, annak később ára lesz.</p>
  <div class="sekw"><i data-st="width:${Math.min(100,w/SE_KITMAX*100)}%;background:${w>SE_KITMAX*.85?'#ffb43e':'#9dff9d'}"></i><b>${w.toFixed(1).replace('.',',')} / ${SE_KITMAX} kg</b></div>
  <div class="sekgrid">${SE_KIT_ITEMS.map(([id,ic,n,kg,h])=>`<button type="button" class="${seKit(id)?'on':''}" data-sekit="${id}"><i>${ic}</i><b>${esc(n)}</b><span>${esc(h)}</span><em>${String(kg).replace('.',',')} kg</em></button>`).join('')}</div>
  <button type="button" class="sebuddy ${SE.buddy?'on':''}" id="seBuddy">🤕 <b>${esc(SE.budName||'Kovács')} őrvezető</b>, a töltőkezelő sérülten, de él. ${SE.buddy?'✅ Viszed magaddal – lassabb leszel, többet fogytok, de nem hagyod hátra.':'Viszed magaddal? (koppints)'}</button>${SE.buddy?`<label class="sesm" data-st="display:block;margin:-2px 0 8px">Bajtársad neve: <input id="seBudName" class="secmin" data-st="font-size:15px;padding:8px;margin:4px 0 0" maxlength="16" value="${esc(SE.budName||'Kovács')}"></label>`:''}<div class="sekinfo" id="seKitInfo">${SE.kitLast?esc(SE_KIT_ITEMS.find(x=>x[0]===SE.kitLast)[2]+': '+SE_KIT_ITEMS.find(x=>x[0]===SE.kitLast)[4]):'Koppints egy tárgyra a bepakoláshoz – még egyszer: kiveszed.'}</div><button type="button" class="btn pri sebig" id="seKitGo">✔ Bepakoltam – indulás</button>`;
  o.querySelectorAll('[data-sekit]').forEach(b=>b.onclick=()=>{const id=b.dataset.sekit,k=SE.kit;SE.kitLast=id;if(k.includes(id))SE.kit=k.filter(x=>x!==id);else{const kg=SE_KIT_ITEMS.find(x=>x[0]===id)[3];if(seKitW()+kg>SE_KITMAX+1e-6){sePop(`⚖️ Nem fér bele – már ${seKitW().toFixed(1).replace('.',',')} kg`,'#ffb43e');seBeep(220,.12,.04);return}SE.kit=[...k,id]}try{saRustle(.05)}catch(e){}seKitRender()});
  $('#seKitGo').onclick=seKitDone;$('#seBuddy').onclick=()=>{SE.buddy=!SE.buddy;try{saRustle(.05)}catch(e){}seKitRender()};const bn=$('#seBudName');if(bn){bn.addEventListener('keydown',e=>e.stopPropagation());bn.oninput=()=>{SE.budName=bn.value.trim().slice(0,16)||'Kovács'}}}
function seKitDone(){SE.kitDone=1;if(SE.wx)setTimeout(()=>{if(SE.phase==='play')seRadio(SE_WX[SE.wx][0]+' '+SE_WX[SE.wx][2],4500)},12000);const o=$('#seOver');o.hidden=true;o.classList.remove('sekitp');SE.phase='play';if(seKit('camo'))SE.camo=true;SE.mre=seKit('mre')?2:0;
  const n=(SE.kit||[]).length;seRadio(n?`🎒 Bepakolva: ${(SE.kit||[]).map(id=>SE_KIT_ITEMS.find(k=>k[0]===id)[1]).join(' ')} – ${seKitW().toFixed(1).replace('.',',')} kg`:'🎒 Üres kézzel indulsz…',4500);seTray();seBanner(1);
  setTimeout(()=>{if(SE.phase==='play'&&SE.day===1&&SE.al===0)seEvent('stop')},2200);setTimeout(()=>{if(SE.phase==='play')seRadio(`🔐 Hitelesítő jelszavad: ${SE.auth} – jegyezd meg! A kivonáskor kérik. (🎒 hátizsákban is látod.)`,6000)},8000);seSave()}
// a hátizsák súlya lassít
const seKitSpd=()=>1-Math.max(0,seKitW()-4.5)*.04;
function seKitUse(id,msg){SE.kitUsed=SE.kitUsed||{};if(!SE.kitUsed[id]){SE.kitUsed[id]=1;sePts('kit',60)}if(msg)sePop(msg,'#9fd8ff')}
function seKitMiss(id,msg){SE.kitMiss=SE.kitMiss||{};SE.kitMiss[id]=1;if(msg)seRadio(msg,5500)}
function seKitSummary(){const used=Object.keys(SE.kitUsed||{}),miss=Object.keys(SE.kitMiss||{}),bad=(SE.kit||[]).filter(id=>['phone','tablet','ammo'].includes(id)),nm=id=>{const k=SE_KIT_ITEMS.find(x=>x[0]===id);return k?k[1]+' '+k[2]:id};
  return `<div class="rkres"><div><span>🎒 Hátizsák</span><b>${seKitW().toFixed(1).replace('.',',')} kg</b></div>${used.length?`<div><span>✅ Jól jött</span><b>${used.map(nm).join(', ')}</b></div>`:''}${miss.length?`<div><span>❌ Hiányzott</span><b>${miss.map(nm).join(', ')}</b></div>`:''}${bad.length?`<div><span>⚠️ Felesleges / veszélyes</span><b>${bad.map(nm).join(', ')}</b></div>`:''}</div>`}

// ===== v3.3: drón-, növény-, elsősegély-ismeret, útvonal, időjárás, bajtárs, felülnézeti szökés =====
Object.assign(SE_EV,{
 aid:{ic:'✚',t:'Erős vérzés a combon – 1/3',q:'Egy lezuhant ág felsértette a combod, a vér lüktetve spriccel. Hová teszed az érszorítót?',o:[['A seb fölé 5–7 cm-rel, nem ízületre',1,'Jó: a seb és a szív közé, ízület fölé soha. Ha nem látod pontosan a sebet: magasan, a végtag tövénél.'],['Közvetlenül a sebre',0,'A seb közvetlenül nem szorítható el így – a seb FÖLÉ kell, a szív felé.'],['A seb alá, a térd felé',0,'Alá téve nem állítja el a vérzést – a vér felülről jön.']],next:'aid2'},
 aid2:{ic:'✚',t:'Érszorító – 2/3',q:'Rajta van az érszorító. Meddig húzod meg?',o:[['Addig tekerem, amíg a vérzés teljesen el nem áll',1,'Helyes: addig szorítsd, amíg a vérzés megáll – fájni fog, ez normális.'],['Csak lazán, hogy ne fájjon',0,'A laza érszorító csak a vénás visszaáramlást zárja el – a vérzés erősödik!'],['Amíg el nem zsibbad a lábam',0,'Nem az érzés a mérce, hanem az, hogy a vérzés megálljon.']],next:'aid3'},
 aid3:{ic:'✚',t:'Érszorító – 3/3',q:'A vérzés elállt. Mit teszel még?',o:[['Felírom az időpontot (pl. az érszorítóra), és nem lazítom meg',1,'Így az orvos tudja, mióta van fent. Ne lazítsd meg magadtól – az újra vérzést indít.'],['Fél óra múlva leveszem',0,'Magadtól ne vedd le – az ellátóhelyen döntenek róla.'],['Betakarom, hogy ne lássák',0,'Takarni nem kell – épp az a fontos, hogy jól látható legyen, és ott legyen rajta az időpont.']]},
 dr_recon:{ic:'🛸',t:'Drón – halk zümmögés felülről',q:'Magasan, egy helyben álló kis quadkopter zümmög – felderítő drón. Mit teszel?',o:[['Takarásban mozdulatlan maradok, nem nézek fel, megvárom, míg továbbmegy',1,'A kamera a mozgást és a fénylő arcot veszi észre leghamarabb. Lombkorona alatt, mozdulatlanul a legnehezebb észrevenni.'],['Gyorsan átfutok a tisztáson, mielőtt odaér',0,'A mozgás az első, amit a drón operátora észrevesz.'],['Felnézek, hogy lássam, milyen típus',0,'Az arc fénylik és mozog – így vesznek észre.']]},
 dr_fpv:{ic:'🛸',t:'Drón – éles, magas sivítás',q:'Gyorsan közeledő, sivító kis drón (FPV) – gyakran támadó. Mit teszel?',o:[['Azonnal sűrű takarásba, fák, árok, épület alá – kitörök a látóteréből',1,'Az FPV-t a pilóta a kamerája képe alapján vezeti: ha kikerülsz a látóteréből, nehéz utolérnie.'],['Megállok a nyílt terepen, hátha nem lát',0,'Nyílt terepen könnyű célpont vagy – takarás kell.'],['Elfutok egyenesen a mezőn át',0,'A drón gyorsabb nálad – nyílt terepen nincs esélyed.']]},
 dr_therm:{ic:'🛸',t:'Drón – mély zúgás az éjszakában',q:'Éjjel egyenletes, mély zúgás – hőkamerás drón pásztáz. Mit teszel?',o:[['Hővédő fóliával / poncsóval takarom magam, fák alatt, mozdulatlanul',1,'A hőkamera a testhőt látja: a takarás, a hideg talaj és a mozdulatlanság csökkenti a jeled.'],['Tüzet rakok, hogy ne fázzak',0,'A tűz a hőkamerán kilométerekről világít.'],['Sötét van, úgysem lát – megyek tovább',0,'A hőkamerának nem kell fény – a sötétben is lát.']]},
 pl_medve:{ic:'🌿',ed:1,t:'Széles levelek a patakparton',q:'Árnyékos, nedves erdőben széles, lándzsás levelek. Medvehagyma lehet?',o:[['Csak ha elmorzsolva erős fokhagymaszagú – a gyöngyvirág és az őszi kikerics halálos hasonmás',1,'Jó: a medvehagyma levele elmorzsolva erős fokhagymaszagú. Kétség esetén nem eszed meg – Magyarországon minden évben van mérgezés emiatt.'],['Minden ilyen széles levél medvehagyma',0,'Hibás – a gyöngyvirág és az őszi kikerics levele nagyon hasonlít, és mérgező.'],['Megeszem, a hasonmásai is ehetők',0,'A gyöngyvirág és a kikerics mérgező, akár halálos is.']]},
 pl_gyongy:{ic:'🌿',ed:0,t:'Fehér harangvirágok',q:'Két széles, fényes levél, köztük apró fehér harangvirágok sorban. Megeszed?',o:[['Nem – ez gyöngyvirág, mérgező',1,'A gyöngyvirág szívre ható mérgeket tartalmaz – a medvehagyma veszélyes hasonmása.'],['Igen, a virág ehető',0,'A gyöngyvirág minden része mérgező.'],['Megfőzöm, akkor ehető',0,'A főzés nem bontja le a mérgét.']]},
 pl_kikerics:{ic:'🌸',ed:0,t:'Lila virág a réten',q:'Lila, krókuszszerű virágok a réten, levél nélkül. Mit kezdesz vele?',o:[['Hozzá sem nyúlok – őszi kikerics, halálosan mérgező',1,'Az őszi kikerics minden része erősen mérgező, a levele tavasszal a medvehagymához hasonlít.'],['Megeszem a hagymáját',0,'A gumója is mérgező – halálos lehet.'],['A virágát megeszem',0,'A virága is mérgező.']]},
 pl_csalan:{ic:'🌿',ed:1,t:'Csalán a tisztás szélén',q:'Nagy csalánfolt. Hasznos?',o:[['Igen: a fiatal hajtásvégeket leforrázva / megfőzve megeszem',1,'A csalán tápláló, főzve elveszti a csípősségét. Kesztyűvel vagy óvatosan szedd.'],['Mérgező, nem eszem',0,'A csalán nem mérgező – főzve kiváló étel.'],['Nyersen, marékszám eszem',0,'Nyersen csíp és irritál – főzni kell.']]},
 pl_bodza:{ic:'🫐',ed:1,t:'Fekete bogyófürtök',q:'Fekete bodza érett, fekete bogyófürtökkel. Mit teszel?',o:[['Csak érett, megfőzött bogyót eszem',1,'A nyers vagy éretlen bodzabogyó és a szár hánytató – főzve biztonságos.'],['Nyersen, szárral együtt megeszem',0,'A nyers bogyó, a szár és a levél hányingert okoz.'],['Az éretlen zöld bogyókat is',0,'Az éretlen bogyó mérgezőbb.']]},
 pl_galagonya:{ic:'🔴',ed:1,t:'Piros bogyók tüskés bokron',q:'Apró piros bogyók egy tüskés bokron (galagonya). Ehető?',o:[['Igen, a húsa ehető, a magját kiköpöm',1,'A galagonya termése ehető, a magját ne edd meg.'],['Nem, minden piros bogyó mérgező',0,'Nem minden – a galagonya ehető, de csak biztos felismerés esetén.'],['Magostul, sokat eszem',0,'A magját nem eszik.']]},
 pl_makk:{ic:'🌰',ed:1,t:'Tölgymakk a földön',q:'Sok tölgymakk a földön. Ehető?',o:[['Hámozva, többszöri vízben kiáztatva vagy kifőzve',1,'A makk sok csersavat tartalmaz – kilúgozás után tápláló.'],['Nyersen, ahogy van',0,'Nyersen keserű, a csersav gyomorpanaszt okoz.'],['Egyáltalán nem ehető',0,'Kilúgozva ehető – régen lisztet is őröltek belőle.']]},
 pl_pitypang:{ic:'🌼',ed:1,t:'Pitypang a réten',q:'Sárga virágú gyermekláncfű (pitypang). Ehető?',o:[['Igen, a levele és a virága is ehető',1,'A fiatal levél kissé keserű, de tápláló – könnyen felismerhető.'],['Csak a tejnedve',0,'A tejnedv keserű – a levelét és virágát eszik.'],['Nem, mérgező',0,'A pitypang ehető.']]}});
const SE_WX={nyar:['☀️','nyár','Kánikula: kétszer annyi víz fogy'],tel:['❄️','tél','Hó, hideg: az éjszaka veszélyesebb'],kod:['🌫️','köd','Köd: rosszabb a látás – nekik is'],osz:['🍂','ősz','Ősz: gyakori eső']};
const seWxIc=()=>{const w=SE_WX[SE.wx];return w?w[0]+' '+w[1]:''};
const seDrain=()=>(SE.wx==='nyar'?1.5:1)*(SE.route==='stream'?.6:1)*(SE.buddy?1.2:1);
// útvonal-választás a rádió után
function seRouteAsk(){const o=$('#seOver');o.innerHTML=`<h3>🗺️ Útvonal a kivonási pontig</h3><p class="sesm">A térkép alapján három lehetőség. Mindegyiknek ára van.</p>
  <div class="seroute"><button type="button" data-seroute="forest"><b>🌲 Erdőn át</b><span>Kiegyensúlyozott: takarás, átlagos őrsűrűség.</span></button><button type="button" data-seroute="stream"><b>🌊 A patakvölgyben</b><span>+1,5 km, de kevesebb őr, sok víz, a kutya elveszti a nyomod.</span></button><button type="button" data-seroute="road"><b>🛣️ Az út mentén</b><span>−2 km, de sokkal több őr és jármű.</span></button></div>`;
  o.querySelectorAll('[data-seroute]').forEach(b=>b.onclick=()=>{SE.route=b.dataset.seroute;SE.kmD+=SE.route==='stream'?1500:SE.route==='road'?-2000:0;SE.kmR=SE.kmD;sePop({forest:'🌲 Erdőn át',stream:'🌊 Patakvölgy',road:'🛣️ Út mentén'}[SE.route],'#9fd8ff');seBagClose();seAlDone('comms')})}
// ===== felülnézeti szökés a fogolytáborból =====
const TD_MW=24,TD_MH=36,TD_B=[[3,22,7,5],[14,22,7,5],[3,12,6,4],[15,11,6,5]],TD_C=[[10,17,1.3,1.3],[11.6,29,1.3,1.3],[19,6.5,1.3,1.3],[5.2,6.5,1.3,1.3],[20.5,30,1.3,1.3]];
function seTDBuild(){const C=SE.capRes||{};SE.phase='td';SE.tod=.66;SE.td={x:12,y:33.5,tx:null,ty:null,mode:'sneak',det:0,t:0,noise:0,drain:!!C.bok,
  ex:[{x:4.2,y:1.2,n:'Kerítés alatt',ic:'🐛'},{x:12,y:1.2,n:'Kapu',ic:'🚧'},{x:23,y:18,n:'Csatorna',ic:'🕳️',hid:!C.bok}],
  g:[{x:3,y:19,wp:[[3,19],[21,19]],i:1,a:0,sp:1.2,wait:0,r:7},{x:10,y:9,wp:[[10,9],[10,3.5],[18,3.5],[18,9]],i:1,a:0,sp:1.1,wait:0,r:7},{x:12,y:3,wp:[[12,3]],i:0,a:Math.PI/2,sp:0,wait:0,r:6,gate:1},{x:2,y:30,wp:[[2,30],[2,14]],i:1,a:0,sp:1.6,wait:0,r:4,dog:1}],sl:{a:0}};
  rockStart('sere_t');rockTempo(100);seTray()}
function seTDBlocked(x,y){if(x<1||x>TD_MW-1||y<.6||y>TD_MH-1)return true;for(const r of [...TD_B,...TD_C])if(x>r[0]-.3&&x<r[0]+r[2]+.3&&y>r[1]-.3&&y<r[1]+r[3]+.3)return true;return false}
function seTDLos(ax,ay,bx,by){for(let i=1;i<14;i++){const k=i/14,x=ax+(bx-ax)*k,y=ay+(by-ay)*k;for(const r of TD_B)if(x>r[0]&&x<r[0]+r[2]&&y>r[1]&&y<r[1]+r[3])return false;for(const r of TD_C)if(k>.8&&x>r[0]-.2&&x<r[0]+r[2]+.2&&y>r[1]-.2&&y<r[1]+r[3]+.2)return false}return true}

function seTDView(){const W=SE.W,H=SE.H,k=Math.min(W/TD_MW,H/TD_MH);return {k,ox:(W-TD_MW*k)/2,oy:(H-TD_MH*k)/2}}
function seTDTick(dt){const T=SE.td;if(!T)return;T.t+=dt;
  if(T.tx!=null){const dx=T.tx-T.x,dy=T.ty-T.y,d=Math.hypot(dx,dy),sp=(T.mode==='run'?3.2:1.15)*(SE.buddy?.85:1);if(d<.15){if(T.path&&T.path.length>1){T.path.shift();T.tx=T.path[0][0];T.ty=T.path[0][1]}else{T.tx=null;T.path=null}}else{T.pa=Math.atan2(dy,dx);const st=Math.min(d,sp*dt),nx=T.x+dx/d*st,ny=T.y+dy/d*st;if(!seTDBlocked(nx,ny)){T.x=nx;T.y=ny}else if(!seTDBlocked(nx,T.y))T.x=nx;else if(!seTDBlocked(T.x,ny))T.y=ny;else T.tx=null;T.noise=T.mode==='run'?5:1.2}}else T.noise=0;if(SE.buddy){const bx=T.bx==null?T.x:T.bx,by=T.by==null?T.y+.8:T.by,dd=Math.hypot(T.x-bx,T.y-by);if(dd>.9){T.bx=bx+(T.x-bx)/dd*(dd-.9);T.by=by+(T.y-by)/dd*(dd-.9);T.ba=Math.atan2(T.y-by,T.x-bx)}else{T.bx=bx;T.by=by}}
  T.sl.a+=dt*.45;const slx=12+7*Math.cos(T.sl.a),sly=17+9*Math.sin(T.sl.a*1.3);T.sl.x=slx;T.sl.y=sly;
  let seen=0;const shade=TD_B.some(r=>T.x>r[0]-1.1&&T.x<r[0]+r[2]+1.1&&T.y>r[1]-1.1&&T.y<r[1]+r[3]+1.1);
  for(const g of T.g){const w=g.wp[g.i%g.wp.length];
    if(g.alert>0){g.alert-=dt;g.a=Math.atan2(T.y-g.y,T.x-g.x)}
    else if(g.sp>0){if(g.wait>0){g.wait-=dt;g.a+=Math.sin(T.t*2)*dt}else{const dx=w[0]-g.x,dy=w[1]-g.y,d=Math.hypot(dx,dy);if(d<.1){g.i++;g.wait=1.4}else{g.x+=dx/d*Math.min(d,g.sp*dt);g.y+=dy/d*Math.min(d,g.sp*dt);g.a=Math.atan2(dy,dx)}}}
    else g.a=Math.PI/2+Math.sin(T.t*.6)*1.05;
    const dx=T.x-g.x,dy=T.y-g.y,d=Math.hypot(dx,dy);let ad=Math.abs(((Math.atan2(dy,dx)-g.a)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI);
    if(d<g.r&&ad<(g.dog?.5:.55)&&seTDLos(g.x,g.y,T.x,T.y)){const v=(1.6-d/g.r)*(T.mode==='run'?1.4:1)*(shade?.5:1);seen=Math.max(seen,v);g.alert=2.5}
    if(d<T.noise+(g.dog?1.5:0)){seen=Math.max(seen,.5);g.alert=Math.max(g.alert||0,2)}
    if(d<.8){T.det=1}}
  if(Math.hypot(T.x-T.sl.x,T.y-T.sl.y)<2.3&&!shade)seen=Math.max(seen,1.4);
  T.det=seen>0?Math.min(1,T.det+seen*dt*.75):Math.max(0,T.det-.18*dt);SE.det=T.det;
  for(const x of T.ex)if(Math.hypot(T.x-x.x,T.y-x.y)<1.4){if(x.hid){x.hid=false;sePop('🕳️ Találtál egy csatornát!','#9dff9d')}SE.td=null;SE.phase='play';sePop(`🏃 Kijutottál – ${x.n}!`,'#9dff9d');SE.objs=[];SE.genX=SE.x+8;SE.y=0;seCineStart('esc',x.n);return}
  if(T.det>=1){SE.td=null;SE.det=0;seEscFail()}}

// ===== felülnézet v2: útkeresés + élethűbb rajz =====
const TD_G=2;// rácssűrűség: cella / m
function seTDGrid(){if(SE._tdg)return SE._tdg;const W=TD_MW*TD_G,H=TD_MH*TD_G,g=new Uint8Array(W*H);for(let j=0;j<H;j++)for(let i=0;i<W;i++)g[j*W+i]=seTDBlocked((i+.5)/TD_G,(j+.5)/TD_G)?1:0;return SE._tdg={W,H,g}}
function seTDPath(sx,sy,tx,ty){const G=seTDGrid(),W=G.W,H=G.H,cl=(v,m)=>Math.max(0,Math.min(m-1,v)),s=cl(Math.floor(sy*TD_G),H)*W+cl(Math.floor(sx*TD_G),W);let t=cl(Math.floor(ty*TD_G),H)*W+cl(Math.floor(tx*TD_G),W);
  if(G.g[t]){let best=-1,bd=1e9;for(let j=-6;j<=6;j++)for(let i=-6;i<=6;i++){const y=Math.floor(t/W)+j,x=t%W+i;if(x<0||y<0||x>=W||y>=H||G.g[y*W+x])continue;const d=i*i+j*j;if(d<bd){bd=d;best=y*W+x}}if(best<0)return null;t=best}
  const gs=new Float32Array(W*H).fill(1e9),from=new Int32Array(W*H).fill(-1),open=[s],h=n=>Math.hypot(n%W-t%W,Math.floor(n/W)-Math.floor(t/W));gs[s]=0;const inO=new Uint8Array(W*H);inO[s]=1;let it=0;
  while(open.length&&it++<6000){let bi=0;for(let i=1;i<open.length;i++)if(gs[open[i]]+h(open[i])<gs[open[bi]]+h(open[bi]))bi=i;const n=open.splice(bi,1)[0];inO[n]=0;if(n===t)break;const x=n%W,y=Math.floor(n/W);
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const m=ny*W+nx;if(G.g[m])continue;if(dx&&dy&&(G.g[y*W+nx]||G.g[ny*W+x]))continue;const ng=gs[n]+(dx&&dy?1.414:1);if(ng<gs[m]){gs[m]=ng;from[m]=n;if(!inO[m]){inO[m]=1;open.push(m)}}}}
  if(from[t]<0&&t!==s)return null;const path=[];for(let n=t;n!==s&&n>=0;n=from[n])path.push([(n%W+.5)/TD_G,(Math.floor(n/W)+.5)/TD_G]);path.reverse();
  // egyszerűsítés: kihagyjuk a látótávon belüli köztes pontokat
  const out=[];let cx=sx,cy=sy,i=0;while(i<path.length){let j=path.length-1;while(j>i&&!seTDClear(cx,cy,path[j][0],path[j][1]))j--;out.push(path[j]);cx=path[j][0];cy=path[j][1];i=j+1}return out}
function seTDClear(ax,ay,bx,by){const n=Math.ceil(Math.hypot(bx-ax,by-ay)*4);for(let i=1;i<=n;i++){const k=i/n;if(seTDBlocked(ax+(bx-ax)*k,ay+(by-ay)*k))return false}return true}
function seTDTap(e){const T=SE.td;if(!T||SE.paused)return;const r=SE.cv.getBoundingClientRect(),L=seTDView(),tx=(e.clientX-r.left-L.ox)/L.k,ty=(e.clientY-r.top-L.oy)/L.k;
  const p=seTDPath(T.x,T.y,Math.max(1.2,Math.min(TD_MW-1.2,tx)),Math.max(.8,Math.min(TD_MH-1.2,ty)));if(!p||!p.length){sePop('⛔ Oda nem vezet út','#ffb43e');return}T.path=p;T.tx=p[0][0];T.ty=p[0][1];T.fx=p[p.length-1][0];T.fy=p[p.length-1][1];seClick(.5)}
// előre megrajzolt háttér (terep, utak, épületek, kerítés)
function seTDBg(W,H){const key=W+'x'+H+SE.wx;if(SE._tdbg&&SE._tdbg.key===key)return SE._tdbg.cv;const V=seTDView(),k=V.k,dpr=Math.min(2,devicePixelRatio||1),cv=document.createElement('canvas');cv.width=W*dpr;cv.height=H*dpr;const c=cv.getContext('2d');c.scale(dpr,dpr);
  const P=(x,y)=>[V.ox+x*k,V.oy+y*k],snow=SE.wx==='tel';c.fillStyle='#050706';c.fillRect(0,0,W,H);
  // terep: fű / hó foltokkal
  c.fillStyle=snow?'#c9d0d6':'#25301c';c.fillRect(V.ox-3*k,V.oy-3*k,(TD_MW+6)*k,(TD_MH+6)*k);
  for(let i=0;i<900;i++){const x=V.ox-3*k+seH(i*1.7)*(TD_MW+6)*k,y=V.oy-3*k+seH(i*3.3)*(TD_MH+6)*k,r=(.15+seH(i*5.1)*.5)*k;c.fillStyle=snow?`rgba(255,255,255,${.15+seH(i)*.25})`:`rgba(${30+seH(i)*30|0},${45+seH(i*2)*35|0},${22+seH(i*4)*18|0},.55)`;c.beginPath();c.arc(x,y,r,0,7);c.fill()}
  // kitaposott földút a táborban
  c.strokeStyle=snow?'rgba(120,110,95,.55)':'rgba(92,74,48,.75)';c.lineCap='round';c.lineWidth=1.6*k;c.beginPath();let p=P(12,35);c.moveTo(...p);p=P(12,19.2);c.lineTo(...p);p=P(3,19.2);c.moveTo(...p);p=P(21,19.2);c.lineTo(...p);p=P(12,19.2);c.moveTo(...p);p=P(12,1);c.lineTo(...p);p=P(10,9);c.moveTo(...p);p=P(10,3.5);c.lineTo(...p);p=P(18,3.5);c.lineTo(...p);p=P(18,9);c.lineTo(...p);c.stroke();
  for(let i=0;i<120;i++){const x=V.ox+(10.8+seH(i*9)*2.4)*k,y=V.oy+seH(i*7)*34*k;c.fillStyle='rgba(60,48,30,.35)';c.fillRect(x,y,.12*k,.25*k)}// keréknyom
  // fák a kerítésen kívül (lombkorona felülről)
  for(let i=0;i<46;i++){const side=i%2,x=side?(TD_MW+.4+seH(i)*2.2):(-.4-seH(i)*2.2),y=seH(i*4.1)*TD_MH,[px,py]=P(x,y),r=(.9+seH(i*2.7)*.9)*k;c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.arc(px+.35*k,py+.35*k,r,0,7);c.fill();c.fillStyle=snow?'#4a5a48':'#1a2a14';c.beginPath();c.arc(px,py,r,0,7);c.fill();c.fillStyle=snow?'rgba(255,255,255,.55)':'rgba(70,100,45,.6)';c.beginPath();c.arc(px-r*.25,py-r*.25,r*.55,0,7);c.fill()}
  // épületek: árnyék, hullámlemez tető gerinccel
  for(const r of TD_B){const [x,y]=P(r[0],r[1]),w=r[2]*k,h=r[3]*k;c.fillStyle='rgba(0,0,0,.45)';c.fillRect(x+.6*k,y+.6*k,w,h);const g=c.createLinearGradient(x,y,x,y+h);g.addColorStop(0,snow?'#e6eaee':'#4d5048');g.addColorStop(.5,snow?'#cfd5da':'#3a3c36');g.addColorStop(.501,snow?'#bcc3c9':'#2f312c');g.addColorStop(1,snow?'#d8dde1':'#40433b');c.fillStyle=g;c.fillRect(x,y,w,h);
    c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=1;for(let i=1;i<r[2]*3;i++){c.beginPath();c.moveTo(x+i*k/3,y);c.lineTo(x+i*k/3,y+h);c.stroke()}c.strokeStyle='rgba(255,255,255,.18)';c.beginPath();c.moveTo(x,y+h/2);c.lineTo(x+w,y+h/2);c.stroke();c.strokeStyle='#1a1b18';c.lineWidth=2;c.strokeRect(x,y,w,h);
    c.fillStyle='#2a2a26';c.fillRect(x+w*.45,y+h-2,w*.1,.25*k)}// ajtó
  // ládák
  for(const r of TD_C){const [x,y]=P(r[0],r[1]),w=r[2]*k,h=r[3]*k;c.fillStyle='rgba(0,0,0,.4)';c.fillRect(x+.25*k,y+.25*k,w,h);c.fillStyle='#6b4f2c';c.fillRect(x,y,w,h);c.strokeStyle='#3a2a16';c.lineWidth=1.5;c.strokeRect(x,y,w,h);c.beginPath();c.moveTo(x,y);c.lineTo(x+w,y+h);c.moveTo(x+w,y);c.lineTo(x,y+h);c.stroke()}
  // kerítés: oszlopok + drót
  const fx0=1,fy0=.6,fx1=TD_MW-1,fy1=TD_MH-1;c.strokeStyle='rgba(190,190,180,.55)';c.lineWidth=1;for(const o of [0,.12]){c.strokeRect(V.ox+(fx0+o)*k,V.oy+(fy0+o)*k,(fx1-fx0-2*o)*k,(fy1-fy0-2*o)*k)}
  c.fillStyle='#2a2a26';for(let x=fx0;x<=fx1;x+=1.5){for(const y of [fy0,fy1]){const [px,py]=P(x,y);c.fillRect(px-2,py-2,4,4)}}for(let y=fy0;y<=fy1;y+=1.5){for(const x of [fx0,fx1]){const [px,py]=P(x,y);c.fillRect(px-2,py-2,4,4)}}
  // őrtorony a sarokban
  const [tx,ty]=P(21.6,33.6);c.fillStyle='rgba(0,0,0,.45)';c.fillRect(tx-1*k+.5*k,ty-1*k+.5*k,2*k,2*k);c.fillStyle='#3b2e20';c.fillRect(tx-k,ty-k,2*k,2*k);c.strokeStyle='#1a140c';c.lineWidth=2;c.strokeRect(tx-k,ty-k,2*k,2*k);c.beginPath();c.moveTo(tx-k,ty-k);c.lineTo(tx+k,ty+k);c.moveTo(tx+k,ty-k);c.lineTo(tx-k,ty+k);c.stroke();
  // lámpaoszlopok
  for(const [lx,ly] of SE_TDL){const [px,py]=P(lx,ly);c.fillStyle='#111';c.beginPath();c.arc(px,py,.18*k,0,7);c.fill()}
  SE._tdbg={key,cv};return cv}
const SE_TDL=[[12,28.5],[12,10],[3,9.5],[21,9.5]];
// felülnézeti katona-figura
function seTDMan(c,x,y,a,k,col,kind,step){c.save();c.translate(x,y);c.rotate(a);const s=k;
  if(kind==='dog'){c.fillStyle='#4a3a28';c.beginPath();c.ellipse(0,0,.45*s,.17*s,0,0,7);c.fill();c.beginPath();c.ellipse(.5*s,0,.16*s,.12*s,0,0,7);c.fill();c.fillRect(-.7*s,-.03*s,.28*s,.06*s);c.restore();return}
  c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(.08*s,.08*s,.26*s,.36*s,0,0,7);c.fill();
  const sw=Math.sin(step||0)*.12*s;c.fillStyle=col;c.beginPath();c.ellipse(sw*.3,-.2*s,.09*s,.11*s,0,0,7);c.ellipse(-sw*.3,.2*s,.09*s,.11*s,0,0,7);c.fill();// karok
  c.beginPath();c.ellipse(-.04*s,0,.17*s,.3*s,0,0,7);c.fill();c.fillStyle='rgba(0,0,0,.25)';c.fillRect(-.2*s,-.08*s,.12*s,.16*s);// hátizsák
  c.fillStyle=kind==='enemy'?'#151614':'#3e4a2a';c.beginPath();c.arc(.04*s,0,.15*s,0,7);c.fill();c.fillStyle='rgba(255,255,255,.15)';c.beginPath();c.arc(.01*s,-.04*s,.06*s,0,7);c.fill();// sisak
  if(kind==='enemy'){c.strokeStyle='#0a0a0a';c.lineWidth=.06*s;c.beginPath();c.moveTo(.1*s,.14*s);c.lineTo(.55*s,.1*s);c.stroke()}// fegyver
  c.restore()}
function seTDDraw(c,W,H,tm){const T=SE.td;if(!T)return;const V=seTDView(),k=V.k,P=(x,y)=>[V.ox+x*k,V.oy+y*k];c.drawImage(seTDBg(W,H),0,0,W,H);
  for(const x of T.ex){if(x.hid)continue;const [px,py]=P(x.x,x.y),pu=.8+.2*Math.sin(tm*4);c.strokeStyle=`rgba(120,255,120,${.5*pu})`;c.lineWidth=2;c.setLineDash([4,4]);c.beginPath();c.arc(px,py,1.3*k,0,7);c.stroke();c.setLineDash([]);c.fillStyle='#9dff9d';c.font='800 10px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(x.ic+' '+x.n,px,py+(x.y<3?1.9:-1.9)*k)}
  // útvonal
  if(T.path&&T.path.length){c.strokeStyle='rgba(255,224,138,.75)';c.lineWidth=2;c.setLineDash([3,6]);c.beginPath();c.moveTo(...P(T.x,T.y));for(const q of T.path)c.lineTo(...P(q[0],q[1]));c.stroke();c.setLineDash([]);const [fx,fy]=P(T.fx,T.fy);c.beginPath();c.arc(fx,fy,.35*k,0,7);c.stroke()}
  // figurák
  for(const g of T.g){const [gx,gy]=P(g.x,g.y);seTDMan(c,gx,gy,g.a,k,'#232520',g.dog?'dog':'enemy',T.t*6)}
  const [px,py]=P(T.x,T.y),pa=T.pa||-Math.PI/2;if(SE.buddy){const [bx,by]=P(T.bx||T.x,T.by||T.y+.8);seTDMan(c,bx,by,T.ba||pa,k,'#55603f','me',T.t*5)}seTDMan(c,px,py,pa,k,'#6a7a45','me',T.tx!=null?T.t*9:0);
  if(T.noise>0){c.strokeStyle='rgba(255,224,138,.35)';c.lineWidth=1.5;c.beginPath();c.arc(px,py,T.noise*k,0,7);c.stroke()}
  // éjszaka: sötétség, fényekkel kivágva
  const dark=seLight()<.6;if(dark){const d=SE._tdd||(SE._tdd=document.createElement('canvas'));if(d.width!==W||d.height!==H){d.width=W;d.height=H}const x=d.getContext('2d');x.globalCompositeOperation='source-over';x.clearRect(0,0,W,H);x.fillStyle='rgba(2,4,14,.72)';x.fillRect(0,0,W,H);x.globalCompositeOperation='destination-out';
    const hole=(cx,cy,r,a)=>{const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,`rgba(0,0,0,${a})`);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.beginPath();x.arc(cx,cy,r,0,7);x.fill()};
    for(const [lx,ly] of SE_TDL){const [qx,qy]=P(lx,ly);hole(qx,qy,2.6*k,.85)}const [sx,sy]=P(T.sl.x,T.sl.y);hole(sx,sy,2.6*k,1);hole(px,py,1.2*k,.35);
    for(const g of T.g){if(g.dog)continue;const [gx,gy]=P(g.x,g.y);x.fillStyle='rgba(0,0,0,.75)';x.beginPath();x.moveTo(gx,gy);x.arc(gx,gy,g.r*k,g.a-.5,g.a+.5);x.closePath();x.fill()}
    c.drawImage(d,0,0,W,H)}
  // fénycsóvák, reflektor
  c.save();c.globalCompositeOperation='lighter';const [sx,sy]=P(T.sl.x,T.sl.y),[tx,ty]=P(21.6,33.6);c.strokeStyle='rgba(255,250,210,.12)';c.lineWidth=1.2*k;c.beginPath();c.moveTo(tx,ty);c.lineTo(sx,sy);c.stroke();const sg=c.createRadialGradient(sx,sy,0,sx,sy,2.3*k);sg.addColorStop(0,'rgba(255,250,210,.5)');sg.addColorStop(1,'rgba(255,250,210,0)');c.fillStyle=sg;c.beginPath();c.arc(sx,sy,2.3*k,0,7);c.fill();
  for(const g of T.g){const [gx,gy]=P(g.x,g.y),fov=g.dog?.5:.55,gr=c.createRadialGradient(gx,gy,0,gx,gy,g.r*k);gr.addColorStop(0,g.alert>0?'rgba(255,80,60,.35)':'rgba(255,240,170,.22)');gr.addColorStop(1,'rgba(255,240,170,0)');c.fillStyle=gr;c.beginPath();c.moveTo(gx,gy);c.arc(gx,gy,g.r*k,g.a-fov,g.a+fov);c.closePath();c.fill()}c.restore();
  for(const g of T.g)if(g.alert>0){const [gx,gy]=P(g.x,g.y);c.fillStyle='#ff4a3e';c.font='900 15px system-ui';c.textAlign='center';c.fillText(T.det>.5?'‼':'?',gx,gy-.8*k)}
  if(T.det>.01){const w=Math.min(220,W*.55),x0=(W-w)/2;c.fillStyle='rgba(0,0,0,.6)';c.fillRect(x0-4,6,w+8,16);c.fillStyle=T.det>.6?'#ff4a3e':'#ffd24a';c.fillRect(x0,10,w*T.det,8)}
  c.fillStyle='rgba(243,236,212,.8)';c.font='700 11px system-ui';c.textAlign='center';c.fillText('👆 koppints oda, ahová mennél · árnyékban kevésbé látnak',W/2,H-8)}

// ===== v3.4: drón-felismerés sziluettről, állatok, vizuális elsősegély, bajtárs neve, szelfi =====
const SV=(p,vb)=>`<svg viewBox="${vb||'0 0 200 80'}" aria-hidden="true" data-st="width:100%;max-height:96px">${p}</svg>`;
const SE_DSV={
 orlan:SV('<path d="M20 44h150l10-4h8v8h-8l-10-4" fill="#222"/><path d="M80 44l-6-30h14l8 30zM80 44l-6 30h14l8-30z" fill="#333"/><path d="M160 44l6-14h6l-2 14 2 14h-6z" fill="#333"/><circle cx="22" cy="44" r="3" fill="#666"/>'),
 shahed:SV('<path d="M30 40L150 12l20 28-20 28z" fill="#2a2a2a"/><path d="M150 12v56" stroke="#555" stroke-width="3"/><rect x="168" y="30" width="6" height="20" fill="#666"/><path d="M30 40h-8" stroke="#2a2a2a" stroke-width="6"/>'),
 lancet:SV('<rect x="30" y="35" width="140" height="10" rx="5" fill="#2a2a2a"/><path d="M60 40l-14-28h10l18 28-18 28H46z" fill="#3a3a3a"/><path d="M140 40l-10-22h8l14 22-14 22h-8z" fill="#3a3a3a"/>'),
 fpv:SV('<rect x="80" y="34" width="40" height="12" rx="3" fill="#222"/><path d="M80 34L50 20M120 34l30-14M80 46L50 60M120 46l30 14" stroke="#333" stroke-width="5"/><g fill="#555" opacity=".7"><ellipse cx="50" cy="20" rx="18" ry="4"/><ellipse cx="150" cy="20" rx="18" ry="4"/><ellipse cx="50" cy="60" rx="18" ry="4"/><ellipse cx="150" cy="60" rx="18" ry="4"/></g><rect x="114" y="36" width="10" height="8" fill="#111"/>'),
 mavic:SV('<rect x="78" y="32" width="44" height="16" rx="7" fill="#9a9a96"/><path d="M78 36L54 26M122 36l24-10M78 44L54 54M122 44l24 10" stroke="#8a8a86" stroke-width="4"/><g fill="#777" opacity=".7"><ellipse cx="54" cy="26" rx="14" ry="3"/><ellipse cx="146" cy="26" rx="14" ry="3"/><ellipse cx="54" cy="54" rx="14" ry="3"/><ellipse cx="146" cy="54" rx="14" ry="3"/></g><rect x="94" y="48" width="12" height="10" rx="2" fill="#4a5a2a"/><circle cx="120" cy="40" r="4" fill="#222"/>')};
Object.assign(SE_EV,{
 di_orlan:{ic:'🛩️',t:'Ellenséges drón – mi ez?',img:SE_DSV.orlan,q:'Merevszárnyú, ~3 m fesztávú gép köröz magasan, egyenletes motorhanggal. Mi ez, és mit jelent?',o:[['Felderítő drón (pl. Orlan-10) – tüzérséget irányíthat: takarásban maradok, aztán elhagyom a helyet',1,'A merevszárnyú felderítők gyakran tüzérségi tűz vezetésére szolgálnak: ha észleltek, a helyszínre hamarosan tűz érkezhet.'],['Utasszállító repülő – nem kell vele foglalkozni',0,'Alacsonyan, körözve, kis méretben: ez drón, nem utasgép.'],['Öngyilkos drón – azonnal lefekszem a nyílt terepen',0,'Ez felderítő típus – a nyílt terepen fekve épp jól látszol.']]},
 di_shahed:{ic:'🛩️',t:'Ellenséges drón – mi ez?',img:SE_DSV.shahed,q:'Delta szárnyú gép, hátul légcsavar, hangja mint egy robogóé. Mi ez?',o:[['Shahed/Geran típusú csapásmérő drón – messzi célra tart, fedezékbe húzódom, amíg elhalad',1,'A „robogóhangú” delta szárnyú drón messzi célokra repül robbanófejjel: fedezék, és nem mutatkozol.'],['Felderítő quadkopter',0,'Ez merevszárnyú, delta alakú – nem quadkopter.'],['Saját mentőgép',0,'A mentés nem így érkezik – a hang és a forma ellenséges csapásmérőre utal.']]},
 di_lancet:{ic:'🛩️',t:'Ellenséges drón – mi ez?',img:SE_DSV.lancet,q:'Hengeres test, elöl és hátul X alakú szárnyak, lassan köröz. Mi ez?',o:[['Lancet típusú „csavargó lőszer” – célpontot keres, járműtől és nyílt tértől távol maradok',1,'A csavargó lőszer köröz, majd rázuhan a célra – főleg járműveket keres. Ne legyél jármű közelében.'],['Időjárás-ballon',0,'A szárnyakból látszik: irányított lőszer.'],['Polgári térképező drón',0,'A katonai X-szárny és a körözés csavargó lőszerre utal.']]},
 di_fpv:{ic:'🛸',t:'Ellenséges drón – mi ez?',img:SE_DSV.fpv,q:'Kicsi, gyors, sivító négyrotoros, elöl kamerával. Mi ez?',o:[['FPV drón – támadó: azonnal sűrű takarásba, kitörök a látóteréből',1,'Az FPV-t a pilóta a kamera képe alapján vezeti: a takarás és a látótér elhagyása a túlélés kulcsa.'],['Játék drón, ártalmatlan',0,'Harci területen a sivító FPV támadó eszköz.'],['Felderítő merevszárnyú',0,'Ez négyrotoros, nem merevszárnyú.']]},
 di_mavic:{ic:'🛸',t:'Ellenséges drón – mi ez?',img:SE_DSV.mavic,q:'Szürke, kis négyrotoros, alatta kis tartó – egy helyben lebeg felettetek. Mi ez?',o:[['Átalakított polgári drón – felderít, és ledobhat gránátot: mozdulatlanul takarás alatt maradok',1,'A polgári quadkoptereket gyakran ledobó szerkezettel szerelik fel: tető, lomb, árok alá – és ne nézz fel.'],['Hőlégballon',0,'A négy rotor egyértelmű: quadkopter.'],['Ártalmatlan – csak fényképez',0,'Felderít és támadhat is – a ledobó szerkezet erre utal.']]},
 an_roka:{ic:'🦊',t:'Róka az ösvényen',q:'Fényes nappal egy róka nem menekül, sőt közelít, furcsán, bizonytalanul jár. Mit teszel?',o:[['Elkerülöm, semmiképp nem nyúlok hozzá – a szokatlanul szelíd róka veszett lehet',1,'A veszettség jele lehet a félelem elvesztése és a furcsa mozgás. Harapás vagy karmolás után mindig orvos.'],['Megetetem, hátha barátságos',0,'A szelídnek tűnő vadállat veszett lehet.'],['Elzavarom, megrúgom',0,'A közelség és a harapásveszély miatt elkerülni kell, nem kezdeni vele.']]},
 an_szarvas:{ic:'🦌',t:'Szarvasbika a tisztáson',q:'Szeptember: bőgés, egy nagy szarvasbika áll az utadban, fújtat. Mit teszel?',o:[['Nagy távolságot tartok, lassan kerülök – nem állok az útjába',1,'Bőgéskor a bika ingerlékeny, támadhat is. Tartsd a távolságot.'],['Odamegyek fotózni',0,'Bőgés idején a bika veszélyes lehet.'],['Futva elzavarom',0,'A futás és a zaj messzire hallatszik – és felingerelheti az állatot.']]},
 an_vipera:{ic:'🐍',t:'Kígyó a köveken',q:'Napos kövön szürkés-barna kígyó, a hátán cikcakkos sáv. Mit teszel?',o:[['Nagy ívben kikerülöm; ha megmarna: nyugalom, a végtag rögzítése, orvos',1,'Ez keresztes vipera. A marás ritkán halálos, de orvos kell. Ne vágd be, ne szívd ki, ne kösd el.'],['Félreteszem egy bottal',0,'Felesleges kockázat – egyszerűen kerüld ki.'],['Megfogom, hátha ehető',0,'Mérges kígyóval nem kockáztatunk.']]}});
// --- drón-felismerés a Bravóban, időközönként ---
function seDroneTick(){if(SE.day<2||SE.day>3||SE.choice||SE.quiz||SE.amb||SE.esc||SE.ex)return;if(SE.t<(SE.drNext||(SE.drNext=SE.t+40)))return;SE.drNext=SE.t+55+Math.random()*30;
  const pool=Object.keys(SE_DSV).map(k=>'di_'+k).filter(k=>!(SE.diSeen||[]).includes(k));if(!pool.length)return;const id=pool[Math.floor(Math.random()*pool.length)];SE.diSeen=[...(SE.diSeen||[]),id];SE.objs.push({k:'drone',ax:SE.x+6,x:SE.x+6,ph:0,v:.5,asked:1});seEvent(id)}
// --- élethűbb állatok ---
function seAnimal(c,o,X,gy,s,L,tm){const x=X(o.x),col=(a,b)=>seMix(a,b,L);c.save();
  if(o.a==='roka'){const st=Math.sin(tm*6)*.04*s;c.fillStyle=col('#3a1c08','#c4621e');c.beginPath();c.ellipse(x,gy-.32*s,.42*s,.16*s,0,0,7);c.fill();c.beginPath();c.moveTo(x-.38*s,gy-.38*s);c.quadraticCurveTo(x-.9*s,gy-.5*s,x-.95*s,gy-.2*s);c.quadraticCurveTo(x-.7*s,gy-.18*s,x-.38*s,gy-.26*s);c.fill();c.fillStyle='#f3efe6';c.beginPath();c.ellipse(x-.92*s,gy-.22*s,.07*s,.05*s,0,0,7);c.fill();
    c.fillStyle=col('#3a1c08','#c4621e');c.beginPath();c.moveTo(x+.32*s,gy-.42*s);c.lineTo(x+.62*s,gy-.36*s);c.lineTo(x+.38*s,gy-.26*s);c.fill();c.beginPath();c.moveTo(x+.36*s,gy-.44*s);c.lineTo(x+.4*s,gy-.6*s);c.lineTo(x+.46*s,gy-.44*s);c.fill();c.fillStyle='#1a1008';for(const lx of [-.25,-.12,.16,.28])c.fillRect(x+lx*s+(lx>0?st:-st),gy-.2*s,.05*s,.2*s);c.fillStyle='#fff';c.fillRect(x+.4*s,gy-.34*s,.12*s,.04*s)}
  else if(o.a==='szarvas'){c.fillStyle=col('#1f140c','#7a5232');c.beginPath();c.ellipse(x,gy-1.05*s,.7*s,.3*s,0,0,7);c.fill();c.beginPath();c.moveTo(x+.5*s,gy-1.2*s);c.lineTo(x+.85*s,gy-1.75*s);c.lineTo(x+1.05*s,gy-1.7*s);c.lineTo(x+.75*s,gy-1.05*s);c.fill();c.beginPath();c.ellipse(x+1.02*s,gy-1.78*s,.2*s,.1*s,.3,0,7);c.fill();
    c.strokeStyle=col('#2a2016','#d8c8a8');c.lineWidth=.05*s;c.beginPath();c.moveTo(x+.95*s,gy-1.85*s);c.quadraticCurveTo(x+.7*s,gy-2.4*s,x+.9*s,gy-2.7*s);c.moveTo(x+.82*s,gy-2.15*s);c.lineTo(x+.6*s,gy-2.3*s);c.moveTo(x+.86*s,gy-2.45*s);c.lineTo(x+1.05*s,gy-2.6*s);c.moveTo(x+1*s,gy-1.85*s);c.quadraticCurveTo(x+1.25*s,gy-2.3*s,x+1.15*s,gy-2.6*s);c.stroke();
    c.fillStyle=col('#1f140c','#6a4428');for(const lx of [-.5,-.32,.32,.5])c.fillRect(x+lx*s,gy-.82*s,.08*s,.82*s);c.fillStyle=col('#3a2a1a','#c8b090');c.beginPath();c.ellipse(x-.68*s,gy-1.1*s,.1*s,.14*s,0,0,7);c.fill()}
  else if(o.a==='vipera'){c.strokeStyle=col('#1a1814','#6a5e4a');c.lineWidth=.12*s;c.lineCap='round';c.beginPath();for(let i=0;i<=20;i++){const t=i/20,xx=x-.8*s+t*1.4*s,yy=gy-.06*s-Math.sin(t*9+tm*.8)*.08*s;i?c.lineTo(xx,yy):c.moveTo(xx,yy)}c.stroke();c.strokeStyle='#1a1410';c.lineWidth=.05*s;c.beginPath();for(let i=0;i<=20;i++){const t=i/20,xx=x-.8*s+t*1.4*s,yy=gy-.06*s-Math.sin(t*9+tm*.8)*.08*s+(i%2?.03:-.03)*s;i?c.lineTo(xx,yy):c.moveTo(xx,yy)}c.stroke();c.fillStyle=col('#1a1814','#5a5040');c.beginPath();c.ellipse(x+.64*s,gy-.08*s,.1*s,.07*s,0,0,7);c.fill()}
  c.restore()}
// --- vizuális elsősegély: érszorító (3 lépés) ---
function seAidStart(){SE.mg={k:'aid',st:0,tw:0,ok:0};SE.tgt=null;SE.mv=0;seRadio('✚ Erős vérzés a combodon! Gyorsan: érszorító.',3500);seTray()}
function seAidLeg(M){const drip=M.st<2||M.tw<6;return `<div class="seaid"><svg viewBox="0 0 120 220" aria-hidden="true"><path d="M40 10h40l-4 90 2 110H42l2-110z" fill="#5f6440"/><path d="M44 100h36" stroke="#3a3d26" stroke-width="3"/><ellipse cx="60" cy="140" rx="9" ry="6" fill="#8a0a0a"/>${drip?'<circle class="sedrip" cx="60" cy="150" r="4" fill="#c01010"/>':''}${M.st>=1?`<rect x="36" y="${M.pos}" width="48" height="10" rx="3" fill="#222"/><rect x="58" y="${M.pos-6}" width="4" height="22" fill="#444" transform="rotate(${M.tw*30} 60 ${M.pos+5})"/>`:''}${M.st>=2&&M.ok3?'<text x="60" y="'+(M.pos+24)+'" text-anchor="middle" font-size="10" fill="#fff" font-weight="800">T 14:32</text>':''}</svg>${M.st===0?'<button type="button" data-aidp="104" data-st="top:44%">▲ 5–7 cm a seb fölé</button><button type="button" data-aidp="135" data-st="top:61%">● Közvetlenül a sebre</button><button type="button" data-aidp="170" data-st="top:77%">▼ A seb alá</button>':''}</div>`}
function seAidRender(M){const head=['1/3 – Hová kerül az érszorító? Koppints a combon!','2/3 – Tekerd meg, amíg a vérzés el nem áll!','3/3 – Mit teszel még?'][M.st];
  return `<div class="sequiz"><div class="seqh">✚ Elsősegély – érszorító · ${head}</div>${seAidLeg(M)}${M.st===1?`<button type="button" class="btn pri sebig" id="seAidTw">🔄 TEKERÉS (${M.tw}/6)</button>`:''}${M.st===2?'<div class="seans"><button type="button" class="btn line" data-aid3="1">🖊️ Felírom az időpontot, nem lazítom</button><button type="button" class="btn line" data-aid3="0">Fél óra múlva leveszem</button><button type="button" class="btn line" data-aid3="2">Betakarom, hogy ne lássák</button></div>':''}</div>`}
function seAidClick(t){const M=SE.mg;if(!M||M.k!=='aid')return false;const p=t.closest('[data-aidp]');
  if(p&&M.st===0){const v=+p.dataset.aidp;M.pos=v-4;if(v===104){M.ok++;sePop('✅ Jó: a seb és a szív közé, ízületre nem','#9dff9d');seOk()}else{seBeep(220,.15,.04);sePop(v===135?'❌ A sebre nem – fölé!':'❌ Alá nem – a vér felülről jön!','#ff7b7b');SE.hp=Math.max(1,SE.hp-6);M.pos=96}M.st=1;seTray();return true}
  if(t.closest('#seAidTw')&&M.st===1){M.tw++;try{saRustle(.04)}catch(e){}if(M.tw>=6){sePop('✅ A vérzés elállt','#9dff9d');M.st=2;M.ok++}seTray();return true}
  const q=t.closest('[data-aid3]');if(q&&M.st===2){const ok=q.dataset.aid3==='1';if(ok){M.ok++;M.ok3=1;sePop('✅ Időpont felírva – az orvos tudni fogja','#9dff9d');seOk()}else{seBeep(220,.15,.04);sePop('❌ Ne lazítsd, ne takard – írd fel az időpontot!','#ff7b7b')}
    sePts('dec',M.ok*80);if(!seKit('med')){SE.hp=Math.max(1,SE.hp-12);seKitMiss('med','✚ Nincs elsősegélycsomagod – rögtönzött szorító, a seb tovább fáj (−12).')}else{SE.hp=Math.min(100,SE.hp+10);seKitUse('med')}
    seRadio(`✚ Érszorító: ${M.ok}/3 helyes lépés. A seb fölé, addig tekerd, amíg a vérzés eláll, és írd fel az időpontot.`,5500);const keep=M.ok3;SE.mg=keep?{...M,st:3}:null;setTimeout(()=>{if(SE.mg&&SE.mg.k==='aid')SE.mg=null;seAlDone('aid');seTray()},keep?1400:0);seTray();return true}
  return false}
// --- szelfi a végén ---
function seSelfie(score){const W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');
  const sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#f6b26b');sky.addColorStop(.45,'#e8875a');sky.addColorStop(1,'#3b2a2a');c.fillStyle=sky;c.fillRect(0,0,W,H);
  c.fillStyle='rgba(40,30,30,.85)';c.beginPath();c.moveTo(0,760);for(let x=0;x<=W;x+=60)c.lineTo(x,700-Math.sin(x*.01)*60-Math.sin(x*.023)*30);c.lineTo(W,H);c.lineTo(0,H);c.fill();
  c.save();c.globalAlpha=.6;seH225(c,820,520,22,0,1,1);c.restore();
  const face=(cx,cy,sc,bud)=>{c.save();c.translate(cx,cy);c.scale(sc,sc);
    c.fillStyle='#4f5536';c.beginPath();c.ellipse(0,330,260,170,0,Math.PI,0);c.fill();c.fillStyle='rgba(0,0,0,.18)';for(let i=0;i<14;i++){c.beginPath();c.ellipse(-200+seH(i+(bud?9:0))*400,230+seH(i*3)*90,40,20,seH(i)*3,0,7);c.fill()}
    c.fillStyle='#c99b76';c.fillRect(-40,120,80,70);c.beginPath();c.ellipse(0,40,105,128,0,0,7);c.fill();
    if(seKit('camo')||!bud){c.fillStyle='rgba(60,70,40,.55)';c.beginPath();c.ellipse(-55,40,40,14,-.3,0,7);c.ellipse(55,62,40,14,.3,0,7);c.fill()}
    c.fillStyle='rgba(80,60,40,.35)';c.beginPath();c.ellipse(35,95,30,12,0,0,7);c.fill();
    c.fillStyle='#fff';c.beginPath();c.ellipse(-38,25,16,10,0,0,7);c.ellipse(38,25,16,10,0,0,7);c.fill();c.fillStyle='#3a2a1a';c.beginPath();c.arc(-36,26,7,0,7);c.arc(40,26,7,0,7);c.fill();
    c.strokeStyle='#5a2a1a';c.lineWidth=6;c.beginPath();c.arc(0,72,42,.15*Math.PI,.85*Math.PI);c.stroke();c.fillStyle='#fff';c.beginPath();c.arc(0,74,36,.2*Math.PI,.8*Math.PI);c.fill();
    c.fillStyle='#454a2c';c.beginPath();c.ellipse(0,-40,125,95,0,Math.PI,0);c.fill();c.fillRect(-130,-46,260,22);
    if(bud){c.fillStyle='#f3efe6';c.save();c.rotate(-.12);c.fillRect(-120,-20,240,26);c.restore();c.fillStyle='#b01010';c.beginPath();c.arc(50,-10,8,0,7);c.fill()}c.restore()};
  face(360,620,1.25,0);if(SE.buddy)face(760,660,1.12,1);
  c.save();c.translate(130,1150);c.rotate(-.5);c.fillStyle='#4f5536';c.fillRect(0,-50,360,100);c.fillStyle='#c99b76';c.beginPath();c.ellipse(380,0,60,50,0,0,7);c.fill();c.restore();
  // szűrő: meleg tónus, szemcse, vignetta
  c.fillStyle='rgba(255,170,90,.12)';c.fillRect(0,0,W,H);for(let i=0;i<9000;i++){c.fillStyle=`rgba(${Math.random()<.5?0:255},${Math.random()<.5?0:255},${Math.random()<.5?0:255},.05)`;c.fillRect(Math.random()*W,Math.random()*H,2,2)}
  const vg=c.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.78);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.65)');c.fillStyle=vg;c.fillRect(0,0,W,H);
  c.textAlign='center';c.fillStyle='#ffe58a';c.strokeStyle='#000';c.lineWidth=10;c.font='900 92px Anton, Impact, sans-serif';c.strokeText('TÚLÉLTÜK',W/2,140);c.fillText('TÚLÉLTÜK',W/2,140);c.font='900 64px Anton, Impact, sans-serif';c.strokeText('A SERE CHARLIE-T!',W/2,220);c.fillText('A SERE CHARLIE-T!',W/2,220);
  c.fillStyle='rgba(0,0,0,.6)';c.fillRect(0,H-230,W,230);c.fillStyle='#fff';c.font='800 44px system-ui';c.fillText(`${(typeof USERDOC!=='undefined'&&USERDOC&&USERDOC.name)||'Katona'}${SE.buddy?' & '+(SE.budName||'Kovács')+' őrv.':''}`,W/2,H-160);
  c.fillStyle='#ffe58a';c.font='900 64px Anton, Impact, sans-serif';c.fillText(`${n0(score)} PONT`,W/2,H-85);c.fillStyle='rgba(255,255,255,.75)';c.font='700 28px system-ui';c.fillText(`M.E.D.V.E. Arcade · SERE Kitörés · ${new Date().toLocaleDateString('hu-HU')}`,W/2,H-35);
  return cv}
function seSelfieShow(score){const cv=seSelfie(score),url=cv.toDataURL('image/jpeg',.9),o=$('#seOver');o.hidden=false;o.innerHTML=`<h3>📸 Szelfi a kivonás után</h3><img src="${url}" alt="Szelfi: túléltük a SERE Charlie-t" data-st="width:100%;border-radius:12px;display:block"><button type="button" class="btn pri sebig" id="seSfSave">💾 Mentés a Fotókba</button><button type="button" class="btn line" id="seSfBack" data-st="margin-top:8px">‹ Vissza az eredményhez</button>`;
  $('#seSfBack').onclick=()=>seOver(SE._lastWhy||'Kimentettek',true);
  $('#seSfSave').onclick=()=>cv.toBlob(async b=>{const f=new File([b],'SERE-tuleltuk.jpg',{type:'image/jpeg'});try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'Túléltük a SERE Charlie-t!'});return}}catch(e){if(e&&e.name==='AbortError')return}const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='SERE-tuleltuk.jpg';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);toast('📥 Letöltve – a Letöltések / Fájlok mappában találod')},'image/jpeg',.92)}
// ---- pálya-generátor ----
function seGen(x){const O=SE.objs,d=Math.min(3,SE.day),dark=seLight()<.5,gap=6+Math.random()*5.5;
  if(SE.ex&&SE.ex.lz&&x>SE.ex.lz-14&&x<SE.ex.lz+14)return x+gap;
  if(SE.resv&&x>SE.resv-8&&x<SE.resv+8)return SE.resv+8;// fenntartott hely (küldetés-elem)
  const need=Math.min(SE.water,SE.food,SE.hp);let W;
  if(d===1)W=[['animal',(SE.anSeen||[]).length<3?.6:0],['obst',2.2],['item',need<60?2.4:1.4],['mat',3.4],['bush',1],['boulder',.7],['stream',.6],['deco',1.4]];
  else W=[['animal',(SE.anSeen||[]).length<3?.35:0],['obst',2],['item',need<55?2.6:1.8],['bush',1],['boulder',.9],['stream',SE.dog?3:.7],['patrol',dark?1.8:1],['walker',dark?2.2:1.6],['pair',d>=3?(dark?1:.5):0],['drone',dark?1:(d>=3?.5:0)],['tower',d>=3?(dark?.9:.5):0]];
  if(SE.escDone&&SE.kmR<800){W=W.filter(w=>!['pair','tower','drone'].includes(w[0]));W.forEach(w=>{if(w[0]==='walker'||w[0]==='patrol')w[1]*=SE.kmR<300?0:.5})}{const tn=seTrNext();if(tn&&!SE.esc&&!SE.ex&&!SE.amb&&!SE.escDone&&!(SE.objs||[]).some(o=>o.k==='train'&&!o.done))W.push(['train',SE.day===1?1.6:1.2])}if(SE.lzSafe||SE.ex)W=W.filter(w=>!['pair','tower','drone','walker','patrol'].includes(w[0]));
  if(SE.route==='road')W.forEach(w=>{if(['patrol','walker','pair','tower'].includes(w[0]))w[1]*=1.5});if(SE.route==='stream')W.forEach(w=>{if(w[0]==='stream')w[1]*=3;if(['patrol','walker','pair','tower','drone'].includes(w[0]))w[1]*=.7});
  let tot=W.reduce((s,w)=>s+w[1],0),k=Math.random()*tot,typ='obst';for(const [t2,w] of W){if((k-=w)<=0){typ=t2;break}}
  if(typ==='obst'){const pool=d===1?['log','ditch','rock','lowlog']:['log','ditch','wire','rock','lowwire','ditch'];const o=pool[Math.floor(Math.random()*pool.length)];
    const ob={k:o,x,w:o==='ditch'?1.6+Math.random()*1.1:o==='wire'?1.2:o==='rock'?.8:o==='lowlog'?2.4:o==='lowwire'?2.2:.6,h:o==='wire'?.75:o==='log'?.5:o==='rock'?.45:0};
    if(o==='lowlog'){ob.yb=.62;ob.yt=1.05}if(o==='lowwire'){ob.yb=.55;ob.yt=.85}O.push(ob);
    if(Math.random()<.3&&o!=='lowlog'&&o!=='lowwire')O.push({k:'item',x:x+(o==='ditch'?.6:.2),y:1.6,it:seItemKind()});return x+gap+2+(o==='ditch'?1:0)}
  if(typ==='item'){O.push({k:'item',x,y:Math.random()<.3?1.5:.35,it:d>=2&&Math.random()<.22?'herb':seItemKind()});return x+gap*.7}
  if(typ==='train'){const id=seTrNext();if(id){(SE.trQ=SE.trQ||[]).push(id);O.push({k:'bush',x,w:2.4},{k:'train',x:x+4,id})}return x+gap+7}
  if(typ==='animal'){const pool=['roka','szarvas','vipera'].filter(a=>!(SE.anSeen||[]).includes(a));if(pool.length){O.push({k:'animal',x:x+4,a:pool[Math.floor(Math.random()*pool.length)]})}return x+gap+3}
  if(typ==='mat'){const it=seMatKind();O.push({k:'item',x,y:.35,it});if(Math.random()<.5)O.push({k:'item',x:x+2.2,y:Math.random()<.4?1.5:.35,it:seMatKind()});return x+gap*.8}
  if(typ==='bush'){O.push({k:'bush',x,w:2.2+Math.random()*.8});return x+gap}
  if(typ==='boulder'){O.push({k:'boulder',x,w:1.2+Math.random()*.4,h:1+Math.random()*.15,sd:Math.random()*9});return x+gap}
  if(typ==='deco'){Math.random()<.22&&d===1?O.push({k:'deer',x:x+6,vx:-(5+Math.random()*3)}):O.push({k:'tree',x,h:3+Math.random()*2,w:.5});return x+gap*.6}
  if(typ==='stream'){O.push({k:'stream',x,w:3+Math.random()*1.5});return x+gap+4}
  const sp=1+.06*(d-2);
  if(typ==='patrol'){O.push({k:'bush',x,w:2.6});const px=x+10+Math.random()*2;O.push({k:'patrol',x:px,ph:Math.random()*6,w:(.5+Math.random()*.15)*sp},Math.random()<.5?{k:'boulder',x:px-4.5,w:1.3,h:1.05,sd:Math.random()*9}:{k:'ditch',x:px-4.5,w:2.2},{k:'bush',x:px+5,w:2.4});return px+10}
  if(typ==='walker'){const wx=x+12;O.push({k:Math.random()<.5?'bush':'boulder',x,w:Math.random()<.5?2.6:1.3,h:1.05,sd:Math.random()*9},{k:'tree',x:x+5.5,h:3.6,w:.5},{k:'walker',x0:wx,x:wx+(Math.random()-.5)*4,r:3+Math.random()*1.5,dir:Math.random()<.5?-1:1,sp:(.8+Math.random()*.3)*sp,wait:0},{k:'bush',x:wx+7,w:2.6});return wx+12}
  if(typ==='pair'){O.push({k:'bush',x,w:2.8});const px=x+10;O.push({k:'patrol',x:px,ph:0,w:.6*sp},{k:'ditch',x:px+4.2,w:2.2},{k:'patrol',x:px+8.5,ph:Math.PI,w:.6*sp},{k:'bush',x:px+13,w:2.6});return px+17}
  if(typ==='drone'){O.push({k:'bush',x,w:2.6},{k:'stream',x:x+7,w:3.2},{k:'drone',ax:x+14,x:x+14,ph:Math.random()*6,v:(.45+Math.random()*.2)*sp},{k:'bush',x:x+21,w:2.4});return x+30}
  if(typ==='tower'){O.push({k:'bush',x,w:2.8},{k:'ditch',x:x+8,w:2.2});const tx=x+15;O.push({k:'tower',x:tx,ph:Math.random()*6,w:.3*sp},{k:'boulder',x:tx+5,w:1.3,h:1.05,sd:Math.random()*9},{k:'bush',x:tx+11,w:2.6});return tx+16}
  return x+gap}
function seItemKind(){const a=[['water',100-SE.water+20],['food',100-SE.food+20],['med',100-SE.hp+5]];let t=a.reduce((s,v)=>s+v[1],0),k=Math.random()*t;for(const [n,w] of a)if((k-=w)<=0)return n;return 'water'}
function seMatKind(){const I=SE.inv,id=(SE_AL[SE.al]||{}).id,r=Math.random();
  if(id==='fire'||(id==='stop'||id==='water'||id==='nav')&&r<.5){if(I.tinder<2&&r<.4)return 'tinder';if(I.kindling<3&&r<.75)return 'kindling';if(I.wood<3)return 'wood';return ['tinder','kindling','wood'][Math.floor(Math.random()*3)]}
  if(id==='food'){return r<.5?['berry','nut','grub'][Math.floor(Math.random()*3)]:r<.78?'herb':(r<.9?'redb':'mush')}
  if(id==='shelter')return I.leaf<3||r<.4?'leaf':'wood';
  return r<.45?'leaf':r<.7?['berry','nut'][Math.floor(Math.random()*2)]:['tinder','kindling','wood'][Math.floor(Math.random()*3)]}
// ---- terep: árok mélysége ----
function seGround(x){for(const o of SE.objs){if(o.k==='ditch'){const h=o.w/2,d=Math.abs(x-o.x);if(d<h)return -SE_DD*Math.min(1,(h-d)/.28)}}return 0}
function seDitchAt(x){return SE.objs.find(o=>o.k==='ditch'&&Math.abs(x-o.x)<o.w/2)}
// ---- fő ciklus ----
function seLoop(now){SE.raf=requestAnimationFrame(seLoop);if(SE.cv){const b=SE.cv.getBoundingClientRect();if(Math.abs(b.width-SE.W)>1||Math.abs(b.height-SE.H)>1)SE.fit()}
  const dt=Math.min(.05,(now-(SE.last||now))/1000);SE.last=now;
  if(!SE.paused){if(['play','cap','camp','intro','kit','td'].includes(SE.phase)&&!SE.tut){SE.playT=(SE.playT||0)+dt;SE.saveT=(SE.saveT||0)+dt;if(SE.saveT>15){SE.saveT=0;seSave()}}
    if(SE.phase==='play')seStep(dt*(SE.quiz||SE.choice||SE.mg?.2:1),dt);else if(SE.phase==='td')seTDTick(dt);else if(SE.phase==='intro')seIntroTick(dt);else if(SE.phase==='cap')seCapTick(dt);else if(SE.phase==='camp')seCampTick(dt);else if(SE.phase==='cine')seCineTick(dt);if(SE.phase==='play'&&SE.pur)seLZCineTick(dt);if(SE.phase==='play')seTrTick(dt);saTick(dt);if(SE.phase==='play'||SE.phase==='camp')seTension(dt)}
  const zt=SE.phase==='intro'?.6:SE.ex&&SE.ex.st!=='wait'&&SE.ex.st!=='gone'?.48:SE.phase==='camp'?1:.82;SE.zoom=(SE.zoom||1)+(zt-(SE.zoom||1))*Math.min(1,dt*1.6);
  if(SE.banner){SE.banner.t+=dt;if(SE.banner.t>3.6)SE.banner=null}if(SE.shake>0)SE.shake=Math.max(0,SE.shake-dt);if(SE.mk){SE.mk.t+=dt;if(SE.mk.t>1.4&&!SE.tgt)SE.mk=null}
  if(SE.mg&&!SE.paused)seMgTick(dt);
  for(const f of SE.fx){f.t+=dt;if(f.vx!=null){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy-=9*dt}}SE.fx=SE.fx.filter(f=>f.t<(f.life||1.2));seDraw(now/1000);SE.c.setTransform(SE.dpr,0,0,SE.dpr,0,0);seTrWorldDraw(SE.c,SE.W,SE.H);if(SE.phase==='play'&&(SE.pur||SE.ex)){SE.c.setTransform(SE.dpr,0,0,SE.dpr,0,0);seLZCineDraw(SE.c,SE.W,SE.H)}sePadSync();seDayBar()}
function seHit(dmg,why,msg,fall){if(seKit('helmet')){dmg=Math.round(dmg*.65);seKitUse('helmet')}SE.hp-=dmg;SE.cause=why;SE.fallT=fall||.8;SE.v*=.2;SE.mv=0;SE.tgt=null;SE.shake=.25;sndThud();sePop(msg,'#ff7b7b');if(navigator.vibrate)try{navigator.vibrate(70)}catch(e){}
  for(let i=0;i<8;i++)SE.fx.push({k:'dust',x:SE.x+.2,y:Math.max(0,SE.y)+.1,vx:(Math.random()-.3)*2,vy:Math.random()*2,t:0,life:.7})}
// a napszak a feladatokhoz igazodik (nem az órához): nem kell kapkodni
function seTodTarget(){if(SE.esc)return .66;const d=SE.day;
  if(d===1){const n=SE_AL.length-1;return SE.al<n?.05+.31*SE.al/n:.62}
  if(d===2||d===3){const T=d===2?[.08,.2,.34,.52,.86,.995]:[.08,.22,.55,.68,.8,.88];return T[Math.min(SE.br,T.length-1)]}
  return Math.min(.96,.66+.3*(1-Math.max(0,SE.kmR)/5000))}
function seStep(dt,rdt){SE.t+=dt;const T=SE.tut;
  if(!T){const prevTod=SE.tod,tt=seTodTarget(),rate=SE.day===1&&SE.al>=SE_AL.length-1?1/110:1/40;if(SE.tod<tt)SE.tod=Math.min(tt,SE.tod+dt*rate);if(SE.tod>=.995&&SE.day<3){SE.tod=.02;seNewDay()}
    if(SE.day===1&&!SE.sheltered&&SE.al>=SE_AL.length-1&&SE.tod>=.36&&SE.t>SE.campNext){SE.campNext=SE.t+9;if(!SE.objs.some(o=>o.k==='camp'&&o.x>SE.x)){SE.objs.push({k:'camp',x:SE.x+26});if(SE.tod<.5)seRadio(`🌆 Sötétedik! Menedékhely előtted. Kell: 🌿 ${Math.min(seLN(),SE.inv.leaf)}/${seLN()} ág a tetőhöz; tűzhöz 🌾 ${Math.min(2,SE.inv.tinder)}/2 · 🍂 ${Math.min(3,SE.inv.kindling)}/3 · 🪵 ${Math.min(3,SE.inv.wood)}/3.`,5500)}}
    if(prevTod<.52&&SE.tod>=.52&&SE.day>=2&&!SE.esc){SE.banner={t:0,a:'🌙 ÉJSZAKA',b:'Fedezékről fedezékre!',c:'Az őrök látnak és hallanak – a futás zajos'}}
    if(SE.day===1)seAlTick(dt);else if(SE.day<=3&&!SE.amb){seBrTick(dt);seDroneTick()}
    const BL=seBrList();if(SE.day===3&&!SE.amb&&BL&&SE.br>=BL.length&&SE.tod>=.86&&!SE.choice)seAmbush();
    if(SE.amb)seAmbTick(dt);
    // távolság a kivonási ponthoz
    if(SE.grid&&SE.kmX0!=null){const prog=Math.max(0,SE.x-SE.kmX0)*SE_KM;SE.kmR=Math.max(SE.escDone?0:5000,SE.kmD-prog);if(SE.escDone&&SE.kmR<=0&&!SE.ex)seLZStart()}}
  seMove(dt);
  // --- erőforrások: főleg a megtett úttól függ, nem az időtől ---
  if(!T){const k=1+.05*(SE.day-1),mv=Math.abs(SE.v)*dt,run=SE.v>2.4;SE.dist=(SE.dist||0)+mv;
    SE.water-=((seLight()>.5?.1:.06)*dt+mv*(run?.5:.3))*k*seDrain()*(SE.cleanWater&&SE.day===1?.8:1);SE.food-=(.05*dt+mv*(run?.3:SE.crawling?.32:.18))*k;
    if(SE.food<25&&SE.mre>0){SE.mre--;SE.food=Math.min(100,SE.food+40);seKitUse('mre','🍫 Megetted a harci élelem egy adagját (+40)')}
    if(SE.day===1&&!SE.sheltered&&seNight()){SE.hp-=(seKit('poncho')?.3:.6)*(SE.wx==='tel'?1.6:1)*dt;SE.cause='Kihűltél az éjszakában – nem volt menedéked.'}
    if(SE.water<=0){SE.water=0;SE.hp-=1.2*dt;SE.cause='Kiszáradtál.'}if(SE.food<=0){SE.food=0;SE.hp-=.9*dt;SE.cause='Kimerültél – elfogyott az erőd.'}}
  // --- tárgyak, akadályok ---
  const head=SE.y+.3+1.4*(1-SE.pr)-.5*SE.cr*(1-SE.pr);
  for(const o of SE.objs){if(o.done)continue;const dx=SE.x-o.x;
    if(o.k==='item'&&Math.abs(dx)<.6&&(o.y<1?SE.y<.8:SE.pr<.5)){o.done=1;seGet(o)}
    else if((o.k==='lowlog'||o.k==='lowwire')&&dx>-o.w/2-.1&&dx<o.w/2&&SE.y<o.yt&&head>o.yb+.05&&!SE.prone){SE.x=dx<0?o.x-o.w/2-.1:o.x+o.w/2;SE.v=0;if(!SE.autoP&&(!o.hintT||SE.t-o.hintT>2)){o.hintT=SE.t;sePop('🐛 Alatta csak kúszva férsz át!','#ffd28a')}}
    else if(o.k==='stream'&&!o.drank&&Math.abs(dx)<o.w/2&&SE.y<=0.001){o.drank=1;if(o.brk==='track'&&!SE.tut){seEvent('track');if(!SE.choice||SE.choice.id!=='track')seBrDone('track')}if(o.brk==='dogs')seBrDone('dogs');if(o.alpha==='water'&&!SE.tut){SE.v=0;seEvent('water')}else{SE.water=Math.min(100,SE.water+35);sePop('🌊 Patak: +35 víz','#9fd8ff')}if(SE.dog&&SE.dog.st==='chase'){SE.dog.st='lost';sePop('🌊 A kutya elvesztette a nyomod!','#9fd8ff')}}
    else if(o.k==='sign'&&dx>-.4){o.done=1;SE.v=0;seEvent('nav')}
    else if(o.k==='boar'&&dx>-9&&!SE.choice){o.done=1;seEvent('boar')}
    else if(o.k==='animal'&&dx>-5&&!SE.choice&&!SE.quiz&&!T){o.done=1;SE.anSeen=[...(SE.anSeen||[]),o.a];seEvent('an_'+o.a)}
    else if(o.k==='camp'&&dx>-.3){if(SE.inv.leaf>=seLN()){o.done=1;seCamp(o)}else if(!o.warn){o.warn=1;sePop(`❄️ Menedékhez kell 🌿 ${SE.inv.leaf}/${seLN()} ág – gyűjts még!`,'#bfe6ff')}}
    if((o.k==='patrol'||o.k==='tower'||o.k==='walker')&&!o.passed&&!o.amb){const ox=o.k==='walker'?o.x0+o.r:o.x;if(Math.abs(SE.x-ox)<12)o.md=Math.max(o.md||0,SE.det);if(SE.x-ox>8){o.passed=1;if((o.md||0)<.3&&!T){sePts('stealth',120);SE.silent++;sePop('🤫 Észrevétlenül! +120','#9dff9d')}}}
    if(o.brk&&!o.brd&&o.k!=='stream'&&dx>((o.k==='patrol'||o.k==='tower')?8:(o.w||0)/2+.5)){o.brd=1;if(o.brk==='observe')seObserveEv(o);else seBrDone(o.brk)}
    if(o.k==='drone'&&!o.asked&&!SE.choice&&!SE.quiz&&!T&&Math.abs(o.ax-SE.x)<12){o.asked=1;seEvent(seNight()?'dr_therm':Math.random()<.5?'dr_recon':'dr_fpv')}
    if(o.k==='free'&&SE.esc&&dx>0)seEscWin();
    if(o.k==='veh'||o.k==='deer')o.x+=o.vx*dt}
  seDetect(dt);
  const Dg=SE.dog;if(Dg){if(Dg.st==='chase'){Dg.x+=(SE.v<.5?2.6:Math.min(4.6,Math.abs(SE.v)+1.1))*dt;if(SE.inStream){Dg.st='lost';sePop('🌊 A kutya elvesztette a nyomod!','#9fd8ff')}
      if(Dg.x>=SE.x-.7){Dg.st='lost';SE.det=Math.min(.95,SE.det+.35);seBark();seHit(20,'Elkaptak a kutyák.','🐕 Megharapott! −20',.6)}
      if(Math.random()<dt*.7)seBark()}else{Dg.x-=6*dt;if(Dg.x<SE.x-40)SE.dog=null}}
  if(SE.ex)seExTick(dt);
  if(!T){const calm=!SE.cones.some(q=>Math.abs(q.ax-SE.x)<16);
    if(!SE.quiz&&!SE.choice&&!SE.ex&&!SE.esc&&!SE.brBusy&&!SE.amb&&seLight()>.8&&SE.det<.05&&calm){SE.nextQuiz-=dt;if(SE.nextQuiz<=0)seQuiz()}
    if(SE.quiz){SE.quiz.t-=rdt;const b=$('#seQT');if(b)b.style.width=Math.max(0,SE.quiz.t/SE_QT*100)+'%';if(SE.quiz.t<=0)seAnswer(-1)}
    if(SE.choice){SE.choice.t-=rdt;const b=$('#seQT');if(b)b.style.width=Math.max(0,SE.choice.t/SE_CT*100)+'%';if(SE.choice.t<=0)seChoose(-1)}
    while(SE.genX<SE.x+48)SE.genX=seGen(SE.genX)}
  SE.objs=SE.objs.filter(o=>(o.x+(o.w||1)>SE.x-16)||o.k==='wreck'||o.k==='drone'&&o.ax>SE.x-30||o.k==='veh'&&o.x>SE.x-40||o.k==='walker'&&o.x0>SE.x-24);
  if(SE.cover&&!SE.objs.includes(SE.cover))SE.cover=null;
  if(T)seTutTick(dt);
  if(SE.hp<=0&&!T){SE.hp=0;seOver(SE.cause||'Elfogyott az erőd.');return}
  if(T){SE.hp=SE.water=SE.food=100}
  SE.hudT-=rdt;if(SE.hudT<=0){SE.hudT=.25;seHud();if(!SE.quiz&&!SE.choice&&!SE.ex&&!SE.mg)seTray()}}
// ---- mozgás: koppintással kijelölt cél, fedezék, automatikus átlépés / átkúszás / kimászás ----
const SE_COV={bush:'bokor',ditch:'árok',boulder:'szikla',rock:'kő',log:'farönk',tree:'fatörzs'};
const SE_VAULT=['log','rock','wire','boulder'];
function seThreatX(){let b=null,bd=1e9;for(const o of SE.objs){if(!['patrol','walker','tower','veh'].includes(o.k))continue;const d=Math.abs(o.x-SE.x);if(d<bd){bd=d;b=o}}return b?b.x:SE.x+20}
function seCoverSpot(o){if(o.k==='bush'||o.k==='ditch')return o.x;const tx=seThreatX(),w=(o.w||.5)/2+.32;return tx>=o.x?o.x-w:o.x+w}
function seTap(e){if(SE.phase!=='play'||SE.paused||SE.mg||SE.vault||SE.amb||SE.climbT>0||SE.ex&&(SE.ex.st==='board'||SE.ex.st==='out'))return;const r=SE.cv.getBoundingClientRect(),px=e.clientX-r.left,s=SE.s*(SE.zoom||1);
  const minX=Math.max(SE.maxX-9.5,SE.minX!=null?SE.minX:-1e9);let wx=SE.x+(px-SE.px0)/s;wx=Math.max(minX,Math.min(wx,SE.x+(SE.W-SE.px0)/s-.3));
  const now=performance.now(),dbl=SE.lastTap&&now-SE.lastTap<380&&Math.abs(px-SE.lastTapX)<70;SE.lastTap=now;SE.lastTapX=px;
  let cov=null,best=1e9,it=null;
  for(const o of SE.objs){if(o.k==='item'&&!o.done&&Math.abs(wx-o.x)<.9){it=o}if(!SE_COV[o.k]||o.done)continue;const hw=(o.w||.5)/2+(o.k==='tree'?.45:.6),d=Math.abs(wx-o.x);if(d<hw&&d<best){best=d;cov=o}}
  let tx=wx;if(it&&!cov)tx=it.x;else if(cov)tx=seCoverSpot(cov);const E=SE.ex;if(E&&E.st==='land'&&Math.abs(wx-E.lz)<9){tx=E.lz-3.3;cov=null}
  if(!cov)for(const o of SE.objs){if([...SE_VAULT,'lowlog','lowwire'].includes(o.k)&&Math.abs(tx-o.x)<o.w/2+.3)tx=wx<o.x?o.x-o.w/2-.4:o.x+o.w/2+.4}
  tx=Math.max(minX,tx);SE.tgt={x:tx,cov,run:dbl&&SE.post==='stand'&&!SE.tut};SE.mv=0;SE.mk={x:tx,t:0,cov:!!cov,run:SE.tgt.run};if(SE.cover&&cov!==SE.cover){SE.cover=null;if(SE.prePost)SE.post=SE.prePost;SE.prePost=null}else if(!SE.cover&&SE.prePost){SE.post=SE.prePost;SE.prePost=null}
  if(SE.tgt.run)SE.post='stand';
  seClick(.5);if(SE.tgt.run)sePop('🏃 Futás','#ffe08a')}
function seArrive(){const g=SE.tgt;SE.tgt=null;if(!g)return;if(g.cov){const k=g.cov.k;if(!SE.cover&&SE.prePost==null)SE.prePost=SE.post;SE.cover=g.cov;SE.coverX=SE.x;
    SE.post=(k==='bush'||k==='ditch'||k==='log'||k==='rock')?'prone':k==='boulder'?'crouch':'stand';sePop('🫥 Fedezékben: '+SE_COV[k],'#9dff9d');saRustle(.04)}}
function seMove(dt){
  if(SE.vault){const V=SE.vault;V.t+=dt;const k=Math.min(1,V.t/V.d);SE.x=V.x0+(V.x1-V.x0)*k;SE.y=V.y0+V.h*Math.sin(Math.PI*Math.min(1,k*1.08));SE.pr=0;SE.cr=0;SE.v=(V.x1-V.x0)/V.d;SE.vy=0;
    if(k>=1){SE.vault=null;SE.y=seGround(SE.x);SE.land=.14;seStepSnd(2);SE.v*=.4}return}
  if(SE.climbT>0){SE.climbT-=dt;const C=SE.climbFrom,k=Math.min(1,1-SE.climbT/.75);SE.y=C.y+(0-C.y)*Math.min(1,k*1.35);SE.x=C.x+(C.tx-C.x)*Math.max(0,(k-.35)/.65);SE.v=0;SE.pr=0;
    if(SE.climbT<=0){SE.y=0;SE.x=C.tx;SE.climbFrom=null;seStepSnd(2)}return}
  let gnd=seGround(SE.x);const onG=SE.y<=gnd+.002;
  if(SE.autoP&&!SE.objs.some(o=>(o.k==='lowlog'||o.k==='lowwire')&&SE.x>o.x-o.w/2-.8&&SE.x<o.x+o.w/2+.3))SE.autoP=false;
  const P=SE.autoP?'prone':SE.post,wantP=P==='prone'&&onG&&SE.fallT<=0;SE.pr=Math.max(0,Math.min(1,SE.pr+(wantP?dt/.22:-dt/.32)));SE.prone=SE.pr>.75;
  SE.cr=Math.max(0,Math.min(1,SE.cr+(P==='crouch'&&onG?dt/.16:-dt/.2)));
  const D=seDitchAt(SE.x);SE.inDitch=!!D&&SE.y<-.45;
  SE.inBush=false;SE.inStream=false;for(const o of SE.objs){if(o.k==='bush'&&SE.x>o.x-o.w/2+.2&&SE.x<o.x+o.w/2-.2)SE.inBush=true;if(o.k==='stream'&&SE.x>o.x-o.w/2&&SE.x<o.x+o.w/2)SE.inStream=true}
  const tired=(.7+.3*Math.min(1,Math.min(SE.water,SE.food)/35))*seKitSpd()*(SE.day>=2&&!seKit('socks')?.9:1)*(SE.buddy?.85:1);
  let dir=0,run=false,back=false;
  if(SE.tgt){const d=SE.tgt.x-SE.x;if(Math.abs(d)<.09&&Math.abs(SE.v)<.7){SE.v=0;seArrive()}else{dir=Math.sign(d);run=SE.tgt.run}}
  else if(SE.mv){dir=SE.mv>0?1:-1;run=SE.mv===2;back=SE.mv<0}
  if(dir&&!back)SE.face=dir;else if(back)SE.face=1;
  SE.crawling=SE.prone&&dir!==0;
  let base=SE.prone?(back?.6:1):(wantP||SE.pr>.05)?0:SE.cr>.5?(back?.8:1.25):(back?1.3:run?SE.spd:1.8);
  let tv=dir*base*(SE.prone?1:tired);if(!SE.prone)tv*=(SE.inStream&&onG?.58:1)*(SE.inDitch?.7:1);
  if(SE.tgt&&dir){const d=Math.abs(SE.tgt.x-SE.x);tv=Math.sign(tv)*Math.min(Math.abs(tv),Math.sqrt(2*3.2*d)+.08)}
  if(SE.fallT>0){SE.fallT-=dt;tv=0}
  if(onG){const dv=tv-SE.v,ac=(SE.crawling?3:5)*dt,dc=(Math.abs(SE.v)>2.5?9:12)*dt;SE.v+=Math.abs(tv)>Math.abs(SE.v)&&tv*SE.v>=0?Math.max(-ac,Math.min(ac,dv)):Math.max(-dc,Math.min(dc,dv))}
  // akadály előtted: magától átlép / átmászik / lefekszik és átkúszik
  if(onG&&dir&&!SE.inDitch&&SE.fallT<=0){const goal=SE.tgt?SE.tgt.x:SE.x+dir*50;
    for(const o of SE.objs){if(o.done)continue;const e=dir>0?(o.x-o.w/2)-SE.x:SE.x-(o.x+o.w/2),beyond=(goal-o.x)*dir>o.w/2;
      if(SE_VAULT.includes(o.k)&&e>-.05&&e<.42&&beyond){const d=o.k==='boulder'?1.05:o.k==='wire'?1.1:.55;SE.vault={t:0,d,x0:SE.x,x1:o.x+dir*(o.w/2+.38),y0:SE.y,h:o.h+.32};SE.v=0;seStepSnd(1);saRustle(.04);
        if(o.k==='wire'){SE.hp=Math.max(1,SE.hp-3);sePop('🧷 Óvatosan át a szögesdróton (−3)','#ffd28a')}else if(o.k==='boulder')sePop('🧗 Átmászol a sziklán','#bfe6ff');return}
      if((o.k==='lowlog'||o.k==='lowwire')&&e>-.1&&e<.7&&beyond&&!SE.autoP&&SE.post!=='prone'){SE.autoP=true;sePop('🐛 Lefekszel és átkúszol alatta','#bfe6ff')}}}
  const wasAir=!onG;SE.x+=SE.v*dt;
  // árok: a falnál magától kimászik, ha tovább akarsz menni
  SE.atWall=false;if(SE.inDitch&&D){const wx=D.x+D.w/2-.32,lx=D.x-D.w/2+.32,goal=SE.tgt?SE.tgt.x:SE.mv?SE.x+SE.mv*50:SE.x;
    if(SE.x>=wx){SE.x=wx;SE.v=0;SE.atWall=true;if(goal>D.x+D.w/2&&SE.fallT<=0){SE.climbT=.75;SE.post=SE.post==='prone'?'stand':SE.post;SE.climbFrom={x:SE.x,y:SE.y,tx:D.x+D.w/2+.3};saRustle(.05)}}
    if(SE.x<=lx){SE.x=lx;if(SE.v<0)SE.v=0;if(goal<D.x-D.w/2&&SE.fallT<=0){SE.climbT=.75;SE.post=SE.post==='prone'?'stand':SE.post;SE.climbFrom={x:SE.x,y:SE.y,tx:D.x-D.w/2-.3};saRustle(.05)}}}
  // visszafelé legfeljebb 10 m (és a roncsig)
  if(SE.x>SE.maxX)SE.maxX=SE.x;const minX=Math.max(SE.maxX-10,SE.minX!=null?SE.minX:-1e9);if(SE.x<minX){SE.x=minX;if(SE.v<0)SE.v=0;if(SE.tgt&&SE.tgt.x<minX)SE.tgt=null;if(SE.mv<0)SE.mv=0}
  if(SE.cover&&Math.abs(SE.x-SE.coverX)>.6)SE.cover=null;
  gnd=seGround(SE.x);SE.vy-=14*dt;SE.y+=SE.vy*dt;
  if(SE.y<=gnd){if(wasAir&&SE.vy<-2){SE.land=.16;seStepSnd(2);for(let i=0;i<5;i++)SE.fx.push({k:'dust',x:SE.x+(Math.random()-.5)*.4,y:gnd+.05,vx:(Math.random()-.5)*1.5,vy:Math.random()*1.2,t:0,life:.5});if(gnd<-.5&&!SE.tgt)sePop('🕳️ Árokban – lapulj le, vagy koppints túlra: kimászol','#bfe6ff')}SE.y=gnd;SE.vy=0}
  if(SE.land>0)SE.land-=dt;
  if(SE.y<=gnd+.01&&Math.abs(SE.v)>.3){if(SE.crawling){SE.crawlD+=Math.abs(SE.v)*dt;if(SE.crawlD>.55){SE.crawlD=0;seStepSnd(3)}}else{SE.step+=Math.abs(SE.v)*dt*(SE.cr>.5?1.4:1);if(SE.step>1.5){SE.step-=1.5;seStepSnd(0);if(SE.inStream)for(let i=0;i<4;i++)SE.fx.push({k:'drop',x:SE.x,y:.15,vx:(Math.random()-.5)*2,vy:1+Math.random()*1.5,t:0,life:.6})}}}}
// ---- rajtaütés a Bravo végén: innen nincs menekvés ----
function seAmbush(){SE.amb={t:0};SE.tgt=null;SE.mv=0;SE.cover=null;const x=SE.x;SE.objs.push({k:'walker',x0:x+8,x:x+8,r:.3,dir:-1,sp:1,amb:1},{k:'walker',x0:x-7,x:x-7,r:.3,dir:1,sp:1,amb:1},{k:'walker',x0:x+12,x:x+12,r:.3,dir:-1,sp:1,amb:1});
  SE.shake=.35;sndBoom();seRadio('📻 „…Hammer Two-One, Overlord… break… CONTACT!” – Fények mindenhonnan. Bekerítettek!',5200);rockStart('sere_t');rockTempo(132)}
function seAmbTick(dt){const A=SE.amb;A.t+=dt;for(const o of SE.objs)if(o.amb){o.dir=Math.sign(SE.x-o.x)||o.dir;if(Math.abs(o.x-SE.x)>1.1)o.x+=o.dir*1.9*dt;o.x0=o.x}
  SE.det=Math.min(1,.4+A.t*.2);if(A.t>3.6){SE.amb=null;SE.objs=SE.objs.filter(o=>!o.amb);seCapture(true)}}
function seGet(o){SE.items++;const it=o.it,I=SE.inv;
  const M={water:['💧 Kulacs +30','#9fd8ff'],food:['🍖 Élelem +30','#ffd28a'],med:['✚ Elsősegély +30','#9dff9d'],tinder:['🌾 Tapló, száraz fű','#e8d08a'],kindling:['🍂 Gyújtós (vékony gally)','#e8c08a'],wood:['🪵 Tűzifa','#e8c08a'],leaf:['🌿 Ágak a menedékhez','#9dff9d'],berry:['🫐 Áfonya – ismert, ehető +12','#c8b8ff'],nut:['🌰 Mogyoró +12','#e8c08a'],grub:['🐛 Lárva – fehérje +10','#e8d08a']};
  if(it==='redb'||it==='mush'){SE.v=0;seEvent(it==='redb'?'berry':'mush');return}
  if(it==='herb'){SE.v=0;const pool=Object.keys(SE_EV).filter(k=>k.startsWith('pl_')&&!(SE.plSeen||[]).includes(k)),id=pool.length?pool[Math.floor(Math.random()*pool.length)]:'pl_csalan';SE.plSeen=[...(SE.plSeen||[]),id];seEvent(id);return}
  sePts('item',30);sePickSnd(it);if(it==='water')SE.water=Math.min(100,SE.water+30);else if(it==='food')SE.food=Math.min(100,SE.food+30);else if(it==='med')SE.hp=Math.min(100,SE.hp+30);
  else if(it==='berry'||it==='nut'||it==='grub'){SE.food=Math.min(100,SE.food+(it==='grub'?10:12));I.forage++}else I[it]=(I[it]||0)+1;
  const m=M[it]||['+','#fff'];sePop(m[0]+(I[it]!=null&&['tinder','kindling','wood','leaf'].includes(it)?` (${I[it]})`:''),m[1]);SE.fx.push({k:'+',x:o.x,y:o.y,t:0});seAlCheck()}
// ---- Alpha küldetések ----
function seAlId(){return (SE_AL[SE.al]||{}).id}
function seAlDone(id){if(SE.alDone[id])return;SE.alDone[id]=true;sePts('task',150);const i=SE_AL.findIndex(a=>a.id===id);sePop(`✅ ${SE_AL[i].ic} ${SE_AL[i].n} – teljesítve! +150`,'#9dff9d');seOk();
  setTimeout(()=>{if(SE.phase==='play'||SE.phase==='camp')seAlNext()},1400)}
function seAlNext(){let i=0;while(i<SE_AL.length&&SE.alDone[SE_AL[i].id])i++;SE.al=i;const id=seAlId();if(!id)return;const x=SE.x;
  const clear=(a,b)=>{SE.objs=SE.objs.filter(o=>!(o.x>x+a&&o.x<x+b&&['log','ditch','rock','lowlog','wire','lowwire','stream','boulder'].includes(o.k)))};
  if(id==='comms'){seRadio('📻 Rádiókapcsolat: nyisd meg a rádiót, hallgasd meg a kivonási pont koordinátáját, és írd be MGRS-ben!',6000);setTimeout(()=>{if(SE.phase==='play'&&seAlId()==='comms'&&!SE.choice)seComms()},1800)}
  if(id==='water'){clear(14,32);SE.objs.push({k:'stream',x:x+24,w:3.6,alpha:'water'});SE.resv=x+24;seRadio('💧 Keress ivóvizet! Előtted patak csobog – hallod?',4200)}
  if(id==='nav'){clear(18,34);SE.objs.push({k:'sign',x:x+26});SE.resv=x+26;seRadio('🧭 Útelágazás jön – a Nap állása alapján dönts!',3800)}
  if(id==='fire')seRadio('🔥 Gyűjts tűzanyagot estére: 🌾 2 tapló, 🍂 3 gyújtós, 🪵 3 tűzifa.',4500);
  if(id==='food')seRadio('🫐 Élelem: 3 biztosan ismert dolgot gyűjts (áfonya, mogyoró, lárva). Ismeretlen bogyó, gomba: vigyázz!',5000);
  if(id==='boar'){clear(20,40);SE.objs.push({k:'boar',x:x+34});SE.resv=x+34;seRadio('🐗 Friss túrás, csörtetés a bozótban… óvatosan!',3500)}
  if(id==='aid'||id==='storm')SE.alNext=SE.t+(id==='aid'?6:8);
  if(id==='shelter'){seRadio(`⛺ Közeledik az este. Menedékhez 🌿 ${seLN()} ág kell (most ${SE.inv.leaf})${seKit('knife')?'':' – kés nélkül több kell'}. A tűzanyagot megőrizted.`,5000)}
  seTray()}
function seAlCheck(){const id=seAlId(),I=SE.inv;if(SE.day!==1||SE.tut)return;
  if(id==='fire'&&I.tinder>=2&&I.kindling>=3&&I.wood>=3)seAlDone('fire');if(id==='food'&&I.forage>=3)seAlDone('food')}
function seAlTick(dt){const id=seAlId();if((id==='aid'||id==='storm')&&SE.t>SE.alNext&&!SE.choice&&!SE.quiz&&!SE.mg){if(id==='aid')seAidStart();else seEvent(id)}
  if(id==='storm'&&SE.choice&&SE.choice.id==='storm')SE.rain=1}
// ---- döntések (Alpha események, ismeretlen ételek) ----
function seEvent(id){if(SE.choice||SE.phase!=='play')return;SE.mv=0;SE.tgt=null;const E=SE_EV[id];SE.quiz=null;SE.choice={id,E,order:seShuf([0,1,2]),t:SE_CT};seTray();seClick(1)}
function seChoose(j){const C=SE.choice;if(!C)return;SE.choice=null;const id=C.id,o=j>=0?C.E.o[j]:null,ok=!!(o&&o[1]);SE.nextQuiz=Math.max(SE.nextQuiz,10);
  if(id==='auth'){seAuthRes(ok);seTray();return}
  if(ok){SE.correct++;sePts('dec',150);seOk();sePop('✅ Helyes döntés! +150','#9dff9d');if(id==='water'){if(seKit('water')){SE.water=100;SE.cleanWater=true;seKitUse('water')}else{SE.water=Math.min(100,SE.water+45);seKitMiss('water','💧 Nincs kulacsod és tablettád – csak marokkal, keveset ihattál a forrásnál (+45).')}}if(id==='aid'){if(seKit('med')){SE.hp=Math.min(100,SE.hp+10);seKitUse('med')}else{SE.hp=Math.max(1,SE.hp-12);seKitMiss('med','✚ Nincs elsősegélycsomagod – rögtönzött kötés, a seb tovább fáj (−12).')}}if(id==='nav'){if(seKit('compass'))seKitUse('compass');else{SE.kmD+=900;seKitMiss('compass','🧭 Iránytű és térkép nélkül csak a Napra hagyatkozhattál – kerülő: +0,9 km.')}}if(id==='berry'||id==='mush')sePts('dec',50);if(id==='camo')SE.camo=true;if(id==='epa')SE.epa=true}
  else{SE.wrong++;seBeep(200,.25,.05);const P={stop:[0,10,0,'Pánikban elfutottál – fogy a víz.'],water:[15,25,0,'Hasmenés – kiszáradás veszélye!'],nav:[0,15,10,'Eltévedtél – hosszú kerülő.'],boar:[20,0,0,'A koca nekirontott!'],aid:[15,0,0,'A seb tovább vérzik.'],storm:[10,0,0,'Majdnem belecsapott a villám!'],berry:[25,0,0,'Mérgező volt – rosszul vagy.'],mush:[30,0,0,'Gombamérgezés!'],epa:[0,10,5,'Rossz útvonal – kerülő, fáradtság.'],camo:[0,0,0,'Messziről látszol – figyelj jobban!'],track:[10,0,0,'A kutya közel jár!'],hide:[10,0,0,'A rejtekhelyet átvizsgálták – menekülnöd kellett.'],radio:[0,0,0,'Bemérték az adást!'],road:[0,0,0,'Ott, ahol mindenki lát…'],observe:[0,0,0,'Figyeld jobban a ritmust!']}[id]||[5,0,0,''];
    SE.hp=Math.max(1,SE.hp-P[0]);SE.water=Math.max(0,SE.water-P[1]);SE.food=Math.max(0,SE.food-P[2]);SE.shake=.2;sePop((j<0?'⏱️ Lejárt az idő! ':'❌ ')+P[3],'#ff7b7b');if(id==='water'){SE.water=Math.max(SE.water,40)}}
  if(ok&&id.startsWith('pl_')&&C.E.ed){SE.inv.forage++;SE.food=Math.min(100,SE.food+10);seAlCheck()}if(ok&&id==='dr_therm'&&seKit('poncho'))seKitUse('poncho');if(C.E.next)setTimeout(()=>{if(SE.phase==='play')seEvent(C.E.next)},1900);
  seRadio((ok?'✅ ':'ℹ️ ')+(o?o[2]:C.E.o[0][2]),5200);if(id==='storm')setTimeout(()=>{SE.rain=0},5000);
  if(SE_AL.some(a=>a.id===id))seAlDone(id);if(SE.brBusy===id&&id!=='road')seBrDone(id);seTray()}
// ---- menedék és tűzgyújtás (1. nap estéje) ----
function seCamp(o){SE.phase='camp';SE.campT=0;SE.campX=o.x;SE.campSt='build';SE.inv.leaf-=seLN();if(seKit('knife'))seKitUse('knife');else seKitMiss('knife');if(seKit('cord'))seKitUse('cord');SE.v=0;SE.quiz=null;SE.choice=null;seRadio('⛺ Menedéket építesz: ágakból tető, avarból ágy…',3000);saRustle(.06);seTray()}
function seCampTick(dt){SE.campT+=dt;const I=SE.inv;
  if(SE.campSt==='build'&&SE.campT>2.4){SE.sheltered=true;const mat=I.tinder>=2&&I.kindling>=3&&I.wood>=3;if(mat&&!seKit('fire')){SE.campSt='rest';SE.campT=0;seKitMiss('fire','🔥 Megvan a tűzanyag, de nincs tűzacélod – tűz nélkül, fázva alszol.')}else if(mat){seKitUse('fire');SE.campSt='fire';SE.campT=0;SE.mg={k:'fire',hits:0,tries:0,t:0,zc:.3+Math.random()*.4,zw:.2,sp:2.1};seRadio('🔥 Tűzgyújtás tűzacéllal: koppints a SZIKRA gombra, amikor a jel a zöldben van – 3 jó szikra kell!',5000);seTray()}
    else{SE.campSt='rest';SE.campT=0;seRadio('❄️ Nincs elég tűzanyag – tűz nélkül hideg éjszaka vár.',3500)}}
  if(SE.campSt==='rest'){SE.tod=Math.min(.995,SE.tod+dt*.17);if(SE.campT>4.5){SE.phase='play';SE.alDone.shelter=true;SE.hp=Math.min(100,SE.hp+(SE.fire?30:5));SE.water=Math.min(100,SE.water+(SE.fire?25:0));sePts('surv',SE.fire?400:150);SE.tod=.999;sePop(SE.fire?'⛺🔥 Meleg éjszaka! +400':'⛺ Átvészelted – fázva. +150','#9dff9d');seTray()}}}
function seMgTick(dt){const M=SE.mg;if(M.k!=='fire')return;M.t+=dt;M.m=.5+.5*Math.sin(M.t*M.sp);const m=$('#seMgM');if(m)m.style.left=(M.m*100)+'%'}
function seSpark(){const M=SE.mg;if(!M)return;M.tries++;const hit=Math.abs(M.m-M.zc)<=M.zw/2;
  if(hit){M.hits++;seOk();for(let i=0;i<10;i++)SE.fx.push({k:'spark',x:SE.campX-.6+(Math.random()-.5)*.3,y:.2,vx:(Math.random()-.5)*2,vy:1+Math.random()*2,t:0,life:.6});M.zc=.25+Math.random()*.5}else seBeep(240,.08,.04);
  if(M.hits>=3){SE.fire=true;SE.mg=null;SE.campSt='rest';SE.campT=0;seRadio('🔥 Ég a tűz! Tapló → gyújtós → tűzifa. Meleg és biztonság.',3500);seTray();return}
  if(M.tries>=7){SE.mg=null;SE.campSt='rest';SE.campT=0;seRadio('💨 Nem fogott tüzet – a tapló nedves lett. Tűz nélkül alszol.',3500);seTray();return}seTray()}
// ---- Bravo küldetéssor (2–3. nap) ----
const SE_BRV={2:['epa','camo','track','observe','hide'],3:['radio','road','tower3','fence','dogs']};
const SE_BRN={epa:['🗺️','Kitérési terv'],camo:['🎨','Álcázás'],track:['👣','Nyomeltüntetés'],observe:['👁️','Járőr megfigyelése'],hide:['🏚️','Nappali rejtekhely'],radio:['📻','Rádióforgalmazás'],road:['🛣️','Átkelés az úton'],tower3:['🗼','Őrtorony'],fence:['🚧','Kerítés'],dogs:['🐕','Kutyák']};
function seBrList(){return SE_BRV[SE.day]||null}
function seBrTick(dt){const L=seBrList();if(!L||SE.esc||SE.tut)return;const id=L[SE.br];if(!id||SE.brBusy)return;if(SE.t<SE.brNext||SE.choice||SE.quiz||SE.ex)return;if(id==='hide'&&!(SE.tod>.84))return;
  const x=SE.x,clear=(a,b)=>{SE.objs=SE.objs.filter(o=>!(o.x>x+a&&o.x<x+b&&o.k!=='bush'))},ahead=n=>{SE.genX=Math.max(SE.genX,x+n)};SE.brBusy=id;
  if(['epa','camo','radio','hide'].includes(id)){SE.brBusy=null;seEvent(id);SE.brBusy=SE.choice?id:null;return}
  if(id==='track'){clear(6,60);seDogStart();SE.objs.push({k:'stream',x:x+30,w:3.6,brk:'track'});ahead(40)}
  else if(id==='observe'){clear(6,40);SE.objs.push({k:'bush',x:x+14,w:3},{k:'patrol',x:x+24,ph:Math.random()*6,w:.5,brk:'observe'},{k:'bush',x:x+29,w:2.6});ahead(36);seRadio('👁️ Járőr előtted. Bújj el a bokorban, és figyeld meg: mennyi ideig fordul el?',4500)}
  else if(id==='road'){clear(6,40);SE.objs.push({k:'ditch',x:x+16,w:2.6},{k:'road',x:x+21.5,w:4,brk:'road'},{k:'veh',x:x+64,vx:-9},{k:'bush',x:x+28,w:2.6});ahead(34);SE.brBusy=null;seEvent('road');SE.brBusy='road'}
  else if(id==='tower3'){clear(6,45);SE.objs.push({k:'bush',x:x+12,w:2.8},{k:'ditch',x:x+19,w:2.2},{k:'tower',x:x+25,ph:Math.random()*6,w:.3,brk:'tower3'},{k:'bush',x:x+31,w:2.6},{k:'bush',x:x+38,w:2.4});ahead(44);seRadio('🗼 Őrtorony reflektorral! Bokortól bokorig, az árokban lapulj.',4000)}
  else if(id==='fence'){clear(6,40);SE.objs.push({k:'bush',x:x+12,w:2.6},{k:'lowwire',x:x+18,w:3,yb:.55,yt:.9,brk:'fence'},{k:'patrol',x:x+27,ph:Math.random()*6,w:.55},{k:'bush',x:x+31,w:2.6});ahead(36);seRadio('🚧 Kerítés: csak alatta, kúszva lehet átjutni.',3800)}
  else if(id==='dogs'){clear(6,60);seDogStart();SE.objs.push({k:'stream',x:x+34,w:3.6,brk:'dogs'});ahead(44)}
  seTray()}
function seBrDone(id){const L=seBrList();if(!L||SE.brDone[id])return;SE.brDone[id]=1;SE.brBusy=null;SE.br=L.findIndex(k=>!SE.brDone[k]);if(SE.br<0)SE.br=L.length;SE.brNext=SE.t+7;sePts('task',150);const n=SE_BRN[id];sePop(`✅ ${n[0]} ${n[1]} – teljesítve! +150`,'#9dff9d');seOk();
  if(SE.br>=L.length)setTimeout(()=>{if(SE.phase==='play')seRadio(SE.day===2?'🌙 A napi feladatok megvannak. Éjjel a rejtekhelyen pihensz – holnap tovább.':'🌙 Utolsó szakasz a kivonási pont felé… a csend gyanús.',5000)},1600);seTray()}
function seObserveEv(o){const n=Math.max(2,Math.round(.45*2*Math.PI/o.w)),a=Math.max(1,Math.round(n*.35)),b=Math.round(n*1.9);
  SE_EV.observe={ic:'👁️',t:'Megfigyelés',q:'Mennyi ideig fordul el a járőr (rádiózik), mielőtt újra pásztáz?',o:[[`kb. ${n} másodpercig`,1,`Kb. ${n} másodperc – ennyi időd van átjutni. A türelmes megfigyelés életet ment.`],[`kb. ${a} másodpercig`,0,`Valójában kb. ${n} másodperc. Figyeld a ritmust, mielőtt mozdulsz.`],[`kb. ${b} másodpercig`,0,`Valójában kb. ${n} másodperc – ha ennyire hagyatkozol, a lámpa elkap.`]]};
  SE.brBusy='observe';seEvent('observe');if(!SE.choice||SE.choice.id!=='observe')seBrDone('observe')}
// ---- kimentés: hitelesítés ----
function seAuthAsk(){const pool=['BAGOLY-7','HÓVIRÁG-3','VÉRCSE-9','TÖLGY-4','SÓLYOM-2','PATAK-8','BAGOLY-3','SÓLYOM-7'].filter(w=>w!==SE.auth);const d=seShuf(pool).slice(0,2);
  SE_EV.auth={ic:'🔐',t:'Hitelesítés – a helikopter rádión kérdez',q:'„Azonosítsd magad: mi a jelszavad?”',o:[[SE.auth,1,'Hitelesítve – a mentőerő biztos lehet benne, hogy nem csapda.'],[d[0],0,'Rossz jelszó – csapdát gyanítanak, a gép elfordul.'],[d[1],0,'Rossz jelszó – csapdát gyanítanak, a gép elfordul.']]};seEvent('auth')}
function seAuthRes(ok){const E=SE.ex;if(!E)return;seRadio(ok?'✅ „Authenticated. Kestrel One-One landing, run to the aircraft!” – Fuss a helikopterhez!':`❌ Hibás jelszó (a helyes: ${SE.auth}). „Negative authentication” – a helikopter elfordul.`,5000);
  if(ok){E.st='land';E.lz=SE.x+16;SE.objs=SE.objs.filter(o=>!(o.x>SE.x-2&&o.x<E.lz+12&&o.k!=='bush'&&o.k!=='tree'));SE.objs.push({k:'lz',x:E.lz});sePts('ex',150);seOk()}else{E.st='gone';E.t=0;SE.det=Math.min(.9,SE.det+.3);seBeep(200,.3,.05)}}
// ---- látómező / lámpa / reflektor / hőkamera ----
function seCones(dt){const out=[],L=seLight(),dark=L<.5;dt=dt||0;
  for(const o of SE.objs){
    if(o.k==='patrol'){const u=(((SE.t*o.w+o.ph)/(Math.PI*2))%1+1)%1;const al=(o.alert||0)>0;o.away=u>=.55&&!al;if(o.away)continue;let tx=o.tutp?o.x-5+3.5*Math.sin(u/.55*Math.PI*2):o.x-6+5.5*Math.sin(u/.55*Math.PI*2);if(al){o.tx=o.tx==null?tx:o.tx+(SE.x-o.tx)*Math.min(1,dt*2.5);tx=o.tx}else o.tx=tx;const hw=dark?1.7:2.4;out.push({o,lamp:dark,ax:o.x,ay:3.1,bx:tx-hw,cx:tx+hw,rate:dark?1.5:1.05})}
    else if(o.k==='walker'){if(!o.amb){if((o.alert||0)>1.5){o.dir=Math.sign(SE.x-o.x)||o.dir;if(SE.det>.45)o.x+=o.dir*1.5*dt}else if(o.wait>0){o.wait-=dt;if(Math.random()<dt*.4)o.dir*=-1}else{o.x+=o.dir*o.sp*dt;if(Math.abs(o.x-o.x0)>o.r){o.x=o.x0+Math.sign(o.x-o.x0)*o.r;o.dir*=-1;o.wait=1.8+Math.random()*1.6}}}
      o.ph=(o.ph||0)+dt*(o.wait>0?0:o.sp*5);out.push({o,walker:1,lamp:dark,ax:o.x+o.dir*.25,ay:1.45,dir:o.dir,len:dark?7:9,rate:dark?1.8:1.35})}
    else if(o.k==='tower'){const al=(o.alert||0)>0;let tx=o.x+9.5*Math.sin(SE.t*o.w+o.ph);if(al){o.tx=o.tx==null?tx:o.tx+(SE.x-o.tx)*Math.min(1,dt*2);tx=o.tx}else o.tx=tx;const hw=dark?1.6:2.6;out.push({o,lamp:dark,search:1,ax:o.x,ay:7.4,bx:tx-hw,cx:tx+hw,rate:dark?1.8:1})}
    else if(o.k==='drone'){o.x=o.ax+7*Math.sin(SE.t*o.v+o.ph);out.push({o,thermal:1,ax:o.x,ay:8.5,bx:o.x-2.1,cx:o.x+2.1,rate:1.3})}
    else if(o.k==='veh'){out.push({o,lamp:1,head:1,ax:o.x-2.2,ay:1.9,bx:o.x-12,cx:o.x-3.2,rate:2.2})}}
  return out}
function seInTri(px,py,C){const cross=(x1,y1,x2,y2,x3,y3)=>(x2-x1)*(y3-y1)-(y2-y1)*(x3-x1);if(C.thermal){const half=.35+(2.1-.35)*(1-py/C.ay);return Math.abs(px-C.ax)<half&&py<C.ay}
  if(C.walker){const dx=(px-C.ax)*C.dir;return dx>=-.2&&dx<=C.len&&Math.abs(py-C.ay)<.3+Math.max(0,dx)*.3}
  const a=cross(C.ax,C.ay,C.bx,0,px,py),b=cross(C.bx,0,C.cx,0,px,py),c=cross(C.cx,0,C.ax,C.ay,px,py);return (a>=0&&b>=0&&c>=0)||(a<=0&&b<=0&&c<=0)}
function sePy(){return Math.max(0,SE.y+.25+.65*(1-SE.pr)-.3*SE.cr)}
// fedezék: ha a szikla / rönk / fatörzs a figyelő és közted van, takar
function seCoverBlocks(q){const c=SE.cover;if(!c||c.k==='bush'||c.k==='ditch')return 1;if((q.ax-SE.x)*(c.x-SE.x)<=0)return 1;
  const still=Math.abs(SE.v)<.15;
  if(c.k==='boulder')return SE.prone||SE.cr>.6?(q.search?.3:q.thermal?.5:0):.55;
  if(c.k==='log'||c.k==='rock')return SE.prone?(q.search?.35:q.thermal?.7:0):1;
  if(c.k==='tree')return still&&!SE.prone?(q.search?.45:q.thermal?.85:.1):1;return 1}
function seHidden(){const still=Math.abs(SE.v)<.15;return (SE.prone&&SE.inBush&&still)||(SE.inDitch&&SE.prone)||(SE.cover&&SE.prone&&['log','rock','boulder'].includes(SE.cover.k))}
function seDetect(dt){const py=sePy(),C=seCones(dt);let seen=0,src=null;SE.cones=C;for(const q of C)q.hit=false;
  for(const q of C){if(!seInTri(SE.x,py,q))continue;let r=q.rate;const still=SE.prone&&!SE.crawling;
    if(q.thermal){if((SE.prone&&SE.inBush)||SE.inStream)r=0;else if(SE.inDitch&&SE.prone)r*=.45;else if(SE.prone)r*=.7;else if(SE.cr>.6)r*=.9}
    else{if(SE.inDitch)r*=SE.prone?0:.35;else if(SE.prone&&SE.inBush)r*=still?0:.2;else if(SE.prone)r*=q.head?(still?.12:.3):(still?.35:.55);else if(SE.cr>.6){const st=Math.abs(SE.v)<.15;r*=SE.inBush?(st?.05:.25):q.head?(st?.4:.5):(st?.55:.65)}else if(SE.inBush)r*=Math.abs(SE.v)<.15?.45:.6;else if(SE.v>2.4)r*=1.25}
    if(q.thermal&&seKit('poncho')&&r>0){r*=.5;seKitUse('poncho')}r*=seCoverBlocks(q);if(q.walker)r*=1+1.3*(1-Math.min(1,Math.abs(SE.x-q.ax)/q.len));
    if(r>0){q.hit=true;if(r>seen){seen=r;src=q.o}}}
  seen*=(seKit('phone')?1.12:1)*(SE.wx==='kod'?.75:SE.wx==='tel'?1.1:1)*(1+.06*Math.max(0,Math.min(3,SE.day)-2))*(SE.rain?.75:1)*(SE.camo?.85:1)*(SE.epa?.92:1);SE.seen=seen;
  // zaj: a futás messzire hallatszik, a kúszás alig
  const spd=Math.abs(SE.v);let nz=0;if(SE.vault)nz=2.2;else if(spd>.3&&SE.y<=seGround(SE.x)+.05){nz=SE.crawling?.6:SE.cr>.6?1.3:spd>2.4?7:3;if(SE.inStream)nz+=2;if(SE.rain)nz*=.6}
  SE.noise=nz;let heard=0;
  for(const o of SE.objs){if(o.k!=='walker'&&o.k!=='patrol')continue;if(o.alert>0)o.alert-=dt;const R=o.k==='patrol'?(nz>=7?4.5:0):nz;if(!R)continue;const d=Math.abs(o.x-SE.x)-(o.k==='patrol'?1.2:0);if(d<R){heard=1;SE.det+=.42*(1-d/R)*dt;o.alert=Math.max(o.alert||0,o.k==='walker'?2.2:1.2)}}
  SE.heard=heard;
  if(seen>0){SE.det+=seen*dt;if(src)src.alert=Math.max(src.alert||0,3);SE.beepT-=dt;if(SE.beepT<=0){SE.beepT=.34-.2*SE.det;seBeep(620+SE.det*500,.05,.025)}if(navigator.vibrate&&SE.det>.6&&Math.random()<dt*2)try{navigator.vibrate(25)}catch(e){}}
  else if(!heard)SE.det=Math.max(0,SE.det-.2*dt);
  // a gyalogos őr belebotlik, ha nem vagy elrejtve
  for(const o of SE.objs)if(o.k==='walker'&&!o.amb&&Math.abs(o.x-SE.x)<.7&&!seHidden()){SE.det=1;break}
  if(SE.det>=1){SE.det=1;if(SE.tut)seTutFail();else if(!SE.amb)seCapture(false)}}
function seDogStart(){SE.dog={x:SE.x-30,st:'chase'};seRadio('🐕 Kutyák a nyomodban! Érj el egy patakig – a víz elveszi a szagot!');seBark();
  if(!SE.objs.some(o=>o.k==='stream'&&o.x>SE.x+10&&o.x<SE.x+60))SE.objs.push({k:'stream',x:SE.x+38,w:3.4})}
function seNewDay(){SE.day++;if(SE.day===2&&!seKit('socks'))setTimeout(()=>seKitMiss('socks','🧦 Vízhólyag – nincs száraz zoknid. Lassabban haladsz.'),9000);SE.br=0;SE.brBusy=null;SE.brNext=SE.t+5;sePts('surv',300);SE.spd=4.2;if(SE.dog)SE.dog.st='lost';SE.rain=SE.day>=3&&Math.random()<.35?1:0;SE.resv=0;
  sePop(`☀️ Túlélted a(z) ${SE.day-1}. éjszakát! +300`,'#f3d77a');seOk();seBanner(SE.day);seSave();
  if(SE.day===2)setTimeout(()=>seRadio('📻 Ellenséges területre értél: járőrök, gyalogos őrök lámpával! Fedezékről fedezékre – koppints a sziklára, bokorra, árokra.',5500),2600);
  if(SE.rain)setTimeout(()=>seRadio('🌧️ Eső: rosszabb a látás – nekik is. Halkabb a lépted.',3500),6000);seTray()}
// ---- kimentés (Personnel Recovery): minden 3. hajnalon ----
// ---- kivonás: H225M helikopter a kivonási ponton ----
function seLZStart(){if(SE.ex)return;seLZClear();SE.ex={st:'wait',t:0,hx:SE.x+45,hy:16,tries:(SE.exTries||0)+1};SE.exTries=SE.ex.tries;SE.tgt=null;
  seRadio('📻 „Hammer Two-One, Kestrel One-One, two minutes out. Signal when you see us, over.” – Jelezz, amikor látod a helikoptert!',6000);seSpeak('Hammer Two-One, Kestrel One-One. Two minutes out. Signal when you see us. Over.');seTray()}
function seExStart(){seLZStart()}
function seExTick(dt){const E=SE.ex;E.t+=dt;
  if(E.st==='wait'||E.st==='auth'){const tx=SE.x+12+3*Math.cos(E.t*.4),ty=(E.st==='auth'?7.5:8.5)+Math.sin(E.t*.7)*.6;E.hx+=(tx-E.hx)*Math.min(1,dt*.5);E.hy+=(ty-E.hy)*Math.min(1,dt*.5);E.vis=E.t>3.5;if(E.st==='wait'&&E.t>30){E.st='gone';E.t=0;sePop('🚁 Nem láttak meg – újra próbálják','#bfe6ff');seTray()}}
  else if(E.st==='land'){E.hx+=(E.lz-E.hx)*Math.min(1,dt*.6);E.hy+=(0-E.hy)*Math.min(1,dt*.45);if(E.hy<.05)E.hy=0;if(E.hy<.3&&SE.x>=E.lz-3.7&&!E.board){E.board=1;SE.tgt=null;SE.mv=0;E.st='board';E.t=0}}
  else if(E.st==='board'){if(E.t>1.6){E.st='out';E.t=0;seExtract()}}
  else if(E.st==='gone'){E.hx+=14*dt;E.hy+=4*dt;if(E.t>9){SE.ex=null;if((SE.exTries||0)<3)setTimeout(()=>{if(SE.phase==='play')seLZStart()},1500);else seOver('A helikopter nem tudott felvenni – a kivonás meghiúsult.')}}
  else if(E.st==='out'){E.hy+=4*dt;E.hx-=6*dt}}
function seSignal(){const E=SE.ex;if(!E||E.st!=='wait')return;if(E.vis&&!seKit('mirror')&&!E.mt){E.mt=1;seKitMiss('mirror','🪞 Nincs jelzőtükröd – integetsz, de a gép nem lát meg. Próbáld újra!');seBeep(300,.15,.04);return}if(E.vis&&seKit('mirror'))seKitUse('mirror');
  if(!E.vis){SE.det=Math.min(.95,SE.det+.4);sePop('🔦 Túl korán – felfedted magad!','#ff7b7b');seBeep(300,.2,.05);return}
  E.st='auth';sePop('🟢 Látnak! Hitelesítés…','#9dff9d');seOk();seTray();seSpeak('Hammer Two-One, Kestrel One-One. Visual. Authenticate, over.');seAuthAsk()}
function seExtract(){SE.extr++;sePts('ex',1000);if(SE.buddy){sePts('ex',800);setTimeout(()=>sePop(`🤝 ${SE.budName||'Kovács'} őrvezetőt is kihoztad! +800`,'#9dff9d'),1200)}SE.det=0;SE.dog=null;seRadio('🚁 „Kestrel One-One, one souls on board, lifting.” – KIMENTVE!',4000);rockStart('rk_win');if(navigator.vibrate)try{navigator.vibrate([60,40,120])}catch(e){}
  setTimeout(()=>{if(SE.phase==='play')seOver('🚁 Kimentettek – a bevetés teljesítve!',true)},5200)}
// ---- villámkérdés ----
function seQuiz(){if(!SE.qDeck||!SE.qDeck.length){const last=SE.qLast;SE.qDeck=seShuf(SE_QA.map((_,i)=>i));if(SE.qDeck[SE.qDeck.length-1]===last)SE.qDeck.unshift(SE.qDeck.pop())}const qi=SE.qDeck.pop();SE.qLast=qi;const q=SE_QA[qi];const order=seShuf([0,1,2]);SE.quiz={q,order,t:SE_QT};SE.tgt=null;SE.mv=0;seTray();seClick(1)}
function seAnswer(i){const Q=SE.quiz;if(!Q)return;SE.quiz=null;SE.nextQuiz=(SE.day===1?28:24)+Math.random()*12;const ok=i===0;SE.qN=(SE.qN||0)+1;
  if(ok){SE.correct++;SE.qOk=(SE.qOk||0)+1;sePts('quiz',100);SE.water=Math.min(100,SE.water+8);SE.food=Math.min(100,SE.food+8);sePop('✅ Helyes! +100','#9dff9d');seOk()}
  else{SE.wrong++;SE.hp=Math.max(1,SE.hp-5);sePop(i<0?'⏱️ Lejárt az idő! −5':'❌ Nem jó! −5','#ff7b7b');seBeep(220,.18,.05)}
  seRadio((ok?'✅ ':'ℹ️ ')+Q.q[2],5200);seTray()}
// ===== CHARLIE: elfogás → bekötött szemű szállítás → kihallgatás (ellenállás) → cella (rutin, kopogókód) → szökés-pálya =====
// Szimuláció nyilvánosan ismert alapelvek (III. genfi egyezmény, magatartási kódex, ismert kihallgatási taktikák) alapján – nem hivatalos tananyag.
const SE_INT=[
  ['Hamis barátság','„Nyugi, nem akarok rosszat. Cigit? Csak beszélgetünk. Honnan jöttél?”',[['Név, rendfokozat, szolgálati szám, születési dátum – többet nem mondok',1],['Elmondom, honnan jöttem, ez úgysem titok',0],['Sértegetem, hogy ne barátkozzon',-1]],'A kedvesség is taktika: a „csak beszélgetünk” a leggyakoribb nyitás. Udvarias, de csak a négy adat.'],
  ['„A társad már beszélt”','„A társad már mindent elmondott. Csak meg kell erősítened.”',[['Udvariasan: erre a kérdésre nem tudok válaszolni',1],['Akkor már mindegy, elmondom én is',0],['Kijavítom, amit rosszul mondott',0]],'Lehet, hogy nem is igaz. Egy javítás vagy megerősítés is információ.'],
  ['Fenyegetés','„Ha nem beszélsz, soha többé nem látod a családodat.”',[['Lassan lélegzem, nyugodt maradok, ismétlem a négy adatot',1],['Pánikba esem, kiabálok',-1],['Alkudozni kezdek, mit kapok, ha beszélek',0]],'A fenyegetés a félelmet használja. A légzés és a rutinszerű válasz visszaadja a kontrollt.'],
  ['Hamis könnyítés','„Csak egy rövid levelet írsz haza, hogy jól vagy. Aláírod, és mehetsz pihenni.”',[['Nem írok alá és nem fogalmazok semmit',1],['Aláírom, hiszen csak egy levél',0],['Csak a nevemet írom alá',0]],'Bármilyen aláírt vagy saját kezűleg írt szöveg propagandára fordítható.'],
  ['Időérzék rombolása','„Már négy napja vagy itt. Senki nem keres.”',[['Saját rutint tartok: számolom az étkezéseket, gondolatban tervezek',1],['Elhiszem, és feladom',-1],['Megkérdezem, mi a dátum, és cserébe mondok valamit',0]],'Az idő- és helyérzék elvesztése a kiszolgáltatottságot növeli. A saját rutin kapaszkodó.'],
  ['Ígéret','„Ha együttműködsz, orvost kapsz a sebedre.”',[['Az ellátás amúgy is jár – nem cserélem információra',1],['Elmondok egy apróságot az orvosért',0],['Kinevetem',-1]],'A genfi egyezmény szerint a sebesült hadifogolynak ellátás jár – ez nem alku tárgya.'],
  ['Csend','A kihallgató percekig csak néz, egy szót sem szól.',[['Kivárok, nem töltöm ki a csendet beszéddel',1],['Elkezdek beszélni, hogy megtörjem a csendet',0],['Felállok és kiabálok',-1]],'A csend nyomás: sokan beszélni kezdenek, csak hogy vége legyen.'],
  ['Apró kérdés','„Legalább azt mondd meg, melyik alakulatnál szolgálsz. Ez csak formaság.”',[['Csak a négy adatot adom meg',1],['Megmondom, ez tényleg csak formaság',0],['Kitalálok egy hamis alakulatot',0]],'Az „apró” kérdésekből rakják össze a képet. A kitalált válasz is ellenőrizhető – és csapdába ejt.'],
  ['Jó zsaru – rossz zsaru','Az egyik ordít veled, a másik kiküldi és bocsánatot kér: „Velem nyugodtan beszélhetsz.”',[['Mindkettőnek ugyanazt: a négy adat, udvariasan',1],['A kedvesnek elmondok valamit, mert ő megvéd',0],['A durvával szemben visszaordítok',-1]],'A két szerep ugyanannak a csapatnak a része.']];
const SE_CUES=[['↰','Balra fordultok',1],['↱','Jobbra fordultok',2],['🌉','Dübörgés – hídon mentek át',0],['🔔','Harangszó a távolban',0],['🪨','Kavicsos útra értek',0],['🐕','Kutyaugatás jobbról',0],['💧','Patak csobog balról',0],['🚂','Vonat fütyül messze',0]];
const SE_TAPA='ABCDEFGHIJLMNOPQRSTUVWXYZ',SE_TAPW=['ERO','HIT','EGY','BIZ','TAR'];
function seCapture(amb){if(SE.phase!=='play')return;if(SE.esc){seEscFail();return}if(SE.escDone){seRecapture();return}SE.phase='cap';SE.stage=4;SE.quiz=null;SE.choice=null;SE.tgt=null;SE.captures++;SE.amb=null;sndBoom();rockStart('sere_t');rockTempo(64);saVol(.2);seCapHum(true);if(navigator.vibrate)try{navigator.vibrate([200,80,200])}catch(e){}
  const dl=(seKit('phone')?1:0)+(seKit('tablet')?2:0);SE.cap={st:'intro',t:0,res:70-dl*8+(SE.buddy?10:0),str:25,leak:dl,dev:dl,bonus:0,round:0,amb:!!amb,qs:seShuf(SE_INT).slice(0,5)};seCapRender();seSave()}
// szökés után újra elkapnak: vissza a táborba (ha van még próbálkozás)
function seRecapture(){SE.escDone=false;SE.esc={tries:Math.max(0,(SE.escTries||1)-1),x0:SE.x};SE.escTries=SE.esc.tries;sndBoom();if(SE.esc.tries<=0){SE.esc=null;seOver('Visszafogtak – a fogság folytatódik.');return}sePop(`⛓️ Visszafogtak! Még ${SE.esc.tries} szökési esély`,'#ff7b7b');SE.capRes=SE.capRes||{};seTDBuild()}
function seMeters(C){const bar=(v,col)=>`<i data-st="width:${Math.max(0,Math.min(100,v))}%;background:${col}"></i>`;
  return `<div class="semet"><div><span>🛡️ Ellenállás</span><b>${bar(C.res,C.res<30?'#ff6b5b':'#9dff9d')}</b></div><div><span>💓 Stressz</span><b>${bar(C.str,C.str>70?'#ff6b5b':'#ffd24a')}</b></div><div><span>🗝️ Kiadott infó</span><em>${'●'.repeat(C.leak)}${'○'.repeat(Math.max(0,3-C.leak))}</em></div></div>`}
function seCapRender(){const C=SE.cap,o=$('#seOver');if(!o||!C)return;o.hidden=false;o.classList.add('secap');SE.dbT=0;
  if(C.st==='intro'){o.innerHTML=`<h3>⛓️ ELFOGTAK!</h3><p>${C.amb?'Csapdába sétáltál – nem volt kiút.':'Észrevettek.'} Megkötözik a kezed, zsákot húznak a fejedre. Innen az <b>ellenálláson</b> múlik minden.</p>${C.dev?`<p class="sesm">📱💻 Átkutattak: a nálad lévő ${seKit('tablet')?'tabletből':''}${seKit('tablet')&&seKit('phone')?' és ':''}${seKit('phone')?'telefonból':''} adatokat szereztek az egységről. (Kiadott infó: ${C.dev})</p>`:''}<p class="sesm">🅲 Charlie – szimuláció nyilvános alapelvek alapján: bekötött szemű szállítás, kihallgatás, cella, szökés.</p>`;return}
  if(C.st==='blind'){const cu=C.cues[C.ci];o.innerHTML=`<h3>🕶️ Bekötött szemmel</h3><p class="sesm">Szállítanak. Figyelj minden jelre – később a szökésnél hasznos lesz.</p><div class="seblind"><b>${cu?cu[0]:'…'}</b><span>${cu?esc(cu[1]):'Megálltok.'}</span></div><div class="setimer"><i id="seCT"></i></div>`;return}
  if(C.st==='blindq'){o.innerHTML=`<h3>🕶️ Merre vittek?</h3><p class="seq">Hányszor fordultatok <b>jobbra</b> út közben?</p><div class="seans">${C.bopts.map(n=>`<button type="button" class="btn line" data-sebl="${n}">${n}×</button>`).join('')}</div>`;return}
  if(C.st==='int'){const q=C.qs[C.round],ord=C.ord||(C.ord=seShuf([0,1,2]));o.innerHTML=`<h3>🗣️ Kihallgatás ${C.round+1}/${C.qs.length}</h3>${seMeters(C)}<div class="sebub">${esc(q[1])}</div><div class="setimer"><i id="seCT"></i></div>
      <div class="seans">${ord.map(j=>`<button type="button" class="btn line" data-sein="${j}">${esc(q[2][j][0])}</button>`).join('')}</div><button type="button" class="btn line sebr" id="seBreath">🫁 Légzőgyakorlat (stressz ↓)</button>`;return}
  if(C.st==='intwhy'){const q=C.qs[C.round];o.innerHTML=`<h3>${C.lastOk>0?'✅ Jól reagáltál':C.lastOk===0?'⚠️ Információt adtál ki':'❌ Elvesztetted a kontrollt'}</h3>${seMeters(C)}<p class="sesm"><b>Taktika: ${esc(q[0])}</b></p><p>${esc(q[3])}</p>`;return}
  if(C.st==='breath'){o.innerHTML=`<h3>🫁 Négyszög-légzés</h3><p class="sesm">Tartsd nyomva a gombot <b>BELÉGZÉS</b> és <b>BENNTARTÁS</b> alatt, engedd el <b>KILÉGZÉS</b> és <b>SZÜNET</b> alatt.</p><div class="sebreath"><i id="seBrRing"></i><b id="seBrTxt">BELÉGZÉS</b></div><button type="button" class="btn pri sebig" id="seBrBtn">🫁 TARTSD / ENGEDD</button>`;
    const b=$('#seBrBtn'),on=e=>{e.preventDefault();C.bh=1},off=()=>{C.bh=0};b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointerleave',off);b.addEventListener('pointercancel',off);return}
  if(C.st==='cell'){o.innerHTML=`<h3>🧱 Cella</h3>${seMeters(C)}<p class="seq">Napok telnek egyedül. Mit teszel?</p><div class="seans">${(C.cord||(C.cord=seShuf([0,1,2]))).map(j=>`<button type="button" class="btn line" data-secl="${j}">${['Napi rutin: torna, gondolatban tervezés, imádság vagy meditáció, számolom a napokat','Egész nap fekszem, várom, mi lesz','Az őrökkel barátkozom, hátha jobban bánnak velem'][j]}</button>`).join('')}</div>`;return}
  if(C.st==='tap'){const W=C.word,i=C.ti,L=W[i],idx=SE_TAPA.indexOf(L),r=Math.floor(idx/5)+1,cc=idx%5+1;
    o.innerHTML=`<h3>🔨 Kopogás a falon</h3><p class="sesm">A szomszéd fogoly kopogókóddal üzen (sor, majd oszlop; a K-t C helyettesíti). Betű ${i+1}/${W.length}: <b>${'●'.repeat(r)}&nbsp;&nbsp;${'●'.repeat(cc)}</b></p><p class="sesm">Eddig: <b>${esc(C.got||'…')}</b></p>
      <div class="setap">${SE_TAPA.split('').map(ch=>`<button type="button" data-setp="${ch}">${ch}</button>`).join('')}</div>`;seTapSnd(r,cc);return}
  if(C.st==='sum'){const tries=Math.min(3,1+C.bonus);C.tries=tries;o.innerHTML=`<h3>🌙 Éjszaka – most vagy soha</h3>${seMeters(C)}<div class="rkres"><div><span>Figyelmes voltál a szállításnál</span><b>${C.bok?'✅':'—'}</b></div><div><span>Kopogókód megfejtve</span><b>${C.tok?'✅ „'+esc(C.word)+'”':'—'}</b></div><div><span>Kiadott információ</span><b>${C.leak} db</b></div><div><span>Szökési próbálkozás</span><b>${tries}</b></div></div>
      <p class="sesm">Kúszva a kerítés alatt, az árkon át, a reflektor és az őrök között – ki a fogolytáborból!</p><button type="button" class="btn pri sebig" id="seEscGo">🏃 SZÖKÉS MEGKEZDÉSE</button>`;return}
  if(C.st==='broken'){o.innerHTML=`<h3>💔 Megtörtél</h3>${seMeters(C)}<p>Elfogyott az ellenállásod. A fogság folytatódik – a bevetésnek vége.</p><p class="sesm">Tanulság: légzés, rutin, a négy adat ismétlése – és az egység a többi fogollyal.</p><button type="button" class="btn pri" id="seBrokeOk">Tovább</button>`;return}}
function seTapSnd(r,c){if(!SOUND||!ac())return;const a=AC,t0=a.currentTime+.2;let t=t0;const knock=tt=>{const o=a.createOscillator(),g=a.createGain();o.frequency.setValueAtTime(180,tt);o.frequency.exponentialRampToValueAtTime(90,tt+.05);g.gain.setValueAtTime(.18,tt);g.gain.exponentialRampToValueAtTime(.001,tt+.08);o.connect(g).connect(MASTER);o.start(tt);o.stop(tt+.1)};
  for(let i=0;i<r;i++){knock(t);t+=.22}t+=.5;for(let i=0;i<c;i++){knock(t);t+=.22}}
function seCapTick(dt){const C=SE.cap;if(!C)return;C.t+=dt;
  if(C.st==='intro'&&C.t>2.2){C.st='blind';C.t=0;C.ci=0;C.cues=[];let rights=0;for(let i=0;i<6;i++){const cu=Math.random()<.55?SE_CUES[Math.random()<.5?0:1]:SE_CUES[2+Math.floor(Math.random()*6)];C.cues.push(cu);if(cu[2]===2)rights++}C.rights=rights;seCapRender();seCueSnd(C.cues[0])}
  else if(C.st==='blind'){const b=$('#seCT');if(b)b.style.width=(100-((C.t%1.7)/1.7)*100)+'%';if(C.t>1.7){C.t=0;C.ci++;if(C.ci>=C.cues.length){C.st='blindq';const n=C.rights,s=new Set([n]);while(s.size<3)s.add(Math.max(0,n+Math.floor(Math.random()*5)-2));C.bopts=seShuf([...s])}else seCueSnd(C.cues[C.ci]);seCapRender()}}
  else if(C.st==='int'){C.qt=(C.qt==null?(C.str>70?6:9):C.qt)-dt;const b=$('#seCT');if(b)b.style.width=Math.max(0,C.qt/(C.str>70?6:9)*100)+'%';if(C.qt<=0)seIntAns(-2)}
  else if(C.st==='intwhy'&&C.t>3){C.round++;C.ord=null;C.qt=null;if(C.res<=0){C.st='broken'}else if(C.round>=C.qs.length){C.st='cell'}else C.st='int';C.t=0;seCapRender()}
  else if(C.st==='breath'){const ph=Math.floor(C.t/1.5)%4,want=ph<2,txt=['BELÉGZÉS','BENNTARTÁS','KILÉGZÉS','SZÜNET'][ph];if(!!C.bh===want)C.bs=(C.bs||0)+dt;const e=$('#seBrTxt');if(e)e.textContent=txt;const r=$('#seBrRing');if(r){const sc=ph===0?.6+.4*((C.t%1.5)/1.5):ph===1?1:ph===2?1-.4*((C.t%1.5)/1.5):.6;r.style.transform=`scale(${sc})`;r.style.borderColor=!!C.bh===want?'#9dff9d':'#ff6b5b'}
    if(C.t>12){const k=Math.min(1,(C.bs||0)/12);C.str=Math.max(0,C.str-Math.round(40*k));C.res=Math.min(100,C.res+Math.round(8*k));C.bs=0;C.bh=0;C.st='int';C.qt=null;C.t=0;sePop(`🫁 Stressz −${Math.round(40*k)}`,'#9dff9d');seCapRender()}}}
function seCueSnd(cu){if(!SOUND||!ac()||!cu)return;const a=AC,t=a.currentTime;if(cu[0]==='🔔'){[0,.9].forEach(d=>{const o=a.createOscillator(),g=a.createGain();o.frequency.value=520;g.gain.setValueAtTime(.06,t+d);g.gain.exponentialRampToValueAtTime(.001,t+d+1.2);o.connect(g).connect(MASTER);o.start(t+d);o.stop(t+d+1.3)})}
  else if(cu[0]==='🐕')seBark();else if(cu[0]==='🌉'){const n=a.createBufferSource();n.buffer=NOISE;const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=160;const g=a.createGain();g.gain.setValueAtTime(.25,t);g.gain.exponentialRampToValueAtTime(.001,t+1.2);n.connect(f).connect(g).connect(MASTER);n.start(t,0,1.3)}
  else if(cu[0]==='💧'||cu[0]==='🪨'){const n=a.createBufferSource();n.buffer=NOISE;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=cu[0]==='💧'?1400:2600;const g=a.createGain();g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.001,t+1);n.connect(f).connect(g).connect(MASTER);n.start(t,0,1.1)}
  else if(cu[0]==='🚂'){const o=a.createOscillator(),g=a.createGain();o.type='triangle';o.frequency.value=440;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.04,t+.2);g.gain.exponentialRampToValueAtTime(.001,t+1.4);o.connect(g).connect(MASTER);o.start(t);o.stop(t+1.5)}
  else seBeep(cu[2]===2?700:500,.12,.04)}
function seIntAns(j){const C=SE.cap;if(!C||C.st!=='int')return;const q=C.qs[C.round];let v;
  if(j===-2){v=.5;C.str=Math.min(100,C.str+10)}else v=q[2][j][1];
  if(v===1){C.res=Math.min(100,C.res+6);C.str=Math.min(100,C.str+6);sePts('charlie',120);SE.correct++;seOk()}
  else if(v===0){C.leak++;C.res-=12;C.str=Math.min(100,C.str+8);seBeep(220,.2,.05)}
  else if(v===-1){C.res-=18;C.str=Math.min(100,C.str+22);seBeep(160,.3,.06)}
  if(C.str>=90){C.res-=8}C.lastOk=v===.5?1:v;C.st='intwhy';C.t=0;seCapRender()}
function seCapClick(e){const C=SE.cap;if(!C)return false;const t=e.target;
  const bl=t.closest('[data-sebl]');if(bl&&C.st==='blindq'){C.bok=Number(bl.dataset.sebl)===C.rights;if(C.bok){C.bonus++;sndPing();sePop('✅ Jól figyeltél – tudod, merre kell szökni','#9dff9d')}else{seBeep(220,.2,.06);sePop(`ℹ️ ${C.rights}× fordultatok jobbra`,'#ffd28a')}C.st='int';C.t=0;C.qt=null;seCapRender();return true}
  const it=t.closest('[data-sein]');if(it){seIntAns(Number(it.dataset.sein));return true}
  if(t.closest('#seBreath')&&C.st==='int'){C.st='breath';C.t=0;C.bs=0;seCapRender();return true}
  const cl=t.closest('[data-secl]');if(cl&&C.st==='cell'){const ok=Number(cl.dataset.secl)===0;if(ok){C.res=Math.min(100,C.res+12);C.str=Math.max(0,C.str-15);sndPing();sePop('✅ A rutin erőt ad','#9dff9d')}else{C.res-=10;seBeep(220,.2,.06);sePop(['','A tétlenség felőröl','Az őrök kihasználják a közeledést'][Number(cl.dataset.secl)],'#ff7b7b')}
    C.st='tap';C.word=SE_TAPW[Math.floor(Math.random()*SE_TAPW.length)];C.ti=0;C.got='';C.terr=0;seCapRender();return true}
  const tp=t.closest('[data-setp]');if(tp&&C.st==='tap'){const L=C.word[C.ti];if(tp.dataset.setp===L){C.got+=L;sndPing()}else{C.got+='?';C.terr++;seBeep(220,.15,.05)}C.ti++;if(C.ti>=C.word.length){C.tok=C.terr===0;if(C.tok){C.bonus++;C.res=Math.min(100,C.res+10);sePop(`✅ Üzenet: „${C.word}” – nem vagy egyedül!`,'#9dff9d')}else sePop(`ℹ️ Az üzenet: „${C.word}”`,'#ffd28a');C.st='sum'}seCapRender();return true}
  if(t.closest('#seEscGo')&&C.st==='sum'){seEscStart(C.tries);return true}
  if(t.closest('#seBrokeOk')&&C.st==='broken'){SE.cap=null;$('#seOver').classList.remove('secap');seOver('Megtörtél a fogságban.');return true}
  return false}
// szökés: önálló lopakodó pálya a fogolytáborból
function seEscStart(tries){const o=$('#seOver');o.hidden=true;o.classList.remove('secap');SE.capRes={bok:!!(SE.cap&&SE.cap.bok)};SE.cap=null;SE.phase='play';SE.escTries=tries;SE.esc={tries,x0:SE.x};seCapHum(false);seTDBuild();rockStart('sere_t');rockTempo(96);saVol(1);seRadio(`🏃 SZÖKÉS felülnézetből: kerülj ki az őrök látóköréből, az épületek árnyékában maradj!${SE.capRes&&SE.capRes.bok?' Jól figyeltél szállításkor: tudod, hol a csatorna.':''}`,5500);seTray()}
function seEscBuild(){const E=SE.esc,x=E.x0;SE.x=x;SE.maxX=x;SE.minX=x-2.5;SE.mv=0;SE.tgt=null;SE.cover=null;SE.post='stand';SE.v=0;SE.y=0;SE.vy=0;SE.det=0;SE.tod=.66;SE.dog=null;SE.ex=null;SE.choice=null;SE.quiz=null;SE.climbT=0;SE.vault=null;SE.autoP=false;SE.pur=null;SE.cin2=null;SE.lzSafe=0;
  SE.objs=[{k:'campwall',x:x-3},{k:'bush',x:x+2.5,w:2.4},{k:'lowwire',x:x+7.5,w:2.6,yb:.55,yt:.9},{k:'ditch',x:x+12.5,w:2.4},{k:'tower',x:x+17,ph:Math.PI*1.2-SE.t*.3,w:.3},{k:'boulder',x:x+21,w:1.3,h:1.05,sd:3},{k:'walker',x0:x+27,x:x+27,r:2.5,dir:-1,sp:.8,wait:0},{k:'bush',x:x+33,w:2.6},{k:'lowwire',x:x+39,w:2.6,yb:.55,yt:.9},{k:'free',x:x+45}];
  E.end=x+45;SE.genX=x+52}
function seEscWin(){SE.phase='play';SE.maxX=SE.x;SE.vault=null;SE.tgt=null;SE.esc=null;SE.escDone=true;SE.stage=5;SE.day=4;SE.minX=null;sePts('esc',600);SE.escapes++;SE.water=Math.max(15,SE.water-10);SE.food=Math.max(15,SE.food-10);
  SE.kmD=5000+Math.round(Math.random()*600);SE.kmX0=SE.x;SE.kmR=SE.kmD;
  sePop('🏃 SZABAD VAGY! +600','#9dff9d');seRadio(`✅ Kijutottál! A kivonási pont (${SE.grid?SE.grid.lz:'—'}) kb. ${(SE.kmD/1000).toFixed(1).replace('.',',')} km. Fedezékről fedezékre – hajnalra ott kell lenned.`,6500);seOk();seBanner(4);seSave();seTray()}
function seEscFail(){const E=SE.esc;E.tries--;SE.escTries=E.tries;sndBoom();if(navigator.vibrate)try{navigator.vibrate([150,60,150])}catch(e){}
  if(E.tries>0){sePop(`⛓️ Visszavittek! Még ${E.tries} próbálkozás`,'#ff7b7b');seTDBuild()}else{SE.esc=null;seOver('Fogságban maradtál – a szökés nem sikerült.')}}
document.addEventListener('click',e=>{if(!e.target.closest)return;if(SE.cap&&seCapClick(e))return;if(SE.mg&&SE.mg.k==='aid'&&seAidClick(e.target))return;const a=e.target.closest('[data-seq]');if(a&&SE.quiz){seAnswer(Number(a.dataset.seq));return}
  const ch=e.target.closest('[data-sech]');if(ch&&SE.choice){seChoose(Number(ch.dataset.sech));return}
  if(e.target.closest('#seSig')){seSignal();return}if(e.target.closest('#seCommsBtn')){seComms();return}const tm=e.target.closest('[data-tdm]');if(tm&&SE.td){SE.td.mode=tm.dataset.tdm;seTray();return}if(e.target.closest('#seSpark')){seSpark();return}
  if(e.target.closest('#seTutSkip')){seTutEnd(true);return}if(e.target.closest('#seTutGo2')){seStart();return}});
// ---- vége ----
function seOver(why,win){if(SE.phase==='done'&&win&&SE._overShown){}SE.esc=null;SE.cap=null;seCapHum(false);$('#seOver').classList.remove('secap');SE.phase='done';SE.run=false;SE.quiz=null;SE.choice=null;SE.mg=null;SE.amb=null;seSaveDel();
  const stage=win?5:Math.max(1,Math.min(4,SE.stage||SE.day)),pts=Math.round(SE.pts),val=stage*100000+Math.min(99999,pts);
  const r=val>0?gSave('sereBest',val,'medve-sere-best',false):{best:seBest(),rec:false};rockStart(win||r.rec?'rk_win':'rk_fail');if(!win)sndBoom();saVol(.4);
  const al=SE_AL.filter(a=>SE.alDone[a.id]).length,bn=Object.keys(SE.brDone).length,S=SE.sc||{},row=(a,b)=>`<div><span>${a}</span><b>${b}</b></div>`,mm=Math.round((SE.playT||0)/60);
  const stg=['','🅰️ Alpha','🅱️ Bravo I','🅱️ Bravo II','🅲 Charlie','🚁 Kimentve'];
  const o=$('#seOver');o.hidden=false;o.innerHTML=`<h3>${win?'🚁 BEVETÉS TELJESÍTVE':r.rec?'🏆 Új rekord!':'💀 Vége a bevetésnek'}</h3><p class="sesm">${esc(why)}</p>
   <div class="sestages">${stg.slice(1).map((n,i)=>`<span class="${i+1<stage||win&&i===4?'ok':i+1===stage?'cur':''}">${n}</span>`).join('')}</div>
   <div class="rkres">${row('Elért szakasz',stg[stage])}${row('Kérdések – helyes',`${SE.qOk||0}/${SE.qN||0} · ${n0(S.quiz||0)} p`)}${row('Döntések',`${n0(S.dec||0)} p`)}${row('Felvett tárgyak',`${SE.items} db · ${n0(S.item||0)} p`)}${row('Alpha · Bravo feladatok',`${al}/${SE_AL.length} · ${bn}/10 · ${n0(S.task||0)} p`)}${row('Rádió (MGRS)',`${n0(S.comms||0)} p`)}${row('Felszerelés használata',`${n0(S.kit||0)} p`)}${row('Lopakodás',`${SE.silent} db · ${n0(S.stealth||0)} p`)}${row('Túlélés (éjszakák)',`${n0(S.surv||0)} p`)}${row('Charlie – ellenállás',`${n0(S.charlie||0)} p`)}${row('Szökés · kimentés',`${n0((S.esc||0)+(S.ex||0))} p`)}${row('<b>Összesen</b>',`<b>${n0(pts)} p</b>`)}${row('Játékidő (nem számít)',mm+' perc')}</div>
   ${seKitSummary()}<p>${r.rec?'<b class="hrec">ÚJ REKORD!</b>':'Rekord: <b>'+seFmt(r.best)+'</b>'}</p>${win?'<button class="btn pri sebig" id="seSelfie">📸 Szelfi a bajtárssal</button>':''}<button class="btn pri" id="seAgain">↻ Új bevetés</button> <button class="btn line" data-rank="sere">🏆 Ranglista</button>`;$('#seAgain').onclick=seStart;SE._lastWhy=why;const sb=$('#seSelfie');if(sb)sb.onclick=()=>seSelfieShow(pts);seTray();seHud()}
function seHud(){const s=(id,v)=>{const e=$(id);if(e&&e.textContent!==String(v))e.textContent=v};s('#seDay',(SE.tut?'🎓 gyakorlás':(seNight()?'🌙 ':'☀️ ')+SE.day+'. nap'));s('#seW',Math.round(SE.water));s('#seF',Math.round(SE.food));s('#seHp',Math.round(SE.hp));
  [['#seW',SE.water],['#seF',SE.food],['#seHp',SE.hp]].forEach(([id,v])=>{const e=$(id);if(e)e.classList.toggle('low',v<25)})}
function seTray(){const tr=$('#seTray');if(!tr)return;const set=h=>{if(tr.dataset.h!==h){tr.dataset.h=h;tr.innerHTML=h}};if(SE.phase==='cine'){set('<div class="semat"><span>🎬 Filmjelenet – koppints a kihagyáshoz</span></div>');return}
  if(SE.phase==='td'&&SE.td){const m=SE.td.mode;set(`<div class="semat"><span class="sealn" data-st="background:#ff6b5b">🅲 SZÖKÉS</span><span>Próbálkozás: ${SE.esc?SE.esc.tries:1}</span></div><div class="secmbtn"><button type="button" class="btn ${m==='sneak'?'pri':'line'}" data-tdm="sneak">🧎 Lopakodás (halk)</button><button type="button" class="btn ${m==='run'?'pri':'line'}" data-tdm="run">🏃 Futás (zajos)</button></div>`);return}const tap='<div class="rktap">👆 koppints oda, ahová mennél · fedezékre koppintva elbújsz · 2× koppintás: futás</div>';
  if(SE.mg&&SE.mg.k==='tr'){set('<div class="semat"><span class="sealn" data-st="background:#ffd24a;color:#201a04">🎓 KIKÉPZÉS</span><span>Oldd meg a feladatot a panelen</span></div>');return}if(SE.mg&&SE.mg.k==='aid'){if(SE.mg.st<3)set(seAidRender(SE.mg));return}
  if(SE.mg&&SE.mg.k==='fire'){const M=SE.mg;set(`<div class="sequiz"><div class="seqh">🔥 Tűzgyújtás tűzacéllal · szikra ${M.hits}/3 · próba ${M.tries}/7</div><div class="sebar"><i class="sezone" data-st="left:${(M.zc-M.zw/2)*100}%;width:${M.zw*100}%"></i><i class="semark" id="seMgM"></i></div><button type="button" class="btn pri sebig" id="seSpark">🔥 SZIKRA!</button></div>`);return}
  if(SE.phase==='play'&&SE.choice){const C=SE.choice,E=C.E;set(`<div class="sequiz"><div class="seqh">${E.ic} ${SE_AL.some(a=>a.id===C.id)?'Alpha-feladat':'Döntés'} – ${esc(E.t)}</div>${E.img?'<div class="seimg">'+E.img+'</div>':''}<b>${esc(E.q)}</b><div class="setimer"><i id="seQT"></i></div><div class="seans">${C.order.map(j=>`<button type="button" class="btn line" data-sech="${j}">${esc(E.o[j][0])}</button>`).join('')}</div></div>`);return}
  if(SE.phase==='play'&&SE.quiz){const Q=SE.quiz;set(`<div class="sequiz"><div class="seqh">🧠 Túlélés – kérdés</div><b>${esc(Q.q[0])}</b><div class="setimer"><i id="seQT"></i></div><div class="seans">${Q.order.map(j=>`<button type="button" class="btn line" data-seq="${j}">${esc(Q.q[1][j])}</button>`).join('')}</div></div>`);return}
  if(SE.phase==='play'&&SE.ex&&SE.ex.st==='wait'){set(`<button type="button" class="btn pri sebig" id="seSig">🔦 JELZÉS A HELIKOPTERNEK</button>`);return}
  if(SE.phase==='play'&&seAlId()==='comms'&&SE.day===1&&!SE.tut){set(`<button type="button" class="btn pri sebig" id="seCommsBtn">📻 RÁDIÓ – kapcsolatfelvétel</button>`);return}
  if((SE.phase==='play'||SE.phase==='camp')&&SE.day===1&&!SE.tut){const A=SE_AL[SE.al],I=SE.inv,n=Object.keys(SE.alDone).length;let det='';
    if(A){if(A.id==='fire')det=`<b class="${I.tinder>=2?'ok':''}">🌾 ${Math.min(2,I.tinder)}/2</b><b class="${I.kindling>=3?'ok':''}">🍂 ${Math.min(3,I.kindling)}/3</b><b class="${I.wood>=3?'ok':''}">🪵 ${Math.min(3,I.wood)}/3</b>`;
      else if(A.id==='food')det=`<b class="${I.forage>=3?'ok':''}">🫐🌰🐛 ${Math.min(3,I.forage)}/3</b>`;else if(A.id==='shelter')det=`<b class="${I.leaf>=3?'ok':''}">🌿 ${Math.min(3,I.leaf)}/3</b><b class="${I.tinder>=2&&I.kindling>=3&&I.wood>=3?'ok':''}">🔥 anyag</b>`}
    set(`<div class="semat"><span class="sealn">🅰️ ${Math.min(n+1,SE_AL.length)}/${SE_AL.length}</span><span>${A?A.ic+' '+esc(A.n):'⛺ Pihenő'}</span>${det}</div>${tap}`);return}
  const BL=seBrList();if(SE.phase==='play'&&BL&&!SE.esc&&!SE.escDone){const id=BL[SE.br];set(`<div class="semat"><span class="sealn" data-st="background:#5fa8d8">🅱️ ${Math.min(SE.br+1,BL.length)}/${BL.length}</span><span>${id?SE_BRN[id][0]+' '+SE_BRN[id][1]:'🌙 Tovább, óvatosan…'}</span></div>${tap}`);return}
  if(SE.phase==='play'&&SE.esc){set(`<div class="semat"><span class="sealn" data-st="background:#ff6b5b">🅲 SZÖKÉS</span><span>Próbálkozás: ${SE.esc.tries}</span></div><div class="rktap">🐛 kerítés alá koppints · 🕳️ árokba · 🪨 szikla mögé · 🌿 bokorba</div>`);return}
  if(SE.phase==='play'&&SE.escDone){set(`<div class="semat"><span class="sealn" data-st="background:#3fd26a;color:#102">🚁 KIVONÁS</span><span>${(Math.max(0,SE.kmR)/1000).toFixed(1).replace('.',',')} km a kivonási pontig</span></div>${tap}`);return}
  if(SE.phase==='play')set(tap);else set('')}
// ---- gyakorlás ----
function seTutStart(){seReset();Object.assign(SE,{phase:'play',run:true,tut:{st:0,t:0,hold:0,next:0},tod:.25,genX:1e9});$('#seStart').hidden=true;$('#seOver').hidden=true;rockStop(.3);saStart();seTutStep(0)}
function seTutStep(i){const T=SE.tut;T.st=i;T.t=0;T.hold=0;T.next=0;T.inD=0;const x=SE.x;T.x0=x;SE.det=0;SE.mv=0;SE.tgt=null;SE.cover=null;SE.post='stand';SE.maxX=x;SE.objs=SE.objs.filter(o=>o.x<x-3);SE.objs.forEach(o=>{o.tut=0});SE.tod=i===4?.64:.25;
  if(i===1)SE.objs.push({k:'boulder',x:x+6,w:1.3,h:1.05,sd:2,tut:1},{k:'walker',x0:x+15,x:x+15,r:.4,dir:-1,sp:.3,wait:0,tutw:1});
  if(i===2)SE.objs.push({k:'log',x:x+4,w:.6,h:.5},{k:'lowlog',x:x+8.5,w:2.6,yb:.62,yt:1.05,tut:1});
  if(i===3)SE.objs.push({k:'ditch',x:x+6,w:2.6,tut:1});
  if(i===4){T.px=x+16;SE.objs.push({k:'bush',x:x+7,w:3,tut:1},{k:'patrol',x:T.px,ph:Math.PI*2*.25-SE.t*.35,w:.35,tutp:1},{k:'bush',x:x+23,w:2.6})}
  if(i===6){SE.objs.push({k:'item',x:x+4,y:.35,it:'water'},{k:'item',x:x+7,y:.35,it:'wood'},{k:'item',x:x+10.5,y:1.6,it:'food'},{k:'item',x:x+13.5,y:.35,it:'berry'});T.end=x+14.5}
  const S=SE_TUT[i],el=$('#seTut');if(el){el.hidden=false;el.innerHTML=`<div class="setuth"><span>Gyakorlás ${i+1}/${SE_TUT.length}</span><button type="button" id="seTutSkip">⏭ Kihagyás</button></div><b>${S[0]}</b><p>${S[1]}</p>`}seTray();seHud()}
function seTutOk(msg){const T=SE.tut;if(T.next)return;T.next=T.t+1.1;sePop(msg||'✅ Ügyes!','#9dff9d');seOk()}
function seTutFail(msg){const T=SE.tut;sePop(msg||'Észrevettek – próbáld újra!','#ff7b7b');seBeep(220,.2,.05);SE.det=0;SE.v=0;SE.mv=0;SE.tgt=null;SE.post='stand';if(T.st===4){SE.x=T.px-12;SE.maxX=SE.x;SE.objs.forEach(o=>{if(o.k==='patrol'){o.ph=Math.PI*2*.25-SE.t*o.w;o.alert=0}o.passed=0})}else seTutStep(T.st)}
function seTutTick(dt){const T=SE.tut;T.t+=dt;
  if(T.next){if(T.t>=T.next){if(T.st+1<SE_TUT.length)seTutStep(T.st+1);else seTutEnd(false)}return}
  const ob=SE.objs.find(o=>o.tut);
  if(T.st===0&&Math.abs(SE.x-(T.x0+6))<1.3&&!SE.tgt&&Math.abs(SE.v)<.1)seTutOk('✅ Ott vagy, ahová koppintottál!');
  if(T.st===1&&ob&&SE.cover===ob&&SE.cr>.6){T.hold+=dt;if(T.hold>1)seTutOk('✅ Fedezékben – az őr nem lát!')}
  if(T.st===2&&ob&&SE.x>ob.x+ob.w/2+.4&&!SE.prone)seTutOk('✅ Átléptél és átkúsztál!');
  if(T.st===3&&ob){if(SE.inDitch&&SE.prone)T.inD+=dt;if(SE.x>ob.x+ob.w/2+.5&&SE.y>=-.01&&T.inD>.4)seTutOk('✅ Elrejtőztél és kimásztál!')}
  if(T.st===4&&SE.x>T.px+6)seTutOk('✅ Észrevétlenül átjutottál!');
  if(T.st===5){if(SE.cr>.6)T.hold+=Math.abs(SE.v)*dt;if(T.hold>2.2)seTutOk('✅ Guggolva halkabb vagy!')}
  if(T.st===6&&SE.x>T.end){if(SE.items>=2)seTutOk('✅ Megvan a készlet!');else{sePop('Gyűjts fel legalább kettőt!','#ffd28a');seTutStep(6)}}}
function seTutEnd(skip){try{localStorage.setItem(SE_TUTKEY,'1')}catch(e){}const el=$('#seTut');if(el)el.hidden=true;SE.tut=null;SE.phase='done';
  if(skip){seStart();return}const o=$('#seOver');o.hidden=false;o.innerHTML=`<h3>🎓 Gyakorlás kész!</h3><p>Most jön az igazi bevetés – kb. 60 perc, bármikor menthető.</p><div class="rkres"><div><span>Kezdés</span><b>💥 kilőtt PzH 2000</b></div><div><span>1. nap</span><b>Alpha – ${SE_AL.length} feladat</b></div><div><span>2–3. nap</span><b>Bravo – kitérés</b></div><div><span>Utána</span><b>Charlie – fogság, szökés</b></div><div><span>Vége</span><b>🚁 kivonási pont</b></div></div><button class="btn pri sebig" id="seTutGo2">▶ Indulás</button>`;seTray()}
// ---- rajz ----
function seMix(a,b,t){t=Math.max(0,Math.min(1,t));const p=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16));const A=p(a),B=p(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')}
function seDraw(tm){const c=SE.c,W=SE.W,H=SE.H,s=SE.s*(SE.zoom||1);if(!c)return;c.setTransform(SE.dpr,0,0,SE.dpr,0,0);if(SE.phase==='cap'&&SE.cap){seCapScene(c,W,H,tm);return}if(SE.phase==='td'&&SE.td){seTDDraw(c,W,H,tm);return}if(SE.phase==='cine'&&SE.cin){seCineDraw(c,W,H,tm);return}
  const gy=H*.8,pxT=SE.phase==='intro'?.7:SE.pur&&SE.ex&&SE.ex.st!=='out'?.42:.2+.05*Math.max(0,Math.min(1,SE.v/6)),px0=W*(SE.pxF=SE.pxF==null?pxT:SE.pxF+(pxT-SE.pxF)*.05),X=x=>px0+(x-SE.x)*s,Y=y=>gy-y*s,L=seLight(),mix=seMix;SE.px0=px0;
  c.save();if(SE.shake>0)c.translate((Math.random()-.5)*8*SE.shake,(Math.random()-.5)*6*SE.shake);
  seBg(c,W,H,gy,s,L,tm,px0);
  const O=SE.objs;
  // talaj menti elemek: patak, árok, táborhely, leszállóhely
  for(const o of O){const x=X(o.x);if(x<-120||x>W+120)continue;
    if(o.k==='stream'){c.fillStyle=mix('#0e2238','#3f7fae',L);c.fillRect(x-o.w/2*s,gy-1,o.w*s,10+H*.03);c.fillStyle=mix('#1a3a5a','#7fb8de',L);c.fillRect(x-o.w/2*s,gy-1,o.w*s,2);c.strokeStyle='rgba(200,230,255,.35)';for(let i=0;i<5;i++){const yy=gy+4+i*4,ox=(tm*30+i*23)%(o.w*s*.5);c.beginPath();c.moveTo(x-o.w/2*s+ox,yy);c.lineTo(x-o.w/2*s+ox+14,yy);c.stroke()}
      c.fillStyle=mix('#1c2416','#5d6b44',L);c.beginPath();c.ellipse(x-o.w/2*s,gy+2,6,4,0,0,7);c.ellipse(x+o.w/2*s,gy+2,6,4,0,0,7);c.fill()}
    if(o.k==='ditch'){const L0=x-o.w/2*s,R0=x+o.w/2*s,dd=SE_DD*s,e=.28*s;c.fillStyle=mix('#0c0906','#3a2a18',L);c.beginPath();c.moveTo(L0,gy);c.lineTo(L0+e,gy+dd);c.lineTo(R0-e,gy+dd);c.lineTo(R0,gy);c.fill();
      c.fillStyle=mix('#1c140c','#5f4428',L);c.beginPath();c.moveTo(L0,gy);c.lineTo(L0+e,gy+dd);c.lineTo(L0+e+4,gy+dd);c.lineTo(L0+5,gy);c.fill();c.beginPath();c.moveTo(R0,gy);c.lineTo(R0-e,gy+dd);c.lineTo(R0-e-4,gy+dd);c.lineTo(R0-5,gy);c.fill();
      c.fillStyle=mix('#14200f','#4f6a35',L);c.fillRect(L0+e,gy+dd-3,R0-L0-2*e,3);c.strokeStyle=mix('#1a2412','#6a8048',L);c.beginPath();for(let i=0;i<7;i++){const gx=L0+e+(i+.5)*(R0-L0-2*e)/7;c.moveTo(gx,gy+dd);c.lineTo(gx+1.5,gy+dd-6)}c.stroke();
      c.fillStyle=mix('#4b5e33','#6a8048',L);for(const ex of [L0,R0]){c.beginPath();c.ellipse(ex,gy+1,5,2.5,0,0,7);c.fill()}}
    if(o.k==='lz'){c.fillStyle='rgba(120,255,120,.35)';c.beginPath();c.ellipse(x,gy+2,2*s,.25*s,0,0,7);c.fill();for(let i=0;i<7;i++){const a=(tm*.8+i*.4)%2;c.fillStyle=`rgba(120,230,120,${.4*(1-a/2)})`;c.beginPath();c.arc(x+Math.sin(i+tm)*8,gy-a*s*1.5,6+a*10,0,7);c.fill()}}
    if(o.k==='camp'&&!o.done){c.strokeStyle='rgba(255,224,138,.8)';c.setLineDash([4,4]);c.strokeRect(x-1.4*s,gy-1.6*s,2.8*s,1.6*s);c.setLineDash([]);c.font='22px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('⛺',x,gy-.9*s+Math.sin(tm*3)*3);c.font='700 11px system-ui';c.fillStyle='#ffe08a';c.fillText('MENEDÉKHELY',x,gy-1.85*s)}}
  // háttér-ellenség: töltés, járőr, őrtorony, jármű az úton
  for(const o of O){const x=X(o.x);if(x<-160||x>W+160)continue;
    if(o.k==='patrol'){c.fillStyle=mix('#0a0e0a','#40502c',L);c.beginPath();c.moveTo(x-3.6*s,gy+2);c.bezierCurveTo(x-2.4*s,gy,x-1.8*s,Y(1.95),x-.9*s,Y(1.95));c.lineTo(x+.9*s,Y(1.95));c.bezierCurveTo(x+1.8*s,Y(1.95),x+2.4*s,gy,x+3.6*s,gy+2);c.fill();c.fillStyle=mix('#0d140c','#4f6a35',L);c.fillRect(x-.95*s,Y(1.95)-1,1.9*s,3);seEnemy(c,x,Y(1.95),s*.8,o.away,tm,L);if(o.away){c.font='15px system-ui';c.textAlign='center';c.fillText(L<.5?'💬':'📻',x+.5*s,Y(4.5)+Math.sin(tm*4)*2)}}
    if(o.k==='tower')seTower(c,x,gy,s,L,tm);
    if(o.k==='wreck')seWreck(c,x,gy,s,L,tm);
    if(o.k==='animal')seAnimal(c,o,X,gy,s,L,tm);
    if(o.k==='walker')seWalker(c,x,gy,s,L,tm,o);
    if(o.k==='veh')seVeh(c,x,Y(.9),s,L,tm)}
  for(const o of O){if(o.k!=='drone')continue;const x=X(o.x),y=Y(8.5);if(x<-60||x>W+60)continue;c.fillStyle='#1b1f22';c.fillRect(x-14,y-3,28,6);c.fillRect(x-22,y-6,10,2);c.fillRect(x+12,y-6,10,2);
    c.fillStyle=`rgba(200,200,200,${.3+.3*Math.abs(Math.sin(tm*50))})`;c.fillRect(x-26,y-8,18,1.5);c.fillRect(x+8,y-8,18,1.5);c.fillStyle='#2a2f33';c.beginPath();c.arc(x,y+4,3,0,7);c.fill()}
  // akadályok, tárgyak, fák
  for(const o of O){const x=X(o.x);if(x<-80||x>W+80)continue;
    if(o.k==='tree'){c.fillStyle=mix('#140f0a','#4a3524',L);c.fillRect(x-.12*s,Y(o.h*.55),.24*s,o.h*.55*s);c.fillStyle=mix('#0b140b','#3f6a2e',L);for(let i=0;i<3;i++){c.beginPath();c.arc(x+(i-1)*.45*s,Y(o.h*.6+(i%2)*.4),.7*s,0,7);c.fill()}c.beginPath();c.arc(x,Y(o.h*.85),.75*s,0,7);c.fill()}
    if(o.k==='log'){c.fillStyle='#5a3d22';c.fillRect(x-o.w/2*s,Y(o.h),o.w*s,o.h*s);c.strokeStyle='#3f2a16';c.beginPath();c.moveTo(x-o.w/2*s,Y(o.h*.5));c.lineTo(x+o.w/2*s,Y(o.h*.5));c.stroke();c.fillStyle='#a07a4a';c.beginPath();c.ellipse(x+o.w/2*s,Y(o.h/2),o.h*s*.22,o.h*s*.5,0,0,7);c.fill();c.strokeStyle='#6a4a28';c.beginPath();c.ellipse(x+o.w/2*s,Y(o.h/2),o.h*s*.1,o.h*s*.25,0,0,7);c.stroke()}
    if(o.k==='boulder')seBoulder(c,x,gy,s,L,o);
    if(o.k==='rock'){c.fillStyle=mix('#1d1f1c','#7c7f74',L);c.beginPath();c.moveTo(x-o.w/2*s,gy);c.lineTo(x-o.w*.35*s,Y(o.h*.8));c.lineTo(x,Y(o.h));c.lineTo(x+o.w*.4*s,Y(o.h*.7));c.lineTo(x+o.w/2*s,gy);c.fill();c.fillStyle='rgba(255,255,255,.12)';c.beginPath();c.moveTo(x-o.w*.3*s,Y(o.h*.75));c.lineTo(x,Y(o.h*.95));c.lineTo(x+.05*s,Y(o.h*.6));c.fill()}
    if(o.k==='wire'){c.strokeStyle='#3a3a36';c.lineWidth=3;for(const dx of [-o.w/2,o.w/2]){c.beginPath();c.moveTo(x+dx*s,gy);c.lineTo(x+dx*s,Y(o.h));c.stroke()}c.strokeStyle='#9a9a90';c.lineWidth=1.3;for(let r=0;r<3;r++){c.beginPath();for(let i=0;i<=10;i++){const xx=x-o.w/2*s+i*o.w*s/10,yy=Y(o.h*(.3+r*.3))+(i%2?3:-3);i?c.lineTo(xx,yy):c.moveTo(xx,yy)}c.stroke()}c.lineWidth=1}
    if(o.k==='item'&&!o.done){const y=Y(o.y),bob=Math.sin(tm*4+o.x)*3;c.fillStyle='rgba(255,240,170,.28)';c.beginPath();c.arc(x,y+bob,14+Math.sin(tm*6)*1.5,0,7);c.fill();c.font='20px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText({water:'💧',food:'🍖',med:'✚',wood:'🪵',leaf:'🌿',tinder:'🌾',kindling:'🍂',berry:'🫐',nut:'🌰',grub:'🐛',redb:'🔴',mush:'🍄',herb:'🍃'}[o.it]||'💧',x,y+bob)}}
  for(const o of O){const x=X(o.x);if(x<-140||x>W+140)continue;
    if(o.k==='lowlog'){const yb=Y(o.yb),yt=Y(o.yt);c.fillStyle='#3a2a18';c.fillRect(x-o.w/2*s-.12*s,yb,.26*s,gy-yb);c.fillRect(x+o.w/2*s-.1*s,Y(o.yb+.06),.26*s,gy-Y(o.yb+.06));
      c.fillStyle=mix('#2a1c10','#5a3d22',L);c.beginPath();c.roundRect?c.roundRect(x-o.w/2*s-.35*s,yt,o.w*s+.7*s,yb-yt,(yb-yt)/2):c.rect(x-o.w/2*s,yt,o.w*s,yb-yt);c.fill();c.strokeStyle='#3f2a16';c.beginPath();c.moveTo(x-o.w/2*s,(yt+yb)/2);c.lineTo(x+o.w/2*s,(yt+yb)/2+2);c.stroke();
      c.fillStyle=mix('#14200f','#3d5c2e',L);c.beginPath();c.arc(x+o.w/2*s+.3*s,yt,.28*s,0,7);c.arc(x-o.w/2*s-.1*s,yt+2,.2*s,0,7);c.arc(x+.2*s,yt-2,.16*s,0,7);c.fill()}
    if(o.k==='lowwire'){c.strokeStyle='#3a3a36';c.lineWidth=3;for(const dx of [-o.w/2,o.w/2]){c.beginPath();c.moveTo(x+dx*s,gy);c.lineTo(x+dx*s,Y(o.yt+.1));c.stroke()}c.strokeStyle='#a0a096';c.lineWidth=1.4;for(const hh of [o.yb,o.yt]){c.beginPath();for(let i=0;i<=12;i++){const xx=x-o.w/2*s+i*o.w*s/12,yy=Y(hh)+(i%2?2.5:-2.5);i?c.lineTo(xx,yy):c.moveTo(xx,yy)}c.stroke()}c.lineWidth=1}
    if(o.k==='sign'){c.fillStyle='#5a3d22';c.fillRect(x-.06*s,Y(1.9),.12*s,1.9*s);for(const [dy,dir,tx2] of [[1.75,-1,'D'],[1.4,1,'NY']]){const y0=Y(dy);c.fillStyle='#8a6a42';c.beginPath();c.moveTo(x,y0);c.lineTo(x+dir*.95*s,y0);c.lineTo(x+dir*1.15*s,y0+.13*s);c.lineTo(x+dir*.95*s,y0+.26*s);c.lineTo(x,y0+.26*s);c.fill();c.fillStyle='#2a1c10';c.font='800 9px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('?',x+dir*.5*s,y0+.13*s)}c.font='15px system-ui';c.fillText('🧭',x,Y(2.2))}
    if(o.k==='boar'){const bx=x+Math.sin(tm*.7)*.4*s;c.fillStyle=mix('#1a140e','#4a3a2a',L);c.beginPath();c.ellipse(bx,gy-.45*s,.75*s,.4*s,0,0,7);c.fill();c.beginPath();c.moveTo(bx-.6*s,gy-.65*s);c.lineTo(bx-1.15*s,gy-.38*s);c.lineTo(bx-.62*s,gy-.22*s);c.fill();c.fillStyle='#e8e0c8';c.fillRect(bx-1.02*s,gy-.36*s,.1*s,.04*s);
      c.fillStyle=mix('#1a140e','#4a3a2a',L);c.fillRect(bx-.5*s,gy-.15*s,.1*s,.15*s);c.fillRect(bx+.4*s,gy-.15*s,.1*s,.15*s);for(let i=0;i<4;i++){const px=bx+(1.0+i*.5)*s+Math.sin(tm*3+i)*3;c.fillStyle=mix('#2a2018','#a07a50',L);c.beginPath();c.ellipse(px,gy-.17*s,.24*s,.14*s,0,0,7);c.fill();c.fillStyle='rgba(240,220,170,.6)';c.fillRect(px-.18*s,gy-.2*s,.36*s,.02*s)}}
    if(o.k==='campwall'){c.fillStyle=mix('#0c0f0c','#4a4a42',L);c.fillRect(x-6*s,gy-2.6*s,5*s,2.6*s);c.fillStyle=mix('#14100c','#5a3a2a',L);c.beginPath();c.moveTo(x-6.3*s,gy-2.6*s);c.lineTo(x-3.5*s,gy-3.4*s);c.lineTo(x-.7*s,gy-2.6*s);c.fill();c.fillStyle='rgba(255,200,110,.5)';c.fillRect(x-4.5*s,gy-1.9*s,.5*s,.4*s);
      c.strokeStyle='#5a5a52';c.lineWidth=2;for(let i=0;i<6;i++){c.beginPath();c.moveTo(x-1*s+i*.6*s,gy);c.lineTo(x-1*s+i*.6*s,gy-2.2*s);c.stroke()}c.strokeStyle='#9a9a90';c.lineWidth=1;for(const hh of [.6,1.3,2.0]){c.beginPath();c.moveTo(x-1*s,gy-hh*s);c.lineTo(x+2*s,gy-hh*s);c.stroke()}}
    if(o.k==='free'){c.strokeStyle='#ddd';c.lineWidth=2;c.beginPath();c.moveTo(x,gy);c.lineTo(x,gy-2.2*s);c.stroke();c.lineWidth=1;c.fillStyle='#3fd26a';c.beginPath();c.moveTo(x,gy-2.2*s);c.lineTo(x+.9*s+Math.sin(tm*4)*3,gy-1.95*s);c.lineTo(x,gy-1.7*s);c.fill();c.fillStyle='#9dff9d';c.font='800 11px system-ui';c.textAlign='center';c.fillText('SZABADSÁG',x,gy-2.4*s)}
    if(o.k==='road'){c.fillStyle=mix('#141414','#4a4a46',L);c.fillRect(x-o.w/2*s,gy-2,o.w*s,8);c.fillStyle='rgba(240,240,220,.6)';for(let i=0;i<3;i++)c.fillRect(x-o.w/2*s+(i+.3)*o.w*s/3,gy+1,o.w*s/6,2)}
    if(o.k==='deer'){const run=Math.sin(tm*14);c.fillStyle=mix('#1a140e','#8a5a32',L);c.beginPath();c.ellipse(x,gy-1*s,.62*s,.26*s,-.05,0,7);c.fill();c.fillRect(x-.72*s,gy-1.55*s,.14*s,.55*s);c.beginPath();c.ellipse(x-.8*s,gy-1.6*s,.2*s,.1*s,0,0,7);c.fill();
      c.fillRect(x-.45*s+run*4,gy-.8*s,.07*s,.8*s);c.fillRect(x-.3*s-run*4,gy-.8*s,.07*s,.8*s);c.fillRect(x+.3*s-run*4,gy-.8*s,.07*s,.8*s);c.fillRect(x+.45*s+run*4,gy-.8*s,.07*s,.8*s);c.fillStyle='#fff';c.fillRect(x+.55*s,gy-1.12*s,.1*s,.1*s)}}
  // helikopter (a katona mögött)
  if(SE.ex&&(SE.ex.vis||SE.ex.st!=='wait')){const E=SE.ex;seH225(c,X(E.hx),Y(E.hy),s,tm,1,1)}
  // kijelölt cél és útvonal
  if(SE.mk&&SE.phase==='play'){const M=SE.mk,mx=X(M.x),p=(tm*1.8)%1;c.strokeStyle=M.cov?'rgba(157,255,157,.9)':M.run?'rgba(255,160,80,.9)':'rgba(255,224,138,.9)';c.lineWidth=2;c.beginPath();c.ellipse(mx,gy+2,(8+p*10)*(M.cov?1.3:1),(3+p*3),0,0,7);c.stroke();
    if(SE.tgt){c.setLineDash([3,6]);c.beginPath();c.moveTo(X(SE.x),gy-4);c.lineTo(mx,gy-4);c.stroke();c.setLineDash([])}c.lineWidth=1;if(M.cov){c.font='15px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('🫥',mx,gy-2.6*s)}}
  // a roncs mellett a földön heverő felszerelés
  if(SE.phase==='kit'){c.textAlign='center';c.textBaseline='middle';SE_KIT_ITEMS.forEach((k,i)=>{if(seKit(k[0]))return;const wx=.8+(i%8)*.78,dy=i<8?0:.9;c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(X(wx),gy+dy*s*.5+3,.3*s,.07*s,0,0,7);c.fill();c.font=Math.round(s*.62)+'px system-ui';c.fillText(k[1],X(wx),gy-.2*s+dy*s*.5)})}
  // a katona
  const pxs=X(SE.x),hidden=SE.prone&&SE.inBush||SE.cover&&SE.cr+SE.pr>.6;c.save();if(hidden)c.globalAlpha=.6;
  if(SE.intro&&SE.intro.clip){c.beginPath();c.rect(0,0,W,Y(1.85)+2);c.clip()}
  const boarded=SE.ex&&(SE.ex.st==='out'||SE.ex.st==='board'&&SE.ex.t>.7);if(SE.buddy&&SE.phase!=='camp'&&!boarded&&SE.phase!=='intro'&&SE.phase!=='kit'){const H=SE._bh||(SE._bh=[]);H.push(SE.x);if(H.length>40)H.shift();const bx=H[0]-1.1*(SE.face||1),by=seGround(bx),lim=Math.abs(Math.sin(tm*4.2));c.save();c.translate(X(bx),Y(by)+lim*2.5);c.rotate((SE.face||1)*(.05+.06*lim));seSoldier(c,0,0,s*.96,0,1);c.restore();c.fillStyle='rgba(243,236,212,.85)';c.font='700 10px system-ui';c.textAlign='center';c.fillText(SE.budName||'Kovács',X(bx),Y(by+2.05))}if(SE.phase!=='camp'&&!boarded)seSoldier(c,pxs,Y(SE.y),s);c.restore();
  if(SE.cover&&SE.phase==='play'){c.fillStyle='rgba(157,255,157,.9)';c.font='800 11px system-ui';c.textAlign='center';c.fillText('🫥 FEDEZÉK',pxs,Y(SE.y+2.2))}
  if(SE.inStream&&SE.y<.1){c.fillStyle=mix('#0e2238','#3f7fae',L);c.globalAlpha=.75;c.fillRect(pxs-.5*s,gy-.18*s,1*s,.2*s);c.globalAlpha=1}
  // menedék + tábortűz
  if(SE.phase==='camp'){const x=X(SE.campX),bp=SE.campSt==='build'?Math.min(1,SE.campT/2.2):1;c.globalAlpha=Math.max(.15,bp);c.strokeStyle=mix('#1a1408','#5a4a2a',L);c.lineWidth=3;c.beginPath();c.moveTo(x-1.6*s,gy);c.lineTo(x+.2*s,gy-1.35*s);c.lineTo(x+.4*s,gy);c.moveTo(x+.2*s,gy-1.35*s);c.lineTo(x+.8*s,gy-1.5*s);c.stroke();c.lineWidth=1;
    c.fillStyle=mix('#0d1a0c','#3d5c2e',L);for(let i=0;i<7;i++){const t2=i/6;c.beginPath();c.ellipse(x-1.5*s+t2*1.6*s,gy-t2*1.25*s,.3*s,.12*s,-.7,0,7);c.fill()}c.globalAlpha=1;
    seSoldier(c,x+.9*s,gy,s,1);if(SE.buddy){seSoldier(c,x+1.9*s,gy,s,1,1);c.fillStyle='rgba(243,236,212,.85)';c.font='700 10px system-ui';c.textAlign='center';c.fillText(SE.budName||'Kovács',x+1.9*s,gy-1.2*s)}const fx=x-.6*s;c.fillStyle='#55524a';for(let i=0;i<5;i++){c.beginPath();c.arc(fx-.3*s+i*.15*s,gy-2,3,0,7);c.fill()}c.strokeStyle='#5a3d22';c.lineWidth=3;c.beginPath();c.moveTo(fx-.25*s,gy-2);c.lineTo(fx+.15*s,gy-.3*s);c.moveTo(fx+.25*s,gy-2);c.lineTo(fx-.15*s,gy-.3*s);c.stroke();c.lineWidth=1}
  // bokrok a katona előtt (takarás)
  for(const o of O){if(o.k!=='bush')continue;const x=X(o.x);if(x<-120||x>W+120)continue;const sw=Math.sin(tm*1.6+o.x)*2;c.fillStyle=mix('#0b160c','#2f4a24',L);for(let i=0;i<5;i++){const bx=x+(i-2)*o.w/5*s,r=(.5+.18*Math.sin(i*3.1+o.x))*s;c.beginPath();c.arc(bx+sw*(i%2),gy-r*.55,r,0,7);c.fill()}
    c.fillStyle=mix('#13221a','#3d5c2e',L);for(let i=0;i<3;i++){c.beginPath();c.arc(x+(i-1)*o.w/4*s+sw,gy-s*.75,.35*s,0,7);c.fill()}
    if(L>.5){c.fillStyle='rgba(200,40,40,.7)';for(let i=0;i<4;i++){c.beginPath();c.arc(x+(seH(o.x+i)-.5)*o.w*s,gy-(.3+seH(o.x*2+i)*.6)*s,2,0,7);c.fill()}}}
  // kutya
  if(SE.dog){const x=X(SE.dog.x);if(x>-60){const run=Math.sin(tm*18);c.fillStyle='#2a2018';c.beginPath();c.ellipse(x-2,gy-17,17,6,0,0,7);c.fill();c.beginPath();c.moveTo(x+12,gy-22);c.lineTo(x+27,gy-24);c.lineTo(x+25,gy-15);c.lineTo(x+12,gy-13);c.fill();c.fillRect(x-25,gy-22,9,3);
    c.fillRect(x-14+run*5,gy-13,4,13);c.fillRect(x-8-run*5,gy-13,4,13);c.fillRect(x+6+run*5,gy-13,4,13);c.fillRect(x+11-run*5,gy-13,4,13);c.fillStyle='#ffde59';c.beginPath();c.arc(x+22,gy-21,1.5,0,7);c.fill()}}
  // helikopter
  // por, vízcsepp, +
  for(const f of SE.fx){const a=1-f.t/(f.life||1.2);c.globalAlpha=Math.max(0,a);if(f.k==='+'){c.fillStyle='#9dff9d';c.font='800 16px system-ui';c.textAlign='center';c.fillText('+',X(f.x),Y(f.y)-f.t*40)}else{c.fillStyle=f.k==='drop'?'#bfe6ff':f.k==='spark'?'#ffd24a':mix('#2a2418','#8a7a5a',L);c.beginPath();c.arc(X(f.x),Y(f.y),f.k==='drop'||f.k==='spark'?2:3,0,7);c.fill()}c.globalAlpha=1}
  // éjszakai sötétítés holdfénnyel
  if(L<.98){const a=(1-L)*.6;const rg=c.createRadialGradient(pxs,gy-s,s*1.2,pxs,gy-s,Math.max(W,H)*.75);rg.addColorStop(0,`rgba(2,4,12,${a*.25})`);rg.addColorStop(1,`rgba(2,4,12,${a})`);c.fillStyle=rg;c.fillRect(0,0,W,H)}
  // fények a sötétítés fölött: ablakok, szentjánosbogarak, lámpák, reflektorok, hőkamera, tábortűz
  seLights(c,W,H,gy,s,L,tm,X,Y);
  if(SE.wx==='kod'){c.fillStyle='rgba(205,212,220,.26)';c.fillRect(0,0,W,H)}
  if(SE.wx==='tel'){c.fillStyle='rgba(235,240,248,.55)';c.fillRect(0,gy,W,H-gy);c.fillStyle='rgba(255,255,255,.8)';for(let i=0;i<60;i++){const fx=(seH(i)*W+tm*12*(1+seH(i+2)))%W,fy=(seH(i+50)*H+tm*40*(1+seH(i+7)))%H;c.fillRect(fx,fy,2,2)}}
  if(SE.rain){c.strokeStyle='rgba(190,210,230,.35)';c.lineWidth=1;c.beginPath();for(let i=0;i<70;i++){const rx=(seH(i)*W+tm*-40)%W,ry=((seH(i+99)*H+tm*700)%H);const xx=rx<0?rx+W:rx;c.moveTo(xx,ry);c.lineTo(xx-4,ry+12)}c.stroke()}
  c.restore();
  seHudCanvas(c,W,H,gy,s,L,tm,X,Y)}
function seBg(c,W,H,gy,s,L,tm,px0){const mix=seMix,t=SE.tod;
  const dk=t>.4&&t<.56?Math.max(0,1-Math.abs(t-.47)/.08):t>.86?Math.max(0,1-Math.abs(t-.94)/.08):0;
  let top=mix('#050914','#6fa6d6',L),bot=mix('#18213a','#d6e8f0',L);if(dk>0){top=mix(top,'#3b2a4a',dk*.7);bot=mix(bot,t>.7?'#f0a868':'#e07a3a',dk*.85)}
  const g=c.createLinearGradient(0,0,0,gy);g.addColorStop(0,top);g.addColorStop(1,bot);c.fillStyle=g;c.fillRect(0,0,W,H);
  if(L<.7){for(const q of SE.stars){c.globalAlpha=(1-L/.7)*(.5+.5*Math.sin(tm*2+q.p));c.fillStyle='#fff';c.beginPath();c.arc(q.x*W,q.y*gy,q.r,0,7);c.fill()}c.globalAlpha=1;
    const mx=W*(.85-.6*Math.max(0,Math.min(1,(t-.5)/.42))),my=H*.13;c.globalAlpha=1-L/.7;c.fillStyle='rgba(244,241,220,.15)';c.beginPath();c.arc(mx,my,30,0,7);c.fill();c.fillStyle='#f4f1dc';c.beginPath();c.arc(mx,my,15,0,7);c.fill();c.fillStyle='rgba(180,175,150,.5)';c.beginPath();c.arc(mx-4,my-3,3,0,7);c.arc(mx+5,my+4,2.2,0,7);c.fill();c.globalAlpha=1}
  if(L>.2){const sx=W*(.1+.8*Math.min(1,t/.48)),sy=H*(.12+.3*Math.pow(Math.abs(t/.48-.5)*2,2));c.globalAlpha=L;const sg=c.createRadialGradient(sx,sy,4,sx,sy,60);sg.addColorStop(0,'rgba(255,240,190,.9)');sg.addColorStop(.25,'rgba(255,230,160,.45)');sg.addColorStop(1,'rgba(255,230,160,0)');c.fillStyle=sg;c.beginPath();c.arc(sx,sy,60,0,7);c.fill();c.fillStyle='#fff2c4';c.beginPath();c.arc(sx,sy,14,0,7);c.fill();c.globalAlpha=1}
  // felhők
  for(const q of SE.clouds){q.x-=q.v*.016*(SE.paused?0:1);if(q.x<-.4)q.x=1.2;const cx=q.x*W,cy=q.y*gy,w=q.w*W;c.fillStyle=L>.5?`rgba(255,255,255,${.55*L})`:`rgba(60,70,95,${.5*(1-L)})`;c.beginPath();c.ellipse(cx,cy,w*.5,w*.12,0,0,7);c.ellipse(cx+w*.15,cy-w*.08,w*.22,w*.1,0,0,7);c.ellipse(cx-w*.15,cy-w*.05,w*.18,w*.08,0,0,7);c.fill()}
  // madarak nappal
  if(L>.7)for(let i=0;i<3;i++){const bx=((tm*(14+i*3)+i*190)%(W+80))-40,by=H*(.18+i*.05)+Math.sin(tm+i)*6,f=Math.sin(tm*9+i)*4;c.strokeStyle='rgba(30,30,30,.6)';c.lineWidth=1.5;c.beginPath();c.moveTo(bx-6,by-f);c.lineTo(bx,by);c.lineTo(bx+6,by-f);c.stroke();c.lineWidth=1}
  const wx=(f,i,step)=>px0+(i*step-SE.x*f)*s;
  // távoli hegyek
  c.fillStyle=mix('#0c1220','#8aa3b8',L);c.beginPath();c.moveTo(0,gy);for(let i=0;i<=30;i++){const x=i*W/30,u=x/s/1+SE.x*.04;c.lineTo(x,gy-s*(3.2+1.6*Math.sin(u*.21)+1*Math.sin(u*.53+2)+.5*Math.sin(u*1.3)))}c.lineTo(W,gy);c.fill();
  // dombok faluval és templommal
  const hy=u=>gy-s*(1.6+.8*Math.sin(u*.17+1)+.4*Math.sin(u*.41));c.fillStyle=mix('#0b1118','#6f8e66',L);c.beginPath();c.moveTo(0,gy);for(let i=0;i<=30;i++){const x=i*W/30;c.lineTo(x,hy(x/s+SE.x*.12))}c.lineTo(W,gy);c.fill();
  SE.wins=[];const f2=.12,st2=9,i0=Math.floor((SE.x*f2-px0/s)/st2)-1;
  for(let i=i0;i<i0+W/s/st2+3;i++){if(seH(i*7.3)>.45)continue;const x=wx(f2,i,st2),base=hy(x/s+SE.x*.12)+2;const n=2+Math.floor(seH(i)*3);
    for(let j=0;j<n;j++){const hx=x+j*.9*s*.55,hw=.75*s*.55,hh=(.55+seH(i*3+j)*.25)*s*.55;c.fillStyle=mix('#090d12','#b9a58a',L);c.fillRect(hx,base-hh,hw,hh);c.fillStyle=mix('#140c0c','#8a3a2a',L);c.beginPath();c.moveTo(hx-2,base-hh);c.lineTo(hx+hw/2,base-hh-hw*.5);c.lineTo(hx+hw+2,base-hh);c.fill();
      if(seH(i*11+j)>.35)SE.wins.push([hx+hw*.3,base-hh*.6,hw*.25,hh*.3])}
    if(seH(i*5.1)>.75){const tx=x-.5*s,th=1.6*s;c.fillStyle=mix('#090d12','#c9b9a0',L);c.fillRect(tx,base-th,.3*s,th);c.beginPath();c.moveTo(tx-2,base-th);c.lineTo(tx+.15*s,base-th-.6*s);c.lineTo(tx+.3*s+2,base-th);c.fill()}}
  // távvezeték oszlopokkal
  const f3=.22,st3=14,i3=Math.floor((SE.x*f3-px0/s)/st3)-1;c.strokeStyle=mix('#05070a','#5a6066',L);c.lineWidth=1;let prev=null;
  for(let i=i3;i<i3+W/s/st3+3;i++){const x=wx(f3,i,st3),b=gy-s*.4,t2=b-s*2.6;c.beginPath();c.moveTo(x-.35*s,b);c.lineTo(x,t2);c.lineTo(x+.35*s,b);c.moveTo(x-.55*s,t2+.35*s);c.lineTo(x+.55*s,t2+.35*s);c.moveTo(x-.25*s,b-.8*s);c.lineTo(x+.18*s,b-1.6*s);c.moveTo(x+.25*s,b-.8*s);c.lineTo(x-.18*s,b-1.6*s);c.stroke();
    if(prev){for(const dx of [-.5,.5]){c.beginPath();c.moveTo(prev+dx*s,t2+.38*s);c.quadraticCurveTo((prev+x)/2,t2+.38*s+.7*s,x+dx*s,t2+.38*s);c.stroke()}}prev=x}
  // erdő: két réteg vegyes fával
  const forest=(f,step,col,hmin,hvar,seed)=>{c.fillStyle=col;const i1=Math.floor((SE.x*f-px0/s)/step)-2;for(let i=i1;i<i1+W/s/step+4;i++){const x=wx(f,i,step)+(seH(i+seed)-.5)*step*s*.6,h=(hmin+hvar*seH(i*3.7+seed))*s,pine=seH(i*1.9+seed)>.4;
      if(pine){c.beginPath();c.moveTo(x-.55*s*(h/(3*s)),gy-s*.05);c.lineTo(x,gy-h);c.lineTo(x+.55*s*(h/(3*s)),gy-s*.05);c.fill()}else{c.fillRect(x-.08*s,gy-h*.5,.16*s,h*.5);c.beginPath();c.arc(x,gy-h*.68,h*.3,0,7);c.arc(x-h*.18,gy-h*.55,h*.22,0,7);c.arc(x+h*.18,gy-h*.56,h*.22,0,7);c.fill()}}};
  forest(.4,1.9,mix('#0a1110','#4f6c44',L),2.4,1.8,1);forest(.65,2.6,mix('#070c0a','#3b5532',L),2.8,2.2,9);
  // köd hajnalban és alkonyatkor
  if(dk>0){const fg=c.createLinearGradient(0,gy-2.5*s,0,gy);fg.addColorStop(0,'rgba(220,225,235,0)');fg.addColorStop(1,`rgba(220,225,235,${.35*dk})`);c.fillStyle=fg;c.fillRect(0,gy-2.5*s,W,2.5*s)}
  // talaj: fű, föld rétegek, kövek
  c.fillStyle=mix('#0d120c','#4b5e33',L);c.fillRect(0,gy,W,H-gy);c.fillStyle=mix('#141a10','#6a8048',L);c.fillRect(0,gy,W,5);c.fillStyle=mix('#0a0d08','#3f4c2b',L);c.fillRect(0,gy+12,W,H-gy-12);
  c.fillStyle=mix('#090b07','#57442e',L);for(let i=Math.floor(SE.x/1.7)-2;i<SE.x/1.7+W/s/1.7+2;i++){if(seH(i*2.3)>.55)continue;const x=px0+(i*1.7-SE.x)*s,y=gy+14+seH(i)*Math.max(4,H-gy-24);c.beginPath();c.ellipse(x,y,3+seH(i*5)*5,2,0,0,7);c.fill()}
  c.strokeStyle=mix('#18200f','#7d9a50',L);c.lineWidth=1.2;c.beginPath();for(let i=Math.floor(SE.x/.35)-2;i<SE.x/.35+W/s/.35+2;i++){const x=px0+(i*.35-SE.x)*s,h=4+seH(i)*7,sw=Math.sin(tm*2+i)*1.5;c.moveTo(x,gy+2);c.lineTo(x+sw+2,gy-h)}c.stroke();c.lineWidth=1}
function seLights(c,W,H,gy,s,L,tm,X,Y){c.save();c.globalCompositeOperation='lighter';
  if(L<.6){const a=1-L/.6;c.fillStyle=`rgba(255,200,110,${.7*a})`;for(const w of SE.wins||[])c.fillRect(w[0],w[1],w[2],w[3]);
    for(let i=0;i<10;i++){const fx=((seH(i)*W*1.4-tm*8*(1+seH(i+3)))%W+W)%W,fy=gy-(.4+seH(i+7)*1.4)*s+Math.sin(tm*2+i)*8,on=(Math.sin(tm*3+i*2)+1)/2;c.fillStyle=`rgba(210,255,120,${a*on*.8})`;c.beginPath();c.arc(fx,fy,2,0,7);c.fill()}}
  for(const q of SE.cones||[]){const ax=X(q.ax),ay=Y(q.ay);const hit=q.hit;
    if(q.walker){const ex=X(q.ax+q.dir*q.len),hw=(.3+q.len*.3)*s;if(Math.max(ax,ex)<-40||Math.min(ax,ex)>W+40)continue;
      if(q.lamp){const gr=c.createLinearGradient(ax,ay,ex,ay);gr.addColorStop(0,`rgba(255,245,200,${hit?.55:.4})`);gr.addColorStop(1,'rgba(255,240,180,0)');c.fillStyle=gr;c.beginPath();c.moveTo(ax,ay-3);c.lineTo(ex,Math.max(ay-hw,0));c.lineTo(ex,Math.min(ay+hw,gy));c.lineTo(ax,ay+3);c.fill()}
      else{c.globalCompositeOperation='source-over';c.fillStyle=hit?'rgba(255,90,78,.2)':'rgba(255,255,255,.07)';c.strokeStyle='rgba(255,255,255,.25)';c.setLineDash([4,5]);c.beginPath();c.moveTo(ax,ay);c.lineTo(ex,Math.max(ay-hw,0));c.lineTo(ex,Math.min(ay+hw,gy));c.closePath();c.fill();c.stroke();c.setLineDash([]);c.globalCompositeOperation='lighter'}continue}
    if(Math.max(ax,X(q.cx))<-40||Math.min(ax,X(q.bx))>W+40)continue;
    if(q.thermal){const gr=c.createLinearGradient(0,ay,0,gy);gr.addColorStop(0,`rgba(255,60,60,${hit?.35:.16})`);gr.addColorStop(1,`rgba(255,60,60,${hit?.25:.06})`);c.fillStyle=gr;c.beginPath();c.moveTo(ax-.35*s,ay);c.lineTo(ax+.35*s,ay);c.lineTo(X(q.cx),gy);c.lineTo(X(q.bx),gy);c.fill()}
    else if(q.lamp){const gr=c.createLinearGradient(ax,ay,(X(q.bx)+X(q.cx))/2,gy);gr.addColorStop(0,`rgba(255,245,200,${hit?.6:q.search?.45:.38})`);gr.addColorStop(1,`rgba(255,240,180,${hit?.28:.1})`);c.fillStyle=gr;c.beginPath();c.moveTo(ax,ay);c.lineTo(X(q.bx),gy);c.lineTo(X(q.cx),gy);c.fill();
      c.fillStyle=`rgba(255,240,190,${hit?.35:.18})`;c.beginPath();c.ellipse((X(q.bx)+X(q.cx))/2,gy+2,(X(q.cx)-X(q.bx))/2,5,0,0,7);c.fill()}
    else{c.globalCompositeOperation='source-over';c.fillStyle=hit?'rgba(255,90,78,.22)':'rgba(255,255,255,.09)';c.strokeStyle='rgba(255,255,255,.28)';c.setLineDash([4,5]);c.beginPath();c.moveTo(ax,ay);c.lineTo(X(q.bx),gy);c.lineTo(X(q.cx),gy);c.closePath();c.fill();c.stroke();c.setLineDash([]);c.globalCompositeOperation='lighter'}}
  for(const o of SE.objs){if(o.k==='drone'){const x=X(o.x),y=Y(8.5)+4;c.fillStyle=(tm*3%1)<.5?'rgba(255,60,60,.9)':'rgba(120,0,0,.6)';c.beginPath();c.arc(x,y,2.5,0,7);c.fill()}
    if(o.k==='veh'){const x=X(o.x-2.2),y=Y(1.2);c.fillStyle='rgba(255,250,220,.9)';c.beginPath();c.arc(x,y,3,0,7);c.fill()}}
  if(SE.phase==='camp'&&SE.fire){const x=X(SE.campX)-.6*s,fl=1+.2*Math.sin(tm*20);const fg=c.createRadialGradient(x,gy-6,2,x,gy-6,70*fl);fg.addColorStop(0,'rgba(255,170,60,.7)');fg.addColorStop(1,'rgba(255,120,40,0)');c.fillStyle=fg;c.beginPath();c.arc(x,gy-6,70*fl,0,7);c.fill();
    c.fillStyle='rgba(255,200,80,.95)';c.beginPath();c.moveTo(x-6,gy);c.quadraticCurveTo(x,gy-22*fl,x+6,gy);c.fill()}
  c.restore()}
function seHudCanvas(c,W,H,gy,s,L,tm,X,Y){
  // találat jelzés a figyelő ellenség fölött
  for(const q of SE.cones||[]){if(!q.hit)continue;const o=q.o;if(o.k==='walker')continue;const x=X(o.k==='veh'?o.x-1:o.x),y=o.k==='tower'?Y(9):o.k==='drone'?Y(9.6):o.k==='veh'?Y(2.6):Y(4.6);c.fillStyle='#ff4a3e';c.font='900 22px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(SE.det>.6?'‼':'!',x,y+Math.sin(tm*12)*2)}
  // képen kívüli fenyegetés jelzése a jobb szélen
  for(const o of SE.objs){if(!['patrol','tower','drone','veh','walker'].includes(o.k)||o.amb)continue;const x=X(o.x);const d=o.x-SE.x;if(x<W-6||d>36)continue;const y=o.k==='drone'?Y(8):gy-2.6*s;c.fillStyle='rgba(0,0,0,.55)';c.beginPath();c.roundRect?c.roundRect(W-46,y-14,42,28,8):c.rect(W-46,y-14,42,28);c.fill();
    c.font='14px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText({patrol:'🔦',tower:'🗼',drone:'🛸',veh:'🚙',walker:'💂'}[o.k],W-34,y);c.fillStyle='#ffe08a';c.font='800 10px system-ui';c.fillText(Math.round(d)+'m',W-15,y)}
  if(SE.dog&&SE.dog.st==='chase'&&X(SE.dog.x)<-10){c.fillStyle='rgba(0,0,0,.55)';c.fillRect(4,gy-2.6*s-14,52,28);c.fillStyle='#ff7b7b';c.font='800 12px system-ui';c.textAlign='left';c.textBaseline='middle';c.fillText('🐕 '+Math.round(SE.x-SE.dog.x)+'m',9,gy-2.6*s)}
  // felderítésjelző
  if(SE.det>.01||SE.seen>0){const w=Math.min(220,W*.55),x0=(W-w)/2,y0=10;c.fillStyle='rgba(0,0,0,.55)';c.fillRect(x0-34,y0-4,w+42,22);c.font='16px system-ui';c.textAlign='left';c.textBaseline='middle';c.fillText(SE.seen>0?'👁️':SE.heard?'👂':'🫥',x0-30,y0+7);
    c.fillStyle='rgba(255,255,255,.15)';c.fillRect(x0,y0+2,w,10);c.fillStyle=SE.det>.7?'#ff4a3e':SE.det>.35?'#ffb43e':'#ffe08a';c.fillRect(x0,y0+2,w*SE.det,10)}
  if(SE.phase==='play'&&SE.prone){c.fillStyle='rgba(243,236,212,.92)';c.font='700 12px system-ui';c.textAlign='center';c.fillText(SE.inBush?'🌿 Elrejtőztél':SE.inDitch?'🕳️ Az árokban rejtőzöl':SE.inStream?'🌊 Vízben – a hőkamera nem lát':SE.cover?'🫥 Fedezékben: '+SE_COV[SE.cover.k]:'⬇ Lelapultál',W/2,46)}
  // napváltás felirat
  if(SE.banner&&!SE.tut){const b=SE.banner,a=b.t<.4?b.t/.4:b.t>2.8?Math.max(0,1-(b.t-2.8)/.8):1;c.globalAlpha=a;c.fillStyle='rgba(0,0,0,.45)';c.fillRect(0,H*.28,W,96);c.textAlign='center';c.textBaseline='middle';c.fillStyle='#f3d77a';c.font='900 34px Anton,Impact,system-ui';c.fillText(b.a,W/2,H*.28+28);
    c.fillStyle='#fff';c.font='800 15px system-ui';c.fillText(b.b,W/2,H*.28+58);c.fillStyle='rgba(243,236,212,.8)';c.font='600 12px system-ui';c.fillText(b.c,W/2,H*.28+80);c.globalAlpha=1}
  // kezdő jelenet felirat, tippek, gyakorlás
  SE.padHint=null;
  if(SE.phase==='intro'){c.fillStyle='rgba(0,0,0,.5)';c.fillRect(0,10,W,46);c.fillStyle='#ffb36b';c.font='900 16px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('💥 Találat! A PzH 2000 kiégett.',W/2,26);c.fillStyle='#f3ecd4';c.font='700 12px system-ui';c.fillText('Kimászol a vezetőnyíláson… (koppints a kihagyáshoz)',W/2,45)}
  if(SE.phase==='play'&&!SE.tut&&!SE.tgt&&!SE.mv&&SE.t<12&&!SE.choice&&!SE.quiz&&SE.day===1&&SE.al<=1){c.fillStyle='#ffe08a';c.font='900 15px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('👆 Koppints a terepre, ahová menni akarsz',W/2,H*.64+Math.sin(tm*5)*3)}
  if(SE.ex&&SE.ex.st==='land'&&SE.ex.hy<.5){c.fillStyle='#9dff9d';c.font='900 15px system-ui';c.textAlign='center';c.fillText('👆 KOPPINTS A HELIKOPTERRE!',W/2,H*.4+Math.sin(tm*6)*3)}
  if(SE.tut&&SE.phase==='play'&&!SE.tut.next){const T=SE.tut,st=T.st,ob=SE.objs.find(o=>o.tut);let hx=null,txt='',pad=null;
    if(st===0){const fx=X(T.x0+6);c.fillStyle='#ddd';c.fillRect(fx-1,Y(1.6),2.5,1.6*s);c.fillStyle='#ff4a3e';c.beginPath();c.moveTo(fx+1.5,Y(1.6));c.lineTo(fx+1.5+s*.55,Y(1.45));c.lineTo(fx+1.5,Y(1.3));c.fill();if(!SE.tgt){hx=T.x0+6;txt='👆 KOPPINTS A ZÁSZLÓHOZ'}}
    if(st===1&&ob){if(SE.cover!==ob){if(!SE.tgt){hx=ob.x;txt='👆 KOPPINTS A SZIKLÁRA'}}else txt='🫥 Fedezékben – az őr nem lát'}
    if(st===2&&ob&&!SE.tgt){hx=ob.x+ob.w/2+2;txt='👆 KOPPINTS A KIDŐLT FA MÖGÉ'}
    if(st===3&&ob){if(T.inD<.4){if(!SE.tgt){hx=ob.x;txt='👆 KOPPINTS AZ ÁROKRA'}}else if(!SE.tgt){hx=ob.x+ob.w/2+2;txt='👆 MOST KOPPINTS TÚLRA'}}
    if(st===4&&ob){const p=SE.objs.find(o=>o.k==='patrol');if(!SE.inBush&&SE.x<ob.x){if(!SE.tgt){hx=ob.x;txt='👆 KOPPINTS A BOKORRA'}}else if(SE.inBush&&p&&p.away){hx=T.px+1;txt='MOST! 👆 KOPPINTS ELŐRE'}else if(SE.inBush)txt='Várj… figyeld a lámpát';else if(!SE.tgt){hx=Math.min(SE.x+7,T.px+7);txt='👆 TOVÁBB, KOPPINTS ELŐRE'}}
    if(st===5){if(SE.post!=='crouch'){pad='crouch';txt='⬇ NYOMD: 🧎 GUGGOLÁS'}else if(!SE.tgt){hx=SE.x+4;txt='👆 KOPPINTS ELŐRE'}}
    if(st===6){const it=SE.objs.find(o=>o.k==='item'&&!o.done&&o.x>SE.x-.3);if(it&&!SE.tgt){hx=it.x;txt='👆 KOPPINTS A TÁRGYRA'}}
    SE.padHint=pad;
    if(hx!=null){const fx=X(hx),fy=gy+(H-gy)*.4,pulse=(tm*1.6)%1;c.strokeStyle=`rgba(255,224,138,${1-pulse})`;c.lineWidth=3;c.beginPath();c.arc(fx,fy,10+pulse*22,0,7);c.stroke();c.lineWidth=1;c.font='28px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('👆',fx,fy+Math.sin(tm*8)*4)}
    if(txt){c.fillStyle='#ffe08a';c.font='900 17px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(txt,W/2,H*.4)}}}
// figurák
function seSoldier(c,x,y,s,campPose,bud){const k=s/54;c.save();c.translate(x,y);c.scale(k*(!campPose&&SE.face<0?-1:1),k);const camo='#5f6440',dk='#3a3d26',skin='#c99b76',pack='#4a4d30',helm='#454a2c';
  const pr=campPose?1:SE.pr,air=!campPose&&SE.y>seGround(SE.x)+.03&&SE.climbT<=0&&!(SE.intro&&SE.intro.t<3.7),v=campPose?0:SE.v,ph=(SE.step/1.5)*Math.PI*2*(v<0?-1:1),sp=Math.min(1,Math.abs(v)/4),cr=campPose?0:SE.cr,climb=!campPose&&SE.climbT>0;
  let rot=0;if(!campPose&&SE.fallT>0){const f=Math.sin(Math.min(1,(1-SE.fallT/.85))*Math.PI);rot=f*1.15}
  if(pr>=.75&&!climb){const cr=!campPose&&SE.crawling,cp=cr?SE.t*7.5:0,br=campPose?0:(cr?0:Math.sin(SE.t*3)*1.1),a1=Math.sin(cp),a2=-a1;c.rotate(rot*.3);
    const legP=(off,col)=>{c.save();c.translate(-12,-8);c.rotate(Math.PI-(cr?.15+Math.max(0,off)*.45:.04));c.fillStyle=col;c.fillRect(0,-4,20,8);c.translate(20,0);c.rotate(cr?-Math.max(0,off)*1.1:0);c.fillRect(0,-3.5,18,7);c.fillStyle='#1d1d18';c.fillRect(14,-4.5,6,9);c.restore()};
    legP(a1,dk);c.fillStyle=camo;c.beginPath();c.roundRect?c.roundRect(-16,-17-br,40,13,5):c.rect(-16,-17,40,13);c.fill();c.fillStyle='#4f5436';c.fillRect(0,-17-br,3,13);c.fillStyle=pack;c.beginPath();c.roundRect?c.roundRect(-10,-28-br,22,12,3):c.rect(-10,-28,22,12);c.fill();legP(a2,camo);
    const arm=(off,col)=>{c.save();c.translate(18,-11);c.rotate(-.25+off*.55);c.fillStyle=col;c.fillRect(0,-3,14,6);c.translate(14,0);c.rotate(1-off*.45);c.fillRect(0,-3,12,6);c.fillStyle=skin;c.fillRect(10,-3,4,6);c.restore()};
    arm(a2,dk);c.fillStyle=skin;c.beginPath();c.arc(31,-12-br*.5+(cr?a1*.8:0),6.5,0,7);c.fill();c.fillStyle=helm;c.beginPath();c.arc(31,-14-br*.5+(cr?a1*.8:0),8.2,Math.PI,0);c.fill();c.fillRect(23,-15-br*.5,16,2.5);
    c.fillStyle='#222';c.save();c.translate(20,-7);c.rotate(-.04);c.fillRect(0,-1.5,27,3);c.fillRect(6,0,4,5);c.restore();arm(a1,camo);c.restore();return}
  if(SE.land>0&&!campPose)c.scale(1.06,.9);
  let la1,lk1,la2,lk2,ar1,ar2,bob=0,lean=.08+.035*v;
  if(climb){const q=1-SE.climbT/.75;c.rotate(.75-.65*q);la1=-1.1+q*1.2;lk1=1.5-q;la2=.35;lk2=.4+q*.8;ar1=-2.6+q*1.4;ar2=-2.4+q*1.3;lean=.15}
  else if(air){la1=.75;lk1=.9;la2=-.45;lk2=.5;ar1=-1.2;ar2=-1.6}
  else{const A=.85*sp;la1=Math.sin(ph)*A;la2=-la1;lk1=Math.max(.05,-Math.cos(ph))*1.1*sp+.08;lk2=Math.max(.05,Math.cos(ph))*1.1*sp+.08;ar1=Math.sin(ph)*.9*sp+.45;ar2=-Math.sin(ph)*.9*sp+.3;bob=-Math.abs(Math.sin(ph))*3*sp;
    if(cr>0){const ws=Math.max(sp,Math.min(1,Math.abs(v)/1.3)*.5);la1=-1.05*cr+Math.sin(ph)*.45*ws;la2=-1.05*cr-Math.sin(ph)*.45*ws;lk1=lk1*(1-cr)+(1.85+Math.max(0,-Math.cos(ph))*.35*ws)*cr;lk2=lk2*(1-cr)+(1.85+Math.max(0,Math.cos(ph))*.35*ws)*cr;ar1=ar1*(1-cr)+.9*cr;ar2=ar2*(1-cr)+.7*cr;lean+=.45*cr;bob=22*cr-Math.abs(Math.sin(ph))*1.5*ws}}
  c.rotate(rot+pr*1.25);c.translate(0,bob);
  const leg=(a,knee,col)=>{c.save();c.translate(0,-50);c.rotate(a);c.fillStyle=col;c.fillRect(-4.5,0,9,27);c.translate(0,26);c.rotate(knee);c.fillRect(-4,0,8,23);c.fillStyle='#1d1d18';c.fillRect(-4.5,20,13,6);c.restore()};
  leg(la1,lk1,dk);leg(la2,lk2,camo);
  c.save();c.translate(0,-50);c.rotate(lean);
  c.save();c.translate(2,-30);c.rotate(ar2);c.fillStyle=dk;c.fillRect(-3.5,0,7,24);c.restore();
  c.fillStyle=camo;c.beginPath();c.roundRect?c.roundRect(-10,-36,20,38,6):c.rect(-10,-36,20,38);c.fill();c.fillStyle='#4f5436';c.fillRect(-10,-24,20,3);c.fillRect(-10,-12,20,3);
  c.fillStyle=pack;c.beginPath();c.roundRect?c.roundRect(-24,-34,15,28,4):c.rect(-24,-34,15,28);c.fill();c.fillStyle='#3a3d26';c.fillRect(-23,-38,12,5);
  c.fillStyle=skin;c.beginPath();c.arc(4,-44,7.5,0,7);c.fill();c.fillStyle=helm;c.beginPath();c.arc(3,-46,9.5,Math.PI*.95,Math.PI*2.05);c.fill();c.fillRect(-7,-47,20,3.5);c.fillStyle='#2a2d1c';c.fillRect(6,-46,5,2);
  c.save();c.translate(5,-28);c.rotate(ar1);c.fillStyle=camo;c.fillRect(-3.5,0,7,23);c.fillStyle=skin;c.beginPath();c.arc(0,24,3.5,0,7);c.fill();c.restore();
  if(bud){c.fillStyle='#f3efe6';c.fillRect(-8,-58,20,5);c.fillStyle='#b01010';c.fillRect(4,-58,4,5);c.fillStyle='#f3efe6';c.fillRect(-6,-30,12,6)}if(!climb){c.fillStyle='#1e1e1c';c.save();c.translate(4,-16);c.rotate(-.25+(air?-.4:0));c.fillRect(-6,-2,32,4);c.fillRect(2,0,6,8);c.restore()}c.restore();c.restore()}
function seEnemy(c,x,y,s,away,t,L){const k=s/48;c.save();c.translate(x,y);c.scale((away?-1:1)*k,k);const col=L<.5?'#0a0d0a':'#2d2b23';c.fillStyle=col;
  c.fillRect(-6,-46,8,46);c.fillRect(1,-46,8,46);c.beginPath();c.roundRect?c.roundRect(-10,-84,21,40,6):c.rect(-10,-84,21,40);c.fill();c.fillRect(-20,-80,11,24);c.beginPath();c.arc(1,-92,8,0,7);c.fill();c.beginPath();c.arc(0,-95,10,Math.PI,0);c.fill();
  c.fillRect(-26,-70,20,5);c.fillRect(-6,-64,30,4);if(!away){c.fillStyle=L<.5?'#fff6c8':'#555';c.beginPath();c.arc(-27,-68,3.5,0,7);c.fill()}c.restore()}
function seTower(c,x,gy,s,L,tm){const col=seMix('#0b0d0b','#4a3a28',L),h=7*s;c.strokeStyle=col;c.lineWidth=3;c.beginPath();c.moveTo(x-1.4*s,gy);c.lineTo(x-.8*s,gy-h+.8*s);c.moveTo(x+1.4*s,gy);c.lineTo(x+.8*s,gy-h+.8*s);c.moveTo(x-1.2*s,gy-2*s);c.lineTo(x+1*s,gy-4.5*s);c.moveTo(x+1.2*s,gy-2*s);c.lineTo(x-1*s,gy-4.5*s);c.stroke();c.lineWidth=1;
  c.fillStyle=col;c.fillRect(x-1.2*s,gy-h-.4*s,2.4*s,1.2*s);c.beginPath();c.moveTo(x-1.5*s,gy-h-.4*s);c.lineTo(x,gy-h-1.3*s);c.lineTo(x+1.5*s,gy-h-.4*s);c.fill();c.fillStyle=L<.5?'#3a3418':'#2a2a28';c.fillRect(x-.9*s,gy-h-.2*s,1.8*s,.45*s);c.fillStyle=L<.5?'#fff6c8':'#666';c.beginPath();c.arc(x,gy-h+.4*s,.22*s,0,7);c.fill()}
function seVeh(c,x,y,s,L,tm){const col=L<.5?'#0c0f0c':'#3b3f2a';c.fillStyle=seMix('#0a0e0a','#4b5e33',L);c.fillRect(x-4*s,y+.05*s,8*s,.25*s);c.fillStyle=col;c.beginPath();c.moveTo(x-2.4*s,y-.2*s);c.lineTo(x-2.4*s,y-.9*s);c.lineTo(x-1.4*s,y-1*s);c.lineTo(x-1*s,y-1.6*s);c.lineTo(x+1.6*s,y-1.6*s);c.lineTo(x+2.2*s,y-1*s);c.lineTo(x+2.2*s,y-.2*s);c.fill();
  c.fillStyle='#111';for(const dx of [-1.5,1.4]){c.beginPath();c.arc(x+dx*s,y-.15*s,.42*s,0,7);c.fill()}c.fillStyle=L<.5?'#2a3640':'#3a4a55';c.fillRect(x-.8*s,y-1.45*s,.9*s,.4*s)}
function seHeli(c,x,y,s,tm){const u=s*.5;c.fillStyle='#2b3320';c.beginPath();c.ellipse(x,y,2.1*u,.6*u,0,0,7);c.fill();c.fillRect(x+.9*u,y-3,2.4*u,5);c.fillRect(x+3.1*u,y-.7*u,4,.7*u);c.fillStyle='#1e2a33';c.beginPath();c.ellipse(x-1.3*u,y-.1*u,.5*u,.35*u,0,0,7);c.fill();
  c.fillStyle=`rgba(210,215,200,${.3+.3*Math.abs(Math.sin(tm*40))})`;c.fillRect(x-2.6*u,y-.75*u,5.2*u,2);c.fillRect(x-.1*u,y-.75*u,3,.2*u);c.strokeStyle='#1b1e16';c.lineWidth=2;c.beginPath();c.moveTo(x-1.3*u,y+.6*u);c.lineTo(x+1*u,y+.6*u);c.stroke();c.lineWidth=1;c.fillStyle=(tm*2%1)<.5?'#ff3b3b':'#4a0000';c.beginPath();c.arc(x,y+.35*u,2,0,7);c.fill()}

// ---- kilőtt PzH 2000 roncs (a DroneRun modelljéből, méretarányosan: 11,7 m löveggel együtt, 3,1 m tetőig) ----
const SE_PZU=26.55;// a PzH-rajz helyi egysége / méter
function seWreckImg(){if(SE._wreck)return SE._wreck;const BO=drBodyImg(),BI=drBarrelImg();if(!BO.complete||!BI.complete||!BO.naturalWidth)return null;
  const k=PK,S=3,x0=-PCX*k-8,x1=(738-PCX)*k+12,y0=10-PBY*k-8,y1=34;const cv=document.createElement('canvas');cv.width=Math.round((x1-x0)*S);cv.height=Math.round((y1-y0)*S);const c=cv.getContext('2d');c.scale(S,S);c.translate(-x0,-y0);
  const ws=D_WHEELS.map((w,i)=>({...w,cx:w.lx,cy:21+(i===6?2.5:0)}));c.lineJoin='round';c.lineCap='round';c.beginPath();c.moveTo(ws[0].cx-ws[0].r,ws[0].cy);for(const w of ws.slice(0,6))c.lineTo(w.cx,w.cy+w.r);c.lineWidth=6;c.strokeStyle='#1a1815';c.stroke();// a lánctalp leszakadt az elején
  ws.forEach((w,i)=>{if(i===7)return;c.fillStyle='#22201c';c.beginPath();c.arc(w.cx,w.cy,w.r,0,7);c.fill();c.fillStyle='#3a3832';c.beginPath();c.arc(w.cx,w.cy,w.r*.6,0,7);c.fill()});
  c.save();c.translate((266-PCX)*k,10+(66-PBY)*k);c.rotate(.17);c.drawImage(BI,6*k,-28*k,466*k,61*k);c.restore();// lekókadt löveg
  c.drawImage(BO,-PCX*k,10-PBY*k,738*k,180*k);c.fillStyle='#3d4a2c';c.fillRect(-PCX*k+180*k,10-PBY*k+40*k,50*k,30*k);
  // kiégett, kormos felület
  c.globalCompositeOperation='source-atop';c.fillStyle='rgba(18,14,10,.62)';c.fillRect(x0,y0,x1-x0,y1-y0);
  for(let i=0;i<26;i++){const rx=x0+seH(i*3.1)*(x1-x0)*.75,ry=y0+seH(i*7.7)*(y1-y0),rr=4+seH(i*1.3)*16;const g=c.createRadialGradient(rx,ry,0,rx,ry,rr);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(rx-rr,ry-rr,rr*2,rr*2)}
  c.fillStyle='rgba(120,60,20,.18)';c.fillRect(-60,-40,90,40);c.globalCompositeOperation='source-over';
  // becsapódás: szakadt lyuk a torony oldalán
  c.fillStyle='#050403';c.beginPath();c.ellipse(-40,-26,7,5,.3,0,7);c.fill();c.strokeStyle='#5a4a3a';c.lineWidth=1;c.stroke();
  SE._wreck={cv,x0,x1,y0,y1};return SE._wreck}
function seWreck(c,x,gy,s,L,tm){const W=seWreckImg(),u=s/SE_PZU;if(W)c.drawImage(W.cv,x+W.x0*u,gy+(W.y0-30.5)*u,(W.x1-W.x0)*u,(W.y1-W.y0)*u);
  else{c.fillStyle='#14110d';c.fillRect(x-4.4*s,gy-3*s,8.2*s,3*s)}
  // tűz a toronynyílásnál és füst
  const fx=x+(-30)*u,fy=gy+(-56-30.5)*u;c.save();c.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const fl=Math.sin(tm*17+i*2)*.5+.5,h=(10+fl*14)*u*2;c.fillStyle=`rgba(255,${120+i*25},40,${.35+fl*.25})`;c.beginPath();c.moveTo(fx-6*u+i*4*u,fy);c.quadraticCurveTo(fx-3*u+i*4*u,fy-h,fx+i*4*u,fy);c.fill()}
  const g=c.createRadialGradient(fx,fy,2,fx,fy,2.4*s);g.addColorStop(0,'rgba(255,140,50,.35)');g.addColorStop(1,'rgba(255,100,30,0)');c.fillStyle=g;c.fillRect(fx-2.4*s,fy-2.4*s,4.8*s,4.8*s);c.restore();
  for(let i=0;i<14;i++){const p=((tm*.16+i/14)%1),px=fx+(p*2.2+Math.sin(tm*.7+i)*.25)*s,py=fy-p*6*s,r=(.25+p*1.3)*s;c.fillStyle=`rgba(${30+p*40|0},${28+p*36|0},${26+p*30|0},${.5*(1-p)})`;c.beginPath();c.arc(px,py,r,0,7);c.fill()}}
// ---- H225M Caracal (méretarányos oldalnézet: törzs 16,8 m, magasság 5 m, főrotor Ø 16,2 m) ----
function seH225(c,x,y,s,tm,face,rot){c.save();c.translate(x,y);c.scale(face||-1,1);// x = főrotor-tengely, y = kerék alja; face −1: orr balra
  const m=s,P=(a,b)=>[(a-6.4)*m,-b*m],poly=(pts,col)=>{c.fillStyle=col;c.beginPath();pts.forEach((p,i)=>{const q=P(p[0],p[1]);i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])});c.closePath();c.fill()};
  const body='#3b4234',dk='#2a2f24',lt='#4c5543';
  // futómű
  c.strokeStyle='#1c1e18';c.lineWidth=.12*m;c.beginPath();let a=P(2.1,.35),b=P(2.1,1.1);c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);a=P(7.3,.35);b=P(7.6,1.0);c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();
  for(const wx of [2.1,7.3]){const q=P(wx,.35);c.fillStyle='#151613';c.beginPath();c.arc(q[0],q[1],.35*m,0,7);c.fill();c.fillStyle='#3a3a34';c.beginPath();c.arc(q[0],q[1],.15*m,0,7);c.fill()}
  // farokrész
  poly([[9.6,2.1],[15.2,2.55],[15.5,3.05],[9.6,3.3]],body);poly([[14.6,2.6],[16.9,3.1],[16.7,4.9],[15.9,4.9],[15.1,3.2]],body);poly([[13.8,3.05],[15.6,3.05],[15.6,3.25],[13.8,3.25]],dk);
  // törzs (kabin)
  poly([[0,1.6],[.4,1.05],[1.4,.8],[9.8,.85],[10.2,1.3],[10.3,2.3],[9.6,3.3],[3.2,3.35],[1.6,3.05],[.5,2.5]],body);
  poly([[3.4,3.3],[9.3,3.3],[9.0,4.0],[4.2,4.0]],lt);// hajtóművek burkolata
  poly([[5.9,1.0],[8.9,1.0],[9.1,1.55],[5.8,1.55]],dk);// oldalsó üzemanyag-tartály
  // pilótafülke üvegezés
  poly([[.45,2.45],[1.55,3.0],[2.5,3.0],[2.3,2.0],[.6,1.75]],'#16222a');c.fillStyle='rgba(160,200,220,.18)';c.beginPath();const g1=P(.9,2.5);c.ellipse(g1[0],g1[1],.35*m,.18*m,-.5,0,7);c.fill();
  // nyitott tolóajtó: sötét belső tér
  poly([[3.1,1.0],[5.2,1.0],[5.2,2.85],[3.1,2.85]],'#0b0d0a');poly([[5.25,1.0],[6.9,1.0],[6.9,2.85],[5.25,2.85]],'#333a2d');
  c.fillStyle='rgba(255,190,90,.25)';const dl=P(3.3,2.6);c.fillRect(dl[0],dl[1],1.7*m,.18*m);
  for(const wx of [7.2,8.3]){poly([[wx,2.1],[wx+.75,2.1],[wx+.75,2.7],[wx,2.7]],'#16222a')}
  // rotortengely + főrotor (5 lapát, forgásban elmosódva)
  poly([[6.25,4.0],[6.55,4.0],[6.5,4.75],[6.3,4.75]],'#1c1e18');const hub=P(6.4,4.8);c.fillStyle='#22251e';c.beginPath();c.ellipse(hub[0],hub[1],.45*m,.14*m,0,0,7);c.fill();
  const spin=rot==null?1:rot;if(spin>.05){c.fillStyle=`rgba(30,32,28,${.18+.1*Math.sin(tm*40)})`;c.beginPath();c.ellipse(hub[0],hub[1]-.05*m,8.1*m,.22*m,0,0,7);c.fill();c.strokeStyle='rgba(20,22,18,.55)';c.lineWidth=.07*m;const ph=tm*30;for(let i=0;i<5;i++){const ang=ph+i*1.2566,l=Math.cos(ang)*8.1*m;c.beginPath();c.moveTo(hub[0],hub[1]);c.lineTo(hub[0]+l,hub[1]+Math.sin(ang)*.12*m);c.stroke()}}
  else{c.strokeStyle='#1c1e18';c.lineWidth=.1*m;c.beginPath();c.moveTo(hub[0]-7.6*m,hub[1]+.3*m);c.lineTo(hub[0]+7.6*m,hub[1]+.25*m);c.stroke()}
  // farokrotor
  const tr=P(16.3,4.0);c.fillStyle=`rgba(30,32,28,${spin>.05?.3:.8})`;c.beginPath();c.ellipse(tr[0],tr[1],.18*m,1.5*m,0,0,7);c.fill();
  // navigációs fények
  const nl=P(10.1,2.2);c.fillStyle=(tm%1)<.15?'rgba(255,60,60,.95)':'rgba(120,20,20,.7)';c.beginPath();c.arc(nl[0],nl[1],.09*m,0,7);c.fill();
  c.restore()}
function seBoulder(c,x,gy,s,L,o){const w=o.w*s,h=o.h*s,sd=o.sd||0;c.fillStyle=seMix('#16181a','#6c7068',L);c.beginPath();c.moveTo(x-w/2,gy);c.lineTo(x-w*.48,gy-h*.55);c.lineTo(x-w*.3,gy-h*.92);c.lineTo(x-w*.02,gy-h);c.lineTo(x+w*.3,gy-h*.85);c.lineTo(x+w*.5,gy-h*.42);c.lineTo(x+w*.52,gy);c.fill();
  c.fillStyle='rgba(255,255,255,.1)';c.beginPath();c.moveTo(x-w*.3,gy-h*.9);c.lineTo(x-w*.02,gy-h*.98);c.lineTo(x+.05*w,gy-h*.6);c.lineTo(x-w*.25,gy-h*.55);c.fill();
  c.fillStyle=seMix('#0d160c','#3d5c2e',L);c.beginPath();c.ellipse(x-w*.1+seH(sd)*w*.2,gy-h*.96,w*.22,h*.07,0,0,7);c.fill();c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x-w/2,gy-h*.18,w*1.02,h*.18)}
function seWalker(c,x,gy,s,L,tm,o){const b=o.wait>0?0:Math.abs(Math.sin(o.ph||0))*2;c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(x,gy+1,.45*s,.08*s,0,0,7);c.fill();seEnemy(c,x,gy-b,s*.82,o.dir>0,tm,L);
  if((o.alert||0)>0){c.fillStyle=SE.det>.5?'#ff4a3e':'#ffd24a';c.font='900 20px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(SE.det>.5?'‼':'?',x,gy-2.6*s+Math.sin(tm*10)*2)}}
// ---- Charlie: sötét kihallgatóhelyiség, cella, bekötött szem ----
function seCapScene(c,W,H,tm){const C=SE.cap,st=C?C.st:'intro';c.fillStyle='#030304';c.fillRect(0,0,W,H);const top=H*.56;// a felső rész a jelenet, alul a párbeszéd
  if(st==='blind'||st==='blindq'||st==='intro'&&C.t>1.6){const bob=Math.sin(tm*9)*3+(Math.random()<.02?6:0);c.fillStyle='#120d08';c.fillRect(0,0,W,H);c.strokeStyle='rgba(70,50,30,.35)';c.lineWidth=1;for(let y=-10;y<H;y+=6){c.beginPath();c.moveTo(0,y+bob);c.lineTo(W,y+bob+3);c.stroke()}for(let x=0;x<W;x+=6){c.beginPath();c.moveTo(x,0);c.lineTo(x+2,H);c.stroke()}
    const g=c.createRadialGradient(W/2,top*.95,10,W/2,top*.95,W*.45);g.addColorStop(0,'rgba(140,100,60,.12)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,W,H);c.fillStyle='rgba(243,236,212,.5)';c.font='700 12px system-ui';c.textAlign='center';c.fillText('🕶️ zsák a fejeden – csak hallasz',W/2,24);return}
  const cell=st==='cell'||st==='tap'||st==='sum'||st==='broken';
  // falak, padló
  const wg=c.createLinearGradient(0,0,0,top);wg.addColorStop(0,'#0e0f10');wg.addColorStop(1,'#232425');c.fillStyle=wg;c.fillRect(0,0,W,top);c.fillStyle='#0e0e0d';c.fillRect(0,top,W,H-top);
  c.strokeStyle='rgba(255,255,255,.035)';for(let y=8;y<top;y+=18){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();for(let x=((y/18)%2)*22;x<W;x+=44){c.beginPath();c.moveTo(x,y);c.lineTo(x,y+18);c.stroke()}}
  if(cell){// magas, rácsos ablak holdfénnyel
    const wx=W*.66,wy=top*.18;c.fillStyle='#0c1424';c.fillRect(wx,wy,W*.12,top*.12);c.strokeStyle='#2a2a2a';c.lineWidth=3;for(let i=1;i<4;i++){c.beginPath();c.moveTo(wx+i*W*.03,wy);c.lineTo(wx+i*W*.03,wy+top*.12);c.stroke()}
    c.fillStyle='rgba(150,170,220,.07)';c.beginPath();c.moveTo(wx,wy+top*.12);c.lineTo(wx+W*.12,wy+top*.12);c.lineTo(W*.5,top);c.lineTo(W*.2,top);c.fill();
    c.fillStyle='#1d1c19';c.fillRect(W*.06,top-24,W*.3,10);c.fillStyle='#141310';c.fillRect(W*.08,top-14,6,14);c.fillRect(W*.32,top-14,6,14);
    seCapFig(c,W*.5,top,H*.2,tm,'sit');if(st==='tap'){const k=(tm*2)%1;c.strokeStyle=`rgba(255,224,138,${1-k})`;c.lineWidth=2;c.beginPath();c.arc(W*.14,top*.6,8+k*20,0,7);c.stroke()}
    c.fillStyle='rgba(243,236,212,.45)';c.font='700 12px system-ui';c.textAlign='center';c.fillText('🧱 cella',W/2,20);return}
  // lengő villanykörte, fénykúp
  const sw=Math.sin(tm*.9)*.1,bx=W/2+Math.sin(sw)*H*.18,by=H*.18,fl=Math.random()<.03?.3:1;
  c.strokeStyle='#222';c.lineWidth=1.5;c.beginPath();c.moveTo(W/2,0);c.lineTo(bx,by);c.stroke();
  c.save();c.globalCompositeOperation='lighter';const cg=c.createRadialGradient(bx,by,4,bx,top,W*.5);cg.addColorStop(0,`rgba(255,220,150,${.45*fl})`);cg.addColorStop(1,'rgba(255,200,120,0)');c.fillStyle=cg;c.beginPath();c.moveTo(bx-6,by);c.lineTo(bx+6,by);c.lineTo(bx+W*.42,top+H*.04);c.lineTo(bx-W*.42,top+H*.04);c.fill();
  c.fillStyle=`rgba(255,235,180,${.9*fl})`;c.beginPath();c.arc(bx,by+4,5,0,7);c.fill();for(let i=0;i<14;i++){const px=bx+(seH(i)-.5)*W*.5,py=by+((seH(i+5)*top+tm*6*(1+seH(i)))%top)*.95;c.fillStyle='rgba(255,230,180,.25)';c.fillRect(px,py,1.5,1.5)}c.restore();
  // ajtó résnyi fénnyel
  c.fillStyle='#090909';c.fillRect(W*.03,top*.3,W*.13,top*.7);c.fillStyle='rgba(255,210,140,.35)';c.fillRect(W*.16,top*.3,2,top*.7);c.fillStyle='rgba(255,210,140,.2)';c.fillRect(W*.06,top*.38,W*.06,top*.07);
  // asztal, székek
  const tx=W*.5,ty=top-H*.09;c.fillStyle='#1b1712';c.fillRect(tx-W*.2,ty,W*.4,8);c.fillStyle='#120f0c';c.fillRect(tx-W*.18,ty+8,6,top-ty-8);c.fillRect(tx+W*.18-6,ty+8,6,top-ty-8);
  // körben álló, arctalan alakok
  const figs=[[W*.09,1.08,.0],[W*.89,1.12,1.3],[W*.78,.96,2.1],[W*.24,.92,3.7]];for(const [fx,sc,ph] of figs)seCapFig(c,fx,top,H*.3*sc,tm+ph,'stand');
  seCapFig(c,tx+W*.13,top,H*.22,tm,'interrogator');seCapFig(c,tx-W*.13,top,H*.2,tm,'sit');
  c.fillStyle='rgba(243,236,212,.42)';c.font='700 12px system-ui';c.textAlign='center';c.fillText('🗣️ kihallgatóhelyiség',W/2,20)}
function seCapFig(c,x,base,h,tm,kind){const k=h/100;c.save();c.translate(x,base);c.scale(k,k);const br=Math.sin(tm*1.3)*1.2;
  if(kind==='stand'){c.fillStyle='#050506';c.beginPath();c.moveTo(-14,0);c.lineTo(-12,-52);c.lineTo(-18,-60);c.lineTo(-16,-84+br);c.quadraticCurveTo(0,-92+br,16,-84+br);c.lineTo(18,-60);c.lineTo(12,-52);c.lineTo(14,0);c.fill();c.beginPath();c.arc(0,-96+br,11,0,7);c.fill();
    c.fillStyle='rgba(255,230,180,.07)';c.fillRect(-16,-84+br,4,30);c.fillStyle=`rgba(220,230,255,${.35+.25*Math.sin(tm*.7)})`;c.fillRect(-6,-98+br,4,1.6);c.fillRect(2,-98+br,4,1.6);// szemüveg-csillanás
    c.fillStyle='#060606';c.fillRect(14,-70+br,22,4)}
  else if(kind==='interrogator'){c.fillStyle='#070708';c.fillRect(-10,-40,26,40);c.beginPath();c.moveTo(-14,-40);c.lineTo(-10,-82+br);c.quadraticCurveTo(4,-90+br,14,-80+br);c.lineTo(16,-40);c.fill();c.beginPath();c.arc(0,-94+br,11,0,7);c.fill();c.fillStyle='rgba(255,220,150,.12)';c.fillRect(-14,-82+br,3,40);c.fillStyle='#070708';c.fillRect(-34,-56,26,5)}
  else{c.fillStyle='#2d3022';c.fillRect(-4,-40,22,6);c.fillRect(12,-40,6,40);c.fillStyle='#3a3f2b';c.beginPath();c.moveTo(-8,-40);c.lineTo(-6,-78+br);c.lineTo(10,-78+br);c.lineTo(12,-40);c.fill();c.fillStyle='#c99b76';c.beginPath();c.arc(2,-88+br,9,0,7);c.fill();c.fillStyle='#454a2c';c.beginPath();c.arc(2,-91+br,9.5,Math.PI,0);c.fill();c.fillStyle='#2a2a26';c.fillRect(-16,-62,10,5)}
  c.restore()}
// ===== v4.2: filmszerű jelenetek – kitörés a táborból, üldözők a kivonási ponton, ajtólövész, kimentés =====
function seCineStart(id,exitName){SE.phase='cine';SE.cin={id,t:0,dur:9,exitName:exitName||'',skip:0};SE.mv=0;SE.tgt=null;try{rockTempo(132)}catch(e){}
  seSiren(true);try{seTray()}catch(e){}if(navigator.vibrate)try{navigator.vibrate([80,60,80])}catch(e){}
  const cv=SE.cv;if(cv){const h=e=>{if(SE.cin&&SE.cin.t>1){e.preventDefault();SE.cin.t=SE.cin.dur}};cv.addEventListener('pointerdown',h);SE.cin.h=h}}
function seCineEnd(){const C=SE.cin;if(!C)return;if(SE.cv&&C.h)SE.cv.removeEventListener('pointerdown',C.h);seSiren(false);SE.cin=null;SE.phase='play';if(C.id==='esc')seEscWin()}
function seSiren(on){try{if(!on){if(SE._sir){const g=SE._sir.g;g.gain.setTargetAtTime(0,AC.currentTime,.3);const o=SE._sir.o;setTimeout(()=>{try{o.stop()}catch(e){}},1200);SE._sir=null}return}
  if(!SOUND||!ac()||SE._sir)return;const t=AC.currentTime,o=AC.createOscillator(),l=AC.createOscillator(),lg=AC.createGain(),g=AC.createGain();o.type='sawtooth';o.frequency.value=620;l.frequency.value=.45;lg.gain.value=260;l.connect(lg).connect(o.frequency);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.05,t+.6);o.connect(g).connect(MASTER);o.start(t);l.start(t);SE._sir={o,g}}catch(e){}}
function seCineTick(dt){const C=SE.cin;if(!C)return;const p=C.t;C.t+=dt*(p>4.3&&p<5.6?.35:1);
  // lövések, becsapódások hangja
  if(SOUND&&AC&&C.t>1.4&&C.t<6.5&&Math.random()<dt*7)snare(AC.currentTime,.06+Math.random()*.06);if(SOUND&&AC&&p<2.6&&C.t>=2.6)boom(AC.currentTime,.5,60);
  if(C.t>=C.dur)seCineEnd()}
function seMan(c,x,y,h,ph,col,run,dive){c.save();c.translate(x,y);if(dive)c.rotate(dive);c.fillStyle=col;c.strokeStyle=col;c.lineCap='round';c.lineWidth=h*.11;
  const a=Math.sin(ph)*(run?.9:.25);c.beginPath();c.arc(h*.06,-h*.9,h*.085,0,7);c.fill();c.beginPath();c.moveTo(0,-h*.8);c.lineTo(-h*.06,-h*.42);c.stroke();
  c.beginPath();c.moveTo(-h*.06,-h*.42);c.lineTo(-h*.06+Math.sin(a)*h*.3,-h*.42+h*.22);c.lineTo(-h*.06+Math.sin(a)*h*.3-h*.05,0);c.moveTo(-h*.06,-h*.42);c.lineTo(-h*.06-Math.sin(a)*h*.3,-h*.42+h*.22);c.lineTo(-h*.06-Math.sin(a)*h*.34+h*.04,0);c.stroke();
  c.beginPath();c.moveTo(-h*.02,-h*.74);c.lineTo(-Math.sin(a)*h*.26+h*.05,-h*.52);c.moveTo(-h*.02,-h*.74);c.lineTo(Math.sin(a)*h*.26+h*.08,-h*.55);c.stroke();c.restore()}
function seCineDraw(c,W,H,tm){const C=SE.cin,t=C.t,gy=H*.78;
  // éjszakai ég + hold
  const sk=c.createLinearGradient(0,0,0,gy);sk.addColorStop(0,'#03050c');sk.addColorStop(1,'#141b26');c.fillStyle=sk;c.fillRect(0,0,W,H);c.fillStyle='#d9dccc';c.beginPath();c.arc(W*.82,H*.16,14,0,7);c.fill();
  // tábor: kerítés, őrtorony, barakkok (bal oldal, a kamera jobbra fut)
  const cam=Math.min(1,t/7)*W*.55,X=x=>x-cam;
  c.fillStyle='#0a0d12';c.fillRect(X(-40),gy-70,W*.55,70);c.fillRect(X(W*.1),gy-96,60,26);
  const tx=X(W*.42);c.fillRect(tx-4,gy-150,8,150);c.fillRect(tx-22,gy-170,44,22);c.fillRect(tx+18,gy-150,4,150);
  // forgó riasztófény
  const rb=(Math.sin(tm*9)+1)/2;c.save();c.globalCompositeOperation='lighter';const rg=c.createRadialGradient(tx,gy-176,0,tx,gy-176,60);rg.addColorStop(0,`rgba(255,40,30,${.35+.5*rb})`);rg.addColorStop(1,'rgba(255,40,30,0)');c.fillStyle=rg;c.fillRect(tx-60,gy-236,120,120);c.restore();
  // keresőfények
  const run=W*.18+Math.min(1,t/6.5)*W*1.05-cam*.65;c.save();c.globalCompositeOperation='lighter';for(const [k,sp] of [[0,1],[1,1.37]]){const aim=run+Math.sin(tm*sp+k*2)*120*(1-Math.min(1,t/5))+(k?60:-40);const a=Math.atan2(gy-(gy-160),aim-tx);const g=c.createLinearGradient(tx,gy-160,aim,gy);g.addColorStop(0,'rgba(255,250,215,.45)');g.addColorStop(1,'rgba(255,250,215,.05)');c.fillStyle=g;c.beginPath();c.moveTo(tx,gy-160);c.lineTo(aim-55,gy+10);c.lineTo(aim+55,gy+10);c.closePath();c.fill()}c.restore();
  // drótkerítés
  c.strokeStyle='#2a313a';c.lineWidth=1.5;for(let x=X(-40);x<X(W*.6);x+=26){c.beginPath();c.moveTo(x,gy);c.lineTo(x,gy-58);c.stroke()}c.beginPath();for(let x=X(-40);x<X(W*.6);x+=6)c.lineTo(x,gy-56+Math.sin(x)*3);c.stroke();
  // föld, fű, a jobb oldalon erdő
  c.fillStyle='#070a07';c.fillRect(0,gy,W,H-gy);for(let i=0;i<14;i++){const fx=X(W*.7+i*55),fh=90+((i*37)%60);c.fillStyle='#04060a';c.beginPath();c.moveTo(fx-26,gy);c.lineTo(fx,gy-fh);c.lineTo(fx+26,gy);c.fill()}
  // őrök a kerítésnél, torkolattűz
  for(let i=0;i<3;i++){const gx=X(W*.28+i*40),fl=t>1.4&&t<6.5&&Math.sin(tm*31+i*2)>.6;seMan(c,gx,gy,40,tm*2+i,'#05070a',false);if(fl){c.fillStyle='#ffd24a';c.beginPath();c.arc(gx+16,gy-28,4+Math.random()*3,0,7);c.fill();c.strokeStyle='rgba(255,210,120,.8)';c.lineWidth=1.6;c.beginPath();c.moveTo(gx+18,gy-28);const ty=gy-20-Math.random()*40,tx2=run+(Math.random()-.3)*90;c.lineTo(gx+18+(tx2-gx)*.55,gy-28+(ty-gy+28)*.55);c.stroke();c.fillStyle='rgba(120,100,80,.8)';c.fillRect(tx2,gy-3-Math.random()*5,3,3)}}
  // a menekülő (és a bajtárs) – lassítva vetődés a szakadékba
  const dv=t>4.3&&t<5.6?(t-4.3)/1.3:0,jy=dv?-Math.sin(dv*Math.PI)*40:0;const rim=(x,y,h,ph,dvv)=>{seMan(c,x-1.8,y-1.5,h,ph,'#8fa3b8',true,dvv);seMan(c,x,y,h,ph,'#151a20',true,dvv)};rim(run,gy+jy,58,tm*14,dv?dv*1.2:0);
  if(SE.buddy)rim(run-44,gy+(t>4.6&&t<5.9?-Math.sin((t-4.6)/1.3*Math.PI)*34:0),55,tm*12+1,t>4.6&&t<5.9?(t-4.6):0);
  c.fillStyle='#9fb4c8';c.font='bold 10px sans-serif';c.textAlign='center';c.fillText('TE',run,gy+jy-66);if(SE.buddy)c.fillText(SE.budName||'Kovács',run-44,gy-62);
  // világítórakéta
  if(t>2.6){const ft=t-2.6,fx=X(W*.5)+ft*20,fy=gy-200-Math.min(1,ft)*80+ft*8;c.save();c.globalCompositeOperation='lighter';const fg=c.createRadialGradient(fx,fy,0,fx,fy,260);fg.addColorStop(0,`rgba(255,240,200,${Math.max(0,.55-ft*.06)})`);fg.addColorStop(1,'rgba(255,240,200,0)');c.fillStyle=fg;c.fillRect(0,0,W,H);c.restore();c.fillStyle='#fff';c.beginPath();c.arc(fx,fy,3,0,7);c.fill()}
  // mozis sávok, feliratok
  const bh=H*.1;c.fillStyle='#000';c.fillRect(0,0,W,bh);c.fillRect(0,H-bh,W,bh);c.textAlign='center';
  const ttl=(txt,sub,a)=>{c.globalAlpha=Math.max(0,Math.min(1,a));c.fillStyle='#ffcf3a';c.font='900 30px Anton, Impact, sans-serif';c.fillText(txt,W/2,H*.3);c.fillStyle='#f3ecd4';c.font='bold 13px sans-serif';c.fillText(sub,W/2,H*.3+22);c.globalAlpha=1};
  if(t<3)ttl('03:12 · RIADÓ',`Kijutottál – ${C.exitName||'a táboron kívül'}. FUSS!`,Math.min(t*2,(3-t)*2));
  if(t>6.2)ttl('SZABAD VAGY','…de az erdőig még nem vagy biztonságban',Math.min((t-6.2)*2,(C.dur-t)*2));
  if(t>1.2&&t<4.2){c.fillStyle='#ff8a7a';c.font='bold 15px sans-serif';c.fillText('„STOJ! STOJ!”',W*.36,H-bh-16)}
  if(dv){c.fillStyle='rgba(255,255,255,.8)';c.font='bold 11px sans-serif';c.textAlign='right';c.fillText('▶▶ LASSÍTÁS',W-12,bh+18)}
  c.fillStyle='rgba(255,255,255,.55)';c.font='bold 11px sans-serif';c.textAlign='center';if(t>1)c.fillText('koppints a kihagyáshoz',W/2,H-bh/2+4)}
// ---- kivonási pont: üldözők + ajtólövész (látvány, nem állja el az utat) ----
function seLZClear(){const x=SE.x;SE.objs=SE.objs.filter(o=>!(['walker','patrol','tower','drone','pair'].includes(o.k)&&o.x>x-10&&o.x<x+70));SE.lzSafe=1;
  SE.pur={x:x-14,t:0,men:[0,1,2].map(i=>({dx:i*1.6,ph:i,down:0}))};SE.cin2={t:0}}
function seLZCineTick(dt){const P=SE.pur,E=SE.ex;if(!P)return;P.t+=dt;if(SE.cin2)SE.cin2.t+=dt;const fire=E&&(E.st==='land'||E.st==='board'||E.st==='auth');
  const stopX=SE.x-3.6;if(!fire&&P.x<stopX)P.x+=2.6*dt;if(fire){P.fireT=(P.fireT||0)+dt;for(const m of P.men)if(!m.down&&P.fireT>.8+m.dx*.5){m.down=1;if(SOUND&&AC)snare(AC.currentTime,.12)}
    if(SOUND&&AC&&Math.random()<dt*14)snare(AC.currentTime,.05);if(!P.said){P.said=1;sePop('🔥 Az ajtólövész lefogja az üldözőket – FUSS!','#ffd24a');try{seSpeak('Kestrel One-One. Suppressing. Run to the aircraft!')}catch(e){}}}
  if(E&&E.st==='out'&&!SE.cin2.out){SE.cin2.out=SE.cin2.t}}
function seLZCineDraw(c,W,H){const P=SE.pur,E=SE.ex;if(!P&&!(E&&E.st==='out'))return;const s=SE.s*(SE.zoom||1),gy=H*.8,X=x=>SE.px0+(x-SE.x)*s,Y=y=>gy-y*s;const tm=performance.now()/1000;
  if(P){for(const m of P.men){const mx=X(P.x-m.dx),my=Y(0);if(m.down){c.fillStyle='#5d6873';c.fillRect(mx-s*.8,my-s*.28,s*1.6,s*.28);c.fillStyle='#2b3138';c.fillRect(mx-s*.8,my-s*.22,s*1.6,s*.22);continue}const rn=P.x<SE.x-3.8;seMan(c,mx-1.5,my-1.2,s*1.75,tm*9+m.ph,'#7d8a96',rn,0);seMan(c,mx,my,s*1.75,tm*9+m.ph,'#20262c',rn,0);c.fillStyle='#ff8a7a';c.font='bold 10px sans-serif';c.textAlign='center';if(m.dx===0)c.fillText('ÜLDÖZŐK',Math.max(30,mx-s*.8),my-s*2.1);
      c.save();c.globalCompositeOperation='lighter';const g=c.createLinearGradient(mx,my-s*1.1,mx+s*7,my);g.addColorStop(0,'rgba(255,245,200,.35)');g.addColorStop(1,'rgba(255,245,200,0)');c.fillStyle=g;c.beginPath();c.moveTo(mx+s*.3,my-s*1.15);c.lineTo(mx+s*7,my-s*2.2);c.lineTo(mx+s*7,my+s*.2);c.closePath();c.fill();c.restore()}
    if(E&&(E.st==='land'||E.st==='board'||E.st==='auth')&&E.vis!==false){const hx=X(E.hx-1.6),hy=Y(E.hy+1.1);c.strokeStyle='rgba(255,170,60,.9)';c.lineWidth=2;for(let i=0;i<3;i++){const k=Math.random();const tx=X(P.x-k*3.5),ty=Y(.2+Math.random()*1.2);c.beginPath();c.moveTo(hx+(tx-hx)*k*.6,hy+(ty-hy)*k*.6);c.lineTo(hx+(tx-hx)*(k*.6+.25),hy+(ty-hy)*(k*.6+.25));c.stroke()}c.fillStyle='#ffd24a';c.beginPath();c.arc(hx,hy,3+Math.random()*4,0,7);c.fill()}}
  // mozis sávok a kivonás alatt
  const on=E&&E.st!=='wait'&&E.st!=='gone';SE.lzK=(SE.lzK||0)+((on?1:0)-(SE.lzK||0))*.05;const bh=H*.08*SE.lzK;if(bh>.5){c.fillStyle='#000';c.fillRect(0,0,W,bh);c.fillRect(0,H-bh,W,bh)}
  if(E&&E.st==='out'&&SE.cin2&&SE.cin2.out!=null){const t=SE.cin2.t-SE.cin2.out,a=Math.max(0,Math.min(1,t*1.5));c.save();c.globalAlpha=a*.45;const g=c.createLinearGradient(0,H*.2,0,H*.8);g.addColorStop(0,'rgba(255,150,60,0)');g.addColorStop(1,'rgba(255,170,80,.9)');c.fillStyle=g;c.fillRect(0,0,W,H);c.globalAlpha=a;c.textAlign='center';c.fillStyle='#ffcf3a';c.font='900 32px Anton, Impact, sans-serif';c.fillText('KIMENTVE',W/2,H*.3);c.fillStyle='#f3ecd4';c.font='bold 13px sans-serif';c.fillText(`05:47 · KESTREL ONE-ONE · ${SE.buddy?'2 fő a fedélzeten':'1 fő a fedélzeten'}`,W/2,H*.3+22);c.restore()}}
// ===== v4.7: interaktív SERE kiképző-állomások (nyilvános túlélési alapelvek) + mozgás-effektek =====
const SE_TR=[
 {id:'shadow',ic:'☀️',t:'Tájékozódás árnyékbottal',d:1,pts:300,l:'Első jel = nyugat, második = kelet; észak erre merőleges, az árnyék felé.'},
 {id:'water',ic:'💧',t:'Víztisztítás terepen',d:1,pts:250,l:'Szűrés → forralás (min. 1 perc lobogva) → fedett tárolás.'},
 {id:'mirror',ic:'🪞',t:'Jelzés jelzőtükörrel',d:1,pts:300,l:'Kinyújtott kar, V-ujjak közé a gép, a fényfoltot a V-be vezesd.'},
 {id:'sos',ic:'🆘',t:'SOS fényjelzés',d:1,pts:300,l:'SOS = ··· −−− ··· (3 rövid, 3 hosszú, 3 rövid), szünettel ismételve.'},
 {id:'camo',ic:'🫥',t:'Miért vesznek észre? – álcázás',d:2,pts:300,l:'Alak, csillogás, árnyék, sziluett, szín, mozgás – ezeket tüntesd el.'},
 {id:'freeze',ic:'🔦',t:'Járőr közeledik – ne mozdulj!',d:2,pts:400,l:'Fényben dermedj meg, sötétben lélegezz – a mozgás árul el.'},
 {id:'hide',ic:'🌲',t:'Rejtekhely kiválasztása',d:2,pts:350,l:'Takarás, távol úttól, nem gerincen és nem völgyfenéken, legyen menekülőút.'},
 {id:'polaris',ic:'⭐',t:'Észak a csillagokból',d:2,pts:300,l:'Göncölszekér két mutatója ×5 → Sarkcsillag, alatta észak.'}];
function seTrNext(){const done=SE.trDone||[],q=SE.trQ||[];return (SE_TR.find(t=>t.d<=SE.day&&!done.includes(t.id)&&!q.includes(t.id))||{}).id}
function seTrTick(dt){if(SE.tr||SE.tut||SE.esc||SE.ex||SE.amb||SE.quiz||SE.choice||SE.mg)return;for(const o of SE.objs){if(o.k==='train'&&!o.done&&SE.x>=o.x-.6&&SE.x<o.x+2){o.done=1;seTrOpen(o.id);break}}}
// ---- állomás-panel ----
function seTrOpen(id){const D=SE_TR.find(t=>t.id===id);if(!D)return;SE.mv=0;SE.tgt=null;SE.v=0;SE.paused=true;SE.mg={k:'tr',id};
  const w=$('#seWrap');let el=$('#seTrain');if(!el){el=document.createElement('div');el.id='seTrain';w.appendChild(el)}
  el.innerHTML=`<div class="setrbox"><div class="setrhd"><span>🎓 KIKÉPZŐ-ÁLLOMÁS</span><b>${D.ic} ${D.t}</b></div><canvas id="seTrCv"></canvas><p class="setrtip" id="seTrTip"></p><div class="setrbtns" id="seTrBtns"></div></div>`;el.hidden=false;
  const cv=$('#seTrCv'),r=cv.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);cv.width=r.width*dpr;cv.height=r.height*dpr;
  SE.tr={id,D,cv,c:cv.getContext('2d'),W:r.width,H:r.height,dpr,t:0,st:0,last:performance.now(),ptr:null,tries:0};
  cv.addEventListener('pointerdown',seTrDown);cv.addEventListener('pointermove',seTrMove);cv.addEventListener('pointerup',seTrUp);cv.addEventListener('pointercancel',seTrUp);
  ({shadow:seTrShadowInit,water:seTrWaterInit,mirror:seTrMirrorInit,camo:seTrCamoInit,freeze:seTrFreezeInit,polaris:seTrPolInit,sos:seTrSosInit,hide:seTrHideInit})[id]();
  seTray();try{saRustle&&saRustle(.04)}catch(e){}SE.tr.raf=requestAnimationFrame(seTrLoop)}
function seTrTip(h){const e=$('#seTrTip');if(e)e.innerHTML=h}
function seTrBtns(h){const e=$('#seTrBtns');if(e)e.innerHTML=h;return e}
function seTrEnd(ok,lesson){const T=SE.tr;if(!T||T.over)return;T.over=1;const pts=ok?T.D.pts:Math.round(T.D.pts*.3);sePts('tr',pts);if(ok)seOk();else seBeep(260,.15,.05);
  seTrTip(`<b class="${ok?'ok':'bad'}">${ok?'✅ Sikeres gyakorlat!':'⚠️ Nem sikerült tökéletesen'} · +${pts} pont</b><span class="setrles">📘 ${lesson}</span>`);
  const b=seTrBtns('<button type="button" class="btn pri" data-trx>▶ Tovább</button>');b.querySelector('[data-trx]').onclick=seTrClose}
function seTrClose(){const T=SE.tr;if(!T)return;cancelAnimationFrame(T.raf);(SE.trDone=SE.trDone||[]).push(T.id);SE.trQ=(SE.trQ||[]).filter(x=>x!==T.id);SE.tr=null;SE.mg=null;SE.paused=false;const el=$('#seTrain');if(el){el.hidden=true;el.innerHTML=''}seSave();seTray()}
function seTrPt(e){const T=SE.tr,r=T.cv.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top}}
function seTrDown(e){e.preventDefault();const T=SE.tr;if(!T||T.over)return;const p=seTrPt(e);T.ptr=p;T.down=1;T.onDown&&T.onDown(p)}
function seTrMove(e){const T=SE.tr;if(!T||!T.down)return;T.ptr=seTrPt(e);T.onMove&&T.onMove(T.ptr)}
function seTrUp(e){const T=SE.tr;if(!T)return;T.down=0;T.onUp&&T.onUp()}
function seTrLoop(now){const T=SE.tr;if(!T)return;const dt=Math.min(.05,(now-T.last)/1000);T.last=now;T.t+=dt;const c=T.c;c.setTransform(T.dpr,0,0,T.dpr,0,0);T.draw&&T.draw(c,T.W,T.H,dt,now);T.raf=requestAnimationFrame(seTrLoop)}
function seTrTxt(c,s,x,y,col,sz,al){c.font=`bold ${sz||12}px system-ui,sans-serif`;c.textAlign=al||'center';c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.7)';c.strokeText(s,x,y);c.fillStyle=col||'#fff';c.fillText(s,x,y)}
// ---- 1) árnyékbot ----
function seTrShadowInit(){const T=SE.tr;T.sx=T.W/2;T.sy=T.H*.78;T.a=-Math.PI/2-.55;T.len=T.H*.5;T.marks=[];
  seTrTip('A bot árnyékának <b>csúcsára</b> tegyél egy követ: koppints az árnyék végére.');
  T.tip=()=>({x:T.sx+Math.cos(T.a)*T.len,y:T.sy+Math.sin(T.a)*T.len});
  T.onDown=p=>{if(T.st>1)return;const q=T.tip();if(Math.hypot(p.x-q.x,p.y-q.y)<26){T.marks.push(q);seOk();if(T.st===0){T.st=.5;T.anim=0;seTrTip('⏳ Telik az idő… (15–20 perc múlva) – a Nap halad, az árnyék elfordul.')}else{T.st=2;seTrTip('A két kő vonala: az <b>első jel NYUGAT</b>, a második <b>KELET</b>. Merre van <b>ÉSZAK</b>?');
      const b=seTrBtns(['⬆ Az árnyék felé','⬇ A bot mögött','⬅ Az első kő felé','➡ A második kő felé'].map((s,i)=>`<button type="button" class="btn line" data-q="${i}">${s}</button>`).join(''));b.querySelectorAll('[data-q]').forEach(x=>x.onclick=()=>seTrEnd(x.dataset.q==='0','Árnyékbot-módszer: az első kő mindig nyugat, a második kelet. Erre merőlegesen – az északi féltekén délben az árnyék irányába – van észak. Minél tovább vársz a két jel között, annál pontosabb.'))}}else{T.tries++;seBeep(240,.06,.03)}};
  T.draw=(c,W,H,dt)=>{c.fillStyle='#c8b07a';c.fillRect(0,0,W,H);for(let i=0;i<60;i++){c.fillStyle='rgba(90,70,40,.25)';c.fillRect((i*73)%W,(i*131)%H,3,2)}
    if(T.st===.5){T.anim+=dt;T.a+=dt*.45;if(T.anim>1.4){T.st=1;seTrTip('Most jelöld meg az árnyék <b>új csúcsát</b> a második kővel!')}}
    const q=T.tip();c.strokeStyle='rgba(40,30,15,.55)';c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(T.sx,T.sy);c.lineTo(q.x,q.y);c.stroke();
    c.fillStyle='#5a3d22';c.fillRect(T.sx-3,T.sy-48,6,50);c.fillStyle='#3a2a16';c.beginPath();c.ellipse(T.sx,T.sy+2,9,3,0,0,7);c.fill();
    if(T.st<2&&T.st!==.5){const pu=.5+.5*Math.sin(T.t*6);c.strokeStyle=`rgba(255,255,255,${.4+pu*.5})`;c.lineWidth=2;c.beginPath();c.arc(q.x,q.y,10+pu*6,0,7);c.stroke()}
    T.marks.forEach((m,i)=>{c.fillStyle='#777';c.beginPath();c.arc(m.x,m.y,7,0,7);c.fill();c.fillStyle='#aaa';c.beginPath();c.arc(m.x-2,m.y-2,3,0,7);c.fill();seTrTxt(c,i?'K (2.)':'Ny (1.)',m.x,m.y+22,'#fff',12)});
    if(T.marks.length===2){const [a,b]=T.marks;c.setLineDash([6,5]);c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.moveTo(a.x-(b.x-a.x)*.5,a.y-(b.y-a.y)*.5);c.lineTo(b.x+(b.x-a.x)*.5,b.y+(b.y-a.y)*.5);c.stroke();c.setLineDash([])}
    const sunX=W*.82,sunY=H*.12;c.fillStyle='#ffd24a';c.beginPath();c.arc(sunX,sunY,11,0,7);c.fill();seTrTxt(c,'☀ Nap (dél felől)',sunX,sunY+26,'#fff',10)}}
// ---- 2) víztisztítás ----
function seTrWaterInit(){const T=SE.tr;T.ok=['Ülepítés, szűrés ruhán át','Forralás – legalább 1 percig lobogva','Hűtés fedett edényben, tárolás'];T.bad=['Azonnal iszol a patakból','Sót keversz bele'];T.got=0;T.err=0;
  seTrTip('Patakvizet találtál. Koppints a lépésekre <b>helyes sorrendben</b>!');const all=seShuf(T.ok.concat(T.bad));
  const b=seTrBtns(all.map(s=>`<button type="button" class="btn line" data-w="${esc(s)}">${esc(s)}</button>`).join(''));b.querySelectorAll('[data-w]').forEach(x=>x.onclick=()=>{if(T.over)return;const s=x.dataset.w;if(s===T.ok[T.got]){T.got++;x.disabled=true;x.classList.add('ok');seOk();if(T.got===3)seTrEnd(T.err<=1,'Szűrés: kiveszi a sarat, de a kórokozókat nem! A forralás öli meg őket – legalább 1 perc lobogó forrás (magas hegyen 3 perc). Víztisztító tablettánál tartsd be a várakozási időt.')}else{T.err++;seBeep(240,.08,.04);x.classList.add('bad');setTimeout(()=>x.classList.remove('bad'),500)}});
  T.draw=(c,W,H)=>{c.fillStyle='#2a3a2a';c.fillRect(0,0,W,H);const g=c.createLinearGradient(0,H*.55,0,H);g.addColorStop(0,'#3a6a8a');g.addColorStop(1,'#1d3a4a');c.fillStyle=g;c.fillRect(0,H*.55,W,H*.45);for(let i=0;i<8;i++){c.strokeStyle='rgba(255,255,255,.25)';c.beginPath();c.moveTo((i*57+T.t*30)%W,H*.62+i*8);c.lineTo((i*57+T.t*30)%W+24,H*.62+i*8);c.stroke()}
    const steps=['🧺','🔥','🫙'];for(let i=0;i<3;i++){const x=W*(.22+.28*i),y=H*.35,on=i<T.got;c.fillStyle=on?'rgba(157,255,157,.25)':'rgba(0,0,0,.35)';c.beginPath();c.arc(x,y,26,0,7);c.fill();c.font='26px sans-serif';c.textAlign='center';c.globalAlpha=on?1:.35;c.fillText(steps[i],x,y+9);c.globalAlpha=1;seTrTxt(c,(i+1)+'.',x-22,y-20,'#ffd24a',12)}
    if(T.got>=2){for(let i=0;i<6;i++){const x=W*.5+(Math.random()-.5)*20,y=H*.35-30-Math.random()*20;c.fillStyle='rgba(255,255,255,.4)';c.beginPath();c.arc(x,y,3,0,7);c.fill()}}}}
// ---- 3) jelzőtükör ----
function seTrMirrorInit(){const T=SE.tr;T.hx=-40;T.hy=T.H*.3;T.on=0;T.p={x:T.W*.5,y:T.H*.7};
  seTrTip('Mentőhelikopter! <b>Húzd az ujjad</b>: a tükör fényfoltját tartsd a gépen – kb. 2 másodpercig összesen.');
  T.onDown=p=>{T.p=p};T.onMove=p=>{T.p=p};
  T.draw=(c,W,H,dt,now)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#5b8fc8');g.addColorStop(1,'#cfe6f0');c.fillStyle=g;c.fillRect(0,0,W,H);c.fillStyle='#3a5a2a';c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=20)c.lineTo(x,H*.82+Math.sin(x/40)*8);c.lineTo(W,H);c.fill();
    if(!T.over){T.hx+=dt*W*.09;T.hy=H*.28+Math.sin(T.t*.9)*H*.1;if(T.hx>W+40){T.hx=-40}}
    c.save();c.translate(T.hx,T.hy);c.fillStyle='#2f3a28';c.beginPath();c.ellipse(0,0,22,8,0,0,7);c.fill();c.fillRect(14,-3,28,4);c.fillRect(40,-10,3,12);c.strokeStyle='rgba(20,20,20,.5)';c.lineWidth=2;c.beginPath();c.moveTo(-30*Math.abs(Math.cos(T.t*20)),-12);c.lineTo(30*Math.abs(Math.cos(T.t*20)),-12);c.stroke();c.restore();
    const p=T.p,hit=!T.over&&Math.hypot(p.x-T.hx,p.y-T.hy)<26;if(hit){T.on+=dt;if(Math.random()<.2)seBeep(900,.03,.02)}
    c.save();c.globalCompositeOperation='lighter';const rg=c.createRadialGradient(p.x,p.y,0,p.x,p.y,28);rg.addColorStop(0,'rgba(255,255,230,.95)');rg.addColorStop(1,'rgba(255,255,230,0)');c.fillStyle=rg;c.fillRect(p.x-28,p.y-28,56,56);c.restore();
    c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.moveTo(p.x-14,p.y+30);c.lineTo(p.x,p.y+8);c.lineTo(p.x+14,p.y+30);c.stroke();seTrTxt(c,'V',p.x,p.y+44,'#fff',11);
    c.fillStyle='rgba(0,0,0,.5)';c.fillRect(10,10,W-20,10);c.fillStyle='#9dff9d';c.fillRect(10,10,(W-20)*Math.min(1,T.on/2),10);seTrTxt(c,hit?'LÁTNAK! ✨':'jelzés: '+Math.round(Math.min(1,T.on/2)*100)+'%',W/2,36,hit?'#9dff9d':'#fff',12);
    if(!T.over&&T.on>=2)seTrEnd(true,'Jelzőtükör: nyújtsd ki a karod, V-ujjaid közé fogd a gépet, és a fényfoltot vezesd a V-be. Napsütésben több kilométerről is látszik – de az ellenség is láthatja, ezért csak baráti gépnek jelezz!');
    if(!T.over&&T.t>16)seTrEnd(false,'Kifutottál az időből. Gyakorold: kinyújtott kar, V-ujjak, a fényfoltot lassan, egyenletesen vezesd a gépre.')}}
// ---- 4) álcázás: miért látszik a katona? ----
function seTrCamoInit(){const T=SE.tr;const W=T.W,H=T.H;T.hs=[{x:W*.58,y:H*.46,n:'Csillogás – óra, szemüveg',f:0,lx:W*.78,ly:H*.52},{x:W*.5,y:H*.2,n:'Sziluett a gerincen',f:0,lx:W*.24,ly:H*.12},{x:W*.53,y:H*.34,n:'Világos, festetlen arc',f:0,lx:W*.8,ly:H*.3},{x:W*.32,y:H*.72,n:'Feltűnő árnyék, szabad terület',f:0,lx:W*.32,ly:H*.9}];T.miss=0;
  seTrTip('Ez a katona könnyen észrevehető. Koppints a <b>4 hibára</b>, ami elárulja!');
  T.onDown=p=>{if(T.over)return;const h=T.hs.find(q=>!q.f&&Math.hypot(p.x-q.x,p.y-q.y)<30);if(h){h.f=1;seOk();if(T.hs.every(q=>q.f))seTrEnd(T.miss<=2,'Ami elárul: ALAK, CSILLOGÁS, ÁRNYÉK, SZILUETT, SZÍN és MOZGÁS. Ne állj gerincre, tompítsd a fényes tárgyakat, fesd/takard az arcod, maradj árnyékban és fedezék mögött.')}else{T.miss++;seBeep(240,.06,.03)}};
  T.draw=(c,W,H)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#9cc4e0');g.addColorStop(.3,'#cfe0e6');c.fillStyle=g;c.fillRect(0,0,W,H);c.fillStyle='#55703a';c.beginPath();c.moveTo(0,H*.3);c.quadraticCurveTo(W*.5,H*.18,W,H*.32);c.lineTo(W,H);c.lineTo(0,H);c.fill();
    c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(W*.32,H*.74,40,8,0,0,7);c.fill();
    const x=W*.5,y=H*.2;c.fillStyle='#4a5a32';c.fillRect(x-8,y,16,34);c.fillStyle='#f0d0b0';c.beginPath();c.arc(x,y+2,8,0,7);c.fill();c.fillStyle='#3a4428';c.beginPath();c.arc(x,y-1,9,Math.PI,0);c.fill();c.fillRect(x-8,y+34,6,22);c.fillRect(x+2,y+34,6,22);
    c.fillStyle='#fff';const sh=(Math.sin(T.t*5)+1)/2;c.globalAlpha=.5+sh*.5;c.beginPath();c.arc(W*.58,H*.46,3,0,7);c.fill();c.globalAlpha=1;c.fillStyle='#4a5a32';c.fillRect(x+6,y+12,W*.08,5);
    for(const h of T.hs){if(h.f){c.strokeStyle='#ff5a4a';c.lineWidth=3;c.beginPath();c.arc(h.x,h.y,20,0,7);c.stroke();c.strokeStyle='rgba(255,224,138,.6)';c.lineWidth=1;c.beginPath();c.moveTo(h.x,h.y);c.lineTo(h.lx,h.ly-4);c.stroke();seTrTxt(c,h.n,Math.min(W-72,Math.max(72,h.lx)),h.ly,'#ffe08a',11)}}
    seTrTxt(c,`${T.hs.filter(q=>q.f).length}/4 hiba`,W-40,20,'#fff',12);if(!T.over&&T.t>25)seTrEnd(false,'Ami elárul: alak, csillogás, árnyék, sziluett, szín és mozgás. Legközelebb ezeket keresd!')}}
// ---- 5) járőr közeledik – ne mozdulj! (izgalmas jelenet) ----
function seTrFreezeInit(){const T=SE.tr;T.bx=-.3;T.dir=1;T.sweeps=0;T.det=0;T.hold=0;T.air=1;T.hb=0;
  seTrTip('🔦 Zseblámpás járőr pásztáz! Amikor a fény rád esik: <b>tartsd nyomva a MOZDULATLAN gombot</b>. Közben engedd fel, és lélegezz.');
  const b=seTrBtns('<button type="button" class="btn pri setrhold" data-hold>🫥 MOZDULATLAN – tartsd nyomva</button>');const hb=b.querySelector('[data-hold]');
  hb.addEventListener('pointerdown',e=>{e.preventDefault();T.hold=1});['pointerup','pointercancel','pointerleave'].forEach(ev=>hb.addEventListener(ev,()=>{T.hold=0}));
  T.draw=(c,W,H,dt,now)=>{c.fillStyle='#070b12';c.fillRect(0,0,W,H);for(let i=0;i<30;i++){c.fillStyle='rgba(255,255,255,.5)';c.fillRect((i*97)%W,(i*53)%(H*.4),1.5,1.5)}
    c.fillStyle='#0d160d';c.beginPath();c.moveTo(0,H);c.lineTo(0,H*.72);for(let x=0;x<=W;x+=14)c.lineTo(x,H*.72-Math.abs(Math.sin(x*.37))*10);c.lineTo(W,H);c.fill();
    if(!T.over){T.bx+=T.dir*dt*.32;if((T.dir>0&&T.bx>1.25)||(T.dir<0&&T.bx<-.25)){T.dir*=-1;T.sweeps++;if(T.sweeps>=4)seTrEnd(T.det<1,T.det<1?'Kibírtad! Ha fény vagy őr közelít: ne fuss – a mozgás árul el leghamarabb. Lassan, hangtalanul lélegezz, és maradj mozdulatlan, amíg el nem halad.':'Észrevett a járőr. A mozgás és a hirtelen kapkodás árul el – a fényben dermedj meg, a sötétben lélegezz.')}}
    const gx=W*.5,gy=H*.3,bx=W*T.bx,on=Math.abs(bx-W*.45)<W*.11;
    c.save();c.globalCompositeOperation='lighter';const g=c.createLinearGradient(gx,gy,bx,H*.8);g.addColorStop(0,'rgba(255,250,210,.55)');g.addColorStop(1,'rgba(255,250,210,.08)');c.fillStyle=g;c.beginPath();c.moveTo(gx,gy);c.lineTo(bx-W*.1,H*.86);c.lineTo(bx+W*.1,H*.86);c.closePath();c.fill();c.restore();
    c.fillStyle='#000';c.fillRect(gx-5,gy-26,10,26);c.beginPath();c.arc(gx,gy-31,6,0,7);c.fill();c.fillRect(gx-5,gy,4,18);c.fillRect(gx+1,gy,4,18);
    // te: a bokorban fekve
    const px=W*.45,py=H*.8;c.fillStyle=on?'#4a5a32':'#1e2614';c.fillRect(px-30,py-6,60,9);c.beginPath();c.arc(px+30,py-3,6,0,7);c.fill();c.fillStyle='#1a2a12';for(let i=0;i<7;i++){c.beginPath();c.arc(px-36+i*12,py-8,10,0,7);c.fill()}
    if(!T.over){if(on){if(!T.hold){T.det+=dt*.9;if(Math.random()<.3)seBeep(500,.03,.02)}else T.air=Math.max(0,T.air-dt*.35)}else{if(T.hold)T.air=Math.max(0,T.air-dt*.25);else T.air=Math.min(1,T.air+dt*.5)}if(T.air<=0){T.det+=dt*.6}
      T.hb-=dt;if(T.hb<=0){T.hb=on?.42:.8;try{if(SOUND&&ac()){const a=AC,t=a.currentTime,o=a.createOscillator(),gg=a.createGain();o.frequency.value=55;gg.gain.setValueAtTime(.18,t);gg.gain.exponentialRampToValueAtTime(.001,t+.18);o.connect(gg).connect(MASTER);o.start(t);o.stop(t+.2)}}catch(e){}}}
    c.fillStyle='rgba(0,0,0,.55)';c.fillRect(10,10,W-20,26);c.fillStyle='#ff5a4a';c.fillRect(12,12,(W-24)*Math.min(1,T.det),9);c.fillStyle='#7fd6e8';c.fillRect(12,24,(W-24)*T.air,9);seTrTxt(c,'észlelés',40,20,'#fff',9);seTrTxt(c,'lélegzet',40,32,'#fff',9);
    seTrTxt(c,on?(T.hold?'🫥 dermedj…':'⚠ MOZDULATLAN!'):'lélegezz…',W/2,H*.62,on?(T.hold?'#9dff9d':'#ff5a4a'):'#bfe6ff',16);seTrTxt(c,`pásztázás ${Math.min(4,T.sweeps+1)}/4`,W-50,52,'#fff',10);
    if(!T.over&&T.det>=1)seTrEnd(false,'Észrevett a járőr. A fényben dermedj meg, a sötétben lélegezz – a mozgás árul el leghamarabb.')}}
// ---- 6) Sarkcsillag ----
function seTrPolInit(){const T=SE.tr;const W=T.W,H=T.H;const D=[[.18,.55],[.27,.5],[.36,.52],[.44,.47],[.47,.34],[.6,.3],[.6,.45]].map(([x,y])=>({x:x*W,y:y*H}));// Göncölszekér
  T.dip=D;T.ptrS=[D[5],D[6]];const dx=D[5].x-D[6].x,dy=D[5].y-D[6].y;T.pol={x:D[5].x+dx*5*.92,y:D[5].y+dy*5*.92};if(T.pol.y<14){T.pol.y=14}
  T.st=0;T.picked=[];T.bg=Array.from({length:70},()=>({x:Math.random()*W,y:Math.random()*H*.9,r:Math.random()*1.2+.3}));T.miss=0;
  seTrTip('Éjszaka van, nincs iránytű. Koppints a <b>Göncölszekér</b> két <b>mutató</b> csillagára (a „kanál” külső szélén)!');
  T.onDown=p=>{if(T.over)return;if(T.st===0){const s=T.ptrS.find(q=>!T.picked.includes(q)&&Math.hypot(p.x-q.x,p.y-q.y)<22);if(s){T.picked.push(s);seOk();if(T.picked.length===2){T.st=1;seTrTip('Hosszabbítsd meg a két mutató távolságát kb. <b>ötször</b> – koppints a <b>Sarkcsillagra</b>!')}}else{T.miss++;seBeep(240,.06,.03)}}
    else if(T.st===1){if(Math.hypot(p.x-T.pol.x,p.y-T.pol.y)<26){T.st=2;seTrEnd(T.miss<=3,'A Göncölszekér két mutatócsillagát kösd össze, és a távolságukat ötször hosszabbítsd meg – ott a Sarkcsillag. Alatta, a horizonton van az ÉSZAK. Ha az égbolt felhős, használd a Holdat vagy az árnyékbotot.')}else{T.miss++;seBeep(240,.06,.03)}}};
  T.draw=(c,W,H)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#050a18');g.addColorStop(1,'#16203a');c.fillStyle=g;c.fillRect(0,0,W,H);for(const s of T.bg){c.fillStyle=`rgba(255,255,255,${.4+.4*Math.sin(T.t*2+s.x)})`;c.fillRect(s.x,s.y,s.r*1.6,s.r*1.6)}
    c.strokeStyle='rgba(160,190,255,.25)';c.lineWidth=1;c.beginPath();T.dip.forEach((s,i)=>i?c.lineTo(s.x,s.y):c.moveTo(s.x,s.y));c.lineTo(T.dip[3].x,T.dip[3].y);c.stroke();
    for(const s of T.dip){const pk=T.picked.includes(s);c.fillStyle=pk?'#ffe08a':'#fff';c.beginPath();c.arc(s.x,s.y,pk?5:3.6,0,7);c.fill();if(pk){c.strokeStyle='#ffd24a';c.beginPath();c.arc(s.x,s.y,11,0,7);c.stroke()}}
    c.fillStyle='#e8eeff';c.beginPath();c.arc(T.pol.x,T.pol.y,T.st>=2?6:3.2,0,7);c.fill();
    if(T.st>=1){const a=T.ptrS[1],b=T.ptrS[0];c.setLineDash([5,6]);c.strokeStyle='rgba(255,224,138,.7)';c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x+(b.x-a.x)*(T.st>=2?4.6:2+Math.sin(T.t*3)*.6),b.y+(b.y-a.y)*(T.st>=2?4.6:2+Math.sin(T.t*3)*.6));c.stroke();c.setLineDash([])}
    if(T.st>=2){seTrTxt(c,'★ SARKCSILLAG',T.pol.x,T.pol.y+22,'#ffe08a',12);c.strokeStyle='#9dff9d';c.lineWidth=2;c.beginPath();c.moveTo(T.pol.x,T.pol.y+30);c.lineTo(T.pol.x,H-8);c.stroke();seTrTxt(c,'É',T.pol.x,H-14,'#9dff9d',16)}
    c.fillStyle='#050805';c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=10)c.lineTo(x,H*.93-Math.abs(Math.sin(x*.13))*14);c.lineTo(W,H);c.fill();if(!T.over&&T.t>35)seTrEnd(false,'A Göncölszekér két mutatócsillagát ötször meghosszabbítva találod a Sarkcsillagot – alatta van az észak.')}}
// ---- világbeli tábla + mozgás-effektek (por, lehelet) ----
function seTrWorldDraw(c,W,H){if(SE.phase!=='play')return;const s=SE.s*(SE.zoom||1),gy=H*.8,X=x=>SE.px0+(x-SE.x)*s,tm=performance.now()/1000;
  for(const o of SE.objs){if(o.k!=='train'||o.done)continue;const x=X(o.x);if(x<-60||x>W+60)continue;const y=gy-seGround(o.x)*s;
    c.fillStyle='#5a3d22';c.fillRect(x-2,y-s*1.5,4,s*1.5);c.fillStyle='#e8d8a8';c.fillRect(x-s*.9,y-s*2.1,s*1.8,s*.7);c.strokeStyle='#5a3d22';c.lineWidth=2;c.strokeRect(x-s*.9,y-s*2.1,s*1.8,s*.7);
    c.fillStyle='#2a1c10';c.font=`bold ${Math.max(9,s*.24)}px system-ui,sans-serif`;c.textAlign='center';c.fillText('🎓 KIKÉPZÉS',x,y-s*1.65);const pu=.5+.5*Math.sin(tm*4);c.strokeStyle=`rgba(255,224,138,${.3+pu*.5})`;c.lineWidth=2;c.beginPath();c.arc(x,y-s*1.75,s*1.1+pu*4,0,7);c.stroke()}
  // por a lépéseknél
  SE._mfx=SE._mfx||[];const sp=Math.abs(SE.v||0),onG=SE.y<=seGround(SE.x)+.05;if(onG&&sp>.4&&Math.random()<sp*.06){SE._mfx.push({x:SE.x-(SE.face||1)*.2,y:seGround(SE.x)+.05,vx:-(SE.face||1)*(.3+Math.random()*.5),vy:.3+Math.random()*.4,t:0,l:.6+sp*.08,k:'d'})}
  const cold=SE.wx==='tel'||seLight()<.45;SE._br=(SE._br||0)-1/60;if(cold&&SE._br<=0){SE._br=1.6+Math.random();SE._mfx.push({x:SE.x+(SE.face||1)*.35,y:seGround(SE.x)+(SE.pr>.7?.35:SE.cr>.5?1.05:1.55),vx:(SE.face||1)*.25,vy:.12,t:0,l:1.4,k:'b'})}
  SE._mfx=SE._mfx.filter(f=>{f.t+=1/60;f.x+=f.vx/60;f.y+=f.vy/60;const a=Math.max(0,1-f.t/f.l),x=X(f.x),y=gy-f.y*s;if(f.k==='d'){c.fillStyle=`rgba(150,130,100,${a*.45})`;c.beginPath();c.arc(x,y,s*(.08+f.t*.25),0,7);c.fill()}else{c.fillStyle=`rgba(235,240,250,${a*.4})`;c.beginPath();c.arc(x,y,s*(.06+f.t*.18),0,7);c.fill()}return f.t<f.l})}

// ---- 7) SOS fényjelzés (morze) ----
function seTrSosInit(){const T=SE.tr;T.seq='...---...';T.in='';T.lit=0;T.err=0;
  seTrTip('Éjszaka, a gerincen túl baráti egység. Villants <b>SOS</b>-t a zseblámpával: <b>rövid</b> koppintás = pont, <b>hosszan nyomva</b> = vonás. ··· −−− ···');
  const b=seTrBtns('<button type="button" class="btn pri setrhold" data-fl>🔦 VILLANTÁS (rövid / hosszú)</button>');const fb=b.querySelector('[data-fl]');
  fb.addEventListener('pointerdown',e=>{e.preventDefault();if(T.over)return;T.pd=performance.now();T.lit=1;try{if(SOUND&&ac()){const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=660;g.gain.setValueAtTime(.05,t);o.connect(g).connect(MASTER);o.start(t);T.osc={o,g}}}catch(x){}});
  const up=()=>{if(!T.pd||T.over)return;const d=performance.now()-T.pd;T.pd=0;T.lit=0;try{if(T.osc){T.osc.g.gain.setTargetAtTime(0,AC.currentTime,.01);T.osc.o.stop(AC.currentTime+.05);T.osc=null}}catch(x){}
    const sym=d<280?'.':'-';const need=T.seq[T.in.length];if(sym===need){T.in+=sym;if(T.in===T.seq)seTrEnd(T.err<=2,'SOS: ··· −−− ··· – három rövid, három hosszú, három rövid, majd szünet és ismétlés. Fénnyel, sípszóval, kopogással is működik. Három tűz háromszögben szintén nemzetközi vészjel.')}else{T.err++;T.in='';seBeep(240,.1,.04);seTrTip(`Hiba – kezdd újra! Rövid = &lt;0,3 mp, hosszú = tovább nyomva. ··· −−− ··· <b>(${T.err}. hiba)</b>`)}};
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>fb.addEventListener(ev,up));
  T.draw=(c,W,H)=>{c.fillStyle='#060a14';c.fillRect(0,0,W,H);for(let i=0;i<40;i++){c.fillStyle='rgba(255,255,255,.5)';c.fillRect((i*89)%W,(i*41)%(H*.5),1.5,1.5)}c.fillStyle='#0b120b';c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=12)c.lineTo(x,H*.7-Math.sin(x/50)*14);c.lineTo(W,H);c.fill();
    const lx=W*.25,ly=H*.68;if(T.lit){c.save();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(lx,ly,0,lx,ly,W*.5);g.addColorStop(0,'rgba(255,250,220,.9)');g.addColorStop(1,'rgba(255,250,220,0)');c.fillStyle=g;c.fillRect(0,0,W,H);c.restore()}
    c.fillStyle='#2a2a22';c.fillRect(lx-10,ly-4,20,8);c.fillStyle=T.lit?'#fff8d0':'#555';c.beginPath();c.arc(lx+10,ly,5,0,7);c.fill();
    const sx=W/2-T.seq.length*14+7;for(let i=0;i<T.seq.length;i++){const ch=T.seq[i],done=i<T.in.length,x=sx+i*28,y=H*.25;c.fillStyle=done?'#9dff9d':'rgba(255,255,255,.35)';if(ch==='.'){c.beginPath();c.arc(x,y,5,0,7);c.fill()}else c.fillRect(x-10,y-4,20,8)}
    seTrTxt(c,'S         O         S',W/2,H*.25+28,'#ffe08a',12);if(!T.over&&T.t>45)seTrEnd(false,'SOS: ··· −−− ··· – gyakorold a ritmust: rövid-rövid-rövid, hosszú-hosszú-hosszú, rövid-rövid-rövid.')}}
// ---- 8) rejtekhely kiválasztása ----
function seTrHideInit(){const T=SE.tr;const W=T.W,H=T.H;T.sp=[{x:W*.5,y:H*.2,n:'A',ok:0,w:'A gerincen a sziluetted messziről látszik – soha ne ott pihenj.'},{x:W*.18,y:H*.62,n:'B',ok:0,w:'Az út mellett bárki rád botolhat, a járőrök és a kutyák is ott járnak.'},{x:W*.72,y:H*.55,n:'C',ok:1},{x:W*.42,y:H*.86,n:'D',ok:0,w:'A völgyfenék hideg, nedves, ide gyűlik a köd és a víz – és nincs kilátás.'}];T.tries=0;
  seTrTip('Pihenned kell nappalra. Melyik a <b>legjobb rejtekhely</b>? Koppints a betűre!');
  T.onDown=p=>{if(T.over)return;const s=T.sp.find(q=>Math.hypot(p.x-q.x,p.y-q.y)<28);if(!s)return;if(s.ok){seTrEnd(T.tries<=1,'Jó rejtekhely: sűrű természetes takarás, távol utaktól és emberi nyomoktól, a lejtő közepén – nem a gerincen, nem a völgy alján –, és van menekülési útvonal. Kicsi, szabálytalan, alacsony, félreeső – mint a környezete.')}else{T.tries++;s.bad=1;seBeep(240,.1,.04);seTrTip(`❌ ${s.n}: ${s.w} Próbáld újra!`)}};
  T.draw=(c,W,H)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#a8c8dc');g.addColorStop(.25,'#cfe0e6');c.fillStyle=g;c.fillRect(0,0,W,H);
    c.fillStyle='#6f8a52';c.beginPath();c.moveTo(0,H*.55);c.quadraticCurveTo(W*.5,H*.05,W,H*.5);c.lineTo(W,H);c.lineTo(0,H);c.fill();c.fillStyle='#55703a';c.beginPath();c.moveTo(0,H*.8);c.quadraticCurveTo(W*.5,H*.95,W,H*.78);c.lineTo(W,H);c.lineTo(0,H);c.fill();
    c.strokeStyle='#b8a27a';c.lineWidth=8;c.beginPath();c.moveTo(0,H*.7);c.quadraticCurveTo(W*.2,H*.6,W*.3,H*.4);c.stroke();
    for(let i=0;i<9;i++){const x=W*.62+(i%3)*18,y=H*.48+Math.floor(i/3)*12;c.fillStyle='#2f4a22';c.beginPath();c.arc(x,y,13,0,7);c.fill()}
    c.fillStyle='rgba(200,220,235,.5)';c.fillRect(0,H*.86,W,H*.14);
    for(const s of T.sp){c.fillStyle=s.bad?'#7a2016':'rgba(0,0,0,.6)';c.beginPath();c.arc(s.x,s.y,16,0,7);c.fill();c.strokeStyle='#ffe08a';c.lineWidth=2;c.stroke();seTrTxt(c,s.n,s.x,s.y+5,'#ffe08a',15)}
    seTrTxt(c,'út',W*.12,H*.67,'#3a2a10',10);if(!T.over&&T.t>40)seTrEnd(false,'Jó rejtekhely: takarás, távol úttól, a lejtő közepén, menekülési útvonallal.')}}

// SERE: csak veszélyben szól – szívverés-ütem, mély pulzálás, tritonusz (feszültségkeltő)
Object.assign(SONGS,{sere_t:{bpm:88,root:82.41,prog:[0,0,1,0,0,0,-1,0],crash:false,fill:false,
  gtr:(b,r)=>b%2?[{s:0,n:r,l:8,ch:[0,6]}]:[{s:0,n:r,l:1,m:true},{s:3,n:r,l:1,m:true},{s:8,n:r,l:1,m:true},{s:11,n:r+1,l:1,m:true}],
  bass:(b,r)=>[{s:0,n:r,l:3},{s:3,n:r,l:3},{s:8,n:r,l:3},{s:11,n:r,l:3}],kick:[0,3],snare:[],hat:0}});
seLoop=medveWrap(seLoop,SE,'SERE');
export {SE,seOpen,seSave};
