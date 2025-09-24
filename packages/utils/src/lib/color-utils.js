export class ColorUtils {
  static rgbToRgb565(rgb) {
    const r5 = rgb.r >> 3;
    const g6 = rgb.g >> 2;
    const b5 = rgb.b >> 3;
    return (r5 << 11) | (g6 << 5) | b5;
  }

  static rgb565ToRgb(rgb565) {
    const r = (rgb565 >> 11) & 0x1f; // Extract 5 bits for red
    const g = (rgb565 >> 5) & 0x3f; // Extract 6 bits for green
    const b = rgb565 & 0x1f; // Extract 5 bits for blue
    const r8 = (r << 3) | (r >> 2);
    const g8 = (g << 2) | (g >> 4);
    const b8 = (b << 3) | (b >> 2);
    return { r: r8, g: g8, b: b8 };
  }

  static decimalToHex(decimal) {
    if (decimal < 0) {
      decimal += 0xffffff + 1;
    }
    let hex = Number(decimal).toString(16);
    hex = `#${'000000'.substr(0, 6 - hex.length)}${hex}`;
    return hex;
  }

  static decimalToRgb(decimal) {
    const a = (decimal >> 24) & 0xff;
    const r = (decimal >> 16) & 0xff;
    const g = (decimal >> 8) & 0xff;
    const b = decimal & 0xff;
    return { r: r, g: g, b: b, a: a > 0 ? a : 255 };
  }

  static hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  static rgbToHex(rgb) {
    return ColorUtils.decimalToHex(ColorUtils.rgbToDecimal(rgb));
  }

  static rgbToDecimal(rgb) {
    return (rgb.r << 16) + (rgb.g << 8) + rgb.b;
  }

  static hexToDecimal(hex) {
    return ColorUtils.rgbToDecimal(ColorUtils.hexToRgb(hex));
  }

  static hsvToRgb(hsv) {
    let h = hsv.h % 360;
    if (h < 0) h += 360;
    const s = Math.max(0, Math.min(hsv.s, 1));
    const v = Math.max(0, Math.min(hsv.v, 1));

    const i = Math.floor(h / 60);
    const f = h / 60 - i;
    const p = v * (1 - s);
    const q = v * (1 - s * f);
    const t = v * (1 - s * (1 - f));

    let r;
    let g;
    let b;

    switch (i) {
      default:
      case 0:
        r = v;
        g = t;
        b = p;
        break;
      case 1:
        r = q;
        g = v;
        b = p;
        break;
      case 2:
        r = p;
        g = v;
        b = t;
        break;
      case 3:
        r = p;
        g = q;
        b = v;
        break;
      case 4:
        r = t;
        g = p;
        b = v;
        break;
      case 5:
        r = v;
        g = p;
        b = q;
        break;
    }

    return {
      r: Math.floor(r * 255),
      g: Math.floor(g * 255),
      b: Math.floor(b * 255),
    };
  }

  static rgbToHsv(rgb) {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    const x = Math.min(Math.min(r, g), b);
    const v = Math.max(Math.max(r, g), b);

    // For grays, hue will be arbitrarily reported as zero. Otherwise, calculate
    let h = 0;
    let s = 0;
    if (x !== v) {
      const f = r === x ? g - b : g === x ? b - r : r - g;
      const i = r === x ? 3 : g === x ? 5 : 1;
      h = ((i - f / (v - x)) * 60) % 360;
      s = (v - x) / v;
    }

    return { h: h, s: s, v: v };
  }

  static mixRgb(rgb0, rgb1, fraction1) {
    if (fraction1 <= 0) return rgb0;
    if (fraction1 >= 1) return rgb1;
    const fraction0 = 1 - fraction1;
    return {
      r: fraction0 * rgb0.r + fraction1 * rgb1.r,
      g: fraction0 * rgb0.g + fraction1 * rgb1.g,
      b: fraction0 * rgb0.b + fraction1 * rgb1.b,
    };
  }
}

export class Color {
  constructor(color, clear = false) {
    this._clear = clear;
    this._color = color;
    if (typeof color === 'number') {
      this._type = 'decimal';
    } else if (typeof color === 'string' && color[0] === '#') {
      this._type = 'hex';
    } else if (Array.isArray(color)) {
      const [a, b, c] = color;
      if (b <= 1 && c <= 1) {
        this._type = 'hsv';
        this._color = { h: a, s: b, v: c };
      } else {
        this._type = 'rgb';
        this._color = { r: a, g: b, b: c };
      }
      this._clear = clear || color[3] === 0;
    } else if (typeof color.r === 'number') {
      this._type = 'rgb';
    } else if (typeof color.h === 'number') {
      this._type = 'hsv';
    }
  }

  get clear() {
    return this._clear;
  }

  get rgb() {
    if (this._type === 'rgb') return this._color;
    if (this._type === 'decimal') return ColorUtils.decimalToRgb(this._color);
    if (this._type === 'hsv') return ColorUtils.hsvToRgb(this._color);
    if (this._type === 'hex') return ColorUtils.hexToRgb(this._color);
  }

  get hsv() {
    if (this._type === 'hsv') return this._color;
    if (this._type === 'decimal') return ColorUtils.rgbToHsv(ColorUtils.decimalToRgb(this._color));
    if (this._type === 'rgb') return ColorUtils.rgbToHsv(this._color);
    if (this._type === 'hex') return ColorUtils.rgbToHsv(ColorUtils.hexToRgb(this._color));
  }

  get hex() {
    if (this._type === 'hex') return this._color;
    if (this._type === 'decimal') return ColorUtils.decimalToHex(this._color);
    if (this._type === 'rgb') return ColorUtils.rgbToHex(this._color);
    if (this._type === 'hsv') return ColorUtils.rgbToHex(ColorUtils.hsvToRgb(this._color));
  }

  get decimal() {
    if (this._type === 'decimal') this._color;
    if (this._type === 'rgb') return ColorUtils.rgbToDecimal(this._color);
    if (this._type === 'hsv') return ColorUtils.rgbToDecimal(ColorUtils.hsvToRgb(this._color));
    if (this._type === 'hex') return ColorUtils.hexToDecimal(this._color);
  }

  toRGBColor() {
    if (this._type === 'rgb') return this;
    return new Color(this.rgb, this.clear);
  }

  toHSVColor() {
    if (this._type === 'hsv') return this;
    return new Color(this.hsv, this.clear);
  }

  toHEXColor() {
    if (this._type === 'hex') return this;
    return new Color(this.hex, this.clear);
  }

  toDecimalColor() {
    if (this._type === 'decimal') return this;
    return new Color(this.decimal, this.clear);
  }

  equals(color) {
    return (
      this.rgb.r === color.rgb.r &&
      this.rgb.g === color.rgb.g &&
      this.rgb.b === color.rgb.b &&
      this.clear === color.clear
    );
  }

  notEquals(color) {
    return !this.equals(color);
  }
}
