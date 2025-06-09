# Enigma Machine Bug Fix

## Bug Description

The Enigma machine implementation was missing the second plugboard swap operation. In a real Enigma machine, the plugboard should be applied twice during encryption/decryption:

1. At the input (before rotors) - ✅ Was implemented
2. At the output (after rotors and reflector) - ❌ Was missing

## Impact

- Encryption/decryption was not symmetric
- Behavior didn't match a real Enigma machine
- Messages encrypted with certain plugboard settings couldn't be properly decrypted

## Fix Applied

Added the missing second plugboard swap in the `encryptChar` method:

```javascript
// Added this line before returning the character
c = plugboardSwap(c, this.plugboardPairs);
```

## Result

- Proper symmetric encryption/decryption
- Correct Enigma machine behavior
- Messages can now be encrypted and decrypted using the same settings

## Additional Changes

Also converted the module from CommonJS to ES module syntax to resolve linter warnings:

- `require('readline')` → `import readline from 'readline'`
- `require.main === module` → `import.meta.url === \`file://${process.argv[1]}\``
