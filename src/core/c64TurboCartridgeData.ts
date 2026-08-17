import {
  TurboCartridgeModel,
  TurboCartridgeType,
  TurboCheatPreset,
  TurboProtocolComparison,
} from '../types/c64TurboCartridge';

export const TURBO_CARTRIDGE_MODELS: Record<TurboCartridgeType, TurboCartridgeModel> = {
  FINAL_CARTRIDGE_3: {
    id: 'FINAL_CARTRIDGE_3',
    name: 'The Final Cartridge III',
    nameHu: 'The Final Cartridge III (FC3)',
    manufacturer: 'Riska B.V. Home Software (Hollandia)',
    year: 1987,
    romSizeKb: 64,
    cpuSpeedMhz: 1.0,
    fastloadSpeedFactor: 15,
    description:
      'The definitive Dutch utility cartridge featuring a GUI desktop, 15x fastloader, freezer menu, BASIC extensions, and Centronics printer spooler.',
    descriptionHu:
      'A legendás holland segédprogram-kártya WIMP grafikus asztallal (egér/botkormány vezérlés), 15x-ös gyorstöltővel, beépített Freeze menüvel, DOS gyorsbillentyűkkel és BASIC bővítményekkel.',
    hardwareFeatures: [
      '64 KB Bank-switched ROM (4x 16KB banks mapped to $8000-$BFFF or $E000-$FFFF)',
      'Hardware Freeze Button tied to CPU /NMI line',
      'Hardware Reset button with Cold/Warm restart selection',
      'Automatic Desktop GUI boot with drop-down menus & windows',
      'Instant Function Key shortcuts: F1=LIST, F3=RUN, F5=LOAD, F7=DIRECTORY',
      'Built-in Fast Centronics parallel printer buffer',
    ],
    hardwareFeaturesHu: [
      '64 KB Bankváltós ROM (4x 16KB bank a $8000-$BFFF vagy $E000-$FFFF címekre)',
      'Hardveres Freeze gomb a CPU /NMI (Non-Maskable Interrupt) vonalára kötve',
      'Hardveres Reset gomb Hideg / Meleg újraindítás választással',
      'Automatikus grafikus asztal (Desktop GUI) ablakokkal és legördülő menükkel',
      'Azonnali funkciógomb gyorsparancsok: F1=LIST, F3=RUN, F5=LOAD, F7=DIRECTORY',
      'Centronics párhuzamos nyomtató gyorsító és képernyőmentő',
    ],
    fastloadTechnology:
      'Injects a custom 2-bit parallel transmission kernel into the 1541 floppy RAM at $0300. Transmits 2 bits per clock cycle using IEC CLK & DATA lines simultaneously.',
    fastloadTechnologyHu:
      'Egy egyedi 2-bites párhuzamos átviteli gépi kódú kernelt tölt be a 1541 floppy belső RAM-jába ($0300). Ciklusonként 2 bitet visz át egyszerre az IEC CLK és DATA vonalakon, kikerülve a lassú CIA szoftveres várakozást.',
    freezeFeatures: [
      'Full 64KB RAM Snapshot saving to 1541 disk in 10 seconds',
      'Built-in Machine Code Monitor / Disassembler ($0000-$FFFF)',
      'Dynamic Sprite Killer / Sprite Ripper with multi-color editor',
      'Audio & SID voice muting / waveform monitor',
      'Fast Disk Utilities (format in 10 sec, backup, copy)',
    ],
    freezeFeaturesHu: [
      'Teljes 64KB RAM állapotmentés (Freeze Backup) floppyra 10 másodperc alatt',
      'Beépített Gépi Kódú Monitor és Disassembler ($0000-$FFFF)',
      'Sprite Ripper és Sprite Killer (játékok grafikai elemeinek kimentése)',
      'SID hangcsatorna némítás és zene monitorozás',
      'Gyorstöltő lemezkezelő (10 másodperces lemezformázás, másolás)',
    ],
    bezelColor: '#1e3a8a',
    badgeColor: '#3b82f6',
  },

  ACTION_REPLAY_6: {
    id: 'ACTION_REPLAY_6',
    name: 'Action Replay MK VI',
    nameHu: 'Action Replay MK VI Professional',
    manufacturer: 'Datel Electronics (UK)',
    year: 1989,
    romSizeKb: 32,
    ramSizeKb: 8,
    cpuSpeedMhz: 1.0,
    fastloadSpeedFactor: 25,
    description:
      'The ultimate hacking and cheat cartridge for the Commodore 64. World-renowned for its Poke Finder, infinite lives trainers, sprite grabber, and lightning-fast 25x loader.',
    descriptionHu:
      'A legnépszerűbb C64 hacker- és csalókártya. Híres a beépített Poke Finder (végtelen élet kereső) funkciójáról, 25x-ös ultra gyorstöltőjéről, Sprite és Zene kimentőjéről.',
    hardwareFeatures: [
      '32 KB ROM + 8 KB On-board static RAM for frozen state workspace',
      'Dual push-buttons: FREEZE and RESET on top edge',
      'Hardware Poke Finder to locate lives/ammo addresses in RAM during gameplay',
      'Ultra Fastloader (loads 202 blocks in under 5 seconds)',
      'Sprite Extractor with direct 24x21 bitmap viewer',
      'Sound Ripper to isolate SID music and sound effects into standalone PRG',
    ],
    hardwareFeaturesHu: [
      '32 KB ROM + 8 KB beépített statikus RAM a fagyasztott állapot munkafolyamataihoz',
      'Kettős nyomógomb: FREEZE és RESET a kártya felső élén',
      'Hardveres Poke Finder (élet- és lőszerkereső a játék futása közben)',
      'Ultra Fastloader (202 blokkos játék betöltése kevesebb mint 5 másodperc alatt)',
      'Sprite Ripper közvetlen 24x21-es bitkép megjelenítéssel',
      'SID Zene és Hangeffekt kimentő önállóan futtatható PRG fájlba',
    ],
    fastloadTechnology:
      'Super-optimized burst protocol syncing 6510 CPU raster timing with 1541 6502 core. Uses custom byte-interleaving across 1541 tracks.',
    fastloadTechnologyHu:
      'Szuper-optimalizált burst protokoll, amely a 6510 CPU raszteridőzítését közvetlenül a 1541 floppy 6502 processzorához szinkronizálja. Egyedi szektor-sorrenddel (interleave) másodpercek alatt olvas be teljes sávokat.',
    freezeFeatures: [
      'Interactive POKE Trainer / Cheat Injector with database',
      'Freeze Screen Grabber with PETSCII & Multicolor display',
      'Save Game State to Floppy / Tape with auto-run loader',
      'Real-time Memory Hex Editor & Disassembler with ASCII column',
      'SID Waveform & Filter Real-Time visualizer',
    ],
    freezeFeaturesHu: [
      'Interaktív POKE Csaláskezelő és tréner injektáló adatbázissal',
      'Freeze Képernyőmentő (PETSCII és többszínű grafika)',
      'Játékállás mentése lemezre önkicsomagoló futtatóval',
      'Valós idejű Hexadecimális Memóriaszerkesztő és Disassembler',
      'SID hullámforma és rezonáns szűrő élő monitor',
    ],
    bezelColor: '#831843',
    badgeColor: '#ec4899',
  },

  EPYX_FASTLOAD: {
    id: 'EPYX_FASTLOAD',
    name: 'Epyx FastLoad',
    nameHu: 'Epyx FastLoad Cartridge',
    manufacturer: 'Epyx, Inc. (USA)',
    year: 1984,
    romSizeKb: 8,
    cpuSpeedMhz: 1.0,
    fastloadSpeedFactor: 8,
    description:
      'The trailblazing 1984 fastloader cartridge designed by Scott Nelson. Bypassed the sluggish 1541 IEC protocol and made disk loading 8x faster with instant "$" directory.',
    descriptionHu:
      'Az 1984-es úttörő amerikai gyorstöltő kártya (Scott Nelson tervezése). 8x-osára gyorsította az 1541 lemezolvasást, és bevezette az azonnali "$" lemeztartalom parancsot.',
    hardwareFeatures: [
      '8 KB Compact ROM mapped to $8000-$9FFF',
      'Automatic disable logic when standard software is running',
      'Instant "$" Directory listing without overwriting BASIC program in RAM',
      'Quick DOS wedge commands: /FILENAME for fastload, ! for sector edit',
      'Built-in Machine Language Monitor & Disk Sector Editor',
    ],
    hardwareFeaturesHu: [
      '8 KB kompakt ROM a $8000-$9FFF címtartományban',
      'Automatikus lekapcsoló logika, így nem ütközik normál játékokkal',
      'Azonnali "$" könyvtárlistázás anélkül, hogy felülírná a memóriában lévő BASIC programot',
      'Gyors DOS wedge parancsok: /FÁJLNÉV gyorstöltéshez, ! a szektorszerkesztőhöz',
      'Beépített gépi kódú monitor és lemezszektor-szerkesztő',
    ],
    fastloadTechnology:
      'Replaced the C64 KERNAL serial handshake loops with custom fast transfer routines loaded into 1541 drive buffer #1 ($0300).',
    fastloadTechnologyHu:
      'A lassú C64 KERNAL soros kézfogási ciklusait lecserélte az 1541 meghajtó 1-es pufferébe ($0300) feltöltött optimalizált olvasórutinra.',
    freezeFeatures: [
      'Disk Sector & Track Raw Editor (read/write bad sectors)',
      'Compact 6502 Machine Code Monitor ($0000-$FFFF)',
      'Memory PEEK / POKE / SYS tools',
    ],
    freezeFeaturesHu: [
      'Közvetlen lemez szektor- és sávszerkesztő',
      'Kompakt 6502 gépi kódú monitor',
      'Memória PEEK / POKE / SYS segédeszközök',
    ],
    bezelColor: '#713f12',
    badgeColor: '#eab308',
  },

  SUPER_CPU_20MHZ: {
    id: 'SUPER_CPU_20MHZ',
    name: 'CMD SuperCPU 20MHz',
    nameHu: 'CMD SuperCPU 20MHz Hardveres Gyorsító',
    manufacturer: 'Creative Micro Designs (USA)',
    year: 1996,
    romSizeKb: 128,
    ramSizeKb: 512,
    cpuSpeedMhz: 20.0,
    fastloadSpeedFactor: 20,
    description:
      'The ultimate hardware acceleration engine for the C64. Replaced the 1MHz 6510 with a Western Design Center W65C816 16-bit processor clocked at a blistering 20 MHz!',
    descriptionHu:
      'A létező legnagyobb hardveres gyorsító a Commodore 64-hez. Az eredeti 1 MHz-es 6510 CPU-t egy 20 MHz-es Western Design Center W65C816 16-bites processzorra cserélte, 20x-os számítási sebességet elérve!',
    hardwareFeatures: [
      'WDC W65C816S 16-bit Microprocessor running at 20 MHz (20.000.000 Hz)',
      '512 KB to 16 MB zero-wait-state high-speed static RAM expansion',
      'Hardware switch: 1 MHz compatibility mode vs 20 MHz SuperTurbo mode',
      'Hardware I/O clock synchronization with VIC-II (6569) & SID (6581)',
      'Mirroring of C64 64KB RAM into 20MHz zero-wait-state fast RAM',
      'Direct DMA controller and fast IEEE-488 / IEC burst accelerator',
    ],
    hardwareFeaturesHu: [
      'WDC W65C816S 16-bites mikroprocesszor 20 MHz órajelen (20.000.000 Hz)',
      '512 KB - 16 MB nulla várakozási állapotú ultragyors statikus RAM bővítés',
      'Hardveres kapcsoló: 1 MHz kompatibilitási mód vs 20 MHz SuperTurbo mód',
      'Hardveres I/O órajel-szinkronizálás a VIC-II és SID chipekkel ($D000-$DFFF)',
      'A C64 alaplapi memóriájának tükrözése a 20MHz-es gyors RAM-ba',
      'Közvetlen DMA vezérlő és ultra gyors lemezkezelés',
    ],
    fastloadTechnology:
      'Hardware bus takeover: Executes fastloader loops at 20 MHz, shrinking disk transfer and decompression overhead to negligible milliseconds.',
    fastloadTechnologyHu:
      'Közvetlen hardveres buszátvétel: A gyorstöltési és kicsomagolási ciklusokat 20 MHz-en hajtja végre, így az adatfeldolgozás szinte azonnali.',
    freezeFeatures: [
      'Real-time 1MHz / 20MHz Speed Switch during running software',
      'Hardware Optimization for 3D Polygon engines & Fractals (Mandelbrot, Wolf3D C64)',
      'Enhanced 16-bit register inspection (Native 16-bit Accumulator & Index Registers)',
      'Memory mapping across up to 16 MB extended address space',
    ],
    freezeFeaturesHu: [
      'Valós idejű 1MHz / 20MHz sebességváltó menet közben',
      'Extrém hardveres gyorsítás 3D poligonos játékokhoz és fraktálokhoz',
      'Bővített 16-bites regiszterek megtekintése (Native 16-bit mód)',
      'Akár 16 MB kiterjesztett memóriatérkép kezelése',
    ],
    bezelColor: '#064e3b',
    badgeColor: '#10b981',
  },
};

