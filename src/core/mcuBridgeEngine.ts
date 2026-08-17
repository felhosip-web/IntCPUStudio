import {
  BridgeFaultInjection,
  BridgeNodePeripherals,
  BridgeNodeState,
  BridgeProtocol,
  BridgeScenarioPreset,
  BridgeTrafficPacket,
  BridgeWire,
  DualMcuBridgeState,
} from '../types/mcuBridge';
import { BRIDGE_SCENARIOS } from './mcuBridgeScenarios';

export function createInitialWires(protocol: BridgeProtocol): BridgeWire[] {
  switch (protocol) {
    case 'I2C':
      return [
        {
          id: 'scl',
          name: 'SCL (Serial Clock - A5 / PC5)',
          pinMcuA: 'A5 (PC5)',
          pinMcuB: 'A5 (PC5)',
          logicA: 1,
          logicB: 1,
          busVoltage: 5.0,
          active: true,
          color: '#38BDF8',
          description: 'Synchronous clock line with 4.7kΩ pull-up to VCC.',
          descriptionHu: 'Szinkron órajel vonal 4.7kΩ felhúzó ellenállással VCC-re.',
        },
        {
          id: 'sda',
          name: 'SDA (Serial Data - A4 / PC4)',
          pinMcuA: 'A4 (PC4)',
          pinMcuB: 'A4 (PC4)',
          logicA: 1,
          logicB: 1,
          busVoltage: 5.0,
          active: true,
          color: '#818CF8',
          description: 'Bidirectional open-drain data line.',
          descriptionHu: 'Kétirányú, nyitott kollektoros adatvonal.',
        },
        {
          id: 'gnd',
          name: 'GND (Common Ground)',
          pinMcuA: 'GND',
          pinMcuB: 'GND',
          logicA: 0,
          logicB: 0,
          busVoltage: 0.0,
          active: true,
          color: '#64748B',
          description: 'Common ground reference for both microcontrollers.',
          descriptionHu: 'Közös test referencia mindkét mikrokontroller számára.',
        },
        {
          id: 'vcc',
          name: 'VCC (+5.0V Bus Power)',
          pinMcuA: '5V',
          pinMcuB: '5V',
          logicA: 1,
          logicB: 1,
          busVoltage: 5.0,
          active: true,
          color: '#F43F5E',
          description: '5V power rail supplying pull-up resistors.',
          descriptionHu: '5V tápvonal a felhúzó ellenállások táplálására.',
        },
      ];

    case 'SPI':
      return [
        {
          id: 'sck',
          name: 'SCK (Serial Clock - D13 / PB5)',
          pinMcuA: 'D13 (PB5 - Out)',
          pinMcuB: 'D13 (PB5 - In)',
          logicA: 0,
          logicB: 0,
          busVoltage: 0.0,
          active: true,
          color: '#38BDF8',
          description: 'Master-generated SPI clock up to 1.0 MHz.',
          descriptionHu: 'Mester által generált SPI órajel 1.0 MHz-ig.',
        },
        {
          id: 'mosi',
          name: 'MOSI (Master Out Slave In - D11 / PB3)',
          pinMcuA: 'D11 (PB3 - Out)',
          pinMcuB: 'D11 (PB3 - In)',
          logicA: 1,
          logicB: 1,
          busVoltage: 5.0,
          active: true,
          color: '#34D399',
          description: 'Data from Master controller to Slave node.',
          descriptionHu: 'Adatvonal a Mestertől a Szolga periféria felé.',
        },
        {
          id: 'miso',
          name: 'MISO (Master In Slave Out - D12 / PB4)',
          pinMcuA: 'D12 (PB4 - In)',
          pinMcuB: 'D12 (PB4 - Out)',
          logicA: 1,
          logicB: 1,
          busVoltage: 5.0,
          active: true,
          color: '#F59E0B',
          description: 'Data from Slave node back to Master.',
          descriptionHu: 'Visszairányú adatvonal a Szolgától a Mester felé.',
        },
        {
          id: 'ss',
          name: 'SS / CS (Slave Select - D10 / PB2)',
          pinMcuA: 'D10 (PB2 - Out)',
          pinMcuB: 'D10 (PB2 - In)',
          logicA: 0,
          logicB: 0,
          busVoltage: 0.0,
          active: true,
          color: '#E879F9',
          description: 'Active-Low chip select line.',
          descriptionHu: 'Alacsony szinten aktív lapkaválasztó vonal.',
        },
      ];

    case 'UART':
      return [
        {
          id: 'tx_a_rx_b',
          name: 'TX(A) -> RX(B) [D1 -> D0]',
          pinMcuA: 'D1 (TXD - Out)',
          pinMcuB: 'D0 (RXD - In)',
          logicA: 1,
          logicB: 1,
          busVoltage: 5.0,
          active: true,
          color: '#34D399',
          description: 'Forward asynchronous serial link (MCU A -> MCU B).',
          descriptionHu: 'Előreirányú aszinkron soros adatvonal (MCU A -> MCU B).',
        },
        {
          id: 'tx_b_rx_a',
          name: 'RX(A) <- TX(B) [D0 <- D1]',
          pinMcuA: 'D0 (RXD - In)',
          pinMcuB: 'D1 (TXD - Out)',
          logicA: 1,
          logicB: 1,
          busVoltage: 5.0,
          active: true,
          color: '#F59E0B',
          description: 'Return asynchronous serial link (MCU B -> MCU A).',
          descriptionHu: 'Visszairányú aszinkron soros adatvonal (MCU B -> MCU A).',
        },
        {
          id: 'gnd',
          name: 'GND (Common Ground)',
          pinMcuA: 'GND',
          pinMcuB: 'GND',
          logicA: 0,
          logicB: 0,
          busVoltage: 0.0,
          active: true,
          color: '#64748B',
          description: 'Common reference ground.',
          descriptionHu: 'Közös referencia test.',
        },
      ];

    case 'RS485':
      return [
        {
          id: 'line_a',
          name: 'RS-485 Line A (Non-Inverting +)',
          pinMcuA: 'MAX485 Pin 6 (A)',
          pinMcuB: 'MAX485 Pin 6 (A)',
          logicA: 1,
          logicB: 1,
          busVoltage: 3.6,
          active: true,
          color: '#38BDF8',
          description: 'Non-inverting differential line (+3.6V when Mark).',
          descriptionHu: 'Nem-invertáló differenciális vonal (+3.6V Mark állapotban).',
        },
        {
          id: 'line_b',
          name: 'RS-485 Line B (Inverting -)',
          pinMcuA: 'MAX485 Pin 7 (B)',
          pinMcuB: 'MAX485 Pin 7 (B)',
          logicA: 0,
          logicB: 0,
          busVoltage: 1.2,
          active: true,
          color: '#F43F5E',
          description: 'Inverting differential line (+1.2V when Mark, Diff = +2.4V).',
          descriptionHu: 'Invertáló differenciális vonal (Diff feszültség = +2.4V).',
        },
        {
          id: 'de_re',
          name: 'DE/RE Direction Control (D2)',
          pinMcuA: 'D2 (Out - HIGH=TX)',
          pinMcuB: 'D2 (Out - LOW=RX)',
          logicA: 1,
          logicB: 0,
          busVoltage: 5.0,
          active: true,
          color: '#A855F7',
          description: 'Driver Enable / Receiver Enable direction pin.',
          descriptionHu: 'Meghajtó és vevő engedélyező irányváltó láb.',
        },
      ];

    case 'CAN':
      return [
        {
          id: 'can_h',
          name: 'CAN_H (High Line - 3.5V Dominant / 2.5V Recessive)',
          pinMcuA: 'MCP2515 CAN_H',
          pinMcuB: 'MCP2515 CAN_H',
          logicA: 1,
          logicB: 1,
          busVoltage: 3.5,
          active: true,
          color: '#EC4899',
          description: 'Differential high line. Rises to 3.5V during dominant bits.',
          descriptionHu: 'Differenciális felső vonal. 3.5V-ra emelkedik domináns bitkor.',
        },
        {
          id: 'can_l',
          name: 'CAN_L (Low Line - 1.5V Dominant / 2.5V Recessive)',
          pinMcuA: 'MCP2515 CAN_L',
          pinMcuB: 'MCP2515 CAN_L',
          logicA: 0,
          logicB: 0,
          busVoltage: 1.5,
          active: true,
          color: '#3B82F6',
          description: 'Differential low line. Drops to 1.5V during dominant bits (VDiff = 2.0V).',
          descriptionHu: 'Differenciális alsó vonal. 1.5V-ra esik domináns bitkor (VDiff = 2.0V).',
        },
        {
          id: 'term_120',
          name: '120Ω Split Bus Termination',
          pinMcuA: 'Term Resistor',
          pinMcuB: 'Term Resistor',
          logicA: 1,
          logicB: 1,
          busVoltage: 2.5,
          active: true,
          color: '#10B981',
          description: 'Matched 120Ω bus terminator preventing signal reflection.',
          descriptionHu: '120Ω-os lezáró ellenállás a jelvisszaverődések megakadályozására.',
        },
      ];

    case 'NRF24':
      return [
        {
          id: 'rf_air',
          name: '2.400 - 2.525 GHz ISM Radio Wave Carrier (Channel 76)',
          pinMcuA: 'nRF24L01+ Antenna',
          pinMcuB: 'nRF24L01+ Antenna',
          logicA: 1,
          logicB: 1,
          busVoltage: 3.3,
          active: true,
          color: '#06B6D4',
          description: 'Wireless electromagnetic RF wave packet with GFSK modulation.',
          descriptionHu: 'Vezeték nélküli rádióhullám GFSK modulációval.',
        },
        {
          id: 'ce_pin',
          name: 'CE (Chip Enable - D7)',
          pinMcuA: 'D7 (Out)',
          pinMcuB: 'D7 (Out)',
          logicA: 1,
          logicB: 1,
          busVoltage: 3.3,
          active: true,
          color: '#8B5CF6',
          description: 'RX/TX radio mode trigger pin.',
          descriptionHu: 'Rádiós adás/vétel üzemmódot aktiváló láb.',
        },
        {
          id: 'irq_pin',
          name: 'IRQ (Interrupt Request - D2 / INT0)',
          pinMcuA: 'D2 (In)',
          pinMcuB: 'D2 (In)',
          logicA: 0,
          logicB: 0,
          busVoltage: 0.0,
          active: true,
          color: '#F59E0B',
          description: 'Active-Low interrupt upon RX_DR (Data Ready) or TX_DS (Sent).',
          descriptionHu: 'Megszakításkérő láb csomagérkezéskor vagy sikeres küldéskor.',
        },
      ];
  }
}

