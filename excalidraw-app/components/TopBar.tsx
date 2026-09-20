








import React, { useState, useRef, useCallback } from "react";
import {
  Search,
  Settings,
  Sun,
  Moon,
  Grid3X3,
  Magnet,
  FolderOpen,
  Save,
  FileImage,
  FileCode,
  FileText,
  ChevronDown,
  Mic,
  MicOff,
  Circle,
  Pencil,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Theme } from "@prof/element/types";

interface TopBarProps {
  theme: Theme | "system";
  onThemeToggle: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExportPNG: () => void;
  onExportSVG: () => void;
  onExportPDF: () => void;
  onExportJSON: () => void;
  onSettingsOpen: () => void;
  onSearchOpen: () => void;
  onKeyboardShortcuts: () => void;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  workspaceName?: string;
  onWorkspaceNameChange?: (name: string) => void;
  isSaved?: boolean;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  gridEnabled?: boolean;
  onGridToggle?: () => void;
  snapEnabled?: boolean;
  onSnapToggle?: () => void;
  onNewFile?: () => void;
  onOpenFile?: () => void;
  onSaveFile?: () => void;
  isRecording?: boolean;
  onToggleRecording?: () => void;
  audioEnabled?: boolean;
  onToggleAudio?: () => void;
  recordingTime?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  theme,
  onThemeToggle,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExportPNG,
  onExportSVG,
  onExportPDF,
  onExportJSON,
  onSettingsOpen,
  onSearchOpen,
  onKeyboardShortcuts,
  sidebarOpen,
  onSidebarToggle,
  workspaceName = "Untitled",
  onWorkspaceNameChange,
  isSaved = true,
  canvasRef,
  gridEnabled = false,
  onGridToggle,
  snapEnabled = false,
  onSnapToggle,
  onNewFile,
  onOpenFile,
  onSaveFile,
  isRecording = false,
  onToggleRecording,
  audioEnabled = true,
  onToggleAudio,
  recordingTime = "00:00",
}) => {
  const isDark = theme === "dark";
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(workspaceName);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleNameSubmit = useCallback(() => {
    if (editName.trim()) {
      onWorkspaceNameChange?.(editName.trim());
    } else {
      setEditName(workspaceName);
    }
    setIsEditingName(false);
  }, [editName, workspaceName, onWorkspaceNameChange]);

  const handleNameKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSubmit();
    } else if (e.key === "Escape") {
      setEditName(workspaceName);
      setIsEditingName(false);
    }
  }, [handleNameSubmit, workspaceName]);

  return (
    <div className="vd-topbar" role="banner">
      {}
      <div className="vd-topbar__left">
        {}
        <div className="vd-topbar__logo" title="Vision Suite">
          <img src="/logo.svg" alt="Vision Suite" width="22" height="22" style={{ borderRadius: 3 }} />
          <span className="vd-topbar__brand">Vision Suite</span>
        </div>

        <div className="vd-divider--vertical" />

        {}
        <div className="vd-topbar__dropdown">
          <button
            className="vd-btn vd-btn--ghost vd-btn--sm"
            onClick={() => setFileMenuOpen(!fileMenuOpen)}
            title="File"
            aria-label="File menu"
            aria-expanded={fileMenuOpen}
          >
            <span>File</span>
            <ChevronDown size={12} />
          </button>

          <AnimatePresence>
            {fileMenuOpen && (
              <>
                <div className="vd-topbar__dropdown-backdrop" onClick={() => setFileMenuOpen(false)} />
                <motion.div
                  className="vd-menu"
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, minWidth: 200 }}
                >
                  <div className="vd-menu-label">File</div>
                  <button className="vd-menu-item" onClick={() => { onNewFile?.(); setFileMenuOpen(false); }}>
                    <FileText size={14} />
                    <span>New File</span>
                    <span className="vd-menu-item__shortcut">Ctrl+N</span>
                  </button>
                  <button className="vd-menu-item" onClick={() => { onOpenFile?.(); setFileMenuOpen(false); }}>
                    <FolderOpen size={14} />
                    <span>Open File</span>
                    <span className="vd-menu-item__shortcut">Ctrl+O</span>
                  </button>
                  <div className="vd-menu-separator" />
                  <button className="vd-menu-item" onClick={() => { onSaveFile?.(); setFileMenuOpen(false); }}>
                    <Save size={14} />
                    <span>Save (.vs)</span>
                    <span className="vd-menu-item__shortcut">Ctrl+S</span>
                  </button>
                  <div className="vd-menu-separator" />
                  <div className="vd-menu-label">Export</div>
                  <button className="vd-menu-item" onClick={() => { onExportPNG(); setFileMenuOpen(false); }}>
                    <FileImage size={14} />
                    <span>Export as PNG</span>
                  </button>
                  <button className="vd-menu-item" onClick={() => { onExportSVG(); setFileMenuOpen(false); }}>
                    <FileCode size={14} />
                    <span>Export as SVG</span>
                  </button>
                  <button className="vd-menu-item" onClick={() => { onExportPDF(); setFileMenuOpen(false); }}>
                    <FileText size={14} />
                    <span>Export as PDF</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="vd-divider--vertical" />

        {}
        <div className="vd-topbar__workspace">
          {isEditingName ? (
            <input
              ref={inputRef}
              className="vd-topbar__name-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={handleNameKeyDown}
              autoFocus
              maxLength={50}
            />
          ) : (
            <button
              className="vd-topbar__workspace-name"
              onClick={() => {
                setEditName(workspaceName);
                setIsEditingName(true);
                setTimeout(() => inputRef.current?.select(), 0);
              }}
              title="Click to rename"
            >
              {workspaceName}
              <Pencil size={10} className="vd-topbar__edit-icon" />
            </button>
          )}
          <span className="vd-topbar__save-status">
            {isSaved ? (
              <span className="vd-topbar__saved">Saved</span>
            ) : (
              <span className="vd-topbar__saving">Saving...</span>
            )}
          </span>
        </div>

        <div className="vd-divider--vertical" />

        {}
        <button className="vd-btn vd-btn--icon vd-btn--ghost vd-btn--sm" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
        </button>
        <button className="vd-btn vd-btn--icon vd-btn--ghost vd-btn--sm" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
        </button>

        <div className="vd-divider--vertical" />

        {}
        <button className={`vd-btn vd-btn--ghost vd-btn--sm ${gridEnabled ? "vd-btn--active" : ""}`} onClick={onGridToggle} title="Toggle grid">
          <Grid3X3 size={14} />
          <span>Grid</span>
        </button>
        <button className={`vd-btn vd-btn--ghost vd-btn--sm ${snapEnabled ? "vd-btn--active" : ""}`} onClick={onSnapToggle} title="Toggle snap">
          <Magnet size={14} />
          <span>Snap</span>
        </button>
      </div>

      {}
      <div className="vd-topbar__center">
        <button className="vd-btn vd-btn--ghost vd-topbar__search" onClick={onSearchOpen} title="Search (Ctrl+K)">
          <Search size={13} />
          <span>Search</span>
          <kbd className="vd-topbar__kbd">Ctrl+K</kbd>
        </button>
      </div>

      {}
      <div className="vd-topbar__right">
        {}
        <button
          className={`vd-btn vd-btn--ghost vd-btn--sm ${isRecording ? "vd-recording-active" : ""}`}
          onClick={onToggleRecording}
          title={isRecording ? "Stop recording" : "Start recording (60fps)"}
        >
          {isRecording ? (
            <span className="vd-recording-indicator">
              <span className="vd-recording-dot" />
              <span className="vd-recording-time">{recordingTime}</span>
            </span>
          ) : (
            <>
              <Circle size={14} fill="#ef4444" color="#ef4444" />
              <span>Record</span>
            </>
          )}
        </button>

        {}
        <button
          className={`vd-btn vd-btn--icon vd-btn--ghost ${!audioEnabled ? "vd-recording-muted" : ""}`}
          onClick={onToggleAudio}
          title={audioEnabled ? "Microphone on" : "Microphone off"}
        >
          {audioEnabled ? <Mic size={15} /> : <MicOff size={15} />}
        </button>

        <div className="vd-divider--vertical" />

        {}
        <button className="vd-btn vd-btn--icon vd-btn--ghost" onClick={onThemeToggle} title={`Switch to ${isDark ? "light" : "dark"} mode`}>
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {}
        <button className="vd-btn vd-btn--icon vd-btn--ghost" onClick={onSettingsOpen} title="Settings">
          <Settings size={15} />
        </button>
      </div>
    </div>
  );
};
