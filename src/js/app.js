'use strict';

/*------------------------------------------------>
Utility Functions
<------------------------------------------------*/

function select(selector, scope = document) {
  return scope.querySelector(selector);
}

function selectAll(selector, scope = document) {
  return scope.querySelectorAll(selector);
}

function listen(event, element, callback) {
  return element.addEventListener(event, callback);
}

function create(element) {
  return document.createElement(element);
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*------------------------------------------------>
  Element Selectors 
<------------------------------------------------*/
const rulesButton = select('.rules');
const rulesModal = select('.game-rules');
const resultsModal = select('.game-results');
const resultMain = select('h2');
const boldText = select('h3');
const codeDisplay = select('.mastercode');
const newGame = select('.new-game');
const gridContainer = select('.grid-container');
const collectButton = select('.collect-values-button');
const guessHistory = [];
let guessCount = 0; 
const maxGuesses = 8; 

/*------------------------------------------------>
  Secret Master Code
<------------------------------------------------*/

function generateMasterCode(length = 4, min = 1, max = 6) {
  return Array.from({ length }, () => getRandomNumber(min, max));
}

let masterCode = generateMasterCode();

/*------------------------------------------------>
  Token logic 
<------------------------------------------------*/

function countTokens(code, guess) {
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

/*------------------------------------------------>
  Previous Guess Info 
<------------------------------------------------*/
function populateWithSpans(valuesArray) {
  gridContainer.innerHTML = ""; 
  valuesArray.forEach((value) => {
    const span = create("span");
    span.textContent = value;
    span.classList.add("box");
    gridContainer.appendChild(span);
  });
}

function updateCheckboxColors(redTokens, whiteTokens) {
  const checkboxContainer = select('.checkbox-container');
  const checkboxGroup = create('div');
  checkboxGroup.classList.add('checkbox-group');

  for (let i = 0; i < 4; i++) {
    const checkbox = create('div');
    checkbox.classList.add('checkboxes');
    checkbox.style.backgroundColor = '#234'; 
    checkboxGroup.appendChild(checkbox);
  }

  checkboxContainer.appendChild(checkboxGroup);

  const currentCheckboxes = selectAll('.checkboxes', checkboxGroup);

  let index = 0;
  for (; index < redTokens; index++) {
    currentCheckboxes[index].style.backgroundColor = 'red';
  }
  for (let i = 0; i < whiteTokens; i++, index++) {
    currentCheckboxes[index].style.backgroundColor = 'white';
  }
}

function checkWinCondition(redTokens, codeLength) {
  if (redTokens === codeLength) {
    resultsModal.showModal();
    resultMain.innerText = 'Congratulations!';
    boldText.innerText = 'You guessed correctly';
    codeDisplay.innerText = 'The code was: ' + masterCode.join(', ');
  }
}

function resetGame() {
  masterCode = generateMasterCode();

  gridContainer.innerHTML = ""; 
  const checkboxContainer = select('.checkbox-container');
  checkboxContainer.innerHTML = ""; 
  guessHistory.length = 0; 
  guessCount = 0; 
}

/*------------------------------------------------>
Event Listeners and Input Management
<------------------------------------------------*/

function updateDisplay(display, increment) {
  let current = parseInt(display.textContent);
  display.textContent = increment 
    ? (current === 6 ? 1 : current + 1) 
    : (current === 1 ? 6 : current - 1);
}

function initializeNumberSelectors() {
  selectAll('.number-selector').forEach(selector => {
    const display = select('.number-display', selector);
    const upArrow = select('.arrow.up', selector);
    const downArrow = select('.arrow.down', selector);

    listen('click', upArrow, () => updateDisplay(display, true));
    listen('click', downArrow, () => updateDisplay(display, false));
  });
}

function handleCollectButtonClick() {
  if (guessCount >= maxGuesses) {
    showGameOver();
    return;
  }
  const playerGuess = Array.from(selectAll('.number-display')).map(display => parseInt(display.textContent));
  const { redTokens, whiteTokens } = countTokens(masterCode, playerGuess);

  updateCheckboxColors(redTokens, whiteTokens);

  guessHistory.push([...playerGuess]);
  populateWithSpans(guessHistory.flat());
  guessCount++;

  checkWinCondition(redTokens, masterCode.length);

  if (guessCount >= maxGuesses) {
    showGameOver();
  }
}

function showGameOver() {
  resultsModal.showModal();
  resultMain.innerText = 'Game Over!';
  boldText.innerText = 'You\'ve used all your guesses.';
  codeDisplay.innerText = 'The code was: ' + masterCode.join(', ');
}

function initializeGame() {
  initializeNumberSelectors();
  listen('click', collectButton, handleCollectButtonClick);
}

initializeGame();

/*------------------------------------------------>
Rules Modal
<------------------------------------------------*/

listen('click', rulesButton, () => {
  rulesModal.showModal();
});

listen('click', rulesModal, function(ev) {
  const rect = this.getBoundingClientRect();
  if (ev.clientY < rect.top || ev.clientY > rect.bottom || 
    ev.clientX < rect.left || ev.clientX > rect.right) {
      rulesModal.close();
  }
});

listen('click', newGame, ()=> {
  resultsModal.close();
  resetGame();
});