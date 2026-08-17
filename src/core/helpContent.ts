import { HelpTopic } from '../types/version';

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'intro_quickstart',
    iconName: 'Sparkles',
    title: 'Quick Start & Studio Overview',
    titleHu: 'Gyors Kezdés & Stúdió Áttekintés',
    category: 'START',
    categoryHu: 'Kezdés & Áttekintés',
    badge: 'Alapok',
    summary:
      'Understand the three primary operating modes: 8-Bit CPU Modular Board, Commodore 64 Studio, and MCU & 74HC595 Shift Register Studio.',
    summaryHu:
      'Ismerd meg a három fő munkaterületet: 8-Bites CPU Moduláris Áramkör, Commodore 64 Stúdió és AVR MCU & 74HC595 Shift-Regiszter Stúdió.',
    content:
      'This simulator is a comprehensive educational environment designed to teach computer architecture from silicon logic gates up to high-level microcontrollers and retro computers. Use the top navigation bar to switch between the 8-Bit CPU Board, Commodore 64 Studio, and AVR/MCU Studio.',
    contentHu:
      'Ez a szimulátor egy átfogó oktatási platform, amely a digitális logikai kapuktól és flip-flopoktól kezdve a komplett 8-bites processzorokon át az AVR mikrokontrollerekig és a retro Commodore 64-ig mutatja be a számítógép-architektúrák működését. A felső fejlécben található fülekkel bármikor válthatsz a három fő környezet között.',
    keyTerms: [
      {
        term: 'Modular Board',
        termHu: 'Moduláris Áramkör',
        definition: 'Drag-and-drop circuit board showing registers, ALU, RAM, bus wiring, and peripherals.',
        definitionHu: 'Átrendezhető áramköri lap regiszterekkel, ALU-val, memóriával, buszhuzalokkal és perifériákkal.',
      },
      {
        term: 'MCU Studio',
        termHu: 'MCU Stúdió',
        definition: 'AVR ATmega328p environment with 74HC595 shift register, SAR ADC, and Fast PWM Timers.',
        definitionHu: 'AVR ATmega328p környezet 74HC595 shift-regiszterrel, SAR ADC-vel és Hardveres PWM időzítőkkel.',
      },
      {
        term: 'C64 Studio',
        termHu: 'Commodore 64 Stúdió',
        definition: 'Authentic Commodore 64 BASIC V2, MOS 6510 CPU, VIC-II graphics, and SID 6581 sound synth.',
        definitionHu: 'Autentikus C64 környezet BASIC V2 parancsértelmezővel, 6510 CPU-val, VIC-II grafikával és SID 6581 szintetizátorral.',
      },
    ],
  },
  {
    id: 'shift595_architecture',
    iconName: 'Cpu',
    title: '74HC595 Shift Register (SIPO) Architecture & Operation',
    titleHu: '74HC595 Shift-Regiszter (SIPO) Belső Működése & Elmélet',
    category: '74HC595',
    categoryHu: '74HC595 Shift-Regiszter',
    badge: 'Új v4.0',
    summary:
      'Deep dive into Serial-In Parallel-Out shift registers, 2-stage shift and storage latch flip-flops, and glitch-free outputs.',
    summaryHu:
      'Részletes bemutató a soros-bemenetű, párhuzamos-kimenetű (SIPO) léptetőregiszterekről, a 2-szintű shift- és tárolóregiszter D-flip-flopokról és a zavarmentes kimenetekről.',
    content:
      'The 74HC595 is an 8-bit Serial-In / Parallel-Out (SIPO) shift register with an internal output storage latch. It allows a microcontroller to expand its digital output pins dramatically, controlling 8 (or 16, 24, 32...) outputs using only 3 MCU I/O pins: Serial Data (DS), Shift Clock (SH_CP), and Latch Clock (ST_CP).',
    contentHu:
      'A 74HC595 egy 8-bites soros bemenetű, párhuzamos kimenetű (SIPO) shift-regiszter beépített kimeneti tároló retesszel (Storage Latch). Lehetővé teszi a digitális kimenetek drasztikus bővítését: mindössze 3 mikrokontroller lábbal (DS adat, SH_CP órajel, ST_CP retesz) 8, 16 vagy akár több száz független LED, relé vagy kijelző szegmens vezérelhető.',
    keyTerms: [
      {
        term: 'DS (Pin 14 - Serial Data)',
        termHu: 'DS (14. láb - Soros Adat)',
        definition: 'Data bit presented to the first shift register flip-flop before the clock pulse.',
        definitionHu: 'A soros adatbemenet, amelynek 1/0 értékét az órajel felfutó éle belépteti a regiszterbe.',
      },
      {
        term: 'SH_CP (Pin 11 - Shift Clock)',
        termHu: 'SH_CP (11. láb - Léptető Órajel)',
        definition: 'Rising edge shifts all internal D-flip-flops by one position (S0<-DS, S1<-S0, ..., S7<-S6).',
        definitionHu: 'Felfutó élére (0->1) az összes belső flip-flop egy pozícióval jobbra lépteti a biteket.',
      },
      {
        term: 'ST_CP (Pin 12 - Storage Latch Clock)',
        termHu: 'ST_CP (12. láb - Retesz / Tároló Órajel)',
        definition: 'Rising edge copies all 8 bits from the shift register into the output storage latch simultaneously.',
        definitionHu: 'Felfutó élére a teljes 8-bites belső állapot egyszerre átmásolódik a kimeneti tárolóba.',
      },
      {
        term: '/OE (Pin 13 - Output Enable)',
        termHu: '/OE (13. láb - Kimenet Engedélyezés)',
        definition: 'Active-LOW tri-state control. High turns outputs into High-Z; can be PWM modulated for brightness.',
        definitionHu: 'Aktív-ALACSONY engedélyező láb. Magas szinten lebeg (High-Z); PWM-mel dimmelhető a fényerő.',
      },
      {
        term: 'QH\' (Pin 9 - Cascade Serial Out)',
        termHu: 'QH\' (9. láb - Soros Túlcsorduló Kimenet)',
        definition: 'Outputs the 8th bit shifted out, allowing daisy-chaining directly into the next chip DS input.',
        definitionHu: 'A 8. flip-flopból kilépő túlcsorduló bit; közvetlenül a következő IC DS lábára köthető kaszkádoláshoz.',
      },
    ],
    codeSnippets: [
      {
        title: 'Arduino C++: Standard shiftOut() Write',
        language: 'cpp',
        code: `const int DATA_PIN  = 4; // DS (Pin 14)
const int LATCH_PIN = 3; // ST_CP (Pin 12)
const int CLOCK_PIN = 2; // SH_CP (Pin 11)

void setup() {
  pinMode(DATA_PIN, OUTPUT);
  pinMode(CLOCK_PIN, OUTPUT);
  pinMode(LATCH_PIN, OUTPUT);
}

void writeByte595(byte data) {
  digitalWrite(LATCH_PIN, LOW); // Retesz nyitása
  shiftOut(DATA_PIN, CLOCK_PIN, MSBFIRST, data); // 8 bit kiküldése
  digitalWrite(LATCH_PIN, HIGH); // Kimenetek frissítése egyszerre
}`,
      },
      {
        title: 'Arduino C++: 16-Bit Cascaded Dual 74HC595 Write',
        language: 'cpp',
        code: `void write16Bit595(uint16_t data16) {
  digitalWrite(LATCH_PIN, LOW);
  // Először a 2. (távolabbi) IC bájtját shifteljük ki:
  shiftOut(DATA_PIN, CLOCK_PIN, MSBFIRST, (data16 >> 8) & 0xFF);
  // Utána az 1. (közelebbi) IC bájtját:
  shiftOut(DATA_PIN, CLOCK_PIN, MSBFIRST, data16 & 0xFF);
  digitalWrite(LATCH_PIN, HIGH); // Mindkét IC egyszerre reteszel!
}`,
      },
    ],
  },
  {
    id: 'shift595_loads_and_dimming',
    iconName: 'Activity',
    title: '74HC595 Output Loads & PWM Dimming',
    titleHu: '74HC595 Kimeneti Terhelések & /OE PWM Fényerőszabályzás',
    category: '74HC595',
    categoryHu: '74HC595 Shift-Regiszter',
    badge: 'Hardver',
    summary:
      'Connect LEDs, 7-Segment displays, relays, and bargraphs. Control overall brightness using hardware PWM on the /OE pin.',
    summaryHu:
      'LED-sor, 7-szegmenses kijelző, relépanel és oszlopdiagram meghajtása. Globális fényerőszabályzás a /OE lábra adott PWM jellel.',
    content:
      'Because the 74HC595 has an asynchronous active-low /OE (Output Enable) pin, connecting it to an MCU hardware PWM pin (e.g. Arduino Pin D5 / OC0B) allows duty-cycle modulation without altering the stored byte in the latch register.',
    contentHu:
      'Mivel a 74HC595 aszinkron aktív-alacsony /OE (Output Enable) lábbal rendelkezik, ha egy mikrokontroller hardveres PWM lábára kötjük (pl. Arduino D5 / OC0B), a kitöltési tényező változtatásával finom fényerőszabályzást végezhetünk a tárolt bájtok módosítása nélkül.',
    keyTerms: [
      {
        term: 'Common Cathode 7-Segment',
        termHu: 'Közös Katódos 7-Szegmens',
        definition: 'Segments light up with HIGH (1) logic levels on QA..QG.',
        definitionHu: 'A szegmensek MAGAS (1) logikai szintre világítanak a QA..QG kimeneteken.',
      },
      {
        term: 'Relay Module Driving',
        termHu: 'Relé Modul Vezérlés',
        definition: '74HC595 can drive transistor/optocoupler relay inputs to switch high-voltage loads.',
        definitionHu: 'A 74HC595 tranzisztoros/optocsatolós relémodulokat vezérelhet hálózati fogyasztók kapcsolásához.',
      },
    ],
  },
  {
    id: 'adc_sar_studio',
    iconName: 'Zap',
    title: 'Successive Approximation Register (SAR) ADC',
    titleHu: 'Szukcesszív Approximációs (SAR) ADC Működése',
    category: 'ADC_PWM',
    categoryHu: 'Analóg ADC & PWM',
    badge: 'Analóg',
    summary:
      'Step-by-step binary search voltage resolution, Sample & Hold capacitor charging, and Nyquist-Shannon sampling frequency analysis.',
    summaryHu:
      'Lépésenkénti bináris felező feszültségmérés, Mintavevő-tartó (S&H) kondenzátor töltés és Nyquist-Shannon mintavételi elemzés.',
    content:
      'The SAR ADC converts an analog continuous voltage into a discrete digital number using a binary search algorithm. It tests each bit from MSB to LSB by generating an internal test voltage with a DAC and comparing it against the input voltage using an analog comparator.',
    contentHu:
      'A szukcesszív approximációs (SAR) ADC a bemenő folytonos analóg feszültséget bináris felező kereséssel alakítja digitális értékké. A legfelső helyiértékű bittől (MSB) lefelé haladva belső DAC-cal tesztfeszültséget állít elő, és analóg komparátorral dönti el, hogy a bit 1 vagy 0 maradjon.',
    keyTerms: [
      {
        term: 'Sample and Hold (S&H)',
        termHu: 'Mintavevő-Tartó Áramkör',
        definition: 'Charges a precision capacitor during sampling, then isolates it during conversion.',
        definitionHu: 'Mintavételezéskor feltölt egy precíziós kondenzátort, majd az átalakítás alatt stabilan tartja a feszültséget.',
      },
      {
        term: 'Nyquist-Shannon Theorem',
        termHu: 'Nyquist-Shannon Tétel',
        definition: 'Sampling frequency fs must be at least twice the maximum input frequency (fs >= 2 * fmax).',
        definitionHu: 'A mintavételi frekvenciának legalább a mérendő jel maximális frekvenciájának kétszeresének kell lennie.',
      },
      {
        term: 'Aliasing',
        termHu: 'Aliasing (Tükröződés)',
        definition: 'High-frequency components folding back as false low-frequency signals due to under-sampling.',
        definitionHu: 'Alulmintavételezés esetén a magas frekvenciás jelek hamis alacsony frekvenciás jelként jelennek meg.',
      },
    ],
  },
  {
    id: 'pwm_timer_studio',
    iconName: 'Activity',
    title: 'Hardware Fast PWM, Timers & Gamma 2.2',
    titleHu: 'Hardveres Fast PWM, Időzítők & Gamma 2.2 Korrekció',
    category: 'ADC_PWM',
    categoryHu: 'Analóg ADC & PWM',
    badge: 'Időzítők',
    summary:
      'AVR Timer0, Timer1, Timer2 prescalers, Fast PWM vs Phase-Correct PWM, OCR compare match, and optical breathing LEDs.',
    summaryHu:
      'AVR Timer0, Timer1, Timer2 előosztók, Fast PWM vs Phase-Correct PWM, OCR komparátor és optikai lélegeztető LED.',
    content:
      'Hardware Pulse Width Modulation (PWM) uses hardware counters (TCNTn) running at clock sub-frequencies to toggle output pins automatically without CPU intervention. The duty cycle is determined by the Compare Match register (OCRn).',
    contentHu:
      'A hardveres impulzusszélesség-moduláció (PWM) hardveres számlálókkal (TCNTn) működik, amelyek a CPU terhelése nélkül billentik a kimeneti lábat a beállított OCRn komparátor érték elérésekor.',
    keyTerms: [
      {
        term: 'Fast PWM',
        termHu: 'Gyors (Fast) PWM',
        definition: 'Sawtooth ramp: counter runs from 0 to TOP and resets immediately. High frequency.',
        definitionHu: 'Fűrészfog jelalak: a számláló 0-tól TOP-ig számol, majd azonnal nullázódik. Magasabb frekvencia.',
      },
      {
        term: 'Phase-Correct PWM',
        termHu: 'Fázishelyes PWM',
        definition: 'Dual slope triangle ramp: counts up then down. Symmetrical and lower noise for motors.',
        definitionHu: 'Kétirányú háromszög számlálás: fel-le számol. Szimmetrikus, motorvezérléshez ideális.',
      },
      {
        term: 'Gamma 2.2 Correction',
        termHu: 'Gamma 2.2 Optikai Korrekció',
        definition: 'Exponential curve compensating for human eye non-linear logarithmic light perception.',
        definitionHu: 'Exponenciális fényerőgörbe, amely kompenzálja az emberi szem nemlineáris érzékelését.',
      },
    ],
  },
  {
    id: 'cpu_multicore_mmio',
    iconName: 'Cpu',
    title: '8-Bit CPU Cores & Memory-Mapped I/O (MMIO)',
    titleHu: '8-Bites CPU Magok & Memóriatérkép (MMIO) Címdekódolás',
    category: 'CPU_MMIO',
    categoryHu: '8-Bites CPU & MMIO',
    badge: 'Processzor',
    summary:
      'Explore Edu-8, MOS 6502, Z80, and SAP-1 cores. Learn about 74LS138 address decoding, bus aliasing, and peripheral mapping.',
    summaryHu:
      'Ismerd meg az Edu-8, MOS 6502, Z80 és SAP-1 processzormagokat. 74LS138 címdekódolás, memóriatükröződés (aliasing) és perifériák.',
    content:
      'The CPU board emulates modular 8-bit computers with Von Neumann architecture. Memory-Mapped I/O assigns peripheral control and data registers into the standard memory address space, decoded using 74LS138 3-to-8 line decoders.',
    contentHu:
      'A CPU moduláris lap 8-bites Von Neumann architektúrájú processzorokat emulál. A memóriatérképes I/O (MMIO) a perifériák regisztereit a normál memóriacímek közé illeszti, amelyet a 74LS138 3-ból 8-as címdekóder választ ki.',
    keyTerms: [
      {
        term: '74LS138 3-to-8 Decoder',
        termHu: '74LS138 3-ból 8-as Címdekóder',
        definition: 'Decodes 3 address lines (A5..A7) into 8 active-low chip select lines (/Y0../Y7).',
        definitionHu: '3 felső címvonalat (A5..A7) dekódol 8 aktív-alacsony eszközválasztó vonallá (/Y0../Y7).',
      },
      {
        term: 'Address Aliasing & Foldback',
        termHu: 'Memóriatükröződés & Foldback',
        definition: 'When address lines are left unconnected, the same device appears at multiple mirror addresses.',
        definitionHu: 'Ha bizonyos címvonalak nincsenek bekötve, ugyanaz a hardver több memóriacímen is elérhetővé válik.',
      },
    ],
  },
  {
    id: 'c64_retro_studio',
    iconName: 'Monitor',
    title: 'Commodore 64 Retro Workstation Guide',
    titleHu: 'Commodore 64 Retro Munkaállomás Kézikönyv',
    category: 'C64',
    categoryHu: 'Commodore 64',
    badge: 'Retro',
    summary:
      'Write Commodore BASIC V2 programs, design 24x21 hardware sprites with VIC-II, and compose 3-voice chiptunes with SID 6581.',
    summaryHu:
      'Írj Commodore BASIC V2 programokat, tervezz 24x21-es hardveres sprite-okat a VIC-II-vel, és komponálj 3-szólamú chiptune-t a SID 6581-gyel.',
    content:
      'The Commodore 64 studio combines a full BASIC V2 terminal, virtual cassette recorder, 1541 floppy drive, interactive PETSCII screen memory map ($0400-$07E7), VIC-II sprite editor, and SID 6581 ADSR synthesizer.',
    contentHu:
      'A Commodore 64 stúdió tartalmazza a teljes BASIC V2 terminált, virtuális kazettát és 1541 floppy meghajtót, az interaktív PETSCII képernyő memóriatérképet ($0400-$07E7), a VIC-II sprite szerkesztőt és a SID 6581 szintetizátort.',
    codeSnippets: [
      {
        title: 'BASIC V2: Color Cycle & Sound Chiptune',
        language: 'basic',
        code: `10 POKE 53280, 0 : POKE 53281, 0 : REM FEKETE KERET ES HATTER
20 PRINT "{CLR}{WHITE}COMMODORE 64 SZIMULATOR V4.0"
30 POKE 54296, 15 : REM SID MASTER VOLUME MAX
40 POKE 54277, 33 : POKE 54278, 144 : REM VOICE 1 ATTACK/DECAY/SUSTAIN
50 POKE 54273, 28 : POKE 54272, 70 : REM FREKVENCIA = 440 HZ (A-4)
60 POKE 54276, 17 : REM TRIANGLE HULLAMFORMA + GATE BE
70 FOR I=1 TO 500 : NEXT I
80 POKE 54276, 16 : REM GATE KI
90 END`,
      },
    ],
  },
  {
    id: 'block_visual_studio',
    iconName: 'LayoutGrid',
    title: 'Visual Block Programming & Code Generation',
    titleHu: 'Vizuális Blokk-Programozás & Kódgenerálás',
    category: 'BLOCKS',
    categoryHu: 'Vizuális Blokk Stúdió',
    badge: 'Blokkok',
    summary:
      'Drag-and-drop block interface generating clean Arduino C++, AVR Assembly, and Edu-8 Machine code with one-click flashing.',
    summaryHu:
      'Fogd-és-vidd blokk felület tiszta Arduino C++, AVR Assembly és Edu-8 gépi kód generálással és egykattintásos betöltéssel.',
    content:
      'Block Studio provides high-level algorithmic abstractions (loops, conditions, math, analog/digital I/O, PWM timers, and 74HC595 shift registers) while generating production-grade, readable code.',
    contentHu:
      'A Blokk Stúdió vizuális absztrakciót nyújt a logikai vezérléshez, ciklusokhoz, ADC mérésekhez, PWM időzítőkhöz és 74HC595 shift-regiszterekhez, miközben azonnal tiszta C++ és Assembly forráskódot fordít.',
  },
  {
    id: 'c64_hardware_architecture',
    iconName: 'Cpu',
    title: 'Commodore 64 Custom IC Architecture & Bus Interleaving',
    titleHu: 'Commodore 64 Cél IC Architektúra & Kétfázisú Buszmegosztás',
    category: 'C64',
    categoryHu: 'Commodore 64',
    badge: 'Új v4.1',
    summary:
      'Explore how MOS 6510, VIC-II (6569), SID (6581), PLA (82S100), and CIAs (6526) cooperate seamlessly without CPU bus wait-states.',
    summaryHu:
      'Ismerd meg, hogyan működik együtt a MOS 6510 CPU, a VIC-II grafika, a SID hangchip, a PLA memóriavezérlő és a 2x CIA I/O vezérlő processzor-várakozás nélküli kétfázisú órajellel.',
    content:
      'The Commodore 64 operates on an interleaved 1 MHz two-phase clock. During Phase 1 (Φ1), the VIC-II owns the address/data buses to fetch character and sprite graphics. During Phase 2 (Φ2), the 6510 CPU executes machine instructions. During "Bad Lines", the VIC-II steals cycles by pulling BA low for 40 consecutive cycles.',
    contentHu:
      'A Commodore 64 egy zseniális, megosztott kétfázisú ~1 MHz-es órajellel működik. Az 1. fázisban (Φ1) a VIC-II uralja a cím- és adatbuszokat a karakter- és sprite-adatok beolvasásához, míg a 2. fázisban (Φ2) a 6510 CPU hajtja végre a gépi kódú utasításokat. A "Bad Line" sorokban a VIC-II a BA (Bus Available) láb lehúzásával 40 ciklusra megállítja a CPU-t a megnövekedett karakterbeolvasás miatt.',
    keyTerms: [
      {
        term: 'Phase 1 (Φ1)',
        termHu: '1. Órajelfázis (Φ1)',
        definition: 'VIC-II Video Bus phase (reads video matrix and sprite pointers).',
        definitionHu: 'VIC-II videó fázis (karaktermátrix és sprite mutatók olvasása).',
      },
      {
        term: 'Phase 2 (Φ2)',
        termHu: '2. Órajelfázis (Φ2)',
        definition: 'MOS 6510 CPU instruction fetch & execution phase.',
        definitionHu: 'MOS 6510 CPU utasítás-beolvasási és végrehajtási fázis.',
      },
      {
        term: 'MOS 82S100 PLA',
        termHu: 'MOS 82S100 / 8722 PLA',
        definition: 'Programmable Logic Array decoding CPU $01 port bits for dynamic bank switching.',
        definitionHu: 'Programozható logikai tömb, amely a CPU $01-es portjának bitjei alapján dinamikusan váltja a BASIC, KERNAL és I/O területeket.',
      },
      {
        term: 'Bad Line DMA',
        termHu: 'Bad Line DMA',
        definition: 'Every 8th raster line in text mode where VIC-II asserts BA low to fetch 40 screen matrix bytes.',
        definitionHu: 'Minden 8. rasztervonal szöveges módban, ahol a VIC-II leállítja a CPU-t 40 karakterbájt beolvasásához.',
      },
    ],
  },
  {
    id: 'c64_turbo_cartridges',
    iconName: 'Zap',
    title: 'C64 Classic Turbo Cartridges & Hardware Accelerators',
    titleHu: 'C64 Klasszikus Turbó Kártyák & Hardveres Gyorstöltők',
    category: 'C64',
    categoryHu: 'Commodore 64',
    badge: 'Új v4.2',
    summary:
      'Explore how classic cartridges like The Final Cartridge III, Action Replay MK VI, Epyx Fastload, and CMD SuperCPU 20MHz revolutionized C64 disk loading and processing.',
    summaryHu:
      'Ismerd meg, hogyan forradalmasították a klasszikus bővítőkártyák (The Final Cartridge III, Action Replay MK VI, Epyx Fastload, CMD SuperCPU 20MHz) a lemezkezelést és a sebességet.',
    content:
      'Turbo cartridges connect to the C64 Expansion Port (CN5). They bypass the slow serial CIA bit-banging protocol by injecting custom 2-bit IEC burst routines directly into the 1541 drive RAM. Cartridges also offer hardware FREEZE buttons (pulling the NMI line) allowing instant game pausing, memory hacking, cheat injection, sprite extraction, and disk backups.',
    contentHu:
      'A turbó kártyák a C64 hátsó bővítőportjára (CN5) csatlakoznak. A gyári lassú szoftveres CIA bit-banging helyett egy egyedi gyorstöltő rutint töltenek át az 1541-es meghajtó RAM-jába, és a CLK/DATA vonalakon 2-bites hardveres burst átvitellel 10x-25x gyorsabb betöltést érnek el. A beépített FREEZE gomb (az NMI vonal földre húzása) azonnal megállítja a játékot, lehetővé téve a csaláskódok (POKE) beírását, sprite-ok lementését és snapshot készítését.',
    keyTerms: [
      {
        term: '2-Bit IEC Burst',
        termHu: '2-Bites IEC Burst',
        definition: 'Transmits 2 bits per clock cycle simultaneously across the IEC CLK and DATA wires, bypassing the slow serial shift register.',
        definitionHu: 'Órajelciklusonként 2 bitet küld egyszerre az IEC CLK és DATA vonalakon, megkerülve a lassú szoftveres bitenkénti fogadást.',
      },
      {
        term: 'Hardware Freeze (NMI)',
        termHu: 'Hardveres Freeze (NMI)',
        definition: 'A physical button that pulls the 6510 CPU Non-Maskable Interrupt line low, jumping into cartridge ROM monitor at $8000.',
        definitionHu: 'Egy fizikai nyomógomb, amely lehúzza a 6510 processzor NMI vonalát, átirányítva a vezérlést a kártya $8000-es ROM menüjébe.',
      },
      {
        term: 'Cheat / POKE Injector',
        termHu: 'Csalás / POKE Injektor',
        definition: 'Tool inside cartridge freeze menu to inject infinite life/ammo patches directly into running game memory before unfreezing.',
        definitionHu: 'A kártya fagyasztott menüjében elérhető funkció, amellyel végtelen életet és lőszert biztosító POKE utasítások írhatók a RAM-ba.',
      },
      {
        term: 'CMD SuperCPU 20MHz',
        termHu: 'CMD SuperCPU 20MHz',
        definition: '16-bit W65C816S CPU running at 20MHz (20x faster than the stock 0.985MHz 6510), with 128KB fast SRAM cache.',
        definitionHu: '16-bites W65C816S processzor 20MHz-es órajelen (20x gyorsabb a gyári 0.985MHz-nél), 128KB gyors SRAM gyorsítótárral.',
      },
    ],
  },
  {
    id: 'hex_editor_dump_studio',
    iconName: 'Binary',
    title: 'Classic Hex Editor & Hex Dump Architecture',
    titleHu: 'Klasszikus Hex Editor & Hex Dump Működése',
    category: 'CPU_MMIO',
    categoryHu: 'Processzor & Memória',
    badge: 'Új v4.3',
    summary:
      'Understand how raw machine memory is represented in 16-byte hex dump formats, why hexadecimal is used for binary bytes, and how Endianness affects multi-byte pointers.',
    summaryHu:
      'Ismerd meg, hogyan épül fel a nyers gépi memória 16-bájtos hex dump formátumban, miért a 16-os számrendszert használjuk bájtok leírására, és miként működik az Endianness bájtsorrend.',
    content:
      'Every byte in RAM has a unique numerical address (from $0000 upwards). In classic hex editors, each line displays 16 bytes. The row address is on the left, 16 hex byte pairs (00-FF) in the middle, and the corresponding printable ASCII characters on the right. Non-printable control characters are shown as dots (·).',
    contentHu:
      'A RAM minden egyes bájtja saját numerikus címmel rendelkezik ($0000-tól felfelé). A klasszikus hex szerkesztőkben minden sor 16 bájtot mutat. Bal oldalon látható a sor báziscíme (offset), középen 16 hexadecimális bájt (00-FF), jobb oldalon pedig a megfelelő nyomtatható ASCII karakterek. A nem megjeleníthető vezérlőbájtok pontként (·) látszanak.',
    keyTerms: [
      {
        term: 'Hexadecimal (Base-16)',
        termHu: 'Hexadecimális (16-os alap)',
        definition: 'A number system using digits 0-9 and A-F. Exactly two hex digits represent one 8-bit byte ($00 = 0, $FF = 255).',
        definitionHu: '0-9 és A-F számjegyeket használó számrendszer. Pontosan 2 hexadecimális számjegy felel meg 1 db 8-bites bájtnak ($00 = 0, $FF = 255).',
      },
      {
        term: 'Nibble (4 bits)',
        termHu: 'Nibble / Fél-bájt (4 bit)',
        definition: 'A group of 4 bits (values 0-15). The high nibble forms the first hex digit, the low nibble forms the second.',
        definitionHu: '4 bitből álló egység (0-15 érték). A felső 4 bit adja az első hex számjegyet, az alsó 4 bit a másodikat.',
      },
      {
        term: 'Little-Endian (6502 / x86)',
        termHu: 'Little-Endian Bájtsorrend (6502 / x86)',
        definition: 'Multi-byte numbers store their least significant byte (LSB) at the lowest memory address (e.g. $1234 is stored as 34 12).',
        definitionHu: 'Több-bájtos számok esetén a legkisebb helyiértékű bájt (LSB) kerül az alacsonyabb memóriacímre (pl. $1234 tárolása: 34 12).',
      },
      {
        term: 'Bitmask / Bit Toggling',
        termHu: 'Bitmaszk / Bitkapcsolás',
        definition: 'Manipulating individual bits (b7..b0) of a byte to test flags, status bits, or bitmap graphic pixels.',
        definitionHu: 'Egy bájt egyedi bitjeinek (b7..b0) módosítása flagek, állapotbitek vagy grafikus sprite pixelek teszteléséhez.',
      },
    ],
  },
  {
    id: 'shortcuts_and_debugging',
    iconName: 'History',
    title: 'Keyboard Shortcuts & Time-Travel Debugging',
    titleHu: 'Gyorsbillentyűk & Időutazó Hibakeresés',
    category: 'SHORTCUTS',
    categoryHu: 'Gyorsbillentyűk & Debugging',
    badge: 'Tippek',
    summary:
      'Master keyboard shortcuts: Space (Run/Pause), F8 (Instruction Step), F7 (Microstep), and Ctrl+Z (Time-travel step back).',
    summaryHu:
      'Mesteri gyorsbillentyűk: Space (Indítás/Szünet), F8 (Utasítás lépés), F7 (Mikrolépés) és Ctrl+Z (Időutazó visszalépés).',
    content:
      'Use Time-Travel debugging to step backward in time through execution history without restarting the simulation. Set breakpoints on assembly lines to pause automatically when reached.',
    contentHu:
      'Az időutazó hibakeresővel (Ctrl+Z) lépésről lépésre visszaléphetsz a processzor korábbi állapotaiba a program újraindítása nélkül. Az assembly sorokra kattintva töréspontokat (breakpoint) helyezhetsz el.',
    keyTerms: [
      {
        term: 'Spacebar',
        termHu: 'Szóköz (Space)',
        definition: 'Start or Pause the active simulation clock.',
        definitionHu: 'Elindítja vagy szünetelteti az órajelet.',
      },
      {
        term: 'F8 Key',
        termHu: 'F8 Billentyű',
        definition: 'Execute exactly one full machine instruction (multiple micro-steps).',
        definitionHu: 'Egyetlen teljes gépi utasítást hajt végre.',
      },
      {
        term: 'F7 Key',
        termHu: 'F7 Billentyű',
        definition: 'Advance by a single micro-operation clock phase (Fetch / Decode / Exec).',
        definitionHu: 'Egyetlen mikroműveleti fázissal lép előre.',
      },
      {
        term: 'Ctrl + Z',
        termHu: 'Ctrl + Z',
        definition: 'Step backward into the previous CPU state (Registers, RAM, Flags).',
        definitionHu: 'Visszalép az előző processzorállapotba (Regiszterek, RAM, Flagek).',
      },
    ],
  },
];
