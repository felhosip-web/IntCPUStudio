import React, { useState, useRef } from 'react';
import {
  Disc,
  Play,
  Download,
  Upload,
  FolderOpen,
  Volume2,
  VolumeX,
  Plus,
  RefreshCw,
  Trash2,
  FileCode,
  Shield,
  ShieldAlert,
  Terminal,
  Globe,
  Radio,
  Gamepad2,
  Sparkles,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  HardDrive
} from 'lucide-react';
import { C64State } from '../../types/c64';
import { C64DiskFile, C64DiskImage, C64DriveState } from '../../types/c64Floppy';
import { CURATED_C64_DISKS } from '../../core/c64CuratedSoftware';
import { parseD64Image, parsePrgBinary, createBlankDisk, generatePrgFromBasic } from '../../core/c64PrgParser';
import { sidAudio } from '../../core/c64Audio';
import { useI18n } from '../../i18n/I18nContext';

interface C64FloppyDriveProps {
  c64State: C64State;
  driveState: C64DriveState;
  onInsertDisk: (disk: C64DiskImage) => void;
  onEjectDisk: () => void;
  onLoadFileToC64: (file: C64DiskFile, autoRun?: boolean) => void;
  onSaveCurrentToDisk: (fileName: string) => void;
  onUpdateDriveState: (updater: (prev: C64DriveState) => C64DriveState) => void;
  onSendCommandToC64: (command: string) => void;
}

