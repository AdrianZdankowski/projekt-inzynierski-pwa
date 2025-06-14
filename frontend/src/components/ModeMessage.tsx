import { useStandaloneMode } from '../hooks/useStandaloneMode';
import './ModeMessage.css';

const ModeMessage = () => {
  const isStandalone = useStandaloneMode();

  return (
    <div className='modeMessage'>
      {isStandalone ? (
        <p className="text-red">Aplikacja działa jako zainstalowana PWA.</p>
      ) : (
        <p className="text-green">Aplikacja działa w przeglądarce.</p>
      )}
    </div>
  );
};

export default ModeMessage;
