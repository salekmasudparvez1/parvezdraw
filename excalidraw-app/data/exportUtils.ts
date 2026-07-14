/**
 * Parvez Draw — Export Utilities
 * Handles exporting to PNG, SVG, PDF, and JSON formats
 */

import { exportToSvg } from "@excalidraw/excalidraw";

import type {
  NonDeletedExcalidrawElement,
} from "@excalidraw/element/types";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";

type ExportOptions = {
  elements: readonly NonDeletedExcalidrawElement[];
  appState: Partial<AppState>;
  files: BinaryFiles;
  name?: string;
};

/**
 * Export as PNG image
 */
export const exportToPNG = async ({
  elements,
  appState,
  files,
  name = "parvez-draw",
}: ExportOptions): Promise<void> => {
  try {
    const svg = await exportToSvg({
      elements,
      appState: {
        ...appState,
        exportBackground: true,
        viewBackgroundColor: appState.viewBackgroundColor || "#ffffff",
      },
      files,
    });

    // Convert SVG to canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    const svgString = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width * 2; // 2x for retina
      canvas.height = img.height * 2;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      // Download
      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${name}.png`;
          link.click();
          URL.revokeObjectURL(link.href);
        }
      }, "image/png");
    };
    img.src = url;
  } catch (error) {
    console.error("PNG export failed:", error);
    throw error;
  }
};

/**
 * Export as SVG
 */
export const exportToSVG = async ({
  elements,
  appState,
  files,
  name = "parvez-draw",
}: ExportOptions): Promise<void> => {
  try {
    const svg = await exportToSvg({
      elements,
      appState: {
        ...appState,
        exportBackground: true,
        viewBackgroundColor: appState.viewBackgroundColor || "#ffffff",
      },
      files,
    });

    const svgString = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${name}.svg`;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("SVG export failed:", error);
    throw error;
  }
};

/**
 * Export as PDF
 */
export const exportToPDF = async ({
  elements,
  appState,
  files,
}: ExportOptions): Promise<void> => {
  try {
    const svg = await exportToSvg({
      elements,
      appState: {
        ...appState,
        exportBackground: true,
        viewBackgroundColor: appState.viewBackgroundColor || "#ffffff",
      },
      files,
    });

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      throw new Error("Failed to open print window");
    }

    const svgString = new XMLSerializer().serializeToString(svg);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Parvez Draw Export</title>
          <style>
            @page { size: A4 landscape; margin: 0; }
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            svg { max-width: 100%; max-height: 100vh; }
          </style>
        </head>
        <body>
          ${svgString}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  } catch (error) {
    console.error("PDF export failed:", error);
    throw error;
  }
};

/**
 * Export as JSON (Excalidraw format)
 */
export const exportToJSON = ({
  elements,
  appState,
  files,
  name = "parvez-draw",
}: ExportOptions): void => {
  try {
    const data = {
      type: "excalidraw",
      version: 2,
      source: "https://parvezdraw.app",
      elements,
      appState: {
        viewBackgroundColor: appState.viewBackgroundColor || "#ffffff",
        gridSize: appState.gridSize || null,
      },
      files,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${name}.excalidraw`;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("JSON export failed:", error);
    throw error;
  }
};
