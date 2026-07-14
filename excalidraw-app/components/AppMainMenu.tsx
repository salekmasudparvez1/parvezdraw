import { eyeIcon } from "@excalidraw/excalidraw/components/icons";
import { MainMenu } from "@excalidraw/excalidraw/index";
import React from "react";

import { isDevEnv } from "@excalidraw/common";

import type { Theme } from "@excalidraw/element/types";

import { LanguageList } from "../app-language/LanguageList";
import { AppSettings } from "../data/settings";

import { saveDebugState } from "./DebugCanvas";

const SettingsLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <span style={{ fontSize: "13px", fontWeight: 500 }}>{children}</span>
);

const AutoSaveIntervalItem: React.FC = () => {
  const [interval, setInterval_] = React.useState(
    () => AppSettings.getAutoSaveInterval(),
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setInterval_(value);
    AppSettings.setAutoSaveInterval(value);
  };

  return (
    <MainMenu.ItemCustom>
      <div
        style={{
          padding: "6px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <SettingsLabel>Auto-save</SettingsLabel>
        <select
          value={interval}
          onChange={handleChange}
          style={{
            padding: "4px 8px",
            fontSize: "12px",
            borderRadius: "6px",
            border: "1px solid var(--color-border-outline-variant)",
            background: "var(--island-bg-color)",
            color: "var(--color-on-surface)",
            cursor: "pointer",
          }}
        >
          <option value={0}>Manual</option>
          <option value={30}>30s</option>
          <option value={60}>1min</option>
          <option value={300}>5min</option>
        </select>
      </div>
    </MainMenu.ItemCustom>
  );
};

const PerformanceModeItem: React.FC = () => {
  const [enabled, setEnabled] = React.useState(
    () => AppSettings.isPerformanceMode(),
  );

  const handleToggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    AppSettings.setPerformanceMode(newValue);
  };

  return (
    <MainMenu.ItemCustom>
      <div
        style={{
          padding: "6px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          cursor: "pointer",
        }}
        onClick={handleToggle}
      >
        <SettingsLabel>Performance mode</SettingsLabel>
        <div
          style={{
            width: "36px",
            height: "20px",
            borderRadius: "10px",
            background: enabled ? "var(--color-primary)" : "var(--color-gray-30)",
            position: "relative",
            transition: "background 0.2s",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: "white",
              position: "absolute",
              top: "2px",
              left: enabled ? "18px" : "2px",
              transition: "left 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      </div>
    </MainMenu.ItemCustom>
  );
};

const HighDpiModeItem: React.FC = () => {
  const [enabled, setEnabled] = React.useState(
    () => AppSettings.isHighDpiMode(),
  );

  const handleToggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    AppSettings.setHighDpiMode(newValue);
  };

  return (
    <MainMenu.ItemCustom>
      <div
        style={{
          padding: "6px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          cursor: "pointer",
        }}
        onClick={handleToggle}
      >
        <SettingsLabel>High DPI</SettingsLabel>
        <div
          style={{
            width: "36px",
            height: "20px",
            borderRadius: "10px",
            background: enabled ? "var(--color-primary)" : "var(--color-gray-30)",
            position: "relative",
            transition: "background 0.2s",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: "white",
              position: "absolute",
              top: "2px",
              left: enabled ? "18px" : "2px",
              transition: "left 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      </div>
    </MainMenu.ItemCustom>
  );
};

export const AppMainMenu: React.FC<{
  onCollabDialogOpen?: () => any;
  isCollaborating?: boolean;
  isCollabEnabled?: boolean;
  theme: Theme | "system";
  refresh: () => void;
}> = React.memo((props) => {
  return (
    <MainMenu>
      <MainMenu.DefaultItems.LoadScene />
      <MainMenu.DefaultItems.SaveToActiveFile />
      <MainMenu.DefaultItems.Export />
      <MainMenu.DefaultItems.SaveAsImage />
      <MainMenu.DefaultItems.CommandPalette className="highlighted" />
      <MainMenu.DefaultItems.SearchMenu />
      <MainMenu.DefaultItems.Help />
      <MainMenu.DefaultItems.ClearCanvas />
      <MainMenu.Separator />
      {isDevEnv() && (
        <MainMenu.Item
          icon={eyeIcon}
          onSelect={() => {
            if (window.visualDebug) {
              delete window.visualDebug;
              saveDebugState({ enabled: false });
            } else {
              window.visualDebug = { data: [] };
              saveDebugState({ enabled: true });
            }
            props?.refresh();
          }}
        >
          Visual Debug
        </MainMenu.Item>
      )}
      <MainMenu.Separator />
      <MainMenu.DefaultItems.Preferences />
      <MainMenu.DefaultItems.ToggleTheme allowSystemTheme theme={props.theme} />
      <MainMenu.ItemCustom>
        <LanguageList style={{ width: "100%" }} />
      </MainMenu.ItemCustom>
      <MainMenu.DefaultItems.ChangeCanvasBackground />
      <MainMenu.Separator />
      <AutoSaveIntervalItem />
      <PerformanceModeItem />
      <HighDpiModeItem />
    </MainMenu>
  );
});
