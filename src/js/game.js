import {Guess} from '../js/guess.js';

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
  #isEasyMode = true;

  constructor(
    name,
    easyMode,
  ){
    this.#name = name;
    this.#masterCode = this.generateMasterCode();
    this.#guesses = [];
    if (easyMode) {
      this.#maxGuesses = 10;
    } else {
      this.#maxGuesses = 8;
      this.#isEasyMode = false;
    }
  }
  set score(score) {
    this.#score = score;
  }
  set isGameOver(status) {
    this.#gameOver = status;
  }
  set gameIsWon(status){
    this.#gameIsWon = status;
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
  get isEasyMode() {
    return this.#isEasyMode;
  }
  generateMasterCode() {
    return Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * this.#maxDigit) + 1
    );
  }
  submitGuess(playerGuess) {
    const guessResult = new Guess(playerGuess, this.#masterCode);
    console.log(guessResult)
    this.#guesses.push(guessResult);
    this.#guessCount++;
    if(guessResult.redTokens === 4) {
      this.#gameIsWon = true;
      this.#gameOver = true;
    }
    if (this.#guessCount >= this.#maxGuesses) {
      this.#gameOver = true;
    }
  }
  containsDuplicateGuess(guess) {
    for (let i = 0; i < this.#guesses.length; i++) {
      const currentDigits = this.#guesses[i].digits;
      let match = true;

      for (let j = 0; j < guess.length; j++) {
        if (currentDigits[j] !== guess[j]) {
          match = false;
          break;
        }
      }
      if (match)
        return true;
    }
    return false;
  }
}