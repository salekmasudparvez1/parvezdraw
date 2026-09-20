






import React, { useState, useCallback, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";

interface ColorPalettePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectColor: (color: string) => void;
  currentColor?: string;
}

const PRESET_COLORS = [
  "#0078D4", "#006CBD", "#005A9E", "#003D7A", "#002952", "#001429",
  "#3399ff", "#66b3ff", "#99ccff", "#cce6ff", "#e6f3ff", "#f0f7ff",
  "#FF9500", "#E68600", "#CC7700", "#A35E00", "#7A4600", "#523000",
  "#10b981", "#059669", "#047857", "#065f46", "#064e3b", "#022c22",
  "#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d", "#450a0a",
  "#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95", "#3b0764",
  "#ffffff", "#f3f4f6", "#d1d5db", "#9ca3af", "#6b7280", "#374151",
  "#1f2937", "#111827", "#000000", "#1e1e1e", "#2d2d2d", "#3c3c3c",
];

const RECENT_COLORS_KEY = "vision-suite-recent-colors";

export const ColorPalettePanel: React.FC<ColorPalettePanelProps> = ({
  isOpen,
  onClose,
  onSelectColor,
  currentColor = "#0078D4",
}) => {
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    const saved = localStorage.getItem(RECENT_COLORS_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [];
  });

  const [customColor, setCustomColor] = useState(currentColor);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
    if (isOpen && panelRef.current) {
      const panel = panelRef.current;
      const rect = panel.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = 100; 
      let y = viewportHeight / 2 - rect.height / 2; 

      
      if (x + rect.width > viewportWidth - 20) {
        x = viewportWidth - rect.width - 20;
      }
      if (y < 60) y = 60; 
      if (y + rect.height > viewportHeight - 20) {
        y = viewportHeight - rect.height - 20;
      }

      setPosition({ x, y });
    }
  }, [isOpen]);

  const handleSelectColor = useCallback(
    (color: string) => {
      onSelectColor(color);
      setCustomColor(color);
      const newRecent = [color, ...recentColors.filter((c) => c !== color)].slice(0, 12);
      setRecentColors(newRecent);
      localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(newRecent));
    },
    [onSelectColor, recentColors]
  );

  const handleCustomColorSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (/^#[0-9A-Fa-f]{6}$/.test(customColor)) {
        handleSelectColor(customColor);
      }
    },
    [customColor, handleSelectColor]
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="vd-dialog-backdrop" onClick={onClose} />
      <motion.div
        ref={panelRef}
        className="vd-color-palette"
        style={{ left: position.x, top: position.y, transform: "none" }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.12 }}
      >
        <div className="vd-color-palette__header">
          <span className="vd-color-palette__title">Color Palette</span>
          <button className="vd-color-palette__close" onClick={onClose} title="Close">
            <X size={16} />
          </button>
        </div>

        <div className="vd-color-palette__body">
          {}
          <div className="vd-color-palette__section">
            <div className="vd-color-palette__section-title">Current</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: currentColor, border: "2px solid var(--vd-border-default)" }} />
              <span style={{ fontFamily: "var(--vd-font-mono)", fontSize: 12, color: "var(--vd-text-secondary)" }}>
                {currentColor}
              </span>
            </div>
          </div>

          {}
          {recentColors.length > 0 && (
            <div className="vd-color-palette__section">
              <div className="vd-color-palette__section-title">Recent</div>
              <div className="vd-color-palette__grid">
                {recentColors.map((color, index) => (
                  <button
                    key={`${color}-${index}`}
                    className={`vd-color-palette__swatch ${currentColor === color ? "vd-color-palette__swatch--active" : ""}`}
                    style={{ background: color }}
                    onClick={() => handleSelectColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {}
          <div className="vd-color-palette__section">
            <div className="vd-color-palette__section-title">Preset Colors</div>
            <div className="vd-color-palette__grid">
              {PRESET_COLORS.map((color, index) => (
                <button
                  key={`${color}-${index}`}
                  className={`vd-color-palette__swatch ${currentColor === color ? "vd-color-palette__swatch--active" : ""}`}
                  style={{ background: color }}
                  onClick={() => handleSelectColor(color)}
                  title={color}
                />
              ))}
            </div>
          </div>

          {}
          <div className="vd-color-palette__section">
            <div className="vd-color-palette__section-title">Custom</div>
            <form className="vd-color-palette__custom" onSubmit={handleCustomColorSubmit}>
              <input type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} />
              <input type="text" value={customColor} onChange={(e) => setCustomColor(e.target.value)} placeholder="#000000" maxLength={7} />
              <button type="submit" className="vd-btn vd-btn--primary vd-btn--sm">Apply</button>
            </form>
          </div>
        </div>
      </motion.div>
    </>
  );
};
