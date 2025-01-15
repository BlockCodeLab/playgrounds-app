import { customAlphabet } from 'nanoid';

const numbers = '0123456789';
const lowercase = 'abcdefghijklmnopqrstuvwxyz';
const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nolookalikes = '346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz';

export const nanoid = customAlphabet(numbers + lowercase + uppercase);

export const nanoidLooks = customAlphabet(nolookalikes);
