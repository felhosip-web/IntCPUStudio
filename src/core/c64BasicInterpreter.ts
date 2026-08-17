import { BasicLine, C64State, C64TerminalLine, InterpreterStatus } from '../types/c64';
import { C64DiskFile, C64DiskImage } from '../types/c64Floppy';
import { sidAudio } from './c64Audio';
import { detokenizeBasic, generatePrgFromBasic } from './c64PrgParser';

export class C64BasicInterpreter {
  private state: C64State;
  private onStateChange?: (state: C64State) => void;
  private inputCallback?: (value: string) => void;
  private pendingInputVar: string | null = null;
  private isBreakRequested: boolean = false;
  private currentFloppyDisk: C64DiskImage | null = null;
  public onFloppyActivity?: (type: 'read' | 'write' | 'step', track?: number, sector?: number) => void;
  public onFloppySave?: (file: C64DiskFile) => void;
  public onFreezeTriggered?: () => void;
  public cpuSpeedMultiplier: number = 1;
  public isTurboCartridgeActive: boolean = false;
  public turboCartridgeName: string = 'The Final Cartridge III';

  constructor(initialState: C64State, onStateChange?: (state: C64State) => void) {
    this.state = initialState;
    this.onStateChange = onStateChange;
  }

  public setTurboSettings(active: boolean, speedMultiplier: number = 1, cartridgeName: string = 'The Final Cartridge III') {
    this.isTurboCartridgeActive = active;
    this.cpuSpeedMultiplier = speedMultiplier;
    this.turboCartridgeName = cartridgeName;
  }

  public setFloppyDisk(disk: C64DiskImage | null) {
    this.currentFloppyDisk = disk;
  }

  public getFloppyDisk(): C64DiskImage | null {
    return this.currentFloppyDisk;
  }

  public getState(): C64State {
    return this.state;
  }

  public setState(next: C64State) {
    this.state = next;
    this.onStateChange?.(this.state);
  }

  public requestBreak() {
    this.isBreakRequested = true;
    this.state.interpreterStatus = 'IDLE';
    this.state.currentRunningLine = null;
    this.printToTerminal('BREAK');
    this.printToTerminal('READY.');
    this.onStateChange?.(this.state);
  }

  // Add line to terminal buffer
  public printToTerminal(text: string, color?: number) {
    const textColor = color !== undefined ? color : this.state.textColor;
    this.state.terminalHistory = [
      ...this.state.terminalHistory,
      { text, textColor },
    ];
    // Keep reasonable history size (e.g. 500 lines)
    if (this.state.terminalHistory.length > 500) {
      this.state.terminalHistory = this.state.terminalHistory.slice(-400);
    }
    this.onStateChange?.(this.state);
  }

  // Clear terminal screen
  public clearScreen() {
    this.state.terminalHistory = [];
    this.onStateChange?.(this.state);
  }

  // Parse and execute a typed command line (either Direct command or Program Line)
  public handleCommand(rawInput: string) {
    const input = rawInput.trim();
    if (!input) return;

    // Save to command history
    this.state.commandHistory.push(input);
    this.state.historyIndex = this.state.commandHistory.length;

    // Check if input starts with a line number (e.g. "10 PRINT 'HELLO'")
    const lineNumMatch = input.match(/^(\d+)\s*(.*)$/);

    if (lineNumMatch) {
      const lineNum = parseInt(lineNumMatch[1], 10);
      const code = lineNumMatch[2].trim();

      if (code === '') {
        // Delete line (e.g. typing "10" deletes line 10)
        this.state.basicProgram.delete(lineNum);
      } else {
        // Store or replace line
        this.state.basicProgram.set(lineNum, code);
      }

      // Rebuild sorted program list
      this.syncProgramList();
      this.onStateChange?.(this.state);
      return;
    }

    // Direct mode execution (e.g. "RUN", "LIST", "PRINT 2+2", "POKE 53280, 0")
    this.executeDirectCommand(input);
  }

  public syncProgramList() {
    const lines: BasicLine[] = [];
    const sortedKeys = Array.from(this.state.basicProgram.keys()).sort((a, b) => a - b);
    for (const k of sortedKeys) {
      lines.push({ lineNumber: k, code: this.state.basicProgram.get(k) || '' });
    }
    this.state.programList = lines;
  }

  public loadProgram(code: string) {
    this.state.basicProgram.clear();
    const rawLines = code.split('\n');
    for (const line of rawLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const match = trimmed.match(/^(\d+)\s+(.*)$/);
      if (match) {
        const lineNum = parseInt(match[1], 10);
        this.state.basicProgram.set(lineNum, match[2]);
      }
    }
    this.syncProgramList();
    this.state.variables.clear();
    this.state.forLoops.clear();
    this.state.gosubStack = [];
    this.state.interpreterStatus = 'IDLE';
    this.state.currentRunningLine = null;
    this.onStateChange?.(this.state);
  }