export function createDefaultPeripherals(): BridgeNodePeripherals {
  return {
    potentiometer: 512,
    button1: false,
    button2: false,
    sliderVal: 128,
    sensorTemp: 24.5,
    sensorLux: 450,
    gyroX: 0,
    ledD13: false,
    rgbColor: { r: 0, g: 150, b: 255 },
    servoAngle: 90,
    stepperSteps: 0,
    buzzerTone: 0,
    lcdText: ['NODE READY', 'WAITING PKT...'],
    oledLines: ['MCU BRIDGE v3.0', 'PROTOCOL: IDLE', 'DATA: 0x00', 'STATUS: OK'],
    relayActive: false,
  };
}

export function createInitialNodeState(
  id: 'MCU_A' | 'MCU_B',
  role: 'MASTER' | 'SLAVE' | 'PEER',
  name: string,
  nameHu: string,
  code: string,
  initialPeripherals?: Partial<BridgeNodePeripherals>
): BridgeNodeState {
  return {
    id,
    role,
    name,
    nameHu,
    model: 'ATmega328p',
    clockHz: 16,
    isRunning: true,
    pc: 0,
    code,
    flashMemory: code.split('\n'),
    registers: {
      r0: 0,
      r16: 0,
      r17: 0,
      r18: 0,
      r24: 0,
      r25: 0,
      portB: 0,
      portC: 0,
      portD: 0,
    },
    peripherals: {
      ...createDefaultPeripherals(),
      ...(initialPeripherals || {}),
    },
    txBuffer: [],
    rxBuffer: [],
    lastTxMsg: '—',
    lastRxMsg: '—',
    packetsSent: 0,
    packetsReceived: 0,
    lastPacketTime: '—',
    statusMessage: 'Ready',
    statusMessageHu: 'Készenlét',
  };
}

