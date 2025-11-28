import { useState, useEffect } from "react";
import { Snackbar, Alert, Button, Stack } from "@mui/material";
import { useRegisterSW } from "virtual:pwa-register/react";
import { usePwaInstallPrompt } from "./usePwaInstallPrompt";

export default function PWABadge() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const { canInstall, install } = usePwaInstallPrompt();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (offlineReady || needRefresh || canInstall) {
      setOpen(true);
    }
  }, [offlineReady, needRefresh, canInstall]);

  const handleClose = () => {
    setOpen(false);
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  let message = "";
  if (offlineReady) message = "Aplikacja gotowa do pracy offline";
  if (needRefresh) message = "Nowa wersja dostępna — odśwież, aby zaktualizować.";
  if (canInstall) message = "Zainstaluj aplikację PWA na swoim urządzeniu";

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      autoHideDuration={null}
    >
      <Alert
        severity="info"
        onClose={handleClose}
        variant="filled"
        sx={{
          width: "100%",
          bgcolor: "#333",       
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 2,         
          "& .MuiAlert-icon": {
            color: "#fff",       
          }
        }}
      >
        <Stack spacing={1}>
          <div>{message}</div>

          <Stack direction="row" spacing={1} justifyContent={"center"}>
            {needRefresh && (
              <Button
                variant="contained"
                size="small"
                sx={{
                  bgcolor: "#fff",
                  color: "#000",
                  "&:hover": { bgcolor: "#e0e0e0" },
                }}
                onClick={() => updateServiceWorker(true)}
              >
                Reload
              </Button>
            )}

            {canInstall && (
              <Button
                color="secondary"
                size="small"
                sx={{
                  bgcolor: "#fff",
                  color: "#000",
                  "&:hover": { bgcolor: "#e0e0e0" },
                }}
                onClick={install}
              >
                Zainstaluj
              </Button>
            )}
          </Stack>
        </Stack>

      </Alert>
    </Snackbar>
  );
}
