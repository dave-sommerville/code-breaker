'use strict';

import {
  select, 
  selectAll, 
  listen, 
  create, 
  getRandomNumber, 
  addClass, 
  removeClass,
  getDate
} from './utils.js';

/*------------------------------------------------>
  Element Selectors 
<------------------------------------------------*/
/* -- Intro Screen -- */
const nameScrn = select('.name-scrn');
const nameInput = select('.name-input');
const nameButton = select('.name-btn');
const nameError = select('.name-error');
/* -- Screen Sizing -- */

const gameArea = select('.game-area');
const titleImage = select('.title');
/* -- Game Area -- */

const gridContainer = select('.grid-container');
const collectButton = select('.collect-values-button');
const checkboxContainer = select('.checkbox-container');
const timer = select('.timer');
const newGame = select('.new-game');
/* -- Results Modal -- */

const resultsModal = select('.game-results');
const resultMain = select('h2');
const boldText = select('h3');
const codeDisplay = select('.mastercode');
/* -- Control Box -- */

const buttonBox = select('.rules');
const rulesButton = select('.info');
const rulesButtonTwo = select('.info-main');
const rulesButtonThree = select('.info-intro');
const rulesModal = select('.game-rules');
const scoresList = select('.high-scores-list');
const scoresWrapper = select('.scores-wrapper')
const viewScores = select('.scores-btn');
const viewScoresTwo = select('.scores-btn-intro');
const muteButton = select('.mute');
const muteIcon = select('.mute-icon');
const quitButton = select('.quit');
/* -- Audio -- */

const guessSound = select('.sound-effect');
guessSound.load();
const bgMusic = select('.background-music');
const winnerSound = select('.winner-sound');
const loserSound = select('.loser-sound');

/*------------------------------------------------>
  Initial Declarations
<------------------------------------------------*/

let startTime = new Date();  
let timerInterval; 
let formattedTime = '';
let elapsedTime = 0;

const guessHistory = [];
let guessCount = 0; 
const maxGuesses = 10; 
let playerName = '';

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
    addClass(buttonBox, "hidden");
    addClass(timer, "hidden");
    bgMusic.muted = true;
    resultMain.innerText = 'Congratulations!';
    boldText.innerText = 'You guessed correctly';
    codeDisplay.innerText = 'The code was: ' + masterCode.join(', ');
    clearInterval(timerInterval);  
    updateTimer();
    calculateScore();
    winnerSound.play();
  }
}

/*------------------------------------------------>
  Gameplay mechanics
<------------------------------------------------*/

function launchNewGame() {
  playerName = nameInput.value.trim();
  if(playerName.length < 3 || playerName.length > 6) {
    nameError.textContent = 'Name must be 3 to 6 letters.';
  } else {
    nameError.textContent = '';
    addClass(gameArea, "expanded");
    addClass(nameScrn, "retracted");
    addClass(titleImage, "in-play");
    startGamePlay();
    bgMusic.muted = false;
    bgMusic.currentTime = 0;  
    bgMusic.play();
    removeClass(buttonBox, "hidden");
    removeClass(timer, "hidden");
    nameInput.value = '';
  }
}

function resetGame() {
  playerName = '';
  removeClass(gameArea, "expanded");
  removeClass(nameScrn, "retracted");
  removeClass(titleImage, "in-play");
  gridContainer.innerHTML = ""; 
  checkboxContainer.innerHTML = ""; 
  guessHistory.length = 0; 
  guessCount = 0; 
}

function startGamePlay() {  
  masterCode = generateMasterCode();
  startTimer();  
  console.log(masterCode);
  selectAll('.number-display').forEach(display => {
    display.textContent = '1';
  });
}

function displayGameOverModal() {
    resultsModal.showModal();
    addClass(buttonBox, "hidden");
    addClass(timer, "hidden");
    bgMusic.muted = true;
    resultMain.innerText = 'Game Over!';
    boldText.innerText = 'You\'ve used all your guesses.';
    codeDisplay.innerText = 'The code was: ' + masterCode.join(', ');
}



/*-------------------------------------------------------------------------->
  TIMER
<--------------------------------------------------------------------------*/

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
    name: playerName,
    date: date,
    time: time,
    guesses: guessCount,
  };

  let existingScores = loadScoresFromLocalStorage();

  existingScores.push(newScore);
  existingScores.sort((a, b) => a.guesses - b.guesses);

  if (existingScores.length > 10) {
    existingScores = existingScores.slice(0, 10);
  }

  saveScoresToLocalStorage(existingScores);
}

function populateScoreList(scores) {
  scoresList.innerHTML = ''; 
  scores.forEach((score, index) => {
    const li = createScoreListItem(score);
    li.style.animationDelay = `${index * 0.2}s`; 
    li.classList.add('li-animation'); 
    scoresList.appendChild(li);
  });
}

function createScoreListItem(score) {
  const li = create('li');

  const details = `
      <span>${score.name}</span> |
      <span>${score.date}</span> | 
      <span>${score.guesses}</span> |
      <span>${score.time}</span> 
      sec
  `;
  li.innerHTML = details;
  return li; 
}

/*-------------------------------------------------------------------------->
  Event Listeners
<--------------------------------------------------------------------------*/
/*  -- Gameplay --  */

resultMain.innerText = 'CODE BREAKER';
boldText.innerText = 'Can you guess my code?';

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
    timer.innerText = '0000'; 
    displayGameOverModal();
  }
});
listen('click', newGame, ()=> {
  resultsModal.close();
  resetGame();
});

listen('click', nameButton, ()=>{
  launchNewGame();
});

/*  -- Modals --  */

listen('click', rulesButton, () => {
  rulesModal.showModal();
});
listen('click', rulesButtonTwo, () => {
  rulesModal.showModal();
});
listen('click', rulesButtonThree, () => {
  rulesModal.showModal();
});

listen('click', rulesModal, function(ev) {
  const rect = this.getBoundingClientRect();
  if (ev.clientY < rect.top || ev.clientY > rect.bottom || 
    ev.clientX < rect.left || ev.clientX > rect.right) {
      rulesModal.close();
  }
});

listen('click', viewScores, () => {
  scoresWrapper.showModal();
    const topScores = loadScoresFromLocalStorage();
  populateScoreList(topScores);
});

listen('click', viewScoresTwo, () => {
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

/*  -- Other --  */

listen('click', quitButton, () => {
  displayGameOverModal();
});

listen('click', muteButton, () => {
  bgMusic.muted = !bgMusic.muted; 
  muteIcon.classList.toggle("fa-volume-off");
  muteIcon.classList.toggle("fa-volume-xmark");
});
