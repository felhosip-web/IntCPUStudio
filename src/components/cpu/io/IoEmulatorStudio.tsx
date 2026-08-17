import React, { useState, useCallback, useMemo } from 'react';
import {
  AddressDecoderState,
  IoBusTransaction,
  IoDeviceMapping,
  IoEmulatorConfig,
  IoMappingMode,
  IoPresetExperiment,
} from '../../../types/ioEmulator';
import {
  createDefaultIoDevices,
  DEFAULT_IO_CONFIG,
  IO_PRESET_EXPERIMENTS,
  readIoAddress,
  writeIoAddress,
} from '../../../core/ioEmulatorEngine';
import { useI18n } from '../../../i18n/I18nContext';
import { IoLedBar } from './IoLedBar';
import { IoSevenSegment } from './IoSevenSegment';
import { IoButtonsAndSwitches } from './IoButtonsAndSwitches';
import { IoMatrixKeypad } from './IoMatrixKeypad';
import { IoCharacterLcd } from './IoCharacterLcd';
import { IoAnalogAdcPot } from './IoAnalogAdcPot';
import { IoAddressDecoderView } from './IoAddressDecoderView';
import { IoBusTransactionHistory } from './IoBusTransactionHistory';
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Cpu,
  Layers,
  MapPin,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Split,
  ToggleLeft,
  Tv,
  Volume2,
  Zap,
} from 'lucide-react';

interface IoEmulatorStudioProps {
  onLoadProgramCode?: (code: string) => void;
}

