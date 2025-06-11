import { useEffect, useState } from 'react';

export function useStandaloneMode() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const standalone =
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(standalone);
    };

    checkStandalone();

    window.matchMedia('(display-mode: minimal-ui)').addEventListener('change', checkStandalone);

    return () => {
      window.matchMedia('(display-mode: minimal-ui)').removeEventListener('change', checkStandalone);
    };
  }, []);

  return isStandalone;
}
