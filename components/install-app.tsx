"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

const DISPLAY_MODE_QUERY = "(display-mode: standalone)";

function isStandaloneDisplay() {
  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia(DISPLAY_MODE_QUERY).matches ||
    navigatorWithStandalone.standalone === true
  );
}

function isIOSDevice() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function subscribeToDisplayMode(onChange: () => void) {
  const media = window.matchMedia(DISPLAY_MODE_QUERY);

  media.addEventListener("change", onChange);
  window.addEventListener("appinstalled", onChange);

  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener("appinstalled", onChange);
  };
}

function getDisplayModeSnapshot() {
  return isStandaloneDisplay();
}

function getServerDisplayModeSnapshot() {
  return false;
}

function subscribeToNothing() {
  return () => {};
}

function getIOSSnapshot() {
  return isIOSDevice();
}

function getServerIOSSnapshot() {
  return false;
}

export function InstallApp() {
  const isStandalone = useSyncExternalStore(
    subscribeToDisplayMode,
    getDisplayModeSnapshot,
    getServerDisplayModeSnapshot,
  );
  const isIOS = useSyncExternalStore(
    subscribeToNothing,
    getIOSSnapshot,
    getServerIOSSnapshot,
  );
  const [installPrompt, setInstallPrompt] =
    useState<InstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    }

    function handleInstalled() {
      setJustInstalled(true);
      setInstallPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function install() {
    if (!installPrompt || isInstalling) return;

    setIsInstalling(true);

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setJustInstalled(true);
      }

      setInstallPrompt(null);
    } finally {
      setIsInstalling(false);
    }
  }

  if (isStandalone || justInstalled) {
    return (
      <div className="settings-actions">
        <div className="settings-status" role="status">
          <strong>Abide is installed on this device.</strong>
          <p>It is ready to open from your Home Screen or app list.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-actions">
      {isIOS ? (
        <div className="settings-status">
          <strong>Add Abide to your Home Screen</strong>
          <ol className="install-steps">
            <li>Open Abide in Safari.</li>
            <li>Tap the Share button.</li>
            <li>Choose “Add to Home Screen”.</li>
          </ol>
          <p>Reminders on iPhone and iPad need this step first.</p>
        </div>
      ) : installPrompt ? (
        <button
          className="button button-primary"
          type="button"
          disabled={isInstalling}
          onClick={install}
        >
          {isInstalling ? "Opening installer…" : "Install Abide"}
        </button>
      ) : (
        <div className="settings-status">
          <strong>Install from your browser</strong>
          <p>
            Open the browser menu and choose “Install app” or “Add to Home
            Screen”.
          </p>
        </div>
      )}
    </div>
  );
}
