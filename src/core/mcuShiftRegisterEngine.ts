import {
  DualShiftRegisterState,
  ShiftBitOrder,
  ShiftRegisterChipState,
  ShiftRegisterPinState,
  ShiftRegisterPreset,
  ShiftWaveformSample,
} from '../types/mcuShiftRegister';

// Standard 7-Segment Encoding for 74HC595 (QA=a, QB=b, QC=c, QD=d, QE=e, QF=f, QG=g, QH=dp) - Common Cathode (HIGH=ON)
export const SEVEN_SEG_DIGITS_74595: Record<number | string, number> = {
  0: 0b00111111, // 0x3F: a,b,c,d,e,f
  1: 0b00000110, // 0x06: b,c
  2: 0b01011011, // 0x5B: a,b,d,e,g
  3: 0b01001111, // 0x4F: a,b,c,d,g
  4: 0b01100110, // 0x66: b,c,f,g
  5: 0b01101101, // 0x6D: a,c,d,f,g
  6: 0b01111101, // 0x7D: a,c,d,e,f,g
  7: 0b00000111, // 0x07: a,b,c
  8: 0b01111111, // 0x7F: a,b,c,d,e,f,g
  9: 0b01101111, // 0x6F: a,b,c,d,f,g
  A: 0b01110111, // 0x77
  B: 0b01111100, // 0x7C
  C: 0b00111001, // 0x39
  D: 0b01011110, // 0x5E
  E: 0b01111001, // 0x79
  F: 0b01110001, // 0x71
};

export function createInitialShiftRegisterChip(
  id: string,
  name: string,
  nameHu: string
): ShiftRegisterChipState {
  return {
    id,
    name,
    nameHu,
    pins: {
      ds: false,
      shcp: false,
      stcp: false,
      oe_n: false, // LOW = outputs enabled
      mr_n: true, // HIGH = normal operation (not in reset)
      q7s: false,
    },
    shiftBuffer: [0, 0, 0, 0, 0, 0, 0, 0],
    storageLatch: [0, 0, 0, 0, 0, 0, 0, 0],
    qOutputs: [false, false, false, false, false, false, false, false],
    oeBrightness: 255,
    isHighZ: false,
  };
}

export function createInitialDualShiftRegisterState(): DualShiftRegisterState {
  return {
    chip1: createInitialShiftRegisterChip('chip1', '74HC595 #1 (Primary)', '74HC595 #1 (Elsődleges)'),
    chip2: createInitialShiftRegisterChip('chip2', '74HC595 #2 (Cascaded)', '74HC595 #2 (Kaszkádolt)'),
    isCascaded: false,
    activeBitIndex: 0,
    totalShiftSteps: 0,
  };
}

// Convert 8-bit array [S0..S7] to byte number
export function bitArrayToByte(bits: number[]): number {
  let val = 0;
  for (let i = 0; i < 8; i++) {
    if (bits[i]) val |= 1 << i;
  }
  return val;
}

// Convert byte to 8-bit array [S0..S7]
export function byteToBitArray(byteVal: number): number[] {
  const res: number[] = [];
  for (let i = 0; i < 8; i++) {
    res.push((byteVal >> i) & 1);
  }
  return res;
}

/**
 * Executes a single shift clock pulse (SH_CP rising edge)
 * Bits shift from S0 towards S7. S7 overflows into Q7S / QH'.
 * In cascaded mode, previous S7 from Chip 1 shifts into Chip 2 S0.
 */
