import Game from './Game.js';

// Simple console silencing without Jest mocking
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  console.log = () => {}; // Silent function
  console.error = () => {}; // Silent function
});

afterEach(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('Game', () => {
  describe('constructor', () => {
    test('should create game with default configuration', () => {
      const game = new Game();

      expect(game.boardSize).toBe(10);
      expect(game.numShips).toBe(3);
      expect(game.shipLength).toBe(3);
      expect(game.gameOver).toBe(false);
      expect(game.winner).toBe(null);
    });

    test('should create game with custom configuration', () => {
      const config = {
        boardSize: 5,
        numShips: 2,
        shipLength: 2,
      };
      const game = new Game(config);

      expect(game.boardSize).toBe(5);
      expect(game.numShips).toBe(2);
      expect(game.shipLength).toBe(2);
    });

    test('should create player and CPU instances', () => {
      const game = new Game();

      expect(game.player).toBeDefined();
      expect(game.cpu).toBeDefined();
      expect(game.inputHandler).toBeDefined();
    });
  });

  describe('game configuration', () => {
    test('should handle empty configuration object', () => {
      const game = new Game({});

      expect(game.boardSize).toBe(10);
      expect(game.numShips).toBe(3);
      expect(game.shipLength).toBe(3);
    });

    test('should handle partial configuration', () => {
      const game = new Game({ boardSize: 8 });

      expect(game.boardSize).toBe(8);
      expect(game.numShips).toBe(3);
      expect(game.shipLength).toBe(3);
    });
  });

  describe('game state', () => {
    test('should initialize with correct default state', () => {
      const game = new Game();

      expect(game.gameOver).toBe(false);
      expect(game.winner).toBe(null);
      expect(typeof game.initialize).toBe('function');
      expect(typeof game.gameLoop).toBe('function');
      expect(typeof game.start).toBe('function');
    });
  });

  describe('error handling', () => {
    test('should handle start method without throwing', async () => {
      const game = new Game();

      // Mock the methods to avoid actual game execution
      game.initialize = async () => {};
      game.gameLoop = async () => {};

      await expect(game.start()).resolves.not.toThrow();
    });

    test('should handle initialization errors', async () => {
      const game = new Game();

      // Mock initialization to throw error
      game.initialize = async () => {
        throw new Error('Test initialization error');
      };
      game.gameLoop = async () => {};

      await expect(game.start()).resolves.not.toThrow();
    });
  });

  describe('method existence', () => {
    test('should have all required methods', () => {
      const game = new Game();

      expect(typeof game.initialize).toBe('function');
      expect(typeof game.gameLoop).toBe('function');
      expect(typeof game.handlePlayerTurn).toBe('function');
      expect(typeof game.handleCPUTurn).toBe('function');
      expect(typeof game.start).toBe('function');
    });
  });
});
