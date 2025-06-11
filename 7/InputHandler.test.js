import InputHandler from './InputHandler.js';

describe('InputHandler', () => {
  let inputHandler;

  beforeEach(() => {
    inputHandler = new InputHandler();
  });

  afterEach(() => {
    if (inputHandler) {
      inputHandler.close();
    }
  });

  describe('constructor', () => {
    test('should create InputHandler instance', () => {
      expect(inputHandler).toBeDefined();
      expect(inputHandler.rl).toBeDefined();
    });
  });

  describe('getUserInput error handling', () => {
    test('should reject promise for non-string prompt', async () => {
      await expect(inputHandler.getUserInput(123)).rejects.toThrow('Prompt must be a string');
    });

    test('should reject promise for null prompt', async () => {
      await expect(inputHandler.getUserInput(null)).rejects.toThrow('Prompt must be a string');
    });

    test('should reject promise for undefined prompt', async () => {
      await expect(inputHandler.getUserInput(undefined)).rejects.toThrow('Prompt must be a string');
    });
  });

  describe('close', () => {
    test('should not throw when called multiple times', () => {
      expect(() => {
        inputHandler.close();
        inputHandler.close();
        inputHandler.close();
      }).not.toThrow();
    });
  });

  describe('method existence', () => {
    test('should have getUserInput method', () => {
      expect(typeof inputHandler.getUserInput).toBe('function');
    });

    test('should have close method', () => {
      expect(typeof inputHandler.close).toBe('function');
    });
  });
});
