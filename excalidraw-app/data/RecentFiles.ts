/**
 * Recent Files for Parvez Draw
 * Maintains a list of recently opened/saved files in localStorage.
 */

export interface RecentFile {
  id: string;
  name: string;
  lastModified: number;
  storageKey?: string;
  thumbnail?: string;
  elementCount?: number;
}

const STORAGE_KEY = "parvezdraw-recent-files";
const MAX_RECENT_FILES = 20;

export const RecentFiles = {
  getRecentFiles(): RecentFile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error("Failed to read recent files:", error);
    }
    return [];
  },

  addRecentFile(file: Omit<RecentFile, "lastModified">): void {
    try {
      const files = this.getRecentFiles();
      const now = Date.now();

      // Remove existing entry with same id
      const filtered = files.filter((f) => f.id !== file.id);

      // Add updated entry at the beginning
      const updated: RecentFile = {
        ...file,
        lastModified: now,
      };

      // Add to beginning and limit to MAX
      const newFiles = [updated, ...filtered].slice(0, MAX_RECENT_FILES);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFiles));
    } catch (error) {
      console.error("Failed to add recent file:", error);
    }
  },

  updateRecentFile(id: string, updates: Partial<RecentFile>): void {
    try {
      const files = this.getRecentFiles();
      const index = files.findIndex((f) => f.id === id);

      if (index !== -1) {
        files[index] = {
          ...files[index],
          ...updates,
          lastModified: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
      }
    } catch (error) {
      console.error("Failed to update recent file:", error);
    }
  },

  removeRecentFile(id: string): void {
    try {
      const files = this.getRecentFiles();
      const filtered = files.filter((f) => f.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Failed to remove recent file:", error);
    }
  },

  clearRecentFiles(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear recent files:", error);
    }
  },

  createFromFile(name: string, storageKey: string): RecentFile {
    return {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      lastModified: Date.now(),
      storageKey,
    };
  },

  formatLastModified(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  },
};