  public getProgramText(): string {
    return this.state.programList
      .map((l) => `${l.lineNumber} ${l.code}`)
      .join('\n');
  }

  // Execute direct command in immediate mode
  private executeDirectCommand(command: string) {
    const upper = command.toUpperCase().trim();

    if (upper === 'RUN') {
      this.startRun();
      return;
    }

    if (upper === 'LIST' || upper.startsWith('LIST ')) {
      this.listProgram(upper);
      this.printToTerminal('READY.');
      return;
    }

    if (upper === 'NEW') {
      this.state.basicProgram.clear();
      this.syncProgramList();
      this.state.variables.clear();
      this.state.forLoops.clear();
      this.state.gosubStack = [];
      this.printToTerminal('READY.');
      return;
    }

    if (upper === 'CLR') {
      this.state.variables.clear();
      this.state.forLoops.clear();
      this.state.gosubStack = [];
      this.printToTerminal('READY.');
      return;
    }

    if (upper === 'CLS' || upper === 'CLEAR') {
      this.clearScreen();
      return;
    }

    if (upper === 'HELP') {
      this.printHelp();
      this.printToTerminal('READY.');
      return;
    }

    if (upper === 'SYS' || upper.startsWith('SYS ')) {
      const addrStr = upper.replace(/^SYS\s*/, '');
      const addr = this.evaluateExpression(addrStr);
      this.executeSys(typeof addr === 'number' ? addr : 49152);
      this.printToTerminal('READY.');
      return;
    }

    if (upper === 'DIRECTORY' || upper === 'CATALOG') {
      this.handleFloppyCatalog();
      return;
    }

    if (upper === 'LOAD' || upper.startsWith('LOAD')) {
      this.handleFloppyLoad(command);
      return;
    }

    if (upper === 'SAVE' || upper.startsWith('SAVE')) {
      this.handleFloppySave(command);
      return;
    }

    if (upper.startsWith('OPEN 15') || upper.startsWith('OPEN 1,8,15') || upper.startsWith('OPEN 15,8,15')) {
      this.handleFloppyDosCommand(command);
      return;
    }

    // Turbo Cartridge & DOS Wedge fast commands
    if (upper === 'FREEZE') {
      this.onFreezeTriggered?.();
      return;
    }

    if (upper === 'TURBO ON' || upper === 'TURBO') {
      this.isTurboCartridgeActive = true;
      this.printToTerminal(`[${this.turboCartridgeName.toUpperCase()} ACTIVE - FASTLOAD ON]`);
      this.printToTerminal('READY.');
      return;
    }

    if (upper === 'TURBO OFF' || upper === 'KILL') {
      this.isTurboCartridgeActive = false;
      this.printToTerminal('[TURBO CARTRIDGE DISABLED]');
      this.printToTerminal('READY.');
      return;
    }

    if (upper === '$' || upper === '←D') {
      // Instant DOS wedge directory listing
      this.handleFloppyCatalog();
      return;
    }

    if (upper.startsWith('←L') || upper.startsWith('!LOAD') || upper.startsWith('/')) {
      // Instant DOS wedge fastload
      const rawTarget = upper.replace(/^(←L|!LOAD|\/)\s*/i, '').replace(/["']/g, '').trim();
      this.handleFloppyLoad(rawTarget ? `LOAD "${rawTarget}",8,1` : `LOAD "*",8,1`);
      return;
    }

    // Direct single or multi statement execution (e.g. PRINT 1+1 : POKE 53280, 0)
    try {
      this.executeStatements(command, null);
      this.printToTerminal('READY.');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      this.printToTerminal(`?${errMsg.toUpperCase()} ERROR`);
      this.printToTerminal('READY.');
      sidAudio.playErrorBuzz();
    }
  }

  private printHelp() {
    this.printToTerminal('**** COMMODORE 64 BASIC V2 PARANCSOK ****');
    this.printToTerminal('RUN          - PROGRAM INDÍTÁSA');
    this.printToTerminal('LIST         - KÓDSOROK KILISTÁZÁSA');
    this.printToTerminal('NEW          - MEMÓRIA ÉS PROGRAM TÖRLÉSE');
    this.printToTerminal('POKE A, V    - MEMÓRIA/SZÍN ÍRÁSA (53280=KERET, 53281=HÁTTÉR)');
    this.printToTerminal('PEEK(A)      - MEMÓRIA CÍM OLVASÁSA');
    this.printToTerminal('PRINT / ?    - KIÍRÁS (PL. ? 2+2 VAGY ?"HELLO")');
    this.printToTerminal('SOUND F, D   - SID HANGSZINTETIZÁTOR LEJÁTSZÁSA');
    this.printToTerminal('SYS A        - GÉPI KÓDÚ RUTIN HÍVÁSA');
    this.printToTerminal('GOTO, IF/THEN, FOR/TO/NEXT, GOSUB/RETURN, INPUT');
  }

  private listProgram(cmd: string) {
    const parts = cmd.replace(/^LIST\s*/, '').split('-');
    let start = 0;
    let end = 65535;

    if (parts.length === 1 && parts[0] !== '') {
      start = parseInt(parts[0], 10);
      end = start;
    } else if (parts.length === 2) {
      if (parts[0] !== '') start = parseInt(parts[0], 10);
      if (parts[1] !== '') end = parseInt(parts[1], 10);
    }

    for (const item of this.state.programList) {
      if (item.lineNumber >= start && item.lineNumber <= end) {
        this.printToTerminal(`${item.lineNumber} ${item.code}`);
      }
    }
  }

  // Start program execution
  public startRun() {
    if (this.state.programList.length === 0) {
      this.printToTerminal('READY.');
      return;
    }

    this.isBreakRequested = false;
    this.state.variables.clear();
    this.state.forLoops.clear();
    this.state.gosubStack = [];
    this.state.interpreterStatus = 'RUNNING';
    this.state.currentRunningLine = this.state.programList[0]?.lineNumber ?? null;
    this.onStateChange?.(this.state);

    this.runStepLoop();
  }

  // Loop execution with cooperative yielding
  private runStepLoop() {
    let stepsCount = 0;
    const speedMult = Math.max(1, this.cpuSpeedMultiplier || 1);
    const maxStepsPerBatch = 40 * speedMult;

    const executeBatch = () => {
      if (this.state.interpreterStatus !== 'RUNNING' || this.isBreakRequested) {
        return;
      }

      while (
        this.state.interpreterStatus === 'RUNNING' &&
        this.state.currentRunningLine !== null &&
        stepsCount < maxStepsPerBatch &&
        !this.isBreakRequested
      ) {
        stepsCount++;
        const currentLineNum = this.state.currentRunningLine;
        const lineCode = this.state.basicProgram.get(currentLineNum);

        if (!lineCode) {
          // Finished program
          this.state.interpreterStatus = 'IDLE';
          this.state.currentRunningLine = null;
          this.printToTerminal('READY.');
          this.onStateChange?.(this.state);
          return;
        }

        try {
          const nextLine = this.executeStatements(lineCode, currentLineNum);

          const currentStatus = this.state.interpreterStatus as C64State['interpreterStatus'];
          if (currentStatus === 'WAITING_INPUT') {
            return; // Paused waiting for user input
          }

          if (nextLine !== undefined) {
            this.state.currentRunningLine = nextLine;
          } else {
            // Find next sequential line
            const currentIndex = this.state.programList.findIndex(
              (l) => l.lineNumber === currentLineNum
            );
            if (currentIndex >= 0 && currentIndex + 1 < this.state.programList.length) {
              this.state.currentRunningLine = this.state.programList[currentIndex + 1].lineNumber;
            } else {
              this.state.currentRunningLine = null;
              this.state.interpreterStatus = 'IDLE';
              this.printToTerminal('READY.');
              this.onStateChange?.(this.state);
              return;
            }
          }
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          this.printToTerminal(`?${errMsg.toUpperCase()} ERROR IN ${currentLineNum}`);
          this.printToTerminal('READY.');
          sidAudio.playErrorBuzz();
          this.state.interpreterStatus = 'IDLE';
          this.state.currentRunningLine = null;
          this.onStateChange?.(this.state);
          return;
        }
      }

      stepsCount = 0;
      if (this.state.interpreterStatus === 'RUNNING') {
        setTimeout(executeBatch, 4);
      }
    };

    setTimeout(executeBatch, 0);
  }

  // Provide input for waiting INPUT statement
  public provideInput(val: string) {
    if (this.state.interpreterStatus === 'WAITING_INPUT' && this.pendingInputVar) {
      const varName = this.pendingInputVar;
      this.pendingInputVar = null;

      if (varName.endsWith('$')) {
        this.state.variables.set(varName, val);
      } else {
        const num = parseFloat(val) || 0;
        this.state.variables.set(varName, num);
      }

      this.state.interpreterStatus = 'RUNNING';
      this.onStateChange?.(this.state);
      this.runStepLoop();
    }
  }

  // Execute statements in a line (statements separated by ':')
  private executeStatements(
    lineContent: string,
    currentLineNum: number | null
  ): number | undefined {
    // Split by ':' but ignore ':' inside string literals
    const statements = this.splitStatements(lineContent);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (!stmt) continue;

      const upper = stmt.toUpperCase();

      // REM (Comment)
      if (upper.startsWith('REM') || upper.startsWith("'")) {
        break; // Ignore rest of line
      }

      // PRINT or ?
      if (upper.startsWith('PRINT') || upper.startsWith('?')) {
        const exprPart = stmt.replace(/^(\?|PRINT\s*)/i, '');
        this.executePrint(exprPart);
        continue;
      }

      // GOTO <line>
      if (upper.startsWith('GOTO')) {
        const targetStr = stmt.replace(/^GOTO\s*/i, '').trim();
        const targetLine = parseInt(targetStr, 10);
        if (isNaN(targetLine)) throw new Error('SYNTAX');
        if (!this.state.basicProgram.has(targetLine)) throw new Error("UNDEF'D STATEMENT");
        return targetLine;
      }

      // GOSUB <line>
      if (upper.startsWith('GOSUB')) {
        const targetStr = stmt.replace(/^GOSUB\s*/i, '').trim();
        const targetLine = parseInt(targetStr, 10);
        if (isNaN(targetLine)) throw new Error('SYNTAX');
        if (!this.state.basicProgram.has(targetLine)) throw new Error("UNDEF'D STATEMENT");

        if (currentLineNum !== null) {
          this.state.gosubStack.push(currentLineNum);
        }
        return targetLine;
      }

      // RETURN
      if (upper === 'RETURN') {
        if (this.state.gosubStack.length === 0) throw new Error('RETURN WITHOUT GOSUB');
        const returnLine = this.state.gosubStack.pop()!;
        // Find line after returnLine
        const retIndex = this.state.programList.findIndex((l) => l.lineNumber === returnLine);
        if (retIndex >= 0 && retIndex + 1 < this.state.programList.length) {
          return this.state.programList[retIndex + 1].lineNumber;
        }
        return undefined;
      }

      // IF <condition> THEN <target / statement>
      if (upper.startsWith('IF ')) {
        const thenIndex = upper.indexOf(' THEN ');
        if (thenIndex === -1) throw new Error('SYNTAX');

        const condStr = stmt.substring(3, thenIndex).trim();
        const actionStr = stmt.substring(thenIndex + 6).trim();

        const condResult = this.evaluateCondition(condStr);
        if (condResult) {
          // If action is just a line number, it's an implicit GOTO
          const isNum = /^\d+$/.test(actionStr);
          if (isNum) {
            const targetLine = parseInt(actionStr, 10);
            if (!this.state.basicProgram.has(targetLine)) throw new Error("UNDEF'D STATEMENT");
            return targetLine;
          } else {
            // Execute rest of statement
            return this.executeStatements(actionStr, currentLineNum);
          }
        } else {
          // Condition false, skip remainder of line
          return undefined;
        }
      }

      // FOR <var> = <start> TO <end> [STEP <step>]
      if (upper.startsWith('FOR ')) {
        this.executeFor(stmt, currentLineNum);
        continue;
      }

      // NEXT [<var>]
      if (upper.startsWith('NEXT')) {
        const nextVar = stmt.replace(/^NEXT\s*/i, '').trim().toUpperCase();
        const jumpLine = this.executeNext(nextVar);
        if (jumpLine !== undefined) {
          return jumpLine;
        }
        continue;
      }

      // INPUT ["prompt";] <var>
      if (upper.startsWith('INPUT')) {
        this.executeInput(stmt);
        return undefined;
      }

      // POKE <address>, <value>
      if (upper.startsWith('POKE ')) {
        const argsStr = stmt.substring(5).trim();
        const parts = argsStr.split(',');
        if (parts.length !== 2) throw new Error('SYNTAX');

        const addr = Math.floor(Number(this.evaluateExpression(parts[0])));
        const val = Math.floor(Number(this.evaluateExpression(parts[1]))) & 0xff;

        if (addr >= 0 && addr < 65536) {
          this.state.memory[addr] = val;

          // Special VIC-II memory addresses
          if (addr === 53280 || addr === 0xd020) {
            this.state.borderColor = val & 0x0f;
          } else if (addr === 53281 || addr === 0xd021) {
            this.state.backgroundColor = val & 0x0f;
          } else if (addr === 646) {
            this.state.textColor = val & 0x0f;
          }
        }
        continue;
      }

      // SOUND <freq>, <duration>, [waveform]
      if (upper.startsWith('SOUND')) {
        const argsStr = stmt.replace(/^SOUND\s*/i, '').trim();
        const parts = argsStr.split(',');
        const freq = parts[0] ? Number(this.evaluateExpression(parts[0])) : 440;
        const dur = parts[1] ? Number(this.evaluateExpression(parts[1])) / 1000 : 0.2;
        sidAudio.playTone(freq, Math.max(0.05, dur), 'square', 0.3);
        continue;
      }

      // COLOR <border>, <bg>
      if (upper.startsWith('COLOR')) {
        const argsStr = stmt.replace(/^COLOR\s*/i, '').trim();
        const parts = argsStr.split(',');
        if (parts[0]) this.state.borderColor = Number(this.evaluateExpression(parts[0])) & 0x0f;
        if (parts[1]) this.state.backgroundColor = Number(this.evaluateExpression(parts[1])) & 0x0f;
        continue;
      }

      // SYS <address>
      if (upper.startsWith('SYS')) {
        const addrStr = stmt.replace(/^SYS\s*/i, '').trim();
        const addr = this.evaluateExpression(addrStr);
        this.executeSys(typeof addr === 'number' ? addr : 49152);
        continue;
      }

      // END / STOP
      if (upper === 'END' || upper === 'STOP') {
        this.state.interpreterStatus = 'IDLE';
        this.state.currentRunningLine = null;
        this.printToTerminal('READY.');
        return undefined;
      }

      // LET or direct variable assignment (e.g. LET A = 10 or A$ = "HI" or X = X + 1)
      const assignStmt = stmt.replace(/^LET\s+/i, '');
      const eqIdx = assignStmt.indexOf('=');
      if (eqIdx > 0) {
        const varName = assignStmt.substring(0, eqIdx).trim().toUpperCase();
        const valExpr = assignStmt.substring(eqIdx + 1).trim();
        const evalVal = this.evaluateExpression(valExpr);
        this.state.variables.set(varName, evalVal);
        continue;
      }

      throw new Error('SYNTAX');
    }

    return undefined;
  }

  // Execute PRINT statement
  private executePrint(expr: string) {
    if (!expr || expr.trim() === '') {
      this.printToTerminal('');
      return;
    }

    // Process tokens separated by ; or ,
    const tokens = this.tokenizePrint(expr);
    let outputLine = '';

    for (const token of tokens) {
      if (token === ';') {
        // Concatenate without spacing
        continue;
      }
      if (token === ',') {
        // Tab zone (10 chars width)
        const padLen = 10 - (outputLine.length % 10);
        outputLine += ' '.repeat(padLen || 10);
        continue;
      }

      const val = this.evaluateExpression(token);
      outputLine += String(val);
    }

    this.printToTerminal(outputLine);
  }

  // Tokenize print expressions preserving strings and separators
  private tokenizePrint(expr: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];
      if (char === '"') {
        inQuotes = !inQuotes;
        current += char;
      } else if ((char === ';' || char === ',') && !inQuotes) {
        if (current.trim()) tokens.push(current.trim());
        tokens.push(char);
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) tokens.push(current.trim());
    return tokens;
  }

