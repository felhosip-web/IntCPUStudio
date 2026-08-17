import { CodeSyncLineMapping } from '../types/mcu';

export interface TranspileResult {
  asmCode: string;
  cCode: string;
  mappings: CodeSyncLineMapping[];
}

export const CODE_SYNC_PRESETS: {
  id: string;
  name: string;
  nameHu: string;
  category: string;
  categoryHu: string;
  description: string;
  descriptionHu: string;
  cSource: string;
}[] = [
  {
    id: 'gpio_blink',
    name: '1. GPIO Digital Output & Delay Loop',
    nameHu: '1. Digitális Kimenet & Késleltetési Hurok',
    category: 'GPIO Basics',
    categoryHu: 'GPIO Alapok',
    description: 'Toggles onboard LED (PB5 / D13) and shows how high-level pinMode/digitalWrite translates to SBI/CBI and nested delay loops.',
    descriptionHu: 'A 13-as beépített LED-et villogtatja, bemutatva a pinMode és digitalWrite lefordítását SBI/CBI és veremhívásos késleltető rutinokra.',
    cSource: `// ============================================
// Arduino C: Classic LED Blink
// ============================================
void setup() {
  pinMode(13, OUTPUT);     // Configure PB5 as OUTPUT
}

void loop() {
  digitalWrite(13, HIGH);  // Turn LED ON (Set bit HIGH)
  delay(100);              // Wait delay period
  digitalWrite(13, LOW);   // Turn LED OFF (Clear bit LOW)
  delay(100);              // Wait delay period
}`,
  },
  {
    id: 'pwm_pot_dimmer',
    name: '2. ADC AnalogRead & Fast PWM Dimmer',
    nameHu: '2. Analóg ADC Mérés & Hardveres PWM Fényerő',
    category: 'ADC & Timers',
    categoryHu: 'ADC & Időzítők',
    description: 'Reads 10-bit potentiometer on A0 and outputs PWM duty cycle to Timer0 OCR0A on pin D6.',
    descriptionHu: 'Beolvassa az A0 potméter 10-bites értékét és a Timer0 OCR0A PWM regiszterébe tölti a D6-os kimenetre.',
    cSource: `// ============================================
// Arduino C: ADC to PWM Brightness Dimmer
// ============================================
void setup() {
  pinMode(6, OUTPUT);      // D6 / OC0A Fast PWM
  pinMode(A0, INPUT);      // A0 Analog Input Channel 0
}

void loop() {
  int sensorVal = analogRead(A0);    // 10-bit ADC (0..1023)
  int duty = sensorVal / 4;          // Scale to 8-bit (0..255)
  analogWrite(6, duty);              // Update OCR0A Compare Match
  delay(50);
}`,
  },
  {
    id: 'interrupt_int0',
    name: '3. Hardware Interrupt (INT0 / PD2) & ISR',
    nameHu: '3. Hardveres Megszakítás (INT0 / PD2) & ISR',
    category: 'Interrupts',
    categoryHu: 'Megszakítások',
    description: 'Configures external interrupt on pin 2 (PD2), saving program counter onto stack, executing ISR and returning via RETI.',
    descriptionHu: 'Külső hardveres megszakítást konfigurál a D2 lábon, elmentve a visszatérési címet a verembe, majd RETI-vel visszatér.',
    cSource: `// ============================================
// Arduino C: External Interrupt ISR
// ============================================
volatile bool ledState = false;

void setup() {
  pinMode(13, OUTPUT);
  pinMode(2, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(2), toggleLed, FALLING);
}

void loop() {
  // Main background loop remains non-blocking
  delay(10);
}

void toggleLed() {
  ledState = !ledState;
  digitalWrite(13, ledState ? HIGH : LOW);
}`,
  },
  {
    id: 'function_stack_frame',
    name: '4. Function Call with Stack Frame (PUSH/POP)',
    nameHu: '4. Függvényhívás Veremkerettel (PUSH/POP)',
    category: 'Stack & Memory',
    categoryHu: 'Verem & Memória',
    description: 'Demonstrates subroutine parameter passing, stack growth (SP decrement), register preservation, and stack unwinding on RET.',
    descriptionHu: 'Bemutatja a paraméterátadást, a verem növekedését (SP csökkenés), a regisztermentést PUSH/POP utasításokkal és a RET visszatérést.',
    cSource: `// ============================================
// Arduino C: Subroutine Call with Stack Frame
// ============================================
int computeSum(int a, int b) {
  int result = a + b;     // Saved on stack / registers
  return result;
}

void setup() {
  Serial.begin(9600);
}

void loop() {
  int x = 15;
  int y = 27;
  int sum = computeSum(x, y); // RCALL computeSum
  Serial.println(sum);
  delay(100);
}`,
  },
  {
    id: 'eeprom_storage',
    name: '5. Non-Volatile EEPROM Storage & Read',
    nameHu: '5. Tartós EEPROM Írás és Visszaolvasás',
    category: 'Memory & Peripherals',
    categoryHu: 'Memória & Perifériák',
    description: 'Shows how EEPROM.write and EEPROM.read map to EEAR, EEDR, and EECR 4-cycle write strobe assembly routines.',
    descriptionHu: 'Bemutatja, hogyan fordul le az EEPROM.write és EEPROM.read az EEAR, EEDR és EECR 4-ciklusos védett assembly rutinokra.',
    cSource: `// ============================================
// Arduino C: EEPROM Read & Write
// ============================================
#include <EEPROM.h>

void setup() {
  int address = 0x20;
  byte score = 95;
  EEPROM.write(address, score); // Write to EEPROM
}

void loop() {
  byte value = EEPROM.read(0x20); // Read byte
  Serial.println(value);
  delay(200);
}`,
  },
];

