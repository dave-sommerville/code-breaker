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

<------------------------------------------------*/
const rulesButton = select('.rules');
const rulesModal = select('.game-rules');
const resultsModal = select('.game-results');
const resultText = select('h2');
const newGame = select('.new-game');
const gridContainer = select('.grid-container');
const collectButton = select('.collect-values-button');
const guessHistory = [];
let guessCount = 0; 
const maxGuesses = 8; 

// Generate a random master code
function generateMasterCode(length = 4, min = 1, max = 6) {
  return Array.from({ length }, () => getRandomNumber(min, max));
}

let masterCode = generateMasterCode();
console.log("Master Code:", masterCode); // Debugging purpose

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
    checkbox.style.backgroundColor = '#234'; // Default color
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
    resultText.innerText = 'You guessed the code! The code was: ' + masterCode.join(', ');
  }
}

function resetGame() {
  masterCode = generateMasterCode();
  console.log("New Master Code:", masterCode); // Debugging purpose

  gridContainer.innerHTML = ""; 
  const checkboxContainer = select('.checkbox-container');
  checkboxContainer.innerHTML = ""; 
  guessHistory.length = 0; 
  guessCount = 0; 
}

/*------------------------------------------------>
Event Listeners and Input Management
<------------------------------------------------*/

selectAll('.number-selector').forEach(selector => {
  const display = selector.querySelector('.number-display');
  const upArrow = selector.querySelector('.arrow.up');
  const downArrow = selector.querySelector('.arrow.down');

  listen('click', upArrow, () => {
    let current = parseInt(display.textContent);
    display.textContent = current === 6 ? 1 : current + 1;
  });

  listen('click', downArrow, () => {
    let current = parseInt(display.textContent);
    display.textContent = current === 1 ? 6 : current - 1;
  });
});

listen('click', collectButton, () => {
  if (guessCount >= maxGuesses) { //  I think this may be redundant
    resultsModal.showModal();
    resultText.innerText = 'Game Over! You\'ve used all your guesses. The code was: ' + masterCode.join(', ');
    return;
  }

  const playerGuess = [];

  selectAll('.number-selector').forEach(selector => {
    const display = selector.querySelector('.number-display');
    playerGuess.push(parseInt(display.textContent));
  });

  console.log("Player Guess:", playerGuess); // Debugging purpose

  const { redTokens, whiteTokens } = countTokens(masterCode, playerGuess);

  updateCheckboxColors(redTokens, whiteTokens);

  guessHistory.push([...playerGuess]);
  populateWithSpans(guessHistory.flat());
  guessCount++;

  checkWinCondition(redTokens, masterCode.length);

  if (guessCount >= maxGuesses) {
    resultsModal.showModal();
    resultText.innerText = 'Game Over! You\'ve used all your guesses. The code was: ' + masterCode.join(', ');

  }
});

//  



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