export const C64FloppyDrive: React.FC<C64FloppyDriveProps> = ({
  c64State,
  driveState,
  onInsertDisk,
  onEjectDisk,
  onLoadFileToC64,
  onSaveCurrentToDisk,
  onUpdateDriveState,
  onSendCommandToC64,
}) => {
  const { language } = useI18n();
  const [activeTab, setActiveTab] = useState<'drive' | 'curated' | 'upload' | 'url'>('drive');
  const [saveFileName, setSaveFileName] = useState('MYPROGRAM');
  const [newDiskTitle, setNewDiskTitle] = useState('NEW DISK');
  const [newDiskId, setNewDiskId] = useState('64');
  const [urlInput, setUrlInput] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState<C64DiskFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download a single PRG file to user's computer
  const handleDownloadPrg = (file: C64DiskFile) => {
    const blob = new Blob([file.data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.prg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Upload local .PRG or .D64 file
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const ext = file.name.toLowerCase();

      if (ext.endsWith('.d64') || buffer.byteLength >= 170000) {
        // Full D64 Disk Image
        const parsedDisk = parseD64Image(buffer, file.name);
        onInsertDisk(parsedDisk);
        sidAudio.playDiskInsert();
        sidAudio.playDriveStep(4);
        setActiveTab('drive');
      } else {
        // Single PRG file
        const parsed = parsePrgBinary(buffer);
        const diskFile: C64DiskFile = {
          id: 'uploaded-' + Date.now(),
          name: file.name.replace(/\.[^/.]+$/, '').toUpperCase().slice(0, 16),
          type: 'PRG',
          sizeBlocks: Math.ceil(buffer.byteLength / 254) || 1,
          data: new Uint8Array(buffer),
          loadAddress: parsed.loadAddress,
          basicCode: parsed.basicCode,
        };

        if (driveState.disk && !driveState.disk.isWriteProtected) {
          // Add to currently mounted disk
          const nextDisk: C64DiskImage = {
            ...driveState.disk,
            files: [...driveState.disk.files, diskFile],
            freeBlocks: Math.max(0, driveState.disk.freeBlocks - diskFile.sizeBlocks),
          };
          onInsertDisk(nextDisk);
        } else {
          // Mount as single-file disk
          const newDisk: C64DiskImage = {
            id: 'disk-' + Date.now(),
            title: 'IMPORTED FILE',
            diskId: '64',
            dosType: '2A',
            files: [diskFile],
            freeBlocks: 664 - diskFile.sizeBlocks,
            isWriteProtected: false,
          };
          onInsertDisk(newDisk);
        }
        sidAudio.playDiskInsert();
        setActiveTab('drive');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert((language === 'hu' ? 'Hiba a fájl betöltésekor: ' : 'Error loading file: ') + msg);
    }
  };

  // Load .PRG from Remote URL
  const handleFetchUrl = async () => {
    if (!urlInput.trim()) return;
    setIsLoadingUrl(true);
    setUrlError(null);

    try {
      const response = await fetch(urlInput.trim());
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();
      const parsedPrg = parsePrgBinary(buffer);
      const urlFileName = urlInput.split('/').pop()?.split('?')[0] || 'WEB_PROG';
      const cleanName = urlFileName.replace(/\.[^/.]+$/, '').toUpperCase().slice(0, 16);

      const diskFile: C64DiskFile = {
        id: 'web-' + Date.now(),
        name: cleanName,
        type: 'PRG',
        sizeBlocks: Math.ceil(buffer.byteLength / 254) || 1,
        data: new Uint8Array(buffer),
        loadAddress: parsedPrg.loadAddress,
        basicCode: parsedPrg.basicCode,
      };

      const newDisk: C64DiskImage = {
        id: 'web-disk-' + Date.now(),
        title: 'INTERNET C64',
        diskId: '88',
        dosType: '2A',
        files: [diskFile],
        freeBlocks: 664 - diskFile.sizeBlocks,
        isWriteProtected: false,
      };

      onInsertDisk(newDisk);
      sidAudio.playDiskInsert();
      sidAudio.playDriveStep(4);
      setActiveTab('drive');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setUrlError(msg);
    } finally {
      setIsLoadingUrl(false);
    }
  };

  // Create new blank formatted floppy
  const handleCreateNewBlankDisk = () => {
    const disk = createBlankDisk(newDiskTitle, newDiskId);
    onInsertDisk(disk);
    sidAudio.playDiskInsert();
    sidAudio.playDriveStep(3);
    setActiveTab('drive');
  };

  return (
    <div className="flex flex-col gap-5 text-slate-100">
      {/* 1541 Physical Hardware Panel */}
      <div className="bg-[#121620] border-2 border-slate-700/80 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        {/* Retro Chassis Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-950/40 border border-amber-500/30">
              <Disc className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold tracking-wider text-base text-amber-300">
                  COMMODORE 1541
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  DEVICE #{driveState.driveNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'hu'
                  ? '5.25" Hajlékonylemezes Egység (170 KB Single-Sided)'
                  : '5.25" Single-Sided Floppy Disk Drive (170 KB)'}
              </p>
            </div>
          </div>

          {/* Authentic Dual LEDs & Audio Toggle */}
          <div className="flex items-center gap-4 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800 shadow-inner">
            {/* Green Power LED */}
            <div className="flex items-center gap-1.5">
              <div
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                  driveState.isLedGreen
                    ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]'
                    : 'bg-emerald-950/60 opacity-40'
                }`}
              />
              <span className="text-[10px] font-mono font-bold text-slate-400">PWR</span>
            </div>

            {/* Red Activity / Error LED */}
            <div className="flex items-center gap-1.5">
              <div
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  driveState.isLedRed
                    ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]'
                    : 'bg-rose-950/60 opacity-40'
                }`}
              />
              <span className="text-[10px] font-mono font-bold text-slate-400">ACT/ERR</span>
            </div>

            {/* Sound Mute/Unmute */}
            <button
              onClick={() => {
                const next = !driveState.isSoundEnabled;
                onUpdateDriveState((prev) => ({ ...prev, isSoundEnabled: next }));
              }}
              title={language === 'hu' ? '1541 motor/fej hangok ki/be' : 'Toggle 1541 stepper/motor sounds'}
              className="ml-2 text-slate-400 hover:text-amber-400 transition-colors p-1 cursor-pointer"
            >
              {driveState.isSoundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Drive Slot & Status Display */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4 items-center">
          {/* Floppy Drive Slot Visual */}
          <div className="md:col-span-6 bg-gradient-to-b from-[#181e2b] to-[#0d1017] p-4 rounded-xl border border-slate-800 flex flex-col gap-3 relative">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                {language === 'hu' ? 'Lemeznyílás & Fej' : 'Drive Slot & Head'}
              </span>
              <span className="font-mono text-emerald-400 text-[11px]">
                TRACK {driveState.currentTrack.toString().padStart(2, '0')} / SECTOR{' '}
                {driveState.currentSector.toString().padStart(2, '0')}
              </span>
            </div>

            {/* Simulated 5.25" Disk Insertion Door */}
            <div className="h-10 bg-black/80 rounded-lg border-2 border-slate-800 flex items-center justify-between px-3 relative overflow-hidden">
              {driveState.disk ? (
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold truncate">
                  <Disc className="w-4 h-4 text-amber-500 animate-spin-slow shrink-0" />
                  <span className="truncate">"{driveState.disk.title}" [{driveState.disk.diskId}]</span>
                  {driveState.disk.isWriteProtected && (
                    <Shield className="w-3.5 h-3.5 text-rose-400 ml-1 shrink-0" title="Write Protected" />
                  )}
                </div>
              ) : (
                <span className="text-slate-600 font-mono text-xs italic">
                  [{language === 'hu' ? 'NINCS LEMEZ BEHELYEZVE' : 'NO DISK INSERTED'}]
                </span>
              )}

              {/* Latch Lever Button */}
              {driveState.disk ? (
                <button
                  onClick={() => {
                    onEjectDisk();
                    sidAudio.playDiskInsert();
                  }}
                  className="px-2.5 py-1 bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-[10px] font-bold rounded cursor-pointer transition-colors"
                >
                  {language === 'hu' ? 'KIADÁS' : 'EJECT'}
                </button>
              ) : (
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  {language === 'hu' ? 'Nyitva' : 'Open'}
                </span>
              )}
            </div>

            {/* Stepper Head Progress Bar (Tracks 1 to 35) */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>T01</span>
                <span>T18 (BAM)</span>
                <span>T35</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-amber-500 h-full transition-all duration-200"
                  style={{ width: `${(driveState.currentTrack / 35) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Terminal DOS Controls */}
          <div className="md:col-span-6 flex flex-col gap-2.5">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              {language === 'hu' ? 'Gyors C64 DOS Műveletek' : 'C64 DOS Quick Commands'}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSendCommandToC64('LOAD "$",8')}
                disabled={!driveState.disk}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>LOAD "$",8</span>
              </button>

              <button
                onClick={() => {
                  onSendCommandToC64('LOAD "*",8,1');
                  setTimeout(() => {
                    onSendCommandToC64('RUN');
                  }, 600);
                }}
                disabled={!driveState.disk || driveState.disk.files.length === 0}
                className="px-3 py-2 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 disabled:opacity-40 disabled:pointer-events-none rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-700/50"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>LOAD "*",8,1 + RUN</span>
              </button>

              <button
                onClick={() => onSendCommandToC64('DIRECTORY')}
                disabled={!driveState.disk}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>DIRECTORY</span>
              </button>

              <button
                onClick={() => onSendCommandToC64('OPEN 15,8,15,"I"')}
                disabled={!driveState.disk}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>INIT (OPEN 15)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floppy Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('drive')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'drive'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
              : 'bg-[#111622] text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Disc className="w-4 h-4" />
          <span>{language === 'hu' ? 'Behelyezett Lemez Tartalma' : 'Current Disk Catalog'}</span>
          {driveState.disk && (
            <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
              {driveState.disk.files.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('curated')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'curated'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
              : 'bg-[#111622] text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>{language === 'hu' ? 'Retro C64 Lemezkönyvtár (Játékok & Démók)' : 'C64 Disk Archive'}</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'upload'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
              : 'bg-[#111622] text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>{language === 'hu' ? '.PRG / .D64 Fájl Feltöltés' : 'Upload .PRG / .D64'}</span>
        </button>

        <button
          onClick={() => setActiveTab('url')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'url'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
              : 'bg-[#111622] text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>{language === 'hu' ? 'Webes C64 Letöltő (URL)' : 'Internet URL Loader'}</span>
        </button>
      </div>

      {/* Tab 1: Current Disk Catalog & File Explorer */}
      {activeTab === 'drive' && (
        <div className="flex flex-col gap-4">
          {driveState.disk ? (
            <div className="bg-[#0f131c] border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
              {/* PETSCII Authentic Disk Header Banner */}
              <div className="bg-[#0000aa] text-[#aaeeff] p-4 rounded-xl font-mono text-sm shadow-inner flex flex-col gap-1 border border-cyan-900/50">
                <div className="text-center font-bold tracking-wider">
                  0 "{driveState.disk.title}" {driveState.disk.diskId} {driveState.disk.dosType}
                </div>
                <div className="text-xs text-cyan-200/80 text-center">
                  {driveState.disk.freeBlocks} BLOCKS FREE. (TOTAL: 664)
                </div>
              </div>

              {/* Disk Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#161c28] p-3 rounded-xl border border-slate-800">
                {/* Save Current Editor Code to Disk */}
                <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                  <input
                    type="text"
                    value={saveFileName}
                    onChange={(e) => setSaveFileName(e.target.value.toUpperCase().slice(0, 16))}
                    placeholder="PROGRAM NAME"
                    className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono text-amber-300 uppercase focus:outline-none focus:border-amber-500 w-44"
                  />
                  <button
                    onClick={() => {
                      if (saveFileName.trim()) {
                        onSaveCurrentToDisk(saveFileName.trim());
                      }
                    }}
                    disabled={driveState.disk.isWriteProtected}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{language === 'hu' ? 'Mentés Lemezre' : 'Save To Disk'}</span>
                  </button>
                </div>

                {/* Write Protect Toggle */}
                <button
                  onClick={() => {
                    const currentDisk = driveState.disk;
                    if (!currentDisk) return;
                    const next: C64DiskImage = {
                      ...currentDisk,
                      isWriteProtected: !currentDisk.isWriteProtected,
                    };
                    onInsertDisk(next);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors border ${
                    driveState.disk.isWriteProtected
                      ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  }`}
                >
                  {driveState.disk.isWriteProtected ? (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{language === 'hu' ? 'Írásvédett (Zárva)' : 'Write-Protected'}</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-3.5 h-3.5" />
                      <span>{language === 'hu' ? 'Írható (Nyitva)' : 'Writable'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Disk Files Table */}
              {driveState.disk.files.length === 0 ? (
                <div className="text-center py-10 text-slate-500 font-mono text-sm border-2 border-dashed border-slate-800 rounded-xl">
                  {language === 'hu'
                    ? 'A lemez üres (0 fájl). Mentsd rá saját programodat, vagy tölts fel egy .PRG fájlt!'
                    : 'Disk is empty (0 files). Save your current code or upload a .PRG file!'}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-12 text-[11px] font-mono text-slate-400 px-3 py-1 border-b border-slate-800 uppercase">
                    <span className="col-span-1">BLOKK</span>
                    <span className="col-span-5">FÁJLNÉV</span>
                    <span className="col-span-2">TÍPUS</span>
                    <span className="col-span-4 text-right">MŰVELETEK</span>
                  </div>

                  {driveState.disk.files.map((file) => (
                    <div
                      key={file.id}
                      className="grid grid-cols-12 items-center bg-[#131824] hover:bg-[#182030] p-3 rounded-xl border border-slate-800/80 transition-colors"
                    >
                      <span className="col-span-1 font-mono text-amber-400 text-xs font-bold">
                        {file.sizeBlocks}
                      </span>
                      <div className="col-span-5 flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="font-mono text-slate-200 text-xs font-semibold truncate">
                          "{file.name}"
                        </span>
                      </div>
                      <span className="col-span-2 font-mono text-emerald-400 text-xs">
                        {file.type} {file.isLocked ? '<' : ''}
                      </span>

                      <div className="col-span-4 flex items-center justify-end gap-1.5">
                        {/* Run Button */}
                        <button
                          onClick={() => onLoadFileToC64(file, true)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                          title="Load and RUN immediately on C64"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>RUN</span>
                        </button>

                        {/* Load to Editor */}
                        <button
                          onClick={() => onLoadFileToC64(file, false)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold cursor-pointer transition-colors"
                          title="Load into BASIC workspace"
                        >
                          LOAD
                        </button>

                        {/* Download PRG */}
                        <button
                          onClick={() => handleDownloadPrg(file)}
                          className="p-1 text-slate-400 hover:text-amber-300 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Download .PRG file"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete / Scratch */}
                        <button
                          onClick={() => {
                            if (!driveState.disk || driveState.disk.isWriteProtected) return;
                            const nextDisk: C64DiskImage = {
                              ...driveState.disk,
                              files: driveState.disk.files.filter((f) => f.id !== file.id),
                              freeBlocks: driveState.disk.freeBlocks + file.sizeBlocks,
                            };
                            onInsertDisk(nextDisk);
                            sidAudio.playDriveStep(2);
                          }}
                          disabled={driveState.disk.isWriteProtected}
                          className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-30 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Scratch (Delete) file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#111622] border-2 border-dashed border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-4">
              <Disc className="w-12 h-12 text-slate-600" />
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-slate-300">
                  {language === 'hu' ? 'Nincs behelyezett floppy lemez' : 'No Floppy Disk in 1541 Drive'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md">
                  {language === 'hu'
                    ? 'Válassz a gyári játékkönyvtárból, hozz létre egy új üres lemezt, vagy tölts fel egy saját .PRG / .D64 fájlt.'
                    : 'Select a curated retro arcade game disk, create a new blank floppy, or upload a .PRG/.D64 image.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                <button
                  onClick={() => CURATED_C64_DISKS?.[0] && onInsertDisk(CURATED_C64_DISKS[0])}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-950/40"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>{language === 'hu' ? 'Arcade Játéklemez Behelyezése' : 'Insert Arcade Games Disk'}</span>
                </button>

                <button
                  onClick={handleCreateNewBlankDisk}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer border border-slate-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'hu' ? 'Új Üres Floppy Formázása' : 'Create Blank Disk'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Curated C64 Disk Archive (Games, Demos, Utilities) */}
      {activeTab === 'curated' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CURATED_C64_DISKS.map((disk) => {
            const isCurrent = driveState.disk?.id === disk.id;
            return (
              <div
                key={disk.id}
                className={`bg-[#121724] border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all shadow-lg ${
                  isCurrent ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                      ID: {disk.diskId} 2A
                    </span>
                    {isCurrent && (
                      <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {language === 'hu' ? 'BEHELYEZVE' : 'MOUNTED'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-100 font-mono">
                    "{disk.title}"
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {language === 'hu' ? disk.descriptionHu : disk.description}
                  </p>

                  {/* File List in Disk */}
                  <div className="bg-black/50 rounded-xl p-3 flex flex-col gap-1.5 font-mono text-xs border border-slate-800/80">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                      {language === 'hu' ? 'Tartalmazott programok:' : 'Contained Programs:'}
                    </div>
                    {disk.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between text-slate-300">
                        <span className="text-cyan-300 truncate">"{file.name}"</span>
                        <span className="text-[10px] text-amber-400 font-bold">{file.sizeBlocks} BLK</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      onInsertDisk(disk);
                      sidAudio.playDiskInsert();
                      sidAudio.playDriveStep(4);
                      setActiveTab('drive');
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950/40'
                    }`}
                  >
                    <Disc className="w-4 h-4" />
                    <span>
                      {isCurrent
                        ? language === 'hu' ? 'Lemez Vizsgálata' : 'Inspect Disk'
                        : language === 'hu' ? 'Lemez Behelyezése a 1541-be' : 'Insert into 1541 Drive'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Upload .PRG or .D64 */}
      {activeTab === 'upload' && (
        <div className="bg-[#111622] border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-slate-200">
              {language === 'hu' ? 'Saját C64 Program vagy Lemezkép Feltöltése' : 'Upload C64 Program or Disk Image'}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'hu'
                ? 'Tölts fel bármilyen internetről letöltött .PRG vagy .D64 fájlt. A rendszer automatikusan felismeri a betöltési memóriacímet és a BASIC tokeneket!'
                : 'Upload any .PRG or .D64 file from the web. The parser will automatically decode the 2-byte load address, detokenize BASIC lines, and mount it!'}
            </p>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3 cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 transition-all"
          >
            <Upload className="w-10 h-10 text-amber-400 animate-bounce" />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-200">
                {language === 'hu' ? 'Húzd ide a fájlt vagy kattints a tallózáshoz' : 'Drag and drop file here or click to browse'}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Támogatott: .PRG, .D64, .BAS, .TXT (max 1 MB)
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".prg,.d64,.bas,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Tab 4: Internet URL Downloader */}
      {activeTab === 'url' && (
        <div className="bg-[#111622] border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-slate-200">
              {language === 'hu' ? 'C64 Fájl Letöltése Webes Hivatkozásról (URL)' : 'Download C64 File from Internet URL'}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'hu'
                ? 'Illeszd be egy neten található C64 bináris (.prg) közvetlen hivatkozását a közvetlen beolvasáshoz és futtatáshoz.'
                : 'Paste a direct link to any .PRG binary on the web to fetch, parse, and execute it.'}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/games/space_invaders.prg"
                className="flex-1 bg-slate-900 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleFetchUrl}
                disabled={isLoadingUrl || !urlInput.trim()}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
              >
                {isLoadingUrl ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Globe className="w-4 h-4" />
                )}
                <span>{language === 'hu' ? 'Letöltés & Behelyezés' : 'Fetch & Mount'}</span>
              </button>
            </div>

            {urlError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{urlError}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