/**
 * Transpiles Arduino C source code into clean annotated AVR Assembly
 * with precise bidirectional line-to-line mappings.
 */
export function transpileCToAssembly(cSource: string): TranspileResult {
  const cLines = cSource.split('\n');
  const asmLines: string[] = [];
  const mappings: CodeSyncLineMapping[] = [];

  let inSetup = false;
  let inLoop = false;
  let inIsr = false;
  let currentIsrName = 'toggleLed';

  // Assembly Header
  asmLines.push('; ======================================================');
  asmLines.push('; Compiled from Arduino C Source (Target: ATmega328P)');
  asmLines.push('; Memory Layout: Flash 32KB, SRAM 2KB, RAMEND = 0x08FF');
  asmLines.push('; ======================================================');
  asmLines.push('.org 0x0000');
  asmLines.push('  rjmp main_entry        ; Vector 1: RESET Entry Point');
  asmLines.push('');
  asmLines.push('.org 0x0002');
  asmLines.push('  rjmp ISR_INT0          ; Vector 2: External Interrupt 0 (PD2)');
  asmLines.push('');
  asmLines.push('main_entry:');
  asmLines.push('  ; Initialize Stack Pointer to RAMEND (0x08FF)');
  asmLines.push('  ldi r16, 0xFF');
  asmLines.push('  out SPL, r16');
  asmLines.push('  ldi r16, 0x08');
  asmLines.push('  out SPH, r16');
  asmLines.push('  rcall setup            ; Run Arduino setup() routine once');
  asmLines.push('');
  asmLines.push('main_loop:');
  asmLines.push('  rcall loop             ; Endless Arduino loop() execution');
  asmLines.push('  rjmp main_loop');
  asmLines.push('');

  cLines.forEach((rawLine, cIdx) => {
    const trimmed = rawLine.trim();
    const currentAsmStart = asmLines.length;
    const generatedAsm: string[] = [];
    let explanation = '';
    let explanationHu = '';

    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed === '' || trimmed === '}' || trimmed === '{') {
      // Empty or structural bracket
      return;
    }

    if (trimmed.includes('void setup()') || trimmed.includes('setup()')) {
      inSetup = true;
      inLoop = false;
      inIsr = false;
      generatedAsm.push('setup:');
      explanation = 'setup(): Function entry point called once on boot.';
      explanationHu = 'setup(): Egyszer lefutó inicializáló függvény belépési pontja.';
    } else if (trimmed.includes('void loop()') || trimmed.includes('loop()')) {
      inSetup = false;
      inLoop = true;
      inIsr = false;
      generatedAsm.push('loop:');
      explanation = 'loop(): Main application loop, called repeatedly.';
      explanationHu = 'loop(): Folyamatosan ismétlődő fő ciklus.';
    } else if (trimmed.includes('void toggleLed()') || trimmed.includes('void isr') || (trimmed.startsWith('void ') && !trimmed.includes('setup') && !trimmed.includes('loop'))) {
      inSetup = false;
      inLoop = false;
      inIsr = true;
      const fnName = trimmed.substring(5, trimmed.indexOf('(')).trim();
      currentIsrName = fnName;
      generatedAsm.push('ISR_INT0:');
      generatedAsm.push('  ; ISR Prologue: Preserve SREG & Work Registers');
      generatedAsm.push('  push r16               ; Push R16 to Stack');
      generatedAsm.push('  in r16, SREG           ; Read Status Register');
      generatedAsm.push('  push r16               ; Push SREG to Stack');
      explanation = `ISR(${fnName}): Interrupt Service Routine called when trigger condition fires.`;
      explanationHu = `ISR(${fnName}): Megszakítás-kiszolgáló rutin, ami a hardveres triggerre fut le.`;
    } else if (trimmed.includes('pinMode(13, OUTPUT)') || trimmed.includes('pinMode(PB5, OUTPUT)')) {
      generatedAsm.push('  sbi DDRB, 5            ; Set DDRB bit 5 = 1 (Pin 13 OUTPUT)');
      explanation = 'pinMode(13, OUTPUT): Sets bit 5 of DDRB to configure PB5 as Output.';
      explanationHu = 'pinMode(13, OUTPUT): Beállítja a DDRB 5. bitjét (PB5 / D13 kimenet lesz).';
    } else if (trimmed.includes('pinMode(6, OUTPUT)')) {
      generatedAsm.push('  sbi DDRD, 6            ; Set DDRD bit 6 = 1 (Pin 6 / OC0A OUTPUT)');
      explanation = 'pinMode(6, OUTPUT): Configures PD6 (OC0A PWM pin) as Output.';
      explanationHu = 'pinMode(6, OUTPUT): Beállítja a PD6 (OC0A PWM láb) kimenetet.';
    } else if (trimmed.includes('pinMode(2, INPUT_PULLUP)') || trimmed.includes('pinMode(2, INPUT)')) {
      generatedAsm.push('  cbi DDRD, 2            ; Clear DDRD bit 2 = 0 (Pin 2 INPUT)');
      generatedAsm.push('  sbi PORTD, 2           ; Enable internal 20kΩ pull-up resistor');
      explanation = 'pinMode(2, INPUT_PULLUP): Configures PD2 as Input and activates internal pullup.';
      explanationHu = 'pinMode(2, INPUT_PULLUP): Bemenetté állítja a PD2-t és bekapcsolja a felhúzó ellenállást.';
    } else if (trimmed.includes('pinMode(A0, INPUT)')) {
      generatedAsm.push('  cbi DDRC, 0            ; Clear DDRC bit 0 = 0 (A0 Analog Input)');
      explanation = 'pinMode(A0, INPUT): Configures PC0 as High-Z Analog Input.';
      explanationHu = 'pinMode(A0, INPUT): A C0-as lábat analóg bemenetre állítja.';
    } else if (trimmed.includes('digitalWrite(13, HIGH)')) {
      generatedAsm.push('  sbi PORTB, 5           ; Set PORTB bit 5 = 1 (LED ON / HIGH)');
      explanation = 'digitalWrite(13, HIGH): Output 5.0V on Pin 13.';
      explanationHu = 'digitalWrite(13, HIGH): 5V magas szint kiadása a 13-as lábon.';
    } else if (trimmed.includes('digitalWrite(13, LOW)')) {
      generatedAsm.push('  cbi PORTB, 5           ; Clear PORTB bit 5 = 0 (LED OFF / LOW)');
      explanation = 'digitalWrite(13, LOW): Output 0.0V (GND) on Pin 13.';
      explanationHu = 'digitalWrite(13, LOW): 0V alacsony szint kiadása a 13-as lábon.';
    } else if (trimmed.includes('digitalWrite(13, ledState')) {
      generatedAsm.push('  in r16, PORTB');
      generatedAsm.push('  ldi r17, 0x20          ; Bit 5 mask');
      generatedAsm.push('  eor r16, r17           ; Toggle PB5 bit');
      generatedAsm.push('  out PORTB, r16');
      explanation = 'digitalWrite(13, ledState): Toggles pin state based on boolean flag.';
      explanationHu = 'digitalWrite(13, ledState): Átbillenti a kimenetet a logikai állapot alapján.';
    } else if (trimmed.includes('attachInterrupt')) {
      generatedAsm.push('  ldi r16, 0x02          ; ISC01=1, ISC00=0 (Falling edge trigger)');
      generatedAsm.push('  out EICRA, r16         ; Configure External Interrupt Control A');
      generatedAsm.push('  sbi EIMSK, 0           ; Set INT0 bit in External Interrupt Mask');
      generatedAsm.push('  sei                    ; Set Global Interrupt Enable flag (I=1)');
      explanation = 'attachInterrupt(INT0, FALLING): Configures EICRA, enables EIMSK INT0, and runs SEI.';
      explanationHu = 'attachInterrupt(INT0, FALLING): Beállítja az EICRA-t, engedélyezi a maszkot és kiadja a SEI-t.';
    } else if (trimmed.includes('analogRead(A0)')) {
      generatedAsm.push('  ldi r16, 0x40          ; ADMUX: AVCC Ref, ADC Channel 0');
      generatedAsm.push('  out ADMUX, r16');
      generatedAsm.push('  sbi ADCSRA, 6          ; Set ADSC bit (Start 10-bit Conversion)');
      generatedAsm.push('  in r24, ADCL           ; Read lower 8-bit result');
      generatedAsm.push('  in r25, ADCH           ; Read upper 2-bit result');
      explanation = 'analogRead(A0): Selects ADC0 channel, triggers conversion, and reads ADCL/ADCH registers.';
      explanationHu = 'analogRead(A0): Kiválasztja az A0 csatornát, elindítja a konverziót és beolvassa az ADCL/ADCH bájtokat.';
    } else if (trimmed.includes('analogWrite(6,')) {
      generatedAsm.push('  out OCR0A, r16         ; Write duty cycle into Timer0 OCR0A register');
      explanation = 'analogWrite(6, duty): Updates the Compare Match register for hardware PWM generator.';
      explanationHu = 'analogWrite(6, duty): Beírja a kitöltési tényezőt a Timer0 OCR0A regiszterébe.';
    } else if (trimmed.includes('delay(')) {
      const match = trimmed.match(/delay\s*\(\s*(\d+)\s*\)/);
      const ms = match ? parseInt(match[1], 10) : 100;
      generatedAsm.push(`  ldi r16, ${Math.min(255, Math.max(1, Math.round(ms / 10)))}          ; Delay counter`);
      generatedAsm.push('  rcall delay_subroutine ; Subroutine Call (pushes return PC to stack)');
      explanation = `delay(${ms}): Invokes precision nested cycle delay subroutine via RCALL.`;
      explanationHu = `delay(${ms}): Meghívja a késleltető alprogramot RCALL utasítással.`;
    } else if (trimmed.includes('EEPROM.write(')) {
      generatedAsm.push('  ldi r17, 0x20          ; Target EEPROM Address -> EEAR');
      generatedAsm.push('  ldi r16, 95            ; Data Byte -> EEDR');
      generatedAsm.push('  out EEAR, r17');
      generatedAsm.push('  out EEDR, r16');
      generatedAsm.push('  sbi EECR, 2            ; Set EEMPE (Master Write Enable)');
      generatedAsm.push('  sbi EECR, 1            ; Set EEPE (Write Strobe within 4 cycles)');
      explanation = 'EEPROM.write(addr, val): Sets EEAR, EEDR and executes protected 4-cycle write strobe.';
      explanationHu = 'EEPROM.write(addr, val): Beállítja az EEAR, EEDR regisztereket és kiadja a 4-ciklusos védett írást.';
    } else if (trimmed.includes('EEPROM.read(')) {
      generatedAsm.push('  ldi r17, 0x20          ; Target Address');
      generatedAsm.push('  out EEAR, r17');
      generatedAsm.push('  sbi EECR, 0            ; Set EERE (Read Enable)');
      generatedAsm.push('  in r16, EEDR           ; Read byte from EEDR Data Register');
      explanation = 'EEPROM.read(addr): Sets EEAR address register, strobes EERE, and loads result from EEDR.';
      explanationHu = 'EEPROM.read(addr): Beállítja a címet, meghúzza az EERE olvasó bitet és beolvassa az EEDR-t.';
    } else if (trimmed.includes('Serial.begin')) {
      generatedAsm.push('  ldi r16, 103           ; 9600 baud @ 16 MHz -> UBRR0');
      generatedAsm.push('  out UBRR0, r16');
      generatedAsm.push('  ldi r16, 0x18          ; Enable RXEN0 & TXEN0 in UCSR0B');
      generatedAsm.push('  out UCSR0B, r16');
      explanation = 'Serial.begin(9600): Configures UART baud rate divisor and activates TX/RX transceiver.';
      explanationHu = 'Serial.begin(9600): Beállítja az UART sebességosztót és aktiválja az adó-vevő áramkört.';
    } else if (trimmed.includes('Serial.print') || trimmed.includes('Serial.println')) {
      generatedAsm.push('  ldi r16, 0x41          ; Load ASCII char into R16');
      generatedAsm.push('  out UDR0, r16          ; Write to USART Data Register UDR0');
      explanation = 'Serial.print(): Writes ASCII character byte into the UART TX shift register.';
      explanationHu = 'Serial.print(): Kiírja az ASCII karakterbájtot a soros port UDR0 adatregiszterébe.';
    } else if (trimmed.includes('computeSum') || trimmed.includes('int result = a + b')) {
      generatedAsm.push('  add r16, r17           ; R16 = R16 + R17');
      generatedAsm.push('  mov r24, r16           ; Return value in R24');
      explanation = 'computeSum(): Adds parameters and places return value in register R24.';
      explanationHu = 'computeSum(): Összeadja a paramétereket és az R24 regiszterben adja vissza az eredményt.';
    } else {
      generatedAsm.push(`  ; C Line: ${trimmed}`);
      generatedAsm.push('  nop                    ; 1-cycle timing filler');
      explanation = `Compiled statement: ${trimmed}`;
      explanationHu = `Lefordított utasítás: ${trimmed}`;
    }

    // Append instructions
    const asmIndices: number[] = [];
    generatedAsm.forEach((asmLine) => {
      asmIndices.push(asmLines.length);
      asmLines.push(asmLine);
    });

    mappings.push({
      cLineIndex: cIdx,
      cCode: rawLine,
      asmLineIndices: asmIndices,
      asmCodes: generatedAsm,
      explanation: explanation || trimmed,
      explanationHu: explanationHu || trimmed,
    });
  });

  // Subroutine Trailers
  asmLines.push('');
  asmLines.push('; ======================================================');
  asmLines.push('; Standard Helper Subroutines');
  asmLines.push('; ======================================================');
  asmLines.push('delay_subroutine:');
  asmLines.push('delay_inner:');
  asmLines.push('  dec r16                ; Decrement loop counter');
  asmLines.push('  brne delay_inner       ; Branch if not zero');
  asmLines.push('  ret                    ; Return from subroutine (pops return PC)');
  asmLines.push('');
  asmLines.push('isr_exit:');
  asmLines.push('  pop r16                ; Restore SREG from Stack');
  asmLines.push('  out SREG, r16');
  asmLines.push('  pop r16                ; Restore R16 from Stack');
  asmLines.push('  reti                   ; Return from Interrupt (pops PC, sets I=1)');

  return {
    asmCode: asmLines.join('\n'),
    cCode: cSource,
    mappings,
  };
}
