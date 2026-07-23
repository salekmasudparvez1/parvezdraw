/**
 * Vision Suite — Left Sidebar
 *
 * Eye button hides ENTIRE sidebar for more canvas space.
 * ONE color icon that opens popup (Photoshop-style).
 */

import React from "react";
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
  EyeOff,
  Palette,
} from "lucide-react";
import { motion } from "framer-motion";

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
          title="Hide sidebar"
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

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* ONE Color icon - opens popup */}
      <div className="vd-sidebar__section vd-sidebar__bottom">
        <button
          className="vd-tool-btn vd-tool-btn--color"
          onClick={onColorPaletteOpen}
          title="Color Palette"
        >
          <div className="vd-tool-btn__color-dot" />
          <Palette size={16} />
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    </motion.button>
  );
};
