/**
 * Auto-save hook for Parvez Draw
 * Automatically saves the canvas at the configured interval.
 */

import { useEffect, useRef, useCallback } from "react";

import type { ExcalidrawImperativeAPI } from "@prof/core/types";

import { AppSettings } from "../data/settings";
import { LocalData } from "../data/LocalData";

export const useAutoSave = (
  excalidrawAPI: ExcalidrawImperativeAPI | null,
) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSaveRef = useRef<number>(Date.now());

  const save = useCallback(() => {
    if (!excalidrawAPI) return;

    try {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const files = excalidrawAPI.getFiles();

      LocalData.save(elements, appState, files, () => {
        lastSaveRef.current = Date.now();
      });
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, [excalidrawAPI]);

  useEffect(() => {
    const interval = AppSettings.getAutoSaveInterval();

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Set up new interval if not manual
    if (interval > 0) {
      intervalRef.current = setInterval(save, interval * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [save]);

  // Save on visibility change (when user switches tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        save();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [save]);

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      save();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [save]);

  return { save };
};