export function stepShiftClock(
  state: DualShiftRegisterState,
  dsBit: boolean
): DualShiftRegisterState {
  const chip1 = { ...state.chip1 };
  const chip2 = { ...state.chip2 };

  // Overflow bit from Chip 1 before shifting
  const chip1Overflow = chip1.shiftBuffer[7];

  // Shift Chip 1: incoming dsBit goes into S0, each S(i) moves to S(i+1)
  const nextChip1Buf = [dsBit ? 1 : 0, ...chip1.shiftBuffer.slice(0, 7)];
  chip1.shiftBuffer = nextChip1Buf;
  chip1.pins = {
    ...chip1.pins,
    ds: dsBit,
    shcp: true,
    q7s: nextChip1Buf[7] === 1,
  };

  // If cascaded, Chip 2 shifts in the overflow from Chip 1
  if (state.isCascaded) {
    const nextChip2Buf = [chip1Overflow, ...chip2.shiftBuffer.slice(0, 7)];
    chip2.shiftBuffer = nextChip2Buf;
    chip2.pins = {
      ...chip2.pins,
      ds: chip1Overflow === 1,
      shcp: true,
      q7s: nextChip2Buf[7] === 1,
    };
  }

  return {
    ...state,
    chip1,
    chip2,
    totalShiftSteps: state.totalShiftSteps + 1,
  };
}

/**
 * Transfers shiftBuffer to storageLatch on ST_CP rising edge
 */
export function pulseStorageLatch(state: DualShiftRegisterState): DualShiftRegisterState {
  const chip1 = { ...state.chip1 };
  const chip2 = { ...state.chip2 };

  // Chip 1 Latch Transfer
  chip1.storageLatch = [...chip1.shiftBuffer];
  chip1.isHighZ = chip1.pins.oe_n; // if /OE is HIGH (1), outputs are High-Z
  chip1.qOutputs = chip1.storageLatch.map((b) => (!chip1.isHighZ && b === 1));
  chip1.pins = { ...chip1.pins, stcp: true };

  // Chip 2 Latch Transfer
  if (state.isCascaded) {
    chip2.storageLatch = [...chip2.shiftBuffer];
    chip2.isHighZ = chip2.pins.oe_n;
    chip2.qOutputs = chip2.storageLatch.map((b) => (!chip2.isHighZ && b === 1));
    chip2.pins = { ...chip2.pins, stcp: true };
  }

  return {
    ...state,
    chip1,
    chip2,
  };
}

/**
 * Master Reset (/MR or /SRCLR Active LOW)
 * Clears shift buffer asynchronously without immediately changing latched outputs
 */
export function pulseMasterReset(state: DualShiftRegisterState): DualShiftRegisterState {
  const chip1 = { ...state.chip1 };
  const chip2 = { ...state.chip2 };

  chip1.shiftBuffer = [0, 0, 0, 0, 0, 0, 0, 0];
  chip1.pins = { ...chip1.pins, mr_n: false, q7s: false };

  if (state.isCascaded) {
    chip2.shiftBuffer = [0, 0, 0, 0, 0, 0, 0, 0];
    chip2.pins = { ...chip2.pins, mr_n: false, q7s: false };
  }

  return {
    ...state,
    chip1,
    chip2,
  };
}

/**
 * Update Output Enable (/OE pin)
 */
export function setOutputEnable(
  state: DualShiftRegisterState,
  oe_n: boolean,
  brightness = 255
): DualShiftRegisterState {
  const chip1 = { ...state.chip1 };
  const chip2 = { ...state.chip2 };

  chip1.pins = { ...chip1.pins, oe_n };
  chip1.isHighZ = oe_n;
  chip1.oeBrightness = brightness;
  chip1.qOutputs = chip1.storageLatch.map((b) => (!oe_n && b === 1));

  if (state.isCascaded) {
    chip2.pins = { ...chip2.pins, oe_n };
    chip2.isHighZ = oe_n;
    chip2.oeBrightness = brightness;
    chip2.qOutputs = chip2.storageLatch.map((b) => (!oe_n && b === 1));
  }

  return {
    ...state,
    chip1,
    chip2,
  };
}

/**
 * Performs a complete 8-bit shiftOut operation and generates waveform timing trace
 */
