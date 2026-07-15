/**
 * Recording History for Parvez Draw
 * Stores drawing recordings (time-lapse + voice) in IndexedDB.
 */

import { createStore, get, set, del, keys } from "idb-keyval";

const DB_STORE = createStore("parvezdraw-recordings-db", "recordings");

const MAX_RECORDINGS = 20;

export interface Recording {
  id: string;
  timestamp: number;
  duration: number;
  hasAudio: boolean;
  blob: Blob;
  thumbnail?: string; // data URL of a canvas snapshot
  name?: string;
}

export const RecordingHistory = {
  async saveRecording(recording: Omit<Recording, "id">): Promise<Recording> {
    const id = `recording-${recording.timestamp}`;
    const fullRecording: Recording = { ...recording, id };

    try {
      await set(id, fullRecording, DB_STORE);
      await this.evictOldRecordings();
      return fullRecording;
    } catch (error) {
      console.error("Failed to save recording:", error);
      throw error;
    }
  },

  async getRecordings(): Promise<Recording[]> {
    try {
      const allKeys = await keys(DB_STORE);
      const recordings: Recording[] = [];

      for (const key of allKeys) {
        if (typeof key === "string" && key.startsWith("recording-")) {
          const recording = await get<Recording>(key, DB_STORE);
          if (recording) {
            recordings.push(recording);
          }
        }
      }

      return recordings.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Failed to get recordings:", error);
      return [];
    }
  },

  async getRecording(id: string): Promise<Recording | null> {
    try {
      return (await get<Recording>(id, DB_STORE)) || null;
    } catch (error) {
      console.error("Failed to get recording:", error);
      return null;
    }
  },

  async deleteRecording(id: string): Promise<void> {
    try {
      await del(id, DB_STORE);
    } catch (error) {
      console.error("Failed to delete recording:", error);
    }
  },

  async clearAll(): Promise<void> {
    try {
      const allKeys = await keys(DB_STORE);
      for (const key of allKeys) {
        await del(key, DB_STORE);
      }
    } catch (error) {
      console.error("Failed to clear recordings:", error);
    }
  },

  async evictOldRecordings(): Promise<void> {
    try {
      const recordings = await this.getRecordings();
      if (recordings.length > MAX_RECORDINGS) {
        const toDelete = recordings.slice(MAX_RECORDINGS);
        for (const recording of toDelete) {
          await del(recording.id, DB_STORE);
        }
      }
    } catch (error) {
      console.error("Failed to evict old recordings:", error);
    }
  },
};
