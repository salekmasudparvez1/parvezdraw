/**
 * Parvez Draw Settings
 * Manages app-specific settings stored in localStorage.
 */

export interface ParvezDrawSettings {
  autoSaveInterval: number; // in seconds, 0 = manual only
  performanceMode: boolean;
  highDpiMode: boolean;
  recentFilesMaxCount: number;
}

const STORAGE_KEY = "parvezdraw-settings";

const DEFAULT_SETTINGS: ParvezDrawSettings = {
  autoSaveInterval: 30, // 30 seconds
  performanceMode: false,
  highDpiMode: true,
  recentFilesMaxCount: 20,
};

export const AppSettings = {
  get(): ParvezDrawSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error("Failed to read settings:", error);
    }
    return { ...DEFAULT_SETTINGS };
  },

  update(updates: Partial<ParvezDrawSettings>): void {
    try {
      const current = this.get();
      const merged = { ...current, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  },

  getAutoSaveInterval(): number {
    return this.get().autoSaveInterval;
  },

  setAutoSaveInterval(seconds: number): void {
    this.update({ autoSaveInterval: seconds });
  },

  isPerformanceMode(): boolean {
    return this.get().performanceMode;
  },

  setPerformanceMode(enabled: boolean): void {
    this.update({ performanceMode: enabled });
  },

  isHighDpiMode(): boolean {
    return this.get().highDpiMode;
  },

  setHighDpiMode(enabled: boolean): void {
    this.update({ highDpiMode: enabled });
  },

  reset(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
