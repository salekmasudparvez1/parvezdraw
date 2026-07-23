import { useI18n } from "@prof/core/i18n";
import { WelcomeScreen } from "@prof/core/index";
import React from "react";

const VisionSuiteLogo = () => (
  <div style={{ marginBottom: "1rem" }}>
    <img
      src="/logo.svg"
      alt="Vision Suite"
      style={{
        width: "80px",
        height: "80px",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,120,212,0.25)",
      }}
    />
  </div>
);

export const AppWelcomeScreen: React.FC<{
  onCollabDialogOpen?: () => any;
  isCollabEnabled?: boolean;
}> = React.memo((props) => {
  const { t } = useI18n();

  return (
    <WelcomeScreen>
      <WelcomeScreen.Hints.MenuHint>
        {t("welcomeScreen.app.menuHint")}
      </WelcomeScreen.Hints.MenuHint>
      <WelcomeScreen.Hints.ToolbarHint />
      <WelcomeScreen.Hints.HelpHint />
      <WelcomeScreen.Center>
        <VisionSuiteLogo />
        <WelcomeScreen.Center.Heading>
          <span style={{ fontSize: "2.25rem", fontWeight: 600, color: "#0078D4" }}>
            Vision Suite
          </span>
          <br />
          <span style={{ fontSize: "1.1rem", fontWeight: 400, opacity: 0.8 }}>
            {t("welcomeScreen.app.center_heading_line2")}
          </span>
          <br />
          <span style={{ fontSize: "1.1rem", fontWeight: 400, opacity: 0.8 }}>
            {t("welcomeScreen.app.center_heading_line3")}
          </span>
        </WelcomeScreen.Center.Heading>
        <WelcomeScreen.Center.Menu>
          <WelcomeScreen.Center.MenuItemLoadScene />
          <WelcomeScreen.Center.MenuItemHelp />
        </WelcomeScreen.Center.Menu>
      </WelcomeScreen.Center>
    </WelcomeScreen>
  );
});
