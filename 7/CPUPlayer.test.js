import CPUPlayer from './CPUPlayer.js';

// Simple console silencing without Jest mocking
const originalConsoleLog = console.log;
beforeEach(() => {
  console.log = () => {}; // Silent function
});

afterEach(() => {
  console.log = originalConsoleLog;
});

describe('CPUPlayer', () => {
  describe('constructor', () => {
    test('should create CPU player with default parameters', () => {
      const cpu = new CPUPlayer();

      expect(cpu.name).toBe('CPU');
      expect(cpu.mode).toBe('hunt');
      expect(cpu.targetQueue).toEqual([]);
      expect(cpu.board).toBeDefined();
      expect(cpu.opponentBoard).toBeDefined();
      expect(cpu.guesses).toEqual([]);
    });

    test('should create CPU player with custom parameters', () => {
      const cpu = new CPUPlayer('TestCPU', 5);

      expect(cpu.name).toBe('TestCPU');
      expect(cpu.board.size).toBe(5);
      expect(cpu.opponentBoard.size).toBe(5);
    });

    test('should inherit from Player', () => {
      const cpu = new CPUPlayer();
      expect(cpu.makeGuess).toBeDefined();
      expect(cpu.receiveAttack).toBeDefined();
      expect(cpu.updateOpponentBoard).toBeDefined();
    });
  });

  describe('setupShips', () => {
    let cpu;

    beforeEach(() => {
      cpu = new CPUPlayer();
    });

    test('should setup ships without showing on grid', () => {
      const result = cpu.setupShips(2, 3);

      expect(result).toBe(true);
      expect(cpu.board.ships).toHaveLength(2);

      // Verify ships are not visible on grid
      let visibleShips = 0;
      for (let i = 0; i < cpu.board.size; i++) {
        for (let j = 0; j < cpu.board.size; j++) {
          if (cpu.board.grid[i][j] === 'S') {
            visibleShips++;
          }
        }
      }
      expect(visibleShips).toBe(0);
    });
  });

  describe('makeGuess', () => {
    let cpu;

    beforeEach(() => {
      cpu = new CPUPlayer('TestCPU', 5);
    });

    test('should make valid guess in hunt mode', () => {
      const guess = cpu.makeGuess();

      expect(typeof guess).toBe('string');
      expect(guess).toHaveLength(2);
      expect(cpu.guesses).toContain(guess);
      expect(cpu.mode).toBe('hunt');
    });

    test('should not repeat guesses', () => {
      const guesses = new Set();

      // Make several guesses
      for (let i = 0; i < 5; i++) {
        const guess = cpu.makeGuess();
        expect(guesses.has(guess)).toBe(false);
        guesses.add(guess);
      }
    });

    test('should switch to target mode when targets are queued', () => {
      cpu.mode = 'target';
      cpu.targetQueue.push('12', '13');

      const guess = cpu.makeGuess();

      expect(['12', '13']).toContain(guess);
      expect(cpu.targetQueue).toHaveLength(1);
    });

    test('should handle exhausted target queue', () => {
      cpu.mode = 'target';
      cpu.targetQueue.push('12');
      cpu.guesses.push('12'); // Mark as already guessed

      const guess = cpu.makeGuess();

      expect(cpu.mode).toBe('hunt');
      expect(cpu.targetQueue).toHaveLength(0);
    });

    test('should handle full board scenario', () => {
      // Fill all but one position
      const cpu3x3 = new CPUPlayer('Test', 3);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (i !== 2 || j !== 2) {
            cpu3x3.guesses.push(`${i}${j}`);
          }
        }
      }

      const guess = cpu3x3.makeGuess();
      expect(guess).toBe('22');
    });
  });

  describe('generateRandomGuess', () => {
    let cpu;

    beforeEach(() => {
      cpu = new CPUPlayer('TestCPU', 5);
    });

    test('should generate valid random guess', () => {
      const guess = cpu.generateRandomGuess();

      expect(typeof guess).toBe('string');
      expect(guess).toHaveLength(2);

      const row = parseInt(guess[0]);
      const col = parseInt(guess[1]);
      expect(row).toBeGreaterThanOrEqual(0);
      expect(row).toBeLessThan(5);
      expect(col).toBeGreaterThanOrEqual(0);
      expect(col).toBeLessThan(5);
    });

    test('should generate different guesses', () => {
      const guesses = new Set();

      for (let i = 0; i < 10; i++) {
        const guess = cpu.generateRandomGuess();
        guesses.add(guess);
      }

      // Should have some variety (not all the same)
      expect(guesses.size).toBeGreaterThan(1);
    });
  });

  describe('processAttackResult', () => {
    let cpu;

    beforeEach(() => {
      cpu = new CPUPlayer('TestCPU', 5);
    });

    test('should handle miss result', () => {
      const result = { hit: false, sunk: false };

      cpu.processAttackResult('12', result);

      expect(cpu.opponentBoard.grid[1][2]).toBe('O');
    });

    test('should handle hit result and switch to target mode', () => {
      const result = { hit: true, sunk: false };

      cpu.processAttackResult('12', result);

      expect(cpu.opponentBoard.grid[1][2]).toBe('X');
      expect(cpu.mode).toBe('target');
      expect(cpu.targetQueue.length).toBeGreaterThan(0);
    });

    test('should add adjacent targets after hit', () => {
      const result = { hit: true, sunk: false };

      cpu.processAttackResult('22', result);

      expect(cpu.targetQueue).toContain('12');
      expect(cpu.targetQueue).toContain('32');
      expect(cpu.targetQueue).toContain('21');
      expect(cpu.targetQueue).toContain('23');
    });

    test('should not add out-of-bounds targets', () => {
      const result = { hit: true, sunk: false };

      cpu.processAttackResult('00', result);

      // For corner position (0,0), adjacent positions (1,0) and (0,1) should be added
      // but (-1,0) and (0,-1) should not be added as they're out of bounds
      expect(cpu.targetQueue).toContain('10');
      expect(cpu.targetQueue).toContain('01');
      expect(cpu.targetQueue).toHaveLength(2); // Only 2 valid adjacent positions
    });

    test('should handle sunk ship and return to hunt mode', () => {
      cpu.mode = 'target';
      cpu.targetQueue.push('12', '13');
      const result = { hit: true, sunk: true };

      cpu.processAttackResult('11', result);

      expect(cpu.mode).toBe('hunt');
      expect(cpu.targetQueue).toEqual([]);
    });

    test('should not add duplicate targets', () => {
      cpu.targetQueue.push('12');
      const result = { hit: true, sunk: false };

      cpu.processAttackResult('11', result);

      const targetCount = cpu.targetQueue.filter((target) => target === '12').length;
      expect(targetCount).toBe(1);
    });

    test('should not add already guessed targets', () => {
      cpu.guesses.push('12');
      const result = { hit: true, sunk: false };

      cpu.processAttackResult('11', result);

      expect(cpu.targetQueue).not.toContain('12');
    });
  });

  describe('addAdjacentTargets', () => {
    let cpu;

    beforeEach(() => {
      cpu = new CPUPlayer('TestCPU', 5);
    });

    test('should add all valid adjacent targets', () => {
      cpu.addAdjacentTargets('22');

      expect(cpu.targetQueue).toContain('12');
      expect(cpu.targetQueue).toContain('32');
      expect(cpu.targetQueue).toContain('21');
      expect(cpu.targetQueue).toContain('23');
      expect(cpu.targetQueue).toHaveLength(4);
    });

    test('should not add out-of-bounds targets for corner position', () => {
      cpu.addAdjacentTargets('00');

      expect(cpu.targetQueue).toContain('10');
      expect(cpu.targetQueue).toContain('01');
      expect(cpu.targetQueue).toHaveLength(2);
    });

    test('should not add out-of-bounds targets for edge position', () => {
      cpu.addAdjacentTargets('04');

      expect(cpu.targetQueue).toContain('14');
      expect(cpu.targetQueue).toContain('03');
      expect(cpu.targetQueue).toHaveLength(2);
    });
  });

  describe('AI behavior integration tests', () => {
    test('should demonstrate hunt and target behavior', () => {
      const cpu = new CPUPlayer();

      // Start in hunt mode
      expect(cpu.mode).toBe('hunt');

      // Simulate a hit
      const hitResult = { hit: true, sunk: false };
      cpu.processAttackResult('55', hitResult);

      // Should switch to target mode
      expect(cpu.mode).toBe('target');
      expect(cpu.targetQueue.length).toBeGreaterThan(0);

      // Next guess should be from target queue
      const nextGuess = cpu.makeGuess();
      expect(cpu.targetQueue.length).toBeLessThan(4); // One target used

      // Simulate sinking the ship
      const sunkResult = { hit: true, sunk: true };
      cpu.processAttackResult(nextGuess, sunkResult);

      // Should return to hunt mode
      expect(cpu.mode).toBe('hunt');
      expect(cpu.targetQueue).toEqual([]);
    });

    test('should handle complex targeting scenario', () => {
      const cpu = new CPUPlayer();

      // Hit at position 22
      cpu.processAttackResult('22', { hit: true, sunk: false });
      expect(cpu.mode).toBe('target');

      // Miss on adjacent positions
      cpu.processAttackResult('12', { hit: false, sunk: false });
      cpu.processAttackResult('32', { hit: false, sunk: false });

      // Should still be in target mode with remaining targets
      expect(cpu.mode).toBe('target');
      expect(cpu.targetQueue.length).toBeGreaterThan(0);

      // Hit another part of the ship
      cpu.processAttackResult('21', { hit: true, sunk: false });

      // Should add more adjacent targets
      expect(cpu.targetQueue.length).toBeGreaterThan(0);
    });
  });
});
