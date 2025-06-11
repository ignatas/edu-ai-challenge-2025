import Player from './Player.js';
import Colors from './Colors.js';

class CPUPlayer extends Player {
  constructor(name = 'CPU', boardSize = 10) {
    super(name, boardSize);
    this.mode = 'hunt';
    this.targetQueue = [];
  }

  setupShips(numShips, shipLength) {
    const success = this.board.placeShipsRandomly(numShips, shipLength, false);
    if (success) {
      console.log(Colors.warning(`🤖 ${numShips} enemy ships deployed and hidden! 🤖`));
    } else {
      console.log(Colors.error(`❌ Enemy failed to deploy ships`));
    }
    return success;
  }

  makeGuess() {
    let guessLocation;
    let attempts = 0;
    const maxAttempts = 1000;

    do {
      if (this.mode === 'target' && this.targetQueue.length > 0) {
        guessLocation = this.targetQueue.shift();
        console.log(Colors.warning(`🎯 CPU targeting ${guessLocation}...`));

        if (this.guesses.includes(guessLocation)) {
          if (this.targetQueue.length === 0) {
            this.mode = 'hunt';
          }
          continue;
        }
      } else {
        this.mode = 'hunt';
        guessLocation = this.generateRandomGuess();
        console.log(Colors.info(`🌊 CPU scanning sector ${guessLocation}...`));
      }

      attempts++;
    } while (this.guesses.includes(guessLocation) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      // Fallback: find first unguessed location
      for (let row = 0; row < this.board.size; row++) {
        for (let col = 0; col < this.board.size; col++) {
          const location = this.board.formatLocation(row, col);
          if (!this.guesses.includes(location)) {
            guessLocation = location;
            break;
          }
        }
        if (guessLocation && !this.guesses.includes(guessLocation)) break;
      }
    }

    this.guesses.push(guessLocation);
    return guessLocation;
  }

  generateRandomGuess() {
    const row = Math.floor(Math.random() * this.board.size);
    const col = Math.floor(Math.random() * this.board.size);
    return this.board.formatLocation(row, col);
  }

  processAttackResult(location, result) {
    this.updateOpponentBoard(location, result);

    if (result.hit) {
      console.log(Colors.error(`💥 CPU SCORED A HIT at ${location}! 💥`));

      if (result.sunk) {
        console.log(Colors.sunk('🔥 CPU DESTROYED YOUR BATTLESHIP! 🔥'));
        console.log(Colors.brightRed("⚰️  Another ship joins Davy Jones' locker! ⚰️"));
        this.mode = 'hunt';
        this.targetQueue = [];
      } else {
        console.log(Colors.warning('🩸 Your ship is damaged! CPU is closing in! 🩸'));
        this.mode = 'target';
        this.addAdjacentTargets(location);
      }
    } else {
      console.log(Colors.miss(`🌊 CPU missed at ${location} - Splash! 🌊`));

      if (this.mode === 'target' && this.targetQueue.length === 0) {
        this.mode = 'hunt';
      }
    }
  }

  addAdjacentTargets(location) {
    const { row, col } = this.board.parseLocation(location);
    const adjacentPositions = [
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ];

    adjacentPositions.forEach(({ row: adjRow, col: adjCol }) => {
      if (this.board.isValidCoordinate(adjRow, adjCol)) {
        const adjLocation = this.board.formatLocation(adjRow, adjCol);

        if (!this.guesses.includes(adjLocation) && !this.targetQueue.includes(adjLocation)) {
          this.targetQueue.push(adjLocation);
        }
      }
    });
  }
}

export default CPUPlayer;