  // Evaluate expressions (arithmetic, variables, string concatenation, CHR$, RND, PEEK)
  private evaluateExpression(expr: string): number | string {
    const trimmed = expr.trim();
    if (!trimmed) return 0;

    // String literal in double quotes
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return trimmed.slice(1, -1);
    }

    // Check CHR$(n)
    const chrMatch = trimmed.match(/^CHR\$\s*\((.+)\)$/i);
    if (chrMatch) {
      const codeVal = Number(this.evaluateExpression(chrMatch[1]));
      // In C64 PETSCII: 205 is ╲ and 206 is ╱ (iconic maze)
      if (Math.floor(codeVal) === 205) return '╲';
      if (Math.floor(codeVal) === 206) return '╱';
      return String.fromCharCode(Math.floor(codeVal));
    }

    // Check PEEK(n)
    const peekMatch = trimmed.match(/^PEEK\s*\((.+)\)$/i);
    if (peekMatch) {
      const addr = Math.floor(Number(this.evaluateExpression(peekMatch[1])));
      if (addr >= 0 && addr < 65536) {
        return this.state.memory[addr];
      }
      return 0;
    }

    // Check RND(n)
    if (/^RND\s*\(.*\)$/i.test(trimmed)) {
      return Math.random();
    }

    // Check INT(n)
    const intMatch = trimmed.match(/^INT\s*\((.+)\)$/i);
    if (intMatch) {
      return Math.floor(Number(this.evaluateExpression(intMatch[1])));
    }

