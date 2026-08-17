import { LessonStep } from '../types/cpu';

export const LESSONS: LessonStep[] = [
  {
    id: 'lesson-1',
    title: 'Lesson 1: What is a Register & How to Move Data',
    titleHu: '1. Lecke: Mik azok a Regiszterek és hogyan mozgatunk adatot?',
    concept: 'Registers and Immediate Loading (LDI & MOV)',
    conceptHu: 'Regiszterek és közvetlen adatbetöltés (LDI & MOV)',
    explanation:
      'Registers are the fastest, ultra-low-latency memory cells directly inside the CPU core. The LDI (Load Immediate) instruction copies a number directly into a register, while MOV copies data between two registers.',
    explanationHu:
      'A regiszterek a processzor leggyorsabb, közvetlen belső adattároló egységei. Az LDI (Load Immediate) utasítással közvetlen számot írhatunk egy regiszterbe, a MOV utasítással pedig két regiszter között másolhatunk értéket.',
    suggestedCode: `; 1. Lecke kódja:
LDI A, 10      ; Töltsünk 10-et az A regiszterbe
LDI B, 20      ; Töltsünk 20-at a B regiszterbe
MOV C, A       ; Másoljuk át A tartalmát C-be
HLT
`,
    tasks: [
      {
        text: 'Load value 10 into Register A',
        textHu: 'Tölts 10-es értéket az A regiszterbe',
        check: (cpu) => cpu.registers.A === 10,
      },
      {
        text: 'Load value 20 into Register B',
        textHu: 'Tölts 20-as értéket a B regiszterbe',
        check: (cpu) => cpu.registers.B === 20,
      },
      {
        text: 'Copy Register A value to Register C',
        textHu: 'Másold át az A regiszter értékét a C regiszterbe',
        check: (cpu) => cpu.registers.C === 10,
      },
    ],
  },
  {
    id: 'lesson-2',
    title: 'Lesson 2: The ALU (Arithmetic Logic Unit)',
    titleHu: '2. Lecke: Az ALU (Aritmetikai és Logikai Egység)',
    concept: 'Mathematical Calculations & Status Flags (ADD, SUB, Zero Flag)',
    conceptHu: 'Matematikai műveletek és Jelzőbitek (ADD, SUB, Z Flag)',
    explanation:
      'The ALU is the calculator of the CPU. When it performs arithmetic, it automatically updates Flags: the Zero (Z) flag turns ON if the result is 0, and the Carry (C) flag turns ON if addition overflows > 255.',
    explanationHu:
      'Az ALU a processzor számológépe. Minden művelet után frissíti a Jelzőbiteket (Flags): a Zero (Z) jelző 1 lesz, ha az eredmény 0; a Carry (C) jelző pedig, ha a számítás meghaladja a 255-öt (túlcsordulás).',
    suggestedCode: `; 2. Lecke kódja:
LDI A, 50
LDI B, 50
SUB A, B       ; 50 - 50 = 0 -> Zero Flag (Z) aktív lesz!
HLT
`,
    tasks: [
      {
        text: 'Perform an operation resulting in 0 to activate the Zero Flag (Z)',
        textHu: 'Végezz el egy olyan műveletet, aminek eredménye 0 (aktiválja a Z jelzőbitet)',
        check: (cpu) => cpu.flags.Z === true,
      },
      {
        text: 'Accumulator A should be 0',
        textHu: 'Az A akkumulátor értéke legyen 0',
        check: (cpu) => cpu.registers.A === 0,
      },
    ],
  },
  {
    id: 'lesson-3',
    title: 'Lesson 3: Program Counter & Memory (RAM)',
    titleHu: '3. Lecke: Program Számláló (PC) és Memória (RAM)',
    concept: 'Storing to RAM and Instruction Fetching (STA & LDA)',
    conceptHu: 'Adattárolás a RAM-ban és betöltés (STA & LDA)',
    explanation:
      'The Program Counter (PC) holds the address of the next instruction to fetch. The CPU communicates with the RAM using the Memory Address Register (MAR) and Memory Buffer Register (MBR).',
    explanationHu:
      'A Program Számláló (PC) tartalmazza a következő végrehajtandó utasítás memóriacímét. A CPU a Címregiszteren (MAR) és az Adatpufferen (MBR) keresztül ír és olvas a RAM memóriából.',
    suggestedCode: `; 3. Lecke kódja:
LDI A, 99
STA 0x50       ; Mentés a 0x50-es memóriacímre
LDI A, 0       ; A törlése
LDA 0x50       ; Visszatöltés a memóriából
HLT
`,
    tasks: [
      {
        text: 'Store value 99 into RAM address 0x50 (80 decimal)',
        textHu: 'Mentsd el a 99-es számot a 0x50-es memóriacímre (80 dec)',
        check: (cpu) => cpu.memory[0x50] === 99,
      },
      {
        text: 'Load the value back into Accumulator A',
        textHu: 'Töltsd vissza a mentett értéket az A akkumulátorba',
        check: (cpu) => cpu.registers.A === 99,
      },
    ],
  },
  {
    id: 'lesson-4',
    title: 'Lesson 4: Loops & Conditional Jumps',
    titleHu: '4. Lecke: Ciklusok és Feltételes Ugrások (JNZ, CMP)',
    concept: 'Decision making with CMP and JNZ / JZ',
    conceptHu: 'Döntéshozatal CMP és feltételes ugrások segítségével',
    explanation:
      'CPUs create loops by comparing a counter and jumping back to a label as long as a condition holds (e.g. JNZ: Jump if Not Zero).',
    explanationHu:
      'A processzor a feltételes ugróutasításokkal (pl. JNZ: Ugrás ha nem nulla) hoz létre ciklusokat és döntési ágakat.',
    suggestedCode: `; 4. Lecke kódja: 1-től 5-ig számláló
LDI A, 0       ; Eredmény
LDI C, 5       ; Ciklusszámláló

ciklus:
  INC A        ; A növelése
  DEC C        ; C csökkentése
  JNZ ciklus   ; Ha C nem 0, ugrás a ciklus elejére

HLT
`,
    tasks: [
      {
        text: 'Run the loop until counter reaches 0 and A reaches 5',
        textHu: 'Futtasd a ciklust, amíg a számláló 0 lesz és az A eléri az 5-öt',
        check: (cpu) => cpu.registers.A === 5 && cpu.registers.C === 0,
      },
    ],
  },
  {
    id: 'lesson-5',
    title: 'Lesson 5: I/O Ports & Hardware Interaction',
    titleHu: '5. Lecke: I/O Portok és Külső Perifériák Vezérlése',
    concept: 'Sending data to LEDs (Port 1) and 7-Segment (Port 3)',
    conceptHu: 'Adatküldés LED-ekre (Port 1) és 7-szegmenses kijelzőre (Port 3)',
    explanation:
      'The OUT and IN instructions connect the CPU core with external hardware: LED bars, digital displays, and switches.',
    explanationHu:
      'Az OUT és IN utasítások kötik össze a CPU magot a külső hardvereszközökkel: LED sorral, digitális kijelzővel és kapcsolókkal.',
    suggestedCode: `; 5. Lecke kódja:
LDI A, 42
OUT 3, A       ; 42 kiírása a 7-szegmenses kijelzőre
LDI B, 0b10101010 ; Mintázat a LED-ekre
OUT 1, B       ; Küldés az 1-es LED portra
HLT
`,
    tasks: [
      {
        text: 'Write value 42 to the 7-segment display (Port 3)',
        textHu: 'Írd ki a 42-es értéket a 7-szegmenses kijelzőre (Port 3)',
        check: (cpu) => cpu.peripherals.sevenSegment === 42,
      },
    ],
  },
];
