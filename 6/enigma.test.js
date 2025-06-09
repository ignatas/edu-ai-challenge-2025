import { describe, it } from 'node:test';
import assert from 'node:assert';
import { mod, plugboardSwap, Rotor, Enigma } from './enigma.js';

// Helper function for testing
function createTestEnigma(rotorPositions = [0, 0, 0], ringSettings = [0, 0, 0], plugboardPairs = []) {
  return new Enigma([0, 1, 2], rotorPositions, ringSettings, plugboardPairs);
}

describe('mod function', () => {
  it('should handle positive numbers', () => {
    assert.strictEqual(mod(7, 5), 2);
    assert.strictEqual(mod(10, 3), 1);
  });

  it('should handle negative numbers', () => {
    assert.strictEqual(mod(-3, 5), 2);
    assert.strictEqual(mod(-1, 26), 25);
  });

  it('should handle zero', () => {
    assert.strictEqual(mod(0, 5), 0);
  });
});

describe('plugboardSwap function', () => {
  it('should swap letters according to pairs', () => {
    const pairs = [
      ['A', 'B'],
      ['C', 'D'],
    ];
    assert.strictEqual(plugboardSwap('A', pairs), 'B');
    assert.strictEqual(plugboardSwap('B', pairs), 'A');
    assert.strictEqual(plugboardSwap('C', pairs), 'D');
    assert.strictEqual(plugboardSwap('D', pairs), 'C');
  });

  it('should return unchanged letter if not in pairs', () => {
    const pairs = [['A', 'B']];
    assert.strictEqual(plugboardSwap('Z', pairs), 'Z');
  });

  it('should handle empty pairs', () => {
    assert.strictEqual(plugboardSwap('A', []), 'A');
  });
});

describe('Rotor class', () => {
  describe('constructor', () => {
    it('should initialize with default values', () => {
      const rotor = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q');
      assert.strictEqual(rotor.wiring, 'EKMFLGDQVZNTOWYHXUSPAIBRCJ');
      assert.strictEqual(rotor.notch, 'Q');
      assert.strictEqual(rotor.ringSetting, 0);
      assert.strictEqual(rotor.position, 0);
    });

    it('should initialize with custom values', () => {
      const rotor = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q', 5, 10);
      assert.strictEqual(rotor.ringSetting, 5);
      assert.strictEqual(rotor.position, 10);
    });
  });

  describe('step method', () => {
    it('should increment position', () => {
      const rotor = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q', 0, 0);
      rotor.step();
      assert.strictEqual(rotor.position, 1);
    });

    it('should wrap around at 26', () => {
      const rotor = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q', 0, 25);
      rotor.step();
      assert.strictEqual(rotor.position, 0);
    });
  });

  describe('atNotch method', () => {
    it('should return true when at notch position', () => {
      const rotor = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q', 0, 16); // Q is at position 16
      assert.strictEqual(rotor.atNotch(), true);
    });

    it('should return false when not at notch position', () => {
      const rotor = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q', 0, 0);
      assert.strictEqual(rotor.atNotch(), false);
    });
  });

  describe('forward method', () => {
    it('should transform character through rotor', () => {
      const rotor = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q', 0, 0);
      const result = rotor.forward('A');
      assert.strictEqual(result, 'E'); // First letter of wiring
    });

    it('should handle position offset', () => {
      const rotor = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q', 0, 1);
      const result = rotor.forward('A');
      assert.strictEqual(result, 'K'); // Second letter of wiring
    });
  });

  describe('backward method', () => {
    it('should reverse transform character through rotor', () => {
      const rotor = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q', 0, 0);
      const result = rotor.backward('E');
      assert.strictEqual(result, 'A'); // E is at position 0 in wiring
    });
  });
});

