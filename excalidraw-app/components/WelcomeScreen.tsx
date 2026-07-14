/**
 * Parvez Draw — Welcome Screen
 *
 * Beautiful landing page with:
 * - App branding
 * - Recent drawings
 * - Templates
 * - Quick actions
 * - Keyboard shortcuts
 * - Tips
 */

import React, { useState } from "react";
import {
  Plus,
  FileImage,
  FileText,
  Clock,
  Star,
  Grid3X3,
  Zap,
  Keyboard,
  ArrowRight,
  Palette,
  Layout,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

interface WelcomeScreenProps {
  onNewDrawing: () => void;
  onOpenFile: () => void;
  onImportFile: () => void;
  recentFiles?: Array<{
    id: string;
    name: string;
    thumbnail?: string;
    lastModified: Date;
  }>;
  onOpenRecent: (id: string) => void;
}

const TEMPLATES = [
  {
    id: "blank",
    name: "Blank Canvas",
    icon: <FileImage size={24} />,
    description: "Start from scratch",
    color: "var(--pd-green-50)",
  },
  {
    id: "flowchart",
    name: "Flowchart",
    icon: <Layout size={24} />,
    description: "Process diagrams",
    color: "var(--pd-blue-50, #eff6ff)",
  },
  {
    id: "mindmap",
    name: "Mind Map",
    icon: <Sparkles size={24} />,
    description: "Brainstorm ideas",
    color: "var(--pd-purple-50, #f5f3ff)",
  },
  {
    id: "wireframe",
    name: "Wireframe",
    icon: <Grid3X3 size={24} />,
    description: "UI mockups",
    color: "var(--pd-amber-50, #fffbeb)",
  },
];

const QUICK_ACTIONS = [
  {
    id: "new",
    label: "New Drawing",
    icon: <Plus size={18} />,
    shortcut: "Ctrl+N",
    color: "var(--pd-green-500)",
  },
  {
    id: "open",
    label: "Open File",
    icon: <FileText size={18} />,
    shortcut: "Ctrl+O",
    color: "var(--pd-text-secondary)",
  },
  {
    id: "import",
    label: "Import",
    icon: <FileImage size={18} />,
    shortcut: "Ctrl+I",
    color: "var(--pd-text-secondary)",
  },
];

const TIPS = [
  "Press Ctrl+K to open the command palette",
  "Use Ctrl+Z to undo and Ctrl+Shift+Z to redo",
  "Hold Space to pan around the canvas",
  "Press Ctrl+G to group selected elements",
  "Double-click text to edit it",
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onNewDrawing,
  onOpenFile,
  onImportFile,
  recentFiles = [],
  onOpenRecent,
}) => {
  const [activeTip, setActiveTip] = useState(0);

  return (
    <div className="pd-welcome">
      <motion.div
        className="pd-welcome__container"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div className="pd-welcome__header" variants={item}>
          <div className="pd-welcome__logo">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="48" height="48" rx="12" fill="var(--pd-green-500)" />
              <path
                d="M14 14h8v8h-8v-8zm0 12h8v8h-8v-8zm12-12h8v8h-8v-8zm6 12h2v8h-2v-8z"
                fill="white"
              />
            </svg>
          </div>
          <h1 className="pd-welcome__title">Parvez Draw</h1>
          <p className="pd-welcome__subtitle">
            A modern whiteboard for your ideas
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div className="pd-welcome__section" variants={item}>
          <h2 className="pd-welcome__section-title">Get Started</h2>
          <div className="pd-welcome__actions">
            {QUICK_ACTIONS.map((action) => (
              <motion.button
                key={action.id}
                className="pd-welcome__action"
                onClick={() => {
                  if (action.id === "new") onNewDrawing();
                  else if (action.id === "open") onOpenFile();
                  else if (action.id === "import") onImportFile();
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className="pd-welcome__action-icon"
                  style={{ color: action.color }}
                >
                  {action.icon}
                </div>
                <div className="pd-welcome__action-content">
                  <span className="pd-welcome__action-label">{action.label}</span>
                  <kbd className="pd-welcome__action-shortcut">{action.shortcut}</kbd>
                </div>
                <ArrowRight size={16} className="pd-welcome__action-arrow" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Templates */}
        <motion.div className="pd-welcome__section" variants={item}>
          <h2 className="pd-welcome__section-title">Templates</h2>
          <div className="pd-welcome__templates">
            {TEMPLATES.map((template) => (
              <motion.button
                key={template.id}
                className="pd-welcome__template"
                onClick={onNewDrawing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className="pd-welcome__template-icon"
                  style={{ background: template.color }}
                >
                  {template.icon}
                </div>
                <div className="pd-welcome__template-content">
                  <span className="pd-welcome__template-name">{template.name}</span>
                  <span className="pd-welcome__template-desc">{template.description}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent Files */}
        {recentFiles.length > 0 && (
          <motion.div className="pd-welcome__section" variants={item}>
            <h2 className="pd-welcome__section-title">Recent</h2>
            <div className="pd-welcome__recent">
              {recentFiles.slice(0, 4).map((file) => (
                <motion.button
                  key={file.id}
                  className="pd-welcome__recent-item"
                  onClick={() => onOpenRecent(file.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="pd-welcome__recent-thumb">
                    {file.thumbnail ? (
                      <img src={file.thumbnail} alt="" />
                    ) : (
                      <FileImage size={20} />
                    )}
                  </div>
                  <div className="pd-welcome__recent-info">
                    <span className="pd-welcome__recent-name">{file.name}</span>
                    <span className="pd-welcome__recent-date">
                      {formatRelativeTime(file.lastModified)}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Keyboard Shortcuts */}
        <motion.div className="pd-welcome__section pd-welcome__section--compact" variants={item}>
          <div className="pd-welcome__shortcuts">
            <Keyboard size={14} />
            <span>
              Press <kbd>Ctrl+K</kbd> to open command palette
            </span>
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div className="pd-welcome__section pd-welcome__section--compact" variants={item}>
          <div className="pd-welcome__tip">
            <Zap size={14} />
            <span>{TIPS[activeTip]}</span>
            <button
              className="pd-welcome__tip-next"
              onClick={() => setActiveTip((prev) => (prev + 1) % TIPS.length)}
            >
              Next tip
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
