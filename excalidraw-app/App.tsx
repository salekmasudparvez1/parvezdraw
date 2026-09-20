import {
  Excalidraw,
  CaptureUpdateAction,
  useEditorInterface,
  ExcalidrawAPIProvider,
  useExcalidrawAPI,
} from "@prof/core";
import { trackEvent } from "@prof/core/analytics";
import {
  CommandPalette,
  DEFAULT_CATEGORIES,
} from "@prof/core/components/CommandPalette/CommandPalette";
import { ErrorDialog } from "@prof/core/components/ErrorDialog";
import { OverwriteConfirmDialog } from "@prof/core/components/OverwriteConfirm/OverwriteConfirm";
import Trans from "@prof/core/components/Trans";
import {
  APP_NAME,
  EVENT,
  VERSION_TIMEOUT,
  debounce,
  getVersion,
  getFrame,
  isTestEnv,
  preventUnload,
  resolvablePromise,
} from "@prof/common";
import polyfill from "@prof/core/polyfill";
import { useCallback, useEffect, useRef, useState } from "react";
import { loadFromBlob } from "@prof/core/data/blob";
import { t } from "@prof/core/i18n";

import { GithubIcon } from "@prof/core/components/icons";
import { newElementWith } from "@prof/element";
import { restoreAppState, restoreElements } from "@prof/core/data/restore";
import { isInitializedImageElement } from "@prof/element";
import clsx from "clsx";
import {
  parseLibraryTokensFromUrl,
  useHandleLibrary,
} from "@prof/core/data/library";

import type {
  ExcalidrawElement,
  FileId,
  NonDeletedExcalidrawElement,
  OrderedExcalidrawElement,
} from "@prof/element/types";
import type {
  AppState,
  ExcalidrawImperativeAPI,
  BinaryFiles,
  ExcalidrawInitialDataState,
  UIAppState,
  ExcalidrawProps,
} from "@prof/core/types";
import type { ResolutionType } from "@prof/common/utility-types";
import type { ResolvablePromise } from "@prof/common/utils";

import CustomStats from "./CustomStats";
import { Provider, useAtom, useAtomValue, appJotaiStore } from "./app-jotai";
import { STORAGE_KEYS, SYNC_BROWSER_TABS_TIMEOUT } from "./app_constants";
import { AppFooter } from "./components/AppFooter";
import { AppMainMenu } from "./components/AppMainMenu";
import { AppWelcomeScreen } from "./components/AppWelcomeScreen";
import { TopErrorBoundary } from "./components/TopErrorBoundary";
import { TopBar } from "./components/TopBar";
import { LeftSidebar } from "./components/LeftSidebar";
import { BottomBar } from "./components/BottomBar";
import { updateStaleImageStatuses } from "./data/FileManager";
import { FileStatusStore } from "./data/fileStatusStore";
import { importFromLocalStorage } from "./data/localStorage";
import {
  LibraryIndexedDBAdapter,
  LibraryLocalStorageMigrationAdapter,
  LocalData,
  localStorageQuotaExceededAtom,
} from "./data/LocalData";
import { isBrowserStorageStateNewer } from "./data/tabSync";
import { useHandleAppTheme } from "./useHandleAppTheme";
import { getPreferredLanguage } from "./app-language/language-detector";
import { useAppLangCode } from "./app-language/language-state";
import DebugCanvas, {
  debugRenderer,
  isVisualDebuggerEnabled,
  loadSavedDebugState,
} from "./components/DebugCanvas";

import {
  exportToPNG,
  exportToSVG,
  exportToPDF,
  exportToJSON,
} from "./data/exportUtils";
import { RecentFilesPanel } from "./components/RecentFilesPanel";
import { useAutoSave } from "./hooks/useAutoSave";
import { RecentFiles } from "./data/RecentFiles";
import { CanvasSearch } from "./components/CanvasSearch";
import { ColorPalettePanel } from "./components/ColorPalettePanel";
import {
  SidebarEyeButton,
  type SidebarEyePosition,
} from "./components/LeftSidebar";

import "./index.scss";

polyfill();

window.EXCALIDRAW_THROTTLE_RENDER = true;

