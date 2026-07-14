/**
 * Parvez Draw — Right Properties Panel
 *
 * Context-aware panel that changes based on selected object.
 * Includes: Appearance, Stroke, Fill, Shadow, Opacity, Typography, Alignment, Layer
 */

import React, { useState, useCallback } from "react";
import {
  Palette,
  PenLine,
  Paintbrush,
  CircleDot,
  Eye,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Layers,
  ChevronDown,
  ChevronRight,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Group,
  Ungroup,
  MoveUp,
  MoveDown,
  MoveHorizontal,
  MoveVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ExcalidrawElement } from "@excalidraw/element/types";

interface PropertiesPanelProps {
  selectedElements: ExcalidrawElement[];
  onUpdateElement: (id: string, updates: Partial<ExcalidrawElement>) => void;
  onDeleteElements: (ids: string[]) => void;
  onDuplicateElements: (ids: string[]) => void;
  onBringForward: (ids: string[]) => void;
  onSendBackward: (ids: string[]) => void;
  onGroupElements: (ids: string[]) => void;
  onUngroupElements: (ids: string[]) => void;
}

const PRESET_COLORS = [
  "#006a4e", // Bangladesh Green
  "#f42a41", // Bangladesh Red
  "#1e293b", // Dark Slate
  "#475569", // Slate
  "#94a3b8", // Gray
  "#ffffff", // White
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#ef4444", // Red
  "#06b6d4", // Cyan
];

