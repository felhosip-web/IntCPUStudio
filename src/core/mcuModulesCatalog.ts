import { McuHardwareModuleMeta } from '../types/mcu';

export const MCU_HARDWARE_CATALOG: McuHardwareModuleMeta[] = [
  {
    id: 'ds18b20',
    name: 'DS18B20 1-Wire Digital Thermometer',
    nameHu: 'DS18B20 1-Wire Digitális Hőmérő',
    category: 'Sensors',
    categoryHu: 'Szenzorok',
    interfaceType: '1-Wire',
    connectedPins: ['PD4 (D4 Data)', 'VCC (+5V)', 'GND (0V)'],
    color: '#06b6d4',
    description:
      'Maxim DS18B20 high-precision digital temperature sensor (-55°C to +125°C) with 64-bit unique factory ROM address, 9-12 bit configurable ADC scratchpad, and non-volatile alarm trip points.',
    descriptionHu:
      'Maxim DS18B20 nagy pontosságú digitális hőmérsékletmérő szenzor (-55°C és +125°C között), 64-bites egyedi gyári ROM azonosítóval, 9..12 bites felbontású Scratchpad regisztertárral és beállítható riasztási pontokkal.',
  },
  {
    id: 'ds3231_rtc',
    name: 'DS3231 / DS1307 High-Precision I2C RTC',
    nameHu: 'DS3231 / DS1307 I2C Valós Idejű Óra (RTC)',
    category: 'Clocks',
    categoryHu: 'Órák',
    interfaceType: 'I2C',
    connectedPins: ['PC4 (A4 / SDA)', 'PC5 (A5 / SCL)', 'SQW / INT (PD2)'],
    color: '#8b5cf6',
    description:
      'Extremely accurate I2C Real-Time Clock with integrated Temperature-Compensated Crystal Oscillator (TCXO), BCD calendar (seconds to years), battery backup voltage sensing, and dual programmable alarms.',
    descriptionHu:
      'Nagy pontosságú I2C valós idejű óra integrált hőmérséklet-kompenzált kvarcoszcillátorral (TCXO), BCD naptárral (másodperctől évekig), gombelem-feszültség mérővel és 2 db programozható hardveres ébresztővel.',
  },
  {
    id: 'rotary_encoder',
    name: 'Rotary Quadrature Encoder with Push Button',
    nameHu: 'Rotary Encoder (Forgó Jeladó) Nyomógombbal',
    category: 'Inputs',
    categoryHu: 'Bemenetek',
    interfaceType: 'GPIO',
    connectedPins: ['PD2 (D2 / INT0 CLK)', 'PD4 (D4 DT)', 'PD7 (D7 SW Switch)'],
    color: '#f59e0b',
    description:
      'Incremental 24-step rotary encoder outputting 2-bit Gray quadrature pulses (Phase A and Phase B) for direction/speed detection, with an integrated tactile push button switch.',
    descriptionHu:
      '24 lépéses inkrementális forgó jeladó kétfázisú kvadratúra Gray-kód impulzusokkal (A és B fázis) a forgásirány és sebesség érzékeléséhez, beépített kattanó nyomógombbal a menüválasztásokhoz.',
  },
  {
    id: 'nrf24l01',
    name: 'nRF24L01+ 2.4 GHz RF Wireless Transceiver',
    nameHu: 'nRF24L01+ 2.4 GHz Vezeték Nélküli Transceiver',
    category: 'Wireless',
    categoryHu: 'Vezeték nélküli',
    interfaceType: 'SPI',
    connectedPins: ['PB3 (MOSI)', 'PB4 (MISO)', 'PB5 (SCK)', 'PB0 (D8 / CE)', 'PB2 (D10 / CSN)', 'PD2 (INT0 / IRQ)'],
    color: '#10b981',
    description:
      'Nordic Semiconductor 2.4GHz ISM-band RF transceiver with Enhanced ShockBurst auto-acknowledgement, 126 selectable RF channels (2.400 - 2.525 GHz), 250kbps to 2Mbps data rate, and multi-pipe packet routing.',
    descriptionHu:
      'Nordic Semiconductor 2.4 GHz ISM-sávú rádiófrekvenciás adó-vevő modul Enhanced ShockBurst automatikus nyugtázással, 126 választható RF csatornával (2.400-2.525 GHz), 250 kbps-től 2 Mbps adatsebességgel és többutas adatcsomag-kezeléssel.',
  },
  {
    id: 'basic_sensors',
    name: 'Standard Analog Sensors & Buttons',
    nameHu: 'Alap Analóg Szenzorok & Kapcsolók',
    category: 'Sensors',
    categoryHu: 'Szenzorok',
    interfaceType: 'ADC',
    connectedPins: ['PC0 (A0 Potentiometer)', 'PC1 (A1 TMP36)', 'PC2 (A2 LDR Light)', 'PD2 (INT0 Button)', 'PD7 (Button 2)'],
    color: '#38bdf8',
    description:
      'Precision Potentiometer (0-5V), TMP36 Linear Temperature Sensor, Cadmium-Sulfide (LDR) Light Sensor, and digital pull-up push buttons.',
    descriptionHu:
      'Precíziós forgó potméter (0-5V), TMP36 analóg hőmérő, LDR fényérzékelő fotoellenállás és külső hardveres megszakítás nyomógombok.',
  },
  {
    id: 'rgb_servo_lcd',
    name: 'Actuators: RGB LED, RC Servo & 16x2 LCD',
    nameHu: 'Beavatkozók: RGB LED, RC Szervó & 16x2 LCD',
    category: 'Displays',
    categoryHu: 'Kijelzők',
    interfaceType: 'PWM',
    connectedPins: ['PD6 (OCR0A Red)', 'PD5 (OCR0B Green)', 'PD3 (OCR2B Blue)', 'PB1 (D9 Servo PWM)', 'HD44780 LCD Bus'],
    color: '#ec4899',
    description:
      '3-Channel Hardware Timer PWM RGB LED, 50Hz RC Servo Motor (0-180°), 16x2 Character Alphanumeric HD44780 LCD, and Piezo Buzzer.',
    descriptionHu:
      '3-csatornás hardveres PWM időzített RGB LED, 50 Hz-es RC szervómotor (0-180°), 16x2 karakteres alfanumerikus LCD kijelző és piezo csipogó.',
  },
];
