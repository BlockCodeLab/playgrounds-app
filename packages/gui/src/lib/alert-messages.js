import { addAlertConfig, Text, Spinner } from '@blockcode/core';

// 添加消息模版
//

// 导入
addAlertConfig('importing', {
  icon: <Spinner level="success" />,
  message: (
    <Text
      id="gui.alert.importing"
      defaultMessage="importing..."
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
  message: (
    <Text
      id="gui.alert.connectionError"
      defaultMessage="Connection error."
    />
  ),
});

// 连接取消
addAlertConfig('connectionCancel', {
  message: (
    <Text
      id="gui.alert.connectionCancel"
      defaultMessage="Connection cancel."
    />
  ),
});
