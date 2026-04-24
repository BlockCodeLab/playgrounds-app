import { pinyin, addTraditionalDict } from 'pinyin-pro';
import TraditionalDict from '@pinyin-pro/data/traditional';

addTraditionalDict(TraditionalDict);

export { pinyin };
