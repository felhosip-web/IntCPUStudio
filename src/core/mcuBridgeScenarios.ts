import { BridgeScenarioPreset } from '../types/mcuBridge';

export const BRIDGE_SCENARIOS: BridgeScenarioPreset[] = [
  {
    id: 'i2c_telemetry',
    protocol: 'I2C',
    title: 'I2C Master-Slave Telemetry & Remote Display',
    titleHu: 'I2C Mester-Szolga Telemetria & Távoli Kijelző',
    subtitle: '7-bit Addressing (0x48), Two-Way Transfer, SCL Clock Stretching',
    subtitleHu: '7-bites Címzés (0x48), Kétirányú Adatátvitel, SCL Órajel Nyújtás',
    category: 'Sensors',
    categoryHu: 'Szenzorok',
    baudRateOrSpeed: '100 kHz Standard Mode',
    description:
      'MCU A (Master) acts as the central controller: it reads analog sensor values from MCU B (Slave @ 0x48), processes them, and writes control bytes to adjust MCU B’s RGB LED and OLED display.',
    descriptionHu:
      'Az MCU A (Mester) központi vezérlőként működik: beolvassa a szenzoradatokat az MCU B-ből (Szolga @ 0x48), majd visszaküldi a vezérlő parancsokat az RGB LED és az OLED kijelző beállítására.',
    initialA: {
      potentiometer: 680,
      button1: false,
      sliderVal: 140,
    },
    initialB: {
      sensorTemp: 26.5,
      sensorLux: 540,
      rgbColor: { r: 0, g: 180, b: 255 },
      servoAngle: 75,
      oledLines: ['I2C SLAVE: 0x48', 'STATUS: CONNECTED', 'TEMP: 26.5 C', 'SERVO: 75 DEG'],
    },
    codeMcuA: `// ==========================================
// MCU A (MASTER CONTROLLER) - I2C BUS
// ==========================================
#include <Wire.h>
#define SLAVE_ADDR 0x48

void setup() {
  Wire.begin();        // Master init (SCL=A5, SDA=A4)
  Serial.begin(9600);
}

void loop() {
  int pot = analogRead(A0); // Read master pot
  byte servoTarget = map(pot, 0, 1023, 0, 180);

  // 1. Write command packet to Slave
  Wire.beginTransmission(SLAVE_ADDR);
  Wire.write(0x01);        // CMD: Set Servo & RGB
  Wire.write(servoTarget); // Payload: Angle
  Wire.write(0x00);        // Red
  Wire.write(0xB4);        // Green
  Wire.write(0xFF);        // Blue
  Wire.endTransmission();  // Send STOP

  delay(20);

  // 2. Request 4 bytes of telemetry from Slave
  Wire.requestFrom(SLAVE_ADDR, 4);
  if (Wire.available() >= 4) {
    byte tempHigh = Wire.read();
    byte tempLow  = Wire.read();
    byte luxHigh  = Wire.read();
    byte luxLow   = Wire.read();
    float temp = (tempHigh * 256 + tempLow) / 10.0;
    int lux = luxHigh * 256 + luxLow;
  }
  delay(100);
}`,
    codeMcuB: `// ==========================================
// MCU B (SLAVE NODE 0x48) - I2C BUS
// ==========================================
#include <Wire.h>
#define I2C_ADDR 0x48

volatile byte servoAngle = 90;
volatile byte rgbR = 0, rgbG = 0, rgbB = 0;
float currentTemp = 26.5;
int currentLux = 540;

void setup() {
  Wire.begin(I2C_ADDR);
  Wire.onReceive(receiveEvent);
  Wire.onRequest(requestEvent);
  pinMode(9, OUTPUT); // Servo PWM
}

// Master wrote data to us
void receiveEvent(int howMany) {
  if (Wire.available() >= 5) {
    byte cmd = Wire.read();
    if (cmd == 0x01) {
      servoAngle = Wire.read();
      rgbR = Wire.read();
      rgbG = Wire.read();
      rgbB = Wire.read();
      analogWrite(9, map(servoAngle, 0, 180, 50, 250));
    }
  }
}

// Master requested telemetry from us
void requestEvent() {
  int tRaw = (int)(currentTemp * 10.0);
  Wire.write(highByte(tRaw));
  Wire.write(lowByte(tRaw));
  Wire.write(highByte(currentLux));
  Wire.write(lowByte(currentLux));
}

void loop() {
  // Local background sensor sampling
  currentTemp = 24.0 + (analogRead(A0) / 100.0);
  delay(50);
}`,
  },
  {
    id: 'spi_fullduplex',
    protocol: 'SPI',
    title: 'SPI Full-Duplex High-Speed Stream & Actuator Control',
    titleHu: 'SPI Teljes Duplex Nagysebességű Adatfolyam & Vezérlés',
    subtitle: 'Simultaneous MOSI/MISO Byte Exchange, SS Active-Low',
    subtitleHu: 'Egyidejű MOSI/MISO Bájtcsere, SS Alacsony-Aktív',
    category: 'Industrial',
    categoryHu: 'Ipari',
    baudRateOrSpeed: '1.0 MHz SPI Mode 0',
    description:
      'MCU A (Master) pulls SS (D10) LOW and generates high-speed SCK clock pulses. In each 8-bit cycle, Master sends a motor speed setpoint via MOSI while simultaneously clocking in real-time encoder feedback via MISO.',
    descriptionHu:
      'Az MCU A (Mester) lehúzza az SS (D10) vonalat és SCK órajeleket generál. Minden 8-bites ciklusban a Mester motorsebesség alapjelet küld a MOSI vonalon, miközben a MISO vonalon egyidejűleg beolvassa a visszacsatolási pozíciót.',
    initialA: {
      sliderVal: 180,
      potentiometer: 512,
      button1: false,
    },
    initialB: {
      stepperSteps: 340,
      servoAngle: 120,
      sensorLux: 820,
      oledLines: ['SPI SLAVE ACTIVE', 'MOSI IN: 180 SPEED', 'MISO OUT: 340 POS', 'MODE: FULL-DUPLEX'],
    },
    codeMcuA: `// ==========================================
// MCU A (SPI MASTER)
// ==========================================
#include <SPI.h>
const int CSPIN = 10;

void setup() {
  pinMode(CSPIN, OUTPUT);
  digitalWrite(CSPIN, HIGH);
  SPI.begin();
  SPI.beginTransaction(SPISettings(1000000, MSBFIRST, SPI_MODE0));
}

void loop() {
  byte setpoint = analogRead(A0) >> 2; // 0..255

  digitalWrite(CSPIN, LOW); // Select Slave
  
  // Simultaneous Full-Duplex Transfer:
  // Send setpoint on MOSI, receive encoder position on MISO
  byte encoderFeedback = SPI.transfer(setpoint);
  
  digitalWrite(CSPIN, HIGH); // Release Slave
  delay(10);
}`,
    codeMcuB: `// ==========================================
// MCU B (SPI SLAVE)
// ==========================================
#include <SPI.h>

volatile byte receivedSpeed = 0;
volatile byte currentPosition = 85;

void setup() {
  // Put SCK, MOSI, SS as inputs, MISO as output
  pinMode(MISO, OUTPUT);
  SPCR |= _BV(SPE);      // Turn on SPI in Slave mode
  SPI.attachInterrupt(); // Enable SPI interrupt
}

// SPI transfer complete ISR
ISR(SPI_STC_vect) {
  receivedSpeed = SPDR;  // Read byte from Master (MOSI)
  SPDR = currentPosition; // Queue next byte for MISO
}

void loop() {
  // Update motor stepper position based on receivedSpeed
  if (receivedSpeed > 0) {
    currentPosition = (currentPosition + 1) % 256;
  }
  delay(20);
}`,
  },
  {
    id: 'uart_command_packet',
    protocol: 'UART',
    title: 'UART Cross-Connected ASCII Packet Bridge & CRC',
    titleHu: 'UART Keresztbekötött ASCII Csomag Híd & CRC',
    subtitle: 'TX->RX / RX<-TX, Framing: $CMD,TARGET,VALUE*CRC',
    subtitleHu: 'TX->RX / RX<-TX, Keretezés: $CMD,TARGET,VALUE*CRC',
    category: 'Telemetry',
    categoryHu: 'Telemetria',
    baudRateOrSpeed: '115200 Baud, 8-N-1',
    description:
      'Cross-connected UART communication with structured message framing: MCU A sends commands like `$SET,LED,ON*2F` or `$GET,TELEMETRY*1A`, MCU B parses strings and returns JSON-style ACK responses.',
    descriptionHu:
      'Keresztbekötött UART kommunikáció strukturált üzenetkeretezéssel: az MCU A `$SET,LED,ON*2F` vagy `$GET,TELEMETRY*1A` parancsokat küld, az MCU B pedig feldolgozza és ACK válasszal felel.',
    initialA: {
      potentiometer: 820,
      button1: true,
      sliderVal: 90,
    },
    initialB: {
      ledD13: true,
      rgbColor: { r: 255, g: 60, b: 0 },
      servoAngle: 90,
      sensorTemp: 28.2,
      oledLines: ['UART NODE B', 'BAUD: 115200 8N1', 'CMD: $SET,RGB,255', 'ACK: 0x06 OK'],
    },
    codeMcuA: `// ==========================================
// MCU A (CONTROLLER NODE) - UART
// ==========================================
void setup() {
  Serial.begin(115200); // TX=D1, RX=D0
  pinMode(2, INPUT_PULLUP);
}

void loop() {
  int angle = map(analogRead(A0), 0, 1023, 0, 180);
  
  // Format packet: $CMD,SERVO,<angle>*<chk>
  char buffer[32];
  sprintf(buffer, "$CMD,SERVO,%d*AA\\n", angle);
  Serial.print(buffer);

  // Wait for Slave reply
  if (Serial.available()) {
    String response = Serial.readStringUntil('\\n');
    // Process response: $ACK,OK,STATUS=READY
  }
  delay(150);
}`,
    codeMcuB: `// ==========================================
// MCU B (ACTUATOR NODE) - UART
// ==========================================
#include <Servo.h>
Servo myServo;

void setup() {
  Serial.begin(115200);
  myServo.attach(9);
}

void loop() {
  if (Serial.available()) {
    String packet = Serial.readStringUntil('\\n');
    packet.trim();
    if (packet.startsWith("$CMD,SERVO,")) {
      int idx = packet.indexOf('*');
      String valStr = packet.substring(11, idx);
      int targetAngle = valStr.toInt();
      myServo.write(targetAngle);
      
      // Reply ACK
      Serial.println("$ACK,OK,POS=" + String(targetAngle) + "*55");
    }
  }
}`,
  },
  {
    id: 'rs485_modbus',
    protocol: 'RS485',
    title: 'RS-485 Industrial Half-Duplex Differential Bus (MAX485)',
    titleHu: 'RS-485 Ipari Fél-Duplex Differenciális Busz (MAX485)',
    subtitle: 'Differential A-B Signaling, DE/RE Direction Pin Control',
    subtitleHu: 'Differenciális A-B Jelátvitel, DE/RE Irányváltó Láb',
    category: 'Industrial',
    categoryHu: 'Ipari',
    baudRateOrSpeed: '57600 Baud, 120Ω Terminated',
    description:
      'Industrial differential bus using MAX485 transceivers. MCU A asserts DE/RE HIGH to drive differential lines A & B with high noise immunity up to 1200 meters, then releases to receive slave telemetry.',
    descriptionHu:
      'Ipari differenciális busz MAX485 meghajtókkal. Az MCU A HIGH szintre állítja a DE/RE lábat az A és B vonalak meghajtásához (akár 1200 méter zavarvédettség), majd fogadásra vált.',
    initialA: {
      button1: false,
      potentiometer: 450,
      sliderVal: 100,
    },
    initialB: {
      relayActive: true,
      sensorTemp: 42.1,
      sensorLux: 220,
      oledLines: ['RS-485 NODE #01', 'DIR: RX (DE=LOW)', 'DIFF VOLT: +2.4V', 'RELAY: ON (42.1C)'],
    },
    codeMcuA: `// ==========================================
// MCU A (RS-485 MASTER)
// ==========================================
#define DE_PIN 2

void setup() {
  pinMode(DE_PIN, OUTPUT);
  digitalWrite(DE_PIN, LOW); // Default to Listen
  Serial.begin(57600);
}

void loop() {
  // Transmit Mode (Drive A-B lines)
  digitalWrite(DE_PIN, HIGH);
  delayMicroseconds(50);
  
  // Modbus Read Request: [SlaveID=0x01][Func=0x03][Addr=0x00][Len=0x02][CRC]
  byte req[] = { 0x01, 0x03, 0x00, 0x00, 0x00, 0x02, 0xC4, 0x0B };
  Serial.write(req, sizeof(req));
  Serial.flush(); // Wait until last bit is out
  
  // Receive Mode
  digitalWrite(DE_PIN, LOW);
  
  delay(100);
}`,
    codeMcuB: `// ==========================================
// MCU B (RS-485 SLAVE #1)
// ==========================================
#define DE_PIN 2
#define RELAY_PIN 8

void setup() {
  pinMode(DE_PIN, OUTPUT);
  digitalWrite(DE_PIN, LOW); // Receive mode
  pinMode(RELAY_PIN, OUTPUT);
  Serial.begin(57600);
}

void loop() {
  if (Serial.available() >= 8) {
    byte slave = Serial.read();
    byte func  = Serial.read();
    if (slave == 0x01 && func == 0x03) {
      // Consume rest of frame
      for (int i = 0; i < 6; i++) Serial.read();

      // Switch to TX
      digitalWrite(DE_PIN, HIGH);
      delayMicroseconds(50);
      
      // Response: [ID=0x01][Func=0x03][Bytes=4][Data0..3][CRC]
      byte resp[] = { 0x01, 0x03, 0x04, 0x01, 0xA5, 0x00, 0xDC, 0x7B, 0x42 };
      Serial.write(resp, sizeof(resp));
      Serial.flush();
      digitalWrite(DE_PIN, LOW);
    }
  }
}`,
  },
  {
    id: 'can_automotive',
    protocol: 'CAN',
    title: 'CAN Bus 2.0B Automotive ECU Telemetry & Priority Arbitration',
    titleHu: 'CAN Busz 2.0B Gépjármű ECU Telemetria & Prioritás Arbitráció',
    subtitle: 'CAN_H (3.5V) / CAN_L (1.5V), ID 0x120 (Engine) & 0x240 (Cluster)',
    subtitleHu: 'CAN_H (3.5V) / CAN_L (1.5V), ID 0x120 (Motor) & 0x240 (Műszerfal)',
    category: 'Automotive',
    categoryHu: 'Járműelektronika',
    baudRateOrSpeed: '500 kbps High-Speed CAN',
    description:
      'Automotive Controller Area Network (CAN 2.0B). MCU A broadcasts Engine RPM & Throttle position with high priority ID 0x120. MCU B receives the differential broadcast and updates its dashboard cluster and warning buzzer.',
    descriptionHu:
      'Gépjármű CAN hálózat (CAN 2.0B). Az MCU A magas prioritású ID 0x120 azonosítóval küldi a motorfordulatszámot és fojtószelep állást. Az MCU B fogadja a differenciális jelet és frissíti a műszerfalat.',
    initialA: {
      potentiometer: 750, // Throttle
      sliderVal: 190,     // RPM (e.g. 3800 RPM)
      button1: false,
    },
    initialB: {
      buzzerTone: 0,
      servoAngle: 115,    // Tachometer needle
      oledLines: ['CAN ID: 0x120 (ECU)', 'RPM: 3800 RPM', 'THROTTLE: 73 %', 'BUS: CAN_H 3.5V'],
    },
    codeMcuA: `// ==========================================
// MCU A (ENGINE CONTROL UNIT - ECU)
// ==========================================
#include <mcp_can.h>
#include <SPI.h>
MCP_CAN CAN0(10); // CS = D10

void setup() {
  CAN0.begin(MCP_ANY, CAN_500KBPS, MCP_16MHZ);
  CAN0.setMode(MCP_NORMAL);
}

void loop() {
  int throttle = analogRead(A0); // 0..1023
  int rpm = map(throttle, 0, 1023, 800, 6500);

  byte data[8];
  data[0] = highByte(rpm);
  data[1] = lowByte(rpm);
  data[2] = map(throttle, 0, 1023, 0, 100); // %
  data[3] = 92; // Engine Coolant Temp (92 C)
  data[4] = 0x00; // No error flags
  data[5] = 0x00;
  data[6] = 0x00;
  data[7] = 0x00;

  // Broadcast CAN Message ID 0x120 (High Priority)
  CAN0.sendMsgBuf(0x120, 0, 8, data);
  delay(50);
}`,
    codeMcuB: `// ==========================================
// MCU B (DASHBOARD INSTRUMENT CLUSTER)
// ==========================================
#include <mcp_can.h>
#include <SPI.h>
#include <Servo.h>

MCP_CAN CAN0(10);
Servo tachometer;

void setup() {
  tachometer.attach(9);
  CAN0.begin(MCP_ANY, CAN_500KBPS, MCP_16MHZ);
  CAN0.setMode(MCP_NORMAL);
}

void loop() {
  long unsigned int rxId;
  unsigned char len = 0;
  unsigned char rxBuf[8];

  if (CAN0.checkReceive() == CAN_MSGAVAIL) {
    CAN0.readMsgBuf(&rxId, &len, rxBuf);
    if (rxId == 0x120) {
      int rpm = (rxBuf[0] << 8) | rxBuf[1];
      int throttlePct = rxBuf[2];
      int needleAngle = map(rpm, 0, 7000, 0, 180);
      tachometer.write(needleAngle);
    }
  }
}`,
  },
  {
    id: 'nrf24_wireless',
    protocol: 'NRF24',
    title: 'nRF24L01+ 2.4GHz Wireless Telemetry with RF Attenuation',
    titleHu: 'nRF24L01+ 2.4GHz Vezeték Nélküli Telemetria & Csillapítás',
    subtitle: '2.476 GHz (Ch 76), Auto-ACK, Dynamic Payload & RSSI dBm',
    subtitleHu: '2.476 GHz (76. csatorna), Auto-ACK, Dinamikus Payload & RSSI',
    category: 'Wireless',
    categoryHu: 'Vezeték nélküli',
    baudRateOrSpeed: '2.4GHz ISM, 2 Mbps Air Rate',
    description:
      'Wireless 2.4GHz radio link. MCU A transmits robot control packets wirelessly to MCU B. You can dynamically adjust the simulated distance slider to observe path loss, RSSI degradation, and auto-retransmit packet recovery.',
    descriptionHu:
      'Vezeték nélküli 2.4GHz rádiós kapcsolat. Az MCU A távirányító csomagokat küld az MCU B-nek. A távolság csúszkával szimulálható az útvonalveszteség, az RSSI csökkenés és az automatikus újrapróbálkozás.',
    initialA: {
      potentiometer: 512,
      gyroX: 25,
      button1: false,
    },
    initialB: {
      servoAngle: 90,
      rgbColor: { r: 0, g: 255, b: 120 },
      oledLines: ['NRF24L01+ 2.4GHz', 'RF CH: 76 (2.476G)', 'RSSI: -58 dBm (EXC)', 'PACKET ACK: YES'],
    },
    codeMcuA: `// ==========================================
// MCU A (WIRELESS REMOTE TRANSMITTER)
// ==========================================
#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>

RF24 radio(7, 8); // CE=D7, CSN=D8
const byte address[6] = "NODE1";

struct RemoteData {
  int joyX;
  int joyY;
  byte button;
};

void setup() {
  radio.begin();
  radio.openWritingPipe(address);
  radio.setPALevel(RF24_PA_HIGH);
  radio.setDataRate(RF24_2MBPS);
  radio.stopListening();
}

void loop() {
  RemoteData payload;
  payload.joyX = analogRead(A0);
  payload.joyY = analogRead(A1);
  payload.button = digitalRead(2);

  // Send packet with Auto-ACK
  bool success = radio.write(&payload, sizeof(payload));
  delay(40);
}`,
    codeMcuB: `// ==========================================
// MCU B (WIRELESS ROBOT RECEIVER)
// ==========================================
#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>
#include <Servo.h>

RF24 radio(7, 8);
Servo steering;
const byte address[6] = "NODE1";

struct RemoteData {
  int joyX;
  int joyY;
  byte button;
};

void setup() {
  steering.attach(9);
  radio.begin();
  radio.openReadingPipe(0, address);
  radio.setPALevel(RF24_PA_HIGH);
  radio.setDataRate(RF24_2MBPS);
  radio.startListening();
}

void loop() {
  if (radio.available()) {
    RemoteData payload;
    radio.read(&payload, sizeof(payload));
    int angle = map(payload.joyX, 0, 1023, 0, 180);
    steering.write(angle);
  }
}`,
  },
];
