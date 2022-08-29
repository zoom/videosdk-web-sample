export function formatCountdown(coutdown: number) {
  if (coutdown >= 0) {
    const hours = Math.floor(coutdown / (60 * 60));
    const remainder = coutdown % (60 * 60);
    const minutes = Math.floor(remainder / 60);
    const seconds = remainder % 60;
    const cString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${cString}`;
    } else {
      return cString;
    }
  } else {
    return '';
  }
}
