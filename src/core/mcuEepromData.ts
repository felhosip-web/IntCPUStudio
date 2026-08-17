import { EepromPreset } from '../types/mcuEeprom';

export const EEPROM_PRESETS: EepromPreset[] = [
  {
    id: 'arcade_highscore',
    title: '🎮 Retro Arcade High-Score Table',
    titleHu: '🎮 Retro Arcade Rekordtábla (High-Scores)',
    category: 'GAMING',
    categoryHu: 'Játék',
    description:
      'Stores top 3 players with 3-character ASCII initials, 16-bit little-endian score, level index, and CRC-8 integrity checksum.',
    descriptionHu:
      'A legjobb 3 játékos rekordját tárolja: 3 karakteres ASCII monogram, 16-bites little-endian pontszám, elért pálya és CRC-8 ellenőrzőösszeg.',
    data: [
      // Signature & Version
      { address: 0x000, value: 0x48, label: 'Sig "H"' },
      { address: 0x001, value: 0x53, label: 'Sig "S"' },
      { address: 0x002, value: 0x01, label: 'Version v1' },
      { address: 0x003, value: 0x03, label: 'Entry Count (3)' },

      // Entry 1: "ACE" - 25,420 pts ($634C) - Level 12
      { address: 0x004, value: 0x41, label: 'P1: "A"' },
      { address: 0x005, value: 0x43, label: 'P1: "C"' },
      { address: 0x006, value: 0x45, label: 'P1: "E"' },
      { address: 0x007, value: 0x4c, label: 'P1 Score LSB ($4C)' },
      { address: 0x008, value: 0x63, label: 'P1 Score MSB ($63)' },
      { address: 0x009, value: 0x0c, label: 'P1 Level (12)' },

      // Entry 2: "BOB" - 18,250 pts ($474A) - Level 9
      { address: 0x00a, value: 0x42, label: 'P2: "B"' },
      { address: 0x00b, value: 0x4f, label: 'P2: "O"' },
      { address: 0x00c, value: 0x42, label: 'P2: "B"' },
      { address: 0x00d, value: 0x4a, label: 'P2 Score LSB ($4A)' },
      { address: 0x00e, value: 0x47, label: 'P2 Score MSB ($47)' },
      { address: 0x00f, value: 0x09, label: 'P2 Level (9)' },

      // Entry 3: "NEO" - 12,000 pts ($2EE0) - Level 6
      { address: 0x010, value: 0x4e, label: 'P3: "N"' },
      { address: 0x011, value: 0x45, label: 'P3: "E"' },
      { address: 0x012, value: 0x4f, label: 'P3: "O"' },
      { address: 0x013, value: 0xe0, label: 'P3 Score LSB ($E0)' },
      { address: 0x014, value: 0x2e, label: 'P3 Score MSB ($2E)' },
      { address: 0x015, value: 0x06, label: 'P3 Level (6)' },

      // CRC-8 Checksum
      { address: 0x016, value: 0x9b, label: 'CRC-8 Checksum' },
    ],
    arduinoCode: `// ============================================
// Arduino EEPROM High-Score Table
// ============================================
#include <EEPROM.h>

struct HighScoreEntry {
  char initials[3];
  uint16_t score;
  uint8_t level;
};

void saveHighScore(int slot, const char* name, uint16_t score, uint8_t level) {
  int addr = 4 + slot * sizeof(HighScoreEntry);
  HighScoreEntry entry;
  entry.initials[0] = name[0];
  entry.initials[1] = name[1];
  entry.initials[2] = name[2];
  entry.score = score;
  entry.level = level;
  
  // EEPROM.put automatically handles multi-byte structs
  // and only writes bytes that changed to save endurance!
  EEPROM.put(addr, entry);
  Serial.print("Saved High-Score Slot ");
  Serial.println(slot);
}

void loadHighScore(int slot) {
  int addr = 4 + slot * sizeof(HighScoreEntry);
  HighScoreEntry entry;
  EEPROM.get(addr, entry);
  Serial.print("Player: ");
  Serial.print(entry.initials[0]);
  Serial.print(entry.initials[1]);
  Serial.print(entry.initials[2]);
  Serial.print(" Score: ");
  Serial.println(entry.score);
}
`,
    avrAsmCode: `; ============================================
; AVR Assembly: EEPROM High-Score Reader
; ============================================
read_p1_initials:
  ; Read P1 initial char 1 from EEPROM address 0x0004
  ldi r17, 0x00     ; EEARH = 0
  ldi r18, 0x04     ; EEARL = 4
  rcall eeprom_read_byte
  mov r19, r16      ; R19 = 'A' (0x41)

  ; Read P1 initial char 2 (0x0005)
  inc r18
  rcall eeprom_read_byte
  mov r20, r16      ; R20 = 'C' (0x43)
  ret

eeprom_read_byte:
  ; Wait for completion of previous write
  sbic EECR, EEPE
  rjmp eeprom_read_byte
  ; Set up address in EEARH:EEARL
  out EEARH, r17
  out EEARL, r18
  ; Start EEPROM read by setting EERE
  sbi EECR, EERE
  ; Read data from Data Register
  in r16, EEDR
  ret
`,
  },
  {
    id: 'device_config',
    title: '⚙️ IoT Node Configuration & Network Credentials',
    titleHu: '⚙️ IoT Eszköz Konfiguráció & Hálózati Beállítások',
    category: 'CONFIG',
    categoryHu: 'Konfiguráció',
    description:
      'Stores magic signature $AA55, device node ID, WiFi SSID, baud rate index, and static IP address across reboots.',
    descriptionHu:
      'Tárolja a $AA55 mágikus fejlécet, az egyedi node ID-t, a WiFi SSID nevet, a soros port baud rátát és a statikus IP címet.',
    data: [
      // Magic Header $AA $55
      { address: 0x000, value: 0xaa, label: 'Magic $AA' },
      { address: 0x001, value: 0x55, label: 'Magic $55' },
      { address: 0x002, value: 0x42, label: 'Node ID (66)' },
      { address: 0x003, value: 0x04, label: 'Baud Rate (115200)' },

      // Static IP: 192.168.1.150
      { address: 0x004, value: 192, label: 'IP Octet 1 (192)' },
      { address: 0x005, value: 168, label: 'IP Octet 2 (168)' },
      { address: 0x006, value: 1, label: 'IP Octet 3 (1)' },
      { address: 0x007, value: 150, label: 'IP Octet 4 (150)' },

      // WiFi SSID: "Lab_Sensor_Net"
      { address: 0x008, value: 0x4c, label: 'SSID: "L"' },
      { address: 0x009, value: 0x61, label: 'SSID: "a"' },
      { address: 0x00a, value: 0x62, label: 'SSID: "b"' },
      { address: 0x00b, value: 0x5f, label: 'SSID: "_"' },
      { address: 0x00c, value: 0x53, label: 'SSID: "S"' },
      { address: 0x00d, value: 0x65, label: 'SSID: "e"' },
      { address: 0x00e, value: 0x6e, label: 'SSID: "n"' },
      { address: 0x00f, value: 0x73, label: 'SSID: "s"' },
      { address: 0x010, value: 0x6f, label: 'SSID: "o"' },
      { address: 0x011, value: 0x72, label: 'SSID: "r"' },
      { address: 0x012, value: 0x5f, label: 'SSID: "_"' },
      { address: 0x013, value: 0x4e, label: 'SSID: "N"' },
      { address: 0x014, value: 0x65, label: 'SSID: "e"' },
      { address: 0x015, value: 0x74, label: 'SSID: "t"' },
      { address: 0x016, value: 0x00, label: 'Null Terminator' },

      // Boot Count (16-bit): e.g. 42 boots ($002A)
      { address: 0x018, value: 0x2a, label: 'Boot Count LSB' },
      { address: 0x019, value: 0x00, label: 'Boot Count MSB' },
    ],
    arduinoCode: `// ============================================
// Load & Update IoT Node Config from EEPROM
// ============================================
#include <EEPROM.h>

#define CONFIG_MAGIC 0x55AA

void setup() {
  Serial.begin(9600);
  uint16_t magic = (EEPROM.read(0) << 8) | EEPROM.read(1);
  
  if (magic != 0xAA55) {
    Serial.println("EEPROM not initialized! Writing factory defaults...");
    EEPROM.update(0, 0xAA);
    EEPROM.update(1, 0x55);
    EEPROM.update(2, 42); // Node ID
    // Write Default IP 192.168.1.150
    EEPROM.update(4, 192);
    EEPROM.update(5, 168);
    EEPROM.update(6, 1);
    EEPROM.update(7, 150);
  } else {
    Serial.println("Valid EEPROM Config Found!");
    uint8_t nodeId = EEPROM.read(2);
    Serial.print("Node ID: ");
    Serial.println(nodeId);
  }
}
`,
    avrAsmCode: `; ============================================
; Check Config Magic Header in AVR Assembly
; ============================================
check_magic:
  ldi r17, 0x00
  ldi r18, 0x00     ; Address 0x0000
  rcall eeprom_read_byte
  cpi r16, 0xAA
  brne invalid_config

  ldi r18, 0x01     ; Address 0x0001
  rcall eeprom_read_byte
  cpi r16, 0x55
  brne invalid_config
  ; Magic is valid!
  ret

invalid_config:
  ; Restore factory defaults
  ret
`,
  },
  {
    id: 'sensor_calibration',
    title: '🔬 ADC Sensor Calibration & Servo Offsets',
    titleHu: '🔬 ADC Szenzor Kalibráció & Szervó Végállások',
    category: 'SENSORS',
    categoryHu: 'Szenzorok',
    description:
      'Stores 10-bit zero-offset compensation, gain multipliers, and RC servo angle trim values (0°, 90°, 180°).',
    descriptionHu:
      'Tárolja a 10-bites nullpont-eltolást, erősítési szorzót és RC szervó szögfinomhangoló értékeket (0°, 90°, 180°).',
    data: [
      { address: 0x020, value: 0x0c, label: 'ADC Offset LSB (+12)' },
      { address: 0x021, value: 0x00, label: 'ADC Offset MSB' },
      { address: 0x022, value: 0x64, label: 'Gain Scaler (1.00x)' },
      { address: 0x023, value: 0x00, label: 'Temp Sensor Coeff' },

      // Servo Trims (Microseconds)
      // Min pulse: 544 us ($0220)
      { address: 0x024, value: 0x20, label: 'Servo Min LSB ($20)' },
      { address: 0x025, value: 0x02, label: 'Servo Min MSB ($02)' },

      // Center pulse: 1500 us ($05DC)
      { address: 0x026, value: 0xdc, label: 'Servo Center LSB ($DC)' },
      { address: 0x027, value: 0x05, label: 'Servo Center MSB ($05)' },

      // Max pulse: 2400 us ($0960)
      { address: 0x028, value: 0x60, label: 'Servo Max LSB ($60)' },
      { address: 0x029, value: 0x09, label: 'Servo Max MSB ($09)' },
    ],
    arduinoCode: `// ============================================
// Servo & ADC Calibration with EEPROM.update
// ============================================
#include <EEPROM.h>

struct CalibrationData {
  int16_t adcOffset;
  uint8_t gainScaler;
  uint16_t servoMinUs;
  uint16_t servoCenterUs;
  uint16_t servoMaxUs;
};

void applyCalibration() {
  CalibrationData cal;
  EEPROM.get(0x20, cal);
  Serial.print("Loaded ADC Offset: ");
  Serial.println(cal.adcOffset);
  Serial.print("Servo Center Pulse (us): ");
  Serial.println(cal.servoCenterUs);
}
`,
    avrAsmCode: `; ============================================
; Read 16-bit Servo Trim from EEPROM
; ============================================
read_servo_center:
  ldi r17, 0x00
  ldi r18, 0x26     ; Address 0x0026
  rcall eeprom_read_byte
  mov r24, r16      ; LSB (0xDC)
  inc r18           ; Address 0x0027
  rcall eeprom_read_byte
  mov r25, r16      ; MSB (0x05) -> R25:R24 = 1500us
  ret
`,
  },
  {
    id: 'wear_level_log',
    title: '📈 Wear-Leveling Circular Ring-Buffer Datalogger',
    titleHu: '📈 Kopáscsökkentett Körkörös Adatnaplózó (Wear-Leveling)',
    category: 'DIAGNOSTICS',
    categoryHu: 'Diagnosztika',
    description:
      'Distributes write cycles evenly across 32 slots instead of hammering address 0, extending 100k endurance to over 3.2 million writes!',
    descriptionHu:
      'Egyenletesen osztja el az írási ciklusokat 32 slot között, ahelyett hogy a 0-s címet koptatná, így a 100k élettartam 3,2 millió írás fölé nő!',
    data: [
      { address: 0x040, value: 0x05, label: 'Ring Head Pointer (Slot 5)' },
      { address: 0x041, value: 0x20, label: 'Buffer Capacity (32)' },

      // Sample Log Records (Slot 0..5)
      { address: 0x042, value: 24, label: 'Log[0]: 24°C' },
      { address: 0x043, value: 25, label: 'Log[1]: 25°C' },
      { address: 0x044, value: 25, label: 'Log[2]: 25°C' },
      { address: 0x045, value: 26, label: 'Log[3]: 26°C' },
      { address: 0x046, value: 27, label: 'Log[4]: 27°C' },
      { address: 0x047, value: 28, label: 'Log[5]: 28°C (Latest)' },
    ],
    arduinoCode: `// ============================================
// Wear-Leveling Circular Logger
// ============================================
#include <EEPROM.h>

#define RING_HEAD_ADDR 0x40
#define BUFFER_START 0x42
#define BUFFER_SIZE 32

void logSample(uint8_t tempCelsius) {
  uint8_t head = EEPROM.read(RING_HEAD_ADDR);
  if (head >= BUFFER_SIZE) head = 0;
  
  // Write new sample to current slot
  int slotAddr = BUFFER_START + head;
  EEPROM.update(slotAddr, tempCelsius);
  
  // Advance head pointer
  head = (head + 1) % BUFFER_SIZE;
  EEPROM.update(RING_HEAD_ADDR, head);
  
  Serial.print("Logged sample to EEPROM address: 0x");
  Serial.println(slotAddr, HEX);
}
`,
    avrAsmCode: `; ============================================
; Circular EEPROM Buffer Pointer Step
; ============================================
advance_ring_pointer:
  ldi r17, 0x00
  ldi r18, 0x40     ; Head address
  rcall eeprom_read_byte
  inc r16
  cpi r16, 32       ; Modulo 32
  brlo no_wrap
  clr r16
no_wrap:
  mov r19, r16      ; New head value
  ; Write back
  mov r16, r19
  rcall eeprom_write_byte
  ret
`,
  },
];
