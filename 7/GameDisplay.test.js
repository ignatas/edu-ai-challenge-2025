import GameDisplay from './GameDisplay.js';
import Board from './Board.js';

// Helper function to strip ANSI escape codes from strings
function stripAnsiCodes(str) {
  return str.replace(/\u001b\[[0-9;]*m/g, '');
}

// Mock console methods
let consoleLogs = [];
const originalConsoleLog = console.log;

beforeEach(() => {
  consoleLogs = [];
  console.log = (...args) => {
    consoleLogs.push(args.join(' '));
  };
});

afterEach(() => {
  console.log = originalConsoleLog;
});

describe('GameDisplay', () => {
  describe('printBoard', () => {
    test('should print board headers correctly', () => {
      const board1 = new Board(3);
      const board2 = new Board(3);

      GameDisplay.printBoard(board1, board2);

      expect(consoleLogs.length).toBeGreaterThan(0);
      expect(consoleLogs.some((log) => log.includes('OPPONENT BOARD') && log.includes('YOUR BOARD'))).toBe(true);
      // Look for numbers in the logs instead of exact format
      expect(consoleLogs.some((log) => log.includes('0') && log.includes('1') && log.includes('2'))).toBe(true);
    });

    test('should print board grid correctly', () => {
      const board1 = new Board(3);
      const board2 = new Board(3);
      board1.grid[0][0] = 'X';
      board2.grid[1][1] = 'S';

      GameDisplay.printBoard(board1, board2);

      expect(consoleLogs.some((log) => log.includes('X'))).toBe(true);
      expect(consoleLogs.some((log) => log.includes('S'))).toBe(true);
    });

    test('should handle different board sizes', () => {
      const smallBoard = new Board(2);
      const largeBoard = new Board(5);

      GameDisplay.printBoard(smallBoard, largeBoard);

      // Should not throw error and should produce output
      expect(consoleLogs.length).toBeGreaterThan(0);
    });
  });

  describe('printWelcome', () => {
    test('should print welcome message with ship count', () => {
      GameDisplay.printWelcome(3);

      // Strip ANSI codes from logs for testing
      const cleanLogs = consoleLogs.map((log) => stripAnsiCodes(log));

      // Look for the text without ANSI codes
      expect(cleanLogs.some((log) => log.includes('SEA BATTLE') || log.includes('BATTLE'))).toBe(true);
      expect(cleanLogs.some((log) => log.includes('3 enemy ships') || log.includes('3'))).toBe(true);
    });

    test('should handle different ship counts', () => {
      GameDisplay.printWelcome(5);

      const cleanLogs = consoleLogs.map((log) => stripAnsiCodes(log));
      expect(cleanLogs.some((log) => log.includes('5 enemy ships') || log.includes('5'))).toBe(true);
    });
  });

  describe('printGameOver', () => {
    test('should print player victory message', () => {
      GameDisplay.printGameOver('Player');

      expect(consoleLogs.some((log) => log.includes('VICTORY'))).toBe(true);
      expect(consoleLogs.some((log) => log.includes('CONGRATULATIONS'))).toBe(true);
    });

    test('should print CPU victory message', () => {
      GameDisplay.printGameOver('CPU');

      expect(consoleLogs.some((log) => log.includes('DEFEAT') || log.includes('GAME OVER'))).toBe(true);
    });

    test('should handle other winner values', () => {
      GameDisplay.printGameOver('Unknown');

      expect(consoleLogs.some((log) => log.includes('DEFEAT') || log.includes('GAME OVER'))).toBe(true);
    });
  });

  describe('printCPUTurn', () => {
    test('should print CPU turn message', () => {
      GameDisplay.printCPUTurn();

      expect(consoleLogs.some((log) => log.includes('CPU ATTACKS'))).toBe(true);
    });
  });

  describe('printPlayerResult', () => {
    test('should print hit message', () => {
      GameDisplay.printPlayerResult('HIT at 12!');

      expect(consoleLogs.some((log) => log.includes('HIT'))).toBe(true);
    });

    test('should print sunk message', () => {
      GameDisplay.printPlayerResult('Ship sunk!');

      expect(consoleLogs.some((log) => log.includes('DESTROYED') || log.includes('SHIP'))).toBe(true);
    });

    test('should print miss message', () => {
      GameDisplay.printPlayerResult('Miss!');

      expect(consoleLogs.some((log) => log.includes('Splash') || log.includes('missed'))).toBe(true);
    });

    test('should print generic message for other inputs', () => {
      const customMessage = 'Custom game message';
      GameDisplay.printPlayerResult(customMessage);

      expect(consoleLogs.some((log) => log.includes(customMessage))).toBe(true);
    });

    test('should handle empty or undefined messages', () => {
      GameDisplay.printPlayerResult('');
      GameDisplay.printPlayerResult(null);
      GameDisplay.printPlayerResult(undefined);

      // Should not throw errors
      expect(true).toBe(true);
    });
  });

  describe('printBoardsCreated', () => {
    test('should print boards created message', () => {
      GameDisplay.printBoardsCreated();

      expect(consoleLogs.some((log) => log.includes('Battle stations') || log.includes('prepared'))).toBe(true);
    });
  });

  describe('colorizeCell', () => {
    test('should colorize different cell types', () => {
      const water = GameDisplay.colorizeCell('~');
      const ship = GameDisplay.colorizeCell('S');
      const hit = GameDisplay.colorizeCell('X');
      const miss = GameDisplay.colorizeCell('O');

      expect(water).toContain('~');
      expect(ship).toContain('S');
      expect(hit).toContain('X');
      expect(miss).toContain('O');
    });

    test('should return unchanged for unknown cell types', () => {
      const unknown = GameDisplay.colorizeCell('?');
      expect(unknown).toBe('?');
    });
  });

  describe('new colorful methods', () => {
    test('should print game stats', () => {
      GameDisplay.printGameStats(3, 2);

      expect(consoleLogs.some((log) => log.includes('BATTLE STATUS'))).toBe(true);
      expect(consoleLogs.some((log) => log.includes('3'))).toBe(true);
      expect(consoleLogs.some((log) => log.includes('2'))).toBe(true);
    });

    test('should clear screen', () => {
      // Mock console.clear
      const originalClear = console.clear;
      let clearCalled = false;
      console.clear = () => {
        clearCalled = true;
      };

      GameDisplay.clearScreen();

      expect(clearCalled).toBe(true);
      console.clear = originalClear;
    });

    test('should print separator', () => {
      GameDisplay.printSeparator('=', 20, 'cyan');

      expect(consoleLogs.some((log) => log.includes('='))).toBe(true);
    });
  });

  describe('integration tests', () => {
    test('should display complete game scenario', () => {
      const board1 = new Board(3);
      const board2 = new Board(3);

      GameDisplay.printWelcome(2);
      GameDisplay.printBoard(board1, board2);
      GameDisplay.printCPUTurn();
      GameDisplay.printPlayerResult('HIT!');
      GameDisplay.printGameOver('Player');

      // Strip ANSI codes from logs for testing
      const cleanLogs = consoleLogs.map((log) => stripAnsiCodes(log));

      expect(consoleLogs.length).toBeGreaterThan(0);
      expect(cleanLogs.some((log) => log.includes('SEA BATTLE') || log.includes('BATTLE'))).toBe(true);
      expect(consoleLogs.some((log) => log.includes('CPU ATTACKS'))).toBe(true);
      expect(consoleLogs.some((log) => log.includes('HIT'))).toBe(true);
      expect(consoleLogs.some((log) => log.includes('VICTORY') || log.includes('CONGRATULATIONS'))).toBe(true);
    });
  });
});
