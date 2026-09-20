import React, { useRef } from "react";
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
  currentColor: string;
  isSidebarVisible: boolean;
  onToggleSidebar: () => void;
  eyePosition: SidebarEyePosition;
}

export interface SidebarEyePosition {
  left: number;
  top: number;
}

const TOOLS: ToolItem[] = [
  { id: "freedraw", icon: <Pen size={18} />, label: "Pen", shortcut: "P" },
  { id: "eraser", icon: <Eraser size={18} />, label: "Eraser", shortcut: "E" },
  {
    id: "selection",
    icon: <MousePointer2 size={18} />,
    label: "Select",
    shortcut: "V",
  },
  { id: "hand", icon: <Hand size={18} />, label: "Hand", shortcut: "H" },
  {
    id: "rectangle",
    icon: <Square size={18} />,
    label: "Rectangle",
    shortcut: "R",
  },
  {
    id: "diamond",
    icon: <Diamond size={18} />,
    label: "Diamond",
    shortcut: "D",
  },
  {
    id: "ellipse",
    icon: <Circle size={18} />,
    label: "Ellipse",
    shortcut: "O",
  },
  { id: "line", icon: <Minus size={18} />, label: "Line", shortcut: "L" },
  {
    id: "arrow",
    icon: <ArrowUpRight size={18} />,
    label: "Arrow",
    shortcut: "A",
  },
  { id: "text", icon: <Type size={18} />, label: "Text", shortcut: "T" },
  { id: "image", icon: <Image size={18} />, label: "Image", shortcut: "I" },
  { id: "frame", icon: <Frame size={18} />, label: "Frame", shortcut: "F" },
  { id: "laser", icon: <Target size={18} />, label: "Laser", shortcut: "K" },
  { id: "lasso", icon: <Lasso size={18} />, label: "Lasso", shortcut: "S" },
];

const EYE_BUTTON_SIZE = 42;
const SIDEBAR_WIDTH = 56;
const CANVAS_TOP = 48;
const CANVAS_BOTTOM = 36;

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
  currentColor,
  isSidebarVisible,
  onToggleSidebar,
  eyePosition,
}) => {
  if (!isSidebarVisible) return null;

  return (
    <nav
      className="vd-sidebar vd-no-select"
      role="navigation"
      aria-label="Drawing tools"
      style={{
        left: Math.min(
          Math.max(0, eyePosition.left - (SIDEBAR_WIDTH - EYE_BUTTON_SIZE) / 2),
          Math.max(0, window.innerWidth - SIDEBAR_WIDTH),
        ),
        top: eyePosition.top + EYE_BUTTON_SIZE,
      }}
    >
      {}
      <div className="vd-sidebar__section">
        <motion.button
          className="vd-eye-toggle"
          onClick={onToggleSidebar}
          title="Hide sidebar"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img src="/epic_pen.svg" alt="" aria-hidden="true" />
        </motion.button>
      </div>

      {}
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

      {}
      <div style={{ flex: 1 }} />

      {}
      <div className="vd-sidebar__section vd-sidebar__bottom">
        <motion.button
          className="vd-tool-btn vd-tool-btn--color"
          onClick={onColorPaletteOpen}
          title="Color Palette"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div
            className="vd-tool-btn__color-dot"
            style={{ backgroundColor: currentColor }}
          />
          <Palette size={16} />
        </motion.button>
      </div>
    </nav>
  );
};


export const SidebarEyeButton: React.FC<{
  onClick: () => void;
  isVisible: boolean;
  position: SidebarEyePosition;
  onPositionChange: (position: SidebarEyePosition) => void;
}> = ({ onClick, isVisible, position, onPositionChange }) => {
  if (isVisible) return null;

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
    moved: boolean;
  } | null>(null);
  const dragFrameRef = useRef<number | null>(null);
  const pendingPositionRef = useRef<SidebarEyePosition | null>(null);

  const flushPosition = () => {
    dragFrameRef.current = null;
    if (pendingPositionRef.current) {
      onPositionChange(pendingPositionRef.current);
      pendingPositionRef.current = null;
    }
  };

  const updatePosition = (event: React.PointerEvent<HTMLButtonElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || event.pointerId !== dragState.pointerId) return;

    const offsetX = event.clientX - dragState.startX;
    const offsetY = event.clientY - dragState.startY;
    if (Math.hypot(offsetX, offsetY) > 3) {
      dragState.moved = true;
    }

    const buttonWidth = buttonRef.current?.offsetWidth ?? EYE_BUTTON_SIZE;
    const buttonHeight = buttonRef.current?.offsetHeight ?? EYE_BUTTON_SIZE;
    const maxLeft = Math.max(0, window.innerWidth - buttonWidth);
    const maxTop = Math.max(
      CANVAS_TOP,
      window.innerHeight - CANVAS_BOTTOM - buttonHeight,
    );

    pendingPositionRef.current = {
      left: Math.min(Math.max(0, dragState.startLeft + offsetX), maxLeft),
      top: Math.min(Math.max(CANVAS_TOP, dragState.startTop + offsetY), maxTop),
    };
    if (dragFrameRef.current === null) {
      dragFrameRef.current = requestAnimationFrame(flushPosition);
    }
  };

  const finishPointer = (event: React.PointerEvent<HTMLButtonElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || event.pointerId !== dragState.pointerId) return;

    dragStateRef.current = null;
    if (dragFrameRef.current !== null) {
      cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }
    flushPosition();
    if (buttonRef.current?.hasPointerCapture(event.pointerId)) {
      buttonRef.current.releasePointerCapture(event.pointerId);
    }
    if (!dragState.moved) onClick();
  };

  return (
    <motion.button
      ref={buttonRef}
      className="vd-sidebar-eye-floating"
      title="Show sidebar"
      initial={{ opacity: 0, scale: 0.8, x: -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: -20 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: "fixed",
        left: position.left,
        top: position.top,
        cursor: "grab",
        touchAction: "none", 
      }}
      onPointerDown={(event) => {
        event.preventDefault();
        buttonRef.current?.setPointerCapture(event.pointerId);
        dragStateRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          startLeft: position.left,
          startTop: position.top,
          moved: false,
        };
        if (buttonRef.current) buttonRef.current.style.cursor = "grabbing";
      }}
      onPointerMove={updatePosition}
      onPointerUp={(event) => {
        finishPointer(event);
        if (buttonRef.current) buttonRef.current.style.cursor = "grab";
      }}
      onPointerCancel={finishPointer}
    >
      {}
      <div className="vd-eye-grip" />
      <img src="/epic_pen.svg" alt="" aria-hidden="true" />
    </motion.button>
  );
};
