export class Game {
  #name = "";
  #maxGuesses = 10;
  #maxDigit = 4;
  #guessCount = 0;
  #guesses = [];
  #score;
  #gameOver = false;
  #masterCode = [];
  #gameIsWon = false;

  constructor(
    name,
    easyMode,
  ){
    this.#name = name;
    this.#masterCode = this.generateMasterCode();
    if (easyMode) {
      this.#maxGuesses = 10;
    } else {
      this.#maxGuesses = 8;
    }
  }
  set guesses(guess) {
    this.#guesses.push(guess);
    this.#guessCount++;
    if(guess.redTokens === 4) {
      this.#gameIsWon = true;
      this.#gameOver = true;
    }
    if (this.#guessCount >= this.#maxGuesses) {
      this.#gameOver = true;
    }
  }
  set score(score) {
    this.#score = score;
  }
  get name() {
    return this.#name;
  }
  get guessCount() {
    return this.#guessCount;
  }
  get guesses() {
    return this.#guesses;
  }
  get score() {
    return this.#score;
  }
  get isGameOver() {
    return this.#gameOver;
  }
  get isGameWon() {
    return this.#gameIsWon
  }
  get masterCode() {
    return this.#masterCode;
  }
  generateMasterCode() {
    return Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * this.#maxDigit) + 1
    );
  }
containsDuplicateGuess(guess) {
    for (let i = 0; i < this.#guesses.length; i++) {
      const current = this.#guesses[i];
      let match = true;

      for (let j = 0; j < guess.length; j++) {
        if (current[j] !== guess[j]) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }
    return false;
  }
}