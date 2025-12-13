export class Guess {
  #digits = [];
  #redTokens = 0;
  #whiteTokens = 0;

  constructor(
    digits,
    code
  ) {
    this.#digits = digits;
    const {redTokens, whiteTokens} = this.countTokens(code, digits);
    this.#redTokens = redTokens;
    this.#whiteTokens = whiteTokens;
  }
  get redTokens() {
    return this.#redTokens;
  }
  get whiteTokens() {
    return this.#whiteTokens;
  }
  countTokens(code, guess) {
    let redTokens = 0;
    let whiteTokens = 0;
    const codeCopy = [...code];
    const guessCopy = [...guess];

    guessCopy.forEach((num, index) => {
      if (num === codeCopy[index]) {
        redTokens++;
        codeCopy[index] = null;
        guessCopy[index] = null;
      }
    });
    guessCopy.forEach((num) => {
      if (num !== null && codeCopy.includes(num)) {
        whiteTokens++;
        codeCopy[codeCopy.indexOf(num)] = null;
      }
    });
    return { redTokens, whiteTokens };
  }
}