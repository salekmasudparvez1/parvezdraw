import { useI18n } from "@excalidraw/excalidraw/i18n";
import { WelcomeScreen } from "@excalidraw/excalidraw/index";
import React from "react";

const ParvezLogo = () => (
  <div style={{ marginBottom: "1rem" }}>
    <img
      src="/parvez.png"
      alt="Parvez Draw"
      style={{
        width: "80px",
        height: "80px",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
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
        <ParvezLogo />
        <WelcomeScreen.Center.Heading>
          <span style={{ fontSize: "2.25rem", fontWeight: 600 }}>
            Parvez Draw
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
