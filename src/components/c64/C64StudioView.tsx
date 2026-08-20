import React, { useEffect, useRef, useState } from 'react';
import { C64State } from '../../types/c64';
import { C64DiskFile, C64DiskImage, C64DriveState } from '../../types/c64Floppy';
import { TurboCartridgeState } from '../../types/c64TurboCartridge';
import { TURBO_CARTRIDGE_MODELS } from '../../core/c64TurboCartridgeData';
import { C64BasicInterpreter } from '../../core/c64BasicInterpreter';
import { createInitial6502State } from '../../core/mos6502Emulator';
import { C64Screen } from './C64Screen';
import { C64ProgramEditor } from './C64ProgramEditor';
import { C64CpuMonitor } from './C64CpuMonitor';
import { C64MemoryInspector } from './C64MemoryInspector';
import { C64SidSynthesizer } from './C64SidSynthesizer';
import { C64FloppyDrive } from './C64FloppyDrive';
import { C64ArchitectureSchematic } from './C64ArchitectureSchematic';
import { C64TurboCartridgeStudio } from './C64TurboCartridgeStudio';
import { CURATED_C64_DISKS } from '../../core/c64CuratedSoftware';
import { generatePrgFromBasic } from '../../core/c64PrgParser';
import { useI18n } from '../../i18n/I18nContext';
import { sidAudio } from '../../core/c64Audio';
import {
  BookOpen,
  Code2,
  Cpu,
  Disc,
  Flame,
  HardDrive,
  Layers,
  Monitor,
  Music,
  Terminal,
  Zap,
} from 'lucide-react';

function createInitialC64State(): C64State {
  const memory = new Uint8Array(65536);
  // Default values in C64 memory
  memory[53280] = 14; // Border color Light Blue
  memory[53281] = 6;  // Background color Blue
  memory[646] = 14;   // Text color Light Blue

  const terminalHistory = [
    { text: '    **** COMMODORE 64 BASIC V2 ****', textColor: 14 },
    { text: ' 64K RAM SYSTEM  38911 BASIC BYTES FREE', textColor: 14 },
    { text: '', textColor: 14 },
    { text: 'READY.', textColor: 14 },
  ];

  return {
    memory,
    cpu: createInitial6502State(),
    borderColor: 14,
    backgroundColor: 6,
    textColor: 14,
    cursorX: 0,
    cursorY: 3,
    cursorVisible: true,
    basicProgram: new Map(),
    programList: [],
    interpreterStatus: 'IDLE',
    currentRunningLine: null,
    outputBuffer: [],
    terminalHistory,
    commandHistory: [],
    historyIndex: -1,
    variables: new Map(),
    forLoops: new Map(),
    gosubStack: [],
    cycleCount: 0,
  };
}

