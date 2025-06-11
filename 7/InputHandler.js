import readline from 'readline';

class InputHandler {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async getUserInput(prompt) {
    return new Promise((resolve, reject) => {
      try {
        if (typeof prompt !== 'string') {
          throw new Error('Prompt must be a string');
        }

        this.rl.question(prompt, (answer) => {
          try {
            resolve(answer ? answer.trim() : '');
          } catch (error) {
            reject(new Error(`Failed to process input: ${error.message}`));
          }
        });
      } catch (error) {
        reject(new Error(`Failed to get user input: ${error.message}`));
      }
    });
  }

  close() {
    this.rl.close();
  }
}

export default InputHandler;
