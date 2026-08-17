import { CpuState } from '../types/cpu';
import {
  BusCycleClassification,
  LogicAnalyzerChannel,
  TimingPresetTrace,
  TimingSample,
  TimingTriggerConfig,
} from '../types/timing';

export const MAX_TIMING_SAMPLES = 100;

export const DEFAULT_LOGIC_CHANNELS: LogicAnalyzerChannel[] = [
  {
    id: 'CLK',
    label: 'CLK',
    activeLowLabel: 'CLK',
    color: '#38BDF8', // Cyan 400
    type: 'DIGITAL',
    category: 'SYSTEM',
    visible: true,
    descriptionEn: 'Master Clock Signal - Defines machine cycle T-states (T1, T2, T3, T4)',
    descriptionHu: 'Mester Órajel - Meghatározza a T-állapotokat (T1, T2, T3, T4)',
  },
  {
    id: 'MREQ',
    label: 'MREQ',
    activeLowLabel: '/MREQ',
    color: '#34D399', // Emerald 400
    type: 'DIGITAL',
    category: 'CONTROL',
    visible: true,
    descriptionEn: 'Memory Request - Asserted (LOW in active-low mode) during memory read/write & opcode fetch',
    descriptionHu: 'Memória Kérelem - Aktív RAM olvasáskor, íráskor és utasítás-betöltéskor',
  },
  {
    id: 'IORQ',
    label: 'IORQ',
    activeLowLabel: '/IORQ',
    color: '#F43F5E', // Rose 500
    type: 'DIGITAL',
    category: 'CONTROL',
    visible: true,
    descriptionEn: 'I/O Request - Asserted when accessing I/O peripheral ports (IN/OUT instructions)',
    descriptionHu: 'I/O Kérelem - Aktív periféria port olvasásakor vagy írásakor (IN/OUT)',
  },
  {
    id: 'RD',
    label: 'RD',
    activeLowLabel: '/RD',
    color: '#60A5FA', // Blue 400
    type: 'DIGITAL',
    category: 'CONTROL',
    visible: true,
    descriptionEn: 'Read Strobe - CPU or peripheral reads data from the data bus',
    descriptionHu: 'Olvasás Engedélyező - A CPU adatot olvas be az adatbuszról',
  },
  {
    id: 'WR',
    label: 'WR',
    activeLowLabel: '/WR',
    color: '#FB923C', // Orange 400
    type: 'DIGITAL',
    category: 'CONTROL',
    visible: true,
    descriptionEn: 'Write Strobe - CPU writes valid data onto the data bus into RAM or Port',
    descriptionHu: 'Írás Engedélyező - A CPU érvényes adatot ír ki a buszra a RAM-ba vagy Portra',
  },
  {
    id: 'M1',
    label: 'M1',
    activeLowLabel: '/M1',
    color: '#C084FC', // Purple 400
    type: 'DIGITAL',
    category: 'CONTROL',
    visible: true,
    descriptionEn: 'Machine Cycle 1 - Opcode Fetch cycle indicator',
    descriptionHu: '1. Gépi Ciklus - Utasítás-kód (Opcode) beolvasási fázis jelző',
  },
  {
    id: 'ALE',
    label: 'ALE',
    activeLowLabel: 'ALE',
    color: '#FACC15', // Amber 400
    type: 'DIGITAL',
    category: 'CONTROL',
    visible: true,
    descriptionEn: 'Address Latch Enable - Latches multiplexed address from bus at cycle start',
    descriptionHu: 'Címtároló Engedélyezés - Címbusz érték rögzítése a ciklus elején',
  },
  {
    id: 'WAIT',
    label: 'WAIT',
    activeLowLabel: '/WAIT',
    color: '#E879F9', // Fuchsia 400
    type: 'DIGITAL',
    category: 'SYSTEM',
    visible: false,
    descriptionEn: 'Wait State Line - Inserted by slow memories or peripherals to delay CPU execution',
    descriptionHu: 'Várakozási Állapot - Lassú memóriák vagy perifériák által kért várakozás',
  },
  {
    id: 'BUSREQ',
    label: 'BUSREQ',
    activeLowLabel: '/BUSREQ',
    color: '#A78BFA', // Indigo 400
    type: 'DIGITAL',
    category: 'SYSTEM',
    visible: false,
    descriptionEn: 'DMA Bus Request / Hold - DMA controller requesting bus mastery',
    descriptionHu: 'DMA Busz Kérelem - Közvetlen memóriavezérlő átveszi a buszvezérlést',
  },
  {
    id: 'INT',
    label: 'INT',
    activeLowLabel: '/INT',
    color: '#F87171', // Red 400
    type: 'DIGITAL',
    category: 'SYSTEM',
    visible: true,
    descriptionEn: 'Interrupt Request - Hardware interrupt line from PIC / Timer / UART',
    descriptionHu: 'Megszakítás Kérelem - Hardveres IRQ jelzés a vezérlőtől',
  },
  {
    id: 'ALU_ACT',
    label: 'ALU_ACT',
    activeLowLabel: 'ALU_ACT',
    color: '#2DD4BF', // Teal 400
    type: 'DIGITAL',
    category: 'CONTROL',
    visible: false,
    descriptionEn: 'ALU Active - Arithmetic or logic computation in progress',
    descriptionHu: 'ALU Aktív - Aritmetikai vagy logikai művelet végrehajtása zajlik',
  },
  {
    id: 'ADDR_BUS',
    label: 'ADDR BUS',
    activeLowLabel: 'ADDR BUS',
    color: '#FDE047', // Yellow 300
    type: 'BUS',
    category: 'BUS',
    visible: true,
    descriptionEn: 'Address Bus (8/16-Bit) - Memory or I/O port address in Hex',
    descriptionHu: 'Címbusz (8/16-Bit) - Memória- vagy I/O portcím hexadecimálisan',
  },
  {
    id: 'DATA_BUS',
    label: 'DATA BUS',
    activeLowLabel: 'DATA BUS',
    color: '#67E8F9', // Cyan 300
    type: 'BUS',
    category: 'BUS',
    visible: true,
    descriptionEn: 'Data Bus (8-Bit) - Active data byte on the bus or High-Z',
    descriptionHu: 'Adatbusz (8-Bit) - Aktív adatbájt a buszon vagy Nagy Impedancia (Hi-Z)',
  },
];

