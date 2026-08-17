import React, { ReactNode, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  GripHorizontal,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';

interface ModuleCardProps {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
  children: ReactNode;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  onClose?: () => void;
  onFocus?: () => void;
  className?: string;
  headerRightActions?: ReactNode;
  accentColor?: string; // e.g. 'emerald', 'cyan', 'amber', 'purple', 'blue'
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  id,
  title,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  children,
  isMinimized = false,
  onToggleMinimize,
  onClose,
  onFocus,
  className = '',
  headerRightActions,
  accentColor = 'border-l-2 border-l-cyan-500/50',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      id={`module-card-${id}`}
      onClick={onFocus}
      className={`relative flex flex-col module-border rounded-xl shadow-2xl shadow-black/60 overflow-hidden transition-all duration-150 ${accentColor} ${
        isExpanded ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl' : ''
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 module-header select-none cursor-move group">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="drag-handle p-1 text-slate-500 group-hover:text-slate-300 hover:bg-slate-800/60 rounded cursor-grab active:cursor-grabbing transition-colors">
            <GripHorizontal className="w-3.5 h-3.5" />
          </div>
          <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50 text-cyan-400">
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-200 truncate font-mono">
                {title}
              </h3>
              {badge !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-medium ${badgeColor}`}
                >
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div
          className="flex items-center gap-1 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {headerRightActions}

          <button
            id={`btn-expand-${id}`}
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Visszaállítás' : 'Teljes nézet'}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded transition-colors"
          >
            {isExpanded ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>

          {onToggleMinimize && (
            <button
              id={`btn-minimize-${id}`}
              onClick={onToggleMinimize}
              title={isMinimized ? 'Kinyitás' : 'Összecsukás'}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded transition-colors"
            >
              {isMinimized ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {onClose && (
            <button
              id={`btn-close-${id}`}
              onClick={onClose}
              title="Modul elrejtése"
              className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <div className="flex-1 overflow-auto p-3.5 text-slate-300 font-sans text-xs">
          {children}
        </div>
      )}
    </div>
  );
};
