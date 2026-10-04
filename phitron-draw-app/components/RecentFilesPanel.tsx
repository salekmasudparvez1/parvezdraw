




import React, { useState, useEffect } from "react";

import { RecentFiles } from "../data/RecentFiles";

import type { RecentFile } from "../data/RecentFiles";

interface RecentFilesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFile: (file: RecentFile) => void;
}

export const RecentFilesPanel: React.FC<RecentFilesPanelProps> = ({
  isOpen,
  onClose,
  onOpenFile,
}) => {
  const [files, setFiles] = useState<RecentFile[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFiles(RecentFiles.getRecentFiles());
    }
  }, [isOpen]);

  const handleDelete = (id: string) => {
    RecentFiles.removeRecentFile(id);
    setFiles(RecentFiles.getRecentFiles());
  };

  const handleClearAll = () => {
    if (confirm("Clear all recent files?")) {
      RecentFiles.clearRecentFiles();
      setFiles([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--island-bg-color)",
          borderRadius: "12px",
          padding: "24px",
          width: "400px",
          maxHeight: "500px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          border: "1px solid var(--color-border-outline-variant)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--color-on-surface)",
            }}
          >
            Recent Files
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "var(--color-on-surface)",
              padding: "4px 8px",
            }}
          >
            ×
          </button>
        </div>

        {files.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "var(--color-gray-50)",
            }}
          >
            No recent files
          </div>
        ) : (
          <>
            <div
              style={{
                maxHeight: "350px",
                overflowY: "auto",
              }}
            >
              {files.map((file) => (
                <div
                  key={file.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    borderBottom: "1px solid var(--color-border-outline-variant)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "var(--color-surface-primary-container)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                  onClick={() => onOpenFile(file)}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 500,
                        color: "var(--color-on-surface)",
                        marginBottom: "4px",
                      }}
                    >
                      {file.name || "Untitled"}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--color-gray-50)",
                      }}
                    >
                      {RecentFiles.formatLastModified(file.lastModified)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file.id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--color-danger)",
                      cursor: "pointer",
                      padding: "4px 8px",
                      fontSize: "14px",
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "16px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={handleClearAll}
                style={{
                  background: "var(--color-danger)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                Clear All
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
