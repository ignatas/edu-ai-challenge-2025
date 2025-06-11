import Board from './Board.js';

describe('Board', () => {
  describe('constructor', () => {
    test('should create board with default size', () => {
      const board = new Board();

      expect(board.size).toBe(10);
      expect(board.grid).toHaveLength(10);
      expect(board.grid[0]).toHaveLength(10);
      expect(board.ships).toEqual([]);
    });

    test('should create board with custom size', () => {
      const board = new Board(5);

      expect(board.size).toBe(5);
      expect(board.grid).toHaveLength(5);
      expect(board.grid[0]).toHaveLength(5);
    });

    test('should throw error for invalid board size', () => {
      expect(() => new Board(0)).toThrow('Board size must be a number between 1 and 20');
      expect(() => new Board(-1)).toThrow('Board size must be a number between 1 and 20');
      expect(() => new Board(21)).toThrow('Board size must be a number between 1 and 20');
      expect(() => new Board('invalid')).toThrow('Board size must be a number between 1 and 20');
    });

    test('should initialize grid with water symbols', () => {
      const board = new Board(3);

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          expect(board.grid[i][j]).toBe('~');
        }
      }
    });
  });

  describe('isValidCoordinate', () => {
    let board;

    beforeEach(() => {
      board = new Board(5);
    });

    test('should return true for valid coordinates', () => {
      expect(board.isValidCoordinate(0, 0)).toBe(true);
      expect(board.isValidCoordinate(2, 3)).toBe(true);
      expect(board.isValidCoordinate(4, 4)).toBe(true);
    });

    test('should return false for invalid coordinates', () => {
      expect(board.isValidCoordinate(-1, 0)).toBe(false);
      expect(board.isValidCoordinate(0, -1)).toBe(false);
      expect(board.isValidCoordinate(5, 0)).toBe(false);
      expect(board.isValidCoordinate(0, 5)).toBe(false);
    });
  });

  describe('formatLocation', () => {
    let board;

    beforeEach(() => {
      board = new Board();
    });

    test('should format coordinates correctly', () => {
      expect(board.formatLocation(0, 0)).toBe('00');
      expect(board.formatLocation(1, 2)).toBe('12');
      expect(board.formatLocation(9, 9)).toBe('99');
    });
  });

  describe('parseLocation', () => {
    let board;

    beforeEach(() => {
      board = new Board();
    });

    test('should parse valid location strings', () => {
      expect(board.parseLocation('00')).toEqual({ row: 0, col: 0 });
      expect(board.parseLocation('12')).toEqual({ row: 1, col: 2 });
      expect(board.parseLocation('99')).toEqual({ row: 9, col: 9 });
    });

    test('should throw error for invalid location format', () => {
      expect(() => board.parseLocation('0')).toThrow('Location must be a 2-character string');
      expect(() => board.parseLocation('123')).toThrow('Location must be a 2-character string');
      expect(() => board.parseLocation('')).toThrow('Location must be a 2-character string');
      expect(() => board.parseLocation(null)).toThrow('Location must be a 2-character string');
      expect(() => board.parseLocation(123)).toThrow('Location must be a 2-character string');
    });

    test('should throw error for non-digit characters', () => {
      expect(() => board.parseLocation('ab')).toThrow('Location must contain valid digits');
      expect(() => board.parseLocation('1a')).toThrow('Location must contain valid digits');
    });
  });

  describe('canPlaceShip', () => {
    let board;

    beforeEach(() => {
      board = new Board(5);
    });

    test('should allow valid horizontal ship placement', () => {
      expect(board.canPlaceShip(0, 0, 3, 'horizontal')).toBe(true);
      expect(board.canPlaceShip(2, 1, 2, 'horizontal')).toBe(true);
    });

    test('should allow valid vertical ship placement', () => {
      expect(board.canPlaceShip(0, 0, 3, 'vertical')).toBe(true);
      expect(board.canPlaceShip(1, 2, 2, 'vertical')).toBe(true);
    });

    test('should reject horizontal ship placement that goes out of bounds', () => {
      expect(board.canPlaceShip(0, 3, 3, 'horizontal')).toBe(false);
      expect(board.canPlaceShip(0, 4, 2, 'horizontal')).toBe(false);
    });

    test('should reject vertical ship placement that goes out of bounds', () => {
      expect(board.canPlaceShip(3, 0, 3, 'vertical')).toBe(false);
      expect(board.canPlaceShip(4, 0, 2, 'vertical')).toBe(false);
    });

    test('should reject ship placement on occupied positions', () => {
      board.placeShip(0, 0, 2, 'horizontal');
      expect(board.canPlaceShip(0, 0, 2, 'vertical')).toBe(false);
      expect(board.canPlaceShip(0, 1, 2, 'horizontal')).toBe(false);
    });
  });

  describe('placeShip', () => {
    let board;

    beforeEach(() => {
      board = new Board(5);
    });

    test('should place ship successfully', () => {
      const result = board.placeShip(0, 0, 3, 'horizontal');

      expect(result).toBe(true);
      expect(board.ships).toHaveLength(1);
      expect(board.ships[0].locations).toEqual(['00', '01', '02']);
    });

    test('should place ship on grid when showOnGrid is true', () => {
      board.placeShip(0, 0, 2, 'horizontal', true);

      expect(board.grid[0][0]).toBe('S');
      expect(board.grid[0][1]).toBe('S');
      expect(board.grid[0][2]).toBe('~');
    });

    test('should not show ship on grid when showOnGrid is false', () => {
      board.placeShip(0, 0, 2, 'horizontal', false);

      expect(board.grid[0][0]).toBe('~');
      expect(board.grid[0][1]).toBe('~');
    });

    test('should fail to place ship in invalid position', () => {
      const result = board.placeShip(0, 4, 3, 'horizontal');

      expect(result).toBe(false);
      expect(board.ships).toHaveLength(0);
    });

    test('should place vertical ship correctly', () => {
      const result = board.placeShip(0, 0, 3, 'vertical', true);

      expect(result).toBe(true);
      expect(board.grid[0][0]).toBe('S');
      expect(board.grid[1][0]).toBe('S');
      expect(board.grid[2][0]).toBe('S');
    });
  });

  describe('placeShipsRandomly', () => {
    let board;

    beforeEach(() => {
      board = new Board(10);
    });

    test('should place requested number of ships', () => {
      const result = board.placeShipsRandomly(3, 2);

      expect(result).toBe(true);
      expect(board.ships).toHaveLength(3);
    });

    test('should show ships on grid when requested', () => {
      board.placeShipsRandomly(1, 2, true);

      let shipCells = 0;
      for (let i = 0; i < board.size; i++) {
        for (let j = 0; j < board.size; j++) {
          if (board.grid[i][j] === 'S') {
            shipCells++;
          }
        }
      }
      expect(shipCells).toBe(2);
    });

    test('should fail on impossible placement', () => {
      const smallBoard = new Board(2);
      const result = smallBoard.placeShipsRandomly(10, 5);

      expect(result).toBe(false);
    });
  });

  describe('processAttack', () => {
    let board;

    beforeEach(() => {
      board = new Board(5);
      board.placeShip(0, 0, 2, 'horizontal');
    });

    test('should register hit on ship', () => {
      const result = board.processAttack('00');

      expect(result.valid).toBe(true);
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(false);
      expect(result.message).toBe('Hit!');
      expect(board.grid[0][0]).toBe('X');
    });

    test('should register miss on empty water', () => {
      const result = board.processAttack('22');

      expect(result.valid).toBe(true);
      expect(result.hit).toBe(false);
      expect(result.sunk).toBe(false);
      expect(result.message).toBe('Miss!');
      expect(board.grid[2][2]).toBe('O');
    });

    test('should report sunk ship', () => {
      board.processAttack('00');
      const result = board.processAttack('01');

      expect(result.valid).toBe(true);
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(true);
      expect(result.message).toBe('Ship sunk!');
    });

    test('should reject attack on already attacked position', () => {
      board.processAttack('00');
      const result = board.processAttack('00');

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Already attacked this location');
    });

    test('should reject invalid coordinates', () => {
      const result = board.processAttack('55');

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Invalid coordinates');
    });

    test('should handle invalid location format gracefully', () => {
      const result = board.processAttack('invalid');

      expect(result.valid).toBe(false);
      expect(result.message).toContain('Attack failed');
    });
  });

  describe('getRemainingShips', () => {
    let board;

    beforeEach(() => {
      board = new Board(5);
      board.placeShip(0, 0, 2, 'horizontal');
      board.placeShip(2, 0, 2, 'horizontal');
    });

    test('should return correct count of remaining ships', () => {
      expect(board.getRemainingShips()).toBe(2);

      // Sink one ship
      board.processAttack('00');
      board.processAttack('01');

      expect(board.getRemainingShips()).toBe(1);
    });
  });

  describe('getAllSunk', () => {
    let board;

    beforeEach(() => {
      board = new Board(5);
      board.placeShip(0, 0, 2, 'horizontal');
    });

    test('should return false when ships remain', () => {
      expect(board.getAllSunk()).toBe(false);

      board.processAttack('00');
      expect(board.getAllSunk()).toBe(false);
    });

    test('should return true when all ships are sunk', () => {
      board.processAttack('00');
      board.processAttack('01');

      expect(board.getAllSunk()).toBe(true);
    });

    test('should return false for board with no ships', () => {
      const emptyBoard = new Board(5);
      expect(emptyBoard.getAllSunk()).toBe(false);
    });
  });
});
