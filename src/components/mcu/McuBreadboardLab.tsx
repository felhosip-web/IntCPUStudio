import React, { useState } from 'react';
import { BreadboardState, McuHardwareModuleId, McuState } from '../../types/mcu';
import { useI18n } from '../../i18n/I18nContext';
import { playPortBeep } from '../../core/audio';
import { McuDs18b20Module } from './modules/McuDs18b20Module';
import { McuDs3231Module } from './modules/McuDs3231Module';
import { McuRotaryEncoderModule } from './modules/McuRotaryEncoderModule';
import { McuNrf24Module } from './modules/McuNrf24Module';
import { McuModuleManagerModal } from './McuModuleManagerModal';
import {
  Activity,
  Compass,
  Gauge,
  Layers,
  Lightbulb,
  Plus,
  Radio,
  Sliders,
  Sun,
  Thermometer,
  Zap,
} from 'lucide-react';

interface McuBreadboardLabProps {
  breadboard: BreadboardState;
  onUpdateBreadboard: (updater: (prev: BreadboardState) => BreadboardState) => void;
  onTriggerInterrupt: (vector: 'INT0' | 'INT1') => void;
}

export const McuBreadboardLab: React.FC<McuBreadboardLabProps> = ({
  breadboard,
  onUpdateBreadboard,
  onTriggerInterrupt,
}) => {
  const { language } = useI18n();
  const [buzzerMuted, setBuzzerMuted] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  const activeModules = breadboard.activeModules || [
    'basic_sensors',
    'rgb_servo_lcd',
    'ds18b20',
    'ds3231_rtc',
    'rotary_encoder',
    'nrf24l01',
  ];

  const handleToggleModule = (modId: McuHardwareModuleId) => {
    onUpdateBreadboard((prev) => {
      const current = prev.activeModules || [];
      const nextMods = current.includes(modId)
        ? current.filter((id) => id !== modId)
        : [...current, modId];
      return {
        ...prev,
        activeModules: nextMods,
      };
    });
  };

  // RGB color calculation based on PWM duties (0..255)
  const rVal = breadboard.rgbLed.rDuty;
  const gVal = breadboard.rgbLed.gDuty;
  const bVal = breadboard.rgbLed.bDuty;
  const rgbString = `rgb(${rVal}, ${gVal}, ${bVal})`;
  const rgbBrightness = Math.round(((rVal + gVal + bVal) / (255 * 3)) * 100);

  // Handle Potentiometer Change
  const handlePotChange = (newVal: number) => {
    const clamped = Math.min(1023, Math.max(0, newVal));
    const volt = parseFloat(((clamped / 1023) * 5.0).toFixed(2));
    onUpdateBreadboard((prev) => ({
      ...prev,
      potentiometer: {
        ...prev.potentiometer,
        value: clamped,
        voltage: volt,
      },
    }));
  };

  // Handle Temperature Change
  const handleTempChange = (celsius: number) => {
    const clamped = Math.min(100, Math.max(-20, celsius));
    const volt = parseFloat(((clamped * 0.01) + 0.5).toFixed(3));
    onUpdateBreadboard((prev) => ({
      ...prev,
      tempSensor: {
        ...prev.tempSensor,
        celsius: clamped,
        voltage: volt,
      },
    }));
  };

  // Handle Light (LDR) Change
  const handleLightChange = (lux: number) => {
    const clamped = Math.min(1000, Math.max(0, lux));
    const volt = parseFloat(((clamped / 1000) * 5.0).toFixed(2));
    onUpdateBreadboard((prev) => ({
      ...prev,
      lightSensorLdr: {
        ...prev.lightSensorLdr,
        lux: clamped,
        voltage: volt,
      },
    }));
  };

  // Button 1 (INT0) press handler
  const handleButton1Press = (pressed: boolean) => {
    onUpdateBreadboard((prev) => ({
      ...prev,
      button1: { ...prev.button1, isPressed: pressed },
    }));
    if (pressed) {
      onTriggerInterrupt('INT0');
      if (!buzzerMuted) playPortBeep(880, 0.05);
    }
  };

  return (
    <div className="bg-[#0B0F17] rounded-2xl border border-slate-800 p-4 flex flex-col gap-4 shadow-xl select-none">
      {/* Breadboard Header with Hardware Module Manager Button */}
      <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-bold text-slate-200 flex items-center gap-2">
              {language === 'hu' ? 'Virtuális Breadboard & Moduláris Hardver Lab' : 'Virtual Breadboard & Modular Hardware Lab'}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                {activeModules.length} {language === 'hu' ? 'Modul Aktív' : 'Modules Mounted'}
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">
              {language === 'hu'
                ? 'DS18B20 1-Wire, DS3231 RTC, Rotary Encoder, nRF24L01+ és szabványos perifériák'
                : 'DS18B20 1-Wire, DS3231 RTC, Rotary Encoder, nRF24L01+ and standard peripherals'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono">
          {/* Module Manager Trigger Button */}
          <button
            onClick={() => setIsManagerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 font-bold transition-all cursor-pointer shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'hu' ? '+ Modulok Kezelése / Új Hardver' : '+ Manage Hardware Modules'}</span>
          </button>

          <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hidden sm:inline">
            VCC: <strong className="text-emerald-400">5.0V</strong> | GND: <strong className="text-slate-200">0.0V</strong>
          </span>
        </div>
      </div>

      {/* Module Manager Dialog */}
      <McuModuleManagerModal
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        activeModules={activeModules}
        onToggleModule={handleToggleModule}
      />

      {/* 1. Dedicated Advanced Modular Hardware Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            {language === 'hu' ? 'Csatlakoztatott Hardver Bővítőmodulok:' : 'Attached Hardware Modules:'}
          </span>
          <button
            onClick={() => setIsManagerOpen(true)}
            className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
          >
            {language === 'hu' ? 'Modulok be/kikapcsolása...' : 'Configure modules...'}
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
          {/* DS18B20 1-Wire Thermometer Module */}
          {activeModules.includes('ds18b20') && (
            <McuDs18b20Module
              state={breadboard.ds18b20}
              onChange={(updater) =>
                onUpdateBreadboard((prev) => ({
                  ...prev,
                  ds18b20: updater(prev.ds18b20),
                }))
              }
            />
          )}

          {/* DS3231 / DS1307 High-Precision RTC Module */}
          {activeModules.includes('ds3231_rtc') && (
            <McuDs3231Module
              state={breadboard.ds3231}
              onChange={(updater) =>
                onUpdateBreadboard((prev) => ({
                  ...prev,
                  ds3231: updater(prev.ds3231),
                }))
              }
            />
          )}

          {/* Rotary Quadrature Encoder Module */}
          {activeModules.includes('rotary_encoder') && (
            <McuRotaryEncoderModule
              state={breadboard.rotaryEncoder}
              onChange={(updater) =>
                onUpdateBreadboard((prev) => ({
                  ...prev,
                  rotaryEncoder: updater(prev.rotaryEncoder),
                }))
              }
              onTriggerInterrupt={onTriggerInterrupt}
            />
          )}

          {/* nRF24L01+ 2.4GHz RF Transceiver Module */}
          {activeModules.includes('nrf24l01') && (
            <McuNrf24Module
              state={breadboard.nrf24}
              onChange={(updater) =>
                onUpdateBreadboard((prev) => ({
                  ...prev,
                  nrf24: updater(prev.nrf24),
                }))
              }
              onTriggerInterrupt={onTriggerInterrupt}
            />
          )}
        </div>
      </div>

      {/* 2. Standard Sensors, Actuators & I/O Section */}
      <div className="flex flex-col gap-3 pt-2 border-t border-slate-800/80">
        <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          {language === 'hu' ? 'Alap Breadboard Komponensek & Aktuátorok:' : 'Base Breadboard Components & Actuators:'}
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* PB5 (Pin 13) Onboard LED */}
          <div className="p-3 rounded-xl bg-[#0F172A]/80 border border-slate-800 flex flex-col justify-between gap-2 shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                PB5 / Pin 13 LED
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  breadboard.ledPin13
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'bg-slate-900 text-slate-500'
                }`}
              >
                {breadboard.ledPin13 ? 'HIGH (1)' : 'LOW (0)'}
              </span>
            </div>

            <div className="flex items-center justify-center py-2">
              <div
                className={`w-10 h-10 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
                  breadboard.ledPin13
                    ? 'bg-amber-400 border-amber-200 shadow-[0_0_24px_rgba(251,191,36,0.9)] scale-105'
                    : 'bg-amber-950/30 border-amber-900/40 opacity-50'
                }`}
              >
                <Zap
                  className={`w-5 h-5 ${
                    breadboard.ledPin13 ? 'text-amber-950 animate-pulse' : 'text-amber-700/40'
                  }`}
                />
              </div>
            </div>
            <div className="text-[9px] text-center text-slate-500 font-mono">
              Direct MCU Pin 19 Output
            </div>
          </div>

          {/* 3-Channel Hardware PWM RGB LED */}
          <div className="p-3 rounded-xl bg-[#0F172A]/80 border border-slate-800 flex flex-col justify-between gap-2 shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-rose-400" />
                PWM RGB LED (D6, D5, D3)
              </span>
              <span className="text-[9px] font-mono text-slate-400">
                {rgbBrightness}% Fényerő
              </span>
            </div>

            <div className="flex items-center justify-center py-1">
              <div
                className="w-10 h-10 rounded-full border-2 border-slate-600 transition-all duration-100 flex items-center justify-center shadow-lg"
                style={{
                  backgroundColor: rgbString,
                  boxShadow: `0 0 20px ${rgbString}`,
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-1 text-[9px] font-mono text-center">
              <span className="px-1 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                R: {rVal}
              </span>
              <span className="px-1 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                G: {gVal}
              </span>
              <span className="px-1 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                B: {bVal}
              </span>
            </div>
          </div>

          {/* Potentiometer (A0) */}
          <div className="p-3 rounded-xl bg-[#0F172A]/80 border border-slate-800 flex flex-col justify-between gap-2 shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                Potméter (ADC0 / A0)
              </span>
              <span className="text-cyan-400 font-bold text-[10px]">
                {breadboard.potentiometer.voltage} V
              </span>
            </div>

            <div className="flex items-center gap-2 py-1">
              <input
                type="range"
                min="0"
                max="1023"
                value={breadboard.potentiometer.value}
                onChange={(e) => handlePotChange(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div className="flex justify-between text-[9px] font-mono text-slate-500">
              <span>0V (0)</span>
              <span className="text-cyan-300 font-bold">
                10-Bit ADC: {breadboard.potentiometer.value}
              </span>
              <span>5V (1023)</span>
            </div>
          </div>

          {/* RC Servo Motor (PB1 / OC1A) */}
          <div className="p-3 rounded-xl bg-[#0F172A]/80 border border-slate-800 flex flex-col justify-between gap-2 shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                RC Szervó (PB1 / D9)
              </span>
              <span className="text-amber-400 font-bold text-[10px]">
                {breadboard.servoMotor.angle}°
              </span>
            </div>

            <div className="flex items-center justify-center py-2 relative">
              <div className="w-20 h-10 border-t-2 border-l-2 border-r-2 border-slate-700 rounded-t-full relative flex items-end justify-center">
                <div
                  className="w-1 h-8 bg-amber-400 origin-bottom rounded-full transition-transform duration-200"
                  style={{
                    transform: `rotate(${breadboard.servoMotor.angle - 90}deg)`,
                  }}
                />
                <div className="w-3 h-3 rounded-full bg-slate-200 absolute -bottom-1" />
              </div>
            </div>

            <div className="text-[9px] text-center text-slate-500 font-mono">
              Timer1 50Hz PWM ({1000 + Math.round((breadboard.servoMotor.angle / 180) * 1000)} µs)
            </div>
          </div>

          {/* External Interrupt Button (INT0 / PD2) */}
          <div className="p-3 rounded-xl bg-[#0F172A]/80 border border-slate-800 flex flex-col justify-between gap-2 shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                Nyomógomb (INT0 / PD2)
              </span>
              <span className="text-[9px] font-mono text-emerald-400">EXT ISR Trigger</span>
            </div>

            <div className="flex items-center justify-center py-1">
              <button
                onMouseDown={() => handleButton1Press(true)}
                onMouseUp={() => handleButton1Press(false)}
                onMouseLeave={() => handleButton1Press(false)}
                onTouchStart={() => handleButton1Press(true)}
                onTouchEnd={() => handleButton1Press(false)}
                className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                  breadboard.button1.isPressed
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/50 scale-98'
                    : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {breadboard.button1.isPressed ? '● LENYOMVA (LOW / 0V)' : 'GOMB LENYOMÁSA (INT0)'}
              </button>
            </div>

            <div className="text-[9px] text-center text-slate-500 font-mono">
              Pin 4 / PD2 (Vector 0x0002)
            </div>
          </div>

          {/* 16x2 LCD Display */}
          <div className="p-3 rounded-xl bg-[#0F172A]/80 border border-slate-800 flex flex-col justify-between gap-2 shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                16x2 LCD (HD44780)
              </span>
              <button
                onClick={() => {
                  onUpdateBreadboard((prev) => ({
                    ...prev,
                    lcd16x2: { ...prev.lcd16x2, backlight: !prev.lcd16x2.backlight },
                  }));
                }}
                className="text-[9px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                {breadboard.lcd16x2.backlight ? 'Háttérfény BE' : 'Háttérfény KI'}
              </button>
            </div>

            <div
              className={`p-2 rounded-lg border font-mono text-xs tracking-widest shadow-inner transition-colors ${
                breadboard.lcd16x2.backlight
                  ? 'bg-[#004466] border-cyan-500/50 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-[#0a1a1f] border-slate-800 text-slate-700'
              }`}
            >
              <div className="truncate">{breadboard.lcd16x2.lines[0] || '                '}</div>
              <div className="truncate">{breadboard.lcd16x2.lines[1] || '                '}</div>
            </div>

            <div className="text-[9px] text-center text-slate-500 font-mono">
              I2C / 4-Bit Bus (SDA: A4, SCL: A5)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
