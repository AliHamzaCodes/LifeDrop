import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';

interface CountdownTimerProps {
  expirationDate: string | Date;
  className?: string;
  onExpire?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ expirationDate, className = '', onExpire }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const target = new Date(expirationDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        setIsExpired(true);
        setTimeLeft('Expired');
        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [expirationDate, onExpire]);

  if (isExpired) {
    return (
      <span className={`text-red-500 font-semibold ${className}`} style={{ color: '#ef4444', fontWeight: 'bold' }}>
        <FontAwesomeIcon icon={faClock} style={{ marginRight: '6px' }} />
        Expired
      </span>
    );
  }

  return (
    <span className={`countdown-timer ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#f59e0b' }}>
      <FontAwesomeIcon icon={faClock} />
      {timeLeft ? `Expires in ${timeLeft}` : 'Calculating...'}
    </span>
  );
};

export default CountdownTimer;
