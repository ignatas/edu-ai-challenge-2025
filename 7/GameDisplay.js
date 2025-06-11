import Colors from './Colors.js';

/**
 * GameDisplay - Beautiful console UI for Sea Battle game
 * Handles all visual output with colors and formatting
 */
class GameDisplay {
  /**
   * Print the game boards side by side with beautiful colors
   */
  static printBoard(opponentBoard, playerBoard) {
    console.log('\n' + '═'.repeat(80));
    console.log(Colors.header('   🌊 OPPONENT BOARD 🌊           🚢 YOUR BOARD 🚢'));
    console.log('═'.repeat(80));

    const header = '  ' + Array.from({ length: opponentBoard.size }, (_, i) => Colors.dim(i.toString())).join(' ');
    console.log(header + '     ' + header);

    for (let i = 0; i < opponentBoard.size; i++) {
      let rowStr = Colors.dim(i.toString()) + ' ';

      // Opponent board with colors
      for (let j = 0; j < opponentBoard.size; j++) {
        const cell = opponentBoard.grid[i][j];
        rowStr += this.colorizeCell(cell) + ' ';
      }

      rowStr += '    ' + Colors.dim(i.toString()) + ' ';

      // Player board with colors
      for (let j = 0; j < playerBoard.size; j++) {
        const cell = playerBoard.grid[i][j];
        rowStr += this.colorizeCell(cell) + ' ';
      }

      console.log(rowStr);
    }
    console.log('═'.repeat(80) + '\n');
  }

  /**
   * Colorize individual board cells based on their content
   */
  static colorizeCell(cell) {
    switch (cell) {
      case '~':
        return Colors.water('~'); // Water - cyan
      case 'S':
        return Colors.ship('S'); // Ship - bright blue & bold
      case 'X':
        return Colors.hit('X'); // Hit - bright red & bold
      case 'O':
        return Colors.miss('O'); // Miss - dim white
      default:
        return cell;
    }
  }

  /**
   * Print spectacular welcome message
   */
  static printWelcome(numShips) {
    console.log('\n' + '🌊'.repeat(40));
    console.log(Colors.rainbow('    ⚓ SEA BATTLE ⚓'));
    console.log('🌊'.repeat(40));
    console.log(Colors.title(`\n🎯 Mission: Sink the ${numShips} enemy ships! 🎯`));
    console.log(Colors.info('💡 Enter coordinates like: 00, 34, 98'));
    console.log(Colors.dim('━'.repeat(50)));
  }

  /**
   * Print dramatic game over message
   */
  static printGameOver(winner) {
    console.log('\n' + '🎆'.repeat(30));

    if (winner === 'Player') {
      console.log(Colors.success('🏆 VICTORY! 🏆'));
      console.log(Colors.brightGreen('🎉 CONGRATULATIONS! You sunk all enemy battleships! 🎉'));
      console.log(Colors.success('⚓ You are the Admiral of the Seas! ⚓'));
    } else {
      console.log(Colors.error('💥 DEFEAT! 💥'));
      console.log(Colors.brightRed('💀 GAME OVER! The CPU sunk all your battleships! 💀'));
      console.log(Colors.warning('🌊 The seas have claimed your fleet... 🌊'));
    }

    console.log('🎆'.repeat(30));
  }

  /**
   * Print player turn indicator (subtle, no spam)
   */
  static printPlayerTurn() {
    // Minimal output - the prompt will handle turn indication
  }

  /**
   * Print CPU turn with dramatic flair
   */
  static printCPUTurn() {
    console.log('\n' + Colors.warning('⚡ CPU ATTACKS! ⚡'));
    console.log(Colors.dim('━'.repeat(20)));
  }

  /**
   * Print colorful player attack results
   */
  static printPlayerResult(message) {
    if (!message) {
      console.log(message);
      return;
    }

    if (message.includes('HIT') || message.includes('Hit')) {
      console.log(Colors.success('🎯 DIRECT HIT! 🎯'));
    } else if (message.includes('sunk') || message.includes('Sunk')) {
      console.log(Colors.sunk('🔥 ENEMY SHIP DESTROYED! 🔥'));
      console.log(Colors.brightYellow('💥 The enemy vessel sinks beneath the waves! 💥'));
    } else if (message.includes('Miss') || message.includes('MISS')) {
      console.log(Colors.miss('🌊 Splash! Your shot missed! 🌊'));
    } else {
      console.log(Colors.info(message));
    }
  }

  /**
   * Print simple status message
   */
  static printBoardsCreated() {
    console.log(Colors.info('🗺️  Battle stations prepared!'));
  }

  /**
   * Print beautiful ASCII art ship (for fun!)
   */
  static printShipArt() {
    const ship = `
    ${Colors.brightBlue('                    |    |    |')}
    ${Colors.brightBlue('                   )_)  )_)  )_)')}
    ${Colors.brightBlue('                  )___))___))___)\\')}
    ${Colors.brightBlue('                 )____)____)_____)\\\\')}
    ${Colors.brightBlue('               _____|____|____|____\\\\\\__')}
    ${Colors.cyan('      ---------\\                   /---------')}
    ${Colors.cyan('        ^^^^^ ^^^^^^^^^^^^^^^^^^^^^')}
    ${Colors.cyan('          ^^^^      ^^^^     ^^^    ^^')}
    ${Colors.cyan('               ^^^^      ^^^')}
    `;
    console.log(ship);
  }

  /**
   * Print game stats in a nice format
   */
  static printGameStats(playerShips, cpuShips) {
    console.log('\n' + Colors.header('📊 BATTLE STATUS 📊'));
    console.log(Colors.info(`🚢 Your Ships Remaining: ${Colors.brightGreen(playerShips)}`));
    console.log(Colors.info(`🎯 Enemy Ships Remaining: ${Colors.brightRed(cpuShips)}`));
    console.log(Colors.dim('─'.repeat(30)));
  }

  /**
   * Print loading animation (for dramatic effect)
   */
  static async printLoading(text = 'Preparing battle', duration = 1000) {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    const endTime = Date.now() + duration;

    process.stdout.write('\n');

    while (Date.now() < endTime) {
      for (const frame of frames) {
        if (Date.now() >= endTime) break;
        process.stdout.write(`\r${Colors.cyan(frame)} ${text}...`);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    process.stdout.write(`\r${Colors.success('✓')} ${text} complete!\n`);
  }

  /**
   * Clear screen for a fresh game view
   */
  static clearScreen() {
    console.clear();
  }

  /**
   * Print a beautiful separator line
   */
  static printSeparator(char = '═', length = 50, color = 'cyan') {
    console.log(Colors[color](char.repeat(length)));
  }
}

export default GameDisplay;