    // Check ABS(n)
    const absMatch = trimmed.match(/^ABS\s*\((.+)\)$/i);
    if (absMatch) {
      return Math.abs(Number(this.evaluateExpression(absMatch[1])));
    }

    // Check SQR(n)
    const sqrMatch = trimmed.match(/^SQR\s*\((.+)\)$/i);
    if (sqrMatch) {
      return Math.sqrt(Number(this.evaluateExpression(sqrMatch[1])));
    }

    // Check STR$(n)
    const strMatch = trimmed.match(/^STR\$\s*\((.+)\)$/i);
    if (strMatch) {
      return String(this.evaluateExpression(strMatch[1]));
    }

    // Check LEN(s$)
    const lenMatch = trimmed.match(/^LEN\s*\((.+)\)$/i);
    if (lenMatch) {
      return String(this.evaluateExpression(lenMatch[1])).length;
    }

    // Check if it's a known variable
    const upper = trimmed.toUpperCase();
    if (this.state.variables.has(upper)) {
      return this.state.variables.get(upper)!;
    }

    // Basic arithmetic evaluation using safe evaluator
    try {
      let formula = trimmed;
      // Replace variables in formula
      this.state.variables.forEach((val, key) => {
        if (typeof val === 'number') {
          const regex = new RegExp(`\\b${key}\\b`, 'g');
          formula = formula.replace(regex, String(val));
        }
      });

      // Replace RND(1) with Math.random()
      formula = formula.replace(/RND\s*\([^)]*\)/gi, String(Math.random()));

