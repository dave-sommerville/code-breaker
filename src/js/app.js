'use strict';
import {
  select, 
  selectAll, 
  listen, 
  create, 
  getRandomNumber, 
  addClass, 
  removeClass,
  getDate,
  isAlphaNum
} from './utils.js';
import { containsProfanity } from './profanity-filter.js';
import { Game } from './game.js';
import { Guess } from './guess.js';
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
const modeButton = select('.mode');
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
const rulesButton = select('.info');
const rulesModal = select('.game-rules');
const scoresList = select('.high-scores-list');
const scoresWrapper = select('.scores-wrapper')
const viewScores = select('.scores-btn');
const muteButton = select('.mute');
const muteIcon = select('.mute-icon');
const quitButton = select('.quit');
/* -- Audio -- */
const guessSound = select('.sound-effect');
guessSound.load();
const bgMusic = select('.background-music');
const winnerSound = select('.winner-sound');
const loserSound = select('.loser-sound');
/* -- Top Guess Display -- */
const topGuessDisplay = select('.top-guess-display');
const topGuessOne = select('.top-0');
const topGuessTwo = select('.top-1');
const topGuessThree = select('.top-2');
const topGuessFour = select('.top-3');
const topCheckOne = select('.box-0');
const topCheckTwo = select('.box-1');
const topCheckThree = select('.box-2');
const topCheckFour = select('.box-3');

/*------------------------------------------------>


Initial Declarations


<------------------------------------------------*/
const randomCharacters = [
  "!",
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "~",
  "?",
  "A",
  "B",
  "C",
  "0",
  "1",
  "2",
];
let timerInterval = null; 
let elapsedTime = 0;
let playerName = '';
let isEasyMode = true;
let selectorMax = 4;
let currentGame;
const SCORE_KEYS = {
  easy: 'easyModeScores',
  hard: 'hardModeScores'
};
function getScoreKey(game) {
  return game.isEasyMode ? SCORE_KEYS.easy : SCORE_KEYS.hard;
}
/*------------------------------------------------>


  Game Initialization


<------------------------------------------------*/
function launchNewGame() {
  playerName = nameInput.value.trim();
  if(playerName.length <= 0) {
    nameError.textContent = 'Please enter a name';
  } else if(playerName.length > 6) {
    nameError.textContent = '6 letters max';
  } else if (!isAlphaNum(playerName)) {
    nameError.textContent = 'No special characters';
  } else if(containsProfanity(playerName)) {
    nameError.textContent = 'No Profanity please';
    nameInput.value = '';
  } else {
    nameError.textContent = '';
    addClass(gameArea, "expanded");
    addClass(nameScrn, "retracted");
    addClass(titleImage, "in-play");
    addClass(rulesButton, "hidden");
    addClass(viewScores, "hidden");
    removeClass(muteButton, "hidden");
    removeClass(quitButton, "hidden");
    startGamePlay(playerName);
    // bgMusic.muted = false;
    //   if (muteIcon.classList.contains("fa-volume-off")) {
    //     muteIcon.classList.toggle("fa-volume-off");
    //     muteIcon.classList.toggle("fa-volume-xmark");
    //   }
    // bgMusic.currentTime = 0;  
    // bgMusic.play();
    removeClass(timer, "hidden");
    nameInput.value = '';
  }
}
function startGamePlay() {  
  currentGame = new Game(playerName, isEasyMode);
  console.log(currentGame.masterCode);
  if (!currentGame.isEasyMode) {
    selectorMax = 6;
  } else {
    selectorMax = 4;
  }
  startTimer();
}
/*------------------------------------------------>

  Game Resolution

<------------------------------------------------*/
function resetGame() {
  playerName = '';
  removeClass(gameArea, "expanded");
  removeClass(nameScrn, "retracted");
  removeClass(titleImage, "in-play");
  gridContainer.innerHTML = ""; 
  checkboxContainer.innerHTML = ""; 
  resetTimer();
}
function displayGameOverModal() {
    resultsModal.showModal();
    bgMusic.muted = true;
    resultMain.innerText = 'Game Over!';
    boldText.innerText = 'You\'ve used all your guesses.';
    codeDisplay.innerText = 'The code was: ' + masterCode.join(', ');
}
/*------------------------------------------------>

  Guess Collection

<------------------------------------------------*/
function collectValues() {
  const numDisOne = select('.number-display.one');
  const numDisTwo = select('.number-display.two');
  const numDisThree = select('.number-display.three');
  const numDisFour = select('.number-display.four');
  
  let num0 = parseInt(numDisOne.textContent, 10);
  let num1 = parseInt(numDisTwo.textContent, 10);
  let num2 = parseInt(numDisThree.textContent, 10);
  let num3 = parseInt(numDisFour.textContent, 10);
  const numArr = [num0, num1, num2, num3];
  return numArr;
}
function collectGuess(){
  nameError.textContent = '';
  addClass(topGuessDisplay, "hidden");
  const guess = collectValues();
  if (currentGame.containsDuplicateGuess(guess)) {
    nameError.textContent = 'You already guessed that, try again';
    return; 
  }
  pauseTimer(1000);
  guessSound.play();
  currentGame.submitGuess(guess);
  const latestGuess = currentGame.guesses[currentGame.guesses.length - 1];
  updateLatestGuessDisplay(latestGuess);
  createGuessDisplays(currentGame);
  if(currentGame.isGameOver) {
    if (currentGame.isGameWon) {
      calculateScore(currentGame);
      alert("You Win!");
      resetGame();
    } else {
      alert("You Lose!");
      resetGame();
    }
  }
}
/*------------------------------------------------>

  Guess Displays

<------------------------------------------------*/
function updateLatestGuessDisplay(guess) {
  removeClass(topGuessDisplay, "hidden");
  const topDisplays = [topGuessOne, topGuessTwo, topGuessThree, topGuessFour];
  guess.digits.forEach((digit, i) => {
    topDisplays[i].textContent = digit;
  });
  const topChecks = [topCheckOne, topCheckTwo, topCheckThree, topCheckFour];
  topChecks.forEach(check => check.classList.remove('red', 'white'));
  let checkIndex = 0;
  for (let i = 0; i < guess.redTokens; i++) {
    topChecks[checkIndex++].classList.add('red');
  }
  for (let i = 0; i < guess.whiteTokens; i++) {
    topChecks[checkIndex++].classList.add('white');
  }
}
function createGuessDisplays(game) {
  gridContainer.innerHTML = '';
  checkboxContainer.innerHTML = '';
  // From 2 to intentionally skip the latest guess 
  if (game.guesses.length >= 2) {
    for (let i = game.guesses.length - 2; i >= 0; i--) {
      createGuessElement(game.guesses[i]);
    }
  }
}
function createGuessElement(guess) {
  let valuesArray = guess.digits;
  let redTokens = guess.redTokens;
  let whiteTokens = guess.whiteTokens;
  valuesArray.forEach((value) => {
    const span = create("span");
    span.textContent = value;
    span.classList.add("box");
    gridContainer.appendChild(span);
  });
  const checkboxGroup = create('div');
  checkboxGroup.classList.add('checkbox-group');
  for (let i = 0; i < 4; i++) {
    const checkbox = create('div');
    checkbox.classList.add('checkboxes');
    checkboxGroup.appendChild(checkbox);
  }
  checkboxContainer.appendChild(checkboxGroup);
  const currentCheckboxes = selectAll('.checkboxes', checkboxGroup);
  let index = 0;
  for (; index < redTokens; index++) {
    currentCheckboxes[index].classList.add('red');
  }
  for (let i = 0; i < whiteTokens; i++, index++) {
    currentCheckboxes[index].classList.add('white');
  }
}
/*------------------------------------------------>

  Timer

<------------------------------------------------*/
function updateTimerDisplay() {
  // .padStart(4, '0') is the modern way to do your decimelTracker logic
  const formattedTime = String(elapsedTime).padStart(4, '0');
  timer.innerText = formattedTime;
  return formattedTime;
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    elapsedTime++;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  stopTimer();
  elapsedTime = 0;
  updateTimerDisplay();
  addClass(timer, "hidden");
}

