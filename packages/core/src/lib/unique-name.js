// 使名称唯一
// 在名称末尾加当前同名（不含数字）最大的数字
export function uniqueName(name, id, items) {
  name = name.trim();
  if (items.find((item) => id !== item.id && item.name === name)) {
    const nameStr = name.replace(/\d+$/, '');
    const nameRe = new RegExp(`${nameStr}(\\d+)$`);
    let nameNum = 0;
    for (const item of items) {
      if (id === item.id) continue;
      const result = nameRe.exec(item.name);
      if (result) {
        const num = parseInt(result[1]);
        if (num > nameNum) {
          nameNum = num;
        }
      }
    }
    name = `${nameStr}${nameNum + 1}`;
  }
  return name;
}
