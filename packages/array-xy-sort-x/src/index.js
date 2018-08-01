export default function sortX(points, options = {}) {
  const { x, y } = points;
  const { reverse = false } = options;

  var sortFunc;
  if (!reverse) {
    sortFunc = (a, b) => a.x - b.x;
  } else {
    sortFunc = (a, b) => b.x - a.x;
  }

  var grouped = x
    .map((val, index) => ({
      x: val,
      y: y[index]
    }))
    .sort(sortFunc);

  var response = { x: x.slice(), y: y.slice() };
  for (var i = 0; i < x.length; i++) {
    response.x[i] = grouped[i].x;
    response.y[i] = grouped[i].y;
  }

  return response;
}
