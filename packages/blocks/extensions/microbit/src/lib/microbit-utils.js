export class MicrobitUtils {
  constructor(microbit) {
    this._microbit = microbit;
  }

  get key() {
    return 'microbit';
  }

  get microbit() {
    return this._microbit;
  }

  displayText(text, delay) {
    return this.microbit.displayText(`${text}`, delay);
  }
}
