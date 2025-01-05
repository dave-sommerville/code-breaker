'use strict';

import {
  select, 
  selectAll, 
  listen, 
  create, 
  getRandomNumber, 
  addClass, 
  getDate
} from './utils.js';

/*------------------------------------------------>
  Element Selectors 
<------------------------------------------------*/
const rulesButton = select('.info');
const rulesModal = select('.game-rules');
const resultsModal = select('.game-results');
const scoresList = select('.high-scores-list');
const scoresWrapper = select('.scores-wrapper')
const viewScores = select('.scores-btn');
const resultMain = select('h2');
const boldText = select('h3');
const codeDisplay = select('.mastercode');
const newGame = select('.new-game');
const gridContainer = select('.grid-container');
const collectButton = select('.collect-values-button');
const muteButton = select('.mute');
const guessSound = select('.sound-effect');
const bgMusic = select('.background-music');
const winnerSound = select('.winner-sound');
const loserSound = select('.loser-sound');
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
    clearInterval(timerInterval);  
    updateTimer();
    calculateScore();
    winnerSound.play();
  }
}

function resetGame() {
  masterCode = generateMasterCode();

  gridContainer.innerHTML = ""; 
  const checkboxContainer = select('.checkbox-container');
  checkboxContainer.innerHTML = ""; 
  guessHistory.length = 0; 
  guessCount = 0; 
  startTimer();  

  // Reset all number displays to 1
  selectAll('.number-display').forEach(display => {
    display.textContent = '1';
  });
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
  guessSound.play();
  if (guessCount >= maxGuesses) {
    loserSound.play();
    resultsModal.showModal();
    resultMain.innerText = 'Game Over!';
    boldText.innerText = 'You\'ve used all your guesses.';
    codeDisplay.innerText = 'The code was: ' + masterCode.join(', ');
    return;
  }

  const playerGuess = [];

  selectAll('.number-selector').forEach(selector => {
    const display = selector.querySelector('.number-display');
    playerGuess.push(parseInt(display.textContent));
  });

  const { redTokens, whiteTokens } = countTokens(masterCode, playerGuess);

  updateCheckboxColors(redTokens, whiteTokens);

  guessHistory.push([...playerGuess]);
  populateWithSpans(guessHistory.flat());
  guessCount++;

  checkWinCondition(redTokens, masterCode.length);

  if (guessCount >= maxGuesses) {
    loserSound.play();
    resultsModal.showModal();
    resultMain.innerText = 'Game Over!';
    boldText.innerText = 'You\'ve used all your guesses.';
    codeDisplay.innerText = 'The code was: ' + masterCode.join(', ');
  }
});

listen('click', muteButton, () => {
  bgMusic.muted = !bgMusic.muted; 
});

/*-------------------------------------------------------------------------->
  TIMER
<--------------------------------------------------------------------------*/
const timer = select('.timer');
let startTime = new Date();  
let timerInterval; 
let formattedTime = '';
let elapsedTime = 0;

function decimelTracker() {
  if (elapsedTime < 10) {
    formattedTime = `000${elapsedTime}`
  } else if (elapsedTime >= 10 && elapsedTime < 100) {
    formattedTime = `00${elapsedTime}`
  } else if (elapsedTime >= 100 && elapsedTime < 1000) {
    formattedTime = `0${elapsedTime}`
  } else {
    formattedTime = `${elapsedTime}`
  }
  return formattedTime;
}

function updateTimer() {
  elapsedTime = 0 + Math.floor((new Date() - startTime) / 1000);
  decimelTracker();

  if (elapsedTime <= 0) {
    timer.innerText = '0000';
  } else {
    timer.innerText = formattedTime;
  }
  return formattedTime;
}

function startTimer() {
  startTime = new Date();  
  timer.innerText = '0000'; 

  timerInterval = setInterval(() => {

    const elapsedTime = 0 + Math.floor((new Date() - startTime) / 1000);

    if (guessCount >= 8) {
      clearInterval(timerInterval);  
      updateTimer();
    } else {
      updateTimer();  
    }
  }, 1000);  
}

/*-------------------------------------------------------------------------->
  SCORE MANAGEMENT 
<--------------------------------------------------------------------------*/

function saveScoresToLocalStorage(scores) {
  const topScores = scores.slice(0, 10);
  const scoresJSON = JSON.stringify(topScores);
  localStorage.setItem('codeBreakerScores', scoresJSON); // Updated key
}

function loadScoresFromLocalStorage() {
  const scoresJSON = localStorage.getItem('codeBreakerScores'); // Updated key
  if (scoresJSON) {
    return JSON.parse(scoresJSON);
  }
  return [];
}

function calculateScore() {
  const date = getDate();
  const time = updateTimer();
  const newScore = {
    date: date,
    time: time,
    guesses: guessCount,
  };

  let existingScores = loadScoresFromLocalStorage();

  // Add the new score and sort by guesses in ascending order
  existingScores.push(newScore);
  existingScores.sort((a, b) => a.guesses - b.guesses);

  // Limit to top 10 scores
  if (existingScores.length > 10) {
    existingScores = existingScores.slice(0, 10);
  }

  saveScoresToLocalStorage(existingScores);
  console.log(existingScores); // Debugging
}

function populateScoreList(scores) {
  scoresList.innerHTML = ''; 
  scores.forEach((score, index) => {
    const li = createScoreListItem(score);
    // Andre, was this the idea behind the new way you mentioned?
    li.style.animationDelay = `${index * 0.2}s`; 
    li.classList.add('li-animation'); 
    scoresList.appendChild(li);
  });
}

function createScoreListItem(score) {
  const li = create('li');
  addClass(li, 'score-item'); 

  const details = `
      <span>${score.date}</span> | 
      Solved in
      <span>${score.guesses}</span>
      guesses, after 
      <span>${score.time}</span> 
      seconds
  `;

  li.innerHTML = details;

  return li; 
}


/*-------------------------------------------------------------------------->
  INITIALIZATION AND EVENT HANDLERS
<--------------------------------------------------------------------------*/

resultsModal.showModal();
resultMain.innerText = 'CODE BREAKER';
boldText.innerText = 'Can you guess my code?';

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
  bgMusic.currentTime = 0;  
  bgMusic.play();
  resetGame();
  console.log(masterCode);
});

listen('click', viewScores, () => {
  scoresWrapper.showModal();
    const topScores = loadScoresFromLocalStorage();
  populateScoreList(topScores);
});

listen('click', scoresWrapper, function(ev) {
  const rect = this.getBoundingClientRect();
  if (ev.clientY < rect.top || ev.clientY > rect.bottom || 
    ev.clientX < rect.left || ev.clientX > rect.right) {
      scoresWrapper.close();
  }
});

