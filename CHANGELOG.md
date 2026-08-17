# Interaktív CPU & Hardware Stúdió - Verziótörténet & Változásnapló (CHANGELOG)

Minden jelentős változtatás és architektúrális bővítés ebben a fájlban kerül dokumentálásra a szemantikus verziószámozás (SemVer) szabályai szerint.

---

## [v4.1.0] - 2026-08-16 (Commodore 64 Belső Architektúra, Cél IC-k & Interaktív Alaplapi Séma)

### 🌟 Új C64 Hardver Architektúra Funkciók:
- 🗺️ **Interaktív Alaplapi Áramköri Séma (Motherboard Schematic)**:
  - Teljes C64 alaplapi chip-elrendezés (U7 6510 CPU, U17 82S100 PLA, U19 VIC-II, U18 SID, U1/U2 CIA 1/2, U3 BASIC, U4 KERNAL, U5 CHARGEN, 64KB DRAM, 2114 Color RAM, Cartridge Port).
  - Színkódolt, animált buszvonalak: Address Bus (A0..A15), Data Bus (D0..D7), Control Bus (R/W, Φ1, Φ2, IRQ, NMI, BA, AEC).
  - Kétfázisú órajel (Φ1 és Φ2) szimulátor és lépésenkénti / automatikus órajel-generátor valós busz-váltásokkal.
- ⚡ **Animált Működési Szcenáriók (Live Animated Scenarios)**:
  1. *Dual-Phase Clock Interleaving (Φ1 / Φ2 buszmegosztás a CPU és a VIC-II között)*.
  2. *Bad Line DMA Steal (VIC-II karakter-mátrix beolvasás és CPU megállítás BA vonallal)*.
  3. *CIA 1 Billentyűzet Mátrix Pásztázás & PETSCII dekódolás*.
  4. *SID 6581 Hangszintézis & Analóg Szűrő Lánc*.
  5. *1541 Floppy Lemezegység Kézfogás és Átvitel az IEC Soros Buszon*.
  6. *VIC-II Raszterszámláló Megszakítás & Ciklus-pontos Képernyőosztás*.
- 🧩 **PLA Dinamikus Memóriatérkép Konfigurátor (MOS 82S100 Bank Switching)**:
  - Valós idejű LORAM ($01:0), HIRAM ($01:1), CHAREN ($01:2), /GAME és /EXROM kapcsolók.
  - Dinamikus 64KB szegmens-térkép és azonnali előre beállított konfigurációk (Standard BASIC, All RAM $30, Character ROM $33, 16KB Cartridge, Ultimax).
- 🔍 **Cél IC Mélyelemző & Lábkiosztás Adatlap (Custom IC Inspector)**:
  - Teljes DIP lábkiosztás, belső funkcionális blokkok, memóriába leképezett regisztertérkép és történelmi érdekességek minden MOS chiphez.

---

## [v4.0.0] - 2026-08-16 (Főverzió Ugrás: 74HC595 Shift-Regiszter Stúdió, Beépített Súgó & Verziókövetés)

### 🌟 Főverzió Kiemelt Újdonságai (Highlights):
- 🕹️ **74HC595 8-bites SIPO Shift-Regiszter Studio**:
  - Interaktív belső D-Flip-Flop léptetőregiszter (S0..S7) és kimeneti tároló retesz (L0..L7, Storage Latch) szintű valós idejű szimuláció.
  - Zavartalan, glitch-mentes párhuzamos kimenet-frissítés az ST_CP órajel segítségével.
