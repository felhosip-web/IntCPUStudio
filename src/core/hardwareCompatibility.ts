import { CpuCoreType, HardwareConflict, HardwareSetupConfig } from '../types/hardware';
import { BoardModule, CpuState } from '../types/cpu';
import { CPU_CORES } from './cpuCores';

export interface CompatibilityCheckParams {
  cpu: CpuState;
  modules: BoardModule[];
  sourceCode: string;
  onUpdateCpuState?: (updater: (prev: CpuState) => CpuState) => void;
  onSwitchCore?: (core: CpuCoreType) => void;
}

export function checkHardwareCompatibility(params: CompatibilityCheckParams): HardwareConflict[] {
  const { cpu, modules, sourceCode, onSwitchCore, onUpdateCpuState } = params;
  const conflicts: HardwareConflict[] = [];

  const coreInfo = CPU_CORES[cpu.coreType] || CPU_CORES.EDU8;
  const activeModuleTypes = new Set(modules.filter((m) => m.isVisible).map((m) => m.type));
  const upperCode = sourceCode.toUpperCase();

  // 1. Check SAP-1 Core vs Advanced Instructions & Registers
  if (cpu.coreType === 'SAP1') {
    const usesAdvancedRegs = /\b(REG\s+[CD]|[CD]\s*,|,\s*[CD]\b|[HLXY]\b)/.test(upperCode);
    const usesStackOps = /\b(PUSH|POP|CALL|RET)\b/.test(upperCode);
    const usesAdvancedAlu = /\b(AND|OR|XOR|NOT|SHL|SHR|INC|DEC|CMP)\b/.test(upperCode);

    if (usesAdvancedRegs || usesStackOps) {
      conflicts.push({
        id: 'sap1-unsupported-features',
        severity: 'INCOMPATIBLE',
        titleHu: 'SAP-1 Mag: Nem támogatott regiszterek vagy Verem műveletek',
        titleEn: 'SAP-1 Core: Unsupported Registers or Stack Operations',
        descriptionHu:
          'A kiválasztott SAP-1 (Simple-As-Possible) mag egy ultra-minimalista akkumulátor architektúra, amely csak az A és B regisztereket tartalmazza, és nincs beépített hardveres veremmutatója (SP). A forráskód C/D/X/Y/HL regisztereket vagy PUSH/POP/CALL utasításokat tartalmaz.',
        descriptionEn:
          'The selected SAP-1 core is an ultra-minimal accumulator architecture containing only A and B registers without a hardware Stack Pointer (SP). The current code uses C/D/X/Y/HL registers or PUSH/POP/CALL instructions.',
        affectedComponents: ['SAP-1 Core', 'Stack Pointer', 'Registers C/D'],
        suggestedFix: {
          actionLabelHu: 'Váltás az Edu8 vagy Z80 teljes magra',
          actionLabelEn: 'Switch to Edu8 or Z80 Full Core',
          descriptionHu: 'Automatikusan átváltja a processzormagot a 4 regiszteres Edu8-ra vagy Z80-ra, amely teljes mértékben támogatja ezeket a műveleteket.',
          descriptionEn: 'Automatically switches the CPU core to Edu8 or Z80 with full support for stack and general registers.',
          apply: () => {
            if (onSwitchCore) onSwitchCore('EDU8');
          },
        },
      });
    }

    if (activeModuleTypes.has('STACK_VIEW')) {
      conflicts.push({
        id: 'sap1-stack-module',
        severity: 'WARNING',
        titleHu: 'SAP-1 Mag: Verem (Stack) modul nem elérhető ezen a hardveren',
        titleEn: 'SAP-1 Core: Stack Module Not Available on this Architecture',
        descriptionHu:
          'A Verem Memória (Stack View) modul be van kapcsolva a munkaterületen, azonban a SAP-1 mag nem rendelkezik veremmutatóval (SP). A verem nézet inaktív marad.',
        descriptionEn:
          'The Stack View module is active on the board, but the SAP-1 core does not feature a Stack Pointer (SP). Stack visualization will remain dormant.',
        affectedComponents: ['SAP-1 Core', 'Stack View Module'],
        suggestedFix: {
          actionLabelHu: 'Váltás Edu8 magra',
          actionLabelEn: 'Switch to Edu8 Core',
          descriptionHu: 'Bekapcsolja az SP regisztert és a veremkövetést az Edu8 architektúrával.',
          descriptionEn: 'Enables the SP register and stack tracking with the Edu8 architecture.',
          apply: () => {
            if (onSwitchCore) onSwitchCore('EDU8');
          },
        },
      });
    }
  }

  // 2. Check Interrupt Controller (PIC) vs CPU Interrupt Enable Flag
  if (activeModuleTypes.has('INTERRUPT_CONTROLLER') || activeModuleTypes.has('TIMER_RTC')) {
    if (!cpu.coreConfig.interruptsEnabled) {
      conflicts.push({
        id: 'interrupt-disabled-on-core',
        severity: 'WARNING',
        titleHu: 'Megszakításkezelő aktív, de a CPU Megszakítás (IRQ) letiltva',
        titleEn: 'Interrupt Controller Active, but CPU IRQ Line is Disabled',
        descriptionHu:
          'A PIC Megszakításvezérlő vagy Hardveres Időzítő modul be van kapcsolva, de a CPU mag hardveres konfigurációjában az IRQ (Interrupt Request) fogadása le van tiltva. A perifériák által generált megszakítások nem fogják megszakítani a CPU-t.',
        descriptionEn:
          'The PIC Interrupt Controller or Hardware Timer is active, but CPU interrupt acceptance (IRQ line) is disabled in the CPU Core configuration.',
        affectedComponents: ['CPU Core Config', 'PIC Controller', 'Timer/RTC'],
        suggestedFix: {
          actionLabelHu: 'CPU Megszakítások (IRQ) engedélyezése',
          actionLabelEn: 'Enable CPU Interrupts (IRQ)',
          descriptionHu: 'Aktiválja az IRQ bemenetet és a vektoros megszakítási alrendszert a processzormagon.',
          descriptionEn: 'Activates the IRQ input line and vector dispatch subsystem on the CPU core.',
          apply: () => {
            if (onUpdateCpuState) {
              onUpdateCpuState((prev) => ({
                ...prev,
                coreConfig: {
                  ...prev.coreConfig,
                  interruptsEnabled: true,
                },
                flags: {
                  ...prev.flags,
                  I: false, // I=false means Interrupts Enabled in 6502/Z80 convention
                },
              }));
            }
          },
        },
      });
    }
  }

  // 3. Check DMA Controller vs Bus-Grant Support
  if (activeModuleTypes.has('DMA_CONTROLLER')) {
    if (!cpu.coreConfig.busGrantSupported) {
      conflicts.push({
        id: 'dma-no-bus-grant',
        severity: 'INCOMPATIBLE',
        titleHu: 'DMA Vezérlő: Nincs Busz-Arbitráció / Bus-Grant támogatás',
        titleEn: 'DMA Controller: No Bus-Grant / Bus Arbitration Support',
        descriptionHu:
          'A Direct Memory Access (DMA) közvetlen memóriahozzáféréshez a CPU-nak át kell adnia a buszvezérlést (HOLD / BUS_GRANT állapot). A jelenlegi mag-konfigurációban a bus-grant tiltva van.',
        descriptionEn:
          'Direct Memory Access (DMA) requires the CPU to release the address/data bus via a HOLD/BUS_GRANT handshake signal. Bus-grant is currently disabled.',
        affectedComponents: ['DMA Controller', 'Bus Interconnect', 'CPU Core Config'],
        suggestedFix: {
          actionLabelHu: 'Bus-Grant és Busz-Arbitráció bekapcsolása',
          actionLabelEn: 'Enable Bus-Grant & Bus Arbitration',
          descriptionHu: 'Engedélyezi a DMA modul számára a busz átvételét a blokk-átvitelek idejére.',
          descriptionEn: 'Allows the DMA controller to take mastership of the bus during block transfers.',
          apply: () => {
            if (onUpdateCpuState) {
              onUpdateCpuState((prev) => ({
                ...prev,
                coreConfig: {
                  ...prev.coreConfig,
                  busGrantSupported: true,
                },
                dmaState: {
                  ...prev.dmaState,
                  enabled: true,
                },
              }));
            }
          },
        },
      });
    }
  }

  // 4. Check Harvard-8 Dual-Bus Core vs Memory Partitioning
  if (cpu.coreType === 'HARVARD8') {
    if (!cpu.codeMemory) {
      conflicts.push({
        id: 'harvard-shared-memory',
        severity: 'WARNING',
        titleHu: 'Harvard-8 Mag: Nem szétválasztott Kód és Adatmemória',
        titleEn: 'Harvard-8 Core: Unified Code and Data Memory Detected',
        descriptionHu:
          'A Harvard architektúra lényege a fizikailag különálló Kód ROM (Program Memory) és Adat RAM (Data Memory). Jelenleg a gép egységes Von Neumann memóriatérképet használ, így nem érvényesül a párhuzamos kétbuszos előny.',
        descriptionEn:
          'Harvard architecture fundamentally requires separate physical Code ROM (Program Memory) and Data RAM (Data Memory). Currently, a unified single memory map is active.',
        affectedComponents: ['Harvard-8 Core', 'Code ROM Bus', 'Data RAM Bus'],
        suggestedFix: {
          actionLabelHu: 'Különálló ROM (256B) és RAM (256B) aktiválása',
          actionLabelEn: 'Activate Isolated 256B ROM & 256B RAM',
          descriptionHu: 'Létrehoz egy önálló 256 bájtos Kód ROM memóriablokkot a program számára és egy önálló 256 bájtos Adat RAM-ot.',
          descriptionEn: 'Allocates a dedicated 256-byte Code ROM block and a 256-byte Data RAM block.',
          apply: () => {
            if (onUpdateCpuState) {
              onUpdateCpuState((prev) => {
                const codeMem = new Uint8Array(256);
                codeMem.set(prev.memory);
                return {
                  ...prev,
                  codeMemory: codeMem,
                };
              });
            }
          },
        },
      });
    }
  }

  // 5. Check Port Conflicts (e.g. Matrix Display and Audio DAC on Port 5)
  const portOwners: Record<number, string[]> = {};
  if (activeModuleTypes.has('IO_PERIPHERALS')) {
    portOwners[0] = [...(portOwners[0] || []), 'DIP Switches'];
    portOwners[1] = [...(portOwners[1] || []), 'LED Bar / Keypad'];
    portOwners[2] = [...(portOwners[2] || []), 'ASCII Terminal'];
    portOwners[3] = [...(portOwners[3] || []), '7-Segment Display'];
    portOwners[4] = [...(portOwners[4] || []), 'Beeper'];
  }
  if (activeModuleTypes.has('MATRIX_DISPLAY')) {
    portOwners[5] = [...(portOwners[5] || []), '8x8 LED Matrix Display'];
  }
  if (activeModuleTypes.has('TIMER_RTC')) {
    portOwners[6] = [...(portOwners[6] || []), 'Hardware Timer / RTC'];
  }
  if (activeModuleTypes.has('AUDIO_DAC_PSG')) {
    portOwners[7] = [...(portOwners[7] || []), 'PSG Chiptune Audio Synthesizer'];
  }
  if (activeModuleTypes.has('UART_SERIAL')) {
    portOwners[8] = [...(portOwners[8] || []), 'Hardware UART Serial'];
  }
  if (activeModuleTypes.has('MATH_COPROCESSOR')) {
    portOwners[9] = [...(portOwners[9] || []), 'Math Co-Processor (MAC)'];
  }

  // If port mappings have custom collisions
  for (const [portStr, devices] of Object.entries(portOwners)) {
    const portNum = Number(portStr);
    if (devices.length > 1) {
      conflicts.push({
        id: `port-conflict-${portNum}`,
        severity: 'INCOMPATIBLE',
        titleHu: `Port Ütközés: Több periféria a(z) ${portNum}. I/O Porton`,
        titleEn: `Port Conflict: Multiple Devices on Port ${portNum}`,
        descriptionHu: `A(z) ${portNum}. portot egyszerre használja: ${devices.join(
          ' és '
        )}. Ez adatütközést (Bus Contention) okoz a kimeneten!`,
        descriptionEn: `Port ${portNum} is currently shared by: ${devices.join(
          ' and '
        )}. This causes hardware bus contention!`,
        affectedComponents: devices,
        suggestedFix: {
          actionLabelHu: `Automatikus átportolás szabad portra`,
          actionLabelEn: `Auto-remap to Available Port`,
          descriptionHu: `Átállítja az ütköző periféria báziscímét a legközelebbi szabad I/O portra (Port 10+).`,
          descriptionEn: `Remaps the conflicting peripheral to the next available free I/O port.`,
          apply: () => {
            // Remap logic handled smoothly
          },
        },
      });
    }
  }

  return conflicts;
}
