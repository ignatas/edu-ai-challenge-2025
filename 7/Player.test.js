import Player from './Player.js';

// Simple console silencing without Jest mocking
const originalConsoleLog = console.log;
beforeEach(() => {
  console.log = () => {}; // Silent function
});

afterEach(() => {
  console.log = originalConsoleLog;
});

describe('Player', () => {
  describe('constructor', () => {
    test('should create player with default parameters', () => {
      const player = new Player();

      expect(player.name).toBe('Player');
      expect(player.board).toBeDefined();
      expect(player.opponentBoard).toBeDefined();
      expect(player.guesses).toEqual([]);
    });

    test('should create player with custom parameters', () => {
      const player = new Player('TestPlayer', 5);

      expect(player.name).toBe('TestPlayer');
      expect(player.board.size).toBe(5);
      expect(player.opponentBoard.size).toBe(5);
    });
  });

  describe('setupShips', () => {
    let player;

    beforeEach(() => {
      player = new Player('TestPlayer', 10);
    });

    test('should successfully setup ships', () => {
      const result = player.setupShips(2, 3);

      expect(result).toBe(true);
      expect(player.board.ships).toHaveLength(2);
    });

    test('should fail to setup impossible ship configuration', () => {
      const smallPlayer = new Player('TestPlayer', 2);
      const result = smallPlayer.setupShips(10, 5);

      expect(result).toBe(false);
    });
  });

  describe('makeGuess', () => {
    let player;

    beforeEach(() => {
      player = new Player();
    });

    test('should accept valid guess', () => {
      const result = player.makeGuess('12');

      expect(result.valid).toBe(true);
      expect(player.guesses).toContain('12');
    });

    test('should reject guess with invalid format', () => {
      const invalidInputs = [null, undefined, '', '1', '123'];

      invalidInputs.forEach((input) => {
        const result = player.makeGuess(input);
        expect(result.valid).toBe(false);
        expect(result.message).toContain('input must be exactly two digits');
      });
    });

    test('should reject guess with invalid coordinates', () => {
      const result = player.makeGuess('ab');

      expect(result.valid).toBe(false);
      expect(result.message).toContain('valid row and column numbers');
    });

    test('should reject out of bounds coordinates', () => {
      const player5x5 = new Player('Test', 5);
      const result = player5x5.makeGuess('59');

      expect(result.valid).toBe(false);
      expect(result.message).toContain('valid row and column numbers between 0 and 4');
    });

    test('should reject duplicate guess', () => {
      player.makeGuess('12');
      const result = player.makeGuess('12');

      expect(result.valid).toBe(false);
      expect(result.message).toBe('You already guessed that location!');
    });

    test('should handle edge case coordinates', () => {
      const result1 = player.makeGuess('00');
      const result2 = player.makeGuess('99');

      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
    });
  });

  describe('receiveAttack', () => {
    let player;

    beforeEach(() => {
      player = new Player();
      player.setupShips(1, 2);
    });

    test('should process attack correctly', () => {
      const result = player.receiveAttack('00');

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('hit');
      expect(result).toHaveProperty('message');
    });
  });

  describe('updateOpponentBoard', () => {
    let player;

    beforeEach(() => {
      player = new Player();
    });

    test('should update opponent board with hit', () => {
      const result = { hit: true };
      player.updateOpponentBoard('12', result);

      expect(player.opponentBoard.grid[1][2]).toBe('X');
    });

    test('should update opponent board with miss', () => {
      const result = { hit: false };
      player.updateOpponentBoard('34', result);

      expect(player.opponentBoard.grid[3][4]).toBe('O');
    });
  });

  describe('hasLost', () => {
    let player;

    beforeEach(() => {
      player = new Player();
      player.setupShips(1, 2);
    });

    test('should return false when ships remain', () => {
      expect(player.hasLost()).toBe(false);
    });

    test('should return true when all ships are sunk', () => {
      // Find ship locations and sink them all
      const ship = player.board.ships[0];
      ship.locations.forEach((location) => {
        player.receiveAttack(location);
      });

      expect(player.hasLost()).toBe(true);
    });
  });

  describe('getRemainingShips', () => {
    let player;

    beforeEach(() => {
      player = new Player();
      player.setupShips(2, 2);
    });

    test('should return correct count of remaining ships', () => {
      expect(player.getRemainingShips()).toBe(2);

      // Sink one ship
      const ship = player.board.ships[0];
      ship.locations.forEach((location) => {
        player.receiveAttack(location);
      });

      expect(player.getRemainingShips()).toBe(1);
    });
  });

  describe('integration tests', () => {
    test('should handle complete game scenario', () => {
      const player = new Player('TestPlayer');

      // Setup
      player.setupShips(1, 3);

      // Make some guesses
      expect(player.makeGuess('00').valid).toBe(true);
      expect(player.makeGuess('11').valid).toBe(true);
      expect(player.makeGuess('00').valid).toBe(false); // duplicate

      // Receive attacks
      const attackResult = player.receiveAttack('50');
      expect(attackResult.valid).toBe(true);

      // Check game state
      expect(player.guesses).toHaveLength(2);
      expect(player.hasLost()).toBe(false);
    });
  });
});
