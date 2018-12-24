/**
 * Point represents a point on a 2D plane.
 *
 * Points can be represented with cartesian x,y coordinates, or polar angle, distance coordinates.
 */
class Point {

    constructor(x, y, angle = NaN, distance = NaN) {
        this.x = x;
        this.y = y;

        // Save optional angle and distance
        this.angle = angle;
        this.distance = distance;
    }

    toPolar() {

        // calculate polar coordinates if they weren't supplied to the constructor
        if ( isNaN(this.angle) || isNaN(this.distance) ) {
            this.distance = Math.sqrt(  Math.pow(this.x, 2) + Math.pow(this.y, 2) );
            this.angle = Math.atan2( this.y, this.x );
        }

        return {
            angle : this.angle,
            distance : this.distance
        };
    }

}


/**
 * Static function to determine distance between two points
 *
 * TODO check presence of cartesian coordinates?
 *
 * @param {Point} a
 * @param {Point} b
 */
Point.distance = function (a, b) {
    let x = (b.x - a.x);
    let y = (b.y - a.y);
    return Math.sqrt( (x*x) + (y*y) );
};

export default Point;