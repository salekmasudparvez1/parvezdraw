/**
 * Parvez Draw — Top Navigation Bar
 *
 * A modern, glass-effect top bar with:
 * - App logo and workspace name
 * - Search and quick actions
 * - Undo/Redo controls
 * - Export and settings
 *
 * Replaces the Excalidraw MainMenu header with Parvez Draw identity.
 */

import React, { useState, useCallback } from "react";
import {
  Search,
  Undo2,
  Redo2,
  Download,
  Settings,
  Sun,
  Moon,
  Keyboard,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  FileImage,
  FileCode,
  FileText,
  Printer,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Theme } from "@prof/element/types";
import { DrawingRecorder } from "./DrawingRecorder";

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
  isSaved?: boolean;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
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
  isSaved = true,
  canvasRef,
}) => {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const isDark = theme === "dark";

  const handleExportMenuClose = useCallback(() => {
    setExportMenuOpen(false);
  }, []);

  return (
    <div className="pd-topbar" role="banner">
      {/* Left section — Logo + Workspace */}
      <div className="pd-topbar__left">
        <div className="pd-topbar__logo" title="Parvez Draw">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              width="24"
              height="24"
              rx="6"
              fill="var(--pd-green-500)"
            />
            <path
              d="M7 7h4v4H7V7zm0 6h4v4H7v-4zm6-6h4v4h-4V7zm3 6h1v4h-1v-4z"
              fill="white"
            />
          </svg>
          <span className="pd-topbar__brand">Parvez Draw</span>
        </div>

        <div className="pd-divider--vertical" />

        <div className="pd-topbar__workspace">
          <span className="pd-topbar__workspace-name">{workspaceName}</span>
          <span className="pd-topbar__save-status">
            {isSaved ? (
              <span className="pd-topbar__saved">Saved</span>
            ) : (
              <span className="pd-topbar__saving">Saving...</span>
            )}
          </span>
        </div>
      </div>

      {/* Center section — Undo/Redo + Search */}
      <div className="pd-topbar__center">
        <button
          className="pd-btn pd-btn--icon pd-btn--ghost"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          <Undo2 size={16} />
        </button>

        <button
          className="pd-btn pd-btn--icon pd-btn--ghost"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo"
        >
          <Redo2 size={16} />
        </button>

        <div className="pd-divider--vertical" />

        <button
          className="pd-btn pd-btn--ghost pd-topbar__search"
          onClick={onSearchOpen}
          title="Search (Ctrl+K)"
          aria-label="Search"
        >
          <Search size={14} />
          <span>Search</span>
          <kbd className="pd-topbar__kbd">⌘K</kbd>
        </button>
      </div>

      {/* Right section — Actions */}
      <div className="pd-topbar__right">
        {/* Recording */}
        {canvasRef && <DrawingRecorder canvasRef={canvasRef} />}

        <div className="pd-divider--vertical" />

        {/* Export dropdown */}
        <div className="pd-topbar__dropdown">
          <button
            className="pd-btn pd-btn--ghost pd-btn--sm"
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            title="Export"
            aria-label="Export"
            aria-expanded={exportMenuOpen}
          >
            <Download size={14} />
            <span>Export</span>
            <ChevronDown size={12} />
          </button>

          <AnimatePresence>
            {exportMenuOpen && (
              <>
                <div
                  className="pd-topbar__dropdown-backdrop"
                  onClick={handleExportMenuClose}
                />
                <motion.div
                  className="pd-menu"
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
                  style={{ position: "absolute", top: "100%", right: 0, marginTop: 4 }}
                >
                  <button
                    className="pd-menu-item"
                    onClick={() => {
                      onExportPNG();
                      handleExportMenuClose();
                    }}
                  >
                    <FileImage size={14} />
                    Export as PNG
                  </button>
                  <button
                    className="pd-menu-item"
                    onClick={() => {
                      onExportSVG();
                      handleExportMenuClose();
                    }}
                  >
                    <FileCode size={14} />
                    Export as SVG
                  </button>
                  <button
                    className="pd-menu-item"
                    onClick={() => {
                      onExportPDF();
                      handleExportMenuClose();
                    }}
                  >
                    <FileText size={14} />
                    Export as PDF
                  </button>
                  <div className="pd-menu-separator" />
                  <button
                    className="pd-menu-item"
                    onClick={() => {
                      onExportJSON();
                      handleExportMenuClose();
                    }}
                  >
                    <FileCode size={14} />
                    Save as .excalidraw
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="pd-divider--vertical" />

        {/* Theme toggle */}
        <button
          className="pd-btn pd-btn--icon pd-btn--ghost"
          onClick={onThemeToggle}
          title={`Switch to ${isDark ? "light" : "dark"} mode`}
          aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Keyboard shortcuts */}
        <button
          className="pd-btn pd-btn--icon pd-btn--ghost"
          onClick={onKeyboardShortcuts}
          title="Keyboard shortcuts"
          aria-label="Keyboard shortcuts"
        >
          <Keyboard size={16} />
        </button>

        {/* Settings */}
        <button
          className="pd-btn pd-btn--icon pd-btn--ghost"
          onClick={onSettingsOpen}
          title="Settings"
          aria-label="Settings"
        >
          <Settings size={16} />
        </button>

        <div className="pd-divider--vertical" />

        {/* Sidebar toggle */}
        <button
          className="pd-btn pd-btn--icon pd-btn--ghost"
          onClick={onSidebarToggle}
          title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? (
            <PanelLeftClose size={16} />
          ) : (
            <PanelLeftOpen size={16} />
          )}
        </button>
      </div>
    </div>
  );
};
