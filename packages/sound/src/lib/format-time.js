export function formatTime(time) {
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60);
  return `${min}:${`00${sec}`.slice(-2)}.${time.toFixed(3).slice(-3)}`;
}
