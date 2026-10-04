import React, { useState, useCallback, useRef, useEffect } from "react";
import { X, Pipette } from "lucide-react";
import { motion } from "framer-motion";

interface ColorPalettePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectColor: (color: string) => void;
  currentColor?: string;
}

const PRESET_COLORS = [
  // Blue
  "#0078D4",
  "#006CBD",
  "#005A9E",
  "#003D7A",
  "#002952",
  "#001429",

  // Light blue
  "#3399FF",
  "#66B3FF",
  "#99CCFF",
  "#CCE6FF",
  "#E6F3FF",
  "#F0F7FF",

  // Orange
  "#FF9500",
  "#E68600",
  "#CC7700",
  "#A35E00",
  "#7A4600",
  "#523000",

  // Green
  "#10B981",
  "#059669",
  "#047857",
  "#065F46",
  "#064E3B",
  "#022C22",

  // Red
  "#EF4444",
  "#DC2626",
  "#B91C1C",
  "#991B1B",
  "#7F1D1D",
  "#450A0A",

  // Purple
  "#8B5CF6",
  "#7C3AED",
  "#6D28D9",
  "#5B21B6",
  "#4C1D95",
  "#3B0764",

  // Neutral
  "#FFFFFF",
  "#F3F4F6",
  "#D1D5DB",
  "#9CA3AF",
  "#6B7280",
  "#374151",
  "#1F2937",
  "#111827",
  "#000000",
  "#1E1E1E",
  "#2D2D2D",
  "#3C3C3C",
];

const RECENT_COLORS_KEY = "vision-suite-recent-colors";

export const ColorPalettePanel: React.FC<ColorPalettePanelProps> = ({
  isOpen,
  onClose,
  onSelectColor,
  currentColor = "#0078D4",
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  const [recentColors, setRecentColors] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_COLORS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customColor, setCustomColor] = useState(currentColor);

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  // Keep custom color synchronized with selected color
  useEffect(() => {
    setCustomColor(currentColor);
  }, [currentColor]);

  // Position palette in the middle of the screen
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const panel = panelRef.current;

      if (!panel) return;

      const rect = panel.getBoundingClientRect();

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Horizontally centered
      const x = Math.max(16, (viewportWidth - rect.width) / 2);

      // Vertically centered
      const y = Math.max(16, (viewportHeight - rect.height) / 2);

      setPosition({
        x,
        y,
      });
    };

    // Wait until panel has rendered
    requestAnimationFrame(updatePosition);

    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  const handleSelectColor = useCallback(
    (color: string) => {
      onSelectColor(color);
      setCustomColor(color);

      setRecentColors((previous) => {
        const updated = [color, ...previous.filter((c) => c !== color)].slice(
          0,
          12,
        );

        localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(updated));

        return updated;
      });
    },
    [onSelectColor],
  );

  const handleCustomColorSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (/^#[0-9A-Fa-f]{6}$/.test(customColor)) {
        handleSelectColor(customColor.toUpperCase());
      }
    },
    [customColor, handleSelectColor],
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Lightweight backdrop */}
      <div
        className="vd-color-palette-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        ref={panelRef}
        className="vd-color-palette"
        style={{
          left: position.x,
          top: position.y,
        }}
        initial={{
          opacity: 0,
          scale: 0.94,
          y: 8,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.94,
          y: 8,
        }}
        transition={{
          duration: 0.14,
          ease: "easeOut",
        }}
      >
        {/* Header */}
        <div className="vd-color-palette__header">
          <div>
            <div className="vd-color-palette__title">Color</div>

            <div className="vd-color-palette__subtitle">Choose a color</div>
          </div>

          <button
            type="button"
            className="vd-color-palette__close"
            onClick={onClose}
            title="Close"
            aria-label="Close color palette"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="vd-color-palette__body">
          {/* Current color */}
          <section className="vd-color-palette__current">
            <div
              className="vd-color-palette__current-preview"
              style={{
                backgroundColor: currentColor,
              }}
            />

            <div className="vd-color-palette__current-info">
              <span className="vd-color-palette__label">Current color</span>

              <span className="vd-color-palette__hex">
                {currentColor.toUpperCase()}
              </span>
            </div>

            <div className="vd-color-palette__pipette">
              <Pipette size={15} />
            </div>
          </section>

          {/* Recent colors */}
          {recentColors.length > 0 && (
            <section className="vd-color-palette__section">
              <div className="vd-color-palette__section-header">
                <span>Recent</span>

                <span className="vd-color-palette__count">
                  {recentColors.length}
                </span>
              </div>

              <div className="vd-color-palette__grid vd-color-palette__grid--recent">
                {recentColors.map((color, index) => (
                  <button
                    key={`${color}-${index}`}
                    type="button"
                    className={`vd-color-palette__swatch ${
                      currentColor.toLowerCase() === color.toLowerCase()
                        ? "vd-color-palette__swatch--active"
                        : ""
                    }`}
                    style={{
                      backgroundColor: color,
                    }}
                    onClick={() => handleSelectColor(color)}
                    title={color}
                    aria-label={`Select ${color}`}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Preset colors */}
          <section className="vd-color-palette__section">
            <div className="vd-color-palette__section-header">
              <span>Preset colors</span>

              <span className="vd-color-palette__count">
                {PRESET_COLORS.length}
              </span>
            </div>

            <div className="vd-color-palette__grid">
              {PRESET_COLORS.map((color, index) => (
                <button
                  key={`${color}-${index}`}
                  type="button"
                  className={`vd-color-palette__swatch ${
                    currentColor.toLowerCase() === color.toLowerCase()
                      ? "vd-color-palette__swatch--active"
                      : ""
                  }`}
                  style={{
                    backgroundColor: color,
                  }}
                  onClick={() => handleSelectColor(color)}
                  title={color}
                  aria-label={`Select ${color}`}
                />
              ))}
            </div>
          </section>

          {/* Custom */}
          <section className="vd-color-palette__section">
            <div className="vd-color-palette__section-header">
              <span>Custom color</span>
            </div>

            <form
              className="vd-color-palette__custom"
              onSubmit={handleCustomColorSubmit}
            >
              <label className="vd-color-palette__color-input">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  aria-label="Choose custom color"
                />
              </label>

              <input
                className="vd-color-palette__hex-input"
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                placeholder="#000000"
                maxLength={7}
                spellCheck={false}
                aria-label="Hex color"
              />

              <button type="submit" className="vd-color-palette__apply">
                Apply
              </button>
            </form>
          </section>
        </div>
      </motion.div>
    </>
  );
};