export const TURBO_PROTOCOL_COMPARISON: TurboProtocolComparison = {
  title: 'Stock C64 IEC Serial vs. Turbo Cartridge Fastloader Protocol',
  titleHu: 'Gyári C64 IEC Soros Busz vs. Turbó Kártya Gyorstöltő Protokoll',
  stockIec: {
    speedBps: 400,
    cyclesPerByte: 2500,
    protocol:
      'Software bit-banging on CIA 2 ($DD00) with 6526 CIA hardware shift register bug disabled. 1 bit transmitted at a time with safety delays.',
    protocolHu:
      'Szoftveres bit-banging a CIA 2 ($DD00) porton keresztül, mert a 6526 CIA hardveres léptető-regiszterét egy szilícium-hiba miatt letiltották. Bitenkénti átvitel hosszú biztonsági várakozásokkal.',
    handshake:
      'Talker/Listener handshake with manual ATN line transitions, 1-bit CLK and 1-bit DATA toggling.',
    handshakeHu:
      'Bonyolult Talker/Listener kézfogás kézi ATN vonalváltásokkal, 1-bites CLK és 1-bites DATA vonallal.',
    sampleLoadTime10KbSec: 25.4, // ~25 seconds for a 10KB game
  },
  turboFastload: {
    speedBps: 6000,
    cyclesPerByte: 160,
    protocol:
      'Parallel 2-bit transmission protocol. The cartridge uploads custom machine code into 1541 RAM ($0300) that drives both CLK and DATA lines simultaneously as data pins.',
    protocolHu:
      'Párhuzamos 2-bites átviteli protokoll. A kártya saját gépi kódot tölt a 1541 floppy RAM-jába ($0300), amely a CLK és DATA vonalakat egyszerre 2-bites adatvonalként használja.',
    handshake:
      'Synchronized raster-beam handshake: 4 clock cycles per 2 bits, yielding a full byte in just 16-20 CPU cycles without polling delays.',
    handshakeHu:
      'Szinkronizált raszter-időzítés: 4 órajelciklus / 2 bit, így egy teljes bájt mindössze 16-20 ciklus alatt átmegy várakozás nélkül.',
    sampleLoadTime10KbSec: 1.8, // ~1.8 seconds for a 10KB game
  },
};

