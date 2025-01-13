const { Menu } = require('electron');

const isMac = process.platform === 'darwin';

let menu = null;

// macOS 下显示系统和编辑菜单
if (isMac) {
  menu = Menu.buildFromTemplate([{ role: 'appMenu' }, { role: 'editMenu' }]);
}

Menu.setApplicationMenu(menu);
