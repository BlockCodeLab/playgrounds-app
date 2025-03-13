import { ClangGenerator } from './generator';

const proto = ClangGenerator.prototype;

const hexToRgb = (hex) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

proto['colour_picker'] = function (block) {
  const { r, g, b } = hexToRgb(block.getFieldValue('COLOUR'));
  const code = `{${r},${g},${b}}`;
  return [code, this.ORDER_ATOMIC];
};
