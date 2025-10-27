// Utilitaires de formatage uniquement

export const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds.toFixed(2)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toFixed(2).padStart(5, '0')}`;
};

export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)}km`;
  }
  return `${meters}m`;
};

export const parseTime = (timeString: string): number => {
  if (timeString.includes(':')) {
    const [minutes, seconds] = timeString.split(':');
    return parseInt(minutes) * 60 + parseFloat(seconds);
  }
  return parseFloat(timeString);
};