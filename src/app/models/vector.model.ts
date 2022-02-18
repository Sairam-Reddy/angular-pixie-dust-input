export const PI_2 = Math.PI / 2;
export const PI_180 = Math.PI / 180;

/**
 * 2D Vector Class
 */

export class Vector {
  private _x;
  private _y;

  public constructor(x: number = 0, y: number = 0) {
    this._x = x;
    this._y = y;
  }

  public static create(x, y) {
    return new Vector(x, y);
  }

  public static add(a, b) {
    return new Vector(a.x + b.x, a.y + b.y);
  }

  public static subtract(a, b) {
    return new Vector(a.x - b.x, a.y - b.y);
  }

  public static random(range) {
    var v = new Vector();
    v.randomize(range);
    return v;
  }

  public static distanceSquared(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  public static distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public get x() {
    return this._x;
  }

  public get y() {
    return this._y;
  }

  public set x(value) {
    this._x = value;
  }

  public set y(value) {
    this._y = value;
  }

  public get magnitudeSquared() {
    return this._x * this._x + this._y * this._y;
  }

  public get magnitude() {
    return Math.sqrt(this.magnitudeSquared);
  }

  public get angle() {
    return (Math.atan2(this._y, this._x) * 180) / Math.PI;
  }

  public clone() {
    return new Vector(this._x, this._y);
  }

  public add(v) {
    this._x += v.x;
    this._y += v.y;
  }

  public subtract(v) {
    this._x -= v.x;
    this._y -= v.y;
  }

  public multiply(value) {
    this._x *= value;
    this._y *= value;
  }

  public divide(value) {
    this._x /= value;
    this._y /= value;
  }

  public normalize() {
    var magnitude = this.magnitude;
    if (magnitude > 0) {
      this.divide(magnitude);
    }
  }

  public limit(treshold) {
    if (this.magnitude > treshold) {
      this.normalize();
      this.multiply(treshold);
    }
  }

  public randomize(amount) {
    amount = amount || 1;
    this._x = amount * 2 * (-0.5 + Math.random());
    this._y = amount * 2 * (-0.5 + Math.random());
  }

  public rotate(degrees) {
    var magnitude = this.magnitude;
    var angle = (Math.atan2(this._x, this._y) * PI_2 + degrees) * PI_180;
    this._x = magnitude * Math.cos(angle);
    this._y = magnitude * Math.sin(angle);
  }

  public flip() {
    var temp = this._y;
    this._y = this._x;
    this._x = temp;
  }

  public invert() {
    this._x = -this._x;
    this._y = -this._y;
  }

  public toString() {
    return this._x + ', ' + this._y;
  }
}