export const TURBO_CHEAT_PRESETS: TurboCheatPreset[] = [
  {
    id: 'giana_sisters',
    gameTitle: 'The Great Giana Sisters',
    gameTitleHu: 'The Great Giana Sisters (1987)',
    pokes: [
      { address: 0x22a8, value: 0xa5, label: 'Infinite Lives', labelHu: 'Végtelen Élet (POKE 8872, 165)' },
      { address: 0x2280, value: 0xea, label: 'Invulnerability (No-Hit)', labelHu: 'Sérülhetetlenség (NOP patch)' },
      { address: 0x2420, value: 0x00, label: 'Infinite Time Limit', labelHu: 'Végtelen Idő (POKE 9248, 0)' },
    ],
    description: 'Classic platformer cheat trainer patched directly into memory addresses.',
    descriptionHu: 'Klasszikus ugrálós játék csaláskészlet közvetlenül a memóriacímekre injektálva.',
  },
  {
    id: 'boulder_dash',
    gameTitle: 'Boulder Dash',
    gameTitleHu: 'Boulder Dash (First Star Software)',
    pokes: [
      { address: 0x1830, value: 0xa9, label: 'Infinite Lives (Rockford)', labelHu: 'Végtelen Élet Rockfordnak' },
      { address: 0x1945, value: 0x00, label: 'Diamonds Worth 99', labelHu: 'Gyémántok 99 pontot érnek' },
      { address: 0x1f10, value: 0x60, label: 'Freeze Enemies (Amoeba/Fireflies)', labelHu: 'Ellenségek megfagyasztása' },
    ],
    description: 'Cave explorer cheat trainer for infinite lives and custom diamond scores.',
    descriptionHu: 'Barlangászós klasszikus csalások: végtelen élet és megfagyasztott amőbák.',
  },
  {
    id: 'commando',
    gameTitle: 'Commando',
    gameTitleHu: 'Commando (Elite / Capcom)',
    pokes: [
      { address: 0x48a0, value: 0xad, label: 'Infinite Lives (Super Joe)', labelHu: 'Végtelen Élet Super Joe-nak' },
      { address: 0x4912, value: 0xad, label: 'Infinite Hand Grenades', labelHu: 'Végtelen Kézigránát' },
    ],
    description: 'Arcade military shooter cheat trainer for endless grenades and immortality.',
    descriptionHu: 'Klasszikus háborús lövöldözős játék végtelen gránátokkal és élettel.',
  },
  {
    id: 'turrican',
    gameTitle: 'Turrican / Turrican II',
    gameTitleHu: 'Turrican I & II (Rainbow Arts)',
    pokes: [
      { address: 0x56a4, value: 0xad, label: 'Infinite Lives', labelHu: 'Végtelen Élet (POKE 22180, 173)' },
      { address: 0x5710, value: 0xad, label: 'Infinite Power Lines & Grenades', labelHu: 'Végtelen Lézer és Gránát' },
      { address: 0x5824, value: 0xad, label: 'Infinite Gyroscope / Wheel Time', labelHu: 'Végtelen Giroszkóp/Kerék Mód' },
    ],
    description: 'High-octane run and gun classic with invulnerability patches.',
    descriptionHu: 'Korszakalkotó akciójáték teljes sérülhetetlenségi és fegyvercsalásokkal.',
  },
  {
    id: 'international_karate',
    gameTitle: 'International Karate + (IK+)',
    gameTitleHu: 'International Karate + (IK+ by Archer Maclean)',
    pokes: [
      { address: 0x3420, value: 0xa9, label: 'Player 1 Always Gets 2 Points', labelHu: '1. Játékos mindig 2 pontot kap' },
      { address: 0x3510, value: 0x60, label: 'Disable CPU Fighter AI', labelHu: 'Gép harcosok kikapcsolása' },
    ],
    description: 'Iconic karate fighting game cheat patches.',
    descriptionHu: 'A legendás harcművészeti játék csalásai és pontmódosítói.',
  },
];

