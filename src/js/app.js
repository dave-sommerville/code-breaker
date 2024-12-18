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
const guessHistory = [];
let guessCount = 0; // Tracks the number of guesses made
const maxGuesses = 8; // Maximum guesses allowed

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
  const checkboxContainer = select('.checkbox-container');
  const checkboxGroup = create('div');
  checkboxGroup.classList.add('checkbox-group');

  // Create 4 checkboxes for the current guess
  for (let i = 0; i < 4; i++) {
    const checkbox = create('div');
    checkbox.classList.add('checkboxes');
    checkbox.style.backgroundColor = 'gray'; // Default color
    checkboxGroup.appendChild(checkbox);
  }

  // Append the new checkbox group to the container
  checkboxContainer.appendChild(checkboxGroup);

  // Select the latest checkbox group
  const currentCheckboxes = selectAll('.checkboxes', checkboxGroup);

  let index = 0;

  // Set red tokens
  for (; index < redTokens; index++) {
    currentCheckboxes[index].style.backgroundColor = 'red';
  }

  // Set white tokens
  for (let i = 0; i < whiteTokens; i++, index++) {
    currentCheckboxes[index].style.backgroundColor = 'white';
  }

  // Any remaining checkboxes remain gray (default)
}

// Check for win condition
function checkWinCondition(redTokens, codeLength) {
  if (redTokens === codeLength) {
    alert("You guessed the code! Congratulations!");
    resetGame();
  }
}

// Reset the game
function resetGame() {
  masterCode = generateMasterCode();
  console.log("New Master Code:", masterCode); // Debugging purpose

  gridContainer.innerHTML = ""; // Clear guesses
  const checkboxContainer = select('.checkbox-container');
  checkboxContainer.innerHTML = ""; // Clear all checkbox groups
  guessHistory.length = 0; // Clear guess history
  guessCount = 0; // Reset guess count
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
  if (guessCount >= maxGuesses) {
    alert("Game Over! You've reached the maximum number of guesses.");
    return;
  }

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

  // Increment the guess count
  guessCount++;

  // Check for win condition
  checkWinCondition(redTokens, masterCode.length);

  // If the maximum number of guesses is reached, show game over message
  if (guessCount >= maxGuesses) {
    alert("Game Over! You've used all your guesses. The code was: " + masterCode.join(", "));
    resetGame();
  }
});
