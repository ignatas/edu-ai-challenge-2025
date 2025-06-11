class Ship {
  constructor(locations, length) {
    try {
      if (!Array.isArray(locations)) {
        throw new Error('Ship locations must be an array');
      }
      if (typeof length !== 'number' || length <= 0) {
        throw new Error('Ship length must be a positive number');
      }
      if (locations.length !== length) {
        throw new Error('Ship locations array length must match ship length');
      }

      this.locations = [...locations];
      this.hits = new Array(length).fill('');
      this.length = length;
    } catch (error) {
      throw new Error(`Failed to create ship: ${error.message}`);
    }
  }

  isHit(location) {
    const index = this.locations.indexOf(location);
    return index >= 0 && this.hits[index] === 'hit';
  }

  hit(location) {
    try {
      if (typeof location !== 'string') {
        throw new Error('Location must be a string');
      }

      const index = this.locations.indexOf(location);
      if (index >= 0 && this.hits[index] !== 'hit') {
        this.hits[index] = 'hit';
        return true;
      }
      return false;
    } catch (error) {
      throw new Error(`Failed to hit ship: ${error.message}`);
    }
  }

  isSunk() {
    return this.hits.every((hit) => hit === 'hit');
  }

  hasLocation(location) {
    return this.locations.includes(location);
  }
}

export default Ship;
