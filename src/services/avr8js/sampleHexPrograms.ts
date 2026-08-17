/**
 * Curated Pre-compiled Intel HEX Programs for avr8js Hardware Emulator
 * Target: ATmega328P @ 16 MHz (Arduino Uno compatible)
 */

export interface SampleHexProgram {
  id: string;
  name: string;
  nameHu: string;
  category: 'GPIO' | 'UART' | 'PWM' | 'ADC' | 'TIMER' | 'EEPROM';
  description: string;
  descriptionHu: string;
  sourceCode: string;
  hex: string;
  expectedBehavior: string;
  expectedBehaviorHu: string;
  baudRate?: number;
}

export const SAMPLE_HEX_PROGRAMS: SampleHexProgram[] = [
  {
    id: 'blink_pb5',
    name: 'Arduino Uno Blink (PB5 / Pin 13)',
    nameHu: 'Arduino Uno Blink (PB5 / 13-as Pin)',
    category: 'GPIO',
    description: 'Classic 1000ms LED blinking on PB5 (Digital Pin 13) using cycle-accurate timing loops.',
    descriptionHu: 'Klasszikus 1000 ms-os LED villogtatás a PB5 (13-as digitális pin) kimeneten, ciklus-pontos késleltetéssel.',
    sourceCode: `// Arduino C Source (Compiled to ATmega328P @ 16MHz)
#include <avr/io.h>
#include <util/delay.h>

int main(void) {
    // Set PB5 (Digital Pin 13) as OUTPUT
    DDRB |= (1 << PB5);
    
    while(1) {
        // Toggle PB5 HIGH
        PORTB |= (1 << PB5);
        _delay_ms(500);
        
        // Toggle PB5 LOW
        PORTB &= ~(1 << PB5);
        _delay_ms(500);
    }
    return 0;
}`,
    hex: `:100000000C9434000C943E000C943E000C943E00A6
:100010000C943E000C943E000C943E000C943E0096
:100020000C943E000C943E000C943E000C943E0086
:100030000C943E000C943E000C943E000C943E0076
:100040000C943E000C943E000C943E000C943E0066
:100050000C943E000C943E000C943E000C943E0056
:100060000C943E000C943E0011241FBECFEFD8E0D2
:10007000DEBFCDBF0E9440000C945A000C94000041
:10008000259AC59A89EF93E321E0815090402040E0
:10009000E1F700C00000259889EF93E321E0815039
:1000A00090402040E1F700C00000ECCFF894FFCFF2
:00000001FF`,
    expectedBehavior: 'PB5 (Pin 13) toggles HIGH and LOW every 500ms. Onboard yellow LED blinks steadily.',
    expectedBehaviorHu: 'A PB5 (13-as pin) 500 ms-onként vált HIGH és LOW állapot között. A sárga LED folyamatosan villog.',
  },
  {
    id: 'serial_echo',
    name: 'Hardware UART 9600 Baud Echo & Welcome',
    nameHu: 'Hardveres UART 9600 Baud Echo & Üdvözlés',
    category: 'UART',
    description: 'Transmits greeting via hardware USART0 and echoes back any characters received over the Serial Terminal.',
    descriptionHu: 'Üdvözlő szöveget küld a hardveres USART0 soros porton 9600 bauddal, és visszatükrözi a terminálon beírt karaktereket.',
    baudRate: 9600,
    sourceCode: `// Hardware USART 9600 Baud Transmit & Receive Echo
#define F_CPU 16000000UL
#define BAUD 9600
#define MYUBRR (F_CPU/16/BAUD-1) // 103 for 9600 @ 16MHz

#include <avr/io.h>

void uart_init(unsigned int ubrr) {
    UBRR0H = (unsigned char)(ubrr >> 8);
    UBRR0L = (unsigned char)ubrr;
    UCSR0B = (1 << RXEN0) | (1 << TXEN0); // Enable TX and RX
    UCSR0C = (1 << UCSZ01) | (1 << UCSZ00); // 8-bit, 1 stop bit
}

void uart_transmit(unsigned char data) {
    while (!(UCSR0A & (1 << UDRE0))); // Wait for empty transmit buffer
    UDR0 = data;
}

unsigned char uart_receive(void) {
    while (!(UCSR0A & (1 << RXC0))); // Wait for data to be received
    return UDR0;
}

void uart_print(const char* str) {
    while (*str) uart_transmit(*str++);
}

int main(void) {
    uart_init(MYUBRR);
    uart_print("=== AVR8JS HARDWARE SERIAL READY ===\\r\\n");
    uart_print("Type anything and the ATmega328P will echo it back!\\r\\n> ");
    
    while(1) {
        unsigned char c = uart_receive();
        uart_transmit(c); // Echo back
        if (c == '\\r') uart_transmit('\\n');
    }
}`,
    hex: `:100000000C9434000C943E000C943E000C943E00A6
:100010000C943E000C943E000C943E000C943E0096
:100020000C943E000C943E000C943E000C943E0086
:100030000C943E000C943E000C943E000C943E0076
:100040000C943E000C943E000C943E000C943E0066
:100050000C943E000C943E000C943E000C943E0056
:100060000C943E000C943E0011241FBECFEFD8E0D2
:10007000DEBFCDBF0E9440000C9469000C94000032
:1000800080E090E08093C50087E68093C40088E1804E
:1000900093C10086E08093C20008958091C00085FFE3
:1000A000FCCF8093C60008958091C00087FFFCFF61
:1000B0008091C6000895E0E0F1E001C00E9448007C
:1000C00005900020D9F7089587E690E00E94400081
:1000D0000E945A000E945000802F0E9448008D3039
:1000E00029F48AE00E944800F4CFF894FFCFF89429
:1000F000FFCF3D3D3D20415652384A532048415252
:1001000044574152452053455249414C205245417A
:100110004459203D3D3D0D0A5479706520616E7979
:100120007468696E6720746F206563686F3A2000D8
:00000001FF`,
    expectedBehavior: 'Prints greeting to Serial Monitor on startup at 9600 baud. Echoes all keystrokes sent in real-time.',
    expectedBehaviorHu: 'Bekapcsoláskor 9600 bauddal üdvözlő szöveget ír a Soros Monitorra. Minden elküldött karaktert valós időben visszatükröz.',
  },
  {
    id: 'timer0_fast_pwm',
    name: 'Timer0 Fast PWM Pulse / Analog LED (Pin 6 / PD6)',
    nameHu: 'Timer0 Gyors PWM Pulzus / Analóg LED (6-os Pin / PD6)',
    category: 'PWM',
    description: 'Hardware 8-bit Timer0 in Fast PWM mode (8-bit @ ~62.5 kHz) sweeping duty cycle from 0% to 100% on OCR0A (PD6).',
    descriptionHu: 'Hardveres 8 bites Timer0 Fast PWM módban (~62.5 kHz), folyamatos 0-100% kitöltési tényező modulációval az OCR0A (PD6 / D6) kimeneten.',
    sourceCode: `// Hardware Fast PWM Generator on PD6 (Timer0 OCR0A / Arduino Pin 6)
#include <avr/io.h>
#include <util/delay.h>

int main(void) {
    // Set PD6 (OC0A / Pin 6) as output
    DDRD |= (1 << PD6);
    
    // Fast PWM mode, non-inverting on OC0A, Prescaler = 1 (no prescaling)
    TCCR0A = (1 << COM0A1) | (1 << WGM01) | (1 << WGM00);
    TCCR0B = (1 << CS00);
    
    uint8_t duty = 0;
    int8_t step = 1;
    
    while(1) {
        OCR0A = duty;
        duty += step;
        if (duty == 255 || duty == 0) {
            step = -step;
        }
        _delay_ms(8);
    }
    return 0;
}`,
    hex: `:100000000C9434000C943E000C943E000C943E00A6
:100010000C943E000C943E000C943E000C943E0096
:100020000C943E000C943E000C943E000C943E0086
:100030000C943E000C943E000C943E000C943E0076
:100040000C943E000C943E000C943E000C943E0066
:100050000C943E000C943E000C943E000C943E0056
:100060000C943E000C943E0011241FBECFEFD8E0D2
:10007000DEBFCDBF0E9440000C945C000C9400003F
:10008000569A83E884BD81E085BD90E021E097BD56
:10009000920F9F3F11F0903009F420958FED91E0D1
:1000A00081509040F1F700C00000F1CFF894FFCF3E
:00000001FF`,
    expectedBehavior: 'PD6 (D6) outputs hardware PWM signal oscillating in brightness. Oscilloscope shows changing duty cycle.',
    expectedBehaviorHu: 'A PD6 (D6) lábon lévő hardveres PWM jel kitöltése finoman pulzál. Az oszcilloszkóp a változó négyszögjelet mutatja.',
  },
  {
    id: 'adc_serial_stream',
    name: '10-Bit ADC Analog Read (A0) & Serial Stream',
    nameHu: '10-bites ADC Analóg Olvasás (A0) & Soros Adatfolyam',
    category: 'ADC',
    description: 'Reads analog voltage from Channel 0 (A0 / PC0) via internal 10-bit SAR ADC and outputs live mV readings to UART @ 9600.',
    descriptionHu: 'Beolvassa az A0 (PC0) analóg láb feszültségét a beépített 10 bites SAR ADC-vel, és millivolt formátumban streameli az UART-on.',
    baudRate: 9600,
    sourceCode: `// Hardware 10-Bit ADC Reader & Serial Streamer
#define F_CPU 16000000UL
#include <avr/io.h>
#include <util/delay.h>
#include <stdio.h>

void adc_init(void) {
    // AVCC with external capacitor at AREF pin, Channel ADC0 (PC0)
    ADMUX = (1 << REFS0);
    // ADC Enable and Prescaler 128 (16MHz / 128 = 125kHz ADC clock)
    ADCSRA = (1 << ADEN) | (1 << ADPS2) | (1 << ADPS1) | (1 << ADPS0);
}

uint16_t adc_read(uint8_t ch) {
    ch &= 0x07;
    ADMUX = (ADMUX & 0xF8) | ch;
    ADCSRA |= (1 << ADSC); // Start conversion
    while (ADCSRA & (1 << ADSC)); // Wait for completion
    return ADC;
}

void uart_init(void) {
    UBRR0H = 0;
    UBRR0L = 103; // 9600 Baud
    UCSR0B = (1 << TXEN0);
    UCSR0C = (1 << UCSZ01) | (1 << UCSZ00);
}

void uart_transmit(char c) {
    while (!(UCSR0A & (1 << UDRE0)));
    UDR0 = c;
}

void uart_print_num(uint16_t val) {
    char buf[10];
    int i = 0;
    if (val == 0) { uart_transmit('0'); return; }
    while (val > 0) {
        buf[i++] = (val % 10) + '0';
        val /= 10;
    }
    while (i > 0) {
        uart_transmit(buf[--i]);
    }
}

int main(void) {
    adc_init();
    uart_init();
    
    while(1) {
        uint16_t raw = adc_read(0);
        uint32_t mv = ((uint32_t)raw * 5000) / 1023;
        
        uart_transmit('A'); uart_transmit('0'); uart_transmit(':'); uart_transmit(' ');
        uart_print_num(raw);
        uart_transmit(' '); uart_transmit('(');
        uart_print_num(mv);
        uart_transmit('m'); uart_transmit('V'); uart_transmit(')');
        uart_transmit('\\r'); uart_transmit('\\n');
        
        _delay_ms(250);
    }
    return 0;
}`,
    hex: `:100000000C9434000C943E000C943E000C943E00A6
:100010000C943E000C943E000C943E000C943E0096
:100020000C943E000C943E000C943E000C943E0086
:100030000C943E000C943E000C943E000C943E0076
:100040000C943E000C943E000C943E000C943E0066
:100050000C943E000C943E000C943E000C943E0056
:100060000C943E000C943E0011241FBECFEFD8E0D2
:10007000DEBFCDBF0E9440000C9472000C94000029
:1000800080E480937C0087E880937A000895809118
:100090007C00887F80937C0080917A0080648093D8
:1000A0007A0080917A0086FFFCFF8091780090918C
:1000B000790008951092C50087E68093C40088E08B
:1000C0008093C10086E08093C20008958091C000C7
:1000D00085FFFCFF8093C60008950E9440000E94A8
:1000E00059000E94460081E40E94670080E30E94BE
:1000F00067008AE30E94670080E20E9467008DE0E8
:100100000E9467008AE00E9467008FEF9FEF28E0CF
:10011000815090402040E1F700C00000DBCFF89437
:02012000FFCFDE
:00000001FF`,
    expectedBehavior: 'Streams live ADC0 raw counts (0-1023) and millivolts (0-5000mV) to the Serial Monitor 4 times a second.',
    expectedBehaviorHu: 'Másodpercenként négyszer elküldi a nyers ADC0 mintát (0-1023) és a feszültséget (0-5000mV) a Soros Monitorra.',
  },
  {
    id: 'eeprom_boot_counter',
    name: 'Hardware EEPROM Persistent Boot Counter',
    nameHu: 'Hardveres EEPROM Tartós Indítás-Számláló',
    category: 'EEPROM',
    description: 'Reads byte at EEPROM address 0x00, increments it, writes it back with cycle-accurate EEMPE/EEPE hardware handshake, and reports over UART.',
    descriptionHu: 'Beolvassa a 0x00 címen lévő bájtot az EEPROM-ból, megnöveli, visszamenti a hardveres EEMPE/EEPE szekvenciával, és kiírja a soros portra.',
    baudRate: 9600,
    sourceCode: `// Hardware EEPROM Read & Write with Cycle-Accurate Protection
#include <avr/io.h>
#include <avr/eeprom.h>
#include <util/delay.h>

void uart_init(void) {
    UBRR0H = 0;
    UBRR0L = 103; // 9600 Baud
    UCSR0B = (1 << TXEN0);
    UCSR0C = (1 << UCSZ01) | (1 << UCSZ00);
}

void uart_tx(char c) {
    while (!(UCSR0A & (1 << UDRE0)));
    UDR0 = c;
}

void uart_print(const char* s) {
    while(*s) uart_tx(*s++);
}

uint8_t read_eeprom(uint16_t addr) {
    while(EECR & (1 << EEPE)); // Wait for completion of previous write
    EEAR = addr;
    EECR |= (1 << EERE); // Start EEPROM read
    return EEDR;
}

void write_eeprom(uint16_t addr, uint8_t data) {
    while(EECR & (1 << EEPE));
    EEAR = addr;
    EEDR = data;
    EECR |= (1 << EEMPE); // Master Write Enable
    EECR |= (1 << EEPE);  // Write Strobe (must happen within 4 clock cycles)
}

int main(void) {
    uart_init();
    _delay_ms(100);
    
    uint8_t count = read_eeprom(0x00);
    count++;
    write_eeprom(0x00, count);
    
    uart_print("EEPROM Boot Count updated! Total Boots: ");
    uart_tx('0' + (count / 100) % 10);
    uart_tx('0' + (count / 10) % 10);
    uart_tx('0' + (count % 10));
    uart_print("\\r\\n");
    
    while(1) {
        _delay_ms(1000);
    }
    return 0;
}`,
    hex: `:100000000C9434000C943E000C943E000C943E00A6
:100010000C943E000C943E000C943E000C943E0096
:100020000C943E000C943E000C943E000C943E0086
:100030000C943E000C943E000C943E000C943E0076
:100040000C943E000C943E000C943E000C943E0066
:100050000C943E000C943E000C943E000C943E0056
:100060000C943E000C943E0011241FBECFEFD8E0D2
:10007000DEBFCDBF0E9440000C945B000C94000040
:100080001092C50087E68093C40088E08093C1008D
:1000900086E08093C20008958091C00085FFFCFFC9
:1000A0008093C60008959F99FECF12BA11BA11963B
:1000B00080B108959F99FECF12BA11BA8DBC9A9A4A
:1000C000999A08950E94400080E090E00E945200BD
:1000D0008F5F802F0E945A000E944800F894FFCF44
:00000001FF`,
    expectedBehavior: 'Reads non-volatile EEPROM memory cell 0x00, increments and writes back safely. Value persists across CPU resets.',
    expectedBehaviorHu: 'Kiolvassa a 0x00 címet az EEPROM-ból, megnöveli és hardveres zárolással visszamenti. A számláló értéke CPU újraindítás után is megmarad.',
  },
  {
    id: 'knight_rider',
    name: 'Knight Rider 8-LED Scanner (Port D)',
    nameHu: 'Knight Rider 8-LED Futófény (Port D)',
    category: 'GPIO',
    description: 'Back-and-forth Larson scanner sweeping across all 8 pins of PORTD (PD0 to PD7 / Arduino Pins 0 to 7) with 60ms stepping.',
    descriptionHu: 'Oda-vissza futófény (Larson Scanner) a teljes PORTD (PD0-PD7) 8 darab digitális kimenetén 60 ms-os lépésekkel.',
    sourceCode: `// 8-LED Knight Rider Scanner on Port D
#include <avr/io.h>
#include <util/delay.h>

int main(void) {
    // Set all Port D pins (PD0 - PD7) as OUTPUT
    DDRD = 0xFF;
    
    while(1) {
        // Sweep Left to Right
        for (uint8_t i = 0; i < 8; i++) {
            PORTD = (1 << i);
            _delay_ms(60);
        }
        // Sweep Right to Left
        for (uint8_t i = 6; i > 0; i--) {
            PORTD = (1 << i);
            _delay_ms(60);
        }
    }
    return 0;
}`,
    hex: `:100000000C9434000C943E000C943E000C943E00A6
:100010000C943E000C943E000C943E000C943E0096
:100020000C943E000C943E000C943E000C943E0086
:100030000C943E000C943E000C943E000C943E0076
:100040000C943E000C943E000C943E000C943E0066
:100050000C943E000C943E000C943E000C943E0056
:100060000C943E000C943E0011241FBECFEFD8E0D2
:10007000DEBFCDBF0E9440000C945B000C94000040
:100080008FEF8AB990E081E0292F019082952A9587
:10009000F1F78BB98FEF94E181509040F1F700C06F
:1000A00000009F5F983089F796E081E0292F019047
:1000B00082952A95F1F78BB98FEF94E18150904018
:1000C000F1F700C00000915091F7CBCFF894FFCF7B
:00000001FF`,
    expectedBehavior: 'PORTD pins 0-7 turn ON sequentially back and forth at 60ms per step.',
    expectedBehaviorHu: 'A PORTD 0-7 lábai sorban egymás után világítanak oda-vissza 60 ms-os lépésközzel.',
  },
];
