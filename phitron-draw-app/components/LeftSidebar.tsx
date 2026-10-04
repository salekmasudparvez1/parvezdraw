import React, { useRef, useCallback, memo } from "react";
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

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface ToolItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  shortcut: string;
}

export interface SidebarEyePosition {
  left: number;
  top: number;
}

interface LeftSidebarProps {
  activeTool: string;
  onToolSelect: (toolId: string) => void;
  onColorPaletteOpen?: () => void;
  currentColor: string;
  isSidebarVisible: boolean;
  onToggleSidebar: () => void;
  eyePosition: SidebarEyePosition;
  onPositionChange?: (position: SidebarEyePosition) => void;
}

/* ------------------------------------------------------------------ */
/* Tool Groups                                                        */
/* ------------------------------------------------------------------ */

export const TOOL_GROUPS: { id: string; tools: ToolItem[] }[] = [
  {
    id: "nav",
    tools: [
      {
        id: "selection",
        icon: <MousePointer2 size={17} />,
        label: "Select",
        shortcut: "V",
      },
      {
        id: "hand",
        icon: <Hand size={17} />,
        label: "Hand (Pan)",
        shortcut: "H",
      },
      {
        id: "lasso",
        icon: <Lasso size={17} />,
        label: "Lasso Select",
        shortcut: "S",
      },
    ],
  },
  {
    id: "draw",
    tools: [
      {
        id: "freedraw",
        icon: <Pen size={17} />,
        label: "Pen",
        shortcut: "P",
      },
      {
        id: "eraser",
        icon: <Eraser size={17} />,
        label: "Eraser",
        shortcut: "E",
      },
      {
        id: "laser",
        icon: <Target size={17} />,
        label: "Laser Pointer",
        shortcut: "K",
      },
    ],
  },
  {
    id: "shapes",
    tools: [
      {
        id: "rectangle",
        icon: <Square size={17} />,
        label: "Rectangle",
        shortcut: "R",
      },
      {
        id: "diamond",
        icon: <Diamond size={17} />,
        label: "Diamond",
        shortcut: "D",
      },
      {
        id: "ellipse",
        icon: <Circle size={17} />,
        label: "Ellipse",
        shortcut: "O",
      },
      {
        id: "line",
        icon: <Minus size={17} />,
        label: "Line",
        shortcut: "L",
      },
      {
        id: "arrow",
        icon: <ArrowUpRight size={17} />,
        label: "Arrow",
        shortcut: "A",
      },
    ],
  },
  {
    id: "creation",
    tools: [
      {
        id: "text",
        icon: <Type size={17} />,
        label: "Text",
        shortcut: "T",
      },
      {
        id: "image",
        icon: <Image size={17} />,
        label: "Insert Image",
        shortcut: "9",
      },
      {
        id: "frame",
        icon: <Frame size={17} />,
        label: "Frame",
        shortcut: "F",
      },
    ],
  },
];

const SIDEBAR_WIDTH = 54;
const CANVAS_TOP = 48;
const CANVAS_BOTTOM = 36;

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  startLeft: number;
  startTop: number;
  currentLeft: number;
  currentTop: number;
  moved: boolean;
  isEyeToggle?: boolean;
}

/* ------------------------------------------------------------------ */
/* SidebarToolButton                                                   */
/* ------------------------------------------------------------------ */