// Sample Sprite templates for the Action Replay / FC3 Sprite Ripper
export interface SpriteTemplate {
  name: string;
  nameHu: string;
  isMulticolor: boolean;
  color: number;
  bitmap: number[]; // 63 bytes (24x21 pixels = 3 bytes x 21 rows)
}

export const SAMPLE_SPRITES: SpriteTemplate[] = [
  {
    name: 'Player Spaceship (Delta Wing)',
    nameHu: 'Játékos Űrhajó (Delta Szárny)',
    isMulticolor: false,
    color: 7, // Yellow
    bitmap: [
      0x00, 0x18, 0x00, // Row 1
      0x00, 0x3c, 0x00, // Row 2
      0x00, 0x7e, 0x00, // Row 3
      0x00, 0x7e, 0x00, // Row 4
      0x00, 0xff, 0x00, // Row 5
      0x01, 0xff, 0x80, // Row 6
      0x03, 0xff, 0xc0, // Row 7
      0x07, 0xff, 0xe0, // Row 8
      0x0f, 0xdb, 0xf0, // Row 9
      0x1f, 0x99, 0xf8, // Row 10
      0x3f, 0x99, 0xfc, // Row 11
      0x7f, 0xff, 0xfe, // Row 12
      0xff, 0xff, 0xff, // Row 13
      0xff, 0xbd, 0xff, // Row 14
      0xe7, 0x81, 0xe7, // Row 15
      0xc3, 0x00, 0xc3, // Row 16
      0x81, 0x00, 0x81, // Row 17
      0x00, 0x18, 0x00, // Row 18
      0x00, 0x3c, 0x00, // Row 19
      0x00, 0x24, 0x00, // Row 20
      0x00, 0x00, 0x00, // Row 21
    ],
  },
  {
    name: 'Alien Invader Crab',
    nameHu: 'Idegen Támadó Rák',
    isMulticolor: false,
    color: 5, // Green
    bitmap: [
      0x00, 0x00, 0x00,
      0x03, 0x00, 0xc0,
      0x01, 0x81, 0x80,
      0x00, 0xc3, 0x00,
      0x03, 0xff, 0xc0,
      0x07, 0xbd, 0xe0,
      0x0f, 0xff, 0xf0,
      0x1f, 0xff, 0xf8,
      0x1f, 0x00, 0xf8,
      0x1e, 0x00, 0x78,
      0x1f, 0xff, 0xf8,
      0x0f, 0xff, 0xf0,
      0x07, 0xbd, 0xe0,
      0x03, 0xff, 0xc0,
      0x01, 0x81, 0x80,
      0x03, 0x00, 0xc0,
      0x06, 0x00, 0x60,
      0x0c, 0x00, 0x30,
      0x00, 0x00, 0x00,
      0x00, 0x00, 0x00,
      0x00, 0x00, 0x00,
    ],
  },
  {
    name: 'Retro Running Hero',
    nameHu: 'Futó Retro Hős',
    isMulticolor: false,
    color: 14, // Light Blue
    bitmap: [
      0x00, 0x3c, 0x00,
      0x00, 0x7e, 0x00,
      0x00, 0x66, 0x00,
      0x00, 0x7e, 0x00,
      0x00, 0x3c, 0x00,
      0x01, 0xff, 0x80,
      0x03, 0xff, 0xc0,
      0x07, 0xbd, 0xe0,
      0x0f, 0x99, 0xf0,
      0x1f, 0x18, 0xf8,
      0x00, 0x3c, 0x00,
      0x00, 0x7e, 0x00,
      0x00, 0xe7, 0x00,
      0x01, 0xc3, 0x80,
      0x03, 0x81, 0xc0,
      0x07, 0x00, 0xe0,
      0x0e, 0x00, 0x70,
      0x1c, 0x00, 0x38,
      0x38, 0x00, 0x1c,
      0x70, 0x00, 0x0e,
      0x00, 0x00, 0x00,
    ],
  },
];
