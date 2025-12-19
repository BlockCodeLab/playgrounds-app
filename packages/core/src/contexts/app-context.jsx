import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { batch, signal } from '@preact/signals';
import { isElectron, isMac, nanoid } from '@blockcode/utils';
import { clearHotkeys } from '../lib/io/hotkey';

// Splash 可见
//
const splashVisible = signal(false);

export function showSplash() {
  splashVisible.value = true;
}

export function hideSplash() {
  splashVisible.value = false;
}

// 通知消息
//
const alerts = signal([]);
const alertsConfigs = Object.create(null);

// 添加消息配置模版
export function addAlertConfig(name, alertConfig) {
  alertsConfigs[name] = alertConfig;
}

// 设置新消息
export function setAlert(...args) {
  let name, alert;
  let timeout = 0;
  for (const arg of args) {
    if (typeof arg === 'string') name = arg;
    if (typeof arg === 'object') alert = arg;
    if (typeof arg === 'number') timeout = arg;
  }

  // 从配置模版获取消息配置
  if (name && alertsConfigs[name]) {
    alert = Object.assign({}, alertsConfigs[name], alert ?? {});
  }
  if (!alert) return;

  if (!alert.id) {
    alert.id = nanoid();
  }

  // 更新相同 ID 的通知消息
  if (alerts.value.find((cfg) => alert.id === cfg.id)) {
    alerts.value = alerts.value.map((cfg) => {
      if (cfg.id === alert.id) {
        return Object.assign(cfg, alert);
      }
      return cfg;
    });
  }

  // 将新的通知消息添加到末尾
  else {
    alerts.value = alerts.value.concat(alert);
  }

  // 延时自动删除
  if (timeout > 0) {
    setTimeout(() => delAlert(alert.id), timeout);
  }
  return alert.id;
}

// 删除消息
export function delAlert(id) {
  alerts.value = alerts.value.filter((alert) => alert.id !== id);
}

// 弹出窗
//
const prompt = signal(null);

export function openPromptModal(cfg) {
  prompt.value = cfg;
}

export function closePromptModal() {
  prompt.value = null;
}

// 布局
//

// 菜单
const menuItems = signal(null);
// 标签页
const tabs = signal(null);
const tabIndex = signal(-1);
// 侧边栏
const docks = signal(null);
// 底边栏
const panes = signal(null);
// 教程库
const tutorials = signal(null);
// 应用状态，记录如模拟器运行、设备连接等
const appState = signal(null);
// 日志
const logs = signal(null);

// 初始化布局
export function openLayout(cfg) {
  batch(() => {
    menuItems.value = cfg.menuItems;
    tabs.value = cfg.tabs;
    tabIndex.value = cfg.tabIndex ?? 0;
    docks.value = cfg.docks;
    panes.value = cfg.panes;
    tutorials.value = cfg.tutorials;
  });
}

// 关闭布局
export function closeLayout() {
  clearHotkeys();
  batch(() => {
    splashVisible.value = false;
    alerts.value.length = 0;
    prompt.value = null;
    menuItems.value = null;
    tabs.value = null;
    tabIndex.value = -1;
    docks.value = null;
    panes.value = null;
    tutorials.value = null;
    appState.value = null;
    logs.value = null;
  });
}

// 选择标签页
export function openTab(index) {
  tabIndex.value = index;
}

// 添加标签页
export function addTabs(tabs) {
  tabs.value = state.tabs.value.concat(tabs);
}

// 添加教程
export function addLessons(lessons) {
  tutorials.value = Object.assign(tutorials.value, {
    lessons: Object.assign(lessons, tutorials.value.lessons),
  });
}

// 设置应用状态
export function setAppState(state, value) {
  if (typeof state === 'string') {
    state = { [state]: value };
  }
  appState.value = Object.assign({}, appState.value ?? {}, state);
}

// 记录
export const logger = {
  log(text) {
    const date = new Date();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    logs.value = this.logs.concat(`\x1b[38;5;252m[${hours}:${minutes}:${seconds}]\x1b[0m${text}`);
  },
  info(text) {
    this.log(`\x1b[36m${text}\x1b[0m`);
  },
  warn(text) {
    this.log(`⚠️ \x1b[33m${text}\x1b[0m`);
  },
  error(text) {
    this.log(`❌ \x1b[31m${text}\x1b[0m`);
  },
  success(text) {
    this.log(`✅ \x1b[32m${text}\x1b[0m`);
  },
  get logs() {
    return logs.value ?? [];
  },
};

// 用户项目库可见
//
const userStorageVisible = signal(false);

export function openUserStorage() {
  userStorageVisible.value = true;
}

export function closeUserStorage() {
  userStorageVisible.value = false;
}

// Electron MacOS 菜单栏缩进样式（避开交通灯）
//
const macosMenuBarStyled = signal(isMac && isElectron);

export function setMacosMenuBarStyled(val) {
  if (isMac && isElectron) {
    macosMenuBarStyled.value = val;
  }
}

// App 上下文组件
//
const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export function AppProvider({ children }) {
  return (
    <AppContext.Provider
      value={{
        splashVisible,
        alerts,
        prompt,
        menuItems,
        tabs,
        tabIndex,
        docks,
        panes,
        tutorials,
        appState,
        userStorageVisible,
        macosMenuBarStyled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
