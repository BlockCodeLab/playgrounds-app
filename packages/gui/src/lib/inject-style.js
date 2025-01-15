const globalCssObject = {};

const styleElement = document.createElement('div');
const globalStyleSheet = document.createElement('style');
document.body.insertBefore(globalStyleSheet, document.body.firstChild);

const stringify = (cssObject) => {
  styleElement.style = '';
  Object.entries(cssObject).forEach(([key, value]) => (styleElement.style[key] = value));
  return styleElement.style.cssText;
};

const injectGlobalStyle = () => {
  globalStyleSheet.textContent = Object.entries(globalCssObject)
    .map(([key, value]) => `${key}{${stringify(value)}}`)
    .join('\n');
};

export function injectStyle(cssObject) {
  Object.assign(globalCssObject, cssObject);
  injectGlobalStyle();
}
