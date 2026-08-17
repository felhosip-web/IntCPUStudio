import { VersionEntry } from '../types/version';

export const CURRENT_APP_VERSION = '4.4.0';

export const VERSION_HISTORY: VersionEntry[] = [
  {
    version: '4.4.0',
    releaseDate: '2026-08-17',
    category: 'minor',
    title: 'Dynamic Theme & Color System: Default Dark, System Auto, Modern Light & Hacker Pro',
    titleHu: 'Dinamikus Téma & Színkezelés: Alapértelmezett Sötét, Rendszerkövető, Világos & Hacker Pro',
    summary:
      'Added comprehensive dynamic theme management system. Users can switch between Default Dark (Cyber Slate), System Dynamic (follows OS dark/light mode in real time), Modern Light (clean high-contrast daylight theme), and Hacker Pro (Matrix phosphor green & deep black terminal aesthetic), selectable in Settings and via the quick Navbar switcher.',
    summaryHu:
      'Teljes körű dinamikus téma- és színkezelő rendszer. Választható az Alapértelmezett Sötét (Cyber Slate), a Rendszerkövető Dinamikus (valós időben követi az operációs rendszer világos/sötét beállítását), a Modern Világos (tiszta, nagy kontrasztú daylight téma), valamint a Dizájnos Hacker Pro (Matrix neon zöld foszfor és mélyfekete terminál világ), a Beállítások menüben és a fejléc gyorsváltójával.',
    highlights: {
      hu: [
        '🌙 Alapértelmezett Sötét (Cyber Slate): Az autentikus, ergonomikus sötét dizájn ciánkék és smaragd kiemelésekkel.',
        '🖥️ Rendszerkövető Dinamikus (System Dynamic): Automatikusan érzékeli az OS világos/sötét témáját (prefers-color-scheme) és azonnal alkalmazkodik.',
        '☀️ Modern Világos Mód (Clean Light): Tiszta, magas kontrasztú, professzionális világos megjelenés papírfehér kártyákkal és éles tipográfiával.',
        '⚡ Dizájnos Hacker Pro (Matrix Cyberpunk): Neon zöld foszfor ragyogás, mélyfekete terminál hátterek, mátrix áramkör pontrács és CRT hangulat.',
        '⚙️ Beállítások & Gyorsváltó: Kényelmesen kiválasztható a Beállítások Általános fülén, valamint 1-kattintásos gyorsváltóval a navigációs sávból.',
      ],
      en: [
        '🌙 Default Dark (Cyber Slate): Authentic ergonomic dark theme with cyber blue and emerald accents.',
        '🖥️ System Dynamic (Auto): Real-time OS color scheme tracking with instant prefers-color-scheme detection.',
        '☀️ Modern Light Mode: Clean, high-contrast daylight UI with crisp typography and subtle borders.',
        '⚡ Hacker Pro (Matrix Cyberpunk): Vivid neon phosphor green glow, pitch black terminal backdrops, and cybernetic grid aesthetic.',
        '⚙️ Settings & Quick Switcher: Selectable in General Settings with visual preview cards or via the 1-click Navbar quick toggle.',
      ],
    },
    changes: [
      {
        type: 'feature',
        module: 'CORE',
        title: 'Dynamic Theme Management Engine',
        titleHu: 'Dinamikus Téma- és Színkezelő Motor',
        description: 'Global CSS variables and theme attributes powering seamless theme transitions.',
        descriptionHu: 'Globális CSS változók és data-theme attribútumok a zökkenőmentes témaváltáshoz.',
      },
      {
        type: 'feature',
        module: 'CORE',
        title: 'Modern Light & Hacker Pro Themes',
        titleHu: 'Modern Világos és Hacker Pro Témák',
        description: 'Dedicated bespoke color schemes for high-contrast day use and cyberpunk terminal immersion.',
        descriptionHu: 'Különálló dizájn témák a nappali munkához és a hacker terminál élményhez.',
      },
    ],
  },
  {
    version: '4.3.0',
    releaseDate: '2026-08-16',
    category: 'minor',
    title: 'Classic Hex Editor & Hex Dump Studio with Interactive Educational Guide',
    titleHu: 'Klasszikus Hex Editor & Hex Dump Stúdió Interaktív Oktató Móddal',
    summary:
      'Full-fledged classic Hex Editor and Hex Dump Studio added to the CPU workspace. Features interactive step-by-step educational explanations of memory offset addressing, nibble-to-byte hexadecimal conversion, Little vs Big Endianness animations, live CPU RAM editing with Undo/Redo, clickable bitmask modifier, 6502 opcode disassembler, 8x8 sprite bitmap previewer, search & replace, and rich preset structures.',
    summaryHu:
      'Teljes értékű klasszikus Hex Editor és Hex Dump Stúdió a CPU munkakörnyezetben. Interaktív, lépésről-lépésre követhető magyarázatok a memóriacímzésről (offset + oszlop), a 4-bites nibble-ök hexadecimális összeállításáról, animált Little-Endian vs Big-Endian bájtsorrendről, élő CPU RAM szerkesztésről visszavonással/újrával, kattintható bitmaszkkal, 6502 opkód dekódolóval, 8x8-as sprite bittérkép előnézettel, kereséssel és klasszikus bináris mintákkal.',
    highlights: {
      hu: [
        '🔢 Klasszikus 16-Oszlopos Hex Dump: Offset címoszlop ($0000..), 16 hex bájt oszlop (+0..+F) és szinkronizált ASCII szöveges sáv valós idejű kurzor-összeköttetéssel.',
        '📖 Interaktív "Hogyan Működik?" Útmutató: Címkalkulátor, Fél-bájt (Nibble) kombináló, animált Little-Endian vs Big-Endian bájtsorrend és színkód magyarázat.',
        '🛠️ Élő Bájtszerkesztő & Bitmaszk: Közvetlen billentyűzetes hex/ASCII gépelés, visszavonási lánc (Undo/Redo), és kattintható 8-bites bitkapcsolók (b7..b0).',
        '🔍 Keresés & Minták: Keresés Hex és ASCII szöveg szerint, beépített oktató minták (6502 Fibonacci kód, 8x8 Space Invader sprite, C-string tábla, Buffer overflow, Mágikus fájlfejlécek).',
        '🎨 8x8 Pixel Bitmap Előnézet & Dekódoló: A kijelölt bájtokat azonnal kirajzolja retro monokróm sprite-ként vagy font-glifaként.',
      ],
      en: [
        '🔢 Classic 16-Column Hex Dump: Offset address column ($0000..), 16 hex byte columns (+0..+F) and synchronized ASCII text pane with dual-cursor tracking.',
        '📖 Interactive "How it Works?" Guide: Address calculator, Nibble combiner, animated Little-Endian vs Big-Endian byte swap, and color-code conventions.',
        '🛠️ Live Byte Editor & Bitmask: Direct in-place keyboard hex/ASCII typing, Undo/Redo history, and interactive clickable 8-bit toggles (b7..b0).',
        '🔍 Search & Educational Presets: Hex/ASCII search with match cycling, pre-loaded binary structures (6502 code, 8x8 Space Invader sprite, C-strings, Buffer overflow, Magic headers).',
        '🎨 8x8 Pixel Bitmap Preview & Decoders: Live rendered pixel sprite preview from cursor bytes and instant opcode disassembler.',
      ],
    },
    changes: [
      {
        type: 'feature',
        module: 'CPU',
        title: 'Classic Hex Editor & Hex Dump Studio',
        titleHu: 'Klasszikus Hex Editor & Hex Dump Stúdió',
        description:
          'Dedicated CPU Studio tab offering authentic 16-byte hex dump layout, live RAM editing, and bidirectional ASCII view.',
        descriptionHu:
          'Önálló CPU Stúdió fül autentikus 16-bájtos hex dump elrendezéssel, élő RAM szerkesztéssel és kétirányú ASCII nézettel.',
      },
      {
        type: 'feature',
        module: 'CPU',
        title: 'Interactive Hex Dump Educational Guide & Nibble Combiner',
        titleHu: 'Interaktív Hex Dump Oktató Kalauz & Nibble Kombináló',
        description:
          'Animated step-by-step visual lessons explaining address math, base-16 conversions, and Little-Endian vs Big-Endian byte ordering.',
        descriptionHu:
          'Animált, interaktív bemutatók a címszámításról, a 16-os számrendszerről és a Little-Endian vs Big-Endian bájtsorrendről.',
      },
      {
        type: 'feature',
        module: 'CPU',
        title: 'Memory Module DUMP View Integration',
        titleHu: 'Memória Modul DUMP Nézet Integráció',
        description:
          'Added instant side-by-side DUMP mode directly into the 8-bit modular board RAM memory module.',
        descriptionHu:
          'A moduláris 8-bites alaplapi memóriamodulba beépített azonnali DUMP nézet szinkron ASCII szövegoszloppal.',
      },
    ],
  },
  {
    version: '4.2.0',
    releaseDate: '2026-08-16',
    category: 'minor',
    title: 'Commodore 64 Turbo Cartridge & Hardware Accelerator Studio',
    titleHu: 'Commodore 64 Klasszikus Turbó Kártya & Hardvergyorsító Stúdió',
    summary:
      'Interactive deep-dive simulation of legendary C64 expansion port turbo cartridges: The Final Cartridge III, Action Replay MK VI, Epyx Fastload, and CMD SuperCPU 20MHz. Features interactive fastloader protocol timing comparisons (2-bit IEC burst vs stock CIA bit-banging), hardware Freeze button (NMI interrupt), live POKE & cheat injector, sprite ripper, machine monitor, and DOS wedge commands.',
    summaryHu:
      'A legendás C64 bővítőportos turbó kártyák interaktív szimulációja és technikai bemutatója: The Final Cartridge III, Action Replay MK VI, Epyx Fastload és CMD SuperCPU 20MHz. Interaktív gyorstöltő protokoll összehasonlító (2-bites IEC burst vs gyári CIA bit-banging), hardveres Freeze gomb (NMI megszakítás), élő POKE és csaláskód injektor, sprite ripper, gépi kódú monitor és azonnali DOS parancsok.',
    highlights: {
      hu: [
        '⚡ 4 Klasszikus Turbó Modell: The Final Cartridge III (GUI Desktop, 15x Fastload), Action Replay MK VI (25x Fastload, Sprite Ripper, Freezer), Epyx Fastload (10x ROM), CMD SuperCPU 20MHz (W65C816S 20MHz processzor).',
        '⏱️ Interaktív Protokoll Összehasonlító: Vizualizált 2-bites CLK/DATA hardveres burst átvitel vs gyári szoftveres CIA handshaking bit-banging időzítés.',
        '🛑 Hardveres FREEZE Gomb (NMI Megszakítás): Azonnali programfagyasztás játék közben, állapotmentés (snapshot), memóriaböngésző és visszatérés.',
        '🎮 Beépített Csalás & POKE Injektor: Legendás örökélet és végtelen lőszer kódok (pl. The Great Giana Sisters, Commando, Boulder Dash, Turrican II).',
        '🚀 Valós Idejű Be/Kikapcsolás: A C64 szimulátorban érezhető a lemeztöltési sebességkülönbség és a SuperCPU 20x-os végrehajtási sebessége.',
      ],
      en: [
        '⚡ 4 Classic Turbo Models: The Final Cartridge III (GUI Desktop, 15x Fastload), Action Replay MK VI (25x Fastload, Sprite Ripper, Freezer), Epyx Fastload (10x ROM), CMD SuperCPU 20MHz (W65C816S 20MHz CPU).',
        '⏱️ Interactive Protocol Timing Comparison: Visualized 2-bit CLK/DATA hardware burst vs stock CIA bit-banging serial handshaking.',
        '🛑 Hardware FREEZE Button (NMI Interrupt): Instant program freeze during execution, snapshot save/restore, live machine monitor, and resume.',
        '🎮 Integrated Cheat & POKE Injector: Pre-loaded legendary cheats (The Great Giana Sisters, Commando, Boulder Dash, Turrican II).',
        '🚀 Real-time Toggle: Experience the fastload disk transfer boost and SuperCPU 20x execution acceleration in the live simulator.',
      ],
    },
    changes: [
      {
        type: 'feature',
        module: 'C64',
        title: 'Classic Turbo Cartridge Expansion Lab',
        titleHu: 'Klasszikus Turbó Kártya Bővítő Laboratórium',
        description:
          'Deep architectural exploration and live simulation of C64 expansion port turbo cartridges with interactive hardware toggles and telemetry.',
        descriptionHu:
          'A C64 bővítőportos turbó kártyák mélyreható technikai és működési bemutatója élő ki/bekapcsolható szimulációval és telemetriával.',
      },
      {
        type: 'feature',
        module: 'C64',
        title: 'Hardware Freeze (NMI) & State Snapshot System',
        titleHu: 'Hardveres Freeze (NMI) & Állapotmentő Rendszer',
        description:
          'Simulates NMI line pull-down to freeze execution, inspect live memory/sprites, inject POKEs, and save snapshot PRG files to floppy.',
        descriptionHu:
          'Az NMI vonal lehúzásának szimulációja: programmegállítás, élő memóriaböngészés, POKE injektálás és floppy snapshot mentés.',
      },
      {
        type: 'feature',
        module: 'C64',
        title: 'IEC Protocol Speed Benchmark & Timing Visualizer',
        titleHu: 'IEC Protokoll Sebesség Benchmark & Időzítés Vizualizáló',
        description:
          'Step-by-step oscilloscope-like signal timing comparison between stock 400 B/s serial transfer and 10 KB/s 2-bit burst fastloading.',
        descriptionHu:
          'Oszcilloszkóp jellegű időzítés és fázis összehasonlítás a gyári 400 B/s és a turbó 10 KB/s 2-bites burst IEC átvitel között.',
      },
    ],
  },
  {
    version: '4.1.0',
    releaseDate: '2026-08-16',
    category: 'minor',
    title: 'Commodore 64 Architecture Studio & Dedicated IC Schematic Explorer',
    titleHu: 'Commodore 64 Belső Architektúra & Cél IC Alaplapi Séma Stúdió',
    summary:
      'Deep architectural visualization of the Commodore 64 motherboard and custom ICs: MOS 6510 CPU, MOS 6569 VIC-II, MOS 6581 SID, MOS 82S100 PLA, and dual MOS 6526 CIAs. Includes real-time dual-phase (Φ1/Φ2) bus clock interleaving, 6 live animated hardware scenarios, dynamic PLA bank switching, and complete pinout & register datasheets.',
    summaryHu:
      'A Commodore 64 alaplap és cél IC-k (MOS 6510 CPU, MOS 6569 VIC-II, MOS 6581 SID, MOS 82S100 PLA és 2x MOS 6526 CIA) mélyreható architektúrális vizualizációja. Kétfázisú (Φ1/Φ2) busz órajel-megosztás, 6 élőben animált működési szcenárió (Bad Line DMA, billentyűzet mátrix, SID analóg szűrő, 1541 IEC átvitel, raszter IRQ), valós idejű PLA bankváltás és teljes lábkiosztás & regisztertérkép adatlapok.',
    highlights: {
      hu: [
        '🗺️ Interaktív Alaplapi Séma (Motherboard Schematic) színkódolt Address (A0..A15), Data (D0..D7) és Control (R/W, Φ1, Φ2, IRQ, BA) buszvonalakkal.',
        '⚡ Kétfázisú Órajel-megosztás (Φ1: VIC-II videó fázis, Φ2: 6510 CPU gépi kód fázis) kézi és automatikus léptetéssel.',
        '🎬 6 Animált Működési Szcenárió: Dual-Phase Interleaving, Bad Line DMA Steal, CIA 1 Mátrix Pásztázás, SID Hangszintézis, 1541 IEC átvitel, Raszter IRQ.',
        '🧩 Dinamikus PLA Memóriatérkép Konfigurátor valós idejű LORAM, HIRAM, CHAREN, /GAME, /EXROM bemenetekkel és 64KB térképpel.',
        '🔍 Részletes Cél IC Adatlapok: Lábkiosztás (DIP-40, DIP-28), belső funkcionális blokkok, regisztertérkép és történelmi háttér.',
      ],
      en: [
        '🗺️ Interactive Motherboard Schematic with color-coded Address (A0..A15), Data (D0..D7), and Control (R/W, Φ1, Φ2, IRQ, BA) bus lines.',
        '⚡ Dual-Phase Clock Interleaving (Φ1: VIC-II video phase, Φ2: 6510 CPU instruction phase) with manual and auto-run modes.',
        '🎬 6 Animated Hardware Scenarios: Dual-Phase Interleaving, Bad Line DMA Steal, CIA 1 Matrix Scan, SID Synthesis, 1541 IEC Transfer, Raster IRQ.',
        '🧩 Dynamic PLA Memory Mapping Configurator with live LORAM, HIRAM, CHAREN, /GAME, /EXROM inputs and 64KB visual bar.',
        '🔍 Detailed Custom IC Datasheets: DIP pinouts, internal functional blocks, memory-mapped registers, and historical trivia.',
      ],
    },
    changes: [
      {
        type: 'feature',
        module: 'C64',
        title: 'Interactive Motherboard Circuit Board & Bus Topology',
        titleHu: 'Interaktív C64 Alaplapi Áramkör és Busz Topológia',
        description:
          'Visualizes all dedicated ICs and memory chips on the motherboard, displaying bus activity and cycle-accurate phase arbitration.',
        descriptionHu:
          'Megjeleníti az összes dedikált cél IC-t és memóriát az alaplapon, vizualizálva a busz aktivitást és az órajel fázisokat.',
      },
      {
        type: 'feature',
        module: 'C64',
        title: '6 Animated Operational Scenarios with Step Player',
        titleHu: '6 Animált Működési Szcenárió Lépésenkénti Lejátszóval',
        description:
          'Step through complex C64 hardware interactions such as Bad Line DMA steals, IEC serial handshakes, and SID filtering.',
        descriptionHu:
          'Lépésről lépésre végigkövethetők a komplex C64 hardverfolyamatok: Bad Line DMA CPU-megállítás, IEC soros adatátvitel és SID analóg szűrés.',
      },
      {
        type: 'feature',
        module: 'C64',
        title: 'PLA Dynamic Memory Banking Engine',
        titleHu: 'PLA Dinamikus Memóriabank Váltó Motor',
        description:
          'Simulates the MOS 82S100 PLA boolean logic matrix according to CPU port $01 and cartridge states.',
        descriptionHu:
          'Szimulálja a MOS 82S100 PLA logikai hálózatát a CPU $01-es portjának és a bővítőkártya vonalainak megfelelően.',
      },
    ],
  },
  {
    version: '4.0.0',
    releaseDate: '2026-08-16',
    category: 'major',
    title: 'Major Milestone: 74HC595 SIPO Shift Register Studio, Integrated Help & Version Tracking',
    titleHu: 'Főverzió Ugrás: 74HC595 SIPO Shift-Regiszter Stúdió, Beépített Súgó & Verziókövetés',
    summary:
      'Full-featured 74HC595 8-bit SIPO Shift Register emulator with internal 2-stage flip-flop & latch architecture, infinite daisy-chain cascading (QH\' to DS), /OE hardware PWM dimming, multi-output visual loads (LED strip, 7-Segment, 8-channel relays, bargraph), timing waveform viewer, visual block programming, and complete integrated knowledge base & changelog.',
    summaryHu:
      'Teljes értékű 74HC595 8-bites SIPO shift-regiszter emulátor 2-szintes belső flip-flop és retesz (latch) architektúrával, végtelen kaszkádolással (QH\' -> DS), /OE hardveres PWM fényerőszabályzással, több kimeneti terheléssel (LED-sor, 7-szegmens, 8-csatornás relék, bargraph), időzítési hullámforma analizátorral, blokk-programozással és átfogó interaktív súgóval & verziókövetéssel.',
    highlights: {
      hu: [
        '🕹️ 74HC595 8-bites SIPO Shift-Regiszter Studio interaktív belső D-Flip-Flop és tároló retesz (Storage Latch) szintű szimulációval.',
        '🔗 2x 74HC595 Kaszkádolás (Daisy-Chain): 16 kimenet vezérlése mindössze 3 MCU lábbal (DS, SH_CP, ST_CP) a QH\' túlcsorduló kimeneten keresztül.',
        '💡 4 Vizuális Kimeneti Terhelés: Színes LED-sor, 7-szegmenses kijelző, 8-csatornás ipari relépanel, analóg bargraph kijelző.',
        '📈 Valós idejű logikai analizátor és hullámforma monitor (DS, SH_CP, ST_CP, /OE, QH\') él-detektálással.',
        '🧩 Új "Shift-Regiszter (74595)" kategória a vizuális blokk-programozóban (McuBlockStudio) kész minta algoritmusokkal (Knight Rider futófény, 7-szegmenses számláló, 16-bites kaszkád).',
        '📖 Átfogó, kereshető beépített Súgó & Kézikönyv rendszer (több mint 15 részletes témakörrel és kódrészletekkel).',
        '📜 Teljes körű interaktív verziókövetés és changelog szűrőkkel és letöltési lehetőséggel.',
      ],
      en: [
        '🕹️ 74HC595 8-bit SIPO Shift Register Studio with interactive 2-stage D-Flip-Flop & Storage Latch internal simulation.',
        '🔗 Dual 74HC595 Daisy-Chaining: Control 16 outputs using only 3 MCU pins via the QH\' serial overflow pin.',
        '💡 4 Visual Output Loads: Color-customizable LED bar, 7-Segment display, 8-channel relay module, analog bargraph.',
        '📈 Real-time Logic Analyzer & Timing Waveform monitor (DS, SH_CP, ST_CP, /OE, QH\') with edge trigger markers.',
        '🧩 New "Shift Register (74595)" category in Visual Block Studio with presets (Knight Rider scanner, 7-segment counter, 16-bit cascade).',
        '📖 Comprehensive, searchable interactive Help & Knowledge Base system with 15+ in-depth topics and code snippets.',
        '📜 Full semantic version history and changelog explorer with tags, filters, and export options.',
      ],
    },
    changes: [
      {
        type: 'feature',
        module: '74HC595',
        title: '74HC595 2-Stage Shift Register Core Engine',
        titleHu: '74HC595 2-Szintű Shift-Regiszter Mag és Belső Architektúra',
        description:
          'Simulates exact behavioral state of 8 shift stages (S0..S7) on SH_CP rising edges and 8 latch stages (L0..L7) on ST_CP rising edges, preventing output glitches during serialization.',
        descriptionHu:
          'Pontos belső állapotgép a 8 léptető flip-flophoz (S0..S7) SH_CP felfutó élre és a 8 kimeneti reteszhez (L0..L7) ST_CP felfutó élre, biztosítva a zavarmentes léptetést.',
      },
      {
        type: 'feature',
        module: '74HC595',
        title: 'Dual 74HC595 Cascade & Daisy-Chain Mode',
        titleHu: 'Kettős 74HC595 Kaszkádolás és Láncolás (QH\' -> DS)',
        description:
          'Connects QH\' serial overflow of Chip 1 into the DS input of Chip 2 to stream 16 bits with automatic synchronous latching.',
        descriptionHu:
          'Az 1. IC QH\' túlcsorduló kimenetét a 2. IC DS bemenetére fűzi, így 16 bit írható ki 3 MCU lábbal és egyetlen retesz impulzussal.',
      },
      {
        type: 'feature',
        module: '74HC595',
        title: '/OE Hardware PWM Dimming & Tri-State High-Z',
        titleHu: '/OE Hardveres PWM Fényerőszabályzás és 3-Állapotú Lebegés',
        description:
          'Simulates active-LOW Output Enable pin with duty cycle modulation for smooth LED/display dimming and High-Z disconnection.',
        descriptionHu:
          'Aktív-ALACSONY /OE engedélyező láb szimuláció kitöltési tényező modulációval a kimenetek fényerőszabályzásához és lebegtetéséhez.',
      },
      {
        type: 'feature',
        module: 'BLOCKS',
        title: '74HC595 Visual Blocks & C++ / AVR Code Generator',
        titleHu: '74HC595 Vizuális Blokkok és C++ / AVR Kódgenerálás',
        description:
          'Introduced SHIFT595_CONFIG, SHIFT595_WRITE_BYTE, SHIFT595_CASCADE_16BIT, SHIFT595_SEVENSEG_DIGIT, and SHIFT595_OE_PWM blocks.',
        descriptionHu:
          'Új blokkok: lábkiosztás inicializálás, bájt kiírás automatikus reteszeléssel, 16-bites kaszkádolás, 7-szegmens dekódolás és PWM fényerő.',
      },
      {
        type: 'feature',
        module: 'CORE',
        title: 'Integrated Help & Knowledge Base Modal',
        titleHu: 'Integrált Kereshető Súgó és Kézikönyv Rendszer',
        description:
          'Searchable interactive documentation modal covering all aspects of CPU architectures, MMIO peripherals, ADC, PWM, 74595, C64, and block coding.',
        descriptionHu:
          'Kereshető, részletes interaktív kézikönyv kódpéldákkal, lábkiosztási diagramokkal és fogalomtárral minden szimulációs modulhoz.',
      },
      {
        type: 'feature',
        module: 'CORE',
        title: 'Interactive Version History & Changelog Tracker',
        titleHu: 'Interaktív Verziókövető és Kiadási Történet',
        description:
          'Complete audit trail of all simulator versions from v1.0.0 to v4.0.0 with category filtering, highlights, and technical breakdown.',
        descriptionHu:
          'Részletes verziótörténet v1.0.0-tól v4.0.0-ig, modul- és kategória szűrőkkel, kiemelésekkel és exportálási opcióval.',
      },
    ],
    technicalNotes: {
      hu: 'A 74HC595 szimulátor mikro-fázisú állapotgéppel dolgozik. Az SH_CP (11. láb) és ST_CP (12. láb) felfutó élei függetlenül vezérlik a belső shift- és tárolóregisztereket. A hullámforma analizátor mintavételezése szinkronizálva van az MCU órajelével.',
      en: 'The 74HC595 engine uses an asynchronous event & clock edge model. SH_CP (pin 11) and ST_CP (pin 12) independent rising edges trigger shift and latch registers respectively without interference.',
    },
  },
  {
    version: '3.9.0',
    releaseDate: '2026-08-15',
    category: 'minor',
    title: 'Hardware Fast PWM & Multi-Timer Studio (Timer0/1/2, Gamma 2.2)',
    titleHu: 'Hardveres Fast PWM & Többcsatornás Időzítő Stúdió (Timer0/1/2, Gamma 2.2)',
    summary:
      'Dedicated AVR Timer0, Timer1, and Timer2 Hardware PWM Studio with prescalers (1..1024), Fast PWM and Phase-Correct PWM modes, OCR register compare match interrupts, duty cycle calculators, and Gamma 2.2 optical breathing LED simulator.',
    summaryHu:
      'Önálló AVR Timer0, Timer1 és Timer2 hardveres PWM stúdió előosztókkal (1..1024), Fast PWM és Phase-Correct PWM üzemmódokkal, OCR regiszter komparátorral, kitöltési tényező kalkulátorral és Gamma 2.2 optikai lélegeztető LED szimulátorral.',
    highlights: {
      hu: [
        '⏱️ Teljes körű AVR Timer0 (8-bit), Timer1 (16-bit), Timer2 (8-bit aszinkron) szimuláció.',
        '⚡ Fast PWM (fűrészfog) és Phase Correct PWM (háromszög) hullámforma generálás.',
        '💡 Optikai fényerő korrekció emberi szem érzékeléshez (Gamma 2.2 exponenciális görbe).',
        '📊 Interaktív OCR komparátor és frekvencia kalkulátor ($f_{PWM} = f_{clk} / (N \cdot TOP)$).',
      ],
      en: [
        '⏱️ Complete AVR Timer0 (8-bit), Timer1 (16-bit), and Timer2 (8-bit) simulation.',
        '⚡ Fast PWM (sawtooth) and Phase-Correct PWM (triangle) waveform generation.',
        '💡 Optical brightness human eye response correction with exponential Gamma 2.2 curve.',
        '📊 Interactive OCR compare match and frequency math calculator.',
      ],
    },
    changes: [
      {
        type: 'feature',
        module: 'PWM',
        title: 'Interactive PWM Studio with Realtime Oscilloscope',
        titleHu: 'Interaktív PWM Stúdió Valós Idejű Oszcilloszkóppal',
        description: 'Visual oscilloscope displaying counter ramp, OCR threshold, and output pin toggling.',
        descriptionHu: 'Vizuális oszcilloszkóp a számláló rámpa, OCR küszöb és kimeneti jel megjelenítésével.',
      },
    ],
  },
  {
    version: '3.8.0',
    releaseDate: '2026-08-14',
    category: 'minor',
    title: 'Successive Approximation Register (SAR) ADC Studio & Nyquist Analyzer',
    titleHu: 'Szukcesszív Approximációs (SAR) ADC Stúdió & Nyquist Analizátor',
    summary:
      'Step-by-step 8/10-bit SAR ADC engine with Sample & Hold capacitor charging, R-2R ladder DAC, comparator feedback loop, potentiometer voltage divider, and sampling frequency aliasing visualizer.',
    summaryHu:
      'Lépésenkénti 8/10-bites SAR ADC motor mintavevő-tartó (Sample & Hold) kondenzátor töltéssel, R-2R létra DAC-cal, komparátor visszacsatolással, potméter feszültségosztóval és mintavételezési aliasing vizualizációval.',
    highlights: {
      hu: [
        '⚡ Lépésenkénti bináris felező keresés (Binary Search SAR algoritmus) vizualizáció.',
        '🧪 Mintavevő-tartó áramkör $RC$ töltési időállandóval és mintavételi apertúrával.',
        '📉 Nyquist-Shannon mintavételi tétel és Aliasing frekvencia-tükröződés analízis.',
      ],
      en: [
        '⚡ Step-by-step Binary Search SAR algorithm visualization.',
        '🧪 Sample-and-Hold circuit with RC charging time constant and aperture simulation.',
        '📉 Nyquist-Shannon theorem and Aliasing frequency foldback analysis.',
      ],
    },
    changes: [
      {
        type: 'feature',
        module: 'ADC',
        title: 'SAR ADC Step-by-Step Converter and Clock Sequencer',
        titleHu: 'SAR ADC Lépésenkénti Átalakító és Órajel Szekvenszer',
        description: 'Visual bit-by-bit resolution from MSB to LSB with DAC feedback.',
        descriptionHu: 'Vizuális bitenkénti közelítés a legfelső bittől a legalsóig DAC visszacsatolással.',
      },
    ],
  },
  {
    version: '3.5.0',
    releaseDate: '2026-08-10',
    category: 'minor',
    title: 'I/O Peripherals & Memory-Mapped I/O (MMIO) Studio with 74LS138 Decoder',
    titleHu: 'I/O Periféria & Memóriatérkép (MMIO) Stúdió 74LS138 Címdekóderrel',
    summary:
      'Complete hardware MMIO workstation with 74LS138 3-to-8 line decoder, address aliasing/foldback visualizer, tri-state push buttons, dual 7-segment BCD display, 4x4 matrix keypad, 16x2 HD44780 LCD, and 8-bit DAC/ADC.',
    summaryHu:
      'Teljes körű hardveres MMIO munkaállomás 74LS138 3-ból 8-as címdekóderrel, cím-aliasing és foldback tükröződés elemzővel, tri-state nyomógombokkal, kettős 7-szegmenses BCD kijelzővel, 4x4 mátrix billentyűzettel, 16x2 HD44780 LCD-vel és 8-bites DAC/ADC-vel.',
    highlights: {
      hu: [
        '🔌 74LS138 címdekóder vizualizáció aktív-alacsony chip select kimenetekkel (/Y0../Y7).',
        '🗺️ Memóriatérkép aliasing és foldback tükröződés elemző (nem lefedett címvonalak hatása).',
        '📟 16x2 HD44780 karakteres LCD kijelző parancs- és adatregiszter emulációval.',
        '⌨️ 4x4 Mátrix tasztatúra sor-oszlop pásztázással (Row-Column Scan).',
      ],
      en: [
        '🔌 74LS138 address decoder visualization with active-low chip select outputs.',
        '🗺️ Memory map foldback & aliasing analyzer showing partial address decoding effects.',
        '📟 16x2 HD44780 character LCD display with instruction & data registers.',
        '⌨️ 4x4 Matrix keypad with row-column scanning.',
      ],
    },
    changes: [
      {
        type: 'feature',
        module: 'MMIO',
        title: '74LS138 Address Decoder & Foldback Visualizer',
        titleHu: '74LS138 Címdekóder & Foldback Vizualizáció',
        description: 'Real-time address line decoding with partial decoding warning indicators.',
        descriptionHu: 'Valós idejű címvonal dekódolás részleges dekódolási figyelmeztetésekkel.',
      },
    ],
  },
  {
    version: '3.0.0',
    releaseDate: '2026-08-01',
    category: 'major',
    title: 'Multicore 8-Bit CPU Architecture & Commodore 64 Studio',
    titleHu: 'Többmagos 8-Bites CPU Architektúra & Commodore 64 Stúdió',
    summary:
      'Major expansion adding 4 distinct CPU cores (Edu-8, MOS 6502, Zilog Z80, Ben Eater SAP-1) and a dedicated Commodore 64 Studio with BASIC V2, VIC-II graphics, SID 6581 sound synthesizer, and sprite editor.',
    summaryHu:
      'Főverzió 4 független CPU maggal (Edu-8, MOS 6502, Zilog Z80, Ben Eater SAP-1) és egy önálló Commodore 64 Stúdióval (BASIC V2, VIC-II grafika, SID 6581 szintetizátor és sprite szerkesztő).',
    highlights: {
      hu: [
        '🧠 4 CPU mag: Edu-8 RISC, MOS 6502, Zilog Z80, Ben Eater SAP-1.',
        '🕹️ Commodore 64 BASIC V2 interpreter és virtuális floppy/kazetta kezelés.',
        '🎨 VIC-II hardveres 24x21 Sprite tervező és PETSCII képernyő szerkesztő.',
        '🎵 SID 6581 3-csatornás analóg chiptune hangszintetizátor (ADSR, szűrők).',
      ],
      en: [
        '🧠 4 CPU Cores: Edu-8 RISC, MOS 6502, Zilog Z80, Ben Eater SAP-1.',
        '🕹️ Commodore 64 BASIC V2 interpreter with virtual floppy/tape storage.',
        '🎨 VIC-II hardware 24x21 Sprite designer and PETSCII screen editor.',
        '🎵 SID 6581 3-voice chiptune sound synthesizer with ADSR envelopes and filters.',
      ],
    },
    changes: [
      {
        type: 'architecture',
        module: 'CPU',
        title: 'Modular Multi-Core Execution Engine',
        titleHu: 'Moduláris Többmagos Végrehajtó Motor',
        description: 'Abstracted instruction set architectures and micro-operation state machines.',
        descriptionHu: 'Absztrahált utasításkészletek és mikroműveleti állapotgépek.',
      },
      {
        type: 'feature',
        module: 'C64',
        title: 'Commodore 64 Complete Retro Workstation',
        titleHu: 'Teljes Értékű Commodore 64 Retro Munkaállomás',
        description: 'Integrated 6510 CPU, 64KB RAM, VIC-II, SID, and BASIC V2 terminal.',
        descriptionHu: 'Integrált 6510 CPU, 64KB RAM, VIC-II, SID és BASIC V2 terminál.',
      },
    ],
  },
  {
    version: '2.5.0',
    releaseDate: '2026-07-20',
    category: 'minor',
    title: 'RISC-V 5-Stage Pipeline, Cache Hierarchy & Microcode Studio',
    titleHu: 'RISC-V 5-Fokozatú Futószalag, Gyorsítótár (Cache) & Mikrokód Stúdió',
    summary:
      'Introduced deep computer architecture exploration tools: 5-stage RISC-V pipeline with data hazard forwarding & branch prediction stalls, multi-level cache simulator (Direct mapped vs N-way set associative), and custom microcode ROM editor.',
    summaryHu:
      'Mély számítógép-architektúra modulok: 5-fokozatú RISC-V futószalag adatütközés előrecsatolással (forwarding) és elágazás-előrejelzési buborékokkal (stalls), többszintű cache szimulátor (Direct vs Set-Associative) és mikrokód ROM szerkesztő.',
    highlights: {
      hu: [
        '🔄 5-fokozatú RISC-V Pipeline (IF, ID, EX, MEM, WB) interaktív regiszterekkel.',
        '⚡ Adathazard előrecsatolás (Forwarding Unit) és elágazás-vesztés szimuláció.',
        '💾 L1/L2 Gyorsítótár (Cache) szimuláció találati/tévesztési (Hit/Miss) arányokkal és LRU cserealgoritmussal.',
      ],
      en: [
        '🔄 5-Stage RISC-V Pipeline (IF, ID, EX, MEM, WB) with interactive pipeline registers.',
        '⚡ Data hazard forwarding unit and branch miss penalty simulation.',
        '💾 L1/L2 Cache simulator with Hit/Miss rate counters and LRU replacement policies.',
      ],
    },
    changes: [
      {
        type: 'feature',
        module: 'PIPELINE',
        title: 'RISC-V Pipeline Visualizer',
        titleHu: 'RISC-V Futószalag Vizualizáló',
        description: 'Shows per-cycle instruction progression through 5 pipeline stages.',
        descriptionHu: 'Ciklusról ciklusra mutatja az utasítások haladását az 5 fokozaton keresztül.',
      },
    ],
  },
  {
    version: '2.0.0',
    releaseDate: '2026-07-05',
    category: 'major',
    title: 'Modular Virtual Circuit Board & Logic Analyzer',
    titleHu: 'Moduláris Virtuális Áramköri Lap & Logikai Analizátor',
    summary:
      'Redesigned user interface with drag-and-drop circuit board layout, customizable modular panels, real-time bus interconnect wire animation, logic analyzer timing diagrams, and time-travel debugging.',
    summaryHu:
      'Újratervezett felület fogd-és-vidd moduláris elrendezéssel, testreszabható panelekkel, valós idejű busz huzal animációval, logikai analizátor idődiagrammal és időutazó visszalépéssel.',
    highlights: {
      hu: [
        '🎛️ Moduláris, átrendezhető áramköri lap elrendezés (Registers, ALU, Memory, Bus, I/O).',
        '📊 Valós idejű digitális logikai analizátor (Logic Analyzer) jelidőzítéssel.',
        '⏳ Időutazó hibakereső (Time-Travel Debugging): korlátlan visszalépés korábbi állapotokba.',
      ],
      en: [
        '🎛️ Modular, customizable circuit board layout with collapsible draggable cards.',
        '📊 Real-time digital logic analyzer timing diagram.',
        '⏳ Time-travel backward step debugging.',
      ],
    },
    changes: [
      {
        type: 'architecture',
        module: 'CORE',
        title: 'Modular Dashboard Layout Engine',
        titleHu: 'Moduláris Műszerfal Elrendezés Kezelő',
        description: 'Enables custom layouts, presets, and toggleable hardware cards.',
        descriptionHu: 'Egyéni elrendezések, presetet és ki-be kapcsolható kártyák.',
      },
    ],
  },
  {
    version: '1.0.0',
    releaseDate: '2026-06-01',
    category: 'major',
    title: 'Initial Release: Interactive Edu-8 Educational CPU Simulator',
    titleHu: 'Kezdő Kiadás: Interaktív Edu-8 Oktató CPU Szimulátor',
    summary:
      'First public release of the educational 8-bit RISC CPU emulator featuring assembly compiler, 256-byte RAM, ALU status flags, micro-step clock sequencer, and step-by-step visual execution.',
    summaryHu:
      'Első nyilvános kiadás: oktatási 8-bites RISC CPU emulátor assembly fordítóval, 256 bájt RAM-mal, ALU állapotjelzőkkel, mikrolépés órajel szekvenszerrel és lépésenkénti vizuális végrehajtással.',
    highlights: {
      hu: [
        '🚀 8-bites Edu-8 RISC CPU emuláció (8 regiszter, 8 állapotjelző flag).',
        '📝 Kétmenetes beépített Assembly fordító szintaxis-ellenőrzéssel és hibaüzenetekkel.',
        '🔄 Mikroműveleti szekvenszer (FETCH, DECODE, EXECUTE, WRITEBACK).',
      ],
      en: [
        '🚀 8-bit Edu-8 RISC CPU emulation (8 registers, 8 status flags).',
        '📝 Built-in two-pass Assembly assembler with real-time error diagnostics.',
        '🔄 Micro-operation clock sequencer (FETCH, DECODE, EXECUTE, WRITEBACK).',
      ],
    },
    changes: [
      {
        type: 'feature',
        module: 'CPU',
        title: 'Edu-8 CPU Core and Instruction Assembler',
        titleHu: 'Edu-8 CPU Mag és Assembly Fordító',
        description: 'Core 8-bit CPU engine with Von Neumann architecture.',
        descriptionHu: '8-bites CPU mag Von Neumann architektúrával.',
      },
    ],
  },
];
