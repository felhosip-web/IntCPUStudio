import { C64SampleProgram } from '../types/c64';

export const C64_SAMPLE_PROGRAMS: C64SampleProgram[] = [
  {
    id: 'c64-maze',
    title: '10 PRINT CHR$(205.5+RND(1)); (Legendary Maze)',
    titleHu: '10 PRINT CHR$(205.5+RND(1)); (A Legendás Labirintus)',
    category: 'Graphics / Demo',
    description: 'The iconic 1-line Commodore 64 endless labyrinth generator using PETSCII diagonal slashes.',
    descriptionHu: 'A legendás egysoros Commodore 64 labirintus generátor átlós PETSCII karakterekkel.',
    basicCode: `10 PRINT CHR$(205.5+RND(1));
20 GOTO 10`,
  },
  {
    id: 'c64-guessing-game',
    title: 'Hi-Lo Number Guessing Game',
    titleHu: 'Számkitalálós Játék (1-100)',
    category: 'Game',
    description: 'Interactive guessing game with sound effects, attempt counter, and hints.',
    descriptionHu: 'Interaktív számkitaláló játék beépített SID hanghatásokkal, próbálkozásszámlálóval és tippekkel.',
    basicCode: `10 REM *** COMMODORE 64 SZAMKITALALO JATEK ***
20 PRINT "GONDOLTAM EGY SZAMRA 1 ES 100 KOZOTT!"
30 T = INT(RND(1)*100) + 1
40 C = 0
50 C = C + 1
60 INPUT "A TIPPED"; G
70 IF G = T THEN GOTO 130
80 IF G < T THEN GOTO 110
90 PRINT "A SZAM KISEBB! PROBALD UJRA."
100 SOUND 220, 100: GOTO 50
110 PRINT "A SZAM NAGYOBB! PROBALD UJRA."
120 SOUND 440, 100: GOTO 50
130 PRINT "GRATULALOK! ELTALALTAD "; C; " PROBALKOZASBOL!"
140 SOUND 523, 100: SOUND 659, 100: SOUND 783, 200
150 END`,
  },
  {
    id: 'c64-sid-arpeggio',
    title: 'SID Chip 3-Voice Arpeggiator & Music Demo',
    titleHu: 'SID Zenei Arpeggio & Szintetizátor Demo',
    category: 'Sound / Music',
    description: 'Demonstrates the SID 6581 sound synthesizer playing musical chords and scale runs.',
    descriptionHu: 'A SID 6581 hangchip 3-szólamú arpeggio és zenei skála lejátszásának bemutatása.',
    basicCode: `10 REM *** COMMODORE 64 SID ZENEI SKALA ***
20 PRINT "SID 6581 HANGSZINTETIZATOR AKTIV..."
30 FOR F = 200 TO 800 STEP 50
40 PRINT "FREKVENCIA: "; F; " HZ"
50 SOUND F, 80
60 NEXT F
70 FOR F = 800 TO 200 STEP -50
80 SOUND F, 60
90 NEXT F
100 PRINT "AKKORD JELZES:"
110 SOUND 261, 120: SOUND 329, 120: SOUND 392, 120: SOUND 523, 250
120 PRINT "KESZ."
130 END`,
  },
  {
    id: 'c64-rainbow-raster',
    title: 'Rainbow Border & Screen Color Cycle',
    titleHu: 'Szivárvány Keret és Képernyő Ciklus',
    category: 'VIC-II Video',
    description: 'Rapidly cycles the VIC-II border (53280) and background (53281) colors in a loop.',
    descriptionHu: 'A VIC-II videochip keret és háttérregisztereinek villámgyors szivárvány ciklikus váltása.',
    basicCode: `10 REM *** VIC-II SZIVARVANY SZINCIKLUS ***
20 PRINT "VIC-II SZINCIKLUS INDITASA..."
30 FOR K = 1 TO 50
40 C = INT(RND(1)*16)
50 POKE 53280, C
60 POKE 53281, 15 - C
70 PRINT "KERET SZIN: "; C
80 NEXT K
90 POKE 53280, 14: POKE 53281, 6
100 PRINT "ALAPALLAPOT VISSZAALLITVA (KERET=14, HATTER=6)"
110 END`,
  },
  {
    id: 'c64-6502-machine-loader',
    title: '6502 Machine Code Loader (DATA/POKE & SYS)',
    titleHu: 'MOS 6502 Gépi Kód Betöltő (DATA/POKE & SYS)',
    category: 'Assembly / Low-level',
    description: 'Pokes 6502 machine language bytes into memory address $C000 and executes with SYS 49152.',
    descriptionHu: '6502 gépi kódú bájtok beírása a $C000 (49152) memóriacímre és futtatása a SYS paranccsal.',
    basicCode: `10 REM *** 6502 GEPI KOD BETOLTO ***
20 PRINT "GEPI KOD BETOLTESE A $C000 CIMRE..."
30 POKE 49152, 169: REM LDA #$01 (White)
40 POKE 49153, 1
50 POKE 49154, 141: REM STA $D020 (Border Color)
60 POKE 49155, 32
70 POKE 49156, 208
80 POKE 49157, 96:  REM RTS
90 PRINT "6502 RUTIN KESZEN ALL A $C000 CIMEN!"
100 PRINT "FUTTATAS SYS 49152 PARANCCSAL..."
110 SYS 49152
120 PRINT "SIKERESEN VEGREHAJTVA!"
130 END`,
  },
  {
    id: 'c64-petscii-banner',
    title: 'Commodore 64 PETSCII Banner & Graphics',
    titleHu: 'Commodore 64 PETSCII Banner & Grafika',
    category: 'Graphics',
    description: 'Renders the classic Commodore 64 welcome logo and screen banner.',
    descriptionHu: 'Kirajzolja a klasszikus Commodore 64 üdvözlő emblémát és grafikus fejlécet.',
    basicCode: `10 REM *** COMMODORE 64 LOGO & BANNER ***
20 PRINT "****************************************"
30 PRINT "*      COMMODORE 64 BASIC V2 PRO       *"
40 PRINT "*   64K RAM SYSTEM  38911 BYTES FREE   *"
50 PRINT "****************************************"
60 PRINT ""
70 FOR I = 1 TO 10
80 PRINT "  [C64] ";
90 FOR J = 1 TO 5: PRINT "█▓▒░";: NEXT J
100 PRINT ""
110 NEXT I
120 PRINT ""
130 PRINT "READY."
140 END`,
  },
  {
    id: 'c64-fibonacci',
    title: 'Fibonacci Sequence Generator',
    titleHu: 'Fibonacci Számsorozat Számító',
    category: 'Math',
    description: 'Calculates and formats Fibonacci numbers in Commodore BASIC.',
    descriptionHu: 'Kiszámítja és formázottan megjeleníti a Fibonacci számsorozatot.',
    basicCode: `10 REM *** FIBONACCI SOROZAT ***
20 PRINT "FIBONACCI SZAMSOROZAT GENERATOR (C64):"
30 A = 0: B = 1
40 PRINT A; ", "; B;
50 FOR I = 1 TO 15
60 C = A + B
70 PRINT ", "; C;
80 A = B: B = C
90 NEXT I
100 PRINT ""
110 PRINT "FIBONACCI GENERÁLÁS KÉSZ!"
120 END`,
  },
];