export function simulateShiftOutByte(
  initialState: DualShiftRegisterState,
  dataByte: number,
  bitOrder: ShiftBitOrder = 'MSBFIRST'
): { finalState: DualShiftRegisterState; waveform: ShiftWaveformSample[] } {
  let curState = { ...initialState };
  const waveform: ShiftWaveformSample[] = [];
  let t = 0;

  // Initial state before transmission
  waveform.push({
    timeIndex: t++,
    ds: curState.chip1.pins.ds ? 1 : 0,
    shcp: 0,
    stcp: 0,
    oe_n: curState.chip1.pins.oe_n ? 1 : 0,
    qOutputsByte1: bitArrayToByte(curState.chip1.storageLatch),
    qOutputsByte2: curState.isCascaded ? bitArrayToByte(curState.chip2.storageLatch) : undefined,
    q7s: curState.chip1.pins.q7s ? 1 : 0,
    eventLabel: 'IDLE / Start',
    eventLabelHu: 'NYUGALMI / Kezdés',
  });

  // Shift 8 bits
  for (let bitIdx = 0; bitIdx < 8; bitIdx++) {
    // Determine bit value depending on bitOrder
    const actualBitIndex = bitOrder === 'MSBFIRST' ? 7 - bitIdx : bitIdx;
    const bitVal = ((dataByte >> actualBitIndex) & 1) === 1;

    // 1. Data Pin (DS) Setup (SH_CP = 0)
    curState.chip1.pins.ds = bitVal;
    waveform.push({
      timeIndex: t++,
      ds: bitVal ? 1 : 0,
      shcp: 0,
      stcp: 0,
      oe_n: curState.chip1.pins.oe_n ? 1 : 0,
      qOutputsByte1: bitArrayToByte(curState.chip1.storageLatch),
      qOutputsByte2: curState.isCascaded ? bitArrayToByte(curState.chip2.storageLatch) : undefined,
      q7s: curState.chip1.pins.q7s ? 1 : 0,
      eventLabel: `Bit ${actualBitIndex} (${bitVal ? '1' : '0'}) Setup on DS`,
      eventLabelHu: `Bit ${actualBitIndex} (${bitVal ? '1' : '0'}) DS beállítása`,
    });

    // 2. Clock Rising Edge (SH_CP = 1) -> Shifts data into S0
    curState = stepShiftClock(curState, bitVal);
    waveform.push({
      timeIndex: t++,
      ds: bitVal ? 1 : 0,
      shcp: 1,
      stcp: 0,
      oe_n: curState.chip1.pins.oe_n ? 1 : 0,
      qOutputsByte1: bitArrayToByte(curState.chip1.storageLatch),
      qOutputsByte2: curState.isCascaded ? bitArrayToByte(curState.chip2.storageLatch) : undefined,
      q7s: curState.chip1.pins.q7s ? 1 : 0,
      eventLabel: `SH_CP Clock ⤤ (Bit ${actualBitIndex} shift in)`,
      eventLabelHu: `SH_CP Órajel ⤤ (Bit ${actualBitIndex} beléptetve)`,
    });

    // 3. Clock Falling Edge (SH_CP = 0)
    curState.chip1.pins.shcp = false;
    if (curState.isCascaded) curState.chip2.pins.shcp = false;
    waveform.push({
      timeIndex: t++,
      ds: bitVal ? 1 : 0,
      shcp: 0,
      stcp: 0,
      oe_n: curState.chip1.pins.oe_n ? 1 : 0,
      qOutputsByte1: bitArrayToByte(curState.chip1.storageLatch),
      qOutputsByte2: curState.isCascaded ? bitArrayToByte(curState.chip2.storageLatch) : undefined,
      q7s: curState.chip1.pins.q7s ? 1 : 0,
    });
  }

  // 4. Latch Pulse (ST_CP = 1) -> Transfers shift register to storage register (outputs update)
  curState = pulseStorageLatch(curState);
  waveform.push({
    timeIndex: t++,
    ds: 0,
    shcp: 0,
    stcp: 1,
    oe_n: curState.chip1.pins.oe_n ? 1 : 0,
    qOutputsByte1: bitArrayToByte(curState.chip1.storageLatch),
    qOutputsByte2: curState.isCascaded ? bitArrayToByte(curState.chip2.storageLatch) : undefined,
    q7s: curState.chip1.pins.q7s ? 1 : 0,
    eventLabel: `ST_CP Latch ⤤ (Outputs Update to 0x${dataByte.toString(16).toUpperCase()})`,
    eventLabelHu: `ST_CP Tároló ⤤ (Kimenetek frissítése: 0x${dataByte.toString(16).toUpperCase()})`,
  });

  // 5. Latch Falling Edge (ST_CP = 0)
  curState.chip1.pins.stcp = false;
  if (curState.isCascaded) curState.chip2.pins.stcp = false;
  waveform.push({
    timeIndex: t++,
    ds: 0,
    shcp: 0,
    stcp: 0,
    oe_n: curState.chip1.pins.oe_n ? 1 : 0,
    qOutputsByte1: bitArrayToByte(curState.chip1.storageLatch),
    qOutputsByte2: curState.isCascaded ? bitArrayToByte(curState.chip2.storageLatch) : undefined,
    q7s: curState.chip1.pins.q7s ? 1 : 0,
    eventLabel: 'Done / Latched',
    eventLabelHu: 'Kész / Eltárolva',
  });

  return {
    finalState: curState,
    waveform,
  };
}