const SidebarToolButton = memo<{
  tool: ToolItem;
  isActive: boolean;
  onSelect: (id: string) => void;
}>(({ tool, isActive, onSelect }) => {
  return (
    <button
      type="button"
      className={`vd-tool-btn ${isActive ? "vd-tool-btn--active" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(tool.id);
      }}
      title={`${tool.label} (${tool.shortcut})`}
      aria-label={tool.label}
      aria-pressed={isActive}
    >
      {tool.icon}
    </button>
  );
});
SidebarToolButton.displayName = "SidebarToolButton";

/* ------------------------------------------------------------------ */
/* LeftSidebar                                                         */
/* ------------------------------------------------------------------ */

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTool,
  onToolSelect,
  onColorPaletteOpen,
  currentColor,
  isSidebarVisible,
  onToggleSidebar,
  eyePosition,
  onPositionChange,
}) => {
  const sidebarRef = useRef<HTMLElement>(null);
  const dragStateRef = useRef<DragState | null>(null);

  const posRef = useRef(eyePosition);
  posRef.current = eyePosition;

  const onPositionChangeRef = useRef(onPositionChange);
  onPositionChangeRef.current = onPositionChange;

  const onToggleSidebarRef = useRef(onToggleSidebar);
  onToggleSidebarRef.current = onToggleSidebar;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      // Don't start drag when clicking tool buttons or the color button directly
      const target = e.target as HTMLElement;
      if (target.closest(".vd-tool-btn")) {
        return;
      }

      if (e.button !== 0 && e.pointerType === "mouse") return;
      const el = sidebarRef.current;
      if (!el) return;

      const isEyeToggle = !!target.closest(".vd-eye-toggle");

      el.setPointerCapture(e.pointerId);
      dragStateRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startLeft: posRef.current.left,
        startTop: posRef.current.top,
        currentLeft: posRef.current.left,
        currentTop: posRef.current.top,
        moved: false,
        isEyeToggle,
      };
      el.style.cursor = "grabbing";
      el.style.transition = "none";
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const drag = dragStateRef.current;
      const el = sidebarRef.current;
      if (!drag || !el || e.pointerId !== drag.pointerId) return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) > 3) {
        drag.moved = true;
      }

      const w = el.offsetWidth || SIDEBAR_WIDTH;
      const h = el.offsetHeight || 500;
      const maxLeft = Math.max(8, window.innerWidth - w - 8);
      const maxTop = Math.max(
        CANVAS_TOP + 4,
        window.innerHeight - CANVAS_BOTTOM - h - 8,
      );

      const nextLeft = Math.min(Math.max(8, drag.startLeft + dx), maxLeft);
      const nextTop = Math.min(
        Math.max(CANVAS_TOP + 4, drag.startTop + dy),
        maxTop,
      );

      drag.currentLeft = nextLeft;
      drag.currentTop = nextTop;

      const translateX = nextLeft - drag.startLeft;
      const translateY = nextTop - drag.startTop;
      el.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
    },
    [],
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const drag = dragStateRef.current;
      const el = sidebarRef.current;

      if (!drag || !el || e.pointerId !== drag.pointerId) return;

      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }

      el.style.cursor = "grab";
      el.style.transition = "";
      el.style.transform = "";

      if (drag.moved) {
        onPositionChangeRef.current?.({
          left: drag.currentLeft,
          top: drag.currentTop,
        });
      } else if (drag.isEyeToggle) {
        onToggleSidebarRef.current?.();
      }

      dragStateRef.current = null;
    },
    [],
  );

  if (!isSidebarVisible) return null;

  // Align sidebar clamped within viewport bounds
  const left = Math.min(
    Math.max(8, eyePosition.left),
    Math.max(8, window.innerWidth - SIDEBAR_WIDTH - 8),
  );
  const top = Math.min(
    Math.max(CANVAS_TOP + 4, eyePosition.top),
    Math.max(CANVAS_TOP + 4, window.innerHeight - CANVAS_BOTTOM - 200),
  );

  return (
    <nav
      ref={sidebarRef}
      className="vd-sidebar vd-no-select"
      role="navigation"
      aria-label="Drawing tools"
      style={{
        left,
        top,
        cursor: "grab",
        touchAction: "none",
        willChange: "transform",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {/* Top drag handle indicator */}
      <div
        className="vd-sidebar__drag-handle"
        title="Drag toolbar anywhere"
        aria-label="Drag toolbar"
      >
        <div className="vd-sidebar__grip-pill" />
      </div>

      {/* Top section: eye/pen toggle */}
      <div className="vd-sidebar__section vd-sidebar__header">
        <button
          type="button"
          className="vd-eye-toggle"
          title="Hide toolbar (click to hide, or drag to move)"
          aria-label="Hide toolbar"
        >
          <img
            src="/epic_pen.svg"
            alt=""
            aria-hidden="true"
            draggable={false}
          />
        </button>
      </div>

      {/* Tool Groups */}
      <div className="vd-sidebar__tools">
        {TOOL_GROUPS.map((group, groupIdx) => (
          <React.Fragment key={group.id}>
            {groupIdx > 0 && <div className="vd-sidebar__divider" />}
            {group.tools.map((tool) => (
              <SidebarToolButton
                key={tool.id}
                tool={tool}
                isActive={activeTool === tool.id}
                onSelect={onToolSelect}
              />
            ))}
          </React.Fragment>
        ))}
      </div>

      <div className="vd-sidebar__divider" />

      {/* Bottom section: color palette */}
      <div className="vd-sidebar__bottom">
        <button
          type="button"
          className="vd-tool-btn vd-tool-btn--color"
          onClick={(e) => {
            e.stopPropagation();
            onColorPaletteOpen?.();
          }}
          title="Color Palette"
          aria-label="Color Palette"
        >
          <div
            className="vd-tool-btn__color-dot"
            style={{ backgroundColor: currentColor }}
          />
          <Palette size={14} />
        </button>
      </div>
    </nav>
  );
};

/* ------------------------------------------------------------------ */
/* SidebarEyeButton — floating eye button when sidebar is closed       */
/* ------------------------------------------------------------------ */

interface SidebarEyeButtonProps {
  onClick: () => void;
  isVisible: boolean;
  position: SidebarEyePosition;
  onPositionChange: (position: SidebarEyePosition) => void;
}

export const SidebarEyeButton: React.FC<SidebarEyeButtonProps> = ({
  onClick,
  isVisible,
  position,
  onPositionChange,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragStateRef = useRef<DragState | null>(null);

  const posRef = useRef(position);
  posRef.current = position;

  const onPositionChangeRef = useRef(onPositionChange);
  onPositionChangeRef.current = onPositionChange;
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      const el = buttonRef.current;
      if (!el) return;

      el.setPointerCapture(e.pointerId);
      dragStateRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startLeft: posRef.current.left,
        startTop: posRef.current.top,
        currentLeft: posRef.current.left,
        currentTop: posRef.current.top,
        moved: false,
      };
      el.style.cursor = "grabbing";
      el.style.transition = "none";
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const drag = dragStateRef.current;
      const el = buttonRef.current;
      if (!drag || !el || e.pointerId !== drag.pointerId) return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) > 3) {
        drag.moved = true;
      }

      const w = el.offsetWidth || 44;
      const h = el.offsetHeight || 44;
      const maxLeft = Math.max(8, window.innerWidth - w - 8);
      const maxTop = Math.max(
        CANVAS_TOP + 4,
        window.innerHeight - CANVAS_BOTTOM - h - 8,
      );

      const nextLeft = Math.min(Math.max(8, drag.startLeft + dx), maxLeft);
      const nextTop = Math.min(
        Math.max(CANVAS_TOP + 4, drag.startTop + dy),
        maxTop,
      );

      drag.currentLeft = nextLeft;
      drag.currentTop = nextTop;

      const translateX = nextLeft - drag.startLeft;
      const translateY = nextTop - drag.startTop;
      el.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
    },
    [],
  );

  const endDrag = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragStateRef.current;
    const el = buttonRef.current;
    if (!drag || !el || e.pointerId !== drag.pointerId) return;

    if (el.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
    el.style.cursor = "grab";
    el.style.transition = "";
    el.style.transform = "";

    if (drag.moved) {
      onPositionChangeRef.current({
        left: drag.currentLeft,
        top: drag.currentTop,
      });
    } else {
      onClickRef.current();
    }
    dragStateRef.current = null;
  }, []);

  if (isVisible) return null;

  const left = Math.min(
    Math.max(8, position.left),
    Math.max(8, window.innerWidth - 52),
  );
  const top = Math.min(
    Math.max(CANVAS_TOP + 4, position.top),
    Math.max(CANVAS_TOP + 4, window.innerHeight - CANVAS_BOTTOM - 52),
  );

  return (
    <button
      ref={buttonRef}
      type="button"
      className="vd-sidebar-eye-floating"
      title="Show toolbar (click to open, or drag to move)"
      aria-label="Show toolbar"
      style={{
        position: "fixed",
        left,
        top,
        cursor: "grab",
        touchAction: "none",
        willChange: "transform",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div className="vd-eye-grip" />
      <img src="/epic_pen.svg" alt="" aria-hidden="true" draggable={false} />
    </button>
  );
};
