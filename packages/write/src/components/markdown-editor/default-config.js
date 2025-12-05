export default {
  cdn: '/vditor',
  lang: 'en_US',
  mode: 'wysiwyg',
  icon: 'material',
  tab: '  ',
  width: '100%',
  height: '100%',
  toolbar: ['undo', 'redo', 'bold', 'italic', 'strike', 'edit-mode'],
  toolbarConfig: {
    hide: true,
  },
  preview: {
    hljs: {
      lineNumber: true,
    },
    theme: {
      current: 'light',
    },
    mode: 'editor',
  },
  // 自定义wysiwyg模式下的工具栏
  customWysiwygToolbar(/* type, element */) {},
};
