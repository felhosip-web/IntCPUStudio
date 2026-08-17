import {
  C64IcId,
  C64IcSpec,
  C64Scenario,
  PlaInputState,
  PlaMemorySlice,
} from '../types/c64Architecture';

export const C64_CUSTOM_ICS: Record<C64IcId, C64IcSpec> = {
  MOS_6510: {
    id: 'MOS_6510',
    chipDesignator: 'U7',
    partNumber: 'MOS 6510',
    name: '8-Bit Microprocessor with On-Chip I/O Port',
    nameHu: '8-Bites Mikroprocesszor Integrált I/O Porttal',
    packageType: 'DIP-40',
    category: 'CPU',
    designer: 'MOS Technology (Chuck Peddle / Bill Mensch derivative)',
    clockSpeed: '0.985 MHz (PAL) / 1.023 MHz (NTSC)',
    summary: 'The CPU of the C64. It is a 6502 core enhanced with an on-chip 6-bit bidirectional I/O port at memory addresses $0000 and $0001 for memory bank management.',
    summaryHu: 'A C64 központi processzora. Egy 6502-es mag egy beépített 6-bites kétirányú I/O porttal kiegészítve a $0000 és $0001 címeken a memóriabankok vezérléséhez.',
    detailedDescription: 'The MOS 6510 handles instruction execution during Phase 2 (Φ2) of the system clock. Its unique 6-bit parallel port at $00/$01 is wired directly to the PLA (U17) to provide the LORAM, HIRAM, and CHAREN signals, dynamically toggling BASIC ROM, KERNAL ROM, Character ROM, and I/O chips in and out of the 64KB address space without losing access to underlying RAM.',
    detailedDescriptionHu: 'A MOS 6510 hajtja végre a programutasításokat a rendszeróra Phase 2 (Φ2) félperiódusában. Egyedi, $00/$01 címeken elérhető 6-bites portja közvetlenül a PLA-hoz (U17) kapcsolódik a LORAM, HIRAM és CHAREN jelek biztosítására, amellyel a BASIC, KERNAL, Karakter ROM-ok és I/O területek dinamikusan le- és felkapcsolhatók a 64KB címtérben.',
    pins: [
      { pinNumber: 1, name: 'VSS (GND)', type: 'POWER', description: 'Ground (0V)', descriptionHu: 'Földelés (0V)' },
      { pinNumber: 2, name: 'RDY', type: 'IN', description: 'Ready signal: pulls CPU into wait state for DMA', descriptionHu: 'Készenléti bemenet: DMA esetén a CPU-t várakozásra készteti' },
      { pinNumber: 3, name: 'Φ1 OUT', type: 'CLOCK', description: 'Phase 1 clock out', descriptionHu: 'Phase 1 órajel kimenet' },
      { pinNumber: 4, name: '/IRQ', type: 'IN', description: 'Interrupt Request from CIA1 or VIC-II', descriptionHu: 'Megszakításkérés a CIA1 vagy VIC-II chipből' },
      { pinNumber: 5, name: 'AEC', type: 'IN', description: 'Address Enable Control: tri-states CPU address bus during Bad Lines', descriptionHu: 'Címbusz engedélyező: lebegteti a CPU címvonalait Bad Line alatt' },
      { pinNumber: 6, name: '/NMI', type: 'IN', description: 'Non-Maskable Interrupt from CIA2 or RESTORE key', descriptionHu: 'Nem maszkolható megszakítás CIA2-ből vagy RESTORE billentyűből' },
      { pinNumber: 7, name: 'SYNC', type: 'OUT', description: 'Opcode fetch indicator', descriptionHu: 'Utasításkód beolvasás jelző' },
      { pinNumber: 8, name: 'VDD (+5V)', type: 'POWER', description: '+5V Power Supply', descriptionHu: '+5V Tápfeszültség' },
      { pinNumber: 9, name: 'A0', type: 'OUT', description: 'Address Bit 0', descriptionHu: 'Címvonal 0' },
      { pinNumber: 10, name: 'A1', type: 'OUT', description: 'Address Bit 1', descriptionHu: 'Címvonal 1' },
      { pinNumber: 20, name: 'A11', type: 'OUT', description: 'Address Bit 11', descriptionHu: 'Címvonal 11' },
      { pinNumber: 21, name: 'VSS', type: 'POWER', description: 'Ground', descriptionHu: 'Földelés' },
      { pinNumber: 22, name: 'A12', type: 'OUT', description: 'Address Bit 12', descriptionHu: 'Címvonal 12' },
      { pinNumber: 23, name: 'A13', type: 'OUT', description: 'Address Bit 13', descriptionHu: 'Címvonal 13' },
      { pinNumber: 24, name: 'A14', type: 'OUT', description: 'Address Bit 14', descriptionHu: 'Címvonal 14' },
      { pinNumber: 25, name: 'A15', type: 'OUT', description: 'Address Bit 15', descriptionHu: 'Címvonal 15' },
      { pinNumber: 26, name: 'D7', type: 'INOUT', description: 'Data Bit 7', descriptionHu: 'Adatvonal 7' },
      { pinNumber: 27, name: 'D6', type: 'INOUT', description: 'Data Bit 6', descriptionHu: 'Adatvonal 6' },
      { pinNumber: 28, name: 'D5', type: 'INOUT', description: 'Data Bit 5', descriptionHu: 'Adatvonal 5' },
      { pinNumber: 29, name: 'D4', type: 'INOUT', description: 'Data Bit 4', descriptionHu: 'Adatvonal 4' },
      { pinNumber: 30, name: 'D3', type: 'INOUT', description: 'Data Bit 3', descriptionHu: 'Adatvonal 3' },
      { pinNumber: 31, name: 'D2', type: 'INOUT', description: 'Data Bit 2', descriptionHu: 'Adatvonal 2' },
      { pinNumber: 32, name: 'D1', type: 'INOUT', description: 'Data Bit 1', descriptionHu: 'Adatvonal 1' },
      { pinNumber: 33, name: 'D0', type: 'INOUT', description: 'Data Bit 0', descriptionHu: 'Adatvonal 0' },
      { pinNumber: 34, name: 'R/W', type: 'OUT', description: 'Read (High) / Write (Low)', descriptionHu: 'Olvasás (Magas) / Írás (Alacsony)' },
      { pinNumber: 35, name: 'P5 (I/O)', type: 'INOUT', description: 'Cassette Motor Control', descriptionHu: 'Magnó Motor Vezérlés' },
      { pinNumber: 36, name: 'P4 (I/O)', type: 'INOUT', description: 'Cassette Switch Sense', descriptionHu: 'Magnó Kapcsoló Érzékelés' },
      { pinNumber: 37, name: 'P3 (I/O)', type: 'INOUT', description: 'Cassette Write Line', descriptionHu: 'Magnó Írási Vonal' },
      { pinNumber: 38, name: 'P2 (I/O)', type: 'INOUT', description: 'CHAREN: 0=CHAR ROM at $D000, 1=I/O or RAM', descriptionHu: 'CHAREN: 0=Karakter ROM $D000-nál, 1=I/O vagy RAM' },
      { pinNumber: 39, name: 'P1 (I/O)', type: 'INOUT', description: 'HIRAM: 0=RAM at $E000-$FFFF, 1=KERNAL ROM', descriptionHu: 'HIRAM: 0=RAM $E000-$FFFF-nél, 1=KERNAL ROM' },
      { pinNumber: 40, name: 'P0 (I/O)', type: 'INOUT', description: 'LORAM: 0=RAM at $A000-$BFFF, 1=BASIC ROM', descriptionHu: 'LORAM: 0=RAM $A000-$BFFF-nél, 1=BASIC ROM' },
    ],
    registers: [
      { address: '$0000', name: 'PORT_DIR', bits: 'DDR (Data Direction)', description: 'Sets input (0) or output (1) for on-chip P0-P5 pins. Default: $2F (00101111b)', descriptionHu: 'Be- (0) vagy kimenetként (1) állítja be a P0-P5 lábakat. Alapérték: $2F' },
      { address: '$0001', name: 'PORT_DATA', bits: 'LORAM, HIRAM, CHAREN, CAS_WR, CAS_SENSE, CAS_MOT', description: 'Controls PLA memory mapping & tape drive. Default: $37 (00110111b: All ROMs enabled)', descriptionHu: 'Vezérli a PLA memóriatérképet és magnót. Alapérték: $37 (Minden ROM bekapcsolva)' },
      { address: 'CPU Core', name: 'A, X, Y, SP, P, PC', bits: '8/16-bit Regs', description: 'Standard 6502 Register set with 256-byte stack at $0100-$01FF.', descriptionHu: 'Szabványos 6502-es regiszterkészlet 256 bájtos veremmel a $0100-$01FF tartományban.' },
    ],
    internalBlocks: [
      { title: '6502 Execution Engine', titleHu: '6502 Végrehajtó Mag', description: '8-bit Arithmetic Logic Unit (ALU), Instruction Decoder, Accumulator, Index Registers.', descriptionHu: '8-bites Aritmetikai és Logikai Egység (ALU), Utasítás Dekóder, Akkumulátor, Index Regiszterek.' },
      { title: 'On-Chip 6-Bit I/O Port', titleHu: 'Beépített 6-Bites I/O Port', description: 'Bidirectional TTL port mapping to memory locations $0000 and $0001 to control PLA bank switching directly.', descriptionHu: 'Kétirányú TTL port a $0000 és $0001 címekre kötve a PLA bankváltás közvetlen vezérlésére.' },
      { title: 'Bus Interface & Tri-State Logic', titleHu: 'Busz Illesztő & Háromállapotú Logika', description: 'AEC pin allows VIC-II to completely detach CPU from the address/data buses during Bad Lines.', descriptionHu: 'Az AEC láb lehetővé teszi, hogy a VIC-II teljesen leválassza a CPU-t a cím/adatbuszról a Bad Line ciklusok alatt.' },
    ],
    trivia: {
      en: 'The 6510 was custom-designed for Commodore. The 6-bit on-chip port was specifically requested by Commodore engineers to solve the memory mapping bottleneck without requiring extra interface chips!',
      hu: 'A 6510-et kifejezetten a Commodore számára fejlesztették ki. A beépített 6-bites portot a mérnökök azért kérték, hogy extra IC-k nélkül oldhassák meg a 64KB RAM és ROM-ok közötti dinamikus bankváltást!',
    },
  },

  MOS_6569_VIC2: {
    id: 'MOS_6569_VIC2',
    chipDesignator: 'U19',
    partNumber: 'MOS 6569 (PAL) / 6567 (NTSC)',
    name: 'Video Interface Controller II',
    nameHu: 'Videó Interfész Vezérlő II (VIC-II)',
    packageType: 'DIP-40',
    category: 'GRAPHICS',
    designer: 'Al Charpentier & Robert Yannes',
    clockSpeed: 'Master 7.88 MHz -> System Clock 0.985 MHz (PAL) / 1.023 MHz (NTSC)',
    summary: 'The graphics processor of the C64. Renders text and bitmap screens, handles 8 hardware sprites with collision detection, and orchestrates bus arbitration with the CPU.',
    summaryHu: 'A C64 grafikus processzora. Szöveges és grafikus képernyőket jelenít meg, 8 hardveres sprite-ot kezel ütközésérzékeléssel, és vezérli a busz-hozzáférést a CPU-val.',
    detailedDescription: 'The VIC-II has access to 16KB of memory at any time (selectable via CIA2 Port A bits 0-1). It interleaves with the CPU on every clock cycle: VIC-II reads during Phase 1 (Φ1), CPU during Phase 2 (Φ2). On "Bad Lines" (every 8 raster lines in text mode), VIC-II pulls BA (Bus Available) LOW, freezing the CPU to fetch 40 character pointers + Color RAM nybbles.',
    detailedDescriptionHu: 'A VIC-II egyszerre 16KB memóriához fér hozzá (melyet a CIA2 Port A 0-1 bitjei választanak ki). Minden órajelciklusban váltakozik a CPU-val: a VIC-II a Phase 1 (Φ1), a CPU a Phase 2 (Φ2) alatt olvas. "Bad Line" ciklusokban (minden 8. rasztersorban) a VIC-II alacsonyba húzza a BA jelet, megállítva a CPU-t, hogy beolvassa a 40 karaktermutatót és a Szín-RAM értékeket.',
    pins: [
      { pinNumber: 1, name: 'DB6', type: 'INOUT', description: 'Color/Data Bus bit 6', descriptionHu: 'Szín/Adatbusz 6' },
      { pinNumber: 12, name: 'BA (Bus Available)', type: 'OUT', description: 'Pulls LOW 3 cycles before DMA steal to freeze CPU', descriptionHu: 'Alacsonyba húzódik 3 ciklussal a DMA lopás előtt, leállítva a CPU-t' },
      { pinNumber: 13, name: 'AEC (Addr Enable Ctrl)', type: 'OUT', description: 'Controls whether CPU (High) or VIC-II (Low) drives address bus', descriptionHu: 'Vezérli, hogy a CPU (Magas) vagy a VIC-II (Alacsony) hajtja a címbuszt' },
      { pinNumber: 14, name: '/IRQ', type: 'OUT', description: 'Raster Compare / Sprite Collision interrupt to CPU', descriptionHu: 'Raszter-összehasonlítás / Sprite ütközés megszakítás a CPU felé' },
      { pinNumber: 15, name: 'COLOR LUM/SYNC', type: 'ANALOG', description: 'Composite Luminance and sync signal', descriptionHu: 'Kompozit világosság (Luma) és szinkronjel' },
      { pinNumber: 16, name: 'COLOR CHROMA', type: 'ANALOG', description: 'Chrominance color subcarrier output', descriptionHu: 'Színsegédvivő (Chroma) kimenet' },
      { pinNumber: 21, name: 'DOT CLOCK', type: 'CLOCK', description: 'Master dot clock (7.88 MHz PAL / 8.18 MHz NTSC)', descriptionHu: 'Fő képpont-órajel' },
      { pinNumber: 22, name: 'Φ0 IN', type: 'CLOCK', description: 'Master System Clock input', descriptionHu: 'Rendszerórajel bemenet' },
    ],
    registers: [
      { address: '$D000-$D00F', name: 'SPRITE_X_Y', bits: 'X/Y Coords', description: 'X and Y coordinates for 8 hardware sprites', descriptionHu: '8 hardveres sprite X és Y koordinátái' },
      { address: '$D011', name: 'SCROLY_CTRL1', bits: 'RST8, ECM, BMM, DEN, RSEL, YSCROLL(3)', description: 'Screen control register 1: Bitmap mode, screen blank, 24/25 rows, raster bit 8', descriptionHu: 'Képernyővezérlő 1: Grafikus mód, képernyő tiltás, 24/25 sor, raszter 8. bit' },
      { address: '$D012', name: 'RASTER_LINE', bits: '0-255', description: 'Current raster scan line counter (read) / Raster IRQ trigger line (write)', descriptionHu: 'Aktuális rasztersor számláló (olvasás) / Raszter megszakítás sora (írás)' },
      { address: '$D015', name: 'SPRITE_ENABLE', bits: 'SP0-SP7', description: 'Enables individual hardware sprites 0-7', descriptionHu: 'Engedélyezi a 0-7 egyedi hardveres sprite-okat' },
      { address: '$D016', name: 'SCROLX_CTRL2', bits: 'RES, MCM, CSEL, XSCROLL(3)', description: 'Screen control register 2: Multicolor mode, 38/40 columns, smooth X fine scroll', descriptionHu: 'Képernyővezérlő 2: Multikolor mód, 38/40 oszlop, finom X gördítés' },
      { address: '$D018', name: 'MEMORY_PTRS', bits: 'VM13-10, CB13-11', description: 'Screen matrix base pointer and character generator / bitmap base pointer', descriptionHu: 'Képernyőmátrix és karaktergenerátor / grafikus báziscím mutatók' },
      { address: '$D019 / $D01A', name: 'IRQ_FLAG / MASK', bits: 'RST, MBC, MMC, LP', description: 'Raster IRQ, Sprite-Background collision, Sprite-Sprite collision, Lightpen IRQ', descriptionHu: 'Raszter megszakítás, Sprite-Háttér ütközés, Sprite-Sprite ütközés, Fényceruza' },
      { address: '$D020 / $D021', name: 'BORDER / BG_COL', bits: '0-15', description: 'Border color and main background color (0=Black ... 15=Light Grey)', descriptionHu: 'Keretszín és fő háttérszín (0=Fekete ... 15=Világosszürke)' },
    ],
    internalBlocks: [
      { title: '8x Hardware Sprite Engine', titleHu: '8x Hardveres Sprite Motor', description: 'Independent 24x21 pixel hardware overlays with 2x horizontal/vertical expansion, priority over background, and pixel-exact collision detection.', descriptionHu: 'Független 24x21 pixeles rétegek 2x vízszintes/függőleges nagyítással, háttér prioritással és pixel-pontos ütközésérzékeléssel.' },
      { title: 'Raster Beam Counter & IRQ Generator', titleHu: 'Rasztersugár Számláló & IRQ Generátor', description: 'Counts horizontal scan lines (312 lines in PAL, 263 in NTSC) and triggers cycle-exact CPU interrupts at any chosen scan line for split-screen effects.', descriptionHu: 'Számolja a pásztázó sorokat (312 sor PAL, 263 sor NTSC) és ciklus-pontos megszakítást küld a CPU-nak osztott képernyős effektekhez.' },
      { title: 'Memory Arbiter & Bad Line Logic', titleHu: 'Memória Arbitráció & Bad Line Logika', description: 'Interleaves bus access on every clock cycle and pulls BA low when character rows require 40 extra memory reads.', descriptionHu: 'Minden órajelben váltja a busz-hozzáférést, és alacsonyba húzza a BA-t, amikor egy szövegsor 40 extra bájt beolvasását igényli.' },
    ],
    trivia: {
      en: 'The VIC-II was originally intended for a next-gen arcade game console. When Jack Tramiel ordered the C64 to be built in under 6 months for CES 1982, the VIC-II was repurposed as the heart of the C64!',
      hu: 'A VIC-II-t eredetileg egy következő generációs játékkonzolhoz fejlesztették. Amikor Jack Tramiel elrendelte, hogy a C64-et 6 hónap alatt el kell készíteni az 1982-es CES-re, a VIC-II lett a C64 grafikus szíve!',
    },
  },

  MOS_6581_SID: {
    id: 'MOS_6581_SID',
    chipDesignator: 'U18',
    partNumber: 'MOS 6581 / 8580',
    name: 'Sound Interface Device (SID)',
    nameHu: 'Hanggenerátor és Analóg Szintetizátor (SID)',
    packageType: 'DIP-28',
    category: 'SOUND',
    designer: 'Robert "Bob" Yannes',
    clockSpeed: '0.985 MHz (PAL) / 1.023 MHz (NTSC)',
    summary: 'The legendary 3-voice polyphonic analog synthesizer chip of the C64 with resonant multi-mode filters and dedicated ADSR envelope generators.',
    summaryHu: 'A C64 legendás 3-szólamú analóg szintetizátor IC-je, rezonáns többmódú analóg szűrővel és független ADSR burkológörbe-generátorokkal.',
    detailedDescription: 'The SID chip revolutionised computer audio by implementing a complete analog subtractive synthesizer on a single piece of silicon. It features 3 independent oscillators (Triangle, Sawtooth, Pulse with PWM, Noise), hard sync, ring modulation, a programmable analog resonant multi-mode filter (Low-pass, Band-pass, High-pass, Notch), and 2 analog Paddle inputs.',
    detailedDescriptionHu: 'A SID forradalmasította a számítógépes hangzást: egy teljes analóg szubtraktív szintetizátort valósított meg egyetlen szilícium lapkán. 3 független oszcillátort (Háromszög, Fűrészfog, Változó Négyszög/PWM, Zaj), hard-szinkront, gyűrűmodulációt, analóg rezonáns szűrőt és 2 analóg botkormány bemenetet tartalmaz.',
    pins: [
      { pinNumber: 1, name: 'CAP1A', type: 'ANALOG', description: 'Filter capacitor 1A connection', descriptionHu: '1A Szűrőkondenzátor csatlakozó' },
      { pinNumber: 2, name: 'CAP1B', type: 'ANALOG', description: 'Filter capacitor 1B connection', descriptionHu: '1B Szűrőkondenzátor csatlakozó' },
      { pinNumber: 3, name: 'CAP2A', type: 'ANALOG', description: 'Filter capacitor 2A connection', descriptionHu: '2A Szűrőkondenzátor csatlakozó' },
      { pinNumber: 4, name: 'CAP2B', type: 'ANALOG', description: 'Filter capacitor 2B connection', descriptionHu: '2B Szűrőkondenzátor csatlakozó' },
      { pinNumber: 5, name: '/RES', type: 'IN', description: 'Reset line', descriptionHu: 'Törlés / Alaphelyzetbe állítás' },
      { pinNumber: 6, name: 'Φ2', type: 'CLOCK', description: 'Phase 2 system clock', descriptionHu: 'Phase 2 rendszerórajel' },
      { pinNumber: 7, name: 'R/W', type: 'IN', description: 'Read/Write line', descriptionHu: 'Írás/Olvasás vonal' },
      { pinNumber: 8, name: '/CS', type: 'IN', description: 'Chip Select from PLA ($D400-$D41F)', descriptionHu: 'Chip Select a PLA-ból ($D400-$D41F)' },
      { pinNumber: 24, name: 'POTX', type: 'ANALOG', description: 'Analog Paddle X potentiometer A/D converter input', descriptionHu: 'X Paddle analóg potméter A/D bemenet' },
      { pinNumber: 25, name: 'POTY', type: 'ANALOG', description: 'Analog Paddle Y potentiometer A/D converter input', descriptionHu: 'Y Paddle analóg potméter A/D bemenet' },
      { pinNumber: 26, name: 'EXT IN', type: 'ANALOG', description: 'External audio input routed into SID filter', descriptionHu: 'Külső audio bemenet a SID szűrőn keresztül' },
      { pinNumber: 27, name: 'AUDIO OUT', type: 'ANALOG', description: 'Analog Audio Output to TV/Monitor amplifier', descriptionHu: 'Analóg audió kimenet a hangszóró/erősítő felé' },
      { pinNumber: 28, name: 'VDD (+12V / +9V)', type: 'POWER', description: '+12V (6581) or +9V (8580) analog power rail', descriptionHu: '+12V (6581) vagy +9V (8580) analóg tápfeszültség' },
    ],
    registers: [
      { address: '$D400 / $D401', name: 'V1_FREQ_LO / HI', bits: '16-bit Freq', description: 'Voice 1 16-bit pitch frequency: Fout = (Fn * Fclk) / 16777216', descriptionHu: '1. hang 16-bites frekvencia regisztere' },
      { address: '$D402 / $D403', name: 'V1_PW_LO / HI', bits: '12-bit PWM', description: 'Voice 1 Pulse Width (0 to 4095: 0% to 100% duty cycle)', descriptionHu: '1. hang négyszög impulzusszélessége (0-4095: 0-100% kitöltés)' },
      { address: '$D404', name: 'V1_CONTROL', bits: 'NOISE, PULSE, SAW, TRI, TEST, RING, SYNC, GATE', description: 'Voice 1 waveform selection, ring modulation, hard sync, and envelope gate', descriptionHu: '1. hang hullámforma választó, gyűrűmoduláció, szinkron és indítókapu (GATE)' },
      { address: '$D405 / $D406', name: 'V1_ATT_DEC / SUS_REL', bits: '4-bit ADSR', description: 'Voice 1 Attack (2ms-8s), Decay (6ms-24s), Sustain (0-15), Release (6ms-24s)', descriptionHu: '1. hang Felfutás, Lecsengés, Kitartás és Elengedés idők' },
      { address: '$D415-$D418', name: 'FILTER_CUTOFF / RES / VOL', bits: '11-bit Cut, Res, Mode, Vol', description: 'Filter Cutoff, Resonance, Filter routing (V1/V2/V3/Ext), Modes (LP/BP/HP/Notch), Master Volume', descriptionHu: 'Szűrő vágási frekvencia, Rezonancia, Csatorna irányítás, Szűrőtípus és Fő hangerő' },
      { address: '$D419 / $D41A', name: 'POTX / POTY', bits: '0-255 ADC', description: 'Read 8-bit digital values from analog paddle potentiometers', descriptionHu: 'Analóg potméterek 8-bites digitális értéke' },
      { address: '$D41B / $D41C', name: 'OSC3 / ENV3', bits: 'Wave / ADSR', description: 'Read voice 3 waveform output and ADSR envelope for random number generation', descriptionHu: '3. hang hullámforma és burkológörbe kiolvasás véletlenszám-generáláshoz' },
    ],
    internalBlocks: [
      { title: '3x 24-Bit Phase Accumulators', titleHu: '3x 24-Bites Fázis-Akkumulátor', description: 'High-precision digital oscillators generating Triangle, Sawtooth, Pulse with PWM, and 23-bit Pseudo-Random Noise.', descriptionHu: 'Nagy pontosságú digitális oszcillátorok: Háromszög, Fűrészfog, Négyszög (PWM) és 23-bites fehérzaj.' },
      { title: 'Analog Multi-Mode Resonant Filter', titleHu: 'Analóg Többmódú Rezonáns Szűrő', description: 'Continuous-time state-variable filter capable of simultaneous 12dB/octave Low-pass, Band-pass, and High-pass responses with variable $Q$ resonance.', descriptionHu: 'Valódi állapotváltozós analóg szűrő 12dB/oktáv meredekséggel, Aluláteresztő, Sáváteresztő és Felüláteresztő kimenetekkel és változtatható rezonanciával.' },
      { title: '3x Digital Envelope Generators (ADSR)', titleHu: '3x Digitális Burkológörbe-Generátor', description: 'Exponential volume curves mimicking real musical instruments with 16 selectable time constants.', descriptionHu: 'Exponenciális hangerőgörbék valódi hangszerek akusztikájának utánzására 16 választható időállandóval.' },
    ],
    trivia: {
      en: 'Bob Yannes later left Commodore and co-founded Ensoniq, creating legendary professional music synthesizers like the Mirage and SQ-80 based on the principles he pioneered in the SID!',
      hu: 'Bob Yannes később elhagyta a Commodore-t és társalapítója lett az Ensoniq professzionális szintetizátorgyártónak (Mirage, SQ-80), melynek technológiáját a SID fejlesztése során alapozta meg!',
    },
  },

  MOS_82S100_PLA: {
    id: 'MOS_82S100_PLA',
    chipDesignator: 'U17',
    partNumber: 'MOS 82S100 / 8722 / 251064-01',
    name: 'Programmable Logic Array (Memory Arbiter & Chip Select Decoder)',
    nameHu: 'Programozható Logikai Hálózat (PLA Memóriavezérlő)',
    packageType: 'DIP-28',
    category: 'LOGIC',
    designer: 'Commodore Semiconductor Group',
    summary: 'The traffic cop of the C64. A field-programmable logic array that decodes CPU and VIC-II address lines and configuration bits to dynamically map RAM, ROMs, and I/O chips.',
    summaryHu: 'A C64 memóriavezérlő központja. Dekódolja a CPU és VIC-II címvonalait és konfigurációs bitjeit, hogy valós időben kapcsolja a RAM-ot, ROM-okat és az I/O chipeket.',
    detailedDescription: 'Without the PLA, the Commodore 64 could not fit 64KB of RAM, 20KB of ROM, and 4KB of I/O chips inside a 16-bit (64KB) address space. The PLA uses 16 inputs (A12-A15, CPU Port $01 LORAM/HIRAM/CHAREN, BA, AEC, CAS, GAME, EXROM, R/W) to generate 8 active-low chip select signals: /BASIC, /KERNAL, /CHAROM, /IO, /GR_W, /ROML, /ROMH, and /CASRAM.',
    detailedDescriptionHu: 'A PLA nélkül a Commodore 64 nem tudna 64KB RAM-ot, 20KB ROM-ot és 4KB I/O területet egy 16-bites (64KB) címtérben kezelni. A PLA 16 bemenetből (A12-A15, CPU $01 LORAM/HIRAM/CHAREN, BA, AEC, CAS, GAME, EXROM, R/W) állítja elő a 8 aktív-alacsony chip select jelet: /BASIC, /KERNAL, /CHAROM, /IO, /GR_W, /ROML, /ROMH és /CASRAM.',
    pins: [
      { pinNumber: 1, name: 'A15', type: 'IN', description: 'Address bus bit 15', descriptionHu: 'Címbusz 15. bit' },
      { pinNumber: 2, name: 'A14', type: 'IN', description: 'Address bus bit 14', descriptionHu: 'Címbusz 14. bit' },
      { pinNumber: 3, name: 'A13', type: 'IN', description: 'Address bus bit 13', descriptionHu: 'Címbusz 13. bit' },
      { pinNumber: 4, name: 'A12', type: 'IN', description: 'Address bus bit 12', descriptionHu: 'Címbusz 12. bit' },
      { pinNumber: 5, name: 'BA', type: 'IN', description: 'Bus Available from VIC-II', descriptionHu: 'Bus Available jel a VIC-II-ből' },
      { pinNumber: 6, name: 'AEC', type: 'IN', description: 'Address Enable Control', descriptionHu: 'Address Enable Control jel' },
      { pinNumber: 7, name: 'LORAM', type: 'IN', description: 'CPU Port $01 bit 0: BASIC ROM toggle', descriptionHu: 'CPU Port $01 0. bit: BASIC ROM kapcsoló' },
      { pinNumber: 8, name: 'HIRAM', type: 'IN', description: 'CPU Port $01 bit 1: KERNAL ROM toggle', descriptionHu: 'CPU Port $01 1. bit: KERNAL ROM kapcsoló' },
      { pinNumber: 9, name: 'CHAREN', type: 'IN', description: 'CPU Port $01 bit 2: Character ROM / IO toggle', descriptionHu: 'CPU Port $01 2. bit: Karakter ROM / IO kapcsoló' },
      { pinNumber: 10, name: 'GAME', type: 'IN', description: 'Cartridge GAME pin (active low)', descriptionHu: 'Bővítőkártya GAME láb' },
      { pinNumber: 11, name: 'EXROM', type: 'IN', description: 'Cartridge EXROM pin (active low)', descriptionHu: 'Bővítőkártya EXROM láb' },
      { pinNumber: 15, name: '/CASRAM', type: 'OUT', description: 'CAS Gate for Dynamic RAM', descriptionHu: 'DRAM CAS vezérlő jel' },
      { pinNumber: 16, name: '/BASIC', type: 'OUT', description: 'Chip Select for BASIC ROM ($A000-$BFFF)', descriptionHu: 'BASIC ROM Chip Select ($A000-$BFFF)' },
      { pinNumber: 17, name: '/KERNAL', type: 'OUT', description: 'Chip Select for KERNAL ROM ($E000-$FFFF)', descriptionHu: 'KERNAL ROM Chip Select ($E000-$FFFF)' },
      { pinNumber: 18, name: '/CHAROM', type: 'OUT', description: 'Chip Select for Character ROM ($D000-$DFFF)', descriptionHu: 'Karakter ROM Chip Select ($D000-$DFFF)' },
      { pinNumber: 19, name: '/GR_W', type: 'OUT', description: 'Color RAM Read/Write Gate', descriptionHu: 'Szín-RAM Írás/Olvasás kapu' },
      { pinNumber: 20, name: '/IO', type: 'OUT', description: 'Chip Select for I/O Space ($D000-$DFFF: VIC, SID, CIAs)', descriptionHu: 'I/O terület Chip Select ($D000-$DFFF)' },
      { pinNumber: 21, name: '/ROML', type: 'OUT', description: 'Cartridge ROM Low Select ($8000-$9FFF)', descriptionHu: 'Alsó kártya-ROM választó ($8000-$9FFF)' },
      { pinNumber: 22, name: '/ROMH', type: 'OUT', description: 'Cartridge ROM High Select ($A000 / $E000)', descriptionHu: 'Felső kártya-ROM választó ($A000 / $E000)' },
    ],
    internalBlocks: [
      { title: 'AND Matrix (48 Product Terms)', titleHu: 'ÉS-Mátrix (48 Szorzatterm)', description: 'Hard-coded Boolean equations matching combinations of address ranges, bus master flags, and port bits.', descriptionHu: 'Huzalozott Boole-egyenletek, melyek a címtartományok, buszmester állapotok és portbitek kombinációit ellenőrzik.' },
      { title: 'OR Matrix (8 Output Terms)', titleHu: 'VAGY-Mátrix (8 Kimeneti Term)', description: 'Combines terms to assert the corresponding chip select lines (/BASIC, /KERNAL, /CHAROM, /IO, etc.).', descriptionHu: 'Összegzi a szorzattermeket a megfelelő /CS vonalak (/BASIC, /KERNAL, /CHAROM, /IO) aktiválásához.' },
    ],
    trivia: {
      en: 'The original Signetics 82S100 PLA ran extremely hot and was known as the most failure-prone chip in vintage C64s. Modern enthusiasts often replace it with cool-running GAL or CPLD chips!',
      hu: 'Az eredeti Signetics 82S100 PLA forrón járt és a régi C64-ek leggyakrabban meghibásodó alkatrésze volt. Ma a rajongók modern, hűvös GAL vagy CPLD helyettesítőkre cserélik!',
    },
  },

  MOS_6526_CIA1: {
    id: 'MOS_6526_CIA1',
    chipDesignator: 'U1',
    partNumber: 'MOS 6526 CIA 1',
    name: 'Complex Interface Adapter 1 (Keyboard, Joysticks & System IRQ)',
    nameHu: 'Komplex Interfész Illesztő 1 (Billentyűzet, Botkormány & Rendszer IRQ)',
    packageType: 'DIP-40',
    category: 'INTERFACE',
    designer: 'MOS Technology',
    clockSpeed: '0.985 MHz (PAL) / 1.023 MHz (NTSC)',
    summary: 'Handles user interaction: scans the 8x8 keyboard matrix, reads Control Port 1 and 2 (joysticks), runs Timers A and B, maintains the 50/60Hz real-time clock, and fires the 60Hz system IRQ.',
    summaryHu: 'A felhasználói bevitelt kezeli: pásztázza a 64 gombos billentyűzetmátrixot, beolvassa a 2 botkormányt, futtatja a 16-bites időzítőket és a 60Hz-es rendszer megszakítást.',
    detailedDescription: 'CIA 1 is mapped at $DC00-$DCFF. In standard operation, the KERNAL interrupt routine (running 60 times per second) writes a walking zero bit to Port A ($DC00) to select keyboard columns, and reads Port B ($DC01) to detect pressed keys. Port A and B pins are also shared with Control Ports 1 and 2 (Joysticks).',
    detailedDescriptionHu: 'A CIA 1 a $DC00-$DCFF címtartományban érhető el. A KERNAL másodpercenként 60-szor lefutó megszakítási rutinja egy lépegető 0 bitet ír a Port A ($DC00) regiszterbe a billentyűzetoszlopok kiválasztására, és beolvassa a Port B ($DC01) értékeit a lenyomott billentyűk detektálására.',
    pins: [
      { pinNumber: 1, name: 'VSS', type: 'POWER', description: 'Ground', descriptionHu: 'Földelés' },
      { pinNumber: 2, name: 'PA0-PA7', type: 'INOUT', description: 'Port A: Keyboard Matrix Columns / Joystick 2', descriptionHu: 'Port A: Billentyűzet Oszlopok / Botkormány 2' },
      { pinNumber: 10, name: 'PB0-PB7', type: 'INOUT', description: 'Port B: Keyboard Matrix Rows / Joystick 1', descriptionHu: 'Port B: Billentyűzet Sorok / Botkormány 1' },
      { pinNumber: 18, name: '/PC', type: 'OUT', description: 'Port Handshake Output', descriptionHu: 'Kézfogás kimenet' },
      { pinNumber: 19, name: 'TOD', type: 'IN', description: '50Hz/60Hz AC line frequency clock input', descriptionHu: '50Hz/60Hz Hálózati frekvencia órajel bemenet' },
      { pinNumber: 21, name: '/IRQ', type: 'OUT', description: 'Interrupt output connected to 6510 /IRQ line', descriptionHu: 'Megszakítás kimenet a 6510 /IRQ vonalára kötve' },
      { pinNumber: 24, name: '/CS', type: 'IN', description: 'Chip select ($DC00-$DCFF)', descriptionHu: 'Chip select ($DC00-$DCFF)' },
      { pinNumber: 25, name: 'Φ2', type: 'CLOCK', description: 'Phase 2 system clock', descriptionHu: 'Phase 2 rendszerórajel' },
    ],
    registers: [
      { address: '$DC00', name: 'PORTA_DATA', bits: 'PA0-PA7', description: 'Keyboard column selector (write) / Joystick 2 directions (read)', descriptionHu: 'Billentyűzet oszlop választó (írás) / Botkormány 2 irányok (olvasás)' },
      { address: '$DC01', name: 'PORTB_DATA', bits: 'PB0-PB7', description: 'Keyboard row reader (read) / Joystick 1 directions (read)', descriptionHu: 'Billentyűzet sor beolvasó (olvasás) / Botkormány 1 irányok (olvasás)' },
      { address: '$DC04 / $DC05', name: 'TIMERA_LO / HI', bits: '16-bit Count', description: 'Timer A counter latch (counts CPU clock pulses down to 0)', descriptionHu: 'A Időzítő 16-bites számlálója (lefelé számol az órajel ütemére)' },
      { address: '$DC06 / $DC07', name: 'TIMERB_LO / HI', bits: '16-bit Count', description: 'Timer B counter latch', descriptionHu: 'B Időzítő 16-bites számlálója' },
      { address: '$DC08-$DC0B', name: 'TOD_TENTHS..HOURS', bits: 'BCD Time', description: 'Time of Day Real Time Clock (Tenths, Secs, Mins, Hours with AM/PM & Alarm)', descriptionHu: 'Valós idejű óra (Tizedmásodperc, Másodperc, Perc, Óra, Ébresztés)' },
      { address: '$DC0D', name: 'ICR (Interrupt Ctrl)', bits: 'SET, TA, TB, TOD, SDR, FLG', description: 'Interrupt Control Register: enable/read timer, TOD, and serial port interrupts', descriptionHu: 'Megszakításvezérlő: időzítő, óra és soros port megszakítások' },
    ],
    internalBlocks: [
      { title: '2x 8-Bit Bidirectional I/O Ports', titleHu: '2x 8-Bites Kétirányú I/O Port', description: 'Independent data direction registers (DDRA, DDRB) driving keyboard matrix and reading joysticks.', descriptionHu: 'Független adatirány-regiszterek a billentyűzetmátrix meghajtására és botkormányok olvasására.' },
      { title: '2x 16-Bit Precision Timers (A & B)', titleHu: '2x 16-Bites Precíziós Időzítő', description: 'Programmable interval timers capable of one-shot, continuous, cascade, and external pulse counting.', descriptionHu: 'Programozható intervallum-időzítők egyszeri, folyamatos és kaszkádolt számlálási móddal.' },
      { title: 'BCD Real-Time Clock (TOD)', titleHu: 'BCD Valós Idejű Óra (TOD)', description: '50Hz/60Hz AC line frequency synchronized clock accurate to 0.1 seconds with programmable alarm interrupt.', descriptionHu: '50Hz/60Hz hálózati frekvenciához szinkronizált valós idejű óra 0.1 másodperces pontossággal és ébresztéssel.' },
    ],
  },

  MOS_6526_CIA2: {
    id: 'MOS_6526_CIA2',
    chipDesignator: 'U2',
    partNumber: 'MOS 6526 CIA 2',
    name: 'Complex Interface Adapter 2 (VIC-II Bank Switch, IEC Floppy & NMI)',
    nameHu: 'Komplex Interfész Illesztő 2 (VIC-II Bankváltás, IEC Floppy & NMI)',
    packageType: 'DIP-40',
    category: 'INTERFACE',
    designer: 'MOS Technology',
    clockSpeed: '0.985 MHz (PAL) / 1.023 MHz (NTSC)',
    summary: 'Controls the 1541 Floppy Drive via the IEC serial bus, switches the 16KB memory bank for the VIC-II graphics chip, drives the User Port, and fires Non-Maskable Interrupts (NMI).',
    summaryHu: 'Vezérli az 1541-es floppy meghajtót az IEC soros buszon, kiválasztja a VIC-II grafikus chip 16KB-os memóriabankját, kezeli a User Portot és NMI megszakítást küld.',
    detailedDescription: 'CIA 2 is mapped at $DD00-$DDFF. Port A bits 0-1 are inverted address lines A14 and A15 for the VIC-II (00=Bank 3 $C000-$FFFF, 01=Bank 2 $8000-$BFFF, 10=Bank 1 $4000-$7FFF, 11=Bank 0 $0000-$3FFF). Port A bits 3-5 drive the IEC Serial bus lines (ATN OUT, CLK OUT, DATA OUT) to communicate with floppy drives and printers.',
    detailedDescriptionHu: 'A CIA 2 a $DD00-$DDFF címtartományban működik. Port A 0-1 bitjei alkotják a VIC-II invertált A14 és A15 címvonalait (00=Bank 3 $C000-$FFFF, 01=Bank 2 $8000-$BFFF, 10=Bank 1 $4000-$7FFF, 11=Bank 0 $0000-$3FFF). A 3-5 bitek az IEC soros buszt (ATN, CLK, DATA) vezérlik a lemezmeghajtó felé.',
    pins: [
      { pinNumber: 2, name: 'PA0-PA1', type: 'OUT', description: 'VIC-II 16KB Video Bank Selector (A14/A15 inv)', descriptionHu: 'VIC-II 16KB Videó Bank Választó (invertált A14/A15)' },
      { pinNumber: 5, name: 'PA3', type: 'OUT', description: 'IEC Serial ATN (Attention) OUT', descriptionHu: 'IEC Soros ATN (Figyelem) kimenet' },
      { pinNumber: 6, name: 'PA4', type: 'OUT', description: 'IEC Serial CLOCK OUT', descriptionHu: 'IEC Soros ÓRAJELEK kimenet' },
      { pinNumber: 7, name: 'PA5', type: 'OUT', description: 'IEC Serial DATA OUT', descriptionHu: 'IEC Soros ADATOK kimenet' },
      { pinNumber: 8, name: 'PA6', type: 'IN', description: 'IEC Serial CLOCK IN', descriptionHu: 'IEC Soros ÓRAJELEK bemenet' },
      { pinNumber: 9, name: 'PA7', type: 'IN', description: 'IEC Serial DATA IN', descriptionHu: 'IEC Soros ADATOK bemenet' },
      { pinNumber: 10, name: 'PB0-PB7', type: 'INOUT', description: 'User Port 8-Bit Parallel Bus / RS-232 lines', descriptionHu: 'User Port 8-bites párhuzamos busz / RS-232 vonalak' },
      { pinNumber: 21, name: '/NMI', type: 'OUT', description: 'Connected to 6510 CPU /NMI line (RESTORE / Disk Transfer)', descriptionHu: 'A 6510 CPU /NMI lábára kötve (RESTORE gomb / Lemezátvitel)' },
      { pinNumber: 24, name: '/CS', type: 'IN', description: 'Chip select ($DD00-$DDFF)', descriptionHu: 'Chip select ($DD00-$DDFF)' },
    ],
    registers: [
      { address: '$DD00', name: 'CI2_PORTA', bits: 'DATA_IN, CLK_IN, DATA_OUT, CLK_OUT, ATN_OUT, RS232, VIC_BANK(2)', description: 'VIC-II 16KB Bank selection (bits 0-1) and IEC Serial Bus protocol bits (bits 3-7)', descriptionHu: 'VIC-II 16KB Bank választás (0-1 bit) és IEC soros busz bitek (3-7 bit)' },
      { address: '$DD01', name: 'CI2_PORTB', bits: 'PB0-PB7', description: 'User Port 8-bit parallel line (used by RS-232 modems, sound samplers, eprom programmers)', descriptionHu: 'User Port 8-bites párhuzamos adatvonal (modemek, hangsamplerek, programozók)' },
      { address: '$DD04-$DD07', name: 'TIMERA / B', bits: '16-bit Count', description: 'Used for RS-232 baud rate timing and fast serial disk fastloaders', descriptionHu: 'RS-232 baud sebességhez és gyorstöltőkhöz használt precíziós időzítők' },
      { address: '$DD0D', name: 'ICR (Interrupt Ctrl)', bits: 'SET, TA, TB, TOD, SDR, FLG', description: 'Triggers Non-Maskable Interrupts (NMI) on CPU', descriptionHu: 'Nem-maszkolható megszakításokat (NMI) indít a CPU-n' },
    ],
    internalBlocks: [
      { title: 'IEC Serial Bus Bit-Banger Engine', titleHu: 'IEC Soros Busz Kézfogás Motor', description: 'Drives serial clock, data, and attention lines to coordinate asynchronous packet transfers with 1541 disk drives.', descriptionHu: 'Órajel, adat és figyelem vonalakat hajt meg a csomagátvitelhez az 1541-es lemezmeghajtókkal.' },
      { title: 'VIC-II Memory Bank Mapper', titleHu: 'VIC-II Memóriabank Választó', description: 'Re-routes VIC-II top address lines (A14/A15) allowing the graphics chip to look into any 16KB chunk of 64KB RAM.', descriptionHu: 'Átirányítja a VIC-II felső címvonalait (A14/A15), hogy a grafikus chip a 64KB RAM bármely 16KB-os szeletét láthassa.' },
    ],
  },

  SRAM_2114_COLOR: {
    id: 'SRAM_2114_COLOR',
    chipDesignator: 'U6',
    partNumber: '2114 Static RAM (1K x 4-Bit)',
    name: '1024 x 4-Bit Static Color RAM',
    nameHu: '1024 x 4-Bites Statikus Szín-RAM',
    packageType: 'DIP-18',
    category: 'MEMORY',
    designer: 'Intel / Intersil / NEC',
    summary: 'Stores the 4-bit foreground color (0 to 15) for each of the 1,000 character cells on screen. Mapped at $D800-$DBFF in the I/O area.',
    summaryHu: 'A képernyő 1000 karaktermátrix cellájának 4-bites előtérszínét (0-15) tárolja. A $D800-$DBFF címtartományban érhető el az I/O területen.',
    detailedDescription: 'The Color RAM provides 4 bits of data per character position (bits D0-D3). During CPU Phase 2 (Φ2), the CPU writes color values directly to $D800-$DBFF. During Phase 1 (Φ1) or Bad Line cycles, the VIC-II reads the 4-bit color nybble simultaneously with the character code from main RAM.',
    detailedDescriptionHu: 'A Szín-RAM 4 bit adatot tárol karakterenként (D0-D3). A CPU Phase 2 (Φ2) alatt a programok közvetlenül írhatják a színeket a $D800-$DBFF címekre. Phase 1 alatt a VIC-II a Szín-RAM-ból és a fő RAM-ból egyszerre olvassa be a karakterszínt és a betűkódot.',
    pins: [
      { pinNumber: 1, name: 'A0-A9', type: 'IN', description: '10-bit address bus for 1,024 memory locations', descriptionHu: '10-bites címbusz 1024 rekesz megcímzéséhez' },
      { pinNumber: 8, name: '/CS', type: 'IN', description: 'Chip Select ($D800-$DBFF from PLA / 74LS139)', descriptionHu: 'Chip Select ($D800-$DBFF a PLA-ból)' },
      { pinNumber: 10, name: '/WE', type: 'IN', description: 'Write Enable (/GR_W gate)', descriptionHu: 'Írásengedélyező jel' },
      { pinNumber: 11, name: 'IO0-IO3', type: 'INOUT', description: '4-bit bidirectional data lines (D0-D3)', descriptionHu: '4-bites kétirányú adatvonalak (D0-D3)' },
    ],
    internalBlocks: [
      { title: '1,024 x 4-Bit NMOS Static Cell Array', titleHu: '1024 x 4-Bites NMOS Statikus Cella Mező', description: 'Fast static RAM requiring no dynamic refresh cycles.', descriptionHu: 'Gyors statikus RAM, amely nem igényel frissítési ciklust.' },
    ],
  },

  DRAM_64K: {
    id: 'DRAM_64K',
    chipDesignator: 'U9-U12 / U21-U24',
    partNumber: '8x 4164 (64K x 1-Bit) or 2x 41464 (64K x 4-Bit)',
    name: '64 Kilobyte Dynamic RAM Matrix',
    nameHu: '64 Kilobájtos Dinamikus Főmemória (DRAM)',
    packageType: 'DIP-16',
    category: 'MEMORY',
    designer: 'Mostek / Micron / Texas Instruments',
    summary: 'The main working memory of the C64. A full 65,536 bytes of RAM accessible across the entire address space.',
    summaryHu: 'A C64 fő operatív memóriája. Teljes 65 536 bájt RAM, amely a teljes címtartományban elérhető.',
    detailedDescription: 'In early C64 revisions, 8 separate 4164 (64K x 1-bit) chips formed the 64KB RAM. Multiplexed address lines (RAS/CAS) are driven by 74LS257 multiplexers. The VIC-II chip automatically performs dynamic DRAM refresh during the horizontal blanking periods of each scan line using CAS-before-RAS refresh pulses.',
    detailedDescriptionHu: 'A korai C64-ekben 8 darab 4164 (64K x 1-bit) IC alkotta a 64KB RAM-ot. A multiplexelt címvonalakat (RAS/CAS) 74LS257 multiplexerek hajtják. A VIC-II automatikusan frissíti a dinamikus RAM-ot minden sorminta végén a vízszintes visszafutás (horizontal blank) alatt.',
    pins: [
      { pinNumber: 1, name: '/RAS', type: 'IN', description: 'Row Address Strobe', descriptionHu: 'Sorcím beíró órajel' },
      { pinNumber: 2, name: '/CAS', type: 'IN', description: 'Column Address Strobe (gated by PLA /CASRAM)', descriptionHu: 'Oszlopcím beíró órajel' },
      { pinNumber: 3, name: 'D_IN / D_OUT', type: 'INOUT', description: 'Multiplexed 8-bit system data bus', descriptionHu: 'Multiplexelt 8-bites rendszer adatbusz' },
      { pinNumber: 4, name: 'A0-A7', type: 'IN', description: '8-bit multiplexed row/column address lines', descriptionHu: '8-bites multiplexelt sor/oszlop címvonalak' },
    ],
    internalBlocks: [
      { title: '65,536-Byte Capacitor Matrix', titleHu: '65 536 Bájtos Kondenzátor Mátrix', description: 'High-density storage cells requiring periodic refresh every 2ms to prevent data loss.', descriptionHu: 'Nagy sűrűségű tárolócellák, melyek 2 ezredmásodpercenként frissítést igényelnek.' },
    ],
  },

  ROM_BASIC: {
    id: 'ROM_BASIC',
    chipDesignator: 'U3',
    partNumber: 'MOS 901226-01 (8K x 8-Bit ROM)',
    name: 'BASIC V2 Interpreter ROM ($A000-$BFFF)',
    nameHu: 'BASIC V2 Értelmező ROM ($A000-$BFFF)',
    packageType: 'DIP-24',
    category: 'MEMORY',
    designer: 'Microsoft & Commodore',
    summary: '8KB Mask ROM containing the Commodore BASIC V2 programming language interpreter.',
    summaryHu: '8KB Maszk ROM, amely a Commodore BASIC V2 programozási nyelv értelmezőjét tartalmazza.',
    detailedDescription: 'When LORAM (Port $01 bit 0) is High, reads from $A000-$BFFF are directed to the BASIC ROM. When LORAM is Low, the CPU reads the underlying 8KB of RAM instead. Writes to $A000-$BFFF always write into RAM, allowing seamless loading of machine code under ROM!',
    detailedDescriptionHu: 'Amikor a LORAM (Port $01 0. bit) Magas, a $A000-$BFFF tartományból olvasva a BASIC ROM válaszol. Ha a LORAM Alacsony, a CPU az alatta lévő 8KB RAM-ot olvassa. Az írás mindig a RAM-ba történik, lehetővé téve gépi kód betöltését a ROM alá!',
    pins: [
      { pinNumber: 1, name: 'A0-A12', type: 'IN', description: '13-bit address bus for 8KB selection', descriptionHu: '13-bites címbusz 8KB eléréséhez' },
      { pinNumber: 12, name: '/CS', type: 'IN', description: 'Chip Select from PLA /BASIC line', descriptionHu: 'Chip Select a PLA /BASIC vonaláról' },
      { pinNumber: 13, name: 'D0-D7', type: 'OUT', description: '8-bit instruction opcode and token data', descriptionHu: '8-bites utasításkód és token adatbusz' },
    ],
    internalBlocks: [
      { title: 'BASIC V2 Runtime & Tokenizer', titleHu: 'BASIC V2 Futtatókörnyezet és Tokenizáló', description: 'Tokenizes commands (PRINT=153, GOTO=137), evaluates arithmetic, and executes programs.', descriptionHu: 'Tokenizálja a parancsokat (PRINT=153, GOTO=137), számolja a matematikai kifejezéseket és futtatja a programot.' },
    ],
  },

  ROM_KERNAL: {
    id: 'ROM_KERNAL',
    chipDesignator: 'U4',
    partNumber: 'MOS 901227-03 (8K x 8-Bit ROM)',
    name: 'KERNAL Operating System ROM ($E000-$FFFF)',
    nameHu: 'KERNAL Operációs Rendszer ROM ($E000-$FFFF)',
    packageType: 'DIP-24',
    category: 'MEMORY',
    designer: 'Commodore (Bob Fairbairn / Robert Russell)',
    summary: '8KB Mask ROM containing the operating system, device I/O drivers, interrupt handlers, and jump vectors.',
    summaryHu: '8KB Maszk ROM, amely az operációs rendszert, periféria meghajtókat, megszakításkezelőket és ugrótáblákat tartalmazza.',
    detailedDescription: 'The KERNAL contains the standardized jump table at $FF81-$FFF5 (CHRIN, CHROUT, LOAD, SAVE, GETIN) ensuring software compatibility. It also holds the 6502 hardware interrupt vectors at $FFFA (NMI), $FFFC (RESET), and $FFFE (IRQ/BRK). Controlled by the HIRAM bit (Port $01 bit 1).',
    detailedDescriptionHu: 'A KERNAL tartalmazza a szabványos $FF81-$FFF5 ugrótáblát (CHRIN, CHROUT, LOAD, SAVE, GETIN) és a hardveres 6502-es vektorokat: $FFFA (NMI), $FFFC (RESET) és $FFFE (IRQ/BRK). A HIRAM bit (Port $01 1. bit) vezérli.',
    pins: [
      { pinNumber: 1, name: 'A0-A12', type: 'IN', description: '13-bit address bus for 8KB selection', descriptionHu: '13-bites címbusz 8KB eléréséhez' },
      { pinNumber: 12, name: '/CS', type: 'IN', description: 'Chip Select from PLA /KERNAL line', descriptionHu: 'Chip Select a PLA /KERNAL vonaláról' },
      { pinNumber: 13, name: 'D0-D7', type: 'OUT', description: '8-bit OS code and hardware vectors', descriptionHu: '8-bites OS kód és hardver vektorok' },
    ],
    internalBlocks: [
      { title: 'Standardized Jump Table ($FF81-$FFF5)', titleHu: 'Szabványos Ugrótábla ($FF81-$FFF5)', description: '39 fixed entry points for screen printing, keyboard scanning, and disk/tape I/O.', descriptionHu: '39 fix belépési pont képernyőkezeléshez, billentyűzetolvasáshoz és lemezműveletekhez.' },
      { title: 'Hardware Vectors ($FFFA-$FFFF)', titleHu: 'Hardveres Vektorok ($FFFA-$FFFF)', description: 'Directs the CPU on Reset, NMI, and IRQ/BRK interrupts.', descriptionHu: 'Irányítja a CPU-t Reset, NMI és IRQ/BRK megszakítások esetén.' },
    ],
  },

  ROM_CHARGEN: {
    id: 'ROM_CHARGEN',
    chipDesignator: 'U5',
    partNumber: 'MOS 901225-01 (4K x 8-Bit ROM)',
    name: 'Character Generator ROM ($D000-$DFFF)',
    nameHu: 'Karaktergenerátor ROM ($D000-$DFFF)',
    packageType: 'DIP-24',
    category: 'MEMORY',
    designer: 'Commodore Semiconductor Group',
    summary: '4KB ROM containing 512 different 8x8 font glyphs (256 PETSCII uppercase/graphics + 256 lowercase/uppercase glyphs).',
    summaryHu: '4KB ROM, amely 512 darab 8x8 pixeles betűképet tárol (256 PETSCII nagybetű/grafika + 256 kisbetű/nagybetű).',
    detailedDescription: 'The Character ROM shares the $D000-$DFFF address space with the I/O chips. When CHAREN (Port $01 bit 2) is 0, CPU reads see the Character ROM instead of I/O registers. The VIC-II can also read the Character ROM directly when fetching font patterns for text mode display.',
    detailedDescriptionHu: 'A Karakter ROM a $D000-$DFFF címtartományt osztja meg az I/O chipekkel. Ha a CHAREN (Port $01 2. bit) 0, a CPU a betűképeket látja az I/O regiszterek helyett. A VIC-II közvetlenül olvassa a Karakter ROM-ot szöveges képernyő megjelenítésekor.',
    pins: [
      { pinNumber: 1, name: 'A0-A11', type: 'IN', description: '12-bit address bus for 4KB selection', descriptionHu: '12-bites címbusz 4KB eléréséhez' },
      { pinNumber: 12, name: '/CS', type: 'IN', description: 'Chip Select from PLA /CHAROM line', descriptionHu: 'Chip Select a PLA /CHAROM vonaláról' },
      { pinNumber: 13, name: 'D0-D7', type: 'OUT', description: '8-bit character pixel rows (1=pixel, 0=bg)', descriptionHu: '8-bites karaktersor pixelek (1=pixel, 0=háttér)' },
    ],
    internalBlocks: [
      { title: '512x 8x8 Bitmap Glyph Matrix', titleHu: '512x 8x8 Pixeles Betűkép Mátrix', description: 'Stores standard uppercase/graphics and lowercase text mode fonts.', descriptionHu: 'A standard nagybetűs/grafikus és kisbetűs szöveges betűtípusokat tárolja.' },
    ],
  },

  PORT_IEC: {
    id: 'PORT_IEC',
    chipDesignator: 'CN2',
    partNumber: '6-Pin DIN IEC Serial Bus',
    name: 'Commodore Serial IEC Bus Port (1541 Floppy & Printers)',
    nameHu: 'Commodore Soros IEC Busz Port (1541 Floppy & Nyomtatók)',
    packageType: 'EXPANSION',
    category: 'PORT',
    summary: 'Standard Commodore serial communication bus for connecting 1541 disk drives, 1571/1581 drives, and MPS-801 dot-matrix printers.',
    summaryHu: 'Szabványos Commodore soros busz 1541/1571/1581 floppy meghajtók és MPS-801 mátrixnyomtatók csatlakoztatására.',
    detailedDescription: 'The IEC bus is an asynchronous serial implementation of the IEEE-488 standard. It uses 3 open-collector lines driven by CIA2: ATN (Attention), CLK (Clock), and DATA (Bidirectional data). Devices are daisy-chained with device addresses 8 to 11 for disk drives and 4 to 5 for printers.',
    detailedDescriptionHu: 'Az IEC busz az IEEE-488 szabvány aszinkron soros adaptációja. 3 nyitott kollektoros vonalat használ a CIA2 vezérlésével: ATN (Figyelem), CLK (Órajel) és DATA (Kétirányú adat). Az eszközök láncolhatók (8-11 cím: lemezmeghajtók, 4-5 cím: nyomtatók).',
    pins: [
      { pinNumber: 1, name: 'SRQ IN', type: 'IN', description: 'Fast serial service request line', descriptionHu: 'Gyors soros megszakításkérés vonal' },
      { pinNumber: 2, name: 'GND', type: 'POWER', description: 'Ground', descriptionHu: 'Földelés' },
      { pinNumber: 3, name: 'ATN', type: 'INOUT', description: 'Attention: Asserted by C64 to broadcast commands', descriptionHu: 'Figyelem: A C64 húzza le parancsok kiküldésekor' },
      { pinNumber: 4, name: 'CLK', type: 'INOUT', description: 'Clock: Synchronizes serial bits', descriptionHu: 'Órajel: Szinkronizálja a soros adatbitek átvitelét' },
      { pinNumber: 5, name: 'DATA', type: 'INOUT', description: 'Data: Serial data bit stream', descriptionHu: 'Adat: Soros adatfolyam' },
      { pinNumber: 6, name: '/RESET', type: 'OUT', description: 'Resets all connected peripheral drives', descriptionHu: 'Alaphelyzetbe állítja a csatlakoztatott meghajtókat' },
    ],
    internalBlocks: [
      { title: 'Open-Collector Handshake Bus', titleHu: 'Nyitott Kollektoros Kézfogás Busz', description: 'Allows multiple devices to listen and signal ready status without bus contention.', descriptionHu: 'Lehetővé teszi több eszköz egyidejű figyelését és kész állapot jelzését ütközés nélkül.' },
    ],
  },

  PORT_CARTRIDGE: {
    id: 'PORT_CARTRIDGE',
    chipDesignator: 'CN5',
    partNumber: '44-Pin Expansion Port',
    name: '44-Pin Expansion & Cartridge Port',
    nameHu: '44-Pólusú Bővítő és Kártya Csatlakozó',
    packageType: 'EXPANSION',
    category: 'PORT',
    summary: 'Direct access to the 16-bit address bus, 8-bit data bus, PLA /ROML /ROMH lines, DMA line, and cartridge control signals GAME and EXROM.',
    summaryHu: 'Közvetlen hozzáférés a 16-bites címbuszhoz, 8-bites adatbuszhoz, a PLA /ROML /ROMH vonalaihoz, DMA vonalhoz és a GAME / EXROM lábakhoz.',
    detailedDescription: 'The Cartridge Port allows instant game loading (e.g. Final Cartridge, Action Replay, Super Snapshot, EasyFlash) and hardware acceleration (REU RAM Expansion Units, SuperCPU 20MHz 65816 accelerator). Pulling GAME and EXROM LOW causes the PLA to map 16KB of external cartridge ROM directly at $8000-$9FFF and $E000-$FFFF, bypassing the KERNAL on boot!',
    detailedDescriptionHu: 'A kártyacsatlakozó azonnali játékbetöltést (pl. Final Cartridge, Action Replay, EasyFlash) és hardveres bővítést (REU memória, SuperCPU 20MHz gyorsító) biztosít. A GAME és EXROM lehúzásával a PLA 16KB külső kártya-ROM-ot kapcsol $8000-nél és $E000-nál, megkerülve a boot folyamatot!',
    pins: [
      { pinNumber: 1, name: 'GND', type: 'POWER', description: 'Ground', descriptionHu: 'Földelés' },
      { pinNumber: 2, name: '+5V', type: 'POWER', description: '+5V Power Supply', descriptionHu: '+5V Tápfeszültség' },
      { pinNumber: 8, name: '/GAME', type: 'IN', description: 'Cartridge GAME line (grounds to map $8000 8K ROM)', descriptionHu: 'GAME vonal: 8KB ROM-ot kapcsol $8000-nál' },
      { pinNumber: 9, name: '/EXROM', type: 'IN', description: 'Cartridge EXROM line (grounds to map 16KB / Ultimax)', descriptionHu: 'EXROM vonal: 16KB / Ultimax módot kapcsol' },
      { pinNumber: 11, name: '/ROML', type: 'OUT', description: 'Read select for $8000-$9FFF Cartridge ROM', descriptionHu: 'Olvasás-kiválasztás $8000-$9FFF kártya ROM-hoz' },
      { pinNumber: 12, name: '/ROMH', type: 'OUT', description: 'Read select for $A000 / $E000 Cartridge ROM', descriptionHu: 'Olvasás-kiválasztás $A000 / $E000 kártya ROM-hoz' },
      { pinNumber: 13, name: '/DMA', type: 'IN', description: 'Direct Memory Access: allows external CPU to take over bus', descriptionHu: 'Közvetlen memóriahozzáférés: külső CPU átveheti a buszt' },
    ],
    internalBlocks: [
      { title: 'Full System Bus Extension', titleHu: 'Teljes Rendszerbusz Kivezetés', description: 'Unbuffered access to CPU and system signals with full DMA master capability.', descriptionHu: 'Pufferelés nélküli hozzáférés a CPU és rendszerjelekhez teljes DMA átvétellel.' },
    ],
  },

  PORT_USER: {
    id: 'PORT_USER',
    chipDesignator: 'CN3',
    partNumber: '24-Pin User Port Edge Connector',
    name: '24-Pin General Purpose User Port',
    nameHu: '24-Pólusú Általános Felhasználói Port (User Port)',
    packageType: 'EXPANSION',
    category: 'PORT',
    summary: 'Parallel 8-bit user port directly connected to CIA2 Port B, supplying 9V AC power for modems, samplers, and EPROM programmers.',
    summaryHu: 'Párhuzamos 8-bites port közvetlenül a CIA2 Port B lábaira kötve, 9V AC tápellátással modemekhez, samplerekhez és égetőkhöz.',
    detailedDescription: 'The User Port provides 8 independent digital I/O lines (PB0-PB7 from CIA2), handshake lines (/PC2, FLAG2, SP2, CNT2), and 9V AC power. Frequently used for 300/1200 baud telephone modems, MIDI interfaces, Wi-Fi modems, digital sound digitizers, and robotic controllers.',
    detailedDescriptionHu: 'A User Port 8 független digitális I/O vonalat (CIA2 PB0-PB7), kézfogásjeleket és 9V AC tápot biztosít. Gyakran használták modemekhez, MIDI interfészekhez, Wi-Fi modulokhoz, hangdigitalizálókhoz és robotvezérlőkhöz.',
    pins: [
      { pinNumber: 1, name: 'GND', type: 'POWER', description: 'System Ground', descriptionHu: 'Rendszer Földelés' },
      { pinNumber: 2, name: '+5V', type: 'POWER', description: '+5V DC Power (up to 100mA)', descriptionHu: '+5V DC Tápellátás' },
      { pinNumber: 10, name: '9V AC (1)', type: 'POWER', description: '9V AC Power from transformer (pin 1)', descriptionHu: '9V AC Tápellátás a transzformátorból' },
      { pinNumber: 11, name: '9V AC (2)', type: 'POWER', description: '9V AC Power from transformer (pin 2)', descriptionHu: '9V AC Tápellátás a transzformátorból' },
      { pinNumber: 14, name: 'PB0-PB7', type: 'INOUT', description: '8-bit parallel digital I/O from CIA2', descriptionHu: '8-bites párhuzamos digitális I/O a CIA2-ből' },
    ],
    internalBlocks: [
      { title: 'Direct CIA2 Parallel Channel', titleHu: 'Közvetlen CIA2 Párhuzamos Csatorna', description: 'Enables custom hardware interfacing with zero extra glue logic.', descriptionHu: 'Egyedi hardverek illesztését teszi lehetővé illesztő áramkörök nélkül.' },
    ],
  },

  PORT_JOYSTICK: {
    id: 'PORT_JOYSTICK',
    chipDesignator: 'CN1 / CN4',
    partNumber: 'Dual DE-9 Control Ports (Port 1 & Port 2)',
    name: 'Dual Atari-Compatible DE-9 Joystick / Paddle Ports',
    nameHu: 'Kettős DE-9 Botkormány és Paddle Portok (Port 1 & Port 2)',
    packageType: 'EXPANSION',
    category: 'PORT',
    summary: 'Standard DE-9 connectors for joysticks, analog paddles, Commodore 1351 proportional mouse, and lightpens.',
    summaryHu: 'Szabványos DE-9 csatlakozók botkormányokhoz, analóg paddle-ökhöz, 1351 arányos egérhez és fényceruzához.',
    detailedDescription: 'Digital directional switches (Up, Down, Left, Right, Fire) are read by CIA1 Ports A and B. Analog paddle potentiometers and the 1351 proportional mouse are routed into the SID chip POTX and POTY analog-to-digital converter inputs ($D419/$D41A). Lightpen trigger pulses connect directly to the VIC-II chip LP input ($D013/$D014).',
    detailedDescriptionHu: 'A digitális iránykapcsolókat (Fel, Le, Balra, Jobbra, Tűz) a CIA1 Port A és B olvassa be. Az analóg potméterek és az 1351 egér a SID chip POTX és POTY A/D bemeneteire futnak be ($D419/$D41A). A fényceruza jele közvetlenül a VIC-II LP lábára kapcsolódik ($D013/$D014).',
    pins: [
      { pinNumber: 1, name: 'JOY UP / POTY', type: 'IN', description: 'Up switch (grounded) / Analog Pot Y', descriptionHu: 'Fel kapcsoló (földelt) / Analóg Pot Y' },
      { pinNumber: 2, name: 'JOY DOWN', type: 'IN', description: 'Down switch (grounded)', descriptionHu: 'Le kapcsoló (földelt)' },
      { pinNumber: 3, name: 'JOY LEFT', type: 'IN', description: 'Left switch (grounded)', descriptionHu: 'Balra kapcsoló (földelt)' },
      { pinNumber: 4, name: 'JOY RIGHT', type: 'IN', description: 'Right switch (grounded)', descriptionHu: 'Jobbra kapcsoló (földelt)' },
      { pinNumber: 5, name: 'POTX', type: 'IN', description: 'Analog Pot X (connected to SID A/D)', descriptionHu: 'Analóg Pot X (a SID A/D bemenetére kötve)' },
      { pinNumber: 6, name: 'FIRE / LIGHTPEN', type: 'IN', description: 'Fire button / Lightpen pulse input', descriptionHu: 'Tűzgomb / Fényceruza impulzus bemenet' },
      { pinNumber: 7, name: '+5V', type: 'POWER', description: '+5V Power Supply for active devices/mice', descriptionHu: '+5V Tápellátás aktív egerekhez' },
      { pinNumber: 8, name: 'GND', type: 'POWER', description: 'Ground', descriptionHu: 'Földelés' },
    ],
    internalBlocks: [
      { title: 'Digital Matrix & Analog Hybrid Interface', titleHu: 'Digitális Mátrix & Analóg Hibrid Interfész', description: 'Combines TTL digital scanning with precision analog RC timing converters in the SID.', descriptionHu: 'Kombinálja a TTL digitális pásztázást a SID analóg RC időzítő átalakítóival.' },
    ],
  },
};

