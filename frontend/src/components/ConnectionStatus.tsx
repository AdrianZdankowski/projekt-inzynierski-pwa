import { useOnlineStatus } from "../hooks/useOnlineStatus";
import './ConnectionStatus.css';

const ConnectionStatus = () => {
  const isOnline = useOnlineStatus();

  return (
    <div className="connectionStatus">
      {isOnline ? (
        <p className="text-green">Jesteś połączony z internetem.</p>
      ) : (
        <p className="text-red">Brak połączenia z internetem.</p>
      )}
    </div>
  );
};

export default ConnectionStatus;