export class Point {
  static from(index, size) {
    const i = index >> 2;
    const y = Math.floor(i / size.width);
    const x = i - y * size.width;
    return new Point(x, y, size);
  }

  constructor(x, y, size) {
    this._size = size;
    this.setXY(x, y);
  }

  get x() {
    return this._x;
  }

  set x(x) {
    this._x = x;
    this._index = (this.x + this.y * this._size.width) << 2;
  }

  get y() {
    return this._y;
  }

  set y(y) {
    this._y = y;
    this._index = (this.x + this.y * this._size.width) << 2;
  }

  get index() {
    return this._index;
  }

  get valid() {
    return this.x >= 0 && this.x < this._size.width && this.y >= 0 && this.y < this._size.height;
  }

  get invalid() {
    return !this.valid;
  }

  get topPoint() {
    return new Point(this.x, this.y - 1);
  }

  get leftPoint() {
    return new Point(this.x - 1, this.y);
  }

  get rightPoint() {
    return new Point(this.x + 1, this.y);
  }

  get bottomPoint() {
    return new Point(this.x, this.y + 1);
  }

  get topLeftPoint() {
    return new Point(this.x - 1, this.y - 1);
  }

  get topRightPoint() {
    return new Point(this.x + 1, this.y - 1);
  }

  get bottomLeftPoint() {
    return new Point(this.x - 1, this.y + 1);
  }

  get bottomRightPoint() {
    return new Point(this.x + 1, this.y + 1);
  }

  setXY(x, y) {
    this._x = x;
    this._y = y;
    this._index = (this.x + this.y * this._size.width) << 2;
    return this;
  }

  equals(point) {
    return this.x == point.x && this.y == point.y;
  }
}
