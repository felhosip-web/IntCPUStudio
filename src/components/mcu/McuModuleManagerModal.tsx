import React from 'react';
import { BreadboardState, McuHardwareModuleId } from '../../types/mcu';
import { MCU_HARDWARE_CATALOG } from '../../core/mcuModulesCatalog';
import { useI18n } from '../../i18n/I18nContext';
import {
  Check,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Plus,
  PlusCircle,
  Radio,
  Sliders,
  Sparkles,
  Thermometer,
  Wifi,
  X,
  Zap,
} from 'lucide-react';

interface McuModuleManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModules: McuHardwareModuleId[];
  onToggleModule: (id: McuHardwareModuleId) => void;
  onSelectSampleCode?: (sampleId: string) => void;
}

export const McuModuleManagerModal: React.FC<McuModuleManagerModalProps> = ({
  isOpen,
  onClose,
  activeModules,
  onToggleModule,
  onSelectSampleCode,
}) => {
  const { language } = useI18n();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0D111A] border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#080B10]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
                {language === 'hu'
                  ? 'MCU Hardver Bővítőmodulok Kezelője'
                  : 'MCU Hardware Module & Peripherals Manager'}
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {activeModules.length} / {MCU_HARDWARE_CATALOG.length} {language === 'hu' ? 'Aktív' : 'Active'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {language === 'hu'
                  ? 'Bármikor tetszőlegesen hozzáadhatók vagy eltávolíthatók új hardveres szenzorok, órák, rádiók és beavatkozók.'
                  : 'Plug & play modular peripherals: sensors, clocks, rotary encoders, and wireless transceivers.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Module Catalog Grid */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* Info Banner */}
          <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3.5 flex items-start gap-3 text-xs font-mono">
            <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div className="text-slate-300">
              <strong className="text-emerald-300">
                {language === 'hu' ? 'Dinamikus és Bővíthető Architektúra:' : 'Extensible Modular Architecture:'}
              </strong>{' '}
              {language === 'hu'
                ? 'Az MCU emulátor és a Virtuális Breadboard teljesen moduláris. Az egyes modulok önálló busz-meghajtókkal (1-Wire, I2C, SPI, GPIO) működnek, így a jövőben tetszőleges új modulok (pl. újabb kijelzők, motorvezérlők, GPS) is hozzáadhatók.'
                : 'All modules operate with independent protocol drivers (1-Wire, I2C, SPI, GPIO). Future sensors and hardware can be added effortlessly at any time.'}
            </div>
          </div>

          {/* Module Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {MCU_HARDWARE_CATALOG.map((mod) => {
              const isEnabled = activeModules.includes(mod.id);

              return (
                <div
                  key={mod.id}
                  className={`rounded-xl border p-4 flex flex-col justify-between gap-3 transition-all ${
                    isEnabled
                      ? 'bg-slate-900/90 border-slate-700 shadow-md'
                      : 'bg-slate-950/40 border-slate-800/60 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div>
                    {/* Card Title & Protocol Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: mod.color }}
                        />
                        <h3 className="font-mono text-sm font-bold text-slate-100">
                          {language === 'hu' ? mod.nameHu : mod.name}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                        {mod.interfaceType}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs font-mono text-slate-400 mb-3 leading-relaxed">
                      {language === 'hu' ? mod.descriptionHu : mod.description}
                    </p>

                    {/* Pin Mapping */}
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono flex flex-wrap gap-1.5 items-center">
                      <span className="text-slate-500 font-bold">Lábkiosztás:</span>
                      {mod.connectedPins.map((pin, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[10px]"
                        >
                          {pin}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Toggle Button & Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <span className="text-xs font-mono text-slate-500">
                      {isEnabled ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />{' '}
                          {language === 'hu' ? 'Bekapcsolva a Breadboardon' : 'Mounted on Breadboard'}
                        </span>
                      ) : (
                        <span>{language === 'hu' ? 'Lecsatlakoztatva' : 'Unmounted'}</span>
                      )}
                    </span>

                    <button
                      onClick={() => onToggleModule(mod.id)}
                      className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isEnabled
                          ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                      }`}
                    >
                      {isEnabled ? (
                        <>
                          <X className="w-3.5 h-3.5" />
                          {language === 'hu' ? 'Eltávolítás' : 'Remove'}
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          {language === 'hu' ? 'Hozzáadás' : 'Add Module'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#080B10] flex items-center justify-between text-xs font-mono text-slate-400">
          <div>
            {language === 'hu'
              ? 'Tipp: A kiválasztott modulok azonnal megjelennek a virtuális szerelőpanelen.'
              : 'Tip: Active hardware modules render directly on the interactive breadboard canvas.'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer"
          >
            {language === 'hu' ? 'Kész / Bezárás' : 'Done / Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
