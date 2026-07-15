/**
 * PDF Export for Parvez Draw
 * Uses browser's print functionality to export as PDF.
 */

import { exportToSvg } from "@prof/core";

import type {
  NonDeletedExcalidrawElement,
} from "@prof/element/types";
import type { AppState, BinaryFiles } from "@prof/core/types";

export const exportToPDF = async (
  elements: readonly NonDeletedExcalidrawElement[],
  appState: Partial<AppState>,
  files: BinaryFiles,
): Promise<void> => {
  try {
    // Generate SVG
    const svg = await exportToSvg({
      elements,
      appState: {
        ...appState,
        exportBackground: true,
        viewBackgroundColor:
          appState.viewBackgroundColor || "#ffffff",
      },
      files,
    });

    // Create a new window with the SVG for printing
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