export const C64_SCENARIOS: C64Scenario[] = [
  {
    id: 'PHASE_INTERLEAVING',
    title: 'Dual-Phase Clock Interleaving (Φ1 / Φ2 Bus Sharing)',
    titleHu: 'Kétfázisú Órajel-Váltakozás (Φ1 / Φ2 Buszmegosztás)',
    summary: 'Watch how the VIC-II graphics chip and 6510 CPU transparently share the 64KB RAM bus at 1 MHz with zero wait states or memory contention.',
    summaryHu: 'Figyeld meg, hogyan osztja meg a VIC-II grafikus chip és a 6510 CPU a 64KB RAM buszt 1 MHz-en várakozási állapotok és memóriakonfliktus nélkül.',
    badge: 'Alapvető Architektúra',
    steps: [
      {
        stepIndex: 1,
        title: 'Phase 1 (Φ1): VIC-II Takes the Memory Bus',
        titleHu: 'Phase 1 (Φ1): A VIC-II Birtokolja a Memóriabuszt',
        description: 'During the high half of the Phase 1 clock, the VIC-II drives the address bus to fetch character codes from the screen matrix ($0400-$07E7) or sprite pixel data. The CPU internal registers update without touching the bus.',
        descriptionHu: 'A Phase 1 órajel magas félperiódusában a VIC-II hajtja meg a címbuszt, hogy beolvassa a képernyőmátrix karakterkódjait ($0400-$07E7) vagy a sprite pixeleket. A CPU belső regiszterei frissülnek a busz érintése nélkül.',
        activeChips: ['MOS_6569_VIC2', 'DRAM_64K', 'SRAM_2114_COLOR'],
        activeBuses: [
          { bus: 'ADDRESS', from: 'MOS_6569_VIC2', to: 'DRAM_64K', signalName: 'A0-A13 (Multiplexed)', valueHex: '$0400' },
          { bus: 'DATA', from: 'DRAM_64K', to: 'MOS_6569_VIC2', signalName: 'D0-D7 (Character Code)', valueHex: '$01 (A)' },
          { bus: 'DATA', from: 'SRAM_2114_COLOR', to: 'MOS_6569_VIC2', signalName: 'D0-D3 (Color Nybble)', valueHex: '$0E (Lt Blue)' },
        ],
        phase: 'PHI_1',
        statusBadges: [
          { label: 'Φ1 CLOCK HIGH', color: 'cyan' },
          { label: 'VIC-II BUS MASTER', color: 'blue' },
          { label: 'CPU INTERNAL CYCLE', color: 'purple' },
        ],
      },
      {
        stepIndex: 2,
        title: 'Phase 2 (Φ2): 6510 CPU Takes the Memory Bus',
        titleHu: 'Phase 2 (Φ2): A 6510 CPU Birtokolja a Memóriabuszt',
        description: 'During Phase 2, the VIC-II releases the address lines (AEC High). The 6510 CPU outputs the Program Counter address ($A000-$FFFF or RAM) to fetch the next instruction opcode or read/write data operands.',
        descriptionHu: 'A Phase 2 alatt a VIC-II elengedi a címvonalakat (AEC Magas). A 6510 CPU kiadja a Program Counter címet ($A000-$FFFF vagy RAM) a következő utasításkód beolvasásához vagy adat írásához/olvasásához.',
        activeChips: ['MOS_6510', 'DRAM_64K', 'MOS_82S100_PLA', 'ROM_KERNAL'],
        activeBuses: [
          { bus: 'ADDRESS', from: 'MOS_6510', to: 'MOS_82S100_PLA', signalName: 'A0-A15 (PC)', valueHex: '$E544' },
          { bus: 'CONTROL', from: 'MOS_82S100_PLA', to: 'ROM_KERNAL', signalName: '/KERNAL = LOW' },
          { bus: 'DATA', from: 'ROM_KERNAL', to: 'MOS_6510', signalName: 'D0-D7 (Opcode)', valueHex: '$A9 (LDA #)' },
        ],
        phase: 'PHI_2',
        statusBadges: [
          { label: 'Φ2 CLOCK HIGH', color: 'green' },
          { label: '6510 CPU MASTER', color: 'purple' },
          { label: 'VIC-II INTERNAL PIPELINE', color: 'blue' },
        ],
      },
    ],
  },

  {
    id: 'BAD_LINE_DMA',
    title: '"Bad Line" DMA Steal & Character Matrix Fetch',
    titleHu: '"Bad Line" DMA Lopás és Karaktermátrix Beolvasás',
    summary: 'Every 8 raster lines in text mode, the VIC-II pulls BA LOW, stops the 6510 CPU, and fetches all 40 screen character codes + Color RAM nybbles.',
    summaryHu: 'Minden 8. rasztersorban a VIC-II alacsonyba húzza a BA jelet, megállítja a CPU-t, és beolvassa mind a 40 képernyőkarakter kódját és a Szín-RAM értékeit.',
    badge: 'Kritikus Grafikai Működés',
    steps: [
      {
        stepIndex: 1,
        title: 'Step 1: Raster Line Match & BA (Bus Available) Pulled Low',
        titleHu: '1. Lépés: Rasztersor Találat & BA (Bus Available) Alacsonyba Húzva',
        description: 'The raster counter reaches a Bad Line (lines $30, $38, $40...). Exactly 3 clock cycles before the visible screen starts, VIC-II pulls BA LOW. The CPU finishes its current multi-cycle instruction and halts on RDY.',
        descriptionHu: 'A raszterszámláló eléri a Bad Line sort ($30, $38, $40...). Pontosan 3 órajelciklussal a látható képernyő előtt a VIC-II alacsonyba húzza a BA jelet. A CPU befejezi a futó utasítást, majd a RDY lábon leáll.',
        activeChips: ['MOS_6569_VIC2', 'MOS_6510'],
        activeBuses: [
          { bus: 'CONTROL', from: 'MOS_6569_VIC2', to: 'MOS_6510', signalName: 'BA = LOW (DMA Warning)' },
        ],
        phase: 'PHI_1',
        statusBadges: [
          { label: 'RASTER LINE: $30', color: 'amber' },
          { label: 'BA = LOW', color: 'red' },
          { label: 'CPU HALT REQUESTED', color: 'amber' },
        ],
      },
      {
        stepIndex: 2,
        title: 'Step 2: AEC Pulled Low — VIC-II Steals Phase 2 Bus Cycles',
        titleHu: '2. Lépés: AEC Alacsonyba Húzva — A VIC-II Ellopja a Phase 2 Ciklusokat',
        description: 'VIC-II asserts AEC LOW, completely disconnecting the 6510 CPU address drivers. For the next 40 clock cycles, VIC-II owns BOTH Phase 1 and Phase 2, reading 40 consecutive character codes from $0400-$0427 into its internal line buffer!',
        descriptionHu: 'A VIC-II alacsonyba húzza az AEC-t, leválasztva a 6510 CPU-t a címbuszról. A következő 40 órajelben a VIC-II birtokolja a Phase 1 és Phase 2-t is, beolvasva 40 egymást követő karakterkódot a belső vonalpufferébe!',
        activeChips: ['MOS_6569_VIC2', 'DRAM_64K', 'SRAM_2114_COLOR', 'MOS_82S100_PLA'],
        activeBuses: [
          { bus: 'CONTROL', from: 'MOS_6569_VIC2', to: 'MOS_6510', signalName: 'AEC = LOW (CPU Tri-Stated)' },
          { bus: 'ADDRESS', from: 'MOS_6569_VIC2', to: 'DRAM_64K', signalName: 'A0-A9 ($0400-$0427 burst)', valueHex: '$0400..$0427' },
          { bus: 'DATA', from: 'DRAM_64K', to: 'MOS_6569_VIC2', signalName: '40 Character Codes', valueHex: 'Burst 40B' },
          { bus: 'DATA', from: 'SRAM_2114_COLOR', to: 'MOS_6569_VIC2', signalName: '40 Color Nybbles', valueHex: 'Burst 40N' },
        ],
        phase: 'BAD_LINE_STOLEN',
        statusBadges: [
          { label: 'BAD LINE ACTIVE (40-43 CYCLES)', color: 'red' },
          { label: 'CPU COMPLETELY FROZEN', color: 'red' },
          { label: 'VIC-II 100% BUS OCCUPIED', color: 'blue' },
        ],
      },
      {
        stepIndex: 3,
        title: 'Step 3: BA Restored High — CPU Resumes Execution',
        titleHu: '3. Lépés: BA Újra Magas — A CPU Folytatja a Végrehajtást',
        description: 'After the 40th character code is stored in the VIC-II internal buffer, BA and AEC return High. The 6510 CPU immediately resumes instruction execution where it was frozen.',
        descriptionHu: 'Miután a 40. karakterkód bekerült a VIC-II pufferébe, a BA és AEC visszatér Magas szintre. A 6510 CPU azonnal folytatja az utasítás-végrehajtást a megállási ponttól.',
        activeChips: ['MOS_6569_VIC2', 'MOS_6510', 'DRAM_64K'],
        activeBuses: [
          { bus: 'CONTROL', from: 'MOS_6569_VIC2', to: 'MOS_6510', signalName: 'BA = HIGH, AEC = HIGH' },
          { bus: 'ADDRESS', from: 'MOS_6510', to: 'DRAM_64K', signalName: 'A0-A15 (Resumed PC)', valueHex: '$0810' },
        ],
        phase: 'PHI_2',
        statusBadges: [
          { label: 'NORMAL OPERATION RESTORED', color: 'green' },
          { label: 'CPU RUNNING', color: 'green' },
        ],
      },
    ],
  },

  {
    id: 'KEYBOARD_SCAN',
    title: 'CIA 1 Keyboard Matrix Scan (64 Keys)',
    titleHu: 'CIA 1 Billentyűzetmátrix Pásztázás (64 Billentyű)',
    summary: 'See how CIA 1 and the KERNAL 60Hz interrupt routine drive Port A columns and read Port B rows to detect keypresses.',
    summaryHu: 'Nézd meg, hogyan vezérli a CIA 1 és a KERNAL 60Hz-es megszakítási rutinja a Port A oszlopokat és olvassa a Port B sorokat a billentyűlenyomások érzékelésére.',
    badge: 'I/O és Felhasználói Bevitel',
    steps: [
      {
        stepIndex: 1,
        title: '60Hz Timer IRQ Fires on CIA 1',
        titleHu: '60Hz-es Időzítő Megszakítás (IRQ) Indul a CIA 1-ben',
        description: 'CIA 1 Timer A counts down to 0, asserting /IRQ LOW to pin 4 of the 6510 CPU. The CPU finishes its current opcode, pushes Program Counter and Processor Status (P) to stack ($0100-$01FF), and jumps to the KERNAL IRQ handler at $FF48 -> $EA31.',
        descriptionHu: 'A CIA 1 Timer A 0-ra számol, és alacsonyba húzza a /IRQ lábat a 6510 CPU 4. lábán. A CPU elmenti a PC-t és a processzor állapotát a verembe ($0100-$01FF), majd a KERNAL $EA31 rutinra ugrik.',
        activeChips: ['MOS_6526_CIA1', 'MOS_6510', 'DRAM_64K', 'ROM_KERNAL'],
        activeBuses: [
          { bus: 'CONTROL', from: 'MOS_6526_CIA1', to: 'MOS_6510', signalName: '/IRQ = LOW' },
          { bus: 'ADDRESS', from: 'MOS_6510', to: 'DRAM_64K', signalName: 'SP ($01FA-$01FC Stack Push)', valueHex: '$01FC' },
        ],
        phase: 'PHI_2',
        statusBadges: [
          { label: '60Hz TICK', color: 'amber' },
          { label: 'IRQ VECTOR $EA31', color: 'green' },
        ],
      },
      {
        stepIndex: 2,
        title: 'Walking Zero Column Output to $DC00 (Port A)',
        titleHu: 'Lépegető Zéró Oszlopkimenet a $DC00 Címre (Port A)',
        description: 'The KERNAL scan routine writes bit patterns (e.g. $FE = 11111110b for Col 0, $FD for Col 1, $FB for Col 2...) to CIA1 Port A ($DC00). This pulls one keyboard column wire LOW.',
        descriptionHu: 'A KERNAL beíró rutinja bitmintákat (pl. $FE = 11111110b a 0. oszlophoz, $FD az 1. oszlophoz...) küld a CIA1 Port A ($DC00) regiszterbe, földelve egy billentyűzetoszlopot.',
        activeChips: ['MOS_6510', 'MOS_6526_CIA1'],
        activeBuses: [
          { bus: 'ADDRESS', from: 'MOS_6510', to: 'MOS_6526_CIA1', signalName: 'A0-A7', valueHex: '$DC00' },
          { bus: 'DATA', from: 'MOS_6510', to: 'MOS_6526_CIA1', signalName: 'PA0-PA7', valueHex: '$FD (Col 1 Selected)' },
        ],
        phase: 'PHI_2',
        statusBadges: [
          { label: 'COLUMN 1 GROUNDED', color: 'cyan' },
        ],
      },
      {
        stepIndex: 3,
        title: 'Row Input Read from $DC01 (Port B) & PETSCII Decode',
        titleHu: 'Sor Bemenet Kiolvasás a $DC01 Címről (Port B) & PETSCII Dekódolás',
        description: 'The CPU reads CIA1 Port B ($DC01). If the "W" key is pressed at Col 1 / Row 1, bit PB1 reads LOW ($FD). The KERNAL looks up the key in the PETSCII translation table ($EB81) and inserts the character code into the keyboard buffer ($0277).',
        descriptionHu: 'A CPU kiolvassa a CIA1 Port B ($DC01) állapotát. Ha a "W" billentyű le van nyomva (1. oszlop / 1. sor), a PB1 bit ALACSONY lesz ($FD). A KERNAL kikeresi a PETSCII kódot ($EB81 tábla) és beírja a billentyűzet-pufferbe ($0277).',
        activeChips: ['MOS_6526_CIA1', 'MOS_6510', 'DRAM_64K'],
        activeBuses: [
          { bus: 'DATA', from: 'MOS_6526_CIA1', to: 'MOS_6510', signalName: 'PB0-PB7 Read', valueHex: '$FD (Row 1 Pressed)' },
          { bus: 'ADDRESS', from: 'MOS_6510', to: 'DRAM_64K', signalName: 'Key Buffer $0277', valueHex: '$0277' },
        ],
        phase: 'PHI_2',
        statusBadges: [
          { label: 'KEY DETECTED: "W"', color: 'green' },
          { label: 'BUFFER UPDATED', color: 'cyan' },
        ],
      },
    ],
  },

  {
    id: 'SID_SOUND_SYNTH',
    title: 'SID 6581 Chiptune Voice Synthesis & Analog Filter',
    titleHu: 'SID 6581 Szólam Hangszintézis és Analóg Szűrő',
    summary: 'Trace the path of musical data from 6510 CPU poke commands into the SID 24-bit phase accumulator, ADSR envelope generator, and analog resonant filter.',
    summaryHu: 'Kövesd végig a zenei adatok útját a 6510 CPU POKE utasításaitól a SID 24-bites fázis-akkumulátorán, ADSR burkológörbéjén és analóg szűrőjén át.',
    badge: 'Legendás Analóg Hangzás',
    steps: [
      {
        stepIndex: 1,
        title: 'CPU Configures Voice 1 Frequency & Pulse Width ($D400-$D403)',
        titleHu: 'A CPU Beállítja az 1. Hang Frekvenciáját és Kitöltését ($D400-$D403)',
        description: 'The CPU writes 16-bit pitch frequency value $22CD (440 Hz concert pitch A4) to $D400/$D401 and sets a 50% square pulse width ($0800) at $D402/$D403.',
        descriptionHu: 'A CPU beírja a $22CD (440 Hz A4 normál zenei "A" hang) 16-bites frekvenciaértéket a $D400/$D401 címekre és 50%-os négyszög kitöltést ($0800) a $D402/$D403 címekre.',
        activeChips: ['MOS_6510', 'MOS_6581_SID', 'MOS_82S100_PLA'],
        activeBuses: [
          { bus: 'ADDRESS', from: 'MOS_6510', to: 'MOS_6581_SID', signalName: 'A0-A4', valueHex: '$D400' },
          { bus: 'DATA', from: 'MOS_6510', to: 'MOS_6581_SID', signalName: 'D0-D7', valueHex: '$CD (Freq Low)' },
        ],
        phase: 'PHI_2',
        statusBadges: [
          { label: 'PITCH: 440 Hz (A4)', color: 'purple' },
          { label: 'WAVE: SQUARE 50%', color: 'purple' },
        ],
      },
      {
        stepIndex: 2,
        title: 'CPU Sets ADSR & Asserts GATE Bit ($D404-$D406)',
        titleHu: 'A CPU Beállítja az ADSR-t és Bekapcsolja a GATE Bitet ($D404-$D406)',
        description: 'The CPU sets Attack/Decay to $09 and Sustain/Release to $F0, then writes $41 (Pulse Wave + GATE bit=1) to control register $D404. This triggers the digital envelope generator.',
        descriptionHu: 'A CPU az Attack/Decay értékét $09-re, a Sustain/Release-t $F0-ra állítja, majd $41-et (Négyszöghullám + GATE bit=1) ír a $D404 vezérlőregiszterbe, elindítva a burkológörbe felfutását.',
        activeChips: ['MOS_6510', 'MOS_6581_SID'],
        activeBuses: [
          { bus: 'ADDRESS', from: 'MOS_6510', to: 'MOS_6581_SID', signalName: 'A0-A4', valueHex: '$D404' },
          { bus: 'DATA', from: 'MOS_6510', to: 'MOS_6581_SID', signalName: 'D0-D7', valueHex: '$41 (Pulse + GATE)' },
        ],
        phase: 'PHI_2',
        statusBadges: [
          { label: 'GATE = 1 (NOTE ON)', color: 'green' },
          { label: 'ATTACK PHASE ACTIVE', color: 'amber' },
        ],
      },
      {
        stepIndex: 3,
        title: 'Analog State-Variable Filter & Audio Output (Pin 27)',
        titleHu: 'Analóg Állapotváltozós Szűrő & Audió Kimenet (27. Láb)',
        description: 'The digital oscillator waveform is fed into an on-chip multiplying DAC and shaped by the analog resonant filter (Low-pass 12dB/octave with external capacitors). The finished analog waveform outputs on Pin 27 to the audio jack.',
        descriptionHu: 'A digitális oszcillátor jele a szorzó DAC-on át az analóg rezonáns szűrőbe jut (12dB/oktávos aluláteresztő külső kondenzátorokkal). A kész analóg hang a 27. lábon távozik a hangszóró/erősítő felé.',
        activeChips: ['MOS_6581_SID'],
        activeBuses: [
          { bus: 'AUDIO_OUT', from: 'MOS_6581_SID', to: 'MOS_6581_SID', signalName: 'Pin 27 Analog Audio Out (1V p-p)', valueHex: 'Waveform Out' },
        ],
        phase: 'PHI_2',
        statusBadges: [
          { label: 'FILTER: LOW-PASS RESONANT', color: 'purple' },
          { label: 'AUDIO OUT: 1V RMS', color: 'green' },
        ],
      },
    ],
  },

  {
    id: 'IEC_FLOPPY_TRANSFER',
    title: '1541 Floppy Drive Byte Handshake over IEC Serial Bus',
    titleHu: '1541 Floppy Bájt-Átvitel az IEC Soros Buszon Keresztül',
    summary: 'Examine the 3-wire serial protocol (ATN, CLK, DATA) between CIA 2 and the 1541 disk drive microprocessor.',
    summaryHu: 'Vizsgáld meg a 3-vezetékes soros protokollt (ATN, CLK, DATA) a CIA 2 és az 1541-es lemezmeghajtó mikroprocesszora között.',
    badge: 'Periféria Kommunikáció',
    steps: [
      {
        stepIndex: 1,
        title: 'CIA 2 Asserts ATN (Attention) LOW to Select Drive 8',
        titleHu: 'A CIA 2 Alacsonyba Húzza az ATN (Figyelem) Vonalat a 8-as Meghajtó Címzéséhez',
        description: 'To start communication, CIA 2 pulls ATN LOW via Port A ($DD00 bit 3). All connected devices (drives 8, 9, 10, printers) immediately stop what they are doing and listen on the DATA line for device address byte $28 (Listen Device 8).',
        descriptionHu: 'A kommunikáció megkezdéséhez a CIA 2 alacsonyba húzza az ATN-t a Port A 3. bitjével ($DD00). Minden csatlakoztatott eszköz abbahagyja az aktuális feladatát, és a DATA vonalra figyel a $28-as címbájtért (8-as meghajtó).',
        activeChips: ['MOS_6526_CIA2', 'PORT_IEC'],
        activeBuses: [
          { bus: 'IEC', from: 'MOS_6526_CIA2', to: 'PORT_IEC', signalName: 'ATN = LOW (Broadcast)', valueHex: '$28 (LISTEN 8)' },
        ],
        phase: 'PHI_2',
        statusBadges: [
          { label: 'ATN ASSERTED', color: 'amber' },
          { label: 'DRIVE 8 SELECTED', color: 'green' },
        ],
      },
      {
        stepIndex: 2,
        title: 'Bit-by-Bit Serial Clocking & Data Reception',
        titleHu: 'Bitről-Bitre Történő Soros Órajelezés és Adatfogadás',
        description: 'For each byte transferred from the 1541 floppy disk buffer into C64 memory, the 1541 toggles the CLK line 8 times while driving bits 0-7 onto DATA. CIA 2 reads the bits into Port A and generates a completed byte in the KERNAL loader.',
        descriptionHu: 'Minden egyes bájt átvitelekor a lemezről a C64 memóriájába a meghajtó 8-szor váltja a CLK vonalat, miközben a 0-7 biteket a DATA vonalra helyezi. A CIA 2 beolvassa a biteket a Port A regiszterbe a KERNAL betöltő számára.',
        activeChips: ['PORT_IEC', 'MOS_6526_CIA2', 'MOS_6510', 'DRAM_64K'],
        activeBuses: [
          { bus: 'IEC', from: 'PORT_IEC', to: 'MOS_6526_CIA2', signalName: 'CLK Pulses + DATA Bits (D0..D7)', valueHex: 'PRG Byte' },
          { bus: 'ADDRESS', from: 'MOS_6510', to: 'DRAM_64K', signalName: 'Load Target Address ($0801..)', valueHex: '$0801' },
          { bus: 'DATA', from: 'MOS_6510', to: 'DRAM_64K', signalName: 'Stored Program Byte', valueHex: '$0B (Pointer)' },
        ],
        phase: 'PHI_2',
        statusBadges: [
          { label: 'IEC SERIAL 400 B/s', color: 'cyan' },
          { label: 'LOADING TO $0801 (BASIC)', color: 'green' },
        ],
      },
    ],
  },

  {
    id: 'RASTER_IRQ',
    title: 'VIC-II Raster IRQ & Smooth Split-Screen Machine Code',
    titleHu: 'VIC-II Raszter IRQ & Osztott Képernyős Gépi Kód',
    summary: 'Understand how demo coders and game programmers synchronize graphics register changes to exact scan lines without flickering.',
    summaryHu: 'Ismerd meg, hogyan szinkronizálják a demók és játékok a grafikus regisztereket pontos rasztersorokhoz villódzásmentes osztott képernyőkhöz.',
    badge: 'Haladó Demó és Játék Technika',
    steps: [
      {
        stepIndex: 1,
        title: 'Raster Beam Hits Target Line $D012 Compare Value',
        titleHu: 'A Rasztersugár Eléri a $D012 Cél Rasztersor Értékét',
        description: 'The CRT electron beam sweeps down the screen and reaches scan line 120 ($78). The internal comparator in the VIC-II matches the raster register ($D012) and pulls the VIC-II /IRQ pin LOW.',
        descriptionHu: 'A katódsugárcső elektronsugara lefelé pásztáz és eléri a 120. sort ($78). A VIC-II belső komparátora egyezést talál a $D012 regiszterrel, és a VIC-II /IRQ lábát alacsonyba húzza.',
        activeChips: ['MOS_6569_VIC2', 'MOS_6510'],
        activeBuses: [
          { bus: 'CONTROL', from: 'MOS_6569_VIC2', to: 'MOS_6510', signalName: '/IRQ = LOW (Raster Match)', valueHex: 'Line 120' },
        ],
        phase: 'PHI_1',
        statusBadges: [
          { label: 'BEAM AT LINE 120', color: 'cyan' },
          { label: 'RASTER IRQ FIRED', color: 'green' },
        ],
      },
      {
        stepIndex: 2,
        title: 'CPU Switches Border & Background Color on the Fly ($D020/$D021)',
        titleHu: 'A CPU Menet Közben Váltja a Keret- és Háttérszínt ($D020/$D021)',
        description: 'The custom interrupt routine instantly writes new colors to $D020 (Border Color) and $D021 (Background Color). Because this occurs while the beam is in the horizontal blanking period, the screen cleanly splits into two different color regions with zero glitching!',
        descriptionHu: 'Az egyedi megszakítási rutin azonnal új színeket ír a $D020 (Keretszín) és $D021 (Háttérszín) regiszterekbe. Mivel ez a sorvisszafutás alatt történik, a képernyő tökéletesen két eltérő színű részre oszlik villódzás nélkül!',
        activeChips: ['MOS_6510', 'MOS_6569_VIC2'],
        activeBuses: [
          { bus: 'ADDRESS', from: 'MOS_6510', to: 'MOS_6569_VIC2', signalName: 'A0-A5', valueHex: '$D020' },
          { bus: 'DATA', from: 'MOS_6510', to: 'MOS_6569_VIC2', signalName: 'D0-D7', valueHex: '$02 (Red Split)' },
        ],
        phase: 'PHI_2',
        statusBadges: [
          { label: 'SPLIT SCREEN EFFECT', color: 'red' },
          { label: 'CYCLE-EXACT TIMING', color: 'purple' },
        ],
      },
    ],
  },
];

