import { JavaScriptGenerator } from './generator';

const proto = JavaScriptGenerator.prototype;

proto['control_create_clone_of_menu'] = function (block) {
  let code = block.getFieldValue('CLONE_OPTION') || '_myself_';
  if (code !== '_myself_') {
    code = this.quote_(code);
  }
  return [code, this.ORDER_FUNCTION_CALL];
};
