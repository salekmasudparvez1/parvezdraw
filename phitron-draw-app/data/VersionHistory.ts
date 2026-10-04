




import { createStore, get, set, del, keys } from "idb-keyval";

import type { ExcalidrawElement } from "@prof/element/types";
import type { AppState } from "@prof/core/types";

const DB_STORE = createStore("parvezdraw-version-history-db", "versions");

const MAX_SNAPSHOTS = 50;
const SNAPSHOT_INTERVAL_MS = 5 * 60 * 1000; 
const MIN_ELEMENT_CHANGES = 5;

export interface VersionSnapshot {
  id: string;
  timestamp: number;
  elements: readonly ExcalidrawElement[];
  appState: Partial<AppState>;
  elementCount: number;
}

let lastSnapshotTime = 0;
let lastElementCount = 0;

export const VersionHistory = {
  async saveSnapshot(
    elements: readonly ExcalidrawElement[],
    appState: Partial<AppState>,
  ): Promise<boolean> {
    const now = Date.now();
    const elementCount = elements.length;
    const timeSinceLastSnapshot = now - lastSnapshotTime;
    const elementDelta = Math.abs(elementCount - lastElementCount);

    
    if (
      lastSnapshotTime > 0 &&
      timeSinceLastSnapshot < SNAPSHOT_INTERVAL_MS &&
      elementDelta < MIN_ELEMENT_CHANGES
    ) {
      return false;
    }

    const snapshot: VersionSnapshot = {
      id: `snapshot-${now}`,
      timestamp: now,
      elements: elements as readonly ExcalidrawElement[],
      appState,
      elementCount,
    };

    try {
      await set(snapshot.id, snapshot, DB_STORE);
      lastSnapshotTime = now;
      lastElementCount = elementCount;

      
      await this.evictOldSnapshots();

      return true;
    } catch (error) {
      console.error("Failed to save version snapshot:", error);
      return false;
    }
  },

  async getSnapshots(): Promise<VersionSnapshot[]> {
    try {
      const allKeys = await keys(DB_STORE);
      const snapshots: VersionSnapshot[] = [];

      for (const key of allKeys) {
        if (typeof key === "string" && key.startsWith("snapshot-")) {
          const snapshot = await get<VersionSnapshot>(key, DB_STORE);
          if (snapshot) {
            snapshots.push(snapshot);
          }
        }
      }

      
      return snapshots.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Failed to get version snapshots:", error);
      return [];
    }
  },

  async getSnapshot(id: string): Promise<VersionSnapshot | null> {
    try {
      return await get<VersionSnapshot>(id, DB_STORE) || null;
    } catch (error) {
      console.error("Failed to get version snapshot:", error);
      return null;
    }
  },

  async deleteSnapshot(id: string): Promise<void> {
    try {
      await del(id, DB_STORE);
    } catch (error) {
      console.error("Failed to delete version snapshot:", error);
    }
  },

  async clearAll(): Promise<void> {
    try {
      const allKeys = await keys(DB_STORE);
      for (const key of allKeys) {
        await del(key, DB_STORE);
      }
      lastSnapshotTime = 0;
      lastElementCount = 0;
    } catch (error) {
      console.error("Failed to clear version snapshots:", error);
    }
  },

  async evictOldSnapshots(): Promise<void> {
    try {
      const snapshots = await this.getSnapshots();
      if (snapshots.length > MAX_SNAPSHOTS) {
        const toDelete = snapshots.slice(MAX_SNAPSHOTS);
        for (const snapshot of toDelete) {
          await del(snapshot.id, DB_STORE);
        }
      }
    } catch (error) {
      console.error("Failed to evict old snapshots:", error);
    }
  },

  
  hasSignificantChanges(
    elements: readonly ExcalidrawElement[],
    previousCount: number,
  ): boolean {
    return Math.abs(elements.length - previousCount) >= MIN_ELEMENT_CHANGES;
  },

  
  reset(): void {
    lastSnapshotTime = 0;
    lastElementCount = 0;
  },
};
