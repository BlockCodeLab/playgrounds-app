import { Mime } from 'mime/lite';
import standardTypes from 'mime/types/standard.js';
import otherTypes from 'mime/types/other.js';

export const mime = new Mime(standardTypes, otherTypes);

mime.define({'text/x-python': ['py']});
