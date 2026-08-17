import {
  AddressDecoderState,
  AddressDecodingMode,
  IoDeviceMapping,
  IoEmulatorConfig,
  IoMappingMode,
  IoPresetExperiment,
} from '../types/ioEmulator';

export function createDefaultIoDevices(): IoDeviceMapping[] {
  return [
    {
      id: 'dev-led-bar',
      name: '8-Bit LED Output Bar',
      nameHu: '8-Bites LED Kimeneti Sor',
      type: 'LED_BAR_8BIT',
      baseAddress: 0xe000,
      addressLength: 1,
      accessMode: 'WRITE_ONLY',
      isEnabled: true,
      chipSelectLabel: '/CS0 (Y0)',
      description: '8 individual LEDs driven by 74HC574 octal D-type write latch.',
      descriptionHu: '8 db különálló LED 74HC574-es 8-bites D-tároló regiszteren keresztül meghajtva.',
      ledState: {
        value: 0b10100101, // 0xA5 default
        color: 'emerald',
        activeLow: false,
      },
    },
    {
      id: 'dev-push-buttons',
      name: '4-Bit Push Buttons (Input)',
      nameHu: '4-Bites Nyomógomb Sor (Bemenet)',
      type: 'PUSH_BUTTONS_4BIT',
      baseAddress: 0xe001,
      addressLength: 1,
      accessMode: 'READ_ONLY',
      isEnabled: true,
      chipSelectLabel: '/CS1 (Y1)',
      description: '4 tactile switches read through a 74HC244 tri-state buffer with pull-up resistors.',
      descriptionHu: '4 db nyomógomb 74HC244 háromállapotú (tri-state) pufferen és felhúzó ellenállásokon át olvasva.',
      buttonState: {
        buttonStates: [false, true, false, false],
        pullUp: true,
        latchMode: false,
      },
    },
    {
      id: 'dev-seven-seg',
      name: 'Dual 7-Segment Display',
      nameHu: 'Kettős 7-Szegmenses Kijelző',
      type: 'SEVEN_SEG_DUAL',
      baseAddress: 0xe002,
      addressLength: 2, // 0xE002 = Digit 1, 0xE003 = Digit 2
      accessMode: 'WRITE_ONLY',
      isEnabled: true,
      chipSelectLabel: '/CS2 (Y2-Y3)',
      description: 'Dual common-cathode display with 74LS47 BCD decoder or direct segment bits.',
      descriptionHu: 'Kettős közös katódos kijelző 74LS47 BCD dekóderrel vagy közvetlen szegmens-vezérléssel.',
      sevenSegState: {
        mode: 'BCD_DECODER',
        digit1: 4,
        digit2: 2,
        commonAnode: false,
      },
    },
    {
      id: 'dev-dip-switches',
      name: '8-Bit DIP Switch Bank',
      nameHu: '8-Bites DIP Kapcsoló Sor',
      type: 'DIP_SWITCH_8BIT',
      baseAddress: 0xe004,
      addressLength: 1,
      accessMode: 'READ_ONLY',
      isEnabled: true,
      chipSelectLabel: '/CS3 (Y4)',
      description: '8 rocker switches providing parallel binary input via tri-state read latch.',
      descriptionHu: '8 db kapcsoló párhuzamos bináris bemenetet biztosít olvasási pufferen keresztül.',
      dipState: {
        value: 0b00111100, // 0x3C
      },
    },
    {
      id: 'dev-matrix-keypad',
      name: '4x4 Scanned Matrix Keypad',
      nameHu: '4x4 Pásztázott Mátrix Billentyűzet',
      type: 'MATRIX_KEYPAD_4X4',
      baseAddress: 0xe005,
      addressLength: 2, // 0xE005 = Write Col, 0xE006 = Read Row
      accessMode: 'READ_WRITE',
      isEnabled: true,
      chipSelectLabel: '/CS4 (Y5)',
      description: 'Matrix keypad with column-drive write latch and row-sense tri-state read buffer.',
      descriptionHu: 'Mátrix tasztatúra oszlop-meghajtó író regiszterrel és sor-érzékelő olvasó pufferrel.',
      keypadState: {
        activeColumnLatch: 0b0001,
        pressedKeys: { '1,2': true }, // Key '8' pressed
      },
    },
    {
      id: 'dev-char-lcd',
      name: '16x2 HD44780 Character LCD',
      nameHu: '16x2 HD44780 Karakteres LCD',
      type: 'CHARACTER_LCD_16X2',
      baseAddress: 0xe008,
      addressLength: 2, // 0xE008 = Command, 0xE009 = Data
      accessMode: 'READ_WRITE',
      isEnabled: true,
      chipSelectLabel: '/CS5 (Y6)',
      description: 'Standard alphanumeric LCD with Command (RS=0) and Data (RS=1) registers.',
      descriptionHu: 'Szabványos alfanumerikus LCD parancs- (RS=0) és adat- (RS=1) regiszterekkel.',
      lcdState: {
        ddram: Array(32).fill(' ').map((_, i) => {
          const text = 'HELLO EDU8 I/O! READY FOR CODE. ';
          return text[i] || ' ';
        }),
        cursorPos: 0,
        displayOn: true,
        cursorOn: true,
        blinkOn: false,
        lastCommand: 0x80,
      },
    },
    {
      id: 'dev-adc-pot',
      name: 'Analog Potentiometer & 8-Bit ADC',
      nameHu: 'Analóg Potméter & 8-Bites ADC',
      type: 'ADC_POTENTIOMETER',
      baseAddress: 0xe00a,
      addressLength: 1,
      accessMode: 'READ_ONLY',
      isEnabled: true,
      chipSelectLabel: '/CS6 (Y7)',
      description: 'Analog 0-5V potentiometer connected to 8-bit Successive Approximation ADC.',
      descriptionHu: '0-5V közötti analóg potméter 8-bites SAR ADC átalakítóhoz kapcsolva.',
      adcPotState: {
        analogVoltage: 3.3,
        quantizedValue: Math.round((3.3 / 5.0) * 255),
      },
    },
    {
      id: 'dev-dac-voltmeter',
      name: '8-Bit DAC & Analog Voltmeter',
      nameHu: '8-Bites DAC & Analóg Voltmérő',
      type: 'DAC_VOLTMETER',
      baseAddress: 0xe00b,
      addressLength: 1,
      accessMode: 'WRITE_ONLY',
      isEnabled: true,
      chipSelectLabel: '/CS7 (Y7)',
      description: 'R-2R Ladder DAC converting 8-bit written byte into real analog DC voltage (0-5V).',
      descriptionHu: 'R-2R létrahálózatú DAC, amely a beírt 8-bites értéket 0-5V analóg feszültséggé alakítja.',
      dacVoltState: {
        latchedValue: 128,
        outputVoltage: (128 / 255) * 5.0,
      },
    },
    {
      id: 'dev-buzzer',
      name: 'Piezo Buzzer / Speaker',
      nameHu: 'Piezo Csipogó / Hangszóró',
      type: 'PIEZO_BUZZER',
      baseAddress: 0xe00c,
      addressLength: 1,
      accessMode: 'WRITE_ONLY',
      isEnabled: true,
      chipSelectLabel: '/CS_BEEP',
      description: 'Audio pitch output for alarms and musical tones.',
      descriptionHu: 'Hangjelző egység figyelmeztető hangok és dallamok lejátszásához.',
      buzzerState: {
        frequencyHz: 440,
        isActive: false,
        volume: 75,
      },
    },
  ];
}

