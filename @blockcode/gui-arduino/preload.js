// window.electron.service.
export default (ipcRenderer) => ({
  get arduinoCompile() {
    return (
      ipcRenderer.sendSync('check:arduino:compile') &&
      ((body) =>
        new Promise((resolve) => {
          ipcRenderer.on('arduino:compile:reply', (event, data) => resolve(data));
          ipcRenderer.send('arduino:compile', body);
        }))
    );
  },
});
