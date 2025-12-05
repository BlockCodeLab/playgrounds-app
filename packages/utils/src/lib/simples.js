export const isMac = /Mac/i.test(navigator.platform || navigator.userAgent);

export const isWin32 = /Win/i.test(navigator.platform || navigator.userAgent);

export const isLinux = /Linux/i.test(navigator.platform || navigator.userAgent);

export const isDesktop = /Win|Mac|Linux/i.test(navigator.platform || navigator.userAgent);

export const sleep = (s) => new Promise((resolve) => setTimeout(resolve, s * 1000));

export const sleepMs = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function xmlEscape(unsafe) {
  if (typeof unsafe !== 'string') {
    if (Array.isArray(unsafe)) {
      unsafe = String(unsafe);
    } else {
      return unsafe;
    }
  }
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
    }
  });
}