export const DEFAULT_IO_CONFIG: IoEmulatorConfig = {
  mappingMode: 'MMIO',
  memoryBaseAddress: 0xe000,
  addressDecoding: {
    decodingMode: 'FULL_DECODING',
    highAddressBitsMask: 0xf000, // 0xE000-0xEFFF (Top 4 bits decoded)
    enableG1: true,
    enableG2A: false, // Active-LOW grounded
    enableG2B: false, // Active-LOW grounded
    foldbackMirrors: [],
  },
  clockSyncWithCpu: true,
  autoLogTransactions: true,
};

/**
 * Calculate foldback mirror addresses when partial address decoding is active.
 */
export function calculateFoldbackMirrors(
  baseAddress: number,
  mask: number = 0xf000
): { mirrorAddress: number; originalAddress: number }[] {
  const mirrors: { mirrorAddress: number; originalAddress: number }[] = [];
  // For example if top nibble only is decoded (0xE000..0xEFFF),
  // address 0xE000 will be mirrored across other sub-blocks if lines A8..A11 are ignored
  const step = 0x0100; // 256 bytes sub-page
  for (let offset = step; offset < 0x1000; offset += step) {
    mirrors.push({
      mirrorAddress: (baseAddress & mask) | offset,
      originalAddress: baseAddress,
    });
  }
  return mirrors;
}

