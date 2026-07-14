/**
 * Parvez Draw — Bottom Bar
 *
 * Canvas controls, zoom, grid, snap, coordinates, and status info.
 * Monospace font for technical readouts.
 */

import React from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3X3,
  Magnet,
  Crosshair,
  Gauge,
} from "lucide-react";
import { motion } from "framer-motion";

interface BottomBarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onZoomToFit: () => void;
  gridEnabled: boolean;
  onGridToggle: () => void;
  snapEnabled: boolean;
  onSnapToggle: () => void;
  cursorX?: number;
  cursorY?: number;
  selectedCount?: number;
  elementCount?: number;
  isPerformanceMode?: boolean;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomToFit,
  gridEnabled,
  onGridToggle,
  snapEnabled,
  onSnapToggle,
  cursorX,
  cursorY,
  selectedCount = 0,
  elementCount = 0,
  isPerformanceMode = false,
}) => {
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="pd-bottombar" role="status" aria-label="Canvas status">
      {/* Left — Zoom controls */}
      <div className="pd-bottombar__left">
        <button
          className="pd-status-item pd-bottombar__zoom-btn"
          onClick={onZoomOut}
          title="Zoom out"
          aria-label="Zoom out"
        >
          <ZoomOut size={12} />
        </button>

        <button
          className="pd-status-item pd-bottombar__zoom-value"
          onClick={onZoomReset}
          title="Reset zoom"
          aria-label={`Zoom level: ${zoomPercent}%`}
        >
          {zoomPercent}%
        </button>

        <button
          className="pd-status-item pd-bottombar__zoom-btn"
          onClick={onZoomIn}
          title="Zoom in"
          aria-label="Zoom in"
        >
          <ZoomIn size={12} />
        </button>

        <button
          className="pd-status-item pd-bottombar__zoom-btn"
          onClick={onZoomToFit}
          title="Zoom to fit"
          aria-label="Zoom to fit"
        >
          <Maximize2 size={12} />
        </button>
      </div>

      {/* Center — Canvas controls */}
      <div className="pd-bottombar__center">
        <button
          className={`pd-status-item ${gridEnabled ? "pd-status-item--active" : ""}`}
          onClick={onGridToggle}
          title="Toggle grid"
          aria-label="Toggle grid"
          aria-pressed={gridEnabled}
        >
          <Grid3X3 size={12} />
          <span>Grid</span>
        </button>

        <button
          className={`pd-status-item ${snapEnabled ? "pd-status-item--active" : ""}`}
          onClick={onSnapToggle}
          title="Toggle snap to objects"
          aria-label="Toggle snap to objects"
          aria-pressed={snapEnabled}
        >
          <Magnet size={12} />
          <span>Snap</span>
        </button>
      </div>

      {/* Right — Status info */}
      <div className="pd-bottombar__right">
        {/* Coordinates */}
        {cursorX !== undefined && cursorY !== undefined && (
          <span className="pd-status-item" aria-label="Cursor position">
            <Crosshair size={12} />
            <span>
              {Math.round(cursorX)}, {Math.round(cursorY)}
            </span>
          </span>
        )}

        {/* Selection info */}
        {selectedCount > 0 && (
          <span className="pd-status-item" aria-label={`${selectedCount} elements selected`}>
            {selectedCount} selected
          </span>
        )}

        {/* Element count */}
        <span className="pd-status-item" aria-label={`${elementCount} elements on canvas`}>
          {elementCount} elements
        </span>

        {/* Performance mode indicator */}
        {isPerformanceMode && (
          <span className="pd-status-item pd-status-item--warning" aria-label="Performance mode active">
            <Gauge size={12} />
            <span>Perf</span>
          </span>
        )}
      </div>
    </div>
  );
};
