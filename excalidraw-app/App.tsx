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
import {
  restoreAppState,
  restoreElements,
} from "@prof/core/data/restore";
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
import {
  Provider,
  useAtom,
  useAtomValue,
  appJotaiStore,
} from "./app-jotai";
import { STORAGE_KEYS, SYNC_BROWSER_TABS_TIMEOUT } from "./app_constants";
import { AppFooter } from "./components/AppFooter";
import { AppMainMenu } from "./components/AppMainMenu";
import { AppWelcomeScreen } from "./components/AppWelcomeScreen";
import { TopErrorBoundary } from "./components/TopErrorBoundary";
import { TopBar } from "./components/TopBar";
import { LeftSidebar } from "./components/LeftSidebar";
import { BottomBar } from "./components/BottomBar";
import {
  updateStaleImageStatuses,
} from "./data/FileManager";
import { FileStatusStore } from "./data/fileStatusStore";
import {
  importFromLocalStorage,
} from "./data/localStorage";
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

import { exportToPNG, exportToSVG, exportToPDF, exportToJSON } from "./data/exportUtils";
import { RecentFilesPanel } from "./components/RecentFilesPanel";
import { useAutoSave } from "./hooks/useAutoSave";
import { RecentFiles } from "./data/RecentFiles";

import "./index.scss";

polyfill();

window.EXCALIDRAW_THROTTLE_RENDER = true;

const initializeScene = async (opts: {
  excalidrawAPI: ExcalidrawImperativeAPI;
}): Promise<{ scene: ExcalidrawInitialDataState | null }> => {
  const localDataState = importFromLocalStorage();

  const scene: Omit<
    ExcalidrawInitialDataState,
    "files"
  > & {
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
  const [activeTool, setActiveTool] = useState("selection");

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
  const handleToolSelect = useCallback((toolId: string) => {
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
  }, [excalidrawAPI]);

  // Handle undo/redo via keyboard shortcuts (Excalidraw handles this internally)
  const handleUndo = useCallback(() => {
    // Excalidraw handles undo via keyboard shortcuts
    // We can trigger it by dispatching a keyboard event
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "z", ctrlKey: true }));
  }, []);

  const handleRedo = useCallback(() => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "z", ctrlKey: true, shiftKey: true }));
  }, []);

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
      {/* Parvez Draw Top Navigation Bar */}
      <TopBar
        theme={appTheme}
        onThemeToggle={() => setAppTheme(appTheme === "dark" ? "light" : "dark")}
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
        onSettingsOpen={() => {
          // Settings will be handled by a dedicated panel in the future
        }}
        onSearchOpen={() => {
          // Search will be handled by a dedicated panel in the future
        }}
        onKeyboardShortcuts={() => {
          // Keyboard shortcuts will be shown in a dialog
        }}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        workspaceName="Untitled"
        isSaved={true}
        canvasRef={{ current: canvasRef }}
      />

      {/* Parvez Draw Left Sidebar */}
      <LeftSidebar
        activeTool={activeTool}
        onToolSelect={handleToolSelect}
      />

      {/* Excalidraw Canvas — positioned to account for new UI */}
      <div
        ref={canvasContainerRef}
        className="pd-canvas-container"
        style={{
          position: "fixed",
          top: "var(--pd-topbar-height)",
          left: sidebarOpen ? "var(--pd-sidebar-width)" : 0,
          right: 0,
          bottom: "var(--pd-bottombar-height)",
          transition: "left 200ms ease",
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
              toggleTheme: true,
              export: {
                renderCustomUI: excalidrawAPI
                  ? (elements, appState, files) => {
                      return (
                        <button
                          onClick={() =>
                            exportToPDF({ elements, appState, files })
                          }
                          className="pd-btn pd-btn--primary"
                        >
                          Export as PDF
                        </button>
                      );
                    }
                  : undefined,
              },
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
                keywords: [
                  "issues",
                  "bugs",
                  "requests",
                  "report",
                  "features",
                ],
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

      {/* Parvez Draw Bottom Bar */}
      <BottomBar
        zoom={zoom}
        onZoomIn={() => {
          // Zoom in by updating the zoom value
          if (excalidrawAPI) {
            const currentZoom = excalidrawAPI.getAppState().zoom.value;
            const newZoom = Math.min(currentZoom * 1.2, 5) as import("@prof/core/types").NormalizedZoomValue;
            excalidrawAPI.updateScene({
              appState: { zoom: { value: newZoom } },
            });
          }
        }}
        onZoomOut={() => {
          // Zoom out by updating the zoom value
          if (excalidrawAPI) {
            const currentZoom = excalidrawAPI.getAppState().zoom.value;
            const newZoom = Math.max(currentZoom / 1.2, 0.1) as import("@prof/core/types").NormalizedZoomValue;
            excalidrawAPI.updateScene({
              appState: { zoom: { value: newZoom } },
            });
          }
        }}
        onZoomReset={() => {
          // Reset zoom to 100%
          if (excalidrawAPI) {
            excalidrawAPI.updateScene({
              appState: { zoom: { value: 1 as import("@prof/core/types").NormalizedZoomValue } },
            });
          }
        }}
        onZoomToFit={() => {
          // Scroll to fit content - use setViewport with fit
          if (excalidrawAPI) {
            const elements = excalidrawAPI.getSceneElements();
            if (elements.length > 0) {
              // Use setViewport with elements as target and fit: "scale-down"
              excalidrawAPI.setViewport({
                target: elements,
                fit: "scale-down",
                animation: true,
              });
            }
          }
        }}
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
        onSnapToggle={() => {
          // Toggle snap - would need to access internal state
        }}
        selectedCount={appState?.selectedElementIds
          ? Object.keys(appState.selectedElementIds).length
          : 0}
        elementCount={
          excalidrawAPI?.getSceneElementsIncludingDeleted()?.length ?? 0
        }
        isPerformanceMode={appState?.isResizing ?? false}
      />

      <RecentFilesPanel
        isOpen={recentFilesOpen}
        onClose={() => setRecentFilesOpen(false)}
        onOpenFile={(file) => {
          setRecentFilesOpen(false);
        }}
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
