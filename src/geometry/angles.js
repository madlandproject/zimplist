const DEG_COEF = 180 / Math.PI
const RAD_COEF = Math.PI / 180

export function angleToDegrees(angle) {
  return angle * DEG_COEF
}

export function angleToRadians(angle) {
  return angle * RAD_COEF
}
