import { IconButton, Tooltip } from "@mui/material";
import { Wifi, WifiOff } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { t } = useTranslation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Tooltip title={isOnline ? t('header.online') : t('header.offline')}>
      <IconButton 
        color="inherit"
        sx={{
          width: '40px',
          height: '40px',
          padding: '8px'
        }}
      >
        {isOnline ? <Wifi /> : <WifiOff />}
      </IconButton>
    </Tooltip>
  );
};

export default ConnectionStatus;