import { useEffect, useState } from "react";

export function usePwaInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setPromptEvent(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!promptEvent) return;
    promptEvent.prompt();
    const res = await promptEvent.userChoice;
    return res.outcome === "accepted";
  };

  return {
    canInstall: !!promptEvent,
    install,
  };
}