export function createInitialBridgeState(scenarioId = 'i2c_telemetry'): DualMcuBridgeState {
  const scenario =
    BRIDGE_SCENARIOS.find((s) => s.id === scenarioId) || BRIDGE_SCENARIOS[0];

  const mcuA = createInitialNodeState(
    'MCU_A',
    'MASTER',
    'MCU A (Master / Controller)',
    'MCU A (Mester / Vezérlő)',
    scenario.codeMcuA,
    scenario.initialA
  );

  const mcuB = createInitialNodeState(
    'MCU_B',
    'SLAVE',
    'MCU B (Remote Node / Peripherals)',
    'MCU B (Távoli Csomópont / Perifériák)',
    scenario.codeMcuB,
    scenario.initialB
  );

  const wires = createInitialWires(scenario.protocol);

  const faults: BridgeFaultInjection = {
    noiseEnabled: false,
    noiseLevelPercent: 0,
    disconnectedWires: {},
    forceBitFlip: false,
    forceNack: false,
    packetDropRate: 0,
    rfDistanceMeters: 5.0,
    rs485Terminated: true,
  };

  return {
    protocol: scenario.protocol,
    isSyncRunning: true,
    masterClockHz: 4,
    stepCount: 0,
    cycleTimeMs: 250,
    mcuA,
    mcuB,
    wires,
    trafficHistory: [],
    faults,
    busUtilizationPercent: 32,
    currentBps: 9600,
    errorCount: 0,
    lastExchangeSummary: 'Bridge initialized in synchronized communication mode.',
    lastExchangeSummaryHu: 'A híd inicializálva szinkronizált kommunikációs módban.',
  };
}

