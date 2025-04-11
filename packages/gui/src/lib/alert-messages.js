import { addAlertConfig, Text, Spinner } from '@blockcode/core';

// 添加消息模版
//

// 导入
addAlertConfig('importing', {
  icon: <Spinner level="success" />,
  message: (
    <Text
      id="gui.alert.importing"
      defaultMessage="Importing..."
    />
  ),
});

// 下载中
addAlertConfig('downloading', {
  icon: <Spinner level="success" />,
  message: (
    <Text
      id="gui.alert.downloading"
      defaultMessage="Downloading..."
    />
  ),
});

// 下载完成
addAlertConfig('downloadCompleted', {
  icon: null,
  message: (
    <Text
      id="gui.alert.downloadCompleted"
      defaultMessage="Download completed."
    />
  ),
});

// 连接失败
addAlertConfig('connectionError', {
  mode: 'warn',
  message: (
    <Text
      id="gui.alert.connectionError"
      defaultMessage="Connection error."
    />
  ),
});

// 连接取消
addAlertConfig('connectionCancel', {
  mode: 'warn',
  message: (
    <Text
      id="gui.alert.connectionCancel"
      defaultMessage="Connection cancel."
    />
  ),
});

// 编译
addAlertConfig('compiling', {
  icon: <Spinner level="success" />,
  message: (
    <Text
      id="gui.alert.compiling"
      defaultMessage="Compiling..."
    />
  ),
});

// 编译成功
addAlertConfig('compileCompleted', {
  icon: null,
  message: (
    <Text
      id="gui.alert.compileSuccess"
      defaultMessage="Compilation completed."
    />
  ),
});

// 编译失败
addAlertConfig('compileError', {
  mode: 'warn',
  message: (
    <Text
      id="gui.alert.compileError"
      defaultMessage="Compilation error."
    />
  ),
});
