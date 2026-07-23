/**
 * Vision Suite — Left Sidebar
 *
 * Eye button hides ENTIRE sidebar for more canvas space.
 * Photoshop-style clean tool panel.
 */

import React, { useState, useEffect } from "react";
import {
  Pen,
  Square,
  Circle,
  Type,
  Minus,
  ArrowUpRight,
  Diamond,
  Image,
  Eraser,
  Hand,
  MousePointer2,
  Frame,
  Target,
  Lasso,
  Eye,
  EyeOff,
  Palette,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ToolItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  shortcut: string;
}

interface LeftSidebarProps {
  activeTool: string;
  onToolSelect: (toolId: string) => void;
  onColorPaletteOpen?: () => void;
  isSidebarVisible: boolean;
  onToggleSidebar: () => void;
}

const TOOLS: ToolItem[] = [
  { id: "selection", icon: <MousePointer2 size={18} />, label: "Select", shortcut: "V" },
  { id: "hand", icon: <Hand size={18} />, label: "Hand", shortcut: "H" },
  { id: "rectangle", icon: <Square size={18} />, label: "Rectangle", shortcut: "R" },
  { id: "diamond", icon: <Diamond size={18} />, label: "Diamond", shortcut: "D" },
  { id: "ellipse", icon: <Circle size={18} />, label: "Ellipse", shortcut: "O" },
  { id: "line", icon: <Minus size={18} />, label: "Line", shortcut: "L" },
  { id: "arrow", icon: <ArrowUpRight size={18} />, label: "Arrow", shortcut: "A" },
  { id: "text", icon: <Type size={18} />, label: "Text", shortcut: "T" },
  { id: "freedraw", icon: <Pen size={18} />, label: "Pen", shortcut: "P" },
  { id: "image", icon: <Image size={18} />, label: "Image", shortcut: "I" },
  { id: "eraser", icon: <Eraser size={18} />, label: "Eraser", shortcut: "E" },
  { id: "frame", icon: <Frame size={18} />, label: "Frame", shortcut: "F" },
  { id: "laser", icon: <Target size={18} />, label: "Laser", shortcut: "K" },
  { id: "lasso", icon: <Lasso size={18} />, label: "Lasso", shortcut: "S" },
];

const PALETTE_COLORS = [
  "#0078D4", "#005A9E", "#003D7A",
  "#FF9500", "#E68600", "#CC7700",
  "#10b981", "#059669", "#047857",
  "#ef4444", "#dc2626", "#b91c1c",
  "#8b5cf6", "#7c3aed", "#6d28d9",
  "#ffffff", "#d1d5db", "#6b7280",
  "#374151", "#1f2937", "#111827",
  "#1e1e1e", "#2d2d2d", "#3c3c3c",
];

const SidebarToolButton: React.FC<{
  tool: ToolItem;
  isActive: boolean;
  onClick: () => void;
}> = ({ tool, isActive, onClick }) => {
  return (
    <motion.button
      className={`vd-tool-btn ${isActive ? "vd-tool-btn--active" : ""}`}
      onClick={onClick}
      title={`${tool.label} (${tool.shortcut})`}
      aria-label={tool.label}
      aria-pressed={isActive}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
    >
      {tool.icon}
    </motion.button>
  );
};

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTool,
  onToolSelect,
  onColorPaletteOpen,
  isSidebarVisible,
  onToggleSidebar,
}) => {
  const [showPalette, setShowPalette] = useState(true);

  if (!isSidebarVisible) return null;

  return (
    <motion.nav
      className="vd-sidebar vd-no-select"
      role="navigation"
      aria-label="Drawing tools"
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -60, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Eye toggle - hides ENTIRE sidebar */}
      <div className="vd-sidebar__section">
        <button
          className="vd-eye-toggle"
          onClick={onToggleSidebar}
          title="Hide sidebar (click eye to show again)"
        >
          <EyeOff size={18} />
        </button>
      </div>

      {/* Tools */}
      <div className="vd-sidebar__section vd-sidebar__tools">
        {TOOLS.map((tool) => (
          <SidebarToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onClick={() => onToolSelect(tool.id)}
          />
        ))}
      </div>

      {/* Color Palette Section */}
      <div className="vd-sidebar__section vd-sidebar__palette-section">
        <button
          className="vd-sidebar__section-header"
          onClick={() => setShowPalette(!showPalette)}
        >
          <Palette size={14} />
          {showPalette ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        </button>

        <AnimatePresence>
          {showPalette && (
            <motion.div
              className="vd-sidebar__palette"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
            >
              {PALETTE_COLORS.map((color) => (
                <button
                  key={color}
                  className="vd-sidebar__palette-swatch"
                  style={{ background: color }}
                  onClick={() => onColorPaletteOpen?.()}
                  title={color}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom actions */}
      <div className="vd-sidebar__section vd-sidebar__bottom">
        <button
          className="vd-tool-btn"
          onClick={onColorPaletteOpen}
          title="All Colors"
        >
          <Palette size={18} />
        </button>
      </div>
    </motion.nav>
  );
};

// Floating eye button when sidebar is hidden
export const SidebarEyeButton: React.FC<{
  onClick: () => void;
  isVisible: boolean;
}> = ({ onClick, isVisible }) => {
  if (isVisible) return null;

  return (
    <motion.button
      className="vd-sidebar-eye-floating"
      onClick={onClick}
      title="Show sidebar"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <Eye size={18} />
    </motion.button>
  );
};
