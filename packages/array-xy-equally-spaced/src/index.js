/**
 *
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
 * @return {Array} new array with the equally spaced data.
 *
 */
export default function equallySpaced(arrayXY = {}, options = {}) {
  var { x, y } = arrayXY;
  var xLength = x.length;
  if (x.length > 1 && x[0] > x[1]) {
    x = x.slice().reverse();
    y = y.slice().reverse();
  }

  var {
    from = x[0],
    to = x[xLength - 1],
    variant = 'smooth',
    numberOfPoints = 100
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

  var reverse = from > to;
  if (reverse) {
    [from, to] = [to, from];
  }

  if (typeof numberOfPoints !== 'number' || isNaN(numberOfPoints)) {
    throw new RangeError("'numberOfPoints' option must be a number");
  }
  if (numberOfPoints < 1) {
    throw new RangeError('the number of points must be at least 1');
  }

  var output = variant === 'slot' ? getEquallySpacedSlot(x, y, from, to, numberOfPoints) : getEquallySpacedSmooth(x, y, from, to, numberOfPoints);

  return reverse ? output.reverse() : output;
}

/**
 * function that retrieves the getEquallySpacedData with the variant "smooth"
 *
 * @param x
 * @param y
 * @param from - Initial point
 * @param to - Final point
 * @param numberOfPoints
 * @return {Array} - Array of y's equally spaced with the variant "smooth"
 */
function getEquallySpacedSmooth(x, y, from, to, numberOfPoints) {
  var xLength = x.length;

  var step = (to - from) / (numberOfPoints - 1);
  var halfStep = step / 2;

  var output = new Array(numberOfPoints);

  var initialOriginalStep = x[1] - x[0];
  var lastOriginalStep = x[xLength - 1] - x[xLength - 2];

  // Init main variables
  var min = from - halfStep;
  var max = from + halfStep;

  var previousX = Number.MIN_VALUE;
  var previousY = 0;
  var nextX = x[0] - initialOriginalStep;
  var nextY = 0;

  var currentValue = 0;
  var slope = 0;
  var intercept = 0;
  var sumAtMin = 0;
  var sumAtMax = 0;

  var i = 0; // index of input
  var j = 0; // index of output

  function getSlope(x0, y0, x1, y1) {
    return (y1 - y0) / (x1 - x0);
  }

  main: while (true) {
    if (previousX <= min && min <= nextX) {
      add = integral(0, min - previousX, slope, previousY);
      sumAtMin = currentValue + add;
    }

    while (nextX - max >= 0) {
      // no overlap with original point, just consume current value
      var add = integral(0, max - previousX, slope, previousY);
      sumAtMax = currentValue + add;

      output[j++] = (sumAtMax - sumAtMin) / step;

      if (j === numberOfPoints) {
        break main;
      }

      min = max;
      max += step;
      sumAtMin = sumAtMax;
    }

    currentValue += integral(previousX, nextX, slope, intercept);

    previousX = nextX;
    previousY = nextY;

    if (i < xLength) {
      nextX = x[i];
      nextY = y[i];
      i++;
    } else if (i === xLength) {
      nextX += lastOriginalStep;
      nextY = 0;
    }

    slope = getSlope(previousX, previousY, nextX, nextY);
    intercept = -slope * previousX + previousY;
  }

  return output;
}

/**
 * function that retrieves the getEquallySpacedData with the variant "slot"
 *
 * @param x
 * @param y
 * @param from - Initial point
 * @param to - Final point
 * @param numberOfPoints
 * @return {Array} - Array of y's equally spaced with the variant "slot"
 */
function getEquallySpacedSlot(x, y, from, to, numberOfPoints) {
  var xLength = x.length;

  var step = (to - from) / (numberOfPoints - 1);
  var halfStep = step / 2;
  var lastStep = x[x.length - 1] - x[x.length - 2];

  var start = from - halfStep;
  var output = new Array(numberOfPoints);

  // Init main variables
  var min = start;
  var max = start + step;

  var previousX = -Number.MAX_VALUE;
  var previousY = 0;
  var nextX = x[0];
  var nextY = y[0];
  var frontOutsideSpectra = 0;
  var backOutsideSpectra = true;

  var currentValue = 0;

  // for slot algorithm
  var currentPoints = 0;

  var i = 1; // index of input
  var j = 0; // index of output

  main: while (true) {
    if (previousX >= nextX) throw (new Error('x must be an increasing serie'));
    while (previousX - max > 0) {
      // no overlap with original point, just consume current value
      if (backOutsideSpectra) {
        currentPoints++;
        backOutsideSpectra = false;
      }

      output[j] = currentPoints <= 0 ? 0 : currentValue / currentPoints;
      j++;

      if (j === numberOfPoints) {
        break main;
      }

      min = max;
      max += step;
      currentValue = 0;
      currentPoints = 0;
    }

    if (previousX > min) {
      currentValue += previousY;
      currentPoints++;
    }

    if (previousX === -Number.MAX_VALUE || frontOutsideSpectra > 1) {
      currentPoints--;
    }

    previousX = nextX;
    previousY = nextY;

    if (i < xLength) {
      nextX = x[i];
      nextY = y[i];
      i++;
    } else {
      nextX += lastStep;
      nextY = 0;
      frontOutsideSpectra++;
    }
  }

  return output;
}
