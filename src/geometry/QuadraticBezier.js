import Point from "./Point.js";

const QUARTER_CIRC = -Math.PI / 2;

class QuadraticBezier {

  /**
   *
   * @param start {Point} Bezier curve start point
   * @param ctl {Point} Bezier curve control point
   * @param end {Point} Bezier curve end point
   */
  constructor(start, ctrl, end, lutResolution = 20) {
    this.start = start;
    this.ctrl = ctrl;
    this.end = end;

    this.lutResolution = lutResolution;
  }

  /**
   * Given a value t between 0 and 1, return a point on the curve that represents this point
   *
   * @param t
   * @returns {Point}
   */
  interpolatePoint(t) {
    const tInverse = 1 - t;
    const tSquare = t * t;

    let ptx = this.start.x * tInverse * tInverse;
    ptx += this.ctrl.x * tInverse * t * 2;
    ptx += this.end.x * tSquare;

    let pty = this.start.y * tInverse * tInverse;
    pty += this.ctrl.y * tInverse * t * 2;
    pty += this.end.y * tSquare

    return new Point(ptx, pty)
  }

  derive(t) {
    const tInverse = 1 - t;

    const dtx = (2 * tInverse * (this.ctrl.x - this.start.x)) + (2 * t * (this.end.x - this.ctrl.x));
    const dty = (2 * tInverse * (this.ctrl.y - this.start.y)) + (2 * t * (this.end.y - this.ctrl.y));

    return new Point(dtx, dty)
  }

  tangentVector(t) {
    const dt = this.derive(t);
    const d = Math.sqrt( (dt.x * dt.x) + (dt.y * dt.y));
    return new Point(dt.x / d, dt.y / d)
  }

  normalVector(t) {
    const vdt = this.tangentVector(t);

    const normalX = (vdt.x * Math.cos( QUARTER_CIRC )) - (vdt.y * Math.sin( QUARTER_CIRC ));
    const normalY = (vdt.x * Math.sin( QUARTER_CIRC )) - (vdt.y * Math.cos( QUARTER_CIRC ));

    return new Point(normalX, normalY)
  }

  /**
   * Generate an array of points along the bezier curve.
   *
   * This can be used to find the closest point on the curve of an arbitrary point
   *
   * @param resolution {number} how many points to interpolate
   * @returns {Array}
   */
  generateLut(resolution) {
    const lut = [];
    const inc = 1 / resolution;

    for (let t = 0; t <= 1; t += inc) {
      lut.push( this.interpolatePoint(t) )
    }

    return lut;
  }

  /**
   * Project a cartesian point onto the curve and return it's normalized value
   *
   * @param point {Point}
   * @param lutResolution {number}
   */
  projectPoint(point, lutResolution = this.lutResolution) {

    // TODO cache this
    const lut = this.generateLut( lutResolution )

    let lastDistance = Number.MAX_VALUE

    // TODO use array.reduce here?
    let i;
    for (i = 0; i < lut.length; i++) {
      const tp = lut[i];
      const distance = Point.distance( point, tp );
      if (distance < lastDistance) {
        lastDistance = distance
      } else {
        break;
      }
    }

    // approx position
    return i / lut.length
  }

}

export default QuadraticBezier;