export function calculatePlaMemoryMap(inputs: PlaInputState): PlaMemorySlice[] {
  const slices: PlaMemorySlice[] = [];

  // $0000 - $00FF: Zero Page (RAM)
  slices.push({
    range: '$0000 - $00FF',
    startAddr: 0x0000,
    endAddr: 0x00ff,
    sizeKb: 0.25,
    currentMapping: 'RAM',
    currentMappingHu: 'Zero Page RAM (0. Lap)',
    description: 'Ultra-fast 256 bytes with direct 1-byte addressing instructions. $00/$01 are the CPU Direction & I/O Port.',
    descriptionHu: 'Rendkívül gyors 256 bájt közvetlen 1-bájtos címzéssel. A $00/$01 a CPU port.',
    color: '#3b82f6',
  });

  // $0100 - $01FF: Stack (RAM)
  slices.push({
    range: '$0100 - $01FF',
    startAddr: 0x0100,
    endAddr: 0x01ff,
    sizeKb: 0.25,
    currentMapping: 'RAM',
    currentMappingHu: 'Hardveres Verem (Stack RAM)',
    description: 'Hardware Call Stack for JSR, RTS, PHA, PLA, and Interrupt vectors.',
    descriptionHu: 'Hardveres hívási verem JSR, RTS, PHA, PLA és megszakítások számára.',
    color: '#3b82f6',
  });

  // $0200 - $7FFF: Lower RAM (31.5 KB)
  slices.push({
    range: '$0200 - $7FFF',
    startAddr: 0x0200,
    endAddr: 0x7fff,
    sizeKb: 31.5,
    currentMapping: 'RAM',
    currentMappingHu: 'Felhasználói RAM (Képernyő $0400 & BASIC)',
    description: 'Screen matrix at $0400-$07E7, BASIC program memory starting at $0801, and variable storage.',
    descriptionHu: 'Képernyőmátrix $0400-nál, BASIC programterület $0801-től és változótároló.',
    color: '#2563eb',
  });

  // $8000 - $9FFF: 8KB Slice (Cartridge ROML or RAM)
  const isRomL = !inputs.exrom && inputs.loram && inputs.hiram;
  slices.push({
    range: '$8000 - $9FFF',
    startAddr: 0x8000,
    endAddr: 0x9fff,
    sizeKb: 8,
    currentMapping: isRomL ? 'CARTRIDGE_ROML' : 'RAM',
    currentMappingHu: isRomL ? 'Külső Kártya ROM Low (8KB)' : 'Operatív RAM (8KB)',
    description: isRomL
      ? 'Mapped to external 8KB Cartridge ROM (EXROM=0)'
      : 'Standard 8KB System RAM (Cartridge not active or disabled)',
    descriptionHu: isRomL
      ? 'Külső 8KB-os játékkártya ROM (EXROM=0)'
      : 'Szabványos 8KB-os operatív RAM',
    color: isRomL ? '#e11d48' : '#1d4ed8',
  });

  // $A000 - $BFFF: 8KB Slice (BASIC ROM or RAM or Cartridge ROMH)
  const isRomH = !inputs.exrom && !inputs.game && inputs.hiram;
  const isBasic = inputs.loram && inputs.hiram && !isRomH;
  slices.push({
    range: '$A000 - $BFFF',
    startAddr: 0xa000,
    endAddr: 0xbfff,
    sizeKb: 8,
    currentMapping: isRomH ? 'CARTRIDGE_ROMH' : isBasic ? 'BASIC_ROM' : 'RAM',
    currentMappingHu: isRomH
      ? 'Külső Kártya ROM High (8KB)'
      : isBasic
      ? 'BASIC V2 Értelmező ROM (8KB)'
      : 'Rejtett Operatív RAM (8KB)',
    description: isRomH
      ? '16KB Cartridge mapped here (EXROM=0, GAME=0)'
      : isBasic
      ? 'Commodore BASIC V2 Interpreter (LORAM=1, HIRAM=1)'
      : 'Underlying 8KB RAM exposed to CPU (LORAM=0)',
    descriptionHu: isRomH
      ? '16KB-os játékkártya felső fele (EXROM=0, GAME=0)'
      : isBasic
      ? 'Commodore BASIC V2 Értelmező (LORAM=1, HIRAM=1)'
      : 'Alatta lévő 8KB RAM látható a CPU számára (LORAM=0)',
    color: isRomH ? '#e11d48' : isBasic ? '#10b981' : '#1d4ed8',
  });

  // $C000 - $CFFF: 4KB RAM
  slices.push({
    range: '$C000 - $CFFF',
    startAddr: 0xc000,
    endAddr: 0xcfff,
    sizeKb: 4,
    currentMapping: 'RAM',
    currentMappingHu: 'Szabad RAM (Gépi kód & Szerszámok)',
    description: 'Always RAM. Ideal 4KB playground for machine language routines, music players, and sprite data.',
    descriptionHu: 'Mindig RAM. Ideális 4KB terület gépi kódú rutinokhoz, zenékhez és sprite-okhoz.',
    color: '#2563eb',
  });

  // $D000 - $DFFF: 4KB Slice (I/O Space vs Character ROM vs RAM)
  const isIo = inputs.charen && (inputs.loram || inputs.hiram);
  const isCharRom = !inputs.charen && (inputs.loram || inputs.hiram);
  slices.push({
    range: '$D000 - $DFFF',
    startAddr: 0xd000,
    endAddr: 0xdfff,
    sizeKb: 4,
    currentMapping: isIo ? 'IO_SPACE' : isCharRom ? 'CHARGEN_ROM' : 'RAM',
    currentMappingHu: isIo
      ? 'I/O Periféria Chipek (VIC-II, SID, CIAs, Szín-RAM)'
      : isCharRom
      ? 'Karaktergenerátor Betűkészlet ROM (4KB)'
      : 'Rejtett Operatív RAM (4KB)',
    description: isIo
      ? 'I/O Area: VIC-II ($D000), SID ($D400), Color RAM ($D800), CIA1 ($DC00), CIA2 ($DD00) (CHAREN=1)'
      : isCharRom
      ? 'Character Generator ROM font bitmaps (CHAREN=0)'
      : 'Underlying 4KB RAM exposed (LORAM=0, HIRAM=0)',
    descriptionHu: isIo
      ? 'I/O Terület: VIC-II ($D000), SID ($D400), Szín-RAM ($D800), CIA1 ($DC00), CIA2 ($DD00) (CHAREN=1)'
      : isCharRom
      ? 'Karaktergenerátor ROM betűkészlet pixelek (CHAREN=0)'
      : 'Alatta lévő 4KB RAM látható (LORAM=0, HIRAM=0)',
    color: isIo ? '#f59e0b' : isCharRom ? '#8b5cf6' : '#1d4ed8',
  });

  // $E000 - $FFFF: 8KB Slice (KERNAL ROM vs RAM vs Ultimax Cartridge)
  const isKernal = inputs.hiram;
  slices.push({
    range: '$E000 - $FFFF',
    startAddr: 0xe000,
    endAddr: 0xffff,
    sizeKb: 8,
    currentMapping: isKernal ? 'KERNAL_ROM' : 'RAM',
    currentMappingHu: isKernal
      ? 'KERNAL Operációs Rendszer ROM & Vektorok (8KB)'
      : 'Rejtett Operatív RAM (8KB)',
    description: isKernal
      ? 'KERNAL Operating System, I/O drivers, & vectors $FFFA-$FFFF (HIRAM=1)'
      : 'Underlying 8KB RAM exposed to CPU (HIRAM=0)',
    descriptionHu: isKernal
      ? 'KERNAL Operációs Rendszer, meghajtók és vektorok $FFFA-$FFFF (HIRAM=1)'
      : 'Alatta lévő 8KB RAM látható a CPU számára (HIRAM=0)',
    color: isKernal ? '#059669' : '#1d4ed8',
  });

  return slices;
}
