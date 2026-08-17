import { SampleProgram } from '../types/cpu';

export const SAMPLE_PROGRAMS: SampleProgram[] = [
  {
    id: 'add-sub',
    title: 'Basic Arithmetic (ADD & SUB)',
    titleHu: 'Alapvető Aritmetika (ADD & SUB)',
    category: 'Kezdő',
    description: 'Load values into registers, perform additions, and monitor ALU and flag changes.',
    descriptionHu: 'Értékek betöltése regiszterekbe, összeadás, kivonás és a jelzőbitek (Zero, Carry) megfigyelése.',
    code: `; ==========================================
; 1. LEHETŐSÉG: Alapvető Aritmetikai Műveletek
; Figyeld az A, B, C regisztereket és a FLAG biteket!
; ==========================================

LDI A, 25      ; Töltsünk 25-öt az A regiszterbe
LDI B, 17      ; Töltsünk 17-et a B regiszterbe
ADD A, B       ; A = A + B (25 + 17 = 42)
OUT 3, A       ; Írjuk ki a 7-szegmenses kijelzőre

LDI C, 42      ; Töltsünk 42-t a C-be
CMP A, C       ; Hasonlítsuk össze: A == C ?
               ; -> Zero (Z) flag és Equal (E) flag aktív lesz!

SUB A, C       ; A = 42 - 42 = 0
               ; -> Zero (Z) flag 1 lesz!
OUT 1, A       ; LED-ek törlése (0)

HLT            ; Program leállítása
`,
    expectedOutcome: 'Accumulator reaches 42, display shows 42, then subtracts to 0 (Zero flag set).',
    expectedOutcomeHu: 'Az A regiszter értéke 42 lesz, a kijelzőn megjelenik a 42, majd 0-ra vált (aktív Z jelzőbit).',
  },
  {
    id: 'fibonacci',
    title: 'Fibonacci Sequence Generator',
    titleHu: 'Fibonacci-sorozat Generátor',
    category: 'Aritmetika',
    description: 'Generates Fibonacci numbers in a loop, storing each in RAM and updating the 7-segment display.',
    descriptionHu: 'Fibonacci számok generálása ciklusban, értékek mentése a memóriába és megjelenítés a kijelzőn.',
    code: `; ==========================================
; FIBONACCI SOROZAT SZÁMÍTÁSA
; 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233
; ==========================================

LDI A, 0       ; Első szám (Fib 0)
LDI B, 1       ; Második szám (Fib 1)
LDI C, 0x80    ; Memória kezdőcím az eredményeknek

; Első két tag mentése a memóriába
STR [C], A
INC C
STR [C], B
INC C

fib_loop:
  MOV D, A     ; D = A mentése
  ADD D, B     ; D = A + B (új Fibonacci szám)
  JC fib_done  ; Ha túlcsordul (Carry = 1 > 255), vége

  STR [C], D   ; Új szám mentése RAM[C]-be
  INC C        ; Memóriacím mutató léptetése

  OUT 3, D     ; Kiírás a 7-szegmenses kijelzőre
  OUT 1, D     ; Kiírás az 8 bites LED sorra

  MOV A, B     ; A léptetése az előző B-re
  MOV B, D     ; B léptetése az új D eredményre

  SLEEP 2      ; Kis szünet az animáció kedvéért
  JMP fib_loop ; Következő ciklus lépés

fib_done:
  HLT          ; Számítás kész
`,
    expectedOutcome: 'Generates Fibonacci sequence up to 233, visible on 7-segment display and RAM from address 0x80.',
    expectedOutcomeHu: 'Fibonacci sorozat generálása 233-ig, látható a 7-szegmenses kijelzőn és a 0x80 memóriacímtől.',
  },
  {
    id: 'led-chaser',
    title: 'LED Bit Chaser & Rotation',
    titleHu: 'LED Futófény és Bit Léptetés (SHL)',
    category: 'I/O és Kijelző',
    description: 'Rotates a single glowing bit through the 8-bit LED array using SHL and Carry detection.',
    descriptionHu: 'Egyetlen bit léptetése a 8 LED-en körbe balra a balra tolás (SHL) és Carry segítségével.',
    code: `; ==========================================
; LED FUTÓFÉNY (BIT CHASER)
; 8 bites LED port animálása SHL művelettel
; ==========================================

start:
  LDI A, 1     ; Kezdőérték: 00000001 (első LED)

shift_loop:
  OUT 1, A     ; Írjuk ki a LED portra (Port 1)
  SLEEP 1      ; Várakozás
  SHL A        ; Léptetés balra 1 bittel (00000010, stb.)
  JNC shift_loop ; Ha még nem esett ki a bit a Carry-be, folytassuk

  ; Ha Carry = 1 (túlcsordult a 8. bitről), kezdjük újra
  JMP start
`,
    expectedOutcome: 'A light pulse moves continuously across the 8 LEDs.',
    expectedOutcomeHu: 'Egy fénycsík folyamatosan végigfut a 8 LED-en körbe-körbe.',
  },
  {
    id: 'multiplication',
    title: 'Multiplication by Repeated Addition',
    titleHu: 'Szorzás Ismételt Összeadással',
    category: 'Aritmetika',
    description: 'Multiplies 6 x 7 = 42 using an iterative loop with loop counters and conditional jumps.',
    descriptionHu: 'Két szám (pl. 6 x 7 = 42) összeszorzása ismételt összeadási ciklussal és számlálóval.',
    code: `; ==========================================
; SZORZÁS ISMÉTELT ÖSSZEADÁSSAL (6 * 7)
; Eredmény: 42
; ==========================================

LDI A, 0       ; Eredmény akkumulátor = 0
LDI B, 6       ; Első tényező (ezt adjuk hozzá)
LDI C, 7       ; Második tényező (ciklusszámláló)

mult_loop:
  CMP C, 0     ; Elfogyott a számláló?
  JZ mult_done ; Ha C == 0, kész vagyunk!

  ADD A, B     ; Eredmény növelése: A += B
  DEC C        ; Számláló csökkentése: C--
  OUT 3, A     ; Részeredmény kijelzése
  JMP mult_loop

mult_done:
  OUT 3, A     ; Végeredmény (42) a kijelzőre
  OUT 1, A     ; LED-ekre is
  HLT
`,
    expectedOutcome: 'Accumulator calculates 42 and displays it on 7-segment.',
    expectedOutcomeHu: 'Az akkumulátor lépésről lépésre kiszámolja a 42-t és megjeleníti.',
  },
  {
    id: 'terminal-string',
    title: 'Print String to ASCII Terminal',
    titleHu: 'Karakterlánc Kiírás Terminálra (TTY)',
    category: 'I/O és Kijelző',
    description: 'Reads null-terminated characters from memory using indirect pointer [B] and streams to terminal.',
    descriptionHu: 'Nullával lezárt szöveg beolvasása a memóriából indirekt címzéssel és kiírása az ASCII konzolra.',
    code: `; ==========================================
; SZÖVEG KIÍRÁSA A TERMINÁLRA
; Indirekt memóriacímzés: LDR A, [B]
; ==========================================

LDI B, msg     ; B regiszter rááll a szöveg kezdőcímére

print_loop:
  LDR A, [B]   ; A = RAM[B] (karakter beolvasása)
  CMP A, 0     ; Null-terminátor elérése? (szöveg vége)
  JZ print_done

  OUT 2, A     ; Karakter küldése a Terminál portra (Port 2)
  INC B        ; Következő karakter címe
  SLEEP 1      ; Gépelés effektus
  JMP print_loop

print_done:
  HLT

; Szöveg eltárolása a memóriában (null-terminated)
msg:
  STRING "Hello CPU Vilag!\\nSzimulacio aktiv.\\n"
`,
    expectedOutcome: 'Streams the string "Hello CPU Vilag!\nSzimulacio aktiv.\n" into the ASCII terminal.',
    expectedOutcomeHu: 'A szöveg betűnként megjelenik az ASCII terminál ablakban.',
  },
  {
    id: 'branching-interactive',
    title: 'Interactive DIP Switch Reader',
    titleHu: 'Interaktív DIP Kapcsoló Olvasó',
    category: 'Haladó & Algoritmusok',
    description: 'Reads 8-bit DIP switches in real-time, displays binary state on LEDs and value on 7-segment.',
    descriptionHu: 'Valós időben beolvassa a DIP kapcsolók állapotát az IN utasítással és megjeleníti.',
    code: `; ==========================================
; INTERAKTÍV DIP KAPCSOLÓ BEOLVASÁS
; Próbáld átkapcsolni a kapcsolókat a panelen!
; ==========================================

loop:
  IN A, 0      ; Olvassuk be a 0-s portról (DIP kapcsolók)
  OUT 1, A     ; Tükrözzük a LED-ekre
  OUT 3, A     ; Írjuk ki decimálisan a kijelzőre

  ; Ha az érték páros (bit 0 == 0), sípoljon egyet!
  MOV B, A
  ANDI B, 1
  CMP B, 0
  JNZ no_beep

  OUTI 4, 1    ; Sípoló aktiválása (Port 4)

no_beep:
  SLEEP 1
  JMP loop
`,
    expectedOutcome: 'Reflects DIP switches onto LEDs and displays current value.',
    expectedOutcomeHu: 'A DIP kapcsolók átbillentése azonnal tükröződik a LED-eken és a 7-szegmensen.',
  },
  {
    id: 'stack-subroutine',
    title: 'Stack & Subroutine (CALL & RET)',
    titleHu: 'Verem és Alprogram Hívás (CALL & RET)',
    category: 'Haladó & Algoritmusok',
    description: 'Demonstrates stack push/pop and subroutine calls that double a number.',
    descriptionHu: 'Alprogram hívás veremre mentett visszatérési címmel és regisztermentéssel.',
    code: `; ==========================================
; VEREM (STACK) ÉS ALPROGRAM (CALL / RET)
; Figyeld az SP (Stack Pointer) regiszter változását!
; ==========================================

LDI A, 15      ; Kezdőérték
CALL double_it ; Függvényhívás: megduplázza A-t
OUT 3, A       ; Kijelzés: 30

LDI A, 50
CALL double_it ; Második hívás
OUT 3, A       ; Kijelzés: 100

HLT

; --- ALPROGRAM DEFINÍCIÓ ---
double_it:
  PUSH B       ; Mentsük el a B regisztert a verembe!
  MOV B, A
  ADD A, B     ; A = A + A (duplázás)
  POP B        ; Állítsuk vissza az eredeti B-t a veremből!
  RET          ; Visszatérés a hívás helyére
`,
    expectedOutcome: 'SP decrements on CALL and PUSH, increments on POP and RET. Values 30 and 100 displayed.',
    expectedOutcomeHu: 'A Stack Pointer (SP) változik híváskor és visszatéréskor. Az A értéke 30 majd 100 lesz.',
  },
  {
    id: 'matrix-animation',
    title: '8x8 LED Matrix Graphic Display',
    titleHu: '8x8 Grafikus LED Mátrix Rajzolás',
    category: 'I/O és Kijelző',
    description: 'Sends custom bitmap pattern row-by-row to the 8x8 LED Matrix display (Port 5).',
    descriptionHu: 'Egyéni grafikus pixelminta (smiley és szív) kirajzolása soronként a 8x8 LED mátrixra.',
    code: `; ==========================================
; 8x8 GRAFIKUS LED MÁTRIX VEZÉRLÉS (Port 5)
; 8 sor bájtjának kiküldése
; ==========================================

main:
  LDI C, 0     ; Sor index (0..7)
  LDI B, smile_data ; Adat kezdőcíme

draw_loop:
  LDR A, [B]   ; Sor bitmintája
  OUT 5, A     ; Küldés az 8x8 mátrixra (Port 5 automatikusan tárolja)
  INC B
  INC C
  CMP C, 8
  JL draw_loop

  SLEEP 5
  HLT

; 8 bájtos smiley minta
smile_data:
  DB 0b00111100   ;   ****   
  DB 0b01000010   ;  *    *  
  DB 0b10100101   ; * *  * * (szemek)
  DB 0b10000001   ; *      * 
  DB 0b10100101   ; * *  * * 
  DB 0b10011001   ; *  **  * (mosoly)
  DB 0b01000010   ;  *    *  
  DB 0b00111100   ;   ****   
`,
    expectedOutcome: 'Draws a classic smiley icon onto the 8x8 LED Matrix display.',
    expectedOutcomeHu: 'Egy klasszikus mosolygós arc ikon jelenik meg a 8x8 LED mátrix kijelzőn.',
  },
];