function pauseTimer(ms) {
  stopTimer(); 
  setTimeout(() => {
    // Only resume if the game isn't over
    if (!currentGame.isGameOver) {
      startTimer();
    }
  }, ms);
}
/*-------------------------------------------------------------------------->
  
  Score Management

<--------------------------------------------------------------------------*/
function calculateScoreObj(game){
  const date = getDate();
  const newScore = {
    name: game.name,
    date: date,
    time: elapsedTime,
    guesses: game.guessCount
  };
  return newScore;
}
function calculateScore(game) {
  let newScore = calculateScoreObj(game);
  let scoresList = loadScoresFromLocalStorage(getScoreKey(currentGame));
  scoresList.push(newScore);
  scoresList.sort((a, b) => a.guesses - b.guesses);
  if (scoresList.length > 10) {
    scoresList = scoresList.slice(0, 10);
  }
  saveScoresToLocalStorage(scoresList, getScoreKey(currentGame));
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
//  Local Storage Management
function saveScoresToLocalStorage(scores, listName) {
  const topScores = scores.slice(0, 10);
  const scoresJSON = JSON.stringify(topScores);
  localStorage.setItem(listName, scoresJSON);
}
function loadScoresFromLocalStorage(listName) {
  const scoresJSON = localStorage.getItem(listName); 
  if (scoresJSON) {
    return JSON.parse(scoresJSON);
  }
  return [];
}
/*-------------------------------------------------------------------------->


  Event Listeners


<--------------------------------------------------------------------------*/
listen('click', modeButton, () => {
  if (!currentGame) {
    modeButton.classList.toggle('hard-mode');
    isEasyMode = !isEasyMode;
  }
});
function setupNumberSpinner(upArrow, downArrow, display) {
  if (isEasyMode) {
    selectorMax = 4;
  } else {
    selectorMax = 6;
  }
  listen('click', upArrow, () => {
    let current = parseInt(display.textContent);
    display.textContent = current === selectorMax ? 1 : current + 1;
  });
  listen('click', downArrow, () => {
    let current = parseInt(display.textContent);
    display.textContent = current === 1 ? selectorMax : current - 1;
  });
}

setupNumberSpinner(
  select('.arrow.up.one'),
  select('.arrow.down.one'),
  select('.number-display.one')
);
setupNumberSpinner(
  select('.arrow.up.two'),
  select('.arrow.down.two'),
  select('.number-display.two')
);
setupNumberSpinner(
  select('.arrow.up.three'),
  select('.arrow.down.three'),
  select('.number-display.three')
);
setupNumberSpinner(
  select('.arrow.up.four'),
  select('.arrow.down.four'),
  select('.number-display.four')
);

listen('click', collectButton, () => {
  collectGuess();
});
listen('click', newGame, ()=> {
  resultsModal.close();
  resetGame();
});
listen('click', nameButton, ()=>{
  launchNewGame();
});
listen('keydown', nameInput, (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    launchNewGame();
  }
});

/*  -- Modals --  */
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

listen('click', viewScores, () => {
  scoresWrapper.showModal();
    const topScores = loadScoresFromLocalStorage(getScoreKey(currentGame));
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
