// 过滤字符
export const escape = (name) => name.replaceAll(/[^a-z0-9]/gi, '_').replace(/^_/, '');
