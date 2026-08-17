import React, { useEffect, useRef, useState } from 'react';
import {
  DualShiftRegisterState,
  ShiftBitOrder,
  ShiftOutputDeviceType,
  ShiftRegisterPreset,
  ShiftWaveformSample,
} from '../../../types/mcuShiftRegister';
import {
  bitArrayToByte,
  createInitialDualShiftRegisterState,
  pulseMasterReset,
  pulseStorageLatch,
  setOutputEnable,
  SHIFT_REGISTER_PRESETS,
  simulateShiftOutByte,
  stepShiftClock,
} from '../../../core/mcuShiftRegisterEngine';
import { ShiftRegisterPinDiagram } from './ShiftRegisterPinDiagram';
import { ShiftRegisterInternalDiagram } from './ShiftRegisterInternalDiagram';
import { ShiftRegisterOutputDevices } from './ShiftRegisterOutputDevices';
import { ShiftRegisterWaveformViewer } from './ShiftRegisterWaveformViewer';
import { useI18n } from '../../../i18n/I18nContext';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  Copy,
  Cpu,
  FastForward,
  Flame,
  Layers,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';

interface McuShiftRegisterStudioProps {
  onOpenBlockStudioWithPreset?: (presetId: string) => void;
}

export const McuShiftRegisterStudio: React.FC<McuShiftRegisterStudioProps> = ({
  onOpenBlockStudioWithPreset,
}) => {
  const { language } = useI18n();

  // State
  const [state, setState] = useState<DualShiftRegisterState>(createInitialDualShiftRegisterState);
  const [selectedPreset, setSelectedPreset] = useState<ShiftRegisterPreset>(SHIFT_REGISTER_PRESETS[0]);
  const [deviceType, setDeviceType] = useState<ShiftOutputDeviceType>('LEDS');
  const [ledColor, setLedColor] = useState<'EMERALD' | 'RUBY' | 'AMBER' | 'CYAN' | 'PURPLE'>('EMERALD');
  const [bitOrder, setBitOrder] = useState<ShiftBitOrder>('MSBFIRST');

  // Input value to shift
  const [inputVal, setInputVal] = useState<number>(0x55);
  const [inputBase, setInputBase] = useState<'HEX' | 'DEC' | 'BIN'>('HEX');

  // Waveform history
  const [waveform, setWaveform] = useState<ShiftWaveformSample[]>([]);

  // Animation player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [animSpeedMs, setAnimSpeedMs] = useState<number>(120);
  const [animPatternIndex, setAnimPatternIndex] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'ARDUINO' | 'AVR'>('ARDUINO');

  // Timer reference for animation
  const animTimerRef = useRef<any>(null);

  // Manual Pin Toggles
  const handleTogglePin = (pinName: 'ds' | 'shcp' | 'stcp' | 'oe_n' | 'mr_n') => {
    if (pinName === 'ds') {
      setState((prev) => ({
        ...prev,
        chip1: { ...prev.chip1, pins: { ...prev.chip1.pins, ds: !prev.chip1.pins.ds } },
      }));
    } else if (pinName === 'shcp') {
      // Clock step (rising edge)
      setState((prev) => stepShiftClock(prev, prev.chip1.pins.ds));
    } else if (pinName === 'stcp') {
      // Latch pulse
      setState((prev) => pulseStorageLatch(prev));
    } else if (pinName === 'oe_n') {
      setState((prev) => setOutputEnable(prev, !prev.chip1.pins.oe_n));
    } else if (pinName === 'mr_n') {
      setState((prev) => pulseMasterReset(prev));
    }
  };

  // Perform full byte shift
  const handleShiftByte = (byteVal = inputVal) => {
    const { finalState, waveform: newWave } = simulateShiftOutByte(state, byteVal, bitOrder);
    setState(finalState);
    setWaveform(newWave);
  };

  // Reset all
  const handleResetAll = () => {
    setIsPlaying(false);
    if (animTimerRef.current) clearInterval(animTimerRef.current);
    setState(createInitialDualShiftRegisterState());
    setWaveform([]);
    setAnimPatternIndex(0);
  };

  // Load Preset
  const handleSelectPreset = (preset: ShiftRegisterPreset) => {
    setIsPlaying(false);
    if (animTimerRef.current) clearInterval(animTimerRef.current);
    setSelectedPreset(preset);
    setDeviceType(preset.outputDevice);
    setBitOrder(preset.bitOrder);
    setAnimSpeedMs(preset.animationDelayMs);
    setAnimPatternIndex(0);

    // Initial state with cascading flag
    setState((prev) => ({
      ...createInitialDualShiftRegisterState(),
      isCascaded: preset.isCascaded,
    }));

    if (preset.defaultData.length > 0) {
      setInputVal(preset.defaultData[0]);
    }
  };

  // Animation Loop
  useEffect(() => {
    if (isPlaying) {
      animTimerRef.current = setInterval(() => {
        setAnimPatternIndex((prevIdx) => {
          const nextIdx = (prevIdx + 1) % selectedPreset.defaultData.length;
          const valToShift = selectedPreset.defaultData[nextIdx];

          setState((curState) => {
            const { finalState } = simulateShiftOutByte(curState, valToShift, selectedPreset.bitOrder);
            return finalState;
          });

          return nextIdx;
        });
      }, animSpeedMs);
    } else {
      if (animTimerRef.current) clearInterval(animTimerRef.current);
    }

    return () => {
      if (animTimerRef.current) clearInterval(animTimerRef.current);
    };
  }, [isPlaying, animSpeedMs, selectedPreset]);

  const copyCodeToClipboard = () => {
    const code = activeCodeTab === 'ARDUINO' ? selectedPreset.arduinoCode : selectedPreset.avrCode;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 p-2 sm:p-4 text-slate-200">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-[#0d1527] via-[#09111e] to-[#0d1527] border border-cyan-900/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-950/50">
              <Cpu className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-mono font-extrabold text-white tracking-wide">
                  74HC595 SHIFT REGISZTER EMULÁTOR & STÚDIÓ
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                  v1.0 Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'hu'
                  ? '8-bites soros-párhuzamos (SIPO) shift-regiszter belső flip-flop szintű működésének vizuális szemléltetése, kaszkádolás és blokk-alapú kódgenerálás.'
                  : 'Interactive 8-bit Serial-In Parallel-Out (SIPO) shift register simulator with internal flip-flop visualization, daisy-chaining, and visual block programming.'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setState((prev) => ({ ...prev, isCascaded: !prev.isCascaded }));
              }}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                state.isCascaded
                  ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-950/50'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{state.isCascaded ? 'Kaszkádolt (2x 74HC595 - 16 Kimenet)' : 'Egyszeres (1x 74HC595 - 8 Kimenet)'}</span>
            </button>

            {onOpenBlockStudioWithPreset && (
              <button
                onClick={() => onOpenBlockStudioWithPreset('preset_shift595_cylon')}
                className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-amber-600 hover:bg-amber-500 text-white border border-amber-400/50 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-amber-950/40"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Blokk Programozás Megnyitása</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preset Selector Bar */}
      <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-mono font-bold text-slate-200">
              {language === 'hu' ? 'OKTATÁSI KÍSÉRLETEK & PRESETEK' : 'EDUCATIONAL PRESETS & EXPERIMENTS'}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {SHIFT_REGISTER_PRESETS.length} {language === 'hu' ? 'mintaprogram elérhető' : 'experiments available'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {SHIFT_REGISTER_PRESETS.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-500 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">
                    {language === 'hu' ? preset.titleHu : preset.title}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {language === 'hu' ? preset.categoryHu : preset.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {language === 'hu' ? preset.descriptionHu : preset.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Control Deck & Visualizer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Controls & Pinout (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Manual Pin Deck */}
          <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-mono font-bold text-slate-200">
                  {language === 'hu' ? 'MANUÁLIS LÁB- ÉS ÓRAJEL VEZÉRLÉS' : 'MANUAL PIN & CLOCK CONTROL'}
                </h4>
              </div>
              <button
                onClick={handleResetAll}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                title="Reset All"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Step Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {/* DS Data Pin */}
              <button
                onClick={() => handleTogglePin('ds')}
                className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  state.chip1.pins.ds
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="text-[10px] text-slate-400 font-normal">DS Adat Bemenet:</span>
                <span className="text-sm font-extrabold">{state.chip1.pins.ds ? 'HIGH (1)' : 'LOW (0)'}</span>
              </button>

              {/* SH_CP Shift Clock */}
              <button
                onClick={() => handleTogglePin('shcp')}
                className="p-2.5 rounded-xl border border-cyan-500/60 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 text-xs font-mono font-bold transition-all cursor-pointer flex flex-col items-center gap-1 shadow-md shadow-cyan-950/40 active:scale-95"
              >
                <span className="text-[10px] text-cyan-400/80 font-normal">Órajel Impulzus:</span>
                <span className="text-sm font-extrabold flex items-center gap-1">
                  <span>SH_CP ⤤</span>
                </span>
              </button>

              {/* ST_CP Latch Clock */}
              <button
                onClick={() => handleTogglePin('stcp')}
                className="p-2.5 rounded-xl border border-emerald-500/60 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-mono font-bold transition-all cursor-pointer flex flex-col items-center gap-1 shadow-md shadow-emerald-950/40 active:scale-95"
              >
                <span className="text-[10px] text-emerald-400/80 font-normal">Retesz / Latch:</span>
                <span className="text-sm font-extrabold flex items-center gap-1">
                  <span>ST_CP ⤤</span>
                </span>
              </button>

              {/* /OE Output Enable */}
              <button
                onClick={() => handleTogglePin('oe_n')}
                className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  !state.chip1.pins.oe_n
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                    : 'bg-rose-950/80 border-rose-500 text-rose-300'
                }`}
              >
                <span className="text-[10px] text-slate-400 font-normal">Kimenet (/OE):</span>
                <span className="text-sm font-extrabold">
                  {!state.chip1.pins.oe_n ? 'ENGEDÉLYEZVE' : 'TILTVA (High-Z)'}
                </span>
              </button>
            </div>

            {/* Master Reset Button */}
            <button
              onClick={() => handleTogglePin('mr_n')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-700/80 text-slate-400 hover:text-rose-300 text-xs font-mono font-bold transition-all cursor-pointer text-center"
            >
              /MR (/SRCLR) Mester Törlés Impulzus
            </button>
          </div>

          {/* Byte Sender & Auto-Animator */}
          <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <FastForward className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-mono font-bold text-slate-200">
                  {language === 'hu' ? 'BÁJT KÜLDŐ & AUTOMATA LÉPTETŐ' : 'BYTE SENDER & ANIMATOR'}
                </h4>
              </div>
            </div>

            {/* Input Value Controls */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Küldendő Érték:</span>
                <div className="flex items-center gap-1">
                  {(['HEX', 'DEC', 'BIN'] as const).map((b) => (
                    <button
                      key={b}
                      onClick={() => setInputBase(b)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        inputBase === b
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={
                    inputBase === 'HEX'
                      ? `0x${inputVal.toString(16).toUpperCase()}`
                      : inputBase === 'BIN'
                      ? `0b${inputVal.toString(2).padStart(8, '0')}`
                      : inputVal.toString(10)
                  }
                  onChange={(e) => {
                    const raw = e.target.value.trim();
                    let parsed = 0;
                    if (raw.startsWith('0x') || raw.startsWith('0X')) {
                      parsed = parseInt(raw.slice(2), 16) || 0;
                    } else if (raw.startsWith('0b') || raw.startsWith('0B')) {
                      parsed = parseInt(raw.slice(2), 2) || 0;
                    } else {
                      parsed = parseInt(raw, 10) || 0;
                    }
                    setInputVal(parsed & 0xff);
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-black border border-slate-700 text-cyan-300 font-mono text-sm font-bold focus:outline-none focus:border-cyan-500"
                />

                <button
                  onClick={() => handleShiftByte(inputVal)}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-md shadow-cyan-950/40"
                >
                  Küldés (shiftOut)
                </button>
              </div>
            </div>

            {/* Bit Order Toggle */}
            <div className="flex items-center justify-between text-xs font-mono pt-1">
              <span className="text-slate-400">Bit Sorrend:</span>
              <div className="flex items-center gap-1 bg-black p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setBitOrder('MSBFIRST')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    bitOrder === 'MSBFIRST' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                  }`}
                >
                  MSBFIRST (Bit 7→0)
                </button>
                <button
                  onClick={() => setBitOrder('LSBFIRST')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    bitOrder === 'LSBFIRST' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                  }`}
                >
                  LSBFIRST (Bit 0→7)
                </button>
              </div>
            </div>

            {/* Auto-Play Presets Animation */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">Automata Minta Futás:</span>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  {animSpeedMs} ms / lépés
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isPlaying
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Animáció Szüneteltetése' : 'Mintasorozat Indítása'}</span>
                </button>
              </div>

              {/* Speed slider */}
              <input
                type="range"
                min="30"
                max="500"
                step="10"
                value={animSpeedMs}
                onChange={(e) => setAnimSpeedMs(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Physical Pinout Component */}
          <ShiftRegisterPinDiagram
            chip={state.chip1}
            onTogglePin={handleTogglePin}
            isCascaded={state.isCascaded}
          />
        </div>

        {/* Right Column: Internal Flip-Flop Architecture, Output Devices, Waveform (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Primary Chip Internal Diagram */}
          <ShiftRegisterInternalDiagram
            chip={state.chip1}
            chipIndex={1}
            isCascaded={state.isCascaded}
          />

          {/* Cascaded Secondary Chip (if enabled) */}
          {state.isCascaded && (
            <ShiftRegisterInternalDiagram
              chip={state.chip2}
              chipIndex={2}
              isCascaded={true}
            />
          )}

          {/* Output Loads Display */}
          <ShiftRegisterOutputDevices
            state={state}
            deviceType={deviceType}
            onChangeDeviceType={setDeviceType}
            ledColor={ledColor}
            onChangeLedColor={setLedColor}
          />

          {/* Waveform Logic Analyzer */}
          <ShiftRegisterWaveformViewer waveform={waveform} />
        </div>
      </div>

      {/* Code Generation & Educational Guide Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Code Generator (6 cols) */}
        <div className="lg:col-span-6 bg-[#0B0F17] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-mono font-bold text-slate-200">
                {language === 'hu' ? 'FORRÁSKÓD (ARDUINO C++ / AVR C)' : 'SOURCE CODE GENERATOR'}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-black p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setActiveCodeTab('ARDUINO')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    activeCodeTab === 'ARDUINO' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Arduino C++
                </button>
                <button
                  onClick={() => setActiveCodeTab('AVR')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    activeCodeTab === 'AVR' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                  }`}
                >
                  AVR C (Regiszter)
                </button>
              </div>

              <button
                onClick={copyCodeToClipboard}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Másolva!' : 'Másolás'}</span>
              </button>
            </div>
          </div>

          {/* Code Viewer Box */}
          <pre className="p-4 bg-black/80 rounded-xl border border-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-80">
            <code>{activeCodeTab === 'ARDUINO' ? selectedPreset.arduinoCode : selectedPreset.avrCode}</code>
          </pre>
        </div>

        {/* Right: Technical Theory & Pinout Guide (6 cols) */}
        <div className="lg:col-span-6 bg-[#0B0F17] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-mono font-bold text-slate-200">
              {language === 'hu' ? 'A 74HC595 MŰKÖDÉSI ELVE & HASZNA' : 'HOW 74HC595 SIPO WORKS'}
            </h4>
          </div>

          <div className="flex flex-col gap-2.5 text-xs text-slate-300 font-mono leading-relaxed">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <strong className="text-cyan-400 block mb-1">1. Láb-takarékosság (I/O Expander):</strong>
              Mindössze 3 MCU kimenettel (Adat / DS, Órajel / SH_CP, Retesz / ST_CP) 8, 16 vagy akár 32 független kimenet vezérelhető!
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <strong className="text-emerald-400 block mb-1">2. Villogásmentes Kimenet (Glitch-Free Latching):</strong>
              Mivel a shift regiszter és a kimeneti tároló egymástól független, a bitek léptetése alatt a QA..QH lábak állapota nem változik. Csak az ST_CP felfutó élére frissül egyszerre mind a 8 kimenet.
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <strong className="text-purple-400 block mb-1">3. Végtelen Kaszkádolás (QH' Láncolás):</strong>
              Az 1. IC 9-es lábát (QH') a 2. IC 14-es lábára (DS) kötve tetszőleges számú 74HC595 felfűzhető közös órajel és retesz vonalra.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