- 🔗 **2x 74HC595 Végtelen Kaszkádolás & Daisy-Chaining**:
  - 16 vagy több kimenet vezérlése mindössze 3 MCU lábbal (DS, SH_CP, ST_CP) a 9. láb (QH' soros túlcsorduló) közvetlen bekötésével a 2. IC DS bemenetére.
- 💡 **4 Vizuális Kimeneti Terhelés Választó**:
  - Egyedi színű 8/16-bites LED sor (zöld, kék, borostyán, fehér).
  - Közös katódos 7-szegmenses kijelző előre definiált hexadecimális / decimális számjegy-dekódolással.
  - 8-csatornás ipari relémodul vizuális kapcsolókkal és állapotjelzőkkel.
  - Analóg bargraph kivezérlésmérő kijelző.
- 📈 **Valós Idejű Logikai Analizátor & Hullámforma Monitor**:
  - DS adat, SH_CP léptető órajel, ST_CP retesz órajel, /OE engedélyező jel és QH' túlcsorduló kimenet valós idejű digitális idődiagramja él-markerekkel.
- 🔅 **/OE Hardveres PWM Fényerőszabályzás & Tri-State Lebegés**:
  - Aktív-alacsony /OE engedélyező láb duty-cycle modulációval a kimeneti fényerő hardveres szabályzásához anélkül, hogy a shiftelt bájtok elvesznének.
- 🧩 **Vizuális Blokk-Programozás Bővítés**:
  - Új "Shift-Regiszter (74595)" kategória az `McuBlockStudio`-ban: lábkiosztás inicializálás, bájt kiírás, 16-bites kaszkádolás, 7-szegmens dekódolás és PWM fényerő blokkok.
  - Kész mintaprogramok: Knight Rider futófény (Cylon scanner), 7-szegmenses számláló, 16-bites kaszkád számláló.
- 📖 **Átfogó Interaktív Súgó & Kézikönyv Rendszer**:
  - Kereshető téma-adatbázis magyar és angol nyelven kódpéldákkal (Arduino C++, AVR Assembly, BASIC V2).
- 📜 **Interaktív Verziókövető és Kiadási Történet**:
  - Részletes modul- és kategória-szűrők, idővonal, exportálási lehetőség Markdown formátumba.

---

## [v3.9.0] - 2026-08-15 (Hardveres Fast PWM & Többcsatornás Időzítő Stúdió)
- **AVR Timer0/Timer1/Timer2 Szimuláció**: Előosztók (Prescaler 1..1024), Fast PWM és Phase-Correct PWM üzemmódok.
- **Gamma 2.2 Optikai Korrekció**: Emberi szem logaritmikus érzékelésének kompenzálása exponenciális fényerőgörbével.
- **Valós Idejű Oszcilloszkóp**: Számláló rámpa és OCR komparátor küszöb vizualizáció.

---

## [v3.8.0] - 2026-08-14 (SAR ADC & Nyquist Analizátor Stúdió)
- **Szukcesszív Approximációs (SAR) ADC**: Lépésenkénti bináris felező keresés, belső DAC visszacsatolás és analóg komparátor.
- **Mintavevő-Tartó (Sample & Hold)**: Kondenzátor töltési időállandó ($RC$) és apertúra szimuláció.
- **Nyquist-Shannon Aliasing Elemző**: Alulmintavételezés és frekvencia-tükröződés analízis.

---

## [v3.5.0] - 2026-08-10 (I/O Periféria & Memóriatérkép MMIO Stúdió)
- **74LS138 Címdekóder**: 3-ból 8-as vonal dekódolás aktív-alacsony chip select kimenetekkel.
- **Memória Foldback / Aliasing Vizualizáló**: Részleges dekódolás miatt megjelenő tükör-memóriacímek elemzése.
- **Perifériák**: 16x2 HD44780 LCD kijelző, 4x4 Mátrix billentyűzet, Kettős 7-szegmens BCD, 8-bit DAC & ADC.

---

## [v3.0.0] - 2026-08-01 (Többmagos CPU Architektúra & Commodore 64 Stúdió)
- **4 Független CPU Mag**: Edu-8 RISC, MOS 6502, Zilog Z80, Ben Eater SAP-1.
- **Commodore 64 Munkaállomás**: 6510 CPU, BASIC V2 terminál, VIC-II 24x21 Sprite editor, SID 6581 3-csatornás szintetizátor.

---

## [v2.5.0] - 2026-07-20 (RISC-V 5-Fokozatú Futószalag & Cache Szimulátor)
- **5-Fokozatú RISC-V Pipeline**: IF, ID, EX, MEM, WB fokozatok adatütközés előrecsatolással (forwarding) és elágazás-vesztési buborékokkal.
- **L1/L2 Gyorsítótár (Cache)**: Közvetlen leképezésű (Direct Mapped) és N-utas csoport-asszociatív (Set-Associative) szimulátor.

---

## [v2.0.0] - 2026-07-05 (Moduláris Áramköri Lap & Logikai Analizátor)
- Drag-and-drop kártyák, buszhuzal animáció, digitális logikai analizátor és időutazó visszalépés (Time-travel debugging).

---

## [v1.0.0] - 2026-06-01 (Első Nyilvános Kiadás: Edu-8 CPU Szimulátor)
- 8-bites RISC processzor, beépített assembly fordító, 256 bájt RAM és lépésenkénti órajel szekvenszer.
