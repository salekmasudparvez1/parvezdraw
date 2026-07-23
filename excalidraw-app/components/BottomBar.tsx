/**
 * Vision Suite — Bottom Bar
 *
 * Simple status bar - Zoom controls and element count only.
 */

import React from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";

interface BottomBarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onZoomToFit: () => void;
  selectedCount?: number;
  elementCount?: number;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomToFit,
  selectedCount = 0,
  elementCount = 0,
}) => {
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="vd-bottombar" role="status" aria-label="Canvas status">
      {/* Left — Zoom controls */}
      <div className="vd-bottombar__left">
        <button
          className="vd-status-item vd-bottombar__zoom-btn"
          onClick={onZoomOut}
          title="Zoom out"
          aria-label="Zoom out"
        >
          <ZoomOut size={12} />
        </button>

        <button
          className="vd-status-item vd-bottombar__zoom-value"
          onClick={onZoomReset}
          title="Reset zoom"
          aria-label={`Zoom level: ${zoomPercent}%`}
        >
          {zoomPercent}%
        </button>

        <button
          className="vd-status-item vd-bottombar__zoom-btn"
          onClick={onZoomIn}
          title="Zoom in"
          aria-label="Zoom in"
        >
          <ZoomIn size={12} />
        </button>

        <button
          className="vd-status-item vd-bottombar__zoom-btn"
          onClick={onZoomToFit}
          title="Zoom to fit"
          aria-label="Zoom to fit"
        >
          <Maximize2 size={12} />
        </button>
      </div>

      {/* Right — Element count */}
      <div className="vd-bottombar__right">
        <span className="vd-status-item" aria-label={`${elementCount} elements on canvas`}>
          {elementCount} elements
        </span>
      </div>
    </div>
  );
};
