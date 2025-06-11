import Ship from './Ship.js';

describe('Ship', () => {
  describe('constructor', () => {
    test('should create a ship with valid parameters', () => {
      const locations = ['00', '01', '02'];
      const ship = new Ship(locations, 3);

      expect(ship.locations).toEqual(locations);
      expect(ship.length).toBe(3);
      expect(ship.hits).toEqual(['', '', '']);
    });

    test('should throw error for non-array locations', () => {
      expect(() => new Ship('invalid', 3)).toThrow('Ship locations must be an array');
    });

    test('should throw error for invalid length', () => {
      expect(() => new Ship(['00'], 0)).toThrow('Ship length must be a positive number');
      expect(() => new Ship(['00'], -1)).toThrow('Ship length must be a positive number');
      expect(() => new Ship(['00'], 'invalid')).toThrow('Ship length must be a positive number');
    });

    test('should throw error when locations length does not match ship length', () => {
      expect(() => new Ship(['00', '01'], 3)).toThrow('Ship locations array length must match ship length');
    });

    test('should create defensive copy of locations array', () => {
      const locations = ['00', '01', '02'];
      const ship = new Ship(locations, 3);

      locations.push('03');
      expect(ship.locations).toEqual(['00', '01', '02']);
    });
  });

  describe('hit', () => {
    let ship;

    beforeEach(() => {
      ship = new Ship(['00', '01', '02'], 3);
    });

    test('should register hit for valid location', () => {
      const result = ship.hit('01');

      expect(result).toBe(true);
      expect(ship.hits[1]).toBe('hit');
    });

    test('should not register hit for location not on ship', () => {
      const result = ship.hit('99');

      expect(result).toBe(false);
      expect(ship.hits).toEqual(['', '', '']);
    });

    test('should not register hit twice for same location', () => {
      ship.hit('01');
      const result = ship.hit('01');

      expect(result).toBe(false);
      expect(ship.hits[1]).toBe('hit');
    });

    test('should throw error for non-string location', () => {
      expect(() => ship.hit(123)).toThrow('Location must be a string');
      expect(() => ship.hit(null)).toThrow('Location must be a string');
      expect(() => ship.hit(undefined)).toThrow('Location must be a string');
    });
  });

  describe('isHit', () => {
    let ship;

    beforeEach(() => {
      ship = new Ship(['00', '01', '02'], 3);
    });

    test('should return true for hit location', () => {
      ship.hit('01');
      expect(ship.isHit('01')).toBe(true);
    });

    test('should return false for unhit location on ship', () => {
      expect(ship.isHit('01')).toBe(false);
    });

    test('should return false for location not on ship', () => {
      expect(ship.isHit('99')).toBe(false);
    });
  });

  describe('hasLocation', () => {
    let ship;

    beforeEach(() => {
      ship = new Ship(['00', '01', '02'], 3);
    });

    test('should return true for valid ship location', () => {
      expect(ship.hasLocation('01')).toBe(true);
    });

    test('should return false for invalid ship location', () => {
      expect(ship.hasLocation('99')).toBe(false);
    });
  });

  describe('isSunk', () => {
    let ship;

    beforeEach(() => {
      ship = new Ship(['00', '01', '02'], 3);
    });

    test('should return false for unhit ship', () => {
      expect(ship.isSunk()).toBe(false);
    });

    test('should return false for partially hit ship', () => {
      ship.hit('00');
      ship.hit('01');
      expect(ship.isSunk()).toBe(false);
    });

    test('should return true for fully hit ship', () => {
      ship.hit('00');
      ship.hit('01');
      ship.hit('02');
      expect(ship.isSunk()).toBe(true);
    });

    test('should return true for single-cell ship when hit', () => {
      const singleShip = new Ship(['00'], 1);
      singleShip.hit('00');
      expect(singleShip.isSunk()).toBe(true);
    });
  });
});
