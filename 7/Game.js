import Player from './Player.js';
import CPUPlayer from './CPUPlayer.js';
import GameDisplay from './GameDisplay.js';
import InputHandler from './InputHandler.js';
import Colors from './Colors.js';

class Game {
  constructor(config = {}) {
    this.boardSize = config.boardSize || 10;
    this.numShips = config.numShips || 3;
    this.shipLength = config.shipLength || 3;

    this.player = new Player('Player', this.boardSize);
    this.cpu = new CPUPlayer('CPU', this.boardSize);
    this.inputHandler = new InputHandler();
    this.gameOver = false;
    this.winner = null;
  }

  async initialize() {
    try {
      // Clear screen for a fresh start
      GameDisplay.clearScreen();

      // Show loading animation
      await GameDisplay.printLoading('Preparing battle stations', 1500);

      // Setup ships for both players
      const playerSetup = this.player.setupShips(this.numShips, this.shipLength);
      const cpuSetup = this.cpu.setupShips(this.numShips, this.shipLength);

      if (!playerSetup || !cpuSetup) {
        throw new Error('Failed to setup ships for all players');
      }

      GameDisplay.printBoardsCreated();
      GameDisplay.printWelcome(this.numShips);

      // Show ship art for dramatic effect
      if (Math.random() < 0.3) {
        // 30% chance
        GameDisplay.printShipArt();
      }
    } catch (error) {
      throw new Error(`Game initialization failed: ${error.message}`);
    }
  }

  async gameLoop() {
    while (!this.gameOver) {
      // Check win conditions
      if (this.cpu.hasLost()) {
        this.gameOver = true;
        this.winner = 'Player';
        break;
      }

      if (this.player.hasLost()) {
        this.gameOver = true;
        this.winner = 'CPU';
        break;
      }

      // Display boards with ship counts
      GameDisplay.printGameStats(this.player.getRemainingShips(), this.cpu.getRemainingShips());
      GameDisplay.printBoard(this.player.opponentBoard, this.player.board);

      // Player turn
      const playerTurnResult = await this.handlePlayerTurn();
      if (!playerTurnResult) {
        continue; // Invalid input, try again
      }

      // Check win condition after player turn
      if (this.cpu.hasLost()) {
        this.gameOver = true;
        this.winner = 'Player';
        break;
      }

      // CPU turn
      await this.handleCPUTurn();

      // Check win condition after CPU turn
      if (this.player.hasLost()) {
        this.gameOver = true;
        this.winner = 'CPU';
        break;
      }
    }

    // Game over
    GameDisplay.printGameOver(this.winner);
    GameDisplay.printBoard(this.player.opponentBoard, this.player.board);
    this.inputHandler.close();
  }

  async handlePlayerTurn() {
    const prompt = Colors.brightCyan('🎯 Captain, enter your targeting coordinates (e.g., 00, 34, 98): ');
    const input = await this.inputHandler.getUserInput(prompt);

    // Validate player input
    const guessResult = this.player.makeGuess(input);
    if (!guessResult.valid) {
      console.log(Colors.error('❌ ' + guessResult.message));
      return false;
    }

    // Process attack on CPU
    const attackResult = this.cpu.receiveAttack(input);
    this.player.updateOpponentBoard(input, attackResult);

    // Display result with dramatic flair
    if (attackResult.hit) {
      if (attackResult.sunk) {
        GameDisplay.printPlayerResult('Ship sunk!');
      } else {
        GameDisplay.printPlayerResult('HIT!');
      }
    } else {
      GameDisplay.printPlayerResult('Miss!');
    }

    return true;
  }

  async handleCPUTurn() {
    GameDisplay.printCPUTurn();

    // CPU makes guess
    const cpuGuess = this.cpu.makeGuess();

    // Process attack on player
    const attackResult = this.player.receiveAttack(cpuGuess);
    this.cpu.processAttackResult(cpuGuess, attackResult);
  }

  async start() {
    try {
      await this.initialize();
      await this.gameLoop();
    } catch (error) {
      console.error('Game error:', error);
      this.inputHandler.close();
    }
  }
}

export default Game;
