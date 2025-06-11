/**
 * Colors utility for beautiful console output
 * Uses ANSI escape codes for cross-platform compatibility
 */
class Colors {
  // Text colors
  static red(text) {
    return `\x1b[31m${text}\x1b[0m`;
  }
  static green(text) {
    return `\x1b[32m${text}\x1b[0m`;
  }
  static yellow(text) {
    return `\x1b[33m${text}\x1b[0m`;
  }
  static blue(text) {
    return `\x1b[34m${text}\x1b[0m`;
  }
  static magenta(text) {
    return `\x1b[35m${text}\x1b[0m`;
  }
  static cyan(text) {
    return `\x1b[36m${text}\x1b[0m`;
  }
  static white(text) {
    return `\x1b[37m${text}\x1b[0m`;
  }

  // Bright colors
  static brightRed(text) {
    return `\x1b[91m${text}\x1b[0m`;
  }
  static brightGreen(text) {
    return `\x1b[92m${text}\x1b[0m`;
  }
  static brightYellow(text) {
    return `\x1b[93m${text}\x1b[0m`;
  }
  static brightBlue(text) {
    return `\x1b[94m${text}\x1b[0m`;
  }
  static brightMagenta(text) {
    return `\x1b[95m${text}\x1b[0m`;
  }
  static brightCyan(text) {
    return `\x1b[96m${text}\x1b[0m`;
  }

  // Text styles
  static bold(text) {
    return `\x1b[1m${text}\x1b[0m`;
  }
  static dim(text) {
    return `\x1b[2m${text}\x1b[0m`;
  }
  static underline(text) {
    return `\x1b[4m${text}\x1b[0m`;
  }
  static blink(text) {
    return `\x1b[5m${text}\x1b[0m`;
  }

  // Background colors
  static bgRed(text) {
    return `\x1b[41m${text}\x1b[0m`;
  }
  static bgGreen(text) {
    return `\x1b[42m${text}\x1b[0m`;
  }
  static bgYellow(text) {
    return `\x1b[43m${text}\x1b[0m`;
  }
  static bgBlue(text) {
    return `\x1b[44m${text}\x1b[0m`;
  }

  // Game-specific color combinations
  static ship(text) {
    return this.bold(this.brightBlue(text));
  }
  static water(text) {
    return this.cyan(text);
  }
  static hit(text) {
    return this.bold(this.brightRed(text));
  }
  static miss(text) {
    return this.dim(this.white(text));
  }
  static sunk(text) {
    return this.bold(this.red(text));
  }

  static success(text) {
    return this.bold(this.brightGreen(text));
  }
  static warning(text) {
    return this.bold(this.brightYellow(text));
  }
  static error(text) {
    return this.bold(this.brightRed(text));
  }
  static info(text) {
    return this.brightCyan(text);
  }

  static header(text) {
    return this.bold(this.brightMagenta(text));
  }
  static title(text) {
    return this.bold(this.brightYellow(text));
  }

  // Special effects
  static rainbow(text) {
    const colors = [this.red, this.yellow, this.green, this.cyan, this.blue, this.magenta];
    return text
      .split('')
      .map((char, i) => colors[i % colors.length](char))
      .join('');
  }

  static gradient(text, startColor = 'blue', endColor = 'cyan') {
    // Simple gradient effect - alternates between two colors
    return text
      .split('')
      .map((char, i) => {
        return i % 2 === 0 ? this[startColor](char) : this[endColor](char);
      })
      .join('');
  }
}

export default Colors;