/**
 * Extracts a complete hardware timing sample from the current CPU state.
 */
export function extractTimingSample(cpu: CpuState, cycleOverride?: number): TimingSample {
  const cycle = cycleOverride !== undefined ? cycleOverride : cpu.cycleCount;
  const uStep = cpu.microStep;
  const uIndex = cpu.microStepIndex ?? 0;
  const ctrlLines = cpu.bus?.controlLines || [];
  const activeSrc = cpu.bus?.activeSource || '';
  const activeDst = cpu.bus?.activeDestination || '';
  const instrName = cpu.currentInstructionName || 'NOP';

  // 1. Digital control line derivations
  let m1 = false;
  let mreq = false;
  let iorq = false;
  let rd = false;
  let wr = false;
  let ale = false;
  let aluAct = false;
  let isTriStated = false;

  // Clock is HIGH on T-state phase 1, LOW on phase 2 (represented as clock pulses)
  const clk = cycle % 2 === 0;

  switch (uStep) {
    case 'FETCH_MAR': // T1: PC -> MAR
      m1 = true;
      mreq = true;
      ale = true;
      rd = false;
      wr = false;
      isTriStated = true;
      break;

    case 'FETCH_IR': // T2: RAM[MAR] -> IR, PC++
      m1 = true;
      mreq = true;
      rd = true;
      wr = false;
      ale = false;
      break;

    case 'DECODE': // T3: Control Unit decode
      m1 = false;
      mreq = false;
      rd = false;
      wr = false;
      ale = false;
      isTriStated = true;
      break;

    case 'EXECUTE_OPERANDS': // T4: Read operands from RAM, Registers, or Ports
      ale = false;
      if (ctrlLines.includes('MEM_READ') || activeSrc === 'RAM') {
        mreq = true;
        rd = true;
        wr = false;
      } else if (ctrlLines.includes('IO_READ') || activeSrc.includes('PORT')) {
        iorq = true;
        rd = true;
        wr = false;
      } else if (ctrlLines.includes('IO_WRITE') || activeDst.includes('PORT')) {
        iorq = true;
        wr = true;
        rd = false;
      } else {
        isTriStated = true;
      }
      break;

    case 'EXECUTE_ALU': // T5: ALU compute
      aluAct = true;
      mreq = false;
      iorq = false;
      rd = false;
      wr = false;
      isTriStated = true;
      break;

    case 'WRITEBACK': // T6: Write result into RAM, Register, or Port
      if (ctrlLines.includes('MEM_WRITE') || activeDst === 'RAM') {
        mreq = true;
        wr = true;
        rd = false;
      } else if (ctrlLines.includes('IO_WRITE') || activeDst.includes('PORT')) {
        iorq = true;
        wr = true;
        rd = false;
      } else {
        isTriStated = true;
      }
      break;

    default:
      isTriStated = true;
      break;
  }

  // Check DMA Bus Master
  const busreq = !!cpu.dmaState?.isBusMaster;
  if (busreq) {
    mreq = true;
    rd = true;
  }

  // Check Interrupts
  const int = !!(
    cpu.picState?.lines?.some((l) => l.isActive || l.isPending) ||
    (cpu.picState && cpu.picState.inServiceRegister > 0)
  );

  // Check ALU activity
  if (cpu.alu?.isActive) {
    aluAct = true;
  }

  // 2. Classify Bus Cycle
  let busCycleType: BusCycleClassification = 'IDLE';
  if (busreq) {
    busCycleType = 'DMA_XFER';
  } else if (m1 && (mreq || rd)) {
    busCycleType = 'FETCH';
  } else if (mreq && rd) {
    busCycleType = 'MEM_RD';
  } else if (mreq && wr) {
    busCycleType = 'MEM_WR';
  } else if (iorq && rd) {
    busCycleType = 'IO_RD';
  } else if (iorq && wr) {
    busCycleType = 'IO_WR';
  } else if (int && m1) {
    busCycleType = 'INT_ACK';
  } else {
    busCycleType = 'IDLE';
  }

  return {
    cycle,
    timestamp: Date.now(),
    instructionName: instrName,
    microStep: uStep,
    microStepIndex: uIndex,
    clk,
    mreq,
    iorq,
    rd,
    wr,
    m1,
    ale,
    wait: false,
    busreq,
    int,
    aluActive: aluAct,
    addressBus: cpu.bus?.addressBus ?? cpu.registers?.MAR ?? 0,
    dataBus: cpu.bus?.dataBus ?? 0,
    isDataBusTriStated: isTriStated,
    busCycleType,
    activeSource: activeSrc,
    activeDestination: activeDst,
    explanation: cpu.currentInstructionExplanation || '',
    explanationHu: cpu.currentInstructionExplanationHu || '',
  };
}

