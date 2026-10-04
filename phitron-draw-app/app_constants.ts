
export const SAVE_TO_LOCAL_STORAGE_TIMEOUT = 300;
export const INITIAL_SCENE_UPDATE_TIMEOUT = 5000;
export const SYNC_BROWSER_TABS_TIMEOUT = 50;
export const DELETED_ELEMENT_TIMEOUT = 24 * 60 * 60 * 1000; 

export const STORAGE_KEYS = {
  LOCAL_STORAGE_ELEMENTS: "parvezdraw",
  LOCAL_STORAGE_APP_STATE: "parvezdraw-state",
  LOCAL_STORAGE_THEME: "parvezdraw-theme",
  LOCAL_STORAGE_DEBUG: "parvezdraw-debug",
  VERSION_DATA_STATE: "version-dataState",
  VERSION_FILES: "version-files",

  IDB_LIBRARY: "parvezdraw-library",

  
  __LEGACY_LOCAL_STORAGE_LIBRARY: "excalidraw-library",
} as const;
