import Ship from './Ship.js';

class Board {
  constructor(size = 10) {
    try {
      if (typeof size !== 'number' || size <= 0 || size > 20) {
        throw new Error('Board size must be a number between 1 and 20');
      }

      this.size = size;
      this.grid = this.createGrid();
      this.ships = [];
    } catch (error) {
      throw new Error(`Failed to create board: ${error.message}`);
    }
  }

  createGrid() {
    return Array(this.size)
      .fill(null)
      .map(() => Array(this.size).fill('~'));
  }

  isValidCoordinate(row, col) {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }

  formatLocation(row, col) {
    return `${row}${col}`;
  }

  parseLocation(location) {
    try {
      if (typeof location !== 'string' || location.length !== 2) {
        throw new Error('Location must be a 2-character string');
      }

      const row = parseInt(location[0]);
      const col = parseInt(location[1]);

      if (isNaN(row) || isNaN(col)) {
        throw new Error('Location must contain valid digits');
      }

      return { row, col };
    } catch (error) {
      throw new Error(`Failed to parse location: ${error.message}`);
    }
  }

  canPlaceShip(startRow, startCol, length, orientation) {
    const positions = this.getShipPositions(startRow, startCol, length, orientation);

    return positions.every(({ row, col }) => {
      if (!this.isValidCoordinate(row, col)) {
        return false;
      }

      // Check grid for visible obstacles
      if (this.grid[row][col] !== '~') {
        return false;
      }

      // Check existing ships (even if not visible on grid)
      const location = this.formatLocation(row, col);
      for (const ship of this.ships) {
        if (ship.hasLocation(location)) {
          return false;
        }
      }

      return true;
    });
  }

  getShipPositions(startRow, startCol, length, orientation) {
    const positions = [];
    for (let i = 0; i < length; i++) {
      const row = orientation === 'horizontal' ? startRow : startRow + i;
      const col = orientation === 'horizontal' ? startCol + i : startCol;
      positions.push({ row, col });
    }
    return positions;
  }

  placeShip(startRow, startCol, length, orientation, showOnGrid = false) {
    if (!this.canPlaceShip(startRow, startCol, length, orientation)) {
      return false;
    }

    const positions = this.getShipPositions(startRow, startCol, length, orientation);
    const locations = positions.map(({ row, col }) => this.formatLocation(row, col));

    const ship = new Ship(locations, length);
    this.ships.push(ship);

    if (showOnGrid) {
      positions.forEach(({ row, col }) => {
        this.grid[row][col] = 'S';
      });
    }

    return true;
  }

  placeShipsRandomly(numShips, shipLength, showOnGrid = false) {
    let placedShips = 0;
    const maxAttempts = 1000;
    let attempts = 0;

    while (placedShips < numShips && attempts < maxAttempts) {
      const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      const maxRow = orientation === 'horizontal' ? this.size : this.size - shipLength + 1;
      const maxCol = orientation === 'horizontal' ? this.size - shipLength + 1 : this.size;

      const startRow = Math.floor(Math.random() * maxRow);
      const startCol = Math.floor(Math.random() * maxCol);

      if (this.placeShip(startRow, startCol, shipLength, orientation, showOnGrid)) {
        placedShips++;
      }
      attempts++;
    }

    return placedShips === numShips;
  }

  processAttack(location) {
    try {
      const { row, col } = this.parseLocation(location);

      if (!this.isValidCoordinate(row, col)) {
        return { valid: false, message: 'Invalid coordinates' };
      }

      // Check if already attacked
      if (this.grid[row][col] === 'X' || this.grid[row][col] === 'O') {
        return { valid: false, message: 'Already attacked this location' };
      }

      // Check for hit
      for (const ship of this.ships) {
        if (ship.hasLocation(location)) {
          if (ship.hit(location)) {
            this.grid[row][col] = 'X';
            const sunk = ship.isSunk();
            return {
              valid: true,
              hit: true,
              sunk,
              message: sunk ? 'Ship sunk!' : 'Hit!',
            };
          }
        }
      }

      // Miss
      this.grid[row][col] = 'O';
      return {
        valid: true,
        hit: false,
        sunk: false,
        message: 'Miss!',
      };
    } catch (error) {
      return {
        valid: false,
        message: `Attack failed: ${error.message}`,
      };
    }
  }

  getRemainingShips() {
    return this.ships.filter((ship) => !ship.isSunk()).length;
  }

  getAllSunk() {
    return this.ships.length > 0 && this.ships.every((ship) => ship.isSunk());
  }
}

export default Board;