      // Safe arithmetic calculation: allow digits, +, -, *, /, %, (, ), ., spaces
      if (/^[0-9+\-*/().\s%]+$/.test(formula)) {
        // eslint-disable-next-line no-new-func
        const result = Function(`"use strict"; return (${formula});`)();
        return typeof result === 'number' && !isNaN(result) ? result : 0;
      }
    } catch {
      // Fallback
    }

    const num = Number(trimmed);
    return isNaN(num) ? trimmed : num;
  }

  private evaluateCondition(cond: string): boolean {
    // Supports =, <>, <=, >=, <, >
    const ops = ['<=', '>=', '<>', '=', '<', '>'];
    for (const op of ops) {
      const idx = cond.indexOf(op);
      if (idx !== -1) {
        const leftExpr = cond.substring(0, idx).trim();
        const rightExpr = cond.substring(idx + op.length).trim();
        const left = this.evaluateExpression(leftExpr);
        const right = this.evaluateExpression(rightExpr);

        switch (op) {
          case '=':
            return left === right;
          case '<>':
            return left !== right;
          case '<=':
            return Number(left) <= Number(right);
          case '>=':
            return Number(left) >= Number(right);
          case '<':
            return Number(left) < Number(right);
          case '>':
            return Number(left) > Number(right);
        }
      }
    }
    return Boolean(this.evaluateExpression(cond));
  }

  private executeFor(stmt: string, currentLineNum: number | null) {
    // FOR I = 1 TO 10 [STEP 1]
    const match = stmt.match(/^FOR\s+([A-Z0-9]+)\s*=\s*(.+)\s+TO\s+(.+?)(?:\s+STEP\s+(.+))?$/i);
    if (!match) throw new Error('SYNTAX');

    const varName = match[1].toUpperCase();
    const startVal = Number(this.evaluateExpression(match[2]));
    const endVal = Number(this.evaluateExpression(match[3]));
    const stepVal = match[4] ? Number(this.evaluateExpression(match[4])) : 1;

    this.state.variables.set(varName, startVal);
    if (currentLineNum !== null) {
      this.state.forLoops.set(varName, {
        startVal,
        endVal,
        stepVal,
        targetLine: currentLineNum,
      });
    }
  }

  private executeNext(varName?: string): number | undefined {
    let targetVar = varName;
    if (!targetVar) {
      // Pick the last created FOR loop
      const keys = Array.from(this.state.forLoops.keys());
      if (keys.length > 0) targetVar = keys[keys.length - 1];
    }

    if (!targetVar || !this.state.forLoops.has(targetVar)) {
      throw new Error('NEXT WITHOUT FOR');
    }

    const loop = this.state.forLoops.get(targetVar)!;
    const currentVal = Number(this.state.variables.get(targetVar) || 0) + loop.stepVal;
    this.state.variables.set(targetVar, currentVal);

    const isRunning =
      loop.stepVal > 0 ? currentVal <= loop.endVal : currentVal >= loop.endVal;

    if (isRunning) {
      // Jump back to the line after FOR
      const forIndex = this.state.programList.findIndex(
        (l) => l.lineNumber === loop.targetLine
      );
      if (forIndex >= 0 && forIndex + 1 < this.state.programList.length) {
        return this.state.programList[forIndex + 1].lineNumber;
      }
      return loop.targetLine;
    } else {
      this.state.forLoops.delete(targetVar);
      return undefined;
    }
  }

  private executeInput(stmt: string) {
    // INPUT ["PROMPT";] VAR
    const match = stmt.match(/^INPUT\s*(?:"([^"]*)";)?\s*([A-Z0-9$]+)/i);
    if (!match) throw new Error('SYNTAX');

    const prompt = match[1] || '? ';
    const varName = match[2].toUpperCase();

    this.printToTerminal(prompt);
    this.state.interpreterStatus = 'WAITING_INPUT';
    this.pendingInputVar = varName;
    this.onStateChange?.(this.state);
  }

  private executeSys(address: number) {
    this.printToTerminal(`JSR $${address.toString(16).toUpperCase().padStart(4, '0')} (6502 ROUTINE EXECUTED)`);
    sidAudio.playArpeggio();
  }

  private handleFloppyCatalog() {
    if (!this.currentFloppyDisk) {
      this.printToTerminal('?DEVICE NOT PRESENT ERROR');
      this.printToTerminal('READY.');
      sidAudio.playErrorBuzz();
      return;
    }

    this.onFloppyActivity?.('step', 18, 0);
    sidAudio.playDriveStep(3);
    sidAudio.playDriveChatter(0.3);

    this.printToTerminal(`0 "${this.currentFloppyDisk.title}" ${this.currentFloppyDisk.diskId} ${this.currentFloppyDisk.dosType}`);
    for (const file of this.currentFloppyDisk.files) {
      const lock = file.isLocked ? '<' : ' ';
      const namePadded = `"${file.name}"`.padEnd(18, ' ');
      this.printToTerminal(`${file.sizeBlocks}   ${namePadded} ${file.type}${lock}`);
    }
    this.printToTerminal(`${this.currentFloppyDisk.freeBlocks} BLOCKS FREE.`);
    this.printToTerminal('READY.');
  }

  private handleFloppyLoad(rawCommand: string) {
    if (!this.currentFloppyDisk) {
      this.printToTerminal('SEARCHING FOR');
      this.printToTerminal('?DEVICE NOT PRESENT ERROR');
      this.printToTerminal('READY.');
      sidAudio.playErrorBuzz();
      return;
    }

    // Match LOAD "$",8 or LOAD "*",8 or LOAD "FILENAME",8
    const match = rawCommand.match(/^LOAD\s*(?:"([^"]*)")?(?:\s*,\s*(\d+))?(?:\s*,\s*(\d+))?/i);
    const fileName = match && match[1] !== undefined ? match[1].trim().toUpperCase() : '*';
    const device = match && match[2] ? parseInt(match[2], 10) : 8;

    if (device !== 8 && device !== 9 && device !== 10) {
      this.printToTerminal(`?DEVICE ${device} NOT PRESENT ERROR`);
      this.printToTerminal('READY.');
      sidAudio.playErrorBuzz();
      return;
    }

    // LOAD "$" (Directory load)
    if (fileName === '$') {
      this.printToTerminal('SEARCHING FOR $');
      this.onFloppyActivity?.('read', 18, 0);
      sidAudio.playDriveStep(4);
      sidAudio.playDriveChatter(0.4);

      // Load directory as BASIC lines (Commodore 64 standard directory mode)
      this.state.basicProgram.clear();
      this.state.basicProgram.set(0, `"${this.currentFloppyDisk.title}" ${this.currentFloppyDisk.diskId} ${this.currentFloppyDisk.dosType}`);
      let lineNum = 1;
      for (const file of this.currentFloppyDisk.files) {
        const lock = file.isLocked ? '<' : ' ';
        this.state.basicProgram.set(lineNum, `${file.sizeBlocks} "${file.name}" ${file.type}${lock}`);
        lineNum++;
      }
      this.state.basicProgram.set(lineNum, `${this.currentFloppyDisk.freeBlocks} BLOCKS FREE.`);
      this.syncProgramList();

      this.printToTerminal('LOADING');
      this.printToTerminal('READY.');
      return;
    }

    // Find requested file (or first PRG if "*")
    let targetFile: C64DiskFile | undefined;
    const diskFiles = this.currentFloppyDisk?.files || [];
    if (fileName === '*' || fileName === '') {
      targetFile = diskFiles.find((f) => f.type === 'PRG') || diskFiles[0];
    } else {
      targetFile = diskFiles.find(
        (f) => f.name.toUpperCase() === fileName || f.name.toUpperCase().startsWith(fileName)
      );
    }

    this.printToTerminal(`SEARCHING FOR ${fileName || '*'}`);

    if (!targetFile) {
      this.printToTerminal('?FILE NOT FOUND ERROR');
      this.printToTerminal('READY.');
      sidAudio.playErrorBuzz();
      return;
    }

    this.onFloppyActivity?.('read', targetFile.track || 1, targetFile.sector || 0);
    if (this.isTurboCartridgeActive) {
      sidAudio.playDriveStep(2);
      this.printToTerminal(`>>> FASTLOAD: "${targetFile.name}" (2-BIT IEC BURST) <<<`, 7);
    } else {
      sidAudio.playDriveStep(6);
      sidAudio.playDriveChatter(0.5);
      this.printToTerminal(`LOADING "${targetFile.name}"`);
    }

    if (targetFile.basicCode) {
      this.loadProgram(targetFile.basicCode);
    } else if (targetFile.data && targetFile.data.length >= 2) {
      // Decode PRG or load machine code
      const loadAddr = targetFile.loadAddress ?? (targetFile.data[0] | (targetFile.data[1] << 8));
      const payload = targetFile.data.subarray(2);

      if (loadAddr === 0x0801) {
        try {
          const decoded = detokenizeBasic(payload);
          if (decoded && decoded.trim().length > 0) {
            this.loadProgram(decoded);
          }
        } catch {
          // If detokenize fails, write directly into memory
        }
      }

      // Copy payload to C64 RAM at load address
      for (let i = 0; i < payload.length && loadAddr + i < 65536; i++) {
        this.state.memory[loadAddr + i] = payload[i];
      }
    }

    this.printToTerminal('READY.');
  }

  private handleFloppySave(rawCommand: string) {
    if (!this.currentFloppyDisk) {
      this.printToTerminal('?DEVICE NOT PRESENT ERROR');
      this.printToTerminal('READY.');
      sidAudio.playErrorBuzz();
      return;
    }

    if (this.currentFloppyDisk.isWriteProtected) {
      this.printToTerminal('?WRITE PROTECT ERROR');
      this.printToTerminal('READY.');
      sidAudio.playErrorBuzz();
      return;
    }

    const match = rawCommand.match(/^SAVE\s*(?:"([^"]*)")?(?:\s*,\s*(\d+))?/i);
    const fileName = match && match[1] ? match[1].trim().toUpperCase() : 'PROGRAM';

    const progText = this.getProgramText();
    if (!progText.trim()) {
      this.printToTerminal('?NO PROGRAM TO SAVE');
      this.printToTerminal('READY.');
      return;
    }

    this.printToTerminal(`SAVING "${fileName}"`);
    this.onFloppyActivity?.('write', 18, 1);
    sidAudio.playDriveStep(5);
    sidAudio.playDriveChatter(0.6);

    const prgBytes = generatePrgFromBasic(progText);
    const blocks = Math.ceil(prgBytes.length / 254) || 1;

    const savedFile: C64DiskFile = {
      id: 'file-' + Date.now(),
      name: fileName.slice(0, 16),
      type: 'PRG',
      sizeBlocks: blocks,
      data: prgBytes,
      loadAddress: 0x0801,
      basicCode: progText,
    };

    // Replace if existing or append
    const existingIdx = this.currentFloppyDisk.files.findIndex(
      (f) => f.name.toUpperCase() === fileName
    );

    if (existingIdx >= 0) {
      this.currentFloppyDisk.files[existingIdx] = savedFile;
    } else {
      this.currentFloppyDisk.files.push(savedFile);
      this.currentFloppyDisk.freeBlocks = Math.max(0, this.currentFloppyDisk.freeBlocks - blocks);
    }

    this.onFloppySave?.(savedFile);
    this.printToTerminal('OK');
    this.printToTerminal('READY.');
  }

  private handleFloppyDosCommand(command: string) {
    if (!this.currentFloppyDisk) {
      this.printToTerminal('?DEVICE NOT PRESENT ERROR');
      this.printToTerminal('READY.');
      return;
    }

    this.onFloppyActivity?.('read', 18, 0);
    sidAudio.playDriveStep(2);

    if (command.includes('"I"') || command.includes('"I0"') || command.includes('"I1"')) {
      this.printToTerminal('00, OK,00,00');
      this.printToTerminal('READY.');
      return;
    }

    if (command.includes('"N:') || command.includes('"N0:')) {
      this.printToTerminal('00, OK,00,00 (DISK INITIALIZED)');
      this.printToTerminal('READY.');
      return;
    }

    this.printToTerminal('00, OK,00,00');
    this.printToTerminal('READY.');
  }

  private splitStatements(line: string): string[] {
    const stmts: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') inQuotes = !inQuotes;
      if (char === ':' && !inQuotes) {
        stmts.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    if (current) stmts.push(current);
    return stmts;
  }
}