const initializeScene = async (opts: {
  excalidrawAPI: ExcalidrawImperativeAPI;
}): Promise<{ scene: ExcalidrawInitialDataState | null }> => {
  const localDataState = importFromLocalStorage();

  const scene: Omit<ExcalidrawInitialDataState, "files"> & {
    scrollToContent?: boolean;
  } = {
    elements: restoreElements(localDataState?.elements, null, {
      repairBindings: true,
      deleteInvisibleElements: true,
    }),
    appState: restoreAppState(localDataState?.appState, null),
  };

  return { scene };
};

const ExcalidrawWrapper = () => {
  const excalidrawAPI = useExcalidrawAPI();

  const [errorMessage, setErrorMessage] = useState("");
  const [recentFilesOpen, setRecentFilesOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarEyePosition, setSidebarEyePosition] =
    useState<SidebarEyePosition>({ left: 12, top: 60 });
  const [activeTool, setActiveTool] = useState("selection");
  const [searchOpen, setSearchOpen] = useState(false);
  const [colorPaletteOpen, setColorPaletteOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState("#0078D4");
  const [workspaceName, setWorkspaceName] = useState("Untitled");
  const [isRecording, setIsRecording] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [recordingTime, setRecordingTime] = useState("00:00");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  const { editorTheme, appTheme, setAppTheme } = useHandleAppTheme();

  const [langCode, setLangCode] = useAppLangCode();

  const editorInterface = useEditorInterface();

  // Canvas ref for recording feature
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);

  // Get canvas element when container mounts
  useEffect(() => {
    const findCanvas = () => {
      if (canvasContainerRef.current) {
        const canvas = canvasContainerRef.current.querySelector("canvas");
        if (canvas) {
          setCanvasRef(canvas);
        }
      }
    };
    // Try immediately and after a short delay (canvas may mount later)
    findCanvas();
    const timer = setTimeout(findCanvas, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-save hook
  useAutoSave(excalidrawAPI);

  // Handle tool selection from sidebar
  const handleToolSelect = useCallback(
    (toolId: string) => {
      setActiveTool(toolId);
      // Map sidebar tool IDs to Excalidraw tool types
      const toolMap: Record<string, string> = {
        selection: "selection",
        hand: "hand",
        rectangle: "rectangle",
        diamond: "diamond",
        ellipse: "ellipse",
        line: "line",
        arrow: "arrow",
        text: "text",
        freedraw: "freedraw",
        image: "image",
        eraser: "eraser",
        frame: "frame",
        laser: "laser",
        lasso: "lasso",
      };
      const excalidrawTool = toolMap[toolId];
      if (excalidrawTool && excalidrawAPI) {
        excalidrawAPI.setActiveTool({ type: excalidrawTool as any });
      }
    },
    [excalidrawAPI],
  );

  // Handle undo/redo via keyboard shortcuts (Excalidraw handles this internally)
  const handleUndo = useCallback(() => {
    // Excalidraw handles undo via keyboard shortcuts
    // We can trigger it by dispatching a keyboard event
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "z", ctrlKey: true }),
    );
  }, []);

  const handleRedo = useCallback(() => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "z", ctrlKey: true, shiftKey: true }),
    );
  }, []);

  // Recording functions
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      // Stop recording
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setIsRecording(false);
      setRecordingTime("00:00");
    } else {
      // Start recording
      if (!canvasRef) return;
      try {
        const videoStream = canvasRef.captureStream(60);
        let combinedStream: MediaStream;
        if (audioEnabled) {
          try {
            const audioStream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 48000,
              },
            });
            combinedStream = new MediaStream([
              ...videoStream.getVideoTracks(),
              ...audioStream.getAudioTracks(),
            ]);
          } catch {
            combinedStream = videoStream;
          }
        } else {
          combinedStream = videoStream;
        }
        const mimeTypes = [
          "video/webm;codecs=vp9,opus",
          "video/webm;codecs=vp8,opus",
          "video/webm",
        ];
        let mimeType = "";
        for (const type of mimeTypes) {
          if (MediaRecorder.isTypeSupported(type)) {
            mimeType = type;
            break;
          }
        }
        const recorder = new MediaRecorder(combinedStream, {
          mimeType: mimeType || undefined,
          videoBitsPerSecond: 8000000,
          audioBitsPerSecond: 256000,
        });
        recordingChunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordingChunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(recordingChunksRef.current, {
            type: mimeType || "video/webm",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `vision-suite-${new Date()
            .toISOString()
            .slice(0, 19)
            .replace(/:/g, "-")}.webm`;
          a.click();
          URL.revokeObjectURL(url);
        };
        recorder.start(500);
        mediaRecorderRef.current = recorder;
        recordingStartTimeRef.current = Date.now();
        setIsRecording(true);
        recordingTimerRef.current = setInterval(() => {
          setRecordingTime(
            formatRecordingTime(
              Math.floor((Date.now() - recordingStartTimeRef.current) / 1000),
            ),
          );
        }, 1000);
      } catch (err) {
        console.error("Recording failed:", err);
      }
    }
  }, [isRecording, canvasRef, audioEnabled]);

  // Get app state for UI
  const appState = excalidrawAPI?.getAppState();
  const canUndo = true; // Excalidraw manages undo state internally
  const canRedo = false;
  const zoom = appState?.zoom?.value ?? 1;
  const gridEnabled = appState?.gridModeEnabled ?? false;
  const snapEnabled = false; // snapLines is an array, not an object with enabled

  // initial state
  const initialStatePromiseRef = useRef<{
    promise: ResolvablePromise<ExcalidrawInitialDataState | null>;
  }>({ promise: null! });
  if (!initialStatePromiseRef.current.promise) {
    initialStatePromiseRef.current.promise =
      resolvablePromise<ExcalidrawInitialDataState | null>();
  }

  const debugCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    trackEvent("load", "frame", getFrame());
    setTimeout(() => {
      trackEvent("load", "version", getVersion());
    }, VERSION_TIMEOUT);
  }, []);

  useHandleLibrary({
    excalidrawAPI,
    adapter: LibraryIndexedDBAdapter,
    migrationAdapter: LibraryLocalStorageMigrationAdapter,
  });

  const [, forceRefresh] = useState(false);

  useEffect(() => {
    if (isTestEnv()) {
      const debugState = loadSavedDebugState();
      if (debugState.enabled && !window.visualDebug) {
        window.visualDebug = {
          data: [],
        };
      } else {
        delete window.visualDebug;
      }
      forceRefresh((prev) => !prev);
    }
  }, [excalidrawAPI]);

  // Load images from local storage
  const loadImages = useCallback(
    (data: ResolutionType<typeof initializeScene>, isInitialLoad = false) => {
      if (!data.scene || !excalidrawAPI) {
        return;
      }

      const fileIds =
        data.scene.elements?.reduce((acc, element) => {
          if (isInitializedImageElement(element)) {
            return acc.concat(element.fileId);
          }
          return acc;
        }, [] as FileId[]) || [];

      if (isInitialLoad) {
        if (fileIds.length) {
          LocalData.fileStorage
            .getFiles(fileIds)
            .then(async ({ loadedFiles, erroredFiles }) => {
              if (loadedFiles.length) {
                excalidrawAPI.addFiles(loadedFiles);
              }
              updateStaleImageStatuses({
                excalidrawAPI,
                erroredFiles,
                elements: excalidrawAPI.getSceneElementsIncludingDeleted(),
              });
            });
        }
        LocalData.fileStorage.clearObsoleteFiles({
          currentFileIds: fileIds,
        });
      }
    },
    [excalidrawAPI],
  );

  useEffect(() => {
    if (!excalidrawAPI) {
      return;
    }

    initializeScene({ excalidrawAPI }).then(async (data) => {
      loadImages(data, /* isInitialLoad */ true);
      initialStatePromiseRef.current.promise.resolve(data.scene);
    });

    const onHashChange = async (event: HashChangeEvent) => {
      event.preventDefault();
      const libraryUrlTokens = parseLibraryTokensFromUrl();
      if (!libraryUrlTokens) {
        excalidrawAPI.updateScene({ appState: { isLoading: true } });

        initializeScene({ excalidrawAPI }).then((data) => {
          loadImages(data);
          if (data.scene) {
            excalidrawAPI.updateScene({
              elements: restoreElements(data.scene.elements, null, {
                repairBindings: true,
              }),
              appState: restoreAppState(data.scene.appState, null),
              captureUpdate: CaptureUpdateAction.IMMEDIATELY,
            });
          }
        });
      }
    };

    const syncData = debounce(() => {
      if (isTestEnv()) {
        return;
      }
      if (!document.hidden) {
        if (isBrowserStorageStateNewer(STORAGE_KEYS.VERSION_DATA_STATE)) {
          const localDataState = importFromLocalStorage();
          setLangCode(getPreferredLanguage());
          excalidrawAPI.updateScene({
            ...localDataState,
            captureUpdate: CaptureUpdateAction.NEVER,
          });
          LibraryIndexedDBAdapter.load().then((data) => {
            if (data) {
              excalidrawAPI.updateLibrary({
                libraryItems: data.libraryItems,
              });
            }
          });
        }

        if (isBrowserStorageStateNewer(STORAGE_KEYS.VERSION_FILES)) {
          const elements = excalidrawAPI.getSceneElementsIncludingDeleted();
          const currFiles = excalidrawAPI.getFiles();
          const fileIds =
            elements?.reduce((acc, element) => {
              if (
                isInitializedImageElement(element) &&
                !currFiles[element.fileId]
              ) {
                return acc.concat(element.fileId);
              }
              return acc;
            }, [] as FileId[]) || [];
          if (fileIds.length) {
            LocalData.fileStorage
              .getFiles(fileIds)
              .then(({ loadedFiles, erroredFiles }) => {
                if (loadedFiles.length) {
                  excalidrawAPI.addFiles(loadedFiles);
                }
                updateStaleImageStatuses({
                  excalidrawAPI,
                  erroredFiles,
                  elements: excalidrawAPI.getSceneElementsIncludingDeleted(),
                });
              });
          }
        }
      }
    }, SYNC_BROWSER_TABS_TIMEOUT);

    const onUnload = () => {
      LocalData.flushSave();
    };

    const visibilityChange = (event: FocusEvent | Event) => {
      if (event.type === EVENT.BLUR || document.hidden) {
        LocalData.flushSave();
      }
      if (
        event.type === EVENT.VISIBILITY_CHANGE ||
        event.type === EVENT.FOCUS
      ) {
        syncData();
      }
    };

    window.addEventListener(EVENT.HASHCHANGE, onHashChange, false);
    window.addEventListener(EVENT.UNLOAD, onUnload, false);
    window.addEventListener(EVENT.BLUR, visibilityChange, false);
    document.addEventListener(EVENT.VISIBILITY_CHANGE, visibilityChange, false);
    window.addEventListener(EVENT.FOCUS, visibilityChange, false);
    return () => {
      window.removeEventListener(EVENT.HASHCHANGE, onHashChange, false);
      window.removeEventListener(EVENT.UNLOAD, onUnload, false);
      window.removeEventListener(EVENT.BLUR, visibilityChange, false);
      window.removeEventListener(EVENT.FOCUS, visibilityChange, false);
      document.removeEventListener(
        EVENT.VISIBILITY_CHANGE,
        visibilityChange,
        false,
      );
    };
  }, [excalidrawAPI, setLangCode, loadImages]);

  useEffect(() => {
    const unloadHandler = (event: BeforeUnloadEvent) => {
      LocalData.flushSave();

      if (
        excalidrawAPI &&
        LocalData.fileStorage.shouldPreventUnload(
          excalidrawAPI.getSceneElements(),
        )
      ) {
        if (import.meta.env.VITE_APP_DISABLE_PREVENT_UNLOAD !== "true") {
          preventUnload(event);
        }
      }
    };
    window.addEventListener(EVENT.BEFORE_UNLOAD, unloadHandler);
    return () => {
      window.removeEventListener(EVENT.BEFORE_UNLOAD, unloadHandler);
    };
  }, [excalidrawAPI]);

  const onChange = (
    elements: readonly OrderedExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles,
  ) => {
    if (!LocalData.isSavePaused()) {
      LocalData.save(elements, appState, files, () => {
        if (excalidrawAPI) {
          let didChange = false;

          const elements = excalidrawAPI
            .getSceneElementsIncludingDeleted()
            .map((element) => {
              if (
                LocalData.fileStorage.shouldUpdateImageElementStatus(element)
              ) {
                const newElement = newElementWith(element, { status: "saved" });
                if (newElement !== element) {
                  didChange = true;
                }
                return newElement;
              }
              return element;
            });

          if (didChange) {
            excalidrawAPI.updateScene({
              elements,
              captureUpdate: CaptureUpdateAction.NEVER,
            });
          }
        }
      });
    }

    // Render the debug scene if the debug canvas is available
    if (debugCanvasRef.current && excalidrawAPI) {
      debugRenderer(
        debugCanvasRef.current,
        appState,
        elements,
        window.devicePixelRatio,
      );
    }
  };

  const renderCustomStats = (
    elements: readonly NonDeletedExcalidrawElement[],
    appState: UIAppState,
  ) => {
    return (
      <CustomStats
        setToast={(message) => excalidrawAPI!.setToast({ message })}
        appState={appState}
        elements={elements}
      />
    );
  };

  const localStorageQuotaExceeded = useAtomValue(localStorageQuotaExceededAtom);

  const onExport: Required<ExcalidrawProps>["onExport"] = useCallback(
    async function* () {
      let snapshot = FileStatusStore.getSnapshot();
      const { pending, total } = FileStatusStore.getPendingCount(
        snapshot.value,
      );
      if (pending === 0) {
        return;
      }

      yield {
        type: "progress",
        progress: (total - pending) / total,
        message: `Loading images (${total - pending}/${total})...`,
      };

      while (true) {
        snapshot = await FileStatusStore.pull(snapshot.version);
        const { pending: nowPending, total: nowTotal } =
          FileStatusStore.getPendingCount(snapshot.value);

        yield {
          type: "progress",
          progress: (nowTotal - nowPending) / nowTotal,
          message: `Loading images (${nowTotal - nowPending}/${nowTotal})...`,
        };

        if (nowPending === 0) {
          await new Promise((r) => setTimeout(r, 500));
          yield {
            type: "progress",
            message: `Preparing export...`,
          };
          return;
        }
      }
    },
    [],
  );

  return (
    <div
      style={{ height: "100%" }}
      className={clsx("excalidraw-app", "pd-app")}
    >
      {/* Vision Suite Top Navigation Bar */}
      <TopBar
        theme={appTheme}
        onThemeToggle={() =>
          setAppTheme(appTheme === "dark" ? "light" : "dark")
        }
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExportPNG={() => {
          if (excalidrawAPI) {
            const elements = excalidrawAPI.getSceneElements();
            const appState = excalidrawAPI.getAppState();
            const files = excalidrawAPI.getFiles();
            exportToPNG({ elements, appState, files });
          }
        }}
        onExportSVG={() => {
          if (excalidrawAPI) {
            const elements = excalidrawAPI.getSceneElements();
            const appState = excalidrawAPI.getAppState();
            const files = excalidrawAPI.getFiles();
            exportToSVG({ elements, appState, files });
          }
        }}
        onExportPDF={() => {
          if (excalidrawAPI) {
            const elements = excalidrawAPI.getSceneElements();
            const appState = excalidrawAPI.getAppState();
            const files = excalidrawAPI.getFiles();
            exportToPDF({ elements, appState, files });
          }
        }}
        onExportJSON={() => {
          if (excalidrawAPI) {
            const elements = excalidrawAPI.getSceneElements();
            const appState = excalidrawAPI.getAppState();
            const files = excalidrawAPI.getFiles();
            exportToJSON({ elements, appState, files });
          }
        }}
        onSettingsOpen={() => {}}
        onSearchOpen={() => setSearchOpen(true)}
        onKeyboardShortcuts={() => {}}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        workspaceName={workspaceName}
        onWorkspaceNameChange={setWorkspaceName}
        isSaved={true}
        canvasRef={{ current: canvasRef }}
        gridEnabled={gridEnabled}
        onGridToggle={() => {
          if (excalidrawAPI) {
            const current = excalidrawAPI.getAppState().gridModeEnabled;
            excalidrawAPI.updateScene({
              appState: { gridModeEnabled: !current },
            });
          }
        }}
        snapEnabled={snapEnabled}
        onSnapToggle={() => {}}
        onNewFile={() => {
          if (excalidrawAPI) {
            excalidrawAPI.updateScene({ elements: [], appState: {} });
            setWorkspaceName("Untitled");
          }
        }}
        onOpenFile={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".vs,.parvezdraw,.excalidraw";
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (ev) => {
                try {
                  const data = JSON.parse(ev.target?.result as string);
                  if (excalidrawAPI && data.elements) {
                    excalidrawAPI.updateScene({ elements: data.elements });
                    setWorkspaceName(
                      file.name.replace(/\.(vs|parvezdraw|excalidraw)$/, ""),
                    );
                  }
                } catch {
                  console.error("Failed to open file");
                }
              };
              reader.readAsText(file);
            }
          };
          input.click();
        }}
        onSaveFile={() => {
          if (excalidrawAPI) {
            const elements = excalidrawAPI.getSceneElements();
            const data = { type: "vision-suite", version: 1, elements };
            const blob = new Blob([JSON.stringify(data)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${workspaceName}.vs`;
            a.click();
            URL.revokeObjectURL(url);
          }
        }}
        isRecording={isRecording}
        onToggleRecording={toggleRecording}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled(!audioEnabled)}
        recordingTime={recordingTime}
      />

      {/* Vision Suite Left Sidebar */}
      <LeftSidebar
        activeTool={activeTool}
        onToolSelect={handleToolSelect}
        onColorPaletteOpen={() => setColorPaletteOpen(true)}
        currentColor={currentColor}
        isSidebarVisible={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        eyePosition={sidebarEyePosition}
      />

      {/* Floating eye button when sidebar hidden */}
      <SidebarEyeButton
        onClick={() => setSidebarOpen(true)}
        isVisible={sidebarOpen}
        position={sidebarEyePosition}
        onPositionChange={setSidebarEyePosition}
      />

      {/* Excalidraw Canvas — positioned to account for new UI */}
      <div
        ref={canvasContainerRef}
        className="vd-canvas-container"
        style={{
          position: "fixed",
          top: "var(--vd-topbar-height)",
          left: 0,
          right: 0,
          bottom: "var(--vd-bottombar-height)",
        }}
      >
        <Excalidraw
          onChange={onChange}
          onExport={onExport}
          initialData={initialStatePromiseRef.current.promise}
          langCode={langCode}
          renderCustomStats={renderCustomStats}
          detectScroll={false}
          handleKeyboardGlobally={true}
          autoFocus={true}
          theme={editorTheme}
          onThemeChange={setAppTheme}
          UIOptions={{
            canvasActions: {
              toggleTheme: false,
              export: false,
              saveToActiveFile: false,
              loadScene: false,
              changeViewBackgroundColor: false,
              clearCanvas: false,
              saveAsImage: false,
            },
            tools: {
              image: false,
            },
          }}
          onLinkOpen={(element, event) => {
            if (element.link) {
              event.preventDefault();
              excalidrawAPI?.setViewport({
                target: element.link,
                fit: "scale-down",
                animation: true,
              });
            }
          }}
        >
          {/* Keep Excalidraw's internal UI hidden — we use our own */}
          <AppWelcomeScreen />
          <OverwriteConfirmDialog>
            <OverwriteConfirmDialog.Actions.ExportToImage />
            <OverwriteConfirmDialog.Actions.SaveToDisk />
          </OverwriteConfirmDialog>

          {localStorageQuotaExceeded && (
            <div className="alert alert--danger">
              {t("alerts.localStorageQuotaExceeded")}
            </div>
          )}

          {errorMessage && (
            <ErrorDialog onClose={() => setErrorMessage("")}>
              {errorMessage}
            </ErrorDialog>
          )}

          <CommandPalette
            customCommandPaletteItems={[
              {
                label: "GitHub",
                icon: GithubIcon,
                category: DEFAULT_CATEGORIES.links,
                predicate: true,
                keywords: ["issues", "bugs", "requests", "report", "features"],
                perform: () => {
                  window.open(
                    "https://github.com/excalidraw/excalidraw",
                    "_blank",
                    "noopener noreferrer",
                  );
                },
              },
            ]}
          />
          {isVisualDebuggerEnabled() && excalidrawAPI && (
            <DebugCanvas
              appState={excalidrawAPI.getAppState()}
              scale={window.devicePixelRatio}
              ref={debugCanvasRef}
            />
          )}
        </Excalidraw>
      </div>

      {/* Vision Suite Bottom Bar */}
      <BottomBar
        zoom={zoom}
        onZoomIn={() => {
          if (excalidrawAPI) {
            const currentZoom = excalidrawAPI.getAppState().zoom.value;
            const newZoom = Math.min(
              currentZoom * 1.2,
              5,
            ) as import("@prof/core/types").NormalizedZoomValue;
            excalidrawAPI.updateScene({
              appState: { zoom: { value: newZoom } },
            });
          }
        }}
        onZoomOut={() => {
          if (excalidrawAPI) {
            const currentZoom = excalidrawAPI.getAppState().zoom.value;
            const newZoom = Math.max(
              currentZoom / 1.2,
              0.1,
            ) as import("@prof/core/types").NormalizedZoomValue;
            excalidrawAPI.updateScene({
              appState: { zoom: { value: newZoom } },
            });
          }
        }}
        onZoomReset={() => {
          if (excalidrawAPI) {
            excalidrawAPI.updateScene({
              appState: {
                zoom: {
                  value: 1 as import("@prof/core/types").NormalizedZoomValue,
                },
              },
            });
          }
        }}
        onZoomToFit={() => {
          if (excalidrawAPI) {
            const elements = excalidrawAPI.getSceneElements();
            if (elements.length > 0) {
              excalidrawAPI.setViewport({
                target: elements,
                fit: "scale-down",
                animation: true,
              });
            }
          }
        }}
        selectedCount={
          appState?.selectedElementIds
            ? Object.keys(appState.selectedElementIds).length
            : 0
        }
        elementCount={
          excalidrawAPI?.getSceneElementsIncludingDeleted()?.length ?? 0
        }
      />

      <RecentFilesPanel
        isOpen={recentFilesOpen}
        onClose={() => setRecentFilesOpen(false)}
        onOpenFile={(file) => {
          setRecentFilesOpen(false);
        }}
      />

      {/* Vision Suite Search Panel */}
      <CanvasSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectElement={(elementId) => {
          // Select the element in Excalidraw
          if (excalidrawAPI) {
            excalidrawAPI.updateScene({
              appState: {
                selectedElementIds: { [elementId]: true },
              },
            });
            // Scroll to the element
            const elements = excalidrawAPI.getSceneElements();
            const element = elements.find((el) => el.id === elementId);
            if (element) {
              excalidrawAPI.setViewport({
                target: [element],
                fit: "scale-down",
                animation: true,
              });
            }
          }
        }}
        elements={(excalidrawAPI?.getSceneElements() || []) as any[]}
      />

      {/* Vision Suite Color Palette Panel */}
      <ColorPalettePanel
        isOpen={colorPaletteOpen}
        onClose={() => setColorPaletteOpen(false)}
        onSelectColor={(color) => {
          setCurrentColor(color);
          if (excalidrawAPI) {
            const appState = excalidrawAPI.getAppState();
            const selectedIds = appState.selectedElementIds;
            const elements = excalidrawAPI.getSceneElements();
            const updatedElements = elements.map((el) => {
              if (selectedIds[el.id]) {
                return {
                  ...el,
                  strokeColor: color,
                };
              }
              return el;
            });

            excalidrawAPI.updateScene({
              elements: updatedElements,
              appState: { currentItemStrokeColor: color },
            });
          }
          setColorPaletteOpen(false);
        }}
        currentColor={currentColor}
      />
    </div>
  );
};

const ExcalidrawApp = () => {
  return (
    <TopErrorBoundary>
      <Provider store={appJotaiStore}>
        <ExcalidrawAPIProvider>
          <ExcalidrawWrapper />
        </ExcalidrawAPIProvider>
      </Provider>
    </TopErrorBoundary>
  );
};

export default ExcalidrawApp;
