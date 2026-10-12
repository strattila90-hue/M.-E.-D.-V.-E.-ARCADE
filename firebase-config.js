// M.E.D.V.E. Arcade – Firebase beállítás.
// Firebase konzol → Projekt beállításai (fogaskerék) → „Saját alkalmazások” → Web app → „SDK setup and configuration” → Config.
// Az ott látható értékeket másold be ide. Ezek nem titkosak: a védelmet a firestore.rules adja.
// Amíg az apiKey üres, a játék a régi módon, csak helyi rekordokkal működik.
window.MEDVE_FB = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
