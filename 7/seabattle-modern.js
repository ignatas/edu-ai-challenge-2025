import Game from './Game.js';
import Colors from './Colors.js';

/**
 * 🌊 Sea Battle - Modern ES6+ Edition 🌊
 * A colorful and engaging battleship game experience
 */

// Display beautiful startup banner
console.log('\n' + '🌊'.repeat(60));
console.log(Colors.rainbow('    ⚓ WELCOME TO SEA BATTLE - MODERN EDITION ⚓'));
console.log('🌊'.repeat(60));
console.log(Colors.brightCyan('    A beautiful, modern JavaScript battleship experience'));
console.log(Colors.dim('    Built with ES6+ classes, modules, and async/await'));
console.log('🌊'.repeat(60));

// Game configuration
const gameConfig = {
  boardSize: 10, // Classic 10x10 grid
  numShips: 3, // 3 ships to sink
  shipLength: 3, // Each ship is 3 units long
};

// Start the epic sea battle!
const game = new Game(gameConfig);
game.start().catch((error) => {
  console.error(Colors.error(`💥 Fatal Error: ${error.message}`));
  process.exit(1);
});
