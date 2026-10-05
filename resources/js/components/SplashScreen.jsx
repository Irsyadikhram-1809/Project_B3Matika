import { useEffect, useState } from 'react';
import './SplashScreen.css';
import AnimatedLogo from './AnimatedLogo';

export default function SplashScreen({ onComplete }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Start fading out after 3.5 seconds
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 3500);

    // Unmount completely after 4 seconds
    const unmountTimer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, [onComplete]);

  return (
    <div className={`splash-screen ${fading ? 'fade-out' : ''}`}>
      <div className="stage">
        <AnimatedLogo size={320} />
      </div>
    </div>
  );
}