/**
 * Read from an I/O device at given address
 */
export function readIoAddress(
  devices: IoDeviceMapping[],
  address: number,
  mode: IoMappingMode,
  decodingMode: AddressDecodingMode = 'FULL_DECODING'
): { data: number; targetDevice?: IoDeviceMapping; chipSelect?: string } {
  // Normalize address if PMIO (8-bit) or MMIO (16-bit)
  const normAddr = mode === 'PMIO' ? address & 0xff : address & 0xffff;

  // Search matching device
  const targetDevice = devices.find((dev) => {
    if (!dev.isEnabled) return false;
    const devAddr = mode === 'PMIO' ? dev.baseAddress & 0xff : dev.baseAddress;
    return normAddr >= devAddr && normAddr < devAddr + dev.addressLength;
  });

  if (!targetDevice) {
    return { data: 0xff, targetDevice: undefined, chipSelect: 'NONE' }; // Floating bus returns 0xFF (pull-ups)
  }

  const offset = normAddr - (mode === 'PMIO' ? targetDevice.baseAddress & 0xff : targetDevice.baseAddress);
  let data = 0xff;

  switch (targetDevice.type) {
    case 'PUSH_BUTTONS_4BIT': {
      if (targetDevice.buttonState) {
        const { buttonStates, pullUp } = targetDevice.buttonState;
        let val = 0;
        buttonStates.forEach((pressed, idx) => {
          const bitVal = pullUp ? (pressed ? 0 : 1) : pressed ? 1 : 0;
          val |= bitVal << idx;
        });
        // High 4 bits pull-up HIGH
        data = (val & 0x0f) | 0xf0;
      }
      break;
    }

    case 'DIP_SWITCH_8BIT': {
      data = targetDevice.dipState ? targetDevice.dipState.value & 0xff : 0x00;
      break;
    }

    case 'ADC_POTENTIOMETER': {
      data = targetDevice.adcPotState ? targetDevice.adcPotState.quantizedValue & 0xff : 0x00;
      break;
    }

    case 'MATRIX_KEYPAD_4X4': {
      if (targetDevice.keypadState) {
        const colLatch = targetDevice.keypadState.activeColumnLatch & 0x0f;
        let rowSensed = 0x0f; // Active-LOW rows: 0 means key is pressed in that row

        // Check if any pressed key matches active driven column (LOW)
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            const colIsDrivenLow = (colLatch & (1 << c)) === 0;
            if (colIsDrivenLow && targetDevice.keypadState.pressedKeys[`${r},${c}`]) {
              rowSensed &= ~(1 << r); // Pull row LOW
            }
          }
        }
        data = rowSensed | 0xf0;
      }
      break;
    }

    case 'CHARACTER_LCD_16X2': {
      if (targetDevice.lcdState) {
        // Offset 0 = Read Status Register (Busy flag bit 7 + Cursor Address bits 0-6)
        // Offset 1 = Read DDRAM Data byte
        if (offset === 0) {
          const busyFlag = 0x00; // Not busy
          data = busyFlag | (targetDevice.lcdState.cursorPos & 0x7f);
        } else {
          const char = targetDevice.lcdState.ddram[targetDevice.lcdState.cursorPos] || ' ';
          data = char.charCodeAt(0) & 0xff;
        }
      }
      break;
    }

    case 'LED_BAR_8BIT': {
      data = targetDevice.ledState ? targetDevice.ledState.value & 0xff : 0x00;
      break;
    }

    case 'SEVEN_SEG_DUAL': {
      if (targetDevice.sevenSegState) {
        data = offset === 0 ? targetDevice.sevenSegState.digit1 : targetDevice.sevenSegState.digit2;
      }
      break;
    }

    case 'DAC_VOLTMETER': {
      data = targetDevice.dacVoltState ? targetDevice.dacVoltState.latchedValue & 0xff : 0x00;
      break;
    }

    default:
      data = 0x00;
      break;
  }

  return {
    data: data & 0xff,
    targetDevice,
    chipSelect: targetDevice.chipSelectLabel,
  };
}

