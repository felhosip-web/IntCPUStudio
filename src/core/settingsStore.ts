import { DEFAULT_SETTINGS, SimulatorSettings } from '../types/settings';

const STORAGE_KEY = 'cpu_simulator_settings_v1';

export function loadStoredSettings(): SimulatorSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: SimulatorSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save settings to localStorage:', err);
  }
}

export function resetStoredSettings(): SimulatorSettings {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  return DEFAULT_SETTINGS;
}
