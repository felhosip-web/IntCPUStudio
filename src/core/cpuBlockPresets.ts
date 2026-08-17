import { CpuBlockPreset } from '../types/cpuBlock';

export const CPU_BLOCK_PRESETS: CpuBlockPreset[] = [
  {
    id: 'preset_arithmetic',
    title: 'Basic Arithmetic & 7-Segment Display',
    titleHu: 'Alapvető Aritmetika & 7-Szegmenses Kijelző',
    category: 'Kezdő',
    categoryHu: 'Kezdő',
    description: 'Loads values into registers A and B, calculates the sum, and displays it on the 7-segment display.',
    descriptionHu: 'Értékek betöltése az A és B regiszterbe, összeg kiszámítása ALU-val és megjelenítés a 7-szegmenses kijelzőn.',
    blocks: [
      {
        instanceId: 'p1_comment1',
        blockType: 'COMMENT',
        params: { text: '1. Értékek betöltése regiszterekbe' },
      },
      {
        instanceId: 'p1_ldi1',
        blockType: 'LDI',
        params: { reg: 'A', imm: 25 },
      },
      {
        instanceId: 'p1_ldi2',
        blockType: 'LDI',
        params: { reg: 'B', imm: 17 },
      },
      {
        instanceId: 'p1_comment2',
        blockType: 'COMMENT',
        params: { text: '2. Összeadás (A = A + B) és kiírás' },
      },
      {
        instanceId: 'p1_add',
        blockType: 'ADD',
        params: { dst: 'A', src: 'B' },
      },
      {
        instanceId: 'p1_out',
        blockType: 'OUT',
        params: { port: '3', reg: 'A' },
      },
      {
        instanceId: 'p1_hlt',
        blockType: 'HLT',
        params: {},
      },
    ],
  },
  {
    id: 'preset_counter_loop',
    title: 'High-Level Repeat Loop (Count 10)',
    titleHu: 'Strukturált Ismételd Ciklus (10 Számolás)',
    category: 'Ciklusok',
    categoryHu: 'Ciklusok',
    description: 'Uses the high-level Blockly Repeat Loop to count from 0 to 10 on the 7-segment display.',
    descriptionHu: 'A magas szintű Ismételd blokkal számlál 0-tól 10-ig a 7-szegmenses kijelzőn.',
    blocks: [
      {
        instanceId: 'p2_ldi',
        blockType: 'LDI',
        params: { reg: 'A', imm: 0 },
      },
      {
        instanceId: 'p2_loop',
        blockType: 'LOOP_COUNT',
        params: { count: 10, loopLabel: 'szamlalo_ciklus' },
        children: [
          {
            instanceId: 'p2_inc',
            blockType: 'INC',
            params: { reg: 'A' },
          },
          {
            instanceId: 'p2_out',
            blockType: 'OUT',
            params: { port: '3', reg: 'A' },
          },
          {
            instanceId: 'p2_sleep',
            blockType: 'SLEEP',
            params: { cycles: 3 },
          },
        ],
      },
      {
        instanceId: 'p2_hlt',
        blockType: 'HLT',
        params: {},
      },
    ],
  },
  {
    id: 'preset_led_chaser',
    title: 'LED Shift Chaser (SHL & Infinite Loop)',
    titleHu: 'LED Futófény Léptetés (SHL & Végtelen Ciklus)',
    category: 'Perifériák',
    categoryHu: 'Perifériák',
    description: 'Shifts a single LED bit across Port 1 using SHL, resetting automatically when overflowing.',
    descriptionHu: 'Egyetlen bitet léptet végig az 1-es LED porton az SHL utasítással, majd újraindítja ha túlcsordul.',
    blocks: [
      {
        instanceId: 'p3_init',
        blockType: 'LDI',
        params: { reg: 'A', imm: 1 },
      },
      {
        instanceId: 'p3_lbl',
        blockType: 'LABEL',
        params: { name: 'futofeny_start' },
      },
      {
        instanceId: 'p3_out',
        blockType: 'OUT',
        params: { port: '1', reg: 'A' },
      },
      {
        instanceId: 'p3_sleep',
        blockType: 'SLEEP',
        params: { cycles: 2 },
      },
      {
        instanceId: 'p3_shl',
        blockType: 'SHL',
        params: { reg: 'A' },
      },
      {
        instanceId: 'p3_if',
        blockType: 'IF_CMP',
        params: {
          reg: 'A',
          condition: 'JE',
          compareVal: 0,
          skipLabel: 'ugras_ha_nem_nulla',
        },
        children: [
          {
            instanceId: 'p3_reset',
            blockType: 'LDI',
            params: { reg: 'A', imm: 1 },
          },
        ],
      },
      {
        instanceId: 'p3_jmp',
        blockType: 'JMP',
        params: { target: 'futofeny_start' },
      },
    ],
  },
  {
    id: 'preset_fibonacci',
    title: 'Fibonacci Generator with RAM Pointers',
    titleHu: 'Fibonacci-sorozat RAM Mutatókkal',
    category: 'Algoritmus',
    categoryHu: 'Algoritmus',
    description: 'Generates Fibonacci numbers, writes each result to RAM memory via pointer C, and outputs to 7-segment.',
    descriptionHu: 'Fibonacci számokat generál, a C mutatóval memóriába írja őket és kirakja a 7-szegmensesre.',
    blocks: [
      {
        instanceId: 'p4_ldi_a',
        blockType: 'LDI',
        params: { reg: 'A', imm: 0 },
      },
      {
        instanceId: 'p4_ldi_b',
        blockType: 'LDI',
        params: { reg: 'B', imm: 1 },
      },
      {
        instanceId: 'p4_ldi_c',
        blockType: 'LDI',
        params: { reg: 'C', imm: 128 }, // 0x80
      },
      {
        instanceId: 'p4_str_a',
        blockType: 'STR',
        params: { dst: 'C', src: 'A' },
      },
      {
        instanceId: 'p4_inc_c1',
        blockType: 'INC',
        params: { reg: 'C' },
      },
      {
        instanceId: 'p4_str_b',
        blockType: 'STR',
        params: { dst: 'C', src: 'B' },
      },
      {
        instanceId: 'p4_inc_c2',
        blockType: 'INC',
        params: { reg: 'C' },
      },
      {
        instanceId: 'p4_lbl',
        blockType: 'LABEL',
        params: { name: 'fib_iter' },
      },
      {
        instanceId: 'p4_mov',
        blockType: 'MOV',
        params: { dst: 'D', src: 'A' },
      },
      {
        instanceId: 'p4_add',
        blockType: 'ADD',
        params: { dst: 'D', src: 'B' },
      },
      {
        instanceId: 'p4_jc',
        blockType: 'JC',
        params: { target: 'fib_vege' },
      },
      {
        instanceId: 'p4_out',
        blockType: 'OUT',
        params: { port: '3', reg: 'D' },
      },
      {
        instanceId: 'p4_str',
        blockType: 'STR',
        params: { dst: 'C', src: 'D' },
      },
      {
        instanceId: 'p4_inc_c3',
        blockType: 'INC',
        params: { reg: 'C' },
      },
      {
        instanceId: 'p4_mov_ab',
        blockType: 'MOV',
        params: { dst: 'A', src: 'B' },
      },
      {
        instanceId: 'p4_mov_bd',
        blockType: 'MOV',
        params: { dst: 'B', src: 'D' },
      },
      {
        instanceId: 'p4_jmp',
        blockType: 'JMP',
        params: { target: 'fib_iter' },
      },
      {
        instanceId: 'p4_lbl_end',
        blockType: 'LABEL',
        params: { name: 'fib_vege' },
      },
      {
        instanceId: 'p4_hlt',
        blockType: 'HLT',
        params: {},
      },
    ],
  },
  {
    id: 'preset_random_stream',
    title: 'Hardware Random Number & Matrix Visualizer',
    titleHu: 'Hardveres Véletlenszám & Mátrix Vizualizáló',
    category: 'Perifériák',
    categoryHu: 'Perifériák',
    description: 'Generates pseudo-random bytes into accumulator and streams to LED row and 7-segment display.',
    descriptionHu: '8 bites véletlenszámokat generál folyamatosan a LED sorra és a kijelzőre.',
    blocks: [
      {
        instanceId: 'p5_lbl',
        blockType: 'LABEL',
        params: { name: 'veletlen_ciklus' },
      },
      {
        instanceId: 'p5_rand',
        blockType: 'RAND',
        params: { reg: 'A' },
      },
      {
        instanceId: 'p5_out_leds',
        blockType: 'OUT',
        params: { port: '1', reg: 'A' },
      },
      {
        instanceId: 'p5_out_7seg',
        blockType: 'OUT',
        params: { port: '3', reg: 'A' },
      },
      {
        instanceId: 'p5_sleep',
        blockType: 'SLEEP',
        params: { cycles: 4 },
      },
      {
        instanceId: 'p5_jmp',
        blockType: 'JMP',
        params: { target: 'veletlen_ciklus' },
      },
    ],
  },
];
