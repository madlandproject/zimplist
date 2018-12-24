import {angleToDegrees, angleToRadians} from "./angles";
import Point from "./Point";


class RegularPolygon {

  constructor(points, radius) {
    this.points = points;
    this.radius = radius;
  }

  get apothem() {
    return  this.radius * Math.cos( Math.PI / this.points.length)
  }

}

/**
 * Create a regular polygon by specificying the number of points it should have and it's radius
 *
 * Optionally start the points with an bias
 *
 * @param numPoints {number} number of points in the polygon
 * @param radius {number} the distance from the center point each point should be
 * @param bias {number} the offset angle the first point should start at
 * @returns {RegularPolygon}
 */
RegularPolygon.createByRadius = function (numPoints, radius, bias) {
  const pointAngle = 360 / numPoints;
  const angles = []

  // Create array of angles to use to draw points
  for (let angle = 0; angle <= 360; angle += pointAngle ) {
    angles.push( angle )
  }

  const points = angles.map(
    (angle) => new Point(
      radius * Math.cos(angleToRadians(angle + bias)),
      radius * Math.sin(angleToRadians(angle + bias))
    )
  )
  const polygon = new RegularPolygon(points, radius)

  return polygon
};

/**
 * Create a regular polygon give a number of points and side length
 *
 * @param numSides
 * @param sideLength
 * @param bias
 * @returns {RegularPolygon}
 */
RegularPolygon.createBySideLength = function(numSides, sideLength, bias = 0) {
  const radius = (0.5 * sideLength) * ( 1 / Math.sin( Math.PI / numSides))
  const polygon = RegularPolygon.createByRadius(radius, bias)
  return polygon
}


export default RegularPolygon;