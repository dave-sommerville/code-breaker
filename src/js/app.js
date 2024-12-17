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
Mastermind Game Logic
<------------------------------------------------*/

// Generate a random master code
function generateMasterCode(length = 4, min = 1, max = 6) {
  return Array.from({ length }, () => getRandomNumber(min, max));
}

let masterCode = generateMasterCode();
console.log("Master Code:", masterCode); // Debugging purpose

// Compare player's guess with the master code
function countTokens(code, guess) {
  let redTokens = 0;
  let whiteTokens = 0;
  const codeCopy = [...code];
  const guessCopy = [...guess];

  // Check for red tokens (correct number, correct position)
  guessCopy.forEach((num, index) => {
    if (num === codeCopy[index]) {
      redTokens++;
      codeCopy[index] = null;
      guessCopy[index] = null;
    }
  });

  // Check for white tokens (correct number, wrong position)
  guessCopy.forEach((num) => {
    if (num !== null && codeCopy.includes(num)) {
      whiteTokens++;
      codeCopy[codeCopy.indexOf(num)] = null;
    }
  });

  return { redTokens, whiteTokens };
}

/*------------------------------------------------>
UI Updates and Game Mechanics
<------------------------------------------------*/

const gridContainer = select('.grid-container');
const collectButton = select('.collect-values-button');
const checkboxes = selectAll('.checkboxes');
const guessHistory = [];

// Populate grid with guesses
function populateWithSpans(valuesArray) {
  gridContainer.innerHTML = ""; // Clear previous content
  valuesArray.forEach((value) => {
    const span = create("span");
    span.textContent = value;
    span.classList.add("box");
    gridContainer.appendChild(span);
  });
}

// Update checkbox colors based on red and white tokens
function updateCheckboxColors(redTokens, whiteTokens) {
  let index = 0;

  // Set red tokens
  for (; index < redTokens; index++) {
    checkboxes[index].style.backgroundColor = 'red';
  }

  // Set white tokens
  for (let i = 0; i < whiteTokens; i++, index++) {
    checkboxes[index].style.backgroundColor = 'white';
  }

  // Reset remaining checkboxes
  for (; index < checkboxes.length; index++) {
    checkboxes[index].style.backgroundColor = 'gray';
  }
}

// Check for win condition
function checkWinCondition(redTokens, codeLength) {
  if (redTokens === codeLength) {
    alert("🎉 You guessed the code! Congratulations!");
    resetGame();
  }
}

// Reset the game
function resetGame() {
  masterCode = generateMasterCode();
  console.log("New Master Code:", masterCode); // Debugging purpose
  gridContainer.innerHTML = ""; // Clear guesses
  checkboxes.forEach(box => box.style.backgroundColor = 'gray'); // Reset clues
  guessHistory.length = 0; // Clear guess history
}

/*------------------------------------------------>
Event Listeners and Input Management
<------------------------------------------------*/

// Number selector logic
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

// Collect player guess on button click
listen('click', collectButton, () => {
  const playerGuess = [];

  // Collect values from number selectors
  selectAll('.number-selector').forEach(selector => {
    const display = selector.querySelector('.number-display');
    playerGuess.push(parseInt(display.textContent));
  });

  console.log("Player Guess:", playerGuess); // Debugging purpose

  // Compare player's guess with master code
  const { redTokens, whiteTokens } = countTokens(masterCode, playerGuess);

  // Update clue display
  updateCheckboxColors(redTokens, whiteTokens);

  // Add guess to history and display it in grid
  guessHistory.push([...playerGuess]);
  populateWithSpans(guessHistory.flat());

  // Check for win condition
  checkWinCondition(redTokens, masterCode.length);
});
