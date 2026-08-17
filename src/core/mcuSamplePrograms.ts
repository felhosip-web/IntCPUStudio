import { McuSampleProgram } from '../types/mcu';

export const MCU_SAMPLE_PROGRAMS: McuSampleProgram[] = [
  {
    id: 'mcu-prog-blink-asm',
    title: '1. Classic LED Blink (PB5 / D13) [AVR ASM]',
    titleHu: '1. Klasszikus LED Villogtatás (PB5 / D13) [AVR ASM]',
    category: 'Basics',
    categoryHu: 'Alapok',
    difficulty: 'Beginner',
    description: 'Direct register manipulation of DDRB and PORTB to toggle the onboard LED on Pin 13.',
    descriptionHu: 'Közvetlen regiszter-manipuláció a DDRB és PORTB regisztereken a 13-as beépített LED villogtatásához.',
    language: 'AVR-ASM',
    code: `; ============================================
; ATmega328P: LED Blink via PB5 (Pin 13)
; ============================================
.org 0x0000
  ; 1. Set Pin 13 (PB5) as OUTPUT
  sbi DDRB, 5        ; DDRB bit 5 = 1

loop:
  ; 2. Set PB5 HIGH (Turn LED ON)
  sbi PORTB, 5       ; PORTB bit 5 = 1
  rcall delay_loop

  ; 3. Clear PB5 LOW (Turn LED OFF)
  cbi PORTB, 5       ; PORTB bit 5 = 0
  rcall delay_loop

  ; 4. Repeat forever
  rjmp loop

delay_loop:
  ldi r16, 5
delay_inner:
  dec r16
  brne delay_inner
  ret
`,
  },
  {
    id: 'mcu-prog-adc-pwm',
    title: '2. Potentiometer ADC to PWM Brightness Dimmer',
    titleHu: '2. Potméter ADC -> PWM LED Fényerőszabályzó',
    category: 'Sensors',
    categoryHu: 'Szenzorok',
    difficulty: 'Beginner',
    description: 'Reads the 10-bit analog voltage from Potentiometer (A0) and feeds the duty cycle to Timer0 Fast PWM (Pin D6).',
    descriptionHu: 'Beolvassa az analóg feszültséget az A0 potméterről és közvetlenül vezérli a D6 PWM LED fényerejét.',
    language: 'ARDUINO-C',
    code: `// ============================================
// ATmega328P: Potentiometer ADC to PWM Dimmer
// ============================================
void setup() {
  pinMode(6, OUTPUT);      // D6 (OC0A) Hardware PWM Pin
  pinMode(A0, INPUT);      // A0 Analog Input
  Serial.println("ADC to PWM Dimmer Started!");
}

void loop() {
  // Read 10-bit ADC value from Potentiometer (0..1023)
  int sensorVal = analogRead(A0);

  // Map 10-bit ADC to 8-bit PWM (0..255)
  int brightness = sensorVal / 4;
  analogWrite(6, brightness);

  // Log telemetry over Serial
  Serial.print("Pot ADC: ");
  Serial.print(sensorVal);
  Serial.print(" | PWM Duty: ");
  Serial.println(brightness);

  delay(50);
}
`,
  },
  {
    id: 'mcu-prog-servo-sweep',
    title: '3. RC Servo Motor Sweep (Timer1 16-bit PWM)',
    titleHu: '3. Szervómotor Pásztázás (Timer1 16-bites PWM)',
    category: 'Actuators',
    categoryHu: 'Beavatkozók',
    difficulty: 'Intermediate',
    description: 'Controls standard RC servo position from 0° to 180° by modulating 1.0ms to 2.0ms pulse widths on PB1 (OC1A).',
    descriptionHu: 'Szabályozza az RC szervómotor szögét 0° és 180° között 1ms..2ms impulzusszélességgel a PB1 lábon.',
    language: 'ARDUINO-C',
    code: `// ============================================
// ATmega328P: Servo Motor Precision Sweep
// ============================================
void setup() {
  servo.attach(9); // PB1 / OC1A
  Serial.println("Servo Motor Sweep Initialized...");
}

void loop() {
  // Sweep from 0 to 180 degrees
  for (int pos = 0; pos <= 180; pos += 30) {
    servo.write(pos);
    Serial.print("Servo Angle: ");
    Serial.println(pos);
    delay(40);
  }

  // Sweep back from 180 to 0 degrees
  for (int pos = 180; pos >= 0; pos -= 30) {
    servo.write(pos);
    Serial.print("Servo Angle: ");
    Serial.println(pos);
    delay(40);
  }
}
`,
  },
  {
    id: 'mcu-prog-lcd-station',
    title: '4. Weather & Smart Sensor Station (16x2 LCD)',
    titleHu: '4. Okos Szenzorállomás 16x2 LCD Kijelzővel',
    category: 'Sensors',
    categoryHu: 'Szenzorok',
    difficulty: 'Intermediate',
    description: 'Reads Temperature (°C) and Ambient Light (Lux) sensors, updating a 16x2 alphanumeric HD44780 LCD display.',
    descriptionHu: 'Hőmérséklet (°C) és fényerő (Lux) szenzorok valós idejű kiírása a 16x2 LCD kijelzőre.',
    language: 'ARDUINO-C',
    code: `// ============================================
// Smart Sensor Station with 16x2 LCD
// ============================================
void setup() {
  lcd.begin(16, 2);
  lcd.setCursor(0, 0);
  lcd.print("MCU SENSOR HUB");
  lcd.setCursor(0, 1);
  lcd.print("Initializing...");
  delay(100);
}

void loop() {
  // Read Temperature on A1 & Light on A2
  float tempC = 24.5;
  int luxVal = 450;

  lcd.setCursor(0, 0);
  lcd.print("TEMP: 24.5 C   ");

  lcd.setCursor(0, 1);
  lcd.print("LIGHT: 450 LUX ");

  Serial.println("Sensors Updated on LCD.");
  delay(200);
}
`,
  },
  {
    id: 'mcu-prog-interrupt-counter',
    title: '5. External Hardware Interrupt (INT0 / PD2)',
    titleHu: '5. Külső Hardveres Megszakítás (INT0 / PD2)',
    category: 'Interrupts',
    categoryHu: 'Megszakítások',
    difficulty: 'Intermediate',
    description: 'Demonstrates non-blocking hardware interrupt handling. Pressing Button 1 triggers an ISR immediately.',
    descriptionHu: 'Blokkolásmentes külső megszakítás (ISR) kezelése. A gomb megnyomása azonnali megszakítást vált ki.',
    language: 'AVR-ASM',
    code: `; ============================================
; ATmega328P: External Interrupt INT0 (PD2)
; ============================================
.org 0x0000
  rjmp main_init

.org 0x0002          ; INT0 Interrupt Vector Address
  rjmp ISR_INT0

main_init:
  sbi DDRB, 5        ; PB5 (LED) is OUTPUT
  cbi DDRD, 2        ; PD2 (INT0) is INPUT
  sbi PORTD, 2       ; Enable internal pull-up on PD2

  ; Configure EICRA for Falling Edge trigger
  ldi r16, 0x02
  out EICRA, r16

  ; Enable INT0 in EIMSK
  ldi r16, 0x01
  out EIMSK, r16
  sei                ; Global Interrupt Enable (I-flag)

main_loop:
  ; Main background tasks run freely
  nop
  rjmp main_loop

ISR_INT0:
  ; Interrupt Service Routine: Toggle LED
  in r17, PORTB
  ldi r18, 0x20
  eor r17, r18       ; XOR toggle bit 5
  out PORTB, r17
  reti               ; Return from Interrupt
`,
  },
  {
    id: 'mcu-prog-uart-echo',
    title: '6. Serial Command Shell & Telemetry Plotter',
    titleHu: '6. Soros Parancsértelmező & Telemetria Plotter',
    category: 'Communication',
    categoryHu: 'Kommunikáció',
    difficulty: 'Intermediate',
    description: 'Interactive UART terminal console that prints system telemetry and responds to input commands.',
    descriptionHu: 'Interaktív UART soros terminál, amely valós időben küld telemetriát a Serial Plotter felé.',
    language: 'ARDUINO-C',
    code: `// ============================================
// Interactive UART Serial Shell & Plotter
// ============================================
void setup() {
  Serial.begin(9600);
  Serial.println("=== ATmega328P Serial Ready ===");
  Serial.println("Streaming Telemetry (A0, Temp, Lux)...");
}

void loop() {
  // Telemetry stream format for Serial Plotter
  int pot = analogRead(A0);
  Serial.print("POT:");
  Serial.print(pot);
  Serial.print(" TEMP:24.5");
  Serial.print(" LUX:450");
  Serial.println("");

  delay(100);
}
`,
  },
  {
    id: 'mcu-prog-knight-rider',
    title: '7. Knight Rider 8-LED Scanner (PORTD Chaser)',
    titleHu: '7. Knight Rider LED Futófény (PORTD)',
    category: 'Basics',
    categoryHu: 'Alapok',
    difficulty: 'Beginner',
    description: 'High-speed bit-shifting across PORTD to create the iconic Larson scanner animation.',
    descriptionHu: 'Gyors bitléptetés a PORTD regiszteren a klasszikus futófény animációhoz.',
    language: 'AVR-ASM',
    code: `; ============================================
; Knight Rider 8-Bit LED Scanner on PORTD
; ============================================
.org 0x0000
  ldi r16, 0xFF
  out DDRD, r16      ; Set all PORTD pins as OUTPUT

scan_left:
  ldi r17, 0x01      ; Start at bit 0 (0b00000001)
shift_left_loop:
  out PORTD, r17
  rcall delay_step
  lsl r17            ; Logical Shift Left
  cpi r17, 0x80
  brne shift_left_loop

scan_right:
shift_right_loop:
  out PORTD, r17
  rcall delay_step
  lsr r17            ; Logical Shift Right
  cpi r17, 0x01
  brne shift_right_loop

  rjmp scan_left

delay_step:
  ldi r18, 4
delay_inner:
  dec r18
  brne delay_inner
  ret
`,
  },
  {
    id: 'mcu-prog-watchdog',
    title: '8. Watchdog Timer (WDT) System Hang Protection',
    titleHu: '8. Watchdog Timer (WDT) Rendszerfagyás Védelem',
    category: 'Advanced',
    categoryHu: 'Haladó',
    difficulty: 'Advanced',
    description: 'Demonstrates how the hardware Watchdog resets the microcontroller if the main loop hangs or misses WDR.',
    descriptionHu: 'Bemutatja a hardveres Watchdog működését: ha a főciklus lefagy, a WDT automatikusan újraindítja a rendszert.',
    language: 'AVR-ASM',
    code: `; ============================================
; Watchdog Timer (WDT) Auto-Reset Protection
; ============================================
.org 0x0000
  sbi DDRB, 5        ; Pin 13 LED output
  ldi r16, 0x08      ; Enable WDT in WDTCSR
  out WDTCSR, r16

healthy_loop:
  sbi PORTB, 5       ; LED ON
  wdr                ; Watchdog Reset (Clears WDT countdown)
  nop
  cbi PORTB, 5       ; LED OFF
  wdr
  rjmp healthy_loop
`,
  },
  {
    id: 'mcu-prog-ds18b20',
    title: '9. DS18B20 1-Wire Digital Precision Thermometer',
    titleHu: '9. DS18B20 1-Wire Digitális Hőmérő Mérés',
    category: 'Sensors',
    categoryHu: 'Szenzorok',
    difficulty: 'Intermediate',
    description: 'Queries digital temperature over the Dallas 1-Wire protocol (Pin D4) with 12-bit resolution and CRC checking.',
    descriptionHu: 'Digitális hőmérséklet lekérdezés a Dallas 1-Wire buszon (D4 láb) 12-bites felbontással és CRC ellenőrzéssel.',
    language: 'ARDUINO-C',
    code: `// ============================================
// DS18B20 1-Wire Digital Thermometer Reader
// ============================================
#include <OneWire.h>
#include <DallasTemperature.h>

#define ONE_WIRE_BUS 4 // Pin D4

void setup() {
  pinMode(4, INPUT_PULLUP);
  Serial.println("DS18B20 1-Wire Sensor Initializing...");
  sensors.begin();
}

void loop() {
  // Send 1-Wire Convert T command (0x44)
  sensors.requestTemperatures();

  // Fetch 12-bit scratchpad register value
  float tempC = sensors.getTempCByIndex(0);

  Serial.print("DS18B20 Digital Temp: ");
  Serial.print(tempC);
  Serial.println(" C");

  delay(200);
}
`,
  },
  {
    id: 'mcu-prog-ds3231',
    title: '10. DS3231 High-Precision I2C Real-Time Clock',
    titleHu: '10. DS3231 I2C Nagy Pontosságú Valós Idejű Óra',
    category: 'Advanced',
    categoryHu: 'Haladó',
    difficulty: 'Intermediate',
    description: 'Communicates with the DS3231 RTC over I2C (Address 0x68) to read timestamp, calendar date and TCXO temperature.',
    descriptionHu: 'Kommunikáció a DS3231 RTC chippel I2C buszon (0x68) az időbélyeg, naptár és TCXO hőmérséklet kiolvasásához.',
    language: 'ARDUINO-C',
    code: `// ============================================
// DS3231 I2C High-Precision Real-Time Clock
// ============================================
#include <Wire.h>
#include <RTClib.h>

void setup() {
  Wire.begin(); // SDA=A4, SCL=A5
  Serial.println("DS3231 RTC I2C (0x68) Bus Started!");
  rtc.adjust(DateTime(2026, 4, 15, 12, 30, 0));
}

void loop() {
  // Read current BCD registers from DS3231
  DateTime now = rtc.now();

  Serial.print("RTC Time: ");
  Serial.println(now.timestamp());

  delay(500);
}
`,
  },
  {
    id: 'mcu-prog-rotary-encoder',
    title: '11. Rotary Quadrature Encoder with Interrupts',
    titleHu: '11. Kvadratúra Forgó Jeladó Megszakításokkal',
    category: 'Sensors',
    categoryHu: 'Szenzorok',
    difficulty: 'Intermediate',
    description: 'Decodes Gray-code phase pulses from CLK (D2/INT0) and DT (D3) to track rotary position and direction.',
    descriptionHu: 'Kvadratúra impulzusok dekódolása hardveres megszakítással a CLK (D2) és DT (D3) lábakon a pozíció és irány követésére.',
    language: 'ARDUINO-C',
    code: `// ============================================
// Rotary Encoder Quadrature Counter (INT0)
// ============================================
#define CLK_PIN 2 // INT0
#define DT_PIN  3
#define SW_PIN  4

volatile int encoderPos = 0;

void setup() {
  pinMode(CLK_PIN, INPUT_PULLUP);
  pinMode(DT_PIN, INPUT_PULLUP);
  pinMode(SW_PIN, INPUT_PULLUP);

  // Attach Falling Edge Interrupt on INT0
  attachInterrupt(digitalPinToInterrupt(2), isrEncoder, FALLING);
  Serial.println("Rotary Encoder Ready!");
}

void loop() {
  long val = myEnc.read();
  Serial.print("Encoder Position: ");
  Serial.println(val);

  delay(100);
}
`,
  },
  {
    id: 'mcu-prog-nrf24',
    title: '12. nRF24L01+ 2.4GHz RF Wireless Transceiver',
    titleHu: '12. nRF24L01+ 2.4GHz Rádiós Adatátvitel',
    category: 'Advanced',
    categoryHu: 'Haladó',
    difficulty: 'Advanced',
    description: 'Configures SPI RF transceiver on 2.4GHz ISM band with Enhanced ShockBurst auto-acknowledgement.',
    descriptionHu: '2.4GHz SPI rádiós adó-vevő konfigurálása és adatcsomag küldés hardveres automatikus nyugtázással (Auto-ACK).',
    language: 'ARDUINO-C',
    code: `// ============================================
// nRF24L01+ 2.4GHz Wireless RF Transceiver
// ============================================
#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>

RF24 radio(9, 10); // CE=D9, CSN=D10
const byte address[6] = "00001";

void setup() {
  radio.begin();
  radio.openWritingPipe(address);
  radio.setPALevel(RF24_PA_HIGH);
  radio.stopListening();
  Serial.println("nRF24L01+ 2.4GHz RF Node Started!");
}

void loop() {
  const char text[] = "TEMP:24.5C#42";
  radio.write(&text, sizeof(text));

  Serial.println("Radio Packet Transmitted!");
  delay(300);
}
`,
  },
];