export function stepDualMcuBridge(state: DualMcuBridgeState): DualMcuBridgeState {
  const next: DualMcuBridgeState = {
    ...state,
    stepCount: state.stepCount + 1,
    mcuA: { ...state.mcuA, peripherals: { ...state.mcuA.peripherals } },
    mcuB: { ...state.mcuB, peripherals: { ...state.mcuB.peripherals } },
    wires: state.wires.map((w) => ({ ...w })),
    trafficHistory: [...state.trafficHistory],
  };

  const timeStr = new Date().toLocaleTimeString();

  // Check physical wire disconnection faults
  const isWireCut = (wireId: string) => !!state.faults.disconnectedWires[wireId];

  // Calculate transmission based on protocol
  switch (state.protocol) {
    case 'I2C': {
      const pot = next.mcuA.peripherals.potentiometer;
      const targetServo = Math.round((pot / 1023) * 180);
      const isSclCut = isWireCut('scl');
      const isSdaCut = isWireCut('sda');
      const isNack = state.faults.forceNack || isSclCut || isSdaCut;

      // Update bus wires
      next.wires.forEach((w) => {
        if (w.id === 'scl') {
          w.logicA = isSclCut ? 0 : (next.stepCount % 2 === 0 ? 1 : 0);
          w.logicB = w.logicA;
          w.busVoltage = isSclCut ? 0 : 5.0;
        } else if (w.id === 'sda') {
          w.logicA = isSdaCut ? 0 : 1;
          w.logicB = w.logicA;
          w.busVoltage = isSdaCut ? 0 : 5.0;
        }
      });

      if (!isNack) {
        // Successful I2C transaction
        next.mcuB.peripherals.servoAngle = targetServo;
        next.mcuB.peripherals.rgbColor = {
          r: Math.round((pot / 1023) * 255),
          g: Math.round((1 - pot / 1023) * 200),
          b: 255,
        };
        next.mcuB.peripherals.oledLines = [
          'I2C SLAVE: 0x48 [ACK]',
          `SERVO POS: ${targetServo}°`,
          `POT VAL: ${pot} / 1023`,
          `TEMP: ${next.mcuB.peripherals.sensorTemp.toFixed(1)}°C`,
        ];

        const raw = [0x90, 0x01, targetServo, next.mcuB.peripherals.rgbColor.r, next.mcuB.peripherals.rgbColor.g, 0xFF];
        const hex = raw.map((b) => '0x' + b.toString(16).toUpperCase().padStart(2, '0')).join(' ');

        const packet: BridgeTrafficPacket = {
          id: 'pkt-' + Date.now() + '-' + next.stepCount,
          timestamp: timeStr,
          protocol: 'I2C',
          source: 'MCU_A',
          target: 'MCU_B',
          rawBytes: raw,
          hexDump: hex,
          decodedMessage: `WRITE 0x48 -> CMD: SET_SERVO(${targetServo}°), RGB(${next.mcuB.peripherals.rgbColor.r},${next.mcuB.peripherals.rgbColor.g},255)`,
          dissection: {
            address: '0x48 (7-bit) + W (0)',
            command: '0x01 (SET_ACTUATORS)',
            payload: `Angle: ${targetServo}°, RGB: ${next.mcuB.peripherals.rgbColor.r},${next.mcuB.peripherals.rgbColor.g},255`,
            ack: true,
            status: 'OK',
          },
        };

        next.trafficHistory.unshift(packet);
        next.mcuA.packetsSent++;
        next.mcuB.packetsReceived++;
        next.mcuA.lastTxMsg = `I2C WR 0x48: Servo=${targetServo}°`;
        next.mcuB.lastRxMsg = `I2C RX: Servo=${targetServo}° ACK`;
        next.lastExchangeSummary = `I2C Master sent servo target ${targetServo}° to Slave (0x48), ACK received.`;
        next.lastExchangeSummaryHu = `I2C Mester szervó parancsot (${targetServo}°) küldött a Szolgának (0x48), ACK nyugtázva.`;
      } else {
        // NACK / Bus Error
        next.errorCount++;
        const packet: BridgeTrafficPacket = {
          id: 'pkt-err-' + Date.now() + '-' + next.stepCount,
          timestamp: timeStr,
          protocol: 'I2C',
          source: 'MCU_A',
          target: 'MCU_B',
          rawBytes: [0x90],
          hexDump: '0x90 [NACK]',
          decodedMessage: isSclCut || isSdaCut ? 'I2C BUS FAULT: Line Disconnected (Timeout)' : 'I2C SLAVE NACK: Address 0x48 not responding',
          dissection: {
            address: '0x48',
            ack: false,
            status: isSclCut || isSdaCut ? 'TIMEOUT' : 'NACK',
          },
        };
        next.trafficHistory.unshift(packet);
        next.lastExchangeSummary = isSclCut || isSdaCut ? 'I2C Bus Error: Physical line broken!' : 'I2C NACK Error: Slave device not acknowledging!';
        next.lastExchangeSummaryHu = isSclCut || isSdaCut ? 'I2C Busz Hiba: Fizikai vezeték megszakadt!' : 'I2C NACK Hiba: A szolga eszköz nem nyugtáz!';
      }
      break;
    }

    case 'SPI': {
      const isMosiCut = isWireCut('mosi');
      const isMisoCut = isWireCut('miso');
      const isSckCut = isWireCut('sck');
      const speed = isMosiCut ? 0 : next.mcuA.peripherals.sliderVal;
      const currentSteps = (next.mcuB.peripherals.stepperSteps + (speed > 50 ? 5 : 0)) % 1000;
      next.mcuB.peripherals.stepperSteps = currentSteps;

      next.wires.forEach((w) => {
        if (w.id === 'sck') {
          w.logicA = isSckCut ? 0 : 1;
          w.busVoltage = isSckCut ? 0 : 5.0;
        } else if (w.id === 'mosi') {
          w.logicA = isMosiCut ? 0 : 1;
          w.busVoltage = isMosiCut ? 0 : 5.0;
        } else if (w.id === 'miso') {
          w.logicB = isMisoCut ? 0 : 1;
          w.busVoltage = isMisoCut ? 0 : 5.0;
        }
      });

      if (!isSckCut && !isMosiCut) {
        next.mcuB.peripherals.oledLines = [
          'SPI FULL-DUPLEX',
          `MOSI SPD: ${speed} PWM`,
          `MISO POS: ${isMisoCut ? '0 (ERR)' : currentSteps}`,
          'SCK: 1.0 MHz CS: LOW',
        ];

        const rawMosi = [speed, (speed >> 8) & 0xFF];
        const rawMiso = isMisoCut ? [0x00, 0x00] : [currentSteps & 0xFF, (currentSteps >> 8) & 0xFF];

        const packet: BridgeTrafficPacket = {
          id: 'pkt-spi-' + Date.now() + '-' + next.stepCount,
          timestamp: timeStr,
          protocol: 'SPI',
          source: 'MCU_A',
          target: 'MCU_B',
          rawBytes: [...rawMosi, ...rawMiso],
          hexDump: `MOSI: 0x${speed.toString(16).toUpperCase()} | MISO: 0x${currentSteps.toString(16).toUpperCase()}`,
          decodedMessage: `FULL-DUPLEX EXCHANGE: Setpoint ${speed} -> / <- Encoder Pos ${currentSteps}`,
          dissection: {
            command: 'SPI_TRANSFER(2 Bytes)',
            payload: `MOSI (Tx): ${speed} | MISO (Rx): ${currentSteps}`,
            ack: true,
            status: isMisoCut ? 'NOISE' : 'OK',
          },
        };
        next.trafficHistory.unshift(packet);
        next.mcuA.packetsSent++;
        next.mcuB.packetsReceived++;
        next.lastExchangeSummary = `SPI simultaneous transfer completed: MOSI=${speed}, MISO=${currentSteps}.`;
        next.lastExchangeSummaryHu = `SPI szimultán adatcsere sikeres: MOSI=${speed}, MISO=${currentSteps}.`;
      } else {
        next.errorCount++;
        next.lastExchangeSummary = 'SPI Bus Failure: SCK clock or MOSI line severed!';
        next.lastExchangeSummaryHu = 'SPI Busz Hiba: Az SCK órajel vagy a MOSI vezeték megszakadt!';
      }
      break;
    }

    case 'UART': {
      const pot = next.mcuA.peripherals.potentiometer;
      const angle = Math.round((pot / 1023) * 180);
      const isTxCut = isWireCut('tx_a_rx_b');
      const isRxCut = isWireCut('tx_b_rx_a');

      if (!isTxCut) {
        next.mcuB.peripherals.servoAngle = angle;
        next.mcuB.peripherals.ledD13 = next.mcuA.peripherals.button1;
        next.mcuB.peripherals.oledLines = [
          'UART 115200 8N1',
          `RX: $CMD,SERVO,${angle}`,
          `LED D13: ${next.mcuA.peripherals.button1 ? 'HIGH' : 'LOW'}`,
          `TX ACK: ${isRxCut ? 'DROPPED' : 'OK *55'}`,
        ];

        const cmdStr = `$CMD,SERVO,${angle},LED=${next.mcuA.peripherals.button1 ? 1 : 0}*AA`;
        const raw = Array.from(cmdStr).map((c) => c.charCodeAt(0));

        const packet: BridgeTrafficPacket = {
          id: 'pkt-uart-' + Date.now() + '-' + next.stepCount,
          timestamp: timeStr,
          protocol: 'UART',
          source: 'MCU_A',
          target: 'MCU_B',
          rawBytes: raw.slice(0, 10),
          hexDump: raw.slice(0, 8).map((b) => '0x' + b.toString(16).toUpperCase().padStart(2, '0')).join(' ') + '...',
          decodedMessage: cmdStr,
          dissection: {
            command: 'SET_SERVO & SET_LED',
            payload: `Angle=${angle}°, LED=${next.mcuA.peripherals.button1 ? 'ON' : 'OFF'}`,
            crc: '0xAA (XOR Checksum Valid)',
            ack: !isRxCut,
            status: isRxCut ? 'TIMEOUT' : 'OK',
          },
        };
        next.trafficHistory.unshift(packet);
        next.mcuA.packetsSent++;
        next.mcuB.packetsReceived++;
        next.lastExchangeSummary = `UART frame transmitted: "${cmdStr}"`;
        next.lastExchangeSummaryHu = `UART keret továbbítva: "${cmdStr}"`;
      } else {
        next.errorCount++;
        next.lastExchangeSummary = 'UART TX Line disconnected! No serial characters received.';
        next.lastExchangeSummaryHu = 'UART TX vonal megszakadt! Nincs beérkező soros bájt.';
      }
      break;
    }

    case 'RS485': {
      const isLineACut = isWireCut('line_a');
      const isLineBCut = isWireCut('line_b');
      const pot = next.mcuA.peripherals.potentiometer;
      const relayOn = pot > 500;
      next.mcuB.peripherals.relayActive = relayOn;
      next.mcuB.peripherals.oledLines = [
        'RS-485 MODBUS SLV #1',
        `DIFF A-B: ${isLineACut || isLineBCut ? '0.0V (ERR)' : '+2.4V'}`,
        `RELAY OUT: ${relayOn ? 'ACTIVE (ON)' : 'OFF'}`,
        `TEMP REG: ${next.mcuB.peripherals.sensorTemp.toFixed(1)}°C`,
      ];

      if (!isLineACut && !isLineBCut) {
        const raw = [0x01, 0x03, 0x00, 0x00, 0x00, 0x02, 0xC4, 0x0B];
        const packet: BridgeTrafficPacket = {
          id: 'pkt-485-' + Date.now() + '-' + next.stepCount,
          timestamp: timeStr,
          protocol: 'RS485',
          source: 'MCU_A',
          target: 'MCU_B',
          rawBytes: raw,
          hexDump: raw.map((b) => '0x' + b.toString(16).toUpperCase().padStart(2, '0')).join(' '),
          decodedMessage: 'MODBUS RTU: Slave 0x01 Read Holding Regs [0..2]',
          dissection: {
            address: 'Slave ID: 0x01',
            command: '0x03 (Read Holding Registers)',
            payload: `Addr: 0x0000, Count: 2, Relay=${relayOn ? 'ON' : 'OFF'}`,
            crc: '0xC40B (Modbus CRC-16 Valid)',
            ack: true,
            status: 'OK',
          },
        };
        next.trafficHistory.unshift(packet);
        next.mcuA.packetsSent++;
        next.mcuB.packetsReceived++;
        next.lastExchangeSummary = 'RS-485 differential frame exchange completed (A=+3.6V, B=+1.2V).';
        next.lastExchangeSummaryHu = 'RS-485 differenciális keretváltás sikeres (A=+3.6V, B=+1.2V).';
      } else {
        next.errorCount++;
        next.lastExchangeSummary = 'RS-485 Differential Fault: Line A or B broken! Voltage difference lost.';
        next.lastExchangeSummaryHu = 'RS-485 Differenciális Hiba: A vagy B vonal szakadt! Nincs feszültségkülönbség.';
      }
      break;
    }

    case 'CAN': {
      const isCanHCut = isWireCut('can_h');
      const isCanLCut = isWireCut('can_l');
      const throttle = Math.round((next.mcuA.peripherals.potentiometer / 1023) * 100);
      const rpm = 800 + Math.round((throttle / 100) * 5800);
      const needle = Math.round((rpm / 7000) * 180);

      next.mcuB.peripherals.servoAngle = needle;
      next.mcuB.peripherals.oledLines = [
        'CAN ID: 0x120 (ECU)',
        `ENGINE RPM: ${rpm} RPM`,
        `THROTTLE: ${throttle} %`,
        `BUS DIFF: ${isCanHCut || isCanLCut ? '0.0V (ERR)' : '2.0V DOMINANT'}`,
      ];

      if (!isCanHCut && !isCanLCut) {
        const raw = [0x01, 0x20, 0x08, (rpm >> 8) & 0xFF, rpm & 0xFF, throttle, 92, 0x00, 0x00, 0x00];
        const packet: BridgeTrafficPacket = {
          id: 'pkt-can-' + Date.now() + '-' + next.stepCount,
          timestamp: timeStr,
          protocol: 'CAN',
          source: 'MCU_A',
          target: 'BROADCAST',
          rawBytes: raw,
          hexDump: 'ID: 0x120 [8] ' + raw.slice(3).map((b) => '0x' + b.toString(16).toUpperCase().padStart(2, '0')).join(' '),
          decodedMessage: `CAN BROADCAST [0x120]: RPM=${rpm}, Throttle=${throttle}%, Coolant=92°C`,
          dissection: {
            address: 'CAN ID: 0x120 (High Priority Standard 11-bit)',
            payload: `RPM: ${rpm}, Throttle: ${throttle}%, Temp: 92°C`,
            crc: '0x4A1E (15-bit CAN CRC OK)',
            ack: true,
            status: 'OK',
          },
        };
        next.trafficHistory.unshift(packet);
        next.mcuA.packetsSent++;
        next.mcuB.packetsReceived++;
        next.lastExchangeSummary = `CAN Broadcast ID 0x120: RPM=${rpm}, Throttle=${throttle}% (120Ω Terminated).`;
        next.lastExchangeSummaryHu = `CAN Adás ID 0x120: RPM=${rpm}, Fojtószelep=${throttle}% (120Ω Lezárva).`;
      } else {
        next.errorCount++;
        next.lastExchangeSummary = 'CAN Bus Error: CAN_H / CAN_L line damaged! Transceiver enters Error Passive.';
        next.lastExchangeSummaryHu = 'CAN Busz Hiba: CAN_H / CAN_L vonal sérült! Az adóvevő hibaállapotba lépett.';
      }
      break;
    }

    case 'NRF24': {
      const dist = state.faults.rfDistanceMeters;
      // RSSI attenuation: -35 dBm at 1m, -85 dBm at 50m
      const rssi = Math.max(-105, Math.round(-35 - 25 * Math.log10(Math.max(1, dist))));
      const isLost = rssi < -88 || isWireCut('rf_air') || isWireCut('ce_pin');
      const joyX = next.mcuA.peripherals.potentiometer;
      const speed = next.mcuA.peripherals.sliderVal;
      const btnLight = next.mcuA.peripherals.button1;
      const relayCmd = next.mcuA.peripherals.relayActive;
      const angle = Math.round((joyX / 1023) * 180);

      // Wireless carrier activity
      next.wires.forEach((w) => {
        if (w.id === 'rf_air') {
          w.logicA = isLost ? 0 : 1;
          w.logicB = w.logicA;
          w.busVoltage = isLost ? 0.0 : 3.3;
        } else if (w.id === 'ce_pin') {
          w.logicA = 1;
          w.logicB = 1;
          w.busVoltage = 3.3;
        } else if (w.id === 'irq_pin') {
          w.logicA = isLost ? 1 : 0; // Active-low pulse on ACK
          w.logicB = w.logicA;
        }
      });

      if (!isLost) {
        // Update MCU B Actuators from wireless command
        next.mcuB.peripherals.servoAngle = angle;
        next.mcuB.peripherals.ledD13 = btnLight;
        next.mcuB.peripherals.relayActive = relayCmd;
        next.mcuB.peripherals.buzzerTone = btnLight ? 660 : 0;
        next.mcuB.peripherals.rgbColor = {
          r: btnLight ? 255 : Math.round((angle / 180) * 100),
          g: Math.round((speed / 255) * 220),
          b: 255,
        };

        // MCU B OLED Screen
        next.mcuB.peripherals.oledLines = [
          'NRF24 2.4GHz RF CH76',
          `RSSI: ${rssi} dBm (${rssi > -65 ? 'EXC' : 'MED'})`,
          `JOY:${joyX} SPD:${speed}`,
          `STEER:${angle}° LGT:${btnLight ? 'ON' : 'OFF'}`,
        ];

        // MCU A OLED Screen updated via Auto-ACK Telemetry received from MCU B
        next.mcuA.peripherals.oledLines = [
          'NRF24 HOST TX [NODE1]',
          `REMOTE ACK: 2.4GHz OK`,
          `BATT:7.4V TEMP:${next.mcuB.peripherals.sensorTemp.toFixed(1)}C`,
          `LINK RSSI: ${rssi} dBm (${dist.toFixed(1)}m)`,
        ];

        const raw = [0x76, (joyX >> 8) & 0xFF, joyX & 0xFF, speed, btnLight ? 0x01 : 0x00, 0xAA];
        const packet: BridgeTrafficPacket = {
          id: 'pkt-nrf-' + Date.now() + '-' + next.stepCount,
          timestamp: timeStr,
          protocol: 'NRF24',
          source: 'MCU_A',
          target: 'MCU_B',
          rawBytes: raw,
          hexDump: 'RF [CH 76] ' + raw.map((b) => '0x' + b.toString(16).toUpperCase().padStart(2, '0')).join(' '),
          decodedMessage: `2.4GHz RF FRAME: JoyX=${joyX}, Steer=${angle}°, Speed=${speed} PWM, Light=${btnLight ? 'ON' : 'OFF'}`,
          dissection: {
            address: 'Pipe 0: "NODE1" (0xE8E8F0F0E1)',
            payload: `Steer: ${angle}°, Speed: ${speed}, Headlights: ${btnLight ? 'HIGH' : 'LOW'}, RSSI: ${rssi} dBm`,
            crc: `CRC-16 OK • ACK Payload: Temp=${next.mcuB.peripherals.sensorTemp.toFixed(1)}°C, Batt=7.4V`,
            ack: true,
            status: 'OK',
          },
        };
        next.trafficHistory.unshift(packet);
        next.mcuA.packetsSent++;
        next.mcuB.packetsReceived++;
        next.mcuA.lastTxMsg = `RF TX: Joy=${joyX} Spd=${speed}`;
        next.mcuB.lastRxMsg = `RF RX: Steer=${angle}° ACK`;
        next.mcuA.lastRxMsg = `ACK IN: Temp=${next.mcuB.peripherals.sensorTemp.toFixed(1)}°C`;
        next.lastExchangeSummary = `2.4GHz RF Packet sent & Auto-ACK received: RSSI=${rssi} dBm @ ${dist.toFixed(1)}m.`;
        next.lastExchangeSummaryHu = `2.4GHz Rádiócsomag átküldve & Auto-ACK nyugtázva: RSSI=${rssi} dBm @ ${dist.toFixed(1)}m.`;
      } else {
        next.errorCount++;
        next.mcuB.peripherals.oledLines = [
          'NRF24 2.4GHz RF CH76',
          `RSSI: ${rssi} dBm (LOST)`,
          `DIST: ${dist.toFixed(1)} m (NO LINK)`,
          'STATUS: RF TIMEOUT',
        ];
        next.mcuA.peripherals.oledLines = [
          'NRF24 HOST TX [NODE1]',
          `TX FAILED: NO ACK`,
          `DISTANCE: ${dist.toFixed(1)}m OUT`,
          `STATUS: PACKET LOSS`,
        ];
        const packet: BridgeTrafficPacket = {
          id: 'pkt-nrf-err-' + Date.now() + '-' + next.stepCount,
          timestamp: timeStr,
          protocol: 'NRF24',
          source: 'MCU_A',
          target: 'MCU_B',
          rawBytes: [0x76, 0xFF],
          hexDump: '0x76 0xFF [NO_ACK]',
          decodedMessage: `RF LINK TIMEOUT: RSSI degraded to ${rssi} dBm at ${dist.toFixed(1)} meters`,
          dissection: {
            address: 'Pipe 0: "NODE1"',
            payload: `Distance: ${dist.toFixed(1)}m (Exceeded max RF budget)`,
            ack: false,
            status: 'TIMEOUT',
          },
        };
        next.trafficHistory.unshift(packet);
        next.lastExchangeSummary = `Wireless Packet Lost: Distance (${dist.toFixed(1)}m) or RF line broken!`;
        next.lastExchangeSummaryHu = `Rádiócsomag elveszett: A távolság (${dist.toFixed(1)}m) túl nagy vagy a rádiós kapcsolat megszakadt!`;
      }
      break;
    }
  }

  // Trim history
  if (next.trafficHistory.length > 25) {
    next.trafficHistory = next.trafficHistory.slice(0, 25);
  }

  return next;
}
