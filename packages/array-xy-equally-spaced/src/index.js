import sequentialFill from 'ml-array-sequential-fill';

import equallySpacedSmooth from './equallySpacedSmooth';
import equallySpacedSlot from './equallySpacedSlot';
import getZones from './getZones';

/**
 * Function that returns a Number array of equally spaced numberOfPoints
 * containing a representation of intensities of the spectra arguments x
 * and y.
 *
 * The options parameter contains an object in the following form:
 * from: starting point
 * to: last point
 * numberOfPoints: number of points between from and to
 * variant: "slot" or "smooth" - smooth is the default option
 *
 * The slot variant consist that each point in the new array is calculated
 * averaging the existing points between the slot that belongs to the current
 * value. The smooth variant is the same but takes the integral of the range
 * of the slot and divide by the step size between two points in the new array.
 *
 * @param {object} [arrayXY={}] - object containing 2 properties x and y (both an array)
 * @param {object} [options={}]
 * @param {number} [options.from=x[0]]
 * @param {number} [options.to=x[x.length-1]]
 * @param {string} [options.variant='smooth']
 * @param {number} [options.numberOfPoints=100]
 * @param {Array} [options.exclusions=[]] array of from / to that should be skipped for the generation of the points
 * @return {object<x: Array, y:Array>} new object with x / y array with the equally spaced data.
 */

export default function equallySpaced(arrayXY = {}, options = {}) {
  var { x, y } = arrayXY;
  var xLength = x.length;
  if (x.length > 1 && x[0] > x[1]) {
    x = x.slice().reverse();
    y = y.slice().reverse();
  }

  let {
    from = x[0],
    to = x[xLength - 1],
    variant = 'smooth',
    numberOfPoints = 100,
    exclusions = []
  } = options;

  if (xLength !== y.length) {
    throw new RangeError("the x and y vector doesn't have the same size.");
  }

  if (typeof from !== 'number' || isNaN(from)) {
    throw new RangeError("'from' option must be a number");
  }

  if (typeof to !== 'number' || isNaN(to)) {
    throw new RangeError("'to' option must be a number");
  }

  if (typeof numberOfPoints !== 'number' || isNaN(numberOfPoints)) {
    throw new RangeError("'numberOfPoints' option must be a number");
  }

  var reverse = from > to;
  if (reverse) {
    [from, to] = [to, from];
  }

  let zones = getZones(from, to, numberOfPoints, exclusions, reverse);
  if (reverse) {
    zones.sort((a, b) => b.from - a.from);
  }

  let xResult = [];
  let yResult = [];
  for (let zone of zones) {
    let zoneResult = processZone(
      x,
      y,
      zone.from,
      zone.to,
      zone.numberOfPoints,
      variant,
      reverse
    );
    xResult.push(...zoneResult.x);
    yResult.push(...zoneResult.y);
  }
  return { x: xResult, y: yResult };
}

function processZone(x, y, from, to, numberOfPoints, variant, reverse) {
  if (numberOfPoints < 1) {
    throw new RangeError('the number of points must be at least 1');
  }

  var output =
    variant === 'slot'
      ? equallySpacedSlot(x, y, from, to, numberOfPoints)
      : equallySpacedSmooth(x, y, from, to, numberOfPoints);

  return {
    x: sequentialFill({
      from: reverse ? to : from,
      to: reverse ? from : to,
      size: numberOfPoints
    }),
    y: reverse ? output.reverse() : output
  };
}