/**
 * Write to an I/O device at given address
 */
export function writeIoAddress(
  devices: IoDeviceMapping[],
  address: number,
  data: number,
  mode: IoMappingMode
): { updatedDevices: IoDeviceMapping[]; targetDevice?: IoDeviceMapping; chipSelect?: string } {
  const normAddr = mode === 'PMIO' ? address & 0xff : address & 0xffff;
  const byteVal = data & 0xff;

  let targetDevice: IoDeviceMapping | undefined;

  const nextDevices = devices.map((dev) => {
    if (!dev.isEnabled) return dev;
    const devAddr = mode === 'PMIO' ? dev.baseAddress & 0xff : dev.baseAddress;

    if (normAddr >= devAddr && normAddr < devAddr + dev.addressLength) {
      targetDevice = dev;
      const offset = normAddr - devAddr;
      const updated = { ...dev };

      switch (dev.type) {
        case 'LED_BAR_8BIT': {
          updated.ledState = {
            ...dev.ledState!,
            value: byteVal,
          };
          break;
        }

        case 'SEVEN_SEG_DUAL': {
          if (dev.sevenSegState) {
            updated.sevenSegState = {
              ...dev.sevenSegState,
              digit1: offset === 0 ? byteVal : dev.sevenSegState.digit1,
              digit2: offset === 1 ? byteVal : dev.sevenSegState.digit2,
            };
          }
          break;
        }

        case 'MATRIX_KEYPAD_4X4': {
          if (dev.keypadState && offset === 0) {
            // Write Column Latch
            updated.keypadState = {
              ...dev.keypadState,
              activeColumnLatch: byteVal & 0x0f,
            };
          }
          break;
        }

        case 'CHARACTER_LCD_16X2': {
          if (dev.lcdState) {
            const nextLcd = { ...dev.lcdState };
            if (offset === 0) {
              // Command Register
              nextLcd.lastCommand = byteVal;
              if (byteVal === 0x01) {
                // Clear Display
                nextLcd.ddram = Array(32).fill(' ');
                nextLcd.cursorPos = 0;
              } else if (byteVal === 0x02) {
                // Return Home
                nextLcd.cursorPos = 0;
              } else if ((byteVal & 0x80) !== 0) {
                // Set DDRAM Address (0x80 + pos)
                const targetPos = byteVal & 0x7f;
                // Line 1 is 0x00..0x0F (0..15), Line 2 is 0x40..0x4F (16..31)
                if (targetPos >= 0x40) {
                  nextLcd.cursorPos = Math.min(31, 16 + (targetPos - 0x40));
                } else {
                  nextLcd.cursorPos = Math.min(15, targetPos);
                }
              }
            } else {
              // Data Register: Write character at current DDRAM cursor position
              const char = String.fromCharCode(byteVal);
              const nextDdram = [...nextLcd.ddram];
              nextDdram[nextLcd.cursorPos] = char;
              nextLcd.ddram = nextDdram;
              nextLcd.cursorPos = (nextLcd.cursorPos + 1) % 32;
            }
            updated.lcdState = nextLcd;
          }
          break;
        }

        case 'DAC_VOLTMETER': {
          updated.dacVoltState = {
            latchedValue: byteVal,
            outputVoltage: (byteVal / 255) * 5.0,
          };
          break;
        }

        case 'PIEZO_BUZZER': {
          updated.buzzerState = {
            ...dev.buzzerState!,
            isActive: byteVal > 0,
            frequencyHz: 200 + byteVal * 10,
          };
          break;
        }
      }

      return updated;
    }
    return dev;
  });

  return {
    updatedDevices: nextDevices,
    targetDevice,
    chipSelect: targetDevice ? targetDevice.chipSelectLabel : 'NONE',
  };
}

