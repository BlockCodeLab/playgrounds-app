export class MathUtils {
  static random(num1 = 1, num2 = 10) {
    const min = Math.ceil(Math.min(num1, num2));
    const max = Math.floor(Math.max(num1, num2));
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static clamp(value, min = 0, max = Infinity) {
    return Math.min(Math.max(min, value), max);
  }

  static wrapClamp(n, min, max) {
    const range = max - min + 1;
    return n - Math.floor((n - min) / range) * range;
  }

  static degToRad(deg) {
    return (deg * Math.PI) / 180;
  }

  static radToDeg(rad) {
    return (rad * 180) / Math.PI;
  }

  static toNumber(num) {
    return isNaN(num) ? 0 : +num;
  }

  static serialToIndex(serial, size) {
    return MathUtils.wrapClamp(--serial, 0, size - 1);
  }

  static indexToSerial(index, size) {
    return MathUtils.wrapClamp(++index, 1, size);
  }

  static distanceTo(pos1, pos2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx ** 2 + dy ** 2);
  }

  static directionTo(pos1, pos2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return MathUtils.radToDeg(Math.atan2(dy, dx));
  }

  static round(num, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round((num + Number.EPSILON) * factor) / factor;
  }
}
