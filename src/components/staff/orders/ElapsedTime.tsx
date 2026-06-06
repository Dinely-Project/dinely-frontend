import React, { useEffect, useState } from 'react';

interface ElapsedTimeProps {
  createdAt: string;
}

const getElapsed = (createdAt: string): string => {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const totalSeconds = Math.floor(diffMs / 1000);

  if (totalSeconds < 60) {
    return 'just now';
  }

  const minutes = Math.floor(totalSeconds / 60);
  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMin = minutes % 60;
  if (remainingMin === 0) {
    return `${hours}h ago`;
  }
  return `${hours}h ${remainingMin}m ago`;
};

/**
 * Displays how long ago an order was placed and re-renders every 30 seconds.
 * Orders over 30 minutes old are highlighted in amber as a visual cue.
 */
const ElapsedTime: React.FC<ElapsedTimeProps> = ({ createdAt }) => {
  const [label, setLabel] = useState(() => getElapsed(createdAt));

  useEffect(() => {
    const tick = () => setLabel(getElapsed(createdAt));
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [createdAt]);

  const diffMin = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000);
  const isLate = diffMin >= 30;

  return (
    <span
      style={{
        fontSize: '12px',
        fontWeight: 500,
        color: isLate ? '#d29922' : '#6e7681',
      }}
      title={new Date(createdAt).toLocaleString()}
    >
      🕐 {label}
    </span>
  );
};

export default ElapsedTime;
