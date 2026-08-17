import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Terminal,
  Upload,
  Cpu,
  Zap,
  Sliders,
  FileCode,
  Gauge,
  Activity,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  Send,
  Lightbulb,
  Radio,
  Clock,
  Database,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';
import { Avr8jsRunner, Avr8jsLiveState } from '../../../services/avr8js/avr8jsEngine';
import { SAMPLE_HEX_PROGRAMS, SampleHexProgram } from '../../../services/avr8js/sampleHexPrograms';

export const McuAvr8jsStudio: React.FC = () => {
  const { language } = useI18n();

  // Active program selection
  const [selectedProgram, setSelectedProgram] = useState<SampleHexProgram>(SAMPLE_HEX_PROGRAMS[0]);
  const [customHexText, setCustomHexText] = useState<string>('');
  const [hexTab, setHexTab] = useState<'PRELOADED' | 'CUSTOM_HEX' | 'SOURCE_CODE'>('PRELOADED');

  // Engine instance reference
  const runnerRef = useRef<Avr8jsRunner | null>(null);

  // Live state from avr8js
  const [liveState, setLiveState] = useState<Avr8jsLiveState | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);

  // Serial Monitor states
  const [serialHistory, setSerialHistory] = useState<string>('');
  const [serialInput, setSerialInput] = useState<string>('');
  const [lineEnding, setLineEnding] = useState<'CRLF' | 'LF' | 'CR' | 'NONE'>('CRLF');
  const [baudRate, setBaudRate] = useState<number>(9600);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const serialOutputRef = useRef<HTMLDivElement>(null);

  // Interactive Pin Overrides (Analog A0..A5 voltages in mV)
  const [analogA0, setAnalogA0] = useState<number>(2500); // 2.5V default
  const [analogA1, setAnalogA1] = useState<number>(1000);
  const [hexLoadStatus, setHexLoadStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Waveform history buffer for logic trace (PB5, PD6 PWM, PD1 TX)
  const [waveforms, setWaveforms] = useState<{
    pb5: number[];
    pd6: number[];
    pd1: number[];
  }>({
    pb5: new Array(50).fill(0),
    pd6: new Array(50).fill(0),
    pd1: new Array(50).fill(0),
  });

  // Initialize avr8js Engine on mount
  useEffect(() => {
    const runner = new Avr8jsRunner(selectedProgram.hex);
    runnerRef.current = runner;

    runner.onStateUpdate((state) => {
      setLiveState(state);
      setIsRunning(state.running);
    });

    runner.onSerialChar((char) => {
      setSerialHistory((prev) => prev + char);
    });

    // Start running automatically
    runner.start();

    // Trace interval for live waveforms (sampled at 30 Hz)
    const waveInterval = setInterval(() => {
      if (runnerRef.current) {
        const state = runnerRef.current.getLiveState();
        const pb5Val = state.pin13Led ? 1 : 0;
        const pd6Val = (state.portD & (1 << 6)) !== 0 ? 1 : 0;
        const pd1Val = (state.portD & (1 << 1)) !== 0 ? 1 : 0;

        setWaveforms((prev) => ({
          pb5: [...prev.pb5.slice(1), pb5Val],
          pd6: [...prev.pd6.slice(1), pd6Val],
          pd1: [...prev.pd1.slice(1), pd1Val],
        }));
      }
    }, 40);

    return () => {
      clearInterval(waveInterval);
      runner.destroy();
      runnerRef.current = null;
    };
  }, []);

  // Autoscroll serial terminal
  useEffect(() => {
    if (autoScroll && serialOutputRef.current) {
      serialOutputRef.current.scrollTop = serialOutputRef.current.scrollHeight;
    }
  }, [serialHistory, autoScroll]);

  // Load new preloaded program
  const handleSelectProgram = (prog: SampleHexProgram) => {
    setSelectedProgram(prog);
    setSerialHistory('');
    if (prog.baudRate) setBaudRate(prog.baudRate);

    if (runnerRef.current) {
      const res = runnerRef.current.loadHex(prog.hex);
      if (res.success) {
        setHexLoadStatus({
          success: true,
          message:
            language === 'hu'
              ? `Sikeresen betöltve: ${res.bytesCount} bájt Flash memóriába!`
              : `Successfully loaded ${res.bytesCount} bytes into Flash!`,
        });
        runnerRef.current.start();
      }
    }
  };

  // Upload or apply custom hex
  const handleApplyCustomHex = (hexContent: string) => {
    if (!hexContent.trim()) return;
    if (runnerRef.current) {
      const res = runnerRef.current.loadHex(hexContent);
      if (res.success) {
        setHexLoadStatus({
          success: true,
          message:
            language === 'hu'
              ? `Egyedi Intel HEX betöltve: ${res.bytesCount} bájt (0x0000 - 0x${res.endAddress.toString(16).toUpperCase()})`
              : `Custom Intel HEX loaded: ${res.bytesCount} bytes (0x0000 - 0x${res.endAddress.toString(16).toUpperCase()})`,
        });
        runnerRef.current.start();
      } else {
        setHexLoadStatus({
          success: false,
          message: res.error || (language === 'hu' ? 'Érvénytelen Intel HEX formátum!' : 'Invalid Intel HEX format!'),
        });
      }
    }
  };

  // Drag and drop file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setCustomHexText(text);
          setHexTab('CUSTOM_HEX');
          handleApplyCustomHex(text);
        }
      };
      reader.readAsText(file);
    }
  };

  // Handle Serial Send
  const handleSendSerial = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!serialInput || !runnerRef.current) return;

    let payload = serialInput;
    if (lineEnding === 'CRLF') payload += '\r\n';
    else if (lineEnding === 'LF') payload += '\n';
    else if (lineEnding === 'CR') payload += '\r';

    runnerRef.current.sendSerialInput(payload);
    setSerialInput('');
  };

  // Analog slider update
  const handleAnalogChange = (ch: number, mv: number) => {
    if (ch === 0) setAnalogA0(mv);
    if (ch === 1) setAnalogA1(mv);
    if (runnerRef.current) {
      runnerRef.current.setAnalogVoltage(ch, mv);
    }
  };

  // Speed multiplier update
  const handleSpeedChange = (spd: number) => {
    setSpeedMultiplier(spd);
    if (runnerRef.current) {
      runnerRef.current.speedMultiplier = spd;
    }
  };

  // Formatting helpers
  const formatCycles = (c: number) => {
    return c.toLocaleString();
  };

  const formatFreq = (hz: number) => {
    if (hz >= 1_000_000) return `${(hz / 1_000_000).toFixed(2)} MHz`;
    if (hz >= 1_000) return `${(hz / 1_000).toFixed(1)} kHz`;
    return `${Math.round(hz)} Hz`;
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Engine Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 border border-indigo-400/40">
              <Cpu className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono tracking-tight">
                  {language === 'hu'
                    ? 'avr8js 16 MHz Ciklus-Pontos Hardver Emulátor'
                    : 'avr8js 16 MHz Cycle-Accurate Hardware Emulator'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-wide">
                  TypeScript Core
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ATmega328P @ 16.0 MHz
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'hu'
                  ? 'Valódi Intel HEX bináris végrehajtás, hardveres USART soros port, Fast PWM és analóg ADC perifériák.'
                  : 'Real Intel HEX binary execution, hardware USART serial port, Fast PWM, and analog ADC peripherals.'}
              </p>
            </div>
          </div>

          {/* Quick Engine Telemetry */}
          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800/80 rounded-xl px-4 py-2 font-mono text-xs shadow-inner">
            <div className="text-center pr-3 border-r border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                {language === 'hu' ? 'Szimulált Sebesség' : 'Sim Speed'}
              </div>
              <div className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                <Activity className="w-3 h-3 animate-spin" />
                <span>{liveState?.frequencyHz ? formatFreq(liveState.frequencyHz) : '16.0 MHz'}</span>
              </div>
            </div>

            <div className="text-center pr-3 border-r border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                {language === 'hu' ? 'Gépi Ciklusok' : 'Clock Cycles'}
              </div>
              <div className="text-cyan-300 font-bold">{formatCycles(liveState?.cycles || 0)}</div>
            </div>

            <div className="text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                {language === 'hu' ? 'Program Számláló' : 'Program Counter'}
              </div>
              <div className="text-amber-300 font-bold">
                0x{(liveState?.pc || 0).toString(16).padStart(4, '0').toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Execution Controls & Speed Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B0F17] border border-slate-800 rounded-2xl p-3 shadow-lg">
        {/* Play / Pause / Step Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => runnerRef.current?.toggle()}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isRunning ? (language === 'hu' ? 'SZÜNET' : 'PAUSE') : language === 'hu' ? 'FUTTATÁS (16 MHz)' : 'RUN (16 MHz)'}</span>
          </button>

          <button
            onClick={() => runnerRef.current?.stepInstruction()}
            disabled={isRunning}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700"
            title={language === 'hu' ? '1 Gépi Utasítás Végrehajtása' : 'Step 1 CPU Instruction'}
          >
            <StepForward className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'hu' ? '1 Utasítás' : '1 Step'}</span>
          </button>

          <button
            onClick={() => runnerRef.current?.stepCycles(1000)}
            disabled={isRunning}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700"
            title={language === 'hu' ? '1000 Ciklus Lépése' : 'Step 1000 Cycles'}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>1K {language === 'hu' ? 'Ciklus' : 'Cycles'}</span>
          </button>

          <button
            onClick={() => {
              runnerRef.current?.reset();
              setSerialHistory('');
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer border border-slate-700 transition-colors"
            title={language === 'hu' ? 'Hardveres Reset (0x0000)' : 'Hardware Reset'}
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
          </button>
        </div>

        {/* Speed Multiplier */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
          <Gauge className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 text-[11px]">{language === 'hu' ? 'Sebesség:' : 'Speed:'}</span>
          {[
            { label: '0.1x', val: 0.1 },
            { label: '0.5x', val: 0.5 },
            { label: '1.0x (16MHz)', val: 1.0 },
            { label: '2.0x', val: 2.0 },
          ].map((spd) => (
            <button
              key={spd.val}
              onClick={() => handleSpeedChange(spd.val)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                speedMultiplier === spd.val
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Left (Programs & HEX) | Right (Virtual Hardware & Serial Monitor) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (5 Cols): Program Selection & Hex Loader */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tabs: Preloaded | Custom HEX | Source */}
          <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setHexTab('PRELOADED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    hexTab === 'PRELOADED' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'hu' ? 'Programok' : 'Samples'}</span>
                </button>

                <button
                  onClick={() => setHexTab('CUSTOM_HEX')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    hexTab === 'CUSTOM_HEX' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{language === 'hu' ? 'HEX Betöltő' : 'HEX Loader'}</span>
                </button>

                <button
                  onClick={() => setHexTab('SOURCE_CODE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    hexTab === 'SOURCE_CODE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{language === 'hu' ? 'C Forrás' : 'C Source'}</span>
                </button>
              </div>

              <span className="text-[10px] font-mono text-slate-500 uppercase">
                Flash: 32KB
              </span>
            </div>

            {/* Content: Preloaded Programs */}
            {hexTab === 'PRELOADED' && (
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {SAMPLE_HEX_PROGRAMS.map((prog) => {
                  const isSelected = selectedProgram.id === prog.id;
                  return (
                    <div
                      key={prog.id}
                      onClick={() => handleSelectProgram(prog)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500/60 shadow-md shadow-indigo-950/40 ring-1 ring-indigo-500/30'
                          : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                              prog.category === 'GPIO'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : prog.category === 'UART'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : prog.category === 'PWM'
                                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                : prog.category === 'ADC'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {prog.category}
                          </span>
                          <span className="text-xs font-bold text-slate-200 font-mono">
                            {language === 'hu' ? prog.nameHu : prog.name}
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>

                      <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                        {language === 'hu' ? prog.descriptionHu : prog.description}
                      </p>

                      <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Lightbulb className="w-3 h-3 text-amber-400" />
                          <span>{language === 'hu' ? prog.expectedBehaviorHu : prog.expectedBehavior}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Content: Custom HEX Uploader & Input */}
            {hexTab === 'CUSTOM_HEX' && (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-4 text-center bg-slate-900/40 transition-colors">
                  <Upload className="w-6 h-6 text-indigo-400 mx-auto mb-1.5" />
                  <div className="text-xs font-bold text-slate-300">
                    {language === 'hu' ? 'Húzd ide az Intel .hex fájlt vagy' : 'Drag & drop Intel .hex file or'}
                  </div>
                  <label className="inline-block mt-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors shadow-sm">
                    <span>{language === 'hu' ? 'Fájl Tallózása (.hex)' : 'Browse .hex File'}</span>
                    <input type="file" accept=".hex" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <p className="text-[10px] text-slate-500 mt-1.5">
                    {language === 'hu'
                      ? 'Arduino IDE, Atmel Studio vagy PlatformIO által fordított .hex'
                      : 'Compatible with Arduino IDE, PlatformIO, or avr-gcc output'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-slate-400">
                      {language === 'hu' ? 'Vagy illeszd be a HEX szöveget:' : 'Or paste Intel HEX text:'}
                    </span>
                    <button
                      onClick={() => setCustomHexText('')}
                      className="text-[10px] text-slate-500 hover:text-slate-300 font-mono"
                    >
                      {language === 'hu' ? 'Törlés' : 'Clear'}
                    </button>
                  </div>
                  <textarea
                    value={customHexText}
                    onChange={(e) => setCustomHexText(e.target.value)}
                    placeholder=":100000000C9434000C943E000C943E000C943E00A6..."
                    rows={8}
                    className="w-full bg-[#050811] border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-emerald-400 focus:outline-none focus:border-indigo-500 resize-none shadow-inner"
                  />
                </div>

                <button
                  onClick={() => handleApplyCustomHex(customHexText)}
                  disabled={!customHexText.trim()}
                  className="w-full py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-40 text-white font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-900/30 transition-all"
                >
                  <Zap className="w-4 h-4" />
                  <span>{language === 'hu' ? 'HEX Betöltése a Flash ROM-ba' : 'Flash HEX to ATmega328P'}</span>
                </button>

                {hexLoadStatus && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-mono flex items-center gap-2 ${
                      hexLoadStatus.success
                        ? 'bg-emerald-950/50 border border-emerald-800 text-emerald-300'
                        : 'bg-rose-950/50 border border-rose-800 text-rose-300'
                    }`}
                  >
                    {hexLoadStatus.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{hexLoadStatus.message}</span>
                  </div>
                )}
              </div>
            )}

            {/* Content: C Source Code Reference */}
            {hexTab === 'SOURCE_CODE' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-400">
                    {language === 'hu' ? 'Eredeti C forráskód:' : 'Original C source code:'}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedProgram.sourceCode)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Copy Source"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <pre className="p-3 bg-[#050811] border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[380px] leading-relaxed shadow-inner">
                  {selectedProgram.sourceCode}
                </pre>
              </div>
            )}
          </div>

          {/* Interactive Analog Slider Controls (Potentiometers) */}
          <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200 font-mono">
                  {language === 'hu' ? 'Virtuális Potméterek (ADC Bemenetek)' : 'Virtual Potentiometers (ADC Inputs)'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">10-Bit SAR (0-5V)</span>
            </div>

            {/* A0 Potentiometer */}
            <div className="space-y-1 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-300 font-bold">ADC0 (Pin A0 / PC0):</span>
                <span className="text-emerald-400 font-bold">
                  {(analogA0 / 1000).toFixed(2)}V ({Math.round((analogA0 / 5000) * 1023)} counts)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5000"
                step="10"
                value={analogA0}
                onChange={(e) => handleAnalogChange(0, parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>0.00V (GND)</span>
                <span>2.50V</span>
                <span>5.00V (VCC)</span>
              </div>
            </div>

            {/* A1 Potentiometer */}
            <div className="space-y-1 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-300 font-bold">ADC1 (Pin A1 / PC1):</span>
                <span className="text-emerald-400 font-bold">
                  {(analogA1 / 1000).toFixed(2)}V ({Math.round((analogA1 / 5000) * 1023)} counts)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5000"
                step="10"
                value={analogA1}
                onChange={(e) => handleAnalogChange(1, parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Virtual Arduino Pinout, Logic Waveforms & Hardware Serial Terminal */}
        <div className="lg:col-span-7 space-y-4">
          {/* Arduino Hardware Board & Pinout Visualizer */}
          <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200 font-mono">
                  {language === 'hu' ? 'ATmega328P Lábállapotok & LED 13' : 'ATmega328P Live Pins & LED 13'}
                </span>
              </div>

              {/* Pin 13 Big Status Indicator */}
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl">
                <span className="text-[11px] font-mono text-slate-400">LED D13 (PB5):</span>
                <div
                  className={`w-3.5 h-3.5 rounded-full transition-all ${
                    liveState?.pin13Led
                      ? 'bg-amber-400 shadow-lg shadow-amber-400/80 scale-110 ring-2 ring-amber-300'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                />
                <span
                  className={`text-xs font-mono font-bold ${
                    liveState?.pin13Led ? 'text-amber-300' : 'text-slate-500'
                  }`}
                >
                  {liveState?.pin13Led ? 'HIGH' : 'LOW'}
                </span>
              </div>
            </div>

            {/* Pins Grid (Port D, Port B, Port C) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              {liveState?.pins?.slice(0, 14).map((p) => {
                const isHigh = p.val;
                return (
                  <div
                    key={p.pin}
                    className={`p-2 rounded-xl border flex flex-col justify-between transition-colors ${
                      isHigh
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px]">{p.pin}</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isHigh ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-800'
                        }`}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 truncate">{p.label}</div>
                    <div className="text-[9px] font-bold mt-0.5 text-right">
                      {isHigh ? 'HIGH (5V)' : 'LOW (0V)'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Real-time Oscilloscope / Logic Analyzer Trace */}
            <div className="bg-[#050811] border border-slate-800/80 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{language === 'hu' ? 'Élő Logikai Jelsorozat (30 FPS Mintavételezés)' : 'Live Logic Waveforms (30 FPS Sampled)'}</span>
                </span>
                <span className="text-slate-500">PB5 (D13) / PD6 (PWM) / PD1 (TX)</span>
              </div>

              {/* PB5 Waveform */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-amber-400 w-16 text-right">PB5 (LED):</span>
                <div className="flex-1 h-5 bg-slate-950 border border-slate-800/80 rounded flex items-end px-1 overflow-hidden">
                  <div className="flex items-end h-full gap-0.5 w-full">
                    {waveforms.pb5.map((v, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 transition-all ${
                          v === 1 ? 'h-4 bg-amber-400' : 'h-0.5 bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* PD6 PWM Waveform */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-purple-400 w-16 text-right">PD6 (PWM):</span>
                <div className="flex-1 h-5 bg-slate-950 border border-slate-800/80 rounded flex items-end px-1 overflow-hidden">
                  <div className="flex items-end h-full gap-0.5 w-full">
                    {waveforms.pd6.map((v, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 transition-all ${
                          v === 1 ? 'h-4 bg-purple-400' : 'h-0.5 bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real Hardware USART0 Serial Terminal */}
          <div className="bg-[#0B0F17] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200 font-mono">
                  {language === 'hu' ? 'Hardveres Soros Terminál (USART0 RX/TX)' : 'Hardware Serial Terminal (USART0 RX/TX)'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Baud Rate Selector */}
                <select
                  value={baudRate}
                  onChange={(e) => setBaudRate(parseInt(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value={9600}>9600 Baud</option>
                  <option value={19200}>19200 Baud</option>
                  <option value={38400}>38400 Baud</option>
                  <option value={57600}>57600 Baud</option>
                  <option value={115200}>115200 Baud</option>
                </select>

                {/* Line Ending */}
                <select
                  value={lineEnding}
                  onChange={(e) => setLineEnding(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono rounded-lg px-2 py-1 focus:outline-none hidden sm:inline-block"
                >
                  <option value="CRLF">CR + LF (\r\n)</option>
                  <option value="LF">LF (\n)</option>
                  <option value="CR">CR (\r)</option>
                  <option value="NONE">{language === 'hu' ? 'Nincs sorvég' : 'No line ending'}</option>
                </select>

                <button
                  onClick={() => setSerialHistory('')}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Clear Terminal"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                </button>
              </div>
            </div>

            {/* Output Display */}
            <div
              ref={serialOutputRef}
              className="bg-[#050811] border border-slate-800 rounded-xl p-3 h-48 overflow-y-auto font-mono text-xs text-emerald-400 leading-relaxed whitespace-pre-wrap shadow-inner"
            >
              {serialHistory ? (
                serialHistory
              ) : (
                <span className="text-slate-600 italic">
                  {language === 'hu'
                    ? 'A soros monitor üres. Vár a CPU TX átvitelre (pl. Serial.print vagy UDR0 írás)...'
                    : 'Serial monitor idle. Waiting for CPU TX transmission...'}
                </span>
              )}
            </div>

            {/* Send Input Box */}
            <form onSubmit={handleSendSerial} className="flex items-center gap-2">
              <input
                type="text"
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value)}
                placeholder={
                  language === 'hu'
                    ? 'Írj be szöveget a virtuális MCU-nak küldéshez...'
                    : 'Type text to send to virtual MCU via UDR0...'
                }
                className="flex-1 bg-[#050811] border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500 shadow-inner"
              />
              <button
                type="submit"
                disabled={!serialInput}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-md shadow-indigo-900/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{language === 'hu' ? 'Küldés' : 'Send'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