// Preset educational experiments
export const SHIFT_REGISTER_PRESETS: ShiftRegisterPreset[] = [
  {
    id: 'exp-cylon-scanner',
    title: 'Knight Rider / Cylon LED Scanner',
    titleHu: 'Knight Rider / Cylon LED Futófény',
    category: 'LED Animation',
    categoryHu: 'LED Animáció',
    description: 'A single illuminated LED bounces back and forth across 8 outputs.',
    descriptionHu: 'Egyetlen világító LED pásztázik oda-vissza a 8 kimenet között.',
    explanation:
      'Demonstrates shifting a single active HIGH bit (0b00000001, 0b00000010, ... 0b10000000) back and forth using shiftOut and latch updates.',
    explanationHu:
      'Szemlélteti egyetlen aktív HIGH bit (0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80) oda-vissza léptetését a regiszterben.',
    outputDevice: 'LEDS',
    isCascaded: false,
    defaultData: [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x40, 0x20, 0x10, 0x08, 0x04, 0x02],
    bitOrder: 'MSBFIRST',
    animationDelayMs: 120,
    arduinoCode: `// Pin definitions for 74HC595
const int DATA_PIN  = 4; // Pin 14 (DS)
const int LATCH_PIN = 3; // Pin 12 (ST_CP)
const int CLOCK_PIN = 2; // Pin 11 (SH_CP)

const byte patterns[] = {
  0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80,
  0x40, 0x20, 0x10, 0x08, 0x04, 0x02
};

void setup() {
  pinMode(DATA_PIN, OUTPUT);
  pinMode(LATCH_PIN, OUTPUT);
  pinMode(CLOCK_PIN, OUTPUT);
}

void loop() {
  for (int i = 0; i < 14; i++) {
    digitalWrite(LATCH_PIN, LOW);
    shiftOut(DATA_PIN, CLOCK_PIN, MSBFIRST, patterns[i]);
    digitalWrite(LATCH_PIN, HIGH);
    delay(100);
  }
}`,
    avrCode: `// Low-Level AVR C for 74HC595 (PORTD: PD2=SH_CP, PD3=ST_CP, PD4=DS)
#include <avr/io.h>
#include <util/delay.h>

void shiftOut595(uint8_t data) {
  for (int8_t i = 7; i >= 0; i--) {
    if (data & (1 << i))
      PORTD |= (1 << PD4);  // DS = HIGH
    else
      PORTD &= ~(1 << PD4); // DS = LOW

    PORTD |= (1 << PD2);   // SH_CP = HIGH
    PORTD &= ~(1 << PD2);  // SH_CP = LOW
  }
}

int main(void) {
  DDRD |= (1 << PD2) | (1 << PD3) | (1 << PD4);
  while (1) {
    for (uint8_t b = 1; b < 128; b <<= 1) {
      PORTD &= ~(1 << PD3); // Latch LOW
      shiftOut595(b);
      PORTD |= (1 << PD3);  // Latch HIGH
      _delay_ms(100);
    }
  }
}`,
  },
  {
    id: 'exp-binary-counter',
    title: '8-Bit Binary Counter (0..255)',
    titleHu: '8-Bites Bináris Számláló (0..255)',
    category: 'Counting',
    categoryHu: 'Számlálás',
    description: 'Increments from 0 to 255 displaying the binary value on 8 LEDs.',
    descriptionHu: '0-tól 255-ig számol folyamatosan, a bináris értéket a 8 LED-en megjelenítve.',
    explanation:
      'Every clock and latch cycle updates the parallel output with the binary state of the loop counter variable.',
    explanationHu:
      'Minden ciklusban a számláló változó bináris bitjeit továbbítja a soros bemeneten, majd reteszeli a kimenetekre.',
    outputDevice: 'LEDS',
    isCascaded: false,
    defaultData: Array.from({ length: 16 }, (_, i) => i * 16),
    bitOrder: 'MSBFIRST',
    animationDelayMs: 150,
    arduinoCode: `const int DATA_PIN  = 4; // Pin 14 (DS)
const int LATCH_PIN = 3; // Pin 12 (ST_CP)
const int CLOCK_PIN = 2; // Pin 11 (SH_CP)

void setup() {
  pinMode(DATA_PIN, OUTPUT);
  pinMode(LATCH_PIN, OUTPUT);
  pinMode(CLOCK_PIN, OUTPUT);
}

void loop() {
  for (int count = 0; count <= 255; count++) {
    digitalWrite(LATCH_PIN, LOW);
    shiftOut(DATA_PIN, CLOCK_PIN, MSBFIRST, count);
    digitalWrite(LATCH_PIN, HIGH);
    delay(100);
  }
}`,
    avrCode: `// Low-Level AVR C 8-bit counter
#include <avr/io.h>
#include <util/delay.h>

void send595(uint8_t val) {
  PORTD &= ~(1 << PD3);
  for (int8_t i = 7; i >= 0; i--) {
    if (val & (1 << i)) PORTD |= (1 << PD4);
    else PORTD &= ~(1 << PD4);
    PORTD |= (1 << PD2); PORTD &= ~(1 << PD2);
  }
  PORTD |= (1 << PD3);
}

int main(void) {
  DDRD |= (1 << PD2) | (1 << PD3) | (1 << PD4);
  uint8_t cnt = 0;
  while(1) {
    send595(cnt++);
    _delay_ms(100);
  }
}`,
  },
  {
    id: 'exp-seven-segment',
    title: '7-Segment Digit Counter (0..9 / A..F)',
    titleHu: '7-Szegmenses Számkijelző (0..9 / A..F)',
    category: 'Displays',
    categoryHu: 'Kijelzők',
    description: 'Controls an 8-segment display using 74HC595 pin outputs QA..QH (a,b,c,d,e,f,g,dp).',
    descriptionHu: '7-szegmenses kijelzőt vezérel a QA..QH kimenetekkel (a..g szegmensek és tizedespont).',
    explanation:
      'Each byte corresponds to a segment mask: bit 0=a, bit 1=b, bit 2=c, bit 3=d, bit 4=e, bit 5=f, bit 6=g, bit 7=dp.',
    explanationHu:
      'Minden bájt egy szegmensmaszkot kódol (bit 0=a, bit 1=b, bit 2=c, bit 3=d, bit 4=e, bit 5=f, bit 6=g, bit 7=dp).',
    outputDevice: 'SEVEN_SEGMENT',
    isCascaded: false,
    defaultData: [0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F, 0x77, 0x7C, 0x39, 0x5E, 0x79, 0x71],
    bitOrder: 'MSBFIRST',
    animationDelayMs: 400,
    arduinoCode: `const int DATA_PIN  = 4;
const int LATCH_PIN = 3;
const int CLOCK_PIN = 2;

// 7-Segment lookup table for digits 0-9 and A-F (Common Cathode)
const byte digitTable[] = {
  0x3F, // 0: a,b,c,d,e,f
  0x06, // 1: b,c
  0x5B, // 2: a,b,d,e,g
  0x4F, // 3: a,b,c,d,g
  0x66, // 4: b,c,f,g
  0x6D, // 5: a,c,d,f,g
  0x7D, // 6: a,c,d,e,f,g
  0x07, // 7: a,b,c
  0x7F, // 8: a,b,c,d,e,f,g
  0x6F, // 9: a,b,c,d,f,g
  0x77, // A
  0x7C, // B
  0x39, // C
  0x5E, // D
  0x79, // E
  0x71  // F
};

void setup() {
  pinMode(DATA_PIN, OUTPUT);
  pinMode(LATCH_PIN, OUTPUT);
  pinMode(CLOCK_PIN, OUTPUT);
}

void loop() {
  for (int d = 0; d < 16; d++) {
    digitalWrite(LATCH_PIN, LOW);
    shiftOut(DATA_PIN, CLOCK_PIN, LSBFIRST, digitTable[d]);
    digitalWrite(LATCH_PIN, HIGH);
    delay(500);
  }
}`,
    avrCode: `// AVR C 7-segment digit cycle
#include <avr/io.h>
#include <util/delay.h>

const uint8_t digits[10] = {0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F};

void write595(uint8_t b) {
  PORTD &= ~(1 << PD3);
  for(uint8_t i=0; i<8; i++) {
    if(b & (1<<i)) PORTD |= (1<<PD4);
    else PORTD &= ~(1<<PD4);
    PORTD |= (1<<PD2); PORTD &= ~(1<<PD2);
  }
  PORTD |= (1<<PD3);
}

int main(void) {
  DDRD |= (1<<PD2)|(1<<PD3)|(1<<PD4);
  while(1) {
    for(uint8_t i=0; i<10; i++) {
      write595(digits[i]);
      _delay_ms(500);
    }
  }
}`,
  },
  {
    id: 'exp-cascaded-16bit',
    title: 'Dual 74HC595 Cascading (16 Outputs Chained)',
    titleHu: 'Kettős 74HC595 Kaszkádolás (16 Kimenet Láncolva)',
    category: 'Daisy-Chaining',
    categoryHu: 'Kaszkádolás',
    description: 'Connects Pin 9 (QH\') of Chip 1 to Pin 14 (DS) of Chip 2 to control 16 LEDs with only 3 MCU pins.',
    descriptionHu: 'Az 1. chip QH\' (9-es lábát) a 2. chip DS (14-es lábához) kötve 16 kimenetet vezérel mindössze 3 MCU lábbal.',
    explanation:
      'Shifting 16 bits pushes the first 8 bits straight through Chip 1 into Chip 2 via the QH\' cascade line. One latch pulse updates all 16 outputs simultaneously.',
    explanationHu:
      '16 bit léptetésekor az első 8 bit a QH\' kimeneten át átfolyik a második chipbe. Egyetlen Latch impulzus egyszerre frissíti mind a 16 kimenetet.',
    outputDevice: 'CASCADE_16_LEDS',
    isCascaded: true,
    defaultData: [0x0001, 0x0002, 0x0004, 0x0008, 0x0010, 0x0020, 0x0040, 0x0080, 0x0100, 0x0200, 0x0400, 0x0800, 0x1000, 0x2000, 0x4000, 0x8000],
    bitOrder: 'MSBFIRST',
    animationDelayMs: 100,
    arduinoCode: `const int DATA_PIN  = 4; // Pin 14 (DS of Chip 1)
const int LATCH_PIN = 3; // Pin 12 (ST_CP of both chips)
const int CLOCK_PIN = 2; // Pin 11 (SH_CP of both chips)

// Note: Pin 9 (QH') of Chip 1 connects to Pin 14 (DS) of Chip 2!

void setup() {
  pinMode(DATA_PIN, OUTPUT);
  pinMode(LATCH_PIN, OUTPUT);
  pinMode(CLOCK_PIN, OUTPUT);
}

void write16Bits(uint16_t value) {
  byte highByteVal = highByte(value); // Chip 2 (shifted first)
  byte lowByteVal  = lowByte(value);  // Chip 1 (shifted second)

  digitalWrite(LATCH_PIN, LOW);
  // Shift out to Chip 2 first so it passes through Chip 1
  shiftOut(DATA_PIN, CLOCK_PIN, MSBFIRST, highByteVal);
  // Shift out to Chip 1
  shiftOut(DATA_PIN, CLOCK_PIN, MSBFIRST, lowByteVal);
  digitalWrite(LATCH_PIN, HIGH);
}

void loop() {
  for (int i = 0; i < 16; i++) {
    write16Bits(1 << i);
    delay(100);
  }
}`,
    avrCode: `// Cascaded Dual 74HC595 AVR C
#include <avr/io.h>
#include <util/delay.h>

void write16(uint16_t val) {
  PORTD &= ~(1 << PD3); // Latch LOW
  for(int8_t i = 15; i >= 0; i--) {
    if(val & (1 << i)) PORTD |= (1 << PD4);
    else PORTD &= ~(1 << PD4);
    PORTD |= (1 << PD2); PORTD &= ~(1 << PD2);
  }
  PORTD |= (1 << PD3); // Latch HIGH (All 16 outputs latch!)
}

int main(void) {
  DDRD |= (1 << PD2) | (1 << PD3) | (1 << PD4);
  while(1) {
    for(uint8_t i=0; i<16; i++) {
      write16(1 << i);
      _delay_ms(80);
    }
  }
}`,
  },
  {
    id: 'exp-relay-board',
    title: '8-Channel Relay Module Control',
    titleHu: '8-Csatornás Relé Modul Vezérlés',
    category: 'Power & Relays',
    categoryHu: 'Teljesítmény & Relék',
    description: 'Switches high-power AC/DC loads via an 8-relay board connected to 74HC595 outputs.',
    descriptionHu: 'Nagy teljesítményű fogyasztók kapcsolása 8-csatornás relémodullal 74HC595-ön keresztül.',
    explanation:
      'Relays isolate the MCU from high voltages. The 74HC595 provides 8 discrete control lines using just 3 microcontroller pins.',
    explanationHu:
      'A relék galvanikusan leválasztják az MCU-t. A 74HC595 8 független relét kapcsol 3 mikrokontroller lábbal.',
    outputDevice: 'RELAYS',
    isCascaded: false,
    defaultData: [0x01, 0x03, 0x07, 0x0F, 0x1F, 0x3F, 0x7F, 0xFF, 0x55, 0xAA, 0x00],
    bitOrder: 'MSBFIRST',
    animationDelayMs: 300,
    arduinoCode: `const int DATA_PIN  = 4;
const int LATCH_PIN = 3;
const int CLOCK_PIN = 2;

// Many relay boards are active-LOW, so invert bits with ~ if needed
void setRelays(byte relayMask) {
  digitalWrite(LATCH_PIN, LOW);
  shiftOut(DATA_PIN, CLOCK_PIN, MSBFIRST, relayMask);
  digitalWrite(LATCH_PIN, HIGH);
}

void setup() {
  pinMode(DATA_PIN, OUTPUT);
  pinMode(LATCH_PIN, OUTPUT);
  pinMode(CLOCK_PIN, OUTPUT);
}

void loop() {
  // Step-wise relay activation
  for (int r = 0; r < 8; r++) {
    setRelays(1 << r);
    delay(250);
  }
}`,
    avrCode: `// AVR C Relay Board Driver
#include <avr/io.h>
#include <util/delay.h>

void sendRelays(uint8_t mask) {
  PORTD &= ~(1 << PD3);
  for(int8_t i=7; i>=0; i--) {
    if(mask & (1<<i)) PORTD |= (1<<PD4);
    else PORTD &= ~(1<<PD4);
    PORTD |= (1<<PD2); PORTD &= ~(1<<PD2);
  }
  PORTD |= (1<<PD3);
}

int main(void) {
  DDRD |= (1<<PD2)|(1<<PD3)|(1<<PD4);
  while(1) {
    for(uint8_t r=0; r<8; r++) {
      sendRelays(1 << r);
      _delay_ms(300);
    }
  }
}`,
  },
  {
    id: 'exp-oe-pwm-dimming',
    title: 'Hardware PWM Dimming on Output Enable (/OE)',
    titleHu: 'Hardveres Fényerőszabályzás az Output Enable (/OE) Lábbal',
    category: 'PWM & Brightness',
    categoryHu: 'PWM & Fényerő',
    description: 'Uses Timer PWM on Pin 13 (/OE) to dim the overall brightness of all 8 LEDs smoothly.',
    descriptionHu: 'PWM jelet kapcsolva a 13-as (/OE) lábra fokozatmentesen szabályozza a kimenetek fényerejét.',
    explanation:
      'Because /OE switches the output buffers between active and high-impedance, applying a high-frequency PWM signal modulates the effective duty cycle and perceived brightness without modifying the shifted data.',
    explanationHu:
      'Mivel az /OE láb engedélyezi vagy háromállapotúba (High-Z) kapcsolja a kimeneteket, a nagyfrekvenciás PWM jel a bájt módosítása nélkül szabályozza a fényerőt.',
    outputDevice: 'LEDS',
    isCascaded: false,
    defaultData: [0xFF],
    bitOrder: 'MSBFIRST',
    animationDelayMs: 200,
    arduinoCode: `const int DATA_PIN  = 4; // Pin 14 (DS)
const int LATCH_PIN = 3; // Pin 12 (ST_CP)
const int CLOCK_PIN = 2; // Pin 11 (SH_CP)
const int OE_PIN    = 5; // Pin 13 (/OE - connected to PWM pin D5)

void setup() {
  pinMode(DATA_PIN, OUTPUT);
  pinMode(LATCH_PIN, OUTPUT);
  pinMode(CLOCK_PIN, OUTPUT);
  pinMode(OE_PIN, OUTPUT);

  // Turn on all 8 LEDs
  digitalWrite(LATCH_PIN, LOW);
  shiftOut(DATA_PIN, CLOCK_PIN, MSBFIRST, 0b11111111);
  digitalWrite(LATCH_PIN, HIGH);
}

void loop() {
  // Fade IN (OE is active-LOW, so 255 = fully OFF, 0 = fully ON)
  for (int brightness = 255; brightness >= 0; brightness--) {
    analogWrite(OE_PIN, brightness);
    delay(8);
  }
  // Fade OUT
  for (int brightness = 0; brightness <= 255; brightness++) {
    analogWrite(OE_PIN, brightness);
    delay(8);
  }
}`,
    avrCode: `// AVR C /OE PWM Dimming on Timer0 (OC0B / PD5)
#include <avr/io.h>
#include <util/delay.h>

int main(void) {
  DDRD |= (1 << PD2) | (1 << PD3) | (1 << PD4) | (1 << PD5);

  // Configure Fast PWM on Timer0 (OC0B)
  TCCR0A = (1 << COM0B1) | (1 << WGM01) | (1 << WGM00);
  TCCR0B = (1 << CS01) | (1 << CS00); // Prescaler 64

  // Latch all ones (0xFF)
  PORTD &= ~(1 << PD3);
  for(int8_t i=0; i<8; i++) {
    PORTD |= (1 << PD4);
    PORTD |= (1 << PD2); PORTD &= ~(1 << PD2);
  }
  PORTD |= (1 << PD3);

  while (1) {
    for (uint8_t duty = 0; duty < 255; duty++) {
      OCR0B = duty; // Modulate /OE duty cycle
      _delay_ms(5);
    }
  }
}`,
  },
];
