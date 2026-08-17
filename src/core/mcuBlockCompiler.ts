import { PlacedBlock } from '../types/mcuBlock';
import { BLOCK_DEFINITIONS } from './mcuBlockCatalog';

export interface CompilationResult {
  code: string;
  includes: string[];
  globals: string[];
  setupLines: string[];
  loopLines: string[];
  explanationHu: string;
  explanationEn: string;
}

export function compileBlocksToArduinoCode(
  blocks: PlacedBlock[],
  target: 'MCU_A' | 'MCU_B' | 'BREADBOARD' = 'MCU_A'
): CompilationResult {
  const includes = new Set<string>();
  const globals = new Set<string>();
  const setupLines: string[] = [];
  const loopLines: string[] = [];

  // Helper to compile individual blocks
  const compileBlock = (block: PlacedBlock, indentLevel = 1, isInsideLoop = true) => {
    const indent = '  '.repeat(indentLevel);
    const p = block.params || {};

    switch (block.blockType) {
      case 'SETUP_HEADER':
        if (block.children && block.children.length > 0) {
          block.children.forEach((child) => {
            compileBlock(child, 1, false);
          });
        }
        break;

      case 'MAIN_LOOP':
        if (block.children && block.children.length > 0) {
          block.children.forEach((child) => {
            compileBlock(child, 1, true);
          });
        }
        break;

      case 'DELAY_MS':
        loopLines.push(`${indent}delay(${p.ms || 100});`);
        break;

      case 'PIN_MODE':
        if (isInsideLoop) {
          loopLines.push(`${indent}pinMode(${p.pin || '13'}, ${p.mode || 'OUTPUT'});`);
        } else {
          setupLines.push(`${indent}pinMode(${p.pin || '13'}, ${p.mode || 'OUTPUT'});`);
        }
        break;

      case 'DIGITAL_WRITE':
        loopLines.push(`${indent}digitalWrite(${p.pin || '13'}, ${p.state || 'HIGH'});`);
        break;

      case 'ANALOG_READ_VAR':
        globals.add(`int ${p.varName || 'potValue'} = 0;`);
        loopLines.push(`${indent}${p.varName || 'potValue'} = analogRead(${p.pin || 'A0'});`);
        break;

      case 'ADC_CONFIG': {
        const ref = p.reference || 'DEFAULT';
        const prescaler = p.prescaler || '128';
        const isLeft = p.adlar === 'LEFT';

        setupLines.push(`  // Configure Hardware ADC Registers`);
        if (ref === 'DEFAULT') {
          setupLines.push(`  ADMUX = (1 << REFS0)${isLeft ? ' | (1 << ADLAR)' : ''}; // AVCC 5V reference`);
        } else if (ref === 'INTERNAL') {
          setupLines.push(`  ADMUX = (1 << REFS1) | (1 << REFS0)${isLeft ? ' | (1 << ADLAR)' : ''}; // Internal 1.1V Bandgap`);
        } else {
          setupLines.push(`  ADMUX = ${isLeft ? '(1 << ADLAR)' : '0'}; // External AREF`);
        }

        let psBits = '(1 << ADPS2) | (1 << ADPS1) | (1 << ADPS0)'; // 128
        if (prescaler === '64') psBits = '(1 << ADPS2) | (1 << ADPS1)';
        else if (prescaler === '32') psBits = '(1 << ADPS2) | (1 << ADPS0)';
        else if (prescaler === '16') psBits = '(1 << ADPS2)';

        setupLines.push(`  ADCSRA = (1 << ADEN) | ${psBits}; // Enable ADC with prescaler`);
        break;
      }

      case 'ADC_READ_VOLTAGE': {
        const vRefVal = parseFloat(p.vRef) || 5.0;
        const vName = p.varName || 'sensorVoltage';
        globals.add(`float ${vName} = 0.0;`);
        loopLines.push(`${indent}// Read ADC and convert 10-bit raw value to Volts`);
        loopLines.push(`${indent}${vName} = (analogRead(${p.pin || 'A0'}) * ${vRefVal.toFixed(2)}) / 1024.0;`);
        break;
      }

      case 'ADC_OVERSAMPLE_AVERAGE': {
        const tgt = p.targetVar || 'filteredAdc';
        const nSamples = parseInt(p.samples, 10) || 16;
        globals.add(`int ${tgt} = 0;`);
        loopLines.push(`${indent}// Burst sample & compute average over ${nSamples} readings`);
        loopLines.push(`${indent}{`);
        loopLines.push(`${indent}  long sum = 0;`);
        loopLines.push(`${indent}  for (int i = 0; i < ${nSamples}; i++) {`);
        loopLines.push(`${indent}    sum += analogRead(${p.pin || 'A0'});`);
        loopLines.push(`${indent}  }`);
        loopLines.push(`${indent}  ${tgt} = sum / ${nSamples};`);
        loopLines.push(`${indent}}`);
        break;
      }

      case 'ADC_START_ASYNC': {
        const ch = parseInt(p.channel, 10) || 0;
        loopLines.push(`${indent}// Select MUX channel and start asynchronous SAR conversion`);
        loopLines.push(`${indent}ADMUX = (ADMUX & 0xF0) | (${ch} & 0x07);`);
        loopLines.push(`${indent}ADCSRA |= (1 << ADSC); // Start conversion`);
        break;
      }

      case 'ADC_WAIT_COMPLETE': {
        const tgt = p.targetVar || 'adcResult';
        globals.add(`int ${tgt} = 0;`);
        loopLines.push(`${indent}// Busy-wait until conversion finishes`);
        loopLines.push(`${indent}while (ADCSRA & (1 << ADSC));`);
        loopLines.push(`${indent}${tgt} = ADC; // Read combined 10-bit ADCL + ADCH`);
        break;
      }

      case 'ADC_ISR_BLOCK': {
        const isrVar = p.readAdcVar || 'lastAdcVal';
        globals.add(`volatile int ${isrVar} = 0;`);
        setupLines.push(`  ADCSRA |= (1 << ADIE); // Enable ADC Conversion Complete Interrupt`);
        setupLines.push(`  sei(); // Enable global interrupts`);

        // We register an ISR in globals
        globals.add(`ISR(ADC_vect) {\n  ${isrVar} = ADC;\n}`);
        break;
      }

      // ==================== PWM & TIMER BLOCKS ====================
      case 'PWM_CONFIG_TIMER': {
        const t = p.timer || 'TIMER0';
        const mode = p.mode || 'FAST_PWM';
        const psc = p.prescaler || '64';
        setupLines.push(`  // Configure ${t} PWM Hardware Registers`);
        if (t === 'TIMER0') {
          setupLines.push('  pinMode(5, OUTPUT); pinMode(6, OUTPUT);');
          if (mode === 'FAST_PWM') {
            setupLines.push('  TCCR0A = (1 << COM0A1) | (1 << COM0B1) | (1 << WGM01) | (1 << WGM00);');
          } else if (mode === 'PHASE_CORRECT') {
            setupLines.push('  TCCR0A = (1 << COM0A1) | (1 << COM0B1) | (1 << WGM00);');
          }
          if (psc === '1') setupLines.push('  TCCR0B = (1 << CS00); // 62.5 kHz');
          else if (psc === '8') setupLines.push('  TCCR0B = (1 << CS01); // 7.8 kHz');
          else if (psc === '64') setupLines.push('  TCCR0B = (1 << CS01) | (1 << CS00); // 976 Hz');
          else if (psc === '256') setupLines.push('  TCCR0B = (1 << CS02); // 244 Hz');
          else if (psc === '1024') setupLines.push('  TCCR0B = (1 << CS02) | (1 << CS00); // 61 Hz');
        } else if (t === 'TIMER1') {
          setupLines.push('  pinMode(9, OUTPUT); pinMode(10, OUTPUT);');
          setupLines.push('  TCCR1A = (1 << COM1A1) | (1 << COM1B1) | (1 << WGM11);');
          setupLines.push('  TCCR1B = (1 << WGM13) | (1 << WGM12) | (1 << CS11) | (1 << CS10); // ICR1 Fast PWM');
          setupLines.push('  ICR1 = 39999; // 50 Hz for servo or precision PWM');
        } else if (t === 'TIMER2') {
          setupLines.push('  pinMode(3, OUTPUT); pinMode(11, OUTPUT);');
          setupLines.push('  TCCR2A = (1 << COM2A1) | (1 << COM2B1) | (1 << WGM20);');
          setupLines.push('  TCCR2B = (1 << CS22); // /64 Prescaler');
        }
        break;
      }

      case 'PWM_WRITE_DUTY': {
        const pin = p.pin || '6';
        const val = p.dutyVal !== undefined ? p.dutyVal : '128';
        setupLines.push(`  pinMode(${pin}, OUTPUT);`);
        loopLines.push(`${indent}analogWrite(${pin}, constrain(${val}, 0, 255));`);
        break;
      }

      case 'PWM_FADE_BREATHE': {
        const pin = p.pin || '6';
        const stepDelay = p.stepDelayMs || '10';
        setupLines.push(`  pinMode(${pin}, OUTPUT);`);
        loopLines.push(`${indent}// Optical Gamma Fading Cycle`);
        loopLines.push(`${indent}for (int d = 0; d <= 255; d += 3) {`);
        loopLines.push(`${indent}  analogWrite(${pin}, (d * d) / 255);`);
        loopLines.push(`${indent}  delay(${stepDelay});`);
        loopLines.push(`${indent}}`);
        loopLines.push(`${indent}for (int d = 255; d >= 0; d -= 3) {`);
        loopLines.push(`${indent}  analogWrite(${pin}, (d * d) / 255);`);
        loopLines.push(`${indent}  delay(${stepDelay});`);
        loopLines.push(`${indent}}`);
        break;
      }

      case 'PWM_MOTOR_HBRIDGE': {
        const pwmPin = p.pwmPin || '5';
        const dirA = p.dirPinA || '7';
        const dirB = p.dirPinB || '8';
        const speed = p.speedVal || '200';
        const dir = p.direction || 'FORWARD';
        setupLines.push(`  pinMode(${pwmPin}, OUTPUT); pinMode(${dirA}, OUTPUT); pinMode(${dirB}, OUTPUT);`);
        if (dir === 'FORWARD') {
          loopLines.push(`${indent}digitalWrite(${dirA}, HIGH); digitalWrite(${dirB}, LOW);`);
        } else if (dir === 'REVERSE') {
          loopLines.push(`${indent}digitalWrite(${dirA}, LOW); digitalWrite(${dirB}, HIGH);`);
        } else {
          loopLines.push(`${indent}digitalWrite(${dirA}, LOW); digitalWrite(${dirB}, LOW); // Brake`);
        }
        loopLines.push(`${indent}analogWrite(${pwmPin}, constrain(${speed}, 0, 255));`);
        break;
      }

      case 'PWM_SERVO_ANGLE': {
        const pin = p.pin || '9';
        const angle = p.angleVal !== undefined ? p.angleVal : '90';
        includes.add('#include <Servo.h>');
        globals.add('Servo servoObj;');
        setupLines.push(`  servoObj.attach(${pin});`);
        loopLines.push(`${indent}servoObj.write(constrain(${angle}, 0, 180));`);
        break;
      }

      case 'PWM_TONE_BUZZER': {
        const pin = p.pin || '3';
        const freq = p.frequency || '440';
        const dur = p.durationMs || '500';
        setupLines.push(`  pinMode(${pin}, OUTPUT);`);
        loopLines.push(`${indent}tone(${pin}, ${freq}, ${dur});`);
        loopLines.push(`${indent}delay(${dur});`);
        break;
      }

      case 'IF_CONDITION':
        loopLines.push(
          `${indent}if (${p.leftVal || 'analogRead(A0)'} ${p.operator || '>'} ${p.rightVal || '500'}) {`
        );
        if (block.children && block.children.length > 0) {
          block.children.forEach((child) => {
            compileBlock(child, indentLevel + 1, true);
          });
        }
        loopLines.push(`${indent}}`);
        break;

      case 'NRF24_INIT':
        includes.add('#include <SPI.h>');
        includes.add('#include <nRF24L01.h>');
        includes.add('#include <RF24.h>');
        globals.add('RF24 radio(7, 8); // CE=D7, CSN=D8');
        globals.add(`const byte rfAddress[6] = "${p.pipeAddress || 'NODE1'}";`);
        globals.add('struct RadioPacket { int joyX; int speed; byte btn; };');

        setupLines.push('  radio.begin();');
        setupLines.push(`  radio.setChannel(${p.channel || 76});`);
        setupLines.push('  radio.setPALevel(RF24_PA_HIGH);');
        setupLines.push('  radio.setDataRate(RF24_2MBPS);');
        if (p.role === 'TX') {
          setupLines.push('  radio.openWritingPipe(rfAddress);');
          setupLines.push('  radio.stopListening();');
        } else {
          setupLines.push('  radio.openReadingPipe(0, rfAddress);');
          setupLines.push('  radio.startListening();');
        }
        break;

      case 'NRF24_SEND_PACKET':
        includes.add('#include <RF24.h>');
        globals.add('RadioPacket txPayload;');
        loopLines.push(`${indent}txPayload.joyX = ${p.joyXSource || 'analogRead(A0)'};`);
        loopLines.push(`${indent}txPayload.speed = ${p.throttleSource || '200'};`);
        loopLines.push(`${indent}txPayload.btn = ${p.btnSource || 'digitalRead(2)'};`);
        loopLines.push(`${indent}bool ackOk = radio.write(&txPayload, sizeof(txPayload));`);
        break;

      case 'NRF24_RECEIVE_PACKET':
        includes.add('#include <RF24.h>');
        globals.add('RadioPacket rxPayload;');
        loopLines.push(`${indent}if (radio.available()) {`);
        loopLines.push(`${indent}  radio.read(&rxPayload, sizeof(rxPayload));`);
        if (block.children && block.children.length > 0) {
          block.children.forEach((child) => {
            compileBlock(child, indentLevel + 1, true);
          });
        }
        loopLines.push(`${indent}}`);
        break;

      case 'I2C_MASTER_WRITE':
        includes.add('#include <Wire.h>');
        setupLines.push('  Wire.begin(); // Join I2C bus as Master');
        loopLines.push(`${indent}Wire.beginTransmission(${p.slaveAddr || '0x48'});`);
        loopLines.push(`${indent}Wire.write(${p.cmdByte || '0x01'});`);
        loopLines.push(`${indent}Wire.write(${p.dataVal || 'servoTarget'});`);
        loopLines.push(`${indent}Wire.endTransmission();`);
        break;

      case 'UART_SEND_CMD':
        setupLines.push('  Serial.begin(115200);');
        loopLines.push(
          `${indent}Serial.print("$CMD,${p.cmdName || 'SERVO'},");`
        );
        loopLines.push(`${indent}Serial.print(${p.paramVal || 'angle'});`);
        loopLines.push(`${indent}Serial.println("*AA");`);
        break;

      case 'SERVO_WRITE':
        includes.add('#include <Servo.h>');
        globals.add('Servo myServo;');
        setupLines.push(`  myServo.attach(${p.pin || '9'});`);
        loopLines.push(`${indent}myServo.write(${p.angle || '90'});`);
        break;

      case 'RGB_SET_COLOR':
        setupLines.push('  pinMode(5, OUTPUT); // Red');
        setupLines.push('  pinMode(6, OUTPUT); // Green');
        setupLines.push('  pinMode(3, OUTPUT); // Blue');
        loopLines.push(`${indent}analogWrite(5, ${p.r || '0'});`);
        loopLines.push(`${indent}analogWrite(6, ${p.g || '180'});`);
        loopLines.push(`${indent}analogWrite(3, ${p.b || '255'});`);
        break;

      case 'OLED_PRINT_LINE':
        includes.add('#include <Wire.h>');
        includes.add('#include <Adafruit_SSD1306.h>');
        globals.add('Adafruit_SSD1306 display(128, 64, &Wire, -1);');
        setupLines.push('  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);');
        setupLines.push('  display.clearDisplay();');
        setupLines.push('  display.setTextColor(WHITE);');
        loopLines.push(`${indent}display.setCursor(0, ${Number(p.lineIndex || 0) * 16});`);
        loopLines.push(`${indent}display.print("${p.textContent || 'STATUS: OK'}");`);
        loopLines.push(`${indent}display.display();`);
        break;

      case 'RELAY_TOGGLE':
        setupLines.push(`  pinMode(${p.pin || '8'}, OUTPUT);`);
        loopLines.push(`${indent}digitalWrite(${p.pin || '8'}, ${p.state || 'HIGH'});`);
        break;

      case 'BUZZER_TONE':
        setupLines.push(`  pinMode(${p.pin || '4'}, OUTPUT);`);
        loopLines.push(
          `${indent}tone(${p.pin || '4'}, ${p.freqHz || '440'}, ${p.durationMs || '200'});`
        );
        break;

      case 'MAP_RANGE':
        globals.add(`int ${p.targetVar || 'servoTarget'} = 0;`);
        loopLines.push(
          `${indent}${p.targetVar || 'servoTarget'} = map(${p.sourceVal || 'analogRead(A0)'}, ${p.inMin || '0'}, ${p.inMax || '1023'}, ${p.outMin || '0'}, ${p.outMax || '180'});`
        );
        break;

      case 'VAR_DECLARE': {
        const typeStr = p.dataType || 'int';
        const nameStr = p.varName || 'sensorValue';
        const initVal = p.initValue !== undefined && p.initValue !== '' ? p.initValue : '0';
        if (p.scope === 'local' && isInsideLoop) {
          loopLines.push(`${indent}${typeStr} ${nameStr} = ${initVal};`);
        } else {
          globals.add(`${typeStr} ${nameStr} = ${initVal};`);
        }
        break;
      }

      case 'SET_VARIABLE': {
        const nameStr = p.varName || 'counter';
        const op = p.operator || '=';
        const expr = p.expression !== undefined ? p.expression : '0';
        globals.add(`int ${nameStr} = 0;`);
        loopLines.push(`${indent}${nameStr} ${op} ${expr};`);
        break;
      }

      case 'VAR_INC_DEC': {
        const nameStr = p.varName || 'counter';
        globals.add(`int ${nameStr} = 0;`);
        loopLines.push(`${indent}${nameStr}${p.op || '++'};`);
        break;
      }

      case 'ARRAY_DECLARE': {
        const elemType = p.dataType || 'int';
        const arrName = p.arrayName || 'readings';
        const sizeNum = Number(p.size) || 8;
        const initStr = p.initValues ? p.initValues.trim() : '';
        const isProgmem = p.location === 'PROGMEM';

        if (isProgmem) {
          includes.add('#include <avr/pgmspace.h>');
          globals.add(`const PROGMEM ${elemType} ${arrName}[${sizeNum}] = { ${initStr || '0'} };`);
        } else {
          globals.add(`${elemType} ${arrName}[${sizeNum}] = { ${initStr || '0'} };`);
        }
        break;
      }

      case 'ARRAY_SET_ELEMENT': {
        const arrName = p.arrayName || 'readings';
        const idx = p.index !== undefined ? p.index : '0';
        const val = p.value !== undefined ? p.value : '0';
        globals.add(`int ${arrName}[8] = {0};`);
        loopLines.push(`${indent}${arrName}[${idx}] = ${val};`);
        break;
      }

      case 'ARRAY_GET_ELEMENT': {
        const tgtVar = p.targetVar || 'currentVal';
        const arrName = p.arrayName || 'readings';
        const idx = p.index !== undefined ? p.index : '0';
        globals.add(`int ${tgtVar} = 0;`);
        globals.add(`int ${arrName}[8] = {0};`);
        loopLines.push(`${indent}${tgtVar} = ${arrName}[${idx}];`);
        break;
      }

      case 'ARRAY_FOR_LOOP': {
        const idxVar = p.indexVar || 'i';
        const limit = p.limitCount || '8';
        loopLines.push(`${indent}for (int ${idxVar} = 0; ${idxVar} < ${limit}; ${idxVar}++) {`);
        if (block.children && block.children.length > 0) {
          block.children.forEach((child) => {
            compileBlock(child, indentLevel + 1, true);
          });
        }
        loopLines.push(`${indent}}`);
        break;
      }

      case 'ARRAY_ROLLING_AVG': {
        const arrName = p.arrayName || 'readings';
        const bufSize = Number(p.size) || 8;
        const sampleExpr = p.newSampleExpr || 'analogRead(A0)';
        const resVar = p.resultVar || 'smoothedAverage';

        globals.add(`int ${arrName}[${bufSize}] = {0};`);
        globals.add(`int ${arrName}_idx = 0;`);
        globals.add(`int ${arrName}_sum = 0;`);
        globals.add(`int ${resVar} = 0;`);

        loopLines.push(`${indent}// Rolling Average Circular Buffer Filter (${bufSize} samples)`);
        loopLines.push(`${indent}${arrName}_sum -= ${arrName}[${arrName}_idx];`);
        loopLines.push(`${indent}${arrName}[${arrName}_idx] = ${sampleExpr};`);
        loopLines.push(`${indent}${arrName}_sum += ${arrName}[${arrName}_idx];`);
        loopLines.push(`${indent}${arrName}_idx = (${arrName}_idx + 1) % ${bufSize};`);
        loopLines.push(`${indent}${resVar} = ${arrName}_sum / ${bufSize};`);
        break;
      }

      case 'SHIFT595_CONFIG': {
        const dPin = p.dataPin || '4';
        const clkPin = p.clockPin || '2';
        const ltPin = p.latchPin || '3';
        setupLines.push(`  // 74HC595 Shift Register Pin Setup`);
        setupLines.push(`  pinMode(${dPin}, OUTPUT); // DS (Pin 14)`);
        setupLines.push(`  pinMode(${clkPin}, OUTPUT); // SH_CP (Pin 11)`);
        setupLines.push(`  pinMode(${ltPin}, OUTPUT); // ST_CP (Pin 12)`);
        break;
      }

      case 'SHIFT595_WRITE_BYTE': {
        const val = p.valueExpr || '0x55';
        const ord = p.bitOrder || 'MSBFIRST';
        const dPin = p.dataPin || '4';
        const clkPin = p.clockPin || '2';
        const ltPin = p.latchPin || '3';
        loopLines.push(`${indent}// 74HC595 Write Byte with Auto-Latch`);
        loopLines.push(`${indent}digitalWrite(${ltPin}, LOW);`);
        loopLines.push(`${indent}shiftOut(${dPin}, ${clkPin}, ${ord}, ${val});`);
        loopLines.push(`${indent}digitalWrite(${ltPin}, HIGH);`);
        break;
      }

      case 'SHIFT595_CASCADE_16BIT': {
        const hiVal = p.highByteExpr || '0xAA';
        const loVal = p.lowByteExpr || '0x55';
        const dPin = p.dataPin || '4';
        const clkPin = p.clockPin || '2';
        const ltPin = p.latchPin || '3';
        loopLines.push(`${indent}// 2x 74HC595 Cascaded 16-Bit Write (via QH')`);
        loopLines.push(`${indent}digitalWrite(${ltPin}, LOW);`);
        loopLines.push(`${indent}shiftOut(${dPin}, ${clkPin}, MSBFIRST, ${hiVal}); // Chip 2 (passed through Chip 1)`);
        loopLines.push(`${indent}shiftOut(${dPin}, ${clkPin}, MSBFIRST, ${loVal});  // Chip 1`);
        loopLines.push(`${indent}digitalWrite(${ltPin}, HIGH); // Latch both chips simultaneously`);
        break;
      }

      case 'SHIFT595_SEVENSEG_DIGIT': {
        const digExpr = p.digitExpr || '0';
        const dPin = p.dataPin || '4';
        const clkPin = p.clockPin || '2';
        const ltPin = p.latchPin || '3';
        globals.add(`// 7-Segment Lookup Table for 74HC595 (Common Cathode: a..g, dp)`);
        globals.add(`const byte SEG7_TABLE[16] = {0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F, 0x77, 0x7C, 0x39, 0x5E, 0x79, 0x71};`);
        loopLines.push(`${indent}// 74HC595 7-Segment Output`);
        loopLines.push(`${indent}digitalWrite(${ltPin}, LOW);`);
        loopLines.push(`${indent}shiftOut(${dPin}, ${clkPin}, MSBFIRST, SEG7_TABLE[(${digExpr}) & 0x0F]);`);
        loopLines.push(`${indent}digitalWrite(${ltPin}, HIGH);`);
        break;
      }

      case 'SHIFT595_OE_PWM': {
        const oePin = p.oePin || '5';
        const bright = p.brightness || '128';
        setupLines.push(`  pinMode(${oePin}, OUTPUT); // 74HC595 /OE Pin PWM`);
        loopLines.push(`${indent}// 74HC595 Dimming via /OE Pin (Active-LOW: 255 - brightness)`);
        loopLines.push(`${indent}analogWrite(${oePin}, 255 - (${bright}));`);
        break;
      }

      default:
        break;
    }
  };

  // Compile all top-level blocks
  blocks.forEach((b) => compileBlock(b, 1, true));

  // Build the complete Arduino C file
  const codeLines: string[] = [];
  codeLines.push('// ==========================================');
  codeLines.push(`// Generated Arduino C++ Program (${target})`);
  codeLines.push('// Visual Block-to-Code Compilation');
  codeLines.push('// ==========================================');
  codeLines.push('');

  // Includes
  if (includes.size > 0) {
    includes.forEach((inc) => codeLines.push(inc));
    codeLines.push('');
  }

  // Globals
  if (globals.size > 0) {
    globals.forEach((g) => codeLines.push(g));
    codeLines.push('');
  }

  // Setup Function
  codeLines.push('void setup() {');
  if (setupLines.length === 0) {
    codeLines.push('  // Hardware initialization');
    codeLines.push('  Serial.begin(115200);');
  } else {
    // Unique setup lines
    const seenSetup = new Set<string>();
    setupLines.forEach((l) => {
      if (!seenSetup.has(l)) {
        seenSetup.add(l);
        codeLines.push(l);
      }
    });
  }
  codeLines.push('}');
  codeLines.push('');

  // Loop Function
  codeLines.push('void loop() {');
  if (loopLines.length === 0) {
    codeLines.push('  // Main loop');
    codeLines.push('  delay(50);');
  } else {
    loopLines.forEach((l) => codeLines.push(l));
  }
  codeLines.push('}');

  const finalCode = codeLines.join('\n');

  return {
    code: finalCode,
    includes: Array.from(includes),
    globals: Array.from(globals),
    setupLines,
    loopLines,
    explanationHu: `A blokkok sikeresen lefordítva Arduino C++ formátumra (${blocks.length} blokk elem).`,
    explanationEn: `Blocks compiled to Arduino C++ (${blocks.length} elements).`,
  };
}
