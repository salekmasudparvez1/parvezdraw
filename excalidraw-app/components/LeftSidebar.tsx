/**
 * Parvez Draw — Left Sidebar
 *
 * Vertical icon navigation for tools and panels.
 * Glass-effect background with active state indicators.
 * Smoothly scrollable when content overflows.
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
  LayoutTemplate,
  Star,
  Clock,
  Layers,
  Gem,
  Workflow,
} from "lucide-react";
import { motion } from "framer-motion";

interface ToolItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  group?: string;
}

interface LeftSidebarProps {
  activeTool: string;
  onToolSelect: (toolId: string) => void;
}

const TOOLS: ToolItem[] = [
  // Selection
  { id: "selection", icon: <MousePointer2 size={20} />, label: "Select", shortcut: "V", group: "main" },
  { id: "hand", icon: <Hand size={20} />, label: "Hand", shortcut: "H", group: "main" },

  // Drawing
  { id: "rectangle", icon: <Square size={20} />, label: "Rectangle", shortcut: "R", group: "draw" },
  { id: "diamond", icon: <Diamond size={20} />, label: "Diamond", shortcut: "D", group: "draw" },
  { id: "ellipse", icon: <Circle size={20} />, label: "Ellipse", shortcut: "O", group: "draw" },
  { id: "line", icon: <Minus size={20} />, label: "Line", shortcut: "L", group: "draw" },
  { id: "arrow", icon: <ArrowUpRight size={20} />, label: "Arrow", shortcut: "A", group: "draw" },

  // Content
  { id: "text", icon: <Type size={20} />, label: "Text", shortcut: "T", group: "content" },
  { id: "freedraw", icon: <Pen size={20} />, label: "Pen", shortcut: "P", group: "content" },
  { id: "image", icon: <Image size={20} />, label: "Image", shortcut: "I", group: "content" },
  { id: "eraser", icon: <Eraser size={20} />, label: "Eraser", shortcut: "E", group: "content" },

  // Extras
  { id: "frame", icon: <Frame size={20} />, label: "Frame", shortcut: "F", group: "extras" },
  { id: "laser", icon: <Target size={20} />, label: "Laser", shortcut: "K", group: "extras" },
  { id: "lasso", icon: <Lasso size={20} />, label: "Lasso", shortcut: "S", group: "extras" },
];

const PANEL_TOOLS: ToolItem[] = [
  { id: "templates", icon: <LayoutTemplate size={20} />, label: "Templates", group: "panels" },
  { id: "favorites", icon: <Star size={20} />, label: "Favorites", group: "panels" },
  { id: "history", icon: <Clock size={20} />, label: "History", group: "panels" },
  { id: "assets", icon: <Layers size={20} />, label: "Assets", group: "panels" },
  { id: "components", icon: <Gem size={20} />, label: "Components", group: "panels" },
  { id: "mindmap", icon: <Workflow size={20} />, label: "Mind Map", group: "panels" },
];

const SidebarToolButton: React.FC<{
  tool: ToolItem;
  isActive: boolean;
  onClick: () => void;
}> = ({ tool, isActive, onClick }) => {
  return (
    <motion.button
      className={`pd-tool-btn ${isActive ? "pd-tool-btn--active" : ""}`}
      onClick={onClick}
      title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ""}`}
      aria-label={tool.label}
      aria-pressed={isActive}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {tool.icon}
    </motion.button>
  );
};

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTool,
  onToolSelect,
}) => {
  return (
    <nav className="pd-sidebar pd-no-select" role="navigation" aria-label="Drawing tools">
      {/* Main tools */}
      <div className="pd-sidebar__group">
        {TOOLS.filter((t) => t.group === "main").map((tool) => (
          <SidebarToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onClick={() => onToolSelect(tool.id)}
          />
        ))}
      </div>

      <div className="pd-divider" style={{ width: 24, margin: "4px auto" }} />

      {/* Drawing tools */}
      <div className="pd-sidebar__group">
        {TOOLS.filter((t) => t.group === "draw").map((tool) => (
          <SidebarToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onClick={() => onToolSelect(tool.id)}
          />
        ))}
      </div>

      <div className="pd-divider" style={{ width: 24, margin: "4px auto" }} />

      {/* Content tools */}
      <div className="pd-sidebar__group">
        {TOOLS.filter((t) => t.group === "content").map((tool) => (
          <SidebarToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onClick={() => onToolSelect(tool.id)}
          />
        ))}
      </div>

      <div className="pd-divider" style={{ width: 24, margin: "4px auto" }} />

      {/* Extra tools */}
      <div className="pd-sidebar__group">
        {TOOLS.filter((t) => t.group === "extras").map((tool) => (
          <SidebarToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onClick={() => onToolSelect(tool.id)}
          />
        ))}
      </div>

      {/* Spacer - pushes panel tools to bottom */}
      <div style={{ flex: 1, minHeight: 8 }} />

      {/* Panel shortcuts - at bottom */}
      <div className="pd-sidebar__group pd-sidebar__group--panels">
        {PANEL_TOOLS.map((tool) => (
          <SidebarToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onClick={() => onToolSelect(tool.id)}
          />
        ))}
      </div>
    </nav>
  );
};