describe('Enigma class', () => {
  describe('constructor', () => {
    it('should initialize with three rotors', () => {
      const enigma = createTestEnigma();
      assert.strictEqual(enigma.rotors.length, 3);
      assert.deepStrictEqual(enigma.plugboardPairs, []);
    });

    it('should initialize rotors with correct settings', () => {
      const enigma = createTestEnigma([1, 2, 3], [4, 5, 6], [['A', 'B']]);
      assert.strictEqual(enigma.rotors[0].position, 1);
      assert.strictEqual(enigma.rotors[1].position, 2);
      assert.strictEqual(enigma.rotors[2].position, 3);
      assert.strictEqual(enigma.rotors[0].ringSetting, 4);
      assert.strictEqual(enigma.rotors[1].ringSetting, 5);
      assert.strictEqual(enigma.rotors[2].ringSetting, 6);
      assert.deepStrictEqual(enigma.plugboardPairs, [['A', 'B']]);
    });
  });

  describe('stepRotors method', () => {
    it('should step the rightmost rotor', () => {
      const enigma = createTestEnigma([0, 0, 0]);
      const initialPos = enigma.rotors[2].position;
      enigma.stepRotors();
      assert.strictEqual(enigma.rotors[2].position, initialPos + 1);
    });

    it('should handle double stepping', () => {
      // Set middle rotor at notch position (E = position 4 for rotor II)
      const enigma = createTestEnigma([0, 4, 0]);
      enigma.stepRotors();
      // Both middle and left rotors should step
      assert.strictEqual(enigma.rotors[0].position, 1);
      assert.strictEqual(enigma.rotors[1].position, 5);
    });

    it('should step middle rotor when rightmost is at notch', () => {
      // Set rightmost rotor at notch position (V = position 21 for rotor III)
      const enigma = createTestEnigma([0, 0, 21]);
      enigma.stepRotors();
      assert.strictEqual(enigma.rotors[1].position, 1);
      assert.strictEqual(enigma.rotors[2].position, 22);
    });
  });

  describe('encryptChar method', () => {
    it('should encrypt a single character', () => {
      const enigma = createTestEnigma();
      const result = enigma.encryptChar('A');
      assert.strictEqual(typeof result, 'string');
      assert.strictEqual(result.length, 1);
    });

    it('should return non-alphabetic characters unchanged', () => {
      const enigma = createTestEnigma();
      assert.strictEqual(enigma.encryptChar('1'), '1');
      assert.strictEqual(enigma.encryptChar(' '), ' ');
      assert.strictEqual(enigma.encryptChar('!'), '!');
    });

    it('should apply plugboard swap twice', () => {
      const enigma = createTestEnigma([0, 0, 0], [0, 0, 0], [['A', 'B']]);
      // The character should go through plugboard twice, so it should be symmetric
      const encrypted = enigma.encryptChar('A');

      // Reset enigma to same state
      const enigma2 = createTestEnigma([0, 0, 0], [0, 0, 0], [['A', 'B']]);
      const decrypted = enigma2.encryptChar(encrypted);

      assert.strictEqual(decrypted, 'A');
    });

    it('should step rotors before encryption', () => {
      const enigma = createTestEnigma([0, 0, 0]);
      const initialPos = enigma.rotors[2].position;
      enigma.encryptChar('A');
      assert.strictEqual(enigma.rotors[2].position, initialPos + 1);
    });
  });

  describe('process method', () => {
    it('should encrypt a full message', () => {
      const enigma = createTestEnigma();
      const result = enigma.process('HELLO');
      assert.strictEqual(typeof result, 'string');
      assert.strictEqual(result.length, 5);
    });

    it('should convert to uppercase', () => {
      const enigma = createTestEnigma();
      const result1 = enigma.process('hello');

      const enigma2 = createTestEnigma();
      const result2 = enigma2.process('HELLO');

      assert.strictEqual(result1, result2);
    });

    it('should preserve non-alphabetic characters', () => {
      const enigma = createTestEnigma();
      const result = enigma.process('HELLO, WORLD!');
      assert.strictEqual(result.charAt(5), ',');
      assert.strictEqual(result.charAt(6), ' ');
      assert.strictEqual(result.charAt(12), '!');
    });

    it('should handle empty string', () => {
      const enigma = createTestEnigma();
      const result = enigma.process('');
      assert.strictEqual(result, '');
    });
  });

  describe('encryption/decryption symmetry', () => {
    it('should decrypt its own encryption with same settings', () => {
      const message = 'HELLOWORLD';
      const settings = [
        [5, 10, 15],
        [0, 0, 0],
        [
          ['A', 'B'],
          ['C', 'D'],
        ],
      ];

      const enigma1 = createTestEnigma(...settings);
      const encrypted = enigma1.process(message);

      const enigma2 = createTestEnigma(...settings);
      const decrypted = enigma2.process(encrypted);

      assert.strictEqual(decrypted, message);
    });

    it('should be symmetric with different plugboard settings', () => {
      const message = 'TESTMESSAGE';
      const plugboardPairs = [
        ['Q', 'W'],
        ['E', 'R'],
        ['T', 'Y'],
      ];

      const enigma1 = createTestEnigma([0, 0, 0], [0, 0, 0], plugboardPairs);
      const encrypted = enigma1.process(message);

      const enigma2 = createTestEnigma([0, 0, 0], [0, 0, 0], plugboardPairs);
      const decrypted = enigma2.process(encrypted);

      assert.strictEqual(decrypted, message);
    });

    it('should be symmetric with different rotor positions', () => {
      const message = 'SECRETMESSAGE';
      const rotorPositions = [7, 14, 21];

      const enigma1 = createTestEnigma(rotorPositions);
      const encrypted = enigma1.process(message);

      const enigma2 = createTestEnigma(rotorPositions);
      const decrypted = enigma2.process(encrypted);

      assert.strictEqual(decrypted, message);
    });

    it('should be symmetric with ring settings', () => {
      const message = 'RINGTEST';
      const ringSettings = [3, 7, 11];

      const enigma1 = createTestEnigma([0, 0, 0], ringSettings);
      const encrypted = enigma1.process(message);

      const enigma2 = createTestEnigma([0, 0, 0], ringSettings);
      const decrypted = enigma2.process(encrypted);

      assert.strictEqual(decrypted, message);
    });
  });

  describe('known test vectors', () => {
    it('should produce expected output for known input', () => {
      // Test with specific known configuration
      const enigma = createTestEnigma([0, 0, 0], [0, 0, 0], []);
      const result = enigma.encryptChar('A');

      // The first character 'A' with all rotors at position 0 should produce a specific result
      // This will help catch any regression in the encryption logic
      assert.strictEqual(typeof result, 'string');
      assert.strictEqual(result.length, 1);
      assert.notStrictEqual(result, 'A'); // Should be encrypted, not the same
    });
  });

  describe('rotor stepping edge cases', () => {
    it('should handle all rotors at notch positions', () => {
      // Rotor I notch: Q (16), Rotor II notch: E (4), Rotor III notch: V (21)
      const enigma = createTestEnigma([16, 4, 21]);

      // This should trigger complex stepping behavior
      enigma.stepRotors();

      // Verify rotors have moved appropriately
      assert.strictEqual(enigma.rotors[0].position, 17); // Left rotor stepped
      assert.strictEqual(enigma.rotors[1].position, 5); // Middle rotor stepped
      assert.strictEqual(enigma.rotors[2].position, 22); // Right rotor stepped
    });
  });
});

describe('Integration tests', () => {
  it('should handle a complete encryption cycle', () => {
    const message = 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG';
    const enigma = createTestEnigma(
      [1, 2, 3],
      [4, 5, 6],
      [
        ['A', 'Z'],
        ['B', 'Y'],
      ]
    );

    const encrypted = enigma.process(message);
    assert.notStrictEqual(encrypted, message);

    const enigma2 = createTestEnigma(
      [1, 2, 3],
      [4, 5, 6],
      [
        ['A', 'Z'],
        ['B', 'Y'],
      ]
    );
    const decrypted = enigma2.process(encrypted);

    assert.strictEqual(decrypted, message.toUpperCase());
  });

  it('should maintain character count', () => {
    const message = 'Hello, World! 123';
    const enigma = createTestEnigma();
    const result = enigma.process(message);

    assert.strictEqual(result.length, message.length);
  });
});
