import { ClangGenerator } from './generator';

const proto = ClangGenerator.prototype;

proto['unsupported_hat'] = () => '';
proto['unsupported_statement'] = () => '';
proto['unsupported_boolean'] = () => [''];
proto['unsupported_string'] = () => [''];
proto['unsupported_number'] = () => [''];