/**
 * Checks if a sample satisfies the trigger condition.
 */
export function evaluateTrigger(sample: TimingSample, trigger: TimingTriggerConfig): boolean {
  if (!trigger.enabled) return false;

  switch (trigger.type) {
    case 'MEM_RD':
      return sample.mreq && sample.rd && !sample.m1;
    case 'MEM_WR':
      return sample.mreq && sample.wr;
    case 'IO_RD':
      return sample.iorq && sample.rd;
    case 'IO_WR':
      return sample.iorq && sample.wr;
    case 'M1_FETCH':
      return sample.m1;
    case 'INTERRUPT':
      return sample.int;
    case 'ADDR_MATCH':
      return sample.addressBus === trigger.targetAddress;
    case 'DATA_MATCH':
      return sample.dataBus === trigger.targetData;
    case 'FREE_RUN':
    default:
      return false;
  }
}

/**
 * Curated educational timing diagram waveforms for guided learning.
 */
export const EDUCATIONAL_TIMING_PRESETS: TimingPresetTrace[] = [
  {
    id: 'Z80_MEM_RD',
    titleEn: '1. Z80 / 8085 Memory Read Cycle (MREQ + RD)',
    titleHu: '1. Z80 / 8085 Memória Olvasási Ciklus (MREQ + RD)',
    descriptionEn:
      'Standard 4-clock cycle memory read: T1 sets Address & asserts /MREQ, T2 asserts /RD, T3 latches data from RAM, T4 completes bus release.',
    descriptionHu:
      'Szabványos 4 órajeles memória olvasás: T1 címet állít & /MREQ aktív, T2 /RD aktív, T3 beolvassa a RAM adatot, T4 befejezi a buszfelszabadítást.',
    targetCore: 'Z80 / EDU8',
    samples: [
      {
        cycle: 1,
        timestamp: 0,
        instructionName: 'LDA [0x42]',
        microStep: 'FETCH_MAR',
        microStepIndex: 0,
        clk: true,
        mreq: true,
        iorq: false,
        rd: false,
        wr: false,
        m1: false,
        ale: true,
        wait: false,
        busreq: false,
        int: false,
        aluActive: false,
        addressBus: 0x0042,
        dataBus: 0,
        isDataBusTriStated: true,
        busCycleType: 'MEM_RD',
        activeSource: 'MAR',
        activeDestination: 'ADDR_BUS',
        explanation: 'T1: Address 0x42 placed on bus. /MREQ asserted.',
        explanationHu: 'T1: 0x42 cím a buszra kerül. /MREQ aktívvá válik.',
      },
      {
        cycle: 2,
        timestamp: 10,
        instructionName: 'LDA [0x42]',
        microStep: 'EXECUTE_OPERANDS',
        microStepIndex: 1,
        clk: false,
        mreq: true,
        iorq: false,
        rd: true,
        wr: false,
        m1: false,
        ale: false,
        wait: false,
        busreq: false,
        int: false,
        aluActive: false,
        addressBus: 0x0042,
        dataBus: 0x3e,
        isDataBusTriStated: false,
        busCycleType: 'MEM_RD',
        activeSource: 'RAM',
        activeDestination: 'DATA_BUS',
        explanation: 'T2: /RD strobe asserted. RAM outputs data 0x3E onto bus.',
        explanationHu: 'T2: /RD olvasási jel aktív. A RAM 0x3E adatot ad ki a buszra.',
      },
      {
        cycle: 3,
        timestamp: 20,
        instructionName: 'LDA [0x42]',
        microStep: 'EXECUTE_OPERANDS',
        microStepIndex: 2,
        clk: true,
        mreq: true,
        iorq: false,
        rd: true,
        wr: false,
        m1: false,
        ale: false,
        wait: false,
        busreq: false,
        int: false,
        aluActive: false,
        addressBus: 0x0042,
        dataBus: 0x3e,
        isDataBusTriStated: false,
        busCycleType: 'MEM_RD',
        activeSource: 'RAM',
        activeDestination: 'REG_A',
        explanation: 'T3: CPU latches 0x3E into Accumulator on falling clock edge.',
        explanationHu: 'T3: A CPU beolvassa a 0x3E értéket az Akkumulátorba az órajel lefutó élén.',
      },
      {
        cycle: 4,
        timestamp: 30,
        instructionName: 'LDA [0x42]',
        microStep: 'DECODE',
        microStepIndex: 3,
        clk: false,
        mreq: false,
        iorq: false,
        rd: false,
        wr: false,
        m1: false,
        ale: false,
        wait: false,
        busreq: false,
        int: false,
        aluActive: false,
        addressBus: 0x0042,
        dataBus: 0,
        isDataBusTriStated: true,
        busCycleType: 'IDLE',
        activeSource: 'REG_A',
        activeDestination: 'IDLE',
        explanation: 'T4: /MREQ & /RD de-asserted. Bus returns to High-Z.',
        explanationHu: 'T4: /MREQ és /RD inaktív. A busz visszatér lebegő (Hi-Z) állapotba.',
      },
    ],
  },
  {
    id: 'Z80_MEM_WR',
    titleEn: '2. Z80 / 8085 Memory Write Cycle (MREQ + WR)',
    titleHu: '2. Z80 / 8085 Memória Írási Ciklus (MREQ + WR)',
    descriptionEn:
      'Memory write operation: T1 outputs Address, T2 drives Data & asserts /MREQ & /WR, T3 RAM latches data, T4 completes write cycle.',
    descriptionHu:
      'Memória írás művelet: T1 kiadja a Címet, T2 meghajtja az Adatot & /MREQ & /WR aktív, T3 a RAM elmenti az adatot, T4 lezárja a ciklust.',
    targetCore: 'Z80 / EDU8',
    samples: [
      {
        cycle: 1,
        timestamp: 0,
        instructionName: 'STA [0x80]',
        microStep: 'FETCH_MAR',
        microStepIndex: 0,
        clk: true,
        mreq: true,
        iorq: false,
        rd: false,
        wr: false,
        m1: false,
        ale: true,
        wait: false,
        busreq: false,
        int: false,
        aluActive: false,
        addressBus: 0x0080,
        dataBus: 0,
        isDataBusTriStated: true,
        busCycleType: 'MEM_WR',
        activeSource: 'MAR',
        activeDestination: 'ADDR_BUS',
        explanation: 'T1: Address 0x80 stable. /MREQ asserted.',
        explanationHu: 'T1: 0x80 cím stabilizálódik. /MREQ aktívvá válik.',
      },
      {
        cycle: 2,
        timestamp: 10,
        instructionName: 'STA [0x80]',
        microStep: 'WRITEBACK',
        microStepIndex: 1,
        clk: false,
        mreq: true,
        iorq: false,
        rd: false,
        wr: true,
        m1: false,
        ale: false,
        wait: false,
        busreq: false,
        int: false,
        aluActive: false,
        addressBus: 0x0080,
        dataBus: 0xff,
        isDataBusTriStated: false,
        busCycleType: 'MEM_WR',
        activeSource: 'REG_A',
        activeDestination: 'RAM',
        explanation: 'T2: CPU drives Data 0xFF onto bus and asserts /WR strobe.',
        explanationHu: 'T2: A CPU 0xFF adatot ad ki a buszra és /WR írási jelet ad ki.',
      },
      {
        cycle: 3,
        timestamp: 20,
        instructionName: 'STA [0x80]',
        microStep: 'WRITEBACK',
        microStepIndex: 2,
        clk: true,
        mreq: true,
        iorq: false,
        rd: false,
        wr: true,
        m1: false,
        ale: false,
        wait: false,
        busreq: false,
        int: false,
        aluActive: false,
        addressBus: 0x0080,
        dataBus: 0xff,
        isDataBusTriStated: false,
        busCycleType: 'MEM_WR',
        activeSource: 'RAM',
        activeDestination: 'RAM',
        explanation: 'T3: RAM memory cells permanently latch byte 0xFF.',
        explanationHu: 'T3: A RAM memóriacellák véglegesen eltárolják a 0xFF bájtot.',
      },
      {
        cycle: 4,
        timestamp: 30,
        instructionName: 'STA [0x80]',
        microStep: 'DECODE',
        microStepIndex: 3,
        clk: false,
        mreq: false,
        iorq: false,
        rd: false,
        wr: false,
        m1: false,
        ale: false,
        wait: false,
        busreq: false,
        int: false,
        aluActive: false,
        addressBus: 0x0080,
        dataBus: 0,
        isDataBusTriStated: true,
        busCycleType: 'IDLE',
        activeSource: 'IDLE',
        activeDestination: 'IDLE',
        explanation: 'T4: /WR de-asserted to prevent accidental overwrites.',
        explanationHu: 'T4: /WR inaktívvá válik a véletlen felülírások megakadályozására.',
      },
    ],
  },
  {
    id: 'IO_PERIPHERAL_CYCLE',
    titleEn: '3. I/O Port Cycle (IORQ + RD / WR) with Wait-State (TW)',
    titleHu: '3. I/O Port Ciklus (IORQ + RD / WR) Várakozási Állapottal (TW)',
    descriptionEn:
      'Peripherals are slower than SRAM. CPU automatically inserts a Wait-State (TW) between T2 and T3 to give the hardware device enough time to respond.',
    descriptionHu:
      'A perifériák lassabbak a memóriánál. A CPU automatikusan beiktat egy TW várakozási állapotot T2 és T3 közé a megfelelő válaszidő biztosításához.',
    targetCore: 'Z80 / EDU8',
    samples: [
      {
        cycle: 1,
        timestamp: 0,
        instructionName: 'OUT (Port 1), A',
        microStep: 'FETCH_MAR',
        microStepIndex: 0,
        clk: true,
        mreq: false,
        iorq: true,
        rd: false,
        wr: false,
        m1: false,
        ale: true,
        wait: false,
        busreq: false,
        int: false,
        aluActive: false,
        addressBus: 0x0001,
        dataBus: 0,
        isDataBusTriStated: true,
        busCycleType: 'IO_WR',
        activeSource: 'PORT_ADDR',
        activeDestination: 'ADDR_BUS',
        explanation: 'T1: Port Address 0x01 outputted, /IORQ asserted.',
        explanationHu: 'T1: 0x01 Port cím kiadva, /IORQ aktívvá válik.',
      },
      {
        cycle: 2,
        timestamp: 10,
        instructionName: 'OUT (Port 1), A',
        microStep: 'WRITEBACK',
        microStepIndex: 1,
        clk: false,
        mreq: false,
        iorq: true,
        rd: false,
        wr: true,
        m1: false,
        ale: false,
        wait: false,
        busreq: false,
        int: false,
        aluActive: false,
        addressBus: 0x0001,
        dataBus: 0x55,
        isDataBusTriStated: false,
        busCycleType: 'IO_WR',
        activeSource: 'REG_A',
        activeDestination: 'PORT_1',
        explanation: 'T2: Data 0x55 on bus, /WR strobe active.',
        explanationHu: 'T2: 0x55 adat a buszon, /WR írási jel aktív.',
      },
      {
        cycle: 3,
        timestamp: 20,
        instructionName: 'OUT (Port 1), A',
        microStep: 'WRITEBACK',
        microStepIndex: 2,
        clk: true,
        mreq: false,
        iorq: true,
        rd: false,
        wr: true,
        m1: false,
        ale: false,
        wait: true, // TW Wait State!
        busreq: false,
        int: false,
        aluActive: false,
        addressBus: 0x0001,
        dataBus: 0x55,
        isDataBusTriStated: false,
        busCycleType: 'IO_WR',
        activeSource: 'PERIPHERAL',
        activeDestination: 'PORT_1',
        explanation: 'TW (Wait State): Bus signals held steady for slow peripheral.',
        explanationHu: 'TW (Várakozási Állapot): A jelek stabilan maradnak a lassú periféria számára.',
      },
      {
        cycle: 4,
        timestamp: 30,
        instructionName: 'OUT (Port 1), A',
        microStep: 'WRITEBACK',
        microStepIndex: 3,
        clk: false,
        mreq: false,
        iorq: true,
        rd: false,
        wr: true,
        m1: false,
        ale: false,
        wait: false,
        busreq: false,
        int: false,
        aluActive: false,
        addressBus: 0x0001,
        dataBus: 0x55,
        isDataBusTriStated: false,
        busCycleType: 'IO_WR',
        activeSource: 'PORT_1',
        activeDestination: 'LEDS',
        explanation: 'T3: 8-bit LEDs register latches byte 0x55.',
        explanationHu: 'T3: A LED kijelző regisztere elmenti a 0x55 bájtot.',
      },
      {
        cycle: 5,
        timestamp: 40,
        instructionName: 'OUT (Port 1), A',
        microStep: 'DECODE',
        microStepIndex: 4,
        clk: true,
        mreq: false,
        iorq: false,
        rd: false,
        wr: false,
        m1: false,
        ale: false,
        wait: false,
        busreq: false,
        int: false,
        aluActive: false,
        addressBus: 0x0001,
        dataBus: 0,
        isDataBusTriStated: true,
        busCycleType: 'IDLE',
        activeSource: 'IDLE',
        activeDestination: 'IDLE',
        explanation: 'T4: /IORQ & /WR released.',
        explanationHu: 'T4: /IORQ és /WR felengedve.',
      },
    ],
  },
  {
    id: 'OPCODE_FETCH_M1',
    titleEn: '4. Opcode Fetch Machine Cycle (M1 + MREQ + RD)',
    titleHu: '4. Utasítás-Kód Betöltési Ciklus (M1 + MREQ + RD)',
    descriptionEn:
      'Fastest machine cycle: /M1 is asserted along with /MREQ and /RD. In Z80, during T3 and T4, the CPU outputs a DRAM refresh address on A0-A6.',
    descriptionHu:
      'A leggyorsabb gépi ciklus: /M1 egyszerre aktív /MREQ és /RD jelekkel. Z80 esetén T3-T4 alatt a CPU DRAM frissítési címet ad ki.',
    targetCore: 'Z80 / EDU8',
    samples: [
      {
        cycle: 1,
        timestamp: 0,
        instructionName: 'NOP (0x00)',
        microStep: 'FETCH_MAR',
        microStepIndex: 0,
        clk: true,
        mreq: true,
        iorq: false,
        rd: false,
        wr: false,
        m1: true,
        ale: true,
        wait: false,
        busreq: false,
        int: false,
        aluActive: false,
        addressBus: 0x0000,
        dataBus: 0,
        isDataBusTriStated: true,
        busCycleType: 'FETCH',
        activeSource: 'PC',
        activeDestination: 'MAR',
        explanation: 'T1 (M1): PC (0x0000) on address bus. /M1 & /MREQ asserted.',
        explanationHu: 'T1 (M1): PC (0x0000) a címbuszon. /M1 és /MREQ aktív.',
      },
      {
        cycle: 2,
        timestamp: 10,
        instructionName: 'NOP (0x00)',
        microStep: 'FETCH_IR',
        microStepIndex: 1,
        clk: false,
        mreq: true,
        iorq: false,
        rd: true,
        wr: false,
        m1: true,
        ale: false,
        wait: false,
        busreq: false,
        int: false,
        aluActive: false,
        addressBus: 0x0000,
        dataBus: 0x00,
        isDataBusTriStated: false,
        busCycleType: 'FETCH',
        activeSource: 'RAM',
        activeDestination: 'IR',
        explanation: 'T2 (M1): /RD asserted. Opcode 0x00 read into Instruction Register.',
        explanationHu: 'T2 (M1): /RD aktív. 0x00 opkód beolvasva az Utasításregiszterbe.',
      },
      {
        cycle: 3,
        timestamp: 20,
        instructionName: 'NOP (0x00)',
        microStep: 'DECODE',
        microStepIndex: 2,
        clk: true,
        mreq: false,
        iorq: false,
        rd: false,
        wr: false,
        m1: false,
        ale: false,
        wait: false,
        busreq: false,
        int: false,
        aluActive: false,
        addressBus: 0x0001,
        dataBus: 0,
        isDataBusTriStated: true,
        busCycleType: 'IDLE',
        activeSource: 'IR',
        activeDestination: 'CONTROL_UNIT',
        explanation: 'T3: Opcode decoded by Control Unit.',
        explanationHu: 'T3: Opkód dekódolása a Vezérlőegység által.',
      },
      {
        cycle: 4,
        timestamp: 30,
        instructionName: 'NOP (0x00)',
        microStep: 'DECODE',
        microStepIndex: 3,
        clk: false,
        mreq: false,
        iorq: false,
        rd: false,
        wr: false,
        m1: false,
        ale: false,
        wait: false,
        busreq: false,
        int: false,
        aluActive: false,
        addressBus: 0x0001,
        dataBus: 0,
        isDataBusTriStated: true,
        busCycleType: 'IDLE',
        activeSource: 'IDLE',
        activeDestination: 'IDLE',
        explanation: 'T4: Execution finished. PC ready for next instruction.',
        explanationHu: 'T4: Végrehajtás kész. A PC készen áll a következő utasításra.',
      },
    ],
  },
];