export const C64StudioView: React.FC = () => {
  const { language } = useI18n();
  const [c64State, setC64State] = useState<C64State>(() => createInitialC64State());
  const [activeTab, setActiveTab] = useState<'editor' | 'floppy' | 'cpu' | 'memory' | 'sid' | 'schematic' | 'turbo'>('turbo');
  const [isMemoryExpanded, setIsMemoryExpanded] = useState<boolean>(false);
  const [turboState, setTurboState] = useState<TurboCartridgeState>(() => ({
    isEnabled: true,
    activeModel: 'FINAL_CARTRIDGE_3',
    isFrozen: false,
    cpuSpeedMultiplier: 1,
    fastloaderActive: true,
    dosWedgeActive: true,
    freezeTab: 'monitor',
    activePokes: [],
    snapshotName: 'SNAPSHOT.PRG',
  }));
  const [driveState, setDriveState] = useState<C64DriveState>(() => ({
    driveNumber: 8,
    isInserted: true,
    disk: CURATED_C64_DISKS?.[0] || null,
    isMotorRunning: false,
    isLedGreen: true,
    isLedRed: false,
    currentTrack: 18,
    currentSector: 0,
    statusMessage: '00, OK,00,00',
    statusCode: 0,
    isSoundEnabled: true,
    lastOperation: 'IDLE',
  }));

  const interpreterRef = useRef<C64BasicInterpreter | null>(null);

  if (!interpreterRef.current) {
    interpreterRef.current = new C64BasicInterpreter(c64State, (next) => {
      setC64State({ ...next });
    });
    interpreterRef.current.setFloppyDisk(driveState.disk);
    interpreterRef.current.setTurboSettings(
      turboState.isEnabled,
      turboState.cpuSpeedMultiplier,
      TURBO_CARTRIDGE_MODELS[turboState.activeModel]?.name || 'Turbo Cartridge'
    );
    interpreterRef.current.onFreezeTriggered = () => {
      setTurboState((prev) => ({ ...prev, isFrozen: true }));
      setActiveTab('turbo');
      sidAudio.playBootJingle();
    };
    interpreterRef.current.onFloppyActivity = (type, track = 18, sector = 0) => {
      setDriveState((prev) => ({
        ...prev,
        isLedRed: true,
        currentTrack: track,
        currentSector: sector,
        lastOperation: type.toUpperCase(),
      }));
      setTimeout(() => {
        setDriveState((prev) => ({ ...prev, isLedRed: false }));
      }, 350);
    };
  }

  // Keep interpreter synced with inserted floppy disk and turbo cartridge state
  useEffect(() => {
    if (interpreterRef.current) {
      interpreterRef.current.setFloppyDisk(driveState.disk);
      interpreterRef.current.setTurboSettings(
        turboState.isEnabled,
        turboState.cpuSpeedMultiplier,
        TURBO_CARTRIDGE_MODELS[turboState.activeModel]?.name || 'Turbo Cartridge'
      );
    }
  }, [driveState.disk, turboState.isEnabled, turboState.cpuSpeedMultiplier, turboState.activeModel]);

  // Handle command submission from screen
  const handleSendCommand = (cmd: string) => {
    if (!interpreterRef.current) return;

    if (c64State.interpreterStatus === 'WAITING_INPUT') {
      interpreterRef.current.printToTerminal(cmd);
      interpreterRef.current.provideInput(cmd);
    } else {
      interpreterRef.current.printToTerminal(cmd);
      interpreterRef.current.handleCommand(cmd);
    }
  };

  const handleBreak = () => {
    interpreterRef.current?.requestBreak();
  };

  const handleClearScreen = () => {
    interpreterRef.current?.clearScreen();
  };

  const handleResetC64 = () => {
    sidAudio.playBootJingle();
    const fresh = createInitialC64State();
    interpreterRef.current?.setState(fresh);
    setC64State(fresh);
  };

  const handleLoadProgram = (code: string) => {
    interpreterRef.current?.loadProgram(code);
  };

  const handleRunProgram = () => {
    interpreterRef.current?.startRun();
  };

  const handleClearProgram = () => {
    interpreterRef.current?.handleCommand('NEW');
  };

  const handleInsertDisk = (disk: C64DiskImage) => {
    setDriveState((prev) => ({
      ...prev,
      isInserted: true,
      disk,
      currentTrack: 18,
      currentSector: 0,
      statusMessage: '00, OK,00,00',
    }));
    interpreterRef.current?.setFloppyDisk(disk);
  };

  const handleEjectDisk = () => {
    setDriveState((prev) => ({
      ...prev,
      isInserted: false,
      disk: null,
      statusMessage: '74, DRIVE NOT READY,00,00',
    }));
    interpreterRef.current?.setFloppyDisk(null);
  };

  const handleLoadFileToC64 = (file: C64DiskFile, autoRun: boolean = false) => {
    if (!interpreterRef.current) return;

    setDriveState((prev) => ({
      ...prev,
      isLedRed: true,
      currentTrack: file.track || 1,
      currentSector: file.sector || 0,
    }));
    const isFastload = turboState.isEnabled;
    if (isFastload) {
      sidAudio.playDriveStep(2);
      interpreterRef.current.printToTerminal(`>>> FASTLOAD: "${file.name}" (2-BIT IEC BURST) <<<`, 7);
    } else {
      sidAudio.playDriveStep(4);
      sidAudio.playDriveChatter(0.4);
      interpreterRef.current.printToTerminal(`SEARCHING FOR ${file.name}`);
      interpreterRef.current.printToTerminal(`LOADING "${file.name}"`);
    }

    if (file.basicCode) {
      interpreterRef.current.loadProgram(file.basicCode);
    } else if (file.data && file.data.length >= 2) {
      const loadAddr = file.loadAddress ?? (file.data[0] | (file.data[1] << 8));
      const payload = file.data.subarray(2);

      for (let i = 0; i < payload.length && loadAddr + i < 65536; i++) {
        c64State.memory[loadAddr + i] = payload[i];
      }
    }

    interpreterRef.current.printToTerminal('READY.');

    const timeoutDelay = isFastload ? 100 : 400;
    setTimeout(() => {
      setDriveState((prev) => ({ ...prev, isLedRed: false }));
    }, timeoutDelay);

    if (autoRun) {
      setTimeout(() => {
        interpreterRef.current?.printToTerminal('RUN');
        interpreterRef.current?.startRun();
      }, isFastload ? 80 : 200);
    }
  };

  const handleHardwareFreeze = () => {
    setTurboState((prev) => ({ ...prev, isFrozen: true }));
    setActiveTab('turbo');
    interpreterRef.current?.printToTerminal('**** HARDWARE FREEZE (NMI) ****', 2);
    interpreterRef.current?.printToTerminal(`[${TURBO_CARTRIDGE_MODELS[turboState.activeModel]?.name || 'CARTRIDGE'} MENU]`, 7);
    sidAudio.playBootJingle();
  };

  const handleHardwareUnfreeze = () => {
    setTurboState((prev) => ({ ...prev, isFrozen: false }));
    interpreterRef.current?.printToTerminal('UNFREEZE: RESUMING CPU EXECUTION');
    interpreterRef.current?.printToTerminal('READY.');
    sidAudio.playKeyClick();
  };

  const handleInjectPoke = (address: number, value: number) => {
    if (address >= 0 && address < 65536) {
      handleUpdateMemoryByte(address, value);
      interpreterRef.current?.printToTerminal(`POKE ${address}, ${value}`, 13);
    }
  };

  const handleSaveSnapshotToDisk = (snapshotName: string) => {
    if (!driveState.disk || !interpreterRef.current) return;
    const cleanName = (snapshotName || 'SNAPSHOT.PRG').toUpperCase().slice(0, 16);

    const snapshotPayload = new Uint8Array(65538);
    snapshotPayload[0] = 0x00;
    snapshotPayload[1] = 0x00; // Load address $0000
    snapshotPayload.set(c64State.memory, 2);

    const blocks = Math.ceil(snapshotPayload.length / 254);
    const newFile: C64DiskFile = {
      id: 'snapshot-' + Date.now(),
      name: cleanName,
      type: 'PRG',
      sizeBlocks: blocks,
      data: snapshotPayload,
      loadAddress: 0x0000,
    };

    const nextFiles = [...driveState.disk.files.filter((f) => f.name !== cleanName), newFile];
    const nextDisk: C64DiskImage = {
      ...driveState.disk,
      files: nextFiles,
      freeBlocks: Math.max(0, driveState.disk.freeBlocks - blocks),
    };

    setDriveState((prev) => ({ ...prev, disk: nextDisk }));
    interpreterRef.current.setFloppyDisk(nextDisk);
    interpreterRef.current.printToTerminal(`SNAPSHOT SAVED AS "${cleanName}" (${blocks} BLOCKS)`);
    sidAudio.playDriveStep(4);
  };

  const handleSaveCurrentToDisk = (fileName: string) => {
    if (!driveState.disk || !interpreterRef.current) return;
    const cleanName = fileName.toUpperCase().slice(0, 16);
    const progText = interpreterRef.current.getProgramText();

    if (!progText.trim()) {
      alert(language === 'hu' ? 'Nincs menthető programkód a memóriában!' : 'No program code in memory to save!');
      return;
    }

    setDriveState((prev) => ({
      ...prev,
      isLedRed: true,
      currentTrack: 18,
      currentSector: 1,
    }));
    sidAudio.playDriveStep(4);
    sidAudio.playDriveChatter(0.5);

    const prgBytes = generatePrgFromBasic(progText);
    const blocks = Math.ceil(prgBytes.length / 254) || 1;

    const newFile: C64DiskFile = {
      id: 'saved-' + Date.now(),
      name: cleanName,
      type: 'PRG',
      sizeBlocks: blocks,
      data: prgBytes,
      loadAddress: 0x0801,
      basicCode: progText,
    };

    const nextFiles = [...driveState.disk.files.filter((f) => f.name !== cleanName), newFile];
    const nextDisk: C64DiskImage = {
      ...driveState.disk,
      files: nextFiles,
      freeBlocks: Math.max(0, driveState.disk.freeBlocks - blocks),
    };

    setDriveState((prev) => ({
      ...prev,
      disk: nextDisk,
    }));
    interpreterRef.current.setFloppyDisk(nextDisk);

    setTimeout(() => {
      setDriveState((prev) => ({ ...prev, isLedRed: false }));
    }, 500);

    interpreterRef.current.printToTerminal(`SAVED "${cleanName}"`);
    interpreterRef.current.printToTerminal('READY.');
  };

  const handleUpdateMemoryByte = (addr: number, val: number) => {
    if (addr >= 0 && addr < 65536) {
      const nextMem = new Uint8Array(c64State.memory);
      nextMem[addr] = val & 0xff;

      let nextBorder = c64State.borderColor;
      let nextBg = c64State.backgroundColor;
      let nextText = c64State.textColor;

      if (addr === 53280 || addr === 0xd020) nextBorder = val & 0x0f;
      if (addr === 53281 || addr === 0xd021) nextBg = val & 0x0f;
      if (addr === 646) nextText = val & 0x0f;

      const nextState: C64State = {
        ...c64State,
        memory: nextMem,
        borderColor: nextBorder,
        backgroundColor: nextBg,
        textColor: nextText,
      };

      interpreterRef.current?.setState(nextState);
      setC64State(nextState);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* C64 Sub-header / Overview Banner */}
      <div className="bg-gradient-to-r from-[#161D2F] via-[#1A2338] to-[#121724] border border-cyan-900/40 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-[#352879] border-2 border-[#6C5EB5] rounded-2xl shadow-lg flex items-center justify-center">
            <Monitor className="w-6 h-6 text-[#AAFFEE]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black tracking-wide text-white font-mono">
                COMMODORE 64 STÚDIÓ & 1541 FLOPPY
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/50 text-[10px] font-bold">
                6510 CPU / 64KB RAM / 1541 DOS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              {language === 'hu'
                ? 'Teljes Commodore 64 környezet: valós idejű BASIC V2 interpreter, 1541 Floppy lemezkezelő (.PRG / .D64 betöltés), 6502 CPU monitor, 64KB memória térkép és SID szintetizátor.'
                : 'Full-featured Commodore 64 environment: real-time BASIC V2 interpreter, 1541 Floppy disk system (.PRG / .D64 loading), 6502 CPU monitor, 64KB memory map, and SID synth.'}
            </p>
          </div>
        </div>

        {/* Tab Switcher on larger screens */}
        <div className="w-full sm:w-auto flex flex-wrap items-center justify-center gap-1.5 bg-[#0C101A] p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('turbo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'turbo'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-950/50 ring-1 ring-amber-400/50'
                : 'text-amber-400 hover:text-amber-200 hover:bg-amber-950/30'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current animate-pulse text-amber-300" />
            <span className="font-mono">
              {language === 'hu' ? 'TURBÓ KÁRTYA' : 'TURBO CARTRIDGE'}
            </span>
            {turboState.isEnabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('schematic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'schematic'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? 'HARDVER SÉMA & IC-K' : 'HARDWARE SCHEMATIC'}</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>BASIC</span>
          </button>

          <button
            onClick={() => setActiveTab('floppy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'floppy'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>1541 FLOPPY</span>
          </button>

          <button
            onClick={() => setActiveTab('cpu')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'cpu'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>6502 CPU</span>
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'memory'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? 'Memória' : 'Memory'}</span>
          </button>

          <button
            onClick={() => setActiveTab('sid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'sid'
                ? 'bg-pink-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>SID</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column C64 CRT Terminal, Right Column Tool Module */}
      {activeTab === 'schematic' ? (
        <div className="flex flex-col gap-6">
          <C64ArchitectureSchematic />
        </div>
      ) : activeTab === 'turbo' ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* CRT Terminal with Cartridge Housing */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <C64Screen
                c64State={c64State}
                turboState={turboState}
                onSendCommand={handleSendCommand}
                onBreak={handleBreak}
                onClearScreen={handleClearScreen}
                onResetC64={handleResetC64}
                onFreezeCartridge={handleHardwareFreeze}
              />
            </div>

            {/* Comprehensive Turbo Cartridge Studio & Accelerator Lab */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <C64TurboCartridgeStudio
                c64State={c64State}
                turboState={turboState}
                onUpdateTurboState={(updater) => {
                  setTurboState((prev) => {
                    const next = updater(prev);
                    interpreterRef.current?.setTurboSettings(
                      next.isEnabled,
                      next.cpuSpeedMultiplier,
                      TURBO_CARTRIDGE_MODELS[next.activeModel]?.name || 'Turbo'
                    );
                    return next;
                  });
                }}
                onFreeze={handleHardwareFreeze}
                onUnfreeze={handleHardwareUnfreeze}
                onResetC64={handleResetC64}
                onInjectPoke={handleInjectPoke}
                onSaveSnapshotToDisk={handleSaveSnapshotToDisk}
              />
            </div>
          </div>
        </div>
      ) : activeTab === 'memory' && isMemoryExpanded ? (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between bg-[#111622] p-3 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400">
              {language === 'hu'
                ? 'Teljes képernyős 64KB Memória Hex Szerkesztő nézet'
                : 'Full-width 64KB Memory Hex Editor mode'}
            </span>
            <button
              onClick={() => setIsMemoryExpanded(false)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
            >
              {language === 'hu' ? 'Osztott Képernyő (CRT + Hex)' : 'Split View (CRT + Hex)'}
            </button>
          </div>

          <C64MemoryInspector
            c64State={c64State}
            onUpdateMemoryByte={handleUpdateMemoryByte}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Authentic CRT Terminal */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <C64Screen
              c64State={c64State}
              turboState={turboState}
              onSendCommand={handleSendCommand}
              onBreak={handleBreak}
              onClearScreen={handleClearScreen}
              onResetC64={handleResetC64}
              onFreezeCartridge={handleHardwareFreeze}
            />
          </div>

          {/* Right Column: Selected Module Panel */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {activeTab === 'editor' && (
              <C64ProgramEditor
                c64State={c64State}
                onLoadProgram={handleLoadProgram}
                onRunProgram={handleRunProgram}
                onClearProgram={handleClearProgram}
                onSendCommand={handleSendCommand}
              />
            )}

            {activeTab === 'floppy' && (
              <C64FloppyDrive
                c64State={c64State}
                driveState={driveState}
                onInsertDisk={handleInsertDisk}
                onEjectDisk={handleEjectDisk}
                onLoadFileToC64={handleLoadFileToC64}
                onSaveCurrentToDisk={handleSaveCurrentToDisk}
                onUpdateDriveState={setDriveState}
                onSendCommandToC64={handleSendCommand}
              />
            )}

            {activeTab === 'cpu' && (
              <C64CpuMonitor
                c64State={c64State}
                onUpdateState={(next) => {
                  interpreterRef.current?.setState(next);
                  setC64State(next);
                }}
              />
            )}

            {activeTab === 'memory' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => setIsMemoryExpanded(true)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 bg-[#111622] px-2.5 py-1 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer"
                  >
                    <span>{language === 'hu' ? 'Kiterjesztett Hex Nézet' : 'Expand Hex View'}</span>
                  </button>
                </div>

                <C64MemoryInspector
                  c64State={c64State}
                  onUpdateMemoryByte={handleUpdateMemoryByte}
                />
              </div>
            )}

            {activeTab === 'sid' && <C64SidSynthesizer />}
          </div>
        </div>
      )}
    </div>
  );
};

