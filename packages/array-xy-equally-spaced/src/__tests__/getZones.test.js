import getZones from '../getZones';

describe('getZones', () => {
  it('no options', function () {
    let zones = getZones(0, 10, 11);
    expect(zones).toEqual([
      {
        from: 0,
        to: 10,
        numberOfPoints: 11
      }
    ]);
  });

  it('one exclusion', function () {
    let zones = getZones(0, 10, 11, [{ from: 2, to: 4 }]);
    expect(zones).toEqual([
      {
        from: 0,
        to: 2,
        numberOfPoints: 3
      },
      {
        from: 4,
        to: 10,
        numberOfPoints: 8
      }
    ]);
  });

  it('two symmetric exclusion', function () {
    let zones = getZones(0, 10, 12, [{ from: 2, to: 4 }, { from: 6, to: 8 }]);
    expect(zones).toEqual([
      {
        from: 0,
        to: 2,
        numberOfPoints: 4
      },
      {
        from: 4,
        to: 6,
        numberOfPoints: 4
      },
      {
        from: 8,
        to: 10,
        numberOfPoints: 4
      }
    ]);
  });

  it('two exclusion', function () {
    let zones = getZones(0, 12, 10, [{ from: 1, to: 2 }, { from: 3, to: 4 }]);
    expect(zones).toEqual([
      {
        from: 0,
        to: 1,
        numberOfPoints: 1
      },
      {
        from: 2,
        to: 3,
        numberOfPoints: 1
      },
      {
        from: 4,
        to: 12,
        numberOfPoints: 8
      }
    ]);
  });
});