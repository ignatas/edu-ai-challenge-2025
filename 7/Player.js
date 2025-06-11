import Board from './Board.js';
import Colors from './Colors.js';

class Player {
  constructor(name = 'Player', boardSize = 10) {
    this.name = name;
    this.board = new Board(boardSize);
    this.opponentBoard = new Board(boardSize);
    this.guesses = [];
  }

  setupShips(numShips, shipLength) {
    const success = this.board.placeShipsRandomly(numShips, shipLength, true);
    if (success) {
      console.log(Colors.success(`⚓ ${numShips} ships deployed for ${Colors.bold(this.name)} ⚓`));
    } else {
      console.log(Colors.error(`❌ Failed to deploy ships for ${this.name}`));
    }
    return success;
  }

  makeGuess(location) {
    // Validate input format
    if (!location || location.length !== 2) {
      return {
        valid: false,
        message: 'Oops, input must be exactly two digits (e.g., 00, 34, 98).',
      };
    }

    const row = parseInt(location[0]);
    const col = parseInt(location[1]);

    // Validate coordinates
    if (isNaN(row) || isNaN(col) || !this.opponentBoard.isValidCoordinate(row, col)) {
      return {
        valid: false,
        message: `Oops, please enter valid row and column numbers between 0 and ${this.board.size - 1}.`,
      };
    }

    // Check if already guessed
    if (this.guesses.includes(location)) {
      return {
        valid: false,
        message: 'You already guessed that location!',
      };
    }

    this.guesses.push(location);
    return { valid: true };
  }

  receiveAttack(location) {
    return this.board.processAttack(location);
  }

  updateOpponentBoard(location, result) {
    const { row, col } = this.opponentBoard.parseLocation(location);
    this.opponentBoard.grid[row][col] = result.hit ? 'X' : 'O';
  }

  hasLost() {
    return this.board.getAllSunk();
  }

  getRemainingShips() {
    return this.board.getRemainingShips();
  }
}

export default Player;