const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, icon, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="pd-properties-panel__section">
      <button
        className="pd-properties-panel__section-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="pd-properties-panel__section-title">
          {icon}
          <span>{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={{ duration: 0.15 }}
        >
          <ChevronDown size={14} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="pd-properties-panel__section-content">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ColorPicker: React.FC<{
  value: string;
  onChange: (color: string) => void;
  label?: string;
}> = ({ value, onChange, label }) => {
  const [showPresets, setShowPresets] = useState(false);

  return (
    <div className="pd-properties-panel__color-picker">
      {label && (
        <span className="pd-properties-panel__label">{label}</span>
      )}
      <div className="pd-properties-panel__color-input">
        <div
          className="pd-color-swatch"
          style={{ background: value }}
          onClick={() => setShowPresets(!showPresets)}
        />
        <input
          type="text"
          className="pd-input pd-input--sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>

      <AnimatePresence>
        {showPresets && (
          <motion.div
            className="pd-properties-panel__presets"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                className={`pd-color-swatch ${value === color ? "pd-color-swatch--active" : ""}`}
                style={{ background: color }}
                onClick={() => {
                  onChange(color);
                  setShowPresets(false);
                }}
                title={color}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SliderInput: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}> = ({ label, value, min, max, step = 1, unit = "", onChange }) => {
  return (
    <div className="pd-properties-panel__slider">
      <span className="pd-properties-panel__label">{label}</span>
      <div className="pd-properties-panel__slider-input">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="pd-range"
        />
        <span className="pd-properties-panel__value">
          {Math.round(value)}{unit}
        </span>
      </div>
    </div>
  );
};

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElements,
  onUpdateElement,
  onDeleteElements,
  onDuplicateElements,
  onBringForward,
  onSendBackward,
  onGroupElements,
  onUngroupElements,
}) => {
  const [activeTab, setActiveTab] = useState<"style" | "align" | "layer">("style");

  const element = selectedElements[0];
  const isMultiSelect = selectedElements.length > 1;

  const handleColorChange = useCallback(
    (property: string, value: string) => {
      if (element) {
        onUpdateElement(element.id, { [property]: value } as any);
      }
    },
    [element, onUpdateElement],
  );

  const handleOpacityChange = useCallback(
    (value: number) => {
      if (element) {
        onUpdateElement(element.id, { opacity: value / 100 });
      }
    },
    [element, onUpdateElement],
  );

  const handleStrokeWidthChange = useCallback(
    (value: number) => {
      if (element) {
        onUpdateElement(element.id, { strokeWidth: value });
      }
    },
    [element, onUpdateElement],
  );

  // Empty state
  if (selectedElements.length === 0) {
    return (
      <div className="pd-properties-panel">
        <div className="pd-properties-panel__header">
          <span className="pd-properties-panel__title">Properties</span>
        </div>
        <div className="pd-properties-panel__empty">
          <Layers size={32} strokeWidth={1.5} />
          <p>Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pd-properties-panel">
      {/* Header */}
      <div className="pd-properties-panel__header">
        <span className="pd-properties-panel__title">
          {isMultiSelect
            ? `${selectedElements.length} elements`
            : element?.type || "Element"}
        </span>
      </div>

      {/* Tabs */}
      <div className="pd-properties-panel__tabs">
        <button
          className={`pd-properties-panel__tab ${activeTab === "style" ? "pd-properties-panel__tab--active" : ""}`}
          onClick={() => setActiveTab("style")}
        >
          <Palette size={14} />
          Style
        </button>
        <button
          className={`pd-properties-panel__tab ${activeTab === "align" ? "pd-properties-panel__tab--active" : ""}`}
          onClick={() => setActiveTab("align")}
        >
          <AlignLeft size={14} />
          Align
        </button>
        <button
          className={`pd-properties-panel__tab ${activeTab === "layer" ? "pd-properties-panel__tab--active" : ""}`}
          onClick={() => setActiveTab("layer")}
        >
          <Layers size={14} />
          Layer
        </button>
      </div>

      {/* Content */}
      <div className="pd-properties-panel__content">
        {activeTab === "style" && (
          <>
            {/* Appearance */}
            <Section title="Fill" icon={<Paintbrush size={14} />}>
              <ColorPicker
                value={(element as any)?.backgroundColor || "#transparent"}
                onChange={(v) => handleColorChange("backgroundColor", v)}
                label="Color"
              />
              <SliderInput
                label="Opacity"
                value={((element as any)?.opacity ?? 1) * 100}
                min={0}
                max={100}
                unit="%"
                onChange={handleOpacityChange}
              />
            </Section>

            {/* Stroke */}
            <Section title="Stroke" icon={<PenLine size={14} />}>
              <ColorPicker
                value={(element as any)?.strokeColor || "#1e293b"}
                onChange={(v) => handleColorChange("strokeColor", v)}
                label="Color"
              />
              <SliderInput
                label="Width"
                value={(element as any)?.strokeWidth ?? 2}
                min={1}
                max={20}
                unit="px"
                onChange={handleStrokeWidthChange}
              />
            </Section>

            {/* Shadow */}
            <Section title="Shadow" icon={<CircleDot size={14} />} defaultOpen={false}>
              <div className="pd-properties-panel__row">
                <span className="pd-properties-panel__label">Drop Shadow</span>
                <button className="pd-btn pd-btn--ghost pd-btn--sm">
                  Enable
                </button>
              </div>
            </Section>
          </>
        )}

        {activeTab === "align" && (
          <>
            <Section title="Alignment" icon={<AlignLeft size={14} />}>
              <div className="pd-properties-panel__align-grid">
                <button className="pd-btn pd-btn--icon pd-btn--ghost" title="Align left">
                  <AlignLeft size={16} />
                </button>
                <button className="pd-btn pd-btn--icon pd-btn--ghost" title="Align center horizontally">
                  <AlignCenter size={16} />
                </button>
                <button className="pd-btn pd-btn--icon pd-btn--ghost" title="Align right">
                  <AlignRight size={16} />
                </button>
                <div className="pd-divider--vertical" />
                <button className="pd-btn pd-btn--icon pd-btn--ghost" title="Align top">
                  <AlignStartVertical size={16} />
                </button>
                <button className="pd-btn pd-btn--icon pd-btn--ghost" title="Align center vertically">
                  <AlignCenterVertical size={16} />
                </button>
                <button className="pd-btn pd-btn--icon pd-btn--ghost" title="Align bottom">
                  <AlignEndVertical size={16} />
                </button>
              </div>
            </Section>

            <Section title="Distribution" icon={<MoveHorizontal size={14} />} defaultOpen={false}>
              <div className="pd-properties-panel__align-grid">
                <button className="pd-btn pd-btn--icon pd-btn--ghost" title="Distribute horizontally">
                  <MoveHorizontal size={16} />
                </button>
                <button className="pd-btn pd-btn--icon pd-btn--ghost" title="Distribute vertically">
                  <MoveVertical size={16} />
                </button>
              </div>
            </Section>
          </>
        )}

        {activeTab === "layer" && (
          <>
            <Section title="Arrange" icon={<Layers size={14} />}>
              <div className="pd-properties-panel__layer-actions">
                <button
                  className="pd-btn pd-btn--ghost pd-btn--sm"
                  onClick={() => onBringForward(selectedElements.map((e) => e.id))}
                >
                  <MoveUp size={14} />
                  Bring Forward
                </button>
                <button
                  className="pd-btn pd-btn--ghost pd-btn--sm"
                  onClick={() => onSendBackward(selectedElements.map((e) => e.id))}
                >
                  <MoveDown size={14} />
                  Send Backward
                </button>
              </div>
            </Section>

            <Section title="Group" icon={<Group size={14} />}>
              <div className="pd-properties-panel__layer-actions">
                <button
                  className="pd-btn pd-btn--ghost pd-btn--sm"
                  onClick={() => onGroupElements(selectedElements.map((e) => e.id))}
                  disabled={selectedElements.length < 2}
                >
                  <Group size={14} />
                  Group
                </button>
                <button
                  className="pd-btn pd-btn--ghost pd-btn--sm"
                  onClick={() => onUngroupElements(selectedElements.map((e) => e.id))}
                >
                  <Ungroup size={14} />
                  Ungroup
                </button>
              </div>
            </Section>

            <Section title="Actions" icon={<Copy size={14} />}>
              <div className="pd-properties-panel__layer-actions">
                <button
                  className="pd-btn pd-btn--ghost pd-btn--sm"
                  onClick={() => onDuplicateElements(selectedElements.map((e) => e.id))}
                >
                  <Copy size={14} />
                  Duplicate
                </button>
                <button
                  className="pd-btn pd-btn--ghost pd-btn--sm pd-btn--danger"
                  onClick={() => onDeleteElements(selectedElements.map((e) => e.id))}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
};