export const IoEmulatorStudio: React.FC<IoEmulatorStudioProps> = ({
  onLoadProgramCode,
}) => {
  const { language } = useI18n();

  const [activeSubTab, setActiveSubTab] = useState<'PERIPHERALS' | 'DECODER_MAP' | 'EXPERIMENTS' | 'TRANSACTIONS'>('PERIPHERALS');
  const [devices, setDevices] = useState<IoDeviceMapping[]>(() => createDefaultIoDevices());
  const [config, setConfig] = useState<IoEmulatorConfig>(DEFAULT_IO_CONFIG);
  const [transactions, setTransactions] = useState<IoBusTransaction[]>([]);

  // Manual Bus Tester Inputs
  const [testAddress, setTestAddress] = useState<string>('0xE000');
  const [testData, setTestData] = useState<string>('0xA5');
  const [lastActiveAddress, setLastActiveAddress] = useState<number>(0xe000);
  const [lastActiveChipSelect, setLastActiveChipSelect] = useState<string>('/CS0 (Y0)');
  const [selectedExperiment, setSelectedExperiment] = useState<IoPresetExperiment>(IO_PRESET_EXPERIMENTS[0]);

  const toHex = (v: number) => `0x${(v & 0xffff).toString(16).toUpperCase().padStart(4, '0')}`;

  // Update a single device
  const handleUpdateDevice = (updated: IoDeviceMapping) => {
    setDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  // Perform Manual POKE (Write)
  const handleExecutePoke = () => {
    const addr = parseInt(testAddress.startsWith('0x') ? testAddress : `0x${testAddress}`, 16) || 0;
    const val = parseInt(testData.startsWith('0x') ? testData : `0x${testData}`, 16) || 0;

    const { updatedDevices, targetDevice, chipSelect } = writeIoAddress(
      devices,
      addr,
      val,
      config.mappingMode
    );

    setDevices(updatedDevices);
    setLastActiveAddress(addr);
    setLastActiveChipSelect(chipSelect || 'NONE');

    const newTx: IoBusTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      type: 'WRITE',
      address: addr,
      data: val & 0xff,
      mode: config.mappingMode,
      targetDeviceId: targetDevice?.id,
      targetDeviceName: targetDevice ? (language === 'hu' ? targetDevice.nameHu : targetDevice.name) : undefined,
      chipSelect,
      signals: {
        mreq: config.mappingMode === 'MMIO',
        iorq: config.mappingMode === 'PMIO',
        rd: false,
        wr: true,
        cs: !!chipSelect && chipSelect !== 'NONE',
      },
      status: targetDevice ? 'ACK' : 'NO_DEVICE',
    };

    setTransactions((prev) => [...prev, newTx].slice(-200));
  };

  // Perform Manual PEEK (Read)
  const handleExecutePeek = () => {
    const addr = parseInt(testAddress.startsWith('0x') ? testAddress : `0x${testAddress}`, 16) || 0;
    const { data, targetDevice, chipSelect } = readIoAddress(
      devices,
      addr,
      config.mappingMode,
      config.addressDecoding.decodingMode
    );

    setTestData(`0x${(data & 0xff).toString(16).toUpperCase().padStart(2, '0')}`);
    setLastActiveAddress(addr);
    setLastActiveChipSelect(chipSelect || 'NONE');

    const newTx: IoBusTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      type: 'READ',
      address: addr,
      data,
      mode: config.mappingMode,
      targetDeviceId: targetDevice?.id,
      targetDeviceName: targetDevice ? (language === 'hu' ? targetDevice.nameHu : targetDevice.name) : undefined,
      chipSelect,
      signals: {
        mreq: config.mappingMode === 'MMIO',
        iorq: config.mappingMode === 'PMIO',
        rd: true,
        wr: false,
        cs: !!chipSelect && chipSelect !== 'NONE',
      },
      status: targetDevice ? 'ACK' : 'NO_DEVICE',
    };

    setTransactions((prev) => [...prev, newTx].slice(-200));
  };

  // Load a preset experiment
  const handleLoadExperiment = (exp: IoPresetExperiment) => {
    setSelectedExperiment(exp);
    if (exp.devices) setDevices(exp.devices);
    if (exp.defaultConfig) {
      setConfig((prev) => ({ ...prev, ...exp.defaultConfig }));
    }
    if (onLoadProgramCode && exp.assemblyCode) {
      onLoadProgramCode(exp.assemblyCode);
    }
  };

  const ledDevice = devices.find((d) => d.id === 'dev-led-bar') || devices[0];
  const btnDevice = devices.find((d) => d.id === 'dev-push-buttons') || devices[1];
  const segDevice = devices.find((d) => d.id === 'dev-seven-seg') || devices[2];
  const dipDevice = devices.find((d) => d.id === 'dev-dip-switches') || devices[3];
  const keypadDevice = devices.find((d) => d.id === 'dev-matrix-keypad') || devices[4];
  const lcdDevice = devices.find((d) => d.id === 'dev-char-lcd') || devices[5];
  const adcDevice = devices.find((d) => d.id === 'dev-adc-pot') || devices[6];
  const dacDevice = devices.find((d) => d.id === 'dev-dac-voltmeter') || devices[7];

  return (
    <div className="flex flex-col gap-5 w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0D1322] to-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-950/50">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-mono font-extrabold text-white tracking-tight">
                {language === 'hu' ? 'I/O Periféria & Memóriatérkép Emulátor' : 'I/O Peripherals & MMIO Emulator Studio'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                MMIO v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'hu'
                ? 'Virtuális alkatrészek (LED-ek, gombok, 7-szegmensek, LCD, ADC) összekapcsolása memóriacímekkel & 74LS138 dekóderrel'
                : 'Connect virtual hardware components (LEDs, buttons, 7-segs, LCD, ADC) to memory addresses & 74LS138 decoder'}
            </p>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/60 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('PERIPHERALS')}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'PERIPHERALS'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? '🔌 Alkatrész Pult' : '🔌 Peripherals'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('DECODER_MAP')}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'DECODER_MAP'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? '🗺️ Címdekóder & Térkép' : '🗺️ Address Decoder'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('EXPERIMENTS')}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'EXPERIMENTS'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? '📚 Mintakísérletek' : '📚 Experiments'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('TRANSACTIONS')}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'TRANSACTIONS'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{language === 'hu' ? '📈 Tranzakció Log' : '📈 Log Trace'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Manual Bus Control Workbench (PEEK / POKE) */}
      <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>{language === 'hu' ? 'I/O MÓD:' : 'I/O MODE:'}</span>
            <button
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  mappingMode: prev.mappingMode === 'MMIO' ? 'PMIO' : 'MMIO',
                }))
              }
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold border transition-all cursor-pointer ${
                config.mappingMode === 'MMIO'
                  ? 'bg-purple-600/30 text-purple-300 border-purple-500'
                  : 'bg-amber-600/30 text-amber-300 border-amber-500'
              }`}
            >
              {config.mappingMode === 'MMIO' ? 'MMIO ($E000-$E0FF)' : 'PMIO (Port 0-255)'}
            </button>
          </div>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          {/* Address & Data Inputs */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">CÍM (Hex):</span>
            <input
              type="text"
              value={testAddress}
              onChange={(e) => setTestAddress(e.target.value)}
              className="w-24 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-center font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">ADAT (Hex):</span>
            <input
              type="text"
              value={testData}
              onChange={(e) => setTestData(e.target.value)}
              className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-center font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Read (PEEK) and Write (POKE) Action Buttons */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={handleExecutePeek}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-900/30 cursor-pointer active:scale-95"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>PEEK (Olvasás /RD)</span>
          </button>
          <button
            onClick={handleExecutePoke}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-900/30 cursor-pointer active:scale-95"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>POKE (Írás /WR)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Virtual Peripherals Workbench */}
      {activeSubTab === 'PERIPHERALS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. 8-Bit LED Output Bar */}
          <IoLedBar
            device={ledDevice}
            onUpdateDevice={handleUpdateDevice}
            isBusActive={lastActiveAddress === ledDevice.baseAddress}
          />

          {/* 2. 4-Bit Push Buttons */}
          <IoButtonsAndSwitches
            device={btnDevice}
            onUpdateDevice={handleUpdateDevice}
            isBusActive={lastActiveAddress === btnDevice.baseAddress}
          />

          {/* 3. Dual 7-Segment Display */}
          <IoSevenSegment
            device={segDevice}
            onUpdateDevice={handleUpdateDevice}
            isBusActive={
              lastActiveAddress >= segDevice.baseAddress &&
              lastActiveAddress < segDevice.baseAddress + segDevice.addressLength
            }
          />

          {/* 4. 8-Bit DIP Switches */}
          <IoButtonsAndSwitches
            device={dipDevice}
            onUpdateDevice={handleUpdateDevice}
            isBusActive={lastActiveAddress === dipDevice.baseAddress}
          />

          {/* 5. 4x4 Matrix Keypad */}
          <IoMatrixKeypad
            device={keypadDevice}
            onUpdateDevice={handleUpdateDevice}
            isBusActive={
              lastActiveAddress >= keypadDevice.baseAddress &&
              lastActiveAddress < keypadDevice.baseAddress + keypadDevice.addressLength
            }
          />

          {/* 6. 16x2 HD44780 Character LCD */}
          <IoCharacterLcd
            device={lcdDevice}
            onUpdateDevice={handleUpdateDevice}
            isBusActive={
              lastActiveAddress >= lcdDevice.baseAddress &&
              lastActiveAddress < lcdDevice.baseAddress + lcdDevice.addressLength
            }
          />

          {/* 7 & 8. Analog Potentiometer ADC & DAC Voltmeter */}
          <div className="md:col-span-2">
            <IoAnalogAdcPot
              adcDevice={adcDevice}
              dacDevice={dacDevice}
              onUpdateDevice={handleUpdateDevice}
              isBusActive={
                lastActiveAddress === adcDevice.baseAddress ||
                lastActiveAddress === dacDevice.baseAddress
              }
            />
          </div>
        </div>
      )}

      {/* TAB 2: Hardware Address Decoder & Memory Map */}
      {activeSubTab === 'DECODER_MAP' && (
        <IoAddressDecoderView
          devices={devices}
          config={config}
          onUpdateDecoder={(updates) =>
            setConfig((prev) => ({
              ...prev,
              addressDecoding: { ...prev.addressDecoding, ...updates },
            }))
          }
          activeAddress={lastActiveAddress}
          activeChipSelect={lastActiveChipSelect}
        />
      )}

      {/* TAB 3: Educational Experiments Library */}
      {activeSubTab === 'EXPERIMENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Experiment selector cards */}
          <div className="lg:col-span-5 flex flex-col gap-2.5">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
              {language === 'hu' ? 'Interaktív I/O Laboratóriumok' : 'Interactive I/O Experiments'}
            </h3>
            {IO_PRESET_EXPERIMENTS.map((exp) => {
              const isSelected = selectedExperiment.id === exp.id;
              return (
                <button
                  key={exp.id}
                  onClick={() => setSelectedExperiment(exp)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-950/50 to-slate-900 border-emerald-500/80 shadow-lg shadow-emerald-950/40'
                      : 'bg-[#0B0F17] border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                      {language === 'hu' ? exp.categoryHu : exp.category}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <h4 className="text-xs font-mono font-bold text-slate-200">
                    {language === 'hu' ? exp.titleHu : exp.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {language === 'hu' ? exp.descriptionHu : exp.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Experiment details & Code preview */}
          <div className="lg:col-span-7 bg-[#0B0F17] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {language === 'hu' ? selectedExperiment.titleHu : selectedExperiment.title}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  MMIO Base: {toHex(config.memoryBaseAddress)}
                </span>
              </div>

              {/* Theory text */}
              <div className="p-3 bg-black/60 rounded-xl border border-slate-900 mb-4 text-xs text-slate-300 font-mono whitespace-pre-line leading-relaxed">
                {language === 'hu' ? selectedExperiment.theoryHu : selectedExperiment.theoryEn}
              </div>

              {/* Assembly Code Preview */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{language === 'hu' ? 'Példa Assembly Kód:' : 'Example Assembly Code:'}</span>
                </div>
              </div>

              <div className="p-3 bg-black/90 rounded-xl border border-slate-900 font-mono text-xs text-cyan-300 overflow-x-auto">
                <pre>{selectedExperiment.assemblyCode}</pre>
              </div>
            </div>

            {/* Load Button */}
            <button
              onClick={() => handleLoadExperiment(selectedExperiment)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer active:scale-98"
            >
              <Play className="w-4 h-4 text-white" />
              <span>
                {language === 'hu'
                  ? 'Kísérlet Betöltése & Kód Elküldése a CPU-ba'
                  : 'Load Experiment & Send Code to CPU'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Real-time Bus Transactions Log */}
      {activeSubTab === 'TRANSACTIONS' && (
        <IoBusTransactionHistory
          transactions={transactions}
          onClearHistory={() => setTransactions([])}
        />
      )}
    </div>
  );
};
