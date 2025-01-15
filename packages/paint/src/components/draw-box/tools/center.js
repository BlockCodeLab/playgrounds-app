export default {
  setup(layer, options) {
    this.stage = layer.getStage();
    this.layer = layer;
    // 工具属性
    this.changeCenter = options.onCenterChange;
  },

  onBegin(e) {
    const pos = this.stage.getPointerPosition();
    this.changeCenter(pos);
  },
};