/**
 * 7-Segment Raw Segment Decoder Table
 * Returns segment bits [a, b, c, d, e, f, g, dp] for BCD numbers 0-15
 */
export const BCD_TO_7SEG_TABLE: Record<number, number> = {
  0: 0b00111111, // 0x3F: a,b,c,d,e,f
  1: 0b00000110, // 0x06: b,c
  2: 0b01011011, // 0x5B: a,b,d,e,g
  3: 0b01001111, // 0x4F: a,b,c,d,g
  4: 0b01100110, // 0x66: b,c,f,g
  5: 0b01101101, // 0x6D: a,c,d,f,g
  6: 0b01111101, // 0x7D: a,c,d,e,f,g
  7: 0b00000111, // 0x07: a,b,c
  8: 0b01111111, // 0x7F: all 7
  9: 0b01101111, // 0x6F: a,b,c,d,f,g
  10: 0b01110111, // A
  11: 0b01111100, // b
  12: 0b00111001, // C
  13: 0b01011110, // d
  14: 0b01111001, // E
  15: 0b01110001, // F
};

export const IO_PRESET_EXPERIMENTS: IoPresetExperiment[] = [
  {
    id: 'exp-running-light-led',
    title: '8-Bit LED Running Light & Johnson Ring Counter (MMIO $E000)',
    titleHu: '8-Bites LED Futófény & Johnson Gyűrűs Számláló ($E000)',
    category: 'Output Peripherals',
    categoryHu: 'Kimeneti Perifériák',
    description: 'Demonstrates memory-mapped write cycles to an 8-bit output latch driving an LED bar.',
    descriptionHu: 'Bemutatja a memóriába leképezett írási ciklust a 74HC574 tároló regiszterre és LED sorra.',
    theoryHu: `A memóriához leképezett I/O (MMIO - Memory-Mapped I/O) során a perifériák nem különálló I/O portként, hanem a közös memóriacímtér egy-egy kijelölt címeként (pl. $E000) jelennek meg.
Amikor a CPU az STA $E000 (vagy MOV [$E000], A) utasítást hajtja végre:
1. Az A0..A15 cínbuszra kikerül a 0xE000 cím.
2. A 74LS138 címdekóder felismeri a címet, és alacsony szintre húzza a /CS0 chip-kiválasztó lábat.
3. A /WR vezérlővonal lefutó élére a 74HC574 D-tároló bekapuzza a D0..D7 adatbusz tartalmát a LED-ekre!`,
    theoryEn: `In Memory-Mapped I/O (MMIO), peripherals occupy regular addresses in the CPU memory space (e.g. $E000). When the CPU writes with STA $E000, the address decoder asserts /CS0, latching the data bus into the LED registers.`,
    assemblyCode: `; --- 8-BIT LED RUNNING LIGHT (MMIO $E000) ---
    LDI A, 1       ; Kezdő LED minta (00000001)
LOOP:
    STA 0xE000     ; LED sor regiszter frissítése
    SLEEP 5        ; Késleltetés
    SHL A          ; Bit léptetése balra (A = A << 1)
    JNZ LOOP       ; Ha még nem csordult túl, ugrás vissza
    LDI A, 1       ; Visszaállítás az első LED-re
    JMP LOOP
`,
    devices: createDefaultIoDevices(),
    defaultConfig: {
      mappingMode: 'MMIO',
      memoryBaseAddress: 0xe000,
    },
  },
  {
    id: 'exp-button-polling-mirror',
    title: 'Push Button & DIP Switch Polling with Tri-State Buffer ($E001)',
    titleHu: 'Nyomógomb & DIP Kapcsoló Olvasás Tri-State Pufferrel ($E001)',
    category: 'Input Peripherals',
    categoryHu: 'Bemeneti Perifériák',
    description: 'Reads digital inputs via 74HC244 tri-state bus transceiver with pull-up resistors.',
    descriptionHu: 'Digitális bemenetek olvasása 74HC244 háromállapotú busz-meghajtón és felhúzó ellenállásokon át.',
    theoryHu: `A bemeneti perifériák (pl. gombok, kapcsolók) olvasásakor a tri-state (háromállapotú) puffer alaphelyzetben nagyimpedanciás (High-Z) állapotban van, így nem terheli az adatbuszt.
Amikor a CPU az LDA $E001 utasítással olvas:
1. A címdekóder aktiválja a /CS1 vonalat.
2. A CPU /RD vonala engedélyezi a 74HC244 kimeneteit (OE = LOW).
3. A nyomógombok logikai szintje kikerül a D0..D7 adatbuszra, amit a CPU Akkumulátora beolvas.`,
    theoryEn: `Input peripherals use 74HC244 tri-state buffers in High-Z mode until the CPU performs an LDA $E001 read cycle, asserting /CS1 and /RD to place button levels onto the data bus.`,
    assemblyCode: `; --- READ BUTTONS ($E001) & REFLECT ON LEDS ($E000) ---
LOOP:
    LDA 0xE001     ; Gombok olvasása tri-state pufferen át
    NOT A          ; Invertálás (mert felhúzó ellenállások vannak)
    STA 0xE000     ; Gomb állapotok azonnali kiírása a LED-ekre
    SLEEP 2
    JMP LOOP
`,
    devices: createDefaultIoDevices(),
    defaultConfig: {
      mappingMode: 'MMIO',
      memoryBaseAddress: 0xe000,
    },
  },
  {
    id: 'exp-dual-seven-seg',
    title: 'Dual 7-Segment Decimal BCD Up-Counter ($E002, $E003)',
    titleHu: 'Kettős 7-Szegmenses Decimális Számláló ($E002, $E003)',
    category: 'Displays',
    categoryHu: 'Kijelzők',
    description: 'Controls tens and units on a dual 7-segment display via BCD decoders.',
    descriptionHu: 'Tízesek és egyesek vezérlése kettős 7-szegmenses kijelzőn BCD dekódolókon át.',
    theoryHu: `A 7-szegmenses kijelzők kétféle módban működhetnek:
1. BCD dekóderes mód (74LS47): A CPU csak a 0..9 számértéket írja ki, a hardver automatikusan dekódolja a szegmenseket.
2. Nyers szegmens mód: A CPU a szegmenseknek megfelelő bitmintát (a..g, dp) küldi ki.`,
    theoryEn: `Dual 7-segment displays can be driven via 74LS47 BCD decoders where writing 0..9 automatically drives cathode segments.`,
    assemblyCode: `; --- 00..99 DECIMAL COUNTER ON DUAL 7-SEG ($E002, $E003) ---
    LDI B, 0       ; Tízesek számláló
LOOP_TENS:
    LDI C, 0       ; Egyesek számláló
LOOP_UNITS:
    STR 0xE002, B  ; Tízes digit kiírása ($E002)
    STR 0xE003, C  ; Egyes digit kiírása ($E003)
    SLEEP 10
    INC C
    CMPI C, 10
    JNZ LOOP_UNITS
    INC B
    CMPI B, 10
    JNZ LOOP_TENS
    JMP LOOP_TENS
`,
    devices: createDefaultIoDevices(),
    defaultConfig: {
      mappingMode: 'MMIO',
      memoryBaseAddress: 0xe000,
    },
  },
  {
    id: 'exp-char-lcd-hello',
    title: 'HD44780 16x2 Alphanumeric LCD Text Driver ($E008, $E009)',
    titleHu: 'HD44780 16x2 Karakteres LCD Szöveg Kiíró ($E008, $E009)',
    category: 'Displays',
    categoryHu: 'Kijelzők',
    description: 'Sends LCD initialization commands (RS=0) and ASCII character data (RS=1).',
    descriptionHu: 'LCD inicializáló parancsok (RS=0) és ASCII karakterek (RS=1) küldése memóriacímekre.',
    theoryHu: `A HD44780 LCD vezérlő két I/O címet foglal el:
- $E008 (Parancs regiszter, RS=0): Kijelző törlés (0x01), kurzor pozicionálás (0x80 + cím).
- $E009 (Adat regiszter, RS=1): ASCII karakterek beírása a DDRAM memóriába.`,
    theoryEn: `HD44780 LCD controller maps RS=0 ($E008) for commands and RS=1 ($E009) for ASCII DDRAM writes.`,
    assemblyCode: `; --- HD44780 LCD HELLO WORLD ($E008 = CMD, $E009 = DATA) ---
    LDI A, 0x01    ; Parancs: Kijelző törlés (Clear Display)
    STA 0xE008
    SLEEP 5

    LDI A, 0x80    ; Parancs: Kurzor 1. sor 1. pozíció
    STA 0xE008

    ; Karakterek kiírása: "CPU"
    LDI A, 67      ; 'C' (ASCII 67)
    STA 0xE009
    LDI A, 80      ; 'P' (ASCII 80)
    STA 0xE009
    LDI A, 85      ; 'U' (ASCII 85)
    STA 0xE009
`,
    devices: createDefaultIoDevices(),
    defaultConfig: {
      mappingMode: 'MMIO',
      memoryBaseAddress: 0xe000,
    },
  },
  {
    id: 'exp-adc-pot-reading',
    title: 'Analog Potentiometer & Voltage Meter ADC ($E00A)',
    titleHu: 'Analóg Potméter & Feszültségmérő ADC ($E00A)',
    category: 'Analog & Conversion',
    categoryHu: 'Analóg & Konverzió',
    description: 'Reads 8-bit digital voltage from potentiometer ADC and scales to LED bar.',
    descriptionHu: '8-bites digitális feszültségérték beolvasása az ADC-ről és megjelenítése a LED soron.',
    theoryHu: `Az analóg feszültségmérésnél az ADC a 0..5V tartományt 0..255 diszkrét digitális számmá alakítja (Kvantálási lépés: ~19.53 mV/LSB). A CPU az LDA $E00A utasítással olvassa be az átalakított értéket.`,
    theoryEn: `8-bit ADC digitizes 0..5V into 0..255. Reading $E00A returns the instantaneous digital voltage level.`,
    assemblyCode: `; --- READ ADC POT ($E00A) AND DISPLAY ON LEDS ($E000) ---
LOOP:
    LDA 0xE00A     ; 8-bites ADC beolvasása
    STA 0xE000     ; LED sor frissítése az ADC értékkel
    STA 0xE00B     ; DAC analóg feszültség kimenet ($E00B)
    SLEEP 4
    JMP LOOP
`,
    devices: createDefaultIoDevices(),
    defaultConfig: {
      mappingMode: 'MMIO',
      memoryBaseAddress: 0xe000,
    },
  },
  {
    id: 'exp-foldback-aliasing',
    title: 'Address Aliasing & Foldback Analysis (Partial Address Decoding)',
    titleHu: 'Memóriatükröződés & Foldback Analízis (Részleges Címdekódolás)',
    category: 'Hardware Decoding',
    categoryHu: 'Hardver Címdekódolás',
    description: 'Investigates what happens when address lines A8..A11 are left unconnected.',
    descriptionHu: 'Megvizsgálja, mi történik, ha az A8..A11 címvonalak nincsenek bekötve a dekóderbe.',
    theoryHu: `Ha a hardvertervező költségcsökkentés céljából csak a felső 4 címvonalat (A12..A15) köti be a címdekóderbe, a periféria nem csak a $E000 címen, hanem annak összes tükörképén ($E100, $E200, ..., $EFFF) is válaszolni fog! Ezt a jelenséget nevezzük cím-tükröződésnek (Foldback / Address Aliasing).`,
    theoryEn: `When partial address decoding is used (ignoring A8..A11), writing to $E100 or $E200 accesses the same hardware as $E000 due to address foldback/mirroring.`,
    assemblyCode: `; --- FOLDBACK MIRROR TEST ---
    LDI A, 0xAA
    STA 0xE000     ; Írás a főcímre ($E000)
    SLEEP 5

    LDI A, 0x55
    STA 0xE100     ; Írás a tükrözött címre ($E100) -> Ugyanaz a LED sor fog változni!
`,
    devices: createDefaultIoDevices(),
    defaultConfig: {
      mappingMode: 'MMIO',
      memoryBaseAddress: 0xe000,
    },
  },
];
